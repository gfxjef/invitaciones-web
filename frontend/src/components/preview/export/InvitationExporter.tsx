/**
 * Invitation Exporter Component
 * 
 * WHY: Provides comprehensive export functionality for invitations in multiple
 * formats including PDF, images, and print-optimized versions. Essential for
 * users who want to share or print their invitations offline.
 * 
 * WHAT: Export interface with format selection, quality options, batch export,
 * custom sizing, and download management for invitation assets.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  Download,
  FileText,
  Image as ImageIcon,
  Printer,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Smartphone,
  Tablet,
  Monitor,
  Palette,
  FileImage,
  Archive,
  Eye,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  useExportToPDF,
  useExportToImage,
  usePrintHTML,
  PreviewData 
} from '@/lib/hooks/usePreview';

interface InvitationExporterProps {
  invitationId: number;
  previewData?: PreviewData;
  className?: string;
  onExportComplete?: (downloadUrl: string, format: string) => void;
}

interface ExportOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  formats: string[];
  presets: ExportPreset[];
}

interface ExportPreset {
  id: string;
  name: string;
  description: string;
  options: any;
  recommended?: boolean;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'pdf',
    name: 'PDF Document',
    icon: FileText,
    description: 'High-quality PDF for printing and sharing',
    formats: ['PDF'],
    presets: [
      {
        id: 'print',
        name: 'Print Quality',
        description: 'A4 format, high resolution for printing',
        options: {
          format: 'A4',
          orientation: 'portrait',
          quality: 'high',
          include_rsvp: true
        },
        recommended: true
      },
      {
        id: 'digital',
        name: 'Digital Sharing',
        description: 'Optimized for email and digital sharing',
        options: {
          format: 'A4',
          orientation: 'portrait',
          quality: 'medium',
          include_rsvp: true
        }
      },
      {
        id: 'card',
        name: 'Card Format',
        description: 'A5 size for card printing',
        options: {
          format: 'A5',
          orientation: 'portrait',
          quality: 'high',
          include_rsvp: false
        }
      }
    ]
  },
  {
    id: 'image',
    name: 'Image Export',
    icon: ImageIcon,
    description: 'PNG/JPG images for social media and web',
    formats: ['PNG', 'JPG', 'WebP'],
    presets: [
      {
        id: 'social',
        name: 'Social Media',
        description: '1080x1080 for Instagram, Facebook',
        options: {
          format: 'png',
          width: 1080,
          height: 1080,
          quality: 90,
          device: 'mobile'
        },
        recommended: true
      },
      {
        id: 'story',
        name: 'Story Format',
        description: '1080x1920 for Instagram/Facebook Stories',
        options: {
          format: 'png',
          width: 1080,
          height: 1920,
          quality: 90,
          device: 'mobile'
        }
      },
      {
        id: 'web',
        name: 'Web Quality',
        description: 'Optimized for websites and blogs',
        options: {
          format: 'webp',
          width: 800,
          height: 1200,
          quality: 85,
          device: 'desktop'
        }
      },
      {
        id: 'print',
        name: 'Print Resolution',
        description: 'High resolution for printing',
        options: {
          format: 'png',
          width: 2480,
          height: 3508,
          quality: 100,
          device: 'desktop'
        }
      }
    ]
  },
  {
    id: 'print',
    name: 'Print Optimized',
    icon: Printer,
    description: 'Print-ready HTML and CSS files',
    formats: ['HTML', 'CSS'],
    presets: [
      {
        id: 'standard',
        name: 'Standard Print',
        description: 'Optimized for home and office printers',
        options: {
          include_styles: true,
          optimize_fonts: true,
          high_resolution: false
        },
        recommended: true
      },
      {
        id: 'professional',
        name: 'Professional Print',
        description: 'High resolution for professional printing',
        options: {
          include_styles: true,
          optimize_fonts: true,
          high_resolution: true
        }
      }
    ]
  }
];

export function InvitationExporter({
  invitationId,
  previewData,
  className = '',
  onExportComplete
}: InvitationExporterProps) {
  const [selectedOption, setSelectedOption] = useState('pdf');
  const [selectedPreset, setSelectedPreset] = useState('print');
  const [customOptions, setCustomOptions] = useState<any>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [downloads, setDownloads] = useState<Array<{
    id: string;
    name: string;
    url: string;
    format: string;
    timestamp: number;
    size?: number;
  }>>([]);
  
  // API hooks
  const exportToPDF = useExportToPDF();
  const exportToImage = useExportToImage();
  const { data: printHTML } = usePrintHTML(
    invitationId,
    selectedOption === 'print' ? customOptions : undefined
  );
  
  // Get current export option and preset
  const currentOption = EXPORT_OPTIONS.find(opt => opt.id === selectedOption);
  const currentPreset = currentOption?.presets.find(preset => preset.id === selectedPreset);
  
  // Generate export name
  const exportName = useMemo(() => {
    if (!previewData) return 'invitation';
    
    const coupleNames = [
      previewData.custom_data.couple_bride_name,
      previewData.custom_data.couple_groom_name
    ].filter(Boolean).join('-') || 'invitation';
    
    const date = previewData.custom_data.event_date 
      ? new Date(previewData.custom_data.event_date).toISOString().split('T')[0]
      : '';
    
    return `${coupleNames}${date ? '-' + date : ''}`.toLowerCase().replace(/\s+/g, '-');
  }, [previewData]);
  
  // Handle export
  const handleExport = useCallback(async () => {
    if (!currentOption || !currentPreset) return;
    
    const exportOptions = { ...currentPreset.options, ...customOptions };
    const timestamp = Date.now();
    
    try {
      let result;
      let downloadUrl: string;
      let format: string;
      
      switch (selectedOption) {
        case 'pdf':
          result = await exportToPDF.mutateAsync({
            invitationId,
            options: exportOptions
          });
          downloadUrl = result.download_url;
          format = 'PDF';
          break;
          
        case 'image':
          result = await exportToImage.mutateAsync({
            invitationId,
            options: exportOptions
          });
          downloadUrl = result.download_url;
          format = exportOptions.format.toUpperCase();
          break;
          
        case 'print':
          if (!printHTML) return;
          // Create downloadable HTML file
          const htmlBlob = new Blob([printHTML.html], { type: 'text/html' });
          downloadUrl = URL.createObjectURL(htmlBlob);
          format = 'HTML';
          break;
          
        default:
          throw new Error('Invalid export option');
      }
      
      // Add to downloads list
      const download = {
        id: `${selectedOption}_${timestamp}`,
        name: `${exportName}_${currentPreset.name.toLowerCase().replace(/\s+/g, '_')}.${format.toLowerCase()}`,
        url: downloadUrl,
        format,
        timestamp,
        size: result?.size
      };
      
      setDownloads(prev => [download, ...prev.slice(0, 9)]); // Keep last 10 downloads
      
      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = download.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Callback
      onExportComplete?.(downloadUrl, format);
      
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [
    currentOption,
    currentPreset,
    customOptions,
    selectedOption,
    invitationId,
    exportToPDF,
    exportToImage,
    printHTML,
    exportName,
    onExportComplete
  ]);
  
  // Handle preset selection
  const handlePresetSelect = useCallback((presetId: string) => {
    setSelectedPreset(presetId);
    const preset = currentOption?.presets.find(p => p.id === presetId);
    if (preset) {
      setCustomOptions(preset.options);
    }
  }, [currentOption]);
  
  // Handle option change
  const handleOptionChange = useCallback((optionId: string) => {
    setSelectedOption(optionId);
    const option = EXPORT_OPTIONS.find(opt => opt.id === optionId);
    if (option?.presets.length > 0) {
      const defaultPreset = option.presets.find(p => p.recommended) || option.presets[0];
      setSelectedPreset(defaultPreset.id);
      setCustomOptions(defaultPreset.options);
    }
  }, []);
  
  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  const isExporting = exportToPDF.isPending || exportToImage.isPending;
  
  return (
    <div className={`bg-white rounded-lg ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Invitation</h3>
            <p className="text-sm text-gray-600">Download your invitation in various formats</p>
          </div>
        </div>
        
        {/* Export Options */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Export Format</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {EXPORT_OPTIONS.map((option) => (
              <Button
                key={option.id}
                variant={selectedOption === option.id ? 'default' : 'outline'}
                onClick={() => handleOptionChange(option.id)}
                className="flex items-start gap-3 h-auto p-4 text-left"
              >
                <option.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{option.name}</div>
                  <div className="text-xs opacity-70 mt-1">{option.description}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {option.formats.map((format) => (
                      <span
                        key={format}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Presets */}
        {currentOption && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quality Preset</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentOption.presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant={selectedPreset === preset.id ? 'default' : 'outline'}
                  onClick={() => handlePresetSelect(preset.id)}
                  className="flex items-start gap-3 h-auto p-3 text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{preset.name}</span>
                      {preset.recommended && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{preset.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Advanced Options */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm p-0"
          >
            <Settings className="w-4 h-4" />
            Advanced Options
            {showAdvanced ? '▼' : '▶'}
          </Button>
          
          {showAdvanced && currentPreset && (
            <div className="mt-4 p-4 border rounded-lg space-y-4">
              {/* PDF Options */}
              {selectedOption === 'pdf' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Format
                    </label>
                    <select
                      value={customOptions.format || currentPreset.options.format}
                      onChange={(e) => setCustomOptions(prev => ({ ...prev, format: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="A4">A4 (210 × 297 mm)</option>
                      <option value="A5">A5 (148 × 210 mm)</option>
                      <option value="letter">Letter (8.5 × 11 in)</option>
                      <option value="custom">Custom Size</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orientation
                    </label>
                    <select
                      value={customOptions.orientation || currentPreset.options.orientation}
                      onChange={(e) => setCustomOptions(prev => ({ ...prev, orientation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="include_rsvp"
                      checked={customOptions.include_rsvp ?? currentPreset.options.include_rsvp}
                      onChange={(e) => setCustomOptions(prev => ({ ...prev, include_rsvp: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="include_rsvp" className="text-sm text-gray-700">
                      Include RSVP Information
                    </label>
                  </div>
                </>
              )}
              
              {/* Image Options */}
              {selectedOption === 'image' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={customOptions.width || currentPreset.options.width}
                        onChange={(e) => setCustomOptions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={customOptions.height || currentPreset.options.height}
                        onChange={(e) => setCustomOptions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format
                    </label>
                    <select
                      value={customOptions.format || currentPreset.options.format}
                      onChange={(e) => setCustomOptions(prev => ({ ...prev, format: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="png">PNG (Best Quality)</option>
                      <option value="jpg">JPG (Smaller Size)</option>
                      <option value="webp">WebP (Modern Format)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality: {customOptions.quality || currentPreset.options.quality}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={customOptions.quality || currentPreset.options.quality}
                      onChange={(e) => setCustomOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </>
              )}
              
              {/* Print Options */}
              {selectedOption === 'print' && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="optimize_fonts"
                        checked={customOptions.optimize_fonts ?? currentPreset.options.optimize_fonts}
                        onChange={(e) => setCustomOptions(prev => ({ ...prev, optimize_fonts: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="optimize_fonts" className="text-sm text-gray-700">
                        Optimize Fonts for Print
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="high_resolution"
                        checked={customOptions.high_resolution ?? currentPreset.options.high_resolution}
                        onChange={(e) => setCustomOptions(prev => ({ ...prev, high_resolution: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="high_resolution" className="text-sm text-gray-700">
                        High Resolution Images
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Preview */}
        {currentPreset && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Export Preview</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Format:</span>
                <span className="ml-2 font-medium">{currentOption?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Preset:</span>
                <span className="ml-2 font-medium">{currentPreset.name}</span>
              </div>
              {selectedOption === 'image' && (
                <div>
                  <span className="text-gray-600">Size:</span>
                  <span className="ml-2 font-medium">
                    {customOptions.width || currentPreset.options.width}×{customOptions.height || currentPreset.options.height}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">File:</span>
                <span className="ml-2 font-medium font-mono text-xs">
                  {exportName}_{currentPreset.name.toLowerCase().replace(/\s+/g, '_')}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Export Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleExport}
              disabled={isExporting || !currentPreset}
              size="lg"
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isExporting ? 'Exporting...' : 'Export & Download'}
            </Button>
            
            {selectedOption === 'print' && (
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Now
              </Button>
            )}
          </div>
        </div>
        
        {/* Download History */}
        {downloads.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Archive className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Recent Downloads</h4>
            </div>
            
            <div className="space-y-2">
              {downloads.slice(0, 5).map((download) => (
                <div
                  key={download.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded">
                      {download.format === 'PDF' ? (
                        <FileText className="w-4 h-4 text-red-600" />
                      ) : download.format.includes('PNG') || download.format.includes('JPG') || download.format.includes('WEBP') ? (
                        <FileImage className="w-4 h-4 text-blue-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{download.name}</div>
                      <div className="text-xs text-gray-600">
                        {formatTimestamp(download.timestamp)}
                        {download.size && ` • ${formatFileSize(download.size)}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = download.url;
                        link.download = download.name;
                        link.click();
                      }}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}