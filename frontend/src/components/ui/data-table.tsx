/**
 * Data Table Component
 * 
 * WHY: Provides a responsive, feature-rich table component for displaying
 * tabular data with sorting, filtering, and pagination capabilities.
 * Essential for orders, invitations, and other data lists.
 * 
 * WHAT: Flexible table component with column configuration, sorting,
 * empty states, and mobile-responsive design.
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { EmptyState } from './empty-state';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
  };
  emptyState?: {
    title: string;
    description: string;
    action?: React.ReactNode;
  };
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  loading?: boolean;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Responsive data table with sorting and filtering
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Buscar...",
  pagination = { enabled: false, pageSize: 10 },
  emptyState,
  onRowClick,
  className,
  loading = false
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        columns.some(col => {
          const value = row[col.key as keyof T];
          return String(value || '').toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === bVal) return 0;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sortConfig.direction === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, columns]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination.enabled) return processedData;

    const startIndex = (currentPage - 1) * (pagination.pageSize || 10);
    const endIndex = startIndex + (pagination.pageSize || 10);
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pagination]);

  const totalPages = pagination.enabled 
    ? Math.ceil(processedData.length / (pagination.pageSize || 10))
    : 1;

  const handleSort = (columnKey: string) => {
    if (!columns.find(col => col.key === columnKey)?.sortable) return;

    setSortConfig(current => {
      if (current?.key === columnKey) {
        return current.direction === 'asc'
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-purple-600" />
      : <ChevronDown className="w-4 h-4 text-purple-600" />;
  };

  const renderCellContent = (column: Column<T>, row: T, index: number) => {
    const value = row[column.key as keyof T];
    
    if (column.render) {
      return column.render(value, row, index);
    }

    // Default rendering
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'outline'}>
          {value ? 'Sí' : 'No'}
        </Badge>
      );
    }

    if (typeof value === 'number') {
      return <span className="font-mono">{value.toLocaleString()}</span>;
    }

    if (value && Object.prototype.toString.call(value) === '[object Date]') {
      return <span>{(value as Date).toLocaleDateString()}</span>;
    }

    return <span>{String(value)}</span>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {searchable && (
          <div className="flex items-center gap-4">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse flex-1"></div>
          </div>
        )}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Results Summary */}
      {(searchTerm || processedData.length !== data.length) && (
        <div className="text-sm text-gray-600">
          Mostrando {processedData.length} de {data.length} resultados
          {searchTerm && ` para "${searchTerm}"`}
        </div>
      )}

      {/* Table */}
      {processedData.length === 0 && emptyState ? (
        <EmptyState {...emptyState} />
      ) : (
        <>
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={String(column.key)}
                        className={cn(
                          "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                          column.sortable && "cursor-pointer hover:bg-gray-100 select-none",
                          column.className
                        )}
                        style={column.width ? { width: column.width } : undefined}
                        onClick={() => column.sortable && handleSort(String(column.key))}
                      >
                        <div className="flex items-center gap-2">
                          {column.title}
                          {column.sortable && getSortIcon(String(column.key))}
                        </div>
                      </th>
                    ))}
                    {onRowClick && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.map((row, index) => (
                    <tr
                      key={index}
                      className={cn(
                        "hover:bg-gray-50 transition-colors",
                        onRowClick && "cursor-pointer"
                      )}
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {columns.map((column) => (
                        <td
                          key={String(column.key)}
                          className={cn(
                            "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                            column.className
                          )}
                        >
                          {renderCellContent(column, row, index)}
                        </td>
                      ))}
                      {onRowClick && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.enabled && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages} 
                {' '}({processedData.length} elementos)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}