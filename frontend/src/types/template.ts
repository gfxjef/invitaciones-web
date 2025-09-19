/**
 * Template System Types
 *
 * WHY: Defines TypeScript interfaces for the template system to ensure
 * type safety across all template components and data flow.
 */

// Template metadata from database
export interface TemplateMetadata {
  id: number;
  name: string;
  description: string;
  category: string;
  preview_image_url: string;
  thumbnail_url: string;
  template_file: string; // Key for template registry
  supported_features: string[];
  default_colors: TemplateColors;
  plan_id: number;
  is_premium: boolean;
  is_active: boolean;
  display_order: number;
}

// Color scheme for templates
export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  text_light: string;
  background: string;
  background_alt: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

// Invitation data from database
export interface InvitationData {
  // Couple information
  couple_groom_name: string;
  couple_bride_name: string;
  couple_groom_parents?: string;
  couple_bride_parents?: string;
  couple_story?: string;

  // Event details
  event_date: string;
  event_time: string;
  event_type?: string;
  event_duration?: string;

  // Venue information
  event_venue_name: string;
  event_venue_address: string;
  event_venue_city?: string;
  event_venue_state?: string;
  event_venue_location_url?: string;
  event_venue_parking?: string;

  // Messages
  message_welcome_text?: string;
  message_invitation_text?: string;
  message_ceremony_text?: string;
  message_reception_text?: string;
  message_thank_you?: string;

  // Gallery
  gallery_hero_image?: string;
  gallery_couple_image?: string;
  gallery_engagement_image?: string;
  gallery_venue_image?: string;

  // Design customization
  design_primary_color?: string;
  design_secondary_color?: string;
  design_accent_color?: string;
  design_font_family?: string;
  design_font_secondary?: string;
  design_theme?: string;

  // RSVP
  rsvp_enabled: boolean;
  rsvp_deadline?: string;
  rsvp_max_guests?: number;
  rsvp_phone?: string;
  rsvp_whatsapp?: string;
  rsvp_email?: string;
  rsvp_message?: string;

  // Social
  social_hashtag?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_website?: string;

  // Additional features
  gift_registry_text?: string;
  gift_registry_url?: string;
  gift_bank_account?: string;
  dress_code?: string;
  music_playlist_url?: string;
  livestream_url?: string;
  accommodation_info?: string;
  transportation_info?: string;
  covid_protocol?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

// Media files
export interface InvitationMedia {
  id: number;
  invitation_id: number;
  media_type: 'hero' | 'gallery' | 'couple' | 'video' | 'music';
  file_path: string;
  thumbnail_path?: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  duration?: number;
  title?: string;
  description?: string;
  alt_text?: string;
  display_order: number;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

// Events timeline
export interface InvitationEvent {
  id: number;
  invitation_id: number;
  event_type: 'ceremony' | 'reception' | 'party' | 'other';
  name: string;
  date: string;
  time: string;
  end_time?: string;
  venue_name: string;
  venue_address?: string;
  venue_city?: string;
  venue_location_url?: string;
  description?: string;
  dress_code?: string;
  special_instructions?: string;
  capacity?: number;
  display_order: number;
  is_active: boolean;
  metadata?: Record<string, any>;
}

// Complete invitation object
export interface Invitation {
  id: number;
  user_id: number;
  template_id: number;
  order_id?: number;
  title?: string;
  slug?: string;
  is_published: boolean;
  published_at?: string;
  password?: string;
  views_count: number;
  created_at: string;
  updated_at: string;

  // Relations
  template: TemplateMetadata;
  invitation_data: InvitationData;
  media: InvitationMedia[];
  events: InvitationEvent[];
}

// Props for template components
export interface TemplateProps {
  invitation: Invitation;
  data: InvitationData;
  template: TemplateMetadata;
  colors: TemplateColors;
  features: string[];
  media: InvitationMedia[];
  events: InvitationEvent[];
  isPreview?: boolean;
  isEditing?: boolean;
}

// Template component type
export type TemplateComponent = React.ComponentType<TemplateProps>;

// Template registry type
export interface TemplateRegistry {
  [key: string]: TemplateComponent;
}

// Shared component props
export interface SharedComponentProps {
  data: InvitationData;
  colors: TemplateColors;
  className?: string;
  isPreview?: boolean;
}

// RSVP specific props
export interface RSVPSectionProps extends SharedComponentProps {
  rsvpData: {
    enabled: boolean;
    deadline?: string;
    max_guests?: number;
    phone?: string;
    whatsapp?: string;
    email?: string;
    message?: string;
  };
  onSubmit?: (data: RSVPFormData) => void;
}

// RSVP form data
export interface RSVPFormData {
  guest_name: string;
  email?: string;
  phone?: string;
  status: 'confirmed' | 'declined';
  number_of_guests: number;
  guest_names?: string[];
  meal_selections?: string[];
  custom_answers?: Record<string, any>;
  message?: string;
}

// Countdown timer props
export interface CountdownTimerProps extends SharedComponentProps {
  targetDate: string;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Share buttons props
export interface ShareButtonsProps extends SharedComponentProps {
  url: string;
  title: string;
  description?: string;
  hashtag?: string;
}

// Gallery props
export interface GallerySectionProps extends SharedComponentProps {
  media: InvitationMedia[];
  showTitles?: boolean;
  columns?: number;
  showLightbox?: boolean;
}

// Event timeline props
export interface EventTimelineProps extends SharedComponentProps {
  events: InvitationEvent[];
  showIcons?: boolean;
  orientation?: 'horizontal' | 'vertical';
}