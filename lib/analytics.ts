/**
 * Analytics and telemetry system
 * Privacy-first: Only collect anonymous usage statistics
 */

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

class Analytics {
  private enabled: boolean = false;
  private queue: AnalyticsEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.enabled = typeof window !== 'undefined' && 
                   process.env.NODE_ENV === 'production' &&
                   !window.location.hostname.includes('localhost');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track an event
   */
  track(event: string, properties?: Record<string, any>) {
    if (!this.enabled) {
      console.log('[Analytics] Track:', event, properties);
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    this.queue.push(analyticsEvent);
    
    // Send in batches
    if (this.queue.length >= 5) {
      this.flush();
    }
  }

  /**
   * Track page view
   */
  page(pageName: string, properties?: Record<string, any>) {
    this.track('Page View', {
      page: pageName,
      ...properties,
    });
  }

  /**
   * Track proof generation
   */
  proofGenerated(templateId: string, timing: number, success: boolean) {
    this.track('Proof Generated', {
      templateId,
      timing,
      success,
      timingBucket: this.getTimingBucket(timing),
    });
  }

  /**
   * Track proof verification
   */
  proofVerified(isValid: boolean, timing: number) {
    this.track('Proof Verified', {
      isValid,
      timing,
    });
  }

  /**
   * Track template usage
   */
  templateViewed(templateId: string) {
    this.track('Template Viewed', {
      templateId,
    });
  }

  /**
   * Track errors
   */
  error(error: Error | string, context?: Record<string, any>) {
    this.track('Error Occurred', {
      error: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      ...context,
    });
  }

  /**
   * Track feature usage
   */
  featureUsed(feature: string, properties?: Record<string, any>) {
    this.track('Feature Used', {
      feature,
      ...properties,
    });
  }

  /**
   * Get timing bucket for grouping
   */
  private getTimingBucket(timing: number): string {
    if (timing < 500) return '<500ms';
    if (timing < 1000) return '500ms-1s';
    if (timing < 2000) return '1s-2s';
    if (timing < 5000) return '2s-5s';
    return '>5s';
  }

  /**
   * Flush events to server
   */
  private async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      // Send to analytics endpoint (implement when ready)
      if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events }),
        });
      } else {
        console.log('[Analytics] Would send:', events);
      }
    } catch (error) {
      console.error('[Analytics] Failed to send events:', error);
      // Re-queue failed events
      this.queue.unshift(...events);
    }
  }

  /**
   * Flush on page unload
   */
  setupBeforeUnload() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }
}

// Singleton instance
const analytics = new Analytics();

if (typeof window !== 'undefined') {
  analytics.setupBeforeUnload();
  (window as any).zkruneAnalytics = analytics;
}

export default analytics;

