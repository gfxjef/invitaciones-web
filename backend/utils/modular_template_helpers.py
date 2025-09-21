"""
Modular Template Helper Functions

WHY: Funciones utilitarias para extraer y organizar datos de InvitationData
para las secciones modulares. Centraliza la lógica de mapeo de datos.

WHAT: Funciones helper que transforman datos de base de datos en objetos
listos para el frontend React y las secciones modulares.
"""

from typing import Dict, Any, List, Optional
from models.invitation_data import InvitationData
from models.invitation_media import InvitationMedia
from models.invitation_event import InvitationEvent
import json


def get_invitation_modular_data(invitation_id: int) -> Dict[str, Any]:
    """
    Get all modular template data for an invitation organized by section

    Args:
        invitation_id: ID of the invitation

    Returns:
        Dictionary organized by section with all necessary props
    """
    # Get all custom data fields
    data_dict = InvitationData.get_invitation_data_dict(invitation_id)

    # Get media files
    media_files = InvitationMedia.query.filter_by(invitation_id=invitation_id).all()

    # Get events
    events = InvitationEvent.query.filter_by(invitation_id=invitation_id).all()

    # Organize data by sections
    return {
        'hero': extract_hero_data(data_dict),
        'welcome': extract_welcome_data(data_dict),
        'couple': extract_couple_data(data_dict),
        'countdown': extract_countdown_data(data_dict),
        'story': extract_story_data(data_dict),
        'video': extract_video_data(data_dict),
        'gallery': extract_gallery_data(data_dict, media_files),
        'footer': extract_footer_data(data_dict),
        'config': extract_section_config(data_dict)
    }

def extract_hero_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Hero section - raw data only, frontend handles defaults"""
    couple = data_dict.get('couple', {})
    event = data_dict.get('event', {})
    gallery = data_dict.get('gallery', {})

    # Build couple names from raw data only
    bride_name = get_field_value(couple, 'couple_bride_name')
    groom_name = get_field_value(couple, 'couple_groom_name')
    couple_names = f"{bride_name} & {groom_name}" if bride_name and groom_name else None

    # Format event date from raw data only
    event_date = get_field_value(event, 'event_date')
    if event_date and isinstance(event_date, str) and 'T' in event_date:
        # Convert ISO format to readable format
        from datetime import datetime
        try:
            dt = datetime.fromisoformat(event_date.replace('Z', '+00:00'))
            event_date = dt.strftime('%d %B, %Y')
        except:
            pass

    return {
        'coupleNames': couple_names,
        'eventDate': event_date,
        'eventLocation': get_field_value(event, 'event_venue_city'),
        'heroImageUrl': get_field_value(gallery, 'gallery_hero_image')
    }

def extract_welcome_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Welcome section - raw data only, frontend handles defaults"""
    welcome = data_dict.get('welcome', {})

    return {
        'bannerImageUrl': get_field_value(welcome, 'welcome_banner_image'),
        'couplePhotoUrl': get_field_value(welcome, 'welcome_couple_photo'),
        'welcomeText': get_field_value(welcome, 'welcome_text_custom'),
        'title': get_field_value(welcome, 'welcome_title_custom'),
        'description': get_field_value(welcome, 'welcome_description')
    }

def extract_couple_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Couple section - raw data only, frontend handles defaults"""
    couple = data_dict.get('couple', {})
    social = data_dict.get('social', {})

    return {
        'sectionTitle': get_field_value(couple, 'couple_section_title'),
        'sectionSubtitle': get_field_value(couple, 'couple_section_subtitle'),
        'brideData': {
            'imageUrl': get_field_value(couple, 'couple_bride_photo'),
            'name': get_field_value(couple, 'couple_bride_name'),
            'role': get_field_value(couple, 'couple_bride_role'),
            'description': get_field_value(couple, 'couple_bride_description'),
            'socialLinks': {
                'facebook': get_field_value(social, 'social_facebook'),
                'twitter': get_field_value(social, 'social_twitter'),
                'instagram': get_field_value(social, 'social_instagram')
            }
        },
        'groomData': {
            'imageUrl': get_field_value(couple, 'couple_groom_photo'),
            'name': get_field_value(couple, 'couple_groom_name'),
            'role': get_field_value(couple, 'couple_groom_role'),
            'description': get_field_value(couple, 'couple_groom_description'),
            'socialLinks': {
                'facebook': get_field_value(social, 'social_facebook'),
                'twitter': get_field_value(social, 'social_twitter'),
                'instagram': get_field_value(social, 'social_instagram')
            }
        }
    }

def extract_countdown_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Countdown section - raw data only, frontend handles defaults"""
    countdown = data_dict.get('countdown', {})
    event = data_dict.get('event', {})

    # Get wedding date for countdown
    wedding_date = get_field_value(countdown, 'countdown_target_date')
    if not wedding_date:
        wedding_date = get_field_value(event, 'event_date')

    return {
        'weddingDate': wedding_date,
        'backgroundImageUrl': get_field_value(countdown, 'countdown_background_image'),
        'preTitle': get_field_value(countdown, 'countdown_pretitle'),
        'title': get_field_value(countdown, 'countdown_title')
    }

def extract_story_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Story section - raw data only, frontend handles defaults"""
    story = data_dict.get('story', {})
    couple = data_dict.get('couple', {})

    # Build section subtitle from couple names if available
    bride_name = get_field_value(couple, 'couple_bride_name')
    groom_name = get_field_value(couple, 'couple_groom_name')
    section_subtitle = f"{bride_name.upper()} & {groom_name.upper()}" if bride_name and groom_name else None

    # Get story moments from raw data only
    story_moments = get_field_value(story, 'story_moments')
    if isinstance(story_moments, str):
        try:
            story_moments = json.loads(story_moments)
        except:
            story_moments = None

    return {
        'sectionSubtitle': section_subtitle,
        'sectionTitle': get_field_value(story, 'story_section_title'),
        'storyMoments': story_moments
    }

def extract_video_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Video section - raw data only, frontend handles defaults"""
    video = data_dict.get('video', {})

    return {
        'backgroundImageUrl': get_field_value(video, 'video_background_image'),
        'videoEmbedUrl': get_field_value(video, 'video_embed_url'),
        'preTitle': get_field_value(video, 'video_pretitle'),
        'title': get_field_value(video, 'video_title')
    }

def extract_gallery_data(data_dict: Dict[str, Any], media_files: List[Any]) -> Dict[str, Any]:
    """Extract data for Gallery section"""
    gallery = data_dict.get('gallery', {})

    # Get gallery images from custom data first
    gallery_photos = get_field_value(gallery, 'gallery_photos_urls', [])
    if isinstance(gallery_photos, str):
        try:
            gallery_photos = json.loads(gallery_photos)
        except:
            gallery_photos = []

    # If no custom gallery photos, use media files
    if not gallery_photos and media_files:
        gallery_photos = []
        for i, media in enumerate(media_files):
            gallery_photos.append({
                'id': media.id,
                'url': media.file_path,
                'alt': media.title or f'Wedding photo {i + 1}',
                'category': media.media_type or 'ceremony'
            })

    # Get gallery categories
    gallery_categories = get_field_value(gallery, 'gallery_categories', [])
    if isinstance(gallery_categories, str):
        try:
            gallery_categories = json.loads(gallery_categories)
        except:
            gallery_categories = []

    # Default categories if none exist
    if not gallery_categories:
        gallery_categories = [
            {"key": "all", "label": "All Photos"},
            {"key": "ceremony", "label": "Ceremony"},
            {"key": "party", "label": "Party"},
            {"key": "couple", "label": "Couple"}
        ]

    return {
        'sectionSubtitle': get_field_value(gallery, 'gallery_section_subtitle'),
        'sectionTitle': get_field_value(gallery, 'gallery_section_title'),
        'galleryImages': gallery_photos,
        'categories': gallery_categories
    }

def extract_footer_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Footer section - raw data only, frontend handles defaults"""
    couple = data_dict.get('couple', {})
    event = data_dict.get('event', {})
    footer = data_dict.get('footer', {})

    # Build couple names from raw data only
    bride_name = get_field_value(couple, 'couple_bride_name')
    groom_name = get_field_value(couple, 'couple_groom_name')
    couple_names = f"{bride_name} & {groom_name}" if bride_name and groom_name else None

    # Format event date from raw data only
    event_date = get_field_value(event, 'event_date')
    if event_date and isinstance(event_date, str) and 'T' in event_date:
        from datetime import datetime
        try:
            dt = datetime.fromisoformat(event_date.replace('Z', '+00:00'))
            event_date = dt.strftime('%d %B, %Y').upper()
        except:
            event_date = event_date.upper() if event_date else None
    elif event_date:
        event_date = str(event_date).upper()

    return {
        'coupleNames': couple_names,
        'eventDate': event_date,
        'eventLocation': get_field_value(event, 'event_venue_city'),
        'copyrightText': get_field_value(footer, 'footer_copyright_text')
    }

def extract_section_config(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract section configuration and styling"""
    section = data_dict.get('section', {})
    template = data_dict.get('template', {})

    return {
        'sections_enabled': {
            'hero': get_field_value(section, 'section_hero_enabled', True),
            'welcome': get_field_value(section, 'section_welcome_enabled', True),
            'couple': get_field_value(section, 'section_couple_enabled', True),
            'countdown': get_field_value(section, 'section_countdown_enabled', True),
            'story': get_field_value(section, 'section_story_enabled', True),
            'video': get_field_value(section, 'section_video_enabled', True),
            'gallery': get_field_value(section, 'section_gallery_enabled', True),
            'footer': get_field_value(section, 'section_footer_enabled', True)
        },
        'colors': {
            'primary': get_field_value(template, 'template_primary_color', '#d97706'),
            'secondary': get_field_value(template, 'template_secondary_color', '#374151'),
            'accent': get_field_value(template, 'template_accent_color', '#fbbf24')
        },
        'custom_css': get_field_value(template, 'template_custom_css', '')
    }

def get_field_value(category_data: Dict[str, Any], field_name: str, default: Any = None) -> Any:
    """
    Helper to safely extract field value from category data

    Args:
        category_data: Dictionary containing field data for a category
        field_name: Name of the field to extract
        default: Default value if field not found

    Returns:
        Field value or default
    """
    if field_name in category_data:
        field_info = category_data[field_name]
        if isinstance(field_info, dict) and 'value' in field_info:
            return field_info['value']
        return field_info
    return default

def get_modular_template_props(invitation_id: int, sections_config: Dict[str, str]) -> Dict[str, Any]:
    """
    Get props for all sections based on sections_config

    Args:
        invitation_id: ID of the invitation
        sections_config: Dictionary mapping section types to section keys

    Returns:
        Dictionary with props for each configured section
    """
    # Get all modular data
    modular_data = get_invitation_modular_data(invitation_id)

    # Build props for each configured section
    section_props = {}

    for section_type, section_key in sections_config.items():
        if section_type in modular_data:
            section_props[section_type] = modular_data[section_type]

    return {
        'section_props': section_props,
        'config': modular_data.get('config', {})
    }