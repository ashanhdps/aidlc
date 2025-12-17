// Visualization-specific types
export interface ChartMetrics {
  renderTime: number
  dataPoints: number
  interactionCount: number
  exportCount: number
}

export interface VisualizationPerformance {
  visualizationId: string
  loadTime: number
  renderTime: number
  memoryUsage: number
  errorCount: number
}

export interface ChartInteraction {
  type: 'click' | 'hover' | 'zoom' | 'pan' | 'select'
  timestamp: string
  data: any
  userId?: string
}

export interface ExportJob {
  id: string
  visualizationId: string
  format: 'csv' | 'excel' | 'pdf' | 'png'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  downloadUrl?: string
  error?: string
  createdAt: string
  completedAt?: string
}