/**
 * Izipay Krypton V4 Checkout Component
 * 
 * WHY: Integrates with Izipay payment gateway using the Krypton V4 SDK.
 * Handles form token initialization, checkout form rendering, and payment processing.
 * 
 * WHAT: Component that initializes Krypton V4 payment form with proper
 * configuration and handles payment flow completion with proper error handling.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Global Krypton V4 type declarations
declare global {
  interface Window {
    KR: any;
  }
}

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
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const checkoutContainerRef = useRef<HTMLDivElement>(null);
  const checkoutInstanceRef = useRef<any>(null);

  /**
   * Initialize Krypton V4 checkout form
   * Using the official Krypton V4 SDK implementation
   */
  const initializeCheckout = async () => {
    if (!window.KR) {
      setPaymentError('Krypton SDK not loaded. Please refresh the page.');
      return;
    }

    setIsInitializing(true);
    setPaymentError(null);

    try {
      // Set up error handling
      window.KR.onError((error: any) => {
        console.error('Krypton error:', error);
        const errorMessage = error?.message || error?.detailedErrorMessage || 'Payment form error';
        setPaymentError(`Error del formulario de pago: ${errorMessage}`);
        toast.error('Error en el formulario de pago');
      });

      console.log('Initializing with public key:', paymentConfig.public_key);
      console.log('Form token:', paymentConfig.token);

      // Configure Krypton V4 with public key and token
      const formConfig = {
        'kr-public-key': paymentConfig.public_key,
        'kr-post-url-success': `/izipay/retorno?orderNumber=${order.order_number}&status=success`,
        'kr-language': 'es-ES'
      };

      // Create payment form
      const paymentForm = await window.KR.createForm({
        formToken: paymentConfig.token,
        ...formConfig
      });

      checkoutInstanceRef.current = paymentForm;

      // Render form in container
      await paymentForm.render('#izipay-checkout-container');

      console.log('Krypton form initialized successfully');
      setIsPaymentReady(true);
      toast.success('Formulario de pago cargado correctamente');
      
    } catch (error: any) {
      console.error('Error initializing Krypton checkout:', error);
      setPaymentError(error.message || 'Error inicializando el formulario de pago');
      toast.error('Error cargando el formulario de pago');
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * Handle payment button click
   */
  const handlePayment = async () => {
    if (!checkoutInstanceRef.current) {
      await initializeCheckout();
      return;
    }
    
    try {
      // Submit the payment form using Krypton V4 API
      const result = await checkoutInstanceRef.current.submit();
      console.log('Payment result:', result);
      
      if (result && result.clientAnswer && result.clientAnswer.orderStatus === 'PAID') {
        onPaymentComplete(result);
      } else {
        // The form will handle redirection automatically
        console.log('Payment processing...', result);
      }
    } catch (error: any) {
      console.error('Payment submission error:', error);
      onPaymentError({ error: error.message || 'Payment failed' });
    }
  };

  // Auto-initialize when component mounts and token is available
  useEffect(() => {
    if (paymentConfig.token && !isPaymentReady && !isInitializing) {
      initializeCheckout();
    }
  }, [paymentConfig.token, isPaymentReady, isInitializing]);

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

      {isPaymentReady && !paymentError && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700">Formulario de pago listo</span>
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

      {/* Izipay Container */}
      <div id="izipay-checkout-container" ref={checkoutContainerRef} className="mb-6">
        {/* Izipay form will be rendered here */}
      </div>

      {/* Payment Button */}
      <div className="space-y-4">
        <Button
          onClick={handlePayment}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
          disabled={isInitializing || (!isPaymentReady && !paymentError)}
        >
          <CreditCard className="w-5 h-5 mr-2" />
          {isInitializing 
            ? 'Inicializando pago...' 
            : paymentError 
              ? 'Reintentar pago'
              : `Pagar ${order.currency} ${order.total.toFixed(2)}`
          }
        </Button>

        {/* Security Notice */}
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Lock className="w-4 h-4 mr-2" />
          <span>Pago seguro procesado por Izipay Krypton</span>
        </div>
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
              isPaymentReady,
              paymentError,
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default IzipayCheckout;