from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

invitations_bp = Blueprint('invitations', __name__)


@invitations_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_invitations():
    current_user_id = get_jwt_identity()
    # Placeholder - implement after models are complete
    return jsonify({
        'invitations': [],
        'message': f'Invitations for user {current_user_id}'
    }), 200


@invitations_bp.route('/', methods=['POST'])
@jwt_required()
def create_invitation():
    current_user_id = get_jwt_identity()
    # Placeholder - implement after models are complete
    return jsonify({
        'message': 'Invitation created',
        'user_id': current_user_id
    }), 201


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