// Common types used across the application

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface ValidationResult {
  isValid: boolean
  message: string
  severity: 'error' | 'warning' | 'info'
  details?: string[]
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface TimeRange {
  startDate: string
  endDate: string
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
}

export interface FilterContext {
  timeRange: TimeRange
  categories?: string[]
  status?: string[]
  search?: string
}

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'draft'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type KPIStatus = 'green' | 'yellow' | 'red'
export type Trend = 'up' | 'down' | 'stable'

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
}