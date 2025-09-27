#!/usr/bin/env python3
"""
Script para instalar dependencias en el entorno virtual.
Ejecutar después de activar el venv para asegurar que todas las dependencias estén instaladas.
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Ejecutar comando y mostrar resultado."""
    print(f"\n[INFO] {description}")
    print(f"[CMD] {command}")

    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"[OK] {description} - Completado")
        if result.stdout:
            print(f"[OUTPUT] {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] {description} - Falló")
        print(f"[ERROR] {e.stderr}")
        return False

def check_virtual_environment():
    """Verificar si estamos en un entorno virtual."""
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("[INFO] Ejecutando en entorno virtual")
        return True
    else:
        print("[WARNING] NO se detectó entorno virtual activo")
        print("[INFO] Para activar el entorno virtual:")
        print("       Windows: venv\\Scripts\\activate")
        print("       Linux/Mac: source venv/bin/activate")
        return False

def main():
    """Función principal de instalación."""
    print("="*60)
    print("🔧 INSTALADOR DE DEPENDENCIAS GOOGLE OAUTH")
    print("="*60)

    # Verificar entorno virtual
    is_venv = check_virtual_environment()
    if not is_venv:
        response = input("\n¿Continuar sin entorno virtual? (y/N): ")
        if response.lower() != 'y':
            print("Abortando instalación.")
            return False

    # Actualizar pip
    if not run_command(f"{sys.executable} -m pip install --upgrade pip",
                      "Actualizando pip"):
        return False

    # Instalar dependencias del archivo requirements.txt
    if not run_command(f"{sys.executable} -m pip install -r requirements.txt",
                      "Instalando dependencias desde requirements.txt"):
        return False

    # Verificar instalaciones críticas
    critical_packages = [
        "flask-dance",
        "google-auth",
        "flask",
        "sqlalchemy",
        "flask-jwt-extended"
    ]

    print(f"\n[INFO] Verificando instalaciones críticas...")
    for package in critical_packages:
        if not run_command(f"{sys.executable} -m pip show {package}",
                          f"Verificando {package}"):
            print(f"[WARNING] {package} no está instalado correctamente")

    # Verificar importaciones Python
    print(f"\n[INFO] Verificando importaciones Python...")
    try:
        import flask_dance
        print("[OK] flask_dance - Importación exitosa")
    except ImportError as e:
        print(f"[ERROR] flask_dance - Error de importación: {e}")
        return False

    try:
        import google.auth
        print("[OK] google.auth - Importación exitosa")
    except ImportError as e:
        print(f"[ERROR] google.auth - Error de importación: {e}")
        return False

    try:
        from flask_dance.contrib.google import make_google_blueprint
        print("[OK] flask_dance.contrib.google - Importación exitosa")
    except ImportError as e:
        print(f"[ERROR] flask_dance.contrib.google - Error de importación: {e}")
        return False

    print("\n" + "="*60)
    print("✅ INSTALACIÓN COMPLETADA EXITOSAMENTE")
    print("="*60)
    print("\n🚀 Para ejecutar el servidor:")
    print("   python app.py")
    print("\n🔍 Para verificar:")
    print("   curl http://localhost:5000/health")

    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n[INFO] Instalación cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Error inesperado: {e}")
        sys.exit(1)