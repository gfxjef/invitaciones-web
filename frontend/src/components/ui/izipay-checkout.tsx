/**
 * Izipay Krypton V4 Checkout Component with NPM KRGlue
 * 
 * WHY: Integrates with Izipay payment gateway using @lyracom/embedded-form-glue NPM package.
 * This solves the CDN 404 issue and provides reliable form rendering.
 * 
 * WHAT: Component that uses KRGlue from NPM to initialize and render the payment form
 * with proper error handling and dynamic loading.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export interface IzipayCheckoutProps {
  /** Order details */
  order: {
    id: number;
    order_number: string;
    total: number;
    currency: string;
  };
  
  /** Billing information */
  billingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    document: string;
    documentType: 'DNI' | 'RUC';
  };
  
  /** Payment token and configuration */
  paymentConfig: {
    token: string;
    transaction_id: string;
    merchant_code: string;
    public_key: string;
    mode: string;
  };
  
  /** Callback when payment is completed */
  onPaymentComplete: (result: any) => void;
  
  /** Callback when payment fails */
  onPaymentError: (error: any) => void;
  
  /** Loading state */
  isLoading?: boolean;
}

export const IzipayCheckout: React.FC<IzipayCheckoutProps> = ({
  order,
  billingInfo,
  paymentConfig,
  onPaymentComplete,
  onPaymentError,
  isLoading = false,
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const initializePaymentForm = async () => {
      try {
        // Check if we have the required config
        if (!paymentConfig.token || !paymentConfig.public_key) {
          console.log('Waiting for payment config...', {
            hasToken: !!paymentConfig.token,
            hasPublicKey: !!paymentConfig.public_key
          });
          return;
        }

        console.log('Initializing payment form with:', {
          publicKey: paymentConfig.public_key.substring(0, 30) + '...',
          token: paymentConfig.token.substring(0, 30) + '...',
          order: order.order_number
        });

        // Clear any existing form content first
        const formElement = document.getElementById('kr-payment-form');
        if (formElement) {
          formElement.innerHTML = '';
        }

        // Check if KR is already globally available to avoid multiple initializations
        if (typeof window !== 'undefined' && (window as any).KR) {
          console.log('KR already loaded globally, cleaning up...');
          // Clear existing KR instance
          try {
            await (window as any).KR.removeForms();
          } catch (e) {
            console.log('Could not remove existing forms:', e);
          }
        }

        // Dynamically import KRGlue (client-side only)
        const KRGlue = (await import('@lyracom/embedded-form-glue')).default;
        console.log('KRGlue loaded from NPM');

        // Initialize library with endpoint and public key
        const endPoint = 'https://api.micuentaweb.pe';
        const publicKey = (paymentConfig.public_key || '').trim();
        
        console.log('pubKey:', `"${publicKey}"`, 'len:', publicKey.length);
        console.log('Initializing KRGlue with:', { endPoint, publicKey });
        
        // Load the library - this will load the kr-payment-form.min.js automatically
        const { KR } = await KRGlue.loadLibrary(endPoint, publicKey);
        console.log('KR library initialized:', !!KR);

        // Store KR globally to prevent multiple loads
        (window as any).KR = KR;

        // Set up error handling FIRST
        KR.onError((error: any) => {
          console.error('KR error:', error);
          const errorMessage = error?.message || error?.detailedErrorMessage || 'Error del formulario';
          setPaymentError(errorMessage);
        });

        // Configure and render form
        await KR.setFormConfig({ 
          formToken: paymentConfig.token
        });
        console.log('Form config set with token');

        // Attach form to the container
        await KR.attachForm('#kr-payment-form');
        console.log('Form attached and displayed in container');

        // Check that form was actually rendered
        const renderedFormElement = document.getElementById('kr-payment-form');
        console.log('Form element check:', {
          exists: !!renderedFormElement,
          hasContent: renderedFormElement?.innerHTML?.length > 0,
          height: renderedFormElement?.offsetHeight
        });

        toast.success('Formulario de pago cargado');
        setPaymentError(null);

      } catch (error: any) {
        console.error('Error initializing payment form:', error);
        setPaymentError(error.message || 'No se pudo inicializar el pago');
        toast.error('Error al cargar el formulario de pago');
      } finally {
        setIsInitializing(false);
      }
    };

    initializePaymentForm();
    
    // Cleanup on component unmount
    return () => {
      try {
        if (typeof window !== 'undefined' && (window as any).KR) {
          (window as any).KR.removeForms?.();
        }
      } catch (error) {
        console.log('Cleanup error (non-critical):', error);
      }
    };
  }, [paymentConfig.token, paymentConfig.public_key, order.order_number]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando el pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
          4
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Procesamiento de Pago</h2>
      </div>

      {paymentError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{paymentError}</span>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Resumen de Pago</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Orden:</span>
            <span className="font-medium">{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-lg">{order.currency} {order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Método:</span>
            <span className="text-purple-600">Tarjeta de crédito/débito</span>
          </div>
        </div>
      </div>

      {/* Krypton V4 Form with KRGlue */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresa los datos de tu tarjeta</h3>
        
        {/* Form container where KRGlue will render */}
        <div 
          id="kr-payment-form" 
          style={{ minHeight: '420px' }}
          className="border rounded-lg p-4"
        />
        
        {paymentError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{paymentError}</span>
            </div>
          </div>
        )}
        
        {isInitializing && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-blue-700 text-sm">Cargando formulario de pago...</p>
          </div>
        )}
        
        {/* Debug info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <strong>Debug:</strong> 
            Token: {paymentConfig.token ? '✅ ' + paymentConfig.token.substring(0, 20) + '...' : '❌ None'} | 
            Public Key: {paymentConfig.public_key ? '✅ ' + paymentConfig.public_key.substring(0, 20) + '...' : '❌ None'}
            <br />
            <strong>Status:</strong> 
            Loading: {isInitializing ? '⏳' : '✅'} | 
            Error: {paymentError ? '❌' : '✅'}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="flex items-center justify-center text-sm text-gray-500">
        <Lock className="w-4 h-4 mr-2" />
        <span>Pago seguro procesado por Izipay Krypton</span>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-gray-500">Debug Info</summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({
              order,
              billingInfo,
              paymentConfig: { ...paymentConfig, token: '***' },
              isInitializing,
              paymentError,
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default IzipayCheckout;