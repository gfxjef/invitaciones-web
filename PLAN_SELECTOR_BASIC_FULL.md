# PLAN DETALLADO: SELECTOR BASIC/FULL EN CUSTOMIZER PANEL

**Fecha:** 21 de Septiembre, 2025 - 12:00 PM
**Contexto:** Sistema de personalización actual necesita selector de modos Basic/Full
**Objetivo:** Implementar filtro de campos en CustomizerPanel sin crear editores separados

---

## ANÁLISIS DEL SISTEMA ACTUAL

### ✅ **Sistema Existente Analizados:**

**Archivo Principal: `CustomizerPanel.tsx`**
- ✅ Panel deslizante con 366 líneas de código
- ✅ Recibe `fieldsByCategory` como prop estructurado por secciones
- ✅ Ya tiene estadísticas: `sectionsCount`, `fieldsCount`, `touchedFieldsCount`
- ✅ Header con título "Personalizar Invitación" (línea 82)
- ✅ Sistema de secciones colapsables con iconos
- ✅ Agrupación especial para story (momentos) y gallery (imágenes)

**Archivo de Campos: `sectionFieldsMap.ts`**
- ✅ 815 líneas con definiciones completas de todos los campos
- ✅ 7 secciones principales: hero, welcome, couple, countdown, story, gallery, video, footer
- ✅ 83 campos totales distribuidos entre las secciones
- ✅ Cada campo tiene: key, label, type, section, category

**Hook Principal: `useDynamicCustomizer.ts`**
- ✅ Maneja estado progresivo (progressive override)
- ✅ Genera `fieldsByCategory` agrupado por secciones
- ✅ Controla touched fields y merging de datos

---

## MAPEO DETALLADO: CAMPOS BASIC vs FULL

### 🎯 **CRITERIO DE CLASIFICACIÓN:**

**BASIC** = Campos esenciales que un usuario común necesita personalizar
**FULL** = Campos avanzados para personalización completa (imágenes, descripciones detalladas)

### **1. SECCIÓN HERO (Portada) - 4 campos**
```typescript
BASIC: [
  'coupleNames',        // ✅ ESENCIAL - Nombres de la Pareja
  'eventDate',          // ✅ ESENCIAL - Fecha del Evento
  'eventLocation'       // ✅ ESENCIAL - Lugar del Evento
]

FULL: [
  'heroImageUrl'        // 🔧 AVANZADO - Imagen de Portada (requiere URL)
]
```

### **2. SECCIÓN WELCOME (Bienvenida) - 5 campos**
```typescript
BASIC: [
  'welcome_welcomeText', // ✅ ESENCIAL - Texto de Bienvenida
  'welcome_title'        // ✅ ESENCIAL - Título Principal
]

FULL: [
  'welcome_description',    // 🔧 AVANZADO - Descripción larga
  'welcome_couplePhotoUrl', // 🔧 AVANZADO - Foto de la Pareja (requiere URL)
  'welcome_bannerImageUrl' // 🔧 AVANZADO - Imagen de Banner (requiere URL)
]
```

### **3. SECCIÓN COUPLE (Los Novios) - 10 campos**
```typescript
BASIC: [
  'bride_name',           // ✅ ESENCIAL - Nombre de la Novia
  'bride_role',           // ✅ ESENCIAL - Rol de la Novia
  'groom_name',           // ✅ ESENCIAL - Nombre del Novio
  'groom_role'            // ✅ ESENCIAL - Rol del Novio
]

FULL: [
  'couple_sectionTitle',     // 🔧 AVANZADO - Título de Sección
  'couple_sectionSubtitle',  // 🔧 AVANZADO - Subtítulo de Sección
  'bride_description',       // 🔧 AVANZADO - Descripción de la Novia
  'bride_imageUrl',          // 🔧 AVANZADO - Foto de la Novia (requiere URL)
  'groom_description',       // 🔧 AVANZADO - Descripción del Novio
  'groom_imageUrl'           // 🔧 AVANZADO - Foto del Novio (requiere URL)
]
```

### **4. SECCIÓN COUNTDOWN (Cuenta Regresiva) - 4 campos**
```typescript
BASIC: [
  'countdown_weddingDate'  // ✅ ESENCIAL - Fecha de la Boda (ISO)
]

FULL: [
  'countdown_backgroundImageUrl', // 🔧 AVANZADO - Imagen de Fondo
  'countdown_preTitle',           // 🔧 AVANZADO - Pre-título
  'countdown_title'               // 🔧 AVANZADO - Título Principal
]
```

### **5. SECCIÓN STORY (Nuestra Historia) - 13 campos**
```typescript
BASIC: [
  'story_moment_1_title',       // ✅ ESENCIAL - Momento 1 - Título
  'story_moment_1_date',        // ✅ ESENCIAL - Momento 1 - Fecha
  'story_moment_2_title',       // ✅ ESENCIAL - Momento 2 - Título
  'story_moment_2_date'         // ✅ ESENCIAL - Momento 2 - Fecha
]

FULL: [
  'sectionSubtitle',            // 🔧 AVANZADO - Subtítulo de sección
  'sectionTitle',               // 🔧 AVANZADO - Título de sección
  'story_moment_1_description', // 🔧 AVANZADO - Momento 1 - Descripción
  'story_moment_1_imageUrl',    // 🔧 AVANZADO - Momento 1 - Imagen
  'story_moment_2_description', // 🔧 AVANZADO - Momento 2 - Descripción
  'story_moment_2_imageUrl',    // 🔧 AVANZADO - Momento 2 - Imagen
  'story_moment_3_date',        // 🔧 AVANZADO - Momento 3 - Fecha
  'story_moment_3_title',       // 🔧 AVANZADO - Momento 3 - Título
  'story_moment_3_description', // 🔧 AVANZADO - Momento 3 - Descripción
  'story_moment_3_imageUrl'     // 🔧 AVANZADO - Momento 3 - Imagen
]
```

### **6. SECCIÓN GALLERY (Galería) - 30 campos**
```typescript
BASIC: [
  // Solo primeras 3 imágenes para modo básico
  'gallery_image_1_url',     // ✅ ESENCIAL - Imagen 1 - URL
  'gallery_image_2_url',     // ✅ ESENCIAL - Imagen 2 - URL
  'gallery_image_3_url'      // ✅ ESENCIAL - Imagen 3 - URL
]

FULL: [
  'sectionSubtitle',         // 🔧 AVANZADO - Subtítulo de sección
  'sectionTitle',            // 🔧 AVANZADO - Título de sección

  // Todas las imágenes con metadatos completos
  'gallery_image_1_alt', 'gallery_image_1_category',
  'gallery_image_2_alt', 'gallery_image_2_category',
  'gallery_image_3_alt', 'gallery_image_3_category',
  'gallery_image_4_url', 'gallery_image_4_alt', 'gallery_image_4_category',
  'gallery_image_5_url', 'gallery_image_5_alt', 'gallery_image_5_category',
  'gallery_image_6_url', 'gallery_image_6_alt', 'gallery_image_6_category',
  'gallery_image_7_url', 'gallery_image_7_alt', 'gallery_image_7_category',
  'gallery_image_8_url', 'gallery_image_8_alt', 'gallery_image_8_category',
  'gallery_image_9_url', 'gallery_image_9_alt', 'gallery_image_9_category',
  'gallery_image_10_url', 'gallery_image_10_alt', 'gallery_image_10_category'
]
```

### **7. SECCIÓN VIDEO - 4 campos**
```typescript
BASIC: []  // ✅ Video completo es considerado avanzado

FULL: [
  'video_backgroundImageUrl', // 🔧 AVANZADO - Imagen de Fondo
  'video_videoEmbedUrl',      // 🔧 AVANZADO - URL del Video (Embed)
  'video_preTitle',           // 🔧 AVANZADO - Pre-título
  'video_title'               // 🔧 AVANZADO - Título Principal
]
```

### **8. SECCIÓN FOOTER - 4 campos**
```typescript
BASIC: [
  'footer_coupleNames',    // ✅ ESENCIAL - Nombres de la Pareja
  'footer_eventDate',      // ✅ ESENCIAL - Fecha del Evento
  'footer_eventLocation'   // ✅ ESENCIAL - Lugar del Evento
]

FULL: [
  'footer_copyrightText'   // 🔧 AVANZADO - Texto de Copyright
]
```

---

## RESUMEN ESTADÍSTICO

### **DISTRIBUCIÓN BASIC vs FULL:**
```
📊 MODO BASIC:  21 campos (25.3% del total)
📊 MODO FULL:   83 campos (100% del total)

Por sección:
• hero:      3 BASIC + 1 FULL = 4 total
• welcome:   2 BASIC + 3 FULL = 5 total
• couple:    4 BASIC + 6 FULL = 10 total
• countdown: 1 BASIC + 3 FULL = 4 total
• story:     4 BASIC + 9 FULL = 13 total
• gallery:   3 BASIC + 27 FULL = 30 total
• video:     0 BASIC + 4 FULL = 4 total
• footer:    3 BASIC + 1 FULL = 4 total

TOTAL:      21 BASIC + 62 FULL = 83 campos
```

### **CRITERIOS DE CLASIFICACIÓN APLICADOS:**

✅ **BASIC = Información Fundamental:**
- Nombres de pareja
- Fechas importantes
- Lugares del evento
- Títulos principales básicos
- Máximo 3 imágenes de galería

🔧 **FULL = Personalización Avanzada:**
- URLs de imágenes (requieren conocimiento técnico)
- Descripciones largas y textos detallados
- Subtítulos y metadatos
- Secciones completas como video
- Galería extendida (10 imágenes + metadatos)

---

## ARCHIVOS A MODIFICAR/ELIMINAR

### **✅ ARCHIVOS A MODIFICAR:**

#### **1. `CustomizerPanel.tsx` (MODIFICAR)**
- **Línea 70-109**: Agregar selector Basic/Full en header
- **Línea 15-29**: Agregar prop `selectedMode: 'basic' | 'full'`
- **Línea 129-307**: Filtrar `fieldsByCategory` según modo seleccionado
- **Nueva lógica**: Función de filtrado de campos por modo

#### **2. `sectionFieldsMap.ts` (MODIFICAR)**
- **Línea 150-815**: Agregar metadata `mode: 'basic' | 'full'` a cada campo
- **Nueva exportación**: `BASIC_FIELDS` y `FULL_FIELDS` arrays
- **Nueva función**: `getFieldsByMode(mode: 'basic' | 'full'): string[]`

#### **3. `types.ts` (MODIFICAR)**
- **Línea 8-15**: Agregar `mode?: 'basic' | 'full'` a `CustomizerField`
- **Línea 71-80**: Agregar `selectedMode: 'basic' | 'full'` a `CustomizerState`

#### **4. `useDynamicCustomizer.ts` (MODIFICAR)**
- **Estado nuevo**: `selectedMode` state hook
- **Función nueva**: `setSelectedMode(mode: 'basic' | 'full')`
- **Lógica nueva**: Filtrar fields en `fieldsByCategory` según modo

#### **5. `DynamicCustomizer.tsx` (MODIFICAR MÍNIMO)**
- **Línea 47**: Pasar nuevo prop `selectedMode` a CustomizerPanel
- **Sin cambios estructurales** - solo prop drilling

### **❌ ARCHIVOS A ELIMINAR:**

#### **1. `SimpleEditor.tsx` (ELIMINAR)**
- **Razón**: Ya no es necesario - el selector va en CustomizerPanel
- **Ubicación**: `frontend/src/components/editor/SimpleEditor.tsx`
- **Estado**: Creado en conversación anterior pero no utilizado

### **📂 ARCHIVOS SIN CAMBIOS:**
- `CustomizerButton.tsx` - No requiere modificaciones
- `CustomizerField.tsx` - No requiere modificaciones
- `index.ts` - Solo actualizar exports si es necesario

---

## PROPUESTA DE IMPLEMENTACIÓN

### **FASE 1: MODIFICAR TIPOS Y CONSTANTES**

#### **A. Actualizar `types.ts`:**
```typescript
export interface CustomizerField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'url' | 'textarea' | 'color';
  placeholder?: string;
  section: string;
  category: string;
  mode?: 'basic' | 'full';  // 🆕 NUEVO
}

export interface CustomizerState {
  isOpen: boolean;
  data: CustomizerData;
  availableFields: CustomizerField[];
  sectionsUsed: string[];
  progressiveData: ProgressiveData;
  fieldStates: Record<string, FieldState>;
  selectedMode: 'basic' | 'full';  // 🆕 NUEVO
}

// 🆕 NUEVO TIPO
export type CustomizerMode = 'basic' | 'full';
```

#### **B. Actualizar `sectionFieldsMap.ts`:**
```typescript
// 🆕 AGREGAR AL FINAL DEL ARCHIVO
export const BASIC_FIELDS: string[] = [
  // Hero
  'coupleNames', 'eventDate', 'eventLocation',
  // Welcome
  'welcome_welcomeText', 'welcome_title',
  // Couple
  'bride_name', 'bride_role', 'groom_name', 'groom_role',
  // Countdown
  'countdown_weddingDate',
  // Story
  'story_moment_1_title', 'story_moment_1_date',
  'story_moment_2_title', 'story_moment_2_date',
  // Gallery
  'gallery_image_1_url', 'gallery_image_2_url', 'gallery_image_3_url',
  // Footer
  'footer_coupleNames', 'footer_eventDate', 'footer_eventLocation'
];

// 🆕 NUEVA FUNCIÓN
export function getFieldsByMode(
  allFields: CustomizerField[],
  mode: 'basic' | 'full'
): CustomizerField[] {
  if (mode === 'basic') {
    return allFields.filter(field => BASIC_FIELDS.includes(field.key));
  }
  return allFields; // FULL mode = todos los campos
}

// 🆕 NUEVA FUNCIÓN
export function getFieldsByCategoryWithMode(
  availableFields: CustomizerField[],
  activeSections: string[],
  mode: 'basic' | 'full'
): Record<string, CustomizerField[]> {
  const filteredFields = getFieldsByMode(availableFields, mode);
  return getFieldsByOrderedSections(filteredFields, activeSections);
}
```

### **FASE 2: ACTUALIZAR HOOK PRINCIPAL**

#### **Modificar `useDynamicCustomizer.ts`:**
```typescript
export const useDynamicCustomizer = ({ templateData, sectionsConfig }) => {
  // 🆕 NUEVO ESTADO
  const [selectedMode, setSelectedMode] = useState<'basic' | 'full'>('basic');

  // Modificar fieldsByCategory para usar modo seleccionado
  const fieldsByCategory = useMemo(() => {
    return getFieldsByCategoryWithMode(availableFields, activeSections, selectedMode);
  }, [availableFields, activeSections, selectedMode]);

  // 🆕 NUEVA FUNCIÓN EXPORTADA
  const switchMode = useCallback((mode: 'basic' | 'full') => {
    setSelectedMode(mode);
  }, []);

  return {
    // ... exports existentes
    selectedMode,      // 🆕 NUEVO
    switchMode,        // 🆕 NUEVO
    // fieldsByCategory ya filtrado por modo
  };
};
```

### **FASE 3: ACTUALIZAR UI DEL PANEL**

#### **Modificar `CustomizerPanel.tsx`:**

**A. Agregar Props:**
```typescript
interface CustomizerPanelProps {
  // ... props existentes
  selectedMode: 'basic' | 'full';           // 🆕 NUEVO
  onModeChange: (mode: 'basic' | 'full') => void;  // 🆕 NUEVO
}
```

**B. Agregar Selector en Header (después línea 98):**
```typescript
{/* 🆕 NUEVO: Mode Selector */}
<div className="mt-4 flex items-center justify-center">
  <div className="flex bg-gray-100 rounded-lg p-1">
    <button
      onClick={() => onModeChange('basic')}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
        selectedMode === 'basic'
          ? 'bg-white text-purple-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      Básico ({/* calcular campos básicos */})
    </button>
    <button
      onClick={() => onModeChange('full')}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
        selectedMode === 'full'
          ? 'bg-white text-purple-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      Completo ({fieldsCount})
    </button>
  </div>
</div>
```

**C. Actualizar Estadísticas en Header:**
```typescript
// Calcular estadísticas por modo
const modeStats = useMemo(() => {
  const basicCount = Object.values(fieldsByCategory)
    .flat()
    .filter(field => BASIC_FIELDS.includes(field.key)).length;

  return selectedMode === 'basic'
    ? { current: basicCount, total: fieldsCount }
    : { current: fieldsCount, total: fieldsCount };
}, [fieldsByCategory, selectedMode, fieldsCount]);

// Actualizar texto del header
<span>{sectionsCount} secciones • {modeStats.current} campos {selectedMode === 'basic' ? 'básicos' : 'completos'}</span>
```

### **FASE 4: CONECTAR TODO EN DYNAMICCUSTOMIZER**

#### **Modificar `DynamicCustomizer.tsx`:**
```typescript
export const DynamicCustomizer: React.FC<DynamicCustomizerProps> = ({
  children,
  templateData = {},
  sectionsConfig = {},
  className = ''
}) => {

  const {
    // ... hooks existentes
    selectedMode,     // 🆕 NUEVO
    switchMode,       // 🆕 NUEVO
  } = useDynamicCustomizer({
    templateData,
    sectionsConfig
  });

  return (
    <div className={`relative ${className}`}>
      {enhancedChildren}

      <CustomizerButton
        onClick={toggleCustomizer}
        isOpen={isOpen}
        hasFields={hasFields}
      />

      <CustomizerPanel
        // ... props existentes
        selectedMode={selectedMode}        // 🆕 NUEVO
        onModeChange={switchMode}          // 🆕 NUEVO
      />
    </div>
  );
};
```

---

## FLUJO DE FUNCIONAMIENTO

### **🔄 FLUJO DE USUARIO:**

1. **Usuario abre CustomizerPanel**
   → Modo 'basic' por defecto
   → Ve solo 21 campos esenciales

2. **Usuario hace cambios en modo básico**
   → Personaliza nombres, fechas, lugares básicos
   → Progress bar muestra % completado en contexto básico

3. **Usuario clickea "Completo"**
   → Panel recarga con 83 campos totales
   → Mantiene cambios previos intactos
   → Ve opciones avanzadas (URLs, descripciones, etc.)

4. **Usuario regresa a "Básico"**
   → Ve solo campos esenciales nuevamente
   → Todos los cambios se preservan
   → UI simplificada

### **🔧 FLUJO TÉCNICO:**

1. **`useDynamicCustomizer`** genera `availableFields` completo
2. **`getFieldsByMode()`** filtra según modo seleccionado
3. **`getFieldsByCategoryWithMode()`** reorganiza por secciones
4. **`CustomizerPanel`** renderiza solo campos filtrados
5. **Progressive override** mantiene todos los datos intactos

---

## BENEFICIOS DE ESTA IMPLEMENTACIÓN

### ✅ **PARA USUARIOS NOVATOS:**
- **Modo Básico**: Solo 21 campos esenciales vs 83 totales
- **Sin URLs complejas**: No necesita conocimiento técnico
- **Interfaz limpia**: Menos overwhelm, más enfoque
- **Progresión natural**: Puede avanzar a Full cuando esté listo

### ✅ **PARA USUARIOS AVANZADOS:**
- **Modo Completo**: Acceso total a personalización
- **Sin limitaciones**: Todas las funcionalidades disponibles
- **Flexibilidad**: Puede alternar entre modos sin perder datos

### ✅ **PARA DESARROLLO:**
- **Sin duplicación**: Un solo sistema, dos vistas
- **Escalable**: Fácil agregar nuevos campos con clasificación
- **Mantenible**: Lógica centralizada en `sectionFieldsMap.ts`
- **Backward compatible**: No rompe funcionalidad existente

### ✅ **TÉCNICAMENTE:**
- **Performance**: Menos campos = renderizado más rápido en modo básico
- **UX progresiva**: Usuario aprende el sistema gradualmente
- **Datos consistentes**: Progressive override preserva todo
- **Testing**: Misma lógica base, diferentes filtros

---

## CONSIDERACIONES FINALES

### **🎯 CASOS DE USO:**

**Modo Básico Ideal Para:**
- Usuarios primerizos
- Personalización rápida
- Eventos simples
- Mobile experience

**Modo Completo Ideal Para:**
- Usuarios experimentados
- Bodas elaboradas
- Máxima personalización
- Desktop experience

### **📱 RESPONSIVE:**
- En mobile: Modo básico por defecto
- En desktop: Usuario elige libremente
- Selector siempre visible y accesible

### **🔄 MIGRACIÓN:**
- **Componentes eliminados**: `SimpleEditor.tsx` (no utilizado)
- **Cambios mínimos**: Solo agregar filtros, no reestructurar
- **Testing**: Verificar que modo Full = comportamiento actual

---

**Desarrollado por**: Claude Code (Principal Frontend Planner)
**Status**: 📋 **PLAN COMPLETO LISTO PARA IMPLEMENTACIÓN**
**Estimación**: 3-4 horas de desarrollo + testing
**Complejidad**: Media - modificaciones focalizadas, sin reestructuración mayor