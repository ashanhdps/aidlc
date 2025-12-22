import { 
  KPIDefinition, 
  CreateKPIRequest, 
  KPIAssignment, 
  CreateKPIAssignmentRequest,
  KPIData,
  CreateKPIDataRequest,
  ApprovalWorkflow,
  AISuggestion
} from '../store/api/kpiManagementApi'

/**
 * Service layer for KPI Management operations
 * Provides business logic and data transformation between API and UI components
 */
export class KPIManagementService {
  
  /**
   * Transform KPI Definition for display in UI components
   */
  static transformKPIForDisplay(kpi: KPIDefinition) {
    return {
      ...kpi,
      displayName: kpi.name,
      categoryLabel: this.getCategoryLabel(kpi.category),
      measurementTypeLabel: this.getMeasurementTypeLabel(kpi.measurementType),
      formattedTarget: this.formatTargetValue(kpi.defaultTargetValue, kpi.defaultTargetUnit),
      isActive: kpi.active,
      lastModified: new Date(kpi.updatedAt).toLocaleDateString(),
    }
  }

  /**
   * Transform KPI Assignment for display
   */
  static transformAssignmentForDisplay(assignment: KPIAssignment) {
    return {
      ...assignment,
      formattedTarget: this.formatTargetValue(assignment.targetValue, assignment.targetUnit),
      statusLabel: this.getStatusLabel(assignment.status),
      daysUntilDue: assignment.dueDate ? this.calculateDaysUntilDue(assignment.dueDate) : null,
      isOverdue: assignment.dueDate ? new Date(assignment.dueDate) < new Date() : false,
    }
  }

  /**
   * Calculate performance percentage for KPI data
   */
  static calculatePerformance(kpiData: KPIData, assignment: KPIAssignment): number {
    const { value } = kpiData
    const { targetValue, comparisonType } = assignment

    switch (comparisonType) {
      case 'GREATER_THAN_OR_EQUAL':
      case 'GREATER_THAN':
        return Math.min((value / targetValue) * 100, 100)
      case 'LESS_THAN_OR_EQUAL':
      case 'LESS_THAN':
        return Math.min((targetValue / value) * 100, 100)
      case 'EQUAL':
        return value === targetValue ? 100 : 0
      default:
        return (value / targetValue) * 100
    }
  }

  /**
   * Get performance status based on percentage
   */
  static getPerformanceStatus(percentage: number): 'excellent' | 'good' | 'warning' | 'poor' {
    if (percentage >= 95) return 'excellent'
    if (percentage >= 80) return 'good'
    if (percentage >= 60) return 'warning'
    return 'poor'
  }

  /**
   * Validate KPI Definition data
   */
  static validateKPIDefinition(data: Partial<CreateKPIRequest>): string[] {
    const errors: string[] = []

    if (!data.name?.trim()) {
      errors.push('KPI name is required')
    }

    if (!data.category) {
      errors.push('Category is required')
    }

    if (!data.measurementType) {
      errors.push('Measurement type is required')
    }

    if (data.defaultWeightPercentage !== undefined) {
      if (data.defaultWeightPercentage < 0 || data.defaultWeightPercentage > 100) {
        errors.push('Weight percentage must be between 0 and 100')
      }
    }

    if (data.defaultTargetValue !== undefined && data.defaultTargetValue < 0) {
      errors.push('Target value cannot be negative')
    }

    return errors
  }

  /**
   * Validate KPI Assignment data
   */
  static validateKPIAssignment(data: Partial<CreateKPIAssignmentRequest>): string[] {
    const errors: string[] = []

    if (!data.kpiDefinitionId) {
      errors.push('KPI Definition is required')
    }

    if (!data.employeeId) {
      errors.push('Employee is required')
    }

    if (data.targetValue === undefined || data.targetValue < 0) {
      errors.push('Target value is required and cannot be negative')
    }

    if (!data.targetUnit?.trim()) {
      errors.push('Target unit is required')
    }

    if (!data.comparisonType) {
      errors.push('Comparison type is required')
    }

    if (data.weightPercentage === undefined || data.weightPercentage < 0 || data.weightPercentage > 100) {
      errors.push('Weight percentage must be between 0 and 100')
    }

    if (data.dueDate && new Date(data.dueDate) <= new Date()) {
      errors.push('Due date must be in the future')
    }

    return errors
  }

  /**
   * Generate KPI suggestions based on performance data
   */
  static generateKPISuggestions(
    kpiData: KPIData[], 
    assignments: KPIAssignment[]
  ): { type: string; message: string; priority: 'high' | 'medium' | 'low' }[] {
    const suggestions: { type: string; message: string; priority: 'high' | 'medium' | 'low' }[] = []

    assignments.forEach(assignment => {
      const relatedData = kpiData.filter(data => data.assignmentId === assignment.id)
      
      if (relatedData.length === 0) {
        suggestions.push({
          type: 'missing_data',
          message: `No performance data recorded for KPI assignment ${assignment.id}`,
          priority: 'high'
        })
        return
      }

      const latestData = relatedData.sort((a, b) => 
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      )[0]

      const performance = this.calculatePerformance(latestData, assignment)
      
      if (performance < 60) {
        suggestions.push({
          type: 'underperformance',
          message: `Performance is below 60% for assignment ${assignment.id}. Consider reviewing targets or providing additional support.`,
          priority: 'high'
        })
      } else if (performance > 120) {
        suggestions.push({
          type: 'overperformance',
          message: `Performance exceeds 120% for assignment ${assignment.id}. Consider increasing targets for better challenge.`,
          priority: 'medium'
        })
      }

      // Check for overdue assignments
      if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
        suggestions.push({
          type: 'overdue',
          message: `Assignment ${assignment.id} is overdue. Please review and update status.`,
          priority: 'high'
        })
      }
    })

    return suggestions
  }

  // Helper methods
  private static getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'SALES': 'Sales',
      'PRODUCTIVITY': 'Productivity',
      'QUALITY': 'Quality',
      'CUSTOMER_SATISFACTION': 'Customer Satisfaction',
      'MARKETING': 'Marketing'
    }
    return labels[category] || category
  }

  private static getMeasurementTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'CURRENCY': 'Currency',
      'PERCENTAGE': 'Percentage',
      'COUNT': 'Count',
      'RATIO': 'Ratio',
      'TIME': 'Time'
    }
    return labels[type] || type
  }

  private static formatTargetValue(value?: number, unit?: string): string {
    if (value === undefined) return 'Not set'
    
    const formattedValue = new Intl.NumberFormat().format(value)
    return unit ? `${formattedValue} ${unit}` : formattedValue
  }

  private static getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Active',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    }
    return labels[status] || status
  }

  private static calculateDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}

/**
 * Constants for KPI Management
 */
export const KPI_CONSTANTS = {
  CATEGORIES: [
    { value: 'SALES', label: 'Sales' },
    { value: 'PRODUCTIVITY', label: 'Productivity' },
    { value: 'QUALITY', label: 'Quality' },
    { value: 'CUSTOMER_SATISFACTION', label: 'Customer Satisfaction' },
    { value: 'MARKETING', label: 'Marketing' }
  ],
  
  MEASUREMENT_TYPES: [
    { value: 'CURRENCY', label: 'Currency' },
    { value: 'PERCENTAGE', label: 'Percentage' },
    { value: 'COUNT', label: 'Count' },
    { value: 'RATIO', label: 'Ratio' },
    { value: 'TIME', label: 'Time' }
  ],
  
  COMPARISON_TYPES: [
    { value: 'GREATER_THAN_OR_EQUAL', label: 'Greater than or equal to' },
    { value: 'GREATER_THAN', label: 'Greater than' },
    { value: 'LESS_THAN_OR_EQUAL', label: 'Less than or equal to' },
    { value: 'LESS_THAN', label: 'Less than' },
    { value: 'EQUAL', label: 'Equal to' },
    { value: 'NOT_EQUAL', label: 'Not equal to' }
  ],
  
  FREQUENCY_TYPES: [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'YEARLY', label: 'Yearly' }
  ]
}