/**
 * Cart Summary Component
 * 
 * WHY: Reusable cart summary that displays cart totals, item count,
 * and provides quick actions. Used in multiple places like sidebar,
 * checkout, and mini cart.
 * 
 * WHAT: Shows cart totals with breakdown, item count, and action buttons.
 */

'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartItems, useCartCount, useCartTotal } from '@/store/cartStore';
import { useClearCart } from '@/lib/hooks/use-cart';

interface CartSummaryProps {
  showActions?: boolean;
  showClearButton?: boolean;
  className?: string;
  compact?: boolean;
}

export function CartSummary({ 
  showActions = true, 
  showClearButton = false,
  className = "",
  compact = false
}: CartSummaryProps) {
  const router = useRouter();
  const cartItems = useCartItems();
  const cartCount = useCartCount();
  const cartTotal = useCartTotal();
  const clearCartMutation = useClearCart();

  const handleViewCart = () => {
    router.push('/carrito');
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleClearCart = () => {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      clearCartMutation.mutate();
    }
  };

  if (cartCount === 0 && !compact) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
        <Button
          onClick={() => router.push('/plantillas')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Explorar Plantillas
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border shadow-sm ${className}`}>
      {!compact && (
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Resumen del pedido
            </h3>
            {showClearButton && cartCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                disabled={clearCartMutation.isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
          {cartCount > 0 && (
            <p className="text-gray-600 text-sm">
              {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
            </p>
          )}
        </div>
      )}

      <div className="p-6">
        {cartCount === 0 ? (
          <div className="text-center">
            <p className="text-gray-500">Sin artículos</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">S/ {cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Descuento</span>
                <span className="font-medium text-green-600">S/ 0.00</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>S/ {cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {showActions && (
              <div className="space-y-3">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleCheckout}
                >
                  Proceder al pago
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                {!compact && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleViewCart}
                  >
                    Ver carrito completo
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CartSummary;