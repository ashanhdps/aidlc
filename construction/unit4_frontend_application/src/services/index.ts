// Shared services exports
export * from './repositories'
export { EventStore } from './EventStore'
export { ExportGenerationService } from './ExportGenerationService'
export { WebSocketManager, webSocketManager } from './WebSocketManager'
export { CacheManager, globalCache, sessionCache, longTermCache } from './CacheManager'
export { MetricsService, metricsService } from './MetricsService'
export { HealthCheckService, healthCheckService } from './HealthCheckService'

export type { 
  ExportOptions, 
  ExportData,
  WebSocketMessage,
  WebSocketConfig,
  CacheEntry,
  CacheOptions,
  PerformanceMetric,
  UserInteractionMetric,
  SystemMetric,
  HealthCheck,
  SystemHealth,
} from './ExportGenerationService'