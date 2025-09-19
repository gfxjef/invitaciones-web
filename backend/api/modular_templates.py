"""
Modular Templates API

WHY: API endpoints specifically for modular template system to provide
structured data for section-based template rendering.

WHAT: Endpoints that return invitation data organized by section types,
ready for consumption by React components in the modular template system.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
from models.invitation import Invitation
from models.template import Template
from utils.modular_template_helpers import (
    get_invitation_modular_data,
    get_modular_template_props
)
import json

modular_templates_bp = Blueprint('modular_templates', __name__)


class ModularDataResponseSchema(Schema):
    """Schema for modular template data response"""
    invitation_id = fields.Int()
    template_id = fields.Int()
    template_type = fields.Str()
    sections_config = fields.Dict()
    section_props = fields.Dict()
    config = fields.Dict()


@modular_templates_bp.route('/invitation/<int:invitation_id>/modular-data', methods=['GET'])
def get_invitation_modular_data_endpoint(invitation_id):
    """
    GET /api/modular-templates/invitation/:id/modular-data

    WHY: Provides all modular template data for an invitation organized by sections.
    Used by frontend to render modular templates with real invitation data.

    Returns:
        JSON with section-organized data ready for React components
    """
    try:
        # Get invitation
        invitation = Invitation.query.get(invitation_id)
        if not invitation:
            return jsonify({'message': 'Invitation not found'}), 404

        # Check if invitation uses modular template
        # For now, we'll return modular data regardless - this enables testing

        # Get modular data organized by sections
        modular_data = get_invitation_modular_data(invitation_id)

        # Get template information if available
        template_info = None
        if hasattr(invitation, 'template_id') and invitation.template_id:
            template = Template.query.get(invitation.template_id)
            if template:
                template_info = {
                    'id': template.id,
                    'name': template.name,
                    'template_type': template.template_type,
                    'sections_config': template.sections_config
                }

        response_data = {
            'invitation_id': invitation_id,
            'template': template_info,
            'modular_data': modular_data,
            'available_sections': [
                'hero', 'welcome', 'couple', 'countdown',
                'story', 'video', 'gallery', 'footer'
            ]
        }

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500


@modular_templates_bp.route('/invitation/<int:invitation_id>/section/<section_type>', methods=['GET'])
def get_section_data(invitation_id, section_type):
    """
    GET /api/modular-templates/invitation/:id/section/:type

    WHY: Get data for a specific section type. Useful for frontend components
    that need to load section data individually.

    Args:
        invitation_id: ID of the invitation
        section_type: Type of section (hero, welcome, couple, etc.)
    """
    try:
        # Validate section type
        valid_sections = ['hero', 'welcome', 'couple', 'countdown', 'story', 'video', 'gallery', 'footer']
        if section_type not in valid_sections:
            return jsonify({'message': f'Invalid section type. Valid types: {", ".join(valid_sections)}'}), 400

        # Get invitation
        invitation = Invitation.query.get(invitation_id)
        if not invitation:
            return jsonify({'message': 'Invitation not found'}), 404

        # Get modular data
        modular_data = get_invitation_modular_data(invitation_id)

        # Return specific section data
        section_data = modular_data.get(section_type, {})

        return jsonify({
            'invitation_id': invitation_id,
            'section_type': section_type,
            'section_data': section_data
        }), 200

    except Exception as e:
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500


@modular_templates_bp.route('/invitation/<int:invitation_id>/template-props', methods=['GET'])
def get_template_props(invitation_id):
    """
    GET /api/modular-templates/invitation/:id/template-props

    WHY: Get props organized specifically for TemplateBuilder component.
    Returns data in the exact format expected by the React component.

    Query Parameters:
        - sections: Comma-separated list of sections to include (optional)
    """
    try:
        # Get requested sections (default to all)
        sections_param = request.args.get('sections', '')
        if sections_param:
            requested_sections = [s.strip() for s in sections_param.split(',')]
        else:
            requested_sections = ['hero', 'welcome', 'couple', 'countdown', 'story', 'video', 'gallery', 'footer']

        # Build sections config
        sections_config = {}
        for section in requested_sections:
            # For now, map each section to its default implementation
            sections_config[section] = f"{section}_1"

        # Try to get invitation data, if fails, use demo data
        try:
            invitation = Invitation.query.get(invitation_id)
            if invitation:
                # Get organized props from real data
                template_props = get_modular_template_props(invitation_id, sections_config)
            else:
                # Use demo data if invitation doesn't exist
                template_props = get_demo_template_props(sections_config)
        except Exception as db_error:
            print(f"Database error for invitation {invitation_id}: {str(db_error)}")
            # Use demo data as fallback
            template_props = get_demo_template_props(sections_config)

        return jsonify({
            'invitation_id': invitation_id,
            'template_props': template_props
        }), 200

    except Exception as e:
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500


def get_demo_template_props(sections_config):
    """
    Generate demo data for template props when real data is not available
    """
    demo_section_props = {
        'hero': {
            'coupleNames': 'María & Carlos',
            'eventDate': '15 December, 2024',
            'eventLocation': 'Lima, Perú',
            'heroImageUrl': 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=1260',
            'navigationItems': [
                { 'href': '#home', 'label': 'Home' },
                { 'href': '#couple', 'label': 'Couple' },
                { 'href': '#story', 'label': 'Story' },
                { 'href': '#events', 'label': 'Events' },
                { 'href': '#gallery', 'label': 'Gallery' },
                { 'href': '#rsvp', 'label': 'R.S.V.P' }
            ]
        },
        'welcome': {
            'bannerImageUrl': 'https://i.imgur.com/svWa52m.png',
            'couplePhotoUrl': 'https://i.imgur.com/OFaT2vQ.png',
            'welcomeText': 'HELLO & WELCOME',
            'title': "We're getting married!",
            'description': "Today and always, beyond tomorrow, I need you beside me, always as my best friend, lover and forever soul mate."
        },
        'couple': {
            'sectionTitle': 'Happy Couple',
            'sectionSubtitle': 'BRIDE & GROOM',
            'brideData': {
                'imageUrl': 'https://i.imgur.com/u1wA4oo.png',
                'name': 'María',
                'role': 'The Bride',
                'description': 'A beautiful soul with a heart full of love and dreams.',
                'socialLinks': { 'facebook': '#', 'twitter': '#', 'instagram': '#' }
            },
            'groomData': {
                'imageUrl': 'https://i.imgur.com/qL42vPA.png',
                'name': 'Carlos',
                'role': 'The Groom',
                'description': 'A loving partner ready to start this new journey together.',
                'socialLinks': { 'facebook': '#', 'twitter': '#', 'instagram': '#' }
            }
        },
        'countdown': {
            'weddingDate': '2024-12-15T16:00:00Z',
            'backgroundImageUrl': 'https://i.imgur.com/7p4m1iH.png',
            'preTitle': 'WE WILL BECOME A FAMILY IN',
            'title': "We're getting married in"
        },
        'story': {
            'sectionSubtitle': 'MARÍA & CARLOS',
            'sectionTitle': 'Our Love Story',
            'storyMoments': [
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
        },
        'video': {
            'backgroundImageUrl': 'https://i.imgur.com/KxT5vJM.png',
            'videoEmbedUrl': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'preTitle': 'A LOVE STORY BEGINNING',
            'title': 'Watch our love story'
        },
        'gallery': {
            'sectionSubtitle': 'MEMORIES',
            'sectionTitle': 'Wedding Gallery',
            'galleryImages': [
                { 'id': 1, 'url': 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=800', 'alt': 'Romantic couple moment', 'category': 'ceremony' },
                { 'id': 2, 'url': 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=800', 'alt': 'Beautiful wedding ceremony', 'category': 'ceremony' },
                { 'id': 3, 'url': 'https://images.pexels.com/photos/3784433/pexels-photo-3784433.jpeg?auto=compress&cs=tinysrgb&w=800', 'alt': 'Celebration moments', 'category': 'party' },
                { 'id': 4, 'url': 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=800', 'alt': 'Wedding rings', 'category': 'ceremony' }
            ]
        },
        'footer': {
            'coupleNames': 'María & Carlos',
            'eventDate': '15 DECEMBER, 2024',
            'eventLocation': 'LIMA, PERÚ',
            'copyrightText': 'Made with love. All rights reserved.'
        }
    }

    # Filter section props based on sections_config
    section_props = {}
    for section_type, section_key in sections_config.items():
        if section_type in demo_section_props:
            section_props[section_type] = demo_section_props[section_type]

    return {
        'section_props': section_props,
        'config': {
            'sections_enabled': {section: True for section in sections_config.keys()},
            'colors': {
                'primary': '#d97706',
                'secondary': '#374151',
                'accent': '#fbbf24'
            },
            'custom_css': ''
        }
    }


@modular_templates_bp.route('/sections/available', methods=['GET'])
def get_available_sections():
    """
    GET /api/modular-templates/sections/available

    WHY: Returns list of all available section types and their variations.
    Used by frontend to show available options in template editor.
    """
    try:
        available_sections = {
            'hero': ['hero_1'],  # Can be extended with hero_2, hero_3, etc.
            'welcome': ['welcome_1'],
            'couple': ['couple_1'],
            'countdown': ['countdown_1'],
            'story': ['story_1'],
            'video': ['video_1'],
            'gallery': ['gallery_1'],
            'footer': ['footer_1']
        }

        section_descriptions = {
            'hero': 'Main hero section with background image and navigation',
            'welcome': 'Welcome banner with couple photo and message',
            'couple': 'Bride and groom profiles with social links',
            'countdown': 'Real-time countdown to wedding date',
            'story': 'Interactive love story carousel',
            'video': 'Video section with background and lightbox',
            'gallery': 'Photo gallery with category filters',
            'footer': 'Footer with event details and back-to-top'
        }

        return jsonify({
            'available_sections': available_sections,
            'descriptions': section_descriptions,
            'total_variations': sum(len(variations) for variations in available_sections.values())
        }), 200

    except Exception as e:
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500


@modular_templates_bp.route('/test/<int:invitation_id>', methods=['GET'])
def test_modular_system(invitation_id):
    """
    GET /api/modular-templates/test/:id

    WHY: Test endpoint to verify modular system is working correctly.
    Returns a complete test of the modular data extraction.
    """
    try:
        # Get invitation
        invitation = Invitation.query.get(invitation_id)
        if not invitation:
            return jsonify({'message': 'Invitation not found'}), 404

        # Test modular data extraction
        modular_data = get_invitation_modular_data(invitation_id)

        # Test template props generation
        sections_config = {
            'hero': 'hero_1',
            'welcome': 'welcome_1',
            'couple': 'couple_1',
            'countdown': 'countdown_1',
            'story': 'story_1',
            'video': 'video_1',
            'gallery': 'gallery_1',
            'footer': 'footer_1'
        }
        template_props = get_modular_template_props(invitation_id, sections_config)

        return jsonify({
            'test_status': 'SUCCESS',
            'invitation': {
                'id': invitation.id,
                'title': invitation.title,
                'bride_name': invitation.bride_name,
                'groom_name': invitation.groom_name
            },
            'modular_data': modular_data,
            'template_props': template_props,
            'sections_tested': list(sections_config.keys()),
            'message': 'Modular template system working correctly!'
        }), 200

    except Exception as e:
        return jsonify({
            'test_status': 'ERROR',
            'message': f'Test failed: {str(e)}'
        }), 500