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
  }, [])

  return (
    <PermissionGate
      roles={['supervisor', 'manager', 'executive']}
      fallback={
        <Alert severity="warning">
          You need supervisor, manager, or executive privileges to access the team dashboard.
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
        
        <DashboardContainer 
          userId={user?.id || 'user-1'} 
          dashboardType="team" 
        />
      </Box>
    </PermissionGate>
  )
}
export default TeamDashboardPage