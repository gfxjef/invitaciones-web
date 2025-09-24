/**
 * Date Formatter Utilities
 *
 * WHY: Utilities for formatting dates in Spanish format for wedding templates
 *
 * FEATURES:
 * - Convert ISO date string to Spanish format with day name
 * - Support for wedding date displays
 * - No external dependencies required
 */

/**
 * Formats date from ISO string to Spanish format with day name
 * @param dateString - ISO format: "2025-12-15T17:00:00"
 * @returns Spanish format: "LUNES 15 DICIEMBRE 2025"
 */
export function formatDateWithDay(dateString: string): string {
  const date = new Date(dateString);

  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName.toUpperCase()} ${day} ${monthName.toUpperCase()} ${year}`;
}

/**
 * Formats time from ISO string to simple time format
 * @param dateString - ISO format: "2025-12-15T17:00:00"
 * @returns Time format: "5:00 PM"
 */
export function formatTimeFromDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Formats date from ISO string to separated components for visual layouts
 * @param dateString - ISO format: "2025-12-15T17:00:00"
 * @returns Object with separated date parts: { dayName: "DOMINGO", day: 15, monthName: "DICIEMBRE", year: 2024 }
 */
export function formatDateParts(dateString: string): {
  dayName: string;
  day: number;
  monthName: string;
  year: number;
} {
  const date = new Date(dateString);

  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return {
    dayName: days[date.getDay()].toUpperCase(),
    day: date.getDate(),
    monthName: months[date.getMonth()].toUpperCase(),
    year: date.getFullYear()
  };
}