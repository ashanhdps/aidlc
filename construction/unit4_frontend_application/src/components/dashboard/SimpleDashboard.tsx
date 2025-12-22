import React, { useState, useEffect } from 'react'
import { Box, Typography, Alert, Card, CardContent, Button, Grid } from '@mui/material'
import { useAppSelector } from '../../hooks/redux'

export const SimpleDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAppSelector(state => state.session)
  const token = localStorage.getItem('auth_token')

  useEffect(() => {
    const fetchKPIs = async () => {
      if (!token) {
        setError('No authentication token found')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch('http://localhost:8080/api/v1/kpi-management/kpis', {
          headers: {
            'Authorization': `Basic ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setKpis(data)
          setError(null)
        } else {
          setError(`Failed to fetch KPIs: ${response.status} ${response.statusText}`)
        }
      } catch (err) {
        setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchKPIs()
  }, [token])

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Performance Dashboard
        </Typography>
        <Alert severity="info">Loading dashboard data...</Alert>
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Performance Dashboard
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Performance Dashboard
      </Typography>
      
      {user && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Welcome {user.firstName} {user.lastName}! Role: {user.role.name.toUpperCase()}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        KPI Overview ({kpis.length} KPIs)
      </Typography>

      {kpis.length === 0 ? (
        <Alert severity="info">
          No KPIs found. You may need to create some KPIs first or check your permissions.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {kpis.map((kpi: any, index: number) => (
            <Grid item xs={12} sm={6} md={4} key={kpi.id || index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {kpi.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {kpi.description || 'No description'}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Category: {kpi.category}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Type: {kpi.measurementType}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Active: {kpi.active ? 'Yes' : 'No'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}