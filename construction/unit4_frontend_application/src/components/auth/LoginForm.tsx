import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  Grid
} from '@mui/material'
import { Login as LoginIcon, Person as PersonIcon } from '@mui/icons-material'
import { useAppDispatch } from '../../hooks/redux'
import { login } from '../../aggregates/session/store/sessionSlice'
import { UserProfile } from '../../types/domain'

// User credentials matching the SecurityConfig
const AVAILABLE_USERS = {
  admin: {
    username: 'admin',
    password: 'admin123',
    profile: {
      id: 'admin',
      email: 'admin@company.com',
      firstName: 'System',
      lastName: 'Administrator',
      role: {
        id: 'admin',
        name: 'admin' as const,
        permissions: ['ROLE_ADMIN', 'VIEW_ALL', 'APPROVE_EMERGENCY']
      },
      department: 'IT',
      permissions: ['ROLE_ADMIN', 'VIEW_ALL', 'APPROVE_EMERGENCY'],
      avatar: undefined
    } as UserProfile,
    description: 'Full system access, can view all data and approve emergency changes'
  },
  hr: {
    username: 'hr',
    password: 'hr123',
    profile: {
      id: 'hr',
      email: 'hr@company.com',
      firstName: 'HR',
      lastName: 'Manager',
      role: {
        id: 'hr',
        name: 'manager' as const,
        permissions: ['ROLE_HR', 'ROLE_APPROVER', 'APPROVE_CHANGES', 'VIEW_ALL']
      },
      department: 'Human Resources',
      permissions: ['ROLE_HR', 'ROLE_APPROVER', 'APPROVE_CHANGES', 'VIEW_ALL'],
      avatar: undefined
    } as UserProfile,
    description: 'Can approve changes made by supervisors, view all data'
  },
  supervisor: {
    username: 'supervisor',
    password: 'supervisor123',
    profile: {
      id: 'supervisor',
      email: 'supervisor@company.com',
      firstName: 'Team',
      lastName: 'Supervisor',
      role: {
        id: 'supervisor',
        name: 'supervisor' as const,
        permissions: ['ROLE_SUPERVISOR', 'ROLE_MAKER', 'CREATE_KPI', 'MODIFY_KPI', 'ASSIGN_KPI', 'VIEW_TEAM']
      },
      department: 'Operations',
      permissions: ['ROLE_SUPERVISOR', 'ROLE_MAKER', 'CREATE_KPI', 'MODIFY_KPI', 'ASSIGN_KPI', 'VIEW_TEAM'],
      avatar: undefined
    } as UserProfile,
    description: 'Can create/modify KPIs and assignments, view team data'
  },
  manager: {
    username: 'manager',
    password: 'manager123',
    profile: {
      id: 'manager',
      email: 'manager@company.com',
      firstName: 'Department',
      lastName: 'Manager',
      role: {
        id: 'manager',
        name: 'manager' as const,
        permissions: ['ROLE_MANAGER', 'VIEW_TEAM', 'ASSIGN_KPI']
      },
      department: 'Sales',
      permissions: ['ROLE_MANAGER', 'VIEW_TEAM', 'ASSIGN_KPI'],
      avatar: undefined
    } as UserProfile,
    description: 'Can assign KPIs and view team performance'
  },
  employee: {
    username: 'employee',
    password: 'employee123',
    profile: {
      id: 'employee',
      email: 'employee@company.com',
      firstName: 'John',
      lastName: 'Employee',
      role: {
        id: 'employee',
        name: 'employee' as const,
        permissions: ['ROLE_EMPLOYEE', 'VIEW_OWN']
      },
      department: 'Sales',
      permissions: ['ROLE_EMPLOYEE', 'VIEW_OWN'],
      avatar: undefined
    } as UserProfile,
    description: 'Can view own KPIs and performance data'
  }
}

interface LoginFormProps {
  onLoginSuccess?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const dispatch = useAppDispatch()
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickLogin = (userKey: string) => {
    const user = AVAILABLE_USERS[userKey as keyof typeof AVAILABLE_USERS]
    setSelectedUser(userKey)
    setUsername(user.username)
    setPassword(user.password)
    setError('')
  }

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter username and password')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Find matching user
      const userEntry = Object.entries(AVAILABLE_USERS).find(
        ([_, user]) => user.username === username && user.password === password
      )

      if (!userEntry) {
        setError('Invalid username or password')
        setIsLoading(false)
        return
      }

      const [userKey, userData] = userEntry

      // Create Basic Auth token (base64 encoded credentials)
      const credentials = `${username}:${password}`
      const token = btoa(credentials)

      // Test the credentials against the backend
      const testResponse = await fetch('http://localhost:8080/api/v1/kpi-management/kpis', {
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!testResponse.ok) {
        if (testResponse.status === 401) {
          setError('Authentication failed - Invalid credentials')
        } else if (testResponse.status === 403) {
          setError('Access denied - Insufficient permissions')
        } else {
          setError(`Login failed - Server returned ${testResponse.status}`)
        }
        setIsLoading(false)
        return
      }

      // Login successful
      dispatch(login({
        user: userData.profile,
        token: token, // Store the base64 encoded credentials
        refreshToken: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }))

      // Store in localStorage for persistence
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_profile', JSON.stringify(userData.profile))

      onLoginSuccess?.()
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error - Could not connect to server')
    }

    setIsLoading(false)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Card sx={{ maxWidth: 600, width: '100%', m: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <PersonIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>
              KPI Management System
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in with your credentials
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Quick Login Options */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Quick Login (Demo Users)
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(AVAILABLE_USERS).map(([key, user]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Button
                    fullWidth
                    variant={selectedUser === key ? "contained" : "outlined"}
                    size="small"
                    onClick={() => handleQuickLogin(key)}
                    startIcon={<PersonIcon />}
                  >
                    {user.profile.role.name.toUpperCase()}
                  </Button>
                </Grid>
              ))}
            </Grid>
            
            {selectedUser && (
              <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom>
                  {AVAILABLE_USERS[selectedUser as keyof typeof AVAILABLE_USERS].profile.firstName}{' '}
                  {AVAILABLE_USERS[selectedUser as keyof typeof AVAILABLE_USERS].profile.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {AVAILABLE_USERS[selectedUser as keyof typeof AVAILABLE_USERS].description}
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {AVAILABLE_USERS[selectedUser as keyof typeof AVAILABLE_USERS].profile.permissions.map(permission => (
                    <Chip key={permission} label={permission} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR ENTER MANUALLY
            </Typography>
          </Divider>

          {/* Manual Login Form */}
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              margin="normal"
              required
              autoComplete="username"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              margin="normal"
              required
              autoComplete="current-password"
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={isLoading}
              startIcon={<LoginIcon />}
              sx={{ mt: 3 }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Available test credentials are shown above for demo purposes
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}