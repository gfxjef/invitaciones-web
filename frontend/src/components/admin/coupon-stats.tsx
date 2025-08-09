/**
 * CouponStats Component
 * 
 * WHY: Provides comprehensive analytics and insights about coupon performance.
 * Essential for measuring campaign effectiveness, understanding customer
 * behavior, and optimizing discount strategies for better ROI.
 * 
 * WHAT: Interactive dashboard with charts, metrics, and detailed breakdowns
 * of coupon usage, conversion rates, and revenue impact.
 */

'use client';

import { useState } from 'react';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Users,
  Calendar,
  Tag,
  Eye,
  BarChart3,
  PieChart,
  Filter,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import { useCoupons } from '@/lib/hooks/use-coupons';

interface CouponStatsProps {
  onBack: () => void;
}

export function CouponStats({ onBack }: CouponStatsProps) {
  const [dateRange, setDateRange] = useState('last_30_days');
  const [selectedMetric, setSelectedMetric] = useState('usage');

  // Fetch coupons for statistics - in real app this would be a dedicated stats endpoint
  const { data: couponsData, isLoading } = useCoupons({ per_page: 100 });

  // Mock statistics data - in real app, this would come from analytics API
  const mockStats = {
    overview: {
      totalCoupons: couponsData?.total || 0,
      activeCoupons: 15,
      totalRedemptions: 234,
      conversionRate: 12.5,
      totalSavings: 8450.00,
      averageDiscount: 18.5,
      topPerformingCoupon: 'BIENVENIDO20',
      revenueImpact: -2150.00, // Negative because it's discount given
    },
    chartData: {
      dailyUsage: [
        { date: '2024-01-01', usage: 12, revenue: 450 },
        { date: '2024-01-02', usage: 8, revenue: 320 },
        { date: '2024-01-03', usage: 15, revenue: 680 },
        { date: '2024-01-04', usage: 22, revenue: 890 },
        { date: '2024-01-05', usage: 18, revenue: 720 },
        { date: '2024-01-06', usage: 25, revenue: 1200 },
        { date: '2024-01-07', usage: 19, revenue: 850 },
      ],
      topCoupons: [
        { code: 'BIENVENIDO20', usage: 45, savings: 1250.00, conversionRate: 15.2 },
        { code: 'VERANO15', usage: 38, savings: 980.50, conversionRate: 12.8 },
        { code: 'PRIMERACOMPRA', usage: 32, savings: 850.00, conversionRate: 18.5 },
        { code: 'ESTUDIANTE10', usage: 28, savings: 420.00, conversionRate: 9.3 },
        { code: 'NAVIDAD25', usage: 24, savings: 1800.00, conversionRate: 22.1 },
      ],
      categoryBreakdown: [
        { type: 'PERCENTAGE', count: 12, totalSavings: 4200.00 },
        { type: 'FIXED_AMOUNT', count: 8, totalSavings: 4250.00 },
      ],
    },
    trends: {
      usageChange: 18.5,
      revenueChange: -5.2,
      conversionChange: 12.3,
      newCouponsCreated: 3,
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Estadísticas de Cupones
            </h2>
            <p className="text-gray-600">
              Análisis detallado del rendimiento de cupones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="last_7_days">Últimos 7 días</option>
            <option value="last_30_days">Últimos 30 días</option>
            <option value="last_90_days">Últimos 90 días</option>
            <option value="last_year">Último año</option>
          </select>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Cupones Utilizados"
          value={mockStats.overview.totalRedemptions.toString()}
          icon={Tag}
          trend={{ 
            value: mockStats.trends.usageChange, 
            positive: mockStats.trends.usageChange > 0,
            label: "vs. período anterior" 
          }}
          description="vs. período anterior"
        />
        
        <StatsCard
          title="Tasa de Conversión"
          value={formatPercentage(mockStats.overview.conversionRate)}
          icon={TrendingUp}
          trend={{ 
            value: mockStats.trends.conversionChange, 
            positive: mockStats.trends.conversionChange > 0,
            label: "vs. período anterior" 
          }}
          description="de usuarios que usan cupones"
        />
        
        <StatsCard
          title="Ahorro Total"
          value={formatCurrency(mockStats.overview.totalSavings)}
          icon={DollarSign}
          trend={{ 
            value: Math.abs(mockStats.trends.revenueChange), 
            positive: false,
            label: "descuentos aplicados" 
          }}
          description="descuentos aplicados"
        />
        
        <StatsCard
          title="Descuento Promedio"
          value={formatPercentage(mockStats.overview.averageDiscount)}
          icon={Percent}
          trend={{ value: 2.1, positive: true, label: "vs. período anterior" }}
          description="por cupón utilizado"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Uso Diario de Cupones</h3>
              <div className="flex items-center gap-2">
                <button
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedMetric === 'usage' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedMetric('usage')}
                >
                  Uso
                </button>
                <button
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedMetric === 'revenue' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedMetric('revenue')}
                >
                  Ahorros
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Simple bar chart representation */}
            <div className="h-64 flex items-end justify-between gap-2">
              {mockStats.chartData.dailyUsage.map((day, index) => {
                const maxValue = Math.max(
                  ...mockStats.chartData.dailyUsage.map(d => 
                    selectedMetric === 'usage' ? d.usage : d.revenue
                  )
                );
                const value = selectedMetric === 'usage' ? day.usage : day.revenue;
                const height = (value / maxValue) * 100;
                
                return (
                  <div key={day.date} className="flex flex-col items-center flex-1">
                    <div className="text-xs text-gray-600 mb-2">
                      {selectedMetric === 'usage' ? value : formatCurrency(value)}
                    </div>
                    <div
                      className="bg-purple-600 rounded-t min-h-[4px] w-full"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(day.date).toLocaleDateString('es', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Performing Coupons */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Cupones Top</h3>
            <p className="text-sm text-gray-600">Por número de usos</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockStats.chartData.topCoupons.map((coupon, index) => (
                <div key={coupon.code} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {coupon.code}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatPercentage(coupon.conversionRate)} conversión
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 text-sm">
                      {coupon.usage}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(coupon.savings)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Coupon Types Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Tipos de Cupones</h3>
            <p className="text-sm text-gray-600">Distribución por tipo de descuento</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockStats.chartData.categoryBreakdown.map((category) => (
                <div key={category.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-600 rounded"></div>
                    <span className="text-gray-700">
                      {category.type === 'PERCENTAGE' ? 'Porcentual' : 'Cantidad Fija'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {category.count} cupones
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(category.totalSavings)} ahorrados
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Actividad Reciente</h3>
            <p className="text-sm text-gray-600">Eventos importantes del período</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    Mejor día de conversión
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatPercentage(22.1)} el 25 de enero
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Tag className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    Cupón más popular
                  </div>
                  <div className="text-sm text-gray-600">
                    {mockStats.overview.topPerformingCoupon} con 45 usos
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    Nuevos cupones
                  </div>
                  <div className="text-sm text-gray-600">
                    {mockStats.trends.newCouponsCreated} creados este período
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border">
        <h3 className="font-semibold text-gray-900 mb-3">Resumen del Período</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Cupones más efectivos:</span>
            <div className="font-medium text-gray-900">
              Los de tipo porcentual con 15-25% de descuento
            </div>
          </div>
          <div>
            <span className="text-gray-600">Mejor día:</span>
            <div className="font-medium text-gray-900">
              Sábados con 35% más actividad
            </div>
          </div>
          <div>
            <span className="text-gray-600">Oportunidad:</span>
            <div className="font-medium text-gray-900">
              Incrementar cupones de primera compra
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}