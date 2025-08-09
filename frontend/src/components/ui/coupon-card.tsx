/**
 * CouponCard Component
 * 
 * WHY: Displays applied coupon information in a visually appealing card
 * format within the order summary. Provides clear feedback about savings
 * and allows easy removal of the coupon.
 * 
 * WHAT: Card component showing coupon details, discount amount, and
 * removal functionality with proper loading states.
 */

'use client';

import { Tag, X, Loader2, Percent, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coupon } from '@/lib/api';

interface CouponCardProps {
  /** Applied coupon data */
  coupon: Coupon;
  /** Calculated discount amount */
  discountAmount: number;
  /** Original order amount */
  orderAmount: number;
  /** Callback for removing coupon */
  onRemove: () => void;
  /** Loading state for remove action */
  isRemoving?: boolean;
  /** Compact layout for smaller spaces */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function CouponCard({
  coupon,
  discountAmount,
  orderAmount,
  onRemove,
  isRemoving = false,
  compact = false,
  className = '',
}: CouponCardProps) {
  // Format coupon value display
  const formatCouponValue = (coupon: Coupon): string => {
    if (coupon.type === 'PERCENTAGE') {
      return `${coupon.value}%`;
    } else {
      return `S/ ${coupon.value.toFixed(2)}`;
    }
  };

  // Calculate savings percentage
  const savingsPercentage = ((discountAmount / orderAmount) * 100).toFixed(1);

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <Tag className="w-4 h-4 text-green-600 mr-2" />
          <div>
            <span className="text-green-800 font-medium text-sm">
              {coupon.code}
            </span>
            <span className="text-green-600 text-xs ml-2">
              -{formatCouponValue(coupon)}
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-green-700 font-semibold text-sm mr-2">
            -S/ {discountAmount.toFixed(2)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isRemoving}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-auto p-1"
          >
            {isRemoving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <X className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-white bg-opacity-50 border-b border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Tag className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800">
                Cupón aplicado
              </h4>
              <p className="text-sm text-green-600">
                Código: {coupon.code}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isRemoving}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {coupon.type === 'PERCENTAGE' ? (
              <Percent className="w-4 h-4 text-green-600 mr-2" />
            ) : (
              <DollarSign className="w-4 h-4 text-green-600 mr-2" />
            )}
            <span className="text-gray-700">
              Descuento: {formatCouponValue(coupon)}
            </span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {savingsPercentage}% ahorro
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700">Total ahorrado:</span>
          <span className="text-lg font-bold text-green-700">
            -S/ {discountAmount.toFixed(2)}
          </span>
        </div>

        {/* Additional Info */}
        {coupon.min_order_amount > 0 && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-xs text-green-600">
              Pedido mínimo: S/ {coupon.min_order_amount.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CouponCard;