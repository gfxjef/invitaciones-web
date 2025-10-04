from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.datastructures import FileStorage
import logging

from models.invitation_media import InvitationMedia, MediaType
from models.invitation import Invitation
from models.user import User
from models.order import Order, OrderStatus, OrderItem
from models.invitation_sections_data import InvitationSectionsData
from services.file_upload_service import file_upload_service, FileValidationError, FileProcessingError
from utils.ftp_manager import FTPUploadError
from extensions import db

logger = logging.getLogger(__name__)

invitations_bp = Blueprint('invitations', __name__)


@invitations_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_invitations():
    """
    GET /api/invitations/ - Get all invitations for authenticated user

    Returns complete invitation data including:
    - Basic invitation info (id, title, status, dates)
    - Event details (event_type, event_date from sections)
    - URLs (url_slug, full_url for navigation)
    - Template preview (thumbnail_url from templates table)
    - Statistics (views, visitors, RSVPs)
    - Settings (rsvp_enabled, is_public, password_protected)
    """
    try:
        current_user_id = get_jwt_identity()

        # Get user's invitations with template and plan joins (optimized single query)
        from models.template import Template
        from models.plan import Plan

        # Extract template ID from template_name (e.g., "template_9" → 9)
        from sqlalchemy import func, cast, Integer

        invitations = db.session.query(
            Invitation,
            Template.preview_image_url.label('template_preview'),
            Template.category.label('template_category'),
            Plan.name.label('plan_name')
        ).outerjoin(
            Template,
            cast(func.replace(Invitation.template_name, 'template_', ''), Integer) == Template.id
        ).outerjoin(
            Plan, Invitation.plan_id == Plan.id
        ).filter(
            Invitation.user_id == current_user_id
        ).all()

        # Get all invitation IDs to fetch RSVPs in ONE query (prevent N+1)
        from models.invitation_response import InvitationResponse
        invitation_ids = [inv[0].id for inv in invitations]

        # Count RSVPs per invitation in one query
        rsvp_counts = {}
        if invitation_ids:
            rsvp_results = db.session.query(
                InvitationResponse.invitation_id,
                func.count(InvitationResponse.id).label('rsvp_count')
            ).filter(
                InvitationResponse.invitation_id.in_(invitation_ids)
            ).group_by(
                InvitationResponse.invitation_id
            ).all()

            rsvp_counts = {inv_id: count for inv_id, count in rsvp_results}

        invitations_data = []
        for invitation, template_preview, template_category, plan_name in invitations:
            # Extract event_type and event_date from sections_data if not in main table
            event_type = template_category or 'wedding'
            event_date = invitation.wedding_date

            # Build URLs
            url_slug = invitation.custom_url or invitation.unique_url
            full_url = f'/invitacion/{url_slug}'

            # Calculate stats (views_count doesn't exist, default to 0)
            views_count = 0  # TODO: Add views tracking

            # Get RSVP count from pre-fetched data (no N+1 query)
            rsvp_count = rsvp_counts.get(invitation.id, 0)

            # Build settings object using actual Invitation columns
            settings = {
                'rsvp_enabled': False,  # TODO: Add enable_rsvp column
                'is_public': invitation.is_active if invitation.is_active is not None else True,
                'password_protected': bool(invitation.privacy_password)  # Use privacy_password field
            }

            # Build stats object
            stats = {
                'views': views_count,
                'visitors': views_count,  # TODO: Track unique visitors in invitation_urls
                'rsvps': rsvp_count,
                'shares': 0  # TODO: Add shares tracking
            }

            invitations_data.append({
                'id': invitation.id,
                'title': invitation.title,
                'event_type': event_type,
                'event_date': event_date.isoformat() if event_date else None,
                'status': invitation.status or 'active',
                'url_slug': url_slug,
                'full_url': full_url,
                'thumbnail_url': template_preview,
                'created_at': invitation.created_at.isoformat() if invitation.created_at else None,
                'updated_at': invitation.updated_at.isoformat() if invitation.updated_at else None,
                'template_name': invitation.template_name,
                'plan_id': invitation.plan_id,
                'plan_name': plan_name,
                'stats': stats,
                'settings': settings
            })

        return jsonify({
            'invitations': invitations_data,
            'total': len(invitations_data)
        }), 200

    except Exception as e:
        logger.error(f"Error getting user invitations: {str(e)}")
        logger.exception(e)
        return jsonify({'message': 'Internal server error'}), 500


@invitations_bp.route('/', methods=['POST'])
@jwt_required()
def create_invitation():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # Create new invitation
        from datetime import datetime, timedelta
        default_date = datetime.utcnow() + timedelta(days=365)  # Default to 1 year from now
        
        invitation = Invitation(
            user_id=current_user_id,
            title=data.get('title', 'Nueva Invitación'),
            groom_name=data.get('groom_name', 'Novio'),  # Required field
            bride_name=data.get('bride_name', 'Novia'),  # Required field  
            wedding_date=data.get('wedding_date', default_date),  # Required field
            template_name=data.get('template_name', 'default'),
            plan_id=data.get('plan_id', 1),
            status='draft'
        )
        
        db.session.add(invitation)
        db.session.commit()
        
        return jsonify({
            'message': 'Invitation created successfully',
            'invitation': {
                'id': invitation.id,
                'title': invitation.title,
                'status': invitation.status,
                'created_at': invitation.created_at.isoformat(),
                'template_name': invitation.template_name,
                'plan_id': invitation.plan_id
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating invitation: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500


@invitations_bp.route('/create-from-order', methods=['POST'])
@jwt_required()
def create_invitation_from_order():
    """
    POST /api/invitations/create-from-order

    WHY: Create invitation with all sections after successful payment.
    Saves localStorage customizer data to InvitationSectionsData.

    Body:
    {
        "order_id": int,
        "template_id": int,
        "plan_id": int,
        "event_date": datetime,
        "event_location": str,
        "sections_data": {
            "hero": {...},
            "welcome": {...},
            "gallery": {...}
        }
    }

    Returns:
    {
        "success": true,
        "invitation_id": int,
        "invitation_url": str
    }
    """
    try:
        current_user_id = int(get_jwt_identity())  # Convert to int for type consistency
        data = request.get_json() or {}

        logger.info(f"Creating invitation from order for user {current_user_id}")
        logger.info(f"Request data: order_id={data.get('order_id')}, template_id={data.get('template_id')}")

        # Validate required fields
        required_fields = ['order_id', 'template_id', 'plan_id', 'sections_data']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        # 1. Validate order exists and is paid
        order = Order.query.get(data['order_id'])
        if not order:
            logger.error(f"Order {data['order_id']} not found")
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404

        if order.status != OrderStatus.PAID:
            logger.error(f"Order {data['order_id']} is not paid. Status: {order.status}")
            return jsonify({
                'success': False,
                'error': f'Order is not paid. Current status: {order.status}'
            }), 400

        if order.user_id != current_user_id:
            logger.error(f"Order {data['order_id']} does not belong to user {current_user_id}")
            logger.error(f"   Order.user_id in DB: {order.user_id}")
            logger.error(f"   Order.order_number: {order.order_number}")
            logger.error(f"   Order.status: {order.status}")
            logger.error(f"   Current JWT user_id: {current_user_id}")
            return jsonify({
                'success': False,
                'error': 'Order does not belong to current user'
            }), 403

        # 2. Get user information
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404

        # 3. Create Invitation
        from datetime import datetime

        # Generate title from names in sections_data
        # Try 'general' section first (template 9+), then fallback to 'hero' section (older templates)
        sections_data = data.get('sections_data', {})
        groom_name = sections_data.get('general', {}).get('groom_name') or sections_data.get('hero', {}).get('groom_name', 'Novio')
        bride_name = sections_data.get('general', {}).get('bride_name') or sections_data.get('hero', {}).get('bride_name', 'Novia')
        title = f"Boda de {groom_name} y {bride_name}"

        logger.info(f"📝 Extracted names from sections_data: bride_name='{bride_name}', groom_name='{groom_name}'")

        # Extract wedding date from sections_data if available
        wedding_date = data.get('event_date')
        if not wedding_date:
            # Try to extract from sections_data
            sections_data = data.get('sections_data', {})
            event_date_str = sections_data.get('event', {}).get('date') or sections_data.get('general', {}).get('weddingDate')
            if event_date_str:
                try:
                    wedding_date = datetime.fromisoformat(event_date_str.replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    logger.warning(f"Could not parse wedding date from sections_data: {event_date_str}")
                    wedding_date = None

        invitation = Invitation(
            user_id=current_user_id,
            order_id=data['order_id'],
            title=title,
            groom_name=groom_name,
            bride_name=bride_name,
            wedding_date=wedding_date,
            template_name=f"template_{data['template_id']}",
            plan_id=data['plan_id'],
            status='active'
        )

        db.session.add(invitation)
        db.session.flush()  # Get invitation.id without committing

        logger.info(f"Created invitation {invitation.id} for order {order.id}")

        # 4. Create InvitationSectionsData for each section
        logger.info("=" * 80)
        logger.info("🔍 DEBUGGING SECTIONS_DATA CREATION")
        logger.info("=" * 80)
        logger.info(f"📦 sections_data received: {data.get('sections_data')}")
        logger.info(f"📊 sections_data type: {type(data.get('sections_data'))}")
        logger.info(f"📋 sections_data keys: {list(data.get('sections_data', {}).keys())}")
        logger.info(f"🔢 Number of sections: {len(data.get('sections_data', {}))}")

        sections_created = 0
        for section_type, variables in data['sections_data'].items():
            logger.info(f"\n--- Processing section: {section_type} ---")
            logger.info(f"  Variables type: {type(variables)}")
            logger.info(f"  Variables value: {variables}")
            logger.info(f"  Is dict? {isinstance(variables, dict)}")
            logger.info(f"  Is empty? {not variables}")

            if not variables or not isinstance(variables, dict):
                logger.warning(f"⚠️ Skipping empty or invalid section: {section_type}")
                logger.warning(f"   Reason: variables={variables}, is_dict={isinstance(variables, dict)}")
                continue

            # Determine section variant (use default _1 for now)
            section_variant = f"{section_type}_1"

            # Determine category from template or default to weddings
            category = 'weddings'  # TODO: Get from template metadata

            # Create usage stats
            usage_stats = {
                'created_at': datetime.utcnow().isoformat(),
                'source': 'payment_checkout',
                'plan_type': 'premium' if data['plan_id'] == 2 else 'basic',
                'initial_variables_count': len(variables),
                'category': category,
                'order_id': data['order_id']
            }

            logger.info(f"✅ Creating InvitationSectionsData record:")
            logger.info(f"   invitation_id: {invitation.id}")
            logger.info(f"   section_type: {section_type}")
            logger.info(f"   section_variant: {section_variant}")
            logger.info(f"   category: {category}")
            logger.info(f"   variables_json: {variables}")
            logger.info(f"   Variables count: {len(variables)}")

            section = InvitationSectionsData(
                invitation_id=invitation.id,
                user_id=current_user_id,
                order_id=data['order_id'],
                plan_id=data['plan_id'],
                section_type=section_type,
                section_variant=section_variant,
                category=category,
                variables_json=variables,
                usage_stats=usage_stats
            )

            db.session.add(section)
            sections_created += 1
            logger.info(f"✅ Added section to db.session: {section_type} with {len(variables)} variables")
            logger.info(f"   Section ID (before commit): {section.id}")

        # 5. Commit all changes
        logger.info("💾 Attempting to commit to database...")
        logger.info(f"   Sections to commit: {sections_created}")
        db.session.commit()
        logger.info("✅ Database commit successful!")

        # Verify sections were saved
        saved_sections = InvitationSectionsData.query.filter_by(invitation_id=invitation.id).all()
        logger.info(f"🔍 Verification: Found {len(saved_sections)} sections in database for invitation {invitation.id}")
        for sec in saved_sections:
            logger.info(f"   - {sec.section_type}: {len(sec.variables_json)} variables")

        logger.info(f"✅ Successfully created invitation {invitation.id} with {sections_created} sections")
        logger.info(f"📍 Invitation unique_url: {invitation.unique_url}")

        return jsonify({
            'success': True,
            'invitation_id': invitation.id,
            'invitation_url': f'/invitacion/{invitation.unique_url}',
            'unique_url': invitation.unique_url,
            'sections_created': sections_created,
            'message': f'Invitation created successfully with {sections_created} sections'
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating invitation from order: {str(e)}")
        logger.exception(e)  # Full stack trace
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@invitations_bp.route('/by-url/<string:unique_url>', methods=['GET'])
def get_invitation_by_url(unique_url):
    """
    GET /api/invitations/by-url/{unique_url} - Get invitation by unique URL slug

    WHY: Frontend invitation pages use /invitacion/{unique_url} routes (not numeric IDs).
    This endpoint enables public invitation viewing using the generated slug.

    Returns:
    {
        "success": true,
        "invitation": {...},
        "sections_data": {
            "hero": {"variant": "hero_1", "variables": {...}, "category": "weddings"},
            "gallery": {...}
        },
        "template_id": 9
    }
    """
    try:
        # Find invitation by unique_url
        invitation = Invitation.query.filter_by(unique_url=unique_url).first()

        if not invitation:
            logger.warning(f"Invitation not found for unique_url: {unique_url}")
            return jsonify({
                'success': False,
                'error': 'Invitation not found'
            }), 404

        # Get all sections data for this invitation
        sections = InvitationSectionsData.query.filter_by(
            invitation_id=invitation.id
        ).all()

        # Transform sections to grouped format
        sections_data = {}
        for section in sections:
            variables = section.variables_json

            # 🔄 Apply field mapping for Hero section (date → weddingDate)
            if section.section_type == 'hero':
                # Map date → weddingDate (component expects weddingDate)
                if 'date' in variables and 'weddingDate' not in variables:
                    variables['weddingDate'] = variables['date']
                # Map location → eventLocation if needed
                if 'location' in variables and 'eventLocation' not in variables:
                    variables['eventLocation'] = variables['location']
                # Map image → heroImageUrl if needed
                if 'image' in variables and 'heroImageUrl' not in variables:
                    variables['heroImageUrl'] = variables['image']

            sections_data[section.section_type] = {
                'variant': section.section_variant,
                'variables': variables,
                'category': section.category
            }

        # 🔄 APPLY INHERITANCE: Sections without shared fields inherit from hero/general
        hero_vars = sections_data.get('hero', {}).get('variables', {})
        general_vars = sections_data.get('general', {}).get('variables', {})

        # Helper function to get inherited value
        def get_inherited_value(*sources):
            for source in sources:
                if source:
                    return source
            return None

        # FOOTER: Inherit groom_name, bride_name, weddingDate, eventLocation from hero/general
        if 'footer' in sections_data:
            footer_vars = sections_data['footer']['variables']
            if not footer_vars.get('groom_name'):
                footer_vars['groom_name'] = get_inherited_value(
                    general_vars.get('groom_name'),
                    hero_vars.get('groom_name')
                )
            if not footer_vars.get('bride_name'):
                footer_vars['bride_name'] = get_inherited_value(
                    general_vars.get('bride_name'),
                    hero_vars.get('bride_name')
                )
            if not footer_vars.get('weddingDate'):
                footer_vars['weddingDate'] = get_inherited_value(
                    general_vars.get('weddingDate'),
                    hero_vars.get('weddingDate'),
                    hero_vars.get('date')  # Map date → weddingDate
                )
            if not footer_vars.get('eventLocation'):
                footer_vars['eventLocation'] = get_inherited_value(
                    general_vars.get('eventLocation'),
                    hero_vars.get('eventLocation'),
                    hero_vars.get('location')  # Map location → eventLocation
                )

        # COUNTDOWN: Inherit weddingDate from hero/general
        if 'countdown' in sections_data:
            countdown_vars = sections_data['countdown']['variables']
            if not countdown_vars.get('weddingDate'):
                countdown_vars['weddingDate'] = get_inherited_value(
                    hero_vars.get('weddingDate'),
                    hero_vars.get('date'),  # Map date → weddingDate
                    general_vars.get('weddingDate')
                )

        # PLACE_RELIGIOSO: Inherit weddingDate from hero/general
        if 'place_religioso' in sections_data:
            place_religioso_vars = sections_data['place_religioso']['variables']
            if not place_religioso_vars.get('weddingDate'):
                place_religioso_vars['weddingDate'] = get_inherited_value(
                    hero_vars.get('weddingDate'),
                    hero_vars.get('date'),  # Map date → weddingDate
                    general_vars.get('weddingDate')
                )

        # PLACE_CEREMONIA: Inherit weddingDate from hero/general
        if 'place_ceremonia' in sections_data:
            place_ceremonia_vars = sections_data['place_ceremonia']['variables']
            if not place_ceremonia_vars.get('weddingDate'):
                place_ceremonia_vars['weddingDate'] = get_inherited_value(
                    hero_vars.get('weddingDate'),
                    hero_vars.get('date'),  # Map date → weddingDate
                    general_vars.get('weddingDate')
                )

        # 🆕 CREATE VIRTUAL SECTIONS: If sections don't exist but hero does, create them with inherited data
        # This ensures Footer, Countdown, etc. work even if only Hero section exists in DB
        if hero_vars and not sections_data.get('footer'):
            sections_data['footer'] = {
                'variant': 'footer_1',
                'variables': {
                    'groom_name': hero_vars.get('groom_name'),
                    'bride_name': hero_vars.get('bride_name'),
                    'weddingDate': hero_vars.get('weddingDate') or hero_vars.get('date'),
                    'eventLocation': hero_vars.get('eventLocation') or hero_vars.get('location')
                },
                'category': 'weddings'
            }

        if hero_vars and not sections_data.get('countdown'):
            sections_data['countdown'] = {
                'variant': 'countdown_1',
                'variables': {
                    'weddingDate': hero_vars.get('weddingDate') or hero_vars.get('date')
                },
                'category': 'weddings'
            }

        # 🔄 SYNC invitation table columns with sections_data
        # This ensures invitation.bride_name and invitation.groom_name are up-to-date
        needs_update = False
        if sections_data.get('general'):
            general_vars = sections_data['general']['variables']

            # Update bride_name if different
            if 'bride_name' in general_vars and invitation.bride_name != general_vars['bride_name']:
                logger.info(f"🔄 Syncing bride_name: '{invitation.bride_name}' => '{general_vars['bride_name']}'")
                invitation.bride_name = general_vars['bride_name']
                needs_update = True

            # Update groom_name if different
            if 'groom_name' in general_vars and invitation.groom_name != general_vars['groom_name']:
                logger.info(f"🔄 Syncing groom_name: '{invitation.groom_name}' => '{general_vars['groom_name']}'")
                invitation.groom_name = general_vars['groom_name']
                needs_update = True

        # Also check 'hero' section for backward compatibility
        elif sections_data.get('hero'):
            hero_vars = sections_data['hero']['variables']

            if 'bride_name' in hero_vars and invitation.bride_name != hero_vars['bride_name']:
                logger.info(f"🔄 Syncing bride_name (from hero): '{invitation.bride_name}' => '{hero_vars['bride_name']}'")
                invitation.bride_name = hero_vars['bride_name']
                needs_update = True

            if 'groom_name' in hero_vars and invitation.groom_name != hero_vars['groom_name']:
                logger.info(f"🔄 Syncing groom_name (from hero): '{invitation.groom_name}' => '{hero_vars['groom_name']}'")
                invitation.groom_name = hero_vars['groom_name']
                needs_update = True

        # Commit updates if any
        if needs_update:
            try:
                db.session.commit()
                logger.info(f"✅ Successfully synced invitation {invitation.id} columns with sections_data")
            except Exception as e:
                logger.error(f"❌ Error syncing invitation columns: {str(e)}")
                db.session.rollback()

        # 📊 DETAILED LOGGING for debugging
        logger.info(f"📊 [get_invitation_by_url] Invitation ID: {invitation.id}")
        logger.info(f"📊 [get_invitation_by_url] Sections found: {len(sections)}")
        for section_type, section_info in sections_data.items():
            logger.info(f"📊 [get_invitation_by_url] Section '{section_type}': {len(section_info['variables'])} variables")
            logger.info(f"📊 [get_invitation_by_url] Variables keys: {list(section_info['variables'].keys())}")

        # Extract template_id from template_name (e.g., "template_9" => 9)
        template_id = None
        if invitation.template_name and invitation.template_name.startswith('template_'):
            try:
                template_id = int(invitation.template_name.replace('template_', ''))
            except ValueError:
                logger.warning(f"Could not parse template_id from template_name: {invitation.template_name}")

        logger.info(f"📊 [get_invitation_by_url] Template ID extracted: {template_id}")
        logger.info(f"Successfully loaded invitation {invitation.id} by URL {unique_url}")

        return jsonify({
            'success': True,
            'invitation': invitation.to_dict(),
            'sections_data': sections_data,
            'template_id': template_id
        }), 200

    except Exception as e:
        logger.error(f"Error getting invitation by URL {unique_url}: {str(e)}")
        logger.exception(e)
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@invitations_bp.route('/<int:invitation_id>', methods=['GET'])
def get_invitation(invitation_id):
    # Public endpoint for viewing invitations
    return jsonify({
        'message': f'Invitation {invitation_id}'
    }), 200


@invitations_bp.route('/<int:invitation_id>/urls', methods=['GET'])
@jwt_required()
def get_invitation_urls(invitation_id):
    """
    GET /api/invitations/{id}/urls - Get URLs for specific invitation
    
    WHY: Frontend needs to fetch URLs associated with a specific invitation
    to display them in the invitation detail page
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Authentication required'}), 401
        
        # For now, return mock data - this will be replaced with actual database query
        # once the invitation_urls implementation is integrated
        mock_urls = [
            {
                'id': 1,
                'invitation_id': invitation_id,
                'short_code': 'ABC123XY',
                'original_url': f'http://localhost:3000/invitation/{invitation_id}',
                'title': 'Novios',
                'is_active': True,
                'visit_count': 15,
                'last_visited_at': '2024-08-08T10:30:00Z',
                'created_at': '2024-08-01T09:00:00Z',
                'qr_code_path': f'/qr/{invitation_id}_ABC123XY.png'
            }
        ]
        
        return jsonify({
            'urls': mock_urls,
            'total': len(mock_urls),
            'invitation_id': invitation_id
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500


@invitations_bp.route('/<int:invitation_id>/urls', methods=['POST'])
@jwt_required()
def create_invitation_url(invitation_id):
    """
    POST /api/invitations/{id}/urls - Create new URL for invitation
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Authentication required'}), 401
        
        data = request.get_json() or {}
        title = data.get('title', 'Nueva URL')
        
        # Mock response - replace with actual implementation
        new_url = {
            'id': 2,
            'invitation_id': invitation_id,
            'short_code': 'DEF456ZW',
            'original_url': f'http://localhost:3000/invitation/{invitation_id}',
            'title': title,
            'is_active': True,
            'visit_count': 0,
            'last_visited_at': None,
            'created_at': '2024-08-08T17:00:00Z',
            'qr_code_path': f'/qr/{invitation_id}_DEF456ZW.png'
        }
        
        return jsonify({
            'message': 'URL created successfully',
            'url': new_url
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500


# =============================================
# MEDIA MANAGEMENT ENDPOINTS
# =============================================

@invitations_bp.route('/<int:invitation_id>/media', methods=['GET'])
@jwt_required()
def get_invitation_media(invitation_id):
    """
    GET /api/invitations/{id}/media - Get all media files for an invitation
    
    Query Parameters:
    - media_type: Filter by specific media type (optional)
    - include_urls: Include public URLs in response (default: true)
    
    WHY: Frontend needs to display all media associated with an invitation
    for editing, gallery display, and media management.
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Authentication required'}), 401
        
        # Validate invitation exists and user has access
        invitation = Invitation.query.get(invitation_id)
        if not invitation:
            return jsonify({'message': 'Invitation not found'}), 404
        
        # TODO: Add user access validation
        # if invitation.user_id != current_user_id:
        #     return jsonify({'message': 'Access denied'}), 403
        
        # Get query parameters
        media_type = request.args.get('media_type')
        include_urls = request.args.get('include_urls', 'true').lower() == 'true'
        
        # Build query
        query = InvitationMedia.query.filter_by(invitation_id=invitation_id)
        
        if media_type:
            if media_type not in MediaType.get_all():
                return jsonify({'message': f'Invalid media type: {media_type}'}), 400
            query = query.filter_by(media_type=media_type)
        
        media_files = query.order_by(
            InvitationMedia.media_type, 
            InvitationMedia.display_order
        ).all()
        
        # Serialize response
        base_url = 'https://kossomet.com/invita'
        media_data = [
            media.to_dict(include_urls=include_urls, base_url=base_url) 
            for media in media_files
        ]
        
        return jsonify({
            'media_files': media_data,
            'total': len(media_data),
            'invitation_id': invitation_id,
            'media_types': MediaType.get_all()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting invitation media {invitation_id}: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500


@invitations_bp.route('/<int:invitation_id>/media', methods=['POST'])
@jwt_required()
def upload_invitation_media(invitation_id):
    """
    POST /api/invitations/{id}/media - Upload media file(s) for an invitation
    
    Form Data:
    - files: File(s) to upload (required)
    - media_type: Type of media (hero, gallery, music, etc.) (required)
    - field_name: Custom field name (optional)
    - metadata: JSON metadata (optional)
    
    WHY: Enables users to upload and associate media files with their invitations.
    Handles multiple file uploads and proper file processing/optimization.
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Authentication required'}), 401
        
        # Validate invitation exists and user has access
        invitation = Invitation.query.get(invitation_id)
        if not invitation:
            return jsonify({'message': 'Invitation not found'}), 404
        
        # TODO: Add user access validation
        # if invitation.user_id != current_user_id:
        #     return jsonify({'message': 'Access denied'}), 403
        
        # Get form data
        media_type = request.form.get('media_type')
        field_name = request.form.get('field_name')
        metadata = request.form.get('metadata', '{}')
        
        # Validate media type
        if not media_type or media_type not in MediaType.get_all():
            return jsonify({
                'message': 'Valid media_type is required',
                'allowed_types': MediaType.get_all()
            }), 400
        
        # Parse metadata
        try:
            import json
            metadata_dict = json.loads(metadata) if metadata else {}
        except json.JSONDecodeError:
            return jsonify({'message': 'Invalid metadata JSON'}), 400
        
        # Get uploaded files
        files = request.files.getlist('files')
        if not files or not any(f.filename for f in files):
            return jsonify({'message': 'At least one file is required'}), 400
        
        # Process uploads
        uploaded_media = []
        errors = []
        
        for index, file in enumerate(files):
            if file and file.filename:
                try:
                    media_record = file_upload_service.upload_media_file(
                        file=file,
                        invitation_id=invitation_id,
                        media_type=media_type,
                        field_name=field_name,
                        display_order=index,
                        metadata=metadata_dict
                    )
                    uploaded_media.append(media_record)
                    
                except (FileValidationError, FileProcessingError, FTPUploadError) as e:
                    error_msg = f"File '{file.filename}': {str(e)}"
                    errors.append(error_msg)
                    logger.warning(f"Upload failed for {file.filename}: {str(e)}")
                except Exception as e:
                    error_msg = f"File '{file.filename}': Unexpected error occurred"
                    errors.append(error_msg)
                    logger.error(f"Unexpected upload error for {file.filename}: {str(e)}")
        
        # Prepare response
        if uploaded_media:
            base_url = 'https://kossomet.com/invita'
            media_data = [
                media.to_dict(include_urls=True, base_url=base_url) 
                for media in uploaded_media
            ]
            
            response_data = {
                'message': f'Successfully uploaded {len(uploaded_media)} file(s)',
                'media_files': media_data,
                'total_uploaded': len(uploaded_media),
                'invitation_id': invitation_id
            }
            
            if errors:
                response_data['errors'] = errors
                response_data['total_errors'] = len(errors)
            
            status_code = 201 if not errors else 207  # 207 = Multi-Status
            return jsonify(response_data), status_code
        
        else:
            return jsonify({
                'message': 'No files were uploaded successfully',
                'errors': errors,
                'total_errors': len(errors)
            }), 400
        
    except Exception as e:
        logger.error(f"Error uploading invitation media {invitation_id}: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500


@invitations_bp.route('/<int:invitation_id>/media/<int:media_id>', methods=['GET'])
@jwt_required()
def get_media_file(invitation_id, media_id):
    """
    GET /api/invitations/{id}/media/{media_id} - Get specific media file details
    
    WHY: Frontend needs detailed information about specific media files
    including metadata, processing status, and URLs.
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Authentication required'}), 401
        
        # Get media file
        media_file = InvitationMedia.query.filter_by(
            id=media_id, 
            invitation_id=invitation_id
        ).first()
        
        if not media_file:
            return jsonify({'message': 'Media file not found'}), 404
        
        # TODO: Add user access validation
        # invitation = media_file.invitation
        # if invitation.user_id != current_user_id:
        #     return jsonify({'message': 'Access denied'}), 403
        
        base_url = 'https://kossomet.com/invita'
        media_data = media_file.to_dict(include_urls=True, base_url=base_url)
        
        return jsonify({
            'media_file': media_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting media file {media_id}: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500


@invitations_bp.route('/<int:invitation_id>/media/<int:media_id>', methods=['PUT'])
@jwt_required()
def update_media_file(invitation_id, media_id):
    """
    PUT /api/invitations/{id}/media/{media_id} - Update media file metadata
    
    Request Body:
    - field_name: Update field name
    - display_order: Update display order
    - metadata: Update metadata
    
    WHY: Allows users to update media file properties like display order,
    field associations, and custom metadata without re-uploading files.
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Authentication required'}), 401
        
        # Get media file
        media_file = InvitationMedia.query.filter_by(
            id=media_id, 
            invitation_id=invitation_id
        ).first()
        
        if not media_file:
            return jsonify({'message': 'Media file not found'}), 404
        
        # TODO: Add user access validation
        
        # Get update data
        data = request.get_json() or {}
        
        # Update fields
        if 'field_name' in data:
            media_file.field_name = data['field_name']
        
        if 'display_order' in data:
            display_order = data['display_order']
            if isinstance(display_order, int) and display_order >= 0:
                media_file.display_order = display_order
        
        if 'metadata' in data:
            if media_file.media_metadata:
                media_file.media_metadata.update(data['metadata'])
            else:
                media_file.media_metadata = data['metadata']
        
        # Save changes
        db.session.commit()
        
        base_url = 'https://kossomet.com/invita'
        media_data = media_file.to_dict(include_urls=True, base_url=base_url)
        
        return jsonify({
            'message': 'Media file updated successfully',
            'media_file': media_data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating media file {media_id}: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500


@invitations_bp.route('/<int:invitation_id>/media/<int:media_id>', methods=['DELETE'])
@jwt_required()
def delete_media_file(invitation_id, media_id):
    """
    DELETE /api/invitations/{id}/media/{media_id} - Delete media file
    
    WHY: Enables users to remove unwanted media files from their invitations.
    Handles both database record deletion and FTP file cleanup.
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Authentication required'}), 401
        
        # Get media file
        media_file = InvitationMedia.query.filter_by(
            id=media_id, 
            invitation_id=invitation_id
        ).first()
        
        if not media_file:
            return jsonify({'message': 'Media file not found'}), 404
        
        # TODO: Add user access validation
        
        # Delete using file upload service (handles both DB and FTP cleanup)
        success = file_upload_service.delete_media_file(media_id)
        
        if success:
            return jsonify({
                'message': 'Media file deleted successfully'
            }), 200
        else:
            return jsonify({
                'message': 'Failed to delete media file'
            }), 500
        
    except Exception as e:
        logger.error(f"Error deleting media file {media_id}: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500


@invitations_bp.route('/<int:invitation_id>/media/reorder', methods=['PUT'])
@jwt_required()
def reorder_media_files(invitation_id):
    """
    PUT /api/invitations/{id}/media/reorder - Reorder media files
    
    Request Body:
    - media_type: Type of media to reorder (required)
    - media_ids: Array of media IDs in desired order (required)
    
    WHY: Enables drag-and-drop reordering of media files in galleries
    and other collections where order matters.
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Authentication required'}), 401
        
        # Validate invitation exists
        invitation = Invitation.query.get(invitation_id)
        if not invitation:
            return jsonify({'message': 'Invitation not found'}), 404
        
        # TODO: Add user access validation
        
        # Get request data
        data = request.get_json() or {}
        media_type = data.get('media_type')
        media_ids = data.get('media_ids', [])
        
        # Validate input
        if not media_type or media_type not in MediaType.get_all():
            return jsonify({'message': 'Valid media_type is required'}), 400
        
        if not isinstance(media_ids, list) or not media_ids:
            return jsonify({'message': 'media_ids array is required'}), 400
        
        # Reorder media files
        InvitationMedia.reorder_media(invitation_id, media_type, media_ids)
        
        # Get updated media files
        updated_media = InvitationMedia.get_by_type(invitation_id, media_type)
        base_url = 'https://kossomet.com/invita'
        media_data = [
            media.to_dict(include_urls=True, base_url=base_url) 
            for media in updated_media
        ]
        
        return jsonify({
            'message': 'Media files reordered successfully',
            'media_files': media_data,
            'total': len(media_data)
        }), 200
        
    except Exception as e:
        logger.error(f"Error reordering media files for invitation {invitation_id}: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500


@invitations_bp.route('/<int:invitation_id>/media/<int:media_id>/reprocess', methods=['POST'])
@jwt_required()
def reprocess_media_file(invitation_id, media_id):
    """
    POST /api/invitations/{id}/media/{media_id}/reprocess - Reprocess media file
    
    Request Body:
    - force: Force reprocessing even if already processed (default: false)
    
    WHY: Enables regeneration of thumbnails and optimization when processing
    logic is updated or when files need to be reprocessed for quality improvements.
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Authentication required'}), 401
        
        # Get media file
        media_file = InvitationMedia.query.filter_by(
            id=media_id, 
            invitation_id=invitation_id
        ).first()
        
        if not media_file:
            return jsonify({'message': 'Media file not found'}), 404
        
        # TODO: Add user access validation
        
        # Get request data
        data = request.get_json() or {}
        force = data.get('force', False)
        
        # Reprocess file
        success = file_upload_service.reprocess_media_file(media_id, force=force)
        
        if success:
            # Get updated media file
            media_file = InvitationMedia.query.get(media_id)
            base_url = 'https://kossomet.com/invita'
            media_data = media_file.to_dict(include_urls=True, base_url=base_url)
            
            return jsonify({
                'message': 'Media file reprocessed successfully',
                'media_file': media_data
            }), 200
        else:
            return jsonify({
                'message': 'Failed to reprocess media file'
            }), 500
        
    except Exception as e:
        logger.error(f"Error reprocessing media file {media_id}: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500


# =============================================
# MEDIA TYPE UTILITIES
# =============================================

@invitations_bp.route('/media-types', methods=['GET'])
def get_media_types():
    """
    GET /api/invitations/media-types - Get available media types
    
    WHY: Frontend needs to know available media types for upload forms
    and validation. Provides centralized type definitions.
    """
    return jsonify({
        'media_types': MediaType.get_all(),
        'image_types': MediaType.get_image_types(),
        'audio_types': MediaType.get_audio_types(),
        'type_descriptions': {
            'hero': 'Main hero/banner image',
            'gallery': 'Photo gallery images',
            'dresscode': 'Dress code reference images',
            'og_image': 'Social media sharing image',
            'music': 'Background music/audio',
            'avatar': 'Couple avatar/profile images',
            'icon': 'Custom icons or graphics'
        }
    }), 200


# =============================================
# ANONYMOUS USER CREATION ENDPOINT
# =============================================

@invitations_bp.route('/create', methods=['POST'])
def create_anonymous_invitation():
    """
    POST /api/invitations/create - Create complete invitation for anonymous users

    Request Body:
    {
        "user_data": {
            "email": "jefferson@example.com",
            "first_name": "Jefferson",
            "last_name": "Smith",
            "phone": "+51999999999"
        },
        "invitation_basic": {
            "template_id": 1,
            "plan_id": 1,
            "event_date": "2024-12-15T17:00:00",
            "event_location": "LIMA, PERU"
        },
        "sections_data": {
            "portada": {
                "nombre_novio": "Jefferson",
                "nombre_novia": "Rosemery"
            },
            "familiares": {
                "padre_novio": "EFRAIN ALBERTH HERNANDEZ",
                "madre_novio": "ROCIO EZQUIVEL GARCIA"
            }
        }
    }

    WHY: Single endpoint for anonymous users to create complete invitations
    with user account, order, invitation, and all section data in one transaction.
    Perfect for form submissions where users fill everything and submit once.
    """
    try:
        data = request.get_json() or {}

        # Validate required data
        user_data = data.get('user_data', {})
        invitation_basic = data.get('invitation_basic', {})
        sections_data = data.get('sections_data', {})

        if not user_data.get('email'):
            return jsonify({'message': 'Email is required'}), 400

        if not user_data.get('first_name'):
            return jsonify({'message': 'First name is required'}), 400

        if not invitation_basic.get('plan_id'):
            return jsonify({'message': 'Plan ID is required'}), 400

        # Start database transaction
        db.session.begin()

        # 1. Create or get user
        existing_user = User.query.filter_by(email=user_data['email']).first()

        if existing_user:
            user = existing_user
        else:
            user = User(
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data.get('last_name', ''),
                phone=user_data.get('phone', ''),
                password_hash='anonymous',  # Anonymous users don't need login
                email_verified=False
            )
            db.session.add(user)
            db.session.flush()  # Get user ID

        # 2. Get plan details for order
        from models.plan import Plan
        plan = Plan.query.get(invitation_basic['plan_id'])
        if not plan:
            return jsonify({'message': 'Invalid plan ID'}), 400

        # 3. Create order
        order = Order(
            user_id=user.id,
            subtotal=plan.price,
            total=plan.price,
            status=OrderStatus.PENDING,
            billing_name=user.full_name,
            billing_email=user.email,
            billing_phone=user.phone
        )
        db.session.add(order)
        db.session.flush()  # Get order ID

        # 4. Create order item
        order_item = OrderItem(
            order_id=order.id,
            plan_id=plan.id,
            product_name=plan.name,
            product_description=plan.description,
            unit_price=plan.price,
            quantity=1,
            total_price=plan.price
        )
        db.session.add(order_item)

        # 5. Create invitation
        from datetime import datetime

        # Parse event date if provided
        event_date = None
        if invitation_basic.get('event_date'):
            try:
                event_date = datetime.fromisoformat(invitation_basic['event_date'].replace('Z', '+00:00'))
            except:
                # Default to 6 months from now
                from datetime import timedelta
                event_date = datetime.utcnow() + timedelta(days=180)
        else:
            from datetime import timedelta
            event_date = datetime.utcnow() + timedelta(days=180)

        invitation = Invitation(
            user_id=user.id,
            order_id=order.id,
            title=f"Invitación - {user.first_name}",
            groom_name=sections_data.get('portada', {}).get('nombre_novio', user.first_name),
            bride_name=sections_data.get('portada', {}).get('nombre_novia', 'Novia'),
            wedding_date=event_date,
            ceremony_location=invitation_basic.get('event_location', 'Por definir'),
            template_name=f"template_{invitation_basic.get('template_id', 1)}",
            plan_id=plan.id,
            status='draft'
        )
        db.session.add(invitation)
        db.session.flush()  # Get invitation ID

        # 6. Create sections data
        created_sections = []

        for section_type, variables in sections_data.items():
            section_data = InvitationSectionsData(
                invitation_id=invitation.id,
                user_id=user.id,
                order_id=order.id,
                plan_id=plan.id,
                section_type=section_type,
                section_variant=f"{section_type}_1",
                category='weddings',  # Default category
                variables_json=variables
            )
            db.session.add(section_data)
            created_sections.append(section_data)

        # Commit transaction
        db.session.commit()

        # 7. Generate access URLs using the invitation's unique_url
        invitation_url = f"https://invitaciones.kossomet.com/i/{invitation.unique_url}"

        # Prepare response
        response_data = {
            'message': 'Invitation created successfully',
            'invitation': {
                'id': invitation.id,
                'title': invitation.title,
                'status': invitation.status,
                'url': invitation_url,
                'access_code': invitation.unique_url,
                'groom_name': invitation.groom_name,
                'bride_name': invitation.bride_name,
                'wedding_date': invitation.wedding_date.isoformat() if invitation.wedding_date else None,
                'wedding_location': invitation.ceremony_location,
                'template_name': invitation.template_name,
                'created_at': invitation.created_at.isoformat()
            },
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name
            },
            'order': {
                'id': order.id,
                'order_number': order.order_number,
                'total': float(order.total),
                'status': order.status.value,
                'plan_name': plan.name
            },
            'sections': {
                'total_created': len(created_sections),
                'section_types': list(sections_data.keys())
            }
        }

        return jsonify(response_data), 201

    except Exception as e:
        # Rollback transaction on error
        db.session.rollback()
        logger.error(f"Error creating anonymous invitation: {str(e)}")

        # Return user-friendly error based on exception type
        if "users.email" in str(e).lower():
            return jsonify({'message': 'Email address already exists'}), 409
        elif "foreign key" in str(e).lower():
            return jsonify({'message': 'Invalid reference data provided'}), 400
        else:
            return jsonify({'message': 'Internal server error'}), 500


@invitations_bp.route('/test-sections', methods=['POST'])
def test_sections_data():
    """
    POST /api/invitations/test-sections - Test endpoint to validate sections_data flow

    WHY: Debug and validate that sections_data is correctly formatted before
    creating actual invitation records. This helps identify data transformation issues.

    Request Body:
    {
        "order_id": 999,
        "template_id": 9,
        "plan_id": 1,
        "sections_data": {
            "hero": {"groom_name": "Carlos", "bride_name": "Maria"},
            "welcome": {...}
        },
        "groom_name": "Carlos Méndez",
        "bride_name": "María González"
    }

    Returns: Detailed breakdown of what would be created
    """
    try:
        data = request.get_json()

        logger.info("=" * 80)
        logger.info("🧪 TEST SECTIONS ENDPOINT CALLED")
        logger.info("=" * 80)

        # Log incoming data
        logger.info(f"📥 Received payload keys: {list(data.keys())}")
        logger.info(f"📥 sections_data keys: {list(data.get('sections_data', {}).keys())}")

        sections_data = data.get('sections_data', {})

        # Analyze sections_data
        analysis = {
            'total_sections': len(sections_data),
            'sections_breakdown': {},
            'would_create_records': 0,
            'empty_sections': [],
            'populated_sections': []
        }

        for section_type, variables in sections_data.items():
            if not variables or not isinstance(variables, dict):
                logger.warning(f"⚠️ Section '{section_type}' is empty or invalid")
                analysis['empty_sections'].append(section_type)
                continue

            var_count = len(variables)
            analysis['sections_breakdown'][section_type] = {
                'variable_count': var_count,
                'variables': list(variables.keys()),
                'sample_values': {k: v for k, v in list(variables.items())[:3]}  # First 3 values
            }

            if var_count > 0:
                analysis['would_create_records'] += 1
                analysis['populated_sections'].append(section_type)
                logger.info(f"✅ Section '{section_type}': {var_count} variables")
            else:
                analysis['empty_sections'].append(section_type)
                logger.info(f"❌ Section '{section_type}': EMPTY")

        # Determine success criteria
        success = analysis['would_create_records'] > 0

        logger.info("=" * 80)
        logger.info(f"🎯 TEST RESULT: {'SUCCESS' if success else 'FAILURE'}")
        logger.info(f"📊 Would create {analysis['would_create_records']} InvitationSectionsData records")
        logger.info(f"📊 Populated sections: {analysis['populated_sections']}")
        logger.info(f"📊 Empty sections: {analysis['empty_sections']}")
        logger.info("=" * 80)

        return jsonify({
            'success': success,
            'analysis': analysis,
            'message': f"Would create {analysis['would_create_records']} section records",
            'recommendation': 'PASS - Data is correctly formatted' if success else 'FAIL - No valid sections data found'
        }), 200 if success else 400

    except Exception as e:
        logger.error(f"❌ Error in test endpoint: {str(e)}")
        logger.exception(e)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500