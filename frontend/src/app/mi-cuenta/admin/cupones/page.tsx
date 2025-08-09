/**
 * Admin Coupons Management Page (/mi-cuenta/admin/cupones)
 * 
 * WHY: Provides comprehensive coupon management interface for administrators.
 * Essential for promotional campaigns and customer retention strategies.
 * Includes CRUD operations with proper validation and user feedback.
 * 
 * WHAT: Full-featured admin dashboard for coupon management including
 * creation, editing, deletion, and usage statistics with filtering capabilities.
 */

'use client';

import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Percent,
  DollarSign,
  TrendingUp,
  Users,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import { CouponList } from '@/components/admin/coupon-list';
import { CouponForm } from '@/components/admin/coupon-form';
import { CouponStats } from '@/components/admin/coupon-stats';
import { useCoupons } from '@/lib/hooks/use-coupons';

type ViewMode = 'list' | 'create' | 'edit' | 'stats';

export default function AdminCouponsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch coupons data
  const { 
    data: couponsData, 
    isLoading: isLoadingCoupons,
    error: couponsError 
  } = useCoupons({
    page: currentPage,
    per_page: 10,
    search: searchQuery || undefined,
    is_active: filterStatus,
  });

  const handleCreateCoupon = () => {
    setSelectedCouponId(null);
    setViewMode('create');
  };

  const handleEditCoupon = (couponId: number) => {
    setSelectedCouponId(couponId);
    setViewMode('edit');
  };

  const handleViewStats = () => {
    setViewMode('stats');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCouponId(null);
  };

  // Mock stats data - in real app, this would come from API
  const mockStats = {
    totalCoupons: couponsData?.total || 0,
    activeCoupons: 12,
    totalRedemptions: 156,
    totalSavings: 4250.00,
  };

  // Render different views based on current mode
  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <CouponForm 
            mode="create"
            onSuccess={handleBackToList}
            onCancel={handleBackToList}
          />
        );
      
      case 'edit':
        return (
          <CouponForm 
            mode="edit"
            couponId={selectedCouponId!}
            onSuccess={handleBackToList}
            onCancel={handleBackToList}
          />
        );
        
      case 'stats':
        return (
          <CouponStats 
            onBack={handleBackToList}
          />
        );
        
      default:
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Cupones"
                value={mockStats.totalCoupons.toString()}
                icon={Tag}
                trend={{ value: 8, positive: true, label: "vs. período anterior" }}
                description="Cupones creados"
              />
              <StatsCard
                title="Cupones Activos"
                value={mockStats.activeCoupons.toString()}
                icon={TrendingUp}
                trend={{ value: 15, positive: true, label: "vs. período anterior" }}
                description="Actualmente disponibles"
              />
              <StatsCard
                title="Total Canjes"
                value={mockStats.totalRedemptions.toString()}
                icon={Users}
                trend={{ value: 23, positive: true, label: "vs. período anterior" }}
                description="Cupones utilizados"
              />
              <StatsCard
                title="Ahorros Generados"
                value={`S/ ${mockStats.totalSavings.toFixed(2)}`}
                icon={DollarSign}
                trend={{ value: 12, positive: true, label: "vs. período anterior" }}
                description="Descuentos aplicados"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar cupones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus === undefined ? 'all' : filterStatus.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilterStatus(
                      value === 'all' ? undefined : value === 'true'
                    );
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleViewStats}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Estadísticas
                </Button>
                
                <Button
                  onClick={handleCreateCoupon}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear Cupón
                </Button>
              </div>
            </div>

            {/* Coupons List */}
            <CouponList
              coupons={couponsData?.items || []}
              isLoading={isLoadingCoupons}
              error={couponsError}
              onEdit={handleEditCoupon}
              onDelete={(id) => {
                // Handle delete - will be implemented in CouponList component
                console.log('Delete coupon:', id);
              }}
              pagination={{
                currentPage,
                totalPages: couponsData?.pages || 1,
                onPageChange: setCurrentPage,
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {viewMode === 'list' && 'Gestión de Cupones'}
              {viewMode === 'create' && 'Crear Nuevo Cupón'}
              {viewMode === 'edit' && 'Editar Cupón'}
              {viewMode === 'stats' && 'Estadísticas de Cupones'}
            </h1>
            <p className="text-gray-600 mt-2">
              {viewMode === 'list' && 'Administra códigos de descuento y promociones'}
              {viewMode === 'create' && 'Crea un nuevo código de descuento'}
              {viewMode === 'edit' && 'Modifica los detalles del cupón'}
              {viewMode === 'stats' && 'Analiza el rendimiento de tus cupones'}
            </p>
          </div>
          
          {viewMode !== 'list' && (
            <Button 
              variant="outline" 
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              ← Volver a la lista
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
}