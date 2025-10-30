/**
 * Izipay SmartForm V4.0 (Krypton Client) Component
 *
 * WHY: Implementa el formulario oficial de Izipay usando SmartForm (kr-smart-form)
 * según documentación: https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/javascript/redirection/quick_start_smartform.html
 *
 * WHAT: Componente que carga el Krypton Client V4.0 y renderiza el formulario SmartForm
 * con soporte para múltiples modos de visualización (lista, pop-in, tarjeta expandida)
 *
 * DIFERENCIAS vs SDK Web V1:
 * - SDK Web V1: Usa new window.Izipay() con configuración compleja
 * - SmartForm V4.0: Usa <div class="kr-smart-form"> con script declarativo
 * - SmartForm es más simple y estable
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Lock, AlertCircle, Loader2, CreditCard, QrCode, Smartphone, Shield, CheckCircle, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { paymentsApi } from '@/lib/api';

// ✅ Declarar tipo global para KR (Krypton)
declare global {
  interface Window {
    KR?: any;
  }
}

export type SmartFormMode = 'list' | 'popin' | 'card-expanded';

export interface IzipaySmartFormProps {
  /** Order details */
  order: {
    id: number;
    order_number: string;
    total: number;
    currency: string;
  };

  /** Payment configuration according to SmartForm V4.0 official documentation */
  paymentConfig: {
    formToken: string;      // authorization token from backend (Charge/CreatePayment)
    publicKey: string;      // IZIPAY_PUBLIC_KEY (formato: merchantId:publickey_xxx)
    mode: 'TEST' | 'PRODUCTION' | 'SANDBOX';
  };

  /** SmartForm display mode */
  displayMode?: SmartFormMode;

  /** Theme (neon is recommended) */
  theme?: 'neon' | 'classic';

  /** Success URL for kr-post-url-success */
  successUrl?: string;

  /** Callback when payment is completed */
  onPaymentComplete?: (result: any) => void;

  /** Callback when payment fails */
  onPaymentError?: (error: any) => void;

  /** Loading state */
  isLoading?: boolean;
}

export const IzipaySmartForm: React.FC<IzipaySmartFormProps> = ({
  order,
  paymentConfig,
  displayMode = 'card-expanded',
  theme = 'neon',
  successUrl,
  onPaymentComplete,
  onPaymentError,
  isLoading = false,
}) => {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const scriptLoadedRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ URLs oficiales según documentación (inicio_rapido_izi.md línea 59)
  const SDK_URL = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js';
  const THEME_CSS_URL = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/neon-reset.min.css';
  const THEME_JS_URL = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/neon.js';

  /**
   * Cargar script de forma segura sin duplicados
   */
  const loadScript = (src: string, attributes: Record<string, string> = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Verificar si ya existe el script
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        console.log(`✅ Script ya cargado: ${src}`);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      // Agregar atributos personalizados (kr-public-key, kr-post-url-success, etc.)
      Object.entries(attributes).forEach(([key, value]) => {
        script.setAttribute(key, value);
      });

      script.onload = () => {
        console.log(`✅ Script cargado: ${src}`);
        resolve();
      };
      script.onerror = () => {
        console.error(`❌ Error cargando script: ${src}`);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  };

  /**
   * Cargar CSS de forma segura
   */
  const loadStylesheet = (href: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Verificar si ya existe el stylesheet
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) {
        console.log(`✅ Stylesheet ya cargado: ${href}`);
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;

      link.onload = () => {
        console.log(`✅ Stylesheet cargado: ${href}`);
        resolve();
      };
      link.onerror = () => {
        console.error(`❌ Error cargando stylesheet: ${href}`);
        reject(new Error(`Failed to load stylesheet: ${href}`));
      };

      document.head.appendChild(link);
    });
  };

  /**
   * Inicializar SmartForm según documentación oficial
   */
  useEffect(() => {
    // Evitar carga duplicada
    if (scriptLoadedRef.current) {
      console.log('⚠️ SmartForm ya inicializado, evitando duplicación');
      return;
    }

    const initializeSmartForm = async () => {
      try {
        console.log('🚀 [SmartForm V4.0] Inicializando Izipay SmartForm');
        console.log('📦 Configuración:', {
          mode: paymentConfig.mode,
          displayMode,
          theme,
          orderNumber: order.order_number,
          amount: order.total
        });

        setIsInitializing(true);

        // ✅ STEP 1: Cargar tema (si es neon) - debe cargarse en HEAD antes del SDK
        if (theme === 'neon') {
          console.log('🎨 Cargando tema Neon...');
          await loadStylesheet(THEME_CSS_URL);
          await loadScript(THEME_JS_URL);
        }

        // ✅ STEP 2: Cargar SDK principal con parámetros kr-*
        console.log('📥 Cargando Krypton Client SDK...');
        const scriptAttributes: Record<string, string> = {
          'kr-public-key': paymentConfig.publicKey,
          'type': 'text/javascript'
        };

        // ✅ Configurar kr-post-url-success para manejar el resultado del pago
        // Si no se proporciona successUrl, usar el endpoint del backend por defecto
        const backendResultUrl = `${window.location.origin.replace('3000', '5000')}/api/payments/result`;
        scriptAttributes['kr-post-url-success'] = successUrl || backendResultUrl;

        console.log('🔗 [SmartForm V4.0] kr-post-url-success:', scriptAttributes['kr-post-url-success']);

        await loadScript(SDK_URL, scriptAttributes);

        // ✅ Marcar como cargado
        scriptLoadedRef.current = true;
        setSdkLoaded(true);

        console.log('✅ [SmartForm V4.0] SDK cargado correctamente');

        // ✅ STEP 3: Verificar que KR está disponible globalmente
        if (typeof window.KR !== 'undefined') {
          console.log('✅ window.KR disponible:', typeof window.KR);
        } else {
          console.warn('⚠️ window.KR no está disponible aún (puede ser normal en carga asíncrona)');
        }

        setPaymentError(null);
        setIsInitializing(false);

      } catch (error: any) {
        console.error('❌ [SmartForm V4.0] Error inicializando:', error);
        setPaymentError(error.message || 'No se pudo inicializar el formulario de pago');
        toast.error('Error al cargar el formulario de pago');
        setIsInitializing(false);
      }
    };

    initializeSmartForm();

    // Cleanup: No remover scripts porque pueden ser usados por múltiples instancias
    return () => {
      console.log('🧹 SmartForm component unmounted (scripts permanecen en DOM)');
    };
  }, []); // Solo ejecutar una vez al montar

  /**
   * Configurar personalización del SmartForm con KR.setFormConfig()
   */
  useEffect(() => {
    if (!sdkLoaded || !window.KR) return;

    console.log('🎨 [SmartForm V4.0] Aplicando personalización con KR.setFormConfig()');

    const formConfig = {
      merchant: {
        header: {
          // Logo placeholder profesional con colores purple/pink
          image: {
            type: "logo",  // Logo circular centrado
            visibility: true,
            src: "https://api.dicebear.com/7.x/shapes/svg?seed=Invitaciones&backgroundColor=9333ea,ec4899&radius=50"
          },
          // Color del nombre de tienda (purple matching el diseño)
          shopName: {
            color: "#7C3AED",  // Purple 600
            gradient: true  // Activar gradiente en header
          },
          // Color de fondo del header
          backgroundColor: "#F9FAFB"  // Gray 50 (sutil)
        }
      },
      form: {
        layout: "default",  // Layout default (no compact)
        fields: {
          order: ["pan", "securityCode", "expiry"]  // Orden estándar de campos
        }
      }
    };

    try {
      if (typeof window.KR.setFormConfig === 'function') {
        window.KR.setFormConfig(formConfig);
        console.log('✅ [SmartForm V4.0] Configuración personalizada aplicada:', formConfig);
      } else {
        console.warn('⚠️ [SmartForm V4.0] KR.setFormConfig no está disponible');
      }
    } catch (error) {
      console.error('❌ [SmartForm V4.0] Error aplicando configuración:', error);
    }
  }, [sdkLoaded]);

  /**
   * Escuchar eventos de KR para capturar resultado del pago
   */
  useEffect(() => {
    if (!sdkLoaded || !window.KR) {
      console.log('⏳ Esperando SDK KR para configurar event listeners...');
      return;
    }

    console.log('🎧 [SmartForm V4.0] Configurando event listeners de KR');

    // Evento: Formulario listo
    if (window.KR.onFormReady) {
      window.KR.onFormReady(() => {
        console.log('✅ [SmartForm V4.0] Formulario listo para uso');
        setIsInitializing(false);
      });
    }

    // Evento: Error en el pago
    if (window.KR.onError) {
      window.KR.onError((error: any) => {
        console.error('❌ [SmartForm V4.0] Error en pago:', error);
        const errorMessage = error?.detailedErrorMessage || error?.errorMessage || 'Error desconocido en el pago';
        toast.error(errorMessage);

        if (onPaymentError) {
          onPaymentError(error);
        }
      });
    }

    // Evento: Escuchar mensajes postMessage del iframe de Izipay
    const handlePostMessage = (event: MessageEvent) => {
      // Verificar que el mensaje venga de Izipay
      if (!event.origin.includes('micuentaweb.pe')) {
        return;
      }

      console.log('📬 [SmartForm V4.0] Mensaje recibido de Izipay:', event.data);

      try {
        // Limpiar prefijo /*krypton-client*/ si existe
        let cleanData = event.data;
        if (typeof event.data === 'string' && event.data.startsWith('/*krypton-client*/')) {
          cleanData = event.data.replace('/*krypton-client*/', '').trim();
        }

        const data = typeof cleanData === 'string' ? JSON.parse(cleanData) : cleanData;

        // Detectar cuando se envía el formulario de pago
        if (data._name === 'submit' || data._name === 'paymentProcessing') {
          console.log('📤 [SmartForm V4.0] Pago siendo procesado, iniciando polling...');
          setTimeout(() => {
            startPaymentPolling();
          }, 2000);
        }

        // Buscar indicadores de pago exitoso
        if (
          data.status === 'SUCCESS' ||
          data.orderStatus === 'PAID' ||
          (data.kr && data.kr.result === 'success') ||
          (data.result && data.result === 'success')
        ) {
          console.log('✅ [SmartForm V4.0] Pago completado exitosamente');
          toast.success('¡Pago completado exitosamente!');

          if (onPaymentComplete) {
            onPaymentComplete(data);
          }
        }
        // Buscar indicadores de error
        else if (
          data.status === 'ERROR' ||
          data.orderStatus === 'UNPAID' ||
          data.orderStatus === 'FAILED' ||
          (data.kr && data.kr.result === 'error') ||
          (data.result && data.result === 'error')
        ) {
          console.error('❌ [SmartForm V4.0] Pago rechazado:', data);
          const errorMsg = data.errorMessage || data.message || 'Pago rechazado';
          toast.error(errorMsg);

          if (onPaymentError) {
            onPaymentError(data);
          }
        }
      } catch (error) {
        console.log('⚠️ [SmartForm V4.0] Error parseando mensaje:', error);
      }
    };

    window.addEventListener('message', handlePostMessage);

    // Cleanup
    return () => {
      console.log('🧹 [SmartForm V4.0] Removiendo event listeners');
      window.removeEventListener('message', handlePostMessage);
    };
  }, [sdkLoaded, onPaymentComplete, onPaymentError]);

  /**
   * Función de polling para verificar el estado del pago
   * WHY: SmartForm redirige a otra página después del pago, pero queremos mantener el flujo SPA.
   * Esta función verifica el estado de la orden cada 3 segundos sin recargar la página.
   */
  const startPaymentPolling = () => {
    if (isPolling || pollingIntervalRef.current) {
      console.log('⚠️ [SmartForm V4.0] Polling ya está activo');
      return;
    }

    console.log('🔄 [SmartForm V4.0] Iniciando polling del estado de pago');
    setIsPolling(true);

    let attempts = 0;
    const maxAttempts = 40; // 2 minutos (40 * 3 segundos)

    const checkPaymentStatus = async () => {
      attempts++;
      console.log(`🔍 [SmartForm V4.0] Verificando estado de pago (intento ${attempts}/${maxAttempts})`);

      try {
        const response = await paymentsApi.getPaymentStatus(order.id);

        console.log('📊 [SmartForm V4.0] Estado actual:', response.status);

        if (response.status === 'PAID') {
          console.log('✅ [SmartForm V4.0] ¡Pago confirmado por polling!');
          toast.success('¡Pago completado exitosamente!');

          // Detener polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsPolling(false);

          // Llamar callback de éxito
          if (onPaymentComplete) {
            onPaymentComplete({
              status: 'SUCCESS',
              orderStatus: 'PAID',
              order_id: order.id,
              order_number: order.order_number,
              source: 'polling'
            });
          }
        } else if (response.status === 'FAILED' || response.status === 'CANCELLED') {
          console.error('❌ [SmartForm V4.0] Pago falló o fue cancelado');
          toast.error('El pago no se pudo completar');

          // Detener polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsPolling(false);

          // Llamar callback de error
          if (onPaymentError) {
            onPaymentError({
              status: response.status,
              message: 'Pago falló o fue cancelado'
            });
          }
        }

        // Timeout después de maxAttempts
        if (attempts >= maxAttempts) {
          console.warn('⏱️ [SmartForm V4.0] Timeout de polling alcanzado');
          toast.error('No se pudo verificar el estado del pago. Por favor, verifica tu orden.');

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsPolling(false);
        }
      } catch (error) {
        console.error('❌ [SmartForm V4.0] Error en polling:', error);

        // Si hay error en el polling, seguir intentando hasta el timeout
        if (attempts >= maxAttempts) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setIsPolling(false);
          toast.error('Error verificando el estado del pago');
        }
      }
    };

    // Ejecutar inmediatamente y luego cada 3 segundos
    checkPaymentStatus();
    pollingIntervalRef.current = setInterval(checkPaymentStatus, 3000);
  };

  /**
   * Detectar cuando el usuario envía el pago para iniciar polling
   */
  useEffect(() => {
    if (!sdkLoaded || !window.KR) return;

    // Escuchar cuando se envía el formulario
    if (window.KR.onSubmit) {
      window.KR.onSubmit(() => {
        console.log('📤 [SmartForm V4.0] Formulario enviado, iniciando polling...');
        setTimeout(() => {
          startPaymentPolling();
        }, 2000); // Esperar 2 segundos antes de empezar a hacer polling
        return false; // Prevenir redirección automática
      });
    }

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [sdkLoaded, order.id, onPaymentComplete, onPaymentError]);

  /**
   * Determinar clases CSS según modo de visualización
   */
  const getSmartFormClasses = (): string => {
    const baseClass = 'kr-smart-form';

    switch (displayMode) {
      case 'popin':
        return `${baseClass} kr-popin`;
      case 'card-expanded':
        return `${baseClass} kr-card-form-expanded`;
      case 'list':
      default:
        return baseClass;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Preparando el pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
      {/* ✨ Professional Header with Gradient Badge */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Procesamiento de Pago Seguro</h2>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <Lock className="w-4 h-4 text-emerald-600" />
                Encriptación SSL 256-bit
              </p>
            </div>
          </div>

          {/* Payment methods badges - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border-purple-300 text-purple-700 font-medium">
              <CreditCard className="w-3.5 h-3.5" /> Tarjetas
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border-purple-300 text-purple-700 font-medium">
              <Smartphone className="w-3.5 h-3.5" /> Yape
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border-purple-300 text-purple-700 font-medium">
              <QrCode className="w-3.5 h-3.5" /> QR
            </Badge>
          </div>
        </div>
      </div>

      {paymentError && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-pulse">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
            <span className="text-red-800 font-medium">{paymentError}</span>
          </div>
        </div>
      )}

      {/* ✨ Professional Order Summary with Gradient */}
      <div className="mb-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-purple-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-lg md:text-xl text-gray-900">Resumen de Pago</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2.5 border-b border-purple-200">
            <span className="text-sm font-medium text-gray-600">Número de Orden</span>
            <span className="font-mono font-semibold text-gray-900">{order.order_number}</span>
          </div>

          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm font-medium text-gray-600">Subtotal</span>
            <span className="font-mono text-gray-900">{order.currency} {order.total.toFixed(2)}</span>
          </div>

          {/* Total destacado con gradiente */}
          <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-purple-300">
            <span className="font-bold text-gray-900 text-lg">Total a Pagar</span>
            <span className="font-mono font-bold text-2xl md:text-3xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {order.currency} {order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment methods icons */}
        <div className="mt-5 pt-5 border-t border-purple-200">
          <p className="text-xs font-semibold text-gray-700 mb-3">Métodos de pago disponibles:</p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-white px-3 py-2 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span className="font-medium">Visa, MasterCard, Diners</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-white px-3 py-2 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span className="font-medium">Yape, Plin</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-white px-3 py-2 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
              <QrCode className="w-4 h-4 text-purple-600" />
              <span className="font-medium">QR Code</span>
            </div>
          </div>
        </div>
      </div>

      {/* SmartForm Container */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></span>
          Selecciona tu método de pago
        </h3>

        {/*
          ✅ Contenedor SmartForm según documentación oficial (inicio_rapido_izi.md líneas 103, 116, 130)
          Ejemplos:
          - Modo lista: <div class="kr-smart-form" kr-form-token="..."></div>
          - Modo pop-in: <div class="kr-smart-form" kr-popin kr-form-token="..."></div>
          - Modo tarjeta expandida: <div class="kr-smart-form" kr-card-form-expanded kr-form-token="..."></div>
        */}
        <div
          className={getSmartFormClasses()}
          kr-form-token={paymentConfig.formToken}
          style={{ minHeight: '420px' }}
        />

        {/* ✨ Professional Loading State with Skeleton */}
        {isInitializing && (
          <div className="mt-5 animate-fadeIn">
            <div className="h-72 bg-gradient-to-br from-purple-100 via-indigo-100 to-purple-100 rounded-2xl border-2 border-purple-200 flex flex-col items-center justify-center space-y-5 relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

              <div className="relative z-10">
                <div className="relative">
                  <Loader2 className="w-14 h-14 text-purple-600 animate-spin" />
                  <div className="absolute inset-0 w-14 h-14 border-4 border-purple-300 rounded-full animate-ping opacity-30"></div>
                </div>
              </div>

              <div className="text-center relative z-10">
                <p className="font-bold text-lg text-purple-900 mb-1">Cargando formulario seguro</p>
                <p className="text-sm text-purple-700">Preparando métodos de pago...</p>
              </div>

              {/* Progress bar */}
              <div className="w-64 h-2.5 bg-purple-200 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-500 rounded-full animate-pulse bg-[length:200%_100%] animate-shimmer-slow"></div>
              </div>
            </div>
          </div>
        )}

        {/* ✨ Professional Polling State with Progress Bar */}
        {isPolling && (
          <div className="mt-5 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 rounded-2xl border-2 border-emerald-300 p-6 shadow-lg animate-fadeIn">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Loader2 className="w-9 h-9 text-emerald-600 animate-spin" />
                  <CheckCircle className="w-4 h-4 text-emerald-600 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-lg text-emerald-900">Procesando pago...</p>
                  <p className="text-sm text-emerald-700">Verificando con el banco</p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white px-3 py-1.5 text-sm shadow-md">
                En Proceso
              </Badge>
            </div>

            {/* Animated progress bar */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-500 rounded-full transition-all duration-500 bg-[length:200%_100%] animate-shimmer-slow"
                  style={{width: '68%'}}
                ></div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></div>
                <p className="text-xs text-emerald-700 font-medium">Por favor espera, esto puede tomar unos segundos</p>
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✨ Professional Security Badges Grid */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
        <div className="text-center group">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-200">
            <Lock className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="font-bold text-sm text-gray-900 mb-1">SSL Seguro</p>
          <p className="text-xs text-gray-600">Cifrado 256-bit</p>
        </div>

        <div className="text-center group">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-200">
            <Shield className="w-7 h-7 text-blue-600" />
          </div>
          <p className="font-bold text-sm text-gray-900 mb-1">PCI DSS</p>
          <p className="text-xs text-gray-600">Cumplimiento Nivel 1</p>
        </div>

        <div className="text-center group">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-200">
            <CheckCircle className="w-7 h-7 text-purple-600" />
          </div>
          <p className="font-bold text-sm text-gray-900 mb-1">Verificado</p>
          <p className="text-xs text-gray-600">Comercio Seguro</p>
        </div>
      </div>

      {/* Payment Methods Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong className="font-bold">Métodos aceptados:</strong> Tarjetas Visa, Mastercard, Diners Club, American Express, Yape, Plin Interbank, Código QR y Apple Pay. Todos los pagos son procesados de forma segura por Izipay.
        </p>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-xs bg-gray-50 rounded-lg p-3 border border-gray-200">
          <summary className="cursor-pointer text-gray-700 hover:text-gray-900 font-semibold">
            🔧 Debug Info (solo desarrollo)
          </summary>
          <pre className="mt-3 bg-gray-900 text-green-400 p-3 rounded-lg overflow-auto text-xs font-mono">
            {JSON.stringify({
              order: {
                id: order.id,
                number: order.order_number,
                total: order.total,
                currency: order.currency
              },
              config: {
                mode: paymentConfig.mode,
                hasFormToken: !!paymentConfig.formToken,
                formTokenLength: paymentConfig.formToken?.length,
                publicKey: paymentConfig.publicKey?.substring(0, 30) + '...',
                displayMode,
                theme,
                sdkLoaded,
                isInitializing,
                isPolling
              },
              error: paymentError
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default IzipaySmartForm;
