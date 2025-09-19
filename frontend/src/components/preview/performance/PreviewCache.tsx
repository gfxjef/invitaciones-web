/**
 * Preview Cache Component
 * 
 * WHY: Implements intelligent caching system for invitation previews with
 * automatic invalidation, memory management, and performance optimization.
 * Reduces API calls and improves user experience.
 * 
 * WHAT: React component that manages preview data caching, implements
 * cache warming strategies, and provides cache status monitoring.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Database,
  RefreshCw,
  Trash2,
  Clock,
  HardDrive,
  Zap,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PreviewData } from '@/lib/hooks/usePreview';

interface PreviewCacheProps {
  invitationId: number;
  previewData?: PreviewData;
  enableWarmingStrategy?: boolean;
  maxCacheSize?: number; // in MB
  className?: string;
  showDebugInfo?: boolean;
}

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  size: number;
  hitCount: number;
  lastAccessed: number;
  expiry?: number;
}

interface CacheMetrics {
  totalSize: number;
  totalEntries: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  oldestEntry?: number;
  newestEntry?: number;
}

class PreviewCacheManager {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;
  
  constructor(maxSize: number = 50 * 1024 * 1024) { // 50MB default
    this.maxSize = maxSize;
  }
  
  private calculateSize(data: any): number {
    // Rough estimation of object size in bytes
    return JSON.stringify(data).length * 2; // UTF-16 encoding
  }
  
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.evictionCount++;
    }
  }
  
  private shouldEvict(): boolean {
    const currentSize = this.getCurrentSize();
    return currentSize > this.maxSize;
  }
  
  private getCurrentSize(): number {
    return Array.from(this.cache.values()).reduce((total, entry) => total + entry.size, 0);
  }
  
  set(key: string, data: any, expiry?: number): void {
    const size = this.calculateSize(data);
    const now = Date.now();
    
    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Evict entries if necessary
    while (this.shouldEvict() && this.cache.size > 0) {
      this.evictLRU();
    }
    
    // Add new entry
    this.cache.set(key, {
      key,
      data,
      timestamp: now,
      size,
      hitCount: 0,
      lastAccessed: now,
      expiry
    });
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }
    
    // Check expiry
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }
    
    // Update access info
    entry.hitCount++;
    entry.lastAccessed = Date.now();
    this.hitCount++;
    
    return entry.data;
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check expiry
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.evictionCount = 0;
  }
  
  getMetrics(): CacheMetrics {
    const entries = Array.from(this.cache.values());
    const totalRequests = this.hitCount + this.missCount;
    
    return {
      totalSize: this.getCurrentSize(),
      totalEntries: this.cache.size,
      hitRate: totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.missCount / totalRequests) * 100 : 0,
      evictionCount: this.evictionCount,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : undefined,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : undefined
    };
  }
  
  warmCache(keys: string[], dataProvider: (key: string) => Promise<any>): Promise<void[]> {
    return Promise.all(
      keys.map(async (key) => {
        if (!this.has(key)) {
          try {
            const data = await dataProvider(key);
            this.set(key, data, Date.now() + 30 * 60 * 1000); // 30 minutes
          } catch (error) {
            console.warn(`Failed to warm cache for key: ${key}`, error);
          }
        }
      })
    );
  }
}

// Global cache instance
const globalPreviewCache = new PreviewCacheManager();

export function PreviewCache({
  invitationId,
  previewData,
  enableWarmingStrategy = true,
  maxCacheSize = 50 * 1024 * 1024,
  className = '',
  showDebugInfo = false
}: PreviewCacheProps) {
  const [metrics, setMetrics] = useState<CacheMetrics>({ totalSize: 0, totalEntries: 0, hitRate: 0, missRate: 0, evictionCount: 0 });
  const [isWarming, setIsWarming] = useState(false);
  const warmingRef = useRef<NodeJS.Timeout>();
  
  // Update cache manager size limit
  useEffect(() => {
    globalPreviewCache['maxSize'] = maxCacheSize;
  }, [maxCacheSize]);
  
  // Cache current preview data
  useEffect(() => {
    if (previewData && invitationId) {
      const cacheKey = `preview_${invitationId}`;
      globalPreviewCache.set(cacheKey, previewData, Date.now() + 15 * 60 * 1000); // 15 minutes
      updateMetrics();
    }
  }, [previewData, invitationId]);
  
  // Update metrics periodically
  const updateMetrics = useCallback(() => {
    setMetrics(globalPreviewCache.getMetrics());
  }, []);
  
  useEffect(() => {
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [updateMetrics]);
  
  // Cache warming strategy
  const warmRelatedCaches = useCallback(async () => {
    if (!enableWarmingStrategy || !invitationId) return;
    
    setIsWarming(true);
    
    try {
      const keysToWarm = [
        `preview_${invitationId}`,
        `static_${invitationId}`,
        `social_facebook_${invitationId}`,
        `social_twitter_${invitationId}`,
        `social_whatsapp_${invitationId}`
      ];
      
      await globalPreviewCache.warmCache(keysToWarm, async (key) => {
        // This would typically fetch from your API
        // For now, we'll use the current preview data as a placeholder
        if (key.startsWith(`preview_${invitationId}`) && previewData) {
          return previewData;
        }
        return null;
      });
      
      updateMetrics();
    } catch (error) {
      console.error('Cache warming failed:', error);
    } finally {
      setIsWarming(false);
    }
  }, [invitationId, previewData, enableWarmingStrategy, updateMetrics]);
  
  // Auto-warm cache on component mount
  useEffect(() => {
    if (enableWarmingStrategy) {
      warmingRef.current = setTimeout(() => {
        warmRelatedCaches();
      }, 1000);
    }
    
    return () => {
      if (warmingRef.current) {
        clearTimeout(warmingRef.current);
      }
    };
  }, [enableWarmingStrategy, warmRelatedCaches]);
  
  // Handle manual cache clear
  const handleClearCache = useCallback(() => {
    globalPreviewCache.clear();
    updateMetrics();
  }, [updateMetrics]);
  
  // Handle cache refresh
  const handleRefreshCache = useCallback(() => {
    if (invitationId && previewData) {
      const cacheKey = `preview_${invitationId}`;
      globalPreviewCache.delete(cacheKey);
      globalPreviewCache.set(cacheKey, previewData, Date.now() + 15 * 60 * 1000);
      updateMetrics();
    }
  }, [invitationId, previewData, updateMetrics]);
  
  // Format size in human-readable format
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Format time ago
  const timeAgo = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';
    const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  // Determine cache health status
  const getCacheHealthStatus = () => {
    if (metrics.hitRate >= 80) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle };
    if (metrics.hitRate >= 60) return { status: 'good', color: 'text-blue-600', icon: TrendingUp };
    if (metrics.hitRate >= 40) return { status: 'fair', color: 'text-yellow-600', icon: AlertCircle };
    return { status: 'poor', color: 'text-red-600', icon: AlertCircle };
  };
  
  const healthStatus = getCacheHealthStatus();
  const HealthIcon = healthStatus.icon;
  
  if (!showDebugInfo) {
    // Hidden component that just manages caching
    return null;
  }
  
  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Preview Cache</h4>
          <div className={`flex items-center gap-1 ${healthStatus.color}`}>
            <HealthIcon className="w-4 h-4" />
            <span className="text-xs capitalize">{healthStatus.status}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={warmRelatedCaches}
            disabled={isWarming}
            className="flex items-center gap-1"
          >
            {isWarming ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isWarming ? 'Warming...' : 'Warm'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshCache}
            className="flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <HardDrive className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatSize(metrics.totalSize)}
          </div>
          <div className="text-xs text-gray-500">Cache Size</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {metrics.totalEntries}
          </div>
          <div className="text-xs text-gray-500">Entries</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-lg font-semibold ${metrics.hitRate >= 70 ? 'text-green-600' : metrics.hitRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {metrics.hitRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Hit Rate</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {metrics.evictionCount}
          </div>
          <div className="text-xs text-gray-500">Evictions</div>
        </div>
      </div>
      
      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Cache Ages</span>
          </div>
          <div className="space-y-1 pl-6">
            <div className="flex justify-between">
              <span>Oldest:</span>
              <span>{timeAgo(metrics.oldestEntry)}</span>
            </div>
            <div className="flex justify-between">
              <span>Newest:</span>
              <span>{timeAgo(metrics.newestEntry)}</span>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">Performance</span>
          </div>
          <div className="space-y-1 pl-6">
            <div className="flex justify-between">
              <span>Miss Rate:</span>
              <span>{metrics.missRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Usage:</span>
              <span>{((metrics.totalSize / maxCacheSize) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cache Health Recommendations */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Cache Health: </strong>
          {metrics.hitRate >= 80 && "Excellent! Your cache is performing optimally."}
          {metrics.hitRate >= 60 && metrics.hitRate < 80 && "Good performance. Consider warming more frequently accessed data."}
          {metrics.hitRate >= 40 && metrics.hitRate < 60 && "Fair performance. Cache may benefit from size increase or better warming strategy."}
          {metrics.hitRate < 40 && "Poor performance. Consider reviewing caching strategy and increasing cache size."}
        </div>
      </div>
    </div>
  );
}

// Export the cache manager for use in other components
export { globalPreviewCache };