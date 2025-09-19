# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Digital wedding invitation platform with Flask backend and Next.js frontend, offering Standard (S/ 290) and Exclusive (S/ 690) service tiers with pre-designed templates and custom designs respectively.

## Development Commands

### Backend
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# Database setup
python init_db.py  # Creates tables and admin user

# Run server
python app.py
# Or with environment variables:
FLASK_DEBUG=true FLASK_PORT=5000 python app.py

# Database migrations
flask db init
flask db migrate -m "Description"
flask db upgrade

# Run tests
python test_api.py  # Quick API verification
python test_complete.py  # Full system test
python test_invitation_editor.py  # Editor endpoints test
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Development server
npm run build  # Production build
npm start  # Production server
npm run lint  # Linting
```

## Architecture

### Backend
- **Extensions Management**: All Flask extensions initialized in `backend/extensions.py` to prevent circular imports
- **API Organization**: Blueprint-based endpoints in `backend/api/` directory (auth, payments, orders, invitations, cart, coupons, invitation_editor)
- **Models**: SQLAlchemy models in `backend/models/` with relationships (User, Order, Invitation, Template, InvitationData, InvitationMedia, InvitationEvent)
- **Authentication**: JWT with access (15min) and refresh (7 days) tokens using Flask-JWT-Extended
- **File Storage**: FTP integration via `backend/utils/ftp_manager.py` for media uploads to kossomet.com
- **Payment Gateway**: Izipay integration in `backend/api/payments.py` with webhook handling

### Frontend
- **API Client**: Centralized axios instance in `frontend/src/lib/api.ts` with automatic token refresh interceptors
- **State Management**: Zustand for client state (`frontend/src/store/`), React Query for server state
- **Component Organization**:
  - `frontend/src/components/ui/`: Reusable Shadcn/ui components
  - `frontend/src/components/editor/`: Invitation editor with auto-save and validation
  - `frontend/src/components/auth/`: Authentication components
  - `frontend/src/components/admin/`: Admin panel
- **Custom Hooks** (`frontend/src/lib/hooks/`):
  - `useInvitationEditor`: Main editor state with validation
  - `useAutoSave`: Debounced auto-saving with retry logic
  - `useFileUpload`: File uploads with progress tracking
  - `useAuth`: Authentication state management
- **Performance**: Extensive use of `useMemo` and `useCallback` to prevent render loops in editor components

### Authentication Flow
1. Login endpoint returns `access_token` and `refresh_token`
2. API client adds `Authorization: Bearer {token}` header automatically
3. On 401 response, interceptor attempts token refresh
4. On refresh failure, redirects to login

### Payment Integration (Izipay)
- Backend creates payment tokens via Izipay API
- Frontend uses `@lyracom/embedded-form-glue` for secure payment forms
- Webhook endpoint at `/api/payments/webhook` for status updates
- Fallback redirect flow at `frontend/src/app/izipay/retorno/page.tsx`

## Environment Variables

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

# Payment
IZIPAY_USERNAME=your-username
IZIPAY_PASSWORD=your-password
IZIPAY_PUBLIC_KEY=your-public-key
IZIPAY_HMACSHA256=your-hmac-key
IZIPAY_MODE=SANDBOX

# FTP (Media uploads)
FTP_HOST=ftp.kossomet.com
FTP_USER=marketing@kossomet.com
FTP_PASS=your-password

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Admin
ADMIN_EMAIL=admin@invitaciones.com
ADMIN_PASSWORD=admin123
```

## Key Files

### Configuration
- `backend/.env`: Environment variables
- `backend/app.py`: Flask application factory
- `backend/extensions.py`: Centralized extension initialization
- `frontend/src/lib/api.ts`: API client and TypeScript types

### Database & Models
- `backend/models/`: SQLAlchemy models
- `backend/migrations/`: Alembic migration files
- `backend/init_db.py`: Database initialization script

### API Endpoints
- `backend/api/auth.py`: Authentication (login, register, refresh, profile)
- `backend/api/payments.py`: Izipay payment processing
- `backend/api/orders.py`: Order management
- `backend/api/invitations.py`: Invitation CRUD
- `backend/api/invitation_editor.py`: 15+ editor endpoints (data, media, events, publishing)
- `backend/api/cart.py`: Shopping cart
- `backend/api/coupons.py`: Discount system

### Frontend Pages
- `frontend/src/app/`: Next.js App Router pages
- `frontend/src/app/invitacion/[id]/edit/`: Invitation editor
- `frontend/src/app/checkout/`: Payment flow
- `frontend/src/app/mi-cuenta/`: User dashboard

### Invitation Editor Components
- `frontend/src/components/editor/InvitationEditor.tsx`: Main editor orchestrator
- `frontend/src/components/editor/upload/`: File upload components
- `frontend/src/components/editor/gallery/`: Image gallery management
- `frontend/src/components/editor/schedule/`: Event timeline management

## Testing

### Backend Tests
- `test_api.py`: Core API functionality
- `test_invitation_editor.py`: Editor endpoints
- `test_ftp_system.py`: FTP integration
- `test_complete.py`: End-to-end testing
- Run: `python test_api.py` or `python -m pytest test_api.py -v`

### Frontend TypeScript
- Strict mode enabled in `tsconfig.json`
- Type definitions in `frontend/src/types/`
- API types in `frontend/src/lib/api.ts`

## Common Workflows

### Adding API Endpoints
1. Create/update model in `backend/models/`
2. Add route in `backend/api/{feature}.py`
3. Update types in `frontend/src/lib/api.ts`
4. Add method to appropriate API object

### Database Changes
1. Modify model in `backend/models/`
2. Run `flask db migrate -m "Description"`
3. Review migration in `backend/migrations/versions/`
4. Run `flask db upgrade`

### Invitation Editor Workflow
1. User navigates to `/invitacion/[id]/edit`
2. Editor loads with auto-save and validation
3. Components use memoization to prevent re-renders
4. File uploads go through FTP to kossomet.com
5. Data validation per-section and overall
6. Publishing validates completeness

## Known Issues & Solutions

### CORS
- Frontend may run on port 3001 if 3000 is occupied
- Update `CORS_ORIGIN` in `.env` accordingly
- Supports multiple origins: `http://localhost:3000,http://localhost:3001`

### JWT Tokens
- Access tokens expire in 15 minutes
- Automatic refresh via API interceptors
- Manual refresh: `authStore.refreshTokens()`

### React Performance
- Use `useMemo` for expensive calculations
- Use `useCallback` for editor functions
- Handle file upload progress/errors properly
- Check session persistence between page navigations

### Payment Integration
- Izipay requires specific public key format
- Use sandbox credentials for testing
- Check webhook logs for payment status issues