#!/usr/bin/env python3
"""
Script para inicializar la base de datos con las tablas necesarias
"""

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate, init, migrate, upgrade
from app import create_app, db
from models import User
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def init_database():
    """Inicializar base de datos y crear tablas"""
    
    print("[INFO] Inicializando base de datos...")
    
    # Crear aplicación Flask
    app = create_app()
    
    with app.app_context():
        try:
            # Verificar conexión a la base de datos
            print("[INFO] Verificando conexion a MySQL...")
            from sqlalchemy import text
            with db.engine.connect() as connection:
                connection.execute(text('SELECT 1'))
            print("[OK] Conexion a MySQL exitosa!")
            
            # Crear todas las tablas
            print("[INFO] Creando tablas...")
            db.create_all()
            print("[OK] Tablas creadas exitosamente!")
            
            # Verificar si hay usuarios
            user_count = User.query.count()
            print(f"[INFO] Usuarios existentes: {user_count}")
            
            # Crear usuario administrador si no existe
            admin_email = os.getenv('ADMIN_EMAIL', 'admin@invitaciones.com')
            admin = User.query.filter_by(email=admin_email).first()
            
            if not admin:
                print("[INFO] Creando usuario administrador...")
                from models.user import UserRole
                admin = User(
                    email=admin_email,
                    first_name=os.getenv('ADMIN_NAME', 'Administrador'),
                    last_name='Sistema',
                    role=UserRole.ADMIN,
                    is_active=True,
                    email_verified=True
                )
                admin.set_password(os.getenv('ADMIN_PASSWORD', 'admin123'))
                db.session.add(admin)
                db.session.commit()
                print(f"[OK] Usuario admin creado: {admin_email}")
            else:
                print(f"[INFO] Usuario admin ya existe: {admin_email}")
                
            print("\n[SUCCESS] Base de datos inicializada correctamente!")
            print("\n[INFO] Informacion de conexion:")
            print(f"   Host: {os.getenv('DB_HOST')}")
            print(f"   Base de datos: {os.getenv('DB_NAME')}")
            print(f"   Usuario: {os.getenv('DB_USER')}")
            print(f"   Puerto: {os.getenv('DB_PORT')}")
            
            if admin:
                print(f"\n[INFO] Credenciales de admin:")
                print(f"   Email: {admin_email}")
                print(f"   Password: {os.getenv('ADMIN_PASSWORD', 'admin123')}")
            
            return True
            
        except Exception as e:
            print(f"[ERROR] Error inicializando base de datos: {e}")
            print("\n[INFO] Verifica que:")
            print("   1. Las credenciales de MySQL sean correctas")
            print("   2. La base de datos existe")
            print("   3. El servidor MySQL este accesible")
            return False

def test_connection():
    """Probar conexión a la base de datos"""
    app = create_app()
    
    with app.app_context():
        try:
            # Intentar ejecutar una consulta simple
            from sqlalchemy import text
            with db.engine.connect() as connection:
                result = connection.execute(text('SELECT VERSION()'))
                version = result.fetchone()[0]
                print(f"[OK] Conexion exitosa! MySQL version: {version}")
            return True
        except Exception as e:
            print(f"[ERROR] Error de conexion: {e}")
            return False

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # Solo probar conexión
        test_connection()
    else:
        # Inicializar completamente
        init_database()