/**
 * Performance monitoring and optimization utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Mark performance timing
   */
  mark(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  }

  /**
   * Measure performance between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number {
    if (typeof performance === 'undefined') return 0;

    try {
      const measure = endMark 
        ? performance.measure(name, startMark, endMark)
        : performance.measure(name, startMark);
      
      const duration = measure.duration;
      
      // Store metric
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name)!.push(duration);
      
      return duration;
    } catch (e) {
      console.warn('[Performance] Failed to measure:', name, e);
      return 0;
    }
  }

  /**
   * Get metric statistics
   */
  getMetricStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return { avg, median, p95, p99, min: sorted[0], max: sorted[sorted.length - 1] };
  }

  /**
   * Track Core Web Vitals
   */
  trackWebVitals() {
    if (typeof window === 'undefined') return;

    // LCP - Largest Contentful Paint
    this.observePerformanceEntry('largest-contentful-paint', (entry: any) => {
      const lcp = entry.renderTime || entry.loadTime;
      this.reportWebVital('LCP', lcp, this.getLCPRating(lcp));
    });

    // FID - First Input Delay
    this.observePerformanceEntry('first-input', (entry: any) => {
      const fid = entry.processingStart - entry.startTime;
      this.reportWebVital('FID', fid, this.getFIDRating(fid));
    });

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    this.observePerformanceEntry('layout-shift', (entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        this.reportWebVital('CLS', clsValue, this.getCLSRating(clsValue));
      }
    });
  }

  private observePerformanceEntry(type: string, callback: (entry: any) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });
      observer.observe({ type, buffered: true });
    } catch (e) {
      console.warn('[Performance] Failed to observe:', type, e);
    }
  }

  private getLCPRating(lcp: number): 'good' | 'needs-improvement' | 'poor' {
    if (lcp <= 2500) return 'good';
    if (lcp <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private getFIDRating(fid: number): 'good' | 'needs-improvement' | 'poor' {
    if (fid <= 100) return 'good';
    if (fid <= 300) return 'needs-improvement';
    return 'poor';
  }

  private getCLSRating(cls: number): 'good' | 'needs-improvement' | 'poor' {
    if (cls <= 0.1) return 'good';
    if (cls <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private reportWebVital(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
    console.log(`[WebVital] ${name}:`, value, `(${rating})`);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).zkruneAnalytics) {
      (window as any).zkruneAnalytics.track('Web Vital', {
        metric: name,
        value,
        rating,
      });
    }
  }

  /**
   * Log all metrics
   */
  logAllMetrics() {
    console.group('[Performance] Metrics Summary');
    this.metrics.forEach((values, name) => {
      const stats = this.getMetricStats(name);
      if (stats) {
        console.log(`${name}:`, stats);
      }
    });
    console.groupEnd();
  }
}

// Singleton instance
const perfMonitor = new PerformanceMonitor();

// Auto-track web vitals in browser
if (typeof window !== 'undefined') {
  perfMonitor.trackWebVitals();
  (window as any).zkrunePerformance = perfMonitor;
}

export default perfMonitor;

/**
 * Performance decorator for measuring function execution
 */
export function measurePerformance(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startMark = `${name}-start`;
      const endMark = `${name}-end`;
      
      perfMonitor.mark(startMark);
      
      try {
        const result = await originalMethod.apply(this, args);
        perfMonitor.mark(endMark);
        const duration = perfMonitor.measure(name, startMark, endMark);
        
        if (duration > 1000) {
          console.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
        }
        
        return result;
      } catch (error) {
        perfMonitor.mark(endMark);
        perfMonitor.measure(name, startMark, endMark);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

