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

## Agent Task Documentation

### IMPORTANT: Post-Task Documentation Requirement
When using specialized agents (Task tool), they MUST update a file called `ultima_modificacion.md` at the end of their work. This file should be created/updated in the main project directory (same location as CLAUDE.md and README.md).

The file must contain:
- Date and time of the changes
- Detailed summary of all modifications made
- List of files created, modified, or deleted
- Any important notes or considerations for future development
- Agent type that performed the work

This documentation is CRITICAL for tracking changes and maintaining project history.

## Development Server Policy

### IMPORTANT: Do NOT Run Frontend or Backend Servers
- **DO NOT** execute `npm run dev`, `python app.py`, or any server startup commands
- **DO NOT** start development servers automatically
- The user will ALWAYS have both frontend and backend servers running manually
- This prevents port conflicts and background processes

### Testing and Development
- If testing is required, ASK the user first before running any server commands
- User maintains control of all running services
- Focus on code modifications, not server management

## Agent Usage Policy

### MANDATORY: Always Use Specialized Agents
- **ALWAYS** analyze the task and determine which agent from `.claude/agents/` should handle it
- **NEVER** work directly on frontend or backend tasks without using the appropriate agent
- Available agents in the project:
  - `flask-enterprise-backend`: For all Flask backend development, APIs, database, security
  - `frontend-technical-auditor`: For Next.js frontend verification, testing, debugging
  - `flask-security-architect`: For backend security and architecture
  - `github-operations-manager`: For Git/GitHub operations
  - `project-issue-generator`: For breaking down projects into actionable tasks
  - `seo-optimization-specialist`: For SEO improvements

### Agent Selection Rules
- **Backend tasks** (Flask, APIs, database, authentication): Use `flask-enterprise-backend`
- **Frontend tasks** (Next.js, React, components, UI): Use `frontend-technical-auditor`
- **Security/Architecture**: Use `flask-security-architect`
- **Git operations**: Use `github-operations-manager`
- **Project planning**: Use `project-issue-generator`

### NEVER work without agents on:
- API endpoint modifications
- Component development or fixes
- Database changes
- Authentication/authorization
- Security implementations
- Performance optimizations
- Testing and debugging

## Project Context Requirement

### MANDATORY: Always Read ultima_modificacion.md
- **BEFORE** starting any task, ALWAYS read `ultima_modificacion.md` to understand recent changes
- This file contains the complete history of the last modifications made to the project
- Understanding recent changes is CRITICAL for:
  - Avoiding conflicts with existing implementations
  - Building upon previous work correctly
  - Maintaining consistency with recent architectural decisions
  - Understanding the current state of components and systems

### Context Integration Workflow
1. **First Step**: Read `ultima_modificacion.md` to understand recent project state
2. **Analysis**: Identify how the new task relates to recent changes
3. **Agent Selection**: Choose appropriate agent based on task type and recent context
4. **Implementation**: Execute with full awareness of recent modifications
5. **Documentation Update**: Ensure `ultima_modificacion.md` is updated after completion

### Why This Matters
- Prevents overwriting recent improvements
- Maintains architectural consistency
- Avoids duplicate implementations
- Ensures continuity between development sessions
- Preserves context across different agents and tasks

---

## Creating New Template Sections/Variants

This guide explains how to add new section variants (e.g., Hero2, Welcome3, etc.) to the modular template system while maintaining compatibility with the existing architecture.

### Architecture Overview

The system uses a **superset field mapping** approach where:
- Each section type (hero, welcome, couple, etc.) can have multiple variants
- All possible fields from all variants are listed in `sectionFieldsMap.ts`
- The customizer shows only relevant fields based on the active component
- Components use their own `DefaultProps` as single source of truth

### Step-by-Step Guide

#### 1. Create the New Component

**Location**: `frontend/src/components/templates/sections/{section_type}/{VariantName}.tsx`

```typescript
// Example: frontend/src/components/templates/sections/hero/Hero2.tsx

interface Hero2Props {
  // Common fields (shared with Hero1)
  coupleNames?: string;
  eventDate?: string;
  eventLocation?: string;

  // New fields specific to Hero2
  heroBackgroundVideo?: string;
  heroSubtitle?: string;
  heroAnimation?: 'fade' | 'slide' | 'zoom';
  heroOverlayOpacity?: number;
}

export const Hero2: React.FC<Hero2Props> = ({
  coupleNames = Hero2DefaultProps.coupleNames,
  eventDate = Hero2DefaultProps.eventDate,
  eventLocation = Hero2DefaultProps.eventLocation,
  heroBackgroundVideo = Hero2DefaultProps.heroBackgroundVideo,
  heroSubtitle = Hero2DefaultProps.heroSubtitle,
  heroAnimation = Hero2DefaultProps.heroAnimation,
  heroOverlayOpacity = Hero2DefaultProps.heroOverlayOpacity,
}) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: heroOverlayOpacity }}
      >
        <source src={heroBackgroundVideo} type="video/mp4" />
      </video>

      {/* Content with animation */}
      <div className={`relative z-10 text-center text-white animate-${heroAnimation}`}>
        <h1 className="text-6xl font-great-vibes mb-4">{coupleNames}</h1>
        <h2 className="text-2xl font-montserrat mb-2">{heroSubtitle}</h2>
        <p className="text-xl">{eventDate}</p>
        <p className="text-lg">{eventLocation}</p>
      </div>
    </section>
  );
};

// CRITICAL: Export default props for single source of truth
export const Hero2DefaultProps = {
  coupleNames: 'Jefferson & Rosmery',
  eventDate: '15 December, 2024',
  eventLocation: 'LIMA - PERÚ',
  heroBackgroundVideo: 'https://example.com/wedding-video.mp4',
  heroSubtitle: 'Nuestra Historia de Amor',
  heroAnimation: 'fade' as const,
  heroOverlayOpacity: 0.7,
};
```

#### 2. Register Component in Section Registry

**File**: `frontend/src/components/templates/sections/{section_type}/registry.ts`

```typescript
// Example: frontend/src/components/templates/sections/hero/registry.ts

import { Hero1 } from './Hero1';
import { Hero2 } from './Hero2';

export const heroComponents = {
  hero_1: Hero1,
  hero_2: Hero2,  // ← Add new variant
};
```

**File**: `frontend/src/components/templates/sections/registry.ts`

```typescript
// Update main registry
import { heroComponents } from './hero/registry';

export const sectionRegistry = {
  ...heroComponents,
  // ... other sections
};

export function getSectionComponent(key: string) {
  return sectionRegistry[key];
}
```

#### 3. Update Field Mapping (Superset Approach)

**File**: `frontend/src/components/customizer/sectionFieldsMap.ts`

```typescript
// Add ALL possible fields from ALL variants to the section
export const SECTION_FIELDS_MAP: Record<string, SectionConfig> = {
  hero: {
    label: 'Portada',
    icon: '🎭',
    fields: [
      // Common fields (Hero1 ✅, Hero2 ✅)
      'coupleNames',
      'eventDate',
      'eventLocation',

      // Hero1 specific (Hero1 ✅, Hero2 ❌)
      'heroImageUrl',

      // Hero2 specific (Hero1 ❌, Hero2 ✅)
      'heroBackgroundVideo',
      'heroSubtitle',
      'heroAnimation',
      'heroOverlayOpacity',
    ]
  },
  // ... other sections
};

// Add field definitions for new fields
export const FIELD_DEFINITIONS: Record<string, CustomizerField> = {
  // ... existing fields

  // New Hero2 fields
  heroBackgroundVideo: {
    key: 'heroBackgroundVideo',
    label: 'Video de Fondo',
    type: 'url',
    section: 'hero',
    category: 'Multimedia'
  },

  heroSubtitle: {
    key: 'heroSubtitle',
    label: 'Subtítulo',
    type: 'text',
    section: 'hero',
    category: 'Texto'
  },

  heroAnimation: {
    key: 'heroAnimation',
    label: 'Tipo de Animación',
    type: 'select',
    options: [
      { value: 'fade', label: 'Desvanecimiento' },
      { value: 'slide', label: 'Deslizamiento' },
      { value: 'zoom', label: 'Zoom' }
    ],
    section: 'hero',
    category: 'Efectos'
  },

  heroOverlayOpacity: {
    key: 'heroOverlayOpacity',
    label: 'Opacidad del Overlay',
    type: 'range',
    min: 0,
    max: 1,
    step: 0.1,
    section: 'hero',
    category: 'Efectos'
  },
};
```

#### 4. Update Customizer Data Transformation

**File**: `frontend/src/lib/hooks/useDynamicCustomizer.ts`

```typescript
// Add new fields to the switch statement for default values
switch (field.key) {
  // ... existing cases

  // New Hero2 fields
  case 'heroBackgroundVideo':
    defaultValue = templateProps.hero?.heroBackgroundVideo || Hero2DefaultProps.heroBackgroundVideo;
    break;

  case 'heroSubtitle':
    defaultValue = templateProps.hero?.heroSubtitle || Hero2DefaultProps.heroSubtitle;
    break;

  case 'heroAnimation':
    defaultValue = templateProps.hero?.heroAnimation || Hero2DefaultProps.heroAnimation;
    break;

  case 'heroOverlayOpacity':
    defaultValue = templateProps.hero?.heroOverlayOpacity || Hero2DefaultProps.heroOverlayOpacity;
    break;
}

// Update transform function to handle new fields
const transformToTemplateProps = useCallback((data: any) => {
  return {
    hero: {
      // Common fields
      coupleNames: data.coupleNames || Hero1DefaultProps.coupleNames,
      eventDate: data.eventDate || (data.event_date ? new Date(data.event_date).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      }) : Hero1DefaultProps.eventDate),
      eventLocation: data.eventLocation || data.event_venue_city || Hero1DefaultProps.eventLocation,

      // Hero1 specific
      heroImageUrl: data.heroImageUrl || data.gallery_hero_image || Hero1DefaultProps.heroImageUrl,

      // Hero2 specific - import Hero2DefaultProps
      heroBackgroundVideo: data.heroBackgroundVideo || Hero2DefaultProps.heroBackgroundVideo,
      heroSubtitle: data.heroSubtitle || Hero2DefaultProps.heroSubtitle,
      heroAnimation: data.heroAnimation || Hero2DefaultProps.heroAnimation,
      heroOverlayOpacity: data.heroOverlayOpacity || Hero2DefaultProps.heroOverlayOpacity,
    },
    // ... other sections
  };
}, []);
```

#### 5. Update Database Template Configuration

**Database**: Update the `sections_config` for templates that should use the new variant

```sql
-- Example: Update Template ID 7 to use Hero2
UPDATE templates
SET sections_config = JSON_SET(
  sections_config,
  '$.hero',
  'hero_2'
)
WHERE id = 7;
```

Or via API/Admin interface:
```json
{
  "hero": "hero_2",
  "welcome": "welcome_1",
  "story": "story_1",
  // ... other sections
}
```

### Field Types and Validation

The system supports various field types:

```typescript
type FieldType =
  | 'text'           // Simple text input
  | 'textarea'       // Multi-line text
  | 'url'            // URL input with validation
  | 'date'           // Date picker
  | 'datetime-local' // Date and time picker
  | 'color'          // Color picker
  | 'range'          // Slider input
  | 'select'         // Dropdown selection
  | 'checkbox'       // Boolean checkbox
  | 'number'         // Numeric input
  | 'email'          // Email input with validation
  | 'tel'            // Phone number input
```

### Best Practices

#### 1. **Naming Conventions**
- Component files: `{SectionType}{Number}.tsx` (e.g., `Hero2.tsx`, `Welcome3.tsx`)
- Component names: `{SectionType}{Number}` (e.g., `Hero2`, `Welcome3`)
- Field keys: `{sectionType}{FieldName}` for unique fields (e.g., `heroBackgroundVideo`)
- Use common field names for shared functionality (e.g., `coupleNames`, `eventDate`)

#### 2. **Default Props Pattern**
```typescript
// Always export default props with same name pattern
export const {ComponentName}DefaultProps = {
  // All component props with realistic default values
  field1: 'Default value 1',
  field2: 'Default value 2',
};

// Use default props in component parameters
export const {ComponentName}: React.FC<{ComponentName}Props> = ({
  field1 = {ComponentName}DefaultProps.field1,
  field2 = {ComponentName}DefaultProps.field2,
}) => { ... };
```

#### 3. **Field Organization**
- Group related fields in same category
- Use descriptive labels in Spanish for user interface
- Add validation constraints (min, max, pattern) when appropriate
- Provide meaningful placeholder text or examples

#### 4. **Backward Compatibility**
- Always test that existing templates still work
- Use conditional rendering for optional new features
- Provide sensible defaults for all new fields
- Consider gradual rollout for breaking changes

### Testing New Variants

#### 1. **Component Testing**
```bash
# Test component renders without errors
npm run dev
# Navigate to template with new variant
# Open customizer panel
# Verify all fields appear and function correctly
```

#### 2. **Field Validation**
- Test all field types render correctly
- Verify default values load properly
- Check that changes persist across panel close/open
- Ensure no conflicts with other section fields

#### 3. **Data Flow Testing**
- Verify customizer changes reflect in template preview
- Test that saved data persists across page reloads
- Check API endpoints handle new fields correctly
- Validate default fallbacks work when data is missing

### Common Gotchas

1. **Missing Default Props**: Always export and use default props to prevent undefined values
2. **Field Name Conflicts**: Use prefixed field names for section-specific fields
3. **Registry Updates**: Don't forget to register new components in both local and main registries
4. **Import Statements**: Update import statements in customizer hook for new default props
5. **Type Safety**: Keep TypeScript interfaces in sync with actual component props

### Example: Complete Hero2 Implementation

See the files structure for a complete Hero2 implementation:
```
frontend/src/components/templates/sections/hero/
├── Hero1.tsx                    # Original variant
├── Hero2.tsx                    # New variant (created)
├── registry.ts                  # Updated with Hero2
└── index.ts                     # Re-exports

frontend/src/components/customizer/
└── sectionFieldsMap.ts          # Updated with Hero2 fields

frontend/src/lib/hooks/
└── useDynamicCustomizer.ts      # Updated data transformation
```

This approach ensures that:
- ✅ New variants are fully integrated with the customizer system
- ✅ Field uniqueness is maintained across sections
- ✅ Single source of truth principle is preserved
- ✅ Backward compatibility is maintained
- ✅ The system scales infinitely with new variants