import React from 'react'
import {
  Box,
  LinearProgress,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material'

interface ProgressIndicatorProps {
  progress: number
  totalSections: number
  completedSections: number
  currentSection?: number
  sectionTitles?: string[]
  showStepper?: boolean
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  totalSections,
  completedSections,
  currentSection = 0,
  sectionTitles = [],
  showStepper = false,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'error'
    if (progress < 50) return 'warning'
    if (progress < 75) return 'info'
    return 'success'
  }

  const getProgressText = (progress: number) => {
    if (progress === 0) return 'Not started'
    if (progress < 25) return 'Just getting started'
    if (progress < 50) return 'Making progress'
    if (progress < 75) return 'More than halfway'
    if (progress < 100) return 'Almost complete'
    return 'Complete!'
  }

  return (
    <Box>
      {/* Main Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Overall Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {progress}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={getProgressColor(progress)}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {getProgressText(progress)}
        </Typography>
      </Box>

      {/* Section Progress */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Sections: {completedSections} of {totalSections} completed
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {Array.from({ length: totalSections }, (_, index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index < completedSections 
                  ? theme.palette.success.main 
                  : index === currentSection
                  ? theme.palette.primary.main
                  : theme.palette.grey[300],
                transition: 'background-color 0.3s ease',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Detailed Stepper (optional) */}
      {showStepper && sectionTitles.length > 0 && !isMobile && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Section Progress
          </Typography>
          <Stepper orientation="vertical" nonLinear>
            {sectionTitles.map((title, index) => (
              <Step key={index} completed={index < completedSections} active={index === currentSection}>
                <StepLabel
                  StepIconComponent={({ completed, active }) => (
                    completed ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <RadioButtonUncheckedIcon 
                        color={active ? 'primary' : 'disabled'} 
                      />
                    )
                  )}
                >
                  <Typography variant="body2">
                    {title}
                  </Typography>
                </StepLabel>
                {index === currentSection && (
                  <StepContent>
                    <Typography variant="caption" color="text.secondary">
                      Currently working on this section
                    </Typography>
                  </StepContent>
                )}
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* Mobile-friendly section list */}
      {showStepper && sectionTitles.length > 0 && isMobile && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Sections
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {sectionTitles.map((title, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: index === currentSection 
                    ? theme.palette.primary.light + '20'
                    : 'transparent',
                }}
              >
                {index < completedSections ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <RadioButtonUncheckedIcon 
                    color={index === currentSection ? 'primary' : 'disabled'} 
                    fontSize="small"
                  />
                )}
                <Typography 
                  variant="body2" 
                  color={index === currentSection ? 'primary' : 'text.primary'}
                  sx={{ fontWeight: index === currentSection ? 'medium' : 'normal' }}
                >
                  {title}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  )
}