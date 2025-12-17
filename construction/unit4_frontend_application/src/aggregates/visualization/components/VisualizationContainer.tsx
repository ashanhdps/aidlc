import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Alert,
} from '@mui/material'
import {
  MoreVert,
  Fullscreen,
  FullscreenExit,
  Refresh,
  Edit,
} from '@mui/icons-material'
import { Visualization, ChartConfiguration } from '../../../types/domain'
import { ChartRenderer } from './ChartRenderer'
import { ExportControls } from './ExportControls'
import { ChartConfiguration as ChartConfigComponent } from './ChartConfiguration'
import { useAppSelector, useAppDispatch } from '../../../hooks/redux'
import { updateChart, setLoading, setError } from '../store/visualizationSlice'
import { eventStore, VisualizationEvents } from '../../../services/EventStore'

interface VisualizationContainerProps {
  visualization: Visualization
  width?: number | string
  height?: number | string
  interactive?: boolean
  showControls?: boolean
  onVisualizationUpdate?: (visualization: Visualization) => void
}

export const VisualizationContainer: React.FC<VisualizationContainerProps> = ({
  visualization,
  width = '100%',
  height = 400,
  interactive = true,
  showControls = true,
  onVisualizationUpdate,
}) => {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector(state => state.visualization)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [localVisualization, setLocalVisualization] = useState<Visualization>(visualization)

  useEffect(() => {
    setLocalVisualization(visualization)
  }, [visualization])

  useEffect(() => {
    // Subscribe to visualization events
    const handleVisualizationEvent = (event: any) => {
      if (event.payload.visualizationId === visualization.id) {
        console.log('Visualization event received:', event)
        // Handle real-time updates here
      }
    }

    eventStore.subscribe(VisualizationEvents.RENDERED, handleVisualizationEvent)
    eventStore.subscribe(VisualizationEvents.CONFIGURED, handleVisualizationEvent)

    return () => {
      eventStore.unsubscribe(VisualizationEvents.RENDERED, handleVisualizationEvent)
      eventStore.unsubscribe(VisualizationEvents.CONFIGURED, handleVisualizationEvent)
    }
  }, [visualization.id])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleRefresh = async () => {
    try {
      dispatch(setLoading(true))
      
      // Simulate data refresh
      const refreshedVisualization = {
        ...localVisualization,
        data: localVisualization.data.map(series => ({
          ...series,
          data: series.data.map(point => ({
            ...point,
            // Add some random variation to simulate real-time updates
            y: point.y + (Math.random() - 0.5) * point.y * 0.1,
          })),
        })),
        updatedAt: new Date().toISOString(),
      }

      setLocalVisualization(refreshedVisualization)
      dispatch(updateChart(refreshedVisualization))
      
      if (onVisualizationUpdate) {
        onVisualizationUpdate(refreshedVisualization)
      }

      // Emit visualization rendered event
      await eventStore.append(
        refreshedVisualization.id,
        'visualization',
        VisualizationEvents.RENDERED,
        { 
          type: refreshedVisualization.type,
          dataPoints: refreshedVisualization.data.reduce((sum, series) => sum + series.data.length, 0),
        },
        'system'
      )
    } catch (error) {
      console.error('Failed to refresh visualization:', error)
      dispatch(setError('Failed to refresh visualization'))
    } finally {
      dispatch(setLoading(false))
    }
    
    handleMenuClose()
  }

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen)
    handleMenuClose()
  }

  const handleConfigurationChange = async (config: ChartConfiguration) => {
    const updatedVisualization = {
      ...localVisualization,
      configuration: config,
      updatedAt: new Date().toISOString(),
    }

    setLocalVisualization(updatedVisualization)
    dispatch(updateChart(updatedVisualization))
    
    if (onVisualizationUpdate) {
      onVisualizationUpdate(updatedVisualization)
    }

    // Emit configuration changed event
    await eventStore.append(
      updatedVisualization.id,
      'visualization',
      VisualizationEvents.CONFIGURED,
      { 
        configChanges: Object.keys(config),
        chartType: updatedVisualization.type,
      },
      'user'
    )
  }

  const handleVisualizationTypeChange = async (newType: string) => {
    const updatedVisualization = {
      ...localVisualization,
      type: newType as any,
      updatedAt: new Date().toISOString(),
    }

    setLocalVisualization(updatedVisualization)
    dispatch(updateChart(updatedVisualization))
    
    if (onVisualizationUpdate) {
      onVisualizationUpdate(updatedVisualization)
    }
  }

  const handleDataPointClick = (dataPoint: any) => {
    console.log('Data point clicked:', dataPoint)
    // Emit data point selection event
    eventStore.append(
      localVisualization.id,
      'visualization',
      VisualizationEvents.DATA_POINT_SELECTED,
      { dataPoint },
      'user'
    )
  }

  const handleChartInteraction = (interaction: any) => {
    console.log('Chart interaction:', interaction)
    
    if (interaction.type === 'zoom') {
      eventStore.append(
        localVisualization.id,
        'visualization',
        VisualizationEvents.CHART_ZOOMED,
        { zoomLevel: interaction.level },
        'user'
      )
    }
  }

  if (loading.error) {
    return (
      <Alert severity="error">
        <Typography variant="h6" gutterBottom>
          Visualization Error
        </Typography>
        <Typography variant="body2">
          {loading.error}
        </Typography>
      </Alert>
    )
  }

  const containerStyle = isFullscreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: 'white',
  } : {
    width,
    height,
  }

  return (
    <Card sx={containerStyle}>
      {showControls && (
        <CardHeader
          title={
            <Typography variant="h6">
              {localVisualization.title}
            </Typography>
          }
          action={
            <Box display="flex" alignItems="center" gap={1}>
              <ExportControls visualization={localVisualization} />
              
              <ChartConfigComponent
                visualization={localVisualization}
                onConfigurationChange={handleConfigurationChange}
                onVisualizationTypeChange={handleVisualizationTypeChange}
              />
              
              <Tooltip title="Refresh data">
                <IconButton onClick={handleRefresh} disabled={loading.isLoading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                <IconButton onClick={handleFullscreenToggle}>
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>
              
              <IconButton onClick={handleMenuOpen}>
                <MoreVert />
              </IconButton>
            </Box>
          }
        />
      )}
      
      <CardContent sx={{ 
        height: showControls ? 'calc(100% - 64px)' : '100%',
        p: showControls ? 2 : 0,
        '&:last-child': { pb: showControls ? 2 : 0 }
      }}>
        <ChartRenderer
          visualization={localVisualization}
          width="100%"
          height="100%"
          interactive={interactive}
          onDataPointClick={handleDataPointClick}
          onChartInteraction={handleChartInteraction}
        />
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRefresh}>
          <Refresh sx={{ mr: 1 }} />
          Refresh Data
        </MenuItem>
        <MenuItem onClick={handleFullscreenToggle}>
          {isFullscreen ? <FullscreenExit sx={{ mr: 1 }} /> : <Fullscreen sx={{ mr: 1 }} />}
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </MenuItem>
      </Menu>
    </Card>
  )
}