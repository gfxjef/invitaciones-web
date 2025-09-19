# Invitation Editor Hooks - Issue #49

## Overview

This document describes the React hooks created for the invitation editor in Issue #49. These hooks provide complete state management, auto-save functionality, and file upload capabilities for the invitation editing system.

## Architecture

The invitation editor follows a modular architecture with specialized hooks for different concerns:

```
useInvitationEditor (Main hook)
├── useAutoSave (Auto-save functionality)
├── useFileUpload (File upload management)
└── useDebounce (Input debouncing utility)
```

## Hooks Reference

### 1. useInvitationEditor

**Main state management hook for the invitation editor.**

```typescript
import { useInvitationEditor } from '@/lib/hooks/useInvitationEditor';

const editor = useInvitationEditor(invitationId);
```

#### Features:
- Complete invitation data management
- Form validation with custom rules
- Events management (CRUD operations)
- Media file handling
- Preview generation and publishing
- Section-based completeness tracking

#### Usage Example:
```tsx
const MyEditor = ({ invitationId }: { invitationId: number }) => {
  const editor = useInvitationEditor(invitationId);

  // Load invitation data
  useEffect(() => {
    editor.loadData(invitationId);
  }, [invitationId]);

  // Update a field
  const handleFieldChange = (category: string, field: string, value: any) => {
    editor.updateField(category, field, value);
  };

  // Save data
  const handleSave = async () => {
    try {
      await editor.saveData();
      console.log('Saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div>
      <input
        value={editor.data.couple_groom_name || ''}
        onChange={(e) => handleFieldChange('couple', 'couple_groom_name', e.target.value)}
      />
      
      {editor.getFieldErrors('couple', 'couple_groom_name') && (
        <span className="error">
          {editor.getFieldErrors('couple', 'couple_groom_name')}
        </span>
      )}
      
      <button onClick={handleSave} disabled={editor.isLoading}>
        {editor.isDirty ? 'Save Changes' : 'Saved'}
      </button>
      
      <div>Progress: {editor.getOverallCompleteness()}%</div>
    </div>
  );
};
```

#### API Reference:

**State Properties:**
- `data: InvitationData` - Current form data
- `events: InvitationEvent[]` - Event list
- `media: InvitationMedia[]` - Uploaded media
- `isLoading: boolean` - Loading state
- `isDirty: boolean` - Has unsaved changes
- `errors: EditorValidationErrors` - Validation errors

**Data Management:**
- `updateField(category, field, value)` - Update single field
- `updateData(updates)` - Bulk update data
- `saveData()` - Save to backend
- `loadData(id)` - Load from backend
- `resetForm()` - Reset to initial state

**Events Management:**
- `addEvent(eventData)` - Add new event
- `updateEvent(id, updates)` - Update existing event  
- `deleteEvent(id)` - Delete event
- `reorderEvents(ids)` - Reorder events

**Media Management:**
- `uploadFile(file, mediaType)` - Upload single file
- `uploadFiles(files, mediaType)` - Upload multiple files
- `deleteMedia(id)` - Delete media file

**Validation:**
- `validateField(category, field, value)` - Validate single field
- `validateSection(section)` - Validate entire section
- `isFormValid()` - Check if form is valid
- `getFieldErrors(category, field)` - Get field errors

**Publishing:**
- `generatePreview()` - Generate preview URL
- `publishInvitation()` - Publish invitation
- `unpublishInvitation()` - Unpublish invitation

**Utilities:**
- `getSectionCompleteness(section)` - Get section completion %
- `getOverallCompleteness()` - Get overall completion %

### 2. useAutoSave

**Automatic saving with debouncing and visual feedback.**

```typescript
import { useAutoSave } from '@/lib/hooks/useAutoSave';

const autoSave = useAutoSave({
  onSave: editor.saveData,
  data: editor.data,
  isDirty: editor.isDirty
});
```

#### Features:
- Configurable auto-save intervals
- Input debouncing to avoid excessive API calls
- Retry logic with exponential backoff
- Visual status indicators
- Manual save capability
- Graceful error handling

#### Usage Example:
```tsx
const MyEditor = () => {
  const editor = useInvitationEditor();
  
  const autoSave = useAutoSave({
    onSave: editor.saveData,
    data: editor.data,
    isDirty: editor.isDirty,
    interval: 30000, // 30 seconds
    debounceDelay: 1000, // 1 second
    onSaveSuccess: () => showToast('Auto-saved successfully'),
    onSaveError: (error) => showToast(`Auto-save failed: ${error}`)
  });

  return (
    <div>
      <AutoSaveStatusIndicator autoSave={autoSave} />
      
      <button onClick={autoSave.forceSave}>
        Save Now
      </button>
      
      <button onClick={
        autoSave.isAutoSaveEnabled 
          ? autoSave.disableAutoSave 
          : autoSave.enableAutoSave
      }>
        {autoSave.isAutoSaveEnabled ? 'Disable' : 'Enable'} Auto-Save
      </button>
    </div>
  );
};
```

#### API Reference:

**Properties:**
- `status: AutoSaveStatus` - Current save status
- `isAutoSaveEnabled: boolean` - Auto-save state

**Methods:**
- `forceSave()` - Manual save trigger
- `enableAutoSave()` - Enable auto-save
- `disableAutoSave()` - Disable auto-save

**Status Values:**
- `idle` - No pending saves
- `saving` - Currently saving
- `saved` - Recently saved
- `error` - Save failed

### 3. useFileUpload

**File upload with progress tracking and validation.**

```typescript
import { useFileUpload } from '@/lib/hooks/useFileUpload';

const fileUpload = useFileUpload({
  invitationId: 1
});
```

#### Features:
- Single and batch file uploads
- Real-time progress tracking
- File validation (type, size)
- Upload cancellation
- Retry logic on failure
- Thumbnail generation for images

#### Usage Example:
```tsx
const MyUploader = ({ invitationId }: { invitationId: number }) => {
  const fileUpload = useFileUpload({
    invitationId,
    onUploadSuccess: (media) => console.log('Uploaded:', media.file_path),
    onUploadError: (error, file) => console.error(`${file.name}: ${error}`)
  });

  const handleFileSelect = async (files: FileList, mediaType: string) => {
    try {
      if (files.length === 1) {
        const url = await fileUpload.uploadFile(files[0], mediaType);
        console.log('Single file uploaded:', url);
      } else {
        const urls = await fileUpload.uploadFiles(Array.from(files), mediaType);
        console.log('Multiple files uploaded:', urls);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files!, 'gallery')}
      />
      
      <UploadProgressDisplay uploads={fileUpload.uploads} />
      
      {fileUpload.isUploading && <div>Uploading...</div>}
      {fileUpload.hasErrors && <div>Some uploads failed</div>}
      
      <button onClick={fileUpload.clearCompleted}>
        Clear Completed
      </button>
    </div>
  );
};
```

#### API Reference:

**Properties:**
- `uploads: FileUploadProgress` - Upload status for each file
- `isUploading: boolean` - Any uploads in progress
- `hasErrors: boolean` - Any failed uploads

**Methods:**
- `uploadFile(file, mediaType, onProgress?)` - Upload single file
- `uploadFiles(files, mediaType, onProgress?)` - Upload multiple files
- `cancelUpload(fileId)` - Cancel specific upload
- `clearCompleted()` - Remove completed uploads from state

**Upload Status:**
- `pending` - Queued for upload
- `uploading` - Currently uploading
- `completed` - Successfully uploaded
- `error` - Upload failed

### 4. useAutoSaveStatus

**Helper hook for auto-save status display.**

```typescript
import { useAutoSaveStatus } from '@/lib/hooks/useAutoSave';

const statusDisplay = useAutoSaveStatus(autoSave);
```

#### Usage Example:
```tsx
const AutoSaveIndicator = ({ autoSave }: { autoSave: UseAutoSaveReturn }) => {
  const status = useAutoSaveStatus(autoSave);

  return (
    <div className={`status-indicator ${status.bgColor} ${status.color}`}>
      <span>{status.icon}</span>
      <span>{status.message}</span>
      {status.lastSavedText && (
        <small>{status.lastSavedText}</small>
      )}
      {status.hasError && status.errorDetails && (
        <div className="error-details">{status.errorDetails}</div>
      )}
    </div>
  );
};
```

### 5. useUploadStats

**Helper hook for upload statistics.**

```typescript
import { useUploadStats } from '@/lib/hooks/useFileUpload';

const stats = useUploadStats(fileUpload.uploads);
```

#### Usage Example:
```tsx
const UploadStats = ({ uploads }: { uploads: FileUploadProgress }) => {
  const stats = useUploadStats(uploads);

  if (!stats.hasUploads) return null;

  return (
    <div className="upload-stats">
      <div>Files: {stats.completedFiles}/{stats.totalFiles}</div>
      <div>Size: {stats.formattedCompletedSize}/{stats.formattedTotalSize}</div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${stats.overallProgress}%` }}
        />
      </div>
      
      {stats.hasErrors && (
        <div className="error">
          {stats.errorFiles} file(s) failed to upload
        </div>
      )}
      
      {stats.isUploading && <div>Uploading...</div>}
      {stats.allCompleted && <div>All uploads complete!</div>}
    </div>
  );
};
```

## Integration with Backend APIs

The hooks integrate seamlessly with the backend APIs created in Issues #46-#48:

### Data Management APIs
- `POST /api/invitations/{id}/data` - Bulk data save
- `GET /api/invitations/{id}/data` - Get all data
- `PUT /api/invitations/{id}/data/{field}` - Update single field
- `DELETE /api/invitations/{id}/data/{field}` - Delete field

### Media Management APIs
- `POST /api/invitations/{id}/media` - Upload files
- `GET /api/invitations/{id}/media` - List media
- `DELETE /api/invitations/{id}/media/{id}` - Delete media

### Events Management APIs
- `POST /api/invitations/{id}/events` - Create event
- `GET /api/invitations/{id}/events` - List events
- `PUT /api/invitations/{id}/events/{id}` - Update event
- `DELETE /api/invitations/{id}/events/{id}` - Delete event

### Publishing APIs
- `GET /api/invitations/{id}/preview` - Generate preview
- `POST /api/invitations/{id}/publish` - Publish invitation
- `POST /api/invitations/{id}/unpublish` - Unpublish invitation

## Form Validation

The editor includes comprehensive validation rules:

### Required Fields
- `couple_groom_name` - Groom's name (2-100 chars)
- `couple_bride_name` - Bride's name (2-100 chars)
- `event_date` - Event date (must be future)
- `event_time` - Event time
- `event_venue_name` - Venue name (2-200 chars)
- `gallery_hero_image` - Main image

### Optional Field Validation
- Email format validation
- Phone number format
- Date range validation
- File type and size validation
- URL format validation

### Custom Validation
- Event date must be in the future
- RSVP deadline must be before event date
- Age restrictions (0-21)
- Hashtag format (#hashtag)

## Error Handling

All hooks include comprehensive error handling:

### Network Errors
- Automatic retry with exponential backoff
- Graceful degradation when offline
- User-friendly error messages

### Validation Errors
- Real-time field validation
- Section-level validation
- Form-wide validation

### File Upload Errors
- File type validation
- File size limits
- Upload progress tracking
- Cancellation support

## Performance Considerations

### Debouncing
- Input changes are debounced to avoid excessive API calls
- Auto-save uses configurable intervals
- Validation is triggered on blur/change

### Optimistic Updates
- UI updates immediately on user interaction
- Rollback on API failures
- Proper loading states

### Memory Management
- Proper cleanup of timers and listeners
- File upload cancellation
- Efficient re-renders with proper dependencies

## Usage in Components

Here's a complete example of using all hooks together:

```tsx
import React from 'react';
import { useInvitationEditor } from '@/lib/hooks/useInvitationEditor';
import { useAutoSave, useAutoSaveStatus } from '@/lib/hooks/useAutoSave';
import { useFileUpload, useUploadStats } from '@/lib/hooks/useFileUpload';

interface InvitationEditorProps {
  invitationId: number;
}

export const InvitationEditor: React.FC<InvitationEditorProps> = ({
  invitationId
}) => {
  // Main editor hook
  const editor = useInvitationEditor(invitationId);
  
  // Auto-save functionality
  const autoSave = useAutoSave({
    onSave: editor.saveData,
    data: editor.data,
    isDirty: editor.isDirty
  });
  
  // File upload functionality
  const fileUpload = useFileUpload({
    invitationId,
    onUploadSuccess: (media) => {
      // Update editor state or show success message
    }
  });
  
  // Status displays
  const autoSaveStatus = useAutoSaveStatus(autoSave);
  const uploadStats = useUploadStats(fileUpload.uploads);

  return (
    <div className="invitation-editor">
      {/* Status bar */}
      <div className="status-bar">
        <AutoSaveIndicator status={autoSaveStatus} />
        <CompletionIndicator 
          progress={editor.getOverallCompleteness()} 
        />
      </div>

      {/* Form sections */}
      <div className="form-sections">
        {/* Couple information */}
        <section>
          <input
            value={editor.data.couple_groom_name || ''}
            onChange={(e) => editor.updateField(
              'couple', 
              'couple_groom_name', 
              e.target.value
            )}
          />
          {editor.getFieldErrors('couple', 'couple_groom_name') && (
            <div className="field-error">
              {editor.getFieldErrors('couple', 'couple_groom_name')}
            </div>
          )}
        </section>

        {/* File uploads */}
        <section>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                fileUpload.uploadFile(e.target.files[0], 'hero');
              }
            }}
          />
          
          {uploadStats.hasUploads && (
            <UploadProgress stats={uploadStats} />
          )}
        </section>
      </div>

      {/* Actions */}
      <div className="actions">
        <button 
          onClick={editor.saveData}
          disabled={editor.isLoading}
        >
          Save
        </button>
        
        <button 
          onClick={editor.publishInvitation}
          disabled={!editor.isFormValid()}
        >
          Publish
        </button>
      </div>
    </div>
  );
};
```

## Testing

The hooks are designed to be easily testable:

```typescript
// Mock the API functions
vi.mock('@/lib/invitation-api', () => ({
  saveInvitationData: vi.fn().mockResolvedValue({ success: true }),
  uploadInvitationFile: vi.fn().mockResolvedValue({ media: { file_path: '/test.jpg' } })
}));

// Test the hook
const { result } = renderHook(() => useInvitationEditor(1));

// Test interactions
act(() => {
  result.current.updateField('couple', 'couple_groom_name', 'Test Name');
});

expect(result.current.data.couple_groom_name).toBe('Test Name');
expect(result.current.isDirty).toBe(true);
```

## File Structure

```
frontend/src/lib/hooks/
├── useInvitationEditor.ts     # Main editor hook
├── useAutoSave.ts             # Auto-save functionality  
├── useFileUpload.ts           # File upload management
├── use-debounce.ts            # Existing debounce utility
└── README.md                  # This documentation
```

## Type Definitions

All types are defined in `types/invitation.ts`:

```typescript
// Main data structure
interface InvitationData { ... }

// Hook return types
interface UseInvitationEditorReturn { ... }
interface UseAutoSaveReturn { ... }
interface UseFileUploadReturn { ... }

// Configuration interfaces
interface UseAutoSaveOptions { ... }
interface UseFileUploadOptions { ... }
```

## Conclusion

These hooks provide a complete solution for invitation editing with:

✅ **Complete State Management** - Centralized data handling  
✅ **Auto-save Functionality** - Prevents data loss  
✅ **File Upload Support** - Progress tracking and validation  
✅ **Form Validation** - Real-time validation with custom rules  
✅ **Error Handling** - Graceful error recovery  
✅ **Performance Optimized** - Debouncing and efficient updates  
✅ **TypeScript Support** - Full type safety  
✅ **Backend Integration** - Works with APIs from Issues #46-#48  

The hooks are production-ready and can be used immediately in the invitation editor interface.