/**
 * Review & Publish Step Component
 * 
 * WHY: Final step that provides comprehensive review of the invitation,
 * validation checklist, SEO optimization, and publication controls.
 * Critical for ensuring invitation quality before going live.
 * 
 * WHAT: Complete review interface showing all invitation sections,
 * validation status, publication checklist, URL customization,
 * sharing options, and final publish controls.
 * 
 * HOW: Aggregates data from all previous steps, performs final
 * validation, generates preview, and handles publication workflow.
 */

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Globe, 
  Share2, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  QrCode,
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  Sparkles,
  Settings,
  Loader2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WizardStep, StepSection, StepField } from '../WizardStep';
import { WizardStepProps } from '../InvitationWizard';

interface ValidationItem {
  id: string;
  label: string;
  isValid: boolean;
  isRequired: boolean;
  description?: string;
}

export const ReviewPublishStep: React.FC<WizardStepProps> = ({
  data,
  errors,
  onUpdate,
  onBack,
  isLoading
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState(data.url_slug || '');
  const [seoData, setSeoData] = useState({
    title: data.seo_title || `${data.couple_groom_name || ''} & ${data.couple_bride_name || ''}`,
    description: data.seo_description || `Te invitamos a celebrar nuestro matrimonio el ${data.event_date || '[fecha]'}`,
    image: data.gallery_hero_image || ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Validation checklist
  const validationItems: ValidationItem[] = [
    {
      id: 'template',
      label: 'Plantilla seleccionada',
      isValid: !!data.template_id,
      isRequired: true,
      description: 'Se debe seleccionar una plantilla base'
    },
    {
      id: 'couple_names',
      label: 'Nombres de la pareja',
      isValid: !!(data.couple_groom_name && data.couple_bride_name),
      isRequired: true,
      description: 'Nombres del novio y la novia son obligatorios'
    },
    {
      id: 'event_date',
      label: 'Fecha del evento',
      isValid: !!data.event_date,
      isRequired: true,
      description: 'La fecha de la boda es requerida'
    },
    {
      id: 'venue_name',
      label: 'Nombre del venue',
      isValid: !!data.event_venue_name,
      isRequired: true,
      description: 'El lugar del evento debe estar especificado'
    },
    {
      id: 'hero_image',
      label: 'Imagen principal',
      isValid: !!data.gallery_hero_image,
      isRequired: true,
      description: 'Se requiere al menos una foto como imagen principal'
    },
    {
      id: 'event_time',
      label: 'Hora del evento',
      isValid: !!data.event_time,
      isRequired: false,
      description: 'Recomendado para mejor experiencia'
    },
    {
      id: 'contact_info',
      label: 'Información de contacto',
      isValid: !!(data.contact_groom_email || data.contact_bride_email || data.contact_joint_email),
      isRequired: false,
      description: 'Útil para que los invitados puedan contactarte'
    }
  ];

  const requiredItems = validationItems.filter(item => item.isRequired);
  const requiredValid = requiredItems.filter(item => item.isValid).length;
  const totalRequired = requiredItems.length;
  const allRequiredValid = requiredValid === totalRequired;

  const optionalItems = validationItems.filter(item => !item.isRequired);
  const optionalValid = optionalItems.filter(item => item.isValid).length;
  const completionPercentage = Math.round(((requiredValid + optionalValid) / validationItems.length) * 100);

  useEffect(() => {
    // Generate URL slug if not exists
    if (!customSlug && data.couple_groom_name && data.couple_bride_name) {
      const slug = `${data.couple_groom_name}-${data.couple_bride_name}`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');
      setCustomSlug(slug);
    }
  }, [data.couple_groom_name, data.couple_bride_name, customSlug]);

  const handlePublish = async () => {
    if (!allRequiredValid) return;
    
    setIsPublishing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const url = `https://invitaciones.com/${customSlug}`;
      setPublishedUrl(url);
      onUpdate('published_url', url);
      onUpdate('status', 'published');
    } catch (error) {
      console.error('Error publishing invitation:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyUrl = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      // Show toast notification
    }
  };

  const handleSocialShare = (platform: string) => {
    if (!publishedUrl) return;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publishedUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(publishedUrl)}&text=${encodeURIComponent(seoData.title)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${seoData.title} ${publishedUrl}`)}`
    };
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  return (
    <WizardStep isLoading={isLoading}>
      <div className="space-y-8">
        {/* Publication Status */}
        {publishedUrl ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">¡Invitación Publicada!</h3>
                  <p className="text-green-800 mt-1">
                    Tu invitación está ahora disponible en línea y lista para compartir.
                  </p>
                  <div className="mt-3 p-3 bg-white border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-gray-700">{publishedUrl}</span>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                          <Copy className="w-4 h-4 mr-1" />
                          Copiar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(publishedUrl, '_blank')}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center">
              <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-purple-900">Lista para Publicar</h3>
                <p className="text-purple-800 mt-1">
                  Revisa tu invitación y publícala cuando estés listo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Validation Checklist */}
        <StepSection 
          title="Lista de Verificación"
          description="Asegúrate de que todo esté completo antes de publicar"
        >
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Required Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Elementos Requeridos ({requiredValid}/{totalRequired})
                </h4>
                <div className="space-y-3">
                  {requiredItems.map(item => (
                    <div key={item.id} className="flex items-start">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                        item.isValid ? 'bg-green-600' : 'bg-gray-300'
                      }`}>
                        {item.isValid && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <span className={`font-medium ${item.isValid ? 'text-gray-900' : 'text-gray-600'}`}>
                          {item.label}
                        </span>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  Elementos Opcionales ({optionalValid}/{optionalItems.length})
                </h4>
                <div className="space-y-3">
                  {optionalItems.map(item => (
                    <div key={item.id} className="flex items-start">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                        item.isValid ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                        {item.isValid && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <span className={`font-medium ${item.isValid ? 'text-gray-900' : 'text-gray-600'}`}>
                          {item.label}
                        </span>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-semibold text-gray-900">
                    Completitud: {completionPercentage}%
                  </span>
                  <p className="text-sm text-gray-600">
                    {allRequiredValid ? 'Lista para publicar' : 'Completa los elementos requeridos'}
                  </p>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </StepSection>

        {/* URL Configuration */}
        <StepSection 
          title="Configuración de URL"
          description="Personaliza la dirección web de tu invitación"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StepField 
              label="URL Personalizada"
              description="Crea una URL fácil de recordar y compartir"
            >
              <div className="flex">
                <div className="bg-gray-100 px-4 py-3 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-600">
                  invitaciones.com/
                </div>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ''))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="carlos-maria-2024"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Solo letras, números y guiones. Debe ser único.
              </p>
            </StepField>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Vista Previa de la URL</h4>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-sm font-mono text-purple-600">
                  https://invitaciones.com/{customSlug || 'tu-url-personalizada'}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Esta será la dirección que compartas con tus invitados
                </div>
              </div>
            </div>
          </div>
        </StepSection>

        {/* SEO Optimization */}
        <StepSection 
          title="Optimización para Compartir"
          description="Configura cómo se ve tu invitación al compartirse en redes sociales"
        >
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Ocultar configuración avanzada' : 'Mostrar configuración avanzada'}
            </Button>

            {showAdvanced && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StepField 
                  label="Título para Compartir"
                  description="Título que aparece al compartir en redes sociales"
                >
                  <input
                    type="text"
                    value={seoData.title}
                    onChange={(e) => setSeoData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    maxLength={60}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {seoData.title.length}/60
                  </div>
                </StepField>

                <StepField 
                  label="Descripción para Compartir"
                  description="Descripción que aparece al compartir"
                >
                  <textarea
                    value={seoData.description}
                    onChange={(e) => setSeoData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={160}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {seoData.description.length}/160
                  </div>
                </StepField>
              </div>
            )}

            {/* Social Preview */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Vista Previa al Compartir</h4>
              <div className="max-w-md bg-white border border-gray-200 rounded-lg overflow-hidden">
                {seoData.image && (
                  <img 
                    src={seoData.image} 
                    alt="Preview" 
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h5 className="font-semibold text-gray-900 text-sm mb-1">
                    {seoData.title}
                  </h5>
                  <p className="text-xs text-gray-600 mb-2">
                    {seoData.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    invitaciones.com/{customSlug}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </StepSection>

        {/* Sharing Options */}
        {publishedUrl && (
          <StepSection 
            title="Compartir Invitación"
            description="Comparte tu invitación con familiares y amigos"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center justify-center p-4 h-auto"
              >
                <MessageCircle className="w-6 h-6 mb-2 text-green-600" />
                <span className="text-sm">WhatsApp</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center justify-center p-4 h-auto"
              >
                <Facebook className="w-6 h-6 mb-2 text-blue-600" />
                <span className="text-sm">Facebook</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center justify-center p-4 h-auto"
              >
                <Instagram className="w-6 h-6 mb-2 text-purple-600" />
                <span className="text-sm">Instagram</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {/* Generate QR Code */}}
                className="flex items-center justify-center p-4 h-auto"
              >
                <QrCode className="w-6 h-6 mb-2 text-gray-600" />
                <span className="text-sm">Código QR</span>
              </Button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Tips para Compartir</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Comparte el enlace directamente por WhatsApp o email</li>
                <li>• Usa el código QR para invitaciones impresas</li>
                <li>• Publica en tus historias de Instagram con el enlace en tu bio</li>
                <li>• Envía el enlace con un mensaje personalizado</li>
              </ul>
            </div>
          </StepSection>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          {!publishedUrl ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {/* Generate Preview */}}
                className="flex-1"
              >
                <Eye className="w-5 h-5 mr-2" />
                Vista Previa Final
              </Button>

              <Button
                size="lg"
                onClick={handlePublish}
                disabled={!allRequiredValid || isPublishing}
                className="flex-1"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5 mr-2" />
                    Publicar Invitación
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open(publishedUrl, '_blank')}
                className="flex-1"
              >
                <Eye className="w-5 h-5 mr-2" />
                Ver Invitación
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleCopyUrl}
                className="flex-1"
              >
                <Copy className="w-5 h-5 mr-2" />
                Copiar Enlace
              </Button>

              <Button
                size="lg"
                onClick={() => {/* Download or share options */}}
                className="flex-1"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Compartir Ahora
              </Button>
            </div>
          )}

          {/* Warning for incomplete items */}
          {!allRequiredValid && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">
                    Elementos requeridos faltantes
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Completa todos los elementos requeridos antes de poder publicar tu invitación.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Información de contacto
          </button>
          
          {publishedUrl && (
            <Button
              onClick={() => window.location.href = '/mi-cuenta/invitaciones'}
            >
              Ir a Mis Invitaciones
            </Button>
          )}
        </div>
      </div>
    </WizardStep>
  );
};

export default ReviewPublishStep;