"""
PDF Service Configuration

WHY: Centralized configuration for PDF generation settings,
timeouts, quality options, and browser configurations.
"""

import os
from typing import Dict, Any

# PDF Generation Configuration
PDF_CONFIG: Dict[str, Any] = {
    # Browser Configuration
    'headless': True,
    'timeout': 60000,  # 60 seconds
    'wait_for_network_idle': True,
    'network_idle_timeout': 5000,  # 5 seconds

    # PDF Quality Settings
    'default_quality': 95,
    'high_quality': 98,
    'fast_quality': 80,

    # Page Load Settings
    'wait_until': 'networkidle0',  # Wait until no network activity
    'font_load_timeout': 10000,    # Wait for fonts to load
    'image_load_timeout': 15000,   # Wait for images to load

    # Output Settings
    'format': 'A4',
    'print_background': True,
    'prefer_css_page_size': False,
    'display_header_footer': False,

    # Browser Args for Production
    'browser_args': [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--allow-running-insecure-content',
        '--disable-features=VizDisplayCompositor'
    ],

    # Development Settings
    'debug_mode': os.getenv('FLASK_DEBUG', 'false').lower() == 'true',
    'save_screenshots': False,  # For debugging
    'screenshot_path': '/tmp/pdf_screenshots/',
}

# Device-specific PDF configurations
DEVICE_PDF_CONFIG = {
    'mobile': {
        'format': None,  # Custom size based on viewport
        'width': 375,
        'height': None,  # Auto-calculated
        'margin': {'top': '0', 'right': '0', 'bottom': '0', 'left': '0'},
    },
    'tablet': {
        'format': None,
        'width': 768,
        'height': None,
        'margin': {'top': '10px', 'right': '10px', 'bottom': '10px', 'left': '10px'},
    },
    'desktop': {
        'format': 'A4',
        'margin': {'top': '20px', 'right': '20px', 'bottom': '20px', 'left': '20px'},
    }
}

# Quality presets for different use cases
QUALITY_PRESETS = {
    'draft': {
        'quality': 70,
        'timeout': 30000,
        'wait_for_fonts': False,
        'wait_for_react': False,
        'wait_for_stability': False,
        'additional_wait': 1000,
    },
    'standard': {
        'quality': 85,
        'timeout': 45000,
        'wait_for_fonts': True,
        'wait_for_react': True,
        'wait_for_stability': True,
        'additional_wait': 2000,
    },
    'high': {
        'quality': 95,
        'timeout': 75000,  # Increased for React content
        'wait_for_fonts': True,
        'wait_for_images': True,
        'wait_for_react': True,
        'wait_for_stability': True,
        'additional_wait': 5000,  # Extra wait for React hydration
    },
    'premium': {
        'quality': 98,
        'timeout': 90000,
        'wait_for_fonts': True,
        'wait_for_images': True,
        'wait_for_react': True,
        'wait_for_stability': True,
        'additional_wait': 7000,  # Maximum wait for perfect rendering
    }
}