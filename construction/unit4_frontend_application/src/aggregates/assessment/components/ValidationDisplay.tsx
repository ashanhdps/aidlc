import React from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Typography,
  SxProps,
  Theme,
} from '@mui/material'
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material'
import { ValidationResult } from '../../../types/common'

interface ValidationDisplayProps {
  validationResults: Record<string, ValidationResult>
  sx?: SxProps<Theme>
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  validationResults,
  sx,
}) => {
  const [expanded, setExpanded] = React.useState(false)

  const errors = Object.entries(validationResults).filter(
    ([_, result]) => !result.isValid && result.severity === 'error'
  )
  
  const warnings = Object.entries(validationResults).filter(
    ([_, result]) => !result.isValid && result.severity === 'warning'
  )

  const totalIssues = errors.length + warnings.length

  if (totalIssues === 0) {
    return null
  }

  const handleToggle = () => {
    setExpanded(!expanded)
  }

  return (
    <Box sx={sx}>
      <Alert 
        severity={errors.length > 0 ? 'error' : 'warning'}
        action={
          <IconButton
            aria-label="toggle validation details"
            color="inherit"
            size="small"
            onClick={handleToggle}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
      >
        <AlertTitle>
          {errors.length > 0 ? 'Form Validation Errors' : 'Form Validation Warnings'}
        </AlertTitle>
        <Typography variant="body2">
          {errors.length > 0 && `${errors.length} error${errors.length > 1 ? 's' : ''}`}
          {errors.length > 0 && warnings.length > 0 && ' and '}
          {warnings.length > 0 && `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`}
          {' '}found. Click to {expanded ? 'hide' : 'show'} details.
        </Typography>
      </Alert>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {errors.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Errors (must be fixed before submission):
              </Typography>
              <List dense>
                {errors.map(([fieldId, result]) => (
                  <ListItem key={fieldId}>
                    <ListItemIcon>
                      <ErrorIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={result.message}
                      secondary={`Field: ${fieldId}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {warnings.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="warning.main" gutterBottom>
                Warnings (recommended to address):
              </Typography>
              <List dense>
                {warnings.map(([fieldId, result]) => (
                  <ListItem key={fieldId}>
                    <ListItemIcon>
                      <WarningIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={result.message}
                      secondary={`Field: ${fieldId}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}