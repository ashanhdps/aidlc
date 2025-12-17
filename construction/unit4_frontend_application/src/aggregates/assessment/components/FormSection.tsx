import React from 'react'
import { Box, Grid } from '@mui/material'
import { FormField } from './FormField'
import { FormSection as FormSectionType } from '../../../types/domain'
import { ValidationResult } from '../../../types/common'

interface FormSectionProps {
  section: FormSectionType
  responses: Record<string, any>
  onFieldChange: (fieldId: string, value: any) => void
  readOnly?: boolean
  validationResults?: Record<string, ValidationResult>
}

export const FormSection: React.FC<FormSectionProps> = ({
  section,
  responses,
  onFieldChange,
  readOnly = false,
  validationResults = {},
}) => {
  const sortedFields = [...section.fields].sort((a, b) => a.order - b.order)

  return (
    <Box>
      <Grid container spacing={3}>
        {sortedFields.map((field) => (
          <Grid 
            item 
            xs={12} 
            sm={field.type === 'textarea' ? 12 : 6}
            key={field.id}
          >
            <FormField
              field={field}
              value={responses[field.id]}
              onChange={(value) => onFieldChange(field.id, value)}
              readOnly={readOnly}
              validationResult={validationResults[field.id]}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}