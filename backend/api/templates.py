from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, or_
from sqlalchemy.orm import joinedload
from marshmallow import Schema, fields, ValidationError, validate
from models import Template, User
from models.user import UserRole
from extensions import db
import math

templates_bp = Blueprint('templates', __name__)


# WHY: Category validation constants for template system
VALID_CATEGORIES = ['weddings', 'kids', 'corporate', 'quinceañeras', 'classic', 'modern', 'romantic', 'elegant']

# WHY: Section configuration by category - defines which sections are valid for each category
CATEGORY_SECTION_MAP = {
    'weddings': {
        'required': ['hero', 'welcome'],
        'optional': ['story', 'couple', 'video', 'gallery', 'countdown', 'itinerary', 'footer'],
        'forbidden': []
    },
    'kids': {
        'required': ['hero', 'welcome'],
        'optional': ['celebration', 'activities', 'gallery', 'birthday_info', 'countdown', 'footer'],
        'forbidden': ['story', 'couple']  # Not appropriate for kids parties
    },
    'corporate': {
        'required': ['hero', 'welcome'],
        'optional': ['services', 'team', 'testimonials', 'contact', 'footer'],
        'forbidden': ['story', 'couple', 'celebration', 'birthday_info']
    },
    'quinceañeras': {
        'required': ['hero', 'welcome'],
        'optional': ['story', 'celebration', 'gallery', 'countdown', 'footer', 'court_of_honor'],
        'forbidden': ['couple']  # Different from weddings
    }
}


def validate_sections_for_category(sections_config, category):
    """
    WHY: Validates that the sections configuration is appropriate for the template category

    Args:
        sections_config (dict): The sections configuration to validate
        category (str): The template category

    Returns:
        tuple: (is_valid, errors_list)
    """
    if not category or category not in CATEGORY_SECTION_MAP:
        return True, []  # No validation for unknown categories

    if not sections_config:
        return True, []  # Empty config is valid

    category_rules = CATEGORY_SECTION_MAP[category]
    errors = []

    # Check for forbidden sections
    for section in sections_config.keys():
        if section in category_rules.get('forbidden', []):
            errors.append(f"Section '{section}' is not allowed for category '{category}'")

    # Check for required sections (optional validation - could be enforced later)
    # for required_section in category_rules.get('required', []):
    #     if required_section not in sections_config:
    #         errors.append(f"Required section '{required_section}' missing for category '{category}'")

    return len(errors) == 0, errors


def get_valid_sections_for_category(category):
    """
    WHY: Returns the list of valid sections for a given category

    Args:
        category (str): The template category

    Returns:
        list: List of valid section names for the category
    """
    if not category or category not in CATEGORY_SECTION_MAP:
        # Return all possible sections if category is unknown
        return ['hero', 'welcome', 'story', 'couple', 'video', 'gallery', 'countdown', 'footer',
                'celebration', 'activities', 'birthday_info', 'services', 'team', 'testimonials',
                'contact', 'court_of_honor']

    category_rules = CATEGORY_SECTION_MAP[category]
    return category_rules.get('required', []) + category_rules.get('optional', [])


class TemplateCreateSchema(Schema):
    """WHY: Validates input data for creating new templates, ensuring
    all required fields are present and properly formatted"""
    name = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str(validate=validate.Length(max=1000))
    category = fields.Str(validate=validate.OneOf(VALID_CATEGORIES))
    preview_image_url = fields.Url(validate=validate.Length(max=500))
    thumbnail_url = fields.Url(validate=validate.Length(max=500))
    template_file = fields.Str(validate=validate.Length(max=200))
    supported_features = fields.List(fields.Str())
    default_colors = fields.Dict()
    template_type = fields.Str(validate=validate.OneOf(['legacy', 'modular']))
    sections_config = fields.Raw()
    plan_id = fields.Int(allow_none=True)
    is_premium = fields.Bool()
    display_order = fields.Int()


class TemplateUpdateSchema(Schema):
    """WHY: Validates input data for updating templates, with optional fields
    to allow partial updates"""
    name = fields.Str(validate=validate.Length(min=1, max=200))
    description = fields.Str(validate=validate.Length(max=1000))
    category = fields.Str(validate=validate.OneOf(VALID_CATEGORIES))
    preview_image_url = fields.Url(validate=validate.Length(max=500))
    thumbnail_url = fields.Url(validate=validate.Length(max=500))
    template_file = fields.Str(validate=validate.Length(max=200))
    supported_features = fields.List(fields.Str())
    default_colors = fields.Dict()
    template_type = fields.Str(validate=validate.OneOf(['legacy', 'modular']))
    sections_config = fields.Raw()
    plan_id = fields.Int(allow_none=True)
    is_premium = fields.Bool()
    is_active = fields.Bool()
    display_order = fields.Int()


class TemplateResponseSchema(Schema):
    """WHY: Ensures consistent serialization of template data in API responses"""
    id = fields.Int()
    name = fields.Str()
    description = fields.Str()
    category = fields.Str()
    preview_image_url = fields.Str()
    thumbnail_url = fields.Str()
    template_file = fields.Str()  # Added missing template_file field
    is_premium = fields.Bool()
    is_active = fields.Bool()
    display_order = fields.Int()
    supported_features = fields.List(fields.Raw())
    default_colors = fields.Dict()
    template_type = fields.Str()  # New field for modular system
    sections_config = fields.Raw()  # Preserve order - use Raw instead of Dict
    plan_id = fields.Int()
    plan = fields.Dict()
    price = fields.Float()
    currency = fields.Str()
    created_at = fields.Str()
    updated_at = fields.Str()


def require_admin():
    """WHY: Helper function to validate admin permissions for protected endpoints.
    Returns user if admin, otherwise raises appropriate HTTP error"""
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return jsonify({'message': 'Authentication required'}), 401
    
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if user.role != UserRole.ADMIN:
        return jsonify({'message': 'Admin access required'}), 403
    
    return user


@templates_bp.route('', methods=['GET'])
@templates_bp.route('/', methods=['GET'])
def get_templates():
    """
    GET /api/templates - List templates with pagination, filtering, and search
    
    WHY: Public endpoint to allow browsing available templates with flexible
    filtering options for frontend display and user selection
    
    Query Parameters:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20, max: 100)
    - category: Filter by category
    - is_premium: Filter by premium status (true/false)
    - is_active: Filter by active status (default: true for public)
    - search: Search in name and description
    - sort_by: Sort field (name, created_at, display_order)
    - sort_order: asc/desc (default: asc)
    """
    try:
        # Parse pagination parameters
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 20)), 100)
        
        # Build base query - exclude soft deleted templates and include plan relationship
        query = Template.query.options(joinedload(Template.plan)).filter(Template.is_deleted == False)
        
        # Filter by active status (default to active only for public access)
        is_active = request.args.get('is_active', 'true').lower()
        if is_active == 'true':
            query = query.filter(Template.is_active == True)
        elif is_active == 'false':
            query = query.filter(Template.is_active == False)
        
        # Filter by category
        category = request.args.get('category')
        if category:
            query = query.filter(Template.category == category)
        
        # Filter by premium status
        is_premium = request.args.get('is_premium')
        if is_premium is not None:
            premium_bool = is_premium.lower() == 'true'
            query = query.filter(Template.is_premium == premium_bool)
        
        # Search functionality
        search = request.args.get('search')
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Template.name.ilike(search_term),
                    Template.description.ilike(search_term)
                )
            )
        
        # Sorting
        sort_by = request.args.get('sort_by', 'display_order')
        sort_order = request.args.get('sort_order', 'asc')
        
        if hasattr(Template, sort_by):
            order_column = getattr(Template, sort_by)
            if sort_order.lower() == 'desc':
                query = query.order_by(order_column.desc())
            else:
                query = query.order_by(order_column.asc())
        else:
            # Default sort by display_order ascending
            query = query.order_by(Template.display_order.asc())
        
        # Execute pagination
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Skip schema to preserve sections_config order from OrderedDict
        templates_data = [t.to_dict() for t in pagination.items]
        
        return jsonify({
            'templates': templates_data,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }), 200
        
    except ValueError as e:
        return jsonify({'message': 'Invalid pagination parameters'}), 400
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500


@templates_bp.route('/<int:template_id>', methods=['GET'])
def get_template(template_id):
    """
    GET /api/templates/:id - Get template details
    
    WHY: Public endpoint to retrieve detailed information about a specific
    template for preview and selection purposes
    """
    try:
        template = Template.query.filter(
            and_(
                Template.id == template_id,
                Template.is_deleted == False,
                Template.is_active == True
            )
        ).first()
        
        if not template:
            return jsonify({'message': 'Template not found'}), 404
        
        # Get template data with preserved sections order
        template_data = template.to_dict()

        # Add ordered sections list to guarantee order preservation across JSON serialization
        if template_data.get('sections_config'):
            raw_sections = template.sections_config

            # Create ordered list based on database order
            db_order = list(raw_sections.keys())
            sections_ordered = [[k, raw_sections[k]] for k in db_order if k in raw_sections]

            template_data['sections_config_ordered'] = sections_ordered

        return jsonify({'template': template_data}), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500


@templates_bp.route('', methods=['POST'])
@templates_bp.route('/', methods=['POST'])
@jwt_required()
def create_template():
    """
    POST /api/templates - Create new template (Admin only)
    
    WHY: Protected endpoint for administrators to add new templates to the system.
    Includes comprehensive validation to ensure data integrity
    """
    try:
        # Validate admin permissions
        admin_check = require_admin()
        if isinstance(admin_check, tuple):  # Error response
            return admin_check
        
        # Validate input data
        schema = TemplateCreateSchema()
        try:
            data = schema.load(request.json or {})
        except ValidationError as err:
            return jsonify({'errors': err.messages}), 400

        # Validate sections configuration for category
        if data.get('sections_config') and data.get('category'):
            is_valid, section_errors = validate_sections_for_category(
                data['sections_config'],
                data['category']
            )
            if not is_valid:
                return jsonify({
                    'message': 'Invalid sections configuration for category',
                    'errors': section_errors
                }), 400
        
        # Check if template name already exists
        existing_template = Template.query.filter(
            and_(
                Template.name == data['name'],
                Template.is_deleted == False
            )
        ).first()
        
        if existing_template:
            return jsonify({'message': 'Template name already exists'}), 409
        
        # Create new template
        template = Template(
            name=data['name'],
            description=data.get('description'),
            category=data.get('category'),
            preview_image_url=data.get('preview_image_url'),
            thumbnail_url=data.get('thumbnail_url'),
            template_file=data.get('template_file'),
            supported_features=data.get('supported_features', []),
            default_colors=data.get('default_colors', {}),
            template_type=data.get('template_type', 'legacy'),
            sections_config=data.get('sections_config'),
            plan_id=data.get('plan_id'),
            is_premium=data.get('is_premium', False),
            display_order=data.get('display_order', 0)
        )
        
        db.session.add(template)
        db.session.commit()
        
        # Return created template
        response_schema = TemplateResponseSchema()
        template_data = response_schema.dump(template.to_dict())
        
        return jsonify({
            'message': 'Template created successfully',
            'template': template_data
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Internal server error'}), 500


@templates_bp.route('/<int:template_id>', methods=['PUT'])
@jwt_required()
def update_template(template_id):
    """
    PUT /api/templates/:id - Update template (Admin only)
    
    WHY: Protected endpoint for administrators to modify existing templates.
    Supports partial updates and maintains data consistency
    """
    try:
        # Validate admin permissions
        admin_check = require_admin()
        if isinstance(admin_check, tuple):  # Error response
            return admin_check
        
        # Find template
        template = Template.query.filter(
            and_(
                Template.id == template_id,
                Template.is_deleted == False
            )
        ).first()
        
        if not template:
            return jsonify({'message': 'Template not found'}), 404
        
        # Validate input data
        schema = TemplateUpdateSchema()
        try:
            data = schema.load(request.json or {})
        except ValidationError as err:
            return jsonify({'errors': err.messages}), 400

        # Validate sections configuration for category
        category_to_check = data.get('category', template.category)
        sections_to_check = data.get('sections_config', template.sections_config)

        if sections_to_check and category_to_check:
            is_valid, section_errors = validate_sections_for_category(
                sections_to_check,
                category_to_check
            )
            if not is_valid:
                return jsonify({
                    'message': 'Invalid sections configuration for category',
                    'errors': section_errors
                }), 400
        
        # Check for name conflicts if name is being updated
        if 'name' in data and data['name'] != template.name:
            existing_template = Template.query.filter(
                and_(
                    Template.name == data['name'],
                    Template.id != template_id,
                    Template.is_deleted == False
                )
            ).first()
            
            if existing_template:
                return jsonify({'message': 'Template name already exists'}), 409
        
        # Update template fields
        for field, value in data.items():
            if hasattr(template, field):
                setattr(template, field, value)
        
        db.session.commit()
        
        # Return updated template
        response_schema = TemplateResponseSchema()
        template_data = response_schema.dump(template.to_dict())
        
        return jsonify({
            'message': 'Template updated successfully',
            'template': template_data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Internal server error'}), 500


@templates_bp.route('/<int:template_id>', methods=['DELETE'])
@jwt_required()
def delete_template(template_id):
    """
    DELETE /api/templates/:id - Soft delete template (Admin only)
    
    WHY: Protected endpoint for administrators to remove templates from public
    access while preserving data for audit purposes through soft delete
    """
    try:
        # Validate admin permissions
        admin_check = require_admin()
        if isinstance(admin_check, tuple):  # Error response
            return admin_check
        
        # Find template
        template = Template.query.filter(
            and_(
                Template.id == template_id,
                Template.is_deleted == False
            )
        ).first()
        
        if not template:
            return jsonify({'message': 'Template not found'}), 404
        
        # Perform soft delete
        template.soft_delete()
        db.session.commit()
        
        return jsonify({'message': 'Template deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Internal server error'}), 500


@templates_bp.route('/categories', methods=['GET'])
def get_categories():
    """
    GET /api/templates/categories - Get available template categories

    WHY: Public endpoint to retrieve all available template categories
    for frontend category filtering and validation
    """
    try:
        return jsonify({
            'categories': VALID_CATEGORIES,
            'category_rules': CATEGORY_SECTION_MAP
        }), 200

    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500


@templates_bp.route('/categories/<category>/sections', methods=['GET'])
def get_category_sections(category):
    """
    GET /api/templates/categories/:category/sections - Get valid sections for category

    WHY: Public endpoint to retrieve valid sections for a specific category,
    useful for frontend validation and template building
    """
    try:
        if category not in VALID_CATEGORIES:
            return jsonify({'message': 'Invalid category'}), 400

        valid_sections = get_valid_sections_for_category(category)
        category_rules = CATEGORY_SECTION_MAP.get(category, {})

        return jsonify({
            'category': category,
            'valid_sections': valid_sections,
            'required_sections': category_rules.get('required', []),
            'optional_sections': category_rules.get('optional', []),
            'forbidden_sections': category_rules.get('forbidden', [])
        }), 200

    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500