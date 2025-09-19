# Invitation Editor Module API Documentation

## Overview
Sistema completo de edición de invitaciones con manejo de datos, eventos, media y publicación.

**Base URL**: `/api/invitations`

## Endpoints

### Data Management

#### 1. Save Invitation Data (Bulk)
Guardar o actualizar múltiples campos de datos de invitación.

**Endpoint**: `POST /api/invitations/{invitation_id}/data`
**Authentication**: Requerida (JWT)

##### Request Body
```json
{
  "couple_groom_name": "Juan Pérez",
  "couple_bride_name": "María García",
  "event_date": "2024-12-25",
  "event_time": "18:00",
  "event_venue_name": "Hotel Marriott",
  "event_venue_address": "Av. Larco 1234",
  "event_venue_city": "Lima",
  "message_welcome_text": "Nos casamos!",
  "gallery_hero_image": "/uploads/hero.jpg",
  "design_primary_color": "#FF6B6B",
  "design_secondary_color": "#4ECDC4"
}
```

##### Response (200 OK)
```json
{
  "message": "Data saved successfully",
  "data": {
    "id": 1,
    "invitation_id": 123,
    "couple_groom_name": "Juan Pérez",
    "couple_bride_name": "María García",
    "updated_fields": 11,
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 2. Get Invitation Data
Obtener todos los datos de una invitación.

**Endpoint**: `GET /api/invitations/{invitation_id}/data`
**Authentication**: Requerida (JWT)

##### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "invitation_id": 123,
    "couple_groom_name": "Juan Pérez",
    "couple_bride_name": "María García",
    "couple_groom_parents": "Sr. Pedro Pérez y Sra. Ana López",
    "couple_bride_parents": "Sr. Carlos García y Sra. Rosa Martínez",
    "event_date": "2024-12-25",
    "event_time": "18:00",
    "event_venue_name": "Hotel Marriott",
    "event_venue_address": "Av. Larco 1234",
    "event_venue_city": "Lima",
    "event_venue_location_url": "https://maps.google.com/...",
    "message_welcome_text": "Nos casamos!",
    "message_invitation_text": "Te invitamos a celebrar...",
    "gallery_hero_image": "/uploads/hero.jpg",
    "gallery_couple_image": "/uploads/couple.jpg",
    "design_primary_color": "#FF6B6B",
    "design_secondary_color": "#4ECDC4",
    "design_font_family": "Playfair Display",
    "rsvp_enabled": true,
    "rsvp_deadline": "2024-12-20",
    "rsvp_whatsapp": "+51999999999",
    "rsvp_email": "rsvp@wedding.com",
    "social_hashtag": "#JuanYMaria2024",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 3. Update Single Field
Actualizar un campo específico de datos.

**Endpoint**: `PUT /api/invitations/{invitation_id}/data/{field_name}`
**Authentication**: Requerida (JWT)

##### Request Body
```json
{
  "value": "Nuevo valor del campo"
}
```

##### Response (200 OK)
```json
{
  "message": "Field updated successfully",
  "field": "couple_groom_name",
  "value": "Nuevo valor del campo"
}
```

---

#### 4. Delete Field
Eliminar (establecer como null) un campo de datos.

**Endpoint**: `DELETE /api/invitations/{invitation_id}/data/{field_name}`
**Authentication**: Requerida (JWT)

##### Response (200 OK)
```json
{
  "message": "Field deleted successfully",
  "field": "social_hashtag"
}
```

---

### Media Management

#### 5. Upload Media Files
Subir archivos de media (imágenes, videos).

**Endpoint**: `POST /api/invitations/{invitation_id}/media`
**Authentication**: Requerida (JWT)
**Content-Type**: `multipart/form-data`

##### Request Body
```
file: (binary)
media_type: "gallery" | "hero" | "couple" | "video" | "music"
title: "Foto de la pareja" (opcional)
description: "Tomada en París" (opcional)
```

##### Response (201 Created)
```json
{
  "message": "File uploaded successfully",
  "media": {
    "id": 1,
    "invitation_id": 123,
    "media_type": "gallery",
    "file_path": "https://cdn.kossomet.com/invitations/123/gallery_001.jpg",
    "thumbnail_path": "https://cdn.kossomet.com/invitations/123/thumb_gallery_001.jpg",
    "original_filename": "DSC_0001.jpg",
    "file_size": 2048576,
    "mime_type": "image/jpeg",
    "title": "Foto de la pareja",
    "description": "Tomada en París",
    "display_order": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 6. List Media Files
Listar todos los archivos media de una invitación.

**Endpoint**: `GET /api/invitations/{invitation_id}/media`
**Authentication**: Requerida (JWT)

##### Query Parameters
- `media_type`: Filtrar por tipo (opcional)
- `sort`: Ordenar por campo (default: display_order)

##### Response (200 OK)
```json
{
  "media": [
    {
      "id": 1,
      "media_type": "gallery",
      "file_path": "https://cdn.kossomet.com/...",
      "thumbnail_path": "https://cdn.kossomet.com/...",
      "title": "Foto 1",
      "display_order": 1
    },
    {
      "id": 2,
      "media_type": "gallery",
      "file_path": "https://cdn.kossomet.com/...",
      "thumbnail_path": "https://cdn.kossomet.com/...",
      "title": "Foto 2",
      "display_order": 2
    }
  ],
  "total": 2
}
```

---

#### 7. Delete Media File
Eliminar un archivo media.

**Endpoint**: `DELETE /api/invitations/{invitation_id}/media/{media_id}`
**Authentication**: Requerida (JWT)

##### Response (200 OK)
```json
{
  "message": "Media deleted successfully"
}
```

---

### Events Management

#### 8. Create Event
Crear un nuevo evento en la línea de tiempo.

**Endpoint**: `POST /api/invitations/{invitation_id}/events`
**Authentication**: Requerida (JWT)

##### Request Body
```json
{
  "event_type": "ceremony",
  "name": "Ceremonia Religiosa",
  "date": "2024-12-25",
  "time": "16:00",
  "venue_name": "Iglesia San Pedro",
  "venue_address": "Jr. Lima 123",
  "description": "Ceremonia religiosa tradicional",
  "dress_code": "Formal",
  "display_order": 1
}
```

##### Response (201 Created)
```json
{
  "message": "Event created successfully",
  "event": {
    "id": 1,
    "invitation_id": 123,
    "event_type": "ceremony",
    "name": "Ceremonia Religiosa",
    "date": "2024-12-25",
    "time": "16:00",
    "venue_name": "Iglesia San Pedro",
    "venue_address": "Jr. Lima 123",
    "description": "Ceremonia religiosa tradicional",
    "dress_code": "Formal",
    "display_order": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 9. List Events
Listar todos los eventos de una invitación.

**Endpoint**: `GET /api/invitations/{invitation_id}/events`
**Authentication**: Requerida (JWT)

##### Response (200 OK)
```json
{
  "events": [
    {
      "id": 1,
      "event_type": "ceremony",
      "name": "Ceremonia Religiosa",
      "date": "2024-12-25",
      "time": "16:00",
      "venue_name": "Iglesia San Pedro",
      "display_order": 1
    },
    {
      "id": 2,
      "event_type": "reception",
      "name": "Recepción",
      "date": "2024-12-25",
      "time": "18:00",
      "venue_name": "Hotel Marriott",
      "display_order": 2
    }
  ],
  "total": 2
}
```

---

#### 10. Update Event
Actualizar un evento existente.

**Endpoint**: `PUT /api/invitations/{invitation_id}/events/{event_id}`
**Authentication**: Requerida (JWT)

##### Request Body
```json
{
  "name": "Ceremonia Civil",
  "time": "15:30",
  "venue_name": "Municipalidad de Miraflores"
}
```

##### Response (200 OK)
```json
{
  "message": "Event updated successfully",
  "event": {
    "id": 1,
    "name": "Ceremonia Civil",
    "time": "15:30",
    "venue_name": "Municipalidad de Miraflores",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 11. Delete Event
Eliminar un evento.

**Endpoint**: `DELETE /api/invitations/{invitation_id}/events/{event_id}`
**Authentication**: Requerida (JWT)

##### Response (200 OK)
```json
{
  "message": "Event deleted successfully"
}
```

---

### Publishing & Preview

#### 12. Generate Preview
Generar URL de preview de la invitación.

**Endpoint**: `GET /api/invitations/{invitation_id}/preview`
**Authentication**: Requerida (JWT)

##### Response (200 OK)
```json
{
  "preview_url": "https://invitaciones.com/preview/abc123xyz",
  "expires_at": "2024-01-02T00:00:00Z",
  "is_published": false,
  "completeness": {
    "overall": 85,
    "sections": {
      "couple": 100,
      "event": 100,
      "venue": 75,
      "gallery": 50,
      "rsvp": 100
    }
  }
}
```

---

#### 13. Publish Invitation
Publicar la invitación (hacerla accesible públicamente).

**Endpoint**: `POST /api/invitations/{invitation_id}/publish`
**Authentication**: Requerida (JWT)

##### Request Body
```json
{
  "slug": "juan-y-maria-2024",  // URL personalizada (opcional)
  "password": "invitacion123"    // Protección por contraseña (opcional)
}
```

##### Response (200 OK)
```json
{
  "message": "Invitation published successfully",
  "invitation": {
    "id": 123,
    "is_published": true,
    "published_at": "2024-01-01T00:00:00Z",
    "public_url": "https://invitaciones.com/juan-y-maria-2024",
    "short_url": "https://inv.com/abc123"
  }
}
```

---

#### 14. Unpublish Invitation
Despublicar la invitación (quitarla del acceso público).

**Endpoint**: `POST /api/invitations/{invitation_id}/unpublish`
**Authentication**: Requerida (JWT)

##### Response (200 OK)
```json
{
  "message": "Invitation unpublished successfully",
  "invitation": {
    "id": 123,
    "is_published": false,
    "unpublished_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 15. Check URL Availability
Verificar si una URL personalizada está disponible.

**Endpoint**: `GET /api/invitations/check-url/{url_slug}`
**Authentication**: Requerida (JWT)

##### Response (200 OK)
```json
{
  "available": true,
  "slug": "juan-y-maria-2024"
}
```

##### Response (409 Conflict)
```json
{
  "available": false,
  "slug": "juan-y-maria-2024",
  "message": "URL already in use"
}
```

---

### RSVP Management

#### 16. Get RSVP Settings
Obtener configuración RSVP de la invitación.

**Endpoint**: `GET /api/invitations/{invitation_id}/rsvp`
**Authentication**: Requerida (JWT)

##### Response (200 OK)
```json
{
  "rsvp": {
    "enabled": true,
    "deadline": "2024-12-20",
    "max_guests": 2,
    "requires_meal_selection": true,
    "meal_options": ["Carne", "Pollo", "Vegetariano"],
    "custom_questions": [
      {
        "id": 1,
        "question": "¿Alguna alergia alimentaria?",
        "type": "text",
        "required": false
      }
    ],
    "whatsapp": "+51999999999",
    "email": "rsvp@wedding.com"
  }
}
```

---

#### 17. Update RSVP Settings
Actualizar configuración RSVP.

**Endpoint**: `POST /api/invitations/{invitation_id}/rsvp`
**Authentication**: Requerida (JWT)

##### Request Body
```json
{
  "enabled": true,
  "deadline": "2024-12-20",
  "max_guests": 2,
  "requires_meal_selection": true,
  "meal_options": ["Carne", "Pollo", "Vegetariano", "Vegano"],
  "custom_questions": [
    {
      "question": "¿Alguna alergia alimentaria?",
      "type": "text",
      "required": true
    },
    {
      "question": "¿Necesitas transporte?",
      "type": "boolean",
      "required": false
    }
  ]
}
```

##### Response (200 OK)
```json
{
  "message": "RSVP settings updated successfully",
  "rsvp": {
    "enabled": true,
    "deadline": "2024-12-20",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 18. List RSVP Responses
Listar respuestas RSVP recibidas.

**Endpoint**: `GET /api/invitations/{invitation_id}/rsvp/responses`
**Authentication**: Requerida (JWT)

##### Query Parameters
- `status`: confirmed | declined | pending
- `page`: Número de página
- `limit`: Items por página

##### Response (200 OK)
```json
{
  "responses": [
    {
      "id": 1,
      "guest_name": "Carlos López",
      "email": "carlos@email.com",
      "phone": "+51999888777",
      "status": "confirmed",
      "number_of_guests": 2,
      "guest_names": ["Carlos López", "Ana Martínez"],
      "meal_selections": ["Carne", "Vegetariano"],
      "custom_answers": {
        "allergies": "Ninguna",
        "transport": false
      },
      "message": "Felicidades a los novios!",
      "responded_at": "2024-11-01T00:00:00Z"
    }
  ],
  "total": 45,
  "confirmed": 40,
  "declined": 3,
  "pending": 2,
  "total_guests": 78
}
```

---

#### 19. Submit RSVP Response (Public)
Endpoint público para que invitados envíen su respuesta.

**Endpoint**: `POST /api/invitations/{invitation_id}/rsvp/respond`
**Authentication**: No requerida (endpoint público)

##### Request Body
```json
{
  "guest_name": "Carlos López",
  "email": "carlos@email.com",
  "phone": "+51999888777",
  "status": "confirmed",
  "number_of_guests": 2,
  "guest_names": ["Carlos López", "Ana Martínez"],
  "meal_selections": ["Carne", "Vegetariano"],
  "custom_answers": {
    "allergies": "Ninguna",
    "transport": false
  },
  "message": "Felicidades a los novios!"
}
```

##### Response (201 Created)
```json
{
  "message": "RSVP response submitted successfully",
  "response": {
    "id": 1,
    "confirmation_code": "RSV-2024-001",
    "status": "confirmed",
    "guest_name": "Carlos López"
  }
}
```

## Field Validation Rules

### Required Fields
- `couple_groom_name`: 2-100 caracteres
- `couple_bride_name`: 2-100 caracteres
- `event_date`: Fecha futura
- `event_time`: Formato HH:MM
- `event_venue_name`: 2-200 caracteres
- `gallery_hero_image`: URL válida o path de archivo

### Optional Fields with Validation
- `rsvp_email`: Formato email válido
- `rsvp_whatsapp`: Formato teléfono válido
- `social_hashtag`: Debe empezar con #
- `event_venue_location_url`: URL válida

## Media Types
- `hero`: Imagen principal
- `couple`: Foto de la pareja
- `gallery`: Galería de fotos
- `video`: Videos
- `music`: Música de fondo

## Event Types
- `ceremony`: Ceremonia
- `reception`: Recepción
- `party`: Fiesta
- `other`: Otro evento

## Error Responses

### 400 Bad Request
```json
{
  "error": "validation_error",
  "message": "Invalid data provided",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### 403 Forbidden
```json
{
  "error": "permission_denied",
  "message": "You don't have permission to edit this invitation"
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Invitation not found"
}
```

### 413 Payload Too Large
```json
{
  "error": "file_too_large",
  "message": "File size exceeds 10MB limit"
}
```