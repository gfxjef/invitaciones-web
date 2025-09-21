#!/usr/bin/env python3
"""
DEPRECATED: Migración de Datos para Campos Modulares

⚠️  IMPORTANTE: Este archivo ya NO ES NECESARIO

WHY DEPRECATED: El sistema ahora usa los componentes de frontend como single source of truth.
Los valores default se obtienen directamente de:
- frontend/src/components/templates/sections/*/DefaultProps

El backend solo devuelve datos RAW de la BD, sin aplicar defaults hardcodeados.

LEGACY INFO: Anteriormente agregaba campos predeterminados a InvitationData con
valores hardcodeados en inglés que causaban inconsistencias.

DO NOT RUN: Este script insertaría datos hardcodeados que entrarían en conflicto
con el nuevo sistema unificado.
"""

import sys
import os
from dotenv import load_dotenv
import json
from datetime import datetime

# Load environment variables
load_dotenv()

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from extensions import db
from models.invitation import Invitation
from models.invitation_data import InvitationData

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

def get_default_modular_fields():
    """
    Define default values for all 42 modular fields

    Returns:
        Dict with field_name -> default_value mappings
    """
    return {
        # WELCOME SECTION (5 campos)
        'welcome_banner_image': 'https://i.imgur.com/svWa52m.png',
        'welcome_couple_photo': 'https://i.imgur.com/OFaT2vQ.png',
        'welcome_text_custom': 'HELLO & WELCOME',
        'welcome_title_custom': "We're getting married!",
        'welcome_description': "Today and always, beyond tomorrow, I need you beside me, always as my best friend, lover and forever soul mate. A beautiful celebration of love awaits us.",

        # COUPLE SECTION (8 campos)
        'couple_bride_photo': 'https://i.imgur.com/u1wA4oo.png',
        'couple_groom_photo': 'https://i.imgur.com/qL42vPA.png',
        'couple_bride_description': 'A beautiful soul with a heart full of love and dreams.',
        'couple_groom_description': 'A loving partner ready to start this new journey together.',
        'couple_bride_role': 'The Bride',
        'couple_groom_role': 'The Groom',
        'social_facebook': '#',
        'social_twitter': '#',

        # COUNTDOWN SECTION (4 campos)
        'countdown_background_image': 'https://i.imgur.com/7p4m1iH.png',
        'countdown_pretitle': 'WE WILL BECOME A FAMILY IN',
        'countdown_title': "We're getting married in",
        'countdown_target_date': None,  # Will be set from invitation.wedding_date

        # STORY SECTION (1 campo JSON)
        'story_moments': [
            {
                "date": "JULY 20, 2015",
                "title": "First time we meet",
                "description": "First time we meet viverra tristique duis vitae diam the nesumen nivamus aestan ateuene artines finibus. A magical moment that started our journey.",
                "imageUrl": "https://i.imgur.com/83AAp8B.png"
            },
            {
                "date": "AUGUST 1, 2016",
                "title": "Our First Date",
                "description": "A wonderful evening under the stars that marked the beginning of our journey together. The conversation flowed as easily as the wine.",
                "imageUrl": "https://images.pexels.com/photos/3784433/pexels-photo-3784433.jpeg?auto=compress&cs=tinysrgb&w=1260"
            },
            {
                "date": "JUNE 25, 2022",
                "title": "The Proposal",
                "description": "The moment when everything became perfect and our future together was sealed with a beautiful 'Yes!'",
                "imageUrl": "https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=1260"
            }
        ],

        # VIDEO SECTION (4 campos)
        'video_background_image': 'https://i.imgur.com/KxT5vJM.png',
        'video_embed_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        'video_pretitle': 'A LOVE STORY BEGINNING',
        'video_title': 'Watch our love story',

        # GALLERY SECTION (2 campos)
        'gallery_photos_urls': [
            {
                "id": 1,
                "url": "https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=800",
                "alt": "Wedding photo 1",
                "category": "ceremony"
            },
            {
                "id": 2,
                "url": "https://images.pexels.com/photos/3784433/pexels-photo-3784433.jpeg?auto=compress&cs=tinysrgb&w=800",
                "alt": "Wedding photo 2",
                "category": "party"
            },
            {
                "id": 3,
                "url": "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800",
                "alt": "Wedding photo 3",
                "category": "couple"
            }
        ],
        'gallery_categories': [
            {"key": "all", "label": "All Photos"},
            {"key": "ceremony", "label": "Ceremony"},
            {"key": "party", "label": "Party"},
            {"key": "couple", "label": "Couple"}
        ],

        # EVENT DETAILS (3 campos adicionales)
        'event_ceremony_time': '4:00 PM',
        'event_reception_time': '7:00 PM',
        'event_timezone': 'America/Lima',

        # LOCATION DETAILS (3 campos)
        'event_ceremony_venue_name': 'Beautiful Church',
        'event_reception_venue_name': 'Elegant Reception Hall',
        'event_google_maps_url': 'https://maps.google.com',

        # SECCIÓN CONTROL (12 campos de configuración)
        'section_hero_enabled': True,
        'section_welcome_enabled': True,
        'section_couple_enabled': True,
        'section_countdown_enabled': True,
        'section_story_enabled': True,
        'section_video_enabled': True,
        'section_gallery_enabled': True,
        'section_footer_enabled': True,
        'template_primary_color': '#d97706',      # amber-600
        'template_secondary_color': '#374151',    # gray-700
        'template_accent_color': '#fbbf24',       # amber-400
        'template_custom_css': ''
    }

def migrate_invitation_data(invitation):
    """
    Add modular fields to a specific invitation

    Args:
        invitation: Invitation instance
    """
    print(f"  Migrando invitación ID {invitation.id}: {invitation.title}")

    # Get existing data fields for this invitation
    existing_fields = {
        field.field_name: field
        for field in InvitationData.query.filter_by(invitation_id=invitation.id).all()
    }

    # Get default values
    default_fields = get_default_modular_fields()

    # Track new fields added
    new_fields_count = 0

    for field_name, default_value in default_fields.items():
        if field_name not in existing_fields:
            # Handle special cases that need invitation-specific data
            if field_name == 'countdown_target_date':
                default_value = invitation.wedding_date.isoformat() if invitation.wedding_date else datetime.now().isoformat()
            elif field_name == 'welcome_title_custom':
                if invitation.bride_name and invitation.groom_name:
                    default_value = f"{invitation.bride_name} & {invitation.groom_name} are getting married!"
            elif field_name == 'event_ceremony_venue_name':
                default_value = invitation.ceremony_location or 'Beautiful Church'
            elif field_name == 'event_reception_venue_name':
                default_value = invitation.reception_location or 'Elegant Reception Hall'

            # Create new field
            new_field = InvitationData(
                invitation_id=invitation.id,
                field_name=field_name
            )
            new_field.set_typed_value(default_value)
            db.session.add(new_field)
            new_fields_count += 1

            print(f"    + {field_name}: {str(default_value)[:50]}{'...' if len(str(default_value)) > 50 else ''}")

    return new_fields_count

def migrate_all_invitations():
    """Migrate all existing invitations to include modular fields"""
    print("Iniciando migración de campos modulares...")
    print("=" * 60)

    # Get all invitations
    invitations = Invitation.query.all()

    if not invitations:
        print("No se encontraron invitaciones para migrar.")
        return 0

    print(f"Encontradas {len(invitations)} invitaciones para migrar")
    print()

    total_new_fields = 0

    for invitation in invitations:
        try:
            new_fields_count = migrate_invitation_data(invitation)
            total_new_fields += new_fields_count

            if new_fields_count > 0:
                print(f"    OK: {new_fields_count} campos nuevos agregados")
            else:
                print(f"    OK: Ya tiene todos los campos modulares")

        except Exception as e:
            print(f"    ERROR: Error migrando invitacion {invitation.id}: {e}")
            db.session.rollback()
            continue

        print()

    # Commit all changes
    try:
        db.session.commit()
        print(f"EXITO: Migracion completada exitosamente!")
        print(f"INFO: Total de campos nuevos agregados: {total_new_fields}")
        return total_new_fields

    except Exception as e:
        db.session.rollback()
        print(f"ERROR: Error al guardar cambios: {e}")
        return 0

def verify_migration():
    """Verify that migration was successful"""
    print("\nVerificando migración...")
    print("=" * 40)

    # Check a sample invitation
    invitation = Invitation.query.first()
    if not invitation:
        print("No hay invitaciones para verificar")
        return

    # Get all fields for this invitation
    fields = InvitationData.query.filter_by(invitation_id=invitation.id).all()
    field_names = {field.field_name for field in fields}

    # Check expected fields
    expected_fields = set(get_default_modular_fields().keys())
    missing_fields = expected_fields - field_names

    print(f"Invitación de muestra ID {invitation.id}:")
    print(f"  - Campos totales: {len(fields)}")
    print(f"  - Campos modulares esperados: {len(expected_fields)}")
    print(f"  - Campos faltantes: {len(missing_fields)}")

    if missing_fields:
        print(f"  - Campos faltantes: {', '.join(list(missing_fields)[:5])}{'...' if len(missing_fields) > 5 else ''}")
    else:
        print("  OK: Todos los campos modulares estan presentes")

def main():
    """Main execution function"""
    print("Script de Migración de Campos Modulares")
    print("=" * 50)

    # Create Flask app and push context
    app = create_app()

    with app.app_context():
        try:
            # Test database connection
            from sqlalchemy import text
            db.session.execute(text('SELECT 1'))
            print("OK: Conexion a base de datos exitosa")

            # Run migration
            total_new_fields = migrate_all_invitations()

            if total_new_fields > 0:
                # Verify migration
                verify_migration()

                print("\nProximos pasos:")
                print("1. Actualizar TemplateBuilder.tsx para usar estos campos")
                print("2. Crear interfaz de editor para configurar las secciones")
                print("3. Probar el sistema modular con invitaciones existentes")
                print("\nSistema modular listo para usar!")
            else:
                print("\nNo se agregaron campos nuevos (ya existian)")

        except Exception as e:
            print(f"ERROR: Error de conexion a base de datos: {e}")
            print("INFO: Asegurate de que MySQL este ejecutandose y la base de datos 'invitaciones_web' exista")
            return 1

    return 0

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)