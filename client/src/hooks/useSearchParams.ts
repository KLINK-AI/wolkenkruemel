import { useMemo } from 'react';
import { useLocation } from 'wouter';

export function useSearchParams() {
  const [location] = useLocation();
  
  return useMemo(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    return {
      get: (key: string) => params.get(key),
      has: (key: string) => params.has(key),
      getAll: (key: string) => params.getAll(key),
      entries: () => params.entries(),
      keys: () => params.keys(),
      values: () => params.values()
    };
  }, [location]);
}