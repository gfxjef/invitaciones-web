# API Endpoints - Invitaciones Web Backend

## 📋 Resumen General

Total de endpoints: **96 endpoints** organizados en 14 módulos

| Módulo | Endpoints | Prefijo | Descripción |
|--------|-----------|---------|-------------|
| **Auth** | 6 | `/api/auth` | Autenticación y gestión de sesiones |
| **Users** | 2 | `/api/user` | Información de usuario |
| **Invitations** | 11 | `/api/invitations` | CRUD de invitaciones |
| **Invitation Editor** | 19 | `/api/invitations` | Editor avanzado de invitaciones |
| **Invitation URLs** | 9 | `/api/invitation-urls` | URLs cortas y tracking |
| **Payments** | 10 | `/api/payments` | Integración con Izipay |
| **Orders** | 10 | `/api/orders` | Gestión de órdenes |
| **Cart** | 4 | `/api/cart` | Carrito de compras |
| **Templates** | 7 | `/api/templates` | Plantillas de invitación |
| **Coupons** | 11 | `/api/coupons` | Sistema de cupones |
| **Admin** | 3 | `/api/admin` | Panel administrativo |
| **Plans** | 2 | `/api/plans` | Planes de servicio |
| **Redirect** | 3 | `/r` | Redirección y QR |

## 🔐 Autenticación

La mayoría de endpoints requieren autenticación JWT:
- Header: `Authorization: Bearer <token>`
- Tokens de acceso expiran en 15 minutos
- Refresh tokens expiran en 7 días

## 📚 Índice de Módulos

### [1. Auth Module](./api/AUTH.md)
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/verify` - Verificar token
- `GET /api/auth/me` - Obtener usuario actual

### [2. Users Module](./api/USERS.md)
- `GET /api/user/plan` - Obtener plan del usuario
- `GET /api/user/profile` - Obtener perfil completo

### [3. Invitations Module](./api/INVITATIONS.md)
- `GET /api/invitations/` - Listar invitaciones
- `POST /api/invitations/` - Crear invitación
- `GET /api/invitations/{id}` - Obtener invitación
- `GET /api/invitations/{id}/urls` - URLs de invitación
- `POST /api/invitations/{id}/urls` - Crear URL
- `GET /api/invitations/{id}/media` - Listar media
- `POST /api/invitations/{id}/media` - Subir media
- `GET /api/invitations/{id}/media/{media_id}` - Obtener media
- `PUT /api/invitations/{id}/media/{media_id}` - Actualizar media
- `DELETE /api/invitations/{id}/media/{media_id}` - Eliminar media
- `PUT /api/invitations/{id}/media/reorder` - Reordenar media
- `POST /api/invitations/{id}/media/{media_id}/reprocess` - Reprocesar media
- `GET /api/invitations/media-types` - Tipos de media

### [4. Invitation Editor Module](./api/INVITATION_EDITOR.md)
- `POST /api/invitations/{id}/data` - Guardar datos
- `GET /api/invitations/{id}/data` - Obtener datos
- `PUT /api/invitations/{id}/data/{field}` - Actualizar campo
- `DELETE /api/invitations/{id}/data/{field}` - Eliminar campo
- `POST /api/invitations/{id}/media` - Subir archivos
- `GET /api/invitations/{id}/media` - Listar archivos
- `DELETE /api/invitations/{id}/media/{media_id}` - Eliminar archivo
- `POST /api/invitations/{id}/events` - Crear evento
- `GET /api/invitations/{id}/events` - Listar eventos
- `PUT /api/invitations/{id}/events/{event_id}` - Actualizar evento
- `DELETE /api/invitations/{id}/events/{event_id}` - Eliminar evento
- `GET /api/invitations/{id}/preview` - Generar preview
- `POST /api/invitations/{id}/publish` - Publicar
- `POST /api/invitations/{id}/unpublish` - Despublicar
- `GET /api/invitations/check-url/{slug}` - Verificar URL
- `GET /api/invitations/{id}/rsvp` - Obtener RSVP
- `POST /api/invitations/{id}/rsvp` - Actualizar RSVP
- `GET /api/invitations/{id}/rsvp/responses` - Listar respuestas
- `POST /api/invitations/{id}/rsvp/respond` - Responder RSVP

### [5. Invitation URLs Module](./api/INVITATION_URLS.md)
- `GET /api/invitation-urls` - Listar URLs
- `POST /api/invitation-urls` - Crear URL corta
- `GET /api/invitation-urls/{id}` - Obtener URL
- `PUT /api/invitation-urls/{id}` - Actualizar URL
- `DELETE /api/invitation-urls/{id}` - Eliminar URL
- `GET /api/invitation-urls/{id}/stats` - Estadísticas
- `GET /api/invitation-urls/r/{code}` - Resolver URL
- `GET /api/invitation-urls/debug/visits/{id}` - Debug visitas

### [6. Payments Module](./api/PAYMENTS.md)
- `POST /api/payments/formtoken` - Crear token de pago
- `POST /api/payments/process-payment` - Procesar pago
- `POST /api/payments/notificacion` - Webhook Izipay (legacy)
- `POST /api/payments/webhook` - Webhook Izipay
- `POST /api/payments/result` - Resultado de pago
- `GET /api/payments/status/{order_id}` - Estado de orden
- `GET /api/payments/config` - Configuración Izipay
- `GET /api/payments/izipay/status/{order_number}` - Estado Izipay
- `GET /api/payments/health` - Health check

### [7. Orders Module](./api/ORDERS.md)
- `GET /api/orders/` - Listar órdenes
- `POST /api/orders/` - Crear orden
- `GET /api/orders/{id}` - Obtener orden
- `GET /api/orders/number/{order_number}` - Buscar por número
- `GET /api/orders/cart` - Ver carrito actual
- `POST /api/orders/cart/add` - Agregar al carrito
- `POST /api/orders/cart/remove` - Quitar del carrito
- `POST /api/orders/cart/update` - Actualizar cantidad
- `POST /api/orders/cart/clear` - Vaciar carrito
- `POST /api/orders/cart/calculate` - Calcular totales

### [8. Cart Module](./api/CART.md)
- `POST /api/cart/items` - Agregar item
- `GET /api/cart/items` - Listar items
- `DELETE /api/cart/items/{id}` - Eliminar item
- `POST /api/cart/clear` - Limpiar carrito

### [9. Templates Module](./api/TEMPLATES.md)
- `GET /api/templates` - Listar plantillas
- `GET /api/templates/{id}` - Obtener plantilla
- `POST /api/templates` - Crear plantilla
- `PUT /api/templates/{id}` - Actualizar plantilla
- `DELETE /api/templates/{id}` - Eliminar plantilla

### [10. Coupons Module](./api/COUPONS.md)
- `POST /api/coupons` - Crear cupón
- `GET /api/coupons` - Listar cupones
- `GET /api/coupons/{id}` - Obtener cupón
- `PUT /api/coupons/{id}` - Actualizar cupón
- `DELETE /api/coupons/{id}` - Eliminar cupón
- `POST /api/coupons/validate` - Validar cupón
- `GET /api/coupons/public/{code}` - Info pública
- `POST /api/coupons/apply` - Aplicar cupón
- `DELETE /api/coupons/remove` - Quitar cupón
- `GET /api/coupons/{id}/usage` - Ver uso
- `GET /api/coupons/stats` - Estadísticas

### [11. Admin Module](./api/ADMIN.md)
- `GET /api/admin/dashboard` - Dashboard admin
- `GET /api/admin/users` - Listar usuarios
- `GET /api/admin/orders` - Listar órdenes

### [12. Plans Module](./api/PLANS.md)
- `GET /api/plans/` - Listar planes
- `GET /api/plans/{id}` - Obtener plan

### [13. Redirect Module](./api/REDIRECT.md)
- `GET /r/{code}` - Redirección
- `GET /r/{code}/preview` - Preview URL
- `GET /r/{code}/qr` - Generar QR

## 🏗️ Endpoints del Sistema

### Health & Status
- `GET /` - Información de la API
- `GET /health` - Health check con estado de DB

## 📝 Notas Importantes

1. **Autenticación**: Todos los endpoints excepto auth/register, auth/login, redirect, y endpoints públicos requieren JWT
2. **Rate Limiting**: No implementado actualmente
3. **CORS**: Configurado para `http://localhost:3000,http://localhost:3001`
4. **Documentación detallada**: Ver archivo específico de cada módulo para detalles completos