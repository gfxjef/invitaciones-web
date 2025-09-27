"""
PDF Service Module

WHY: Backend PDF generation using Playwright for perfect rendering
without the limitations of frontend html2canvas (scaling, fonts, etc.)

FEATURES:
- Native browser rendering with Chromium
- Multiple device profiles (iPhone, Android, Desktop)
- Perfect font rendering with Google Fonts
- No scaling/compression issues
- Production-ready with proper error handling
"""

from .pdf_generator import PDFGenerator
from .device_profiles import DEVICE_PROFILES, get_device_profile
from .config import PDF_CONFIG

__all__ = ['PDFGenerator', 'DEVICE_PROFILES', 'get_device_profile', 'PDF_CONFIG']