/**
 * Statistics Chart Component
 * 
 * WHY: Provides visual representation of visit statistics and analytics
 * data for invitation URLs. Essential for understanding user engagement.
 * 
 * WHAT: Chart components for displaying daily visits, device breakdown,
 * browser stats, and geographic data with responsive design.
 */

'use client';

import { useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Smartphone, 
  Monitor, 
  Tablet,
  Globe,
  BarChart3,
  PieChart,
  Users
} from 'lucide-react';
import { VisitStats } from '@/lib/api';

interface StatsChartProps {
  stats: VisitStats;
  className?: string;
}

/**
 * Daily Visits Chart Component
 * Shows visit trends over time with simple bar chart
 */
function DailyVisitsChart({ visits }: { visits: VisitStats['daily_visits'] }) {
  const maxVisits = Math.max(...visits.map(v => v.visits));
  
  if (!visits.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">No hay datos de visitas diarias</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <TrendingUp className="w-4 h-4" />
        <span>Visitas diarias (últimos 30 días)</span>
      </div>
      
      <div className="flex items-end gap-1 h-32 bg-gray-50 rounded p-2">
        {visits.map(({ date, visits: dailyVisits }, index) => {
          const height = maxVisits > 0 ? (dailyVisits / maxVisits) * 100 : 0;
          const formattedDate = new Date(date).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
          });

          return (
            <div
              key={date}
              className="flex-1 flex flex-col items-center group cursor-pointer"
              title={`${formattedDate}: ${dailyVisits} visitas`}
            >
              <div
                className="w-full bg-purple-600 rounded-t transition-all duration-200 group-hover:bg-purple-700 min-h-[2px]"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
              <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                {formattedDate}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Total: {visits.reduce((sum, v) => sum + v.visits, 0)} visitas
      </div>
    </div>
  );
}

/**
 * Device Stats Component
 * Shows device breakdown with icons and percentages
 */
function DeviceStatsChart({ devices, totalVisits }: { 
  devices: VisitStats['devices']; 
  totalVisits: number; 
}) {
  const deviceData = useMemo(() => {
    const data = Object.entries(devices).map(([device, count]) => ({
      device: device.charAt(0).toUpperCase() + device.slice(1),
      count,
      percentage: totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0,
    }));
    
    return data.sort((a, b) => b.count - a.count);
  }, [devices, totalVisits]);

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      case 'desktop': return Monitor;
      default: return Monitor;
    }
  };

  const getDeviceColor = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'tablet': return 'text-green-600 bg-green-50 border-green-200';
      case 'desktop': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!deviceData.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Monitor className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">No hay datos de dispositivos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <PieChart className="w-4 h-4" />
        <span>Dispositivos utilizados</span>
      </div>
      
      <div className="space-y-2">
        {deviceData.map(({ device, count, percentage }) => {
          const DeviceIcon = getDeviceIcon(device);
          const colorClass = getDeviceColor(device);

          return (
            <div key={device} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${colorClass}`}>
                <DeviceIcon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{device}</span>
                  <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      device.toLowerCase() === 'mobile' ? 'bg-blue-600' :
                      device.toLowerCase() === 'tablet' ? 'bg-green-600' :
                      'bg-purple-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Browser Stats Component
 * Shows browser usage statistics
 */
function BrowserStatsChart({ browsers, totalVisits }: { 
  browsers: VisitStats['browsers']; 
  totalVisits: number; 
}) {
  const browserData = useMemo(() => {
    const data = Object.entries(browsers).map(([browser, count]) => ({
      browser,
      count,
      percentage: totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0,
    }));
    
    return data.sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 browsers
  }, [browsers, totalVisits]);

  if (!browserData.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">No hay datos de navegadores</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <BarChart3 className="w-4 h-4" />
        <span>Navegadores principales</span>
      </div>
      
      <div className="space-y-2">
        {browserData.map(({ browser, count, percentage }, index) => (
          <div key={browser} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full bg-purple-${600 - (index * 100)}`}
                style={{ 
                  backgroundColor: `hsl(${260 - (index * 30)}, 70%, ${60 - (index * 5)}%)` 
                }}
              />
              <span className="text-sm text-gray-900">{browser}</span>
            </div>
            <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Geographic Stats Component
 * Shows country/region statistics
 */
function GeographicStatsChart({ countries, totalVisits }: { 
  countries: VisitStats['countries']; 
  totalVisits: number; 
}) {
  const countryData = useMemo(() => {
    const data = Object.entries(countries).map(([country, count]) => ({
      country,
      count,
      percentage: totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0,
    }));
    
    return data.sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 countries
  }, [countries, totalVisits]);

  if (!countryData.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Globe className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">No hay datos geográficos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Globe className="w-4 h-4" />
        <span>Ubicaciones principales</span>
      </div>
      
      <div className="space-y-2">
        {countryData.map(({ country, count, percentage }, index) => (
          <div key={country} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full`}
                style={{ 
                  backgroundColor: `hsl(${120 + (index * 40)}, 60%, ${50 + (index * 8)}%)` 
                }}
              />
              <span className="text-sm text-gray-900">{country}</span>
            </div>
            <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Stats Overview Component
 * Shows key metrics in card format
 */
function StatsOverview({ stats }: { stats: VisitStats }) {
  const conversionRate = stats.total_visits > 0 
    ? Math.round((stats.unique_visits / stats.total_visits) * 100) 
    : 0;

  const metrics = [
    {
      icon: Users,
      label: 'Visitas totales',
      value: stats.total_visits.toLocaleString(),
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: Users,
      label: 'Visitantes únicos',
      value: stats.unique_visits.toLocaleString(),
      color: 'text-green-600 bg-green-50',
    },
    {
      icon: TrendingUp,
      label: 'Tasa de unicidad',
      value: `${conversionRate}%`,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main Stats Chart Component
 * Combines all chart components into a dashboard
 */
export function StatsChart({ stats, className = '' }: StatsChartProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <StatsOverview stats={stats} />

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Visits */}
        <div className="bg-white border rounded-lg p-6">
          <DailyVisitsChart visits={stats.daily_visits} />
        </div>

        {/* Device Stats */}
        <div className="bg-white border rounded-lg p-6">
          <DeviceStatsChart 
            devices={stats.devices} 
            totalVisits={stats.total_visits} 
          />
        </div>

        {/* Browser Stats */}
        <div className="bg-white border rounded-lg p-6">
          <BrowserStatsChart 
            browsers={stats.browsers} 
            totalVisits={stats.total_visits} 
          />
        </div>

        {/* Geographic Stats */}
        <div className="bg-white border rounded-lg p-6">
          <GeographicStatsChart 
            countries={stats.countries} 
            totalVisits={stats.total_visits} 
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Stats Component
 * Minimal stats display for smaller spaces
 */
interface CompactStatsProps {
  stats: VisitStats;
  showDevices?: boolean;
  className?: string;
}

export function CompactStats({ 
  stats, 
  showDevices = true, 
  className = '' 
}: CompactStatsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xl font-semibold text-blue-900">
            {stats.total_visits}
          </p>
          <p className="text-xs text-blue-700">Visitas totales</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xl font-semibold text-green-900">
            {stats.unique_visits}
          </p>
          <p className="text-xs text-green-700">Visitantes únicos</p>
        </div>
      </div>

      {showDevices && Object.keys(stats.devices).length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-700 mb-2">Dispositivos</p>
          <div className="flex gap-2 text-xs">
            {Object.entries(stats.devices).map(([device, count]) => (
              <div key={device} className="flex items-center gap-1">
                {device === 'mobile' && <Smartphone className="w-3 h-3" />}
                {device === 'tablet' && <Tablet className="w-3 h-3" />}
                {device === 'desktop' && <Monitor className="w-3 h-3" />}
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}