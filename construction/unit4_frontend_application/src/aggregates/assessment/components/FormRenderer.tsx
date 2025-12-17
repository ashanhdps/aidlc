import React from 'react'
import { Box, Paper, Typography, Divider } from '@mui/material'
import { FormSection } from './FormSection'
import { Template } from '../../../types/domain'
import { ValidationResult } from '../../../types/common'

interface FormRendererProps {
  template: Template
  responses: Record<string, any>
  onFieldChange: (fieldId: string, value: any) => void
  readOnly?: boolean
  validationResults?: Record<string, ValidationResult>
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  template,
  responses,
  onFieldChange,
  readOnly = false,
  validationResults = {},
}) => {
  const sortedSections = [...template.sections].sort((a, b) => a.order - b.order)

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
      {sortedSections.map((section, index) => (
        <Paper key={section.id} sx={{ mb: 3, overflow: 'hidden' }}>
          {/* Section Header */}
          <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h6" component="h2">
              {section.title}
            </Typography>
            {section.description && (
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                {section.description}
              </Typography>
            )}
          </Box>

          {/* Section Content */}
          <Box sx={{ p: 3 }}>
            <FormSection
              section={section}
              responses={responses}
              onFieldChange={onFieldChange}
              readOnly={readOnly}
              validationResults={validationResults}
            />
          </Box>

          {/* Section Divider (except for last section) */}
          {index < sortedSections.length - 1 && (
            <Divider sx={{ mx: 3, mb: 0 }} />
          )}
        </Paper>
      ))}
    </Box>
  )
}