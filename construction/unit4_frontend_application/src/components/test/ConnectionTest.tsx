import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Api as ApiIcon
} from '@mui/icons-material'
import { useGetKPIDefinitionsQuery } from '../../store/api/kpiManagementApi'
import { useAppSelector } from '../../hooks/redux'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'loading'
  message: string
  details?: any
}

export const ConnectionTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  
  // Get current user authentication
  const { user, token } = useAppSelector(state => state.session.authentication)

  // Test API connection using RTK Query
  const { 
    data: kpiData, 
    error: kpiError, 
    isLoading: kpiLoading,
    refetch: refetchKPIs
  } = useGetKPIDefinitionsQuery({}, { skip: true })

  const runTests = async () => {
    setIsRunning(true)
    setTests([])

    const testResults: TestResult[] = []

    // Test 1: Backend Health Check
    testResults.push({
      name: 'Backend Health Check',
      status: 'loading',
      message: 'Checking backend service...'
    })
    setTests([...testResults])

    try {
      const healthResponse = await fetch('http://localhost:8080/actuator/health')
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        testResults[0] = {
          name: 'Backend Health Check',
          status: 'success',
          message: `Backend is healthy (Status: ${healthData.status})`,
          details: healthData
        }
      } else {
        testResults[0] = {
          name: 'Backend Health Check',
          status: 'error',
          message: `Backend returned status ${healthResponse.status}`,
        }
      }
    } catch (error) {
      testResults[0] = {
        name: 'Backend Health Check',
        status: 'error',
        message: 'Cannot connect to backend service',
        details: error
      }
    }
    setTests([...testResults])

    // Test 2: API Authentication
    testResults.push({
      name: 'API Authentication',
      status: 'loading',
      message: 'Testing API authentication...'
    })
    setTests([...testResults])

    try {
      const authResponse = await fetch('http://localhost:8080/api/v1/kpi-management/kpis', {
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (authResponse.ok) {
        const data = await authResponse.json()
        testResults[1] = {
          name: 'API Authentication',
          status: 'success',
          message: `Authentication successful as ${user?.firstName} ${user?.lastName} (${data.length || 0} KPIs found)`,
          details: data
        }
      } else if (authResponse.status === 401) {
        testResults[1] = {
          name: 'API Authentication',
          status: 'error',
          message: 'Authentication failed - Invalid credentials',
        }
      } else {
        testResults[1] = {
          name: 'API Authentication',
          status: 'error',
          message: `API returned status ${authResponse.status}`,
        }
      }
    } catch (error) {
      testResults[1] = {
        name: 'API Authentication',
        status: 'error',
        message: 'Failed to connect to API',
        details: error
      }
    }
    setTests([...testResults])

    // Test 3: RTK Query Integration
    testResults.push({
      name: 'RTK Query Integration',
      status: 'loading',
      message: 'Testing RTK Query hooks...'
    })
    setTests([...testResults])

    try {
      const result = await refetchKPIs()
      if (result.data) {
        testResults[2] = {
          name: 'RTK Query Integration',
          status: 'success',
          message: `RTK Query working (${result.data.length} KPIs loaded)`,
          details: result.data
        }
      } else if (result.error) {
        testResults[2] = {
          name: 'RTK Query Integration',
          status: 'error',
          message: 'RTK Query failed',
          details: result.error
        }
      }
    } catch (error) {
      testResults[2] = {
        name: 'RTK Query Integration',
        status: 'error',
        message: 'RTK Query integration failed',
        details: error
      }
    }
    setTests([...testResults])

    setIsRunning(false)
  }

  useEffect(() => {
    // Auto-run tests on component mount
    runTests()
  }, [])

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckIcon color="success" />
      case 'error':
        return <ErrorIcon color="error" />
      case 'loading':
        return <CircularProgress size={20} />
      default:
        return <ApiIcon />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'success'
      case 'error':
        return 'error'
      case 'loading':
        return 'info'
      default:
        return 'default'
    }
  }

  const allTestsPassed = tests.length > 0 && tests.every(test => test.status === 'success')
  const hasErrors = tests.some(test => test.status === 'error')

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">
              Backend Connection Test
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={runTests}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Tests'}
            </Button>
          </Box>

          {allTestsPassed && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ All tests passed! Your frontend is successfully connected to the backend.
            </Alert>
          )}

          {hasErrors && (
            <Alert severity="error" sx={{ mb: 2 }}>
              ❌ Some tests failed. Check the details below and ensure your backend is running.
            </Alert>
          )}

          <List>
            {tests.map((test, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {getStatusIcon(test.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">
                        {test.name}
                      </Typography>
                      <Chip
                        label={test.status}
                        size="small"
                        color={getStatusColor(test.status) as any}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {test.message}
                      </Typography>
                      {test.details && (
                        <Typography variant="caption" component="pre" sx={{ mt: 1, fontSize: '0.75rem' }}>
                          {JSON.stringify(test.details, null, 2).substring(0, 200)}
                          {JSON.stringify(test.details, null, 2).length > 200 ? '...' : ''}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>

          {tests.length === 0 && !isRunning && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Click "Run Tests" to check the connection to your backend service.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}