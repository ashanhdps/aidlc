import { useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Alert,
  Button
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useAppSelector } from '../hooks/redux'
import { useGetKPIDefinitionsQuery } from '../store/api/kpiManagementApi'

const KPIDefinitionsPageSimple: React.FC = () => {
  const { user } = useAppSelector(state => state.session)
  const { data: kpiDefinitions, isLoading, error } = useGetKPIDefinitionsQuery({ activeOnly: false })
  
  useEffect(() => {
    console.log('=== KPI DEFINITIONS DEBUG ===')
    console.log('User:', user)
    console.log('User role name:', user?.role?.name)
    console.log('Is Loading:', isLoading)
    console.log('Error:', error)
    console.log('KPI Definitions:', kpiDefinitions)
    console.log('=== END DEBUG ===')
  }, [user, isLoading, error, kpiDefinitions])

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading KPI Definitions...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load KPI definitions. Error: {JSON.stringify(error)}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        Debug: User role = {user?.role?.name}, User = {user?.firstName} {user?.lastName}
      </Alert>
      
      <Typography variant="h4" gutterBottom>
        KPI Definitions Management (Simple)
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Found {kpiDefinitions?.length || 0} KPI definitions
      </Typography>

      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 3 }}>
        Create KPI
      </Button>

      {kpiDefinitions?.map((kpi) => (
        <Box key={kpi.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
          <Typography variant="h6">{kpi.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Category: {kpi.category} | Type: {kpi.measurementType}
          </Typography>
          <Typography variant="body2">
            Created by: {kpi.createdBy} | Active: {kpi.active ? 'Yes' : 'No'}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export default KPIDefinitionsPageSimple