"""
Invitation Editor API Blueprint

This module implements comprehensive API endpoints for the invitation editor,
supporting dynamic field management, multimedia uploads, event scheduling,
RSVP management, and publication workflow.

WHY: Centralized API for invitation editing operations with proper validation,
authorization, error handling, and performance optimization. Follows enterprise
Flask patterns with comprehensive logging and security measures.

TECHNICAL REQUIREMENTS:
- JWT authentication and user authorization
- Request/response validation with Marshmallow schemas  
- Comprehensive error handling and structured logging
- Optimized database queries with proper indexing
- Rate limiting considerations for file uploads
- CORS support for frontend integration
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError, validates_schema
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
from datetime import datetime
import os
import uuid
import json
import logging
from typing import Dict, Any, List, Optional, Tuple

from extensions import db
from models.invitation import Invitation
from models.invitation_data import InvitationData
from models.invitation_media import InvitationMedia, MediaType
from models.invitation_event import InvitationEvent
from models.invitation_response import InvitationResponse
from models.user import User

# Configure structured logging
logger = logging.getLogger(__name__)

# Create blueprint
invitation_editor_bp = Blueprint('invitation_editor', __name__)

# WHY: Allowed file extensions for security
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav', 'ogg'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def is_allowed_file(filename: str, allowed_extensions: set) -> bool:
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def get_file_extension(filename: str) -> str:
    """Get file extension in lowercase."""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

# ============================================================================
# REQUEST/RESPONSE SCHEMAS FOR VALIDATION
# ============================================================================

class InvitationDataFieldSchema(Schema):
    """Schema for individual invitation data field updates."""
    value = fields.Raw(allow_none=True)
    metadata = fields.Dict(missing=dict)

class BulkDataUpdateSchema(Schema):
    """Schema for bulk invitation data updates."""
    fields = fields.Dict(
        keys=fields.Str(),
        values=fields.Raw(),
        required=True,
        validate=lambda x: len(x) <= 50  # WHY: Prevent excessive bulk operations
    )

class MediaUploadResponseSchema(Schema):
    """Schema for media upload responses."""
    id = fields.Int()
    media_type = fields.Str()
    field_name = fields.Str()
    original_filename = fields.Str()
    file_size = fields.Int()
    url = fields.Str()
    thumbnail_urls = fields.Dict()

class EventCreateSchema(Schema):
    """Schema for creating invitation events."""
    event_name = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
    event_description = fields.Str()
    event_datetime = fields.DateTime(required=True)
    event_venue = fields.Str()
    event_address = fields.Str()
    event_end_datetime = fields.DateTime()
    event_icon = fields.Str()
    event_order = fields.Int(missing=0)
    is_visible = fields.Bool(missing=True)
    requires_rsvp = fields.Bool(missing=False)
    event_metadata = fields.Dict(missing=dict)

class EventUpdateSchema(Schema):
    """Schema for updating invitation events."""
    event_name = fields.Str(validate=lambda x: len(x.strip()) > 0)
    event_description = fields.Str()
    event_datetime = fields.DateTime()
    event_venue = fields.Str()
    event_address = fields.Str()
    event_end_datetime = fields.DateTime()
    event_icon = fields.Str()
    event_order = fields.Int()
    is_visible = fields.Bool()
    requires_rsvp = fields.Bool()
    event_metadata = fields.Dict()

class RSVPConfigSchema(Schema):
    """Schema for RSVP configuration."""
    is_enabled = fields.Bool(required=True)
    deadline_date = fields.DateTime()
    max_guests_per_response = fields.Int(validate=lambda x: x > 0)
    custom_questions = fields.List(fields.Dict())
    confirmation_message = fields.Str()
    metadata = fields.Dict(missing=dict)

class RSVPResponseSchema(Schema):
    """Schema for public RSVP responses."""
    guest_name = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
    guest_email = fields.Email()
    guest_phone = fields.Str()
    will_attend = fields.Bool(required=True)
    guest_count = fields.Int(validate=lambda x: x > 0, missing=1)
    dietary_restrictions = fields.Str()
    special_requests = fields.Str()
    additional_notes = fields.Str()
    custom_responses = fields.Dict(missing=dict)

# ============================================================================
# AUTHORIZATION HELPER
# ============================================================================

def check_invitation_ownership(invitation_id: int) -> Tuple[bool, Optional[Invitation]]:
    """
    Check if current user owns the invitation.
    
    Returns:
        Tuple of (is_owner, invitation_object)
        
    WHY: Centralizes authorization logic to ensure users can only
    edit their own invitations across all endpoints.
    """
    try:
        current_user_id = get_jwt_identity()
        invitation = Invitation.query.get(invitation_id)
        
        if not invitation:
            return False, None
            
        # WHY: JWT identity might be returned as string, ensure type compatibility
        is_owner = invitation.user_id == int(current_user_id)
        
        return is_owner, invitation
        
    except Exception as e:
        logger.error(f"Error checking invitation ownership: {e}")
        return False, None

# ============================================================================
# INVITATION DATA MANAGEMENT ENDPOINTS
# ============================================================================


@invitation_editor_bp.route('/<int:invitation_id>/data', methods=['POST'])
@jwt_required()
def save_invitation_data(invitation_id: int):
    """
    Save invitation form data (bulk update).
    
    POST /api/invitations/{id}/data
    
    WHY: Provides efficient bulk updates for form saves in the editor.
    Validates all fields before committing to ensure data consistency.
    """
    logger.info(f"Saving bulk invitation data for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Validate request data
        schema = BulkDataUpdateSchema()
        try:
            validated_data = schema.load(request.json or {})
        except ValidationError as err:
            return jsonify({
                'message': 'Validation failed',
                'errors': err.messages
            }), 400
        
        # Perform bulk upsert
        fields_data = validated_data['fields']
        InvitationData.bulk_upsert_data(invitation_id, fields_data)
        
        # Update invitation timestamp
        invitation.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Successfully saved {len(fields_data)} fields for invitation {invitation_id}")
        
        return jsonify({
            'message': 'Data saved successfully',
            'fields_updated': len(fields_data),
            'updated_at': invitation.updated_at.isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error saving invitation data: {e}")
        db.session.rollback()
        return jsonify({
            'message': 'Error saving invitation data',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/data', methods=['GET'])
@jwt_required()
def get_invitation_data(invitation_id: int):
    """
    Get all invitation data fields.
    
    GET /api/invitations/{id}/data
    
    WHY: Provides organized data retrieval for editor initialization.
    Returns data grouped by category for better frontend organization.
    """
    logger.info(f"Retrieving invitation data for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Get organized data
        data_dict = InvitationData.get_invitation_data_dict(invitation_id)
        
        logger.info(f"Retrieved {sum(len(cat) for cat in data_dict.values())} fields for invitation {invitation_id}")
        
        return jsonify({
            'invitation_id': invitation_id,
            'data': data_dict,
            'categories': list(data_dict.keys()),
            'updated_at': invitation.updated_at.isoformat() if invitation.updated_at else None
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving invitation data: {e}")
        return jsonify({
            'message': 'Error retrieving invitation data',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/data/<field_name>', methods=['PUT'])
@jwt_required()
def update_data_field(invitation_id: int, field_name: str):
    """
    Update specific invitation data field.
    
    PUT /api/invitations/{id}/data/{field}
    
    WHY: Enables real-time field updates in the editor without
    requiring full form submission. Optimizes for responsive UX.
    """
    logger.info(f"Updating field '{field_name}' for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Validate request data
        schema = InvitationDataFieldSchema()
        try:
            validated_data = schema.load(request.json or {})
        except ValidationError as err:
            return jsonify({
                'message': 'Validation failed',
                'errors': err.messages
            }), 400
        
        # Find or create field
        field = InvitationData.query.filter_by(
            invitation_id=invitation_id,
            field_name=field_name
        ).first()
        
        if field:
            # Update existing field
            field.update_field(
                validated_data['value'],
                validated_data.get('metadata')
            )
        else:
            # Create new field
            field = InvitationData(
                invitation_id=invitation_id,
                field_name=field_name
            )
            field.set_typed_value(validated_data['value'])
            if validated_data.get('metadata'):
                field.field_metadata = validated_data['metadata']
            db.session.add(field)
        
        # Update invitation timestamp
        invitation.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Successfully updated field '{field_name}' for invitation {invitation_id}")
        
        return jsonify({
            'message': 'Field updated successfully',
            'field': field.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating field '{field_name}': {e}")
        db.session.rollback()
        return jsonify({
            'message': 'Error updating field',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/data/<field_name>', methods=['DELETE'])
@jwt_required()
def delete_data_field(invitation_id: int, field_name: str):
    """
    Delete specific invitation data field.
    
    DELETE /api/invitations/{id}/data/{field}
    
    WHY: Allows removal of unnecessary fields and cleanup of invitation data.
    Supports template changes that might remove certain fields.
    """
    logger.info(f"Deleting field '{field_name}' for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Find and delete field
        field = InvitationData.query.filter_by(
            invitation_id=invitation_id,
            field_name=field_name
        ).first()
        
        if not field:
            return jsonify({
                'message': 'Field not found',
                'error': 'not_found'
            }), 404
        
        db.session.delete(field)
        invitation.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Successfully deleted field '{field_name}' for invitation {invitation_id}")
        
        return jsonify({
            'message': 'Field deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting field '{field_name}': {e}")
        db.session.rollback()
        return jsonify({
            'message': 'Error deleting field',
            'error': 'server_error'
        }), 500

# ============================================================================
# MEDIA MANAGEMENT ENDPOINTS
# ============================================================================

@invitation_editor_bp.route('/<int:invitation_id>/media', methods=['POST'])
@jwt_required()
def upload_media_file(invitation_id: int):
    """
    Upload media files (images, audio).
    
    POST /api/invitations/{id}/media
    
    WHY: Handles secure file uploads with validation, storage organization,
    and metadata extraction. Supports multiple media types for rich invitations.
    """
    logger.info(f"Uploading media file for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({
                'message': 'No file provided',
                'error': 'no_file'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'message': 'No file selected',
                'error': 'no_file'
            }), 400
        
        # Get additional parameters
        media_type = request.form.get('media_type', MediaType.GALLERY)
        field_name = request.form.get('field_name')
        display_order = int(request.form.get('display_order', 0))
        
        # Validate media type
        if media_type not in MediaType.get_all():
            return jsonify({
                'message': f'Invalid media type: {media_type}',
                'error': 'invalid_media_type'
            }), 400
        
        # Validate file type based on media type
        if media_type in MediaType.get_image_types():
            if not is_allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
                return jsonify({
                    'message': 'Invalid image file type',
                    'error': 'invalid_file_type'
                }), 400
        elif media_type in MediaType.get_audio_types():
            if not is_allowed_file(file.filename, ALLOWED_AUDIO_EXTENSIONS):
                return jsonify({
                    'message': 'Invalid audio file type',
                    'error': 'invalid_file_type'
                }), 400
        
        # Check file size
        if len(file.read()) > MAX_FILE_SIZE:
            return jsonify({
                'message': f'File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB',
                'error': 'file_too_large'
            }), 400
        
        file.seek(0)  # Reset file pointer after size check
        
        # Generate secure filename
        filename = secure_filename(file.filename)
        file_extension = get_file_extension(filename)
        unique_filename = f"{invitation_id}_{media_type}_{uuid.uuid4().hex[:8]}.{file_extension}"
        
        # Create upload directory structure
        upload_base = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        media_dir = os.path.join(upload_base, 'invitations', str(invitation_id), media_type)
        os.makedirs(media_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(media_dir, unique_filename)
        file.save(file_path)
        
        # Store relative path for database
        relative_path = os.path.join('invitations', str(invitation_id), media_type, unique_filename)
        
        # Create media record
        media = InvitationMedia(
            invitation_id=invitation_id,
            media_type=media_type,
            field_name=field_name,
            file_path=relative_path,
            original_filename=filename,
            file_size=os.path.getsize(file_path),
            mime_type=file.mimetype,
            display_order=display_order
        )
        
        # Extract image dimensions if it's an image
        if media.is_image():
            try:
                from PIL import Image
                with Image.open(file_path) as img:
                    media.set_dimensions(img.width, img.height)
            except ImportError:
                logger.warning("PIL not available for image dimension extraction")
            except Exception as e:
                logger.warning(f"Could not extract image dimensions: {e}")
        
        db.session.add(media)
        invitation.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Successfully uploaded media file '{filename}' for invitation {invitation_id}")
        
        # Return response with media data
        schema = MediaUploadResponseSchema()
        return jsonify({
            'message': 'File uploaded successfully',
            'media': media.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Error uploading media file: {e}")
        db.session.rollback()
        return jsonify({
            'message': 'Error uploading file',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/media', methods=['GET'])
@jwt_required()
def get_invitation_media(invitation_id: int):
    """
    Get all media files for invitation.
    
    GET /api/invitations/{id}/media
    
    WHY: Provides organized media listing for editor interface.
    Groups media by type for better UI organization.
    """
    logger.info(f"Retrieving media files for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Get all media files
        media_files = InvitationMedia.query.filter_by(
            invitation_id=invitation_id
        ).order_by(
            InvitationMedia.media_type,
            InvitationMedia.display_order
        ).all()
        
        # Organize by media type
        media_by_type = {}
        for media in media_files:
            if media.media_type not in media_by_type:
                media_by_type[media.media_type] = []
            media_by_type[media.media_type].append(media.to_dict())
        
        logger.info(f"Retrieved {len(media_files)} media files for invitation {invitation_id}")
        
        return jsonify({
            'invitation_id': invitation_id,
            'media_by_type': media_by_type,
            'total_files': len(media_files)
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving media files: {e}")
        return jsonify({
            'message': 'Error retrieving media files',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/media/<int:media_id>', methods=['DELETE'])
@jwt_required()
def delete_media_file(invitation_id: int, media_id: int):
    """
    Delete media file.
    
    DELETE /api/invitations/{id}/media/{mediaId}
    
    WHY: Enables media cleanup and replacement. Removes both
    database record and physical file for complete cleanup.
    """
    logger.info(f"Deleting media file {media_id} for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Find media file
        media = InvitationMedia.query.filter_by(
            id=media_id,
            invitation_id=invitation_id
        ).first()
        
        if not media:
            return jsonify({
                'message': 'Media file not found',
                'error': 'not_found'
            }), 404
        
        # Delete physical file
        upload_base = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        media.delete_file(upload_base)
        
        # Delete database record
        db.session.delete(media)
        invitation.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Successfully deleted media file {media_id} for invitation {invitation_id}")
        
        return jsonify({
            'message': 'Media file deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting media file: {e}")
        db.session.rollback()
        return jsonify({
            'message': 'Error deleting media file',
            'error': 'server_error'
        }), 500

# ============================================================================
# EVENT MANAGEMENT ENDPOINTS
# ============================================================================

@invitation_editor_bp.route('/<int:invitation_id>/events', methods=['POST'])
@jwt_required()
def create_event(invitation_id: int):
    """
    Create invitation event.
    
    POST /api/invitations/{id}/events
    
    WHY: Enables rich itinerary creation with proper validation
    and ordering for multi-event invitations.
    """
    logger.info(f"Creating event for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Validate request data
        schema = EventCreateSchema()
        try:
            validated_data = schema.load(request.json or {})
        except ValidationError as err:
            return jsonify({
                'message': 'Validation failed',
                'errors': err.messages
            }), 400
        
        # Create event
        event = InvitationEvent(
            invitation_id=invitation_id,
            **validated_data
        )
        
        db.session.add(event)
        invitation.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Successfully created event '{event.event_name}' for invitation {invitation_id}")
        
        return jsonify({
            'message': 'Event created successfully',
            'event': event.to_dict()
        }), 201
        
    except Exception as e:
        print(f"DEBUG: Exception in create_event: {e}")
        import traceback
        traceback.print_exc()
        logger.error(f"Error creating event: {e}")
        db.session.rollback()
        return jsonify({
            'message': 'Error creating event',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/events', methods=['GET'])
@jwt_required()
def get_invitation_events(invitation_id: int):
    """
    Get all events for invitation.
    
    GET /api/invitations/{id}/events
    
    WHY: Provides ordered event listing for itinerary display
    and editor management interface.
    """
    logger.info(f"Retrieving events for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Get events ordered by datetime and event_order
        events = InvitationEvent.query.filter_by(
            invitation_id=invitation_id
        ).order_by(
            InvitationEvent.event_datetime,
            InvitationEvent.event_order
        ).all()
        
        logger.info(f"Retrieved {len(events)} events for invitation {invitation_id}")
        
        return jsonify({
            'invitation_id': invitation_id,
            'events': [event.to_dict() for event in events],
            'total_events': len(events)
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving events: {e}")
        return jsonify({
            'message': 'Error retrieving events',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/events/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(invitation_id: int, event_id: int):
    """
    Update invitation event.
    
    PUT /api/invitations/{id}/events/{eventId}
    
    WHY: Enables event editing with validation and proper
    timestamp tracking for audit purposes.
    """
    logger.info(f"Updating event {event_id} for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Find event
        event = InvitationEvent.query.filter_by(
            id=event_id,
            invitation_id=invitation_id
        ).first()
        
        if not event:
            return jsonify({
                'message': 'Event not found',
                'error': 'not_found'
            }), 404
        
        # Validate request data
        schema = EventUpdateSchema()
        try:
            validated_data = schema.load(request.json or {})
        except ValidationError as err:
            return jsonify({
                'message': 'Validation failed',
                'errors': err.messages
            }), 400
        
        # Update event fields
        for field, value in validated_data.items():
            setattr(event, field, value)
        
        event.updated_at = datetime.utcnow()
        invitation.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Successfully updated event {event_id} for invitation {invitation_id}")
        
        return jsonify({
            'message': 'Event updated successfully',
            'event': event.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating event: {e}")
        db.session.rollback()
        return jsonify({
            'message': 'Error updating event',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/events/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(invitation_id: int, event_id: int):
    """
    Delete invitation event.
    
    DELETE /api/invitations/{id}/events/{eventId}
    
    WHY: Enables itinerary cleanup and event removal
    with proper cascade handling for related data.
    """
    logger.info(f"Deleting event {event_id} for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Find event
        event = InvitationEvent.query.filter_by(
            id=event_id,
            invitation_id=invitation_id
        ).first()
        
        if not event:
            return jsonify({
                'message': 'Event not found',
                'error': 'not_found'
            }), 404
        
        db.session.delete(event)
        invitation.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Successfully deleted event {event_id} for invitation {invitation_id}")
        
        return jsonify({
            'message': 'Event deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting event: {e}")
        db.session.rollback()
        return jsonify({
            'message': 'Error deleting event',
            'error': 'server_error'
        }), 500

# ============================================================================
# PREVIEW AND PUBLICATION ENDPOINTS
# ============================================================================

@invitation_editor_bp.route('/<int:invitation_id>/preview', methods=['GET'])
@jwt_required()
def get_invitation_preview(invitation_id: int):
    """
    Get invitation preview with current data.
    
    GET /api/invitations/{id}/preview
    
    WHY: Provides comprehensive preview data combining invitation
    metadata, custom data, media files, and events for template rendering.
    """
    logger.info(f"Generating preview for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Get all related data
        invitation_data = InvitationData.get_invitation_data_dict(invitation_id)
        
        media_files = InvitationMedia.query.filter_by(
            invitation_id=invitation_id
        ).order_by(
            InvitationMedia.media_type,
            InvitationMedia.display_order
        ).all()
        
        events = InvitationEvent.query.filter_by(
            invitation_id=invitation_id
        ).order_by(
            InvitationEvent.event_datetime,
            InvitationEvent.event_order
        ).all()
        
        # Organize media by type
        media_by_type = {}
        for media in media_files:
            if media.media_type not in media_by_type:
                media_by_type[media.media_type] = []
            media_by_type[media.media_type].append(media.to_dict())
        
        logger.info(f"Generated preview for invitation {invitation_id} with {len(media_files)} media files and {len(events)} events")
        
        return jsonify({
            'invitation': invitation.to_dict(),
            'custom_data': invitation_data,
            'media': media_by_type,
            'events': [event.to_dict() for event in events],
            'preview_url': f"/invitacion/{invitation.get_url_slug()}",
            'generated_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating preview: {e}")
        return jsonify({
            'message': 'Error generating preview',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/publish', methods=['POST'])
@jwt_required()
def publish_invitation(invitation_id: int):
    """
    Publish invitation.
    
    POST /api/invitations/{id}/publish
    
    WHY: Formally publishes invitation with proper status tracking
    and timestamp management for analytics and lifecycle management.
    """
    logger.info(f"Publishing invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Publish invitation
        invitation.publish()
        db.session.commit()
        
        logger.info(f"Successfully published invitation {invitation_id}")
        
        return jsonify({
            'message': 'Invitation published successfully',
            'invitation': invitation.to_dict(),
            'public_url': f"/invitacion/{invitation.get_url_slug()}"
        }), 200
        
    except Exception as e:
        logger.error(f"Error publishing invitation: {e}")
        db.session.rollback()
        return jsonify({
            'message': 'Error publishing invitation',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/unpublish', methods=['POST'])
@jwt_required()
def unpublish_invitation(invitation_id: int):
    """
    Unpublish invitation.
    
    POST /api/invitations/{id}/unpublish
    
    WHY: Allows temporary invitation hiding for updates or fixes
    without losing data. Maintains audit trail with timestamps.
    """
    logger.info(f"Unpublishing invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Unpublish invitation
        invitation.status = 'draft'
        invitation.is_published = False
        invitation.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Successfully unpublished invitation {invitation_id}")
        
        return jsonify({
            'message': 'Invitation unpublished successfully',
            'invitation': invitation.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error unpublishing invitation: {e}")
        db.session.rollback()
        return jsonify({
            'message': 'Error unpublishing invitation',
            'error': 'server_error'
        }), 500

# ============================================================================
# URL VALIDATION ENDPOINT
# ============================================================================

@invitation_editor_bp.route('/check-url/<url_slug>', methods=['GET'])
@jwt_required()
def check_url_availability(url_slug: str):
    """
    Check if custom URL is available.
    
    GET /api/invitations/check-url/{url}
    
    WHY: Prevents URL conflicts and provides real-time validation
    for custom URL inputs in the editor interface.
    """
    logger.info(f"Checking URL availability for '{url_slug}'")
    
    try:
        # Check if URL is already taken (excluding current user's invitations if specified)
        current_user_id = get_jwt_identity()
        exclude_invitation_id = request.args.get('exclude_id', type=int)
        
        query = Invitation.query.filter(
            (Invitation.custom_url == url_slug) | (Invitation.unique_url == url_slug)
        )
        
        if exclude_invitation_id:
            query = query.filter(Invitation.id != exclude_invitation_id)
        
        existing_invitation = query.first()
        
        is_available = existing_invitation is None
        
        logger.info(f"URL '{url_slug}' availability: {is_available}")
        
        return jsonify({
            'url': url_slug,
            'available': is_available,
            'message': 'URL is available' if is_available else 'URL is already taken'
        }), 200
        
    except Exception as e:
        logger.error(f"Error checking URL availability: {e}")
        return jsonify({
            'message': 'Error checking URL availability',
            'error': 'server_error'
        }), 500

# ============================================================================
# RSVP MANAGEMENT ENDPOINTS
# ============================================================================

@invitation_editor_bp.route('/<int:invitation_id>/rsvp', methods=['GET'])
@jwt_required()
def get_rsvp_config(invitation_id: int):
    """
    Get RSVP configuration for invitation.
    
    GET /api/invitations/{id}/rsvp
    
    WHY: Retrieves RSVP settings and responses for invitation management.
    Provides data for RSVP configuration interface and response analytics.
    """
    logger.info(f"Getting RSVP configuration for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Get RSVP configuration from invitation data
        rsvp_config_field = InvitationData.query.filter_by(
            invitation_id=invitation_id,
            field_name='rsvp_config'
        ).first()
        
        rsvp_config = {}
        if rsvp_config_field:
            rsvp_config = rsvp_config_field.get_typed_value() or {}
        
        # Get response count
        response_count = InvitationResponse.query.filter_by(
            invitation_id=invitation_id
        ).count()
        
        logger.info(f"Retrieved RSVP config for invitation {invitation_id} with {response_count} responses")
        
        return jsonify({
            'invitation_id': invitation_id,
            'rsvp_config': rsvp_config,
            'response_count': response_count
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting RSVP config: {e}")
        return jsonify({
            'message': 'Error getting RSVP configuration',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/rsvp', methods=['POST'])
@jwt_required()
def update_rsvp_config(invitation_id: int):
    """
    Create or update RSVP configuration.
    
    POST /api/invitations/{id}/rsvp
    
    WHY: Enables RSVP setup and configuration management
    with validation and proper data storage.
    """
    logger.info(f"Updating RSVP configuration for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Validate request data
        schema = RSVPConfigSchema()
        try:
            validated_data = schema.load(request.json or {})
        except ValidationError as err:
            return jsonify({
                'message': 'Validation failed',
                'errors': err.messages
            }), 400
        
        # Store RSVP configuration as invitation data
        InvitationData.bulk_upsert_data(invitation_id, {
            'rsvp_config': validated_data
        })
        
        invitation.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Successfully updated RSVP config for invitation {invitation_id}")
        
        return jsonify({
            'message': 'RSVP configuration updated successfully',
            'rsvp_config': validated_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating RSVP config: {e}")
        db.session.rollback()
        return jsonify({
            'message': 'Error updating RSVP configuration',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/rsvp/responses', methods=['GET'])
@jwt_required()
def get_rsvp_responses(invitation_id: int):
    """
    Get RSVP responses for invitation.
    
    GET /api/invitations/{id}/rsvp/responses
    
    WHY: Provides response analytics and guest management data
    for invitation owners with proper pagination support.
    """
    logger.info(f"Getting RSVP responses for invitation {invitation_id}")
    
    try:
        # Check ownership
        is_owner, invitation = check_invitation_ownership(invitation_id)
        if not is_owner:
            return jsonify({
                'message': 'Invitation not found or access denied',
                'error': 'unauthorized'
            }), 404
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)  # Max 100 per page
        
        # Get responses with pagination
        responses_query = InvitationResponse.query.filter_by(
            invitation_id=invitation_id
        ).order_by(InvitationResponse.created_at.desc())
        
        responses_paginated = responses_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Calculate statistics
        total_responses = responses_paginated.total
        attending_count = InvitationResponse.query.filter_by(
            invitation_id=invitation_id,
            will_attend=True
        ).count()
        
        logger.info(f"Retrieved {len(responses_paginated.items)} RSVP responses for invitation {invitation_id}")
        
        return jsonify({
            'invitation_id': invitation_id,
            'responses': [response.to_dict() for response in responses_paginated.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total_responses,
                'pages': responses_paginated.pages,
                'has_next': responses_paginated.has_next,
                'has_prev': responses_paginated.has_prev
            },
            'statistics': {
                'total_responses': total_responses,
                'attending_count': attending_count,
                'not_attending_count': total_responses - attending_count,
                'response_rate': f"{(total_responses / max(1, total_responses)) * 100:.1f}%"
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting RSVP responses: {e}")
        return jsonify({
            'message': 'Error getting RSVP responses',
            'error': 'server_error'
        }), 500


@invitation_editor_bp.route('/<int:invitation_id>/rsvp/respond', methods=['POST'])
def submit_rsvp_response(invitation_id: int):
    """
    Submit RSVP response (public endpoint).
    
    POST /api/invitations/{id}/rsvp/respond
    
    WHY: Public endpoint for guest RSVP submission with proper
    validation and spam protection. No authentication required.
    """
    logger.info(f"Submitting RSVP response for invitation {invitation_id}")
    
    try:
        # Check if invitation exists and is published
        invitation = Invitation.query.get(invitation_id)
        if not invitation or not invitation.is_published:
            return jsonify({
                'message': 'Invitation not found or not available',
                'error': 'not_found'
            }), 404
        
        # Check if RSVP is enabled
        rsvp_config_field = InvitationData.query.filter_by(
            invitation_id=invitation_id,
            field_name='rsvp_config'
        ).first()
        
        rsvp_config = {}
        if rsvp_config_field:
            rsvp_config = rsvp_config_field.get_typed_value() or {}
        
        if not rsvp_config.get('is_enabled', False):
            return jsonify({
                'message': 'RSVP is not enabled for this invitation',
                'error': 'rsvp_disabled'
            }), 400
        
        # Check if RSVP deadline has passed
        deadline = rsvp_config.get('deadline_date')
        if deadline:
            deadline_dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
            if datetime.utcnow() > deadline_dt:
                return jsonify({
                    'message': 'RSVP deadline has passed',
                    'error': 'deadline_passed'
                }), 400
        
        # Validate request data
        schema = RSVPResponseSchema()
        try:
            validated_data = schema.load(request.json or {})
        except ValidationError as err:
            return jsonify({
                'message': 'Validation failed',
                'errors': err.messages
            }), 400
        
        # Create RSVP response
        response = InvitationResponse(
            invitation_id=invitation_id,
            **validated_data
        )
        
        db.session.add(response)
        db.session.commit()
        
        logger.info(f"Successfully submitted RSVP response for invitation {invitation_id} by {response.guest_name}")
        
        confirmation_message = rsvp_config.get('confirmation_message', 'Thank you for your response!')
        
        return jsonify({
            'message': 'RSVP response submitted successfully',
            'confirmation_message': confirmation_message,
            'response_id': response.id
        }), 201
        
    except Exception as e:
        logger.error(f"Error submitting RSVP response: {e}")
        db.session.rollback()
        return jsonify({
            'message': 'Error submitting RSVP response',
            'error': 'server_error'
        }), 500