import { useEffect } from 'react'
import { Box, Typography, Alert, Card, CardContent, Grid, Button, Chip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { DashboardContainer } from '../aggregates/dashboard/components/DashboardContainer'
import { useAppSelector } from '../hooks/redux'
import { metricsService } from '../services/MetricsService'

const getRoleDescription = (roleName: string) => {
  switch (roleName) {
    case 'employee':
      return 'View your KPIs, complete self-evaluations, and track your performance.'
    case 'supervisor':
      return 'Manage your team\'s KPIs and monitor their performance.'
    case 'manager':
      return 'Administer KPIs across the organization and approve changes.'
    case 'executive':
      return 'View organization-wide reports and team performance statistics.'
    default:
      return 'Welcome to the Performance Management System.'
  }
}

const getQuickActions = (roleName: string) => {
  switch (roleName) {
    case 'employee':
      return [
        { label: 'View My KPIs', path: '/my-kpis' },
        { label: 'Self-Evaluation', path: '/assessments/self' },
        { label: 'Give Feedback', path: '/feedback' }
      ]
    case 'supervisor':
      return [
        { label: 'Team KPIs', path: '/team-kpis' },
        { label: 'Team Dashboard', path: '/team' },
        { label: 'Assessments', path: '/assessments' }
      ]
    case 'manager':
      return [
        { label: 'KPI Administration', path: '/kpi-admin' },
        { label: 'Approval Queue', path: '/kpi-approval' },
        { label: 'Team Dashboard', path: '/team' }
      ]
    case 'executive':
      return [
        { label: 'Executive Reports', path: '/executive' },
        { label: 'View Reports', path: '/reports' }
      ]
    default:
      return []
  }
}

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector(state => state.session)
  const navigate = useNavigate()
  
  useEffect(() => {
    metricsService.trackPageLoad('dashboard')
    metricsService.trackUserInteraction('page_visit', 'DashboardPage')
  }, [])

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          User not found. Please log in again.
        </Alert>
      </Box>
    )
  }

  const roleName = user.role?.name || 'employee'
  const quickActions = getQuickActions(roleName)
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h4">
            Welcome, {user.firstName}!
          </Typography>
          <Chip 
            label={roleName.charAt(0).toUpperCase() + roleName.slice(1)} 
            color="primary" 
            size="small"
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          {getRoleDescription(roleName)}
        </Typography>
      </Box>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {quickActions.map((action) => (
                <Button 
                  key={action.path}
                  variant="outlined" 
                  onClick={() => navigate(action.path)}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
      
      <DashboardContainer 
        userId={user.id} 
        dashboardType="personal" 
      />
    </Box>
  )
}

export default DashboardPage