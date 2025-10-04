# 🔬 Storage & Sections Data Playground - Instrucciones

## ¿Qué es esto?

Una página de testeo interactiva para **visualizar y depurar** el flujo completo de datos desde localStorage hasta la base de datos. Esto permite identificar exactamente dónde se pierden los datos en el proceso de creación de invitaciones.

## 🚀 Cómo Usar

### Paso 1: Navegar a la Página Demo

1. Ir a: `http://localhost:3000/invitacion/demo/9`
2. Click en **"Personalizar invitación"**
3. Cambiar a modo **"Completo"**
4. Llenar algunos campos:
   - Nombre del Novio: `Carlos Méndez`
   - Nombre de la Novia: `María González`
   - Lugar del Evento: `AREQUIPA - PERÚ`
   - Descripción de Bienvenida: `Nos complace invitarte...`
   - Título del Itinerario: `Nuestro Itinerario Especial`

5. **IMPORTANTE**: Hacer click fuera de cada campo después de escribir para que React actualice el state
6. Esperar 2-3 segundos para que `useCustomizerSync` guarde en localStorage (debounce de 500ms)

### Paso 2: Abrir el Playground

1. Abrir nueva pestaña: `http://localhost:3000/test-storage`
2. La página cargará automáticamente los datos de localStorage
3. Verás 3 paneles principales:

#### Panel 1: 📦 LocalStorage Data
- **Storage Key**: `demo-customizer-9`
- **Total Fields**: Cuántos campos existen en total (ej: 43)
- **Non-Empty Fields**: 🔴 **CRÍTICO** - Cuántos campos tienen datos reales
  - ✅ Si es > 0: Los datos se están guardando correctamente
  - ❌ Si es 0: **PROBLEMA** - React state no está actualizando localStorage
- **Customizer Data**: Primeros 10 campos con sus valores

**Botón**: `Reload` - Recargar datos de localStorage

#### Panel 2: 🗂️ Sections Data
- Muestra cómo se transforman los datos al formato del backend
- **Total Sections**: Cuántas secciones se detectaron
- **Sections with Data**: Cuántas tienen datos reales (no vacías)
- **Sections Breakdown**: Lista de cada sección con:
  - Nombre de la sección (ej: `hero`, `welcome`, `itinerary`)
  - Cantidad de variables
  - Variables JSON completas

**Botón**: `➡️ Transform to Sections` - Transformar localStorage a formato backend

**Botón**: `📤 Send to Backend (Test)` - Enviar al endpoint de prueba

### Paso 3: Analizar Resultados

#### ✅ **Caso Exitoso**:
```json
{
  "success": true,
  "analysis": {
    "total_sections": 13,
    "would_create_records": 5,
    "populated_sections": ["hero", "welcome", "itinerary", "place_religioso", "place_ceremonia"],
    "empty_sections": ["countdown", "gallery", ...]
  },
  "recommendation": "PASS - Data is correctly formatted"
}
```

**Interpretación**:
- ✅ `would_create_records: 5` - El backend crearía 5 registros en `invitations_sections_data`
- ✅ `populated_sections` - Lista de secciones con datos
- ✅ Backend recibiría los datos correctamente

#### ❌ **Caso Fallido**:
```json
{
  "success": false,
  "analysis": {
    "total_sections": 13,
    "would_create_records": 0,
    "populated_sections": [],
    "empty_sections": ["hero", "welcome", "itinerary", ...]
  },
  "recommendation": "FAIL - No valid sections data found"
}
```

**Interpretación**:
- ❌ `would_create_records: 0` - No se crearían registros
- ❌ `populated_sections: []` - Ninguna sección tiene datos
- ❌ **PROBLEMA**: Los datos no llegaron desde localStorage

## 🔍 Diagnóstico de Problemas

### Problema 1: `Non-Empty Fields: 0` en Panel 1

**Causa**: `useCustomizerSync` no está detectando cambios en React state

**Soluciones**:
1. Verificar que haces **click fuera del input** después de escribir (trigger blur event)
2. Esperar 2-3 segundos después de editar (debounce de 500ms)
3. Verificar en consola del navegador si hay errores

**Debug**:
```javascript
// En la consola del navegador:
const data = JSON.parse(localStorage.getItem('demo-customizer-9'));
console.log('Non-empty:', Object.entries(data.customizerData).filter(([k,v]) => v !== '').length);
```

### Problema 2: Transformación falla (Panel 2 vacío)

**Causa**: La función `groupCustomizerDataBySections()` filtra valores vacíos

**Verificar**:
- En Panel 1, revisar que los valores NO sean `""` (string vacío)
- Verificar que los campos tienen el prefijo correcto:
  - ✅ `hero_groom_name` (con prefijo de sección)
  - ❌ `groom_name` (sin prefijo, irá a `general`)

### Problema 3: Backend retorna `would_create_records: 0`

**Causa**: `sections_data` llega vacío al backend

**Verificar**:
1. Panel 2 debe mostrar secciones con datos
2. En Panel 2, expandir cada sección y ver las variables JSON
3. Si las variables están vacías `{}`, el problema está en la transformación

## 📊 Backend Logs

Cuando haces click en `📤 Send to Backend (Test)`, el backend imprimirá logs detallados:

```
================================================================================
🧪 TEST SECTIONS ENDPOINT CALLED
================================================================================
📥 Received payload keys: ['order_id', 'template_id', 'sections_data', ...]
📥 sections_data keys: ['hero', 'welcome', 'itinerary']
✅ Section 'hero': 3 variables
✅ Section 'welcome': 1 variables
✅ Section 'itinerary': 1 variables
================================================================================
🎯 TEST RESULT: SUCCESS
📊 Would create 3 InvitationSectionsData records
📊 Populated sections: ['hero', 'welcome', 'itinerary']
📊 Empty sections: ['countdown', 'gallery', ...]
================================================================================
```

Ver estos logs en:
- Terminal del backend (donde corre `python app.py`)
- Archivo: `backend/logs/session.log`

## 🎯 Objetivo del Playground

**Responder estas preguntas**:

1. ✅ ¿Los datos se están guardando en localStorage?
   - **Ver**: Panel 1 → `Non-Empty Fields`

2. ✅ ¿La transformación a `sections_data` funciona?
   - **Ver**: Panel 2 → `Sections with Data`

3. ✅ ¿El backend recibiría correctamente los datos?
   - **Ver**: Panel 3 → `would_create_records`

Si las 3 respuestas son **SÍ**, entonces el problema está en otro lugar (ej: el flujo de checkout no está leyendo localStorage correctamente).

Si alguna es **NO**, identificaste exactamente dónde se pierden los datos.

## 🛠️ Endpoints Creados

### Frontend:
- **Ruta**: `/test-storage`
- **Archivo**: `frontend/src/app/test-storage/page.tsx`

### Backend:
- **Endpoint**: `POST /api/invitations/test-sections`
- **Archivo**: `backend/api/invitations.py` (líneas 1166-1255)

## 📝 Próximos Pasos

Una vez identificado el problema con el Playground:

1. **Si localStorage está vacío**:
   - Problema en `useCustomizerSync` hook
   - Verificar dependencias del `useEffect`
   - Asegurar que React state se actualiza

2. **Si transformación falla**:
   - Problema en `groupCustomizerDataBySections()`
   - Verificar filtrado de valores vacíos (línea 70)
   - Verificar prefijos de sección

3. **Si backend no recibe datos**:
   - Problema en el checkout al leer localStorage
   - Verificar `checkout/page.tsx` líneas 418-430
   - Verificar llamada a `createInvitationFromOrder()`

## 🎓 Ejemplo de Uso Exitoso

```
1. Ir a /invitacion/demo/9
2. Personalizar 5 campos
3. Ir a /test-storage
4. Ver: Non-Empty Fields: 5 ✅
5. Click "Transform to Sections"
6. Ver: Sections with Data: 3 ✅
7. Click "Send to Backend"
8. Ver: would_create_records: 3 ✅
9. Conclusión: ¡El flujo de datos funciona!
```

---

**Creado**: 2025-10-01
**Propósito**: Depurar flujo de datos desde localStorage → sections_data → base de datos
