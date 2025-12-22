import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { useCreateUserMutation, type CreateUserRequest } from '../../store/api/userManagementApi'

interface UserOnboardingProps {
  onComplete?: (user: any) => void
  onCancel?: () => void
}

export const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<CreateUserRequest & { confirmEmail: string; password?: string }>({
    email: '',
    confirmEmail: '',
    username: '',
    password: '',
    role: 'EMPLOYEE'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [createUser, { isLoading }] = useCreateUserMutation()

  const steps = ['Basic Information', 'Role & Permissions', 'Review & Create']

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.confirmEmail) {
      newErrors.confirmEmail = 'Please confirm your email'
    } else if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match'
    }

    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 0 && validateStep1()) {
      setCurrentStep(1)
    } else if (currentStep === 1) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      const { confirmEmail, ...userData } = formData
      const result = await createUser(userData).unwrap()
      onComplete?.(result)
    } catch (error) {
      console.error('Failed to create user:', error)
      setErrors({ submit: 'Failed to create user. Please try again.' })
    }
  }

  const getRolePermissions = (role: string) => {
    const permissions = {
      EMPLOYEE: [
        'View personal KPIs and performance data',
        'Submit performance updates',
        'Access personal dashboard'
      ],
      ANALYST: [
        'All Employee permissions',
        'Generate performance reports',
        'Access analytics dashboard',
        'View team performance data'
      ],
      MANAGER: [
        'All Analyst permissions',
        'Manage team KPIs',
        'Approve performance reviews',
        'Access user management'
      ],
      ADMIN: [
        'Full system access',
        'Manage all users and roles',
        'System configuration',
        'Advanced analytics and reporting'
      ]
    }
    return permissions[role as keyof typeof permissions] || []
  }

  return (
    <Box
      sx={{
        bgcolor: 'grey.50',
        minHeight: '100vh',
        py: 4,
        px: 3
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                User Onboarding
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new user account with proper role assignment
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Divider sx={{ mb: 4 }} />

            {/* Step Content */}
            <Box sx={{ minHeight: 400 }}>
              {currentStep === 0 && (
                <Stack spacing={3}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={!!errors.email}
                    helperText={errors.email}
                    placeholder="user@company.com"
                  />

                  <TextField
                    fullWidth
                    label="Confirm Email Address"
                    type="email"
                    required
                    value={formData.confirmEmail}
                    onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                    error={!!errors.confirmEmail}
                    helperText={errors.confirmEmail}
                    placeholder="user@company.com"
                  />

                  <TextField
                    fullWidth
                    label="Username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    error={!!errors.username}
                    helperText={errors.username || 'This will be used for login and system identification'}
                    placeholder="johndoe"
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    required
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={!!errors.password}
                    helperText={errors.password || 'Minimum 6 characters'}
                    placeholder="Enter password"
                  />
                </Stack>
              )}

              {currentStep === 1 && (
                <Stack spacing={3}>
                  <Typography variant="h6" gutterBottom>
                    Role & Permissions
                  </Typography>
                  
                  <FormControl fullWidth>
                    <InputLabel>User Role</InputLabel>
                    <Select
                      value={formData.role}
                      label="User Role"
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <MenuItem value="EMPLOYEE">Employee</MenuItem>
                      <MenuItem value="ANALYST">Analyst</MenuItem>
                      <MenuItem value="MANAGER">Manager</MenuItem>
                      <MenuItem value="ADMIN">Administrator</MenuItem>
                    </Select>
                  </FormControl>

                  <Card sx={{ bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                        Role Permissions:
                      </Typography>
                      <List dense>
                        {getRolePermissions(formData.role).map((permission, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircleIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={permission}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Stack>
              )}

              {currentStep === 2 && (
                <Stack spacing={3}>
                  <Typography variant="h6" gutterBottom>
                    Review & Create
                  </Typography>
                  
                  <Card sx={{ bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                        User Details:
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium" color="text.secondary">
                            Email:
                          </Typography>
                          <Typography variant="body1">
                            {formData.email}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight="medium" color="text.secondary">
                            Username:
                          </Typography>
                          <Typography variant="body1">
                            {formData.username}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight="medium" color="text.secondary">
                            Role:
                          </Typography>
                          <Typography variant="body1">
                            {formData.role}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Alert severity="info" icon={<InfoIcon />}>
                    <Typography variant="subtitle2" gutterBottom>
                      Next Steps:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ py: 0, pl: 0 }}>
                        <ListItemText 
                          primary="User will receive an email with login instructions"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0, pl: 0 }}>
                        <ListItemText 
                          primary="Initial password will be generated automatically"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0, pl: 0 }}>
                        <ListItemText 
                          primary="User will be prompted to change password on first login"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem sx={{ py: 0, pl: 0 }}>
                        <ListItemText 
                          primary="Account will be activated immediately"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    </List>
                  </Alert>

                  {errors.submit && (
                    <Alert severity="error">
                      {errors.submit}
                    </Alert>
                  )}
                </Stack>
              )}
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                {currentStep > 0 && (
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    sx={{ textTransform: 'none' }}
                  >
                    Back
                  </Button>
                )}
              </Box>
              
              <Stack direction="row" spacing={2}>
                <Button
                  onClick={onCancel}
                  variant="outlined"
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
                
                {currentStep < 2 ? (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    sx={{ textTransform: 'none' }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    variant="contained"
                    color="success"
                    sx={{ textTransform: 'none' }}
                  >
                    {isLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        Creating...
                      </Box>
                    ) : (
                      'Create User'
                    )}
                  </Button>
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}