# API Endpoint: POST /api/invitations/create

## Descripción General

Endpoint diseñado para crear invitaciones completas de usuarios anónimos en una sola transacción. Ideal para formularios frontales donde los usuarios completan todos los datos y envían de una vez.

**URL:** `POST /api/invitations/create`
**Autenticación:** No requerida (usuarios anónimos)
**Content-Type:** `application/json`

## ¿Por qué este diseño?

✅ **Sin sesiones** - Perfecto para usuarios anónimos
✅ **Transacción completa** - Todo se crea en una operación
✅ **Compatible con live preview** - Frontend muestra cambios en tiempo real
✅ **Optimizado para analytics** - Datos estructurados para BI

## Estructura del Request

```json
{
  "user_data": {
    "email": "jefferson@example.com",        // OBLIGATORIO
    "first_name": "Jefferson",               // OBLIGATORIO
    "last_name": "Smith",                    // Opcional
    "phone": "+51999999999"                  // Opcional
  },
  "invitation_basic": {
    "template_id": 1,                        // ID del template
    "plan_id": 1,                           // OBLIGATORIO - ID del plan
    "event_date": "2024-12-15T17:00:00",    // ISO format
    "event_location": "LIMA, PERU"          // Ubicación del evento
  },
  "sections_data": {
    "portada": {
      "nombre_novio": "Jefferson",
      "nombre_novia": "Rosemery"
    },
    "familiares": {
      "padre_novio": "EFRAIN ALBERTH HERNANDEZ",
      "madre_novio": "ROCIO EZQUIVEL GARCIA",
      "padre_novia": "LAZARO MENESES RAMIREZ",
      "madre_novia": "ANA MARIA VAZQUEZ NIEVES"
    },
    "galeria": {
      "gallery_images": [
        {
          "url": "https://kossomet.com/invita/uploads/foto1.jpg",
          "alt": "Foto de compromiso"
        }
      ]
    }
  }
}
```

## Campos Obligatorios

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `user_data.email` | Email único del usuario | `"juan@email.com"` |
| `user_data.first_name` | Nombre del usuario | `"Juan"` |
| `invitation_basic.plan_id` | ID del plan seleccionado | `1` |

## Estructura del Response (Éxito)

**Status:** `201 Created`

```json
{
  "message": "Invitation created successfully",
  "invitation": {
    "id": 123,
    "title": "Invitación - Jefferson",
    "status": "draft",
    "url": "https://invitaciones.kossomet.com/i/ABC123XYZ",
    "access_code": "ABC123XYZ",
    "groom_name": "Jefferson",
    "bride_name": "Rosemery",
    "wedding_date": "2024-12-15T17:00:00.000000",
    "wedding_location": "LIMA, PERU",
    "template_name": "template_1",
    "created_at": "2024-09-25T10:30:00.000000"
  },
  "user": {
    "id": 45,
    "email": "jefferson@example.com",
    "full_name": "Jefferson Smith"
  },
  "order": {
    "id": 67,
    "order_number": "ORD-1727256600",
    "total": 290.00,
    "status": "PENDING",
    "plan_name": "Plan Básico"
  },
  "sections": {
    "total_created": 2,
    "section_types": ["portada", "familiares"]
  }
}
```

## Códigos de Error

### 400 - Bad Request
```json
{
  "message": "Email is required"
}
```

**Casos:**
- Email faltante
- Nombre faltante
- Plan ID faltante
- Datos de referencia inválidos

### 409 - Conflict
```json
{
  "message": "Email address already exists"
}
```

**Caso:** Email ya registrado (usa el usuario existente)

### 500 - Internal Server Error
```json
{
  "message": "Internal server error"
}
```

**Casos:** Errores de base de datos o del servidor

## Ejemplos de Uso

### 1. Invitación de Boda Básica

```bash
curl -X POST http://localhost:5000/api/invitations/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_data": {
      "email": "maria@example.com",
      "first_name": "María",
      "last_name": "García",
      "phone": "+51987654321"
    },
    "invitation_basic": {
      "template_id": 1,
      "plan_id": 1,
      "event_date": "2025-03-20T18:00:00",
      "event_location": "Iglesia San Pedro, Lima"
    },
    "sections_data": {
      "portada": {
        "nombre_novio": "Carlos",
        "nombre_novia": "María",
        "fecha_evento": "20 de Marzo, 2025",
        "ubicacion": "Lima, Perú"
      }
    }
  }'
```

### 2. Invitación con Múltiples Secciones

```bash
curl -X POST http://localhost:5000/api/invitations/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_data": {
      "email": "ana@example.com",
      "first_name": "Ana",
      "phone": "+51999888777"
    },
    "invitation_basic": {
      "plan_id": 2,
      "event_date": "2025-06-15T17:30:00",
      "event_location": "Hacienda Villa Hermosa"
    },
    "sections_data": {
      "portada": {
        "nombre_novio": "Luis",
        "nombre_novia": "Ana",
        "mensaje_principal": "Con gran alegría te invitamos"
      },
      "familiares": {
        "padre_novio": "José Luis Martínez",
        "madre_novio": "Carmen Flores",
        "padre_novia": "Roberto Silva",
        "madre_novia": "Elena Vargas"
      },
      "timeline": {
        "ceremonia_hora": "17:30",
        "ceremonia_lugar": "Capilla Santa Ana",
        "recepcion_hora": "19:00",
        "recepcion_lugar": "Salón Principal"
      }
    }
  }'
```

## Proceso Interno del Endpoint

1. **Validación** de campos obligatorios
2. **Transacción** de base de datos iniciada
3. **Usuario** creado o recuperado por email
4. **Plan** validado y recuperado
5. **Orden** creada con estado PENDING
6. **Invitación** creada con datos básicos
7. **Secciones** creadas en `invitation_sections_data`
8. **Commit** de toda la transacción
9. **URL única** generada para acceso
10. **Response** completo retornado

## Variables de Sección Soportadas

### Portada
- `nombre_novio` - Nombre del novio
- `nombre_novia` - Nombre de la novia
- `fecha_evento` - Fecha formateada del evento
- `ubicacion` - Ubicación del evento
- `mensaje_principal` - Mensaje principal de invitación

### Familiares
- `padre_novio` - Nombre del padre del novio
- `madre_novio` - Nombre de la madre del novio
- `padre_novia` - Nombre del padre de la novia
- `madre_novia` - Nombre de la madre de la novia

### Timeline
- `ceremonia_hora` - Hora de la ceremonia
- `ceremonia_lugar` - Lugar de la ceremonia
- `recepcion_hora` - Hora de la recepción
- `recepcion_lugar` - Lugar de la recepción

### Galería
- `gallery_images` - Array de objetos imagen con `url` y `alt`

## Integración Frontend

### JavaScript/Axios Example

```javascript
const createInvitation = async (formData) => {
  try {
    const response = await axios.post('/api/invitations/create', {
      user_data: {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone
      },
      invitation_basic: {
        template_id: formData.templateId,
        plan_id: formData.planId,
        event_date: formData.eventDate,
        event_location: formData.eventLocation
      },
      sections_data: formData.sections
    });

    // Redirect to invitation URL
    window.location.href = response.data.invitation.url;

  } catch (error) {
    console.error('Error creating invitation:', error.response.data.message);
  }
};
```

### React Hook Example

```javascript
const useCreateInvitation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createInvitation = async (invitationData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/invitations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invitationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      return data;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createInvitation, loading, error };
};
```

## Notas Importantes

### Rendimiento
- Una sola query por transacción
- Indexes optimizados en `invitation_sections_data`
- JSON storage para variables flexible

### Seguridad
- Validación server-side completa
- Transacciones ACID
- Rollback automático en errores

### Analytics
- Tracking completo user → order → invitation → sections
- Métricas por plan y categoría
- Business intelligence ready

### Escalabilidad
- Diseño sin estado (stateless)
- Compatible con load balancers
- Caching ready en frontend