import { useEffect, useState } from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  LinearProgress,
  Chip,
  Alert
} from '@mui/material'
import { PermissionGate } from '../aggregates/session/components/PermissionGate'
import { useAppSelector } from '../hooks/redux'
import { metricsService } from '../services/MetricsService'

interface KPIItem {
  id: string
  name: string
  description: string
  current: number
  target: number
  unit: string
  status: 'on_track' | 'at_risk' | 'behind'
  category: string
  dueDate: string
}

// Mock KPI data for employee
const mockEmployeeKPIs: KPIItem[] = [
  {
    id: 'kpi-1',
    name: 'Project Completion Rate',
    description: 'Percentage of assigned projects completed on time',
    current: 85,
    target: 90,
    unit: '%',
    status: 'on_track',
    category: 'Productivity',
    dueDate: '2024-03-31'
  },
  {
    id: 'kpi-2',
    name: 'Code Quality Score',
    description: 'Average code review score from peer reviews',
    current: 4.2,
    target: 4.5,
    unit: '/5',
    status: 'on_track',
    category: 'Quality',
    dueDate: '2024-03-31'
  },
  {
    id: 'kpi-3',
    name: 'Training Hours',
    description: 'Hours spent on professional development',
    current: 12,
    target: 20,
    unit: 'hrs',
    status: 'at_risk',
    category: 'Development',
    dueDate: '2024-03-31'
  },
  {
    id: 'kpi-4',
    name: 'Customer Satisfaction',
    description: 'Average rating from customer feedback',
    current: 4.8,
    target: 4.5,
    unit: '/5',
    status: 'on_track',
    category: 'Customer',
    dueDate: '2024-03-31'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'on_track': return 'success'
    case 'at_risk': return 'warning'
    case 'behind': return 'error'
    default: return 'default'
  }
}

const getProgressColor = (current: number, target: number) => {
  const percentage = (current / target) * 100
  if (percentage >= 90) return 'success'
  if (percentage >= 70) return 'warning'
  return 'error'
}

const MyKPIsPage: React.FC = () => {
  const { user } = useAppSelector(state => state.session)
  const [kpis] = useState<KPIItem[]>(mockEmployeeKPIs)
  
  useEffect(() => {
    metricsService.trackPageLoad('my-kpis')
    metricsService.trackUserInteraction('page_visit', 'MyKPIsPage')
  }, [])

  return (
    <PermissionGate
      roles={['employee']}
      fallback={
        <Alert severity="info">
          This page shows your assigned KPIs. Supervisors and managers should use the Team KPI Management page.
        </Alert>
      }
    >
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            My KPIs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View your assigned Key Performance Indicators and track your progress.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {kpis.map((kpi) => (
            <Grid item xs={12} md={6} key={kpi.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {kpi.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {kpi.description}
                      </Typography>
                    </Box>
                    <Chip 
                      label={kpi.status.replace('_', ' ')} 
                      color={getStatusColor(kpi.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Progress: {kpi.current}{kpi.unit} / {kpi.target}{kpi.unit}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {Math.round((kpi.current / kpi.target) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((kpi.current / kpi.target) * 100, 100)}
                      color={getProgressColor(kpi.current, kpi.target)}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Chip label={kpi.category} size="small" variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                      Due: {new Date(kpi.dueDate).toLocaleDateString()}
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

export default MyKPIsPage
