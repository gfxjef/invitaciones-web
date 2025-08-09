"""
Utility functions for URL management and validation.

WHY: Centralized utilities for URL operations ensure consistent behavior
across the application and make testing easier.
"""

import re
from urllib.parse import urlparse
from models.invitation_url import InvitationURL
from models.plan import Plan


def validate_plan_url_limits(user_id, invitation_id):
    """
    Validate if user can create more URLs based on their plan limits.
    
    Args:
        user_id: ID of the user
        invitation_id: ID of the invitation
        
    Returns:
        dict: {'can_create': bool, 'current_count': int, 'max_allowed': int, 'plan_name': str}
    """
    from models.user import User
    from models.invitation import Invitation
    from models.order import Order
    
    try:
        # Get user's current plan through their latest order
        user = User.query.get(user_id)
        if not user:
            return {'can_create': False, 'error': 'User not found'}
        
        # Get the invitation to verify ownership and get plan info
        invitation = Invitation.query.filter_by(
            id=invitation_id, 
            user_id=user_id
        ).first()
        
        if not invitation:
            return {'can_create': False, 'error': 'Invitation not found or access denied'}
        
        # Get plan information
        plan = Plan.query.get(invitation.plan_id)
        if not plan:
            return {'can_create': False, 'error': 'Plan not found'}
        
        # Define URL limits based on plan name
        # WHY: Standard plan allows 1 URL, Exclusive allows 3 URLs per invitation
        url_limits = {
            'Standard': 1,
            'Exclusive': 3
        }
        
        max_allowed = url_limits.get(plan.name, 1)  # Default to 1 if plan not recognized
        
        # Count existing URLs for this invitation
        current_count = InvitationURL.query.filter_by(
            invitation_id=invitation_id,
            user_id=user_id
        ).count()
        
        can_create = current_count < max_allowed
        
        return {
            'can_create': can_create,
            'current_count': current_count,
            'max_allowed': max_allowed,
            'plan_name': plan.name
        }
        
    except Exception as e:
        return {'can_create': False, 'error': f'Validation error: {str(e)}'}


def validate_url_format(url):
    """
    Validate if a URL has proper format.
    
    Args:
        url: URL string to validate
        
    Returns:
        dict: {'valid': bool, 'error': str}
    """
    try:
        if not url:
            return {'valid': False, 'error': 'URL cannot be empty'}
        
        # Parse URL
        parsed = urlparse(url)
        
        # Check for scheme and netloc
        if not parsed.scheme:
            return {'valid': False, 'error': 'URL must include protocol (http:// or https://)'}
        
        if not parsed.netloc:
            return {'valid': False, 'error': 'URL must include domain'}
        
        # Check for valid schemes
        if parsed.scheme not in ['http', 'https']:
            return {'valid': False, 'error': 'URL must use http or https protocol'}
        
        # Basic length check
        if len(url) > 500:
            return {'valid': False, 'error': 'URL too long (max 500 characters)'}
        
        return {'valid': True, 'error': None}
        
    except Exception as e:
        return {'valid': False, 'error': f'Invalid URL format: {str(e)}'}


def validate_title_format(title):
    """
    Validate title format for invitation URLs.
    
    Args:
        title: Title string to validate
        
    Returns:
        dict: {'valid': bool, 'error': str}
    """
    if not title:
        return {'valid': False, 'error': 'Title cannot be empty'}
    
    if len(title) < 2:
        return {'valid': False, 'error': 'Title must be at least 2 characters long'}
    
    if len(title) > 100:
        return {'valid': False, 'error': 'Title too long (max 100 characters)'}
    
    # Allow letters, numbers, spaces, and common punctuation
    if not re.match(r'^[a-zA-ZÀ-ÿ0-9\s\-_.,()]+$', title):
        return {'valid': False, 'error': 'Title contains invalid characters'}
    
    return {'valid': True, 'error': None}


def generate_invitation_base_url(invitation_id, base_domain="http://localhost:3000"):
    """
    Generate the base URL for an invitation.
    
    Args:
        invitation_id: ID of the invitation
        base_domain: Base domain for the frontend application
        
    Returns:
        str: Full invitation URL
    """
    return f"{base_domain}/invitacion/{invitation_id}"


def sanitize_user_agent(user_agent):
    """
    Sanitize user agent string for safe storage.
    
    Args:
        user_agent: Raw user agent string
        
    Returns:
        str: Sanitized user agent (max 500 chars)
    """
    if not user_agent:
        return None
    
    # Remove any potentially dangerous characters and limit length
    sanitized = re.sub(r'[<>"\']', '', str(user_agent))
    return sanitized[:500] if len(sanitized) > 500 else sanitized


def get_client_ip(request):
    """
    Extract client IP address from Flask request, considering proxies.
    
    Args:
        request: Flask request object
        
    Returns:
        str: Client IP address
    """
    # Check for forwarded headers (common with load balancers/proxies)
    forwarded_ips = [
        request.headers.get('X-Forwarded-For'),
        request.headers.get('X-Real-IP'),
        request.headers.get('CF-Connecting-IP'),  # Cloudflare
    ]
    
    for ip_header in forwarded_ips:
        if ip_header:
            # X-Forwarded-For can contain multiple IPs, take the first one
            ip = ip_header.split(',')[0].strip()
            if ip:
                return ip
    
    # Fallback to direct remote address
    return request.remote_addr


def is_valid_short_code(short_code):
    """
    Validate short code format.
    
    Args:
        short_code: Code to validate
        
    Returns:
        bool: Whether the code is valid
    """
    if not short_code:
        return False
    
    # Must be exactly 8 characters, alphanumeric, no confusing characters
    pattern = r'^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$'
    return bool(re.match(pattern, short_code))


def build_short_url(short_code, base_domain="http://localhost:5000"):
    """
    Build the full short URL from a short code.
    
    Args:
        short_code: The 8-character short code
        base_domain: Base domain for the backend application
        
    Returns:
        str: Full short URL
    """
    return f"{base_domain}/r/{short_code}"