/**
 * React Query Hooks for Shopping Cart with Zustand Integration
 * 
 * WHY: Custom hooks that encapsulate React Query logic for cart operations,
 * integrated with Zustand store for optimistic updates and persistent state.
 * Provides consistent state management and smooth user experience.
 * 
 * WHAT: Enhanced hooks for cart CRUD operations with Zustand store integration,
 * optimistic updates, error rollback, and localStorage persistence.
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { cartApi, Cart, Template } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

/**
 * Hook to fetch current user's cart with Zustand integration
 */
export const useCart = (options?: UseQueryOptions<Cart>) => {
  const { setCart, setLoading, setError, cart } = useCartStore();
  
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await cartApi.getCart();
        setCart(result);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error loading cart';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
    retry: 1,
    initialData: cart || undefined, // Use Zustand cart as initial data
    ...options,
  });
};

/**
 * Hook to add item to cart with Zustand optimistic updates
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { addItemOptimistic, setCart, setUpdating, cart } = useCartStore();
  
  return useMutation({
    mutationFn: ({ 
      templateId, 
      quantity = 1, 
      templateName,
      templateThumbnail,
      unitPrice 
    }: { 
      templateId: number; 
      quantity?: number;
      templateName: string;
      templateThumbnail: string;
      unitPrice: number;
    }) => cartApi.addToCart(templateId, quantity),
    
    onMutate: async ({ templateId, quantity = 1, templateName, templateThumbnail, unitPrice }) => {
      setUpdating(true);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      
      // Snapshot the previous cart state from Zustand
      const previousCart = cart;
      
      // Optimistically update cart in Zustand
      addItemOptimistic(templateId, templateName, templateThumbnail, unitPrice, quantity);
      
      return { previousCart };
    },
    
    onSuccess: (newCart) => {
      // Update Zustand store with server response
      setCart(newCart);
      toast.success('Plantilla agregada al carrito');
    },
    
    onError: (err, variables, context) => {
      // Revert optimistic update in Zustand
      if (context?.previousCart) {
        setCart(context.previousCart);
      }
      toast.error('Error agregando al carrito. Inténtalo de nuevo.');
    },
    
    onSettled: () => {
      setUpdating(false);
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Hook to update cart item quantity with Zustand optimistic updates
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const { updateItemOptimistic, setCart, setUpdating, cart } = useCartStore();
  
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartApi.updateCartItem(itemId, quantity),
    
    onMutate: async ({ itemId, quantity }) => {
      setUpdating(true);
      
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      
      // Snapshot the previous cart state from Zustand
      const previousCart = cart;
      
      // Optimistically update cart in Zustand
      updateItemOptimistic(itemId, quantity);
      
      return { previousCart };
    },
    
    onSuccess: (newCart) => {
      // Update Zustand store with server response
      setCart(newCart);
    },
    
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
      }
      toast.error('Error actualizando cantidad. Inténtalo de nuevo.');
    },
    
    onSettled: () => {
      setUpdating(false);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Hook to remove item from cart with Zustand optimistic updates
 */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  const { removeItemOptimistic, setCart, setUpdating, cart } = useCartStore();
  
  return useMutation({
    mutationFn: (itemId: number) => cartApi.removeFromCart(itemId),
    
    onMutate: async (itemId) => {
      setUpdating(true);
      
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      
      // Snapshot the previous cart state from Zustand
      const previousCart = cart;
      
      // Optimistically remove item from Zustand
      removeItemOptimistic(itemId);
      
      return { previousCart };
    },
    
    onSuccess: (_, itemId) => {
      toast.success('Plantilla removida del carrito');
      // Refetch cart to get updated server state
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
      }
      toast.error('Error removiendo del carrito. Inténtalo de nuevo.');
    },
    
    onSettled: () => {
      setUpdating(false);
    },
  });
};

/**
 * Hook to clear entire cart with Zustand optimistic updates
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { clearCartOptimistic, setCart, setUpdating, cart } = useCartStore();
  
  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    
    onMutate: async () => {
      setUpdating(true);
      
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      
      // Snapshot the previous cart state from Zustand
      const previousCart = cart;
      
      // Optimistically clear cart in Zustand
      clearCartOptimistic();
      
      return { previousCart };
    },
    
    onSuccess: () => {
      toast.success('Carrito limpiado');
      // Refetch cart to get updated server state
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
      }
      toast.error('Error limpiando carrito. Inténtalo de nuevo.');
    },
    
    onSettled: () => {
      setUpdating(false);
    },
  });
};

/**
 * Enhanced Cart Hook with Template Integration
 * WHY: Provides an easier way to add items to cart when you have template data
 */
export const useAddTemplateToCart = () => {
  const addToCart = useAddToCart();
  
  return {
    ...addToCart,
    addTemplate: (template: Template, quantity = 1) => {
      // Get price from template data (from backend) or fallback to premium/standard pricing
      const unitPrice = template.price || 
                       (template.plan?.price) || 
                       (template.is_premium ? 49.90 : 29.90); // Fallback using actual plan prices
      
      return addToCart.mutate({
        templateId: template.id,
        quantity: 1, // Templates always have quantity 1
        templateName: template.name,
        templateThumbnail: template.thumbnail_url || template.preview_image_url,
        unitPrice: unitPrice,
      });
    },
  };
};