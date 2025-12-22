import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material'
import { useLoginMutation } from '../../store/api/authApi'
import { useAppDispatch } from '../../hooks/redux'
import { loginWithJWT } from '../../aggregates/session/store/sessionSlice'

interface LoginFormProps {
  onSuccess?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')

  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useAppDispatch()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const result = await login(credentials).unwrap()
      
      if (result.error) {
        setError(result.error)
      } else {
        // Store JWT token and user info in Redux
        dispatch(loginWithJWT({
          token: result.token,
          username: result.username,
          role: result.role,
          userId: result.userId,
          expiresIn: result.expiresIn
        }))

        // Store token in localStorage for persistence
        localStorage.setItem('jwt_token', result.token)
        localStorage.setItem('user_info', JSON.stringify({
          username: result.username,
          role: result.role,
          userId: result.userId
        }))

        onSuccess?.()
      }
    } catch (err: any) {
      setError(err.data?.error || 'Login failed. Please try again.')
    }
  }

  const handleDemoLogin = (role: string) => {
    const demoCredentials = {
      admin: { username: 'admin', password: 'admin123' },
      manager: { username: 'manager', password: 'manager123' },
      analyst: { username: 'analyst', password: 'analyst123' },
      employee: { username: 'employee', password: 'employee123' }
    }

    const creds = demoCredentials[role as keyof typeof demoCredentials]
    if (creds) {
      setCredentials(creds)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
        py: 12,
        px: 4
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Performance Management System
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              type="text"
              required
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              margin="normal"
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              required
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              margin="normal"
              variant="outlined"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Signing in...
                </Box>
              ) : (
                'Sign In'
              )}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Chip label="Demo Accounts" size="small" />
            </Divider>

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handleDemoLogin('admin')}
                  sx={{ textTransform: 'none' }}
                >
                  Admin
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handleDemoLogin('manager')}
                  sx={{ textTransform: 'none' }}
                >
                  Manager
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handleDemoLogin('analyst')}
                  sx={{ textTransform: 'none' }}
                >
                  Analyst
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handleDemoLogin('employee')}
                  sx={{ textTransform: 'none' }}
                >
                  Employee
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}