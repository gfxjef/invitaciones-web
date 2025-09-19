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
    """Extract data for Hero section"""
    general = data_dict.get('general', {})
    couple = data_dict.get('couple', {})
    event = data_dict.get('event', {})
    gallery = data_dict.get('gallery', {})

    # Build couple names
    bride_name = get_field_value(couple, 'couple_bride_name', 'María')
    groom_name = get_field_value(couple, 'couple_groom_name', 'Carlos')
    couple_names = f"{bride_name} & {groom_name}"

    # Format event date
    event_date = get_field_value(event, 'event_date', '15 December, 2024')
    if isinstance(event_date, str) and 'T' in event_date:
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
        'eventLocation': get_field_value(event, 'event_venue_city', 'New York'),
        'heroImageUrl': get_field_value(gallery, 'gallery_hero_image',
            'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=1260'),
        'navigationItems': [
            { 'href': '#home', 'label': 'Home' },
            { 'href': '#couple', 'label': 'Couple' },
            { 'href': '#story', 'label': 'Story' },
            { 'href': '#events', 'label': 'Events' },
            { 'href': '#gallery', 'label': 'Gallery' },
            { 'href': '#rsvp', 'label': 'R.S.V.P' }
        ]
    }

def extract_welcome_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Welcome section"""
    welcome = data_dict.get('welcome', {})

    return {
        'bannerImageUrl': get_field_value(welcome, 'welcome_banner_image',
            'https://i.imgur.com/svWa52m.png'),
        'couplePhotoUrl': get_field_value(welcome, 'welcome_couple_photo',
            'https://i.imgur.com/OFaT2vQ.png'),
        'welcomeText': get_field_value(welcome, 'welcome_text_custom', 'HELLO & WELCOME'),
        'title': get_field_value(welcome, 'welcome_title_custom', "We're getting married!"),
        'description': get_field_value(welcome, 'welcome_description',
            "Today and always, beyond tomorrow, I need you beside me, always as my best friend, lover and forever soul mate.")
    }

def extract_couple_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Couple section"""
    couple = data_dict.get('couple', {})
    social = data_dict.get('social', {})

    return {
        'sectionTitle': 'Happy Couple',
        'sectionSubtitle': 'BRIDE & GROOM',
        'brideData': {
            'imageUrl': get_field_value(couple, 'couple_bride_photo',
                'https://i.imgur.com/u1wA4oo.png'),
            'name': get_field_value(couple, 'couple_bride_name', 'María'),
            'role': get_field_value(couple, 'couple_bride_role', 'The Bride'),
            'description': get_field_value(couple, 'couple_bride_description',
                'A beautiful soul with a heart full of love and dreams.'),
            'socialLinks': {
                'facebook': get_field_value(social, 'social_facebook', '#'),
                'twitter': get_field_value(social, 'social_twitter', '#'),
                'instagram': get_field_value(social, 'social_instagram', '#')
            }
        },
        'groomData': {
            'imageUrl': get_field_value(couple, 'couple_groom_photo',
                'https://i.imgur.com/qL42vPA.png'),
            'name': get_field_value(couple, 'couple_groom_name', 'Carlos'),
            'role': get_field_value(couple, 'couple_groom_role', 'The Groom'),
            'description': get_field_value(couple, 'couple_groom_description',
                'A loving partner ready to start this new journey together.'),
            'socialLinks': {
                'facebook': get_field_value(social, 'social_facebook', '#'),
                'twitter': get_field_value(social, 'social_twitter', '#'),
                'instagram': get_field_value(social, 'social_instagram', '#')
            }
        }
    }

def extract_countdown_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Countdown section"""
    countdown = data_dict.get('countdown', {})
    event = data_dict.get('event', {})

    # Get wedding date for countdown
    wedding_date = get_field_value(countdown, 'countdown_target_date')
    if not wedding_date:
        wedding_date = get_field_value(event, 'event_date')

    return {
        'weddingDate': wedding_date,
        'backgroundImageUrl': get_field_value(countdown, 'countdown_background_image',
            'https://i.imgur.com/7p4m1iH.png'),
        'preTitle': get_field_value(countdown, 'countdown_pretitle', 'WE WILL BECOME A FAMILY IN'),
        'title': get_field_value(countdown, 'countdown_title', "We're getting married in")
    }

def extract_story_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Story section"""
    story = data_dict.get('story', {})
    couple = data_dict.get('couple', {})

    # Build section subtitle from couple names
    bride_name = get_field_value(couple, 'couple_bride_name', 'MARY')
    groom_name = get_field_value(couple, 'couple_groom_name', 'BRIAN')
    section_subtitle = f"{bride_name.upper()} & {groom_name.upper()}"

    # Get story moments
    story_moments = get_field_value(story, 'story_moments', [])
    if isinstance(story_moments, str):
        try:
            story_moments = json.loads(story_moments)
        except:
            story_moments = []

    # Ensure we have default story moments if none exist
    if not story_moments:
        story_moments = [
            {
                "date": "JULY 20, 2015",
                "title": "First time we meet",
                "description": "First time we meet viverra tristique duis vitae diam the nesumen nivamus aestan ateuene artines finibus.",
                "imageUrl": "https://i.imgur.com/83AAp8B.png"
            },
            {
                "date": "AUGUST 1, 2016",
                "title": "Our First Date",
                "description": "A wonderful evening under the stars that marked the beginning of our journey together.",
                "imageUrl": "https://images.pexels.com/photos/3784433/pexels-photo-3784433.jpeg?auto=compress&cs=tinysrgb&w=1260"
            },
            {
                "date": "JUNE 25, 2022",
                "title": "The Proposal",
                "description": "The moment when everything became perfect and our future together was sealed with a beautiful 'Yes!'",
                "imageUrl": "https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=1260"
            }
        ]

    return {
        'sectionSubtitle': section_subtitle,
        'sectionTitle': 'Our Love Story',
        'storyMoments': story_moments
    }

def extract_video_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Video section"""
    video = data_dict.get('video', {})

    return {
        'backgroundImageUrl': get_field_value(video, 'video_background_image',
            'https://i.imgur.com/KxT5vJM.png'),
        'videoEmbedUrl': get_field_value(video, 'video_embed_url',
            'https://www.youtube.com/embed/dQw4w9WgXcQ'),
        'preTitle': get_field_value(video, 'video_pretitle', 'A LOVE STORY BEGINNING'),
        'title': get_field_value(video, 'video_title', 'Watch our love story')
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
        'sectionSubtitle': 'MEMORIES',
        'sectionTitle': 'Wedding Gallery',
        'galleryImages': gallery_photos,
        'categories': gallery_categories
    }

def extract_footer_data(data_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract data for Footer section"""
    couple = data_dict.get('couple', {})
    event = data_dict.get('event', {})

    # Build couple names
    bride_name = get_field_value(couple, 'couple_bride_name', 'María')
    groom_name = get_field_value(couple, 'couple_groom_name', 'Carlos')
    couple_names = f"{bride_name} & {groom_name}"

    # Format event date
    event_date = get_field_value(event, 'event_date', '15 December, 2024')
    if isinstance(event_date, str) and 'T' in event_date:
        from datetime import datetime
        try:
            dt = datetime.fromisoformat(event_date.replace('Z', '+00:00'))
            event_date = dt.strftime('%d %B, %Y').upper()
        except:
            event_date = event_date.upper()
    else:
        event_date = str(event_date).upper()

    return {
        'coupleNames': couple_names,
        'eventDate': event_date,
        'eventLocation': get_field_value(event, 'event_venue_city', 'CIUDAD').upper(),
        'copyrightText': 'Made with love. All rights reserved.'
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