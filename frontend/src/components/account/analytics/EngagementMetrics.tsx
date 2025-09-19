/**
 * Engagement Metrics Component
 * 
 * WHY: Provides real-time engagement monitoring and user behavior
 * analysis for invitations with actionable insights and trends.
 * 
 * WHAT: Comprehensive engagement dashboard with real-time metrics,
 * user interaction tracking, and behavioral analytics.
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Activity,
  Users,
  Clock,
  MousePointer2,
  Heart,
  Share2,
  MessageSquare,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Smartphone,
  Monitor,
  Globe,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EngagementData {
  realtime: {
    active_visitors: number;
    current_page_views: number;
    avg_session_duration: number;
    bounce_rate: number;
    interactions_per_session: number;
  };
  interactions: {
    total_clicks: number;
    gallery_views: number;
    rsvp_starts: number;
    rsvp_completions: number;
    shares: number;
    saves: number;
    comments: number;
    reactions: { type: string; count: number }[];
  };
  heatmap: {
    sections: {
      name: string;
      clicks: number;
      time_spent: number;
      scroll_depth: number;
      interaction_rate: number;
    }[];
    popular_actions: {
      action: string;
      count: number;
      conversion_rate: number;
    }[];
  };
  user_journey: {
    entry_points: { source: string; visitors: number; conversion: number }[];
    exit_points: { page: string; exits: number; percentage: number }[];
    conversion_funnel: {
      step: string;
      visitors: number;
      conversion_rate: number;
      drop_off: number;
    }[];
  };
  temporal_patterns: {
    hourly_activity: { hour: number; engagement: number }[];
    daily_patterns: { day: string; peak_hour: number; avg_engagement: number }[];
    peak_times: {
      highest_engagement: { time: string; value: number };
      lowest_engagement: { time: string; value: number };
    };
  };
  audience_insights: {
    returning_visitors: number;
    new_visitors: number;
    session_frequency: { sessions: string; count: number }[];
    engagement_segments: {
      highly_engaged: number;
      moderately_engaged: number;
      low_engaged: number;
    };
  };
}

interface EngagementMetricsProps {
  invitationId: number;
  realTimeEnabled?: boolean;
}

// Mock engagement data
const mockEngagementData: EngagementData = {
  realtime: {
    active_visitors: 12,
    current_page_views: 23,
    avg_session_duration: 142,
    bounce_rate: 15.7,
    interactions_per_session: 4.2
  },
  interactions: {
    total_clicks: 567,
    gallery_views: 234,
    rsvp_starts: 89,
    rsvp_completions: 67,
    shares: 23,
    saves: 45,
    comments: 12,
    reactions: [
      { type: 'love', count: 89 },
      { type: 'like', count: 156 },
      { type: 'excited', count: 34 },
      { type: 'congratulations', count: 67 }
    ]
  },
  heatmap: {
    sections: [
      { name: 'Información principal', clicks: 234, time_spent: 45, scroll_depth: 95, interaction_rate: 78 },
      { name: 'Galería de fotos', clicks: 189, time_spent: 89, scroll_depth: 87, interaction_rate: 65 },
      { name: 'Formulario RSVP', clicks: 156, time_spent: 67, scroll_depth: 92, interaction_rate: 43 },
      { name: 'Ubicación', clicks: 134, time_spent: 34, scroll_depth: 76, interaction_rate: 56 },
      { name: 'Cronograma', clicks: 98, time_spent: 28, scroll_depth: 68, interaction_rate: 34 }
    ],
    popular_actions: [
      { action: 'Ver galería completa', count: 89, conversion_rate: 23 },
      { action: 'Confirmar asistencia', count: 67, conversion_rate: 78 },
      { action: 'Compartir invitación', count: 23, conversion_rate: 12 },
      { action: 'Descargar información', count: 15, conversion_rate: 8 }
    ]
  },
  user_journey: {
    entry_points: [
      { source: 'Directo', visitors: 123, conversion: 78 },
      { source: 'WhatsApp', visitors: 89, conversion: 85 },
      { source: 'Facebook', visitors: 45, conversion: 67 },
      { source: 'Instagram', visitors: 34, conversion: 72 }
    ],
    exit_points: [
      { page: 'Formulario RSVP', exits: 23, percentage: 15.6 },
      { page: 'Página principal', exits: 18, percentage: 12.2 },
      { page: 'Galería', exits: 12, percentage: 8.1 }
    ],
    conversion_funnel: [
      { step: 'Visita inicial', visitors: 234, conversion_rate: 100, drop_off: 0 },
      { step: 'Navegación activa', visitors: 198, conversion_rate: 84.6, drop_off: 36 },
      { step: 'Interacción con contenido', visitors: 156, conversion_rate: 66.7, drop_off: 42 },
      { step: 'Inicio RSVP', visitors: 89, conversion_rate: 38.0, drop_off: 67 },
      { step: 'Completar RSVP', visitors: 67, conversion_rate: 28.6, drop_off: 22 }
    ]
  },
  temporal_patterns: {
    hourly_activity: [
      { hour: 9, engagement: 45 }, { hour: 10, engagement: 52 }, { hour: 11, engagement: 67 },
      { hour: 12, engagement: 78 }, { hour: 13, engagement: 89 }, { hour: 14, engagement: 76 },
      { hour: 15, engagement: 93 }, { hour: 16, engagement: 85 }, { hour: 17, engagement: 72 },
      { hour: 18, engagement: 94 }, { hour: 19, engagement: 87 }, { hour: 20, engagement: 69 },
      { hour: 21, engagement: 58 }, { hour: 22, engagement: 34 }
    ],
    daily_patterns: [
      { day: 'Lunes', peak_hour: 15, avg_engagement: 67 },
      { day: 'Martes', peak_hour: 18, avg_engagement: 72 },
      { day: 'Miércoles', peak_hour: 14, avg_engagement: 69 },
      { day: 'Jueves', peak_hour: 16, avg_engagement: 74 },
      { day: 'Viernes', peak_hour: 19, avg_engagement: 81 },
      { day: 'Sábado', peak_hour: 11, avg_engagement: 78 },
      { day: 'Domingo', peak_hour: 16, avg_engagement: 65 }
    ],
    peak_times: {
      highest_engagement: { time: 'Viernes 7:00 PM', value: 94 },
      lowest_engagement: { time: 'Lunes 9:00 AM', value: 34 }
    }
  },
  audience_insights: {
    returning_visitors: 89,
    new_visitors: 145,
    session_frequency: [
      { sessions: '1 sesión', count: 145 },
      { sessions: '2-3 sesiones', count: 67 },
      { sessions: '4-10 sesiones', count: 18 },
      { sessions: '10+ sesiones', count: 4 }
    ],
    engagement_segments: {
      highly_engaged: 67,
      moderately_engaged: 123,
      low_engaged: 44
    }
  }
};

export default function EngagementMetrics({ 
  invitationId, 
  realTimeEnabled = true 
}: EngagementMetricsProps) {
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveUpdates, setLiveUpdates] = useState(realTimeEnabled);

  useEffect(() => {
    loadEngagementData();
    
    // Set up real-time updates if enabled
    let interval: NodeJS.Timeout;
    if (liveUpdates) {
      interval = setInterval(loadEngagementData, 30000); // Update every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [invitationId, liveUpdates]);

  const loadEngagementData = async () => {
    if (!engagementData) setIsLoading(true);
    
    try {
      // TODO: Replace with real API call
      // const response = await analyticsApi.getEngagementMetrics(invitationId);
      // setEngagementData(response);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setEngagementData(mockEngagementData);
    } catch (error) {
      console.error('Error loading engagement data:', error);
    } finally {
      setIsLoading(false);
    }
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

  const getEngagementColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReactionEmoji = (type: string) => {
    switch (type) {
      case 'love': return '❤️';
      case 'like': return '👍';
      case 'excited': return '🎉';
      case 'congratulations': return '🎊';
      default: return '😊';
    }
  };

  if (isLoading && !engagementData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Métricas de engagement</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!engagementData) return null;

  return (
    <div className="space-y-8">
      {/* Header with Real-time Toggle */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Métricas de engagement
            {liveUpdates && (
              <Badge className="bg-green-100 text-green-800 border-green-200 animate-pulse">
                En vivo
              </Badge>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            Análisis detallado de la interacción de usuarios en tiempo real
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLiveUpdates(!liveUpdates)}
            className={liveUpdates ? 'bg-green-50 border-green-200 text-green-700' : ''}
          >
            <Zap className="w-4 h-4 mr-2" />
            {liveUpdates ? 'Pausar actualizaciones' : 'Activar tiempo real'}
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Real-time Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Visitantes activos"
          value={formatNumber(engagementData.realtime.active_visitors)}
          description="Ahora mismo en la invitación"
          icon={Users}
          iconColor="green"
          className="border-l-4 border-green-500"
        />
        
        <StatsCard
          title="Páginas vistas"
          value={formatNumber(engagementData.realtime.current_page_views)}
          description="En los últimos 30 minutos"
          icon={Eye}
          iconColor="blue"
        />
        
        <StatsCard
          title="Duración promedio"
          value={formatDuration(engagementData.realtime.avg_session_duration)}
          description="Por sesión"
          icon={Clock}
          iconColor="purple"
        />
        
        <StatsCard
          title="Tasa de rebote"
          value={formatPercentage(engagementData.realtime.bounce_rate)}
          description="Visitantes que salen rápido"
          icon={TrendingDown}
          iconColor="red"
        />
        
        <StatsCard
          title="Interacciones/sesión"
          value={engagementData.realtime.interactions_per_session.toFixed(1)}
          description="Promedio de clicks y acciones"
          icon={MousePointer2}
          iconColor="orange"
        />
      </div>

      {/* Interactions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer2 className="w-5 h-5" />
            Interacciones de usuarios
          </CardTitle>
          <CardDescription>
            Acciones y comportamientos de los visitantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatNumber(engagementData.interactions.total_clicks)}
              </div>
              <div className="text-sm text-blue-700">Total de clicks</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {formatNumber(engagementData.interactions.gallery_views)}
              </div>
              <div className="text-sm text-purple-700">Vistas de galería</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatNumber(engagementData.interactions.rsvp_completions)}
              </div>
              <div className="text-sm text-green-700">RSVP completados</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {formatNumber(engagementData.interactions.shares)}
              </div>
              <div className="text-sm text-orange-700">Compartidas</div>
            </div>
          </div>

          {/* Reactions */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Reacciones de invitados</h4>
            <div className="flex flex-wrap gap-3">
              {engagementData.interactions.reactions.map((reaction, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
                  <span className="text-lg">{getReactionEmoji(reaction.type)}</span>
                  <span className="font-medium text-gray-900">{reaction.count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap and Popular Sections */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Engagement por sección
            </CardTitle>
            <CardDescription>
              Tiempo invertido e interacción por área
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engagementData.heatmap.sections.map((section, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{section.name}</span>
                    <div className="text-sm text-gray-600">
                      {formatPercentage(section.interaction_rate)} engagement
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {/* Interaction rate bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-16">Interacción</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${section.interaction_rate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-900 w-12">
                        {formatPercentage(section.interaction_rate)}
                      </span>
                    </div>
                    
                    {/* Time spent bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-16">Tiempo</span>
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{ 
                            width: `${Math.min((section.time_spent / 100) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-700 w-12">
                        {formatDuration(section.time_spent)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{formatNumber(section.clicks)} clicks</span>
                    <span>{formatPercentage(section.scroll_depth)} scroll</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Embudo de conversión
            </CardTitle>
            <CardDescription>
              Flujo de usuarios y puntos de abandono
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engagementData.user_journey.conversion_funnel.map((step, index) => {
                const isFirst = index === 0;
                const widthPercentage = (step.visitors / engagementData.user_journey.conversion_funnel[0].visitors) * 100;
                
                return (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{step.step}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatNumber(step.visitors)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({formatPercentage(step.conversion_rate)})
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="h-8 bg-gray-200 rounded-lg overflow-hidden">
                        <div
                          className={`h-full rounded-lg ${
                            isFirst ? 'bg-green-500' :
                            step.conversion_rate > 50 ? 'bg-blue-500' :
                            step.conversion_rate > 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${widthPercentage}%` }}
                        />
                      </div>
                      
                      {!isFirst && step.drop_off > 0 && (
                        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                          <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                            -{step.drop_off}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Temporal Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Patrones de actividad
          </CardTitle>
          <CardDescription>
            Cuándo están más activos tus invitados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Hourly Activity */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Actividad por hora</h4>
              <div className="h-40 flex items-end justify-between gap-1">
                {engagementData.temporal_patterns.hourly_activity.map((hour, index) => {
                  const maxEngagement = Math.max(...engagementData.temporal_patterns.hourly_activity.map(h => h.engagement));
                  const height = (hour.engagement / maxEngagement) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="bg-purple-500 rounded-t-sm w-full transition-all duration-300"
                        style={{ height: `${height}%`, minHeight: '2px' }}
                        title={`${hour.hour}:00 - ${hour.engagement}% engagement`}
                      />
                      <div className="text-xs text-gray-500 -rotate-45 origin-center">
                        {hour.hour}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Peak Times */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Momentos destacados</h4>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">Mayor engagement</span>
                  </div>
                  <div className="text-green-700">
                    <div className="font-medium">
                      {engagementData.temporal_patterns.peak_times.highest_engagement.time}
                    </div>
                    <div className="text-sm">
                      {engagementData.temporal_patterns.peak_times.highest_engagement.value}% de engagement
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-900">Menor engagement</span>
                  </div>
                  <div className="text-red-700">
                    <div className="font-medium">
                      {engagementData.temporal_patterns.peak_times.lowest_engagement.time}
                    </div>
                    <div className="text-sm">
                      {engagementData.temporal_patterns.peak_times.lowest_engagement.value}% de engagement
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audience Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Insights de audiencia
          </CardTitle>
          <CardDescription>
            Segmentación y comportamiento de visitantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* New vs Returning */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Tipo de visitantes</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Nuevos visitantes</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(engagementData.audience_insights.new_visitors)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Visitantes recurrentes</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(engagementData.audience_insights.returning_visitors)}
                  </span>
                </div>
              </div>
            </div>

            {/* Engagement Segments */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Nivel de engagement</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Altamente comprometidos</span>
                  <span className="font-medium text-green-900">
                    {formatNumber(engagementData.audience_insights.engagement_segments.highly_engaged)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-yellow-700">Moderadamente comprometidos</span>
                  <span className="font-medium text-yellow-900">
                    {formatNumber(engagementData.audience_insights.engagement_segments.moderately_engaged)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-700">Poco comprometidos</span>
                  <span className="font-medium text-red-900">
                    {formatNumber(engagementData.audience_insights.engagement_segments.low_engaged)}
                  </span>
                </div>
              </div>
            </div>

            {/* Session Frequency */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Frecuencia de visitas</h4>
              <div className="space-y-2">
                {engagementData.audience_insights.session_frequency.map((freq, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-700">{freq.sessions}</span>
                    <span className="font-medium text-gray-900">
                      {formatNumber(freq.count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}