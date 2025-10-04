/**
 * Invitation Preview Page (/invitacion/[id])
 *
 * WHY: Displays the final invitation for guests to view using the new
 * modular template system. This is the customer-facing invitation page
 * that will be shared via links.
 *
 * WHAT: Public invitation display page that loads invitation data and
 * renders it using the appropriate template component.
 */

'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { TemplateRenderer } from '@/components/templates/TemplateRenderer';
import { LoaderOverlay } from '@/components/ui/LoaderOverlay';
import { Invitation, InvitationData, TemplateMetadata, TemplateColors } from '@/types/template';
import { apiClient } from '@/lib/api';
import { useTemplate } from '@/lib/hooks/use-templates';
import { useDynamicCustomizer } from '@/lib/hooks/useDynamicCustomizer';

interface InvitationPageProps {
  params: {
    id: string;
  };
}

/**
 * Transform backend API response with real template to frontend TemplateRenderer format
 *
 * WHY: Backend returns invitation data in database format from invitation_sections_data table.
 * We need to combine it with real template metadata (sections_config) for rendering,
 * AND transform it through the same pipeline as demo pages to correctly handle
 * base64 images and other complex data types.
 *
 * BASED ON: /invitacion/demo/[id]/page.tsx createDemoInvitationData()
 */
function transformBackendInvitationData(
  backendData: any,
  templateData: any
): {
  invitation: Invitation;
  data: InvitationData;
  template: TemplateMetadata;
  colors: TemplateColors;
  transformedData: any; // NEW: Pass through useDynamicCustomizer transformation
} {
  console.log('🔍 [transformBackendInvitationData] Starting transformation');
  console.log('🔍 [transformBackendInvitationData] Backend data:', backendData);
  console.log('🔍 [transformBackendInvitationData] Template data:', templateData);

  const { invitation, sections_data } = backendData;
  const template = templateData.template;

  console.log('🔍 [transformBackendInvitationData] Invitation object:', invitation);
  console.log('🔍 [transformBackendInvitationData] Sections data:', sections_data);
  console.log('🔍 [transformBackendInvitationData] Template object:', template);

  // Transform sections_data from BD to nested format for TemplateBuilder
  // Backend format: { "hero": { "variant": "hero_2", "variables": {...} }, ... }
  // Frontend format (NEW): { "hero": {...}, "gallery": {...} } (nested by section, NOT flat)
  // WHY: TemplateBuilder expects data organized by section, components receive unprefixed fields
  const data: any = {};

  if (sections_data && Object.keys(sections_data).length > 0) {
    console.log(`🔍 [transformBackendInvitationData] Processing ${Object.keys(sections_data).length} sections`);

    Object.entries(sections_data).forEach(([sectionType, sectionInfo]: [string, any]) => {
      // Each section has {variant, variables, category}
      // Keep data organized by section WITHOUT adding prefixes to field names
      if (sectionInfo.variables) {
        const variableCount = Object.keys(sectionInfo.variables).length;
        console.log(`🔍 [transformBackendInvitationData] Section "${sectionType}": ${variableCount} variables`);
        console.log(`🔍 [transformBackendInvitationData] Section "${sectionType}" variables:`, sectionInfo.variables);

        // Store variables directly under section name
        data[sectionType] = sectionInfo.variables;
        console.log(`  ✅ Added section "${sectionType}" with ${variableCount} variables`);
      }
    });
  } else {
    console.log('⚠️ [transformBackendInvitationData] No sections_data found or empty');
  }

  console.log('🔍 [transformBackendInvitationData] Final data object keys:', Object.keys(data));
  console.log('🔍 [transformBackendInvitationData] Final data object:', data);

  // NEW: Return both flat data (for backward compatibility) and transformedData
  // transformedData will be passed through useDynamicCustomizer in the component
  return {
    invitation: {
      id: invitation.id,
      user_id: invitation.user_id || 1,
      template_id: template.id,
      title: invitation.title,
      slug: invitation.unique_url,
      is_published: invitation.is_published || false,
      published_at: invitation.published_at || null,
      views_count: invitation.views_count || 0,
      created_at: invitation.created_at,
      updated_at: invitation.updated_at,
      template,
      invitation_data: data,
      media: [],
      events: []
    },
    data,
    template,
    colors: template.default_colors,
    transformedData: data // Will be processed by useDynamicCustomizer
  };
}

// Mock invitation data - Only used for demo/preview invitations
const createMockInvitation = (): {
  invitation: Invitation;
  data: InvitationData;
  template: TemplateMetadata;
  colors: TemplateColors;
} => {
  const template: TemplateMetadata = {
    id: 1,
    name: 'Elegante Dorado',
    description: 'Diseño elegante con detalles dorados',
    category: 'elegant',
    preview_image_url: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=300',
    thumbnail_url: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=150',
    template_file: 'elegante_dorado',
    supported_features: ['gallery', 'rsvp', 'countdown', 'maps', 'music', 'social_share'],
    default_colors: {
      primary: '#D4AF37',
      secondary: '#F5F5DC',
      accent: '#8B4513',
      text: '#2D2D2D',
      text_light: '#666666',
      background: '#FFFFFF',
      background_alt: '#F8F8F8',
      border: '#E2E8F0',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    },
    plan_id: 1,
    is_premium: false,
    is_active: true,
    display_order: 1
  };

  const data: InvitationData = {
    couple_groom_name: 'Carlos Rodríguez',
    couple_bride_name: 'María González',
    couple_groom_parents: 'Sr. Luis Rodríguez y Sra. Ana Pérez',
    couple_bride_parents: 'Sr. Miguel González y Sra. Carmen Silva',
    couple_story: 'Queremos compartir contigo este momento tan especial de nuestras vidas. Tu presencia será el regalo más importante.',

    event_date: '2024-12-15',
    event_time: '16:00',
    event_venue_name: 'Iglesia San José',
    event_venue_address: 'Av. Lima 456, Miraflores, Lima',
    event_venue_location_url: 'https://maps.google.com/?q=Iglesia+San+José+Miraflores',

    message_welcome_text: '¡Nos casamos!',
    message_invitation_text: 'Queremos compartir contigo este momento tan especial de nuestras vidas.',
    message_thank_you: '¡Esperamos verte en nuestro día especial!',

    gallery_hero_image: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=1260',

    rsvp_enabled: true,
    rsvp_deadline: '2024-11-15',
    rsvp_max_guests: 5,
    rsvp_whatsapp: '51987654321',
    rsvp_email: 'rsvp@boda-maria-carlos.com',

    social_hashtag: '#MariaYCarlos2024',
    social_instagram: '@maria_y_carlos_boda',

    dress_code: 'Formal / Elegante'
  };

  const invitation: Invitation = {
    id: 1,
    user_id: 1,
    template_id: 1,
    title: 'Boda de María y Carlos',
    slug: 'maria-carlos-2024',
    is_published: true,
    published_at: '2024-01-01T00:00:00Z',
    views_count: 234,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    template,
    invitation_data: data,
    media: [
      {
        id: 1,
        invitation_id: 1,
        media_type: 'hero',
        file_path: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=1260',
        original_filename: 'hero-image.jpg',
        file_size: 1024000,
        mime_type: 'image/jpeg',
        width: 1260,
        height: 840,
        title: 'Foto Principal',
        display_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        invitation_id: 1,
        media_type: 'gallery',
        file_path: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300',
        original_filename: 'bride-photo.jpg',
        file_size: 512000,
        mime_type: 'image/jpeg',
        width: 300,
        height: 400,
        title: 'Foto de la Novia',
        display_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        invitation_id: 1,
        media_type: 'gallery',
        file_path: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=300',
        original_filename: 'groom-photo.jpg',
        file_size: 512000,
        mime_type: 'image/jpeg',
        width: 300,
        height: 400,
        title: 'Foto del Novio',
        display_order: 2,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    ],
    events: [
      {
        id: 1,
        invitation_id: 1,
        event_type: 'ceremony',
        name: 'Ceremonia',
        date: '2024-12-15',
        time: '16:00',
        venue_name: 'Iglesia San José',
        venue_address: 'Av. Lima 456, Miraflores, Lima',
        venue_location_url: 'https://maps.google.com/?q=Iglesia+San+José+Miraflores',
        description: 'Ceremonia religiosa',
        display_order: 1,
        is_active: true
      },
      {
        id: 2,
        invitation_id: 1,
        event_type: 'reception',
        name: 'Recepción',
        date: '2024-12-15',
        time: '19:00',
        venue_name: 'Hotel Marriott',
        venue_address: 'Malecón de la Reserva 615, Miraflores',
        venue_location_url: 'https://maps.google.com/?q=Hotel+Marriott+Miraflores',
        description: 'Recepción y fiesta',
        display_order: 2,
        is_active: true
      }
    ]
  };

  return {
    invitation,
    data,
    template,
    colors: template.default_colors
  };
};

export default function InvitationPage({ params }: InvitationPageProps) {
  const [invitationData, setInvitationData] = useState<{
    invitation: Invitation;
    data: InvitationData;
    template: TemplateMetadata;
    colors: TemplateColors;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [backendInvitationData, setBackendInvitationData] = useState<any>(null);

  const invitationId = params.id;

  // Stage 1: Load invitation data to get template_id
  useEffect(() => {
    const loadInvitation = async () => {
      // Check if demo invitation
      if (invitationId === 'demo' || invitationId === 'maria-carlos-2024') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData = createMockInvitation();
        setInvitationData(mockData);
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/invitations/by-url/${invitationId}`);
        const data = response.data;

        if (!data.success) {
          throw new Error(data.error || 'Failed to load invitation');
        }

        // Save invitation data and trigger template fetch
        setBackendInvitationData(data);
        setTemplateId(data.template_id);

      } catch (err) {
        console.error('Error loading invitation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load invitation');
        setIsLoading(false);
      }
    };

    loadInvitation();
  }, [invitationId]);

  // Stage 2: Fetch template metadata using useTemplate hook
  const { data: templateData, isLoading: templateLoading } = useTemplate(
    templateId || 0
  );

  // REMOVED: useDynamicCustomizer - not needed for view-only pages
  // This was causing template defaults to override real database data
  // (e.g., "Jefferson & Rosmery" overriding real names like "11 & 55")

  // Stage 3: When both invitation and template are loaded, combine them
  useEffect(() => {
    if (!templateId || !templateData || !backendInvitationData) return;

    try {
      const transformed = transformBackendInvitationData(backendInvitationData, templateData);
      setInvitationData(transformed);
    } catch (err) {
      console.error('Error transforming invitation data:', err);
      setError(err instanceof Error ? err.message : 'Failed to transform invitation');
    } finally {
      setIsLoading(false);
    }
  }, [templateId, templateData, backendInvitationData]);

  if (error || (!invitationData && !isLoading)) {
    notFound();
  }

  // Always render content with overlay, so we avoid content jumping
  const shouldRenderContent = invitationData || !isLoading;
  const { invitation, data, template, colors } = invitationData || {};

  return (
    <div className="relative">
      {/* Loading overlay - covers content while loading */}
      <LoaderOverlay
        isLoading={isLoading}
        category="weddings"
        message="Cargando invitación..."
        zIndex={60}
      />

      {/* Template content - renders underneath the overlay */}
      {shouldRenderContent && invitation && data && template && colors && (
        <>
          {console.log('🎨 [TemplateRenderer] About to render with data:', {
            invitationId: invitation?.id,
            dataKeys: Object.keys(data || {}),
            dataSample: {
              hero: (data as any)?.hero,
              bride_name: (data as any)?.bride_name,
              groom_name: (data as any)?.groom_name,
              familiares_madre_novia: (data as any)?.familiares_madre_novia,
              familiares_padre_novia: (data as any)?.familiares_padre_novia,
              place_religioso_lugar: (data as any)?.place_religioso_lugar,
              place_ceremonia_lugar: (data as any)?.place_ceremonia_lugar,
              gallery_images: (data as any)?.gallery_images
            },
            templateId: template?.id,
            templateName: template?.name
          })}
          <TemplateRenderer
            invitation={invitation}
            data={data}
            template={template}
            colors={colors}
            features={template.supported_features}
            media={invitation.media}
            events={invitation.events}
            isPreview={false}
            isEditing={false}
          />
        </>
      )}
    </div>
  );
}