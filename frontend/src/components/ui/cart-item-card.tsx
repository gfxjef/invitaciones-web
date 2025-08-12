/**
 * Cart Item Card Component
 * 
 * WHY: Reusable cart item display component that shows template
 * details, quantity controls, and removal functionality. Used
 * consistently across cart page and mini cart.
 * 
 * WHAT: Displays cart item with image, details, quantity controls,
 * and delete button with loading states.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trash2, Plus, Minus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CartItem } from '@/lib/api';
import { useUpdateCartItem, useRemoveFromCart } from '@/lib/hooks/use-cart';

interface CartItemCardProps {
  item: CartItem;
  compact?: boolean;
  className?: string;
  showImage?: boolean;
}

export function CartItemCard({ 
  item, 
  compact = false, 
  className = "",
  showImage = true 
}: CartItemCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveFromCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItemMutation.mutate({ itemId: item.id, quantity: newQuantity });
  };

  const handleRemove = () => {
    if (showConfirmDelete) {
      removeItemMutation.mutate(item.id);
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirmDelete(false), 3000);
    }
  };

  const isUpdating = updateItemMutation.isPending || removeItemMutation.isPending;

  return (
    <div className={`bg-white rounded-xl border shadow-sm transition-all duration-200 ${
      isUpdating ? 'opacity-75' : ''
    } ${className}`}>
      <div className={`p-${compact ? '4' : '6'}`}>
        <div className="flex gap-4">
          {/* Template Image */}
          {showImage && (
            <div className="flex-shrink-0">
              <div className={`${compact ? 'w-16 h-20' : 'w-24 h-30'} bg-gray-200 rounded-lg overflow-hidden`}>
                <Image 
                  src={item.thumbnail_url || '/placeholder-template.jpg'}
                  alt={item.name}
                  width={compact ? 64 : 96}
                  height={compact ? 80 : 120}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Item Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    ID: {item.id}
                  </Badge>
                  {item.price && item.price >= 10 && (
                    <Badge className="bg-purple-600 text-white text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Delete Button */}
              <div className="flex flex-col items-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`transition-all ${
                    showConfirmDelete 
                      ? 'text-white bg-red-600 hover:bg-red-700' 
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                  }`}
                  onClick={handleRemove}
                  disabled={isUpdating}
                >
                  <Trash2 className="w-4 h-4" />
                  {showConfirmDelete && !compact && <span className="ml-1">Confirmar</span>}
                </Button>
                
                {showConfirmDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 text-xs"
                    onClick={() => setShowConfirmDelete(false)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>

            {/* Quantity and Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm">Cantidad:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    disabled={item.quantity <= 1 || isUpdating}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    disabled={isUpdating}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="text-right">
                {!compact && (
                  <p className="text-sm text-gray-600">
                    S/ {item.price?.toFixed(2)} c/u
                  </p>
                )}
                <p className={`${compact ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>
                  S/ {item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}
    </div>
  );
}

export default CartItemCard;