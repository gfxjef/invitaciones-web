"""
Device Profiles for PDF Generation

WHY: Different devices need different viewport configurations
to ensure accurate rendering that matches real device behavior.

FEATURES:
- Mobile devices (iPhone, Android)
- Tablet configurations
- Desktop profiles
- Custom viewport settings per device
"""

from typing import Dict, Any, Optional

# Device profiles with viewport configurations
DEVICE_PROFILES: Dict[str, Dict[str, Any]] = {
    # === MOBILE DEVICES ===
    'iphone_x': {
        'name': 'iPhone X',
        'category': 'mobile',
        'viewport': {
            'width': 375,
            'height': 812,
        },
        'device_scale_factor': 3,
        'is_mobile': True,
        'has_touch': True,
        'user_agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'pdf_config': {
            'width': 375,
            'height': None,  # Auto-calculated based on content
            'format': None,  # Custom size
            'margin': {'top': '0', 'right': '0', 'bottom': '0', 'left': '0'},
        }
    },

    'iphone_14_pro': {
        'name': 'iPhone 14 Pro',
        'category': 'mobile',
        'viewport': {
            'width': 393,
            'height': 852,
        },
        'device_scale_factor': 3,
        'is_mobile': True,
        'has_touch': True,
        'user_agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'pdf_config': {
            'width': 393,
            'height': None,
            'format': None,
            'margin': {'top': '0', 'right': '0', 'bottom': '0', 'left': '0'},
        }
    },

    'android_standard': {
        'name': 'Android Standard',
        'category': 'mobile',
        'viewport': {
            'width': 360,
            'height': 640,
        },
        'device_scale_factor': 2,
        'is_mobile': True,
        'has_touch': True,
        'user_agent': 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        'pdf_config': {
            'width': 360,
            'height': None,
            'format': None,
            'margin': {'top': '0', 'right': '0', 'bottom': '0', 'left': '0'},
        }
    },

    # === TABLET DEVICES ===
    'ipad': {
        'name': 'iPad',
        'category': 'tablet',
        'viewport': {
            'width': 768,
            'height': 1024,
        },
        'device_scale_factor': 2,
        'is_mobile': False,
        'has_touch': True,
        'user_agent': 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'pdf_config': {
            'width': 768,
            'height': None,
            'format': None,
            'margin': {'top': '10px', 'right': '10px', 'bottom': '10px', 'left': '10px'},
        }
    },

    'ipad_pro': {
        'name': 'iPad Pro 11"',
        'category': 'tablet',
        'viewport': {
            'width': 834,
            'height': 1194,
        },
        'device_scale_factor': 2,
        'is_mobile': False,
        'has_touch': True,
        'user_agent': 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'pdf_config': {
            'width': 834,
            'height': None,
            'format': None,
            'margin': {'top': '15px', 'right': '15px', 'bottom': '15px', 'left': '15px'},
        }
    },

    # === DESKTOP PROFILES ===
    'desktop_standard': {
        'name': 'Desktop Standard',
        'category': 'desktop',
        'viewport': {
            'width': 1920,
            'height': 1080,
        },
        'device_scale_factor': 1,
        'is_mobile': False,
        'has_touch': False,
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        'pdf_config': {
            'format': 'A4',
            'margin': {'top': '20px', 'right': '20px', 'bottom': '20px', 'left': '20px'},
        }
    },

    # === CUSTOM PROFILES FOR INVITATIONS ===
    'invitation_mobile': {
        'name': 'Invitation Mobile Optimized',
        'category': 'mobile',
        'viewport': {
            'width': 375,  # Standard mobile width
            'height': 812,  # iPhone X height - good baseline
        },
        'device_scale_factor': 2,  # Good balance of quality and performance
        'is_mobile': True,
        'has_touch': True,
        'user_agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'pdf_config': {
            'width': 375,
            'height': None,  # Auto-calculated to avoid content cut-off
            'format': None,
            'margin': {'top': '0', 'right': '0', 'bottom': '0', 'left': '0'},
            'print_background': True,
            'prefer_css_page_size': False,
        },
        # Special settings for invitation content
        'wait_for_fonts': True,
        'wait_for_images': True,
        'additional_wait': 2000,  # Extra time for animations/transitions
    },

    'invitation_premium': {
        'name': 'Invitation Premium Quality',
        'category': 'mobile',
        'viewport': {
            'width': 375,
            'height': 812,
        },
        'device_scale_factor': 3,  # Highest quality for premium PDFs
        'is_mobile': True,
        'has_touch': True,
        'user_agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'pdf_config': {
            'width': 375,
            'height': None,
            'format': None,
            'margin': {'top': '0', 'right': '0', 'bottom': '0', 'left': '0'},
            'print_background': True,
            'prefer_css_page_size': False,
        },
        'wait_for_fonts': True,
        'wait_for_images': True,
        'additional_wait': 5000,  # Extra time for perfect rendering
        'quality': 98,
    }
}

# Default device aliases
DEFAULT_DEVICES = {
    'mobile': 'invitation_mobile',
    'tablet': 'ipad',
    'desktop': 'desktop_standard',
    'premium': 'invitation_premium',
}

def get_device_profile(device_type: str) -> Optional[Dict[str, Any]]:
    """
    Get device profile by type or alias

    Args:
        device_type: Device identifier (e.g., 'mobile', 'iphone_x', 'premium')

    Returns:
        Device profile dictionary or None if not found
    """
    # Try direct lookup first
    if device_type in DEVICE_PROFILES:
        return DEVICE_PROFILES[device_type]

    # Try alias lookup
    if device_type in DEFAULT_DEVICES:
        alias_target = DEFAULT_DEVICES[device_type]
        return DEVICE_PROFILES.get(alias_target)

    # Fallback to mobile if not found
    return DEVICE_PROFILES.get('invitation_mobile')

def get_available_devices() -> Dict[str, str]:
    """
    Get list of available device profiles

    Returns:
        Dictionary mapping device keys to human-readable names
    """
    return {key: profile['name'] for key, profile in DEVICE_PROFILES.items()}

def get_devices_by_category(category: str) -> Dict[str, Dict[str, Any]]:
    """
    Get all devices in a specific category

    Args:
        category: Category name ('mobile', 'tablet', 'desktop')

    Returns:
        Dictionary of device profiles in the category
    """
    return {
        key: profile
        for key, profile in DEVICE_PROFILES.items()
        if profile.get('category') == category
    }