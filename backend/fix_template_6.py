#!/usr/bin/env python3
"""
Fix Template 6 Script

WHY: Template ID 6 (Elegante Dorado) is missing the template_file field,
causing the frontend to show "Template No Disponible" error.

WHAT: Updates template ID 6 to have template_file='elegante_dorado'
so it maps correctly to the EleganteDorado component.

Usage: python fix_template_6.py
"""

import sys
import os
from dotenv import load_dotenv

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

def fix_template_6():
    """Fix template ID 6 by adding template_file field"""

    print("Buscando template ID 6...")

    # Find template by ID
    template = Template.query.get(6)

    if not template:
        print("ERROR: Template ID 6 no encontrado")
        return False

    print(f"ENCONTRADO: Template '{template.name}'")
    print(f"  * template_file actual: '{template.template_file or 'VACIO'}'")
    print(f"  * categoria: {template.category}")
    print(f"  * activo: {'Si' if template.is_active else 'No'}")

    # Update template_file if it's missing
    if not template.template_file or template.template_file.strip() == '':
        print("\nActualizando template_file...")
        template.template_file = 'elegante_dorado'

        try:
            db.session.commit()
            print("EXITO: template_file actualizado a 'elegante_dorado'")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"ERROR: No se pudo actualizar: {e}")
            return False
    else:
        print(f"INFO: template_file ya está configurado: '{template.template_file}'")
        return True

def verify_fix():
    """Verify that the fix worked"""
    print("\nVerificando template ID 6...")

    template = Template.query.get(6)
    if template:
        print(f"  - {template.name}")
        print(f"    * template_file: '{template.template_file}'")
        print(f"    * ID: {template.id}")
        print(f"    * Categoria: {template.category}")
        print(f"    * Activo: {'Si' if template.is_active else 'No'}")

        if template.template_file == 'elegante_dorado':
            print("✅ CORRECCION EXITOSA: template_file configurado correctamente")
            return True
        else:
            print("❌ ERROR: template_file no está configurado correctamente")
            return False
    else:
        print("❌ ERROR: Template no encontrado")
        return False

def main():
    """Main execution function"""
    print("Script para corregir Template ID 6")
    print("=" * 40)

    # Create Flask app and push context
    app = create_app()

    with app.app_context():
        try:
            # Test database connection
            from sqlalchemy import text
            db.session.execute(text('SELECT 1'))
            print("OK: Conexion a base de datos exitosa")

            # Fix template
            if fix_template_6():
                # Verify fix
                if verify_fix():
                    print("\nProximos pasos:")
                    print("1. Refresca la página http://localhost:3000/invitacion/demo/6")
                    print("2. Debería mostrar el diseño ClasicoRomance correctamente")
                    print("\nListo! Template 6 corregido.")
                else:
                    print("ERROR: La verificación falló")
                    return 1
            else:
                print("ERROR: No se pudo corregir el template")
                return 1

        except Exception as e:
            print(f"ERROR: Error de conexion a base de datos: {e}")
            print("INFO: Asegurate de que MySQL este ejecutandose y la base de datos 'invitaciones_web' exista")
            return 1

    return 0

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)