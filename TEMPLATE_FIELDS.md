# 📋 Estructura de Campos Editables para Plantillas de Invitación

## 📌 Información General

Este documento define todos los campos editables que estarán disponibles en las plantillas de invitación digital. Cada campo incluye su tipo de input, validaciones, y opciones disponibles.

---

## 🔧 Variables del Sistema

### Prefijos de Variables
- `couple_` - Información de la pareja
- `event_` - Detalles del evento principal
- `schedule_` - Itinerario y eventos
- `gallery_` - Imágenes y multimedia
- `rsvp_` - Confirmación de asistencia
- `gift_` - Mesa de regalos
- `style_` - Personalización visual
- `contact_` - Información de contacto
- `extra_` - Información adicional

---

## 📝 1. INFORMACIÓN DE LA PAREJA

### 1.1 Nombres Principales
```typescript
interface CoupleInfo {
  couple_groom_name: string;        // Nombre completo del novio
  couple_bride_name: string;        // Nombre completa de la novia
  couple_display_order: 'bride_first' | 'groom_first'; // Orden de aparición
}
```

**Inputs:**
```html
<input type="text" 
       name="couple_groom_name" 
       placeholder="Nombre completo del novio"
       maxlength="100"
       required>

<input type="text" 
       name="couple_bride_name" 
       placeholder="Nombre completo de la novia"
       maxlength="100"
       required>

<select name="couple_display_order">
  <option value="bride_first">Novia & Novio</option>
  <option value="groom_first">Novio & Novia</option>
</select>
```

### 1.2 Mensaje de Bienvenida
```typescript
interface WelcomeMessage {
  couple_welcome_title: string;     // Ej: "¡Nos casamos!"
  couple_welcome_message: string;   // Mensaje personalizado
  couple_quote: string;             // Frase o cita opcional
}
```

**Inputs:**
```html
<input type="text" 
       name="couple_welcome_title" 
       placeholder="¡Nos casamos!"
       maxlength="50">

<textarea name="couple_welcome_message" 
          placeholder="Con la bendición de Dios y nuestros padres..."
          maxlength="500"></textarea>

<input type="text" 
       name="couple_quote" 
       placeholder="'El amor es...' - Autor"
       maxlength="200">
```

---

## 📅 2. INFORMACIÓN DEL EVENTO

### 2.1 Evento Principal
```typescript
interface MainEvent {
  event_date: string;               // Fecha del evento (YYYY-MM-DD)
  event_time: string;               // Hora del evento (HH:MM)
  event_timezone: string;           // Zona horaria
  event_type: 'religious' | 'civil' | 'symbolic'; // Tipo de ceremonia
}
```

**Inputs:**
```html
<input type="date" 
       name="event_date" 
       required
       min="2024-01-01"
       max="2030-12-31">

<input type="time" 
       name="event_time" 
       required>

<select name="event_timezone">
  <option value="America/Lima">Perú (GMT-5)</option>
  <option value="America/Mexico_City">México (GMT-6)</option>
  <option value="America/Bogota">Colombia (GMT-5)</option>
</select>

<select name="event_type">
  <option value="religious">Ceremonia Religiosa</option>
  <option value="civil">Ceremonia Civil</option>
  <option value="symbolic">Ceremonia Simbólica</option>
</select>
```

### 2.2 Ubicación Principal
```typescript
interface MainLocation {
  event_venue_name: string;         // Nombre del lugar
  event_venue_address: string;      // Dirección completa
  event_venue_lat: number;          // Latitud
  event_venue_lng: number;          // Longitud
  event_venue_maps_link: string;    // Link de Google Maps
  event_venue_reference: string;    // Referencias adicionales
}
```

**Componente de Ubicación:**
```html
<!-- Nombre del lugar -->
<input type="text" 
       name="event_venue_name" 
       placeholder="Iglesia San Francisco"
       required>

<!-- Selector de ubicación con mapa interactivo -->
<div class="location-picker">
  <!-- Opción 1: Búsqueda con autocompletado -->
  <input type="text" 
         id="venue-search"
         placeholder="Buscar ubicación..."
         autocomplete="off">
  
  <!-- Opción 2: Mapa interactivo -->
  <div id="map-container" style="height: 300px;"></div>
  
  <!-- Campos ocultos para coordenadas -->
  <input type="hidden" name="event_venue_lat">
  <input type="hidden" name="event_venue_lng">
  
  <!-- Opción 3: Pegar link de Google Maps -->
  <input type="url" 
         name="event_venue_maps_link" 
         placeholder="https://maps.google.com/...">
</div>

<!-- Dirección final (autocompletada o manual) -->
<input type="text" 
       name="event_venue_address" 
       placeholder="Av. Principal 123, Lima, Perú">

<!-- Referencias adicionales -->
<input type="text" 
       name="event_venue_reference" 
       placeholder="Frente al parque central">
```

---

## 🎉 3. ITINERARIO DE EVENTOS

### 3.1 Estructura de Eventos Múltiples
```typescript
interface ScheduleEvent {
  schedule_event_id: string;        // ID único del evento
  schedule_event_name: string;      // Nombre del evento
  schedule_event_date: string;      // Fecha
  schedule_event_time: string;      // Hora
  schedule_event_venue: string;     // Lugar
  schedule_event_address: string;   // Dirección
  schedule_event_description: string; // Descripción opcional
  schedule_event_icon: string;      // Icono del evento
}
```

**Componente Repetible:**
```html
<div class="event-block" data-event-index="0">
  <select name="schedule_event_icon[]">
    <option value="church">⛪ Iglesia</option>
    <option value="rings">💍 Ceremonia Civil</option>
    <option value="party">🎉 Fiesta</option>
    <option value="dinner">🍽️ Cena</option>
    <option value="drinks">🥂 Cóctel</option>
    <option value="music">🎵 Recepción</option>
  </select>
  
  <input type="text" 
         name="schedule_event_name[]" 
         placeholder="Ceremonia Religiosa"
         required>
  
  <input type="datetime-local" 
         name="schedule_event_datetime[]"
         required>
  
  <input type="text" 
         name="schedule_event_venue[]" 
         placeholder="Nombre del lugar">
  
  <input type="text" 
         name="schedule_event_address[]" 
         placeholder="Dirección">
  
  <textarea name="schedule_event_description[]" 
            placeholder="Descripción o notas del evento"
            maxlength="200"></textarea>
  
  <button type="button" class="remove-event">Eliminar evento</button>
</div>

<button type="button" id="add-event">+ Agregar otro evento</button>
```

---

## 📷 4. MULTIMEDIA

### 4.1 Imágenes Principales
```typescript
interface GalleryImages {
  gallery_hero_image: File;         // Imagen principal/portada
  gallery_couple_photo: File;       // Foto de la pareja
  gallery_ceremony_bg: File;        // Fondo para ceremonia
  gallery_reception_bg: File;       // Fondo para recepción
  gallery_photos: File[];           // Galería de fotos (máx 20)
}
```

**Inputs de Imágenes:**
```html
<!-- Imagen de Portada -->
<div class="image-upload-container">
  <label>Imagen Principal de Portada *</label>
  <input type="file" 
         name="gallery_hero_image" 
         accept="image/jpeg,image/jpg,image/png,image/webp"
         required>
  <small>Recomendado: 1920x1080px, máx 5MB</small>
</div>

<!-- Foto de la Pareja -->
<div class="image-upload-container">
  <label>Foto de la Pareja</label>
  <input type="file" 
         name="gallery_couple_photo" 
         accept="image/jpeg,image/jpg,image/png,image/webp">
  <small>Recomendado: Formato cuadrado, máx 3MB</small>
</div>

<!-- Galería de Fotos -->
<div class="gallery-upload">
  <label>Galería de Fotos (máximo 20)</label>
  <input type="file" 
         name="gallery_photos[]" 
         accept="image/jpeg,image/jpg,image/png,image/webp"
         multiple
         data-max-files="20">
  <div id="gallery-preview" class="preview-grid"></div>
</div>
```

### 4.2 Videos y Música
```typescript
interface MediaOptions {
  gallery_video_url: string;        // URL de video (YouTube/Vimeo)
  gallery_music_enabled: boolean;   // Activar música de fondo
  gallery_music_file: File;         // Archivo de música
  gallery_music_url: string;        // O URL de música
}
```

---

## 👗 5. DRESS CODE

### 5.1 Configuración de Vestimenta
```typescript
interface DressCode {
  style_dresscode_type: string;     // Tipo de vestimenta
  style_dresscode_description: string; // Descripción detallada
  style_dresscode_colors: string[]; // Colores sugeridos
  style_dresscode_image: File;      // Imagen de referencia
  style_dresscode_restrictions: string[]; // Restricciones
}
```

**Inputs:**
```html
<select name="style_dresscode_type">
  <option value="formal">Formal/Etiqueta</option>
  <option value="semiformal">Semi-formal</option>
  <option value="cocktail">Cocktail</option>
  <option value="casual_elegant">Casual Elegante</option>
  <option value="beach">Playa</option>
  <option value="garden">Jardín</option>
  <option value="custom">Personalizado</option>
</select>

<textarea name="style_dresscode_description" 
          placeholder="Ej: Formal en tonos pasteles, evitar negro"
          maxlength="200"></textarea>

<!-- Selector de colores sugeridos -->
<div class="color-palette-selector">
  <label>Paleta de colores sugerida:</label>
  <input type="color" name="style_dresscode_colors[]" value="#FFB6C1">
  <input type="color" name="style_dresscode_colors[]" value="#E6E6FA">
  <input type="color" name="style_dresscode_colors[]" value="#F0E68C">
  <button type="button" class="add-color">+ Color</button>
</div>

<!-- Restricciones -->
<div class="restrictions-checkboxes">
  <label><input type="checkbox" name="style_dresscode_restrictions[]" value="no_white"> Evitar blanco</label>
  <label><input type="checkbox" name="style_dresscode_restrictions[]" value="no_black"> Evitar negro</label>
  <label><input type="checkbox" name="style_dresscode_restrictions[]" value="no_jeans"> No jeans</label>
  <label><input type="checkbox" name="style_dresscode_restrictions[]" value="no_sneakers"> No tenis</label>
</div>

<!-- Imagen de referencia -->
<input type="file" 
       name="style_dresscode_image" 
       accept="image/*">
```

---

## 🎁 6. MESA DE REGALOS

### 6.1 Opciones de Regalo
```typescript
interface GiftRegistry {
  gift_registry_enabled: boolean;
  gift_registries: Array<{
    gift_type: 'amazon' | 'liverpool' | 'bank' | 'paypal' | 'custom';
    gift_platform_name: string;
    gift_registry_number: string;
    gift_registry_link: string;
    gift_bank_details?: {
      bank_name: string;
      account_number: string;
      account_holder: string;
      account_type: string;
      clabe?: string;  // Para México
      cci?: string;    // Para Perú
    };
  }>;
  gift_message: string;
}
```

**Componente de Mesa de Regalos:**
```html
<div class="gift-registry-container">
  <label>
    <input type="checkbox" name="gift_registry_enabled"> 
    Habilitar mesa de regalos
  </label>
  
  <div class="gift-options" id="gift-options">
    <!-- Bloque repetible de opciones -->
    <div class="gift-option-block">
      <select name="gift_type[]" class="gift-type-selector">
        <option value="">Seleccionar tipo...</option>
        <option value="amazon">Amazon</option>
        <option value="liverpool">Liverpool</option>
        <option value="sears">Sears</option>
        <option value="bank">Cuenta Bancaria</option>
        <option value="paypal">PayPal</option>
        <option value="custom">Otro</option>
      </select>
      
      <!-- Campos dinámicos según el tipo -->
      <div class="gift-fields">
        <!-- Para tiendas -->
        <input type="text" 
               name="gift_registry_number[]" 
               placeholder="Número de evento/registro"
               class="registry-field">
        
        <input type="url" 
               name="gift_registry_link[]" 
               placeholder="Link al registro"
               class="registry-field">
        
        <!-- Para cuenta bancaria (se muestra si gift_type = bank) -->
        <div class="bank-fields" style="display: none;">
          <input type="text" 
                 name="gift_bank_name[]" 
                 placeholder="Nombre del banco">
          
          <input type="text" 
                 name="gift_account_number[]" 
                 placeholder="Número de cuenta">
          
          <input type="text" 
                 name="gift_account_holder[]" 
                 placeholder="Titular de la cuenta">
          
          <select name="gift_account_type[]">
            <option value="savings">Ahorros</option>
            <option value="checking">Corriente</option>
          </select>
          
          <input type="text" 
                 name="gift_clabe[]" 
                 placeholder="CLABE (México)"
                 maxlength="18">
          
          <input type="text" 
                 name="gift_cci[]" 
                 placeholder="CCI (Perú)"
                 maxlength="20">
        </div>
      </div>
      
      <button type="button" class="remove-gift-option">Eliminar</button>
    </div>
  </div>
  
  <button type="button" id="add-gift-option">+ Agregar otra opción</button>
  
  <textarea name="gift_message" 
            placeholder="Tu presencia es nuestro mejor regalo, pero si deseas obsequiarnos algo..."
            maxlength="300"></textarea>
</div>
```

---

## ✅ 7. CONFIRMACIÓN DE ASISTENCIA (RSVP)

### 7.1 Configuración RSVP
```typescript
interface RSVPConfig {
  rsvp_enabled: boolean;
  rsvp_deadline: string;             // Fecha límite para confirmar
  rsvp_allow_companions: boolean;    // Permitir acompañantes
  rsvp_max_companions: number;       // Máximo de acompañantes
  rsvp_ask_dietary: boolean;         // Preguntar restricciones alimenticias
  rsvp_ask_transport: boolean;       // Preguntar sobre transporte
  rsvp_ask_accommodation: boolean;   // Preguntar sobre hospedaje
  rsvp_custom_questions: Array<{
    question: string;
    type: 'text' | 'select' | 'checkbox';
    options?: string[];
  }>;
}
```

**Configuración del Formulario RSVP:**
```html
<div class="rsvp-config">
  <label>
    <input type="checkbox" name="rsvp_enabled" checked> 
    Habilitar confirmación de asistencia
  </label>
  
  <input type="date" 
         name="rsvp_deadline" 
         placeholder="Fecha límite para confirmar">
  
  <label>
    <input type="checkbox" name="rsvp_allow_companions"> 
    Permitir acompañantes
  </label>
  
  <input type="number" 
         name="rsvp_max_companions" 
         min="0" 
         max="10" 
         value="2"
         placeholder="Máximo de acompañantes">
  
  <!-- Preguntas adicionales -->
  <div class="rsvp-questions">
    <label>
      <input type="checkbox" name="rsvp_ask_dietary"> 
      Preguntar sobre restricciones alimenticias
    </label>
    
    <label>
      <input type="checkbox" name="rsvp_ask_transport"> 
      Preguntar si necesitan transporte
    </label>
    
    <label>
      <input type="checkbox" name="rsvp_ask_accommodation"> 
      Preguntar sobre hospedaje
    </label>
  </div>
  
  <!-- Preguntas personalizadas -->
  <div class="custom-questions">
    <h4>Preguntas personalizadas</h4>
    <button type="button" id="add-custom-question">+ Agregar pregunta</button>
  </div>
</div>
```

---

## 📞 8. INFORMACIÓN DE CONTACTO

### 8.1 Contactos de la Pareja
```typescript
interface ContactInfo {
  contact_groom_phone: string;
  contact_groom_whatsapp: string;
  contact_bride_phone: string;
  contact_bride_whatsapp: string;
  contact_email: string;
  contact_parents?: {
    groom_parents: string[];
    bride_parents: string[];
  };
}
```

**Inputs de Contacto:**
```html
<!-- Contacto del Novio -->
<div class="contact-group">
  <h4>Contacto del Novio</h4>
  <input type="tel" 
         name="contact_groom_phone" 
         placeholder="+51 999 999 999"
         pattern="[+][0-9]{1,3}[0-9]{9,12}">
  
  <label>
    <input type="checkbox" name="contact_groom_has_whatsapp"> 
    Mismo número para WhatsApp
  </label>
  
  <input type="tel" 
         name="contact_groom_whatsapp" 
         placeholder="WhatsApp (si es diferente)">
</div>

<!-- Contacto de la Novia -->
<div class="contact-group">
  <h4>Contacto de la Novia</h4>
  <input type="tel" 
         name="contact_bride_phone" 
         placeholder="+51 999 999 999"
         pattern="[+][0-9]{1,3}[0-9]{9,12}">
  
  <label>
    <input type="checkbox" name="contact_bride_has_whatsapp"> 
    Mismo número para WhatsApp
  </label>
  
  <input type="tel" 
         name="contact_bride_whatsapp" 
         placeholder="WhatsApp (si es diferente)">
</div>

<!-- Email de contacto -->
<input type="email" 
       name="contact_email" 
       placeholder="bodacarlosymaria@gmail.com">

<!-- Contacto de padres (opcional) -->
<div class="parents-contact">
  <h4>Contacto de los Padres (opcional)</h4>
  
  <label>Padres del Novio:</label>
  <input type="text" 
         name="contact_groom_parents[]" 
         placeholder="Nombre - Teléfono">
  
  <label>Padres de la Novia:</label>
  <input type="text" 
         name="contact_bride_parents[]" 
         placeholder="Nombre - Teléfono">
</div>
```

---

## 🏨 9. INFORMACIÓN ADICIONAL

### 9.1 Hospedaje y Transporte
```typescript
interface AdditionalInfo {
  extra_hotels: Array<{
    hotel_name: string;
    hotel_address: string;
    hotel_phone: string;
    hotel_website: string;
    hotel_discount_code?: string;
  }>;
  extra_transport_provided: boolean;
  extra_transport_details: string;
  extra_parking_available: boolean;
  extra_parking_details: string;
}
```

**Componente de Hoteles:**
```html
<div class="hotels-section">
  <h4>Hoteles Recomendados</h4>
  
  <div class="hotel-block">
    <input type="text" 
           name="extra_hotel_name[]" 
           placeholder="Nombre del hotel">
    
    <input type="text" 
           name="extra_hotel_address[]" 
           placeholder="Dirección">
    
    <input type="tel" 
           name="extra_hotel_phone[]" 
           placeholder="Teléfono">
    
    <input type="url" 
           name="extra_hotel_website[]" 
           placeholder="Sitio web">
    
    <input type="text" 
           name="extra_hotel_discount[]" 
           placeholder="Código de descuento (opcional)">
    
    <button type="button" class="remove-hotel">Eliminar</button>
  </div>
  
  <button type="button" id="add-hotel">+ Agregar otro hotel</button>
</div>

<!-- Transporte -->
<div class="transport-section">
  <label>
    <input type="checkbox" name="extra_transport_provided"> 
    Se proporcionará transporte
  </label>
  
  <textarea name="extra_transport_details" 
            placeholder="Detalles del transporte (horarios, puntos de salida, etc.)"
            maxlength="300"></textarea>
</div>

<!-- Estacionamiento -->
<div class="parking-section">
  <label>
    <input type="checkbox" name="extra_parking_available"> 
    Estacionamiento disponible
  </label>
  
  <input type="text" 
         name="extra_parking_details" 
         placeholder="Detalles del estacionamiento">
</div>
```

### 9.2 Notas y Restricciones
```typescript
interface EventRestrictions {
  extra_adults_only: boolean;
  extra_no_children: boolean;
  extra_age_restriction: number;
  extra_covid_protocols: boolean;
  extra_covid_details: string;
  extra_special_notes: string;
  extra_hashtag: string;
}
```

**Restricciones y Notas:**
```html
<div class="restrictions-section">
  <h4>Restricciones del Evento</h4>
  
  <label>
    <input type="checkbox" name="extra_adults_only"> 
    Solo adultos
  </label>
  
  <label>
    <input type="checkbox" name="extra_no_children"> 
    No niños
  </label>
  
  <label>
    Edad mínima: 
    <input type="number" 
           name="extra_age_restriction" 
           min="0" 
           max="21"
           placeholder="0 = sin restricción">
  </label>
  
  <label>
    <input type="checkbox" name="extra_covid_protocols"> 
    Protocolos COVID-19
  </label>
  
  <textarea name="extra_covid_details" 
            placeholder="Detalles de protocolos sanitarios"
            maxlength="200"></textarea>
</div>

<!-- Notas especiales -->
<textarea name="extra_special_notes" 
          placeholder="Notas adicionales para los invitados"
          maxlength="500"></textarea>

<!-- Hashtag del evento -->
<input type="text" 
       name="extra_hashtag" 
       placeholder="#BodaCarlosYMaria"
       pattern="#[A-Za-z0-9]+"
       maxlength="30">
```

---

## 🎨 10. PERSONALIZACIÓN DE ESTILO

### 10.1 Colores y Tipografía
```typescript
interface StyleCustomization {
  style_primary_color: string;
  style_secondary_color: string;
  style_accent_color: string;
  style_text_color: string;
  style_background_color: string;
  style_font_family: string;
  style_heading_font: string;
  style_theme: 'classic' | 'modern' | 'rustic' | 'beach' | 'garden' | 'elegant';
}
```

**Personalización Visual:**
```html
<div class="style-customization">
  <h4>Personalización de Colores</h4>
  
  <div class="color-inputs">
    <label>
      Color Principal:
      <input type="color" name="style_primary_color" value="#c2185b">
    </label>
    
    <label>
      Color Secundario:
      <input type="color" name="style_secondary_color" value="#f8bbd9">
    </label>
    
    <label>
      Color de Acento:
      <input type="color" name="style_accent_color" value="#ffd700">
    </label>
    
    <label>
      Color de Texto:
      <input type="color" name="style_text_color" value="#333333">
    </label>
    
    <label>
      Color de Fondo:
      <input type="color" name="style_background_color" value="#ffffff">
    </label>
  </div>
  
  <h4>Tipografía</h4>
  
  <select name="style_font_family">
    <option value="playfair">Playfair Display (Elegante)</option>
    <option value="montserrat">Montserrat (Moderno)</option>
    <option value="dancing">Dancing Script (Script)</option>
    <option value="raleway">Raleway (Minimalista)</option>
    <option value="cormorant">Cormorant (Clásico)</option>
  </select>
  
  <select name="style_heading_font">
    <option value="same">Igual que el texto</option>
    <option value="great_vibes">Great Vibes (Script)</option>
    <option value="alex_brush">Alex Brush (Caligrafía)</option>
    <option value="cinzel">Cinzel (Decorativo)</option>
  </select>
  
  <select name="style_theme">
    <option value="classic">Clásico</option>
    <option value="modern">Moderno</option>
    <option value="rustic">Rústico</option>
    <option value="beach">Playa</option>
    <option value="garden">Jardín</option>
    <option value="elegant">Elegante</option>
  </select>
</div>
```

---

## 🔒 11. CONFIGURACIÓN DE PRIVACIDAD

### 11.1 Control de Acceso
```typescript
interface PrivacySettings {
  privacy_password_enabled: boolean;
  privacy_password: string;
  privacy_guest_list_mode: 'open' | 'restricted' | 'private';
  privacy_show_rsvp_count: boolean;
  privacy_show_gallery: boolean;
  privacy_allow_comments: boolean;
}
```

**Configuración de Privacidad:**
```html
<div class="privacy-settings">
  <label>
    <input type="checkbox" name="privacy_password_enabled"> 
    Proteger con contraseña
  </label>
  
  <input type="password" 
         name="privacy_password" 
         placeholder="Contraseña de acceso"
         minlength="4"
         maxlength="20">
  
  <select name="privacy_guest_list_mode">
    <option value="open">Abierto - Cualquiera puede confirmar</option>
    <option value="restricted">Restringido - Solo con código de invitación</option>
    <option value="private">Privado - Solo invitados pre-registrados</option>
  </select>
  
  <label>
    <input type="checkbox" name="privacy_show_rsvp_count" checked> 
    Mostrar contador de confirmados
  </label>
  
  <label>
    <input type="checkbox" name="privacy_show_gallery" checked> 
    Mostrar galería de fotos
  </label>
  
  <label>
    <input type="checkbox" name="privacy_allow_comments"> 
    Permitir mensajes de felicitación
  </label>
</div>
```

---

## 📊 12. METADATA Y SEO

### 12.1 Información para Compartir
```typescript
interface MetaData {
  meta_title: string;
  meta_description: string;
  meta_og_image: File;
  meta_keywords: string[];
}
```

**Metadata para Redes Sociales:**
```html
<div class="metadata-section">
  <h4>Información para compartir en redes</h4>
  
  <input type="text" 
         name="meta_title" 
         placeholder="Boda de Carlos y María - 15 de Junio 2025"
         maxlength="60">
  
  <textarea name="meta_description" 
            placeholder="Te invitamos a celebrar nuestra boda..."
            maxlength="160"></textarea>
  
  <label>
    Imagen para compartir (1200x630px):
    <input type="file" 
           name="meta_og_image" 
           accept="image/*">
  </label>
</div>
```

---

## 💾 13. VALIDACIONES Y REGLAS DE NEGOCIO

### Validaciones Requeridas

1. **Campos Obligatorios:**
   - Nombres de los novios
   - Fecha del evento
   - Al menos una ubicación
   - Imagen principal

2. **Límites de Archivos:**
   - Imágenes: máx 5MB cada una
   - Galería: máx 20 fotos
   - Música: máx 10MB
   - Formatos aceptados: JPG, PNG, WebP

3. **Validaciones de Fecha:**
   - La fecha del evento debe ser futura
   - La fecha límite de RSVP debe ser anterior al evento
   - Mínimo 7 días antes del evento

4. **Validaciones de Texto:**
   - Nombres: 2-100 caracteres
   - Descripciones: máx 500 caracteres
   - Mensajes cortos: máx 200 caracteres

5. **Validaciones Especiales:**
   - Hashtag: debe empezar con # y sin espacios
   - Teléfonos: formato internacional
   - URLs: deben ser válidas
   - Coordenadas: -90 a 90 (lat), -180 a 180 (lng)

---

## 🚀 14. IMPLEMENTACIÓN TÉCNICA

### 14.1 Almacenamiento en Base de Datos

```sql
-- Tabla principal de invitaciones
CREATE TABLE invitation_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invitation_id INT NOT NULL,
  field_category VARCHAR(50),
  field_name VARCHAR(100),
  field_value TEXT,
  field_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id),
  INDEX idx_invitation_field (invitation_id, field_category, field_name)
);

-- Tabla para archivos multimedia
CREATE TABLE invitation_media (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invitation_id INT NOT NULL,
  media_type ENUM('hero', 'gallery', 'dresscode', 'og_image'),
  file_path VARCHAR(500),
  file_size INT,
  mime_type VARCHAR(100),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id)
);

-- Tabla para eventos del itinerario
CREATE TABLE invitation_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invitation_id INT NOT NULL,
  event_name VARCHAR(200),
  event_datetime DATETIME,
  event_venue VARCHAR(200),
  event_address TEXT,
  event_lat DECIMAL(10, 8),
  event_lng DECIMAL(11, 8),
  event_description TEXT,
  event_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id)
);
```

### 14.2 API Endpoints

```typescript
// Guardar datos de invitación
POST /api/invitations/{id}/data
Body: { fields: Record<string, any> }

// Obtener datos de invitación
GET /api/invitations/{id}/data

// Subir archivos multimedia
POST /api/invitations/{id}/media
Body: FormData with files

// Gestionar eventos del itinerario
POST /api/invitations/{id}/events
GET /api/invitations/{id}/events
PUT /api/invitations/{id}/events/{eventId}
DELETE /api/invitations/{id}/events/{eventId}

// Vista previa de la invitación
GET /api/invitations/{id}/preview

// Publicar invitación
POST /api/invitations/{id}/publish
```

### 14.3 Componente React de Formulario

```tsx
interface InvitationFormProps {
  invitationId: number;
  templateId: number;
  initialData?: Record<string, any>;
}

const InvitationForm: React.FC<InvitationFormProps> = ({
  invitationId,
  templateId,
  initialData
}) => {
  const [formData, setFormData] = useState(initialData || {});
  const [activeSection, setActiveSection] = useState('couple');
  
  const sections = [
    { id: 'couple', label: 'Información de la Pareja', icon: '💑' },
    { id: 'event', label: 'Detalles del Evento', icon: '📅' },
    { id: 'schedule', label: 'Itinerario', icon: '🎉' },
    { id: 'gallery', label: 'Fotos y Videos', icon: '📷' },
    { id: 'dresscode', label: 'Dress Code', icon: '👗' },
    { id: 'gifts', label: 'Mesa de Regalos', icon: '🎁' },
    { id: 'rsvp', label: 'Confirmación', icon: '✅' },
    { id: 'contact', label: 'Contacto', icon: '📞' },
    { id: 'extra', label: 'Información Adicional', icon: '🏨' },
    { id: 'style', label: 'Personalización', icon: '🎨' },
  ];
  
  return (
    <div className="invitation-form-container">
      {/* Navegación por secciones */}
      <nav className="form-sections-nav">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={activeSection === section.id ? 'active' : ''}
          >
            <span className="icon">{section.icon}</span>
            <span className="label">{section.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Contenido del formulario */}
      <form className="invitation-form">
        {activeSection === 'couple' && <CoupleSection />}
        {activeSection === 'event' && <EventSection />}
        {activeSection === 'schedule' && <ScheduleSection />}
        {/* ... más secciones */}
      </form>
      
      {/* Botones de acción */}
      <div className="form-actions">
        <button type="button" className="btn-save-draft">
          Guardar Borrador
        </button>
        <button type="button" className="btn-preview">
          Vista Previa
        </button>
        <button type="submit" className="btn-publish">
          Publicar Invitación
        </button>
      </div>
    </div>
  );
};
```

---

## 📝 NOTAS FINALES

### Consideraciones Importantes:

1. **Progresividad**: No todos los campos son obligatorios. El usuario puede ir completando la información gradualmente.

2. **Responsividad**: Todos los formularios deben ser 100% responsivos y funcionar en móviles.

3. **Autoguardado**: Implementar guardado automático cada 30 segundos para evitar pérdida de datos.

4. **Vista Previa en Tiempo Real**: Mostrar preview de la invitación mientras se edita.

5. **Plantillas Predefinidas**: Ofrecer configuraciones predefinidas según el tipo de boda (playa, jardín, iglesia, etc.).

6. **Internacionalización**: Preparar los campos para múltiples idiomas si es necesario.

7. **Accesibilidad**: Todos los campos deben cumplir con estándares WCAG 2.1 AA.

8. **Optimización de Imágenes**: Comprimir y redimensionar automáticamente las imágenes subidas.

9. **Backups**: Mantener versiones anteriores de los datos por si el usuario quiere revertir cambios.

10. **Analytics**: Trackear qué campos son más utilizados para mejorar la UX.

---

*Documento creado para el sistema de invitaciones digitales AmiraGift*
*Versión 1.0 - Enero 2025*