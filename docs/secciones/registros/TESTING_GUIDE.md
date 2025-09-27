# Guía de Testing - API Create Invitation

## Tests Manuales con cURL

### Test 1: Invitación Básica (Caso Exitoso)

```bash
curl -X POST http://localhost:5000/api/invitations/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_data": {
      "email": "test@example.com",
      "first_name": "Test",
      "last_name": "User",
      "phone": "+51999000111"
    },
    "invitation_basic": {
      "template_id": 1,
      "plan_id": 1,
      "event_date": "2025-12-31T18:00:00",
      "event_location": "Lima, Peru"
    },
    "sections_data": {
      "portada": {
        "nombre_novio": "Carlos",
        "nombre_novia": "Ana"
      }
    }
  }'
```

**Resultado esperado:** Status 201 + datos completos de invitación

### Test 2: Email Faltante (Error 400)

```bash
curl -X POST http://localhost:5000/api/invitations/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_data": {
      "first_name": "Test"
    },
    "invitation_basic": {
      "plan_id": 1
    },
    "sections_data": {}
  }'
```

**Resultado esperado:** Status 400 + "Email is required"

### Test 3: Plan ID Inválido (Error 400)

```bash
curl -X POST http://localhost:5000/api/invitations/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_data": {
      "email": "test2@example.com",
      "first_name": "Test"
    },
    "invitation_basic": {
      "plan_id": 999
    },
    "sections_data": {}
  }'
```

**Resultado esperado:** Status 400 + "Invalid plan ID"

### Test 4: Múltiples Secciones (Caso Complejo)

```bash
curl -X POST http://localhost:5000/api/invitations/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_data": {
      "email": "wedding@example.com",
      "first_name": "Maria",
      "last_name": "Rodriguez",
      "phone": "+51987654321"
    },
    "invitation_basic": {
      "template_id": 2,
      "plan_id": 1,
      "event_date": "2025-06-20T17:00:00",
      "event_location": "Barranco, Lima"
    },
    "sections_data": {
      "portada": {
        "nombre_novio": "Diego",
        "nombre_novia": "Maria",
        "mensaje_principal": "Nos casamos y queremos celebrarlo contigo"
      },
      "familiares": {
        "padre_novio": "Roberto Rodriguez",
        "madre_novio": "Carmen Silva",
        "padre_novia": "Luis Martinez",
        "madre_novia": "Ana Gutierrez"
      },
      "timeline": {
        "ceremonia_hora": "17:00",
        "ceremonia_lugar": "Iglesia San Francisco",
        "recepcion_hora": "19:30",
        "recepcion_lugar": "Salón Los Jardines"
      },
      "galeria": {
        "gallery_images": [
          {
            "url": "https://kossomet.com/invita/uploads/foto1.jpg",
            "alt": "Foto de compromiso"
          },
          {
            "url": "https://kossomet.com/invita/uploads/foto2.jpg",
            "alt": "Foto en la playa"
          }
        ]
      }
    }
  }'
```

**Resultado esperado:** Status 201 + 4 secciones creadas

## Tests Automatizados (Python)

### Script de Testing Completo

```python
#!/usr/bin/env python3
"""
Test script for POST /api/invitations/create endpoint
Run: python test_create_endpoint.py
"""

import requests
import json
import sys
import time

BASE_URL = "http://localhost:5000"
ENDPOINT = f"{BASE_URL}/api/invitations/create"

def test_successful_creation():
    """Test basic successful invitation creation"""
    print("🧪 Test 1: Successful invitation creation")

    data = {
        "user_data": {
            "email": f"test_{int(time.time())}@example.com",
            "first_name": "TestUser",
            "last_name": "Demo",
            "phone": "+51999000111"
        },
        "invitation_basic": {
            "template_id": 1,
            "plan_id": 1,
            "event_date": "2025-12-31T18:00:00",
            "event_location": "Lima, Peru"
        },
        "sections_data": {
            "portada": {
                "nombre_novio": "Carlos",
                "nombre_novia": "Ana"
            }
        }
    }

    try:
        response = requests.post(ENDPOINT, json=data)

        if response.status_code == 201:
            result = response.json()
            print("✅ SUCCESS: Invitation created")
            print(f"   Invitation ID: {result['invitation']['id']}")
            print(f"   URL: {result['invitation']['url']}")
            print(f"   Sections created: {result['sections']['total_created']}")
            return True
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_missing_email():
    """Test missing email validation"""
    print("\n🧪 Test 2: Missing email validation")

    data = {
        "user_data": {
            "first_name": "Test"
        },
        "invitation_basic": {
            "plan_id": 1
        },
        "sections_data": {}
    }

    try:
        response = requests.post(ENDPOINT, json=data)

        if response.status_code == 400:
            result = response.json()
            if "Email is required" in result.get('message', ''):
                print("✅ SUCCESS: Correctly rejected missing email")
                return True
            else:
                print(f"❌ FAILED: Wrong error message: {result.get('message')}")
                return False
        else:
            print(f"❌ FAILED: Expected 400, got {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_invalid_plan():
    """Test invalid plan ID"""
    print("\n🧪 Test 3: Invalid plan ID")

    data = {
        "user_data": {
            "email": f"testplan_{int(time.time())}@example.com",
            "first_name": "Test"
        },
        "invitation_basic": {
            "plan_id": 999999
        },
        "sections_data": {}
    }

    try:
        response = requests.post(ENDPOINT, json=data)

        if response.status_code == 400:
            result = response.json()
            if "Invalid plan ID" in result.get('message', ''):
                print("✅ SUCCESS: Correctly rejected invalid plan")
                return True
            else:
                print(f"❌ FAILED: Wrong error message: {result.get('message')}")
                return False
        else:
            print(f"❌ FAILED: Expected 400, got {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_multiple_sections():
    """Test creation with multiple sections"""
    print("\n🧪 Test 4: Multiple sections creation")

    data = {
        "user_data": {
            "email": f"multi_{int(time.time())}@example.com",
            "first_name": "MultiTest",
            "last_name": "User",
            "phone": "+51987123456"
        },
        "invitation_basic": {
            "template_id": 1,
            "plan_id": 1,
            "event_date": "2025-08-15T16:30:00",
            "event_location": "Cusco, Peru"
        },
        "sections_data": {
            "portada": {
                "nombre_novio": "Luis",
                "nombre_novia": "Carmen"
            },
            "familiares": {
                "padre_novio": "Carlos Mendez",
                "madre_novio": "Rosa Lopez",
                "padre_novia": "Miguel Torres",
                "madre_novia": "Elena Vargas"
            },
            "timeline": {
                "ceremonia_hora": "16:30",
                "ceremonia_lugar": "Catedral del Cusco",
                "recepcion_hora": "19:00",
                "recepcion_lugar": "Hotel Libertador"
            }
        }
    }

    try:
        response = requests.post(ENDPOINT, json=data)

        if response.status_code == 201:
            result = response.json()
            sections_created = result['sections']['total_created']
            if sections_created >= 3:
                print(f"✅ SUCCESS: Created {sections_created} sections")
                print(f"   Section types: {result['sections']['section_types']}")
                return True
            else:
                print(f"❌ FAILED: Expected 3+ sections, got {sections_created}")
                return False
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and show summary"""
    print("🚀 Running API Create Invitation Tests\n")

    tests = [
        test_successful_creation,
        test_missing_email,
        test_invalid_plan,
        test_multiple_sections
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1

    print(f"\n📊 Test Summary: {passed}/{total} passed")

    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed!")
        return 1

if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)
```

### Ejecutar Tests

```bash
# 1. Asegurar que el servidor está corriendo
cd backend
python app.py

# 2. En otra terminal, ejecutar tests
python test_create_endpoint.py
```

## Verificación en Base de Datos

### SQL Queries para Verificar Creación

```sql
-- Verificar usuarios creados
SELECT id, email, first_name, last_name, created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- Verificar órdenes creadas
SELECT o.id, o.order_number, o.total, o.status, u.email
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 10;

-- Verificar invitaciones creadas
SELECT i.id, i.title, i.groom_name, i.bride_name,
       i.wedding_date, i.status, u.email
FROM invitations i
JOIN users u ON i.user_id = u.id
ORDER BY i.created_at DESC
LIMIT 10;

-- Verificar secciones creadas
SELECT s.id, s.invitation_id, s.section_type, s.section_variant,
       JSON_LENGTH(s.variables_json) as variables_count
FROM invitation_sections_data s
ORDER BY s.created_at DESC
LIMIT 10;

-- Query completa para ver toda la información
SELECT
    u.email,
    i.id as invitation_id,
    i.groom_name,
    i.bride_name,
    o.order_number,
    o.total,
    COUNT(s.id) as sections_count,
    GROUP_CONCAT(s.section_type) as section_types
FROM users u
JOIN invitations i ON u.id = i.user_id
JOIN orders o ON i.order_id = o.id
LEFT JOIN invitation_sections_data s ON i.id = s.invitation_id
GROUP BY u.id, i.id, o.id
ORDER BY i.created_at DESC
LIMIT 5;
```

## Troubleshooting Common Issues

### Error: "users.email UNIQUE constraint failed"
**Solución:** El email ya existe, el endpoint debería usar el usuario existente

### Error: "Invalid plan ID"
**Solución:** Verificar que existen planes en la tabla `plans`

```sql
SELECT id, name, price FROM plans;
```

### Error: "Foreign key constraint fails"
**Solución:** Verificar que todas las tablas relacionadas existen y tienen datos

```sql
SHOW TABLES LIKE '%invitation%';
SHOW TABLES LIKE '%plan%';
SHOW TABLES LIKE '%order%';
```

### Error: "JSON column error"
**Solución:** Verificar que MySQL soporta JSON (>= 5.7)

```sql
SELECT VERSION();
```