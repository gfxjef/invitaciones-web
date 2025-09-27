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

## Documentation Requirements for New Sections

### MANDATORY: Documentation Protocol for New Template Sections

When creating or modifying sections in the template system, the following documentation requirements MUST be followed:

#### 1. Integration Guide Updates
**File**: `docs/secciones/GUIA_REGISTRO_NUEVAS_SECCIONES.md`

When working with new sections or encountering issues, you MUST update this guide with:
- Problems encountered and their solutions
- Integration improvements discovered
- Better implementation practices
- Common pitfalls and how to avoid them
- Examples of successful integrations

#### 2. Category-Specific Section Documentation
**Location**: `docs/secciones/Secciones_{category}.md`

When creating new variables or fields in section components, you MUST:
1. **Identify the category** (weddings, kids, corporate, etc.)
2. **Update the corresponding documentation file**:
   - `docs/secciones/Secciones_wedding.md` for wedding sections
   - `docs/secciones/Secciones_kids.md` for kids sections
   - `docs/secciones/Secciones_corporate.md` for corporate sections
   - Create new files as needed for new categories

Each section documentation must include:
- **Section name and variant** (e.g., Hero1, Gallery2)
- **Complete list of variables/props** with types
- **Default values** for each field
- **Field descriptions** and usage
- **Integration notes** specific to that section
- **Examples** of customizer configuration

#### 3. Documentation Update Workflow

```bash
# When creating a new section variant
1. Create the component in: frontend/src/components/templates/categories/{category}/sections/{type}/{Variant}.tsx
2. Update integration guide: docs/secciones/GUIA_REGISTRO_NUEVAS_SECCIONES.md
3. Update category docs: docs/secciones/Secciones_{category}.md

# When modifying existing sections
1. Make changes to component
2. Update category documentation with new/modified variables
3. If integration issues found, update the guide

# Documentation structure example:
docs/
└── secciones/
    ├── GUIA_REGISTRO_NUEVAS_SECCIONES.md    # Integration problems & solutions
    ├── Secciones_wedding.md                  # Wedding category variables
    ├── Secciones_kids.md                      # Kids category variables
    └── Secciones_corporate.md                # Corporate category variables
```

#### 4. Required Documentation Format

**For GUIA_REGISTRO_NUEVAS_SECCIONES.md**:
```markdown
## [Section Type] - [Problem/Improvement]
### Issue Description
- What was the problem or improvement needed

### Solution
- Step-by-step solution implemented
- Code examples if applicable

### Files Modified
- List of files changed

### Lessons Learned
- What to watch out for in future implementations
```

**For Secciones_{category}.md**:
```markdown
## [Section Name] (e.g., Hero1)
### Variables/Props
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| field1   | string | "default" | Field description |

### Customizer Integration
- Field mapping configuration
- Special considerations

### Usage Example
```typescript
// Component usage example
```
```

### Why This Documentation is Critical

1. **Knowledge Preservation**: Captures implementation details and solutions
2. **Team Collaboration**: Enables multiple developers to work efficiently
3. **Troubleshooting**: Quick reference for common issues and solutions
4. **Consistency**: Ensures all sections follow same standards
5. **Onboarding**: Helps new developers understand the system quickly

### Documentation Compliance

- ❌ **NEVER** create sections without updating documentation
- ❌ **NEVER** modify variables without documenting changes
- ✅ **ALWAYS** update both the guide and category docs
- ✅ **ALWAYS** include examples and default values
- ✅ **ALWAYS** document integration issues and solutions

This documentation requirement is NON-NEGOTIABLE and must be followed for every section-related task.

## PDF Generation Compatibility Guidelines

### CRITICAL: PDF-Compatible Section Development

The platform includes a backend PDF generation service using Playwright that automatically hides navigation and interactive elements. When developing new sections, follow these guidelines to ensure PDF compatibility:

#### 1. Elements AUTOMATICALLY Hidden in PDF

The backend PDF service (`backend/services/pdf_service/pdf_generator.py`) automatically injects CSS to hide these elements:

```css
/* Navigation elements */
.pdf-mode nav, header nav, .navigation, [data-navigation]

/* Fixed/floating elements */
.pdf-mode .fixed, .sticky, [class*="fixed"], [class*="sticky"]

/* Interactive controls */
.pdf-mode button[class*="fixed"], .scroll-to-top, .back-to-top

/* Pagination controls */
.pdf-mode .pagination, button[aria-label*="Página"],
.pdf-mode button[aria-label*="anterior"], button[aria-label*="siguiente"]
.pdf-mode button[class*="w-8"][class*="h-8"][class*="rounded-full"]  /* Arrow buttons */
.pdf-mode button[class*="w-2"][class*="h-2"][class*="rounded-full"]  /* Dot indicators */
.pdf-mode .lucide-chevron-left, .lucide-chevron-right

/* Overlays and high z-index elements */
.pdf-mode [class*="z-50"], [class*="z-40"]

/* Demo/admin elements */
.pdf-mode .demo-notice, .customizer-button, .auth-debugger
```

#### 2. Elements to AVOID in New Sections

**❌ PROHIBITED Elements** (will be automatically hidden):

- **Fixed/sticky positioned elements**
  ```tsx
  // ❌ AVOID - Will be hidden in PDF
  <div className="fixed bottom-4 right-4">...</div>
  <div className="sticky top-0">...</div>
  ```

- **Navigation menus and pagination**
  ```tsx
  // ❌ AVOID - Will be hidden in PDF
  <nav className="...">...</nav>
  <div className="pagination">...</div>
  <button aria-label="Página anterior">...</button>
  ```

- **Interactive scroll controls**
  ```tsx
  // ❌ AVOID - Will be hidden in PDF
  <button className="scroll-to-top">↑</button>
  <div className="back-to-top">...</div>
  ```

- **Floating action buttons**
  ```tsx
  // ❌ AVOID - Will be hidden in PDF
  <button className="fixed bottom-6 right-6 z-50">...</button>
  ```

#### 3. Elements ALLOWED and Recommended

**✅ RECOMMENDED Elements** (PDF-compatible):

- **Static content sections**
  ```tsx
  // ✅ GOOD - Will appear in PDF
  <section className="py-8">
    <h2>Section Title</h2>
    <p>Content text...</p>
  </section>
  ```

- **Images and media**
  ```tsx
  // ✅ GOOD - Will appear in PDF
  <img src="..." alt="..." className="w-full h-auto" />
  ```

- **Call-to-action buttons (non-floating)**
  ```tsx
  // ✅ GOOD - Will appear in PDF
  <button className="bg-blue-500 px-4 py-2 text-white">
    RSVP
  </button>
  ```

- **Content with responsive layout**
  ```tsx
  // ✅ GOOD - Will appear in PDF
  <div className="grid md:grid-cols-2 gap-4">...</div>
  ```

#### 4. PDF Mode Detection

For advanced cases, sections can detect PDF mode and adapt accordingly:

```tsx
const isPDF = useMemo(() => {
  if (typeof window === 'undefined') return false;
  return window.location.search.includes('pdf=1') ||
         document.documentElement.classList.contains('pdf-mode');
}, []);

// Conditional rendering for PDF
{!isPDF && (
  <nav className="navigation">...</nav> // Only show in web
)}

// Conditional styling for PDF
<div className={isPDF ? "min-h-[812px]" : "min-h-screen"}>
```

#### 5. Section Development Checklist

When creating new sections, verify:

- ✅ **No fixed/sticky positioning**
- ✅ **No pagination controls**
- ✅ **No floating navigation**
- ✅ **Content flows naturally top-to-bottom**
- ✅ **Images use proper responsive classes**
- ✅ **Text and buttons are readable without interaction**

#### 6. Testing PDF Compatibility

Test new sections with PDF generation:

```bash
# Test PDF generation from backend
cd backend
python test_improved_pdf_simple.py

# Verify specific elements are hidden
python test_pagination_hidden.py
python test_hero_footer_hidden.py
```

#### 7. CSS Best Practices for PDF

```css
/* ✅ GOOD - PDF compatible */
.section-content {
  padding: 2rem;
  margin-bottom: 1rem;
}

/* ❌ AVOID - Will cause PDF issues */
.floating-element {
  position: fixed;
  bottom: 0;
  z-index: 9999;
}
```

### PDF Generation Architecture

- **Backend Service**: `backend/services/pdf_service/pdf_generator.py`
- **Frontend API**: `frontend/src/lib/api.ts` (`exportToPDF`)
- **Download Component**: `frontend/src/components/auth/DownloadButton.tsx`
- **PDF Quality Presets**: Draft, Standard, High, Premium
- **Device Profiles**: Mobile, tablet, desktop viewports
- **Automatic Element Hiding**: CSS injection system

Following these guidelines ensures that new sections work seamlessly in both web and PDF formats without requiring manual intervention or breaking the PDF generation process.