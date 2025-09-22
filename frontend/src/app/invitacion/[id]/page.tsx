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
import { LoaderDynamic } from '@/components/ui/LoaderDynamic';
import { Invitation, InvitationData, TemplateMetadata, TemplateColors } from '@/types/template';

interface InvitationPageProps {
  params: {
    id: string;
  };
}

// Mock invitation data - in real app, this would come from API
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

  const invitationId = params.id;

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // In a real app, this would be an API call:
        // const response = await fetch(`/api/invitations/${invitationId}`);
        // const invitationData = await response.json();

        // For now, use mock data for demo/test invitations
        if (invitationId === 'demo' || invitationId === 'maria-carlos-2024') {
          // Simulate loading delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          const mockData = createMockInvitation();
          setInvitationData(mockData);
        } else {
          // Handle real invitation IDs here
          throw new Error('Invitation not found');
        }
      } catch (err) {
        console.error('Error loading invitation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load invitation');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvitation();
  }, [invitationId]);

  if (isLoading) {
    return (
      <LoaderDynamic
        category="weddings"
        message="Cargando invitación..."
      />
    );
  }

  if (error || !invitationData) {
    notFound();
  }

  const { invitation, data, template, colors } = invitationData;

  return (
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
  );
}