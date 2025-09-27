# 📚 **ANÁLISIS EXHAUSTIVO - TODAS LAS SECCIONES DE TEMPLATES PARA BODAS (WEDDINGS)**

**Fecha de Generación:** 24 de Septiembre, 2025
**Versión:** 1.0.0
**Categoría:** Wedding Templates

---

## **📋 ÍNDICE GENERAL DE SECCIONES**

El sistema de templates para bodas incluye **13 secciones principales** con **16 variantes totales**:

1. [**HERO**](#1-sección-hero---portada-principal) (2 variantes: Hero1, Hero2)
2. [**WELCOME**](#2-sección-welcome---bienvenida) (2 variantes: Welcome1, Welcome2)
3. [**COUPLE**](#3-sección-couple---los-novios) (1 variante: Couple1)
4. [**COUNTDOWN**](#4-sección-countdown---cuenta-regresiva) (1 variante: Countdown1)
5. [**STORY**](#5-sección-story---nuestra-historia) (1 variante: Story1)
6. [**VIDEO**](#6-sección-video---video-de-la-historia) (1 variante: Video1)
7. [**GALLERY**](#7-sección-gallery---galería-de-fotos) (2 variantes: Gallery1, Gallery2)
8. [**ITINERARY**](#8-sección-itinerary---itinerario) (1 variante: Itinerary1)
9. [**FAMILIARES**](#9-sección-familiares---familias) (1 variante: Familiares1)
10. [**PLACE_RELIGIOSO**](#10-sección-place_religioso---lugar-religioso) (1 variante: PlaceReligioso1)
11. [**PLACE_CEREMONIA**](#11-sección-place_ceremonia---lugar-de-recepción) (1 variante: PlaceCeremonia1)
12. [**VESTIMENTA**](#12-sección-vestimenta---código-de-vestimenta) (1 variante: Vestimenta1)
13. [**FOOTER**](#13-sección-footer---pie-de-página) (1 variante: Footer1)

---

## **🎭 1. SECCIÓN HERO - PORTADA PRINCIPAL**

### **🎨 Hero1 - Elegante con Parallax**
**Funcionalidad:** Hero section con fondo parallax, menú de navegación y contenido central para nombres de pareja y detalles del evento.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `groom_name` | `string` | `'Jefferson'` | Nombre del novio | ✅ (Hero, Couple, Footer) |
| `bride_name` | `string` | `'Rosmery'` | Nombre de la novia | ✅ (Hero, Couple, Footer) |
| `weddingDate` | `string` | `'2024-12-15T17:00:00'` | Fecha y hora del evento (ISO format) | ✅ (Hero, Footer, Countdown, PlaceReligioso) |
| `eventLocation` | `string` | `'LIMA - PERÚ'` | Ubicación del evento | ✅ (Hero, Footer) |
| `heroImageUrl` | `string` | `'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/1-2.jpg'` | Imagen de fondo de la portada | ❌ |
| `navigationItems` | `Array<{href: string, label: string}>` | Array de 9 items de navegación | Items del menú de navegación | ❌ |

**Características específicas:**
- **Auto-genera:** `coupleNames = "${groom_name} & ${bride_name}"`
- **Formateo de fecha:** Convierte `weddingDate` a formato español legible
- **Parallax background:** `backgroundAttachment: 'fixed'`
- **Responsive navigation:** Menu colapsible en móviles
- **Scroll indicator:** Indicador animado de scroll

### **🎨 Hero2 - Elegante con Borde Ondulado**
**Funcionalidad:** Idéntico a Hero1 pero añade borde SVG ondulado en la parte inferior para transición suave con la siguiente sección.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `groom_name` | `string` | `'Jefferson'` | Nombre del novio | ✅ (Hero, Couple, Footer) |
| `bride_name` | `string` | `'Rosmery'` | Nombre de la novia | ✅ (Hero, Couple, Footer) |
| `weddingDate` | `string` | `'2024-12-15T17:00:00'` | Fecha y hora del evento (ISO format) | ✅ (Hero, Footer, Countdown, PlaceReligioso) |
| `eventLocation` | `string` | `'LIMA - PERÚ'` | Ubicación del evento | ✅ (Hero, Footer) |
| `heroImageUrl` | `string` | `'https://shtheme.com/demosd/brian/wp-content/uploads/2022/04/1-2.jpg'` | Imagen de fondo de la portada | ❌ |
| `navigationItems` | `Array<{href: string, label: string}>` | Array de 9 items de navegación | Items del menú de navegación | ❌ |

**Diferencias con Hero1:**
- **✨ NUEVO:** Borde SVG ondulado en la parte inferior
- **✨ NUEVO:** Scroll indicator posicionado más alto (`bottom-24` vs `bottom-8`)

---

## **👋 2. SECCIÓN WELCOME - BIENVENIDA**

### **🎨 Welcome1 - Garden Background con Foto Circular**
**Funcionalidad:** Sección de bienvenida elegante que crea transición del hero al contenido con fondo de jardín y foto circular sobrepuesta.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `welcome_welcomeText` | `string` | `'Hola & Bienvenidos'` | Texto de bienvenida principal | ❌ |
| `welcome_title` | `string` | `"Nos Vamos a Casarrrrrr!!!!"` | Título principal de la sección | ❌ |
| `welcome_description` | `string` | `"Hoy y siempre, más allá del mañana, necesito que estés a mi lado..."` | Descripción/mensaje de amor extenso | ❌ |
| `welcome_couplePhotoUrl` | `string` | `'https://shtheme.com/demosd/brian/wp-content/uploads/2022/05/couple.png'` | URL de la foto circular de la pareja | ❌ |
| `welcome_bannerImageUrl` | `string` | `'https://i.imgur.com/svWa52m.png'` | Imagen de banner de fondo | ❌ |

**Características específicas:**
- **Foto circular:** 192px (w-48 h-48) con borde blanco y sombra
- **Tipografía mixta:** Great Vibes para título, Montserrat para texto
- **Colores:** Texto amber-700 para bienvenida, gray-800 para título
- **Layout:** Centrado con máximo ancho de 4xl

### **🎨 Welcome2 - Minimalista Centrado en Tipografía**
**Funcionalidad:** Diseño minimalista que se enfoca únicamente en el mensaje de descripción con tipografía sofisticada y layout limpio.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `welcome_description` | `string` | `"TU SIEMPRE SERAS MI REFERENTE DEL AMOR EN PAREJA..."` | Solo descripción/mensaje (única variable usada) | ❌ |

**Variables no utilizadas pero compatibles:**
- `welcome_bannerImageUrl`, `welcome_couplePhotoUrl`, `welcome_welcomeText`, `welcome_title`

**Características específicas:**
- **Ultra minimalista:** Solo muestra descripción
- **Compatibilidad total:** Interface idéntica a Welcome1
- **Tipografía:** Misma tipografía que Welcome1 para consistencia
- **Sistema de variantes:** Configurado en `SECTION_VARIANTS_FIELDS` para mostrar solo 1 campo en customizer

---

## **💑 3. SECCIÓN COUPLE - LOS NOVIOS**

### **🎨 Couple1 - Tarjetas de Perfil con Redes Sociales**
**Funcionalidad:** Presenta a la pareja usando componentes ProfileCard reutilizables con fotos, descripciones e integración de redes sociales.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `couple_sectionTitle` | `string` | `'Futuros Felices Esposos'` | Título principal de la sección | ❌ |
| `couple_sectionSubtitle` | `string` | `'MARIDO & MUJER'` | Subtítulo de la sección | ❌ |
| `bride_name` | `string` | `'Rosmery'` | Nombre de la novia | ✅ (Hero, Couple, Footer) |
| `bride_role` | `string` | `'La Novia'` | Rol de la novia | ❌ |
| `bride_description` | `string` | `'Rosmery, eres mi amor eterno...'` | Descripción personal de la novia | ❌ |
| `bride_imageUrl` | `string` | `'https://shtheme.com/.../bride.png'` | Foto de la novia | ❌ |
| `groom_name` | `string` | `'Jefferson'` | Nombre del novio | ✅ (Hero, Couple, Footer) |
| `groom_role` | `string` | `'El Novio'` | Rol del novio | ❌ |
| `groom_description` | `string` | `'Jefferson, eres mi fuerza...'` | Descripción personal del novio | ❌ |
| `groom_imageUrl` | `string` | `'https://shtheme.com/.../groom.png'` | Foto del novio | ❌ |

**Características específicas:**
- **ProfileCard reutilizable:** Componente interno con fotos circulares (w-40 h-40)
- **Redes sociales:** Facebook, Twitter, Instagram (URLs fijas a '#')
- **Layout responsivo:** Grid MD 2 columnas con gaps de 16
- **Background:** `bg-[#fdfaf6]` (crema suave)
- **Tipografía:** Great Vibes para roles, Montserrat para nombres y descripciones

---

## **⏰ 4. SECCIÓN COUNTDOWN - CUENTA REGRESIVA**

### **🎨 Countdown1 - Timer Animado con Fondo Parallax**
**Funcionalidad:** Crea expectativa mostrando cuenta regresiva en tiempo real hacia la fecha de boda con efecto parallax elegante.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `weddingDate` | `string` | `'2025-12-15T17:00:00'` | Fecha objetivo para cuenta regresiva | ✅ (Hero, Footer, Countdown, PlaceReligioso) |
| `countdown_backgroundImageUrl` | `string` | `'https://shtheme.com/.../1.jpg'` | Imagen de fondo con parallax | ❌ |
| `countdown_preTitle` | `string` | `'DENTRO DE POCO SEREMOS UNA FAMILIA'` | Texto previo al título | ❌ |
| `countdown_title` | `string` | `"Nos Casaremos en ..."` | Título principal de la sección | ❌ |

**Características específicas:**
- **Timer en tiempo real:** Actualización cada segundo con `setTimeout`
- **Formato tiempo:** Días, horas, minutos, segundos con padding de ceros
- **TimeUnit component:** Componente reutilizable para cada unidad
- **Parallax background:** `backgroundAttachment: 'fixed'`
- **Auto-cleanup:** Limpieza de timers en desmontaje del componente
- **Estado cero:** Muestra ceros cuando la fecha ya pasó

---

## **💕 5. SECCIÓN STORY - NUESTRA HISTORIA**

### **🎨 Story1 - Carrusel Interactivo**
**Funcionalidad:** Cuenta la historia de amor de la pareja mediante un carrusel interactivo que permite navegar entre diferentes momentos.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `sectionSubtitle` | `string` | `'JEFFERSON & ROSMERY'` | Subtítulo de la sección | ❌ |
| `sectionTitle` | `string` | `'Nuestra Historia ♥'` | Título principal de la sección | ❌ |
| `story_moment_1_date` | `string` | `'20 DE JULIO, 2010'` | Fecha del primer momento | ❌ |
| `story_moment_1_title` | `string` | `'Asi Nos Conocimos'` | Título del primer momento | ❌ |
| `story_moment_1_description` | `string` | `'La primera vez que nos vimos...'` | Descripción del primer momento | ❌ |
| `story_moment_1_imageUrl` | `string` | `'https://shtheme.com/.../4.jpg'` | Imagen del primer momento | ❌ |
| `story_moment_2_date` | `string` | `'1 DE AGOSTO, 2016'` | Fecha del segundo momento | ❌ |
| `story_moment_2_title` | `string` | `'Nuestra Primera Cita'` | Título del segundo momento | ❌ |
| `story_moment_2_description` | `string` | `'Una noche maravillosa...'` | Descripción del segundo momento | ❌ |
| `story_moment_2_imageUrl` | `string` | `'https://shtheme.com/.../2.jpg'` | Imagen del segundo momento | ❌ |
| `story_moment_3_date` | `string` | `'25 DE JUNIO, 2022'` | Fecha del tercer momento | ❌ |
| `story_moment_3_title` | `string` | `'La Propuesta'` | Título del tercer momento | ❌ |
| `story_moment_3_description` | `string` | `'En un hermoso día...'` | Descripción del tercer momento | ❌ |
| `story_moment_3_imageUrl` | `string` | `'https://shtheme.com/.../1.jpg'` | Imagen del tercer momento | ❌ |

**Estructura de datos:**
```typescript
interface StoryMoment {
  date: string;
  title: string;
  description: string;
  imageUrl: string;
}
```

**Características específicas:**
- **Carrusel interactivo:** useState para `activeIndex` con navegación por puntos
- **Layout superpuesto:** Imagen (3/5) + texto superpuesto con `transform -translate-x-16`
- **Dot navigation:** Puntos clicables para seleccionar momento
- **Validación de seguridad:** Comprueba momentos válidos antes de renderizar
- **Design responsivo:** Flex-col en móvil, flex-row en desktop

---

## **🎥 6. SECCIÓN VIDEO - VIDEO DE LA HISTORIA**

### **🎨 Video1 - Lightbox Modal**
**Funcionalidad:** Permite a las parejas compartir su historia de amor en video con una interfaz modal lightbox elegante que no interrumpe el flujo de la página.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `video_backgroundImageUrl` | `string` | `'https://shtheme.com/.../3-1.jpg'` | Imagen de fondo de la sección | ❌ |
| `video_videoEmbedUrl` | `string` | `'https://www.youtube.com/embed/dQw4w9WgXcQ'` | URL del video embebido (YouTube/Vimeo) | ❌ |
| `video_preTitle` | `string` | `'INCIO NUESTRA HISTORIA'` | Texto previo al título | ❌ |
| `video_title` | `string` | `'Mira nuestra Historia de Amor'` | Título principal de la sección | ❌ |

**Características específicas:**
- **Modal lightbox:** Estado `isModalOpen` con overlay de fondo negro
- **Botón play elegante:** Tres capas circulares con efectos hover y scale
- **Auto-play video:** Añade `?autoplay=1` al abrir modal
- **Parallax background:** `backgroundAttachment: 'fixed'`
- **Click fuera para cerrar:** Event propagation control
- **Responsive modal:** Máximo ancho 4xl con aspect-ratio video

---

## **📸 7. SECCIÓN GALLERY - GALERÍA DE FOTOS**

### **🎨 Gallery1 - Grid Filterable con Lightbox**
**Funcionalidad:** Muestra fotos de boda con filtrado por categorías y visualización lightbox para experiencia inmersiva.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `sectionSubtitle` | `string` | `'Memorias'` | Subtítulo de la sección | ❌ |
| `sectionTitle` | `string` | `'Geleria de Novios'` | Título principal de la sección | ❌ |
| `gallery_images` | `Array<GalleryImage>` | Array de 8 imágenes predefinidas | Array de imágenes de la galería | ❌ |

**Estructura de datos GalleryImage:**
```typescript
interface GalleryImage {
  id: number;
  src?: string;      // URL de la imagen
  url?: string;      // API usa 'url' en lugar de 'src'
  alt: string;       // Texto alternativo
  category: string;  // Categoría: 'ceremony' | 'party'
}
```

**Características específicas:**
- **Filtros de categoría:** 'All', 'Ceremony', 'Party' con estado `selectedCategory`
- **Grid masonry:** Diseño grid con `auto-rows-[250px]` y patrón de alturas
- **Lightbox integrado:** Modal con navegación y botón cerrar
- **Patrón de alturas:** Cada 5ª imagen (índice 1,6,11...) es `row-span-2`
- **Hover effects:** ZoomIn icon y scale en hover
- **Compatibilidad dual:** Soporta tanto `src` como `url` para imágenes

### **🎨 Gallery2 - Grid Responsivo Simple**
**Funcionalidad:** Galería simple sin filtros de categoría, optimizada para visualización móvil con layout 2 columnas móvil y 3 columnas desktop con navegación.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `sectionSubtitle` | `string` | `'Memorias'` | Subtítulo de la sección | ❌ |
| `sectionTitle` | `string` | `'Geleria de Novios'` | Título principal de la sección | ❌ |
| `gallery_images` | `Array<GalleryImage>` | Array de 8 imágenes predefinidas | Array de imágenes de la galería | ❌ |

**Características específicas:**
- **Sin filtros:** No hay filtrado por categorías (más simple que Gallery1)
- **Paginación dual:** Diferente paginación para móvil (4 por página) y desktop (6 por página)
- **Estados separados:** `currentPage` y `currentMobilePage` independientes
- **Navegación con flechas:** ChevronLeft/Right para cambiar páginas
- **Indicadores de página:** Dots clicables para navegación directa
- **Layout responsivo:** 2 columnas móvil (`grid-cols-2`) y 3 columnas desktop (`grid-cols-3`)

---

## **📅 8. SECCIÓN ITINERARY - ITINERARIO**

### **🎨 Itinerary1 - Timeline Editable con Estados**
**Funcionalidad:** Permite a las parejas configurar su itinerario de boda activando/desactivando eventos y asignando horarios específicos.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `itinerary_title` | `string` | `'Tu Itinerario'` | Título principal de la sección | ❌ |
| `itinerary_event_ceremonia_enabled` | `boolean` | `true` | Estado habilitado del evento Ceremonia | ❌ |
| `itinerary_event_ceremonia_time` | `string` | `'13:00'` | Hora del evento Ceremonia (formato 24h) | ❌ |
| `itinerary_event_recepcion_enabled` | `boolean` | `true` | Estado habilitado del evento Recepción | ❌ |
| `itinerary_event_recepcion_time` | `string` | `'15:30'` | Hora del evento Recepción | ❌ |
| `itinerary_event_entrada_enabled` | `boolean` | `true` | Estado habilitado del evento Entrada | ❌ |
| `itinerary_event_entrada_time` | `string` | `'16:30'` | Hora del evento Entrada | ❌ |
| `itinerary_event_comida_enabled` | `boolean` | `true` | Estado habilitado del evento Comida | ❌ |
| `itinerary_event_comida_time` | `string` | `'17:00'` | Hora del evento Comida | ❌ |
| `itinerary_event_fiesta_enabled` | `boolean` | `true` | Estado habilitado del evento Fiesta | ❌ |
| `itinerary_event_fiesta_time` | `string` | `'18:00'` | Hora del evento Fiesta | ❌ |

**Estructura de datos ItineraryState:**
```typescript
interface ItineraryState {
  id: string;        // 'ceremonia' | 'recepcion' | 'entrada' | 'comida' | 'fiesta'
  label: string;     // Nombre mostrado del evento
  enabled: boolean;  // Si el evento está habilitado
  time?: string;     // Hora en formato HH:MM
}
```

**Características específicas:**
- **Timeline zigzag:** Diseño alternando eventos a izquierda y derecha
- **Iconos específicos:** PiChurchDuotone, GiDiamondRing, FaUsersLine, FaUtensils, BiParty
- **Formato de tiempo:** Convierte 24h a 12h (13:00 → 1:00 PM)
- **Línea vertical central:** Conecta todos los eventos con ticks horizontales
- **Color dorado:** `#C9A646` consistente con tema wedding
- **Conditional rendering:** Solo muestra eventos habilitados
- **Configuración oculta:** Panel interactivo oculto (`display: none`)

---

## **👨‍👩‍👧‍👦 9. SECCIÓN FAMILIARES - FAMILIAS**

### **🎨 Familiares1 - Padres y Padrinos**
**Funcionalidad:** Sección elegante que presenta las familias de novio y novia junto con sus padrinos, mostrando respeto y honor a la tradición familiar.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `familiares_titulo_padres` | `string` | `'Con la Bendición de Nuestros Padres'` | Título de la sección de padres | ❌ |
| `familiares_titulo_padrinos` | `string` | `'y nuestros Padrinos'` | Título de la sección de padrinos | ❌ |
| `familiares_padre_novio` | `string` | `'EFRAIN ALBITER HERNÁNDEZ'` | Nombre del padre del novio | ❌ |
| `familiares_madre_novio` | `string` | `'ROCÍO ESQUIVEL GARCÍA'` | Nombre de la madre del novio | ❌ |
| `familiares_padre_novia` | `string` | `'LÁZARO MENESES RAMÍREZ'` | Nombre del padre de la novia | ❌ |
| `familiares_madre_novia` | `string` | `'ANA MARÍA VÁZQUEZ NIEVES'` | Nombre de la madre de la novia | ❌ |
| `familiares_padrino` | `string` | `'JORGE ALBITER HERNÁNDEZ'` | Nombre del padrino | ❌ |
| `familiares_madrina` | `string` | `'JANETH BENÍTEZ REBOLLAR'` | Nombre de la madrina | ❌ |

**Características específicas:**
- **Layout 2x2 padres:** Grid de 2 columnas para padres (novio izquierda, novia derecha)
- **Padrinos en línea:** Formato "Padrino & Madrina" en una sola línea
- **Tipografía elegante:** Great Vibes para títulos, Montserrat para nombres
- **Espaciado limpio:** Separación clara entre sección de padres y padrinos
- **Background blanco:** Fondo limpio sin bordes ni decoraciones
- **Responsive:** Diseño que se adapta a móvil y desktop

---

## **⛪ 10. SECCIÓN PLACE_RELIGIOSO - LUGAR RELIGIOSO**

### **🎨 PlaceReligioso1 - Ubicación de Ceremonia Religiosa**
**Funcionalidad:** Presenta los detalles de la ubicación de la boda religiosa con fecha, hora y detalles de dirección.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `place_religioso_titulo` | `string` | `'Los esperamos en nuestra ceremonia'` | Título de la sección | ❌ |
| `weddingDate` | `string` | `'2024-11-16T17:00:00'` | Fecha y hora del evento | ✅ (Hero, Footer, Countdown, PlaceReligioso) |
| `place_religioso_lugar` | `string` | `'Parroquia Inmaculado Corazón'` | Nombre del lugar religioso | ❌ |
| `place_religioso_direccion` | `string` | `'Alameda de la Paz S/N...'` | Dirección completa del lugar | ❌ |
| `place_religioso_mapa_url` | `string` | `'https://maps.app.goo.gl/...'` | URL del mapa (Google Maps) | ❌ |

**Características específicas:**
- **Formateo de fecha avanzado:** Usa utilidades `formatDateWithDay`, `formatTimeFromDate`, `formatDateParts`
- **Layout visual de fecha:** Día + Número + Mes en primera fila, año en segunda
- **Icono religioso:** `PiChurchDuotone` como separador visual
- **Botón de mapa:** Color dorado `#C9A646` con hover effects
- **Hora extraída:** Usa `formatTimeFromDate(weddingDate)` para mostrar hora
- **Bordes decorativos:** Día y mes con bordes superior e inferior

---

## **🥂 11. SECCIÓN PLACE_CEREMONIA - LUGAR DE RECEPCIÓN**

### **🎨 PlaceCeremonia1 - Ubicación Post-Ceremonia**
**Funcionalidad:** Presenta los detalles de la ubicación de recepción post-ceremonia con fecha, hora específica y detalles de dirección.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `place_ceremonia_titulo` | `string` | `'DESPUÉS DE LA CEREMONIA RELIGIOSA...'` | Título descriptivo de la sección | ❌ |
| `weddingDate` | `string` | `'2024-11-16T17:00:00'` | Fecha del evento (solo para layout visual) | ✅ |
| `place_ceremonia_hora` | `string` | `'15:30'` | Hora específica de la recepción | ❌ |
| `place_ceremonia_lugar` | `string` | `'Rancho Caballeryag'` | Nombre del lugar de recepción | ❌ |
| `place_ceremonia_direccion` | `string` | `'AV. AGUILAS 36...'` | Dirección completa del lugar | ❌ |
| `place_ceremonia_mapa_url` | `string` | `'https://maps.google.com/?q=...'` | URL del mapa (Google Maps) | ❌ |

**Características específicas:**
- **Icono de celebración:** `PiGlassTwoDuotone` (copas de champagne)
- **Hora independiente:** Campo específico `place_ceremonia_hora` separado de `weddingDate`
- **Estilo similar a PlaceReligioso1:** Mantiene consistencia visual
- **Contexto post-ceremonia:** Título indica que es después de la ceremonia religiosa
- **Botón de mapa:** Mismo estilo dorado con hover effects

---

## **👗 12. SECCIÓN VESTIMENTA - CÓDIGO DE VESTIMENTA**

### **🎨 Vestimenta1 - Dress Code y Restricciones de Color**
**Funcionalidad:** Presenta información de código de vestimenta de la boda y restricciones de colores.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `vestimenta_titulo` | `string` | `'Vestimenta'` | Título principal de la sección | ❌ |
| `vestimenta_etiqueta` | `string` | `'ETIQUETA RIGUROSA'` | Código de vestimenta del evento | ❌ |
| `vestimenta_no_colores_titulo` | `string` | `'COLORES NO PERMITIDOS'` | Título de restricciones de colores | ❌ |
| `vestimenta_no_colores_info` | `string` | `'BLANCO, BEIGE, GRIS, ROSA PALO, LILA'` | Lista de colores prohibidos | ❌ |

**Características específicas:**
- **Fondo negro elegante:** `bg-black` con partículas doradas decorativas
- **Bordes SVG ondulados:** Top y bottom con transiciones suaves
- **Partículas de fondo:** Círculos dorados decorativos distribuidos
- **Ornamento SVG:** Decoración central con ramas y hojas doradas
- **Color dorado consistente:** `#C9A646` para mantener tema wedding
- **Tipografía mixta:** Great Vibes para título principal, Montserrat para texto

---

## **📝 13. SECCIÓN FOOTER - PIE DE PÁGINA**

### **🎨 Footer1 - Smart Back to Top Button**
**Funcionalidad:** Footer elegante con funcionalidad inteligente de volver al inicio que mejora la UX de navegación con scroll suave y controles de visibilidad.

| **Variable** | **Tipo** | **Valor por Defecto** | **Descripción** | **Compartida** |
|--------------|----------|----------------------|-----------------|-----------------|
| `groom_name` | `string` | `'Jefferson'` | Nombre del novio | ✅ (Hero, Couple, Footer) |
| `bride_name` | `string` | `'Rosmery'` | Nombre de la novia | ✅ (Hero, Couple, Footer) |
| `weddingDate` | `string` | `'2026-12-24T17:00:00'` | Fecha y hora del evento | ✅ (Hero, Footer, Countdown, PlaceReligioso) |
| `eventLocation` | `string` | `'Lima, Peru'` | Ubicación del evento | ✅ (Hero, Footer) |
| `footer_copyrightText` | `string` | `'Hecho con Amor. All right reserved Amiras Gift.'` | Texto de copyright | ❌ |

**Características específicas:**
- **Auto-genera `coupleNames`:** `"${groom_name} & ${bride_name}"`
- **Formateo de fecha:** Convierte `weddingDate` a formato español UPPERCASE
- **Botón back-to-top inteligente:** Solo visible después de scroll > 300px
- **Smooth scroll:** `behavior: 'smooth'` para navegación suave
- **Fondo oscuro:** `bg-[#222222]` con texto claro
- **Event listeners:** Cleanup adecuado de scroll listeners

---

## **🔧 ANÁLISIS DE VARIABLES COMPARTIDAS**

### **Variables Globales (Usadas en Múltiples Secciones)**

| **Variable** | **Secciones** | **Propósito** |
|--------------|---------------|---------------|
| `groom_name` | Hero, Couple, Footer | Nombre del novio consistente en toda la invitación |
| `bride_name` | Hero, Couple, Footer | Nombre de la novia consistente en toda la invitación |
| `weddingDate` | Hero, Footer, Countdown, PlaceReligioso, PlaceCeremonia | Fecha y hora del evento principal |
| `eventLocation` | Hero, Footer | Ubicación principal del evento |

### **Variables de Sección Específica**

**Por categoría de customizer:**
- **Evento:** 2 campos (`weddingDate`, `eventLocation`)
- **Pareja:** 2 campos (`groom_name`, `bride_name`)
- **Imágenes:** 8+ campos (hero, welcome, couple, countdown, video, story)
- **Mensajes/Títulos:** 25+ campos (todos los textos personalizables)
- **Multimedia:** 2 campos (`video_videoEmbedUrl`, `gallery_images`)
- **Lugares:** 10 campos (place_religioso y place_ceremonia)
- **Eventos Itinerario:** 11 campos (título + 5 eventos × 2 campos cada uno)
- **Familiares:** 8 campos (padres y padrinos)
- **Vestimenta:** 4 campos (código de vestimenta)

---

## **📊 ESTADÍSTICAS FINALES**

### **Métricas Generales**
- **📄 Total de secciones:** 13
- **🎨 Total de variantes:** 16
- **⚙️ Total de variables únicas:** ~85 campos
- **🔗 Variables compartidas:** 4 campos globales
- **🎯 Variables específicas:** ~81 campos únicos por sección

### **Distribución por Tipo de Dato**
| **Tipo** | **Cantidad** | **Uso** |
|----------|--------------|---------|
| `string` | ~75 | Textos, URLs, fechas, nombres |
| `boolean` | 5 | Estados de eventos en itinerario |
| `Array<>` | 2 | Imágenes de galería, items de navegación |

### **Sistema de Diseño**
- **🎨 Color principal:** Dorado `#C9A646` (consistente en todo el tema)
- **📝 Tipografías:** Great Vibes (cursiva elegante) + Montserrat (sans-serif moderna)
- **📱 Responsive:** Todas las secciones optimizadas para móvil y desktop
- **🎭 Efectos:** Parallax, hover states, transiciones suaves

---

## **🏗️ ARQUITECTURA TÉCNICA**

### **Sistema de Variantes**
- **SECTION_VARIANTS_FIELDS:** Sistema inteligente que muestra solo campos relevantes por variante
- **Ejemplo:** Welcome2 muestra solo 1 campo vs Welcome1 que muestra 5 campos

### **Patrón de Componentes**
```typescript
// Cada componente exporta:
export const ComponentNameDefaultProps = {
  // Todos los valores por defecto
}

// Interface clara de props
interface ComponentNameProps {
  // Todas las variables con tipos
}

// Componente con defaults
export const ComponentName: React.FC<ComponentNameProps> = ({
  prop1 = ComponentNameDefaultProps.prop1,
  // ... más props
}) => { ... }
```

### **Sistema de Registro Dinámico**
```typescript
// Registry centralizado
weddingSectionRegistry = {
  'hero_1': Hero1,
  'hero_2': Hero2,
  'welcome_1': Welcome1,
  'welcome_2': Welcome2,
  // ... todas las variantes
}

// Carga dinámica
const Component = getWeddingSectionComponent(variantId);
```

### **Integración con Customizer**
- **useDynamicCustomizer Hook:** Centraliza toda la lógica de transformación
- **Field Definitions:** Cada campo tiene tipo, label, validación
- **Transform Pipeline:** API data → Template props → Component render

---

## **🚀 CAPACIDADES DEL SISTEMA**

### **Flexibilidad**
- ✅ **Infinitas combinaciones** de templates posibles
- ✅ **Variantes ilimitadas** por cada sección
- ✅ **Campos opcionales** para personalización gradual
- ✅ **Defaults inteligentes** para comenzar rápidamente

### **Escalabilidad**
- ✅ **Nuevas secciones** fáciles de agregar siguiendo el patrón
- ✅ **Nuevas variantes** sin romper compatibilidad
- ✅ **Campos adicionales** sin afectar existentes
- ✅ **Categorías nuevas** (cumpleaños, corporativo) usando misma arquitectura

### **Mantenibilidad**
- ✅ **Single Source of Truth** para defaults
- ✅ **TypeScript completo** para type safety
- ✅ **Componentes aislados** sin interdependencias
- ✅ **Registry centralizado** para gestión simple

---

## **📚 GUÍAS RELACIONADAS**

- [Guía de Registro de Nuevas Secciones](../GUIA_REGISTRO_NUEVAS_SECCIONES.md)
- [Arquitectura de Customizer por Categorías](../CLAUDE.md#category-based-customizer-architecture)
- [Sistema SECTION_VARIANTS_FIELDS](../ultima_modificacion.md#section-variants-fields)

---

**Documento generado automáticamente por análisis exhaustivo del código fuente**
**Última actualización:** 24 de Septiembre, 2025
**Sistema:** Wedding Templates - Invitaciones Web