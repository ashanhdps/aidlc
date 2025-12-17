import { useState, useCallback, useMemo } from 'react'
import { Box, Alert, CircularProgress, Typography } from '@mui/material'
import { Visualization, DataSeries, ChartConfiguration } from '../../../types/domain'
import { LineChart } from './charts/LineChart'
import { BarChart } from './charts/BarChart'
import { PieChart } from './charts/PieChart'
import { HeatMap } from './charts/HeatMap'
import { InteractionLayer } from './InteractionLayer'
import { useAppSelector, useAppDispatch } from '../../../hooks/redux'
import { selectDataPoints, setZoomLevel, setPanOffset } from '../store/visualizationSlice'

interface ChartRendererProps {
  visualization: Visualization
  width?: number
  height?: number
  interactive?: boolean
  onDataPointClick?: (dataPoint: any) => void
  onChartInteraction?: (interaction: any) => void
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  visualization,
  width,
  height,
  interactive = true,
  onDataPointClick,
  onChartInteraction,
}) => {
  const dispatch = useAppDispatch()
  const { interactions, loading } = useAppSelector(state => state.visualization)
  const [renderError, setRenderError] = useState<string | null>(null)

  // Memoize chart data processing
  const processedData = useMemo(() => {
    try {
      return processChartData(visualization.data, visualization.type)
    } catch (error) {
      setRenderError(`Data processing error: ${error}`)
      return null
    }
  }, [visualization.data, visualization.type])

  // Handle data point selection
  const handleDataPointSelect = useCallback((dataPoints: string[]) => {
    dispatch(selectDataPoints(dataPoints))
    if (onDataPointClick) {
      onDataPointClick(dataPoints)
    }
  }, [dispatch, onDataPointClick])

  // Handle zoom interactions
  const handleZoom = useCallback((zoomLevel: number) => {
    dispatch(setZoomLevel(zoomLevel))
    if (onChartInteraction) {
      onChartInteraction({ type: 'zoom', level: zoomLevel })
    }
  }, [dispatch, onChartInteraction])

  // Handle pan interactions
  const handlePan = useCallback((offset: { x: number; y: number }) => {
    dispatch(setPanOffset(offset))
    if (onChartInteraction) {
      onChartInteraction({ type: 'pan', offset })
    }
  }, [dispatch, onChartInteraction])

  // Get responsive dimensions
  const getChartDimensions = () => {
    const config = visualization.configuration
    return {
      width: width || config.width || '100%',
      height: height || config.height || 400,
    }
  }

  if (loading.isLoading) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        height={height || 400}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (loading.error || renderError) {
    return (
      <Alert severity="error" sx={{ height: height || 400 }}>
        <Typography variant="h6" gutterBottom>
          Chart Rendering Error
        </Typography>
        <Typography variant="body2">
          {loading.error || renderError}
        </Typography>
      </Alert>
    )
  }

  if (!processedData || processedData.length === 0) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        height={height || 400}
        bgcolor="grey.50"
        borderRadius={1}
      >
        <Typography color="text.secondary">
          No data available for visualization
        </Typography>
      </Box>
    )
  }

  const dimensions = getChartDimensions()
  const commonProps = {
    data: processedData,
    configuration: visualization.configuration,
    dimensions,
    selectedPoints: interactions.selectedDataPoints,
    zoomLevel: interactions.zoomLevel,
    panOffset: interactions.panOffset,
    onDataPointSelect: handleDataPointSelect,
    onZoom: handleZoom,
    onPan: handlePan,
  }

  const renderChart = () => {
    switch (visualization.type) {
      case 'line':
        return <LineChart {...commonProps} />
      
      case 'bar':
        return <BarChart {...commonProps} />
      
      case 'pie':
        return <PieChart {...commonProps} />
      
      case 'heatmap':
        return <HeatMap {...commonProps} />
      
      case 'scatter':
        // For now, use line chart for scatter plots
        return <LineChart {...commonProps} scatter />
      
      default:
        return (
          <Alert severity="warning">
            Unsupported chart type: {visualization.type}
          </Alert>
        )
    }
  }

  return (
    <Box 
      sx={{ 
        position: 'relative',
        width: dimensions.width,
        height: dimensions.height,
      }}
    >
      {renderChart()}
      
      {interactive && (
        <InteractionLayer
          width={dimensions.width}
          height={dimensions.height}
          onZoom={handleZoom}
          onPan={handlePan}
          onSelect={handleDataPointSelect}
          zoomLevel={interactions.zoomLevel}
          panOffset={interactions.panOffset}
        />
      )}
    </Box>
  )
}

// Helper function to process chart data
function processChartData(dataSeries: DataSeries[], chartType: string) {
  if (!dataSeries || dataSeries.length === 0) {
    return []
  }

  switch (chartType) {
    case 'pie':
      // For pie charts, combine all series into a single dataset
      return dataSeries.flatMap(series => 
        series.data.map(point => ({
          name: point.label || `${series.name}-${point.x}`,
          value: point.y,
          color: series.color,
          series: series.name,
        }))
      )
    
    case 'heatmap':
      // For heatmaps, create a matrix structure
      return dataSeries.map(series => ({
        name: series.name,
        data: series.data.map(point => ({
          x: point.x,
          y: point.y,
          value: point.y,
          label: point.label,
        })),
        color: series.color,
      }))
    
    default:
      // For line, bar, and scatter charts
      const allXValues = [...new Set(
        dataSeries.flatMap(series => series.data.map(point => point.x))
      )].sort()

      return allXValues.map(x => {
        const dataPoint: any = { x }
        
        dataSeries.forEach(series => {
          const point = series.data.find(p => p.x === x)
          dataPoint[series.name] = point ? point.y : null
          if (point?.metadata) {
            dataPoint[`${series.name}_metadata`] = point.metadata
          }
        })
        
        return dataPoint
      })
  }
}