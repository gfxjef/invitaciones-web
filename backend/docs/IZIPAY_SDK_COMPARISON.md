# Comparación: SDK Web V1 vs SmartForm V4.0 (Krypton Client)

## Resumen Ejecutivo

Este documento compara las dos implementaciones de Izipay disponibles en el proyecto para ayudarte a decidir cuál usar según tus necesidades.

| Característica | SDK Web V1 | SmartForm V4.0 |
|---------------|------------|----------------|
| **Complejidad** | Alta (configuración extensa) | Baja (declarativo y simple) |
| **Estabilidad** | Moderna pero más compleja | Probada y estable |
| **Documentación** | Limitada | Extensa en Izipay |
| **Personalización** | Alta (control total de UI) | Media (temas predefinidos) |
| **Mantenimiento** | Requiere más código | Mínimo mantenimiento |
| **Recommended** | Para proyectos que requieren UI totalmente personalizada | **✅ Para la mayoría de casos de uso** |

---

## 1. Arquitectura y Enfoque

### SDK Web V1 (Actual)
```typescript
// Enfoque imperativo con configuración programática
const iziConfig = {
  transactionId: "...",
  action: "pay",
  merchantCode: "45259313",
  order: { ... },
  billing: { ... },
  render: {
    typeForm: 'embedded',
    container: '#izipay-payment-form-v1',
    showButtonProcessForm: true
  },
  appearance: {
    theme: 'blue',
    customize: { ... }
  }
};

const checkout = new window.Izipay({ config: iziConfig });
await checkout.LoadForm({
  authorization: { formToken: ... },
  keyRSA: ...,
  callbackResponse: callbackResponsePayment
});
```

**Características:**
- ✅ Control total del flujo de pago
- ✅ Configuración granular de apariencia
- ✅ Callbacks personalizados
- ❌ Configuración compleja (100+ líneas de código)
- ❌ Requiere manejo manual de errores
- ❌ Documentación limitada

---

### SmartForm V4.0 (Recomendado)
```html
<!-- Enfoque declarativo con HTML + atributos kr-* -->
<script type="text/javascript"
  src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
  kr-public-key="45259313:testpublickey_xxx"
  kr-post-url-success="https://misite.com/success">
</script>

<div class="kr-smart-form" kr-form-token="FORM_TOKEN_FROM_BACKEND"></div>
```

**Características:**
- ✅ Implementación simple y directa
- ✅ Documentación oficial completa
- ✅ Estabilidad probada en producción
- ✅ Menos código = menos bugs
- ⚠️ Personalización limitada a temas predefinidos
- ⚠️ Menos control sobre el flujo de pago

---

## 2. Modos de Visualización

### SDK Web V1
```typescript
render: {
  typeForm: 'embedded' | 'redirect' | 'pop-up',
  container: '#selector',
  showButtonProcessForm: true
}
```

**Modos disponibles:**
- `embedded`: Formulario embebido en la página
- `redirect`: Redirección a página de Izipay
- `pop-up`: Modal/ventana emergente

---

### SmartForm V4.0
```html
<!-- Modo Lista (por defecto) -->
<div class="kr-smart-form" kr-form-token="..."></div>

<!-- Modo Pop-in (modal) -->
<div class="kr-smart-form" kr-popin kr-form-token="..."></div>

<!-- Modo Tarjeta Expandida (formulario siempre visible) -->
<div class="kr-smart-form" kr-card-form-expanded kr-form-token="..."></div>
```

**Modos disponibles:**
- Lista: Métodos de pago en lista vertical
- Pop-in: Formulario en modal/overlay
- Tarjeta expandida: Formulario de tarjeta siempre visible

---

## 3. Variables de Entorno

### SDK Web V1
Requiere más variables para funcionar:

```bash
IZIPAY_USERNAME=45259313
IZIPAY_MERCHANT_CODE=45259313
IZIPAY_PASSWORD=testpassword_xxx
IZIPAY_PUBLIC_KEY=45259313:testpublickey_xxx
IZIPAY_HMACSHA256=tYHquE9FmG3O3ml68VHE7QEqx7skKsnKKO6ZDTGGKqMTI
IZIPAY_KEY_RSA=publickey_xxx  # ⚠️ REQUERIDO para SDK Web V1
IZIPAY_MODE=SANDBOX
```

**Variables críticas:**
- `IZIPAY_KEY_RSA`: Clave RSA para encriptación (específica de SDK V1)
- `IZIPAY_MERCHANT_CODE`: Código de comercio para configuración
- Todas las demás son compartidas

---

### SmartForm V4.0
Usa las mismas variables base (menos `KEY_RSA`):

```bash
IZIPAY_USERNAME=45259313
IZIPAY_PASSWORD=testpassword_xxx
IZIPAY_PUBLIC_KEY=45259313:testpublickey_xxx  # ⚠️ MÁS IMPORTANTE en SmartForm
IZIPAY_HMACSHA256=tYHquE9FmG3O3ml68VHE7QEqx7skKsnKKO6ZDTGGKqMTI
IZIPAY_MODE=SANDBOX
```

**Variables críticas:**
- `IZIPAY_PUBLIC_KEY`: Se pasa como `kr-public-key` al script
- `KEY_RSA` no es necesario en SmartForm V4.0

---

## 4. Backend: Generación del formToken

### ✅ Ambos SDKs usan el MISMO endpoint de backend

```python
# backend/api/payments.py
# Endpoint: POST /api/payments/formtoken

def create_payment_token(order_data):
    """
    Genera formToken compatible con AMBOS SDKs.

    Endpoint oficial: https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment
    """
    token_payload = {
        'amount': int(float(order_data['amount']) * 100),
        'currency': 'PEN',
        'orderId': order_data['order_number'],
        'customer': {
            'email': order_data['customer_email'],
            'billingDetails': { ... }
        }
    }

    response = requests.post(
        f"{API_URL}/Charge/CreatePayment",
        json=token_payload,
        headers={'Authorization': f'Basic {auth}'}
    )

    return response.json()['answer']['formToken']
```

**¡IMPORTANTE!**
- El `formToken` es idéntico para ambos SDKs
- No necesitas cambiar el backend
- Solo cambia cómo se consume en el frontend

---

## 5. Integración en React/Next.js

### SDK Web V1 (Componente Actual)
```tsx
// frontend/src/components/ui/izipay-checkout-v1.tsx
import { IzipayCheckoutV1 } from '@/components/ui/izipay-checkout-v1';

<IzipayCheckoutV1
  order={{
    id: 123,
    order_number: "ORD-001",
    total: 290.00,
    currency: "PEN"
  }}
  billingInfo={{
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan@example.com",
    // ... más campos
  }}
  paymentConfig={{
    formToken: "FORM_TOKEN",
    publicKey: "45259313:testpublickey_xxx",
    keyRSA: "publickey_xxx",       // ⚠️ Requerido
    merchantCode: "45259313",       // ⚠️ Requerido
    mode: "SANDBOX"
  }}
  onPaymentComplete={(result) => console.log('Success', result)}
  onPaymentError={(error) => console.log('Error', error)}
/>
```

**Líneas de código:** ~430 líneas

---

### SmartForm V4.0 (Componente Nuevo)
```tsx
// frontend/src/components/ui/izipay-smartform.tsx
import { IzipaySmartForm } from '@/components/ui/izipay-smartform';

<IzipaySmartForm
  order={{
    id: 123,
    order_number: "ORD-001",
    total: 290.00,
    currency: "PEN"
  }}
  paymentConfig={{
    formToken: "FORM_TOKEN",
    publicKey: "45259313:testpublickey_xxx",
    mode: "SANDBOX"
  }}
  displayMode="card-expanded"  // 'list' | 'popin' | 'card-expanded'
  theme="neon"                 // 'neon' | 'classic'
  successUrl="https://misite.com/success"
  onPaymentComplete={(result) => console.log('Success', result)}
  onPaymentError={(error) => console.log('Error', error)}
/>
```

**Líneas de código:** ~350 líneas (20% menos código)

---

## 6. Flujo de Pago Completo

### SDK Web V1
```
1. Backend crea formToken con Charge/CreatePayment
2. Frontend inicializa new window.Izipay({ config })
3. Frontend llama checkout.LoadForm({ authorization, keyRSA, callback })
4. Usuario completa pago
5. Callback ejecuta onPaymentComplete/onPaymentError
6. IPN webhook confirma pago en backend
```

**Complejidad:** 🔴🔴🔴 Alta
**Puntos de fallo:** 5-6

---

### SmartForm V4.0
```
1. Backend crea formToken con Charge/CreatePayment
2. Frontend carga script con kr-public-key
3. Frontend renderiza <div class="kr-smart-form" kr-form-token="...">
4. Usuario completa pago
5. Redirección a kr-post-url-success
6. IPN webhook confirma pago en backend
```

**Complejidad:** 🟢🟢 Baja
**Puntos de fallo:** 3-4

---

## 7. Manejo de Webhooks (IPN)

### ✅ Ambos SDKs usan el MISMO webhook

```python
# backend/api/payments.py
# Endpoint: POST /api/payments/webhook

@payments_bp.route('/webhook', methods=['POST'])
def payment_webhook():
    """
    Webhook IPN oficial de Izipay.
    Compatible con SDK Web V1 Y SmartForm V4.0.
    """
    kr_answer = request.form.get('kr-answer')
    kr_hash = request.form.get('kr-hash')

    if not checkHash(request.form, IZIPAY_PASSWORD):
        return jsonify({'error': 'Invalid signature'}), 400

    answer = json.loads(kr_answer)
    order_status = answer.get('orderStatus')  # PAID / UNPAID

    # Actualizar orden en base de datos
    order.status = OrderStatus.PAID if order_status == 'PAID' else OrderStatus.FAILED
    db.session.commit()

    return f'OK! OrderStatus is {order_status}', 200
```

**¡IMPORTANTE!**
- No necesitas cambiar el webhook
- Funciona exactamente igual para ambos SDKs

---

## 8. Pruebas y Debugging

### SDK Web V1
```typescript
// Debug mode habilitado por defecto
console.log('[SDK Web V1] Inicializando Izipay');
console.log('[SDK Web V1] iziConfig COMPLETO:', iziConfig);
console.log('[SDK Web V1] LoadForm SUCCESS');
```

**Ventajas:**
- ✅ Logs detallados en cada paso
- ✅ Inspección completa del estado
- ❌ Más superficie para bugs

---

### SmartForm V4.0
```typescript
// Debug más simple
console.log('[SmartForm V4.0] Inicializando Izipay SmartForm');
console.log('[SmartForm V4.0] SDK cargado correctamente');
```

**Ventajas:**
- ✅ Menos código = menos bugs
- ✅ Krypton Client maneja internamente el estado
- ⚠️ Menos visibilidad del estado interno

---

## 9. Casos de Uso Recomendados

### Usa SDK Web V1 cuando:
- ✅ Necesitas personalización extrema de UI
- ✅ Requieres control total del flujo de pago
- ✅ Necesitas callbacks personalizados en cada paso
- ✅ Tienes equipo con experiencia en JS avanzado

### Usa SmartForm V4.0 cuando:
- ✅ Quieres implementación rápida y estable
- ✅ La apariencia estándar de Izipay es aceptable
- ✅ Priorizas mantenibilidad sobre personalización
- ✅ Quieres menos superficie de ataque para bugs
- ✅ **Proyecto nuevo o migración desde versiones antiguas** ⭐

---

## 10. Migración de SDK Web V1 a SmartForm V4.0

### Paso 1: Reemplazar el componente

```tsx
// ANTES (SDK Web V1)
import { IzipayCheckoutV1 } from '@/components/ui/izipay-checkout-v1';

<IzipayCheckoutV1
  paymentConfig={{
    formToken: token,
    publicKey: publicKey,
    keyRSA: keyRSA,        // ❌ Ya no necesario
    merchantCode: merchant, // ❌ Ya no necesario
    mode: mode
  }}
/>

// DESPUÉS (SmartForm V4.0)
import { IzipaySmartForm } from '@/components/ui/izipay-smartform';

<IzipaySmartForm
  paymentConfig={{
    formToken: token,
    publicKey: publicKey,  // ✅ Solo esto es necesario
    mode: mode
  }}
  displayMode="card-expanded"
  theme="neon"
/>
```

### Paso 2: Actualizar variables de entorno (opcional)

Si solo usas SmartForm, puedes remover:
```bash
# Ya no es necesario si solo usas SmartForm:
# IZIPAY_KEY_RSA=publickey_xxx
# IZIPAY_MERCHANT_CODE=45259313
```

### Paso 3: Actualizar endpoint del backend (opcional)

```python
# backend/api/payments.py
# ANTES: Retornaba keyRSA y merchantCode
return jsonify({
    'formToken': result['form_token'],
    'publicKey': config['public_key'],
    'keyRSA': config['key_rsa'],        # ❌ Ya no necesario
    'merchantCode': config['merchant_code'], # ❌ Ya no necesario
    'mode': config['mode']
})

# DESPUÉS: Solo retorna lo necesario
return jsonify({
    'formToken': result['form_token'],
    'publicKey': config['public_key'],  # ✅ Suficiente
    'mode': config['mode']
})
```

### Paso 4: Probar en la página demo

```bash
# Frontend
npm run dev

# Visitar: http://localhost:3000/smartform-demo
```

---

## 11. Tabla de Decisión Rápida

| Criterio | SDK Web V1 | SmartForm V4.0 | Ganador |
|----------|-----------|----------------|---------|
| **Facilidad de implementación** | 6/10 | 9/10 | ✅ SmartForm |
| **Personalización de UI** | 9/10 | 6/10 | ✅ SDK V1 |
| **Estabilidad** | 7/10 | 9/10 | ✅ SmartForm |
| **Documentación oficial** | 6/10 | 9/10 | ✅ SmartForm |
| **Mantenibilidad** | 6/10 | 9/10 | ✅ SmartForm |
| **Performance** | 8/10 | 8/10 | 🤝 Empate |
| **Compatibilidad móvil** | 8/10 | 9/10 | ✅ SmartForm |
| **Control del flujo** | 9/10 | 7/10 | ✅ SDK V1 |

---

## 12. Recomendación Final

### 🎯 Para este proyecto (invitaciones_web):

**Usa SmartForm V4.0** por las siguientes razones:

1. ✅ **Menos complejidad**: 20% menos código, menos bugs
2. ✅ **Documentación oficial**: Izipay tiene guías completas para SmartForm
3. ✅ **Estabilidad probada**: Krypton Client V4.0 está en producción desde hace años
4. ✅ **Mantenimiento mínimo**: Menos actualizaciones necesarias
5. ✅ **Migración fácil**: Componente ya creado en `izipay-smartform.tsx`

### 🔧 Cuándo considerar SDK Web V1:

Solo si **absolutamente necesitas**:
- Control total del diseño y flujo de pago
- Callbacks personalizados en cada paso del checkout
- Integración con sistemas de analytics muy específicos

---

## 13. Recursos Adicionales

### Documentación oficial:
- **SmartForm V4.0**: https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/javascript/redirection/quick_start_smartform.html
- **API V4**: https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/api/reference.html
- **Webhooks IPN**: https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/kb/payment_done.html

### Repositorios de ejemplo:
- **SmartForm**: https://github.com/izipay-pe/Popin-PaymentForm-Python-Flask
- **Redirect Form**: https://github.com/izipay-pe/Redirect-PaymentForm-Python-Flask

### Archivos del proyecto:
- **Backend formToken**: `backend/api/payments.py` (líneas 93-230)
- **Backend webhook**: `backend/api/payments.py` (líneas 602-760)
- **Frontend SDK V1**: `frontend/src/components/ui/izipay-checkout-v1.tsx`
- **Frontend SmartForm**: `frontend/src/components/ui/izipay-smartform.tsx`
- **Página demo**: `frontend/src/app/smartform-demo/page.tsx`
- **Documentación backend**: `backend/docs/docizipay/inicio_rapido_izi.md`

---

## 14. Preguntas Frecuentes

**Q: ¿Puedo usar ambos SDKs al mismo tiempo?**
A: Sí, pero no es recomendado. Elige uno para consistencia.

**Q: ¿El formToken es compatible entre ambos?**
A: Sí, el backend genera el mismo formToken para ambos SDKs.

**Q: ¿Necesito cambiar mis webhooks?**
A: No, los webhooks IPN son idénticos para ambos SDKs.

**Q: ¿SmartForm V4.0 soporta Yape y Plin?**
A: Sí, soporta todos los métodos de pago configurados en tu cuenta Izipay.

**Q: ¿Puedo personalizar los colores del SmartForm?**
A: Limitadamente. Usa temas predefinidos (`neon` o `classic`).

**Q: ¿Cómo pruebo SmartForm sin afectar producción?**
A: Usa la página demo en `/smartform-demo` con `IZIPAY_MODE=SANDBOX`.

---

**Última actualización:** 2025-01-30
**Versión:** 1.0
**Autor:** Claude Code (Anthropic)
