import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Assessment, DraftState } from '../../../types/domain'
import { ValidationResult, LoadingState } from '../../../types/common'

interface FormState {
  currentAssessment: Assessment | null
  responses: Record<string, any>
  validationResults: Record<string, ValidationResult>
  isDirty: boolean
  lastSaved: string | null
}

interface SubmissionState {
  isSubmitting: boolean
  submitProgress: number
  submitError: string | null
}

interface AssessmentState {
  forms: FormState[]
  drafts: DraftState[]
  validations: ValidationResult[]
  submissions: SubmissionState[]
  currentForm: FormState | null
  loading: LoadingState
}

const initialState: AssessmentState = {
  forms: [],
  drafts: [],
  validations: [],
  submissions: [],
  currentForm: null,
  loading: {
    isLoading: false,
    error: null,
  },
}

export const assessmentSlice = createSlice({
  name: 'assessment',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.isLoading = action.payload
      if (action.payload) {
        state.loading.error = null
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.loading.error = action.payload
      state.loading.isLoading = false
    },
    setCurrentForm: (state, action: PayloadAction<Assessment>) => {
      state.currentForm = {
        currentAssessment: action.payload,
        responses: action.payload.responses || {},
        validationResults: {},
        isDirty: false,
        lastSaved: null,
      }
    },
    updateResponse: (state, action: PayloadAction<{ fieldId: string; value: any }>) => {
      if (state.currentForm) {
        state.currentForm.responses[action.payload.fieldId] = action.payload.value
        state.currentForm.isDirty = true
      }
    },
    setValidationResult: (state, action: PayloadAction<{ fieldId: string; result: ValidationResult }>) => {
      if (state.currentForm) {
        state.currentForm.validationResults[action.payload.fieldId] = action.payload.result
      }
    },
    saveDraft: (state, action: PayloadAction<{ assessmentId: string; responses: Record<string, any> }>) => {
      const existingDraftIndex = state.drafts.findIndex(d => d.assessmentId === action.payload.assessmentId)
      const draft: DraftState = {
        assessmentId: action.payload.assessmentId,
        responses: action.payload.responses,
        lastSaved: new Date().toISOString(),
        autoSaveEnabled: true,
      }
      
      if (existingDraftIndex >= 0) {
        state.drafts[existingDraftIndex] = draft
      } else {
        state.drafts.push(draft)
      }
      
      if (state.currentForm) {
        state.currentForm.isDirty = false
        state.currentForm.lastSaved = draft.lastSaved
      }
    },
    startSubmission: (state, action: PayloadAction<string>) => {
      state.submissions.push({
        isSubmitting: true,
        submitProgress: 0,
        submitError: null,
      })
    },
    updateSubmissionProgress: (state, action: PayloadAction<{ index: number; progress: number }>) => {
      if (state.submissions[action.payload.index]) {
        state.submissions[action.payload.index].submitProgress = action.payload.progress
      }
    },
    completeSubmission: (state, action: PayloadAction<{ index: number; success: boolean; error?: string }>) => {
      if (state.submissions[action.payload.index]) {
        state.submissions[action.payload.index].isSubmitting = false
        state.submissions[action.payload.index].submitProgress = 100
        if (!action.payload.success && action.payload.error) {
          state.submissions[action.payload.index].submitError = action.payload.error
        }
      }
      
      if (action.payload.success && state.currentForm) {
        state.currentForm.isDirty = false
      }
    },
    loadDraft: (state, action: PayloadAction<string>) => {
      const draft = state.drafts.find(d => d.assessmentId === action.payload)
      if (draft && state.currentForm) {
        state.currentForm.responses = draft.responses
        state.currentForm.lastSaved = draft.lastSaved
        state.currentForm.isDirty = false
      }
    },
    clearValidation: (state, action: PayloadAction<string>) => {
      if (state.currentForm && state.currentForm.validationResults[action.payload]) {
        delete state.currentForm.validationResults[action.payload]
      }
    },
    resetForm: (state) => {
      state.currentForm = null
    },
  },
})

export const {
  setLoading,
  setError,
  setCurrentForm,
  updateResponse,
  setValidationResult,
  saveDraft,
  startSubmission,
  updateSubmissionProgress,
  completeSubmission,
  loadDraft,
  clearValidation,
  resetForm,
} = assessmentSlice.actions