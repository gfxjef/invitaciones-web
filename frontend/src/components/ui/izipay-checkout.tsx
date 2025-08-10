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

// Extend HTML div element for Krypton attributes
declare module 'react' {
  interface HTMLAttributes<T> {
    'kr-public-key'?: string;
    'kr-form-token'?: string;
    'kr-api'?: string;
    'kr-language'?: string;
    'kr-post-url-success'?: string;
    'kr-post-url-refused'?: string;
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
   * Initialize Krypton V4 Smart Form
   * No need for manual initialization - Smart Form handles everything
   */
  useEffect(() => {
    if (paymentConfig.token && paymentConfig.public_key) {
      console.log('Payment config ready:', {
        token: paymentConfig.token.substring(0, 20) + '...',
        publicKey: paymentConfig.public_key,
        order: order.order_number,
        hasKR: !!window.KR,
        tokenFull: paymentConfig.token
      });
      setIsPaymentReady(true);
      toast.success('Formulario de pago listo');
    } else {
      console.log('Payment config NOT ready:', {
        hasToken: !!paymentConfig.token,
        hasPublicKey: !!paymentConfig.public_key,
        publicKey: paymentConfig.public_key
      });
    }
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

      {/* Krypton V4 Smart Form */}
      <div className="mb-6">
        {isPaymentReady && paymentConfig.token && paymentConfig.public_key ? (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresa los datos de tu tarjeta</h3>
            <div
              className="kr-smart-form"
              kr-public-key={paymentConfig.public_key}
              kr-form-token={paymentConfig.token}
              kr-api="https://api.micuentaweb.pe"
              kr-language="es-PE"
              kr-post-url-success={`${typeof window !== 'undefined' ? window.location.origin : ''}/izipay/retorno?orderNumber=${order.order_number}&status=success&transactionId=${paymentConfig.transaction_id}`}
              kr-post-url-refused={`${typeof window !== 'undefined' ? window.location.origin : ''}/izipay/retorno?orderNumber=${order.order_number}&status=refused&transactionId=${paymentConfig.transaction_id}`}
              style={{ minHeight: '400px' }}
            />
            
            {/* Debug info visible */}
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <strong>Debug:</strong> Token: {paymentConfig.token.substring(0, 30)}... | Public Key: {paymentConfig.public_key.substring(0, 30)}...
            </div>
          </>
        ) : (
          <div className="p-8 bg-gray-50 rounded-lg text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando formulario de pago...</p>
            <p className="text-xs text-gray-500 mt-2">
              Token: {paymentConfig.token ? '✅' : '❌'} | Public Key: {paymentConfig.public_key ? '✅' : '❌'}
            </p>
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