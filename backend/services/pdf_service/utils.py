"""
PDF Service Utilities

WHY: Helper functions for PDF generation, validation, and common operations
"""

import re
import os
from typing import Dict, Any, Optional, List
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

def validate_url(url: str, allowed_domains: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Validate URL for PDF generation

    Args:
        url: URL to validate
        allowed_domains: Optional list of allowed domains for security

    Returns:
        Dictionary with validation result and details
    """
    result = {
        'valid': False,
        'url': url,
        'error': None,
        'domain': None,
        'scheme': None
    }

    try:
        # Basic URL parsing
        parsed = urlparse(url)
        result['scheme'] = parsed.scheme
        result['domain'] = parsed.netloc

        # Check basic requirements
        if not parsed.scheme or not parsed.netloc:
            result['error'] = 'URL must have scheme and domain'
            return result

        # Check scheme
        if parsed.scheme not in ['http', 'https']:
            result['error'] = 'URL must use HTTP or HTTPS scheme'
            return result

        # Check domain whitelist if provided
        if allowed_domains and parsed.netloc not in allowed_domains:
            result['error'] = f'Domain {parsed.netloc} not in allowed domains'
            return result

        result['valid'] = True
        return result

    except Exception as e:
        result['error'] = f'URL validation error: {str(e)}'
        return result

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe file operations

    Args:
        filename: Original filename

    Returns:
        Safe filename
    """
    # Remove path separators and dangerous characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)

    # Remove control characters
    filename = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', filename)

    # Limit length
    if len(filename) > 100:
        name, ext = os.path.splitext(filename)
        filename = name[:95] + ext

    # Ensure it ends with .pdf
    if not filename.lower().endswith('.pdf'):
        filename += '.pdf'

    return filename

def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human readable format

    Args:
        size_bytes: Size in bytes

    Returns:
        Formatted size string
    """
    if size_bytes == 0:
        return "0B"

    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1

    return f"{size_bytes:.1f}{size_names[i]}"

def estimate_pdf_generation_time(
    device_type: str,
    quality_preset: str,
    content_complexity: str = 'medium'
) -> int:
    """
    Estimate PDF generation time in seconds

    Args:
        device_type: Device profile being used
        quality_preset: Quality preset being used
        content_complexity: Complexity level ('simple', 'medium', 'complex')

    Returns:
        Estimated time in seconds
    """
    base_times = {
        'simple': 5,
        'medium': 10,
        'complex': 20
    }

    quality_multipliers = {
        'draft': 0.5,
        'standard': 1.0,
        'high': 1.5,
        'premium': 2.5
    }

    device_multipliers = {
        'mobile': 1.0,
        'tablet': 1.2,
        'desktop': 1.5,
        'premium': 2.0
    }

    base_time = base_times.get(content_complexity, 10)
    quality_mult = quality_multipliers.get(quality_preset, 1.0)
    device_mult = device_multipliers.get(device_type, 1.0)

    estimated_time = int(base_time * quality_mult * device_mult)
    return max(5, estimated_time)  # Minimum 5 seconds

def build_invitation_url(base_url: str, invitation_id: int, embedded: bool = True) -> str:
    """
    Build invitation URL for PDF generation

    Args:
        base_url: Base application URL
        invitation_id: Invitation ID
        embedded: Whether to use embedded mode

    Returns:
        Complete invitation URL
    """
    # Remove trailing slash from base_url
    base_url = base_url.rstrip('/')

    # Build URL path
    if embedded:
        url = f"{base_url}/invitacion/demo/{invitation_id}?embedded=true"
    else:
        url = f"{base_url}/invitacion/demo/{invitation_id}"

    return url

def extract_invitation_id_from_url(url: str) -> Optional[int]:
    """
    Extract invitation ID from URL

    Args:
        url: Invitation URL

    Returns:
        Invitation ID if found, None otherwise
    """
    try:
        # Pattern to match invitation URLs
        patterns = [
            r'/invitacion/demo/(\d+)',
            r'/invitacion/(\d+)',
            r'invitation_id=(\d+)',
            r'id=(\d+)'
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return int(match.group(1))

        return None

    except Exception:
        return None

def create_error_response(error_message: str, error_code: str = 'PDF_GENERATION_ERROR') -> Dict[str, Any]:
    """
    Create standardized error response

    Args:
        error_message: Error message
        error_code: Error code

    Returns:
        Error response dictionary
    """
    return {
        'success': False,
        'error': {
            'code': error_code,
            'message': error_message
        },
        'data': None
    }

def create_success_response(data: Any, message: str = 'Success') -> Dict[str, Any]:
    """
    Create standardized success response

    Args:
        data: Response data
        message: Success message

    Returns:
        Success response dictionary
    """
    return {
        'success': True,
        'message': message,
        'data': data,
        'error': None
    }