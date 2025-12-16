// API-specific types for request/response handling

import { ApiResponse, ApiError } from './common'
import { 
  KPI, 
  Assignment, 
  Template, 
  Assessment, 
  FeedbackThread, 
  PerformanceData, 
  InsightData 
} from './domain'

// API Response Types
export type KPIResponse = ApiResponse<KPI[]>
export type AssignmentResponse = ApiResponse<Assignment[]>
export type TemplateResponse = ApiResponse<Template[]>
export type AssessmentResponse = ApiResponse<Assessment[]>
export type FeedbackResponse = ApiResponse<FeedbackThread[]>
export type PerformanceResponse = ApiResponse<PerformanceData[]>
export type InsightResponse = ApiResponse<InsightData[]>

// API Request Types
export interface CreateAssessmentRequest {
  templateId: string
  userId: string
  reviewerId?: string
}

export interface UpdateAssessmentRequest {
  id: string
  responses: Record<string, any>
  status?: 'draft' | 'submitted'
}

export interface CreateFeedbackRequest {
  title: string
  content: string
  recipientId: string
  kpiId?: string
  assessmentId?: string
}

export interface UpdateKPIRequest {
  id: string
  current: number
  notes?: string
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: string
  payload: any
  timestamp: string
  source: string
}

export interface DashboardUpdateEvent extends WebSocketEvent {
  type: 'dashboard:kpi-updated' | 'dashboard:widget-updated' | 'dashboard:filter-applied'
  payload: {
    userId: string
    kpiId?: string
    widgetId?: string
    data: any
  }
}

export interface FeedbackUpdateEvent extends WebSocketEvent {
  type: 'feedback:new-feedback' | 'feedback:thread-updated' | 'feedback:message-read'
  payload: {
    userId: string
    threadId: string
    messageId?: string
    data: any
  }
}

export interface AssessmentUpdateEvent extends WebSocketEvent {
  type: 'assessment:status-changed' | 'assessment:reminder' | 'assessment:completed'
  payload: {
    assessmentId: string
    userId: string
    status: string
    data: any
  }
}

// Export Generation Types
export interface ExportRequest {
  type: 'csv' | 'excel' | 'pdf'
  data: any[]
  filename: string
  options?: ExportOptions
}

export interface ExportOptions {
  includeHeaders?: boolean
  dateFormat?: string
  numberFormat?: string
  filters?: Record<string, any>
}

export interface ExportJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  downloadUrl?: string
  error?: string
  createdAt: string
  completedAt?: string
}

// Cache Types
export interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
  key: string
}

export interface CachePolicy {
  ttl: number
  maxSize: number
  strategy: 'lru' | 'fifo' | 'ttl'
}

// Health Check Types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  checks: HealthCheck[]
  version: string
}

export interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy'
  details: string
  responseTime?: number
}