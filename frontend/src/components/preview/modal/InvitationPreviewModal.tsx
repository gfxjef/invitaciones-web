/**
 * Invitation Preview Modal Component
 * 
 * WHY: Provides full-screen preview modal with multiple device views,
 * social media previews, print preview, and live updating capabilities.
 * Essential for users to see how their invitation will look before publishing.
 * 
 * WHAT: Full-screen modal with device frame simulation, zoom controls,
 * social media previews, export options, and real-time updates.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCw,
  ZoomIn,
  ZoomOut,
  Share2,
  Download,
  Printer,
  Eye,
  Settings,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ResponsivePreviewFrame } from './ResponsivePreviewFrame';
import { SocialShareTools } from '../social/SocialShareTools';
import { InvitationExporter } from '../export/InvitationExporter';
import { PreviewAnalytics } from '../analytics/PreviewAnalytics';
import { 
  usePreviewData, 
  usePreviewValidation, 
  useDeviceFrame, 
  usePreviewPerformance, 
  usePreviewCache,
  DeviceType 
} from '@/lib/hooks/usePreview';

interface InvitationPreviewModalProps {
  invitationId: number;
  isOpen: boolean;
  onClose: () => void;
  onPublish?: () => void;
  onSaveChanges?: () => void;
  hasUnsavedChanges?: boolean;
  className?: string;
}

type PreviewMode = 'device' | 'social' | 'print' | 'export';

export function InvitationPreviewModal({
  invitationId,
  isOpen,
  onClose,
  onPublish,
  onSaveChanges,
  hasUnsavedChanges = false,
  className = ''
}: InvitationPreviewModalProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('device');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareTools, setShowShareTools] = useState(false);
  const [showExporter, setShowExporter] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Preview data and validation
  const { data: previewData, isLoading, error, refetch } = usePreviewData(invitationId, isOpen);
  const { data: validation, isLoading: validationLoading } = usePreviewValidation(invitationId);
  
  // Device frame controls
  const {
    currentDevice,
    deviceFrames,
    switchDevice,
    zoom,
    setZoom,
    orientation,
    toggleOrientation,
    frameSize
  } = useDeviceFrame();
  
  // Performance monitoring
  const { metrics, startTracking, trackRenderComplete, trackLoadComplete } = usePreviewPerformance();
  
  // Caching
  const { invalidatePreview } = usePreviewCache();
  
  // Handle modal close with unsaved changes warning
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);
  
  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);
  
  // Handle refresh preview
  const handleRefresh = useCallback(() => {
    invalidatePreview(invitationId);
    refetch();
    startTracking();
  }, [invitationId, invalidatePreview, refetch, startTracking]);
  
  // Handle device switch
  const handleDeviceSwitch = useCallback((deviceType: DeviceType) => {
    switchDevice(deviceType, 0);
    startTracking();
  }, [switchDevice, startTracking]);
  
  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 2));
  }, [setZoom]);
  
  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  }, [setZoom]);
  
  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, [setZoom]);
  
  // Handle copy preview URL
  const handleCopyURL = useCallback(async () => {
    if (previewData?.preview_url) {
      try {
        await navigator.clipboard.writeText(window.location.origin + previewData.preview_url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  }, [previewData?.preview_url]);
  
  // Handle open in new tab
  const handleOpenInNewTab = useCallback(() => {
    if (previewData?.preview_url) {
      window.open(previewData.preview_url, '_blank');
    }
  }, [previewData?.preview_url]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          handleClose();
          break;
        case 'F11':
          event.preventDefault();
          toggleFullscreen();
          break;
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleRefresh();
          }
          break;
        case '=':
        case '+':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleZoomIn();
          }
          break;
        case '-':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleZoomOut();
          }
          break;
        case '0':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleZoomReset();
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, toggleFullscreen, handleRefresh, handleZoomIn, handleZoomOut, handleZoomReset]);
  
  // Track performance when modal opens
  useEffect(() => {
    if (isOpen) {
      startTracking();
    }
  }, [isOpen, startTracking]);
  
  // Track render completion
  useEffect(() => {
    if (previewData) {
      trackRenderComplete();
      trackLoadComplete();
    }
  }, [previewData, trackRenderComplete, trackLoadComplete]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-2xl w-full h-full max-w-none max-h-none ${isFullscreen ? 'rounded-none' : 'max-w-7xl max-h-[95vh]'} flex flex-col ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Preview Invitation</h2>
              {hasUnsavedChanges && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                  Unsaved Changes
                </span>
              )}
            </div>
            
            {validation && (
              <div className="flex items-center gap-2">
                {validation.valid ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Valid</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{validation.errors.length} issues</span>
                  </div>
                )}
                <span className="text-sm text-gray-600">
                  {validation.completeness}% complete
                </span>
              </div>
            )}
          </div>
          
          {/* Header Controls */}
          <div className="flex items-center gap-2">
            {/* Preview Mode Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={previewMode === 'device' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('device')}
                className="flex items-center gap-1"
              >
                <Monitor className="w-4 h-4" />
                Device
              </Button>
              <Button
                variant={previewMode === 'social' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('social')}
                className="flex items-center gap-1"
              >
                <Share2 className="w-4 h-4" />
                Social
              </Button>
              <Button
                variant={previewMode === 'print' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('print')}
                className="flex items-center gap-1"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                variant={previewMode === 'export' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('export')}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyURL}
                className="flex items-center gap-1"
              >
                {copySuccess ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copySuccess ? 'Copied!' : 'Copy URL'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
                New Tab
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="flex items-center gap-1"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="flex items-center gap-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Controls */}
          {previewMode === 'device' && (
            <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
              {/* Device Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Device Type</h3>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={currentDevice.type === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDeviceSwitch('mobile')}
                    className="flex items-center gap-2 justify-start"
                  >
                    <Smartphone className="w-4 h-4" />
                    Mobile
                  </Button>
                  <Button
                    variant={currentDevice.type === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDeviceSwitch('tablet')}
                    className="flex items-center gap-2 justify-start"
                  >
                    <Tablet className="w-4 h-4" />
                    Tablet
                  </Button>
                  <Button
                    variant={currentDevice.type === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDeviceSwitch('desktop')}
                    className="flex items-center gap-2 justify-start"
                  >
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </Button>
                </div>
              </div>
              
              {/* Device Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Current Device</h3>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-sm font-medium text-gray-900">{currentDevice.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {frameSize.width} × {frameSize.height}
                  </div>
                  <div className="text-xs text-gray-600">
                    Scale: {currentDevice.scale}x
                  </div>
                </div>
              </div>
              
              {/* Orientation */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Orientation</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleOrientation}
                  className="flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
                </Button>
              </div>
              
              {/* Zoom Controls */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Zoom</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 2}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomReset}
                  className="w-full mt-2"
                >
                  Reset Zoom
                </Button>
              </div>
              
              {/* Performance Metrics */}
              {metrics.loadTime > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Performance</h3>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
                      <div>Render: {metrics.renderTime.toFixed(0)}ms</div>
                      {metrics.memoryUsage > 0 && (
                        <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Preview Area */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-lg text-gray-600">Loading preview...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Error</h3>
                  <p className="text-gray-600 mb-4">Failed to load invitation preview</p>
                  <Button onClick={handleRefresh} className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {previewMode === 'device' && previewData && (
                  <ResponsivePreviewFrame
                    previewData={previewData}
                    device={currentDevice}
                    zoom={zoom}
                    orientation={orientation}
                    className="h-full"
                  />
                )}
                
                {previewMode === 'social' && (
                  <SocialShareTools
                    invitationId={invitationId}
                    previewData={previewData}
                    className="p-6 h-full overflow-y-auto"
                  />
                )}
                
                {previewMode === 'print' && previewData && (
                  <div className="p-6 h-full overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                      <h3 className="text-lg font-semibold mb-4">Print Preview</h3>
                      <div className="bg-white border rounded-lg p-8 shadow-sm">
                        {/* Print-optimized content would go here */}
                        <div className="text-center text-gray-600">
                          Print preview will be rendered here
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {previewMode === 'export' && (
                  <InvitationExporter
                    invitationId={invitationId}
                    previewData={previewData}
                    className="p-6 h-full overflow-y-auto"
                  />
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t bg-gray-50 px-4 py-3 flex items-center justify-between rounded-b-lg">
          <div className="flex items-center gap-4">
            {validationLoading ? (
              <LoadingSpinner size="sm" />
            ) : validation && !validation.valid && (
              <div className="text-sm text-red-600">
                {validation.errors.length} validation error{validation.errors.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && onSaveChanges && (
              <Button variant="outline" onClick={onSaveChanges}>
                Save Changes
              </Button>
            )}
            
            <Button variant="ghost" onClick={handleClose}>
              Close
            </Button>
            
            {onPublish && (
              <Button 
                onClick={onPublish}
                disabled={validation && !validation.valid}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Analytics Tracking */}
      <PreviewAnalytics
        invitationId={invitationId}
        previewMode={previewMode}
        device={currentDevice}
        metrics={metrics}
      />
    </div>
  );
}