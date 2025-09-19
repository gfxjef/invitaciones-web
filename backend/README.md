# Backend - Invitaciones Web

Sistema backend para plataforma de invitaciones digitales desarrollado con Flask, MySQL y integración con Izipay.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- MySQL 5.7+
- Virtual environment

### Installation
```bash
# 1. Navegar al directorio backend
cd backend

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 6. Inicializar base de datos
python init_db.py

# 7. Ejecutar servidor de desarrollo
python app.py
```

El servidor estará disponible en `http://localhost:5000`

## 📚 Documentación

### [📋 API Endpoints](./docs/API_ENDPOINTS.md)
Documentación completa de los 96 endpoints disponibles organizados por módulo.

### Módulos API Detallados
- [🔐 Auth Module](./docs/api/AUTH.md) - Autenticación JWT y gestión de sesiones
- [👤 Users Module](./docs/api/USERS.md) - Gestión de usuarios y perfiles
- [💌 Invitations Module](./docs/api/INVITATIONS.md) - CRUD de invitaciones
- [✏️ Invitation Editor Module](./docs/api/INVITATION_EDITOR.md) - Editor avanzado con 19 endpoints
- [🔗 Invitation URLs Module](./docs/api/INVITATION_URLS.md) - URLs cortas y tracking
- [💳 Payments Module](./docs/api/PAYMENTS.md) - Integración completa con Izipay
- [📦 Orders Module](./docs/api/ORDERS.md) - Gestión de órdenes
- [🛒 Cart Module](./docs/api/CART.md) - Carrito de compras
- [🎨 Templates Module](./docs/api/TEMPLATES.md) - Plantillas de invitación
- [🎟️ Coupons Module](./docs/api/COUPONS.md) - Sistema de cupones y descuentos
- [👨‍💼 Admin Module](./docs/api/ADMIN.md) - Panel administrativo
- [💼 Plans Module](./docs/api/PLANS.md) - Planes de servicio
- [↪️ Redirect Module](./docs/api/REDIRECT.md) - Redirecciones y códigos QR

### Documentación Técnica
- [🏗️ Architecture](./docs/ARCHITECTURE.md) - Arquitectura y patrones del sistema
- [📊 Database Models](./docs/MODELS.md) - Esquema completo de base de datos
- [🛠️ Services](./docs/SERVICES.md) - Servicios y utilidades del sistema

## 🔑 Características Principales

### Autenticación y Seguridad
- JWT con access tokens (15 min) y refresh tokens (7 días)
- Bcrypt para hash de contraseñas
- CORS configurado para múltiples orígenes
- Validación de webhooks con HMAC

### Gestión de Invitaciones
- Editor completo con auto-save
- Soporte para múltiples eventos
- Galería de imágenes con procesamiento automático
- Sistema RSVP configurable
- URLs personalizadas y códigos QR

### Procesamiento de Pagos
- Integración con Izipay (sandbox y producción)
- Embedded forms para PCI compliance
- Webhooks para actualizaciones en tiempo real
- Soporte para cupones de descuento

### Almacenamiento de Archivos
- Upload vía FTP a servidor remoto
- Procesamiento automático de imágenes
- Generación de thumbnails
- Validación de tipos y tamaños

## 🗄️ Base de Datos

### Esquema Principal
- **14 modelos** principales
- **60+ campos** en InvitationData
- Relaciones bien definidas con foreign keys
- Índices optimizados para búsquedas frecuentes

### Migraciones
```bash
# Crear nueva migración
flask db migrate -m "Descripción"

# Aplicar migraciones
flask db upgrade

# Rollback
flask db downgrade
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Test básico de API
python test_api.py

# Test completo del sistema
python test_complete.py

# Test del editor de invitaciones
python test_invitation_editor.py

# Test del sistema FTP
python test_ftp_system.py
```

### Coverage
```bash
pytest --cov=. --cov-report=html
```

## 🔧 Configuración

### Variables de Entorno Requeridas
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=invitaciones_web
DB_PORT=3306

# Security
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret

# Payment Gateway
IZIPAY_USERNAME=your_username
IZIPAY_PASSWORD=your_password
IZIPAY_PUBLIC_KEY=your_public_key
IZIPAY_HMACSHA256=your_hmac_key
IZIPAY_MODE=SANDBOX

# File Storage
FTP_HOST=ftp.kossomet.com
FTP_USER=marketing@kossomet.com
FTP_PASS=your_ftp_password

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Admin
ADMIN_EMAIL=admin@invitaciones.com
ADMIN_PASSWORD=admin123
```

## 📈 Endpoints Principales

### Health Check
```bash
curl http://localhost:5000/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Get Invitations
```bash
curl http://localhost:5000/api/invitations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚀 Deployment

### Production Checklist
- [ ] Configurar variables de entorno de producción
- [ ] Cambiar `IZIPAY_MODE` a `PRODUCTION`
- [ ] Configurar HTTPS
- [ ] Implementar rate limiting
- [ ] Configurar logs centralizados
- [ ] Establecer backups automáticos
- [ ] Configurar monitoreo (health checks)

### Con Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()
```

### Con Docker
```dockerfile
FROM python:3.8-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app()"]
```

## 🤝 API Integration

### Frontend (Next.js)
El frontend se conecta usando axios con interceptores para manejo automático de tokens:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Webhooks
Izipay enviará notificaciones a:
- Sandbox: `https://tu-dominio.com/api/payments/webhook`
- Production: `https://tu-dominio.com/api/payments/webhook`

## 📊 Monitoreo

### Endpoints de Estado
- `/health` - Estado general del sistema
- `/api/payments/health` - Estado de integración Izipay

### Logs
Los logs se encuentran en:
- Desarrollo: Console output
- Producción: `/var/log/invitaciones/app.log`

### Métricas Clave
- Tiempo de respuesta de API
- Tasa de éxito de pagos
- Uploads exitosos vs fallidos
- Usuarios activos
- Invitaciones publicadas

## 🐛 Troubleshooting

### Error: "JWT_SECRET environment variable is required"
Asegúrate de configurar la variable `JWT_SECRET` en tu archivo `.env`

### Error: "Cannot connect to MySQL"
Verifica las credenciales de base de datos y que MySQL esté ejecutándose

### Error: "FTP upload failed"
Revisa las credenciales FTP y la conectividad de red

### Error: "Izipay webhook validation failed"
Verifica que `IZIPAY_HMACSHA256` esté configurado correctamente

## 📝 License

Proprietary - All rights reserved

## 👥 Support

Para soporte técnico, contactar al equipo de desarrollo.

---

**Version**: 1.0.0
**Last Updated**: January 2024