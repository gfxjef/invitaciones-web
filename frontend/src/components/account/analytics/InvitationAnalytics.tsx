/**
 * Invitation Analytics Component
 * 
 * WHY: Provides comprehensive analytics and insights for individual
 * invitations including performance metrics, visitor behavior,
 * and engagement analysis.
 * 
 * WHAT: Detailed analytics dashboard with charts, metrics,
 * visitor insights, RSVP analysis, and performance recommendations.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Calendar,
  MapPin,
  Clock,
  Share2,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  MessageCircle,
  Heart,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { type Invitation } from '@/lib/api';

interface AnalyticsData {
  overview: {
    total_views: number;
    unique_visitors: number;
    rsvp_responses: number;
    rsvp_confirmed: number;
    rsvp_declined: number;
    shares: number;
    avg_time_on_page: number;
    bounce_rate: number;
    conversion_rate: number;
  };
  trends: {
    views_trend: { date: string; views: number }[];
    rsvp_trend: { date: string; confirmed: number; declined: number }[];
    engagement_trend: { date: string; engagement: number }[];
  };
  demographics: {
    devices: { desktop: number; mobile: number; tablet: number };
    browsers: { [key: string]: number };
    countries: { [key: string]: number };
    age_groups: { [key: string]: number };
  };
  behavior: {
    popular_sections: { section: string; views: number; time_spent: number }[];
    exit_points: { section: string; exits: number }[];
    rsvp_patterns: {
      by_time_of_day: { [key: string]: number };
      by_day_of_week: { [key: string]: number };
      response_time_avg: number;
    };
  };
  performance: {
    load_times: { avg: number; p95: number; p99: number };
    errors: number;
    uptime: number;
  };
  recommendations: {
    type: 'info' | 'warning' | 'success';
    title: string;
    description: string;
    action?: string;
  }[];
}

interface InvitationAnalyticsProps {
  invitation: Invitation;
}

// Mock analytics data
const mockAnalytics: AnalyticsData = {
  overview: {
    total_views: 234,
    unique_visitors: 189,
    rsvp_responses: 45,
    rsvp_confirmed: 38,
    rsvp_declined: 7,
    shares: 12,
    avg_time_on_page: 125,
    bounce_rate: 15,
    conversion_rate: 84
  },
  trends: {
    views_trend: [
      { date: '2024-08-13', views: 12 },
      { date: '2024-08-14', views: 18 },
      { date: '2024-08-15', views: 25 },
      { date: '2024-08-16', views: 31 },
      { date: '2024-08-17', views: 28 },
      { date: '2024-08-18', views: 35 },
      { date: '2024-08-19', views: 42 }
    ],
    rsvp_trend: [
      { date: '2024-08-13', confirmed: 2, declined: 0 },
      { date: '2024-08-14', confirmed: 4, declined: 1 },
      { date: '2024-08-15', confirmed: 7, declined: 2 },
      { date: '2024-08-16', confirmed: 12, declined: 2 },
      { date: '2024-08-17', confirmed: 8, declined: 1 },
      { date: '2024-08-18', confirmed: 15, declined: 3 },
      { date: '2024-08-19', confirmed: 18, declined: 4 }
    ],
    engagement_trend: [
      { date: '2024-08-13', engagement: 78 },
      { date: '2024-08-14', engagement: 82 },
      { date: '2024-08-15', engagement: 85 },
      { date: '2024-08-16', engagement: 89 },
      { date: '2024-08-17', engagement: 87 },
      { date: '2024-08-18', engagement: 91 },
      { date: '2024-08-19', engagement: 94 }
    ]
  },
  demographics: {
    devices: { desktop: 45, mobile: 78, tablet: 12 },
    browsers: { Chrome: 89, Safari: 34, Firefox: 8, Edge: 4 },
    countries: { 'Perú': 156, 'Estados Unidos': 23, 'Colombia': 8, 'Chile': 2 },
    age_groups: { '18-24': 34, '25-34': 67, '35-44': 45, '45-54': 23, '55+': 20 }
  },
  behavior: {
    popular_sections: [
      { section: 'Información principal', views: 234, time_spent: 45 },
      { section: 'Ubicación y horarios', views: 198, time_spent: 35 },
      { section: 'Galería de fotos', views: 167, time_spent: 89 },
      { section: 'Formulario RSVP', views: 145, time_spent: 67 }
    ],
    exit_points: [
      { section: 'Formulario RSVP', exits: 23 },
      { section: 'Información principal', exits: 15 },
      { section: 'Ubicación', exits: 12 }
    ],
    rsvp_patterns: {
      by_time_of_day: { '09:00': 3, '12:00': 8, '15:00': 12, '18:00': 15, '21:00': 7 },
      by_day_of_week: { 'Lunes': 4, 'Martes': 6, 'Miércoles': 8, 'Jueves': 7, 'Viernes': 9, 'Sábado': 8, 'Domingo': 3 },
      response_time_avg: 2.3
    }
  },
  performance: {
    load_times: { avg: 1.2, p95: 2.1, p99: 3.4 },
    errors: 2,
    uptime: 99.8
  },
  recommendations: [
    {
      type: 'success',
      title: 'Excelente tasa de conversión',
      description: 'Tu invitación tiene una tasa de confirmación del 84%, muy por encima del promedio.',
      action: 'Mantén el diseño actual'
    },
    {
      type: 'info',
      title: 'Optimizar para móvil',
      description: 'El 67% de tus visitantes usan dispositivos móviles. Considera optimizar la experiencia móvil.',
      action: 'Ver consejos de optimización'
    },
    {
      type: 'warning',
      title: 'Algunos visitantes abandonan en el RSVP',
      description: '23 visitantes salieron del formulario RSVP. Simplifica el proceso de confirmación.',
      action: 'Revisar formulario'
    }
  ]
};

export default function InvitationAnalytics({ invitation }: InvitationAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [invitation.id, dateRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await analyticsApi.getInvitationAnalytics(invitation.id, { 
      //   range: dateRange 
      // });
      // setAnalytics(response);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-PE').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'success': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <BarChart3 className="w-5 h-5 text-blue-600" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  if (isLoading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Analíticas de Invitación</h2>
            <p className="text-gray-600">{invitation.name}</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No hay datos de analíticas disponibles</p>
        <Button onClick={handleRefresh} className="mt-4">
          Cargar analíticas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analíticas de Invitación</h2>
          <p className="text-gray-600">{invitation.name}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 3 meses</option>
            <option value="all">Todo el tiempo</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Vistas totales"
          value={formatNumber(analytics.overview.total_views)}
          description={`${formatNumber(analytics.overview.unique_visitors)} visitantes únicos`}
          icon={Eye}
          iconColor="blue"
          trend={{
            value: 12,
            label: "vs. período anterior",
            positive: true,
          }}
        />
        
        <StatsCard
          title="Confirmaciones RSVP"
          value={formatNumber(analytics.overview.rsvp_confirmed)}
          description={`${formatPercentage(analytics.overview.conversion_rate)} tasa de conversión`}
          icon={Users}
          iconColor="green"
          trend={{
            value: 8,
            label: "vs. período anterior",
            positive: true,
          }}
        />
        
        <StatsCard
          title="Tiempo promedio"
          value={formatDuration(analytics.overview.avg_time_on_page)}
          description={`${formatPercentage(analytics.overview.bounce_rate)} tasa de rebote`}
          icon={Clock}
          iconColor="purple"
          trend={{
            value: 15,
            label: "vs. período anterior",
            positive: true,
          }}
        />
        
        <StatsCard
          title="Compartidas"
          value={formatNumber(analytics.overview.shares)}
          description="En redes sociales"
          icon={Share2}
          iconColor="orange"
          trend={{
            value: 5,
            label: "vs. período anterior",
            positive: false,
          }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Views Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tendencia de vistas
            </CardTitle>
            <CardDescription>
              Vistas diarias en los últimos 7 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.trends.views_trend.map((day, index) => {
                const maxViews = Math.max(...analytics.trends.views_trend.map(d => d.views));
                const height = (day.views / maxViews) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="bg-blue-500 rounded-t-sm w-full transition-all duration-500 ease-out"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    <div className="text-xs text-gray-600 text-center">
                      <div className="font-medium">{day.views}</div>
                      <div>{new Date(day.date).toLocaleDateString('es-PE', { weekday: 'short' })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* RSVP Responses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Respuestas RSVP
            </CardTitle>
            <CardDescription>
              Confirmaciones y declinaciones diarias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.trends.rsvp_trend.map((day, index) => {
                const maxRsvp = Math.max(...analytics.trends.rsvp_trend.map(d => d.confirmed + d.declined));
                const confirmedHeight = (day.confirmed / maxRsvp) * 100;
                const declinedHeight = (day.declined / maxRsvp) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col">
                      <div
                        className="bg-green-500 w-full"
                        style={{ height: `${confirmedHeight}%`, minHeight: day.confirmed > 0 ? '2px' : '0' }}
                      />
                      <div
                        className="bg-red-400 w-full"
                        style={{ height: `${declinedHeight}%`, minHeight: day.declined > 0 ? '2px' : '0' }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                      <div className="font-medium">{day.confirmed + day.declined}</div>
                      <div>{new Date(day.date).toLocaleDateString('es-PE', { weekday: 'short' })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Confirmados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span className="text-sm text-gray-600">Declinaron</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics and Behavior */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Device Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Dispositivos utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.demographics.devices).map(([device, count]) => {
                const total = Object.values(analytics.demographics.devices).reduce((a, b) => a + b, 0);
                const percentage = (count / total) * 100;
                const Icon = device === 'desktop' ? Monitor : device === 'mobile' ? Smartphone : Tablet;
                
                return (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="capitalize text-gray-900">{
                        device === 'desktop' ? 'Escritorio' : 
                        device === 'mobile' ? 'Móvil' : 'Tablet'
                      }</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                        {count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Popular Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Secciones más visitadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.behavior.popular_sections.map((section, index) => {
                const maxViews = Math.max(...analytics.behavior.popular_sections.map(s => s.views));
                const percentage = (section.views / maxViews) * 100;
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-900 font-medium">{section.section}</span>
                      <div className="text-sm text-gray-600">
                        {section.views} vistas • {formatDuration(section.time_spent)} promedio
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recomendaciones y insights
          </CardTitle>
          <CardDescription>
            Sugerencias para mejorar el rendimiento de tu invitación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getRecommendationColor(rec.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getRecommendationIcon(rec.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {rec.title}
                    </h4>
                    <p className="text-gray-700 text-sm mb-3">
                      {rec.description}
                    </p>
                    {rec.action && (
                      <Button variant="outline" size="sm">
                        {rec.action}
                        <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Rendimiento técnico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {analytics.performance.load_times.avg}s
              </div>
              <div className="text-sm text-gray-600">Tiempo de carga promedio</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatPercentage(analytics.performance.uptime)}
              </div>
              <div className="text-sm text-gray-600">Disponibilidad</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {analytics.performance.errors}
              </div>
              <div className="text-sm text-gray-600">Errores reportados</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}