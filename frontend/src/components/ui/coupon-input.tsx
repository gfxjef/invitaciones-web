/**
 * CouponInput Component
 * 
 * WHY: Provides a user-friendly interface for applying coupon codes with
 * real-time validation, loading states, and clear feedback. Critical for
 * conversion optimization as it enables discounts during checkout.
 * 
 * WHAT: Input field with validation, apply/remove buttons, and immediate
 * visual feedback. Integrates with cart store and coupon validation API.
 */

'use client';

import { useState, useEffect } from 'react';
import { Tag, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, useAppliedCoupon, useCouponDiscount } from '@/store/cartStore';
import { useValidateCoupon, useApplyCoupon, useRemoveCoupon, useCouponValidation } from '@/lib/hooks/use-coupons';
import { useDebounce } from '@/lib/hooks/use-debounce';
import toast from 'react-hot-toast';

interface CouponInputProps {
  /** Order amount for validation */
  orderAmount: number;
  /** Optional CSS classes */
  className?: string;
  /** Show as compact version */
  compact?: boolean;
}

export function CouponInput({ 
  orderAmount, 
  className = '',
  compact = false 
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const debouncedCouponCode = useDebounce(couponCode, 500);
  
  // Store state
  const appliedCoupon = useAppliedCoupon();
  const couponDiscount = useCouponDiscount();
  const { setCoupon, removeCoupon } = useCartStore();
  
  // Hooks
  const { validateCouponForOrder } = useCouponValidation();
  const applyMutation = useApplyCoupon();
  const removeMutation = useRemoveCoupon();
  
  // Real-time validation
  const { 
    data: validation, 
    isLoading: isValidating,
    error: validationError 
  } = useValidateCoupon(
    debouncedCouponCode,
    orderAmount,
    !!debouncedCouponCode && debouncedCouponCode.length >= 3 && !appliedCoupon
  );

  // Reset input when coupon is applied externally
  useEffect(() => {
    if (appliedCoupon) {
      setCouponCode('');
    }
  }, [appliedCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Por favor ingresa un código de cupón');
      return;
    }

    if (validation && !validation.valid) {
      toast.error(validation.message);
      return;
    }

    setIsApplying(true);
    
    try {
      const response = await applyMutation.mutateAsync({
        coupon_code: couponCode.trim(),
        order_amount: orderAmount,
      });

      // Update store state
      setCoupon(response.coupon, response.discount_amount);
      setCouponCode('');

    } catch (error: any) {
      console.error('Error applying coupon:', error);
      // Error handled by the mutation's onError
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeMutation.mutateAsync();
      removeCoupon();
    } catch (error) {
      console.error('Error removing coupon:', error);
      // Error handled by the mutation's onError
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyCoupon();
    }
  };

  // Show applied coupon state
  if (appliedCoupon) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">
                Cupón aplicado: {appliedCoupon.code}
              </p>
              <p className="text-sm text-green-600">
                Ahorras S/ {couponDiscount.toFixed(2)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            disabled={removeMutation.isPending}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {removeMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Input state
  const isLoading = isValidating || isApplying;
  const hasValidation = validation && debouncedCouponCode.length >= 3;
  const isValid = hasValidation && validation.valid;
  const isInvalid = hasValidation && !validation.valid;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Title */}
      {!compact && (
        <div className="flex items-center">
          <Tag className="w-4 h-4 text-gray-600 mr-2" />
          <h3 className="font-medium text-gray-900">Código de descuento</h3>
        </div>
      )}

      {/* Input Group */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Ingresa tu código"
              className={`
                w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                ${isValid ? 'border-green-500 bg-green-50' : ''}
                ${isInvalid ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              `}
              disabled={isLoading}
            />
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
            
            {/* Validation icons */}
            {!isLoading && hasValidation && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isValid ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handleApplyCoupon}
            disabled={!couponCode.trim() || isLoading || isInvalid}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6"
          >
            {isApplying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Aplicar'
            )}
          </Button>
        </div>

        {/* Validation Message */}
        {hasValidation && validation.message && (
          <div className={`mt-2 text-sm flex items-center ${
            isValid ? 'text-green-600' : 'text-red-600'
          }`}>
            {isValid ? (
              <Check className="w-3 h-3 mr-1" />
            ) : (
              <AlertCircle className="w-3 h-3 mr-1" />
            )}
            {validation.message}
          </div>
        )}

        {/* Network Error */}
        {validationError && (
          <div className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error al validar cupón. Verifica tu conexión.
          </div>
        )}
      </div>

      {/* Help Text */}
      {!compact && !hasValidation && (
        <p className="text-xs text-gray-500">
          Los códigos de descuento son sensibles a mayúsculas
        </p>
      )}
    </div>
  );
}

export default CouponInput;