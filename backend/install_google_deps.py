#!/usr/bin/env python
"""
Script para instalar las dependencias de Google OAuth en el entorno virtual.

Este script asegura que todas las dependencias necesarias para la autenticación
con Google estén correctamente instaladas.
"""

import subprocess
import sys
import os

def install_dependencies():
    """Instalar las dependencias de Google OAuth."""

    print("🚀 Instalando dependencias de Google OAuth...")
    print(f"📦 Python ejecutable: {sys.executable}")
    print(f"📁 Directorio actual: {os.getcwd()}")
    print("-" * 50)

    # Lista de dependencias a instalar
    dependencies = [
        "google-auth>=2.0.0",
        "google-auth-oauthlib>=1.0.0",
        "google-auth-httplib2>=0.1.0",
    ]

    # Instalar cada dependencia
    for dep in dependencies:
        print(f"\n📦 Instalando: {dep}")
        try:
            subprocess.check_call(
                [sys.executable, "-m", "pip", "install", dep],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            print(f"✅ Instalado exitosamente: {dep}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error instalando {dep}: {e}")
            # Intentar instalar sin versión específica
            package_name = dep.split(">=")[0]
            print(f"🔄 Intentando instalar {package_name} sin versión específica...")
            try:
                subprocess.check_call(
                    [sys.executable, "-m", "pip", "install", package_name],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                print(f"✅ Instalado: {package_name}")
            except subprocess.CalledProcessError as e2:
                print(f"❌ Error crítico instalando {package_name}: {e2}")
                return False

    print("\n" + "=" * 50)
    print("✅ Todas las dependencias instaladas exitosamente!")
    print("=" * 50)

    # Verificar instalación
    print("\n🔍 Verificando instalación...")
    try:
        import google.auth
        import google.auth.transport.requests
        from google.oauth2 import id_token
        print("✅ google.auth importado correctamente")
        print(f"   Versión: {google.auth.__version__ if hasattr(google.auth, '__version__') else 'Unknown'}")

        try:
            import google_auth_oauthlib
            print("✅ google_auth_oauthlib importado correctamente")
        except ImportError:
            print("⚠️  google_auth_oauthlib no pudo ser importado (puede no ser necesario)")

        print("\n✅ Verificación completa - Todo listo para Google OAuth!")
        return True

    except ImportError as e:
        print(f"❌ Error al verificar instalación: {e}")
        print("⚠️  Algunas dependencias no pudieron ser importadas")
        return False

if __name__ == "__main__":
    success = install_dependencies()
    if success:
        print("\n✨ Script completado exitosamente!")
        print("🔄 Reinicia el servidor Flask para aplicar los cambios.")
    else:
        print("\n⚠️  El script completó con advertencias.")
        print("🔄 Intenta ejecutar 'pip install -r requirements.txt' manualmente.")

    sys.exit(0 if success else 1)