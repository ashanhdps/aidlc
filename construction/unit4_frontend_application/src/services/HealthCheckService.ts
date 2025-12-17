export interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  message?: string
  timestamp: number
  duration?: number
  metadata?: Record<string, any>
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy'
  checks: HealthCheck[]
  timestamp: number
  uptime: number
}

export interface HealthCheckConfig {
  interval: number
  timeout: number
  retries: number
  enabledChecks: string[]
}

export type HealthCheckFunction = () => Promise<Omit<HealthCheck, 'timestamp'>>

export class HealthCheckService {
  private config: HealthCheckConfig
  private checks: Map<string, HealthCheckFunction> = new Map()
  private lastResults: Map<string, HealthCheck> = new Map()
  private checkInterval: NodeJS.Timeout | null = null
  private startTime = Date.now()

  constructor(config: Partial<HealthCheckConfig> = {}) {
    this.config = {
      interval: config.interval || 60000, // 1 minute
      timeout: config.timeout || 5000, // 5 seconds
      retries: config.retries || 2,
      enabledChecks: config.enabledChecks || [],
    }

    this.registerDefaultChecks()
    this.startPeriodicChecks()
  }

  /**
   * Register a health check
   */
  registerCheck(name: string, checkFunction: HealthCheckFunction): void {
    this.checks.set(name, checkFunction)
  }

  /**
   * Unregister a health check
   */
  unregisterCheck(name: string): void {
    this.checks.delete(name)
    this.lastResults.delete(name)
  }

  /**
   * Run a specific health check
   */
  async runCheck(name: string): Promise<HealthCheck> {
    const checkFunction = this.checks.get(name)
    if (!checkFunction) {
      throw new Error(`Health check '${name}' not found`)
    }

    const startTime = Date.now()
    let attempt = 0
    let lastError: Error | null = null

    while (attempt <= this.config.retries) {
      try {
        const result = await Promise.race([
          checkFunction(),
          this.createTimeoutPromise(this.config.timeout),
        ])

        const healthCheck: HealthCheck = {
          ...result,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
        }

        this.lastResults.set(name, healthCheck)
        return healthCheck
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        attempt++
        
        if (attempt <= this.config.retries) {
          await this.delay(1000 * attempt) // Exponential backoff
        }
      }
    }

    // All attempts failed
    const failedCheck: HealthCheck = {
      name,
      status: 'unhealthy',
      message: `Check failed after ${this.config.retries + 1} attempts: ${lastError?.message}`,
      timestamp: Date.now(),
      duration: Date.now() - startTime,
    }

    this.lastResults.set(name, failedCheck)
    return failedCheck
  }

  /**
   * Run all registered health checks
   */
  async runAllChecks(): Promise<SystemHealth> {
    const enabledChecks = this.config.enabledChecks.length > 0
      ? Array.from(this.checks.keys()).filter(name => this.config.enabledChecks.includes(name))
      : Array.from(this.checks.keys())

    const checkPromises = enabledChecks.map(name => this.runCheck(name))
    const results = await Promise.allSettled(checkPromises)

    const checks: HealthCheck[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          name: enabledChecks[index],
          status: 'unhealthy',
          message: `Check execution failed: ${result.reason}`,
          timestamp: Date.now(),
        }
      }
    })

    const overall = this.calculateOverallHealth(checks)

    return {
      overall,
      checks,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
    }
  }

  /**
   * Get the last health check results
   */
  getLastResults(): SystemHealth {
    const checks = Array.from(this.lastResults.values())
    const overall = this.calculateOverallHealth(checks)

    return {
      overall,
      checks,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
    }
  }

  /**
   * Get specific check result
   */
  getCheckResult(name: string): HealthCheck | null {
    return this.lastResults.get(name) || null
  }

  /**
   * Check if system is healthy
   */
  isHealthy(): boolean {
    const systemHealth = this.getLastResults()
    return systemHealth.overall === 'healthy'
  }

  /**
   * Register default health checks
   */
  private registerDefaultChecks(): void {
    // Memory usage check
    this.registerCheck('memory', async () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100

        if (usagePercent > 90) {
          return {
            name: 'memory',
            status: 'unhealthy',
            message: `Memory usage critical: ${usagePercent.toFixed(1)}%`,
            metadata: { usagePercent, usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024) },
          }
        } else if (usagePercent > 70) {
          return {
            name: 'memory',
            status: 'degraded',
            message: `Memory usage high: ${usagePercent.toFixed(1)}%`,
            metadata: { usagePercent, usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024) },
          }
        } else {
          return {
            name: 'memory',
            status: 'healthy',
            message: `Memory usage normal: ${usagePercent.toFixed(1)}%`,
            metadata: { usagePercent, usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024) },
          }
        }
      } else {
        return {
          name: 'memory',
          status: 'degraded',
          message: 'Memory API not available',
        }
      }
    })

    // Local storage check
    this.registerCheck('localStorage', async () => {
      try {
        const testKey = '__health_check_test__'
        const testValue = 'test'
        
        localStorage.setItem(testKey, testValue)
        const retrieved = localStorage.getItem(testKey)
        localStorage.removeItem(testKey)

        if (retrieved === testValue) {
          return {
            name: 'localStorage',
            status: 'healthy',
            message: 'Local storage working correctly',
          }
        } else {
          return {
            name: 'localStorage',
            status: 'unhealthy',
            message: 'Local storage read/write failed',
          }
        }
      } catch (error) {
        return {
          name: 'localStorage',
          status: 'unhealthy',
          message: `Local storage error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    })

    // Network connectivity check
    this.registerCheck('network', async () => {
      if ('navigator' in window && 'onLine' in navigator) {
        if (navigator.onLine) {
          // Try to make a simple request to test actual connectivity
          try {
            const response = await fetch('/api/health', { 
              method: 'HEAD',
              cache: 'no-cache',
            })
            
            if (response.ok) {
              return {
                name: 'network',
                status: 'healthy',
                message: 'Network connectivity confirmed',
              }
            } else {
              return {
                name: 'network',
                status: 'degraded',
                message: `Network request failed with status: ${response.status}`,
              }
            }
          } catch (error) {
            return {
              name: 'network',
              status: 'degraded',
              message: 'Network request failed, but browser reports online',
            }
          }
        } else {
          return {
            name: 'network',
            status: 'unhealthy',
            message: 'No network connectivity',
          }
        }
      } else {
        return {
          name: 'network',
          status: 'degraded',
          message: 'Network status API not available',
        }
      }
    })

    // WebSocket connection check
    this.registerCheck('websocket', async () => {
      try {
        // Mock WebSocket check - in real app would check actual WebSocket connection
        const mockConnected = Math.random() > 0.1 // 90% success rate for demo
        
        if (mockConnected) {
          return {
            name: 'websocket',
            status: 'healthy',
            message: 'WebSocket connection active',
          }
        } else {
          return {
            name: 'websocket',
            status: 'degraded',
            message: 'WebSocket connection unavailable',
          }
        }
      } catch (error) {
        return {
          name: 'websocket',
          status: 'unhealthy',
          message: `WebSocket check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    })

    // Performance check
    this.registerCheck('performance', async () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart
        
        if (loadTime > 5000) {
          return {
            name: 'performance',
            status: 'degraded',
            message: `Slow page load time: ${Math.round(loadTime)}ms`,
            metadata: { loadTime },
          }
        } else if (loadTime > 10000) {
          return {
            name: 'performance',
            status: 'unhealthy',
            message: `Very slow page load time: ${Math.round(loadTime)}ms`,
            metadata: { loadTime },
          }
        } else {
          return {
            name: 'performance',
            status: 'healthy',
            message: `Good page load time: ${Math.round(loadTime)}ms`,
            metadata: { loadTime },
          }
        }
      } else {
        return {
          name: 'performance',
          status: 'degraded',
          message: 'Performance timing not available',
        }
      }
    })

    // Error rate check
    this.registerCheck('errorRate', async () => {
      // Mock error rate check - in real app would check actual error metrics
      const errorRate = Math.random() * 10 // 0-10% error rate
      
      if (errorRate > 5) {
        return {
          name: 'errorRate',
          status: 'unhealthy',
          message: `High error rate: ${errorRate.toFixed(1)}%`,
          metadata: { errorRate },
        }
      } else if (errorRate > 2) {
        return {
          name: 'errorRate',
          status: 'degraded',
          message: `Elevated error rate: ${errorRate.toFixed(1)}%`,
          metadata: { errorRate },
        }
      } else {
        return {
          name: 'errorRate',
          status: 'healthy',
          message: `Normal error rate: ${errorRate.toFixed(1)}%`,
          metadata: { errorRate },
        }
      }
    })
  }

  /**
   * Calculate overall system health
   */
  private calculateOverallHealth(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
    if (checks.length === 0) {
      return 'healthy'
    }

    const unhealthyCount = checks.filter(check => check.status === 'unhealthy').length
    const degradedCount = checks.filter(check => check.status === 'degraded').length

    if (unhealthyCount > 0) {
      return 'unhealthy'
    } else if (degradedCount > 0) {
      return 'degraded'
    } else {
      return 'healthy'
    }
  }

  /**
   * Start periodic health checks
   */
  private startPeriodicChecks(): void {
    // Run initial check
    this.runAllChecks().catch(error => {
      console.error('Initial health check failed:', error)
    })

    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.runAllChecks().catch(error => {
        console.error('Periodic health check failed:', error)
      })
    }, this.config.interval)
  }

  /**
   * Utility methods
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Health check timed out after ${timeout}ms`))
      }, timeout)
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<HealthCheckConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Restart periodic checks if interval changed
    if (newConfig.interval && this.checkInterval) {
      clearInterval(this.checkInterval)
      this.startPeriodicChecks()
    }
  }

  /**
   * Get health check statistics
   */
  getStatistics(): {
    totalChecks: number
    healthyChecks: number
    degradedChecks: number
    unhealthyChecks: number
    averageResponseTime: number
    uptime: number
  } {
    const checks = Array.from(this.lastResults.values())
    const totalChecks = checks.length
    const healthyChecks = checks.filter(c => c.status === 'healthy').length
    const degradedChecks = checks.filter(c => c.status === 'degraded').length
    const unhealthyChecks = checks.filter(c => c.status === 'unhealthy').length
    
    const avgResponseTime = checks.length > 0
      ? checks.reduce((sum, check) => sum + (check.duration || 0), 0) / checks.length
      : 0

    return {
      totalChecks,
      healthyChecks,
      degradedChecks,
      unhealthyChecks,
      averageResponseTime,
      uptime: Date.now() - this.startTime,
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    
    this.checks.clear()
    this.lastResults.clear()
  }
}

// Singleton instance
export const healthCheckService = new HealthCheckService({
  enabledChecks: ['memory', 'localStorage', 'network', 'performance', 'errorRate'],
})