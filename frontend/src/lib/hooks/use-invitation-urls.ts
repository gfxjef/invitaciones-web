/**
 * React Query Hooks for Invitation URLs Management
 * 
 * WHY: Provides centralized data fetching, caching, and state management
 * for invitation URL operations using React Query. Includes optimistic 
 * updates and proper error handling.
 * 
 * WHAT: Custom hooks for CRUD operations on invitation URLs with
 * cache invalidation, loading states, and mutation handling.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  invitationUrlsApi,
  InvitationURL,
  CreateInvitationURLRequest,
  UpdateInvitationURLRequest,
  VisitStats,
  UserPlan,
  PaginatedResponse 
} from '@/lib/api';

// Query Keys
export const invitationUrlQueryKeys = {
  all: ['invitationUrls'] as const,
  lists: () => [...invitationUrlQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...invitationUrlQueryKeys.lists(), { filters }] as const,
  details: () => [...invitationUrlQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...invitationUrlQueryKeys.details(), id] as const,
  stats: (id: number) => [...invitationUrlQueryKeys.all, 'stats', id] as const,
  byInvitation: (invitationId: number) => [...invitationUrlQueryKeys.all, 'invitation', invitationId] as const,
  userPlan: () => ['userPlan'] as const,
};

/**
 * Hook to fetch invitation URLs for a specific invitation
 * 
 * @param invitationId - ID of the invitation
 * @param options - Query options
 */
export function useInvitationURLs(invitationId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: invitationUrlQueryKeys.byInvitation(invitationId),
    queryFn: () => invitationUrlsApi.getInvitationURLs(invitationId),
    enabled: options?.enabled !== false && !!invitationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch all invitation URLs for the user with pagination
 */
export function useAllInvitationURLs(params?: {
  page?: number;
  per_page?: number;
  is_active?: boolean;
}) {
  return useQuery({
    queryKey: invitationUrlQueryKeys.list(params || {}),
    queryFn: () => invitationUrlsApi.getAllInvitationURLs(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a single invitation URL by ID
 */
export function useInvitationURL(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: invitationUrlQueryKeys.detail(id),
    queryFn: () => invitationUrlsApi.getInvitationURL(id),
    enabled: options?.enabled !== false && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch visit statistics for an invitation URL
 */
export function useInvitationURLStats(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: invitationUrlQueryKeys.stats(id),
    queryFn: () => invitationUrlsApi.getInvitationURLStats(id),
    enabled: options?.enabled !== false && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute (stats should be fresh)
    retry: 2,
  });
}

/**
 * Hook to fetch user plan information for URL limits validation
 */
export function useUserPlan() {
  return useQuery({
    queryKey: invitationUrlQueryKeys.userPlan(),
    queryFn: invitationUrlsApi.getUserPlan,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to create a new invitation URL
 */
export function useCreateInvitationURL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvitationURLRequest) => invitationUrlsApi.createInvitationURL(data),
    onSuccess: (newUrl) => {
      // Invalidate and refetch invitation URLs for this invitation
      queryClient.invalidateQueries({
        queryKey: invitationUrlQueryKeys.byInvitation(newUrl.invitation_id)
      });
      
      // Invalidate all URLs list
      queryClient.invalidateQueries({
        queryKey: invitationUrlQueryKeys.lists()
      });

      toast.success('URL única creada exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al crear la URL';
      toast.error(message);
    },
  });
}

/**
 * Hook to update an invitation URL
 */
export function useUpdateInvitationURL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInvitationURLRequest }) => 
      invitationUrlsApi.updateInvitationURL(id, data),
    onSuccess: (updatedUrl) => {
      // Update the specific URL in cache
      queryClient.setQueryData(
        invitationUrlQueryKeys.detail(updatedUrl.id),
        updatedUrl
      );

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: invitationUrlQueryKeys.byInvitation(updatedUrl.invitation_id)
      });
      
      queryClient.invalidateQueries({
        queryKey: invitationUrlQueryKeys.lists()
      });

      toast.success('URL actualizada exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al actualizar la URL';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete an invitation URL
 */
export function useDeleteInvitationURL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => invitationUrlsApi.deleteInvitationURL(id),
    onSuccess: (_, deletedId) => {
      // Remove from all relevant caches
      queryClient.removeQueries({
        queryKey: invitationUrlQueryKeys.detail(deletedId)
      });
      
      queryClient.removeQueries({
        queryKey: invitationUrlQueryKeys.stats(deletedId)
      });

      // Invalidate lists to refetch without deleted item
      queryClient.invalidateQueries({
        queryKey: invitationUrlQueryKeys.lists()
      });

      queryClient.invalidateQueries({
        queryKey: invitationUrlQueryKeys.all
      });

      toast.success('URL eliminada exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al eliminar la URL';
      toast.error(message);
    },
  });
}

/**
 * Hook to toggle URL active status
 */
export function useToggleURLStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => invitationUrlsApi.toggleURLStatus(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: invitationUrlQueryKeys.detail(id) 
      });

      // Snapshot previous value
      const previousUrl = queryClient.getQueryData<InvitationURL>(
        invitationUrlQueryKeys.detail(id)
      );

      // Optimistically update
      if (previousUrl) {
        queryClient.setQueryData<InvitationURL>(
          invitationUrlQueryKeys.detail(id),
          { ...previousUrl, is_active: !previousUrl.is_active }
        );
      }

      return { previousUrl };
    },
    onSuccess: (updatedUrl) => {
      // Update cache with server response
      queryClient.setQueryData(
        invitationUrlQueryKeys.detail(updatedUrl.id),
        updatedUrl
      );

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: invitationUrlQueryKeys.byInvitation(updatedUrl.invitation_id)
      });

      const status = updatedUrl.is_active ? 'activada' : 'desactivada';
      toast.success(`URL ${status} exitosamente`);
    },
    onError: (error: any, id, context) => {
      // Rollback optimistic update
      if (context?.previousUrl) {
        queryClient.setQueryData(
          invitationUrlQueryKeys.detail(id),
          context.previousUrl
        );
      }

      const message = error?.response?.data?.message || 'Error al cambiar el estado de la URL';
      toast.error(message);
    },
  });
}

/**
 * Hook to download QR code for a URL
 */
export function useDownloadQRCode() {
  return useMutation({
    mutationFn: async (shortCode: string) => {
      const blob = await invitationUrlsApi.getQRCode(shortCode);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${shortCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return blob;
    },
    onSuccess: () => {
      toast.success('Código QR descargado exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al descargar el código QR';
      toast.error(message);
    },
  });
}

/**
 * Hook to copy URL to clipboard
 */
export function useCopyToClipboard() {
  return useMutation({
    mutationFn: async (text: string) => {
      if (!navigator.clipboard) {
        throw new Error('Clipboard not supported');
      }
      await navigator.clipboard.writeText(text);
      return text;
    },
    onSuccess: () => {
      toast.success('URL copiada al portapapeles');
    },
    onError: (error: any) => {
      toast.error('Error al copiar la URL');
      console.error('Copy error:', error);
    },
  });
}

/**
 * Custom hook to validate URL creation limits based on user plan
 */
export function useURLCreationValidation(invitationId: number) {
  const { data: urls, isLoading: urlsLoading } = useInvitationURLs(invitationId);
  const { data: userPlan, isLoading: planLoading } = useUserPlan();

  const canCreateURL = () => {
    if (urlsLoading || planLoading) return { allowed: false, reason: 'Loading...' };
    
    if (!userPlan) {
      return { allowed: false, reason: 'No se pudo verificar el plan del usuario' };
    }

    const currentUrlCount = urls?.length || 0;
    const maxAllowed = userPlan.max_urls_per_invitation;

    if (currentUrlCount >= maxAllowed) {
      return { 
        allowed: false, 
        reason: `Has alcanzado el límite de ${maxAllowed} URL${maxAllowed > 1 ? 's' : ''} para tu plan ${userPlan.name}` 
      };
    }

    return { 
      allowed: true, 
      reason: `Puedes crear ${maxAllowed - currentUrlCount} URL${maxAllowed - currentUrlCount > 1 ? 's' : ''} más` 
    };
  };

  return {
    canCreate: canCreateURL(),
    userPlan,
    currentCount: urls?.length || 0,
    isLoading: urlsLoading || planLoading,
  };
}

/**
 * Utility hook to prefetch invitation URL data
 */
export function usePrefetchInvitationURL() {
  const queryClient = useQueryClient();

  const prefetchURL = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: invitationUrlQueryKeys.detail(id),
      queryFn: () => invitationUrlsApi.getInvitationURL(id),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchURLStats = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: invitationUrlQueryKeys.stats(id),
      queryFn: () => invitationUrlsApi.getInvitationURLStats(id),
      staleTime: 1 * 60 * 1000,
    });
  };

  return { prefetchURL, prefetchURLStats };
}