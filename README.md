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

## Stack Tecnológico

### Frontend
- Framework SPA (React/Vue/Angular)
- Internacionalización (ES/EN)
- Diseño responsive
- Integración con WhatsApp API

### Backend
- API REST
- Autenticación JWT
- Base de datos relacional
- Integración con pasarela de pagos (Izipay)
- Integración con Google Sheets API
- Integración con Google Maps API
- Gestión de archivos multimedia

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

# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias del backend
cd ../backend
npm install
```

## Configuración

Crear archivo `.env` con las siguientes variables:

```
DATABASE_URL=
JWT_SECRET=
IZIPAY_API_KEY=
GOOGLE_SHEETS_API_KEY=
GOOGLE_MAPS_API_KEY=
WHATSAPP_API_TOKEN=
```

## Licencia

Proyecto privado - Todos los derechos reservados