/**
 * SEO Optimizer Component
 * 
 * WHY: Provides comprehensive SEO optimization for public invitation URLs
 * including meta tags, Open Graph data, Twitter Cards, and structured data.
 * Essential for social sharing and search engine visibility.
 * 
 * WHAT: SEO configuration interface with meta tag preview, structured data
 * generation, social media optimization, and performance recommendations.
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Search,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Eye,
  CheckCircle,
  AlertCircle,
  Info,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Users,
  RefreshCw,
  Zap,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePreviewData } from '@/lib/hooks/usePreview';

interface SEOOptimizerProps {
  invitationId: number;
  title?: string;
  description?: string;
  url?: string;
  className?: string;
  autoOptimize?: boolean;
}

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  structuredData: any;
}

interface SEOScore {
  overall: number;
  title: number;
  description: number;
  keywords: number;
  openGraph: number;
  twitter: number;
  structuredData: number;
  image: number;
}

export function SEOOptimizer({
  invitationId,
  title = '',
  description = '',
  url = '',
  className = '',
  autoOptimize = true
}: SEOOptimizerProps) {
  const [seoData, setSeoData] = useState<SEOData>({
    title: '',
    description: '',
    keywords: [],
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonicalUrl: '',
    structuredData: {}
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  
  const { data: previewData } = usePreviewData(invitationId);
  
  // Auto-generate SEO data from invitation data
  const generateSEOData = useCallback(() => {
    if (!previewData) return;
    
    const { custom_data, invitation, media } = previewData;
    
    // Generate couple names
    const groomName = custom_data.couple_groom_name || 'Novio';
    const brideName = custom_data.couple_bride_name || 'Novia';
    const coupleNames = `${brideName} & ${groomName}`;
    
    // Generate event date
    const eventDate = custom_data.event_date 
      ? new Date(custom_data.event_date).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : '';
    
    // Generate venue
    const venue = custom_data.event_venue_name || '';
    const location = custom_data.event_venue_address || '';
    
    // Generate SEO title
    const seoTitle = title || `Invitación de Boda - ${coupleNames}${eventDate ? ` - ${eventDate}` : ''}`;
    
    // Generate SEO description
    const seoDescription = description || 
      `Te invitamos a la boda de ${coupleNames}.${eventDate ? ` Será el ${eventDate}` : ''}${venue ? ` en ${venue}` : ''}.${location ? ` Ubicación: ${location}` : ''} ¡No te lo pierdas!`;
    
    // Generate keywords
    const keywords = [
      'invitación',
      'boda',
      'wedding',
      'invitation',
      groomName,
      brideName,
      ...venue.split(' ').filter(word => word.length > 2),
      ...location.split(' ').filter(word => word.length > 2),
      eventDate ? new Date(custom_data.event_date).getFullYear().toString() : ''
    ].filter(Boolean);
    
    // Get main image
    const heroImage = media.hero?.[0] || media.gallery?.[0];
    const imageUrl = heroImage ? (
      heroImage.file_path.startsWith('http') 
        ? heroImage.file_path 
        : `${window.location.origin}${heroImage.file_path}`
    ) : '';
    
    // Generate structured data
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      'name': `Boda de ${coupleNames}`,
      'description': seoDescription,
      'startDate': custom_data.event_date || '',
      'endDate': custom_data.event_date || '',
      'eventStatus': 'EventScheduled',
      'eventAttendanceMode': 'OfflineEventAttendanceMode',
      'location': venue ? {
        '@type': 'Place',
        'name': venue,
        'address': location ? {
          '@type': 'PostalAddress',
          'streetAddress': location
        } : undefined
      } : undefined,
      'organizer': {
        '@type': 'Person',
        'name': coupleNames
      },
      'image': imageUrl ? [imageUrl] : undefined,
      'url': url ? (url.startsWith('http') ? url : `${window.location.origin}${url}`) : undefined
    };
    
    const newSeoData: SEOData = {
      title: seoTitle.length > 60 ? seoTitle.substring(0, 57) + '...' : seoTitle,
      description: seoDescription.length > 160 ? seoDescription.substring(0, 157) + '...' : seoDescription,
      keywords: keywords.slice(0, 15), // Limit keywords
      ogTitle: seoTitle.length > 95 ? seoTitle.substring(0, 92) + '...' : seoTitle,
      ogDescription: seoDescription.length > 300 ? seoDescription.substring(0, 297) + '...' : seoDescription,
      ogImage: imageUrl,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: seoTitle.length > 70 ? seoTitle.substring(0, 67) + '...' : seoTitle,
      twitterDescription: seoDescription.length > 200 ? seoDescription.substring(0, 197) + '...' : seoDescription,
      twitterImage: imageUrl,
      canonicalUrl: url ? (url.startsWith('http') ? url : `${window.location.origin}${url}`) : '',
      structuredData
    };
    
    setSeoData(newSeoData);
  }, [previewData, title, description, url]);
  
  // Auto-generate on mount and when data changes
  useEffect(() => {
    if (autoOptimize && previewData) {
      generateSEOData();
    }
  }, [autoOptimize, previewData, generateSEOData]);
  
  // Calculate SEO score
  const seoScore = useMemo((): SEOScore => {
    const score = {
      overall: 0,
      title: 0,
      description: 0,
      keywords: 0,
      openGraph: 0,
      twitter: 0,
      structuredData: 0,
      image: 0
    };
    
    // Title score (0-100)
    if (seoData.title) {
      if (seoData.title.length >= 30 && seoData.title.length <= 60) score.title = 100;
      else if (seoData.title.length >= 20 && seoData.title.length <= 70) score.title = 80;
      else if (seoData.title.length >= 10) score.title = 60;
      else score.title = 30;
    }
    
    // Description score (0-100)
    if (seoData.description) {
      if (seoData.description.length >= 120 && seoData.description.length <= 160) score.description = 100;
      else if (seoData.description.length >= 100 && seoData.description.length <= 180) score.description = 80;
      else if (seoData.description.length >= 80) score.description = 60;
      else score.description = 30;
    }
    
    // Keywords score (0-100)
    if (seoData.keywords.length >= 5) score.keywords = 100;
    else if (seoData.keywords.length >= 3) score.keywords = 80;
    else if (seoData.keywords.length >= 1) score.keywords = 50;
    
    // Open Graph score (0-100)
    let ogScore = 0;
    if (seoData.ogTitle) ogScore += 30;
    if (seoData.ogDescription) ogScore += 30;
    if (seoData.ogImage) ogScore += 40;
    score.openGraph = ogScore;
    
    // Twitter score (0-100)
    let twitterScore = 0;
    if (seoData.twitterTitle) twitterScore += 30;
    if (seoData.twitterDescription) twitterScore += 30;
    if (seoData.twitterImage) twitterScore += 40;
    score.twitter = twitterScore;
    
    // Structured data score (0-100)
    if (seoData.structuredData && Object.keys(seoData.structuredData).length > 2) {
      score.structuredData = 100;
    } else if (seoData.structuredData && Object.keys(seoData.structuredData).length > 0) {
      score.structuredData = 60;
    }
    
    // Image score (0-100)
    if (seoData.ogImage && seoData.twitterImage) score.image = 100;
    else if (seoData.ogImage || seoData.twitterImage) score.image = 60;
    
    // Overall score
    score.overall = Math.round(
      (score.title + score.description + score.keywords + score.openGraph + 
       score.twitter + score.structuredData + score.image) / 7
    );
    
    return score;
  }, [seoData]);
  
  // Handle field updates
  const updateSeoField = (field: keyof SEOData, value: any) => {
    setSeoData(prev => ({ ...prev, [field]: value }));
  };
  
  // Copy meta tags to clipboard
  const copyMetaTags = useCallback(async () => {
    const metaTags = generateMetaTags();
    
    try {
      await navigator.clipboard.writeText(metaTags);
      setCopySuccess('meta');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('Failed to copy meta tags:', error);
    }
  }, [seoData]);
  
  // Copy structured data to clipboard
  const copyStructuredData = useCallback(async () => {
    const structuredDataScript = `<script type="application/ld+json">\n${JSON.stringify(seoData.structuredData, null, 2)}\n</script>`;
    
    try {
      await navigator.clipboard.writeText(structuredDataScript);
      setCopySuccess('structured');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('Failed to copy structured data:', error);
    }
  }, [seoData.structuredData]);
  
  // Generate meta tags HTML
  const generateMetaTags = () => {
    return `<!-- Basic Meta Tags -->
<title>${seoData.title}</title>
<meta name="description" content="${seoData.description}">
<meta name="keywords" content="${seoData.keywords.join(', ')}">
${seoData.canonicalUrl ? `<link rel="canonical" href="${seoData.canonicalUrl}">` : ''}

<!-- Open Graph Meta Tags -->
<meta property="og:title" content="${seoData.ogTitle}">
<meta property="og:description" content="${seoData.ogDescription}">
<meta property="og:type" content="${seoData.ogType}">
${seoData.ogImage ? `<meta property="og:image" content="${seoData.ogImage}">` : ''}
${seoData.canonicalUrl ? `<meta property="og:url" content="${seoData.canonicalUrl}">` : ''}
<meta property="og:locale" content="es_ES">

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="${seoData.twitterCard}">
<meta name="twitter:title" content="${seoData.twitterTitle}">
<meta name="twitter:description" content="${seoData.twitterDescription}">
${seoData.twitterImage ? `<meta name="twitter:image" content="${seoData.twitterImage}">` : ''}`;
  };
  
  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  // Get score icon
  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertCircle;
    return AlertCircle;
  };
  
  const OverallScoreIcon = getScoreIcon(seoScore.overall);
  
  return (
    <div className={`bg-white border rounded-lg ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">SEO Optimization</h3>
              <p className="text-sm text-gray-600">Optimize your invitation for search engines and social sharing</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* SEO Score */}
            <div className="flex items-center gap-2">
              <OverallScoreIcon className={`w-5 h-5 ${getScoreColor(seoScore.overall)}`} />
              <span className={`text-lg font-bold ${getScoreColor(seoScore.overall)}`}>
                {seoScore.overall}
              </span>
              <span className="text-sm text-gray-600">/100</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={generateSEOData}
              className="flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Auto-Generate
            </Button>
          </div>
        </div>
        
        {/* SEO Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-xl font-bold ${getScoreColor(seoScore.title)}`}>
              {seoScore.title}
            </div>
            <div className="text-xs text-gray-600">Title</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-xl font-bold ${getScoreColor(seoScore.description)}`}>
              {seoScore.description}
            </div>
            <div className="text-xs text-gray-600">Description</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-xl font-bold ${getScoreColor(seoScore.openGraph)}`}>
              {seoScore.openGraph}
            </div>
            <div className="text-xs text-gray-600">Open Graph</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-xl font-bold ${getScoreColor(seoScore.twitter)}`}>
              {seoScore.twitter}
            </div>
            <div className="text-xs text-gray-600">Twitter</div>
          </div>
        </div>
        
        {/* Configuration Toggle */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant={!customMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCustomMode(false)}
            >
              <Zap className="w-4 h-4 mr-2" />
              Auto Mode
            </Button>
            <Button
              variant={customMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCustomMode(true)}
            >
              <Target className="w-4 h-4 mr-2" />
              Custom Mode
            </Button>
          </div>
        </div>
        
        {/* SEO Fields */}
        {customMode && (
          <div className="space-y-6 mb-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title ({seoData.title.length}/60)
              </label>
              <input
                type="text"
                value={seoData.title}
                onChange={(e) => updateSeoField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter SEO title..."
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Appears in search results and browser tabs
                </p>
                <span className={`text-xs ${seoData.title.length > 60 ? 'text-red-600' : seoData.title.length > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {seoData.title.length <= 60 ? 'Good length' : 'Too long'}
                </span>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description ({seoData.description.length}/160)
              </label>
              <textarea
                value={seoData.description}
                onChange={(e) => updateSeoField('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Enter SEO description..."
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Appears in search results below the title
                </p>
                <span className={`text-xs ${seoData.description.length > 160 ? 'text-red-600' : seoData.description.length > 140 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {seoData.description.length <= 160 ? 'Good length' : 'Too long'}
                </span>
              </div>
            </div>
            
            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords ({seoData.keywords.length})
              </label>
              <input
                type="text"
                value={seoData.keywords.join(', ')}
                onChange={(e) => updateSeoField('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="keyword1, keyword2, keyword3..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple keywords with commas
              </p>
            </div>
          </div>
        )}
        
        {/* Preview Toggle */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
        
        {/* Social Media Preview */}
        {showPreview && (
          <div className="space-y-6 mb-6">
            {/* Google Search Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Google Search Preview
              </h4>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                  {seoData.title}
                </div>
                <div className="text-green-600 text-sm mt-1">
                  {seoData.canonicalUrl}
                </div>
                <div className="text-gray-700 text-sm mt-2">
                  {seoData.description}
                </div>
              </div>
            </div>
            
            {/* Facebook Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                Facebook Preview
              </h4>
              <div className="border rounded-lg overflow-hidden bg-white max-w-lg">
                {seoData.ogImage && (
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <img
                      src={seoData.ogImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="text-gray-500 text-xs uppercase mb-1">
                    {seoData.canonicalUrl ? new URL(seoData.canonicalUrl).hostname : 'example.com'}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                    {seoData.ogTitle}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {seoData.ogDescription}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Twitter Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter Preview
              </h4>
              <div className="border rounded-lg overflow-hidden bg-white max-w-lg">
                {seoData.twitterImage && (
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <img
                      src={seoData.twitterImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                      }}
                    />
                  </div>
                )}
                <div className="p-4 border-t border-gray-200">
                  <div className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                    {seoData.twitterTitle}
                  </div>
                  <div className="text-gray-600 text-xs mb-2">
                    {seoData.twitterDescription}
                  </div>
                  <div className="text-gray-500 text-xs flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {seoData.canonicalUrl ? new URL(seoData.canonicalUrl).hostname : 'example.com'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Export Options */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-gray-600">
            SEO optimization helps your invitation appear in search results and social media previews
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={copyStructuredData}
              className="flex items-center gap-1"
            >
              {copySuccess === 'structured' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copySuccess === 'structured' ? 'Copied!' : 'Copy JSON-LD'}
            </Button>
            
            <Button
              onClick={copyMetaTags}
              className="flex items-center gap-1"
            >
              {copySuccess === 'meta' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copySuccess === 'meta' ? 'Copied!' : 'Copy Meta Tags'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}