#!/usr/bin/env python3
"""
Create Modular Template Script

WHY: Creates a sample modular template in the database to demonstrate
the new section-based template system.

WHAT: Inserts a new template with template_type='modular' and
sections_config containing all available section configurations.

Usage: python create_modular_template.py
"""

import sys
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from extensions import db
from models.template import Template

def create_app():
    """Create Flask app with proper configuration"""
    app = Flask(__name__)

    # Build MySQL connection string from environment variables (same as app.py)
    db_host = os.getenv('DB_HOST', 'localhost')
    db_user = os.getenv('DB_USER', 'root')
    db_password = os.getenv('DB_PASSWORD', '')
    db_name = os.getenv('DB_NAME', 'invitaciones_web')
    db_port = os.getenv('DB_PORT', '3306')

    # MySQL connection string
    database_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

    # Database configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)

    return app

def create_modular_template():
    """Create a sample modular template"""

    # Sample sections configuration
    sections_config = {
        "hero": "hero_1",
        "welcome": "welcome_1",
        "couple": "couple_1",
        "countdown": "countdown_1",
        "story": "story_1",
        "video": "video_1",
        "gallery": "gallery_1",
        "footer": "footer_1"
    }

    # Default colors for the modular template
    default_colors = {
        "primary": "#d97706",      # amber-600
        "secondary": "#374151",    # gray-700
        "accent": "#fbbf24",       # amber-400
        "text": "#1f2937",         # gray-800
        "text_light": "#6b7280",   # gray-500
        "background": "#ffffff",   # white
        "background_alt": "#fdfaf6", # cream
        "border": "#e5e7eb",       # gray-200
        "success": "#10b981",      # emerald-500
        "warning": "#f59e0b",      # amber-500
        "error": "#ef4444"         # red-500
    }

    # Supported features
    supported_features = [
        "hero_section",
        "welcome_banner",
        "couple_profiles",
        "countdown_timer",
        "love_story_carousel",
        "video_lightbox",
        "gallery_filters",
        "social_media",
        "back_to_top",
        "responsive_design",
        "parallax_effects",
        "lightbox_modals"
    ]

    print("Creando template modular de ejemplo...")

    # Check if modular template already exists
    existing_template = Template.query.filter_by(
        name="Romance Modular",
        template_type="modular"
    ).first()

    if existing_template:
        print(f"OK: Template modular ya existe con ID: {existing_template.id}")
        print(f"  - Nombre: {existing_template.name}")
        print(f"  - Tipo: {existing_template.template_type}")
        print(f"  - Secciones: {existing_template.sections_config}")
        return existing_template

    # Create new modular template
    modular_template = Template(
        name="Romance Modular",
        description="Template modular elegante que combina todas las secciones disponibles para crear una experiencia de invitación completa y personalizable.",
        category="romantic",
        preview_image_url="https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=800",
        thumbnail_url="https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=400",
        template_file=None,  # No template_file for modular templates
        template_type="modular",
        sections_config=sections_config,
        supported_features=supported_features,
        default_colors=default_colors,
        plan_id=None,  # You can set a plan_id if needed
        is_premium=False,
        is_active=True,
        display_order=10
    )

    try:
        db.session.add(modular_template)
        db.session.commit()

        print(f"EXITO: Template modular creado con ID: {modular_template.id}")
        print(f"  - Nombre: {modular_template.name}")
        print(f"  - Tipo: {modular_template.template_type}")
        print(f"  - Secciones configuradas:")
        for section_type, section_key in sections_config.items():
            print(f"    * {section_type}: {section_key}")

        return modular_template

    except Exception as e:
        db.session.rollback()
        print(f"ERROR: No se pudo crear el template: {e}")
        return None

def verify_template():
    """Verify the template was created correctly"""
    print("\nVerificando template modular...")

    # Get all modular templates
    modular_templates = Template.query.filter_by(template_type="modular").all()

    print(f"Templates modulares encontrados: {len(modular_templates)}")

    for template in modular_templates:
        print(f"\nTemplate ID {template.id}:")
        print(f"  - Nombre: {template.name}")
        print(f"  - Tipo: {template.template_type}")
        print(f"  - Activo: {'Si' if template.is_active else 'No'}")
        print(f"  - Premium: {'Si' if template.is_premium else 'No'}")
        print(f"  - Secciones: {json.dumps(template.sections_config, indent=2) if template.sections_config else 'None'}")

def main():
    """Main execution function"""
    print("Script para crear Template Modular")
    print("=" * 50)

    # Create Flask app and push context
    app = create_app()

    with app.app_context():
        try:
            # Test database connection
            from sqlalchemy import text
            db.session.execute(text('SELECT 1'))
            print("OK: Conexion a base de datos exitosa")

            # Create modular template
            template = create_modular_template()

            if template:
                # Verify creation
                verify_template()

                print("\nProximos pasos:")
                print("1. Ve a tu frontend y prueba el template modular")
                print("2. El template sera renderizado usando TemplateBuilder")
                print("3. Cada seccion sera cargada dinamicamente desde el registry")
                print("\nSistema modular listo para usar!")
            else:
                print("ERROR: Error al crear el template modular")
                return 1

        except Exception as e:
            print(f"ERROR: Error de conexion a base de datos: {e}")
            print("INFO: Asegurate de que MySQL este ejecutandose y la base de datos 'invitaciones_web' exista")
            return 1

    return 0

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)