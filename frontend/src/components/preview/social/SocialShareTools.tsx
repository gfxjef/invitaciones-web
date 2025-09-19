/**
 * Social Share Tools Component
 * 
 * WHY: Provides comprehensive social sharing capabilities with platform-specific
 * optimization, custom messaging, and analytics tracking. Essential for viral
 * marketing and invitation distribution.
 * 
 * WHAT: Social media sharing buttons with platform-specific previews,
 * custom messages, analytics tracking, and copy-to-clipboard functionality.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  MessageCircle,
  Mail,
  Copy,
  Share2,
  Link2,
  Download,
  Eye,
  BarChart3,
  CheckCircle,
  ExternalLink,
  Smartphone,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SocialPreviewGenerator } from './SocialPreviewGenerator';
import { 
  useSocialPreview,
  useTrackSocialShare,
  useSharingStats,
  PreviewData 
} from '@/lib/hooks/usePreview';

interface SocialShareToolsProps {
  invitationId: number;
  previewData?: PreviewData;
  publicUrl?: string;
  className?: string;
  showStats?: boolean;
  showPreview?: boolean;
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  shareUrl: (url: string, title: string, description: string) => string;
  customMessage?: (coupleNames: string, eventDate?: string) => string;
  features: string[];
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    shareUrl: (url, title, description) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title + ' - ' + description)}`,
    customMessage: (coupleNames, eventDate) => 
      `¡${coupleNames} se casan! ${eventDate ? `Será el ${eventDate}.` : ''} ¡No te pierdas esta celebración! 💒💕`,
    features: ['Rich Preview', 'Comments', 'Reactions']
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-sky-500 hover:bg-sky-600',
    shareUrl: (url, title, description) => 
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=boda,wedding`,
    customMessage: (coupleNames, eventDate) => 
      `¡${coupleNames} se casan! ${eventDate ? `📅 ${eventDate}` : ''} ¡Acompáñanos en este día especial! #boda #wedding 💍✨`,
    features: ['Hashtags', 'Mentions', 'Retweets']
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-green-600 hover:bg-green-700',
    shareUrl: (url, title, description) => 
      `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${description}\n\n${url}`)}`,
    customMessage: (coupleNames, eventDate) => 
      `🎉 ¡${coupleNames} se casan! ${eventDate ? `\n📅 ${eventDate}` : ''}\n\n¡Estás invitado/a a nuestra boda! Aquí tienes todos los detalles:`,
    features: ['Direct Message', 'Groups', 'Status']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    shareUrl: (url, title) => 
      `https://www.instagram.com/`, // Instagram doesn't support direct sharing, opens app
    customMessage: (coupleNames) => 
      `💕 ¡${coupleNames} se casan! 💕\n\n#boda #wedding #amor #celebration #love`,
    features: ['Stories', 'Posts', 'Reels']
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700 hover:bg-blue-800',
    shareUrl: (url, title, description) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`,
    customMessage: (coupleNames, eventDate) => 
      `Queremos compartir con ustedes una noticia especial: ¡${coupleNames} se casan! ${eventDate ? `La celebración será el ${eventDate}.` : ''} Esperamos contar con su presencia en este día tan importante.`,
    features: ['Professional Network', 'Announcements']
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'bg-gray-600 hover:bg-gray-700',
    shareUrl: (url, title, description) => 
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\nPuedes ver todos los detalles en: ${url}`)}`,
    customMessage: (coupleNames, eventDate) => 
      `¡Hola!\n\nTenemos una noticia maravillosa que compartir contigo: ¡${coupleNames} se casan!\n\n${eventDate ? `La celebración será el ${eventDate} y ` : ''}Esperamos de todo corazón que puedas acompañarnos en este día tan especial.\n\nEn el enlace encontrarás todos los detalles del evento, incluyendo la ubicación, horarios y cómo confirmar tu asistencia.`,
    features: ['Personal Message', 'Attachments', 'Recipients']
  }
];

export function SocialShareTools({
  invitationId,
  previewData,
  publicUrl,
  className = '',
  showStats = true,
  showPreview = true
}: SocialShareToolsProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('facebook');
  const [copySuccess, setCopySuccess] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [showCustomMessage, setShowCustomMessage] = useState(false);
  
  // API hooks
  const generatePreview = useSocialPreview();
  const trackShare = useTrackSocialShare();
  const { data: sharingStats } = useSharingStats(invitationId);
  
  // Extract invitation data
  const coupleNames = useMemo(() => {
    if (!previewData) return '';
    const groom = previewData.custom_data.couple_groom_name || 'Novio';
    const bride = previewData.custom_data.couple_bride_name || 'Novia';
    return `${bride} & ${groom}`;
  }, [previewData]);
  
  const eventDate = useMemo(() => {
    if (!previewData?.custom_data.event_date) return '';
    const date = new Date(previewData.custom_data.event_date);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [previewData?.custom_data.event_date]);
  
  const invitationTitle = useMemo(() => {
    return `Invitación de Boda - ${coupleNames}`;
  }, [coupleNames]);
  
  const invitationDescription = useMemo(() => {
    return `Te invitamos a celebrar nuestro día especial. ${eventDate ? `Será el ${eventDate}.` : ''} ¡Esperamos verte allí!`;
  }, [eventDate]);
  
  const shareUrl = publicUrl || (previewData ? `/invitacion/${previewData.invitation.id}` : '');
  const fullUrl = shareUrl.startsWith('http') ? shareUrl : `${window.location.origin}${shareUrl}`;
  
  // Handle platform selection
  const handlePlatformSelect = useCallback((platformId: string) => {
    setSelectedPlatform(platformId);
    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
    if (platform?.customMessage) {
      const defaultMessage = platform.customMessage(coupleNames, eventDate);
      setCustomMessage(defaultMessage);
    }
  }, [coupleNames, eventDate]);
  
  // Handle social share
  const handleShare = useCallback(async (platform: SocialPlatform) => {
    if (!shareUrl) return;
    
    try {
      // Track the share
      await trackShare.mutateAsync({
        invitationId,
        platform: platform.id,
        metadata: {
          url: fullUrl,
          title: invitationTitle,
          customMessage: showCustomMessage ? customMessage : undefined
        }
      });
      
      // Generate share URL
      const message = showCustomMessage && customMessage ? customMessage : (
        platform.customMessage ? platform.customMessage(coupleNames, eventDate) : invitationDescription
      );
      
      let shareLink: string;
      
      if (platform.id === 'instagram') {
        // Instagram requires manual sharing
        await navigator.clipboard.writeText(`${message}\n\n${fullUrl}`);
        alert('Texto copiado al portapapeles. Puedes pegarlo en Instagram.');
        window.open('https://www.instagram.com/', '_blank');
      } else {
        shareLink = platform.shareUrl(fullUrl, invitationTitle, message);
        window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=400');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [
    shareUrl,
    fullUrl,
    invitationTitle,
    invitationDescription,
    coupleNames,
    eventDate,
    customMessage,
    showCustomMessage,
    invitationId,
    trackShare
  ]);
  
  // Handle copy URL
  const handleCopyUrl = useCallback(async () => {
    if (!fullUrl) return;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      
      // Track copy action
      await trackShare.mutateAsync({
        invitationId,
        platform: 'copy_link',
        metadata: { url: fullUrl }
      });
    } catch (error) {
      console.error('Error copying URL:', error);
    }
  }, [fullUrl, invitationId, trackShare]);
  
  // Handle native share (if supported)
  const handleNativeShare = useCallback(async () => {
    if (!navigator.share || !fullUrl) return;
    
    try {
      await navigator.share({
        title: invitationTitle,
        text: invitationDescription,
        url: fullUrl
      });
      
      // Track native share
      await trackShare.mutateAsync({
        invitationId,
        platform: 'native_share',
        metadata: { url: fullUrl }
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error with native share:', error);
      }
    }
  }, [fullUrl, invitationTitle, invitationDescription, invitationId, trackShare]);
  
  const selectedPlatformData = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform);
  
  return (
    <div className={`bg-white rounded-lg ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Share2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Social Sharing</h3>
              <p className="text-sm text-gray-600">Share your invitation across social platforms</p>
            </div>
          </div>
          
          {/* Native Share Button (if supported) */}
          {navigator.share && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNativeShare}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Share
            </Button>
          )}
        </div>
        
        {/* Platform Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Select Platform</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SOCIAL_PLATFORMS.map((platform) => (
              <Button
                key={platform.id}
                variant={selectedPlatform === platform.id ? 'default' : 'outline'}
                onClick={() => handlePlatformSelect(platform.id)}
                className="flex items-center gap-2 justify-start h-12"
              >
                <platform.icon className="w-4 h-4" />
                <span className="text-sm">{platform.name}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Platform Details */}
        {selectedPlatformData && (
          <div className="mb-6 p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg text-white ${selectedPlatformData.color}`}>
                <selectedPlatformData.icon className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-medium text-gray-900">{selectedPlatformData.name}</h5>
                <div className="flex gap-2 mt-1">
                  {selectedPlatformData.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Custom Message Toggle */}
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showCustomMessage}
                  onChange={(e) => setShowCustomMessage(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Customize message
              </label>
            </div>
            
            {/* Custom Message Input */}
            {showCustomMessage && (
              <div className="mb-4">
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter your custom message..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The invitation URL will be automatically added
                </p>
              </div>
            )}
            
            {/* Default Message Preview */}
            {!showCustomMessage && selectedPlatformData.customMessage && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 font-medium mb-2">Default message:</p>
                <p className="text-sm text-gray-600 italic">
                  &ldquo;{selectedPlatformData.customMessage(coupleNames, eventDate)}&rdquo;
                </p>
              </div>
            )}
            
            {/* Share Button */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleShare(selectedPlatformData)}
                disabled={trackShare.isPending}
                className={`flex-1 flex items-center justify-center gap-2 text-white ${selectedPlatformData.color}`}
              >
                {trackShare.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <selectedPlatformData.icon className="w-4 h-4" />
                )}
                Share on {selectedPlatformData.name}
              </Button>
              
              {selectedPlatform === 'instagram' && (
                <Button
                  variant="outline"
                  onClick={() => generatePreview.mutate({ invitationId, platform: 'instagram' })}
                  disabled={generatePreview.isPending}
                  className="flex items-center gap-2"
                >
                  {generatePreview.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                  Generate Story
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Direct Actions */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleCopyUrl}
              className="flex items-center gap-2"
            >
              {copySuccess ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copySuccess ? 'Copied!' : 'Copy Link'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open(fullUrl, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Preview
            </Button>
          </div>
        </div>
        
        {/* URL Display */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Public URL</span>
          </div>
          <code className="text-sm text-blue-600 font-mono break-all">
            {fullUrl}
          </code>
        </div>
        
        {/* Social Preview Generator */}
        {showPreview && selectedPlatformData && (
          <div className="mb-6">
            <SocialPreviewGenerator
              invitationId={invitationId}
              platform={selectedPlatform as any}
              previewData={previewData}
              customMessage={showCustomMessage ? customMessage : undefined}
            />
          </div>
        )}
        
        {/* Sharing Statistics */}
        {showStats && sharingStats && (
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Sharing Statistics</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {sharingStats.total_shares}
                </div>
                <div className="text-sm text-gray-600">Total Shares</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {(sharingStats.conversion_rate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Conversion</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {sharingStats.viral_coefficient.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Viral Coefficient</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(sharingStats.platform_breakdown).length}
                </div>
                <div className="text-sm text-gray-600">Platforms</div>
              </div>
            </div>
            
            {/* Platform Breakdown */}
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">By Platform</h5>
              <div className="space-y-2">
                {Object.entries(sharingStats.platform_breakdown).map(([platform, count]) => {
                  const platformData = SOCIAL_PLATFORMS.find(p => p.id === platform);
                  return (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {platformData ? (
                          <platformData.icon className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Share2 className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm text-gray-700 capitalize">
                          {platformData?.name || platform.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}