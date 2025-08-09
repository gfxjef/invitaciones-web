/**
 * Shopping Cart Page (/carrito)
 * 
 * WHY: Essential e-commerce functionality that allows users to review
 * selected templates, adjust quantities, and proceed to checkout.
 * Critical conversion point in the sales funnel.
 * 
 * WHAT: Interactive cart page with item management, quantity updates,
 * price calculations, and checkout navigation.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ArrowRight,
  Star,
  Tag,
  Gift,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart, useClearCart } from '@/lib/hooks/use-cart';
import { useCartItems, useCartCount, useCartTotal, useCartLoading, useCartError } from '@/store/cartStore';
import CartItemCard from '@/components/ui/cart-item-card';
import CartSummary from '@/components/ui/cart-summary';
import EmptyState from '@/components/ui/empty-state';
import toast from 'react-hot-toast';

// Coupon Component
const CouponSection = () => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Ingresa un código de cupón');
      return;
    }

    setIsApplying(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (couponCode.toUpperCase() === 'DESCUENTO10') {
        setAppliedCoupon(couponCode);
        toast.success('¡Cupón aplicado correctamente!');
        setCouponCode('');
      } else {
        toast.error('Código de cupón inválido');
      }
    } catch (error) {
      toast.error('Error aplicando el cupón');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Cupón removido');
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Tag className="w-5 h-5 mr-2" />
        Código de descuento
      </h3>
      
      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <Gift className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              {appliedCoupon} aplicado
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={handleRemoveCoupon}
          >
            Remover
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ingresa tu código de cupón"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            disabled={isApplying}
          />
          <Button
            onClick={handleApplyCoupon}
            disabled={isApplying || !couponCode.trim()}
          >
            {isApplying ? 'Aplicando...' : 'Aplicar'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default function CarritoPage() {
  const router = useRouter();
  const { data: cart } = useCart(); // Still fetch from server for sync
  
  // Use Zustand selectors for reactive UI
  const cartItems = useCartItems();
  const cartCount = useCartCount();
  const cartTotal = useCartTotal();
  const isLoading = useCartLoading();
  const error = useCartError();
  
  const clearCartMutation = useClearCart();

  const handleClearCart = () => {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      clearCartMutation.mutate();
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    router.push('/plantillas');
  };

  // Calculate totals
  const subtotal = cartTotal;
  const discount = 0; // Would be calculated based on applied coupons
  const total = subtotal - discount;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-48"></div>
                ))}
              </div>
              <div className="bg-gray-200 rounded-xl h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error cargando el carrito
          </h2>
          <p className="text-gray-600 mb-4">
            Hubo un problema al cargar tu carrito de compras
          </p>
          <Button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Carrito</h1>
          
          <EmptyState
            icon={<ShoppingCart className="w-24 h-24 text-gray-300" />}
            title="Tu carrito está vacío"
            description="Parece que no has agregado ninguna plantilla a tu carrito. ¡Explora nuestras hermosas plantillas de invitaciones!"
            action={{
              label: "Explorar Plantillas",
              onClick: handleContinueShopping
            }}
            className="bg-white rounded-xl shadow-sm border"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Carrito</h1>
            <p className="text-gray-600">
              {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'} en tu carrito
            </p>
          </div>
          
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={handleClearCart}
            disabled={clearCartMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Vaciar carrito
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))}
            
            {/* Continue Shopping */}
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={handleContinueShopping}
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Continuar comprando
              </Button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Coupon Section */}
            <CouponSection />

            {/* Order Summary */}
            <CartSummary showActions={true} showClearButton={false} />

            {/* Payment Methods */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h4 className="font-medium text-gray-900 mb-3">Métodos de pago aceptados</h4>
              <div className="flex items-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="American Express" className="h-6" />
              </div>
              
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <AlertCircle className="w-4 h-4 mr-1" />
                Pago 100% seguro
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}