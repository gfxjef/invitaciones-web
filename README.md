# Invitaciones Web - Plataforma de Invitaciones Digitales

## Descripción
Plataforma completa para crear y gestionar invitaciones digitales de bodas con dos planes principales: Standard y Exclusivo.

## Características Principales

### Plan Standard (S/ 290)
- Plantillas pre-diseñadas
- Ubicación con Google Maps
- Música estándar
- Dominio gratuito por 6 meses
- Código de vestimenta
- Opciones de regalo (Yape, Plin, etc.)
- Carrusel de fotos y videos
- Confirmación vía WhatsApp

### Plan Exclusivo (S/ 690)
- Diseño personalizado
- Invitaciones con nombre y dedicatoria por invitado
- Confirmación de asistencia con formulario adaptable
- Integración con Google Sheets
- Música personalizada (YouTube)
- Dominio personalizado
- Edición de fotos y paleta de colores
- Hasta 3 variaciones de invitación
- Reuniones con horarios flexibles

### ✨ Nuevas Características Implementadas

#### Sistema de Categorías de Templates
- **Categorías soportadas**: weddings, kids, corporate, quinceañeras
- **Validación automática**: Secciones apropiadas por categoría
- **API endpoints**: `/api/templates/categories` y `/api/templates/categories/:category/sections`
- **Templates demo**: `/invitacion/demo/7` (weddings), `/invitacion/demo/8` (kids)

#### Variables de Pareja Unificadas
- **Unificación completa**: De 4 campos duplicados a 2 campos base
- **Auto-generación**: `coupleNames` se genera automáticamente desde `groom_name` + `bride_name`
- **Sincronización perfecta**: Cambios en customizer se reflejan en Hero, Footer y Couple
- **Single source of truth**: Una sola edición afecta todas las secciones

## Stack Tecnológico

### Frontend
- **Next.js 14** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **Shadcn/ui** para componentes
- **React Query** para manejo de estado
- **Next-intl** para internacionalización (ES/EN)
- **Framer Motion** para animaciones

### Backend
- **Python Flask** como framework
- **SQLAlchemy** ORM
- **Flask-JWT-Extended** para autenticación
- **Flask-CORS** para CORS
- **Celery** para tareas asíncronas
- **Redis** para cache y colas
- **PostgreSQL** como base de datos
- Integraciones: Izipay, Google APIs, WhatsApp

## Estructura del Proyecto

```
/
├── frontend/           # Aplicación SPA
├── backend/           # API REST
├── database/          # Scripts de base de datos
├── docs/             # Documentación
└── .github/          # Configuración GitHub
    └── ISSUE_TEMPLATE/
```

## Cronograma de Desarrollo

- **Semana 1**: Análisis y arquitectura
- **Semana 2**: Estructura inicial, navegación y autenticación
- **Semana 3**: Gestión de planes, plantillas y carrito
- **Semana 4**: Módulo de invitaciones y proceso
- **Semana 5**: Confirmaciones, Google Sheets y responsividad
- **Semana 6**: Panel administrativo y módulo de reclamaciones
- **Semana 7**: Integración, pruebas y despliegue

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/[tu-usuario]/invitaciones-web.git
cd invitaciones-web

# Backend - Flask
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend - Next.js
cd ../frontend
npm install
# o con yarn
yarn install
```

## Configuración

Crear archivo `backend/.env` basado en `backend/.env.example` con las siguientes variables:

```bash
# Copiar archivo de ejemplo
cp backend/.env.example backend/.env

# Luego editar backend/.env con tus credenciales reales
```

Variables principales a configurar:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/invitaciones_web
JWT_SECRET=tu_clave_secreta_super_segura
IZIPAY_API_KEY=tu_api_key_de_izipay
GOOGLE_SHEETS_API_KEY=tu_google_sheets_api_key
GOOGLE_MAPS_API_KEY=tu_google_maps_api_key
WHATSAPP_API_TOKEN=tu_whatsapp_business_api_token
```

## Licencia

Proyecto privado - Todos los derechos reservados