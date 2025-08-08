#!/usr/bin/env python3
"""
Script para configurar el entorno de desarrollo del backend Flask
"""

import os
import subprocess
import sys
from pathlib import Path

def run_command(command, cwd=None):
    """Ejecutar comando del sistema"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error ejecutando: {command}")
            print(f"Error: {result.stderr}")
            return False
        print(result.stdout)
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def setup_backend():
    """Configurar entorno backend"""
    backend_dir = Path(__file__).parent
    print(f"📁 Configurando backend en: {backend_dir}")
    
    # Crear virtual environment
    print("🐍 Creando virtual environment...")
    venv_path = backend_dir / "venv"
    
    if venv_path.exists():
        print("✅ Virtual environment ya existe")
    else:
        if not run_command("python -m venv venv", cwd=backend_dir):
            print("❌ Error creando virtual environment")
            return False
        print("✅ Virtual environment creado")
    
    # Activar venv y instalar dependencias
    print("📦 Instalando dependencias...")
    
    if os.name == 'nt':  # Windows
        activate_cmd = r"venv\Scripts\activate"
        pip_cmd = r"venv\Scripts\pip"
    else:  # Linux/Mac
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    # Instalar dependencias
    if not run_command(f"{pip_cmd} install -r requirements.txt", cwd=backend_dir):
        print("❌ Error instalando dependencias")
        return False
    
    print("✅ Dependencias instaladas correctamente")
    
    # Verificar archivo .env
    env_file = backend_dir / ".env"
    env_example = backend_dir.parent / ".env.example"
    
    if not env_file.exists() and env_example.exists():
        print("📄 Copiando .env.example a backend/.env")
        with open(env_example, 'r') as f:
            content = f.read()
        with open(env_file, 'w') as f:
            f.write(content)
        print("⚠️  Recuerda configurar las variables en backend/.env")
    
    print("\n🎉 Backend configurado correctamente!")
    print("\n📋 Para ejecutar el servidor:")
    if os.name == 'nt':
        print("   cd backend")
        print("   venv\\Scripts\\activate")
        print("   flask run")
    else:
        print("   cd backend")
        print("   source venv/bin/activate")
        print("   flask run")
    
    return True

if __name__ == "__main__":
    if setup_backend():
        sys.exit(0)
    else:
        sys.exit(1)