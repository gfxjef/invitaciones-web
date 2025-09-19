/**
 * Preview Analytics Component
 * 
 * WHY: Tracks user interactions, performance metrics, and engagement patterns
 * during invitation preview sessions. Essential for optimizing user experience
 * and identifying usability issues.
 * 
 * WHAT: Analytics tracking component that monitors preview usage, device
 * preferences, interaction patterns, and performance metrics.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { DeviceFrame } from '@/lib/hooks/usePreview';

interface PreviewAnalyticsProps {
  invitationId: number;
  previewMode?: string;
  device?: DeviceFrame;
  metrics?: {
    loadTime: number;
    renderTime: number;
    interactionTime: number;
    memoryUsage: number;
  };
  isPublic?: boolean;
}

interface AnalyticsEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

class PreviewAnalyticsTracker {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private startTime: number;
  private lastActivity: number;
  private isTracking = false;
  private flushInterval?: NodeJS.Timeout;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.lastActivity = this.startTime;
    this.setupFlushInterval();
    this.setupVisibilityHandlers();
    this.setupUnloadHandlers();
  }
  
  private generateSessionId(): string {
    return `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private setupFlushInterval(): void {
    // Flush events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);
  }
  
  private setupVisibilityHandlers(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('preview_hidden', {
          sessionDuration: Date.now() - this.startTime,
          eventsCount: this.events.length
        });
        this.flush();
      } else {
        this.track('preview_visible', {});
      }
    });
  }
  
  private setupUnloadHandlers(): void {
    window.addEventListener('beforeunload', () => {
      this.track('preview_session_end', {
        sessionDuration: Date.now() - this.startTime,
        totalEvents: this.events.length,
        lastActivity: this.lastActivity
      });
      this.flush(true); // Synchronous flush on unload
    });
  }
  
  track(eventType: string, data: Record<string, any> = {}): void {
    if (!this.isTracking) return;
    
    const event: AnalyticsEvent = {
      type: eventType,
      data: {
        ...data,
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        timestamp: Date.now(),
        sessionDuration: Date.now() - this.startTime
      },
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    
    this.events.push(event);
    this.lastActivity = Date.now();
    
    // Flush if we have too many events
    if (this.events.length >= 50) {
      this.flush();
    }
  }
  
  startTracking(invitationId: number): void {
    this.isTracking = true;
    this.track('preview_session_start', {
      invitationId,
      referrer: document.referrer,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine
    });
  }
  
  stopTracking(): void {
    this.isTracking = false;
    this.track('preview_session_stop', {
      reason: 'manual',
      sessionDuration: Date.now() - this.startTime,
      totalEvents: this.events.length
    });
    this.flush();
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
  
  trackDeviceSwitch(fromDevice: DeviceFrame, toDevice: DeviceFrame): void {
    this.track('preview_device_switch', {
      fromDevice: {
        name: fromDevice.name,
        type: fromDevice.type,
        width: fromDevice.width,
        height: fromDevice.height
      },
      toDevice: {
        name: toDevice.name,
        type: toDevice.type,
        width: toDevice.width,
        height: toDevice.height
      }
    });
  }
  
  trackModeSwitch(fromMode: string, toMode: string): void {
    this.track('preview_mode_switch', {
      fromMode,
      toMode,
      switchTime: Date.now() - this.lastActivity
    });
  }
  
  trackPerformanceMetrics(metrics: {
    loadTime: number;
    renderTime: number;
    interactionTime: number;
    memoryUsage: number;
  }): void {
    this.track('preview_performance', {
      ...metrics,
      performanceScore: this.calculatePerformanceScore(metrics)
    });
  }
  
  trackInteraction(interactionType: string, element?: string, coordinates?: { x: number; y: number }): void {
    this.track('preview_interaction', {
      interactionType,
      element,
      coordinates,
      timeSinceLastInteraction: Date.now() - this.lastActivity
    });
  }
  
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('preview_error', {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href
    });
  }
  
  private calculatePerformanceScore(metrics: {
    loadTime: number;
    renderTime: number;
    interactionTime: number;
    memoryUsage: number;
  }): number {
    // Simple performance scoring algorithm
    let score = 100;
    
    // Penalize slow load times
    if (metrics.loadTime > 3000) score -= 20;
    else if (metrics.loadTime > 2000) score -= 10;
    else if (metrics.loadTime > 1000) score -= 5;
    
    // Penalize slow render times
    if (metrics.renderTime > 1000) score -= 15;
    else if (metrics.renderTime > 500) score -= 8;
    else if (metrics.renderTime > 200) score -= 3;
    
    // Penalize high memory usage
    if (metrics.memoryUsage > 100) score -= 10;
    else if (metrics.memoryUsage > 50) score -= 5;
    
    return Math.max(0, score);
  }
  
  private async flush(synchronous = false): Promise<void> {
    if (this.events.length === 0) return;
    
    const eventsToFlush = [...this.events];
    this.events = [];
    
    const payload = {
      sessionId: this.sessionId,
      events: eventsToFlush,
      sessionInfo: {
        startTime: this.startTime,
        duration: Date.now() - this.startTime,
        lastActivity: this.lastActivity,
        totalEvents: eventsToFlush.length
      }
    };
    
    if (synchronous) {
      // Use sendBeacon for synchronous sending during unload
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon(
          '/api/analytics/preview',
          new Blob([JSON.stringify(payload)], { type: 'application/json' })
        );
      }
    } else {
      // Use regular fetch for asynchronous sending
      try {
        await fetch('/api/analytics/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.warn('Failed to send analytics data:', error);
        // Re-add events to queue on failure
        this.events.unshift(...eventsToFlush);
      }
    }
  }
  
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      duration: Date.now() - this.startTime,
      lastActivity: this.lastActivity,
      eventsCount: this.events.length,
      isTracking: this.isTracking
    };
  }
}

// Global analytics tracker instance
let analyticsTracker: PreviewAnalyticsTracker | null = null;

export function PreviewAnalytics({
  invitationId,
  previewMode,
  device,
  metrics,
  isPublic = false
}: PreviewAnalyticsProps) {
  const previousMode = useRef<string>();
  const previousDevice = useRef<DeviceFrame>();
  const metricsRef = useRef(metrics);
  
  // Initialize analytics tracker
  useEffect(() => {
    if (!analyticsTracker) {
      analyticsTracker = new PreviewAnalyticsTracker();
    }
    
    analyticsTracker.startTracking(invitationId);
    
    return () => {
      if (analyticsTracker) {
        analyticsTracker.stopTracking();
      }
    };
  }, [invitationId]);
  
  // Track preview mode changes
  useEffect(() => {
    if (analyticsTracker && previewMode && previousMode.current && previousMode.current !== previewMode) {
      analyticsTracker.trackModeSwitch(previousMode.current, previewMode);
    }
    previousMode.current = previewMode;
  }, [previewMode]);
  
  // Track device changes
  useEffect(() => {
    if (analyticsTracker && device && previousDevice.current && previousDevice.current !== device) {
      analyticsTracker.trackDeviceSwitch(previousDevice.current, device);
    }
    previousDevice.current = device;
  }, [device]);
  
  // Track performance metrics
  useEffect(() => {
    if (analyticsTracker && metrics && 
        (!metricsRef.current || 
         metrics.loadTime !== metricsRef.current.loadTime ||
         metrics.renderTime !== metricsRef.current.renderTime)) {
      analyticsTracker.trackPerformanceMetrics(metrics);
    }
    metricsRef.current = metrics;
  }, [metrics]);
  
  // Track public vs private preview
  useEffect(() => {
    if (analyticsTracker) {
      analyticsTracker.track('preview_context', {
        isPublic,
        context: isPublic ? 'public_view' : 'editor_preview'
      });
    }
  }, [isPublic]);
  
  // Track scroll events
  useEffect(() => {
    let lastScrollTime = 0;
    let scrollDepth = 0;
    
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime < 1000) return; // Throttle
      
      lastScrollTime = now;
      const currentScroll = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentDepth = Math.round((currentScroll / maxScroll) * 100);
      
      if (currentDepth > scrollDepth) {
        scrollDepth = currentDepth;
        
        if (analyticsTracker) {
          analyticsTracker.track('preview_scroll', {
            scrollDepth: currentDepth,
            scrollPosition: currentScroll,
            maxScroll
          });
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Track viewport changes (resize/orientation)
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (analyticsTracker) {
          analyticsTracker.track('preview_viewport_change', {
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
          });
        }
      }, 500);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  // Track focus/blur events
  useEffect(() => {
    const handleFocus = () => {
      if (analyticsTracker) {
        analyticsTracker.track('preview_focus', { timestamp: Date.now() });
      }
    };
    
    const handleBlur = () => {
      if (analyticsTracker) {
        analyticsTracker.track('preview_blur', { timestamp: Date.now() });
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);
  
  // Track network status
  useEffect(() => {
    const handleOnline = () => {
      if (analyticsTracker) {
        analyticsTracker.track('preview_network_status', { status: 'online' });
      }
    };
    
    const handleOffline = () => {
      if (analyticsTracker) {
        analyticsTracker.track('preview_network_status', { status: 'offline' });
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Track errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (analyticsTracker) {
        analyticsTracker.trackError(new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      }
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (analyticsTracker) {
        analyticsTracker.trackError(new Error(String(event.reason)), {
          type: 'unhandled_promise_rejection'
        });
      }
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
}

// Utility function to track custom events from other components
export const trackPreviewEvent = (eventType: string, data: Record<string, any> = {}) => {
  if (analyticsTracker) {
    analyticsTracker.track(eventType, data);
  }
};

// Utility function to track interactions
export const trackPreviewInteraction = (
  interactionType: string, 
  element?: string, 
  coordinates?: { x: number; y: number }
) => {
  if (analyticsTracker) {
    analyticsTracker.trackInteraction(interactionType, element, coordinates);
  }
};

// Export the tracker class for advanced usage
export { PreviewAnalyticsTracker };