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

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTemplate } from '@/lib/hooks/use-templates';
import { DownloadButton } from '@/components/auth/DownloadButton';
import { DirectDownloadButton } from '@/components/auth/DirectDownloadButton';
import { ViewModeSwitcher, ViewMode } from '@/components/ui/ViewModeSwitcher';
import { TemplateRenderer } from '@/components/templates/TemplateRenderer';
import { DynamicCustomizer } from '@/components/customizer';
import { LoaderOverlay } from '@/components/ui/LoaderOverlay';
import { Invitation, InvitationData, TemplateColors, InvitationMedia, InvitationEvent, TemplateMetadata } from '@/types/template';
import { DeviceFrameset } from 'react-device-frameset';
import 'react-device-frameset/styles/marvel-devices.min.css';

// Import PDF generation functions - 3 NEW IMPROVED variations for funnel testing
import { generatePDFMobileOptionA } from '@/lib/pdf/pdfMobileOptionA';
import { generatePDFMobileOptionB } from '@/lib/pdf/pdfMobileOptionB';
import { generatePDFMobileOptionC } from '@/lib/pdf/pdfMobileOptionC';

// Import customizer hook for data transformation
import { useDynamicCustomizer } from '@/lib/hooks/useDynamicCustomizer';

interface TemplateDemoPageProps {
  params: {
    id: string;
  };
  searchParams: {
    embedded?: string;
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
  // Logs removed for performance

  const template = templateData.template;

  // Check for customized data in localStorage first
  const getStoredValue = (key: string, defaultValue: any) => {
    if (typeof window !== 'undefined') {
      try {
        const storageKey = `demo-customizer-${templateId}`;
        const saved = localStorage.getItem(storageKey);

        if (saved) {
          const parsed = JSON.parse(saved);
          const customValue = parsed.customizerData?.[key];

          if (customValue !== undefined && customValue !== null && customValue !== '') {
            return customValue;
          }
        }
      } catch (error) {
        // Error removed for performance
      }
    }

    return defaultValue;
  };

  const data: InvitationData = {
    couple_groom_name: getStoredValue('groom_name', 'Carlos Rodríguez'),
    couple_bride_name: getStoredValue('bride_name', 'María González'),
    couple_groom_parents: getStoredValue('couple_groom_parents', 'Sr. Luis Rodríguez y Sra. Ana Pérez'),
    couple_bride_parents: getStoredValue('couple_bride_parents', 'Sr. Miguel González y Sra. Carmen Silva'),
    couple_story: getStoredValue('story_content', 'Queremos compartir contigo este momento tan especial de nuestras vidas. Tu presencia será el regalo más importante para nosotros.'),

    event_date: getStoredValue('weddingDate', '2024-12-15'),
    event_time: getStoredValue('event_time', '16:00'),
    event_venue_name: getStoredValue('eventLocation', 'Iglesia San José'),
    event_venue_address: getStoredValue('place_religioso_address', 'Av. Lima 456, Miraflores, Lima'),
    event_venue_location_url: getStoredValue('place_religioso_mapUrl', 'https://maps.google.com/?q=Iglesia+San+José+Miraflores'),

    message_welcome_text: getStoredValue('welcome_title', '¡Nos casamos!'),
    message_invitation_text: getStoredValue('welcome_subtitle', 'Con la bendición de Dios y de nuestros padres, tenemos el honor de invitarlos a celebrar nuestra unión.'),
    message_thank_you: getStoredValue('footer_message', '¡Esperamos verte en nuestro día especial!'),

    gallery_hero_image: getStoredValue('heroImageUrl', 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=1260'),

    rsvp_enabled: getStoredValue('rsvp_enabled', true),
    rsvp_deadline: getStoredValue('rsvp_deadline', '2024-11-15'),
    rsvp_max_guests: getStoredValue('rsvp_max_guests', 5),
    rsvp_whatsapp: getStoredValue('rsvp_whatsapp', '51987654321'),
    rsvp_email: getStoredValue('rsvp_email', 'rsvp@boda-maria-carlos.com'),
    rsvp_message: getStoredValue('rsvp_message', 'Por favor confirma tu asistencia antes del 15 de noviembre'),

    social_hashtag: getStoredValue('social_hashtag', '#MariaYCarlos2024'),
    social_instagram: getStoredValue('social_instagram', '@maria_y_carlos_boda'),

    dress_code: getStoredValue('vestimenta_title', 'Formal / Elegante')
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

  // Logs removed for performance

  return {
    invitation,
    data,
    colors: template.default_colors,
    media,
    events
  };
};

export default function TemplateDemoPage({ params, searchParams }: TemplateDemoPageProps) {
  const router = useRouter();
  const templateId = parseInt(params.id);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const isEmbedded = searchParams?.embedded === 'true';
  const saveStateRef = useRef<(() => void) | null>(null);

  // Validate ID
  if (isNaN(templateId) || templateId <= 0) {
    notFound();
  }

  // Fetch template data
  const { data: templateData, isLoading, error } = useTemplate(templateId);

  // Create demo data when template loads (without useState for simplicity)
  const demoInvitationData = templateData ? createDemoInvitationData(templateId, templateData) : null;

  // Initialize dynamic customizer for data transformation
  // IMPORTANT: Hook must be called unconditionally (React rules)
  // This hook processes customizer data from localStorage and merges it with template defaults
  const customizer = useDynamicCustomizer({
    templateId,
    templateData: templateData?.template || null,
    category: 'weddings' as 'weddings' | 'kids' | 'corporate'
  });

  // Get transformed data for rendering - this includes gallery_images processing
  // Uses getProgressiveMergedData() which applies touched fields over defaults
  const transformedData = templateData && customizer ? customizer.getProgressiveMergedData() : null;

  // Logs removed for performance

  // Handle download success callback
  const handleDownloadSuccess = () => {
    // Optional: Add any additional logic after successful download
  };

  // Handle PDF test button clicks - Now with 3 NEW IMPROVED variations for funnel testing
  const handlePDFTest = async (option: 'mobileA' | 'mobileB' | 'mobileC') => {
    if (!demoInvitationData) {
      return;
    }

    try {
      let result;

      switch (option) {
        case 'mobileA':
          result = await generatePDFMobileOptionA({
            filename: `demo-mobile-A-${templateId}.pdf`,
            quality: 0.95,
            waitTime: 3000
          });
          break;

        case 'mobileB':
          result = await generatePDFMobileOptionB({
            filename: `demo-mobile-B-${templateId}.pdf`,
            quality: 0.95,
            targetWidth: 375,
            targetHeight: 812
          });
          break;

        case 'mobileC':
          result = await generatePDFMobileOptionC({
            filename: `demo-mobile-C-${templateId}.pdf`,
            quality: 0.98,
            targetDPI: 150,
            smartScaling: true
          });
          break;

        default:
          return;
      }

      if (result.success) {
        alert(`PDF Mobile ${option} generado exitosamente!`);
      } else {
        alert(`Error en PDF Mobile ${option}: ${result.error}`);
      }

    } catch (error) {
      alert(`Error en PDF Mobile ${option}: ${error}`);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // Enhanced saveState handler to manage multiple customizers (desktop + mobile/embedded)
  const saveStateFunctionsRef = useRef<{
    desktop?: () => void;
    mobile?: () => void;
  }>({});

  // Capture saveState function from DynamicCustomizer (Desktop)
  const handleSaveStateReady = (saveStateFn: () => void) => {
    saveStateFunctionsRef.current.desktop = saveStateFn;
    // For backward compatibility, also set the main ref to desktop
    saveStateRef.current = saveStateFn;
  };

  // Capture saveState function from DynamicCustomizer (Mobile/Embedded)
  const handleMobileSaveStateReady = (saveStateFn: () => void) => {
    saveStateFunctionsRef.current.mobile = saveStateFn;
  };

  // Handle view mode changes with immediate save before iframe refresh
  const handleViewModeChange = (newMode: ViewMode) => {
    // Save state from CURRENT mode before switching
    const currentSaveFunction = viewMode === 'desktop'
      ? saveStateFunctionsRef.current.desktop
      : saveStateFunctionsRef.current.mobile;

    if (currentSaveFunction) {
      currentSaveFunction();
    }

    setViewMode(newMode);

    if (newMode === 'mobile') {
      // Small delay then refresh iframe
      setTimeout(() => {
        const iframe = document.querySelector('iframe[title="Vista móvil de la invitación"]') as HTMLIFrameElement;
        if (iframe) {
          iframe.src = iframe.src; // Force complete reload
        }
      }, 50);
    }
  };

  if (error || (!templateData && !isLoading)) {
    notFound();
  }

  const template = templateData?.template;
  const isPreparingDemo = templateData && !demoInvitationData;

  // If embedded mode, render only the template content with proper mobile viewport
  if (isEmbedded && templateData && demoInvitationData && template) {
    return (
      <>
        <head>
          <meta name="viewport" content="width=375, initial-scale=1, user-scalable=no" />
        </head>
        <div className="w-full h-full">
          <DynamicCustomizer
            templateData={template}
            sectionsConfig={template.sections_config}
            templateId={templateId}
            onSaveStateReady={handleMobileSaveStateReady}
          >
            <TemplateRenderer
              invitation={demoInvitationData.invitation}
              data={demoInvitationData.data}
              customPreviewData={transformedData || undefined}
              template={{
                ...template,
                template_file: template.template_file || `template_${template.id}`
              } as unknown as TemplateMetadata}
              colors={demoInvitationData.colors}
              features={template.supported_features}
              media={demoInvitationData.media}
              events={demoInvitationData.events}
              isPreview={true}
              isEditing={false}
            />
          </DynamicCustomizer>
        </div>
      </>
    );
  }

  return (
    <div className="relative">
      {/* Loading overlay for initial template loading */}
      <LoaderOverlay
        isLoading={isLoading}
        category="weddings"
        message="Cargando demo..."
        zIndex={70}
      />

      {/* Secondary loading overlay for demo data preparation */}
      <LoaderOverlay
        isLoading={isPreparingDemo}
        category="weddings"
        message="Preparando demo..."
        zIndex={70}
      />

      {/* Content renders underneath overlays */}
      {templateData && demoInvitationData && template && (
        <>
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

                <div className="flex items-center gap-4">
                  <ViewModeSwitcher
                    selectedMode={viewMode}
                    onModeChange={handleViewModeChange}
                  />
                  <DownloadButton
                    templateData={{
                      id: templateId,
                      name: template.name,
                      thumbnail_url: template.thumbnail_url,
                      preview_image_url: template.preview_image_url,
                      plan: template.plan,
                      is_premium: template.is_premium,
                      price: template.price
                    }}
                    buttonText="Descargar Invitación"
                    className="bg-purple-600 hover:bg-purple-700"
                    onDownloadComplete={handleDownloadSuccess}
                  />
                  <DirectDownloadButton
                    templateData={{
                      id: templateId,
                      name: template.name,
                      thumbnail_url: template.thumbnail_url,
                      preview_image_url: template.preview_image_url,
                      plan: template.plan,
                      is_premium: template.is_premium,
                      price: template.price
                    }}
                    buttonText="Descargar Auto"
                    className="bg-green-600 hover:bg-green-700"
                    onDownloadComplete={handleDownloadSuccess}
                  />

                  {/* PDF Test Buttons - 3 NEW IMPROVED Variations (Funnel System) */}
                  <div className="flex gap-2 ml-4 border-l pl-4">
                    <button
                      onClick={() => handlePDFTest('mobileA')}
                      className="px-3 py-1 text-xs bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors font-semibold"
                      title="Mobile A: Scale Fix (básico) - Corrige scale 2→1"
                    >
                      MA
                    </button>
                    <button
                      onClick={() => handlePDFTest('mobileB')}
                      className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors font-semibold"
                      title="Mobile B: Dimension Match (intermedio) - 375x812px exacto"
                    >
                      MB
                    </button>
                    <button
                      onClick={() => handlePDFTest('mobileC')}
                      className="px-3 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors font-semibold"
                      title="Mobile C: Smart Resolution (avanzado) - AI optimizado"
                    >
                      MC
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Template Content - Both modes always in DOM */}

          {/* Desktop View - Always in DOM, visibility controlled by class */}
          <div className={viewMode === 'desktop' ? 'block w-full' : 'hidden'}>
            <div id="template-content-wrapper">
              <DynamicCustomizer
                templateData={template}
                sectionsConfig={template.sections_config}
                templateId={templateId}
                onSaveStateReady={handleSaveStateReady}
              >
                <TemplateRenderer
                  invitation={demoInvitationData.invitation}
                  data={demoInvitationData.data}
                  customPreviewData={transformedData || undefined}
                  template={{
                    ...template,
                    template_file: template.template_file || `template_${template.id}`
                  } as unknown as TemplateMetadata}
                  colors={demoInvitationData.colors}
                  features={template.supported_features}
                  media={demoInvitationData.media}
                  events={demoInvitationData.events}
                  isPreview={true}
                  isEditing={false}
                />
              </DynamicCustomizer>
            </div>
          </div>

          {/* Mobile View - Always in DOM, visibility controlled by class */}
          <div className={viewMode === 'mobile' ? 'block' : 'hidden'}>
            <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-24 px-4 flex items-center justify-center">
              <div className="scale-75 sm:scale-90 lg:scale-100">
                <DeviceFrameset
                  device="iPhone X"
                  color="black"
                  landscape={false}
                >
                  <iframe
                    src={`/invitacion/demo/${templateId}?embedded=true`}
                    style={{
                      width: '375px',   // Real mobile viewport width
                      height: '812px',  // iPhone X height
                      border: 'none'
                    }}
                    title="Vista móvil de la invitación"
                  />
                </DeviceFrameset>
              </div>
            </div>
          </div>

          {/* Demo Notice - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 text-white text-center py-2 px-4">
            <p className="text-sm">
              Esta es una vista demo con datos de ejemplo - Tu invitación será completamente personalizada
            </p>
          </div>
        </>
      )}
    </div>
  );
}