# Requisitos y Configuración del Proyecto

## Lo que necesito de ti:

### 1. Cuentas y APIs Externas

#### Pasarela de Pagos - Izipay
- Crear cuenta en [Izipay](https://www.izipay.pe/)
- Obtener credenciales del ambiente de pruebas (sandbox)
- Configurar webhook URL cuando tengamos el servidor
- Documentación: https://docs.izipay.pe/

#### Google Cloud Platform
- Crear proyecto en [Google Cloud Console](https://console.cloud.google.com)
- Habilitar APIs:
  - Maps JavaScript API
  - Geocoding API
  - Google Sheets API
  - Google Calendar API
- Crear credenciales OAuth 2.0 para Sheets
- Obtener API Keys para Maps

#### WhatsApp Business
- Crear cuenta [WhatsApp Business API](https://business.whatsapp.com/products/business-platform)
- O usar servicio como Twilio WhatsApp
- Configurar plantillas de mensajes
- Obtener token de acceso

#### Servicio de Email
Elegir uno:
- **SendGrid**: Cuenta gratuita permite 100 emails/día
- **AWS SES**: Más económico para volumen alto
- **SMTP Gmail**: Para desarrollo inicial

#### Almacenamiento de Archivos
Elegir uno:
- **AWS S3**: Para producción
- **Cloudinary**: Incluye CDN y transformaciones
- **Local**: Solo para desarrollo

### 2. Servidor y Dominio

#### Dominio
- Comprar dominio principal (ej: tuweb.com)
- Configurar subdominios:
  - `api.tuweb.com` - Backend API
  - `invitaciones.tuweb.com` - Para invitaciones de usuarios
  - `admin.tuweb.com` - Panel administrativo

#### Hosting
Opciones recomendadas:
- **AWS EC2**: t3.medium para empezar
- **DigitalOcean Droplet**: 4GB RAM mínimo
- **Vercel/Netlify**: Para frontend
- **Railway/Render**: Para backend

### 3. Base de Datos

#### PostgreSQL (Recomendado)
- **Desarrollo**: PostgreSQL local o Docker
- **Producción**: 
  - AWS RDS
  - DigitalOcean Managed Database
  - Supabase (incluye auth y realtime)

#### Redis
- Para cache y sesiones
- Redis Cloud tiene tier gratuito

### 4. Stack Técnico Definido

#### Frontend - Next.js 14
- **Framework**: Next.js con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: React Query + Zustand
- **Formularios**: React Hook Form + Zod
- **Animaciones**: Framer Motion
- **Internacionalización**: next-intl

#### Backend - Python Flask
- **Framework**: Flask
- **ORM**: SQLAlchemy
- **Autenticación**: Flask-JWT-Extended
- **Tareas asíncronas**: Celery
- **Cache**: Redis
- **Base de datos**: PostgreSQL
- **API Docs**: Flask-RESTX/Swagger

### 5. Información del Negocio

#### Datos de la Empresa
- Razón social
- RUC
- Dirección fiscal
- Teléfono de contacto
- Email de soporte

#### Políticas
- Términos y condiciones
- Política de privacidad
- Política de devoluciones detallada
- Libro de reclamaciones (formato legal Perú)

#### Contenido
- Logo en alta resolución
- Paleta de colores de marca
- Tipografías a usar
- Video promocional del hero
- Fotos de Sarai para "Quiénes somos"
- Testimonios reales de clientes

### 6. Plantillas Iniciales

Para el plan Standard necesitamos:
- Mínimo 10 plantillas de invitación
- Cada una con:
  - Nombre descriptivo
  - Categoría (clásica, moderna, minimalista, etc.)
  - Miniatura (400x600px)
  - Demo HTML/CSS funcional
  - Música de fondo predeterminada

### 7. Configuración de Desarrollo

#### Requisitos del Sistema
```bash
# Backend
- Python 3.10+
- PostgreSQL 14+
- Redis 6+

# Frontend
- Node.js 18+
- npm o yarn

# General
- Git
- Docker (opcional pero recomendado)
```

#### Herramientas de Desarrollo
```bash
- VS Code o IDE preferido
- Postman o Insomnia (testing API)
- pgAdmin o DBeaver (gestión BD)
- Git GUI (opcional)
```

### 8. Cuentas de Prueba

Necesitaremos crear:
- Tarjetas de prueba para Izipay
- Números de WhatsApp de prueba
- Emails de prueba para diferentes roles
- Datos de prueba para invitaciones

### 9. Monitoreo (Opcional pero Recomendado)

- **Sentry**: Para tracking de errores
- **Google Analytics**: Para métricas web
- **Hotjar**: Para heatmaps y recordings
- **UptimeRobot**: Para monitoreo de uptime

### 10. Seguridad

- Certificado SSL (Let's Encrypt es gratuito)
- Configurar CORS correctamente
- Rate limiting en API
- Backup automático de BD
- Plan de recuperación ante desastres

## Próximos Pasos

1. **Crear todas las cuentas necesarias**
2. **Obtener las API keys y guardarlas seguras**
3. **Decidir stack tecnológico final**
4. **Configurar entorno de desarrollo local**
5. **Crear repositorio en GitHub**
6. **Configurar GitHub Actions para CI/CD**

## Presupuesto Mensual Estimado

### Costos Fijos Mínimos
- Dominio: $15/año
- Servidor: $40-80/mes
- Base de datos: $15-25/mes
- Redis: $0-10/mes (tier gratuito disponible)
- CDN/Storage: $5-20/mes
- Email: $0-15/mes
- SSL: $0 (Let's Encrypt)

**Total estimado: $60-150/mes**

### Costos Variables
- WhatsApp API: Por mensaje enviado
- Google Maps: Por llamada API
- Izipay: Comisión por transacción
- SMS (si se implementa): Por mensaje

## Contacto para Dudas

Si tienes preguntas sobre cualquier configuración, necesitarás:
- Documentación oficial de cada servicio
- Soporte técnico de proveedores
- Comunidad de desarrolladores (Stack Overflow, GitHub Issues)