/**
 * Template Demo Page (/invitacion/demo/[id])
 *
 * WHY: Provides a live preview of wedding invitation templates
 * allowing users to see how their invitation would look before purchase.
 *
 * WHAT: Displays the actual template component with demo data to showcase
 * the template's real design and features using TemplateRenderer.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTemplate } from '@/lib/hooks/use-templates';
import { useAddTemplateToCart } from '@/lib/hooks/use-cart';
import { TemplateRenderer } from '@/components/templates/TemplateRenderer';
import { Invitation, InvitationData, TemplateColors, InvitationMedia, InvitationEvent } from '@/types/template';

interface TemplateDemoPageProps {
  params: {
    id: string;
  };
}

// Function to create demo invitation data for TemplateRenderer
const createDemoInvitationData = (templateId: number, templateData: any): {
  invitation: Invitation;
  data: InvitationData;
  colors: TemplateColors;
  media: InvitationMedia[];
  events: InvitationEvent[];
} => {
  const template = templateData.template;

  const data: InvitationData = {
    couple_groom_name: 'Carlos Rodríguez',
    couple_bride_name: 'María González',
    couple_groom_parents: 'Sr. Luis Rodríguez y Sra. Ana Pérez',
    couple_bride_parents: 'Sr. Miguel González y Sra. Carmen Silva',
    couple_story: 'Queremos compartir contigo este momento tan especial de nuestras vidas. Tu presencia será el regalo más importante para nosotros.',

    event_date: '2024-12-15',
    event_time: '16:00',
    event_venue_name: 'Iglesia San José',
    event_venue_address: 'Av. Lima 456, Miraflores, Lima',
    event_venue_location_url: 'https://maps.google.com/?q=Iglesia+San+José+Miraflores',

    message_welcome_text: '¡Nos casamos!',
    message_invitation_text: 'Con la bendición de Dios y de nuestros padres, tenemos el honor de invitarlos a celebrar nuestra unión.',
    message_thank_you: '¡Esperamos verte en nuestro día especial!',

    gallery_hero_image: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=1260',

    rsvp_enabled: true,
    rsvp_deadline: '2024-11-15',
    rsvp_max_guests: 5,
    rsvp_whatsapp: '51987654321',
    rsvp_email: 'rsvp@boda-maria-carlos.com',
    rsvp_message: 'Por favor confirma tu asistencia antes del 15 de noviembre',

    social_hashtag: '#MariaYCarlos2024',
    social_instagram: '@maria_y_carlos_boda',

    dress_code: 'Formal / Elegante'
  };

  const media: InvitationMedia[] = [
    {
      id: 1,
      invitation_id: templateId,
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
      invitation_id: templateId,
      media_type: 'couple',
      file_path: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=800',
      original_filename: 'couple-photo.jpg',
      file_size: 512000,
      mime_type: 'image/jpeg',
      width: 800,
      height: 600,
      title: 'Foto de la Pareja',
      display_order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    }
  ];

  const events: InvitationEvent[] = [
    {
      id: 1,
      invitation_id: templateId,
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
      invitation_id: templateId,
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
  ];

  const invitation: Invitation = {
    id: templateId,
    user_id: 1,
    template_id: templateId,
    title: 'Demo - Boda de María y Carlos',
    slug: `demo-${templateId}`,
    is_published: true,
    published_at: '2024-01-01T00:00:00Z',
    views_count: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    template,
    invitation_data: data,
    media,
    events
  };

  return {
    invitation,
    data,
    colors: template.default_colors,
    media,
    events
  };
};

export default function TemplateDemoPage({ params }: TemplateDemoPageProps) {
  const router = useRouter();
  const templateId = parseInt(params.id);

  // Validate ID
  if (isNaN(templateId) || templateId <= 0) {
    notFound();
  }

  // Fetch template data
  const { data: templateData, isLoading, error } = useTemplate(templateId);
  const { addTemplate, isPending } = useAddTemplateToCart();

  // Create demo data when template loads (without useState for simplicity)
  const demoInvitationData = templateData ? createDemoInvitationData(templateId, templateData) : null;

  const handleAddToCart = () => {
    if (templateData) {
      addTemplate(templateData.template);
      router.push('/carrito');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando demo...</p>
        </div>
      </div>
    );
  }

  if (error || !templateData) {
    notFound();
  }

  // If template data exists but demo data is not ready yet, show loading
  if (!demoInvitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando demo...</p>
        </div>
      </div>
    );
  }

  const template = templateData.template;

  return (
    <div className="relative">
      {/* Demo Header Bar - Fixed overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Volver</span>
              </button>
              <div className="border-l pl-4">
                <Badge variant="outline" className="bg-purple-50 border-purple-300">
                  Vista Demo: {template.name}
                </Badge>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Agregar al Carrito
            </Button>
          </div>
        </div>
      </div>

      {/* Main Template Content */}
      <div>
        <TemplateRenderer
          invitation={demoInvitationData.invitation}
          data={demoInvitationData.data}
          template={template}
          colors={demoInvitationData.colors}
          features={template.supported_features}
          media={demoInvitationData.media}
          events={demoInvitationData.events}
          isPreview={true}
          isEditing={false}
        />
      </div>

      {/* Demo Notice - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 text-white text-center py-2 px-4">
        <p className="text-sm">
          Esta es una vista demo con datos de ejemplo - Tu invitación será completamente personalizada
        </p>
      </div>
    </div>
  );
}