import { FormField, ValidationRule, Template } from '../../../types/domain'
import { ValidationResult } from '../../../types/common'

export class FormValidationService {
  /**
   * Validate a single field value
   */
  validateField(field: FormField, value: any): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check required validation
    if (field.required && this.isEmpty(value)) {
      errors.push(`${field.label} is required`)
    }

    // Skip other validations if field is empty and not required
    if (this.isEmpty(value) && !field.required) {
      return {
        isValid: true,
        message: '',
        severity: 'info',
      }
    }

    // Apply field-specific validations
    if (field.validation) {
      for (const rule of field.validation) {
        const result = this.validateRule(rule, value, field.label)
        if (result.severity === 'error') {
          errors.push(result.message)
        } else if (result.severity === 'warning') {
          warnings.push(result.message)
        }
      }
    }

    // Type-specific validations
    const typeValidation = this.validateFieldType(field, value)
    if (!typeValidation.isValid) {
      if (typeValidation.severity === 'error') {
        errors.push(typeValidation.message)
      } else {
        warnings.push(typeValidation.message)
      }
    }

    // Return result
    if (errors.length > 0) {
      return {
        isValid: false,
        message: errors[0], // Return first error
        severity: 'error',
        details: errors,
      }
    }

    if (warnings.length > 0) {
      return {
        isValid: true,
        message: warnings[0], // Return first warning
        severity: 'warning',
        details: warnings,
      }
    }

    return {
      isValid: true,
      message: '',
      severity: 'info',
    }
  }

  /**
   * Validate entire form
   */
  validateForm(template: Template, responses: Record<string, any>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}

    // Validate all fields
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        const value = responses[field.id]
        results[field.id] = this.validateField(field, value)
      })
    })

    // Cross-field validations
    const crossValidations = this.validateCrossFields(template, responses)
    Object.assign(results, crossValidations)

    return results
  }

  /**
   * Validate a single validation rule
   */
  private validateRule(rule: ValidationRule, value: any, fieldLabel: string): ValidationResult {
    switch (rule.type) {
      case 'required':
        return {
          isValid: !this.isEmpty(value),
          message: rule.message || `${fieldLabel} is required`,
          severity: 'error',
        }

      case 'minLength':
        const minLength = rule.value as number
        const isValidMinLength = !value || value.toString().length >= minLength
        return {
          isValid: isValidMinLength,
          message: rule.message || `${fieldLabel} must be at least ${minLength} characters`,
          severity: 'error',
        }

      case 'maxLength':
        const maxLength = rule.value as number
        const isValidMaxLength = !value || value.toString().length <= maxLength
        return {
          isValid: isValidMaxLength,
          message: rule.message || `${fieldLabel} must be no more than ${maxLength} characters`,
          severity: 'error',
        }

      case 'min':
        const minValue = rule.value as number
        const numValue = Number(value)
        const isValidMin = isNaN(numValue) || numValue >= minValue
        return {
          isValid: isValidMin,
          message: rule.message || `${fieldLabel} must be at least ${minValue}`,
          severity: 'error',
        }

      case 'max':
        const maxValue = rule.value as number
        const numValueMax = Number(value)
        const isValidMax = isNaN(numValueMax) || numValueMax <= maxValue
        return {
          isValid: isValidMax,
          message: rule.message || `${fieldLabel} must be no more than ${maxValue}`,
          severity: 'error',
        }

      case 'pattern':
        const pattern = new RegExp(rule.value as string)
        const isValidPattern = !value || pattern.test(value.toString())
        return {
          isValid: isValidPattern,
          message: rule.message || `${fieldLabel} format is invalid`,
          severity: 'error',
        }

      case 'custom':
        // Custom validation would be implemented based on specific requirements
        return {
          isValid: true,
          message: '',
          severity: 'info',
        }

      default:
        return {
          isValid: true,
          message: '',
          severity: 'info',
        }
    }
  }

  /**
   * Validate field based on its type
   */
  private validateFieldType(field: FormField, value: any): ValidationResult {
    switch (field.type) {
      case 'email':
        if (value && !this.isValidEmail(value)) {
          return {
            isValid: false,
            message: 'Please enter a valid email address',
            severity: 'error',
          }
        }
        break

      case 'number':
        if (value && isNaN(Number(value))) {
          return {
            isValid: false,
            message: 'Please enter a valid number',
            severity: 'error',
          }
        }
        break

      case 'date':
        if (value && !this.isValidDate(value)) {
          return {
            isValid: false,
            message: 'Please enter a valid date',
            severity: 'error',
          }
        }
        break

      case 'rating':
        const rating = Number(value)
        if (value && (isNaN(rating) || rating < 1 || rating > 5)) {
          return {
            isValid: false,
            message: 'Rating must be between 1 and 5',
            severity: 'error',
          }
        }
        break

      case 'file':
        if (value && !this.isValidFile(value)) {
          return {
            isValid: false,
            message: 'Please select a valid file',
            severity: 'error',
          }
        }
        break
    }

    return {
      isValid: true,
      message: '',
      severity: 'info',
    }
  }

  /**
   * Cross-field validations
   */
  private validateCrossFields(template: Template, responses: Record<string, any>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}

    // Example: Date range validation
    const startDateField = this.findFieldByLabel(template, 'Start Date')
    const endDateField = this.findFieldByLabel(template, 'End Date')

    if (startDateField && endDateField) {
      const startDate = responses[startDateField.id]
      const endDate = responses[endDateField.id]

      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        results[endDateField.id] = {
          isValid: false,
          message: 'End date must be after start date',
          severity: 'error',
        }
      }
    }

    // Example: Conditional required fields
    const hasManagerField = this.findFieldByLabel(template, 'Has Manager')
    const managerNameField = this.findFieldByLabel(template, 'Manager Name')

    if (hasManagerField && managerNameField) {
      const hasManager = responses[hasManagerField.id]
      const managerName = responses[managerNameField.id]

      if (hasManager === 'yes' && this.isEmpty(managerName)) {
        results[managerNameField.id] = {
          isValid: false,
          message: 'Manager name is required when you have a manager',
          severity: 'error',
        }
      }
    }

    return results
  }

  /**
   * Helper methods
   */
  private isEmpty(value: any): boolean {
    return value === null || 
           value === undefined || 
           value === '' || 
           (Array.isArray(value) && value.length === 0)
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidDate(date: string): boolean {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }

  private isValidFile(file: any): boolean {
    return file && 
           typeof file === 'object' && 
           file.name && 
           file.size !== undefined
  }

  private findFieldByLabel(template: Template, label: string): FormField | null {
    for (const section of template.sections) {
      const field = section.fields.find(f => f.label === label)
      if (field) return field
    }
    return null
  }

  /**
   * Get validation summary
   */
  getValidationSummary(validationResults: Record<string, ValidationResult>): {
    totalFields: number
    validFields: number
    errorFields: number
    warningFields: number
    isFormValid: boolean
  } {
    const entries = Object.entries(validationResults)
    const totalFields = entries.length
    const errorFields = entries.filter(([_, result]) => !result.isValid && result.severity === 'error').length
    const warningFields = entries.filter(([_, result]) => !result.isValid && result.severity === 'warning').length
    const validFields = totalFields - errorFields - warningFields

    return {
      totalFields,
      validFields,
      errorFields,
      warningFields,
      isFormValid: errorFields === 0,
    }
  }

  /**
   * Get field completion percentage
   */
  getCompletionPercentage(template: Template, responses: Record<string, any>): number {
    const allFields = template.sections.flatMap(section => section.fields)
    const completedFields = allFields.filter(field => !this.isEmpty(responses[field.id]))
    
    return allFields.length > 0 ? Math.round((completedFields.length / allFields.length) * 100) : 0
  }
}