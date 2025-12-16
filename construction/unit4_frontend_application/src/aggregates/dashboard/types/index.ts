// Dashboard-specific types
export interface DashboardMetrics {
  totalWidgets: number
  activeFilters: number
  lastRefresh: string
  refreshRate: number
}

export interface WidgetPerformance {
  widgetId: string
  loadTime: number
  dataSize: number
  errorCount: number
  lastError?: string
}

export interface DashboardAnalytics {
  viewCount: number
  averageSessionTime: number
  mostUsedWidgets: string[]
  filterUsage: Record<string, number>
}