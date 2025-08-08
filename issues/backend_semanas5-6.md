# Issues Backend - Semanas 5-6

## 36. [BACKEND] Confirmación de asistencia WhatsApp
**Prioridad:** Alta
**Etiquetas:** backend, integration, whatsapp
**Descripción:**
- Integrar WhatsApp Business API
- Mensaje predeterminado para Standard
- Tracking de confirmaciones
- Templates de mensajes

**Criterios de aceptación:**
- [ ] Link de WhatsApp generado
- [ ] Mensaje con datos del invitado
- [ ] Registro en BD
- [ ] Fallback a link directo

---

## 37. [BACKEND] Formulario confirmación Exclusivo
**Prioridad:** Alta
**Etiquetas:** backend, forms, RSVP
**Descripción:**
- Endpoint para confirmación
- Campos dinámicos según config
- Validaciones personalizadas
- Notificaciones al organizador

**Criterios de aceptación:**
- [ ] Campos: pases, restricciones, etc
- [ ] Validación de pases máximos
- [ ] Email de confirmación
- [ ] Actualización en tiempo real

---

## 38. [BACKEND] Integración Google Sheets
**Prioridad:** Alta
**Etiquetas:** backend, integration, sheets
**Descripción:**
- Configurar Google Sheets API
- Crear hoja automáticamente
- Escribir confirmaciones en tiempo real
- Permisos y compartir hoja

**Criterios de aceptación:**
- [ ] Autenticación OAuth2
- [ ] Hoja creada por evento
- [ ] Datos sincronizados
- [ ] Link compartible generado

---

## 39. [BACKEND] Panel administrativo - Base
**Prioridad:** Alta
**Etiquetas:** backend, admin, dashboard
**Descripción:**
- Endpoints admin protegidos
- Dashboard con estadísticas
- Gestión de usuarios
- Logs de actividad

**Criterios de aceptación:**
- [ ] Solo acceso admin
- [ ] Métricas principales
- [ ] CRUD usuarios
- [ ] Filtros y búsqueda

---

## 40. [BACKEND] Gestión de pedidos admin
**Prioridad:** Alta
**Etiquetas:** backend, admin, orders
**Descripción:**
- Listado de órdenes con filtros
- Cambio de estados manual
- Detalles de transacciones
- Exportar reportes

**Criterios de aceptación:**
- [ ] Filtros por estado/fecha
- [ ] Actualizar estado
- [ ] Ver pagos asociados
- [ ] Export CSV/Excel

---

## 41. [BACKEND] Gestión de invitaciones admin
**Prioridad:** Media
**Etiquetas:** backend, admin, invitations
**Descripción:**
- CRUD de invitaciones
- Preview de invitación
- Estadísticas de uso
- Duplicar invitaciones

**Criterios de aceptación:**
- [ ] Listado paginado
- [ ] Editar contenido
- [ ] Ver confirmaciones
- [ ] Clonar invitación

---

## 42. [BACKEND] Sistema de testimonios
**Prioridad:** Baja
**Etiquetas:** backend, content, testimonials
**Descripción:**
- Modelo Testimonial
- CRUD con moderación
- Rating y verificación
- API pública para frontend

**Criterios de aceptación:**
- [ ] Campos: nombre, texto, rating
- [ ] Estado: pendiente/aprobado
- [ ] Orden personalizable
- [ ] Filtro por rating

---

## 43. [BACKEND] Libro de reclamaciones
**Prioridad:** Media
**Etiquetas:** backend, legal, claims
**Descripción:**
- Modelo Claim con código único
- Formulario público
- Notificación automática
- Panel de gestión

**Criterios de aceptación:**
- [ ] Código único generado
- [ ] Email de confirmación
- [ ] Estados de seguimiento
- [ ] Respuesta al cliente

---

## 44. [BACKEND] Sistema de devoluciones
**Prioridad:** Media
**Etiquetas:** backend, e-commerce, refunds
**Descripción:**
- Validar plazo 5 días
- Proceso de aprobación
- Integración reembolso Izipay
- Auditoría de devoluciones

**Criterios de aceptación:**
- [ ] Validación temporal
- [ ] Flujo de aprobación
- [ ] Reembolso automático
- [ ] Historial completo

---

## 45. [BACKEND] API de internacionalización
**Prioridad:** Baja
**Etiquetas:** backend, i18n, API
**Descripción:**
- Endpoints para traducciones
- Gestión de idiomas
- Cache de traducciones
- Fallback a idioma default

**Criterios de aceptación:**
- [ ] GET /translations/:lang
- [ ] Admin puede editar
- [ ] Cache Redis
- [ ] Fallback español