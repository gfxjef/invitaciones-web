/**
 * React Query Hooks for Templates
 * 
 * WHY: Custom hooks that encapsulate React Query logic for templates,
 * providing consistent data fetching, caching, and error handling across
 * the application.
 * 
 * WHAT: Hooks for fetching templates list, single template details,
 * and categories with appropriate cache keys and configurations.
 */

import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { templatesApi, Template, TemplatesResponse } from '@/lib/api';

/**
 * Hook to fetch paginated templates list with filtering
 */
export const useTemplates = (
  params?: {
    page?: number;
    per_page?: number;
    category?: string;
    is_premium?: boolean;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  },
  options?: UseQueryOptions<TemplatesResponse>
) => {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templatesApi.getTemplates(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: 2,
    ...options,
  });
};

/**
 * Hook to fetch single template details
 */
export const useTemplate = (
  templateId: number,
  options?: UseQueryOptions<{ template: Template }>
) => {
  return useQuery({
    queryKey: ['template', templateId],
    queryFn: () => templatesApi.getTemplate(templateId),
    enabled: !!templateId && templateId > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    ...options,
  });
};

/**
 * Hook to fetch template categories for filtering
 */
export const useTemplateCategories = (
  options?: UseQueryOptions<string[]>
) => {
  return useQuery({
    queryKey: ['template-categories'],
    queryFn: () => templatesApi.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    ...options,
  });
};

/**
 * Hook to prefetch template details (for hover previews, etc.)
 */
export const usePrefetchTemplate = () => {
  const queryClient = useQueryClient();
  
  return (templateId: number) => {
    queryClient.prefetchQuery({
      queryKey: ['template', templateId],
      queryFn: () => templatesApi.getTemplate(templateId),
      staleTime: 10 * 60 * 1000,
    });
  };
};

/**
 * Hook to get featured/popular templates (first 6 non-premium active templates)
 */
export const useFeaturedTemplates = (options?: UseQueryOptions<TemplatesResponse>) => {
  return useQuery({
    queryKey: ['templates', 'featured'],
    queryFn: () => templatesApi.getTemplates({
      page: 1,
      per_page: 6,
      is_premium: false,
      sort_by: 'display_order',
      sort_order: 'asc',
    }),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options,
  });
};