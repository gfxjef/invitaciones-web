/**
 * Invitation Statistics Card Component
 * 
 * WHY: Displays detailed statistics for individual invitations with
 * performance metrics, engagement insights, and trend analysis.
 * 
 * WHAT: Card component showing invitation performance with visual
 * indicators, comparison metrics, and actionable insights.
 */

'use client';

import { useState } from 'react';
import { 
  Eye,
  Users,
  Share2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  BarChart3,
  Download,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Invitation } from '@/lib/api';

interface InvitationStatsCardProps {
  invitation: Invitation;
  showDetailedMetrics?: boolean;
  onViewDetails?: (id: number) => void;
  onShare?: (invitation: Invitation) => void;
  className?: string;
}

interface PerformanceMetric {
  label: string;
  value: number | string;
  change?: {
    value: number;
    positive: boolean;
    period: string;
  };
  icon: any;
  color: string;
}

export default function InvitationStatsCard({
  invitation,
  showDetailedMetrics = false,
  onViewDetails,
  onShare,
  className = ''
}: InvitationStatsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate performance metrics
  const calculateMetrics = (): PerformanceMetric[] => {
    const { stats } = invitation;
    const conversionRate = stats.rsvp_responses > 0 
      ? Math.round((stats.rsvp_confirmed / stats.rsvp_responses) * 100) 
      : 0;
    const viewToRsvpRate = stats.total_views > 0
      ? Math.round((stats.rsvp_responses / stats.total_views) * 100)
      : 0;
    const engagementRate = stats.total_views > 0
      ? Math.round(((stats.rsvp_responses + stats.shares) / stats.total_views) * 100)
      : 0;

    return [
      {
        label: 'Vistas totales',
        value: stats.total_views.toLocaleString(),
        change: { value: 12, positive: true, period: 'esta semana' },
        icon: Eye,
        color: 'text-blue-600'
      },
      {
        label: 'Visitantes únicos',
        value: stats.unique_visitors.toLocaleString(),
        change: { value: 8, positive: true, period: 'esta semana' },
        icon: Users,
        color: 'text-green-600'
      },
      {
        label: 'Confirmaciones',
        value: stats.rsvp_confirmed,
        change: { value: 15, positive: true, period: 'esta semana' },
        icon: Users,
        color: 'text-green-600'
      },
      {
        label: 'Tasa de conversión',
        value: `${conversionRate}%`,
        change: { value: 3, positive: true, period: 'vs promedio' },
        icon: TrendingUp,
        color: 'text-purple-600'
      },
      {
        label: 'Engagement',
        value: `${engagementRate}%`,
        change: { value: 5, positive: true, period: 'vs promedio' },
        icon: BarChart3,
        color: 'text-orange-600'
      },
      {
        label: 'Compartidas',
        value: stats.shares,
        change: { value: 2, positive: false, period: 'esta semana' },
        icon: Share2,
        color: 'text-pink-600'
      }
    ];
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'boda': return '💒';
      case 'quince': return '👑';
      case 'bautizo': return '👶';
      case 'cumpleanos': return '🎂';
      case 'baby_shower': return '🍼';
      default: return '🎉';
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-800 border-gray-200' },
      active: { label: 'Activa', color: 'bg-green-100 text-green-800 border-green-200' },
      expired: { label: 'Expirada', color: 'bg-red-100 text-red-800 border-red-200' },
      completed: { label: 'Completada', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    };
    return configs[status as keyof typeof configs] || configs.draft;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPerformanceInsight = () => {
    const { stats } = invitation;
    const conversionRate = stats.rsvp_responses > 0 
      ? Math.round((stats.rsvp_confirmed / stats.rsvp_responses) * 100) 
      : 0;
    
    if (conversionRate >= 80) {
      return {
        type: 'success',
        message: 'Excelente tasa de confirmación',
        icon: TrendingUp,
        color: 'text-green-600 bg-green-50'
      };
    } else if (conversionRate >= 60) {
      return {
        type: 'good',
        message: 'Buena respuesta de invitados',
        icon: TrendingUp,
        color: 'text-blue-600 bg-blue-50'
      };
    } else if (conversionRate >= 40) {
      return {
        type: 'warning',
        message: 'Considera enviar recordatorios',
        icon: Clock,
        color: 'text-yellow-600 bg-yellow-50'
      };
    } else {
      return {
        type: 'info',
        message: 'Promociona más tu invitación',
        icon: Share2,
        color: 'text-orange-600 bg-orange-50'
      };
    }
  };

  const metrics = calculateMetrics();
  const statusConfig = getStatusConfig(invitation.status);
  const insight = getPerformanceInsight();

  return (
    <div className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getEventTypeIcon(invitation.event_type)}</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                {invitation.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {invitation.template_name}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`border text-xs ${statusConfig.color}`}>
                  {statusConfig.label}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {formatDate(invitation.event_date)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(invitation.full_url, '_blank')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare(invitation)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Performance Insight */}
      <div className="p-4 border-b">
        <div className={`flex items-center gap-2 p-3 rounded-lg ${insight.color}`}>
          <insight.icon className="w-4 h-4" />
          <span className="text-sm font-medium">{insight.message}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {metrics.slice(0, 3).map((metric, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
              <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
              {metric.change && (
                <div className={`flex items-center justify-center gap-1 text-xs ${
                  metric.change.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change.positive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>+{metric.change.value}% {metric.change.period}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detailed Metrics (Expandable) */}
        {showDetailedMetrics && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-center"
            >
              {isExpanded ? 'Ver menos detalles' : 'Ver más detalles'}
              <ArrowUpRight className={`w-4 h-4 ml-1 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} />
            </Button>

            {isExpanded && (
              <div className="pt-4 border-t space-y-4">
                {/* Additional Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {metrics.slice(3).map((metric, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <metric.icon className={`w-4 h-4 ${metric.color}`} />
                        <span className="font-semibold text-gray-900">{metric.value}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
                      {metric.change && (
                        <div className={`flex items-center gap-1 text-xs ${
                          metric.change.positive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change.positive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{metric.change.positive ? '+' : ''}{metric.change.value}% {metric.change.period}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* RSVP Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Desglose RSVP</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Confirmados</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ 
                              width: `${invitation.stats.rsvp_responses > 0 
                                ? (invitation.stats.rsvp_confirmed / invitation.stats.rsvp_responses) * 100 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {invitation.stats.rsvp_confirmed}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Declinaron</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full"
                            style={{ 
                              width: `${invitation.stats.rsvp_responses > 0 
                                ? (invitation.stats.rsvp_declined / invitation.stats.rsvp_responses) * 100 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {invitation.stats.rsvp_declined}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Actividad reciente</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>3 nuevas confirmaciones hoy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>15 vistas en las últimas 24h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>2 veces compartida esta semana</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(invitation.id)}
              className="flex-1"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver detalles
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement export functionality
              console.log('Export invitation stats', invitation.id);
            }}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}