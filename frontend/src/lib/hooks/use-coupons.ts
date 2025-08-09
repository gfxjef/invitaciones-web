/**
 * Coupon React Query Hooks
 * 
 * WHY: Custom hooks provide a consistent interface for coupon operations
 * with React Query for caching, loading states, and optimistic updates.
 * Separates API logic from UI components for better maintainability.
 * 
 * WHAT: Collection of hooks for coupon CRUD operations, validation,
 * and application logic with proper error handling and type safety.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi, Coupon, CreateCouponRequest, UpdateCouponRequest, CouponValidation, ApplyCouponRequest } from '@/lib/api';
import toast from 'react-hot-toast';

// Query Keys
export const couponKeys = {
  all: ['coupons'] as const,
  lists: () => [...couponKeys.all, 'list'] as const,
  list: (filters: string) => [...couponKeys.lists(), { filters }] as const,
  details: () => [...couponKeys.all, 'detail'] as const,
  detail: (id: number) => [...couponKeys.details(), id] as const,
  validation: (code: string) => [...couponKeys.all, 'validation', code] as const,
};

/**
 * Get paginated list of coupons (admin only)
 */
export function useCoupons(params?: {
  page?: number;
  per_page?: number;
  is_active?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: couponKeys.list(JSON.stringify(params || {})),
    queryFn: () => couponsApi.getCoupons(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Get single coupon by ID (admin only)
 */
export function useCoupon(id: number) {
  return useQuery({
    queryKey: couponKeys.detail(id),
    queryFn: () => couponsApi.getCoupon(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Create new coupon (admin only)
 */
export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponRequest) => couponsApi.createCoupon(data),
    onSuccess: (newCoupon) => {
      // Invalidate and refetch coupons list
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      
      // Add the new coupon to the cache
      queryClient.setQueryData(couponKeys.detail(newCoupon.id), newCoupon);
      
      toast.success('Cupón creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al crear el cupón';
      toast.error(message);
    },
  });
}

/**
 * Update existing coupon (admin only)
 */
export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCouponRequest }) => 
      couponsApi.updateCoupon(id, data),
    onSuccess: (updatedCoupon) => {
      // Update the specific coupon in cache
      queryClient.setQueryData(couponKeys.detail(updatedCoupon.id), updatedCoupon);
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      
      toast.success('Cupón actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar el cupón';
      toast.error(message);
    },
  });
}

/**
 * Delete coupon (admin only)
 */
export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => couponsApi.deleteCoupon(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: couponKeys.detail(deletedId) });
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      
      toast.success('Cupón eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al eliminar el cupón';
      toast.error(message);
    },
  });
}

/**
 * Validate coupon code
 * WHY: Real-time validation as user types to provide immediate feedback
 */
export function useValidateCoupon(code: string, orderAmount?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: couponKeys.validation(`${code}-${orderAmount || 0}`),
    queryFn: () => couponsApi.validateCoupon(code, orderAmount),
    enabled: enabled && !!code && code.length >= 3,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry failed validations
    refetchOnWindowFocus: false,
  });
}

/**
 * Apply coupon to order
 * WHY: Separate mutation for applying coupons with cart integration
 */
export function useApplyCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApplyCouponRequest) => couponsApi.applyCoupon(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Cupón aplicado exitosamente');
      
      // Invalidate cart data if we have cart queries
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al aplicar el cupón';
      toast.error(message);
    },
  });
}

/**
 * Remove applied coupon
 * WHY: Allows users to remove coupons and see updated pricing
 */
export function useRemoveCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => couponsApi.removeCoupon(),
    onSuccess: (response) => {
      toast.success(response.message || 'Cupón removido exitosamente');
      
      // Invalidate cart data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al remover el cupón';
      toast.error(message);
    },
  });
}

/**
 * Get public coupon information
 * WHY: Display coupon details to users without requiring authentication
 */
export function usePublicCoupon(code: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['coupon', 'public', code],
    queryFn: () => couponsApi.getPublicCoupon(code),
    enabled: enabled && !!code && code.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Utility hook for coupon operations
 * WHY: Provides commonly used coupon utility functions
 */
export function useCouponUtils() {
  /**
   * Format coupon value for display
   */
  const formatCouponValue = (coupon: Coupon): string => {
    if (coupon.type === 'PERCENTAGE') {
      return `${coupon.value}% de descuento`;
    } else {
      return `S/ ${coupon.value.toFixed(2)} de descuento`;
    }
  };

  /**
   * Calculate discount amount
   */
  const calculateDiscount = (coupon: Coupon, orderAmount: number): number => {
    if (coupon.type === 'PERCENTAGE') {
      return (orderAmount * coupon.value) / 100;
    } else {
      return Math.min(coupon.value, orderAmount);
    }
  };

  /**
   * Check if coupon is valid for current date
   */
  const isCouponValid = (coupon: Coupon): boolean => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);
    
    return now >= validFrom && now <= validUntil && coupon.is_active;
  };

  /**
   * Check if coupon meets minimum order amount
   */
  const meetsMinimumAmount = (coupon: Coupon, orderAmount: number): boolean => {
    return orderAmount >= coupon.min_order_amount;
  };

  /**
   * Check if coupon has usage remaining
   */
  const hasUsageRemaining = (coupon: Coupon): boolean => {
    return coupon.usage_limit === 0 || coupon.usage_count < coupon.usage_limit;
  };

  return {
    formatCouponValue,
    calculateDiscount,
    isCouponValid,
    meetsMinimumAmount,
    hasUsageRemaining,
  };
}

/**
 * Combined hook for coupon validation with enhanced logic
 * WHY: Provides comprehensive coupon validation with detailed error messages
 */
export function useCouponValidation() {
  const { calculateDiscount, isCouponValid, meetsMinimumAmount, hasUsageRemaining } = useCouponUtils();

  const validateCouponForOrder = (coupon: Coupon, orderAmount: number): {
    valid: boolean;
    message: string;
    discountAmount: number;
  } => {
    if (!coupon.is_active) {
      return {
        valid: false,
        message: 'Este cupón no está activo',
        discountAmount: 0,
      };
    }

    if (!isCouponValid(coupon)) {
      return {
        valid: false,
        message: 'Este cupón ha expirado o aún no es válido',
        discountAmount: 0,
      };
    }

    if (!meetsMinimumAmount(coupon, orderAmount)) {
      return {
        valid: false,
        message: `Pedido mínimo de S/ ${coupon.min_order_amount.toFixed(2)} requerido`,
        discountAmount: 0,
      };
    }

    if (!hasUsageRemaining(coupon)) {
      return {
        valid: false,
        message: 'Este cupón ha alcanzado su límite de uso',
        discountAmount: 0,
      };
    }

    const discountAmount = calculateDiscount(coupon, orderAmount);

    return {
      valid: true,
      message: `Cupón válido - Ahorras S/ ${discountAmount.toFixed(2)}`,
      discountAmount,
    };
  };

  return {
    validateCouponForOrder,
  };
}