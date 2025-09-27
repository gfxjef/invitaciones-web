# Documentación API - Registro de Invitaciones

## Índice de Documentación

Esta carpeta contiene toda la documentación relacionada con el endpoint de creación de invitaciones para usuarios anónimos.

### 📋 Archivos Disponibles

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| [`API_ENDPOINT_CREATE.md`](./API_ENDPOINT_CREATE.md) | **Documentación completa del endpoint** | Referencia técnica completa |
| [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) | **Guía de testing y verificación** | Tests manuales y automatizados |
| [`README.md`](./README.md) | **Este archivo - índice general** | Navegación de documentos |

## 🚀 Quick Start

### 1. Endpoint Principal
```
POST /api/invitations/create
```

### 2. Request Básico
```json
{
  "user_data": {
    "email": "usuario@email.com",
    "first_name": "Nombre"
  },
  "invitation_basic": {
    "plan_id": 1
  },
  "sections_data": {
    "portada": {
      "nombre_novio": "Novio",
      "nombre_novia": "Novia"
    }
  }
}
```

### 3. Test Rápido
```bash
curl -X POST http://localhost:5000/api/invitations/create \
  -H "Content-Type: application/json" \
  -d '{"user_data":{"email":"test@email.com","first_name":"Test"},"invitation_basic":{"plan_id":1},"sections_data":{}}'
```

## 📚 Documentación por Tipo de Usuario

### Para Desarrolladores Backend
- ✅ **Leer:** [`API_ENDPOINT_CREATE.md`](./API_ENDPOINT_CREATE.md) - Sección "Proceso Interno"
- ✅ **Ejecutar:** [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) - Tests automatizados

### Para Desarrolladores Frontend
- ✅ **Leer:** [`API_ENDPOINT_CREATE.md`](./API_ENDPOINT_CREATE.md) - Sección "Integración Frontend"
- ✅ **Copiar:** Ejemplos de JavaScript/React

### Para QA y Testing
- ✅ **Leer:** [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) - Tests manuales con cURL
- ✅ **Ejecutar:** Script de testing automatizado

### Para Product Managers
- ✅ **Leer:** [`API_ENDPOINT_CREATE.md`](./API_ENDPOINT_CREATE.md) - Sección "¿Por qué este diseño?"

## 🔧 Arquitectura del Endpoint

```
Frontend Form → POST /api/invitations/create → Backend
                                                    ↓
                                            [Transaction Start]
                                                    ↓
                                      1. Create/Get User
                                                    ↓
                                        2. Validate Plan
                                                    ↓
                                        3. Create Order
                                                    ↓
                                      4. Create Invitation
                                                    ↓
                                       5. Create Sections
                                                    ↓
                                          [Transaction Commit]
                                                    ↓
                                     Return URL + Complete Data
```

## 💾 Base de Datos

### Tablas Afectadas
- `users` - Usuario (creado o existente)
- `orders` - Orden PENDING
- `order_items` - Item de la orden
- `invitations` - Invitación principal
- `invitation_sections_data` - Secciones con JSON

### Relaciones
```
User (1) → (N) Orders (1) → (1) Invitation (1) → (N) Sections
```

## 🔍 Validaciones Implementadas

### Server-Side
- ✅ Email obligatorio y único
- ✅ Nombre obligatorio
- ✅ Plan ID válido
- ✅ Transacción ACID completa

### Errores Manejados
- ❌ 400 - Campos faltantes
- ❌ 400 - Plan inválido
- ❌ 409 - Email duplicado
- ❌ 500 - Errores de servidor

## 📊 Analytics y Tracking

### Datos Capturados
- Usuario por invitación
- Plan seleccionado
- Secciones utilizadas
- Timestamp de creación

### Business Intelligence
- Conversión por plan
- Secciones más populares
- Análisis de abandono

## 🚨 Notas Importantes

### Usuarios Anónimos
- No requiere autenticación
- Password = "anonymous"
- Email único por usuario

### Transacciones
- Todo o nada (ACID)
- Rollback automático en error
- Consistencia garantizada

### Rendimiento
- Una sola transacción DB
- JSON optimizado para queries
- Indexes para analytics

## 🤝 Contribución

### Para Agregar Nueva Documentación
1. Crear archivo en esta carpeta
2. Actualizar este README.md
3. Referenciar desde documentos existentes

### Para Reportar Issues
1. Verificar con tests en [`TESTING_GUIDE.md`](./TESTING_GUIDE.md)
2. Incluir request/response completo
3. Indicar versión y ambiente

---

**Última actualización:** Septiembre 2024
**Versión API:** 1.0
**Endpoint:** `POST /api/invitations/create`