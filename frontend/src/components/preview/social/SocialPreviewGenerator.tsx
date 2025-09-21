/**
 * Social Preview Generator Component
 * 
 * WHY: Generates platform-specific previews for social media sharing with
 * optimized dimensions, custom messaging, and real-time preview. Essential
 * for ensuring invitations look perfect across all social platforms.
 * 
 * WHAT: Social media preview generator with platform-specific templates,
 * image optimization, and custom overlay generation for stories and posts.
 */

'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { 
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Linkedin,
  Download,
  RefreshCw,
  Palette,
  Type,
  Image as ImageIcon,
  Eye,
  Settings,
  Loader2,
  CheckCircle,
  Copy,
  Smartphone,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSocialPreview, PreviewData } from '@/lib/hooks/usePreview';

interface SocialPreviewGeneratorProps {
  invitationId: number;
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'instagram';
  previewData?: PreviewData;
  customMessage?: string;
  className?: string;
}

interface PlatformConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  formats: Array<{
    id: string;
    name: string;
    width: number;
    height: number;
    description: string;
  }>;
  features: string[];
  maxTextLength: number;
  hashtagSupport: boolean;
  mentionSupport: boolean;
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    formats: [
      { id: 'post', name: 'Post', width: 1200, height: 630, description: 'Standard Facebook post image' },
      { id: 'story', name: 'Story', width: 1080, height: 1920, description: 'Facebook Story format' },
      { id: 'cover', name: 'Cover', width: 1640, height: 859, description: 'Facebook cover photo' }
    ],
    features: ['Rich Preview', 'Reactions', 'Comments', 'Sharing'],
    maxTextLength: 63206,
    hashtagSupport: true,
    mentionSupport: true
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: '#1DA1F2',
    formats: [
      { id: 'card', name: 'Card', width: 1200, height: 675, description: 'Twitter card image' },
      { id: 'header', name: 'Header', width: 1500, height: 500, description: 'Twitter header image' }
    ],
    features: ['Retweets', 'Likes', 'Hashtags', 'Mentions'],
    maxTextLength: 280,
    hashtagSupport: true,
    mentionSupport: true
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
    formats: [
      { id: 'post', name: 'Post', width: 1080, height: 1080, description: 'Square Instagram post' },
      { id: 'story', name: 'Story', width: 1080, height: 1920, description: 'Instagram Story format' },
      { id: 'portrait', name: 'Portrait', width: 1080, height: 1350, description: 'Vertical Instagram post' }
    ],
    features: ['Stories', 'Posts', 'Reels', 'IGTV'],
    maxTextLength: 2200,
    hashtagSupport: true,
    mentionSupport: true
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: '#25D366',
    formats: [
      { id: 'status', name: 'Status', width: 1080, height: 1920, description: 'WhatsApp Status format' },
      { id: 'chat', name: 'Chat', width: 1080, height: 1080, description: 'WhatsApp chat image' }
    ],
    features: ['Direct Message', 'Groups', 'Status', 'Voice Messages'],
    maxTextLength: 65536,
    hashtagSupport: false,
    mentionSupport: true
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: '#0A66C2',
    formats: [
      { id: 'post', name: 'Post', width: 1200, height: 627, description: 'LinkedIn post image' },
      { id: 'article', name: 'Article', width: 1200, height: 627, description: 'LinkedIn article header' },
      { id: 'banner', name: 'Banner', width: 1584, height: 396, description: 'LinkedIn profile banner' }
    ],
    features: ['Professional Network', 'Articles', 'Company Pages'],
    maxTextLength: 3000,
    hashtagSupport: true,
    mentionSupport: true
  }
};

export function SocialPreviewGenerator({
  invitationId,
  platform,
  previewData,
  customMessage,
  className = ''
}: SocialPreviewGeneratorProps) {
  const [selectedFormat, setSelectedFormat] = useState('post');
  const [customOverlay, setCustomOverlay] = useState(true);
  const [overlayText, setOverlayText] = useState('');
  const [overlayPosition, setOverlayPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [overlayStyle, setOverlayStyle] = useState<'classic' | 'modern' | 'minimal'>('modern');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mutate: generatePreview, isPending } = useSocialPreview();
  
  const config = PLATFORM_CONFIGS[platform];
  const currentFormat = config.formats.find(f => f.id === selectedFormat) || config.formats[0];
  
  // Auto-generate overlay text from invitation data
  useEffect(() => {
    if (previewData && !overlayText) {
      const groomName = previewData.custom_data.couple_groom_name || 'Novio';
      const brideName = previewData.custom_data.couple_bride_name || 'Novia';
      const coupleNames = `${brideName} & ${groomName}`;
      
      const eventDate = previewData.custom_data.event_date 
        ? new Date(previewData.custom_data.event_date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        : '';
      
      let defaultText = '';
      
      switch (platform) {
        case 'instagram':
          defaultText = `💕 ${coupleNames} 💕\n${eventDate ? `📅 ${eventDate}` : ''}\n\n#boda #wedding #amor #celebration`;
          break;
        case 'facebook':
          defaultText = `¡${coupleNames} se casan! ${eventDate ? `Será el ${eventDate}.` : ''} ¡Esperamos verte allí! 💒💕`;
          break;
        case 'twitter':
          defaultText = `¡${coupleNames} se casan! ${eventDate ? `📅 ${eventDate}` : ''} ¡Acompáñanos! #boda #wedding 💍✨`;
          break;
        case 'whatsapp':
          defaultText = `🎉 ¡${coupleNames} se casan! ${eventDate ? `\n📅 ${eventDate}` : ''}\n\n¡Estás invitado/a!`;
          break;
        default:
          defaultText = `${coupleNames} ${eventDate ? `- ${eventDate}` : ''}`;
      }
      
      setOverlayText(defaultText);
    }
  }, [previewData, platform, overlayText]);
  
  // Generate canvas preview
  const generateCanvasPreview = useCallback(async () => {
    if (!canvasRef.current || !previewData) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      canvas.width = currentFormat.width;
      canvas.height = currentFormat.height;
      
      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Load and draw background image if available
      const heroImage = previewData.media.hero?.[0] || previewData.media.gallery?.[0];
      if (heroImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            // Calculate aspect ratio and positioning
            const aspectRatio = img.width / img.height;
            const canvasAspectRatio = canvas.width / canvas.height;
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (aspectRatio > canvasAspectRatio) {
              // Image is wider than canvas
              drawHeight = canvas.height;
              drawWidth = drawHeight * aspectRatio;
              drawX = (canvas.width - drawWidth) / 2;
              drawY = 0;
            } else {
              // Image is taller than canvas
              drawWidth = canvas.width;
              drawHeight = drawWidth / aspectRatio;
              drawX = 0;
              drawY = (canvas.height - drawHeight) / 2;
            }
            
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            
            // Add overlay if enabled
            if (customOverlay && overlayText) {
              drawTextOverlay(ctx, canvas.width, canvas.height);
            }
            
            resolve(null);
          };
          img.onerror = reject;
        });
        
        img.src = heroImage.file_path;
      } else if (overlayText) {
        // No background image, just text
        drawTextOverlay(ctx, canvas.width, canvas.height);
      }
      
      // Convert canvas to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setGeneratedImage(url);
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [previewData, currentFormat, backgroundColor, customOverlay, overlayText, overlayPosition, overlayStyle, textColor]);
  
  // Draw text overlay on canvas
  const drawTextOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!overlayText) return;
    
    // Set overlay style
    const padding = 40;
    const lineHeight = 1.4;
    let fontSize = Math.max(24, width * 0.04);
    
    // Adjust font size based on format
    if (currentFormat.id === 'story') fontSize = Math.max(36, width * 0.06);
    if (currentFormat.id === 'card') fontSize = Math.max(28, width * 0.045);
    
    ctx.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    
    // Split text into lines
    const words = overlayText.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    const maxWidth = width - padding * 2;
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    
    // Calculate vertical position
    const textHeight = lines.length * fontSize * lineHeight;
    let startY: number;
    
    switch (overlayPosition) {
      case 'top':
        startY = padding + fontSize;
        break;
      case 'center':
        startY = (height - textHeight) / 2 + fontSize;
        break;
      case 'bottom':
        startY = height - padding - textHeight + fontSize;
        break;
    }
    
    // Draw background rectangle for better readability
    if (overlayStyle !== 'minimal') {
      const rectPadding = 20;
      const rectY = startY - fontSize - rectPadding;
      const rectHeight = textHeight + rectPadding * 2;
      
      ctx.fillStyle = overlayStyle === 'modern' 
        ? 'rgba(0, 0, 0, 0.7)' 
        : 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(
        padding - rectPadding,
        rectY,
        maxWidth + rectPadding * 2,
        rectHeight
      );
      
      // Adjust text color for background
      ctx.fillStyle = overlayStyle === 'modern' ? '#ffffff' : textColor;
    }
    
    // Draw text lines
    lines.forEach((line, index) => {
      const y = startY + index * fontSize * lineHeight;
      ctx.fillText(line, width / 2, y);
    });
  };
  
  // Handle format change
  const handleFormatChange = (formatId: string) => {
    setSelectedFormat(formatId);
    setGeneratedImage(''); // Clear previous image
  };
  
  // Handle download
  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${platform}-${selectedFormat}-${invitationId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!canvasRef.current) return;
    
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        }
      });
    } catch (error) {
      console.error('Failed to copy image:', error);
    }
  };
  
  // Auto-generate on changes
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (previewData) {
        generateCanvasPreview();
      }
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  }, [generateCanvasPreview, previewData]);
  
  const PlatformIcon = config.icon;
  
  return (
    <div className={`bg-white border rounded-lg ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.color}20` }}>
            <PlatformIcon className="w-6 h-6" /* style={{ color: config.color }} */ />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {config.name} Preview Generator
            </h3>
            <p className="text-sm text-gray-600">
              Generate optimized images for {config.name} sharing
            </p>
          </div>
        </div>
        
        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Format
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {config.formats.map((format) => (
              <Button
                key={format.id}
                variant={selectedFormat === format.id ? 'default' : 'outline'}
                onClick={() => handleFormatChange(format.id)}
                className="flex flex-col items-center gap-2 h-auto p-4"
              >
                <div className="flex items-center gap-2">
                  {format.id === 'story' && <Smartphone className="w-4 h-4" />}
                  {format.id === 'post' && <ImageIcon className="w-4 h-4" />}
                  {format.id === 'card' && <Monitor className="w-4 h-4" />}
                  <span className="font-medium">{format.name}</span>
                </div>
                <div className="text-xs text-gray-600">
                  {format.width} × {format.height}
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {format.description}
                </div>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Overlay Options */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Text Overlay
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="customOverlay"
                checked={customOverlay}
                onChange={(e) => setCustomOverlay(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="customOverlay" className="text-sm text-gray-600">
                Enable
              </label>
            </div>
          </div>
          
          {customOverlay && (
            <div className="space-y-4">
              {/* Overlay Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text ({overlayText.length}/{config.maxTextLength})
                </label>
                <textarea
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value.slice(0, config.maxTextLength))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder={`Enter text for ${config.name}...`}
                />
                {config.hashtagSupport && (
                  <p className="text-xs text-gray-500 mt-1">
                    Hashtags (#) and mentions (@) are supported
                  </p>
                )}
              </div>
              
              {/* Style Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={overlayPosition}
                    onChange={(e) => setOverlayPosition(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style
                  </label>
                  <select
                    value={overlayStyle}
                    onChange={(e) => setOverlayStyle(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="classic">Classic</option>
                    <option value="modern">Modern</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-9 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Preview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Preview
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={generateCanvasPreview}
              disabled={isGenerating || !previewData}
              className="flex items-center gap-1"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating...' : 'Regenerate'}
            </Button>
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-center">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-96 border border-gray-200 rounded shadow-sm"
                  style={{
                    aspectRatio: `${currentFormat.width} / ${currentFormat.height}`,
                    maxWidth: currentFormat.width > currentFormat.height ? '400px' : '300px'
                  }}
                />
                
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
                    <LoadingSpinner size="lg" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Format Info */}
            <div className="mt-4 text-center text-sm text-gray-600">
              {currentFormat.name} • {currentFormat.width} × {currentFormat.height} px
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-gray-600">
            Optimized for {config.name} • {config.features.join(' • ')}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={!generatedImage}
              className="flex items-center gap-1"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            
            <Button
              onClick={handleDownload}
              disabled={!generatedImage}
              className="flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}