from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.datastructures import FileStorage
import logging

from models.invitation_media import InvitationMedia, MediaType
from models.invitation import Invitation
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