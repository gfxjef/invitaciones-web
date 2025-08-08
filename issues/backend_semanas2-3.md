# Issues Backend - Semanas 2-3

## 21. [BACKEND] Setup inicial y arquitectura
**Prioridad:** Alta
**Etiquetas:** backend, setup, architecture
**Descripción:**
- Inicializar proyecto Node.js/Python
- Configurar estructura de carpetas MVC
- Setup base de datos (PostgreSQL/MySQL)
- Configurar variables de entorno

**Criterios de aceptación:**
- [ ] Servidor corriendo en puerto 3000
- [ ] Conexión a BD exitosa
- [ ] .env.example creado
- [ ] Scripts npm/pip configurados

---

## 22. [BACKEND] Modelo y CRUD de usuarios
**Prioridad:** Alta
**Etiquetas:** backend, auth, users
**Descripción:**
- Crear modelo User con roles (cliente, admin, diseñador)
- Implementar registro con validación
- Hash de contraseñas (bcrypt)
- CRUD completo de usuarios

**Criterios de aceptación:**
- [ ] Modelo con campos requeridos
- [ ] Validaciones de email único
- [ ] Contraseñas hasheadas
- [ ] Roles implementados

---

## 23. [BACKEND] Sistema de autenticación JWT
**Prioridad:** Alta
**Etiquetas:** backend, auth, security
**Descripción:**
- Implementar login con JWT
- Refresh tokens
- Middleware de autenticación
- Logout y blacklist de tokens

**Criterios de aceptación:**
- [ ] Login retorna access y refresh token
- [ ] Tokens expiran correctamente
- [ ] Middleware protege rutas
- [ ] Refresh token funcional

---

## 24. [BACKEND] Reset de contraseña
**Prioridad:** Media
**Etiquetas:** backend, auth, email
**Descripción:**
- Endpoint para solicitar reset
- Generar token temporal
- Enviar email con link
- Validar y actualizar contraseña

**Criterios de aceptación:**
- [ ] Email enviado correctamente
- [ ] Token expira en 1 hora
- [ ] Link único por usuario
- [ ] Contraseña actualizada

---

## 25. [BACKEND] API de planes y características
**Prioridad:** Alta
**Etiquetas:** backend, API, products
**Descripción:**
- Modelo Plan con características
- Endpoints GET /plans
- Endpoint GET /plans/:id
- Relación plan-características

**Criterios de aceptación:**
- [ ] Listado de planes
- [ ] Detalle con características
- [ ] Precios y descuentos
- [ ] Orden de visualización

---

## 26. [BACKEND] CRUD de plantillas
**Prioridad:** Alta
**Etiquetas:** backend, API, templates
**Descripción:**
- Modelo Template
- Upload de miniaturas
- Categorización de plantillas
- Paginación en listado

**Criterios de aceptación:**
- [ ] CRUD completo
- [ ] Upload de imágenes
- [ ] Paginación funcional
- [ ] Filtros por categoría

---

## 27. [BACKEND] Gestión de archivos multimedia
**Prioridad:** Media
**Etiquetas:** backend, files, storage
**Descripción:**
- Configurar multer/similar
- Validar tipos de archivo
- Redimensionar imágenes
- Almacenamiento en cloud (S3/Cloudinary)

**Criterios de aceptación:**
- [ ] Upload de imágenes
- [ ] Validación de tamaño/tipo
- [ ] Thumbnails generados
- [ ] URLs públicas de acceso