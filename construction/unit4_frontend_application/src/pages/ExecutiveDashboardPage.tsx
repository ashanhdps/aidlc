import { useEffect } from 'react'
import { Box, Typography, Alert, Grid, Card, CardContent, LinearProgress } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import GroupsIcon from '@mui/icons-material/Groups'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { PermissionGate } from '../aggregates/session/components/PermissionGate'
import { useAppSelector } from '../hooks/redux'
import { metricsService } from '../services/MetricsService'

// Mock team performance data
const teamPerformanceData = [
  { name: 'Engineering', avgScore: 87, trend: 'up', employees: 45, kpisOnTrack: 38 },
  { name: 'Sales', avgScore: 92, trend: 'up', employees: 32, kpisOnTrack: 30 },
  { name: 'Support', avgScore: 78, trend: 'down', employees: 28, kpisOnTrack: 20 },
  { name: 'Marketing', avgScore: 85, trend: 'up', employees: 18, kpisOnTrack: 15 },
  { name: 'HR', avgScore: 90, trend: 'up', employees: 12, kpisOnTrack: 11 },
]

const orgMetrics = {
  totalEmployees: 135,
  avgPerformance: 86,
  kpisOnTrack: 114,
  totalKPIs: 135,
  assessmentsCompleted: 89,
  assessmentsPending: 46
}

const ExecutiveDashboardPage: React.FC = () => {
  const { user } = useAppSelector(state => state.session)
  
  useEffect(() => {
    metricsService.trackPageLoad('executive-dashboard')
    metricsService.trackUserInteraction('page_visit', 'ExecutiveDashboardPage')
  }, [])

  return (
    <PermissionGate
      roles={['executive']}
      fallback={
        <Alert severity="error">
          You need executive privileges to access the executive dashboard.
        </Alert>
      }
    >
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Executive Reports & Statistics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Organization-wide performance overview and team statistics.
          </Typography>
        </Box>

        {/* Organization Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GroupsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">Total Employees</Typography>
                </Box>
                <Typography variant="h4">{orgMetrics.totalEmployees}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">Avg Performance</Typography>
                </Box>
                <Typography variant="h4">{orgMetrics.avgPerformance}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AssessmentIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">KPIs On Track</Typography>
                </Box>
                <Typography variant="h4">{orgMetrics.kpisOnTrack}/{orgMetrics.totalKPIs}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AssessmentIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">Assessments</Typography>
                </Box>
                <Typography variant="h4">{orgMetrics.assessmentsCompleted}/{orgMetrics.assessmentsCompleted + orgMetrics.assessmentsPending}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Team Performance */}
        <Typography variant="h5" gutterBottom>
          Team Performance Overview
        </Typography>
        <Grid container spacing={3}>
          {teamPerformanceData.map((team) => (
            <Grid item xs={12} md={6} lg={4} key={team.name}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{team.name}</Typography>
                    {team.trend === 'up' ? (
                      <TrendingUpIcon color="success" />
                    ) : (
                      <TrendingDownIcon color="error" />
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Average Score</Typography>
                      <Typography variant="body2" fontWeight="bold">{team.avgScore}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={team.avgScore} 
                      color={team.avgScore >= 85 ? 'success' : team.avgScore >= 70 ? 'warning' : 'error'}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {team.employees} employees
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {team.kpisOnTrack}/{team.employees} KPIs on track
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </PermissionGate>
  )
}

export default ExecutiveDashboardPage