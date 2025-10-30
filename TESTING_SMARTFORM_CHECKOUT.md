# Testing SmartForm V4.0 en Checkout

## ✅ Cambios Realizados

He actualizado el checkout (`/checkout`) para usar **SmartForm V4.0** en lugar de SDK Web V1.

### Archivos Modificados

1. **frontend/src/app/checkout/page.tsx**
   - Línea 42: Cambiado import de `IzipayCheckoutV1` a `IzipaySmartForm`
   - Líneas 984-998: Reemplazado componente con configuración SmartForm
   - Líneas 409-415: Actualizados comentarios de configuración

### Configuración del SmartForm

```tsx
<IzipaySmartForm
  order={{
    id: currentOrder.id,
    order_number: currentOrder.order_number,
    total: currentOrder.total,
    currency: currentOrder.currency || 'PEN',
  }}
  paymentConfig={paymentConfig}  // formToken, publicKey, mode
  displayMode="card-expanded"     // Formulario de tarjeta siempre visible
  theme="neon"                    // Tema moderno de Izipay
  onPaymentComplete={handlePaymentSuccess}
  onPaymentError={handlePaymentError}
  isLoading={isLoadingPayment}
/>
```

---

## 🧪 Cómo Probar

### Paso 1: Verificar que el backend esté corriendo

```bash
cd backend
python app.py
```

Deberías ver:
```
 * Running on http://127.0.0.1:5000
```

### Paso 2: Verificar que el frontend esté corriendo

```bash
cd frontend
npm run dev
```

Deberías ver:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

### Paso 3: Iniciar sesión o registrarse

1. Ve a http://localhost:3000
2. Haz clic en "Iniciar Sesión" o "Registrarse"
3. Inicia sesión con tus credenciales

### Paso 4: Agregar un producto al carrito

Opción A: **Desde la galería de plantillas**
1. Ve a http://localhost:3000/plantillas
2. Selecciona una plantilla
3. Haz clic en "Personalizar" o "Agregar al carrito"

Opción B: **Desde el demo**
1. Ve a http://localhost:3000/invitacion/demo/1 (o cualquier ID de plantilla)
2. Personaliza la invitación (opcional)
3. Haz clic en "Agregar al carrito"

### Paso 5: Ir al carrito

1. Ve a http://localhost:3000/carrito
2. Verifica que tu producto esté en el carrito
3. Haz clic en "Proceder al Pago"

### Paso 6: Completar el formulario de checkout

En http://localhost:3000/checkout verás 3 secciones:

#### 📋 Sección 1: Información Personal
```
Nombre: Juan
Apellido: Pérez
Email: juan.perez@example.com
Teléfono: 987654321
```

#### 📋 Sección 2: Información de Facturación
```
Tipo de documento: DNI
Número de documento: 12345678
Dirección: Av. Lima 123
Ciudad: Lima
Departamento: Lima
Código Postal: 15001
```

#### 📋 Sección 3: Términos y Condiciones
```
☑ Acepto los términos y condiciones
☑ Acepto la política de privacidad
```

### Paso 7: Crear la orden y ver el SmartForm

1. Haz clic en "Continuar al Pago"
2. Espera a que se cree la orden (2-3 segundos)
3. Deberías ver el **SmartForm V4.0** cargarse automáticamente

---

## 🔍 Qué Esperar

### ✅ Visualización del SmartForm

Deberías ver:

1. **Header del formulario**
   - Número de paso: "4"
   - Título: "Procesamiento de Pago"

2. **Resumen de Pago**
   - Orden: `ORD-XXXXXXXXXX`
   - Total: `S/ XXX.XX`
   - Métodos disponibles: Iconos de tarjetas, QR, móvil

3. **Formulario SmartForm (modo Tarjeta Expandida)**
   - Campo de número de tarjeta
   - Campo de fecha de expiración (MM/AA)
   - Campo de CVV/CVC
   - Lista de métodos de pago disponibles:
     - 💳 Tarjetas (Visa, Mastercard, Diners, Amex)
     - 📱 Yape
     - 📱 Plin Interbank
     - 📷 Código QR
     - Otros métodos según configuración

4. **Seguridad**
   - 🔒 "Pago seguro procesado por Izipay"
   - Información de métodos aceptados

5. **Debug Info (solo en desarrollo)**
   - Detalles expandibles con información técnica

### ✅ Carga del SDK

En la **consola del navegador** (F12 → Console) deberías ver:

```
🚀 [SmartForm V4.0] Inicializando Izipay SmartForm
📦 Configuración: { mode: 'SANDBOX', displayMode: 'card-expanded', theme: 'neon', ... }
🎨 Cargando tema Neon...
✅ Stylesheet cargado: https://static.micuentaweb.pe/.../neon-reset.min.css
✅ Script cargado: https://static.micuentaweb.pe/.../neon.js
📥 Cargando Krypton Client SDK...
✅ Script cargado: https://static.micuentaweb.pe/.../kr-payment-form.min.js
✅ [SmartForm V4.0] SDK cargado correctamente
```

### ✅ Elementos del DOM

Inspecciona el DOM (F12 → Elements):

```html
<!-- Script del SDK -->
<script
  src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
  kr-public-key="45259313:testpublickey_xxx"
  type="text/javascript">
</script>

<!-- Contenedor del formulario -->
<div class="kr-smart-form kr-card-form-expanded" kr-form-token="...">
  <!-- El SDK inyecta el contenido aquí -->
</div>
```

---

## ⚠️ Posibles Problemas y Soluciones

### Problema 1: No se ve el formulario

**Síntomas:**
- Solo aparece "Cargando formulario de pago..." pero nunca carga
- No hay errores en consola

**Solución:**
```bash
# Verifica que el backend retorne formToken válido
curl http://localhost:5000/api/payments/health

# Deberías ver:
{
  "status": "healthy",
  "service": "izipay-integration",
  "mode": "SANDBOX",
  "api_url": "https://api.micuentaweb.pe/api-payment/V4"
}
```

### Problema 2: Error "Token is invalid"

**Síntomas:**
- Error en consola: "Token is invalid" o "Invalid formToken"

**Solución:**
1. Verifica que `IZIPAY_PUBLIC_KEY` en `.env` sea correcta
2. Verifica que el formToken sea reciente (expira en 15 minutos)
3. Recarga la página para generar un nuevo formToken

### Problema 3: Scripts no se cargan (CORS)

**Síntomas:**
- Error en consola: "CORS policy: No 'Access-Control-Allow-Origin'"

**Solución:**
- Esto es normal en localhost, los scripts de Izipay deberían cargarse correctamente
- Asegúrate de tener conexión a Internet

### Problema 4: El formulario se ve sin estilos

**Síntomas:**
- El formulario aparece pero sin colores ni estilos

**Solución:**
1. Verifica que el tema Neon se haya cargado:
   ```js
   // En consola, deberías ver:
   ✅ Stylesheet cargado: .../neon-reset.min.css
   ✅ Script cargado: .../neon.js
   ```
2. Recarga la página con Ctrl+F5 (hard refresh)

---

## 🧪 Probar el Pago Completo

### Con tarjeta de prueba (modo SANDBOX):

```
Número de tarjeta: 4970100000000003
Fecha de expiración: 12/25
CVV: 123
```

**Flujo esperado:**
1. Completa los datos de la tarjeta
2. Haz clic en "Pagar"
3. SmartForm procesará el pago
4. Si es exitoso: Redirección a la página de confirmación
5. Si falla: Mensaje de error en pantalla

### Verificar en backend:

```bash
# En el terminal del backend deberías ver:
[IZIPAY TOKEN] Creating payment token for order ORD-XXXX
[IZIPAY TOKEN] ✅ FormToken created successfully
[IZIPAY TOKEN] formToken (first 30): DEMO-TOKEN-TO-BE-REPLACED...
```

---

## 📊 Comparación Visual

### Antes (SDK Web V1)
```
┌─────────────────────────────────┐
│  Procesamiento de Pago          │
├─────────────────────────────────┤
│  Orden: ORD-XXX                 │
│  Total: S/ 290.00               │
├─────────────────────────────────┤
│  [Contenedor SDK Web V1]        │
│  → Configuración compleja       │
│  → 430 líneas de código         │
│  → Requiere keyRSA + merchant   │
└─────────────────────────────────┘
```

### Ahora (SmartForm V4.0)
```
┌─────────────────────────────────┐
│  Procesamiento de Pago          │
├─────────────────────────────────┤
│  Orden: ORD-XXX                 │
│  Total: S/ 290.00               │
├─────────────────────────────────┤
│  [SmartForm V4.0 - Neon Theme]  │
│  ╔═══════════════════════════╗  │
│  ║  💳 Tarjeta               ║  │
│  ║  [XXXX XXXX XXXX XXXX]   ║  │
│  ║  [MM/AA]  [CVV]          ║  │
│  ║  [Pagar S/ 290.00]       ║  │
│  ╚═══════════════════════════╝  │
│  ► 📱 Yape                      │
│  ► 📱 Plin Interbank            │
│  ► 📷 Código QR                 │
└─────────────────────────────────┘
```

---

## ✅ Checklist de Validación

Marca cuando hayas verificado:

- [ ] Backend está corriendo en http://localhost:5000
- [ ] Frontend está corriendo en http://localhost:3000
- [ ] Puedes iniciar sesión correctamente
- [ ] Puedes agregar un producto al carrito
- [ ] El carrito muestra el producto correctamente
- [ ] El formulario de checkout se carga sin errores
- [ ] Puedes completar el formulario de checkout
- [ ] Al hacer clic en "Continuar al Pago" se crea la orden
- [ ] El **SmartForm V4.0** se carga correctamente
- [ ] Ves el formulario de tarjeta expandido
- [ ] Ves los métodos de pago disponibles (Yape, Plin, QR)
- [ ] El tema "Neon" se aplica correctamente (colores modernos)
- [ ] En consola del navegador ves los logs del SmartForm
- [ ] No hay errores en consola relacionados con Izipay
- [ ] (Opcional) Puedes completar un pago de prueba

---

## 📝 Notas Importantes

### Ventajas del SmartForm V4.0 vs SDK Web V1:

1. **✅ Menos código**: 350 líneas vs 430 líneas (-20%)
2. **✅ Configuración más simple**: Solo formToken, publicKey y mode
3. **✅ Documentación oficial**: Guía completa de Izipay
4. **✅ Estabilidad probada**: En producción desde hace años
5. **✅ Mismo backend**: No requiere cambios en el backend

### Backend Compatible:

- ✅ El mismo endpoint `/api/payments/formtoken` funciona para ambos
- ✅ El mismo webhook `/api/payments/webhook` funciona para ambos
- ✅ Las mismas variables de entorno (IZIPAY_USERNAME, IZIPAY_PASSWORD, etc.)

### Propiedades Opcionales del SmartForm:

Si quieres cambiar la apariencia:

```tsx
// Cambiar modo de visualización
displayMode="list"        // Lista vertical de métodos
displayMode="popin"       // Modal/overlay
displayMode="card-expanded"  // Tarjeta siempre visible (recomendado)

// Cambiar tema
theme="neon"     // Moderno y colorido (recomendado)
theme="classic"  // Clásico sin estilos
```

---

## 🔗 Referencias

- **Componente SmartForm**: `frontend/src/components/ui/izipay-smartform.tsx`
- **Página demo**: http://localhost:3000/smartform-demo
- **Documentación comparativa**: `backend/docs/IZIPAY_SDK_COMPARISON.md`
- **Documentación oficial Izipay**: https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/javascript/redirection/quick_start_smartform.html

---

**Fecha de actualización:** 2025-01-30
**Versión:** 1.0
**Estado:** ✅ Listo para probar
