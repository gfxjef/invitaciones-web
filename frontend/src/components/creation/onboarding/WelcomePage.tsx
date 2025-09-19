/**
 * Welcome Page Component
 * 
 * WHY: Landing page for invitation creation that introduces new users
 * to the platform, showcases features and templates, and provides
 * clear pathways to start creating invitations.
 * 
 * WHAT: Comprehensive welcome interface with feature highlights,
 * template previews, testimonials, pricing information, and
 * multiple creation entry points (quick start vs full wizard).
 * 
 * HOW: Uses engaging visuals, clear value propositions, social proof,
 * and intuitive navigation to guide users toward invitation creation.
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Zap, 
  Settings,
  Heart,
  Users,
  Globe,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Clock,
  Palette,
  Share2,
  Shield,
  Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTemplates } from '@/lib/hooks/use-templates';

interface WelcomePageProps {
  onStartQuick: () => void;
  onStartFull: () => void;
  onStartTour: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onStartQuick,
  onStartFull,
  onStartTour
}) => {
  const [activeFeature, setActiveFeature] = useState(0);
  const { user } = useAuth();
  const { data: templatesData } = useTemplates({ page: 1, per_page: 6 });

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Creación Rápida',
      description: 'Tu invitación lista en menos de 5 minutos con nuestro asistente inteligente.',
      color: 'bg-yellow-500'
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Personalización Total',
      description: 'Más de 50 plantillas profesionales totalmente personalizables.',
      color: 'bg-purple-500'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Gestión de Invitados',
      description: 'RSVP automático, seguimiento de confirmaciones y recordatorios.',
      color: 'bg-blue-500'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Compartir Fácil',
      description: 'URL personalizada, códigos QR y compartir en todas las redes sociales.',
      color: 'bg-green-500'
    }
  ];

  const testimonials = [
    {
      name: 'María y Carlos',
      event: 'Boda • Lima',
      rating: 5,
      text: 'Increíble plataforma. Nuestra invitación quedó preciosa y todos nuestros invitados la amaron.',
      image: '/testimonial-1.jpg'
    },
    {
      name: 'Ana Sofía',
      event: 'Quinceañero • Arequipa',
      rating: 5,
      text: 'Super fácil de usar. En 10 minutos tenía mi invitación lista y publicada.',
      image: '/testimonial-2.jpg'
    },
    {
      name: 'Jorge y Carmen',
      event: 'Aniversario • Cusco',
      rating: 5,
      text: 'El soporte al cliente es excelente. Nos ayudaron a personalizar cada detalle.',
      image: '/testimonial-3.jpg'
    }
  ];

  const plans = [
    {
      name: 'Standard',
      price: 290,
      period: 'por invitación',
      description: 'Perfecto para eventos íntimos',
      features: [
        'Plantillas profesionales',
        'Personalización completa',
        'URL personalizada',
        'RSVP básico',
        'Soporte por email'
      ],
      popular: false
    },
    {
      name: 'Exclusive',
      price: 690,
      period: 'por invitación',
      description: 'La experiencia completa premium',
      features: [
        'Todo lo del plan Standard',
        'Plantillas exclusivas premium',
        'Diseños completamente personalizados',
        'RSVP avanzado con seguimiento',
        'Galería ilimitada de fotos',
        'Soporte prioritario 24/7',
        'Código QR personalizado',
        'Analíticas detalladas'
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-white">
              <Badge className="bg-white/20 text-white border-white/30 mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Bienvenid{user?.first_name ? `a ${user.first_name}` : 'o'}
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Crea tu
                <span className="block text-yellow-300">
                  Invitación Perfecta
                </span>
              </h1>
              
              <p className="text-xl text-purple-100 mb-8 max-w-md">
                Diseña, personaliza y comparte invitaciones digitales únicas para tus 
                momentos más especiales.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  onClick={onStartQuick}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Creación Rápida (3 min)
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onStartFull}
                  className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Personalización Completa
                </Button>
              </div>

              {/* Tour Link */}
              <button
                onClick={onStartTour}
                className="flex items-center text-purple-100 hover:text-white transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Ver cómo funciona (2 min)
              </button>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4 transform rotate-2">
                {templatesData?.templates.slice(0, 4).map((template, index) => (
                  <div 
                    key={template.id}
                    className={`aspect-[3/4] rounded-xl overflow-hidden shadow-xl ${
                      index % 2 === 0 ? 'transform -rotate-2' : 'transform rotate-2'
                    }`}
                    style={{
                      animationDelay: `${index * 0.2}s`,
                      animation: 'fadeInScale 0.6s ease-out forwards'
                    }}
                  >
                    <img
                      src={template.preview_image_url || '/placeholder-template.jpg'}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">2,500+</div>
                    <div className="text-xs text-gray-600">Invitaciones creadas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas para crear invitaciones increíbles
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Desde plantillas profesionales hasta herramientas avanzadas de personalización,
            tenemos todo cubierto.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Features List */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  activeFeature === index
                    ? 'bg-white shadow-lg border-2 border-purple-200'
                    : 'bg-gray-50 hover:bg-white hover:shadow-md'
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Visual */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 flex items-center justify-center">
              <div className={`w-24 h-24 rounded-2xl ${features[activeFeature].color} flex items-center justify-center text-white shadow-2xl`}>
                {React.cloneElement(features[activeFeature].icon, { className: 'w-12 h-12' })}
              </div>
            </div>
            
            {/* Floating Benefits */}
            <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Ahorra 80% del tiempo</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Diseños únicos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Showcase */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Plantillas Diseñadas por Profesionales
            </h2>
            <p className="text-xl text-gray-600">
              Más de 50 diseños únicos para cada tipo de celebración
            </p>
          </div>

          {templatesData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {templatesData.templates.slice(0, 6).map(template => (
                <div key={template.id} className="group cursor-pointer">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                    <img
                      src={template.preview_image_url || '/placeholder-template.jpg'}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      {template.is_premium && (
                        <Badge className="bg-purple-600 text-white">Premium</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{template.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Ver todas las plantillas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Parejas felices en todo el Perú
            </h2>
            <div className="flex items-center justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
              ))}
              <span className="text-lg font-semibold ml-2">4.9/5 (2,500+ reseñas)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-gray-600 mb-4">
                  "{testimonial.text}"
                </blockquote>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.event}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Precios Transparentes
            </h2>
            <p className="text-xl text-gray-600">
              Elige el plan perfecto para tu celebración
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl p-8 shadow-lg ${
                  plan.popular ? 'ring-2 ring-purple-600 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white px-6 py-2">
                      Más Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    S/ {plan.price}
                  </div>
                  <div className="text-gray-600 mb-4">{plan.period}</div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  size="lg"
                >
                  Comenzar con {plan.name}
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 text-gray-600">
            <Shield className="w-5 h-5 inline mr-2" />
            Garantía de devolución de 30 días • Soporte incluido
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            ¿Listo para crear tu invitación perfecta?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Únete a miles de parejas que ya confiaron en nosotros para sus momentos especiales
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={onStartQuick}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4"
            >
              <Zap className="w-5 h-5 mr-2" />
              Empezar Ahora (Gratis)
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={onStartTour}
              className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4"
            >
              <Play className="w-5 h-5 mr-2" />
              Ver Demo
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-purple-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Sin tarjeta de crédito
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              Soporte 24/7
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Fácil de compartir
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;