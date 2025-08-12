/**
 * Izipay V1 SDK Checkout Component
 * 
 * WHY: Integrates with Izipay payment gateway using the newer V1 SDK.
 * This fixes the "invalid public key" error by using the correct SDK version.
 * 
 * WHAT: Component that uses Izipay V1 SDK to initialize and render the payment form
 * with proper error handling and dynamic loading.
 */

'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
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
  
  /** FormToken y configuración según documentación oficial */
  paymentConfig: {
    formToken: string;
    publicKey: string;
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
        // Verificar configuración requerida
        if (!paymentConfig.formToken || !paymentConfig.publicKey) {
          console.log('Esperando configuración de pago...', {
            hasFormToken: !!paymentConfig.formToken,
            hasPublicKey: !!paymentConfig.publicKey
          });
          return;
        }

        console.log('Inicializando Izipay con configuración oficial:', {
          publicKey: paymentConfig.publicKey.substring(0, 30) + '...',
          formToken: paymentConfig.formToken.substring(0, 30) + '...',
          order: order.order_number
        });

        // Clear any existing form content first
        const formElement = document.getElementById('izipay-payment-form');
        if (formElement) {
          formElement.innerHTML = '';
        }

        // REVERT TO V4 SDK (KRGlue) - V1 API not working with our setup
        // Load KRGlue V4 SDK
        const KRGlue = (await import('@lyracom/embedded-form-glue')).default;
        console.log('KRGlue V4 loaded from NPM');

        // Initialize library with endpoint and public key
        const endPoint = 'https://api.micuentaweb.pe';
        const publicKey = paymentConfig.publicKey.trim();
        
        console.log('Initializing KRGlue V4 with:', { endPoint, publicKey: publicKey.substring(0, 30) + '...' });
        
        // Load the library using loadLibrary
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

        // Configure form with enhanced settings
        await KR.setFormConfig({
          formToken: paymentConfig.formToken,
          'kr-public-key': publicKey,
          'kr-language': 'es-PE'
        });
        console.log('Form config set successfully');

        // Attach form to the container  
        await KR.attachForm('#izipay-payment-form');
        console.log('KR V4 form attached successfully');

        toast.success('Formulario de pago cargado');
        setPaymentError(null);

      } catch (error: any) {
        console.error('Error initializing Izipay V1 SDK:', error);
        setPaymentError(error.message || 'No se pudo inicializar el pago');
        toast.error('Error al cargar el formulario de pago');
      } finally {
        setIsInitializing(false);
      }
    };

    // No longer needed - using KRGlue V4 SDK directly

    initializePaymentForm();
    
    // Cleanup on component unmount
    return () => {
      try {
        const formElement = document.getElementById('izipay-payment-form');
        if (formElement) {
          formElement.innerHTML = '';
        }
      } catch (error) {
        console.log('Cleanup error (non-critical):', error);
      }
    };
  }, [paymentConfig.formToken, paymentConfig.publicKey, order.order_number]);

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
    <>
      {/* Script de Izipay cargado de forma asíncrona */}
      <Script 
        src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.js"
        strategy="lazyOnload"
      />
      
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

      {/* Izipay V1 SDK Form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresa los datos de tu tarjeta</h3>
        
        {/* Form container where Izipay V1 SDK will render */}
        <div 
          id="izipay-payment-form" 
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
            FormToken: {paymentConfig.formToken ? '✅ ' + paymentConfig.formToken.substring(0, 20) + '...' : '❌ None'} | 
            Public Key: {paymentConfig.publicKey ? '✅ ' + paymentConfig.publicKey.substring(0, 20) + '...' : '❌ None'}
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
        <span>Pago seguro procesado por Izipay</span>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-gray-500">Debug Info</summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({
              order,
              billingInfo,
              paymentConfig: { ...paymentConfig, formToken: '***' },
              isInitializing,
              paymentError,
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
    </>
  );
};

export default IzipayCheckout;