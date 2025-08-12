# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack digital wedding invitation platform with two main service tiers (Standard and Exclusive plans). The architecture consists of a Flask backend API and a Next.js frontend.

### Business Model
- **Standard Plan (S/ 290)**: Pre-designed templates, basic features
- **Exclusive Plan (S/ 690)**: Custom designs, personalized invitations, advanced features

## Technology Stack

### Backend (Flask)
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: MySQL (configured for production PostgreSQL)
- **Authentication**: Flask-JWT-Extended with access/refresh token pattern
- **Payment Integration**: Izipay payment gateway
- **Extensions**: Flask-CORS, Flask-Migrate, Flask-Marshmallow

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: Zustand + React Query
- **Payment UI**: Lyracom Embedded Form Glue for Izipay integration

## Development Commands

### Backend Commands
```bash
# Navigate to backend
cd backend

# Virtual environment setup
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Database initialization
python init_db.py

# Run development server
python app.py
# Or with environment variables:
FLASK_DEBUG=true FLASK_PORT=5000 python app.py

# Database migrations
flask db init
flask db migrate -m "Description"
flask db upgrade
```

### Frontend Commands
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Core Architecture Patterns

### Backend Architecture
- **Centralized Extensions**: All Flask extensions initialized in `extensions.py` to avoid circular imports
- **Blueprint Organization**: API endpoints organized by feature in `/api` directory
- **Model Structure**: SQLAlchemy models in `/models` with relationship mappings
- **JWT Pattern**: Access tokens (15min) + refresh tokens (7 days) with automatic rotation

### Frontend Architecture
- **API Client**: Centralized axios instance in `lib/api.ts` with interceptors for auth token management
- **Store Pattern**: Zustand for client state, React Query for server state
- **Component Structure**: 
  - `/components/ui`: Reusable UI components (Shadcn/ui based)
  - `/components/auth`: Authentication-related components
  - `/components/admin`: Admin panel components
- **Route Organization**: App Router with nested layouts and protected routes

### Authentication Flow
1. Login returns access_token + refresh_token
2. API client automatically adds Authorization header
3. On 401 response, automatically attempts token refresh
4. On refresh failure, redirects to login and clears storage

### Payment Integration (Izipay)
- **Backend**: Creates payment tokens via Izipay API in `/api/payments.py`
- **Frontend**: Uses `@lyracom/embedded-form-glue` for secure payment forms
- **Flow**: Cart → Order → Payment Token → Izipay Checkout → Webhook → Order Status Update

## Key File Locations

### Configuration
- `backend/.env`: Environment variables (database, API keys, JWT secret)
- `backend/app.py`: Main Flask application factory
- `backend/extensions.py`: Centralized extension configuration
- `frontend/src/lib/api.ts`: API client and type definitions

### Models & Database
- `backend/models/`: SQLAlchemy models for all entities
- `backend/migrations/`: Database migration files
- Key models: User, Order, Invitation, Template, Coupon, InvitationURL

### API Endpoints
- `backend/api/auth.py`: Authentication (login, register, profile)
- `backend/api/payments.py`: Izipay payment integration
- `backend/api/orders.py`: Order management
- `backend/api/invitations.py`: Invitation CRUD operations
- `backend/api/cart.py`: Shopping cart functionality
- `backend/api/coupons.py`: Discount coupon system

### Frontend Pages
- `frontend/src/app/`: Next.js App Router pages
- Key pages: `/checkout`, `/mi-cuenta`, `/plantillas`, `/invitacion/[id]`
- `frontend/src/components/ui/izipay-checkout.tsx`: Payment form component

## Environment Setup

### Required Environment Variables
```bash
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=invitaciones_web
DB_PORT=3306

# Security
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret

# Payment Gateway
IZIPAY_API_KEY=your-izipay-key
IZIPAY_PUBLIC_KEY=your-public-key
IZIPAY_MERCHANT_CODE=your-merchant-code

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin User
ADMIN_EMAIL=admin@invitaciones.com
ADMIN_PASSWORD=admin123
```

### Development Database Setup
1. Create MySQL database: `invitaciones_web`
2. Run `python backend/init_db.py` to create tables and admin user
3. Database will auto-create on first Flask run if properly configured

## Testing & Quality

### Backend Testing
- Test file: `backend/test_api.py`
- Run tests: `python -m pytest test_api.py -v`

### Frontend TypeScript
- Strict TypeScript configuration in `tsconfig.json`
- Type definitions in `frontend/src/types/`
- API types defined in `frontend/src/lib/api.ts`

## Common Development Tasks

### Adding New API Endpoints
1. Create/update model in `backend/models/`
2. Add API routes in appropriate `backend/api/` file
3. Update frontend types in `frontend/src/lib/api.ts`
4. Add API methods to relevant API object (e.g., `ordersApi`, `authApi`)

### Database Changes
1. Modify model in `backend/models/`
2. Run `flask db migrate -m "Description"`
3. Review generated migration in `backend/migrations/versions/`
4. Run `flask db upgrade`

### Payment Flow Debugging
- Backend logs payment requests in `/api/payments.py`
- Frontend payment component in `components/ui/izipay-checkout.tsx`
- Check Izipay dashboard for transaction status
- Webhook endpoint: `/api/payments/webhook` (configured in Izipay dashboard)

## Known Issues & Workarounds

### CORS Configuration
- Backend CORS configured for `http://localhost:3000` by default
- Update `CORS_ORIGIN` in `.env` for different frontend URLs
- Supports credentials for cookie-based auth if needed

### JWT Token Management
- Access tokens expire in 15 minutes
- Refresh happens automatically via API interceptors
- Manual refresh available via `authStore.refreshTokens()`

### Payment Integration
- Izipay requires specific public key format
- V4 SDK used for embedded forms
- Redirect flow available as fallback in `frontend/src/app/izipay/retorno/page.tsx`

## Support & Documentation

- **Izipay Integration**: MCP servers available for `izipay-pe` repositories
- **Database Migrations**: Flask-Migrate documentation
- **Frontend Components**: Shadcn/ui documentation
- **Payment Testing**: Use Izipay sandbox credentials and test cards