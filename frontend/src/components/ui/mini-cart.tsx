'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Trash2,
  ArrowRight,
  Minus,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartCount, useCartTotal, useCartItems } from '@/store/cartStore';
import { useRemoveFromCart, useUpdateCartItem } from '@/lib/hooks/use-cart';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MiniCart = ({ isOpen, onClose }: MiniCartProps) => {
  const router = useRouter();
  const cartItems = useCartItems();
  const cartTotal = useCartTotal();
  const cartCount = useCartCount();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();

  if (!isOpen) return null;

  const handleRemoveItem = (id: number, type: 'template' | 'plan') => {
    removeFromCart.mutate({ id, type });
  };

  const handleUpdateQuantity = (id: number, newQuantity: number, type: 'template' | 'plan') => {
    if (newQuantity < 1) {
      handleRemoveItem(id, type);
      return;
    }
    updateCartItem.mutate({ id, quantity: newQuantity, type });
  };

  const handleViewCart = () => {
    router.push('/carrito');
    onClose();
  };

  const handleCheckout = () => {
    router.push('/checkout');
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
      {cartItems.length === 0 ? (
        <div className="p-6 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
          <Button
            size="sm"
            onClick={() => {
              router.push('/plantillas');
              onClose();
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Explorar Plantillas
          </Button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">
              Mi Carrito ({cartCount} {cartCount === 1 ? 'artículo' : 'artículos'})
            </h3>
          </div>

          {/* Items */}
          <div className="max-h-64 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.id} className="p-4 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <Image
                    src={item.thumbnail_url || 'https://images.pexels.com/photos/1024967/pexels-photo-1024967.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      S/ {item.price?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.type)}
                        className="p-1 hover:bg-gray-100"
                        disabled={updateCartItem.isPending}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 py-1 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.type)}
                        className="p-1 hover:bg-gray-100"
                        disabled={updateCartItem.isPending}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id, item.type)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      disabled={removeFromCart.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">S/ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewCart}
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                Ver Carrito
              </Button>
              <Button
                size="sm"
                onClick={handleCheckout}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Comprar
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};