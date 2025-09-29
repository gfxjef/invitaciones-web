/**
 * Zustand Cart Store
 * 
 * WHY: Global state management for cart with persistent storage and
 * optimistic updates. Combines Zustand for state management with
 * localStorage sync for cross-session persistence.
 * 
 * WHAT: Centralized cart state with actions for add/remove/update items,
 * localStorage synchronization, and optimistic UI updates.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Cart, CartItem, Coupon } from '@/lib/api';

interface CartState {
  // Cart data
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  // Coupon state
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  
  // Optimistic updates state
  isUpdating: boolean;
  
  // Actions
  setCart: (cart: Cart) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUpdating: (updating: boolean) => void;
  
  // Coupon actions
  setCoupon: (coupon: Coupon | null, discount: number) => void;
  removeCoupon: () => void;
  
  // Optimistic cart operations
  addItemOptimistic: (templateId: number, templateName: string, templateThumbnail: string, unitPrice: number, quantity?: number) => void;
  updateItemOptimistic: (itemId: number, quantity: number) => void;
  removeItemOptimistic: (itemId: number) => void;
  clearCartOptimistic: () => void;
  
  // Utility methods
  getItemCount: () => number;
  getTotalAmount: () => number;
  getFinalAmount: () => number;
  hasItem: (templateId: number) => boolean;
  getItem: (templateId: number) => CartItem | undefined;
  
  // Reset state
  reset: () => void;
}

const initialCart: Cart = {
  id: 0,
  items: [],
  total_amount: 0,
  item_count: 0,
};

export const useCartStore = create<CartState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      error: null,
      appliedCoupon: null,
      couponDiscount: 0,
      isUpdating: false,

      // Basic setters
      setCart: (cart: Cart) => set((state) => {
        state.cart = cart;
        state.error = null;
      }),

      setLoading: (loading: boolean) => set((state) => {
        state.isLoading = loading;
      }),

      setError: (error: string | null) => set((state) => {
        state.error = error;
      }),

      setUpdating: (updating: boolean) => set((state) => {
        state.isUpdating = updating;
      }),

      // Coupon actions
      setCoupon: (coupon: Coupon | null, discount: number) => set((state) => {
        state.appliedCoupon = coupon;
        state.couponDiscount = discount;
      }),

      removeCoupon: () => set((state) => {
        state.appliedCoupon = null;
        state.couponDiscount = 0;
      }),

      // Optimistic cart operations
      addItemOptimistic: (templateId: number, templateName: string, templateThumbnail: string, unitPrice: number, quantity = 1) => set((state) => {
        if (!state.cart) {
          state.cart = { ...initialCart };
        }

        // For templates, implement single selection - remove any existing templates first
        state.cart.items = state.cart.items.filter(item => item.type !== 'template');
        
        // Add new template
        const newItem: CartItem = {
          type: 'template',
          id: templateId,
          name: templateName,
          description: '',
          thumbnail_url: templateThumbnail,
          quantity: 1, // Templates always have quantity 1
          price: unitPrice, // Store price for calculation
        };
        state.cart.items.push(newItem);

        // Recalculate totals
        state.cart.item_count = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
        state.cart.total_amount = state.cart.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
      }),

      updateItemOptimistic: (itemId: number, quantity: number) => set((state) => {
        if (!state.cart) return;

        const item = state.cart.items.find(item => item.id === itemId);
        if (item) {
          item.quantity = quantity;

          // Recalculate totals
          state.cart.item_count = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
          state.cart.total_amount = state.cart.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
        }
      }),

      removeItemOptimistic: (itemId: number) => set((state) => {
        if (!state.cart) return;

        state.cart.items = state.cart.items.filter(item => item.id !== itemId);

        // Recalculate totals
        state.cart.item_count = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
        state.cart.total_amount = state.cart.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
      }),

      clearCartOptimistic: () => set((state) => {
        state.cart = { ...initialCart };
      }),

      // Utility methods
      getItemCount: () => {
        const state = get();
        return state.cart?.item_count || 0;
      },

      getTotalAmount: () => {
        const state = get();
        return state.cart?.total_amount || 0;
      },

      getFinalAmount: () => {
        const state = get();
        const subtotal = state.cart?.total_amount || 0;
        return Math.max(0, subtotal - state.couponDiscount);
      },

      hasItem: (templateId: number) => {
        const state = get();
        return state.cart?.items?.some(item => item.type === 'template' && item.id === templateId) || false;
      },

      getItem: (templateId: number) => {
        const state = get();
        return state.cart?.items?.find(item => item.type === 'template' && item.id === templateId);
      },

      // Reset state
      reset: () => set((state) => {
        state.cart = null;
        state.isLoading = false;
        state.error = null;
        state.appliedCoupon = null;
        state.couponDiscount = 0;
        state.isUpdating = false;
      }),
    })),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        cart: state.cart,
        appliedCoupon: state.appliedCoupon,
        couponDiscount: state.couponDiscount,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migration if needed in future versions
        if (version < 1) {
          return {
            ...persistedState,
            cart: null,
          };
        }
        return persistedState;
      },
    }
  )
);

/**
 * Cart Store Selectors
 * WHY: Optimized selectors to prevent unnecessary re-renders
 */
export const useCartCount = () => useCartStore(state => state.cart?.item_count || 0);
export const useCartTotal = () => useCartStore(state => state.cart?.total_amount || 0);
export const useCartFinalAmount = () => useCartStore(state => state.getFinalAmount());
export const useCartItems = () => useCartStore(state => state.cart?.items || []);
export const useCartLoading = () => useCartStore(state => state.isLoading);
export const useCartError = () => useCartStore(state => state.error);
export const useCartUpdating = () => useCartStore(state => state.isUpdating);
export const useAppliedCoupon = () => useCartStore(state => state.appliedCoupon);
export const useCouponDiscount = () => useCartStore(state => state.couponDiscount);

/**
 * Custom hook to get cart item by template ID
 */
export const useCartItem = (templateId: number) =>
  useCartStore(state => state.cart?.items?.find(item => item.type === 'template' && item.id === templateId));

/**
 * Custom hook to check if template is in cart
 */
export const useHasCartItem = (templateId: number) =>
  useCartStore(state => state.cart?.items?.some(item => item.type === 'template' && item.id === templateId) || false);