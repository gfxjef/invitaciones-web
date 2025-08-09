'use client';

import { useState } from 'react';
import { ShoppingCart, MessageCircle, Eye, Check, Upload, Palette, Code, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Home() {
  const [activeTab, setActiveTab] = useState('standard');

  const processData = {
    standard: [
      {
        number: "1",
        title: "Adaptación",
        subtitle: "Esta etapa consiste en llenar la plantilla escogida con los datos de tu evento.",
        description: "Te solicitaremos toda la información como nombres de los novios, fecha y hora del evento principal, ubicación, fotos y todo lo que corresponda a la plantilla.",
        additionalInfo: "Una vez revisada y validada la información, publicaremos la invitación web, permitiéndote comenzar a compartirla.",
        timeframe: "tomar hasta 3 días hábiles después de recibida toda la información",
        icon: Upload
      }
    ],
    exclusivo: [
      {
        number: "1",
        title: "Etapa de Diseño",
        subtitle: "En esta etapa trabajaremos contigo para capturar la esencia y estilo de tu evento.",
        description: "Conversaremos de tus ideas, referencias y preferencias en una reunión inicial e iremos perfeccionando detalles como secciones, tipografía, colores y elementos gráficos.",
        additionalInfo: "Además, diseñaremos juntos tu sello de boda, que podrás usar luego en el resto de tu papelería.",
        note: "Asegúrate de tener algo en mente para poder agilizar este proceso. Puedes buscar inspiración en Pinterest, Freepik, Tiktok o Instagram.",
        timeframe: "tomar entre 1 y 2 semanas",
        icon: Palette
      },
      {
        number: "2",
        title: "Etapa de Desarrollo",
        subtitle: "En esta etapa, convertiremos el diseño aprobado en una web funcional e interactiva, asegurando que todos los elementos funcionen correctamente.",
        description: "Tras realizar pruebas y ajustes necesarios, haremos la publicación en tu dominio final. Además, te enseñaremos cómo generar los enlaces personalizados para cada invitado.",
        timeframe: "tomar 2 semanas",
        icon: Code
      }
    ]
  };

  const IconPattern = () => (
    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 via-blue-500 to-teal-400 flex items-center justify-center">
      <div className="w-8 h-8 bg-white rounded-md opacity-90"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">g</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">raphica</h1>
            <p className="text-xs text-gray-600 -mt-1">EVENTOS</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#inicio" className="text-gray-700 hover:text-purple-600 transition-colors">Inicio</a>
          <a href="#precios" className="text-gray-700 hover:text-purple-600 transition-colors">Precios</a>
          <a href="#proceso" className="text-gray-700 hover:text-purple-600 transition-colors">Proceso</a>
          <a href="#testimonios" className="text-gray-700 hover:text-purple-600 transition-colors">Testimonios</a>
          <a href="#cuenta" className="text-gray-700 hover:text-purple-600 transition-colors">Mi cuenta</a>
          <div className="flex items-center gap-1 text-gray-700">
            <ShoppingCart className="w-4 h-4" />
            <span className="text-red-500 font-medium">S/ 0.00</span>
          </div>
          <span className="text-sm text-gray-600">en</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="px-6 py-16 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-purple-400">Invitaciones</span><br />
                <span className="text-purple-400">Digitales</span><br />
                <span className="text-gray-800">para tu Boda</span>
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Haz que tu <strong>boda destaque desde el primer clic</strong> con invitaciones interactivas, 100% personalizadas y listas para compartir.
              </p>
            </div>

            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              Ir a Whatsapp
            </Button>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-1 max-w-md mx-auto">
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Wedding invitation preview"
                  className="w-full h-80 object-cover rounded-xl"
                />
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                  Dejar de silenciar
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-xl text-white">
                  <h3 className="text-xl font-bold mb-4">FALTAN</h3>
                  
                  <div className="grid grid-cols-4 gap-4 text-center mb-4">
                    <div>
                      <div className="text-2xl font-bold">269</div>
                      <div className="text-xs opacity-80">Días</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">14</div>
                      <div className="text-xs opacity-80">Horas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">45</div>
                      <div className="text-xs opacity-80">Minutos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">10</div>
                      <div className="text-xs opacity-80">Segundos</div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">
                    AGREGAR A MI CALENDARIO
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <p className="text-xs text-gray-600 mb-2">ACOMPAÑANOS EN ESTE MOMENTO</p>
              <h4 className="text-lg text-purple-600 font-script">Especial</h4>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">Imágenes referenciales</p>
            </div>
            
            <div className="absolute top-4 left-4 bg-purple-100 px-3 py-1 rounded text-purple-600 text-sm">
              REPRODUCE<br />EL VIDEO Y<br />ACTIVA EL<br />AUDIO
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="px-6 py-16 bg-white max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Precios que se adaptan a ti
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Diseño Standard */}
          <div className="border-2 border-purple-200 rounded-3xl p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold text-purple-600 mb-4">Diseño Standard</h3>
              <div className="mb-2">
                <span className="text-gray-400 text-xl line-through">S/ 440.00</span>
              </div>
              <div className="text-gray-600 text-sm mb-1">PAGO ÚNICO:</div>
              <div className="text-4xl font-bold text-gray-800">S/ 290.00</div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="text-purple-600 font-semibold text-sm mb-4 border-b border-gray-200 pb-2">
                  INCLUYE
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Variedad de modelos pre-diseñados</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Ubicación de eventos con Google Maps</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Música de fondo para destacar el evento</p>
                </div>
              </div>
            </div>

            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 text-lg rounded-xl mt-8 transition-all duration-300 hover:scale-105">
              Ver más →
            </Button>
          </div>

          {/* Diseño Exclusivo */}
          <div className="border-2 border-purple-200 rounded-3xl p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300 relative">
            <Badge className="absolute -top-3 right-8 bg-teal-500 text-white px-4 py-1 rounded-full transform rotate-12">
              MÁS POPULAR
            </Badge>
            
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold text-purple-600 mb-4">Diseño Exclusivo</h3>
              <div className="text-gray-600 text-sm mb-1">PAGO ÚNICO:</div>
              <div className="text-4xl font-bold text-gray-800">S/ 690.00</div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="text-purple-600 font-semibold text-sm mb-4 border-b border-gray-200 pb-2">
                  INCLUYE
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Invitación con nombre y dedicatoria por invitado</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Invitación con dedicatoria por invitado</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Confirmación de asistencia con campos adaptables</p>
                </div>
              </div>
            </div>

            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 text-lg rounded-xl mt-8 transition-all duration-300 hover:scale-105">
              Ver más →
            </Button>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
            Compara los 2 planes ℹ
          </Button>
        </div>

        <div className="flex items-center justify-center gap-4 mt-12">
          <span className="text-gray-700 font-medium">Aceptamos todas las tarjetas:</span>
          <div className="flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="American Express" className="h-8" />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-16 bg-gray-50 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-8">
            Preguntas frecuentes
          </h2>
          
          <Tabs defaultValue="standard" className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Standard
              </TabsTrigger>
              <TabsTrigger value="exclusivo" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Exclusivo
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-white rounded-lg border-0 shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                ¿Es un Creador de Invitaciones Virtuales?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                Sí, somos una plataforma especializada en la creación de invitaciones digitales personalizadas para bodas.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white rounded-lg border-0 shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                ¿Puedo modificar la estructura de la invitación?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                Dependiendo del plan elegido, puedes personalizar diferentes aspectos de tu invitación.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white rounded-lg border-0 shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                ¿Puedo cambiar la canción por defecto?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                Sí, puedes elegir la música que mejor represente tu estilo y momento especial.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white rounded-lg border-0 shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                ¿Incluye Hosting y dominio?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                Sí, incluimos hosting y un subdominio para tu invitación durante todo el periodo de tu evento.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white rounded-lg border-0 shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                Y si ya tengo un dominio ¿Puedo usarlo para mi invitación?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                Sí, podemos configurar tu invitación en tu dominio personal si lo prefieres.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-white rounded-lg border-0 shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                ¿Puedo tener invitaciones diferentes? Por ejemplo, una invitación solo para la ceremonia religiosa y otra solo para la fiesta o recepción?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                Sí, podemos crear invitaciones específicas para diferentes momentos de tu celebración.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="bg-white rounded-lg border-0 shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                ¿Podrán mis invitados confirmar su asistencia a través de esta invitación?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                Sí, incluimos un sistema de confirmación de asistencia integrado en la invitación.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="bg-white rounded-lg border-0 shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                ¿Cómo realizar el pago? ¿Permiten devoluciones?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                Aceptamos múltiples formas de pago. Las devoluciones se evalúan caso por caso.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="bg-white rounded-lg border-0 shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                ¿Dónde coloco mi cupón de descuento?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                Durante el proceso de checkout encontrarás el campo para ingresar tu cupón de descuento.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-6 py-16 bg-white max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-8">
            Compara los planes
          </h2>
        </div>

        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-6"></th>
                <th className="text-center py-4 px-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">Standard</h3>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                      Ver más
                    </Button>
                  </div>
                </th>
                <th className="text-center py-4 px-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">Exclusivo</h3>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                      Ver más
                    </Button>
                  </div>
                </th>
                <th className="text-center py-4 px-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">VIP</h3>
                    <Button size="sm" variant="secondary" className="bg-gray-400 text-white">
                      Pronto
                    </Button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 flex items-center gap-2">
                  <span>Nombres de los novios y fecha de la Boda.</span>
                  <Eye className="w-4 h-4 text-gray-400" />
                </td>
                <td className="text-center py-4 px-6">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </td>
                <td className="text-center py-4 px-6">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </td>
                <td className="text-center py-4 px-6">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </td>
              </tr>
              
              <tr className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 flex items-center gap-2">
                  <span>Datos del evento principal (fecha, dirección y hora).</span>
                  <Eye className="w-4 h-4 text-gray-400" />
                </td>
                <td className="text-center py-4 px-6">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </td>
                <td className="text-center py-4 px-6">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </td>
                <td className="text-center py-4 px-6">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </td>
              </tr>

              <tr className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 flex items-center gap-2">
                  <span>Datos de los eventos secundarios (horario y dirección).</span>
                  <Eye className="w-4 h-4 text-gray-400" />
                </td>
                <td className="text-center py-4 px-6">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </td>
                <td className="text-center py-4 px-6">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </td>
                <td className="text-center py-4 px-6">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6">
            <Button variant="link" className="text-purple-600 hover:text-purple-700">
              Ver más funciones
            </Button>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            * Algunos datos son referenciales. Las características están sujetas a cambio.
          </p>
        </div>
      </section>

      {/* Process Section */}
      <section id="proceso" className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-8">
              Proceso simple y efectivo
            </h2>
            
            {/* Custom Tabs */}
            <div className="flex justify-center items-center gap-8 mb-12">
              <button
                onClick={() => setActiveTab('standard')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'standard'
                    ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <Upload size={20} />
                Standard
              </button>
              <button
                onClick={() => setActiveTab('exclusivo')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'exclusivo'
                    ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <CheckCircle size={20} />
                Exclusivo
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-16">
            {processData[activeTab as keyof typeof processData].map((step, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  {/* Number */}
                  <div className="flex-shrink-0">
                    <div className="text-8xl md:text-9xl font-bold text-purple-200 leading-none">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-800">
                        {step.title}
                      </h3>
                      <IconPattern />
                    </div>

                    <p className="text-lg text-slate-700 font-medium">
                      {step.subtitle}
                    </p>

                    <p className="text-slate-600 leading-relaxed">
                      {step.description}
                    </p>

                    {step.additionalInfo && (
                      <p className="text-slate-600 leading-relaxed">
                        {step.additionalInfo}
                      </p>
                    )}

                    {(step as any).note && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-slate-700">
                          <span className="font-semibold text-purple-600">¡Aquí las referencias lo son todo!</span>{' '}
                          {(step as any).note}
                        </p>
                      </div>
                    )}

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-slate-700">
                        <span className="font-semibold">Tiempo estimado:</span>{' '}
                        <span className="font-medium text-purple-600">{step.timeframe}</span>
                        {step.timeframe.includes('después de recibida toda la información') && '.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="relative px-6 py-20 bg-slate-800/95 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          {/* Badge */}
          <div className="text-center mb-8">
            <Badge className="bg-white text-slate-800 px-4 py-2 text-sm font-medium rounded-full">
              Testimonios
            </Badge>
          </div>

          {/* Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              ¡Ellos amaron sus invitaciones!
            </h2>
            <p className="text-xl text-slate-300">
              Y nos dieron comentarios bonitos... 💜
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="relative">
              {/* Avatar with border */}
              <div className="absolute -top-8 left-8 z-10">
                <div className="w-16 h-16 rounded-full border-4 border-teal-400 overflow-hidden shadow-lg">
                  <img 
                    src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop"
                    alt="Cliente satisfecho"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Card */}
              <div className="bg-white rounded-3xl p-8 pt-12 shadow-2xl text-gray-800 hover:shadow-3xl transition-all duration-300">
                <p className="text-lg leading-relaxed mb-6">
                  El trabajo fue excelente, superaron todas mis expectativas y capturaron perfectamente la esencia de nuestra celebración.{' '}
                  <span className="text-teal-500 font-semibold">¡Definitivamente recomiendo sus servicios!</span>{' '}
                  Muchas gracias por hacer que este momento sea aún más especial.
                </p>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-bold text-purple-600 text-lg">Invitación de Bodas</h4>
                  <p className="text-purple-400 font-medium">PERÚ 2024</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="relative lg:mt-16">
              {/* Avatar with border */}
              <div className="absolute -top-8 right-8 z-10">
                <div className="w-16 h-16 rounded-full border-4 border-teal-400 overflow-hidden shadow-lg">
                  <img 
                    src="https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop"
                    alt="Cliente satisfecho"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Card */}
              <div className="bg-white rounded-3xl p-8 pt-12 shadow-2xl text-gray-800 hover:shadow-3xl transition-all duration-300">
                <p className="text-lg leading-relaxed mb-6">
                  ¡Muchas gracias por el desarrollo de la invitación, estamos muy agradecidos, muchos de los que ya la tienen han dicho{' '}
                  <span className="text-teal-500 font-semibold">que está súper linda!</span>
                </p>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-bold text-purple-600 text-lg">Invitación de Bodas</h4>
                  <p className="text-purple-400 font-medium">PERÚ 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-teal-400 to-transparent opacity-30"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">¿Quiénes somos?</h3>
              <p className="text-gray-600 leading-relaxed">
                Somos Graphica Digital Projects, una <strong>agencia de Desarrollo Web con más de 8 años de experiencia</strong> liderando proyectos en diferentes países de Latinoamérica y Norteamérica. Tenemos experiencia en diferentes sectores.
              </p>
              <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors font-medium">
                Políticas de Privacidad
              </a>
              
              {/* Social Media */}
              <div className="flex items-center gap-4">
                <a href="#" className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Paga rápido y seguro:</h3>
              <p className="text-gray-600">Aceptamos todas las tarjetas</p>
              
              {/* Payment Logos */}
              <div className="space-y-4">
                <img src="https://izipay.pe/wp-content/uploads/2021/07/logo-izipay.png" alt="Izipay" className="h-8" />
                
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200 max-w-xs">
                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ENCUÉNTRANOS EN</p>
                    <p className="text-sm font-medium text-gray-800">matrimonio.com.pe</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Ponte en contacto:</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-medium">+51 980 046 616</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <span className="text-gray-700 font-medium">s@graphica.pe</span>
                </div>
              </div>

              {/* Complaint Book */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Libro de reclamaciones</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-gray-300 mt-12 pt-8 text-center">
            <p className="text-gray-600">
              © 2024 Graphica Eventos. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}