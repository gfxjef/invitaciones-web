/**
 * CouponList Component
 * 
 * WHY: Provides a comprehensive table view of all coupons with sorting,
 * filtering, and action capabilities. Essential for admin oversight
 * and bulk operations on coupon data.
 * 
 * WHAT: Responsive table with coupon details, status badges, usage statistics,
 * and action buttons. Includes pagination and loading states.
 */

'use client';

import { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Calendar,
  Percent,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeleteCoupon } from '@/lib/hooks/use-coupons';
import { Coupon } from '@/lib/api';
import toast from 'react-hot-toast';

interface CouponListProps {
  coupons: Coupon[];
  isLoading: boolean;
  error: any;
  onEdit: (couponId: number) => void;
  onDelete: (couponId: number) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function CouponList({ 
  coupons, 
  isLoading, 
  error, 
  onEdit, 
  onDelete, 
  pagination 
}: CouponListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  
  const deleteMutation = useDeleteCoupon();

  const handleDeleteConfirm = async (couponId: number) => {
    setDeletingId(couponId);
    try {
      await deleteMutation.mutateAsync(couponId);
      onDelete(couponId);
    } catch (error) {
      console.error('Error deleting coupon:', error);
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (!coupon.is_active) {
      return { label: 'Inactivo', variant: 'secondary' as const, icon: Clock };
    }
    
    if (now < validFrom) {
      return { label: 'Programado', variant: 'default' as const, icon: Clock };
    }
    
    if (now > validUntil) {
      return { label: 'Expirado', variant: 'destructive' as const, icon: AlertCircle };
    }
    
    if (coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) {
      return { label: 'Agotado', variant: 'destructive' as const, icon: AlertCircle };
    }

    return { label: 'Activo', variant: 'default' as const, icon: CheckCircle };
  };

  const formatCouponValue = (coupon: Coupon) => {
    if (coupon.type === 'PERCENTAGE') {
      return `${coupon.value}%`;
    } else {
      return `S/ ${coupon.value.toFixed(2)}`;
    }
  };

  const calculateUsagePercentage = (coupon: Coupon) => {
    if (coupon.usage_limit === 0) return 0; // Unlimited
    return (coupon.usage_count / coupon.usage_limit) * 100;
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar cupones
          </h3>
          <p className="text-gray-600">
            Hubo un problema al cargar la lista de cupones. Intenta recargar la página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900">Lista de Cupones</h3>
        <p className="text-sm text-gray-600 mt-1">
          {isLoading ? 'Cargando...' : `${coupons.length} cupones encontrados`}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && coupons.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Percent className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay cupones
          </h3>
          <p className="text-gray-600">
            Comienza creando tu primer código de descuento.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && coupons.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descuento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Válido hasta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  const usagePercentage = calculateUsagePercentage(coupon);

                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            {coupon.type === 'PERCENTAGE' ? (
                              <Percent className="w-5 h-5 text-purple-600" />
                            ) : (
                              <DollarSign className="w-5 h-5 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {coupon.code}
                            </div>
                            {coupon.min_order_amount > 0 && (
                              <div className="text-xs text-gray-500">
                                Mín: S/ {coupon.min_order_amount.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCouponValue(coupon)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {coupon.type === 'PERCENTAGE' ? 'Porcentual' : 'Fijo'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(coupon.valid_until)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Desde {formatDate(coupon.valid_from)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usage_count}
                          {coupon.usage_limit > 0 && ` / ${coupon.usage_limit}`}
                        </div>
                        {coupon.usage_limit > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-purple-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(coupon.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(coupon.id)}
                            disabled={deletingId === coupon.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deletingId === coupon.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {pagination.currentPage} de {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Eliminar Cupón
                </h3>
                <p className="text-sm text-gray-600">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar el cupón{' '}
              <strong>
                {coupons.find(c => c.id === showDeleteConfirm)?.code}
              </strong>
              ? Esto eliminará permanentemente el cupón y ya no podrá ser utilizado.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                disabled={deletingId === showDeleteConfirm}
              >
                {deletingId === showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Eliminando...
                  </div>
                ) : (
                  'Eliminar'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}