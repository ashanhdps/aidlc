import { useEffect, DependencyList } from 'react'
import { store } from '../store/store'
import { webSocketManager } from '../services/WebSocketManager'
import { healthCheckService } from '../services/HealthCheckService'
import { metricsService } from '../services/MetricsService'
import { offlineManager } from '../utils/offlineSupport'
import { performanceMonitor } from '../utils/performance'

// Cross-aggregate communication events
export enum IntegrationEvents {
  // Dashboard events
  DASHBOARD_UPDATED = 'dashboard:updated',
  WIDGET_ADDED = 'dashboard:widget_added',
  WIDGET_REMOVED = 'dashboard:widget_removed',
  
  // Assessment events
  ASSESSMENT_STARTED = 'assessment:started',
  ASSESSMENT_COMPLETED = 'assessment:completed',
  ASSESSMENT_DRAFT_SAVED = 'assessment:draft_saved',
  
  // Feedback events
  FEEDBACK_RECEIVED = 'feedback:received',
  FEEDBACK_SENT = 'feedback:sent',
  FEEDBACK_THREAD_UPDATED = 'feedback:thread_updated',
  
  // KPI events
  KPI_UPDATED = 'kpi:updated',
  KPI_TARGET_CHANGED = 'kpi:target_changed',
  KPI_STATUS_CHANGED = 'kpi:status_changed',
  
  // User events
  USER_PREFERENCES_CHANGED = 'user:preferences_changed',
  USER_ROLE_CHANGED = 'user:role_changed',
  
  // System events
  SYSTEM_ERROR = 'system:error',
  SYSTEM_MAINTENANCE = 'system:maintenance',
  SYSTEM_UPDATE_AVAILABLE = 'system:update_available'
}

// Event payload types
export interface IntegrationEventPayload {
  [IntegrationEvents.DASHBOARD_UPDATED]: { dashboardId: string; userId: string }
  [IntegrationEvents.WIDGET_ADDED]: { widgetId: string; dashboardId: string; type: string }
  [IntegrationEvents.WIDGET_REMOVED]: { widgetId: string; dashboardId: string }
  [IntegrationEvents.ASSESSMENT_STARTED]: { assessmentId: string; templateId: string; userId: string }
  [IntegrationEvents.ASSESSMENT_COMPLETED]: { assessmentId: string; userId: string; score?: number }
  [IntegrationEvents.ASSESSMENT_DRAFT_SAVED]: { assessmentId: string; userId: string }
  [IntegrationEvents.FEEDBACK_RECEIVED]: { threadId: string; messageId: string; userId: string }
  [IntegrationEvents.FEEDBACK_SENT]: { threadId: string; messageId: string; senderId: string }
  [IntegrationEvents.FEEDBACK_THREAD_UPDATED]: { threadId: string; status: string }
  [IntegrationEvents.KPI_UPDATED]: { kpiId: string; userId: string; value: number; target: number }
  [IntegrationEvents.KPI_TARGET_CHANGED]: { kpiId: string; oldTarget: number; newTarget: number }
  [IntegrationEvents.KPI_STATUS_CHANGED]: { kpiId: string; oldStatus: string; newStatus: string }
  [IntegrationEvents.USER_PREFERENCES_CHANGED]: { userId: string; preferences: any }
  [IntegrationEvents.USER_ROLE_CHANGED]: { userId: string; oldRole: string; newRole: string }
  [IntegrationEvents.SYSTEM_ERROR]: { error: string; context?: string }
  [IntegrationEvents.SYSTEM_MAINTENANCE]: { startTime: string; endTime: string; message: string }
  [IntegrationEvents.SYSTEM_UPDATE_AVAILABLE]: { version: string; features: string[] }
}

// Integration event manager
class IntegrationEventManager {
  private static instance: IntegrationEventManager
  private listeners: Map<IntegrationEvents, Set<(payload: any) => void>> = new Map()

  static getInstance(): IntegrationEventManager {
    if (!IntegrationEventManager.instance) {
      IntegrationEventManager.instance = new IntegrationEventManager()
    }
    return IntegrationEventManager.instance
  }

  // Subscribe to events
  subscribe<T extends IntegrationEvents>(
    event: T,
    callback: (payload: IntegrationEventPayload[T]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    
    this.listeners.get(event)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  // Emit events
  emit<T extends IntegrationEvents>(event: T, payload: IntegrationEventPayload[T]): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(payload)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }

    // Track event for metrics
    metricsService.trackUserInteraction(
      'integration_event',
      'IntegrationEventManager',
      undefined,
      { event, payload }
    )
  }

  // Get all active listeners
  getActiveListeners(): Record<string, number> {
    const result: Record<string, number> = {}
    this.listeners.forEach((listeners, event) => {
      result[event] = listeners.size
    })
    return result
  }
}

// Application integration orchestrator
export class ApplicationIntegrator {
  private static instance: ApplicationIntegrator
  private eventManager: IntegrationEventManager
  private isInitialized = false

  static getInstance(): ApplicationIntegrator {
    if (!ApplicationIntegrator.instance) {
      ApplicationIntegrator.instance = new ApplicationIntegrator()
    }
    return ApplicationIntegrator.instance
  }

  constructor() {
    this.eventManager = IntegrationEventManager.getInstance()
  }

  // Initialize all integrations
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    performanceMonitor.mark('integration_init')

    try {
      // Initialize services
      await this.initializeServices()
      
      // Setup cross-aggregate communication
      this.setupCrossAggregateEvents()
      
      // Setup real-time updates
      this.setupRealTimeUpdates()
      
      // Setup offline support
      this.setupOfflineSupport()
      
      // Setup health monitoring
      this.setupHealthMonitoring()

      this.isInitialized = true
      
      performanceMonitor.measure('integration_init')
      
      console.log('Application integration initialized successfully')
    } catch (error) {
      console.error('Failed to initialize application integration:', error)
      throw error
    }
  }

  private async initializeServices(): Promise<void> {
    // Initialize WebSocket connection
    await webSocketManager.connect()
    
    // Start health checks (if method exists)
    if (typeof (healthCheckService as any).startMonitoring === 'function') {
      (healthCheckService as any).startMonitoring()
    }
    
    // Initialize metrics collection (if method exists)
    if (typeof (metricsService as any).startCollection === 'function') {
      (metricsService as any).startCollection()
    }
  }

  private setupCrossAggregateEvents(): void {
    // Dashboard -> Assessment integration
    this.eventManager.subscribe(IntegrationEvents.KPI_UPDATED, (payload) => {
      // Trigger assessment recommendations based on KPI changes
      store.dispatch({
        type: 'assessment/triggerRecommendation',
        payload: { kpiId: payload.kpiId, value: payload.value }
      })
    })

    // Assessment -> Feedback integration
    this.eventManager.subscribe(IntegrationEvents.ASSESSMENT_COMPLETED, (payload) => {
      // Create feedback thread for completed assessment
      store.dispatch({
        type: 'feedback/createAssessmentThread',
        payload: { assessmentId: payload.assessmentId, userId: payload.userId }
      })
    })

    // Feedback -> Dashboard integration
    this.eventManager.subscribe(IntegrationEvents.FEEDBACK_RECEIVED, (payload) => {
      // Update dashboard notifications
      store.dispatch({
        type: 'dashboard/addNotification',
        payload: { type: 'feedback', threadId: payload.threadId }
      })
    })

    // User preferences -> All aggregates
    this.eventManager.subscribe(IntegrationEvents.USER_PREFERENCES_CHANGED, (payload) => {
      // Update theme across all components
      store.dispatch({
        type: 'session/updatePreferences',
        payload: payload.preferences
      })
    })
  }

  private setupRealTimeUpdates(): void {
    // Subscribe to WebSocket events and emit integration events (if method exists)
    if (typeof (webSocketManager as any).subscribe === 'function') {
      (webSocketManager as any).subscribe('kpi_updated', (data: any) => {
        this.eventManager.emit(IntegrationEvents.KPI_UPDATED, data)
      })

      (webSocketManager as any).subscribe('feedback_received', (data: any) => {
        this.eventManager.emit(IntegrationEvents.FEEDBACK_RECEIVED, data)
      })

      (webSocketManager as any).subscribe('system_maintenance', (data: any) => {
        this.eventManager.emit(IntegrationEvents.SYSTEM_MAINTENANCE, data)
      })
    }
  }

  private setupOfflineSupport(): void {
    // Handle offline/online state changes
    this.eventManager.subscribe(IntegrationEvents.SYSTEM_ERROR, (payload) => {
      if (payload.error.includes('network') || payload.error.includes('connection')) {
        // Queue actions for offline processing
        offlineManager.processQueue()
      }
    })
  }

  private setupHealthMonitoring(): void {
    // Monitor system health and emit events (if method exists)
    if (typeof (healthCheckService as any).onHealthChange === 'function') {
      (healthCheckService as any).onHealthChange((health: any) => {
        if (!health.isHealthy) {
          this.eventManager.emit(IntegrationEvents.SYSTEM_ERROR, {
            error: 'System health check failed',
            context: JSON.stringify(health.checks)
          })
        }
      })
    }
  }

  // Get integration status
  getStatus(): {
    initialized: boolean
    services: Record<string, boolean>
    eventListeners: Record<string, number>
    performance: Record<string, any>
  } {
    return {
      initialized: this.isInitialized,
      services: {
        webSocket: typeof (webSocketManager as any).isConnected === 'function' 
          ? (webSocketManager as any).isConnected() 
          : false,
        healthCheck: typeof (healthCheckService as any).isMonitoring === 'function' 
          ? (healthCheckService as any).isMonitoring() 
          : false,
        metrics: typeof (metricsService as any).isCollecting === 'function' 
          ? (metricsService as any).isCollecting() 
          : false,
        offline: offlineManager.getOnlineStatus()
      },
      eventListeners: this.eventManager.getActiveListeners(),
      performance: performanceMonitor.getAllMetrics()
    }
  }

  // Cleanup on app shutdown
  cleanup(): void {
    webSocketManager.disconnect()
    
    // Stop health monitoring (if method exists)
    if (typeof (healthCheckService as any).stopMonitoring === 'function') {
      (healthCheckService as any).stopMonitoring()
    }
    
    // Stop metrics collection (if method exists)
    if (typeof (metricsService as any).stopCollection === 'function') {
      (metricsService as any).stopCollection()
    }
    
    this.isInitialized = false
  }
}

// Export singleton instance
export const applicationIntegrator = ApplicationIntegrator.getInstance()
export const integrationEventManager = IntegrationEventManager.getInstance()

// Utility functions for components
export const useIntegrationEvent = <T extends IntegrationEvents>(
  event: T,
  callback: (payload: IntegrationEventPayload[T]) => void,
  deps: DependencyList = []
) => {
  useEffect(() => {
    const unsubscribe = integrationEventManager.subscribe(event, callback)
    return unsubscribe
  }, deps)
}

export const emitIntegrationEvent = <T extends IntegrationEvents>(
  event: T,
  payload: IntegrationEventPayload[T]
) => {
  integrationEventManager.emit(event, payload)
}