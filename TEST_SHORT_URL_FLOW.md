# Test Plan - Short URL con PlanSelector Integration

## 🎯 Objetivo
Verificar que el flujo completo de generación de short URL con integración de PlanSelector funciona correctamente.

## 📋 Flujo Esperado

### 1. Usuario hace clic en "Desbloquear" en ShareURLModal
```
Usuario → Click "Desbloquear" (botón morado en sección Premium)
```

**Comportamiento Esperado:**
- ✅ Se cierra el modal de ShareURL
- ✅ Se abre el modal de PlanSelector automáticamente
- ✅ El PlanSelector muestra los dos planes (Básico y Premium)

### 2. Usuario ve el PlanSelector Modal
```
Usuario → Ve modal de planes con:
  - Plan Básico (S/ 99)
  - Plan Premium (S/ 140) - Ya seleccionado por defecto
```

**Comportamiento Esperado:**
- ✅ Plan Premium está pre-seleccionado (botón verde)
- ✅ Botón dice "✓ Plan Seleccionado"
- ✅ Modal se muestra sobre todo el contenido

### 3. Usuario hace clic en "Desbloquear Premium"
```
Usuario → Click botón "✓ Plan Seleccionado" en Plan Premium
```

**Comportamiento Esperado:**
- ✅ Se ejecuta callback `onPremiumUnlock`
- ✅ Se cierra el modal de PlanSelector automáticamente
- ✅ Se genera el short URL en background
- ✅ Aparece toast "URL personalizada generada"

### 4. Usuario ve el short URL generado
```
Sistema → Muestra ShareURLModal actualizado con:
  - Opción Básica: URL normal
  - Opción Premium: Short URL generado (ya desbloqueado)
```

**Comportamiento Esperado:**
- ✅ Input de Premium muestra la URL corta generada
- ✅ Botón cambia de "Desbloquear" a "Copiar"
- ✅ URL usa formato: `/{code}/{nombres}` con separador `y`
- ✅ Usuario puede copiar la URL

## 🧪 Pasos de Prueba

### Test 1: Flujo Completo de Desbloqueo
1. Abrir navegador en `http://localhost:3000/mi-cuenta/invitaciones`
2. Hacer clic en botón "Copiar URL" de cualquier invitación
3. Verificar que se abre ShareURLModal
4. Hacer clic en botón "Desbloquear" en sección Premium
5. **✅ VERIFICAR**: Se abre PlanSelector modal
6. Hacer clic en botón "✓ Plan Seleccionado" del Plan Premium
7. **✅ VERIFICAR**: Se cierra PlanSelector
8. **✅ VERIFICAR**: Aparece toast "URL personalizada generada"
9. **✅ VERIFICAR**: Input Premium muestra short URL con formato correcto
10. **✅ VERIFICAR**: Botón cambió a "Copiar"

### Test 2: Verificar Formato de URL
**Ejemplo esperado:**
```
http://localhost:3000/abc/CarlosyMaria
http://localhost:3000/xyz/1111y333
```

**Verificaciones:**
- ✅ Código tiene 3-4 caracteres (letras minúsculas y números)
- ✅ Nombres usan separador `y` (NO `&`)
- ✅ Sin espacios ni caracteres especiales
- ✅ Sin acentos (María → Maria)

### Test 3: Verificar Persistencia
1. Cerrar ShareURLModal
2. Volver a abrir con el mismo botón "Copiar URL"
3. **✅ VERIFICAR**: La URL Premium ya está generada
4. **✅ VERIFICAR**: No pide desbloquear nuevamente
5. **✅ VERIFICAR**: Botón muestra "Copiar" directamente

### Test 4: Verificar Redirección
1. Copiar la short URL generada
2. Pegar en nueva pestaña del navegador
3. **✅ VERIFICAR**: Redirige correctamente a `/invitacion/{url_slug}`
4. **✅ VERIFICAR**: Se muestra la invitación completa

## 🔍 Puntos de Verificación Técnicos

### Frontend - ShareURLModal.tsx
```typescript
// Estado del PlanSelector
const [showPlanSelector, setShowPlanSelector] = useState(false);

// Handler de desbloqueo
const handleUnlock = async () => {
  if (shortUrlData) {
    setIsUnlocked(true);
    return;
  }
  setShowPlanSelector(true); // ✅ Abre PlanSelector
};

// Callback cuando se desbloquea Premium
const handlePremiumUnlocked = async () => {
  setIsGenerating(true);
  const response = await generateShortUrl(...);
  setShortUrlData(...);
  setIsUnlocked(true);
  toast.success('URL personalizada generada');
};
```

### Frontend - PlanSelector.tsx
```typescript
// Props recibidos
interface PlanSelectorProps {
  isOpen?: boolean;           // ✅ Controla visibilidad
  onClose?: () => void;       // ✅ Cerrar modal
  onPremiumUnlock?: () => void; // ✅ Callback de desbloqueo
  asModal?: boolean;          // ✅ true para usar como modal
}

// Handler del botón Premium
const handlePremiumClick = () => {
  if (selectedPlan === "premium" && onPremiumUnlock) {
    onPremiumUnlock();  // ✅ Ejecuta callback
    if (onClose) {
      onClose();        // ✅ Cierra modal
    }
  }
};
```

## 🐛 Errores Comunes y Soluciones

### Error 1: PlanSelector no se abre
**Síntoma**: Click en "Desbloquear" no hace nada

**Solución**:
- Verificar que `setShowPlanSelector(true)` se está llamando
- Verificar que `PlanSelector` recibe `isOpen={showPlanSelector}`
- Verificar que `asModal={true}` está configurado

### Error 2: PlanSelector no se cierra
**Síntoma**: Modal se queda abierto después de click

**Solución**:
- Verificar que `handlePremiumClick` llama a `onClose()`
- Verificar que `onClose={() => setShowPlanSelector(false)}` está configurado

### Error 3: Short URL no se genera
**Síntoma**: Modal se cierra pero no aparece URL

**Solución**:
- Verificar que `onPremiumUnlock={handlePremiumUnlocked}` está configurado
- Verificar console para errores de API
- Verificar que backend está corriendo en `http://localhost:5000`

### Error 4: URL tiene caracteres especiales
**Síntoma**: URL muestra `Carlos&Maria` en vez de `CarlosyMaria`

**Solución**:
- Verificar que `autoGeneratedNames` usa separador `y`
- Verificar que `sanitize_couple_names()` en backend usa `y`
- Correr migración: `python backend/migrate_short_urls.py`

## 📊 Resultados Esperados

### Visual Flow
```
[ShareURLModal]
   ↓ Click "Desbloquear"
[PlanSelector Modal] (Plan Premium pre-seleccionado)
   ↓ Click "✓ Plan Seleccionado"
[Modal se cierra] + [Generando...]
   ↓
[Toast: "URL personalizada generada"]
   ↓
[ShareURLModal con URL generada]
   ↓ Click "Copiar"
[Toast: "URL personalizada copiada"]
```

### Database State
```sql
-- Antes de desbloquear
SELECT short_code, custom_names FROM invitations WHERE id = X;
-- Result: NULL, NULL

-- Después de desbloquear
SELECT short_code, custom_names FROM invitations WHERE id = X;
-- Result: 'abc', 'CarlosyMaria'
```

## ✅ Checklist Final

- [ ] ShareURLModal abre PlanSelector al hacer clic en "Desbloquear"
- [ ] PlanSelector muestra ambos planes correctamente
- [ ] Click en "✓ Plan Seleccionado" cierra el modal
- [ ] Short URL se genera automáticamente
- [ ] Toast de éxito aparece
- [ ] URL generada usa separador `y`
- [ ] URL se puede copiar con botón "Copiar"
- [ ] Short URL redirige correctamente
- [ ] Persistencia funciona (no pide desbloquear otra vez)
- [ ] Funciona con diferentes nombres (con acentos, espacios, números)

## 🚀 Comandos de Prueba Rápida

### Backend
```bash
# Verificar backend está corriendo
curl http://localhost:5000/health

# Ver invitaciones con short URLs
cd backend && python -c "
from app import create_app
from models.invitation import Invitation
app = create_app()
with app.app_context():
    invs = Invitation.query.filter(Invitation.short_code.isnot(None)).all()
    for inv in invs:
        print(f'ID: {inv.id}, Code: {inv.short_code}, Names: {inv.custom_names}')
"
```

### Frontend
```bash
# Verificar frontend está corriendo
curl http://localhost:3000

# Ver logs en consola del navegador
# Abrir DevTools → Console → Buscar errores
```

## 📝 Notas de Implementación

### Archivos Modificados
1. `frontend/src/components/account/PlanSelector.tsx`
   - Agregado soporte para modo modal
   - Agregado props: `isOpen`, `onClose`, `onPremiumUnlock`, `asModal`
   - Modificado botón Premium para ejecutar callback

2. `frontend/src/components/account/invitations/ShareURLModal.tsx`
   - Agregado estado `showPlanSelector`
   - Agregado componente `<PlanSelector>` en JSX
   - Modificado `handleUnlock` para abrir PlanSelector
   - Agregado `handlePremiumUnlocked` para generar URL

### Flujo de Datos
```
User Action → ShareURLModal → PlanSelector → Callback → API → Database → UI Update
```

---

**Fecha de creación**: 2025-10-12
**Estado**: ✅ Implementado
**Próximo paso**: Pruebas manuales en navegador
