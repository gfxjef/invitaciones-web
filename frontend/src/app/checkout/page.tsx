/**
 * Checkout Page (/checkout)
 * 
 * WHY: Final step in the purchase process where users provide billing
 * information and complete their order. Critical conversion point that
 * must be optimized for user experience and completion rates.
 * 
 * WHAT: Multi-step checkout form with billing information, order summary,
 * coupon application, and payment processing integration.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  CreditCard, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Tag,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CouponInput } from '@/components/ui/coupon-input';
import { CouponCard } from '@/components/ui/coupon-card';
import { useCart } from '@/lib/hooks/use-cart';
import { useAppliedCoupon, useCouponDiscount, useCartStore } from '@/store/cartStore';
import { useRemoveCoupon } from '@/lib/hooks/use-coupons';
import { ordersApi, paymentsApi } from '@/lib/api';
import { IzipayCheckout } from '@/components/ui/izipay-checkout';
import toast from 'react-hot-toast';

// Form validation schema
const checkoutSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Teléfono debe tener al menos 9 dígitos'),
  
  // Billing Address
  address: z.string().min(5, 'Dirección debe tener al menos 5 caracteres'),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Departamento requerido'),
  zipCode: z.string().optional(),
  country: z.string().default('PE'),
  
  // Additional fields
  documentType: z.enum(['dni', 'ruc'], { required_error: 'Tipo de documento requerido' }),
  documentNumber: z.string().min(8, 'Número de documento requerido'),
  businessName: z.string().optional(),
  
  // Terms acceptance
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar la política de privacidad',
  }),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

// Order Summary Component
const OrderSummary = ({ cart }: { cart: any }) => {
  const appliedCoupon = useAppliedCoupon();
  const couponDiscount = useCouponDiscount();
  const { removeCoupon } = useCartStore();
  const removeCouponMutation = useRemoveCoupon();
  
  const subtotal = cart?.total_amount || 0;
  const total = Math.max(0, subtotal - couponDiscount);

  const handleRemoveCoupon = async () => {
    try {
      await removeCouponMutation.mutateAsync();
      removeCoupon();
    } catch (error) {
      console.error('Error removing coupon:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Resumen del pedido
      </h3>
      
      {/* Cart Items */}
      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
        {cart?.items?.map((item: any) => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
              <img 
                src={item.template_thumbnail || '/placeholder-template.jpg'}
                alt={item.template_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">
                {item.template_name}
              </p>
              <p className="text-xs text-gray-600">
                Cantidad: {item.quantity}
              </p>
            </div>
            <p className="font-medium text-gray-900 text-sm">
              S/ {((item.price || 0) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      
      {/* Applied Coupon */}
      {appliedCoupon && (
        <div className="mb-4">
          <CouponCard
            coupon={appliedCoupon}
            discountAmount={couponDiscount}
            orderAmount={subtotal}
            onRemove={handleRemoveCoupon}
            isRemoving={removeCouponMutation.isPending}
            compact
          />
        </div>
      )}
      
      {/* Coupon Input */}
      {!appliedCoupon && (
        <div className="mb-4">
          <CouponInput
            orderAmount={subtotal}
            compact
          />
        </div>
      )}
      
      {/* Pricing Breakdown */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
        </div>
        
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento ({appliedCoupon?.code})</span>
            <span>-S/ {couponDiscount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="border-t pt-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Security Badge */}
      <div className="flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
        <Lock className="w-4 h-4 mr-2" />
        Pago 100% seguro y encriptado
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading: cartLoading } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const appliedCoupon = useAppliedCoupon();
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
  });

  const documentType = watch('documentType');

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      router.push('/carrito');
    }
  }, [cart, cartLoading, router]);

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);
    
    try {
      // Step 1: Create order first
      const orderData = {
        billing_address: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          country: data.country,
          document_type: data.documentType,
          document_number: data.documentNumber,
          business_name: data.businessName,
        },
        coupon_code: appliedCoupon?.code,
      };
      
      console.log('🚀 [CHECKOUT] Creating order with data:', {
        orderData,
        cartItems: cart?.items?.length || 0,
        cartTotal: cart?.total_amount || 0,
        appliedCoupon: appliedCoupon?.code || 'none'
      });
      
      const orderResponse = await ordersApi.createOrder(orderData);
      
      console.log('✅ [CHECKOUT] Order creation response:', orderResponse);
      
      if (!orderResponse.success || !orderResponse.order) {
        console.error('❌ [CHECKOUT] Order creation failed:', orderResponse);
        throw new Error('Failed to create order: ' + ((orderResponse as any).error || 'Unknown error'));
      }
      
      const order = orderResponse.order;
      setCurrentOrder(order);
      
      // Step 2: Create payment token for Izipay
      setIsLoadingPayment(true);
      const tokenData = {
        order_id: order.id,
        billing_info: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phone,
          street: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: (data.zipCode || '15001').replace(/\D/g, '').padStart(5, '0').slice(0, 5) || '15001',
          document: data.documentNumber,
          documentType: data.documentType.toUpperCase(),
        },
      };
      
      console.log('🔒 [CHECKOUT] Creating formToken with data:', tokenData);
      const tokenResponse = await paymentsApi.createPaymentToken(tokenData);
      
      console.log('🔑 [CHECKOUT] FormToken response:', tokenResponse);
      
      if (!tokenResponse.success || !tokenResponse.formToken) {
        console.error('❌ [CHECKOUT] FormToken creation failed:', tokenResponse);
        throw new Error('Failed to create formToken: ' + ((tokenResponse as any).error || 'Unknown error'));
      }
      
      setPaymentConfig({
        formToken: tokenResponse.formToken,
        publicKey: tokenResponse.publicKey
      });
      
      // Move to payment step
      setCurrentStep(2);
      toast.success('Orden creada. Procede con el pago.');
      
    } catch (error: any) {
      console.error('❌ [CHECKOUT] Complete error details:', {
        error: error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        stack: error.stack
      });
      
      let errorMessage = 'Error procesando la orden';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('❌ [CHECKOUT] Final error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setIsLoadingPayment(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (paymentResult: any) => {
    try {
      if (!currentOrder) {
        throw new Error('No order found');
      }

      // Process the payment result
      await paymentsApi.processPayment({
        order_id: currentOrder.id,
        payment_result: {
          status: 'SUCCESS',
          transaction_id: currentOrder.order_number,
          izipay_data: paymentResult,
        },
      });

      toast.success('¡Pago completado exitosamente!');
      router.push(`/mi-cuenta/pedidos/${currentOrder.order_number}?success=true`);
      
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error('Error confirmando el pago. Contacta con soporte.');
    }
  };

  // Handle failed payment
  const handlePaymentError = async (error: any) => {
    try {
      if (currentOrder) {
        await paymentsApi.processPayment({
          order_id: currentOrder.id,
          payment_result: {
            status: 'FAILED',
            transaction_id: currentOrder.order_number,
            izipay_data: error,
          },
        });
      }
    } catch (processError) {
      console.error('Error processing payment failure:', processError);
    }
    
    toast.error('Error en el pago. Inténtalo de nuevo.');
    setCurrentStep(1); // Go back to form
  };

  // Removed - functionality moved to OrderSummary component

  const handleGoBack = () => {
    router.push('/carrito');
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return null; // Redirecting...
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="text-purple-600 hover:text-purple-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al carrito
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finalizar Compra</h1>
              <p className="text-gray-600">Completa tu información para procesar el pedido</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    1
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        {...register('firstName')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="Tu nombre"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        {...register('lastName')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="Tu apellido"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        {...register('email')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="tu@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        {...register('phone')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="+51 987 654 321"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    2
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Información de Facturación</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de documento *
                    </label>
                    <select
                      {...register('documentType')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="">Selecciona un tipo</option>
                      <option value="dni">DNI (Persona Natural)</option>
                      <option value="ruc">RUC (Empresa)</option>
                    </select>
                    {errors.documentType && (
                      <p className="text-red-500 text-sm mt-1">{errors.documentType.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de documento *
                    </label>
                    <input
                      type="text"
                      {...register('documentNumber')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder={documentType === 'ruc' ? '20123456789' : '12345678'}
                    />
                    {errors.documentNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.documentNumber.message}</p>
                    )}
                  </div>
                </div>
                
                {documentType === 'ruc' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razón Social
                    </label>
                    <input
                      type="text"
                      {...register('businessName')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      {...register('address')}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                      placeholder="Av. Lima 123, Distrito"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      {...register('city')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Lima"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento *
                    </label>
                    <input
                      type="text"
                      {...register('state')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Lima"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      {...register('zipCode', {
                        pattern: {
                          value: /^\d{0,5}$/,
                          message: 'Solo se permiten números (5 dígitos)'
                        }
                      })}
                      maxLength={5}
                      onInput={(e) => {
                        // Remove non-numeric characters as user types
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/\D/g, '').slice(0, 5);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="15001"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    3
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Términos y Condiciones</h2>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('acceptTerms')}
                      className="mt-1 text-purple-600 focus:ring-purple-600"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Acepto los{' '}
                      <a href="/terminos" target="_blank" className="text-purple-600 hover:underline">
                        términos y condiciones
                      </a>{' '}
                      del servicio
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-red-500 text-sm ml-6">{errors.acceptTerms.message}</p>
                  )}
                  
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('acceptPrivacy')}
                      className="mt-1 text-purple-600 focus:ring-purple-600"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Acepto la{' '}
                      <a href="/privacidad" target="_blank" className="text-purple-600 hover:underline">
                        política de privacidad
                      </a>{' '}
                      y el tratamiento de mis datos personales
                    </span>
                  </label>
                  {errors.acceptPrivacy && (
                    <p className="text-red-500 text-sm ml-6">{errors.acceptPrivacy.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                  disabled={isProcessing || !isValid}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isProcessing ? 'Creando orden...' : 'Continuar al Pago'}
                </Button>
              </div>
            </form>
            )}

            {/* Payment Step */}
            {currentStep === 2 && currentOrder && paymentConfig && (
              <div className="space-y-6">
                {/* Back Button */}
                <div className="flex items-center mb-6">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(1)}
                    className="text-purple-600 hover:text-purple-700 mr-4"
                    disabled={isLoadingPayment}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a editar
                  </Button>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Paso 2: Procesar Pago</h2>
                    <p className="text-gray-600">Orden #{currentOrder.order_number} creada correctamente</p>
                  </div>
                </div>

                {/* Izipay Checkout */}
                <IzipayCheckout
                  order={{
                    id: currentOrder.id,
                    order_number: currentOrder.order_number,
                    total: currentOrder.total,
                    currency: currentOrder.currency || 'PEN',
                  }}
                  billingInfo={{
                    firstName: watch('firstName') || '',
                    lastName: watch('lastName') || '',
                    email: watch('email') || '',
                    phoneNumber: watch('phone') || '',
                    street: watch('address') || '',
                    city: watch('city') || '',
                    state: watch('state') || '',
                    country: watch('country') || 'PE',
                    postalCode: (watch('zipCode') || '15001').replace(/\D/g, '').padStart(5, '0').slice(0, 5) || '15001',
                    document: watch('documentNumber') || '',
                    documentType: (watch('documentType') || 'dni').toUpperCase() as 'DNI' | 'RUC',
                  }}
                  paymentConfig={paymentConfig}
                  onPaymentComplete={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  isLoading={isLoadingPayment}
                />
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <OrderSummary cart={cart} />
          </div>
        </div>
      </div>
    </div>
  );
}