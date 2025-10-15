import React, { useState, useEffect } from "react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { calculateUpgrade, createUpgradeOrder } from "@/lib/api/invitations";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface PlanSelectorProps {
  isOpen?: boolean;
  onClose?: () => void;
  onPremiumUnlock?: () => void;
  asModal?: boolean;
  currentPlanId?: number;  // Plan actual del usuario (1 = Básico, 2 = Premium)
  invitationId?: number;   // ID de la invitación para upgrade
}

export default function PlanSelector({
  isOpen = false,
  onClose,
  onPremiumUnlock,
  asModal = false,
  currentPlanId = 1,  // Por defecto Plan Básico
  invitationId
}: PlanSelectorProps = {}) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeAmount, setUpgradeAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Determinar si el usuario ya tiene este plan
  const isCurrentBasicPlan = currentPlanId === 1;

  // Calcular el monto del upgrade cuando el componente se monta
  useEffect(() => {
    if (isCurrentBasicPlan && invitationId && isOpen) {
      loadUpgradeAmount();
    }
  }, [isCurrentBasicPlan, invitationId, isOpen]);

  const loadUpgradeAmount = async () => {
    if (!invitationId) return;

    setLoading(true);
    try {
      const result = await calculateUpgrade(invitationId);
      setUpgradeAmount(result.amount_to_pay);
      console.log('Upgrade calculation:', result);
    } catch (error) {
      console.error('Error calculating upgrade:', error);
      // No mostrar error, solo usar precio por defecto
    } finally {
      setLoading(false);
    }
  };

  // Textos dinámicos para botones
  const basicButtonText = isCurrentBasicPlan ? "Plan Actual" : "Seleccionar Plan Básico";
  const premiumButtonText = isUpgrading
    ? "Procesando..."
    : isCurrentBasicPlan
      ? "🔓 Mejora tu plan"
      : "✓ Plan Seleccionado";

  const handlePremiumClick = async () => {
    if (selectedPlan === "premium") {
      // Si es plan básico, crear orden de upgrade y redirigir a checkout
      if (isCurrentBasicPlan && invitationId) {
        setIsUpgrading(true);
        try {
          // Crear orden de upgrade
          const result = await createUpgradeOrder(invitationId);
          console.log('Upgrade order created:', result);

          toast.success(`Orden creada: S/ ${result.amount_to_pay.toFixed(2)}`);

          // Redirigir al checkout con el order_id
          router.push(`/checkout?order_id=${result.order_id}`);

          // Cerrar modal
          if (onClose) {
            onClose();
          }
        } catch (error) {
          console.error('Error creating upgrade order:', error);
          toast.error('Error al crear orden de upgrade');
          setIsUpgrading(false);
          return;
        }
        // No resetear isUpgrading aquí porque estamos redirigiendo
      } else if (onPremiumUnlock) {
        // Si ya es Premium o no hay invitationId, ejecutar callback
        onPremiumUnlock();

        if (onClose) {
          onClose();
        }
      }
    } else {
      setSelectedPlan("premium");
    }
  };

  const basicFeatures = [
    { text: "1 edición de información", included: true },
    { text: "Descarga en PDF de invitación", included: true },
    { text: "Link predefinido de invitación", included: true },
    { text: "Countdown de fecha de evento en la web", included: true },
    { text: "Botón de locación para PDF y web", included: true },
    { text: "Botones de confirmación a WhatsApp", included: true },
  ];

  const premiumFeatures = [
    { text: "3 ediciones de información", included: true, highlight: true },
    { text: "Descarga en PDF de invitación", included: true },
    { text: "Link personalizado de invitación", included: true, highlight: true },
    { text: "Descarga de QR con diseño personalizado", included: true, highlight: true },
    { text: "Estadísticas de acceso a la invitación", included: true, highlight: true },
  ];

  const content = (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      asModal
        ? 'bg-transparent'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="w-full max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${
            asModal ? 'text-white' : 'text-gray-900'
          }`}>
            Elige el plan perfecto
          </h1>
          <p className={`text-lg ${
            asModal ? 'text-white' : 'text-gray-600'
          }`}>
            Crea invitaciones digitales inolvidables para tu evento
          </p>
        </div>

        {/* Plans Grid - Siempre lado a lado, centrados verticalmente */}
        <div className="grid grid-cols-2 gap-0 max-w-6xl mx-auto items-center">
          {/* PLAN BÁSICO - Centrado verticalmente con padding-right para evitar overlap */}
          <div className="relative bg-white rounded-3xl shadow-xl p-6 pr-16 border-2 border-gray-200 transition-all hover:border-gray-300 hover:shadow-2xl z-10">
            <div className="text-center mb-4">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-3">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Plan Básico
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Ideal para comenzar con tu evento
              </p>

              {/* Price */}
              <div className="mb-4">
                <div className="text-5xl font-black text-gray-900">
                  <span className="text-3xl">S/</span>99
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Para siempre
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2.5 mb-5">
              {basicFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setSelectedPlan("basic")}
              disabled={isCurrentBasicPlan}
              className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all transform hover:scale-105 ${
                isCurrentBasicPlan
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-default shadow-lg shadow-blue-500/30"
                  : selectedPlan === "basic"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200"
              }`}
            >
              {basicButtonText}
            </button>
          </div>

          {/* PLAN PREMIUM - Destacado y superpuesto */}
          <div className="relative rounded-3xl overflow-hidden transition-all hover:scale-105 shadow-2xl -ml-12 z-20">
            {/* Badge "Recomendado" */}
            <div className="absolute top-6 right-6 z-10">
              <span className="inline-flex items-center gap-1 px-4 py-2 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-xl animate-pulse">
                ⭐ Recomendado
              </span>
            </div>

            {/* Gradiente oscuro profundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-800"></div>

            {/* Capa de brillo */}
            <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-600/30 via-purple-600/20 to-transparent"></div>

            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-60 animate-pulse"></div>

            {/* Contenido */}
            <div className="relative backdrop-blur-sm bg-black/20 p-8 border border-white/10 rounded-3xl">
              <div className="text-center mb-6">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl mb-4 shadow-2xl shadow-yellow-500/50">
                  <svg className="w-10 h-10 text-purple-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  Plan Premium
                  <span className="text-2xl">✨</span>
                </h3>
                <p className="text-sm text-purple-200 mb-6">
                  Todo lo que necesitas para impresionar
                </p>

                {/* Price */}
                <div className="mb-6">
                  {isCurrentBasicPlan && upgradeAmount !== null ? (
                    // Mostrar precio diferencial para upgrade
                    <>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl text-yellow-300 font-bold">S/</span>
                        <span className="text-6xl font-black text-white">{upgradeAmount.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="px-3 py-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-400/30">
                          💰 Solo pagas la diferencia
                        </span>
                      </div>
                      <p className="text-sm text-purple-200 mt-2">
                        Upgrade • Mejora tu plan ahora
                      </p>
                    </>
                  ) : (
                    // Precio completo para compra nueva
                    <>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl text-yellow-300 font-bold">S/</span>
                        <span className="text-6xl font-black text-white">{loading ? "..." : "140"}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="text-sm text-purple-300 line-through">S/ 200</span>
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-400/30">
                          -30% OFF
                        </span>
                      </div>
                      <p className="text-sm text-purple-200 mt-2">
                        Pago único • Para siempre
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {/* Texto destacado - Todo lo básico incluido */}
                <div className="mb-4 pb-4 border-b border-purple-500/30">
                  <p className="text-white font-bold text-sm flex items-center gap-2">
                    <span className="text-yellow-300">✓</span>
                    Todo lo de la versión Básica más...
                  </p>
                </div>

                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-emerald-300 font-bold" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className={`text-sm leading-relaxed ${
                      feature.highlight
                        ? "text-white font-semibold"
                        : "text-purple-100"
                    }`}>
                      {feature.text}
                      {feature.highlight && (
                        <span className="inline-block ml-2 text-yellow-300">⚡</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={handlePremiumClick}
                disabled={isUpgrading}
                className={`w-full py-4 rounded-xl font-bold text-base transition-all transform hover:scale-105 shadow-2xl ${
                  isUpgrading
                    ? "bg-gray-500 text-gray-300 cursor-wait"
                    : selectedPlan === "premium"
                      ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-purple-950 shadow-yellow-500/50 hover:shadow-yellow-400/70"
                      : "bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400 text-purple-950 shadow-yellow-500/50 hover:shadow-yellow-400/60"
                }`}
              >
                {premiumButtonText}
              </button>

              {/* Trust signals - Solo dentro de Premium */}
              <div className="mt-6">
                <div className="flex items-center justify-center gap-4 text-xs text-purple-200">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Garantía 7 días
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                    Soporte prioritario
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods - Fuera de las cards */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <span className={`text-sm ${
            asModal ? 'text-white' : 'text-gray-600'
          }`}>Pago seguro con:</span>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white rounded-lg text-xs text-gray-700 font-medium border border-gray-200 shadow-sm">
              Izipay
            </div>
            <div className="px-3 py-1.5 bg-white rounded-lg text-xs text-gray-700 font-medium border border-gray-200 shadow-sm">
              Yape
            </div>
            <div className="px-3 py-1.5 bg-white rounded-lg text-xs text-gray-700 font-medium border border-gray-200 shadow-sm">
              Visa
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-bold">+2,500 parejas</span> ya crearon su invitación
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Si se usa como modal, crear overlay flotante personalizado
  if (asModal && onClose) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogPortal>
          {/* Overlay con 50% de transparencia */}
          <DialogOverlay className="bg-black/50" />

          {/* Contenido centrado sin restricciones de tamaño */}
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onPointerDownOutside={(e) => e.preventDefault()} // Evitar cerrar al hacer clic fuera
          >
            <div className="w-full max-w-7xl">
              {content}
            </div>

            {/* Botón de cerrar (X) */}
            <DialogPrimitive.Close className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 z-[60] bg-white/10 hover:bg-white/20 p-2">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    );
  }

  // Si no es modal, retornar contenido directamente
  return content;
}
