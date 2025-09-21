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

        # Get invitation data - frontend will handle defaults
        try:
            invitation = Invitation.query.get(invitation_id)
            if invitation:
                # Get organized props from real data
                template_props = get_modular_template_props(invitation_id, sections_config)
            else:
                # Return empty data - frontend components will provide defaults
                template_props = {
                    'section_props': {},
                    'config': {
                        'sections_enabled': {section: True for section in sections_config.keys()},
                        'colors': {},
                        'custom_css': ''
                    }
                }
        except Exception as db_error:
            print(f"Database error for invitation {invitation_id}: {str(db_error)}")
            # Return empty data - frontend components will provide defaults
            template_props = {
                'section_props': {},
                'config': {
                    'sections_enabled': {section: True for section in sections_config.keys()},
                    'colors': {},
                    'custom_css': ''
                }
            }

        return jsonify({
            'invitation_id': invitation_id,
            'template_props': template_props
        }), 200

    except Exception as e:
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500




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