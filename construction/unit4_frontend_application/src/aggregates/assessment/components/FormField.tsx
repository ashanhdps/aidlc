import React from 'react'
import {
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  Rating,
  Box,
  Typography,
  FormHelperText,
  Chip,
  OutlinedInput,
  InputLabel,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { FormField as FormFieldType } from '../../../types/domain'
import { ValidationResult } from '../../../types/common'

interface FormFieldProps {
  field: FormFieldType
  value: any
  onChange: (value: any) => void
  readOnly?: boolean
  validationResult?: ValidationResult
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
  readOnly = false,
  validationResult,
}) => {
  const hasError = validationResult && !validationResult.isValid
  const helperText = hasError ? validationResult.message : undefined

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={readOnly}
            error={hasError}
            helperText={helperText}
            variant="outlined"
          />
        )

      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={field.label}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={readOnly}
            error={hasError}
            helperText={helperText}
            variant="outlined"
          />
        )

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={field.label}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            required={field.required}
            disabled={readOnly}
            error={hasError}
            helperText={helperText}
            variant="outlined"
          />
        )

      case 'rating':
        return (
          <FormControl error={hasError} disabled={readOnly}>
            <FormLabel component="legend" required={field.required}>
              {field.label}
            </FormLabel>
            <Box sx={{ mt: 1 }}>
              <Rating
                value={value || 0}
                onChange={(_, newValue) => onChange(newValue)}
                max={5}
                size="large"
                readOnly={readOnly}
              />
            </Box>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        )

      case 'select':
        return (
          <FormControl fullWidth error={hasError} disabled={readOnly}>
            <InputLabel required={field.required}>{field.label}</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              label={field.label}
            >
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        )

      case 'multiselect':
        return (
          <FormControl fullWidth error={hasError} disabled={readOnly}>
            <InputLabel required={field.required}>{field.label}</InputLabel>
            <Select
              multiple
              value={value || []}
              onChange={(e) => onChange(e.target.value)}
              input={<OutlinedInput label={field.label} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((val) => (
                    <Chip key={val} label={val} size="small" />
                  ))}
                </Box>
              )}
            >
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox checked={(value || []).indexOf(option) > -1} />
                  {option}
                </MenuItem>
              ))}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        )

      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={field.label}
              value={value ? new Date(value) : null}
              onChange={(newValue) => onChange(newValue?.toISOString())}
              disabled={readOnly}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: field.required,
                  error: hasError,
                  helperText: helperText,
                },
              }}
            />
          </LocalizationProvider>
        )

      case 'file':
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {field.label} {field.required && '*'}
            </Typography>
            <TextField
              fullWidth
              type="file"
              onChange={(e) => {
                const target = e.target as HTMLInputElement
                const file = target.files?.[0]
                if (file) {
                  // In a real app, you'd upload the file and store the URL
                  onChange({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                  })
                }
              }}
              disabled={readOnly}
              error={hasError}
              helperText={helperText}
              inputProps={{
                accept: field.validation?.find(v => v.type === 'pattern')?.value || '*/*',
              }}
            />
            {value && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Selected: {value.name} ({Math.round(value.size / 1024)} KB)
              </Typography>
            )}
          </Box>
        )

      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={readOnly}
            error={hasError}
            helperText={helperText}
            variant="outlined"
          />
        )
    }
  }

  return (
    <Box>
      {renderField()}
    </Box>
  )
}