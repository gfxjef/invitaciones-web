# Field Mapping Fix - Post-Payment Invitation Data Loss

## Problem Summary

After successful payment, invitations were being created but displayed **default template data** instead of the personalized data from the customizer. The database showed 0 `InvitationSectionsData` records being created.

## Root Cause

The system had **two conflicting naming conventions**:

1. **Frontend Customizer**: Uses generic field names
   - `groom_name`, `bride_name`, `eventLocation`, `weddingDate`, `heroImageUrl`

2. **Backend sections_data**: Expects section-prefixed names
   - `hero_groom_name`, `hero_bride_name`, `hero_location`, `hero_date`, `hero_image`

The `groupCustomizerDataBySections()` function filtered fields by checking if they had section prefixes (e.g., `hero_`, `couple_`, etc.). Generic names without prefixes were grouped into a `general` section, which backend components don't use when rendering invitations.

### Data Flow Issue

```
localStorage (customizer)
└─ groom_name: "Carlos"
└─ bride_name: "María"
└─ eventLocation: "Lima"
   ↓
groupCustomizerDataBySections()
   ↓
sections_data: {
  general: {                    ← ❌ Wrong! Components don't use 'general'
    groom_name: "Carlos",
    bride_name: "María",
    eventLocation: "Lima"
  }
}
   ↓
Backend creates InvitationSectionsData
   ↓
section_type: "general"         ← ❌ Won't be used by Hero component
   ↓
Result: Invitation shows default data
```

## Solution

Added a **field mapping system** in `groupCustomizerDataBySections()` to convert generic field names to their proper section-prefixed equivalents:

### Files Modified

1. **frontend/src/lib/api/invitations.ts** (lines 62-70, 85-89)
2. **frontend/src/app/test-storage/page.tsx** (lines 81-88, 97-102)

### Field Mapping Implementation

```typescript
// Map generic field names to their proper section-prefixed equivalents
const fieldMapping: Record<string, string> = {
  'groom_name': 'hero_groom_name',
  'bride_name': 'hero_bride_name',
  'eventLocation': 'hero_location',
  'weddingDate': 'hero_date',
  'heroImageUrl': 'hero_image',
};

// Apply mapping during transformation
Object.entries(flatData).forEach(([key, value]) => {
  if (value === null || value === undefined || value === '') return;

  // Apply field mapping if generic name exists
  let processedKey = key;
  if (fieldMapping[key]) {
    processedKey = fieldMapping[key];
    console.log(`🔄 Mapped generic field: ${key} → ${processedKey}`);
  }

  // Now processedKey has proper section prefix
  const matchedSection = sectionTypes.find(section =>
    processedKey.startsWith(`${section}_`)
  );

  // ... rest of grouping logic
});
```

## Result After Fix

```
localStorage (customizer)
└─ groom_name: "Carlos"
└─ bride_name: "María"
└─ eventLocation: "Lima"
   ↓
groupCustomizerDataBySections() WITH MAPPING
   ↓
sections_data: {
  hero: {                       ← ✅ Correct! Hero component will use this
    groom_name: "Carlos",
    bride_name: "María",
    location: "Lima"
  }
}
   ↓
Backend creates InvitationSectionsData
   ↓
section_type: "hero"            ← ✅ Hero component renders personalized data
   ↓
Result: Invitation shows personalized data
```

## Testing Results

### Playground Test (http://localhost:3000/test-storage)

**Before Fix:**
```json
{
  "populated_sections": ["general"],
  "would_create_records": 1,
  "sections_breakdown": {
    "general": {
      "variable_count": 3
    }
  }
}
```

**After Fix:**
```json
{
  "populated_sections": ["hero"],
  "would_create_records": 1,
  "sections_breakdown": {
    "hero": {
      "variable_count": 3,
      "variables": ["location", "groom_name", "bride_name"]
    }
  },
  "recommendation": "PASS - Data is correctly formatted"
}
```

## Future Considerations

### Adding New Fields

When adding new customizer fields, ensure they either:

1. **Use section-prefixed names directly** in the customizer
   - Example: `hero_title`, `couple_description`

2. **Add to fieldMapping** if using generic names
   - Example: Add `'weddingVenue': 'hero_venue'` to mapping

### Why Generic Names Exist

The customizer uses generic names for fields that appear in multiple sections:
- `groom_name` is used in Hero, Couple, and Footer
- `bride_name` is used in Hero, Couple, and Footer
- `eventLocation` is used in Hero and Footer

The mapping system allows the frontend to use a single generic name while ensuring the backend properly categorizes the data by section.

## Related Files

- `frontend/src/lib/api/invitations.ts` - Main transformation logic
- `frontend/src/app/test-storage/page.tsx` - Testing playground
- `backend/api/invitations.py` - Backend endpoint for creating invitations
- `frontend/src/lib/hooks/useDynamicCustomizer.ts` - Customizer field definitions
- `frontend/src/app/invitacion/demo/[id]/page.tsx` - Demo page using generic names

## Verification Steps

1. Navigate to `/invitacion/demo/9`
2. Customize groom_name, bride_name, eventLocation
3. Go to `/test-storage`
4. Click "Transform to Sections"
5. Verify `hero` section is created (not `general`)
6. Click "Send to Backend"
7. Verify `populated_sections: ["hero"]`
8. Complete payment flow
9. Verify invitation displays personalized data

## Status

✅ **FIXED** - Field mapping successfully converts generic names to section-prefixed names, allowing backend to create proper InvitationSectionsData records.
