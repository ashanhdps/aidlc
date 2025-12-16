import { useState, FormEvent } from 'react'
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Container,
  Alert
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../hooks/redux'
import { login } from '../aggregates/session/store/sessionSlice'
import { UserProfile } from '../types/domain'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Mock authentication - in real app, this would call an API
      let mockUser: UserProfile | null = null

      if (email === 'employee@example.com' && password === 'password') {
        // Employee - see KPI library, perform self-evaluation, view performance
        mockUser = {
          id: 'emp1',
          email: 'employee@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: {
            id: 'employee',
            name: 'employee',
            permissions: [
              'dashboard:read',
              'assessment:read', 'assessment:self',
              'feedback:read', 'feedback:write',
              'kpi:read'
            ],
          },
          department: 'Engineering',
          permissions: [
            'dashboard:read',
            'assessment:read', 'assessment:self',
            'feedback:read', 'feedback:write',
            'kpi:read'
          ],
          avatar: undefined,
        }
      } else if (email === 'hr@example.com' && password === 'password') {
        // HR - set KPIs per employee, view reports, approve KPI changes
        mockUser = {
          id: 'hr1',
          email: 'hr@example.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: {
            id: 'hr_manager',
            name: 'manager',
            permissions: [
              'dashboard:read', 'dashboard:write',
              'assessment:read', 'assessment:write', 'assessment:manage',
              'feedback:read', 'feedback:write', 'feedback:manage',
              'kpi:read', 'kpi:write', 'kpi:manage', 'kpi:approve',
              'team:read', 'team:manage',
              'reports:read', 'reports:export'
            ],
          },
          department: 'Human Resources',
          permissions: [
            'dashboard:read', 'dashboard:write',
            'assessment:read', 'assessment:write', 'assessment:manage',
            'feedback:read', 'feedback:write', 'feedback:manage',
            'kpi:read', 'kpi:write', 'kpi:manage', 'kpi:approve',
            'team:read', 'team:manage',
            'reports:read', 'reports:export'
          ],
          avatar: undefined,
        }
      } else if (email === 'executive@example.com' && password === 'password') {
        // Executive Manager - view reports and statistics of team performance
        mockUser = {
          id: 'exec1',
          email: 'executive@example.com',
          firstName: 'Robert',
          lastName: 'Chen',
          role: {
            id: 'executive',
            name: 'executive',
            permissions: [
              'dashboard:read',
              'kpi:read',
              'reports:read', 'reports:export',
              'team:read',
              'analytics:read'
            ],
          },
          department: 'Executive Management',
          permissions: [
            'dashboard:read',
            'kpi:read',
            'reports:read', 'reports:export',
            'team:read',
            'analytics:read'
          ],
          avatar: undefined,
        }
      } else if (email === 'supervisor@example.com' && password === 'password') {
        // Supervisor - set/modify KPIs for employees
        mockUser = {
          id: 'sup1',
          email: 'supervisor@example.com',
          firstName: 'Emily',
          lastName: 'Martinez',
          role: {
            id: 'supervisor',
            name: 'supervisor',
            permissions: [
              'dashboard:read', 'dashboard:write',
              'assessment:read', 'assessment:write',
              'feedback:read', 'feedback:write',
              'kpi:read', 'kpi:write', 'kpi:modify',
              'team:read', 'team:manage',
              'reports:read'
            ],
          },
          department: 'Engineering',
          permissions: [
            'dashboard:read', 'dashboard:write',
            'assessment:read', 'assessment:write',
            'feedback:read', 'feedback:write',
            'kpi:read', 'kpi:write', 'kpi:modify',
            'team:read', 'team:manage',
            'reports:read'
          ],
          avatar: undefined,
        }
      }

      if (mockUser) {
        const token = 'mock-jwt-token-' + Date.now()
        const refreshToken = 'mock-refresh-token-' + Date.now()
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

        // Store to localStorage for session persistence
        localStorage.setItem('auth_token', token)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('user_profile', JSON.stringify(mockUser))
        localStorage.setItem('token_expiry', expiresAt)

        dispatch(login({
          user: mockUser,
          token,
          refreshToken,
          expiresAt,
        }))

        navigate('/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
              Performance System
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
              Sign in to your account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoFocus
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>

            <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
              <Typography variant="caption" display="block" gutterBottom fontWeight="bold">
                Demo Credentials (Password: password)
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                <strong>Employee:</strong> employee@example.com
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                <strong>Supervisor:</strong> supervisor@example.com
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                <strong>HR:</strong> hr@example.com
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                <strong>Executive:</strong> executive@example.com
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}