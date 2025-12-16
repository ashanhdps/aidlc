export interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

export interface UserInteractionMetric {
  action: string
  component: string
  duration?: number
  metadata?: Record<string, any>
  timestamp: number
  userId?: string
}

export interface SystemMetric {
  type: 'memory' | 'network' | 'render' | 'bundle' | 'error'
  value: number
  unit: string
  timestamp: number
  details?: Record<string, any>
}

export interface MetricsConfig {
  enablePerformanceTracking: boolean
  enableUserTracking: boolean
  enableSystemTracking: boolean
  batchSize: number
  flushInterval: number
  maxRetries: number
}

export class MetricsService {
  private config: MetricsConfig
  private performanceMetrics: PerformanceMetric[] = []
  private userMetrics: UserInteractionMetric[] = []
  private systemMetrics: SystemMetric[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private observer: PerformanceObserver | null = null

  constructor(config: Partial<MetricsConfig> = {}) {
    this.config = {
      enablePerformanceTracking: config.enablePerformanceTracking ?? true,
      enableUserTracking: config.enableUserTracking ?? true,
      enableSystemTracking: config.enableSystemTracking ?? true,
      batchSize: config.batchSize ?? 50,
      flushInterval: config.flushInterval ?? 30000, // 30 seconds
      maxRetries: config.maxRetries ?? 3,
    }

    this.initialize()
  }

  /**
   * Initialize metrics collection
   */
  private initialize(): void {
    if (this.config.enablePerformanceTracking) {
      this.setupPerformanceTracking()
    }

    if (this.config.enableSystemTracking) {
      this.setupSystemTracking()
    }

    // Start periodic flush
    this.startPeriodicFlush()
  }

  /**
   * Track performance metrics
   */
  trackPerformance(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.config.enablePerformanceTracking) return

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    }

    this.performanceMetrics.push(metric)
    this.checkFlushThreshold()
  }

  /**
   * Track user interactions
   */
  trackUserInteraction(
    action: string,
    component: string,
    duration?: number,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enableUserTracking) return

    const metric: UserInteractionMetric = {
      action,
      component,
      duration,
      metadata,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
    }

    this.userMetrics.push(metric)
    this.checkFlushThreshold()
  }

  /**
   * Track system metrics
   */
  trackSystemMetric(
    type: SystemMetric['type'],
    value: number,
    unit: string,
    details?: Record<string, any>
  ): void {
    if (!this.config.enableSystemTracking) return

    const metric: SystemMetric = {
      type,
      value,
      unit,
      timestamp: Date.now(),
      details,
    }

    this.systemMetrics.push(metric)
    this.checkFlushThreshold()
  }

  /**
   * Track page load performance
   */
  trackPageLoad(pageName: string): void {
    if (!this.config.enablePerformanceTracking) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (navigation) {
      this.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart, {
        page: pageName,
        type: 'navigation',
      })

      this.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart, {
        page: pageName,
        type: 'dom',
      })

      this.trackPerformance('first_paint', navigation.responseEnd - navigation.fetchStart, {
        page: pageName,
        type: 'paint',
      })
    }
  }

  /**
   * Track component render performance
   */
  trackComponentRender(componentName: string, renderTime: number): void {
    this.trackPerformance('component_render', renderTime, {
      component: componentName,
      type: 'render',
    })
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string, method: string, duration: number, status: number): void {
    this.trackPerformance('api_call', duration, {
      endpoint,
      method,
      status: status.toString(),
      type: 'api',
    })
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.trackSystemMetric('error', 1, 'count', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
    })
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      
      this.trackSystemMetric('memory', memory.usedJSHeapSize, 'bytes', {
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      })
    }
  }

  /**
   * Track bundle size metrics
   */
  trackBundleSize(bundleName: string, size: number): void {
    this.trackSystemMetric('bundle', size, 'bytes', {
      bundle: bundleName,
    })
  }

  /**
   * Get current metrics summary
   */
  getMetricsSummary(): {
    performance: { count: number; avgValue: number }
    userInteractions: { count: number; topActions: string[] }
    system: { count: number; errors: number }
  } {
    const performanceAvg = this.performanceMetrics.length > 0
      ? this.performanceMetrics.reduce((sum, m) => sum + m.value, 0) / this.performanceMetrics.length
      : 0

    const topActions = this.getTopUserActions(5)
    const errorCount = this.systemMetrics.filter(m => m.type === 'error').length

    return {
      performance: {
        count: this.performanceMetrics.length,
        avgValue: performanceAvg,
      },
      userInteractions: {
        count: this.userMetrics.length,
        topActions,
      },
      system: {
        count: this.systemMetrics.length,
        errors: errorCount,
      },
    }
  }

  /**
   * Get performance metrics by name
   */
  getPerformanceMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.performanceMetrics.filter(m => m.name === name)
    }
    return [...this.performanceMetrics]
  }

  /**
   * Get user interaction metrics
   */
  getUserInteractionMetrics(action?: string, component?: string): UserInteractionMetric[] {
    let filtered = [...this.userMetrics]

    if (action) {
      filtered = filtered.filter(m => m.action === action)
    }

    if (component) {
      filtered = filtered.filter(m => m.component === component)
    }

    return filtered
  }

  /**
   * Export metrics data
   */
  exportMetrics(): {
    performance: PerformanceMetric[]
    userInteractions: UserInteractionMetric[]
    system: SystemMetric[]
    exportedAt: string
  } {
    return {
      performance: [...this.performanceMetrics],
      userInteractions: [...this.userMetrics],
      system: [...this.systemMetrics],
      exportedAt: new Date().toISOString(),
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.performanceMetrics = []
    this.userMetrics = []
    this.systemMetrics = []
  }

  /**
   * Private helper methods
   */
  private setupPerformanceTracking(): void {
    // Track Web Vitals and other performance metrics
    if ('PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.handlePerformanceEntry(entry)
          }
        })

        // Observe different types of performance entries
        this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint'] })
      } catch (error) {
        console.warn('Failed to setup PerformanceObserver:', error)
      }
    }

    // Track Core Web Vitals
    this.trackWebVitals()
  }

  private setupSystemTracking(): void {
    // Track memory usage periodically
    setInterval(() => {
      this.trackMemoryUsage()
    }, 60000) // Every minute

    // Track unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
      })
    })
  }

  private handlePerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming
        this.trackPerformance('navigation_timing', navEntry.duration, {
          type: 'navigation',
        })
        break

      case 'resource':
        const resourceEntry = entry as PerformanceResourceTiming
        this.trackPerformance('resource_load', resourceEntry.duration, {
          type: 'resource',
          name: resourceEntry.name,
        })
        break

      case 'paint':
        this.trackPerformance(entry.name.replace('-', '_'), entry.startTime, {
          type: 'paint',
        })
        break

      case 'measure':
        this.trackPerformance('custom_measure', entry.duration, {
          type: 'measure',
          name: entry.name,
        })
        break
    }
  }

  private trackWebVitals(): void {
    // Track Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.trackPerformance('largest_contentful_paint', lastEntry.startTime, {
            type: 'web_vital',
          })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (error) {
        console.warn('Failed to track LCP:', error)
      }
    }

    // Track First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as any
            this.trackPerformance('first_input_delay', fidEntry.processingStart - fidEntry.startTime, {
              type: 'web_vital',
            })
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (error) {
        console.warn('Failed to track FID:', error)
      }
    }
  }

  private checkFlushThreshold(): void {
    const totalMetrics = this.performanceMetrics.length + 
                        this.userMetrics.length + 
                        this.systemMetrics.length

    if (totalMetrics >= this.config.batchSize) {
      this.flush()
    }
  }

  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  private async flush(): Promise<void> {
    if (this.performanceMetrics.length === 0 && 
        this.userMetrics.length === 0 && 
        this.systemMetrics.length === 0) {
      return
    }

    const metricsToFlush = {
      performance: [...this.performanceMetrics],
      userInteractions: [...this.userMetrics],
      system: [...this.systemMetrics],
      timestamp: Date.now(),
    }

    // Clear current metrics
    this.clearMetrics()

    try {
      // In a real application, this would send to analytics service
      console.log('Flushing metrics:', metricsToFlush)
      
      // Mock API call
      await this.sendMetricsToServer(metricsToFlush)
    } catch (error) {
      console.error('Failed to flush metrics:', error)
      // In case of failure, could implement retry logic here
    }
  }

  private async sendMetricsToServer(metrics: any): Promise<void> {
    // Mock implementation - in real app, would send to analytics endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Metrics sent to server:', metrics)
        resolve()
      }, 100)
    })
  }

  private getTopUserActions(limit: number): string[] {
    const actionCounts = new Map<string, number>()
    
    this.userMetrics.forEach(metric => {
      const count = actionCounts.get(metric.action) || 0
      actionCounts.set(metric.action, count + 1)
    })

    return Array.from(actionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([action]) => action)
  }

  private getCurrentUserId(): string | undefined {
    // In real app, would get from authentication context
    return 'current-user-id'
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }

    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }

    // Final flush
    this.flush()
  }
}

// Singleton instance
export const metricsService = new MetricsService()