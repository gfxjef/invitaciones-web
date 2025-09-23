# 🚨 DEBUG LOGGING AGREGADO PARA GALLERY_IMAGES

## 📍 **PROBLEMA A INVESTIGAR**
La sección "Galería" aparece en el customizer pero NO tiene campos (está vacía), específicamente falta el campo `gallery_images` con MultiImageGalleryPicker.

## 🔑 **DESCUBRIMIENTO CRÍTICO**
Basado en los logs del usuario, el template está usando **`gallery_2`** pero puede haber inconsistencias en la configuración.

## 🔍 **LOGGING AGREGADO**

### **1. detectActiveSections() - Detección de secciones**
**Archivo:** `frontend/src/components/templates/categories/weddings/customizer/sectionFieldsMap.ts:627`

**Logs esperados:**
```
🔍 detectActiveSections called with: { sectionsConfig, templateData, sections_config_ordered }
✅ Using sections_config_ordered: [...] | Using Object.keys fallback: [...]
🔍 Section "gallery": value="gallery_1", enabled=true
🎯 detectActiveSections final result: ["hero", "welcome", "couple", ..., "gallery", "footer"]
🎯 Gallery section included? true
```

### **2. getFieldsByOrderedSections() - Agrupación de campos**
**Archivo:** `frontend/src/components/templates/categories/weddings/customizer/sectionFieldsMap.ts:684`

**Logs esperados:**
```
🔍 getFieldsByOrderedSections called with: { availableFields: [...], activeSections: [...], totalFields: 42 }
✅ gallery_images assigned to section "gallery"
🎯 getFieldsByOrderedSections final result: { sections: ["hero", "gallery", ...], galleryFields: 3, galleryHasGalleryImages: true }
```

### **3. getAvailableFields() - Recolección de campos**
**Archivo:** `frontend/src/components/templates/categories/weddings/customizer/sectionFieldsMap.ts:605`

**Logs esperados:**
```
🔍 getAvailableFields called with activeSections: ["hero", "welcome", "gallery", ...]
🔍 Section "gallery" has fields: ["sectionSubtitle", "sectionTitle", "gallery_images"]
✅ gallery_images found in gallery section fields
🔍 gallery_images in fieldsSet? true
🎯 getAvailableFields final result: { totalFields: 42, galleryImagesIncluded: true }
```

### **4. useDynamicCustomizer() - Filtrado por modo**
**Archivo:** `frontend/src/lib/hooks/useDynamicCustomizer.ts:758`

**Logs esperados:**
```
🔍 useDynamicCustomizer fieldsBySection calculation: { selectedMode: "basic", totalAvailableFields: 42, activeSections: [...], basicFieldsCount: 25, galleryInBasicFields: true }
🔍 After mode filtering: { filteredFieldsCount: 25, galleryImagesIncluded: true, filteredFieldKeys: [..., "gallery_images", ...] }
🎯 useDynamicCustomizer final fieldsBySection: { sections: ["hero", "gallery", ...], gallerySection: [{key: "gallery_images", ...}], galleryFieldsCount: 3 }
```

### **5. DynamicCustomizer - Datos finales**
**Archivo:** `frontend/src/components/customizer/DynamicCustomizer.tsx:30`

**Logs esperados:**
```
🚨 DynamicCustomizer mounted with: { templateData: "7", sectionsConfig: {...}, hasSectionsConfig: true }
🚨 DynamicCustomizer passing to CustomizerPanel: { gallerySection: [{key: "gallery_images"}], galleryFields: 3, selectedMode: "basic" }
```

## 🎯 **PUNTOS CRÍTICOS A VERIFICAR**

### **SI GALLERY NO APARECE EN detectActiveSections:**
- ❌ Template NO tiene `'gallery': 'gallery_1'` en sections_config
- ❌ sectionsConfig llega como `null` o `undefined`
- ❌ Lógica de filtrado tiene un bug

### **SI GALLERY APARECE PERO SIN CAMPOS:**
- ❌ `gallery_images` NO está en `WEDDING_BASIC_FIELDS`
- ❌ Mode filtering está eliminando `gallery_images`
- ❌ `getFieldsByOrderedSections` NO está agrupando correctamente

### **SI TODO FUNCIONA EN LOGS PERO NO EN UI:**
- ❌ CustomizerPanel NO está recibiendo los datos correctamente
- ❌ MultiImageGalleryPicker tiene un bug de renderizado
- ❌ CustomizerField no está manejando el tipo 'multi-image'

## 🧪 **CÓMO PROBAR**

1. **Abrir la aplicación**: `http://localhost:3000/invitacion/demo/7`
2. **Abrir DevTools**: F12 → Console
3. **Abrir customizer**: Click en el botón del customizer
4. **Buscar logs**: Buscar los emojis 🔍, ✅, ❌, 🎯 en la consola
5. **Verificar Gallery**: Ir a la sección "Galería" en el customizer

## 📋 **RESULTADOS ESPERADOS**

### **✅ ESCENARIO IDEAL:**
```
🔍 detectActiveSections → gallery incluido ✅
🔍 getFieldsByOrderedSections → gallery_images asignado ✅
🔍 useDynamicCustomizer → gallery_images en modo básico ✅
→ MultiImageGalleryPicker aparece en la sección Gallery
```

### **❌ ESCENARIOS DE ERROR:**
- Gallery no detectado como activo
- gallery_images filtrado por modo básico
- gallery_images no agrupado en sección gallery
- Problemas de renderizado en UI

## 🔧 **ACCIONES BASADAS EN RESULTADOS**

**Si gallery NO se detecta como activo:**
→ Verificar configuración del template en base de datos

**Si gallery_images se filtra en modo básico:**
→ Verificar `WEDDING_BASIC_FIELDS` array

**Si gallery_images no se agrupa correctamente:**
→ Verificar lógica de `getFieldsByOrderedSections`

**Si los logs son correctos pero UI no funciona:**
→ Verificar `CustomizerPanel` y `MultiImageGalleryPicker`

---

## ⚠️ **IMPORTANTE**
Este logging es **TEMPORAL** y debe ser removido una vez identificado y solucionado el problema.