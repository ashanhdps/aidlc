// Domain-specific types based on the domain model

import { BaseEntity, Status, Priority, KPIStatus, Trend, TimeRange, FilterContext } from './common'

// Dashboard Aggregate Types
export interface Dashboard extends BaseEntity {
  userId: string
  name: string
  description?: string
  layout: DashboardLayout
  widgets: DashboardWidget[]
  filters: FilterContext
  isDefault: boolean
}

export interface DashboardWidget {
  id: string
  type: 'kpi' | 'chart' | 'insight' | 'custom'
  title: string
  configuration: WidgetConfiguration
  position: LayoutPosition
  data?: any
}

export interface DashboardLayout {
  columns: number
  rows: number
  responsive: boolean
}

export interface WidgetConfiguration {
  chartType?: 'line' | 'bar' | 'pie' | 'heatmap'
  dataSource: string
  refreshInterval: number
  showLegend?: boolean
  colorScheme?: string[]
}

export interface LayoutPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface DashboardConfiguration {
  theme: string
  autoRefresh: boolean
  refreshInterval: number
  defaultTimeRange: TimeRange
}

// KPI Types
export interface KPI extends BaseEntity {
  name: string
  description: string
  current: number
  target: number
  unit: string
  status: KPIStatus
  trend: Trend
  category?: string
  lastUpdated: string
}

export interface Assignment extends BaseEntity {
  kpiId: string
  userId: string
  assignedBy: string
  assignedAt: string
  dueDate: string
  status: Status
  notes?: string
}

// Visualization Types
export interface Visualization extends BaseEntity {
  type: 'line' | 'bar' | 'pie' | 'heatmap' | 'scatter'
  title: string
  data: DataSeries[]
  configuration: ChartConfiguration
}

export interface DataSeries {
  id: string
  name: string
  data: DataPoint[]
  color?: string
}

export interface DataPoint {
  x: string | number
  y: number
  label?: string
  metadata?: Record<string, any>
}

export interface ChartConfiguration {
  width?: number
  height?: number
  responsive: boolean
  legend: LegendConfiguration
  axes: AxisConfiguration
  tooltip: TooltipConfiguration
}

export interface LegendConfiguration {
  show: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
}

export interface AxisConfiguration {
  xAxis: {
    label?: string
    type: 'category' | 'number' | 'time'
  }
  yAxis: {
    label?: string
    type: 'number'
    min?: number
    max?: number
  }
}

export interface TooltipConfiguration {
  show: boolean
  format?: string
}

// Assessment Types
export interface Template extends BaseEntity {
  name: string
  description: string
  sections: FormSection[]
  version: number
}

export interface FormSection {
  id: string
  title: string
  description?: string
  fields: FormField[]
  order: number
}

export interface FormField {
  id: string
  type: 'text' | 'textarea' | 'number' | 'rating' | 'select' | 'multiselect' | 'date' | 'file' | 'email'
  label: string
  placeholder?: string
  required: boolean
  validation?: ValidationRule[]
  options?: string[]
  order: number
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
}

export interface Assessment extends BaseEntity {
  templateId: string
  userId: string
  reviewerId?: string
  status: 'draft' | 'submitted' | 'in_review' | 'completed'
  responses: Record<string, any>
  submittedAt?: string
  completedAt?: string
}

export interface DraftState {
  assessmentId: string
  responses: Record<string, any>
  lastSaved: string
  autoSaveEnabled: boolean
}

// Feedback Types
export interface FeedbackThread extends BaseEntity {
  title: string
  participants: string[]
  messages: FeedbackMessage[]
  status: 'active' | 'resolved' | 'archived'
  kpiId?: string
  assessmentId?: string
}

export interface FeedbackMessage extends BaseEntity {
  threadId: string
  senderId: string
  content: string
  type: 'feedback' | 'response' | 'system'
  sentiment?: 'positive' | 'neutral' | 'constructive'
  readBy: string[]
}

export interface NotificationState {
  unreadCount: number
  notifications: Notification[]
}

export interface Notification extends BaseEntity {
  userId: string
  type: 'feedback' | 'assessment' | 'kpi_update' | 'system'
  title: string
  message: string
  read: boolean
  actionUrl?: string
  priority: Priority
}

// Session Types
export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  department?: string
  managerId?: string
  permissions: string[]
  avatar?: string
}

export interface UserRole {
  id: string
  name: 'employee' | 'supervisor' | 'manager' | 'executive' | 'admin'
  permissions: string[]
}

export interface AuthState {
  isAuthenticated: boolean
  token: string | null
  refreshToken: string | null
  expiresAt: string | null
  user: UserProfile | null
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: NotificationPreferences
  dashboard: DashboardPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  frequency: 'immediate' | 'daily' | 'weekly'
}

export interface DashboardPreferences {
  defaultView: 'personal' | 'team' | 'executive'
  autoRefresh: boolean
  refreshInterval: number
}

// Performance Data Types
export interface PerformanceData extends BaseEntity {
  userId: string
  kpiId: string
  value: number
  target: number
  period: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface InsightData extends BaseEntity {
  type: 'recommendation' | 'trend' | 'alert' | 'achievement'
  title: string
  description: string
  priority: Priority
  actionable: boolean
  kpiIds?: string[]
  userId?: string
}

// Filter Types
export interface KPIFilters {
  userId?: string
  category?: string[]
  status?: KPIStatus[]
  timeRange?: TimeRange
}

export interface AssignmentFilters {
  userId?: string
  kpiId?: string
  status?: Status[]
  dueDate?: TimeRange
}

export interface TemplateFilters {
  name?: string
  version?: number
  active?: boolean
}

export interface AssessmentFilters {
  userId?: string
  templateId?: string
  status?: string[]
  dateRange?: TimeRange
}

export interface PerformanceFilters {
  userId?: string
  kpiId?: string[]
  period?: string
  timeRange?: TimeRange
}