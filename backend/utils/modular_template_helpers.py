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

    UPDATED: Now queries invitations_sections_data table (NEW modular system)
    instead of invitation_data table (OLD category system).

    Args:
        invitation_id: ID of the invitation

    Returns:
        Dictionary organized by section with all necessary props
    """
    from models.invitation_sections_data import InvitationSectionsData

    # Query sections from NEW modular table
    sections = InvitationSectionsData.query.filter_by(
        invitation_id=invitation_id
    ).all()

    # Transform to dict by section type
    sections_dict = {}
    for section in sections:
        sections_dict[section.section_type] = section.variables_json

    # Fallback to OLD system if no sections found in NEW table
    if not sections_dict:
        # Get all custom data fields from OLD table
        data_dict = InvitationData.get_invitation_data_dict(invitation_id)

        # Get media files
        media_files = InvitationMedia.query.filter_by(invitation_id=invitation_id).all()

        # Get events
        events = InvitationEvent.query.filter_by(invitation_id=invitation_id).all()

        # Use OLD extraction methods
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

    # Use NEW extraction methods for modular sections
    return {
        'hero': extract_hero_from_sections(sections_dict),
        'welcome': extract_welcome_from_sections(sections_dict),
        'couple': extract_couple_from_sections(sections_dict),
        'countdown': extract_countdown_from_sections(sections_dict),
        'story': extract_story_from_sections(sections_dict),
        'video': extract_video_from_sections(sections_dict),
        'gallery': extract_gallery_from_sections(sections_dict),
        'footer': extract_footer_from_sections(sections_dict),
        'familiares': extract_familiares_from_sections(sections_dict),
        'place_religioso': extract_place_religioso_from_sections(sections_dict),
        'place_ceremonia': extract_place_ceremonia_from_sections(sections_dict),
        'vestimenta': extract_vestimenta_from_sections(sections_dict),
        'itinerary': extract_itinerary_from_sections(sections_dict),
        'config': {'sections_enabled': {}, 'colors': {}, 'custom_css': ''}
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

# ==============================================================================
# NEW EXTRACTION FUNCTIONS FOR MODULAR SECTIONS (invitations_sections_data)
# ==============================================================================

def extract_hero_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract Hero component props from sections_dict
    Maps from 'hero' section to Hero component props

    FIXED: Now reads from 'hero' section instead of 'general' section
    because the field mapping system correctly prefixes fields as hero_*

    FIELD MAPPING:
    - date → weddingDate (component expects weddingDate)
    - location/eventLocation → eventLocation
    - image/heroImageUrl → heroImageUrl
    """
    hero = sections_dict.get('hero', {})

    return {
        'groom_name': hero.get('groom_name'),
        'bride_name': hero.get('bride_name'),
        'weddingDate': hero.get('date') or hero.get('weddingDate'),  # Map date → weddingDate
        'eventLocation': hero.get('eventLocation') or hero.get('location'),  # Handle both field names
        'heroImageUrl': hero.get('heroImageUrl') or hero.get('image')  # Handle both field names
    }

def extract_welcome_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract Welcome component props from sections_dict"""
    welcome = sections_dict.get('welcome', {})

    return {
        'welcome_bannerImageUrl': welcome.get('welcome_bannerImageUrl'),
        'welcome_couplePhotoUrl': welcome.get('welcome_couplePhotoUrl'),
        'welcome_welcomeText': welcome.get('welcome_welcomeText'),
        'welcome_title': welcome.get('welcome_title'),
        'welcome_description': welcome.get('welcome_description')
    }

def extract_couple_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract Couple component props from sections_dict"""
    couple = sections_dict.get('couple', {})

    return {
        'couple_sectionTitle': couple.get('couple_sectionTitle'),
        'couple_sectionSubtitle': couple.get('couple_sectionSubtitle'),
        'bride_name': couple.get('bride_name'),
        'bride_role': couple.get('bride_role'),
        'bride_description': couple.get('bride_description'),
        'bride_imageUrl': couple.get('bride_imageUrl'),
        'groom_name': couple.get('groom_name'),
        'groom_role': couple.get('groom_role'),
        'groom_description': couple.get('groom_description'),
        'groom_imageUrl': couple.get('groom_imageUrl')
    }

def extract_countdown_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract Countdown component props from sections_dict

    FIXED: Field names in DB don't have section prefix, so we read:
    - preTitle (not countdown_preTitle)
    - title (not countdown_title)
    - backgroundImageUrl (not countdown_backgroundImageUrl)

    INHERITANCE: weddingDate can come from countdown → hero → general
    This allows invitations with only 'hero' section to work in countdown
    """
    countdown = sections_dict.get('countdown', {})
    hero = sections_dict.get('hero', {})
    general = sections_dict.get('general', {})

    # HERENCIA: countdown → hero (with date mapping) → general
    wedding_date = (
        countdown.get('weddingDate') or
        hero.get('weddingDate') or
        hero.get('date') or  # Map date → weddingDate
        general.get('weddingDate')
    )

    return {
        'weddingDate': wedding_date,
        'countdown_backgroundImageUrl': countdown.get('backgroundImageUrl'),
        'countdown_preTitle': countdown.get('preTitle'),
        'countdown_title': countdown.get('title')
    }

def extract_story_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract Story component props from sections_dict"""
    story = sections_dict.get('story', {})

    return {
        'sectionSubtitle': story.get('sectionSubtitle'),
        'sectionTitle': story.get('sectionTitle'),
        'story_moment_1_date': story.get('story_moment_1_date'),
        'story_moment_1_title': story.get('story_moment_1_title'),
        'story_moment_1_description': story.get('story_moment_1_description'),
        'story_moment_1_imageUrl': story.get('story_moment_1_imageUrl'),
        'story_moment_2_date': story.get('story_moment_2_date'),
        'story_moment_2_title': story.get('story_moment_2_title'),
        'story_moment_2_description': story.get('story_moment_2_description'),
        'story_moment_2_imageUrl': story.get('story_moment_2_imageUrl'),
        'story_moment_3_date': story.get('story_moment_3_date'),
        'story_moment_3_title': story.get('story_moment_3_title'),
        'story_moment_3_description': story.get('story_moment_3_description'),
        'story_moment_3_imageUrl': story.get('story_moment_3_imageUrl')
    }

def extract_video_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract Video component props from sections_dict"""
    video = sections_dict.get('video', {})

    return {
        'video_backgroundImageUrl': video.get('video_backgroundImageUrl'),
        'video_videoEmbedUrl': video.get('video_videoEmbedUrl'),
        'video_preTitle': video.get('video_preTitle'),
        'video_title': video.get('video_title')
    }

def extract_gallery_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract Gallery component props from sections_dict

    FIXED: Field name in DB is 'images' (not 'gallery_images')
    """
    gallery = sections_dict.get('gallery', {})

    # Try 'images' first (correct name), fallback to 'gallery_images'
    gallery_images = gallery.get('images') or gallery.get('gallery_images', [])
    if isinstance(gallery_images, str):
        try:
            gallery_images = json.loads(gallery_images)
        except:
            gallery_images = []

    return {
        'sectionSubtitle': gallery.get('sectionSubtitle'),
        'sectionTitle': gallery.get('sectionTitle'),
        'gallery_images': gallery_images
    }

def extract_footer_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract Footer component props from sections_dict

    FIXED: Field name in DB is 'copyrightText' (not 'footer_copyrightText')

    INHERITANCE: Shared fields (groom_name, bride_name, weddingDate, eventLocation)
    can come from general → hero → footer
    This allows invitations with only 'hero' section to work in footer
    """
    footer = sections_dict.get('footer', {})
    hero = sections_dict.get('hero', {})
    general = sections_dict.get('general', {})

    # HERENCIA para campos compartidos: general → hero → footer
    return {
        'groom_name': (
            general.get('groom_name') or
            hero.get('groom_name') or
            footer.get('groom_name')
        ),
        'bride_name': (
            general.get('bride_name') or
            hero.get('bride_name') or
            footer.get('bride_name')
        ),
        'weddingDate': (
            general.get('weddingDate') or
            hero.get('weddingDate') or
            hero.get('date') or  # Map date → weddingDate
            footer.get('weddingDate')
        ),
        'eventLocation': (
            general.get('eventLocation') or
            hero.get('eventLocation') or
            hero.get('location') or  # Map location → eventLocation
            footer.get('eventLocation')
        ),
        'footer_copyrightText': footer.get('copyrightText')
    }

def extract_familiares_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract Familiares component props from sections_dict (Template 9)"""
    familiares = sections_dict.get('familiares', {})

    return {
        'familiares_titulo_padres': familiares.get('titulo_padres'),
        'familiares_titulo_padrinos': familiares.get('titulo_padrinos'),
        'familiares_padre_novio': familiares.get('padre_novio'),
        'familiares_madre_novio': familiares.get('madre_novio'),
        'familiares_padre_novia': familiares.get('padre_novia'),
        'familiares_madre_novia': familiares.get('madre_novia'),
        'familiares_padrino': familiares.get('padrino'),
        'familiares_madrina': familiares.get('madrina')
    }

def extract_place_religioso_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract PlaceReligioso component props from sections_dict (Template 9)

    INHERITANCE: weddingDate can come from place_religioso → hero → general
    This allows invitations with only 'hero' section to work in place_religioso
    """
    place_religioso = sections_dict.get('place_religioso', {})
    hero = sections_dict.get('hero', {})
    general = sections_dict.get('general', {})

    # HERENCIA: place_religioso → hero (with date mapping) → general
    wedding_date = (
        place_religioso.get('weddingDate') or
        hero.get('weddingDate') or
        hero.get('date') or  # Map date → weddingDate
        general.get('weddingDate')
    )

    return {
        'place_religioso_titulo': place_religioso.get('titulo'),
        'weddingDate': wedding_date,
        'place_religioso_lugar': place_religioso.get('lugar'),
        'place_religioso_direccion': place_religioso.get('direccion'),
        'place_religioso_mapa_url': place_religioso.get('mapa_url')
    }

def extract_place_ceremonia_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract PlaceCeremonia component props from sections_dict (Template 9)

    INHERITANCE: weddingDate can come from place_ceremonia → hero → general
    This allows invitations with only 'hero' section to work in place_ceremonia
    """
    place_ceremonia = sections_dict.get('place_ceremonia', {})
    hero = sections_dict.get('hero', {})
    general = sections_dict.get('general', {})

    # HERENCIA: place_ceremonia → hero (with date mapping) → general
    wedding_date = (
        place_ceremonia.get('weddingDate') or
        hero.get('weddingDate') or
        hero.get('date') or  # Map date → weddingDate
        general.get('weddingDate')
    )

    return {
        'place_ceremonia_titulo': place_ceremonia.get('titulo'),
        'weddingDate': wedding_date,
        'place_ceremonia_hora': place_ceremonia.get('hora'),
        'place_ceremonia_lugar': place_ceremonia.get('lugar'),
        'place_ceremonia_direccion': place_ceremonia.get('direccion'),
        'place_ceremonia_mapa_url': place_ceremonia.get('mapa_url')
    }

def extract_vestimenta_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract Vestimenta component props from sections_dict (Template 9)"""
    vestimenta = sections_dict.get('vestimenta', {})

    return {
        'vestimenta_titulo': vestimenta.get('titulo'),
        'vestimenta_etiqueta': vestimenta.get('etiqueta'),
        'vestimenta_no_colores_titulo': vestimenta.get('no_colores_titulo'),
        'vestimenta_no_colores_info': vestimenta.get('no_colores_info')
    }

def extract_itinerary_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extract Itinerary component props from sections_dict (Template 9)"""
    itinerary = sections_dict.get('itinerary', {})

    return {
        'itinerary_title': itinerary.get('title'),
        'itinerary_event_ceremonia_enabled': itinerary.get('event_ceremonia_enabled'),
        'itinerary_event_ceremonia_time': itinerary.get('event_ceremonia_time'),
        'itinerary_event_recepcion_enabled': itinerary.get('event_recepcion_enabled'),
        'itinerary_event_recepcion_time': itinerary.get('event_recepcion_time'),
        'itinerary_event_entrada_enabled': itinerary.get('event_entrada_enabled'),
        'itinerary_event_entrada_time': itinerary.get('event_entrada_time'),
        'itinerary_event_comida_enabled': itinerary.get('event_comida_enabled'),
        'itinerary_event_comida_time': itinerary.get('event_comida_time'),
        'itinerary_event_fiesta_enabled': itinerary.get('event_fiesta_enabled'),
        'itinerary_event_fiesta_time': itinerary.get('event_fiesta_time')
    }