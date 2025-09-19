#!/usr/bin/env python3
"""
Add New Templates Script

WHY: Independent script to add ModernMinimalist and RomanticoFloral templates
to the database without modifying init_db.py or creating migrations.

WHAT: Inserts new template records with proper metadata, colors, features,
and plan associations so they appear in /plantillas frontend.

Usage: python add_new_templates.py
"""

import sys
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from extensions import db
from models.template import Template
from models.plan import Plan

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

def get_or_create_plan(name, price):
    """Get existing plan or create if doesn't exist"""
    plan = Plan.query.filter_by(name=name).first()
    if not plan:
        print(f"ADVERTENCIA: Plan '{name}' no existe. Por favor crear el plan primero.")
        return None
    return plan

def template_exists(template_file):
    """Check if template already exists"""
    return Template.query.filter_by(template_file=template_file).first() is not None

def add_templates():
    """Add the new templates to database"""

    print("Iniciando insercion de nuevos templates...")

    # Get plans for association
    standard_plan = get_or_create_plan("Standard", 29.90)
    if not standard_plan:
        print("ERROR: No se puede continuar sin Plan Standard")
        return False

    success_count = 0

    # Template 1: Modern Minimalist
    if not template_exists('modern_minimalist'):
        modern_template = Template(
            name='Moderno Minimalista',
            description='Diseño moderno y minimalista con tipografía limpia y espacios en blanco. Perfecto para parejas que buscan elegancia contemporánea.',
            category='modern',
            preview_image_url='https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600',
            thumbnail_url='https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=300',
            template_file='modern_minimalist',
            supported_features=[
                'gallery', 'rsvp', 'countdown', 'maps', 'music', 'social_share'
            ],
            default_colors={
                'primary': '#2D3748',
                'secondary': '#F7FAFC',
                'accent': '#805AD5',
                'text': '#1A202C',
                'text_light': '#718096',
                'background': '#FFFFFF',
                'background_alt': '#F7FAFC',
                'border': '#E2E8F0',
                'success': '#38A169',
                'warning': '#D69E2E',
                'error': '#E53E3E'
            },
            plan_id=standard_plan.id,
            is_premium=False,
            is_active=True,
            display_order=2
        )

        db.session.add(modern_template)
        print("OK: Template 'Moderno Minimalista' agregado")
        success_count += 1
    else:
        print("INFO: Template 'modern_minimalist' ya existe, saltando...")

    # Template 2: Romantico Floral
    if not template_exists('romantico_floral'):
        romantic_template = Template(
            name='Romántico Floral',
            description='Diseño romántico con elementos florales y colores suaves. Ideal para bodas en jardín o ceremonias al aire libre.',
            category='romantic',
            preview_image_url='https://images.pexels.com/photos/1024967/pexels-photo-1024967.jpeg?auto=compress&cs=tinysrgb&w=600',
            thumbnail_url='https://images.pexels.com/photos/1024967/pexels-photo-1024967.jpeg?auto=compress&cs=tinysrgb&w=300',
            template_file='romantico_floral',
            supported_features=[
                'gallery', 'rsvp', 'countdown', 'maps', 'music', 'social_share'
            ],
            default_colors={
                'primary': '#F56565',
                'secondary': '#FED7D7',
                'accent': '#D53F8C',
                'text': '#2D3748',
                'text_light': '#718096',
                'background': '#FFFAF0',
                'background_alt': '#FFF5F5',
                'border': '#FED7D7',
                'success': '#68D391',
                'warning': '#F6AD55',
                'error': '#FC8181'
            },
            plan_id=standard_plan.id,
            is_premium=False,
            is_active=True,
            display_order=3
        )

        db.session.add(romantic_template)
        print("OK: Template 'Romantico Floral' agregado")
        success_count += 1
    else:
        print("INFO: Template 'romantico_floral' ya existe, saltando...")

    # Commit changes
    try:
        db.session.commit()
        print(f"EXITO: {success_count} templates agregados exitosamente a la base de datos")
        return True
    except Exception as e:
        db.session.rollback()
        print(f"ERROR: Error al guardar en base de datos: {e}")
        return False

def verify_templates():
    """Verify that templates were added correctly"""
    print("\nVerificando templates en base de datos...")

    templates = Template.query.filter(
        Template.template_file.in_(['elegante_dorado', 'modern_minimalist', 'romantico_floral'])
    ).all()

    print(f"TOTAL: {len(templates)} templates encontrados")

    for template in templates:
        print(f"  - {template.name} (template_file: {template.template_file})")
        print(f"    * Categoria: {template.category}")
        print(f"    * Plan: {template.plan.name if template.plan else 'Sin plan'}")
        print(f"    * Precio: S/ {template.plan.price if template.plan else 'N/A'}")
        print(f"    * Features: {len(template.supported_features)} caracteristicas")
        print(f"    * Activo: {'Si' if template.is_active else 'No'}")
        print()

def main():
    """Main execution function"""
    print("Script para agregar nuevos templates")
    print("=" * 50)

    # Create Flask app and push context
    app = create_app()

    with app.app_context():
        try:
            # Test database connection
            from sqlalchemy import text
            db.session.execute(text('SELECT 1'))
            print("OK: Conexion a base de datos exitosa")

            # Add templates
            if add_templates():
                # Verify addition
                verify_templates()

                print("\nProximos pasos:")
                print("1. Visita http://localhost:3000/plantillas")
                print("2. Verifica que los nuevos templates aparezcan")
                print("3. Prueba seleccionar y usar los templates")
                print("\nListo! Los templates ya estan disponibles en el frontend.")
            else:
                print("ERROR: No se pudieron agregar los templates")
                return 1

        except Exception as e:
            print(f"ERROR: Error de conexion a base de datos: {e}")
            print("INFO: Asegurate de que MySQL este ejecutandose y la base de datos 'invitaciones_web' exista")
            return 1

    return 0

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)