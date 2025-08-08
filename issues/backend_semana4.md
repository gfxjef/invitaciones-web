# Issues Backend - Semana 4

## 28. [BACKEND] Modelo de carrito de compras
**Prioridad:** Alta
**Etiquetas:** backend, e-commerce, cart
**Descripción:**
- Crear modelo Cart asociado a usuario
- Items del carrito con cantidad
- Métodos para calcular totales
- Limpieza automática de carritos antiguos

**Criterios de aceptación:**
- [ ] Carrito por usuario
- [ ] Agregar/eliminar items
- [ ] Actualizar cantidades
- [ ] Cálculo de totales correcto

---

## 29. [BACKEND] Modelo y gestión de órdenes
**Prioridad:** Alta
**Etiquetas:** backend, e-commerce, orders
**Descripción:**
- Modelo Order con estados
- Guardar snapshot de productos
- Información de facturación
- Historial de cambios de estado

**Criterios de aceptación:**
- [ ] Estados: pendiente, pagado, cancelado
- [ ] Datos de productos inmutables
- [ ] Número de orden único
- [ ] Timestamps de cambios

---

## 30. [BACKEND] Integración Izipay
**Prioridad:** Alta
**Etiquetas:** backend, payments, integration
**Descripción:**
- Integrar API de Izipay
- Crear token de pago
- Procesar transacción
- Webhooks para confirmación

**Criterios de aceptación:**
- [ ] Sandbox configurado
- [ ] Pagos procesados
- [ ] Webhooks funcionando
- [ ] Logs de transacciones

---

## 31. [BACKEND] Sistema de cupones de descuento
**Prioridad:** Media
**Etiquetas:** backend, e-commerce, discounts
**Descripción:**
- Modelo Coupon con reglas
- Validación de códigos
- Tipos: porcentaje, monto fijo
- Límites de uso y expiración

**Criterios de aceptación:**
- [ ] CRUD de cupones
- [ ] Validación al aplicar
- [ ] Descuentos calculados
- [ ] Control de uso

---

## 32. [BACKEND] Modelo de invitaciones
**Prioridad:** Alta
**Etiquetas:** backend, core, invitations
**Descripción:**
- Modelo Invitation completo
- Campos: novios, fecha, hora, ubicación
- Música (URL YouTube para Exclusivo)
- Fotos, lista regalos, frase

**Criterios de aceptación:**
- [ ] Todos los campos del plan
- [ ] Validaciones por tipo de plan
- [ ] Relación con orden/usuario
- [ ] Soft delete implementado

---

## 33. [BACKEND] URLs únicas para invitados
**Prioridad:** Alta
**Etiquetas:** backend, core, invitations
**Descripción:**
- Generar URLs únicas por invitado
- Modelo Guest relacionado
- Tracking de visitas
- Variaciones según plan (1 Standard, 3 Exclusivo)

**Criterios de aceptación:**
- [ ] URL corta única generada
- [ ] Sin colisiones
- [ ] Estadísticas de acceso
- [ ] Variaciones guardadas

---

## 34. [BACKEND] Integración Google Maps
**Prioridad:** Media
**Etiquetas:** backend, integration, maps
**Descripción:**
- Validar direcciones con API
- Generar enlaces de navegación
- Coordenadas para embed
- Cache de resultados

**Criterios de aceptación:**
- [ ] Direcciones validadas
- [ ] Links de Google Maps
- [ ] Coordenadas almacenadas
- [ ] Rate limiting implementado

---

## 35. [BACKEND] Google Calendar integration
**Prioridad:** Baja
**Etiquetas:** backend, integration, calendar
**Descripción:**
- Generar archivo .ics
- Integración con Google Calendar API
- Save-the-date automático
- Recordatorios configurables

**Criterios de aceptación:**
- [ ] Archivo .ics válido
- [ ] Botón add to calendar
- [ ] Timezone correcto
- [ ] Descripción del evento