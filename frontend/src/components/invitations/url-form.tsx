/**
 * URL Form Component
 * 
 * WHY: Provides form interface for creating and editing invitation URLs.
 * Includes validation, plan limit checking, and user-friendly error handling.
 * 
 * WHAT: Form component with title and URL validation, plan restriction
 * messaging, and optimistic UI updates for better user experience.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Link2, 
  AlertCircle, 
  Info, 
  X,
  Loader2,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  useCreateInvitationURL, 
  useUpdateInvitationURL,
  useURLCreationValidation 
} from '@/lib/hooks/use-invitation-urls';
import { InvitationURL, CreateInvitationURLRequest } from '@/lib/api';

// Form validation schema
const urlFormSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres'),
  original_url: z
    .string()
    .min(1, 'La URL es requerida')
    .url('La URL debe tener un formato válido')
    .refine(
      (url) => {
        try {
          const urlObj = new URL(url);
          return ['http:', 'https:'].includes(urlObj.protocol);
        } catch {
          return false;
        }
      },
      'La URL debe comenzar con http:// o https://'
    ),
});

type URLFormData = z.infer<typeof urlFormSchema>;

interface URLFormProps {
  invitationId: number;
  url?: InvitationURL;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (url: InvitationURL) => void;
}

export function URLForm({ 
  invitationId, 
  url, 
  isOpen, 
  onClose, 
  onSuccess 
}: URLFormProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const isEditing = !!url;
  const createURL = useCreateInvitationURL();
  const updateURL = useUpdateInvitationURL();
  const { canCreate, userPlan, currentCount, isLoading: validationLoading } = 
    useURLCreationValidation(invitationId);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    reset,
    setValue,
  } = useForm<URLFormData>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      title: url?.title || '',
      original_url: url?.original_url || '',
    },
    mode: 'onChange',
  });

  const watchedUrl = watch('original_url');
  const watchedTitle = watch('title');

  useEffect(() => {
    if (isOpen) {
      if (url) {
        reset({
          title: url.title,
          original_url: url.original_url,
        });
      } else {
        reset({
          title: '',
          original_url: '',
        });
      }
    }
  }, [isOpen, url, reset]);

  const isSubmitting = createURL.isPending || updateURL.isPending;

  const onSubmit = async (data: URLFormData) => {
    try {
      if (isEditing && url) {
        const updatedUrl = await updateURL.mutateAsync({
          id: url.id,
          data: {
            title: data.title,
            original_url: data.original_url,
          },
        });
        onSuccess?.(updatedUrl);
      } else {
        const newUrl = await createURL.mutateAsync({
          invitation_id: invitationId,
          title: data.title,
          original_url: data.original_url,
        });
        onSuccess?.(newUrl);
      }
      handleClose();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Form submission error:', error);
    }
  };

  const handleClose = () => {
    reset();
    setIsPreviewMode(false);
    onClose();
  };

  const generateTitleFromURL = () => {
    if (watchedUrl) {
      try {
        const urlObj = new URL(watchedUrl);
        const hostname = urlObj.hostname.replace('www.', '');
        const suggestedTitle = hostname.charAt(0).toUpperCase() + hostname.slice(1);
        setValue('title', suggestedTitle, { shouldValidate: true });
      } catch {
        // Invalid URL, do nothing
      }
    }
  };

  const testURL = () => {
    if (watchedUrl && watchedUrl.match(/^https?:\/\/.+/)) {
      window.open(watchedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link2 className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Editar URL única' : 'Crear nueva URL única'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isEditing 
                    ? 'Modifica los detalles de tu URL única' 
                    : 'Crea una URL personalizada para compartir tu invitación'
                  }
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plan Validation Warning */}
          {!isEditing && validationLoading && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-600">Verificando límites del plan...</span>
              </div>
            </div>
          )}

          {!isEditing && !validationLoading && !canCreate.allowed && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Límite de URLs alcanzado
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {canCreate.reason}
                  </p>
                  {userPlan && (
                    <p className="text-xs text-red-600 mt-2">
                      Plan actual: {userPlan.name} - {userPlan.max_urls_per_invitation} URL{userPlan.max_urls_per_invitation > 1 ? 's' : ''} por invitación
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isEditing && !validationLoading && canCreate.allowed && userPlan && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Plan {userPlan.name}
                  </p>
                  <p className="text-sm text-blue-700">
                    {canCreate.reason} ({currentCount}/{userPlan.max_urls_per_invitation} utilizadas)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la URL *
              </label>
              <div className="space-y-2">
                <input
                  {...register('title')}
                  type="text"
                  placeholder="ej. Invitación Familia García"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {watchedUrl && !watchedTitle && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateTitleFromURL}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Generar título desde URL
                  </Button>
                )}
                {errors.title && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  El título te ayudará a identificar esta URL. Será visible en tu dashboard.
                </p>
              </div>
            </div>

            {/* Original URL Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de destino *
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    {...register('original_url')}
                    type="url"
                    placeholder="https://ejemplo.com/mi-invitacion"
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.original_url ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {watchedUrl && isValid && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={testURL}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Probar
                    </Button>
                  )}
                </div>
                {errors.original_url && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.original_url.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  La URL a la que se redirigirá cuando alguien acceda al enlace corto.
                </p>
              </div>
            </div>

            {/* Preview */}
            {isValid && watchedTitle && watchedUrl && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Vista previa</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Título:</p>
                    <p className="text-sm text-gray-900">{watchedTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">URL corta (se generará):</p>
                    <p className="text-sm font-mono text-purple-600">
                      {process.env.NEXT_PUBLIC_BASE_URL || 'https://graphica.pe'}/r/[código-único]
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Redirige a:</p>
                    <p className="text-sm text-gray-900 break-all">{watchedUrl}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            <div className="flex items-center gap-3">
              {isDirty && (
                <span className="text-sm text-gray-600">Cambios sin guardar</span>
              )}
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={
                  !isValid || 
                  isSubmitting || 
                  (!isEditing && !canCreate.allowed) ||
                  validationLoading
                }
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    {isEditing ? 'Actualizar URL' : 'Crear URL'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Quick URL Creation Component
 * 
 * WHY: Provides streamlined URL creation for common use cases.
 * Reduces friction for users who want to quickly create URLs.
 */
interface QuickURLFormProps {
  invitationId: number;
  onSuccess?: (url: InvitationURL) => void;
  className?: string;
}

export function QuickURLForm({ 
  invitationId, 
  onSuccess, 
  className = '' 
}: QuickURLFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const createURL = useCreateInvitationURL();
  const { canCreate } = useURLCreationValidation(invitationId);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<URLFormData>({
    resolver: zodResolver(urlFormSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: URLFormData) => {
    try {
      const newUrl = await createURL.mutateAsync({
        invitation_id: invitationId,
        title: data.title,
        original_url: data.original_url,
      });
      onSuccess?.(newUrl);
      reset();
      setIsExpanded(false);
    } catch (error) {
      console.error('Quick form submission error:', error);
    }
  };

  if (!canCreate.allowed) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-sm text-red-700">{canCreate.reason}</p>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <div className={className}>
        <Button
          onClick={() => setIsExpanded(true)}
          className="w-full"
        >
          <Link2 className="w-4 h-4 mr-2" />
          Crear URL rápida
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Crear URL rápida</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsExpanded(false);
            reset();
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('title')}
            type="text"
            placeholder="Título de la URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          {errors.title && (
            <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('original_url')}
            type="url"
            placeholder="https://ejemplo.com/mi-invitacion"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          {errors.original_url && (
            <p className="text-xs text-red-600 mt-1">{errors.original_url.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={!isValid || createURL.isPending}
          className="w-full"
        >
          {createURL.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear URL'
          )}
        </Button>
      </form>
    </div>
  );
}