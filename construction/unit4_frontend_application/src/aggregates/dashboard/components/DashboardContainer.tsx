import { useEffect, useState } from 'react'
import { Box, Grid, Typography, Alert, Skeleton } from '@mui/material'
import { useAppSelector, useAppDispatch } from '../../../hooks/redux'
import { kpiManagementApi } from '../../../store/api/kpiManagementApi'
import { dataAnalyticsApi } from '../../../store/api/dataAnalyticsApi'
import { setCurrentDashboard, setLoading, setError } from '../store/dashboardSlice'
import { dashboardRepository } from '../../../services/repositories/DashboardRepository'
import { eventStore, DashboardEvents } from '../../../services/EventStore'
import { DashboardLayout } from './DashboardLayout'
import { DashboardFilters } from './DashboardFilters'
import { WidgetGrid } from './WidgetGrid'
import { DashboardCustomizer } from './DashboardCustomizer'

interface DashboardContainerProps {
  userId?: string
  dashboardType?: 'personal' | 'team' | 'executive'
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ 
  userId = 'user1', 
  dashboardType = 'personal' 
}) => {
  const dispatch = useAppDispatch()
  const { currentDashboard, loading, filters } = useAppSelector(state => state.dashboard)
  const { user } = useAppSelector(state => state.session)
  const [isCustomizing, setIsCustomizing] = useState(false)

  // API queries
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = kpiManagementApi.useGetKPIsQuery(filters)
  const { data: assignments, isLoading: assignmentsLoading } = kpiManagementApi.useGetAssignmentsQuery({ userId })
  const { data: insights, isLoading: insightsLoading } = dataAnalyticsApi.useGetInsightsQuery({ userId })

  useEffect(() => {
    loadDashboard()
  }, [userId, dashboardType])

  useEffect(() => {
    // Subscribe to real-time dashboard events
    const handleDashboardUpdate = (event: any) => {
      console.log('Dashboard event received:', event)
      // Handle real-time updates here
    }

    eventStore.subscribe(DashboardEvents.WIDGET_UPDATED, handleDashboardUpdate)
    eventStore.subscribe(DashboardEvents.FILTER_APPLIED, handleDashboardUpdate)

    return () => {
      eventStore.unsubscribe(DashboardEvents.WIDGET_UPDATED, handleDashboardUpdate)
      eventStore.unsubscribe(DashboardEvents.FILTER_APPLIED, handleDashboardUpdate)
    }
  }, [])

  const loadDashboard = async () => {
    try {
      dispatch(setLoading(true))
      
      // Load dashboard configuration from repository
      const dashboard = await dashboardRepository.getDashboardConfiguration(userId, dashboardType)
      
      if (dashboard) {
        dispatch(setCurrentDashboard(dashboard))
        
        // Emit dashboard loaded event
        await eventStore.append(
          dashboard.id,
          'dashboard',
          DashboardEvents.LOADED,
          { userId, dashboardType },
          userId
        )
      } else {
        // Create default dashboard if none exists
        const defaultDashboard = await dashboardRepository.getDefaultDashboardTemplate(
          user?.role.name || 'employee'
        )
        defaultDashboard.userId = userId
        defaultDashboard.id = `dashboard-${userId}-${Date.now()}`
        
        const savedDashboard = await dashboardRepository.saveDashboardConfiguration(defaultDashboard)
        dispatch(setCurrentDashboard(savedDashboard))
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      dispatch(setError('Failed to load dashboard'))
    }
  }

  const handleCustomizationToggle = () => {
    setIsCustomizing(!isCustomizing)
  }

  const handleDashboardSave = async (updatedDashboard: any) => {
    try {
      await dashboardRepository.saveDashboardConfiguration(updatedDashboard)
      dispatch(setCurrentDashboard(updatedDashboard))
      
      // Emit customization event
      await eventStore.append(
        updatedDashboard.id,
        'dashboard',
        DashboardEvents.CUSTOMIZED,
        { changes: 'layout_updated' },
        userId
      )
      
      setIsCustomizing(false)
    } catch (error) {
      console.error('Failed to save dashboard:', error)
      dispatch(setError('Failed to save dashboard changes'))
    }
  }

  if (loading.isLoading || kpisLoading || assignmentsLoading || insightsLoading) {
    return (
      <Box>
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (loading.error || kpisError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {loading.error || 'Failed to load dashboard data'}
      </Alert>
    )
  }

  if (!currentDashboard) {
    return (
      <Alert severity="info">
        No dashboard configuration found. Creating default dashboard...
      </Alert>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {currentDashboard.name}
        </Typography>
        <DashboardCustomizer
          isCustomizing={isCustomizing}
          onToggleCustomization={handleCustomizationToggle}
          onSave={handleDashboardSave}
          dashboard={currentDashboard}
        />
      </Box>

      {currentDashboard.description && (
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {currentDashboard.description}
        </Typography>
      )}

      <DashboardFilters
        filters={filters}
        onFiltersChange={(newFilters) => {
          // Dispatch filter change and emit event
          eventStore.append(
            currentDashboard.id,
            'dashboard',
            DashboardEvents.FILTER_APPLIED,
            { filters: newFilters },
            userId
          )
        }}
      />

      <DashboardLayout
        layout={currentDashboard.layout}
        isCustomizing={isCustomizing}
        onLayoutChange={(newLayout) => {
          // Handle layout changes during customization
          if (isCustomizing) {
            const updatedDashboard = {
              ...currentDashboard,
              layout: newLayout,
              updatedAt: new Date().toISOString(),
            }
            dispatch(setCurrentDashboard(updatedDashboard))
          }
        }}
      >
        <WidgetGrid
          widgets={currentDashboard.widgets}
          kpis={kpis || []}
          insights={insights || []}
          isCustomizing={isCustomizing}
          onWidgetUpdate={(widget) => {
            // Handle widget updates
            eventStore.append(
              currentDashboard.id,
              'dashboard',
              DashboardEvents.WIDGET_UPDATED,
              { widget },
              userId
            )
          }}
        />
      </DashboardLayout>
    </Box>
  )
}