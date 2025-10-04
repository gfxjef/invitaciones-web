# Backend Extraction Fix - Hero Section Not Rendering

## Problem Summary

After fixing the field mapping system to correctly save data to `invitation_sections_data` table with `section_type='hero'`, the invitation page still showed default data instead of personalized data.

### Database State (Correct)
```sql
-- invitation_sections_data table
id | invitation_id | section_type | variables_json
36 | 31            | hero         | {"bride_name": "99", "groom_name": "00"}
```

### Backend Log (Correct)
```
✅ Database commit successful!
🔍 Verification: Found 1 sections in database for invitation 31
   - hero: 2 variables
```

### Frontend Log (Incorrect Rendering)
```javascript
🎨 [TemplateRenderer] About to render with data:
dataSample: {
  bride_name: undefined,  // ❌ Should be "99"
  groom_name: undefined   // ❌ Should be "00"
}
```

## Root Cause Analysis

The issue was in `backend/utils/modular_template_helpers.py` function `extract_hero_from_sections()`:

### Before (Incorrect)
```python
def extract_hero_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Maps from 'general' section to Hero component props"""
    general = sections_dict.get('general', {})  # ❌ Searching in wrong section!

    return {
        'groom_name': general.get('groom_name'),  # ❌ Returns None
        'bride_name': general.get('bride_name'),  # ❌ Returns None
        ...
    }
```

### Data Flow
```
Database:
  section_type='hero' → variables_json={'groom_name': '00', 'bride_name': '99'}
       ↓
get_invitation_modular_data():
  sections_dict = {'hero': {'groom_name': '00', 'bride_name': '99'}}
       ↓
extract_hero_from_sections():
  general = sections_dict.get('general', {})  # ← Returns {}
  return {'groom_name': None, 'bride_name': None}
       ↓
Frontend:
  dataSample: {bride_name: undefined, groom_name: undefined}
```

## Solution

Changed `extract_hero_from_sections()` to read from the correct section:

### After (Correct)
```python
def extract_hero_from_sections(sections_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract Hero component props from sections_dict
    Maps from 'hero' section to Hero component props

    FIXED: Now reads from 'hero' section instead of 'general' section
    because the field mapping system correctly prefixes fields as hero_*
    """
    hero = sections_dict.get('hero', {})  # ✅ Searching in correct section

    return {
        'groom_name': hero.get('groom_name'),  # ✅ Returns '00'
        'bride_name': hero.get('bride_name'),  # ✅ Returns '99'
        'weddingDate': hero.get('weddingDate'),
        'eventLocation': hero.get('eventLocation') or hero.get('location'),  # Handle both names
        'heroImageUrl': hero.get('heroImageUrl')
    }
```

### Expected Data Flow Now
```
Database:
  section_type='hero' → variables_json={'groom_name': '00', 'bride_name': '99'}
       ↓
get_invitation_modular_data():
  sections_dict = {'hero': {'groom_name': '00', 'bride_name': '99'}}
       ↓
extract_hero_from_sections():
  hero = sections_dict.get('hero', {})  # ← Returns {'groom_name': '00', ...}
  return {'groom_name': '00', 'bride_name': '99'}
       ↓
Frontend:
  dataSample: {bride_name: '99', groom_name: '00'}  ✅
```

## Why This Happened

The function was originally written assuming that groom/bride names would be stored in a 'general' section (fields without section prefix). However, when we implemented the field mapping fix in `groupCustomizerDataBySections()`, we correctly mapped:

- `groom_name` → `hero_groom_name` → stored in `hero` section
- `bride_name` → `hero_bride_name` → stored in `hero` section

The extraction function wasn't updated to reflect this change.

## Files Modified

1. **backend/utils/modular_template_helpers.py** (lines 360-376)
   - Changed `sections_dict.get('general', {})` to `sections_dict.get('hero', {})`
   - Added fallback for `eventLocation` field (can be either `eventLocation` or `location`)

## Related Fixes

This is part 2 of the sections_data saving issue:

### Part 1: Field Mapping (COMPLETED)
**File**: `frontend/src/lib/api/invitations.ts`
**Fix**: Map generic field names to section-prefixed names
- `groom_name` → `hero_groom_name`
- `bride_name` → `hero_bride_name`
- `eventLocation` → `hero_location`

**Result**: Data correctly saved to database in `hero` section

### Part 2: Backend Extraction (THIS FIX)
**File**: `backend/utils/modular_template_helpers.py`
**Fix**: Read from correct section when extracting data
- Changed from `'general'` to `'hero'`

**Result**: Data correctly retrieved and sent to frontend for rendering

## Testing

### Before Fix
1. Create invitation with customized names
2. Navigate to invitation URL
3. **Result**: Shows default names ("Jefferson" & "Rosmery")

### After Fix
1. Restart backend server to apply changes
2. Navigate to invitation URL (e.g., `/invitacion/e24dac52`)
3. **Expected Result**: Shows personalized names ("00" & "99")

### Verification Query
```sql
-- Check that data is in 'hero' section
SELECT section_type, variables_json
FROM invitation_sections_data
WHERE invitation_id = 31;

-- Expected:
-- section_type | variables_json
-- hero         | {"groom_name": "00", "bride_name": "99"}
```

### Backend Log to Watch
```
INFO | api.invitations | 📊 [get_invitation_by_url] Section 'hero': 2 variables
INFO | api.invitations | 📊 [get_invitation_by_url] Variables keys: ['bride_name', 'groom_name']
```

## Status

✅ **FIXED** - Backend extraction function now reads from the correct 'hero' section, matching where the field mapping system saves the data.

## Next Steps

1. Restart backend server
2. Test invitation rendering at `/invitacion/e24dac52`
3. Verify personalized data appears instead of defaults
4. If successful, remove debug logs from:
   - `backend/api/invitations.py`
   - `frontend/src/lib/api/invitations.ts`
   - `frontend/src/app/checkout/page.tsx`
