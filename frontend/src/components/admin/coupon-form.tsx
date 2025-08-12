/**
 * CouponForm Component
 * 
 * WHY: Provides a comprehensive form interface for creating and editing coupons.
 * Includes validation, real-time preview, and user-friendly error handling.
 * Critical for admin workflow efficiency and preventing data entry errors.
 * 
 * WHAT: Multi-section form with validation, date pickers, and live preview
 * of coupon settings. Handles both create and edit modes with proper state management.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar,
  Percent,
  DollarSign,
  Users,
  Eye,
  EyeOff,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreateCoupon, useUpdateCoupon, useCoupon } from '@/lib/hooks/use-coupons';
import { CreateCouponRequest } from '@/lib/api';

// Form validation schema
const couponFormSchema = z.object({
  code: z.string()
    .min(3, 'Código debe tener al menos 3 caracteres')
    .max(20, 'Código no puede tener más de 20 caracteres')
    .regex(/^[A-Z0-9]+$/, 'Solo letras mayúsculas y números permitidos'),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], {
    required_error: 'Tipo de descuento requerido'
  }),
  value: z.number()
    .positive('Valor debe ser positivo')
    .max(100, 'Valor no puede ser mayor a 100 para porcentajes'),
  valid_from: z.string().min(1, 'Fecha de inicio requerida'),
  valid_until: z.string().min(1, 'Fecha de fin requerida'),
  usage_limit: z.number().min(0, 'Límite debe ser 0 o mayor').optional(),
  min_order_amount: z.number().min(0, 'Monto mínimo debe ser 0 o mayor').optional(),
  is_active: z.boolean().default(true),
}).refine((data) => {
  // Validate percentage values
  if (data.type === 'PERCENTAGE' && data.value > 100) {
    return false;
  }
  return true;
}, {
  message: 'Porcentaje no puede ser mayor a 100%',
  path: ['value'],
}).refine((data) => {
  // Validate date range
  const validFrom = new Date(data.valid_from);
  const validUntil = new Date(data.valid_until);
  return validUntil > validFrom;
}, {
  message: 'Fecha de fin debe ser posterior a fecha de inicio',
  path: ['valid_until'],
});

type CouponFormData = z.infer<typeof couponFormSchema>;

interface CouponFormProps {
  mode: 'create' | 'edit';
  couponId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CouponForm({ mode, couponId, onSuccess, onCancel }: CouponFormProps) {
  const [showPreview, setShowPreview] = useState(true);

  // Hooks
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const { data: existingCoupon, isLoading: isLoadingCoupon } = useCoupon(couponId || 0);

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'PERCENTAGE',
      value: 10,
      usage_limit: 0,
      min_order_amount: 0,
      is_active: true,
    },
  });

  // Watch form values for live preview
  const watchedValues = watch();

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && existingCoupon) {
      reset({
        code: existingCoupon.code,
        type: existingCoupon.type,
        value: existingCoupon.value,
        valid_from: existingCoupon.valid_from.split('T')[0], // Convert to date input format
        valid_until: existingCoupon.valid_until.split('T')[0],
        usage_limit: existingCoupon.usage_limit,
        min_order_amount: existingCoupon.min_order_amount,
        is_active: existingCoupon.is_active,
      });
    }
  }, [existingCoupon, mode, reset]);

  // Generate random coupon code
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('code', result);
  };

  // Set default dates (today and 30 days from now)
  const setDefaultDates = useCallback(() => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 30);

    setValue('valid_from', today.toISOString().split('T')[0]);
    setValue('valid_until', futureDate.toISOString().split('T')[0]);
  }, [setValue]);

  // Initialize default values for create mode
  useEffect(() => {
    if (mode === 'create') {
      setDefaultDates();
    }
  }, [mode, setDefaultDates]);

  const onSubmit = async (data: CouponFormData) => {
    try {
      const payload: CreateCouponRequest = {
        code: data.code,
        type: data.type,
        value: data.value,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        usage_limit: data.usage_limit || 0,
        min_order_amount: data.min_order_amount || 0,
        is_active: data.is_active,
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
      } else if (couponId) {
        await updateMutation.mutateAsync({ id: couponId, data: payload });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (mode === 'edit' && isLoadingCoupon) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Cargando cupón...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Información del Cupón
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Completa todos los campos requeridos para {mode === 'create' ? 'crear' : 'editar'} el cupón
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código del Cupón *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    {...register('code')}
                    placeholder="DESCUENTO20"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    style={{ textTransform: 'uppercase' }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generateCode}
                  >
                    Generar
                  </Button>
                </div>
                {errors.code && (
                  <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Descuento *
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="PERCENTAGE">Porcentaje</option>
                  <option value="FIXED_AMOUNT">Cantidad Fija</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                )}
              </div>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor del Descuento *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {watchedValues.type === 'PERCENTAGE' ? (
                    <Percent className="w-4 h-4 text-gray-400" />
                  ) : (
                    <span className="text-gray-400">S/</span>
                  )}
                </div>
                <input
                  type="number"
                  step="0.01"
                  {...register('value', { valueAsNumber: true })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={watchedValues.type === 'PERCENTAGE' ? '10' : '25.00'}
                />
              </div>
              {errors.value && (
                <p className="text-red-500 text-sm mt-1">{errors.value.message}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Válido Desde *
                </label>
                <input
                  type="date"
                  {...register('valid_from')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.valid_from && (
                  <p className="text-red-500 text-sm mt-1">{errors.valid_from.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Válido Hasta *
                </label>
                <input
                  type="date"
                  {...register('valid_until')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.valid_until && (
                  <p className="text-red-500 text-sm mt-1">{errors.valid_until.message}</p>
                )}
              </div>
            </div>

            {/* Usage Limits */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Límite de Usos
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('usage_limit', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0 = Ilimitado"
                />
                {errors.usage_limit && (
                  <p className="text-red-500 text-sm mt-1">{errors.usage_limit.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pedido Mínimo (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('min_order_amount', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.min_order_amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.min_order_amount.message}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="mr-3 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Cupón activo
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Los cupones inactivos no pueden ser utilizados por los clientes
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {mode === 'create' ? 'Creando...' : 'Guardando...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {mode === 'create' ? 'Crear Cupón' : 'Guardar Cambios'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border sticky top-6">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Vista Previa</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-4">
              {/* Coupon Preview Card */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border-2 border-dashed border-purple-300">
                <div className="text-center">
                  <Tag className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h5 className="font-bold text-lg text-purple-900">
                    {watchedValues.code || 'CÓDIGO'}
                  </h5>
                  <p className="text-purple-700 font-medium">
                    {watchedValues.type === 'PERCENTAGE' 
                      ? `${watchedValues.value || 0}% de descuento`
                      : `S/ ${(watchedValues.value || 0).toFixed(2)} de descuento`
                    }
                  </p>
                  {(watchedValues.min_order_amount ?? 0) > 0 && (
                    <p className="text-sm text-purple-600 mt-2">
                      Pedido mínimo: S/ {(watchedValues.min_order_amount ?? 0).toFixed(2)}
                    </p>
                  )}
                  <div className="mt-3 pt-3 border-t border-purple-300">
                    <p className="text-xs text-purple-600">
                      Válido: {watchedValues.valid_from} - {watchedValues.valid_until}
                    </p>
                    {(watchedValues.usage_limit ?? 0) > 0 && (
                      <p className="text-xs text-purple-600">
                        Límite: {watchedValues.usage_limit ?? 0} usos
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={watchedValues.is_active ? "default" : "secondary"} 
                    className="mt-2"
                  >
                    {watchedValues.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {watchedValues.type === 'PERCENTAGE' ? 'Descuento porcentual' : 'Descuento fijo'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                  Vigencia configurada
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 text-orange-500 mr-2" />
                  {(watchedValues.usage_limit ?? 0) > 0 
                    ? `${watchedValues.usage_limit ?? 0} usos máximos`
                    : 'Usos ilimitados'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show preview button when hidden */}
      {!showPreview && (
        <div className="lg:col-span-1">
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="w-full flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Mostrar Vista Previa
          </Button>
        </div>
      )}
    </div>
  );
}