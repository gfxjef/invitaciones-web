# Troubleshooting: Customizer y Generación de PDF

> **Fecha**: 29 de Septiembre, 2025
> **Problema**: PDF generado con datos por defecto en lugar de datos personalizados del customizer
> **Estado**: ✅ RESUELTO

---

## 📋 Índice

1. [Síntomas del Problema](#síntomas-del-problema)
2. [Diagnóstico y Root Cause](#diagnóstico-y-root-cause)
3. [Intentos Fallidos](#intentos-fallidos)
4. [Solución Final](#solución-final)
5. [Lecciones Aprendidas](#lecciones-aprendidas)
6. [Prevención Futura](#prevención-futura)

---

## 🐛 Síntomas del Problema

### Comportamiento Observado:

1. **Usuario edita customizer**:
   - Cambia nombres: "pepe & ros"
   - Ve los cambios en pantalla ✅

2. **Usuario descarga PDF**:
   - PDF genera con defaults: "Jefferson & Rosmery" ❌
   - No usa datos personalizados

3. **Problema adicional**:
   - Cambios NO se guardaban automáticamente en localStorage
   - F5 (recarga) perdía los cambios

### Logs Observados:

```log
# Backend recibía datos correctos:
🎯 [PDF API] ✅ custom_data RECEIVED - 43 fields:
    [groom_name] = pepe ✅
    [bride_name] = ros ✅

# Pero React usaba defaults:
🔍 modularData.hero: {
    groom_name: Jefferson,  ❌
    bride_name: Rosmery     ❌
}

# customizerData estaba vacío:
🔍 Current customizerData state: {} ❌

# touchedFields estaba vacío:
touchedCount: 0 ❌
```

---

## 🔍 Diagnóstico y Root Cause

### Flujo del Sistema (CORRECTO):

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario edita customizer                             │
│    └─> updateField() actualiza customizerData state     │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 2. useCustomizerSync detecta cambio                     │
│    └─> Espera 500ms (debounce)                          │
│    └─> localStorage.setItem() guarda                    │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. getProgressiveMergedData() hace merge                │
│    ├─> Para campos en touchedFields: usa customizerData │
│    └─> Para campos NO touched: usa templateDefaults     │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 4. transformToTemplateProps(mergedData)                 │
│    └─> Transforma estructura (NO debe re-mezclar)       │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 5. TemplateBuilder renderiza con datos merged           │
└─────────────────────────────────────────────────────────┘
```

### Root Cause Identificado:

**Problema Principal**: `touchedFields` estaba vacío en el localStorage inyectado por Playwright.

```python
# backend/services/pdf_service/pdf_generator.py (ANTES - INCORRECTO)
storage_data = {
    'customizerData': custom_data,
    'touchedFields': {},  # ❌ VACÍO - Este era el problema
    'selectedMode': 'basic',
    'timestamp': timestamp
}
```

**Consecuencia**:
- `getProgressiveMergedData()` veía `touchedFields = {}`
- Interpretaba que NO hay campos personalizados
- Usaba `templateDefaults` para TODOS los campos
- Resultado: PDF con defaults en lugar de datos personalizados

---

## ❌ Intentos Fallidos

### Intento #1: Merge en transformToTemplateProps (INCORRECTO)

**Lo que hice**:
```typescript
// useDynamicCustomizer.ts
const transformToTemplateProps = useCallback((data: any) => {
  const mergedData = { ...data, ...customizerData }; // ❌ MERGE REDUNDANTE

  return {
    hero: {
      groom_name: mergedData.groom_name || heroDefaults.groom_name,
      // ...
    }
  };
}, [getSectionDefaultProps, getSectionVariant, customizerData]); // ❌ customizerData en deps
```

**Por qué falló**:
1. **Double-merge**: `getProgressiveMergedData()` YA hace el merge correcto
2. **Dependency issue**: Agregar `customizerData` en dependencies causó:
   - Re-creación de función en cada cambio
   - Cancelación del debounce de guardado (500ms)
   - localStorage NO se guardaba automáticamente

### Intento #2: Remover customizerData de dependencies (PARCIALMENTE CORRECTO)

**Lo que hice**:
```typescript
}, [getSectionDefaultProps, getSectionVariant]); // Sin customizerData
```

**Por qué falló parcialmente**:
- **Sí resolvió**: Guardado automático volvió a funcionar ✅
- **NO resolvió**: PDF seguía usando defaults porque `customizerData` estaba vacío (closure stale)

---

## ✅ Solución Final

### Cambio #1: Revertir merge en transformToTemplateProps

**Archivo**: `frontend/src/lib/hooks/useDynamicCustomizer.ts`

```typescript
// ANTES (INCORRECTO):
const mergedData = { ...data, ...customizerData }; // ❌
groom_name: mergedData.groom_name || heroDefaults.groom_name

// DESPUÉS (CORRECTO):
// Usar solo 'data' que ya viene merged de getProgressiveMergedData()
groom_name: data.groom_name || heroDefaults.groom_name // ✅
```

**Razón**: `transformToTemplateProps` NO debe hacer merge. Solo debe usar el `data` que recibe, que ya fue procesado correctamente por `getProgressiveMergedData()`.

### Cambio #2: Calcular touchedFields en backend

**Archivo**: `backend/services/pdf_service/pdf_generator.py` (líneas 249-261)

```python
# ANTES (INCORRECTO):
storage_data = {
    'customizerData': custom_data,
    'touchedFields': {},  # ❌ VACÍO
    'selectedMode': 'basic',
    'timestamp': int(time.time() * 1000)
}

# DESPUÉS (CORRECTO):
# Calcular touched fields: cualquier campo con valor no vacío
touched_fields = {}
for key, value in custom_data.items():
    # Mark as touched if value is not empty
    if value:  # Truthy: non-empty string, non-zero number, True, non-empty list
        touched_fields[key] = True
    elif isinstance(value, bool):  # Keep false booleans as touched
        touched_fields[key] = True
    elif isinstance(value, (int, float)) and value == 0:  # Keep 0 as touched
        touched_fields[key] = True

logger.info(f"🔧 [PDF Generator] Calculated touched fields: {len(touched_fields)} out of {len(custom_data)} total fields")

storage_data = {
    'customizerData': custom_data,
    'touchedFields': touched_fields,  # ✅ CALCULADO
    'selectedMode': 'basic',
    'timestamp': int(time.time() * 1000)
}
```

**Razón**: El backend tiene acceso a todos los datos personalizados enviados por el frontend. Puede calcular automáticamente qué campos fueron modificados (tienen valores no vacíos).

---

## 🎯 Flujo Final (CORRECTO)

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Usuario edita "pepe & ros" en customizer                  │
│    └─> updateField() → customizerData state                  │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. useCustomizerSync (500ms debounce)                        │
│    └─> localStorage.setItem('demo-customizer-9', {...})      │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Usuario click "Descargar Invitación"                      │
│    └─> DownloadButton lee localStorage                       │
│    └─> Envía custom_data al backend                          │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Backend calcula touchedFields automáticamente             │
│    touchedFields = {groom_name: True, bride_name: True, ...} │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Playwright inyecta localStorage CON touchedFields         │
│    localStorage['demo-customizer-9'] = {                     │
│      customizerData: {groom_name: "pepe", ...},              │
│      touchedFields: {groom_name: true, ...}  ✅              │
│    }                                                          │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. React restaura: restoreState()                            │
│    └─> customizerData = {groom_name: "pepe", ...}            │
│    └─> touchedFields = {groom_name: true, ...}               │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. getProgressiveMergedData() detecta touched                │
│    FOR EACH field:                                            │
│      IF touchedFields[field]:                                 │
│        USE customizerData[field] ✅ "pepe"                    │
│      ELSE:                                                    │
│        USE templateDefaults[field]                            │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. transformToTemplateProps(mergedData)                      │
│    └─> Solo transforma estructura                            │
│    └─> NO re-mezcla (mergedData ya tiene "pepe")             │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 9. PDF generado con "pepe & ros" ✅                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 📚 Lecciones Aprendidas

### ❌ **Errores Cometidos**:

1. **No entender el flujo completo del sistema**
   - Asumí que `transformToTemplateProps` necesitaba hacer merge
   - NO revisé que `getProgressiveMergedData` YA lo hacía

2. **Agregar dependencies innecesarias en useCallback**
   - Agregar `customizerData` rompió el guardado automático
   - Causó re-creación de función innecesaria

3. **Solucionar síntomas en lugar de causa raíz**
   - Mi primer fix fue un workaround (merge redundante)
   - NO identifiqué que el problema real era `touchedFields: {}`

4. **No usar thinking profundo desde el inicio**
   - Varios intentos fallidos antes de encontrar la causa real
   - Necesité análisis múltiple con logs y code review

### ✅ **Aciertos**:

1. **Logging exhaustivo**
   - Los logs permitieron identificar:
     - `customizerData: {}` vacío
     - `touchedCount: 0`
     - `modularData` con defaults

2. **Análisis de flujo completo**
   - Revisar CADA paso desde customizer hasta PDF
   - Identificar dónde se perdía la información

3. **Solución en el lugar correcto**
   - Backend calcula `touchedFields` automáticamente
   - Frontend no necesita cambios adicionales
   - Flujo natural del sistema preservado

---

## 🛡️ Prevención Futura

### Checklist para Cambios en Customizer/PDF:

#### ✅ **ANTES de hacer cambios**:

1. [ ] **Entender el flujo completo**:
   ```
   Usuario → updateField → customizerData state
          → useCustomizerSync → localStorage
          → getProgressiveMergedData → merge con touchedFields
          → transformToTemplateProps → estructura
          → TemplateBuilder → render
   ```

2. [ ] **Identificar responsabilidades de cada función**:
   - `getProgressiveMergedData()`: Hace el merge principal ✅
   - `transformToTemplateProps()`: Solo transforma estructura ✅
   - NO mezclar responsabilidades ❌

3. [ ] **Verificar dependencies de useCallback/useMemo**:
   - ¿Realmente necesita esa dependency?
   - ¿Causará re-creaciones innecesarias?

#### ✅ **DURANTE desarrollo**:

1. [ ] **Agregar logging temporal**:
   ```typescript
   console.log('🔍 customizerData:', customizerData);
   console.log('🔍 touchedFields:', touchedFields);
   console.log('🔍 mergedData:', mergedData);
   ```

2. [ ] **Verificar localStorage**:
   - DevTools → Application → Local Storage
   - Verificar estructura: `{customizerData, touchedFields, timestamp}`

3. [ ] **Probar guardado automático**:
   - Editar campo → Esperar 500ms
   - Recargar página → Datos deben persistir

#### ✅ **DESPUÉS de cambios**:

1. [ ] **Test completo del flujo**:
   ```bash
   1. Editar customizer → valores personalizados
   2. Esperar 1 segundo → guardado automático
   3. F5 (recarga) → datos persisten
   4. Cambiar escritorio ↔ móvil → datos sincronizan
   5. Descargar PDF → usa datos personalizados
   ```

2. [ ] **Revisar logs del backend**:
   ```log
   ✅ Calculated touched fields: N out of M total fields
   ✅ Restoring customizer state: {touchedFields: N, ...}
   ✅ modularData.hero: {groom_name: "valor_personalizado", ...}
   ```

3. [ ] **Documentar cambios** (en este archivo):
   - Qué se cambió
   - Por qué se cambió
   - Cómo afecta el flujo

---

## 🔧 Testing Manual

### Test Case 1: Guardado Automático

```bash
GIVEN: Usuario en http://localhost:3000/invitacion/demo/9
WHEN: Cambia groom_name a "test1"
AND: Espera 1 segundo
AND: Recarga página (F5)
THEN: Debe mostrar "test1" ✅
```

### Test Case 2: Sincronización Escritorio-Móvil

```bash
GIVEN: Usuario edita en vista escritorio
WHEN: Cambia a vista móvil
THEN: Datos deben sincronizarse inmediatamente ✅
```

### Test Case 3: Generación PDF

```bash
GIVEN: Usuario personalizó nombres: "Juan & María"
WHEN: Click en "Descargar Invitación"
THEN: PDF debe contener "Juan & María" ✅
AND: Backend log debe mostrar: touchedCount > 0 ✅
```

---

## 📞 Contacto

Si encuentras problemas similares:

1. **Revisa logs del backend**: `backend/logs/session.log`
2. **Verifica localStorage**: DevTools → Application
3. **Agrega logging temporal** para tracking
4. **Consulta este documento** para referencia

---

## 🔗 Referencias

- Archivo modificado (Frontend): `frontend/src/lib/hooks/useDynamicCustomizer.ts`
- Archivo modificado (Backend): `backend/services/pdf_service/pdf_generator.py`
- Sistema de logging: `backend/utils/session_logger.py`
- Hook de sincronización: `frontend/src/lib/hooks/useCustomizerSync.ts`

---

**Última actualización**: 29 de Septiembre, 2025
**Estado**: ✅ Problema resuelto y documentado