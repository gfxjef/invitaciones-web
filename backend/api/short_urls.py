"""
Short URL Generation API

WHY: Provides endpoints to generate personalized short URLs for invitations
Format: {random_code}/{couple_names} (e.g., w3d/Carlos&Maria)

WHAT: API endpoints for creating and retrieving short URLs
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.invitation import Invitation
from utils.short_url_generator import generate_unique_code, sanitize_couple_names
import logging

logger = logging.getLogger(__name__)

short_urls_bp = Blueprint('short_urls', __name__)


@short_urls_bp.route('/api/invitations/<int:invitation_id>/generate-short-url', methods=['POST'])
@jwt_required()
def generate_short_url(invitation_id):
    """
    Generate personalized short URL for invitation

    Request body (optional):
        {
            "custom_names": "Carlos&Maria"  // Optional: Override auto-generated names
        }

    Response:
        {
            "success": true,
            "short_code": "w3d",
            "custom_names": "Carlos&Maria",
            "short_url": "w3d/Carlos&Maria",
            "full_url": "http://localhost:3000/w3d/Carlos&Maria"
        }
    """
    try:
        user_id = get_jwt_identity()

        # Get invitation and verify ownership
        invitation = Invitation.query.filter_by(id=invitation_id, user_id=user_id).first()
        if not invitation:
            return jsonify({
                'success': False,
                'error': 'Invitación no encontrada o no autorizada'
            }), 404

        # Check if short URL already exists
        if invitation.short_code and invitation.custom_names:
            return jsonify({
                'success': True,
                'short_code': invitation.short_code,
                'custom_names': invitation.custom_names,
                'short_url': invitation.get_short_url_path(),
                'message': 'URL corta ya existe'
            })

        # Get custom names from request or generate from invitation data
        data = request.get_json() or {}
        custom_names = data.get('custom_names')

        if not custom_names:
            # Auto-generate from groom and bride names
            custom_names = sanitize_couple_names(
                invitation.groom_name,
                invitation.bride_name
            )
        else:
            # Sanitize provided names
            # Assume format is already "Name1&Name2" or single name
            parts = custom_names.split('&')
            if len(parts) == 2:
                custom_names = sanitize_couple_names(parts[0], parts[1])
            else:
                custom_names = sanitize_couple_names(custom_names, '')

        # Generate unique short code
        short_code = generate_unique_code(db.session)

        # Save to invitation
        invitation.short_code = short_code
        invitation.custom_names = custom_names
        db.session.commit()

        logger.info(f"Generated short URL for invitation {invitation_id}: {short_code}/{custom_names}")

        return jsonify({
            'success': True,
            'short_code': short_code,
            'custom_names': custom_names,
            'short_url': invitation.get_short_url_path(),
            'message': 'URL corta generada exitosamente'
        })

    except Exception as e:
        logger.error(f"Error generating short URL: {str(e)}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Error al generar URL corta: {str(e)}'
        }), 500


@short_urls_bp.route('/api/invitations/<int:invitation_id>/short-url', methods=['GET'])
@jwt_required()
def get_short_url(invitation_id):
    """
    Get existing short URL for invitation

    Response:
        {
            "success": true,
            "short_code": "w3d",
            "custom_names": "Carlos&Maria",
            "short_url": "w3d/Carlos&Maria",
            "exists": true
        }
    """
    try:
        user_id = get_jwt_identity()

        invitation = Invitation.query.filter_by(id=invitation_id, user_id=user_id).first()
        if not invitation:
            return jsonify({
                'success': False,
                'error': 'Invitación no encontrada'
            }), 404

        if invitation.short_code and invitation.custom_names:
            return jsonify({
                'success': True,
                'exists': True,
                'short_code': invitation.short_code,
                'custom_names': invitation.custom_names,
                'short_url': invitation.get_short_url_path()
            })
        else:
            return jsonify({
                'success': True,
                'exists': False,
                'message': 'No se ha generado URL corta aún'
            })

    except Exception as e:
        logger.error(f"Error getting short URL: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@short_urls_bp.route('/api/short-url/redirect', methods=['GET'])
def get_short_url_redirect():
    """
    Get invitation data by short URL (for Next.js server-side redirect)

    Query params:
        code: short code (e.g., "fdg")
        names: custom names (e.g., "Ss")

    Response:
        {
            "url_slug": "2398cfc1",
            "invitation_id": 60
        }

    WHY: Next.js needs to query backend to get url_slug for redirect
         This endpoint doesn't require authentication (public short URLs)
    """
    try:
        short_code = request.args.get('code')
        custom_names = request.args.get('names')

        if not short_code or not custom_names:
            return jsonify({
                'success': False,
                'error': 'Missing code or names parameter'
            }), 400

        # Case-insensitive search for better UX
        from sqlalchemy import func
        invitation = Invitation.query.filter(
            func.lower(Invitation.short_code) == func.lower(short_code),
            func.lower(Invitation.custom_names) == func.lower(custom_names)
        ).first()

        if not invitation:
            logger.warning(f"Short URL not found: {short_code}/{custom_names}")
            return jsonify({
                'success': False,
                'error': 'Invitación no encontrada'
            }), 404

        logger.info(f"Short URL resolved: {short_code}/{custom_names} -> {invitation.get_url_slug()}")

        return jsonify({
            'success': True,
            'url_slug': invitation.get_url_slug(),
            'invitation_id': invitation.id
        })

    except Exception as e:
        logger.error(f"Error resolving short URL: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@short_urls_bp.route('/<short_code>/<path:custom_names>', methods=['GET'])
def redirect_short_url(short_code, custom_names):
    """
    Direct redirect from short URL (fallback if accessed via Flask directly)

    Route: /{code}/{names} -> /invitacion/{url_slug}
    Example: /w3d/Carlos&Maria -> /invitacion/c38918ff

    WHY: Provides clean short URL redirection at root level
         This is a fallback; normally Next.js handles this
    """
    from flask import redirect as flask_redirect

    try:
        # Case-insensitive search
        from sqlalchemy import func
        invitation = Invitation.query.filter(
            func.lower(Invitation.short_code) == func.lower(short_code),
            func.lower(Invitation.custom_names) == func.lower(custom_names)
        ).first()

        if not invitation:
            return jsonify({
                'success': False,
                'error': 'Invitación no encontrada'
            }), 404

        # Perform actual HTTP redirect to invitation page
        return flask_redirect(f'/invitacion/{invitation.get_url_slug()}', code=302)

    except Exception as e:
        logger.error(f"Error redirecting short URL: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
