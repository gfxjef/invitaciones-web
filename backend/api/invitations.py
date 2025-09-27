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
    try:
        current_user_id = get_jwt_identity()
        
        # Get user's invitations
        invitations = Invitation.query.filter_by(user_id=current_user_id).all()
        
        invitations_data = []
        for invitation in invitations:
            invitations_data.append({
                'id': invitation.id,
                'title': invitation.title,
                'status': invitation.status,
                'created_at': invitation.created_at.isoformat() if invitation.created_at else None,
                'updated_at': invitation.updated_at.isoformat() if invitation.updated_at else None,
                'template_name': invitation.template_name,
                'plan_id': invitation.plan_id
            })
        
        return jsonify({
            'invitations': invitations_data,
            'total': len(invitations_data)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user invitations: {str(e)}")
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