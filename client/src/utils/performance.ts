// Performance utilities for optimization

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Image optimization helpers
export function getOptimizedImageUrl(url: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
}): string {
  // For base64 images, return as-is
  if (url.startsWith('data:')) {
    return url;
  }
  
  // Add query parameters for optimization (if using image service)
  const params = new URLSearchParams();
  if (options?.width) params.set('w', options.width.toString());
  if (options?.height) params.set('h', options.height.toString());
  if (options?.quality) params.set('q', options.quality.toString());
  
  return params.toString() ? `${url}?${params}` : url;
}

// Memory management for large lists
export function createVirtualizedData<T>(
  data: T[], 
  itemHeight: number, 
  containerHeight: number
): {
  visibleItems: T[];
  totalHeight: number;
  startIndex: number;
  endIndex: number;
} {
  const itemsVisible = Math.ceil(containerHeight / itemHeight);
  const buffer = Math.floor(itemsVisible * 0.5); // 50% buffer
  
  const startIndex = Math.max(0, 0 - buffer);
  const endIndex = Math.min(data.length, itemsVisible + buffer);
  
  return {
    visibleItems: data.slice(startIndex, endIndex),
    totalHeight: data.length * itemHeight,
    startIndex,
    endIndex
  };
}

// Cache management
export class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}