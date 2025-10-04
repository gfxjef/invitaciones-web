# Debug Guide - Sections Data Not Saving

## Problem Description

The `invitations` table record is created successfully after payment, but `invitation_sections_data` table remains empty (0 records).

## Debugging Strategy

Added comprehensive logging at every step of the data flow to identify where the problem occurs.

## Expected Data Flow

```
1. Frontend - Checkout Page (checkout/page.tsx)
   ↓
   Read localStorage: demo-customizer-{templateId}
   ↓
   Extract customizerData from parsed state
   ↓
2. Frontend - API Layer (lib/api/invitations.ts)
   ↓
   Transform customizerData → sectionsData (grouping by section prefix)
   ↓
   Build payload with sections_data
   ↓
3. Backend - API Endpoint (api/invitations.py)
   ↓
   Receive sections_data in request payload
   ↓
   Loop through sections_data.items()
   ↓
   Create InvitationSectionsData for each section
   ↓
   Commit to database
   ↓
4. Verification
   ↓
   Query database for saved sections
```

## Log Points Added

### Frontend Logs (checkout/page.tsx)

**Line 435-443**: Customizer Data Extraction
```javascript
console.log('📊 customizerData keys count:', Object.keys(customizerData).length);
console.log('📊 customizerData FULL content:', customizerData);
console.log('📊 Non-empty fields count:', nonEmptyFields.length);
console.log('📊 Non-empty fields:', nonEmptyFields);
```

**Expected Output:**
```
📊 customizerData keys count: 43
📊 customizerData FULL content: { groom_name: "Carlos", bride_name: "María", ... }
📊 Non-empty fields count: 3
📊 Non-empty fields: [["groom_name", "Carlos"], ["bride_name", "María"], ...]
```

### Frontend Logs (lib/api/invitations.ts)

**Line 148-160**: Sections Data Transformation
```javascript
console.log('🔍 [API] DEBUGGING SECTIONS DATA TRANSFORMATION');
console.log('📦 [API] Sections data grouped:', sectionsData);
console.log('   Sections count:', Object.keys(sectionsData).length);
console.log('   Section types:', Object.keys(sectionsData));
// + detailed per-section logging
```

**Expected Output:**
```
🔍 [API] DEBUGGING SECTIONS DATA TRANSFORMATION
📦 [API] Sections data grouped: { hero: { groom_name: "Carlos", ... } }
   Sections count: 1
   Section types: ["hero"]

--- Section: hero ---
  Variables count: 3
  Variables: { groom_name: "Carlos", bride_name: "María", location: "Lima" }
```

**Line 181-189**: Final Payload
```javascript
console.log('📤 [API] FINAL PAYLOAD TO BACKEND:');
console.log('  sections_data:', payload.sections_data);
console.log('  sections_data type:', typeof payload.sections_data);
console.log('  sections_data keys:', Object.keys(payload.sections_data));
console.log('  Full payload:', JSON.stringify(payload, null, 2));
```

**Expected Output:**
```
📤 [API] FINAL PAYLOAD TO BACKEND:
  sections_data: { hero: { groom_name: "Carlos", ... } }
  sections_data type: object
  sections_data keys: ["hero"]
  Full payload: {
    "order_id": 123,
    "template_id": 9,
    "plan_id": 1,
    "sections_data": {
      "hero": {
        "groom_name": "Carlos Méndez",
        "bride_name": "María González",
        "location": "AREQUIPA - PERÚ"
      }
    }
  }
```

### Backend Logs (api/invitations.py)

**Line 218-224**: Sections Data Received
```python
logger.info("🔍 DEBUGGING SECTIONS_DATA CREATION")
logger.info(f"📦 sections_data received: {data.get('sections_data')}")
logger.info(f"📊 sections_data type: {type(data.get('sections_data'))}")
logger.info(f"📋 sections_data keys: {list(data.get('sections_data', {}).keys())}")
logger.info(f"🔢 Number of sections: {len(data.get('sections_data', {}))}")
```

**Expected Output:**
```
🔍 DEBUGGING SECTIONS_DATA CREATION
📦 sections_data received: {'hero': {'groom_name': 'Carlos Méndez', ...}}
📊 sections_data type: <class 'dict'>
📋 sections_data keys: ['hero']
🔢 Number of sections: 1
```

**Line 228-237**: Section Processing Loop
```python
logger.info(f"\n--- Processing section: {section_type} ---")
logger.info(f"  Variables type: {type(variables)}")
logger.info(f"  Variables value: {variables}")
logger.info(f"  Is dict? {isinstance(variables, dict)}")
logger.info(f"  Is empty? {not variables}")
```

**Expected Output:**
```
--- Processing section: hero ---
  Variables type: <class 'dict'>
  Variables value: {'groom_name': 'Carlos Méndez', 'bride_name': 'María González', 'location': 'AREQUIPA - PERÚ'}
  Is dict? True
  Is empty? False
```

**Line 255-278**: Creating Section Record
```python
logger.info(f"✅ Creating InvitationSectionsData record:")
logger.info(f"   invitation_id: {invitation.id}")
logger.info(f"   section_type: {section_type}")
logger.info(f"   Variables count: {len(variables)}")
logger.info(f"✅ Added section to db.session: {section_type}")
```

**Expected Output:**
```
✅ Creating InvitationSectionsData record:
   invitation_id: 22
   section_type: hero
   Variables count: 3
✅ Added section to db.session: hero with 3 variables
```

**Line 281-290**: Database Commit & Verification
```python
logger.info("💾 Attempting to commit to database...")
logger.info(f"   Sections to commit: {sections_created}")
db.session.commit()
logger.info("✅ Database commit successful!")

saved_sections = InvitationSectionsData.query.filter_by(invitation_id=invitation.id).all()
logger.info(f"🔍 Verification: Found {len(saved_sections)} sections in database")
```

**Expected Output:**
```
💾 Attempting to commit to database...
   Sections to commit: 1
✅ Database commit successful!
🔍 Verification: Found 1 sections in database for invitation 22
   - hero: 3 variables
```

## Common Issues to Check

### Issue 1: Empty customizerData
**Symptom:**
```
📊 customizerData keys count: 0
📊 Non-empty fields count: 0
```

**Cause:** localStorage is empty or not being read correctly

**Fix:** Verify customizer is saving to localStorage with correct key format

### Issue 2: All Fields Empty Strings
**Symptom:**
```
📊 customizerData keys count: 43
📊 Non-empty fields count: 0
```

**Cause:** Fields are saved as empty strings ""

**Fix:** Customizer not updating React state properly (use native input setters)

### Issue 3: Fields Not Grouped to Sections
**Symptom:**
```
   Sections count: 0
   OR
   Section types: ["general"]
```

**Cause:** Field names don't have section prefixes OR mapping not applied

**Fix:** Verify fieldMapping in groupCustomizerDataBySections() is working

### Issue 4: sections_data Not Sent to Backend
**Symptom:**
```
Backend log shows:
📦 sections_data received: {}
📋 sections_data keys: []
🔢 Number of sections: 0
```

**Cause:** Payload construction issue in frontend

**Fix:** Check axios payload serialization

### Issue 5: Backend Loop Not Executing
**Symptom:**
```
Backend shows:
🔢 Number of sections: 1
(but no "--- Processing section: hero ---" logs)
```

**Cause:** Loop condition failing OR exception thrown

**Fix:** Check for try/catch blocks swallowing errors

### Issue 6: Section Skipped as Invalid
**Symptom:**
```
⚠️ Skipping empty or invalid section: hero
   Reason: variables={}, is_dict=True
```

**Cause:** Variables is empty dict {} OR not a dict

**Fix:** Verify transformation doesn't filter out all values

### Issue 7: Database Commit Fails
**Symptom:**
```
💾 Attempting to commit to database...
(no "✅ Database commit successful!" log)
```

**Cause:** Database error, constraint violation, or rollback

**Fix:** Check exception logs for SQL errors

### Issue 8: Verification Shows 0 Records
**Symptom:**
```
✅ Database commit successful!
🔍 Verification: Found 0 sections in database
```

**Cause:** Commit succeeded but records weren't saved (transaction issue?)

**Fix:** Check database constraints, foreign keys, or session state

## Testing Steps

1. **Clear localStorage** (or use fresh template customization)
   ```javascript
   localStorage.clear()
   ```

2. **Customize Template**
   - Go to `/invitacion/demo/9`
   - Open customizer
   - Change at least 3 fields (groom_name, bride_name, eventLocation)
   - Close customizer

3. **Verify localStorage**
   ```javascript
   const data = JSON.parse(localStorage.getItem('demo-customizer-9'))
   console.log('Non-empty fields:', Object.entries(data.customizerData).filter(([k,v]) => v !== ''))
   ```

4. **Complete Checkout**
   - Add template to cart
   - Go to checkout
   - Fill form
   - Complete payment
   - **Watch console logs and backend terminal**

5. **Check Database**
   ```sql
   -- Check invitation was created
   SELECT * FROM invitations ORDER BY id DESC LIMIT 1;

   -- Check sections were created
   SELECT * FROM invitation_sections_data WHERE invitation_id = <last_id>;
   ```

## Files Modified for Debugging

- ✅ `frontend/src/app/checkout/page.tsx` (lines 435-452)
- ✅ `frontend/src/lib/api/invitations.ts` (lines 148-189)
- ✅ `backend/api/invitations.py` (lines 218-290)

## Next Steps After Identifying Issue

Once logs reveal where the data is lost:

1. **If lost in frontend transformation**: Fix `groupCustomizerDataBySections()`
2. **If lost in API call**: Check axios serialization or network issues
3. **If lost in backend parsing**: Check Flask request.get_json() handling
4. **If lost in database save**: Check SQLAlchemy session or constraints
5. **If verification fails**: Check query logic or transaction isolation

## Status

🔍 **DEBUGGING IN PROGRESS** - Logs added, awaiting test run to identify exact failure point
