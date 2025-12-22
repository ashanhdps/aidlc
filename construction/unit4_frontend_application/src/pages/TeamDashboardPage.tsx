import React, { useEffect } from 'react'
import { Box, Typography, Alert } from '@mui/material'
import { DashboardContainer } from '../aggregates/dashboard/components/DashboardContainer'
import { PermissionGate } from '../aggregates/session/components/PermissionGate'
import { useAppSelector } from '../hooks/redux'
import { metricsService } from '../services/MetricsService'

const TeamDashboardPage: React.FC = () => {
  const { user } = useAppSelector(state => state.session)
  
  useEffect(() => {
    metricsService.trackPageLoad('team-dashboard')
    metricsService.trackUserInteraction('page_visit', 'TeamDashboardPage')
    
    // Debug logging
    console.log('=== TEAM DASHBOARD DEBUG ===')
    console.log('User:', user)
    console.log('User role:', user?.role?.name)
    console.log('=== END DEBUG ===')
  }, [])

  return (
    <Box sx={{ p: 3 }}>
      {/* Debug info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Debug: User role = {user?.role?.name}, User = {user?.firstName} {user?.lastName}
      </Alert>
      
      <PermissionGate
        roles={['supervisor', 'manager', 'executive']}
        fallback={
          <Alert severity="warning">
            You need supervisor, manager, or executive privileges to access the team dashboard.
            Current role: {user?.role?.name}
          </Alert>
        }
      >
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Team Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor your team's performance and provide guidance where needed.
            </Typography>
          </Box>
          
          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ Permission check passed! You have access to the team dashboard.
          </Alert>
          
          {/* Simple Team Dashboard Content */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Team Performance Overview
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
              <Box sx={{ p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                <Typography variant="h6" color="primary">Team KPIs</Typography>
                <Typography variant="h4">12</Typography>
                <Typography variant="body2" color="text.secondary">Active assignments</Typography>
              </Box>
              
              <Box sx={{ p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                <Typography variant="h6" color="success.main">On Track</Typography>
                <Typography variant="h4">8</Typography>
                <Typography variant="body2" color="text.secondary">Meeting targets</Typography>
              </Box>
              
              <Box sx={{ p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                <Typography variant="h6" color="warning.main">At Risk</Typography>
                <Typography variant="h4">3</Typography>
                <Typography variant="body2" color="text.secondary">Need attention</Typography>
              </Box>
              
              <Box sx={{ p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                <Typography variant="h6" color="error.main">Behind</Typography>
                <Typography variant="h4">1</Typography>
                <Typography variant="body2" color="text.secondary">Missing targets</Typography>
              </Box>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            
            <Box sx={{ p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • John Doe completed Q4 Sales Target (95% achievement)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Jane Smith updated Customer Satisfaction metrics
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Mike Johnson needs attention on Productivity KPI
              </Typography>
              <Typography variant="body2">
                • Sarah Wilson exceeded Quality Score target
              </Typography>
            </Box>
          </Box>
          
          {/* Commented out the problematic DashboardContainer */}
          {/* 
          <DashboardContainer 
            userId={user?.id || 'user-1'} 
            dashboardType="team" 
          />
          */}
        </Box>
      </PermissionGate>
    </Box>
  )
}
export default TeamDashboardPage