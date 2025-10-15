/**
 * Public URL Generator Component
 * 
 * WHY: Enables users to generate custom public URLs for their invitations
 * with real-time validation, SEO optimization, and kossomet.com/invita/ hosting.
 * Essential for professional invitation sharing and tracking.
 * 
 * WHAT: URL generation form with slug validation, SEO settings, analytics
 * configuration, and preview of final public URL.
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Link2, 
  Globe, 
  Eye,
  Check,
  X,
  AlertCircle,
  Loader2,
  Settings,
  BarChart3,
  Lock,
  Search,
  Copy,
  ExternalLink,
  Zap,
  CheckCircle,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { QRCodeDisplay } from '@/components/ui/qr-code';
import { SEOOptimizer } from '../seo/SEOOptimizer';
import { 
  useGeneratePublicURL,
  useSlugAvailability,
  useQRCodeGeneration,
  usePreviewData 
} from '@/lib/hooks/usePreview';
import { PublicURLRequest } from '@/lib/api';

// Form validation schema
const urlGeneratorSchema = z.object({
  custom_slug: z
    .string()
    .min(3, 'URL slug must be at least 3 characters')
    .max(50, 'URL slug cannot exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'URL slug can only contain lowercase letters, numbers, and hyphens')
    .regex(/^[a-z0-9]/, 'URL slug must start with a letter or number')
    .regex(/[a-z0-9]$/, 'URL slug must end with a letter or number')
    .refine(slug => !slug.includes('--'), 'URL slug cannot contain consecutive hyphens'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .max(300, 'Description cannot exceed 300 characters')
    .optional(),
  enable_seo: z.boolean().default(true),
  enable_analytics: z.boolean().default(true),
  password_protected: z.boolean().default(false),
  password: z
    .string()
    .optional()
    // TODO: Fix password validation for schema dependencies
    // .superRefine((value, ctx) => {
    //   if (ctx.parent.password_protected && (!value || value.length < 6)) {
    //     ctx.addIssue({
    //       code: z.ZodIssueCode.custom,
    //       message: 'Password must be at least 6 characters when protection is enabled'
    //     });
    //   }
    // })
});

type URLFormData = z.infer<typeof urlGeneratorSchema>;

interface PublicURLGeneratorProps {
  invitationId: number;
  initialData?: Partial<PublicURLRequest>;
  onSuccess?: (data: { public_url: string; full_url: string }) => void;
  onCancel?: () => void;
  className?: string;
}

export function PublicURLGenerator({
  invitationId,
  initialData,
  onSuccess,
  onCancel,
  className = ''
}: PublicURLGeneratorProps) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const [generatedURL, setGeneratedURL] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  
  // API hooks
  const generateURL = useGeneratePublicURL();
  const checkSlug = useSlugAvailability();
  const generateQR = useQRCodeGeneration();
  const { data: previewData } = usePreviewData(invitationId);
  
  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset
  } = useForm<URLFormData>({
    resolver: zodResolver(urlGeneratorSchema),
    defaultValues: {
      custom_slug: initialData?.custom_slug || '',
      title: initialData?.title || previewData?.invitation.title || '',
      description: initialData?.description || '',
      enable_seo: initialData?.enable_seo ?? true,
      enable_analytics: initialData?.enable_analytics ?? true,
      password_protected: initialData?.password_protected ?? false,
      password: initialData?.password || ''
    },
    mode: 'onChange'
  });
  
  const watchedSlug = watch('custom_slug');
  const watchedTitle = watch('title');
  const watchedPasswordProtected = watch('password_protected');
  
  // Auto-generate slug from title
  const generateSlugFromTitle = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
  }, []);
  
  // Generate slug suggestions
  const generateSlugSuggestions = useCallback((baseSlug: string): string[] => {
    const suggestions = [
      baseSlug,
      `${baseSlug}-2024`,
      `${baseSlug}-boda`,
      `${baseSlug}-invitation`,
      `invitacion-${baseSlug}`,
      `${baseSlug}-${Math.floor(Math.random() * 1000)}`
    ];
    
    return suggestions
      .filter((slug, index, arr) => arr.indexOf(slug) === index) // Remove duplicates
      .filter(slug => slug.length >= 3 && slug.length <= 50); // Valid length
  }, []);
  
  // Auto-generate slug when title changes
  useEffect(() => {
    if (watchedTitle && !watchedSlug) {
      const slug = generateSlugFromTitle(watchedTitle);
      if (slug) {
        setValue('custom_slug', slug);
        trigger('custom_slug');
      }
    }
  }, [watchedTitle, watchedSlug, generateSlugFromTitle, setValue, trigger]);
  
  // Check slug availability with debounce
  useEffect(() => {
    if (watchedSlug && watchedSlug.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkSlug.mutate(
          { slug: watchedSlug, excludeId: invitationId },
          {
            onSuccess: (data) => {
              if (!data.available && data.suggestions) {
                setSlugSuggestions(data.suggestions);
              } else if (!data.available) {
                // Generate our own suggestions
                const suggestions = generateSlugSuggestions(watchedSlug);
                setSlugSuggestions(suggestions);
              } else {
                setSlugSuggestions([]);
              }
            }
          }
        );
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [watchedSlug, checkSlug, invitationId, generateSlugSuggestions]);
  
  // Generate preview URL
  const previewURL = useMemo(() => {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kossomet.com';
    return watchedSlug ? `${baseURL}/invita/${watchedSlug}` : '';
  }, [watchedSlug]);
  
  // Handle form submission
  const onSubmit = async (data: URLFormData) => {
    try {
      const result = await generateURL.mutateAsync({
        invitation_id: invitationId,
        custom_slug: data.custom_slug,
        title: data.title,
        description: data.description,
        enable_seo: data.enable_seo,
        enable_analytics: data.enable_analytics,
        password_protected: data.password_protected,
        password: data.password_protected ? data.password : undefined
      });
      
      setGeneratedURL(result.full_url);
      onSuccess?.(result);
    } catch (error) {
      console.error('Error generating public URL:', error);
    }
  };
  
  // Handle slug suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setValue('custom_slug', suggestion);
    trigger('custom_slug');
    setSlugSuggestions([]);
  };
  
  // Handle copy URL
  const handleCopyURL = async () => {
    if (previewURL) {
      try {
        await navigator.clipboard.writeText(previewURL);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  };
  
  // Handle QR code generation
  const handleGenerateQR = () => {
    if (generatedURL || previewURL) {
      generateQR.mutate({
        invitationId,
        options: { size: 256, format: 'png', error_correction: 'M' }
      });
      setShowQRCode(true);
    }
  };
  
  const isSlugAvailable = checkSlug.data?.available;
  const slugCheckLoading = checkSlug.isPending;
  const slugError = watchedSlug && watchedSlug.length >= 3 && isSlugAvailable === false;
  
  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Generate Public URL</h3>
              <p className="text-sm text-gray-600">
                Create a custom URL for your invitation on kossomet.com/invita/
              </p>
            </div>
          </div>
          
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invitation Title *
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="e.g., Maria & Juan Wedding 2024"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              This will be used for SEO and social sharing
            </p>
          </div>
          
          {/* Custom Slug Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom URL Slug *
            </label>
            <div className="relative">
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                  kossomet.com/invita/
                </span>
                <input
                  {...register('custom_slug')}
                  type="text"
                  placeholder="maria-y-juan-2024"
                  className={`flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.custom_slug || slugError 
                      ? 'border-red-300' 
                      : isSlugAvailable === true 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {slugCheckLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                  {!slugCheckLoading && isSlugAvailable === true && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {!slugCheckLoading && slugError && (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            
            {errors.custom_slug && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.custom_slug.message}
              </p>
            )}
            
            {slugError && !errors.custom_slug && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                This URL is already taken
              </p>
            )}
            
            {isSlugAvailable === true && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                This URL is available
              </p>
            )}
            
            {/* Slug Suggestions */}
            {slugSuggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-2">Available alternatives:</p>
                <div className="flex flex-wrap gap-2">
                  {slugSuggestions.slice(0, 5).map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          </div>
          
          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Brief description for search engines and social media..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              This will be used for SEO meta description
            </p>
          </div>
          
          {/* URL Preview */}
          {previewURL && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">URL Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border text-purple-600 font-medium">
                  {previewURL}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyURL}
                  className="flex items-center gap-1"
                >
                  {copySuccess ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copySuccess ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(previewURL, '_blank')}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </Button>
              </div>
            </div>
          )}
          
          {/* Advanced Options */}
          <div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center gap-2 text-sm"
            >
              <Settings className="w-4 h-4" />
              Advanced Options
              {showAdvancedOptions ? '▼' : '▶'}
            </Button>
            
            {showAdvancedOptions && (
              <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-200">
                {/* SEO Optimization */}
                <div className="flex items-center gap-3">
                  <input
                    {...register('enable_seo')}
                    type="checkbox"
                    id="enable_seo"
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="enable_seo" className="text-sm font-medium text-gray-700">
                    Enable SEO Optimization
                  </label>
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 ml-7">
                  Optimizes meta tags, Open Graph data, and structured markup for search engines
                </p>
                
                {/* Analytics */}
                <div className="flex items-center gap-3">
                  <input
                    {...register('enable_analytics')}
                    type="checkbox"
                    id="enable_analytics"
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="enable_analytics" className="text-sm font-medium text-gray-700">
                    Enable Analytics Tracking
                  </label>
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 ml-7">
                  Track page visits, user interactions, and engagement metrics
                </p>
                
                {/* Password Protection */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      {...register('password_protected')}
                      type="checkbox"
                      id="password_protected"
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="password_protected" className="text-sm font-medium text-gray-700">
                      Password Protection
                    </label>
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  {watchedPasswordProtected && (
                    <div className="ml-7">
                      <input
                        {...register('password')}
                        type="password"
                        placeholder="Enter password (min 6 characters)"
                        className={`w-full max-w-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.password && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.password.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        Guests will need this password to view the invitation
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              {generatedURL && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateQR}
                  className="flex items-center gap-2"
                >
                  <QrCode size={16} />
                  Generate QR Code
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {onCancel && (
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={!isValid || generateURL.isPending || (watchedSlug && !isSlugAvailable)}
                className="flex items-center gap-2"
              >
                {generateURL.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate URL
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
        
        {/* Success Message */}
        {generatedURL && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-900">URL Generated Successfully!</h4>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your invitation is now available at: 
              <a 
                href={generatedURL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium underline ml-1"
              >
                {generatedURL}
              </a>
            </p>
          </div>
        )}
        
        {/* SEO Optimizer */}
        {watch('enable_seo') && (
          <div className="mt-6">
            <SEOOptimizer
              invitationId={invitationId}
              title={watchedTitle}
              description={watch('description')}
              url={previewURL}
              className="border-t pt-6"
            />
          </div>
        )}
      </div>
    </div>
  );
}