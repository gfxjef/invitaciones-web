/**
 * Template Detail Page (/plantillas/[id])
 * 
 * WHY: Detailed view of a specific template where users can see full
 * preview, features, and make purchase decisions. Critical conversion
 * page with comprehensive product information.
 * 
 * WHAT: Dynamic page that fetches template details, displays preview
 * gallery, features list, and provides add-to-cart functionality.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  Eye, 
  Check,
  ExternalLink,
  Palette,
  Music,
  MapPin,
  Users,
  Clock,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTemplate } from '@/lib/hooks/use-templates';
import { useAddTemplateToCart } from '@/lib/hooks/use-cart';
import { useHasCartItem } from '@/store/cartStore';

// Feature icons mapping
const featureIcons: Record<string, any> = {
  'custom_colors': Palette,
  'background_music': Music,
  'google_maps': MapPin,
  'rsvp_system': Users,
  'countdown_timer': Clock,
  'password_protection': Shield,
};

interface TemplateDetailPageProps {
  params: {
    id: string;
  };
}

export default function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const router = useRouter();
  const templateId = parseInt(params.id);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Validate ID
  if (isNaN(templateId) || templateId <= 0) {
    notFound();
  }

  // API calls
  const { data: templateData, isLoading, error } = useTemplate(templateId);
  const { addTemplate, isPending } = useAddTemplateToCart();
  const isInCart = useHasCartItem(templateId);

  if (isLoading) {
    return <TemplateDetailSkeleton />;
  }

  if (error || !templateData) {
    notFound();
  }

  const template = templateData.template;

  // Mock additional images for gallery (in real app, these would come from API)
  const galleryImages = [
    template.preview_image_url,
    template.thumbnail_url,
    // Add more preview images if available
  ].filter(Boolean);

  const handleAddToCart = () => {
    addTemplate(template);
  };

  const handleViewDemo = () => {
    // Open demo in new tab
    window.open(`/invitacion/demo/${template.id}`, '_blank');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={handleGoBack}
            className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a plantillas
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[3/4] bg-white rounded-xl shadow-sm overflow-hidden">
              <img
                src={galleryImages[selectedImageIndex] || '/placeholder-template.jpg'}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex
                        ? 'border-purple-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Demo Button */}
            <Button
              variant="outline"
              className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
              onClick={handleViewDemo}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Demo en Vivo
            </Button>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
                {template.is_premium && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              
              {template.category && (
                <Badge variant="outline" className="mb-4">
                  {template.category}
                </Badge>
              )}
              
              <p className="text-lg text-gray-600 leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {template.is_premium ? 'S/ 690.00' : 'S/ 290.00'}
                  </p>
                  <p className="text-gray-600">Pago único</p>
                </div>
                <div className="text-right">
                  {template.is_premium && (
                    <p className="text-gray-400 line-through">S/ 790.00</p>
                  )}
                  <p className="text-green-600 font-medium">
                    {template.is_premium ? 'Ahorra S/ 100' : 'Mejor precio'}
                  </p>
                </div>
              </div>

              <Button
                className={`w-full py-3 ${
                  isInCart 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                onClick={handleAddToCart}
                disabled={isPending}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isInCart ? 'Ya en el Carrito' : isPending ? 'Agregando...' : 'Agregar al Carrito'}
              </Button>
            </div>

            {/* Features */}
            {template.supported_features && template.supported_features.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Características incluidas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {template.supported_features.map((feature, index) => {
                    const IconComponent = featureIcons[feature] || Check;
                    return (
                      <div key={index} className="flex items-center text-gray-700">
                        <IconComponent className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="capitalize">
                          {feature.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Scheme */}
            {template.default_colors && Object.keys(template.default_colors).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Colores por defecto
                </h3>
                <div className="flex gap-3">
                  {Object.entries(template.default_colors).map(([name, color]) => (
                    <div key={name} className="text-center">
                      <div
                        className="w-12 h-12 rounded-full border border-gray-200 mb-2"
                        style={{ backgroundColor: color as string }}
                      />
                      <p className="text-xs text-gray-600 capitalize">{name}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  * Los colores se pueden personalizar durante el proceso de adaptación
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="process">Proceso</TabsTrigger>
              <TabsTrigger value="support">Soporte</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Detalles de la plantilla
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Incluido en {template.is_premium ? 'Premium' : 'Standard'}</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Adaptación personalizada
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Hosting incluido
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Subdominio gratuito
                      </li>
                      {template.is_premium && (
                        <>
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-green-600 mr-2" />
                            Diseño 100% personalizado
                          </li>
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-green-600 mr-2" />
                            Sistema de confirmación avanzado
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Especificaciones técnicas</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Responsive design</li>
                      <li>• Compatible con móviles</li>
                      <li>• Carga rápida optimizada</li>
                      <li>• SEO optimizado</li>
                      <li>• Certificado SSL incluido</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="process" className="mt-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Proceso de {template.is_premium ? 'diseño y desarrollo' : 'adaptación'}
                </h3>
                <div className="space-y-6">
                  {template.is_premium ? (
                    <>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Etapa de Diseño</h4>
                          <p className="text-gray-600">Trabajamos contigo para crear un diseño único basado en tus ideas y referencias.</p>
                          <p className="text-sm text-purple-600 font-medium">1-2 semanas</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Etapa de Desarrollo</h4>
                          <p className="text-gray-600">Convertimos el diseño en una web funcional y la publicamos en tu dominio.</p>
                          <p className="text-sm text-purple-600 font-medium">2 semanas</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Adaptación</h4>
                        <p className="text-gray-600">Llenamos la plantilla con los datos de tu evento y la publicamos.</p>
                        <p className="text-sm text-purple-600 font-medium">3 días hábiles</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="support" className="mt-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Soporte y garantías
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Soporte incluido</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Asesoría durante todo el proceso
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Soporte técnico por WhatsApp
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Guía para generar enlaces
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        Backup de tu invitación
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Garantías</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Hosting garantizado hasta 1 año después del evento</li>
                      <li>• 100% de tiempo de actividad</li>
                      <li>• Certificado SSL incluido</li>
                      <li>• Copias de seguridad diarias</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
function TemplateDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="w-64 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-full h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
              <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-full h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}