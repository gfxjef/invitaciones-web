"""
Public redirect endpoints for short URLs.

WHY: These endpoints must be at the root level (/r/{code}) rather than under /api
to provide clean, short URLs that are easy to share and remember.
"""

from flask import Blueprint, request, redirect, abort
from models.invitation_url import InvitationURL, VisitLog
from utils.url_utils import is_valid_short_code

redirect_bp = Blueprint('redirect', __name__)


@redirect_bp.route('/r/<string:short_code>')
def redirect_short_url(short_code):
    """
    Public endpoint to redirect short URLs to their original destinations.
    This is the main entry point for all shared short URLs.
    
    Args:
        short_code: 8-character alphanumeric code
        
    Returns:
        HTTP 302 redirect to original URL or 404 if not found
    """
    try:
        # Validate short code format first to avoid unnecessary DB queries
        if not is_valid_short_code(short_code):
            abort(404)
        
        # Find active URL with this short code
        invitation_url = InvitationURL.query.filter_by(
            short_code=short_code,
            is_active=True
        ).first()
        
        if not invitation_url:
            abort(404)
        
        # Track the visit asynchronously to avoid slowing down redirect
        try:
            # Create detailed visit log
            visit_log = VisitLog.create_visit_log(invitation_url.id, request)
            
            # Update visit counter on the URL
            invitation_url.increment_visit_count()
            
        except Exception as e:
            # Log the error but don't fail the redirect
            # WHY: User experience is more important than perfect analytics
            print(f"Warning: Failed to track visit for {short_code}: {str(e)}")
        
        # Perform the redirect with 302 (temporary redirect)
        # WHY: 302 allows us to change the destination later if needed
        return redirect(invitation_url.original_url, code=302)
        
    except Exception as e:
        print(f"Error in redirect_short_url for {short_code}: {str(e)}")
        abort(404)


@redirect_bp.route('/r/<string:short_code>/preview')
def preview_short_url(short_code):
    """
    Preview endpoint that shows information about where a short URL leads
    without actually redirecting. Useful for security-conscious users.
    
    Args:
        short_code: 8-character alphanumeric code
        
    Returns:
        JSON with URL information or 404 if not found
    """
    try:
        if not is_valid_short_code(short_code):
            abort(404)
        
        invitation_url = InvitationURL.query.filter_by(
            short_code=short_code,
            is_active=True
        ).first()
        
        if not invitation_url:
            abort(404)
        
        # Return basic information without tracking as a visit
        return {
            'success': True,
            'short_code': short_code,
            'title': invitation_url.title,
            'destination': invitation_url.original_url,
            'visit_count': invitation_url.visit_count,
            'created_at': invitation_url.created_at.isoformat(),
            'warning': 'This is a preview. Click the original link to visit the invitation.'
        }, 200
        
    except Exception as e:
        print(f"Error in preview_short_url for {short_code}: {str(e)}")
        abort(404)


@redirect_bp.route('/r/<string:short_code>/qr')
def get_qr_code(short_code):
    """
    Serve the QR code image for a short URL.
    
    Args:
        short_code: 8-character alphanumeric code
        
    Returns:
        QR code image file or 404 if not found
    """
    try:
        from flask import send_file
        import os
        
        if not is_valid_short_code(short_code):
            abort(404)
        
        invitation_url = InvitationURL.query.filter_by(
            short_code=short_code,
            is_active=True
        ).first()
        
        if not invitation_url or not invitation_url.qr_code_path:
            abort(404)
        
        # Check if QR code file exists
        if not os.path.exists(invitation_url.qr_code_path):
            # Try to regenerate QR code
            backend_domain = os.getenv('BACKEND_URL', 'http://localhost:5000')
            qr_path = invitation_url.generate_qr_code(backend_domain)
            
            if not qr_path or not os.path.exists(qr_path):
                abort(404)
        
        # Serve the QR code image
        return send_file(
            invitation_url.qr_code_path,
            mimetype='image/png',
            as_attachment=False,
            download_name=f'qr_{short_code}.png'
        )
        
    except Exception as e:
        print(f"Error serving QR code for {short_code}: {str(e)}")
        abort(404)


# ===== ERROR HANDLERS =====

@redirect_bp.errorhandler(404)
def not_found(error):
    """
    Custom 404 handler for redirect endpoints.
    Returns a more user-friendly message for short URL not found.
    """
    return {
        'success': False,
        'error': 'Short URL not found or has expired',
        'message': 'The link you followed may be broken, expired, or the invitation may no longer be available.'
    }, 404


@redirect_bp.errorhandler(500)
def internal_error(error):
    """Handle internal server errors for redirect endpoints."""
    return {
        'success': False,
        'error': 'Service temporarily unavailable',
        'message': 'Please try again in a few moments.'
    }, 500