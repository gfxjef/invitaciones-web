/**
 * Preview Hooks for Invitation System
 * 
 * WHY: Provides comprehensive hooks for preview functionality including
 * data fetching, caching, device simulation, and social sharing preview.
 * Centralizes preview state management and optimizes API calls.
 * 
 * WHAT: React Query-based hooks for preview data, static generation,
 * device frame simulation, and performance monitoring.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useRef, useEffect } from 'react';
import { previewApi, publicUrlApi, staticGenerationApi, socialSharingApi, exportApi, type PreviewData, type PublicURLRequest, type URLAnalytics } from '@/lib/api';

// Re-export PreviewData for component usage
export type { PreviewData } from '@/lib/api';

// ============================================================================
// PREVIEW DATA HOOKS
// ============================================================================

/**
 * Hook for fetching invitation preview data
 */
export function usePreviewData(invitationId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['preview', invitationId],
    queryFn: () => previewApi.getPreviewData(invitationId),
    enabled: enabled && !!invitationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook for validating preview data
 */
export function usePreviewValidation(invitationId: number) {
  return useQuery({
    queryKey: ['preview-validation', invitationId],
    queryFn: () => previewApi.validatePreviewData(invitationId),
    enabled: !!invitationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for generating static preview images
 */
export function useStaticPreview() {
  return useMutation({
    mutationFn: ({ invitationId, options }: {
      invitationId: number;
      options?: {
        device?: 'mobile' | 'tablet' | 'desktop';
        format?: 'png' | 'jpg' | 'webp';
        width?: number;
        height?: number;
      };
    }) => previewApi.generateStaticPreview(invitationId, options),
  });
}

// ============================================================================
// DEVICE FRAME SIMULATION HOOKS
// ============================================================================

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceFrame {
  name: string;
  type: DeviceType;
  width: number;
  height: number;
  scale: number;
  userAgent: string;
}

const DEVICE_FRAMES: Record<DeviceType, DeviceFrame[]> = {
  mobile: [
    {
      name: 'iPhone 14 Pro',
      type: 'mobile',
      width: 393,
      height: 852,
      scale: 3,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    },
    {
      name: 'Samsung Galaxy S23',
      type: 'mobile',
      width: 384,
      height: 854,
      scale: 2.75,
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36'
    },
  ],
  tablet: [
    {
      name: 'iPad Pro 11"',
      type: 'tablet',
      width: 834,
      height: 1194,
      scale: 2,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    },
    {
      name: 'iPad Air',
      type: 'tablet',
      width: 820,
      height: 1180,
      scale: 2,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    },
  ],
  desktop: [
    {
      name: 'Desktop 1920x1080',
      type: 'desktop',
      width: 1920,
      height: 1080,
      scale: 1,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      name: 'MacBook Pro 16"',
      type: 'desktop',
      width: 1512,
      height: 982,
      scale: 2,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
  ],
};

/**
 * Hook for device frame simulation
 */
export function useDeviceFrame() {
  const [currentDevice, setCurrentDevice] = useState<DeviceFrame>(DEVICE_FRAMES.mobile[0]);
  const [zoom, setZoom] = useState(1);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  const switchDevice = useCallback((deviceType: DeviceType, deviceIndex: number = 0) => {
    const devices = DEVICE_FRAMES[deviceType];
    if (devices && devices[deviceIndex]) {
      setCurrentDevice(devices[deviceIndex]);
    }
  }, []);
  
  const toggleOrientation = useCallback(() => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  }, []);
  
  const frameSize = {
    width: orientation === 'portrait' ? currentDevice.width : currentDevice.height,
    height: orientation === 'portrait' ? currentDevice.height : currentDevice.width,
  };
  
  return {
    currentDevice,
    deviceFrames: DEVICE_FRAMES,
    switchDevice,
    zoom,
    setZoom,
    orientation,
    toggleOrientation,
    frameSize,
  };
}

// ============================================================================
// PUBLIC URL MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for checking slug availability
 */
export function useSlugAvailability() {
  const [lastChecked, setLastChecked] = useState<string>('');
  
  return useMutation({
    mutationFn: ({ slug, excludeId }: { slug: string; excludeId?: number }) => 
      publicUrlApi.checkSlugAvailability(slug, excludeId),
    onSuccess: (_, variables) => {
      setLastChecked(variables.slug);
    },
  });
}

/**
 * Hook for generating public URL
 */
export function useGeneratePublicURL() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PublicURLRequest) => publicUrlApi.generatePublicURL(data),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['public-url', variables.invitation_id] });
      queryClient.invalidateQueries({ queryKey: ['invitation', variables.invitation_id] });
    },
  });
}

/**
 * Hook for updating public URL
 */
export function useUpdatePublicURL() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invitationId, updates }: { invitationId: number; updates: Partial<PublicURLRequest> }) =>
      publicUrlApi.updatePublicURL(invitationId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['public-url', variables.invitationId] });
    },
  });
}

/**
 * Hook for URL analytics
 */
export function useURLAnalytics(invitationId: number, dateRange?: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: ['url-analytics', invitationId, dateRange],
    queryFn: () => publicUrlApi.getURLAnalytics(invitationId, dateRange),
    enabled: !!invitationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// SOCIAL SHARING HOOKS
// ============================================================================

/**
 * Hook for social media preview generation
 */
export function useSocialPreview() {
  return useMutation({
    mutationFn: ({ invitationId, platform }: { 
      invitationId: number; 
      platform: 'facebook' | 'twitter' | 'whatsapp' | 'instagram';
    }) => socialSharingApi.generateSocialPreview(invitationId, platform),
  });
}

/**
 * Hook for tracking social shares
 */
export function useTrackSocialShare() {
  return useMutation({
    mutationFn: ({ invitationId, platform, metadata }: { 
      invitationId: number; 
      platform: string; 
      metadata?: Record<string, any>;
    }) => socialSharingApi.trackSocialShare(invitationId, platform, metadata),
  });
}

/**
 * Hook for social sharing statistics
 */
export function useSharingStats(invitationId: number) {
  return useQuery({
    queryKey: ['sharing-stats', invitationId],
    queryFn: () => socialSharingApi.getSharingStats(invitationId),
    enabled: !!invitationId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================================================
// EXPORT AND PRINT HOOKS
// ============================================================================

/**
 * Hook for PDF export
 */
export function useExportToPDF() {
  return useMutation({
    mutationFn: ({ invitationId, options }: {
      invitationId: number;
      options?: {
        format?: 'A4' | 'letter' | 'A5' | 'custom';
        orientation?: 'portrait' | 'landscape';
        quality?: 'high' | 'medium' | 'low';
        include_rsvp?: boolean;
      };
    }) => exportApi.exportToPDF(invitationId, options),
  });
}

/**
 * Hook for image export
 */
export function useExportToImage() {
  return useMutation({
    mutationFn: ({ invitationId, options }: {
      invitationId: number;
      options?: {
        format?: 'png' | 'jpg' | 'webp';
        width?: number;
        height?: number;
        quality?: number;
        device?: 'mobile' | 'tablet' | 'desktop';
      };
    }) => exportApi.exportToImage(invitationId, options),
  });
}

/**
 * Hook for print HTML generation
 */
export function usePrintHTML(invitationId: number, options?: {
  include_styles?: boolean;
  optimize_fonts?: boolean;
  high_resolution?: boolean;
}) {
  return useQuery({
    queryKey: ['print-html', invitationId, options],
    queryFn: () => exportApi.getPrintHTML(invitationId, options),
    enabled: !!invitationId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================================================
// STATIC GENERATION HOOKS
// ============================================================================

/**
 * Hook for static file generation
 */
export function useStaticGeneration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { invitation_id: number; force_regenerate?: boolean; optimize_images?: boolean; include_analytics?: boolean }) =>
      staticGenerationApi.generateStaticFiles(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['static-status', variables.invitation_id] });
    },
  });
}

/**
 * Hook for static file status
 */
export function useStaticStatus(invitationId: number) {
  return useQuery({
    queryKey: ['static-status', invitationId],
    queryFn: () => staticGenerationApi.getStaticStatus(invitationId),
    enabled: !!invitationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// PERFORMANCE AND CACHING HOOKS
// ============================================================================

/**
 * Hook for preview performance monitoring
 */
export function usePreviewPerformance() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
  });
  
  const startTime = useRef<number>(0);
  const renderStartTime = useRef<number>(0);
  
  const startTracking = useCallback(() => {
    startTime.current = performance.now();
    renderStartTime.current = performance.now();
  }, []);
  
  const trackRenderComplete = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({ ...prev, renderTime }));
  }, []);
  
  const trackLoadComplete = useCallback(() => {
    const loadTime = performance.now() - startTime.current;
    setMetrics(prev => ({ ...prev, loadTime }));
  }, []);
  
  const trackInteraction = useCallback(() => {
    const interactionTime = performance.now() - startTime.current;
    setMetrics(prev => ({ ...prev, interactionTime }));
  }, []);
  
  // Track memory usage if available
  useEffect(() => {
    if ('memory' in performance) {
      const updateMemoryUsage = () => {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / (1024 * 1024) // MB
        }));
      };
      
      const interval = setInterval(updateMemoryUsage, 5000);
      return () => clearInterval(interval);
    }
  }, []);
  
  return {
    metrics,
    startTracking,
    trackRenderComplete,
    trackLoadComplete,
    trackInteraction,
  };
}

/**
 * Hook for preview caching
 */
export function usePreviewCache() {
  const queryClient = useQueryClient();
  
  const prefetchPreview = useCallback(async (invitationId: number) => {
    await queryClient.prefetchQuery({
      queryKey: ['preview', invitationId],
      queryFn: () => previewApi.getPreviewData(invitationId),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
  
  const invalidatePreview = useCallback((invitationId: number) => {
    queryClient.invalidateQueries({ queryKey: ['preview', invitationId] });
  }, [queryClient]);
  
  const clearPreviewCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: ['preview'] });
  }, [queryClient]);
  
  return {
    prefetchPreview,
    invalidatePreview,
    clearPreviewCache,
  };
}

// ============================================================================
// QR CODE GENERATION HOOK
// ============================================================================

/**
 * Hook for QR code generation
 */
export function useQRCodeGeneration() {
  return useMutation({
    mutationFn: ({ invitationId, options }: {
      invitationId: number;
      options?: {
        size?: number;
        format?: 'png' | 'svg';
        error_correction?: 'L' | 'M' | 'Q' | 'H';
      };
    }) => publicUrlApi.generateQRCode(invitationId, options),
  });
}