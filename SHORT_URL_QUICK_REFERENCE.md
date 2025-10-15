# Short URL System - Quick Reference Card

## 🚀 Quick Start

### For Users
1. Go to `/mi-cuenta/invitaciones`
2. Click **"Copiar URL"** on any invitation
3. Choose **"Opción Premium"** (purple section)
4. Click **"Desbloquear"** to generate personalized URL
5. Click **"Copiar"** to copy the short URL

### For Developers

**Run Tests:**
```bash
cd backend
python test_short_urls.py
```

**Migrate Existing Data:**
```bash
cd backend
python migrate_short_urls.py
```

**Test Backend API:**
```bash
curl "http://localhost:5000/api/short-url/redirect?code=kkd&names=1111y333"
```

**Test Frontend:**
```
Visit: http://localhost:3000/kkd/1111y333
Should redirect to invitation
```

## 📝 URL Format

### Pattern
```
/{code}/{names}
```

### Examples
```
/kkd/1111y333          → Invitation with numbers
/tsk/RobertyCarlos     → Robert & Carlos wedding
/fdg/Ss                → Single name
/adg/Invitacion        → Default name
```

### Name Rules
- ✅ Letters and numbers: `Carlos123` → `Carlos123`
- ✅ Accents removed: `María` → `Maria`
- ✅ Spaces removed: `José Luis` → `Joseluis`
- ✅ Special chars removed: `O'Connor` → `Oconnor`
- ✅ Separator is `y`: `Carlos y María` → `CarlosyMaria`

## 🔧 Key Files

### Backend
```
models/invitation.py              - Database columns
utils/short_url_generator.py     - Core logic
api/short_urls.py                 - API endpoints
test_short_urls.py                - Test suite
migrate_short_urls.py             - Migration script
```

### Frontend
```
app/[code]/[names]/page.tsx                          - Dynamic route
components/account/invitations/ShareURLModal.tsx     - UI modal
lib/api/invitations.ts                               - API client
```

## 🎯 API Endpoints

### Generate Short URL
```http
POST /api/invitations/{id}/generate-short-url
Content-Type: application/json

{
  "custom_names": "CarlosyMaria"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "short_code": "w3d",
  "custom_names": "CarlosyMaria",
  "short_url": "w3d/CarlosyMaria"
}
```

### Get Existing Short URL
```http
GET /api/invitations/{id}/short-url
```

**Response:**
```json
{
  "exists": true,
  "short_code": "w3d",
  "custom_names": "CarlosyMaria",
  "short_url": "w3d/CarlosyMaria"
}
```

### Resolve Short URL
```http
GET /api/short-url/redirect?code=w3d&names=CarlosyMaria
```

**Response:**
```json
{
  "success": true,
  "url_slug": "abc123",
  "invitation_id": 60
}
```

## 🐛 Troubleshooting

### Issue: URL doesn't work
```bash
# Check backend health
curl http://localhost:5000/health

# Test specific URL
curl "http://localhost:5000/api/short-url/redirect?code=XXX&names=YYY"
```

### Issue: Need to update separator
```bash
cd backend
python migrate_short_urls.py
```

### Issue: Tests failing
```bash
# Check database connection
cd backend
python -c "from app import create_app; app = create_app(); print('OK')"

# Run tests
python test_short_urls.py
```

## ⚡ Performance

### Code Generation
- **3-char codes**: 46,656 combinations
- **4-char codes**: 1,679,616 combinations (fallback)
- **Collision handling**: Automatic retry with longer codes

### Database
- `short_code`: UNIQUE index
- `custom_names`: Indexed for fast lookups
- Case-insensitive queries with `LOWER()`

## 🔒 Security

### Validation
- Input sanitization prevents XSS
- Case-insensitive search prevents bypass
- 404 for invalid codes
- Random codes are unpredictable

### Privacy
- No invitation IDs exposed in URLs
- Short URLs don't reveal user info
- Transaction-safe generation

## 📊 Current URLs in Database

Run to see all short URLs:
```bash
cd backend
python migrate_short_urls.py
```

Example output:
```
ID: 58, Code: kkd, Names: 1111y333
   Full: http://localhost:3000/kkd/1111y333

ID: 61, Code: tsk, Names: RobertyCarlos
   Full: http://localhost:3000/tsk/RobertyCarlos
```

## ✅ Testing Checklist

- [ ] Backend API returns correct `url_slug`
- [ ] Frontend route redirects to invitation
- [ ] Case-insensitive matching works
- [ ] Preview changes on modal reopen
- [ ] "Desbloquear" saves to database
- [ ] Copy buttons work
- [ ] Names use `y` separator (not `&`)
- [ ] Migration updates old URLs

## 🎨 UI States

### ShareURLModal

**Before Unlock:**
```
[Preview URL with random code] [Desbloquear 🔓]
```

**While Generating:**
```
[Preview URL] [Generando... 🔒]
```

**After Unlock:**
```
[Real saved URL] [Copiar 📋]
```

**After Copy:**
```
[Real saved URL] [Copiado ✓]
```

## 📞 Support

**Documentation:**
- Full docs: `SHORT_URL_SYSTEM.md`
- This guide: `SHORT_URL_QUICK_REFERENCE.md`

**Commands:**
```bash
# Tests
cd backend && python test_short_urls.py

# Migration
cd backend && python migrate_short_urls.py

# Backend test
curl "http://localhost:5000/api/short-url/redirect?code=CODE&names=NAMES"

# Frontend test
# Visit: http://localhost:3000/CODE/NAMES
```

---

**Last Updated**: 2025-10-12
**Status**: ✅ Fully operational
**Tests**: All passing
**Migration**: Complete
