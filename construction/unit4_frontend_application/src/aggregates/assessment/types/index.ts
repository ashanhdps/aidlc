// Import types first
import type {
  Assessment,
  Template,
  FormSection,
  FormField,
  ValidationRule,
  DraftState,
} from '../../../types/domain'

import type { ValidationResult } from '../../../types/common'

// Assessment-specific types
export interface AssessmentFormState {
  currentAssessment: string | null
  responses: Record<string, any>
  validationResults: Record<string, ValidationResult>
  isDirty: boolean
  lastSaved: string | null
}

export interface SubmissionProgress {
  assessmentId: string
  progress: number
  status: 'idle' | 'submitting' | 'success' | 'error'
  error?: string
}

export interface FormFieldProps {
  field: FormField
  value: any
  onChange: (value: any) => void
  readOnly?: boolean
  validationResult?: ValidationResult
}

export interface FormSectionProps {
  section: FormSection
  responses: Record<string, any>
  onFieldChange: (fieldId: string, value: any) => void
  readOnly?: boolean
  validationResults?: Record<string, ValidationResult>
}

// Re-export domain types for convenience
export type {
  Assessment,
  Template,
  FormSection,
  FormField,
  ValidationRule,
  DraftState,
  ValidationResult,
}