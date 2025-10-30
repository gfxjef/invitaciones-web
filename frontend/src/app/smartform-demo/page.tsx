/**
 * SmartForm Demo Page
 *
 * WHY: Página de prueba para validar la integración del SmartForm V4.0 de Izipay
 * antes de reemplazar completamente el SDK Web V1 en producción.
 *
 * WHAT: Permite probar los 3 modos de visualización del SmartForm:
 * - Modo Lista (por defecto)
 * - Modo Pop-in
 * - Modo Tarjeta Expandida
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IzipaySmartForm, SmartFormMode } from '@/components/ui/izipay-smartform';
import { paymentsApi, ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function SmartFormDemoPage() {
  const router = useRouter();
  const [displayMode, setDisplayMode] = useState<SmartFormMode>('card-expanded');
  const [theme, setTheme] = useState<'neon' | 'classic'>('neon');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [demoOrder, setDemoOrder] = useState<any>(null);

  // Crear orden de prueba al montar el componente
  useEffect(() => {
    const createDemoOrder = async () => {
      try {
        setIsLoading(true);

        // Crear orden de prueba
        const orderResponse = await ordersApi.createOrder({
          billing_address: {
            first_name: 'Juan',
            last_name: 'Pérez',
            email: 'juan.perez@example.com',
            phone: '987654321',
            address: 'Av. Lima 123',
            city: 'Lima',
            state: 'Lima',
            zip_code: '15001',
            country: 'PE',
            document_type: 'dni',
            document_number: '12345678',
          },
        });

        if (!orderResponse.success || !orderResponse.order) {
          throw new Error('Error creando orden de prueba');
        }

        setDemoOrder(orderResponse.order);

        // Obtener formToken
        const tokenResponse = await paymentsApi.createPaymentToken({
          order_id: orderResponse.order.id,
          billing_info: {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan.perez@example.com',
            phoneNumber: '987654321',
            street: 'Av. Lima 123',
            city: 'Lima',
            state: 'Lima',
            country: 'PE',
            postalCode: '15001',
            document: '12345678',
            documentType: 'DNI',
          },
        });

        if (!tokenResponse.success || !tokenResponse.formToken) {
          throw new Error('Error creando formToken');
        }

        setPaymentConfig({
          formToken: tokenResponse.formToken,
          publicKey: tokenResponse.publicKey,
          mode: tokenResponse.mode,
        });

        toast.success('Orden de prueba creada');
      } catch (error: any) {
        console.error('Error creando orden de prueba:', error);
        toast.error('Error creando orden de prueba: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    createDemoOrder();
  }, []);

  const handlePaymentSuccess = (result: any) => {
    console.log('✅ Pago exitoso:', result);
    toast.success('¡Pago completado exitosamente!');
  };

  const handlePaymentError = (error: any) => {
    console.error('❌ Error en pago:', error);
    toast.error('Error en el pago: ' + (error.message || 'Desconocido'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Creando orden de prueba...</p>
        </div>
      </div>
    );
  }

  if (!demoOrder || !paymentConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: No se pudo crear la orden de prueba</p>
          <Button onClick={() => router.push('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-purple-600 hover:text-purple-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">SmartForm V4.0 Demo</h1>
                  <Badge variant="secondary">TEST MODE</Badge>
                </div>
                <p className="text-gray-600">Prueba de integración con Krypton Client</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* SmartForm */}
          <div className="lg:col-span-2">
            <IzipaySmartForm
              order={{
                id: demoOrder.id,
                order_number: demoOrder.order_number,
                total: demoOrder.total,
                currency: demoOrder.currency || 'PEN',
              }}
              paymentConfig={paymentConfig}
              displayMode={displayMode}
              theme={theme}
              successUrl={`${window.location.origin}/smartform-demo/success`}
              onPaymentComplete={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>

          {/* Configuration Panel */}
          <div>
            <div className="bg-white rounded-xl border shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración de Prueba
              </h3>

              {/* Display Mode */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modo de Visualización
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setDisplayMode('list')}
                    className={`w-full text-left px-4 py-2 rounded-lg border ${
                      displayMode === 'list'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">Modo Lista</div>
                    <div className="text-xs text-gray-600">Muestra métodos en lista vertical</div>
                  </button>

                  <button
                    onClick={() => setDisplayMode('popin')}
                    className={`w-full text-left px-4 py-2 rounded-lg border ${
                      displayMode === 'popin'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">Modo Pop-in</div>
                    <div className="text-xs text-gray-600">Abre formulario en modal</div>
                  </button>

                  <button
                    onClick={() => setDisplayMode('card-expanded')}
                    className={`w-full text-left px-4 py-2 rounded-lg border ${
                      displayMode === 'card-expanded'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">Tarjeta Expandida</div>
                    <div className="text-xs text-gray-600">Formulario de tarjeta siempre visible</div>
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setTheme('neon')}
                    className={`w-full text-left px-4 py-2 rounded-lg border ${
                      theme === 'neon'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">Neon</div>
                    <div className="text-xs text-gray-600">Tema moderno y colorido</div>
                  </button>

                  <button
                    onClick={() => setTheme('classic')}
                    className={`w-full text-left px-4 py-2 rounded-lg border ${
                      theme === 'classic'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">Classic</div>
                    <div className="text-xs text-gray-600">Tema clásico sin estilos</div>
                  </button>
                </div>
              </div>

              {/* Order Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Orden de Prueba</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orden:</span>
                    <span className="font-mono text-xs">{demoOrder.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold">S/ {demoOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modo:</span>
                    <Badge variant="secondary">{paymentConfig.mode}</Badge>
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Nota:</strong> Esta es una orden de prueba. Los cambios de modo y tema
                  requieren recargar el formulario.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
