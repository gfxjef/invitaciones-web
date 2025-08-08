#!/usr/bin/env python3
"""
Script para probar los endpoints de la API
"""

import requests
import json
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

BASE_URL = f"http://localhost:{os.getenv('FLASK_PORT', 5000)}"

def test_health():
    """Probar endpoint de salud"""
    print("[TEST] Probando endpoint /health...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("[OK] Health check OK:", response.json())
            return True
        else:
            print(f"[ERROR] Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Error conectando al servidor: {e}")
        return False

def test_register():
    """Probar registro de usuario"""
    print("\n[TEST] Probando registro de usuario...")
    
    user_data = {
        "email": "test@example.com",
        "password": "password123",
        "first_name": "Usuario",
        "last_name": "Prueba",
        "phone": "123456789"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=user_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            data = response.json()
            print("[OK] Usuario registrado exitosamente!")
            print(f"   Usuario: {data['user']['email']}")
            print(f"   Token: {data['access_token'][:20]}...")
            return data['access_token']
        else:
            print(f"[ERROR] Error registrando usuario: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
    except Exception as e:
        print(f"[ERROR] Error en registro: {e}")
        return None

def test_login():
    """Probar login"""
    print("\n🔑 Probando login...")
    
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login exitoso!")
            print(f"   Usuario: {data['user']['email']}")
            print(f"   Token: {data['access_token'][:20]}...")
            return data['access_token']
        else:
            print(f"❌ Error en login: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error en login: {e}")
        return None

def test_protected_endpoint(token):
    """Probar endpoint protegido"""
    print("\n🔒 Probando endpoint protegido /api/auth/me...")
    
    if not token:
        print("❌ No hay token disponible")
        return False
    
    try:
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint protegido OK!")
            print(f"   Usuario: {data['user']['email']}")
            print(f"   Nombre: {data['user']['first_name']} {data['user']['last_name']}")
            return True
        else:
            print(f"❌ Error en endpoint protegido: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error probando endpoint protegido: {e}")
        return False

def test_plans():
    """Probar endpoint de planes"""
    print("\n💰 Probando endpoint /api/plans...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/plans/")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Planes obtenidos exitosamente!")
            print(f"   Número de planes: {len(data['plans'])}")
            for plan in data['plans']:
                print(f"   - {plan['name']}: S/ {plan['price']}")
            return True
        else:
            print(f"❌ Error obteniendo planes: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error probando planes: {e}")
        return False

def main():
    """Ejecutar todas las pruebas"""
    print("[INFO] Iniciando pruebas de API...\n")
    
    # Probar salud del servidor
    if not test_health():
        print("❌ Servidor no está respondiendo. Asegúrate de que Flask esté ejecutándose.")
        return
    
    # Probar registro
    token = test_register()
    
    # Si el registro falló (usuario ya existe), probar login
    if not token:
        token = test_login()
    
    # Probar endpoint protegido
    test_protected_endpoint(token)
    
    # Probar planes
    test_plans()
    
    print("\n🎉 Pruebas completadas!")

if __name__ == "__main__":
    main()