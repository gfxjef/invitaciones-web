/**
 * Invitation Editor Types and Interfaces
 * 
 * WHY: Provides comprehensive type definitions for the invitation editor
 * based on TEMPLATE_FIELDS.md structure. Ensures type safety throughout
 * the editor components and enables proper TypeScript validation.
 * 
 * WHAT: Complete TypeScript interfaces for all invitation data fields,
 * API responses, and editor state management.
 */

// ================================
// CORE DATA INTERFACES
// ================================

/**
 * Complete invitation data structure
 * Maps to the invitation_data table with all possible fields
 */
export interface InvitationData {
  // Couple Information
  couple_groom_name?: string;
  couple_bride_name?: string;
  couple_display_order?: 'bride_first' | 'groom_first';
  couple_welcome_title?: string;
  couple_welcome_message?: string;
  couple_quote?: string;

  // Main Event Details
  event_date?: string; // YYYY-MM-DD
  event_time?: string; // HH:MM
  event_timezone?: string;
  event_type?: 'religious' | 'civil' | 'symbolic';

  // Event Location
  event_venue_name?: string;
  event_venue_address?: string;
  event_venue_lat?: number;
  event_venue_lng?: number;
  event_venue_maps_link?: string;
  event_venue_reference?: string;

  // Gallery & Media
  gallery_hero_image?: string; // File path
  gallery_couple_photo?: string;
  gallery_ceremony_bg?: string;
  gallery_reception_bg?: string;
  gallery_video_url?: string;
  gallery_music_enabled?: boolean;
  gallery_music_file?: string;
  gallery_music_url?: string;

  // Dress Code
  style_dresscode_type?: 'formal' | 'semiformal' | 'cocktail' | 'casual_elegant' | 'beach' | 'garden' | 'custom';
  style_dresscode_description?: string;
  style_dresscode_colors?: string[]; // Array of color hex codes
  style_dresscode_image?: string;
  style_dresscode_restrictions?: string[];

  // Gift Registry
  gift_registry_enabled?: boolean;
  gift_message?: string;

  // RSVP Configuration
  rsvp_enabled?: boolean;
  rsvp_deadline?: string;
  rsvp_allow_companions?: boolean;
  rsvp_max_companions?: number;
  rsvp_ask_dietary?: boolean;
  rsvp_ask_transport?: boolean;
  rsvp_ask_accommodation?: boolean;

  // Contact Information
  contact_groom_phone?: string;
  contact_groom_whatsapp?: string;
  contact_bride_phone?: string;
  contact_bride_whatsapp?: string;
  contact_email?: string;
  contact_groom_parents?: string[];
  contact_bride_parents?: string[];

  // Additional Information
  extra_transport_provided?: boolean;
  extra_transport_details?: string;
  extra_parking_available?: boolean;
  extra_parking_details?: string;
  extra_adults_only?: boolean;
  extra_no_children?: boolean;
  extra_age_restriction?: number;
  extra_covid_protocols?: boolean;
  extra_covid_details?: string;
  extra_special_notes?: string;
  extra_hashtag?: string;

  // Style Customization
  style_primary_color?: string;
  style_secondary_color?: string;
  style_accent_color?: string;
  style_text_color?: string;
  style_background_color?: string;
  style_font_family?: string;
  style_heading_font?: string;
  style_theme?: 'classic' | 'modern' | 'rustic' | 'beach' | 'garden' | 'elegant';

  // Privacy Settings
  privacy_password_enabled?: boolean;
  privacy_password?: string;
  privacy_guest_list_mode?: 'open' | 'restricted' | 'private';
  privacy_show_rsvp_count?: boolean;
  privacy_show_gallery?: boolean;
  privacy_allow_comments?: boolean;

  // Metadata
  meta_title?: string;
  meta_description?: string;
  meta_og_image?: string;
}

/**
 * Individual invitation event (ceremony, reception, etc.)
 * Maps to invitation_events table
 */
export interface InvitationEvent {
  id?: number;
  invitation_id?: number;
  event_name: string;
  event_datetime: string; // ISO datetime string
  event_venue?: string;
  event_address?: string;
  event_lat?: number;
  event_lng?: number;
  event_description?: string;
  event_icon?: string;
  event_order?: number;
  created_at?: string;
}

/**
 * Media file information
 * Maps to invitation_media table
 */
export interface InvitationMedia {
  id?: number;
  invitation_id?: number;
  media_type: 'hero' | 'gallery' | 'couple' | 'dresscode' | 'og_image';
  file_path: string;
  file_size?: number;
  mime_type?: string;
  display_order?: number;
  created_at?: string;
}

/**
 * Gift registry entry
 */
export interface GiftRegistry {
  gift_type: 'amazon' | 'liverpool' | 'sears' | 'bank' | 'paypal' | 'custom';
  gift_platform_name?: string;
  gift_registry_number?: string;
  gift_registry_link?: string;
  gift_bank_details?: {
    bank_name: string;
    account_number: string;
    account_holder: string;
    account_type: 'savings' | 'checking';
    clabe?: string; // Mexico
    cci?: string;   // Peru
  };
}

/**
 * Hotel recommendation
 */
export interface HotelRecommendation {
  hotel_name: string;
  hotel_address: string;
  hotel_phone: string;
  hotel_website?: string;
  hotel_discount_code?: string;
}

/**
 * Custom RSVP question
 */
export interface CustomRSVPQuestion {
  question: string;
  type: 'text' | 'select' | 'checkbox';
  options?: string[];
  required?: boolean;
}

// ================================
// EDITOR STATE INTERFACES
// ================================

/**
 * Editor validation errors
 */
export interface EditorValidationErrors {
  [fieldCategory: string]: {
    [fieldName: string]: string;
  };
}

/**
 * Auto-save status
 */
export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
  lastSaved?: Date;
  error?: string;
}

/**
 * File upload progress
 */
export interface FileUploadProgress {
  [fileId: string]: {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    url?: string;
  };
}

/**
 * Editor section configuration
 */
export interface EditorSection {
  id: string;
  label: string;
  icon: string;
  required?: boolean;
  fields: string[];
}

// ================================
// API REQUEST/RESPONSE INTERFACES
// ================================

/**
 * Bulk data save request
 */
export interface SaveInvitationDataRequest {
  fields: Record<string, any>;
}

/**
 * Single field update request
 */
export interface UpdateFieldRequest {
  field_category: string;
  field_name: string;
  field_value: any;
}

/**
 * File upload request
 */
export interface UploadFileRequest {
  media_type: 'hero' | 'gallery' | 'couple' | 'dresscode' | 'og_image';
  files: File[];
}

/**
 * Create event request
 */
export interface CreateEventRequest {
  event_name: string;
  event_datetime: string;
  event_venue?: string;
  event_address?: string;
  event_lat?: number;
  event_lng?: number;
  event_description?: string;
  event_icon?: string;
  event_order?: number;
}

/**
 * API response for invitation data
 */
export interface InvitationDataResponse {
  success: boolean;
  data: InvitationData;
  message?: string;
}

/**
 * API response for events
 */
export interface InvitationEventsResponse {
  success: boolean;
  events: InvitationEvent[];
  message?: string;
}

/**
 * API response for media
 */
export interface InvitationMediaResponse {
  success: boolean;
  media: InvitationMedia[];
  message?: string;
}

/**
 * API response for file upload
 */
export interface UploadFileResponse {
  success: boolean;
  media: InvitationMedia;
  message?: string;
}

/**
 * Preview data response
 */
export interface PreviewDataResponse {
  success: boolean;
  preview_data: {
    invitation_data: InvitationData;
    events: InvitationEvent[];
    media: InvitationMedia[];
    preview_url: string;
  };
  message?: string;
}

/**
 * Publish response
 */
export interface PublishResponse {
  success: boolean;
  published_url: string;
  message?: string;
}

// ================================
// HOOK INTERFACES
// ================================

/**
 * useInvitationEditor hook return type
 */
export interface UseInvitationEditorReturn {
  // State
  data: InvitationData;
  events: InvitationEvent[];
  media: InvitationMedia[];
  isLoading: boolean;
  isDirty: boolean;
  errors: EditorValidationErrors;
  
  // Actions - Data Management
  updateField: (category: string, field: string, value: any) => void;
  updateData: (updates: Partial<InvitationData>) => void;
  saveData: () => Promise<void>;
  loadData: (invitationId: number) => Promise<void>;
  resetForm: () => void;
  
  // Actions - Events
  addEvent: (event: Omit<InvitationEvent, 'id' | 'invitation_id' | 'created_at'>) => Promise<void>;
  updateEvent: (eventId: number, updates: Partial<InvitationEvent>) => Promise<void>;
  deleteEvent: (eventId: number) => Promise<void>;
  reorderEvents: (eventIds: number[]) => Promise<void>;
  
  // Actions - Media
  uploadFile: (file: File, mediaType: InvitationMedia['media_type']) => Promise<string>;
  uploadFiles: (files: File[], mediaType: InvitationMedia['media_type']) => Promise<string[]>;
  deleteMedia: (mediaId: number) => Promise<void>;
  
  // Validation
  validateField: (category: string, field: string, value: any) => string | null;
  validateSection: (section: string) => boolean;
  isFormValid: () => boolean;
  getFieldErrors: (category: string, field: string) => string | null;
  
  // Preview & Publishing
  generatePreview: () => Promise<string>;
  publishInvitation: () => Promise<string>;
  unpublishInvitation: () => Promise<void>;
  
  // Utility
  getSectionCompleteness: (section: string) => number;
  getOverallCompleteness: () => number;
}

/**
 * useAutoSave hook return type
 */
export interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  forceSave: () => Promise<void>;
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  isAutoSaveEnabled: boolean;
}

/**
 * useFileUpload hook return type
 */
export interface UseFileUploadReturn {
  uploads: FileUploadProgress;
  uploadFile: (file: File, mediaType: string, onProgress?: (progress: number) => void) => Promise<string>;
  uploadFiles: (files: File[], mediaType: string, onProgress?: (progress: number) => void) => Promise<string[]>;
  cancelUpload: (fileId: string) => void;
  clearCompleted: () => void;
  isUploading: boolean;
  hasErrors: boolean;
}

// ================================
// FORM VALIDATION
// ================================

/**
 * Field validation rules
 */
export interface FieldValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

/**
 * Validation rules for all fields
 */
export interface ValidationRules {
  [fieldCategory: string]: {
    [fieldName: string]: FieldValidationRule;
  };
}

// ================================
// CONSTANTS AND ENUMS
// ================================

/**
 * Available editor sections
 */
export const EDITOR_SECTIONS: EditorSection[] = [
  { id: 'couple', label: 'Información de la Pareja', icon: '💑', required: true, fields: ['couple_groom_name', 'couple_bride_name'] },
  { id: 'event', label: 'Detalles del Evento', icon: '📅', required: true, fields: ['event_date', 'event_time', 'event_venue_name'] },
  { id: 'schedule', label: 'Itinerario', icon: '🎉', fields: ['events'] },
  { id: 'gallery', label: 'Fotos y Videos', icon: '📷', required: true, fields: ['gallery_hero_image'] },
  { id: 'dresscode', label: 'Dress Code', icon: '👗', fields: ['style_dresscode_type'] },
  { id: 'gifts', label: 'Mesa de Regalos', icon: '🎁', fields: ['gift_registry_enabled'] },
  { id: 'rsvp', label: 'Confirmación', icon: '✅', fields: ['rsvp_enabled'] },
  { id: 'contact', label: 'Contacto', icon: '📞', fields: ['contact_email'] },
  { id: 'extra', label: 'Información Adicional', icon: '🏨', fields: [] },
  { id: 'style', label: 'Personalización', icon: '🎨', fields: ['style_primary_color'] },
];

/**
 * Supported file types for upload
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
] as const;

export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg'
] as const;

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  audio: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Maximum gallery images
 */
export const MAX_GALLERY_IMAGES = 20;

/**
 * Auto-save interval (in milliseconds)
 */
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

/**
 * Debounce delay for user inputs (in milliseconds)
 */
export const INPUT_DEBOUNCE_DELAY = 1000; // 1 second