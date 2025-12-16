import React, { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import { Save as SaveIcon, Send as SendIcon } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../../hooks/redux'
import { FormRenderer } from './FormRenderer'
import { ProgressIndicator } from './ProgressIndicator'
import { ValidationDisplay } from './ValidationDisplay'
import { DraftManager } from '../services/DraftManager'
import { FormValidationService } from '../services/FormValidationService'
import {
  setCurrentForm,
  updateResponse,
  saveDraft,
  startSubmission,
  completeSubmission,
  setValidationResult,
} from '../store/assessmentSlice'
import { Assessment, Template } from '../../../types/domain'

interface AssessmentContainerProps {
  assessment: Assessment
  template: Template
  onSubmit?: (assessment: Assessment) => void
  onSave?: (assessment: Assessment) => void
  readOnly?: boolean
}

export const AssessmentContainer: React.FC<AssessmentContainerProps> = ({
  assessment,
  template,
  onSubmit,
  onSave,
  readOnly = false,
}) => {
  const dispatch = useAppDispatch()
  const { currentForm, loading } = useAppSelector((state) => state.assessment)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)

  const draftManager = new DraftManager()
  const validationService = new FormValidationService()

  useEffect(() => {
    dispatch(setCurrentForm(assessment))
    
    // Load draft if exists
    const draft = draftManager.loadDraft(assessment.id)
    if (draft) {
      // Merge draft responses with current assessment
      const updatedAssessment = {
        ...assessment,
        responses: { ...assessment.responses, ...draft.responses },
      }
      dispatch(setCurrentForm(updatedAssessment))
    }
  }, [assessment, dispatch])

  useEffect(() => {
    // Auto-save functionality
    if (autoSaveEnabled && currentForm?.isDirty && !readOnly) {
      const autoSaveTimer = setTimeout(() => {
        handleSave()
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(autoSaveTimer)
    }
  }, [currentForm?.responses, autoSaveEnabled, readOnly])

  const handleFieldChange = (fieldId: string, value: any) => {
    dispatch(updateResponse({ fieldId, value }))
    
    // Validate field on change
    const field = template.sections
      .flatMap(section => section.fields)
      .find(f => f.id === fieldId)
    
    if (field) {
      const validationResult = validationService.validateField(field, value)
      dispatch(setValidationResult({ fieldId, result: validationResult }))
    }
  }

  const handleSave = async () => {
    if (!currentForm) return

    try {
      const updatedAssessment = {
        ...assessment,
        responses: currentForm.responses,
        updatedAt: new Date().toISOString(),
      }

      // Save draft
      dispatch(saveDraft({
        assessmentId: assessment.id,
        responses: currentForm.responses,
      }))

      // Save to repository
      await draftManager.saveDraft(assessment.id, currentForm.responses)
      
      onSave?.(updatedAssessment)
    } catch (error) {
      console.error('Failed to save assessment:', error)
    }
  }

  const handleSubmit = async () => {
    if (!currentForm) return

    // Validate entire form
    const validationResults = validationService.validateForm(template, currentForm.responses)
    const hasErrors = Object.values(validationResults).some(result => !result.isValid)

    if (hasErrors) {
      // Set validation results in store
      Object.entries(validationResults).forEach(([fieldId, result]) => {
        dispatch(setValidationResult({ fieldId, result }))
      })
      return
    }

    try {
      dispatch(startSubmission(assessment.id))
      
      const submittedAssessment = {
        ...assessment,
        responses: currentForm.responses,
        status: 'submitted' as const,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Simulate submission progress
      for (let progress = 0; progress <= 100; progress += 20) {
        dispatch(updateSubmissionProgress({ index: 0, progress }))
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      dispatch(completeSubmission({ index: 0, success: true }))
      onSubmit?.(submittedAssessment)
      setSubmitDialogOpen(false)
    } catch (error) {
      dispatch(completeSubmission({ 
        index: 0, 
        success: false, 
        error: error instanceof Error ? error.message : 'Submission failed' 
      }))
    }
  }

  const calculateProgress = () => {
    if (!currentForm || !template) return 0
    
    const totalFields = template.sections.reduce((sum, section) => sum + section.fields.length, 0)
    const completedFields = Object.keys(currentForm.responses).length
    
    return Math.round((completedFields / totalFields) * 100)
  }

  const canSubmit = () => {
    if (!currentForm || readOnly) return false
    
    const requiredFields = template.sections
      .flatMap(section => section.fields)
      .filter(field => field.required)
    
    return requiredFields.every(field => 
      currentForm.responses[field.id] !== undefined && 
      currentForm.responses[field.id] !== ''
    )
  }

  if (loading.isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Loading assessment...
        </Typography>
      </Box>
    )
  }

  if (loading.error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {loading.error}
      </Alert>
    )
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', pb: 10 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {template.name}
        </Typography>
        {template.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {template.description}
          </Typography>
        )}
        
        <ProgressIndicator 
          progress={calculateProgress()}
          totalSections={template.sections.length}
          completedSections={template.sections.filter(section => 
            section.fields.every(field => currentForm?.responses[field.id])
          ).length}
        />
      </Paper>

      {/* Validation Display */}
      {currentForm && (
        <ValidationDisplay 
          validationResults={currentForm.validationResults}
          sx={{ mb: 3 }}
        />
      )}

      {/* Form Content */}
      {currentForm && (
        <FormRenderer
          template={template}
          responses={currentForm.responses}
          onFieldChange={handleFieldChange}
          readOnly={readOnly}
          validationResults={currentForm.validationResults}
        />
      )}

      {/* Auto-save indicator */}
      {currentForm?.lastSaved && (
        <Box sx={{ position: 'fixed', bottom: 100, right: 24, zIndex: 1000 }}>
          <Alert severity="success" variant="outlined">
            Last saved: {new Date(currentForm.lastSaved).toLocaleTimeString()}
          </Alert>
        </Box>
      )}

      {/* Action Buttons */}
      {!readOnly && (
        <>
          <Fab
            color="secondary"
            sx={{ position: 'fixed', bottom: 80, right: 24 }}
            onClick={handleSave}
            disabled={!currentForm?.isDirty}
          >
            <SaveIcon />
          </Fab>
          
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 16, right: 24 }}
            onClick={() => setSubmitDialogOpen(true)}
            disabled={!canSubmit()}
          >
            <SendIcon />
          </Fab>
        </>
      )}

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)}>
        <DialogTitle>Submit Assessment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit this assessment? Once submitted, you won't be able to make changes.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Progress: {calculateProgress()}% complete
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}