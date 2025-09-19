# Templates Module API Documentation

## Overview
Sistema de plantillas de invitación que maneja el catálogo de diseños predefinidos.

**Base URL**: `/api/templates`

## Endpoints

### 1. List Templates
Obtener lista paginada de plantillas con filtros.

**Endpoint**: `GET /api/templates`
**Authentication**: No requerida (público)

#### Query Parameters
- `page`: Número de página (default: 1)
- `per_page`: Items por página (default: 20, max: 100)
- `category`: Filtrar por categoría
- `is_premium`: Filtrar por premium (true/false)
- `is_active`: Filtrar por activas (default: true)
- `search`: Buscar en nombre y descripción
- `sort_by`: Campo ordenamiento (name, created_at, display_order)
- `sort_order`: Orden (asc/desc, default: asc)

#### Response (200 OK)
```json
{
  "templates": [
    {
      "id": 1,
      "name": "Elegante Dorado",
      "description": "Diseño elegante con detalles dorados",
      "category": "elegant",
      "preview_image_url": "https://cdn.kossomet.com/templates/1/preview.jpg",
      "thumbnail_url": "https://cdn.kossomet.com/templates/1/thumb.jpg",
      "is_premium": false,
      "is_active": true,
      "display_order": 1,
      "supported_features": [
        "gallery",
        "rsvp",
        "timeline",
        "maps"
      ],
      "default_colors": {
        "primary": "#D4AF37",
        "secondary": "#F5F5DC",
        "accent": "#8B4513"
      },
      "plan_id": 1,
      "plan": {
        "id": 1,
        "name": "Plan Standard",
        "price": 290.00,
        "currency": "PEN"
      },
      "price": 290.00,
      "currency": "PEN",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "pages": 3,
  "current_page": 1,
  "per_page": 20,
  "has_next": true,
  "has_prev": false
}
```

---

### 2. Get Template Details
Obtener detalles de una plantilla específica.

**Endpoint**: `GET /api/templates/{template_id}`
**Authentication**: No requerida (público)

#### Response (200 OK)
```json
{
  "template": {
    "id": 1,
    "name": "Elegante Dorado",
    "description": "Diseño elegante con detalles dorados y tipografía clásica",
    "category": "elegant",
    "preview_image_url": "https://cdn.kossomet.com/templates/1/preview.jpg",
    "thumbnail_url": "https://cdn.kossomet.com/templates/1/thumb.jpg",
    "is_premium": false,
    "is_active": true,
    "display_order": 1,
    "supported_features": [
      "gallery",
      "rsvp",
      "timeline",
      "maps",
      "music"
    ],
    "default_colors": {
      "primary": "#D4AF37",
      "secondary": "#F5F5DC",
      "accent": "#8B4513",
      "text": "#2D2D2D",
      "background": "#FFFFFF"
    },
    "plan_id": 1,
    "plan": {
      "id": 1,
      "name": "Plan Standard",
      "price": 290.00,
      "currency": "PEN"
    },
    "price": 290.00,
    "currency": "PEN"
  }
}
```

---

### 3. Create Template (Admin)
Crear nueva plantilla.

**Endpoint**: `POST /api/templates`
**Authentication**: Requerida (JWT + Admin)

#### Request Body
```json
{
  "name": "Moderno Minimalista",
  "description": "Diseño moderno y minimalista",
  "category": "modern",
  "preview_image_url": "https://cdn.kossomet.com/templates/new/preview.jpg",
  "thumbnail_url": "https://cdn.kossomet.com/templates/new/thumb.jpg",
  "template_file": "modern_minimal.html",
  "supported_features": [
    "gallery",
    "rsvp",
    "maps"
  ],
  "default_colors": {
    "primary": "#2D3748",
    "secondary": "#F7FAFC",
    "accent": "#805AD5"
  },
  "plan_id": 1,
  "is_premium": false,
  "display_order": 10
}
```

#### Response (201 Created)
```json
{
  "message": "Template created successfully",
  "template": {
    "id": 26,
    "name": "Moderno Minimalista",
    // ... resto de campos
  }
}
```

---

### 4. Update Template (Admin)
Actualizar plantilla existente.

**Endpoint**: `PUT /api/templates/{template_id}`
**Authentication**: Requerida (JWT + Admin)

#### Request Body
```json
{
  "name": "Moderno Minimalista v2",
  "description": "Versión actualizada del diseño minimalista",
  "is_active": true,
  "display_order": 5
}
```

#### Response (200 OK)
```json
{
  "message": "Template updated successfully",
  "template": {
    "id": 26,
    "name": "Moderno Minimalista v2",
    // ... campos actualizados
  }
}
```

---

### 5. Delete Template (Admin)
Soft delete de plantilla.

**Endpoint**: `DELETE /api/templates/{template_id}`
**Authentication**: Requerida (JWT + Admin)

#### Response (200 OK)
```json
{
  "message": "Template deleted successfully"
}
```

## Template Categories

### Categorías Disponibles
- `classic`: Clásicas y elegantes
- `modern`: Modernas y contemporáneas
- `minimalist`: Minimalistas y limpias
- `romantic`: Románticas y delicadas
- `rustic`: Rústicas y naturales
- `luxury`: Lujo y sofisticación
- `vintage`: Vintage y retro
- `floral`: Diseños florales
- `geometric`: Patrones geométricos
- `beach`: Temática playera

## Supported Features

### Features Disponibles
- `gallery`: Galería de fotos
- `rsvp`: Confirmación de asistencia
- `timeline`: Línea de tiempo de eventos
- `maps`: Integración con mapas
- `music`: Música de fondo
- `video`: Videos embebidos
- `countdown`: Contador regresivo
- `guestbook`: Libro de invitados
- `livestream`: Transmisión en vivo
- `qr_code`: Códigos QR
- `social_share`: Compartir en redes
- `password_protection`: Protección por contraseña

## Template File System

### Estructura de Archivos
```
templates/
├── {template_id}/
│   ├── template.html         # Archivo principal HTML
│   ├── styles.css           # Estilos específicos
│   ├── script.js           # JavaScript opcional
│   ├── preview.jpg         # Imagen de preview
│   ├── thumbnail.jpg       # Thumbnail para lista
│   └── assets/
│       ├── fonts/          # Fuentes personalizadas
│       ├── images/         # Imágenes del template
│       └── icons/          # Iconos específicos
```

### Template HTML Structure
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{couple_groom_name}} & {{couple_bride_name}}</title>
    <link href="styles.css" rel="stylesheet">
    <link href="https://cdn.tailwindcss.com" rel="stylesheet">
</head>
<body class="bg-{{background_color}}">
    <!-- Hero Section -->
    <section class="hero" style="background-color: {{primary_color}}">
        <div class="container">
            <h1 class="couple-names">
                {{couple_groom_name}} & {{couple_bride_name}}
            </h1>
            <p class="wedding-date">{{event_date}}</p>
            {{#if gallery_hero_image}}
            <img src="{{gallery_hero_image}}" alt="Couple Photo" class="hero-image">
            {{/if}}
        </div>
    </section>

    <!-- Event Details -->
    <section class="event-details">
        <h2>{{event_venue_name}}</h2>
        <p>{{event_venue_address}}</p>
        <p>{{event_date}} - {{event_time}}</p>
    </section>

    <!-- Gallery (if supported) -->
    {{#if supported_features.gallery}}
    <section class="gallery">
        <h2>Nuestra Historia</h2>
        <div class="gallery-grid">
            {{#each media}}
            <img src="{{file_path}}" alt="{{title}}" class="gallery-item">
            {{/each}}
        </div>
    </section>
    {{/if}}

    <!-- RSVP (if supported) -->
    {{#if supported_features.rsvp}}
    <section class="rsvp">
        <h2>Confirma tu Asistencia</h2>
        <form id="rsvp-form">
            <input type="text" name="guest_name" placeholder="Tu nombre" required>
            <input type="email" name="email" placeholder="Email">
            <select name="status" required>
                <option value="confirmed">Confirmo mi asistencia</option>
                <option value="declined">No podré asistir</option>
            </select>
            <button type="submit">Enviar Confirmación</button>
        </form>
    </section>
    {{/if}}

    <script src="script.js"></script>
</body>
</html>
```

## Template Variables

### Variables Disponibles
Templates usan Handlebars para interpolación de datos:

```javascript
// Datos de la pareja
{{couple_groom_name}}
{{couple_bride_name}}
{{couple_groom_parents}}
{{couple_bride_parents}}

// Evento
{{event_date}}
{{event_time}}
{{event_venue_name}}
{{event_venue_address}}

// Mensajes
{{message_welcome_text}}
{{message_invitation_text}}

// Galería
{{gallery_hero_image}}
{{gallery_couple_image}}

// Diseño
{{design_primary_color}}
{{design_secondary_color}}
{{design_font_family}}

// RSVP
{{rsvp_deadline}}
{{rsvp_whatsapp}}
{{rsvp_email}}

// Social
{{social_hashtag}}
{{social_instagram}}

// Arrays de datos
{{#each events}}
  {{name}} - {{date}} {{time}}
{{/each}}

{{#each media}}
  <img src="{{file_path}}" alt="{{title}}">
{{/each}}
```

## Color Scheme Structure

### Default Colors Format
```json
{
  "primary": "#D4AF37",      // Color principal
  "secondary": "#F5F5DC",    // Color secundario
  "accent": "#8B4513",       // Color de acento
  "text": "#2D2D2D",         // Color de texto
  "text_light": "#666666",   // Texto secundario
  "background": "#FFFFFF",   // Fondo principal
  "background_alt": "#F8F8F8", // Fondo alternativo
  "border": "#E2E8F0",       // Bordes
  "success": "#10B981",      // Estados de éxito
  "warning": "#F59E0B",      // Advertencias
  "error": "#EF4444"         // Errores
}
```

## Template Rendering Process

### Frontend Rendering Flow
1. **Selection**: User selects template from `/plantillas`
2. **Purchase**: Template added to cart with plan
3. **Editor**: User customizes data in editor
4. **Preview**: Real-time preview with data interpolation
5. **Publish**: Final rendering with all data

### Rendering Engine
```typescript
// Frontend template rendering
class TemplateRenderer {
  constructor(template: Template, data: InvitationData) {
    this.template = template;
    this.data = data;
  }

  render(): string {
    // 1. Load template HTML
    const html = this.loadTemplate();

    // 2. Apply Handlebars compilation
    const compiled = Handlebars.compile(html);

    // 3. Inject invitation data
    const rendered = compiled({
      ...this.data,
      colors: this.template.default_colors,
      features: this.template.supported_features
    });

    // 4. Apply custom CSS
    return this.applyCustomStyles(rendered);
  }

  applyCustomStyles(html: string): string {
    // Apply user customizations
    return html.replace(/{{primary_color}}/g, this.data.design_primary_color);
  }
}
```

## Error Responses

### 404 Not Found
```json
{
  "message": "Template not found"
}
```

### 409 Conflict
```json
{
  "message": "Template name already exists"
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required"
}
```

## Integration Examples

### React Component
```tsx
import { useTemplates, useTemplate } from '@/lib/hooks/use-templates';

const TemplatesGallery = () => {
  const { data: templates, isLoading } = useTemplates({
    category: 'modern',
    is_premium: false,
    per_page: 12
  });

  if (isLoading) return <div>Cargando plantillas...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {templates?.templates.map(template => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
};

const TemplateCard = ({ template }: { template: Template }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={template.thumbnail_url}
        alt={template.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold">{template.name}</h3>
        <p className="text-gray-600 text-sm">{template.description}</p>
        <div className="mt-2 flex justify-between items-center">
          <Badge variant={template.is_premium ? "premium" : "default"}>
            {template.is_premium ? "Premium" : "Gratis"}
          </Badge>
          <span className="font-bold">S/ {template.price}</span>
        </div>
      </div>
    </div>
  );
};
```

### Template Selection Logic
```typescript
const useTemplateSelection = () => {
  const { mutate: addToCart } = useAddTemplateToCart();

  const selectTemplate = (template: Template) => {
    // Add template to cart
    addToCart({
      template_id: template.id,
      plan_id: template.plan_id,
      quantity: 1
    });

    // Redirect to customization
    router.push(`/invitacion/crear?template=${template.id}`);
  };

  return { selectTemplate };
};
```