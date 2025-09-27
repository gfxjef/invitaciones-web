"""
PDF Generation API Endpoints

WHY: Backend API for generating PDFs using Playwright instead of
frontend html2canvas. Solves scaling, font, and rendering issues.

ENDPOINTS:
- POST /api/pdf/generate - Generate PDF from invitation URL
- GET /api/pdf/devices - Get available device profiles
- GET /api/pdf/presets - Get available quality presets
"""

from flask import Blueprint, request, jsonify, make_response, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import asyncio
import logging
import time
import os
from typing import Dict, Any, Optional

# Configure logging first
logger = logging.getLogger(__name__)

# Import our PDF service
try:
    from services.pdf_service.pdf_generator import PDFGenerator, generate_invitation_pdf_sync, PLAYWRIGHT_AVAILABLE
    from services.pdf_service.device_profiles import get_device_profile, get_available_devices, DEVICE_PROFILES
    from services.pdf_service.config import QUALITY_PRESETS, PDF_CONFIG
    from services.pdf_service.utils import (
        validate_url, sanitize_filename, format_file_size,
        estimate_pdf_generation_time, build_invitation_url,
        create_error_response, create_success_response
    )
    PDF_SERVICE_AVAILABLE = True
except ImportError as e:
    PDF_SERVICE_AVAILABLE = False
    PLAYWRIGHT_AVAILABLE = False
    logger.error(f"PDF Service import failed: {e}")
    # Create dummy functions
    def create_error_response(msg, code): return {'error': msg, 'code': code}
    def create_success_response(data): return {'data': data}

# Create blueprint
pdf_bp = Blueprint('pdf', __name__, url_prefix='/api/pdf')

@pdf_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_pdf():
    """
    Generate PDF from invitation URL

    Request Body:
    {
        "url": "http://localhost:3000/invitacion/demo/9?embedded=true",
        "device_type": "mobile", // Optional, default: "invitation_mobile"
        "quality": "high",        // Optional, default: "standard"
        "filename": "my-invitation.pdf", // Optional
        "options": {             // Optional custom PDF options
            "format": "A4",
            "margin": {"top": "10px"}
        }
    }

    OR for invitation ID:
    {
        "invitation_id": 9,
        "device_type": "mobile",
        "quality": "high"
    }

    Returns:
        PDF file as binary response
    """
    # Check if PDF service is available
    if not PDF_SERVICE_AVAILABLE or not PLAYWRIGHT_AVAILABLE:
        return jsonify(create_error_response(
            "PDF service not available. Please install Playwright: pip install playwright && playwright install chromium",
            "PDF_SERVICE_UNAVAILABLE"
        )), 503

    try:
        # Get user identity
        current_user_id = get_jwt_identity()
        logger.info(f"PDF generation request from user {current_user_id}")

        # Parse request data
        data = request.get_json() or {}

        # Extract parameters
        url = data.get('url')
        invitation_id = data.get('invitation_id')
        device_type = data.get('device_type', 'invitation_mobile')
        quality = data.get('quality', 'standard')
        filename = data.get('filename')
        custom_options = data.get('options', {})

        # Validate input
        if not url and not invitation_id:
            return jsonify(create_error_response(
                "Either 'url' or 'invitation_id' is required",
                "MISSING_PARAMETERS"
            )), 400

        # Build URL if invitation_id provided
        if invitation_id and not url:
            base_url = request.host_url.rstrip('/')
            # Replace backend port with frontend port for PDF generation
            if ':5000' in base_url:
                base_url = base_url.replace(':5000', ':3000')
            url = build_invitation_url(base_url, invitation_id, embedded=True)

        # Validate URL
        allowed_domains = ['localhost', '127.0.0.1', 'localhost:3000', '127.0.0.1:3000']  # Add production domains as needed
        url_validation = validate_url(url, allowed_domains)
        if not url_validation['valid']:
            return jsonify(create_error_response(
                f"Invalid URL: {url_validation['error']}",
                "INVALID_URL"
            )), 400

        # Validate device type
        device_profile = get_device_profile(device_type)
        if not device_profile:
            return jsonify(create_error_response(
                f"Invalid device type: {device_type}",
                "INVALID_DEVICE_TYPE"
            )), 400

        # Validate quality preset
        if quality not in QUALITY_PRESETS:
            return jsonify(create_error_response(
                f"Invalid quality preset: {quality}",
                "INVALID_QUALITY_PRESET"
            )), 400

        # Generate filename if not provided
        if not filename:
            timestamp = int(time.time())
            filename = f"invitation-{invitation_id or 'demo'}-{timestamp}.pdf"

        filename = sanitize_filename(filename)

        logger.info(f"Generating PDF: URL={url}, Device={device_type}, Quality={quality}")

        # Estimate generation time for user feedback
        estimated_time = estimate_pdf_generation_time(device_type, quality, 'medium')
        logger.info(f"Estimated generation time: {estimated_time} seconds")

        # Generate PDF
        start_time = time.time()

        try:
            pdf_bytes = generate_invitation_pdf_sync(url, device_type, quality)

            if not pdf_bytes:
                return jsonify(create_error_response(
                    "PDF generation returned empty content",
                    "EMPTY_PDF_CONTENT"
                )), 500

        except Exception as pdf_error:
            logger.error(f"PDF generation failed: {pdf_error}")
            return jsonify(create_error_response(
                f"PDF generation failed: {str(pdf_error)}",
                "PDF_GENERATION_FAILED"
            )), 500

        generation_time = time.time() - start_time
        file_size = format_file_size(len(pdf_bytes))

        logger.info(f"PDF generated successfully in {generation_time:.2f}s, Size: {file_size}")

        # Create response with PDF content
        response = make_response(pdf_bytes)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
        response.headers['Content-Length'] = len(pdf_bytes)

        # Add custom headers for debugging
        response.headers['X-PDF-Generation-Time'] = f"{generation_time:.2f}s"
        response.headers['X-PDF-Device-Type'] = device_type
        response.headers['X-PDF-Quality'] = quality
        response.headers['X-PDF-Size'] = file_size

        return response

    except Exception as e:
        logger.error(f"Unexpected error in PDF generation endpoint: {e}")
        return jsonify(create_error_response(
            f"Internal server error: {str(e)}",
            "INTERNAL_SERVER_ERROR"
        )), 500

@pdf_bp.route('/devices', methods=['GET'])
def get_devices():
    """
    Get available device profiles

    Returns:
        JSON with available device profiles
    """
    try:
        devices = get_available_devices()

        # Group devices by category for better organization
        categorized_devices = {}
        for device_key, device_name in devices.items():
            device_profile = DEVICE_PROFILES[device_key]
            category = device_profile.get('category', 'other')

            if category not in categorized_devices:
                categorized_devices[category] = {}

            categorized_devices[category][device_key] = {
                'name': device_name,
                'viewport': device_profile['viewport'],
                'is_mobile': device_profile.get('is_mobile', False),
                'recommended_for': _get_device_recommendations(device_key)
            }

        return jsonify(create_success_response({
            'devices': devices,
            'categorized': categorized_devices,
            'recommended': {
                'mobile': 'invitation_mobile',
                'high_quality': 'invitation_premium',
                'tablet': 'ipad',
                'desktop': 'desktop_standard'
            }
        }))

    except Exception as e:
        logger.error(f"Error fetching device profiles: {e}")
        return jsonify(create_error_response(
            f"Failed to fetch device profiles: {str(e)}",
            "DEVICE_FETCH_ERROR"
        )), 500

@pdf_bp.route('/presets', methods=['GET'])
def get_quality_presets():
    """
    Get available quality presets

    Returns:
        JSON with quality presets and their configurations
    """
    try:
        # Create user-friendly preset descriptions
        preset_descriptions = {
            'draft': {
                'name': 'Draft Quality',
                'description': 'Fast generation, lower quality',
                'recommended_for': 'Quick previews and testing',
                'estimated_time': '5-10 seconds'
            },
            'standard': {
                'name': 'Standard Quality',
                'description': 'Balanced quality and speed',
                'recommended_for': 'Most use cases',
                'estimated_time': '10-15 seconds'
            },
            'high': {
                'name': 'High Quality',
                'description': 'High quality rendering',
                'recommended_for': 'Final versions and sharing',
                'estimated_time': '15-25 seconds'
            },
            'premium': {
                'name': 'Premium Quality',
                'description': 'Maximum quality, slower generation',
                'recommended_for': 'Print-ready and professional use',
                'estimated_time': '25-40 seconds'
            }
        }

        # Combine technical specs with descriptions
        detailed_presets = {}
        for preset_key, preset_config in QUALITY_PRESETS.items():
            detailed_presets[preset_key] = {
                **preset_descriptions.get(preset_key, {'name': preset_key.title()}),
                'config': preset_config
            }

        return jsonify(create_success_response({
            'presets': detailed_presets,
            'default': 'standard',
            'recommended_by_use_case': {
                'testing': 'draft',
                'sharing': 'high',
                'printing': 'premium',
                'general': 'standard'
            }
        }))

    except Exception as e:
        logger.error(f"Error fetching quality presets: {e}")
        return jsonify(create_error_response(
            f"Failed to fetch quality presets: {str(e)}",
            "PRESET_FETCH_ERROR"
        )), 500

@pdf_bp.route('/debug', methods=['GET'])
def debug_pdf_service():
    """Debug PDF service imports and status"""
    debug_info = {
        'initial_checks': {
            'PDF_SERVICE_AVAILABLE': PDF_SERVICE_AVAILABLE,
            'PLAYWRIGHT_AVAILABLE': PLAYWRIGHT_AVAILABLE
        }
    }

    # Test imports in real time
    try:
        from services.pdf_service.pdf_generator import PDFGenerator, PLAYWRIGHT_AVAILABLE as RUNTIME_PLAYWRIGHT
        debug_info['runtime_checks'] = {
            'PDFGenerator_import': True,
            'RUNTIME_PLAYWRIGHT_AVAILABLE': RUNTIME_PLAYWRIGHT
        }

        # Try actual playwright import
        try:
            from playwright.async_api import async_playwright
            debug_info['runtime_checks']['playwright_direct_import'] = True
        except ImportError as e:
            debug_info['runtime_checks']['playwright_direct_import'] = f"Error: {e}"
    except ImportError as e:
        debug_info['runtime_checks'] = {'error': str(e)}

    return jsonify(create_success_response(debug_info))

@pdf_bp.route('/status', methods=['GET'])
def get_pdf_service_status():
    """
    Get PDF service status and configuration

    Returns:
        JSON with service status
    """
    try:
        if not PDF_SERVICE_AVAILABLE:
            status = {
                'service': 'PDF Generation Service',
                'status': 'unavailable',
                'version': '1.0.0',
                'engine': 'Playwright + Chromium',
                'error': 'PDF service not installed',
                'installation_instructions': 'pip install playwright && playwright install chromium'
            }
        elif not PLAYWRIGHT_AVAILABLE:
            status = {
                'service': 'PDF Generation Service',
                'status': 'partially_available',
                'version': '1.0.0',
                'engine': 'Playwright + Chromium',
                'error': 'Playwright not installed',
                'installation_instructions': 'pip install playwright && playwright install chromium'
            }
        else:
            status = {
                'service': 'PDF Generation Service',
                'status': 'active',
                'version': '1.0.0',
                'engine': 'Playwright + Chromium',
                'config': {
                    'headless': PDF_CONFIG['headless'],
                    'timeout': PDF_CONFIG['timeout'],
                    'default_device': 'invitation_mobile',
                    'default_quality': 'standard'
                },
                'capabilities': [
                    'Native browser rendering',
                    'Google Fonts support',
                    'Perfect CSS rendering',
                    'Multiple device profiles',
                    'Quality presets',
                    'Custom PDF options'
                ]
            }

        return jsonify(create_success_response(status))

    except Exception as e:
        logger.error(f"Error fetching PDF service status: {e}")
        return jsonify(create_error_response(
            f"Failed to fetch service status: {str(e)}",
            "STATUS_FETCH_ERROR"
        )), 500

# Helper functions
def _get_device_recommendations(device_key: str) -> str:
    """Get recommendation text for device"""
    recommendations = {
        'invitation_mobile': 'Perfect for mobile invitations with optimal quality/speed balance',
        'invitation_premium': 'Best quality for professional and print-ready invitations',
        'iphone_x': 'Standard iPhone X dimensions for iOS users',
        'android_standard': 'Standard Android dimensions for Android users',
        'ipad': 'Tablet format for larger displays',
        'desktop_standard': 'Desktop format for web viewing'
    }
    return recommendations.get(device_key, 'General purpose device profile')

# Error handlers for the blueprint
@pdf_bp.errorhandler(404)
def pdf_not_found(error):
    return jsonify(create_error_response(
        "PDF endpoint not found",
        "ENDPOINT_NOT_FOUND"
    )), 404

@pdf_bp.errorhandler(405)
def pdf_method_not_allowed(error):
    return jsonify(create_error_response(
        "Method not allowed for PDF endpoint",
        "METHOD_NOT_ALLOWED"
    )), 405

@pdf_bp.errorhandler(500)
def pdf_internal_error(error):
    logger.error(f"Internal error in PDF service: {error}")
    return jsonify(create_error_response(
        "Internal PDF service error",
        "INTERNAL_PDF_ERROR"
    )), 500