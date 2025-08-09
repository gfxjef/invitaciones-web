/**
 * useDebounce Hook
 * 
 * WHY: Delays API calls until user stops typing to prevent excessive
 * network requests during coupon validation. Improves performance
 * and reduces server load.
 * 
 * WHAT: Generic hook that debounces any value changes by specified delay.
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}