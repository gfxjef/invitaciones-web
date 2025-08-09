/**
 * Izipay Checkout Component
 * 
 * WHY: Integrates with Izipay payment gateway following their official
 * example implementation. Handles token generation, checkout initialization,
 * and payment processing.
 * 
 * WHAT: Component that initializes Izipay checkout form with proper
 * configuration and handles payment flow completion.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Global Izipay type declarations
declare global {
  interface Window {
    Izipay: any;
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
   * Initialize Izipay checkout form
   * Following the exact pattern from the official example
   */
  const initializeCheckout = async () => {
    if (!window.Izipay) {
      setPaymentError('Izipay SDK not loaded. Please refresh the page.');
      return;
    }

    setIsInitializing(true);
    setPaymentError(null);

    try {
      // Generate current timestamp for transaction
      const currentTimeUnix = Date.now() * 1000;
      
      // Map document type to Izipay enum
      const documentTypeMap = {
        'DNI': window.Izipay.enums?.documentType?.DNI || 'DNI',
        'RUC': window.Izipay.enums?.documentType?.RUC || 'RUC'
      };

      // Izipay configuration following official example structure
      const iziConfig = {
        config: {
          transactionId: paymentConfig.transaction_id,
          action: window.Izipay.enums?.payActions?.PAY || 'PAY',
          merchantCode: paymentConfig.merchant_code,
          order: {
            orderNumber: order.order_number,
            currency: order.currency,
            amount: order.total.toString(),
            processType: window.Izipay.enums?.processType?.AUTHORIZATION || 'AUTHORIZATION',
            merchantBuyerId: `user_${order.id}`,
            dateTimeTransaction: currentTimeUnix.toString(),
            payMethod: window.Izipay.enums?.showMethods?.ALL || 'ALL',
          },
          billing: {
            firstName: billingInfo.firstName,
            lastName: billingInfo.lastName,
            email: billingInfo.email,
            phoneNumber: billingInfo.phoneNumber,
            street: billingInfo.street,
            city: billingInfo.city,
            state: billingInfo.state,
            country: billingInfo.country,
            postalCode: billingInfo.postalCode || '00001',
            document: billingInfo.document,
            documentType: documentTypeMap[billingInfo.documentType] || 'DNI',
          },
          render: {
            typeForm: window.Izipay.enums?.typeForm?.POP_UP || 'POP_UP',
            container: '#izipay-checkout-container',
            showButtonProcessForm: false, // We'll show our own button
          },
          urlRedirect: `${window.location.origin}/mi-cuenta/pedidos/${order.order_number}?success=true`,
          appearance: {
            logo: `${window.location.origin}/logo.png`,
          },
        },
      };

      // Payment response callback
      const callbackResponsePayment = (response: any) => {
        console.log('Izipay payment response:', response);
        
        if (response.status === 'success' || response.status === 'PAID') {
          onPaymentComplete(response);
        } else if (response.status === 'error' || response.status === 'FAILED') {
          onPaymentError(response);
        } else {
          // Handle other statuses
          console.log('Payment status:', response.status, response);
        }
      };

      // Initialize checkout
      const checkout = new window.Izipay({ config: iziConfig.config });
      
      if (checkout) {
        checkoutInstanceRef.current = checkout;
        
        await checkout.LoadForm({
          authorization: paymentConfig.token,
          keyRSA: 'RSA',
          callbackResponse: callbackResponsePayment,
        });
        
        setIsPaymentReady(true);
        toast.success('Formulario de pago cargado correctamente');
      } else {
        throw new Error('Failed to initialize Izipay checkout');
      }
      
    } catch (error: any) {
      console.error('Error initializing Izipay checkout:', error);
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
    }
    
    // The checkout form should appear as a popup
    // based on the typeForm: POP_UP configuration
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
          <span>Pago seguro procesado por Izipay</span>
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