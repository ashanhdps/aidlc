import React, { useMemo } from 'react'
import { Box, Typography, Tooltip } from '@mui/material'
import { ChartConfiguration } from '../../../../types/domain'

interface HeatMapProps {
  data: any[]
  configuration: ChartConfiguration
  dimensions: { width: number | string; height: number | string }
  selectedPoints: string[]
  zoomLevel: number
  panOffset: { x: number; y: number }
  onDataPointSelect: (points: string[]) => void
  onZoom: (level: number) => void
  onPan: (offset: { x: number; y: number }) => void
}

interface HeatMapCell {
  x: string | number
  y: string | number
  value: number
  label?: string
  series: string
}

export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  configuration,
  dimensions,
  selectedPoints,
  onDataPointSelect,
}) => {
  // Process data into heatmap format
  const heatMapData = useMemo(() => {
    const cells: HeatMapCell[] = []
    const allXValues = new Set<string | number>()
    const allYValues = new Set<string>()

    // Extract all unique X and Y values
    data.forEach(series => {
      allYValues.add(series.name)
      series.data.forEach((point: any) => {
        allXValues.add(point.x)
        cells.push({
          x: point.x,
          y: series.name,
          value: point.value || point.y,
          label: point.label,
          series: series.name,
        })
      })
    })

    return {
      cells,
      xValues: Array.from(allXValues).sort(),
      yValues: Array.from(allYValues).sort(),
    }
  }, [data])

  // Calculate color intensity based on value
  const getColorIntensity = (value: number, minValue: number, maxValue: number) => {
    if (maxValue === minValue) return 0.5
    return (value - minValue) / (maxValue - minValue)
  }

  // Get min and max values for color scaling
  const { minValue, maxValue } = useMemo(() => {
    const values = heatMapData.cells.map(cell => cell.value).filter(v => v !== null && v !== undefined)
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    }
  }, [heatMapData.cells])

  // Get color for a cell based on its value
  const getCellColor = (value: number) => {
    const intensity = getColorIntensity(value, minValue, maxValue)
    const baseColor = [25, 118, 210] // Material-UI primary blue
    
    return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${0.1 + intensity * 0.9})`
  }

  // Handle cell click
  const handleCellClick = (cell: HeatMapCell) => {
    const pointId = `heatmap-${cell.x}-${cell.y}`
    onDataPointSelect([pointId])
  }

  // Check if cell is selected
  const isCellSelected = (cell: HeatMapCell) => {
    const pointId = `heatmap-${cell.x}-${cell.y}`
    return selectedPoints.includes(pointId)
  }

  // Calculate cell dimensions
  const cellWidth = typeof dimensions.width === 'number' 
    ? (dimensions.width - 100) / heatMapData.xValues.length 
    : 40
  const cellHeight = typeof dimensions.height === 'number' 
    ? (dimensions.height - 100) / heatMapData.yValues.length 
    : 40

  const HeatMapCell: React.FC<{ cell: HeatMapCell }> = ({ cell }) => {
    const isSelected = isCellSelected(cell)
    
    return (
      <Tooltip
        title={
          <div>
            <div><strong>{cell.series}</strong></div>
            <div>X: {cell.x}</div>
            <div>Y: {cell.y}</div>
            <div>Value: {cell.value?.toLocaleString()}</div>
            {cell.label && <div>Label: {cell.label}</div>}
          </div>
        }
        arrow
      >
        <Box
          sx={{
            width: cellWidth,
            height: cellHeight,
            backgroundColor: getCellColor(cell.value),
            border: isSelected ? '2px solid #ff4757' : '1px solid rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: getColorIntensity(cell.value, minValue, maxValue) > 0.5 ? 'white' : 'black',
            '&:hover': {
              backgroundColor: getCellColor(cell.value).replace(/[\d\.]+\)$/g, '0.8)'),
              transform: 'scale(1.05)',
              zIndex: 1,
            },
            transition: 'all 0.2s ease-in-out',
          }}
          onClick={() => handleCellClick(cell)}
        >
          {cellWidth > 30 && cellHeight > 30 && (
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              {cell.value.toFixed(1)}
            </Typography>
          )}
        </Box>
      </Tooltip>
    )
  }

  return (
    <Box
      sx={{
        width: dimensions.width,
        height: dimensions.height,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      {/* Y-axis labels */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 50,
          width: 80,
          height: heatMapData.yValues.length * cellHeight,
        }}
      >
        {heatMapData.yValues.map((yValue, index) => (
          <Box
            key={yValue}
            sx={{
              height: cellHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              pr: 1,
              fontSize: '0.75rem',
            }}
          >
            {yValue}
          </Box>
        ))}
      </Box>

      {/* X-axis labels */}
      <Box
        sx={{
          position: 'absolute',
          left: 80,
          top: 0,
          width: heatMapData.xValues.length * cellWidth,
          height: 50,
          display: 'flex',
        }}
      >
        {heatMapData.xValues.map((xValue, index) => (
          <Box
            key={xValue}
            sx={{
              width: cellWidth,
              height: 50,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              pb: 1,
              fontSize: '0.75rem',
              transform: cellWidth < 50 ? 'rotate(-45deg)' : 'none',
              transformOrigin: 'bottom center',
            }}
          >
            {xValue}
          </Box>
        ))}
      </Box>

      {/* Heatmap grid */}
      <Box
        sx={{
          position: 'absolute',
          left: 80,
          top: 50,
          width: heatMapData.xValues.length * cellWidth,
          height: heatMapData.yValues.length * cellHeight,
        }}
      >
        {heatMapData.yValues.map((yValue, yIndex) => (
          <Box key={yValue} sx={{ display: 'flex' }}>
            {heatMapData.xValues.map((xValue, xIndex) => {
              const cell = heatMapData.cells.find(c => c.x === xValue && c.y === yValue)
              return cell ? (
                <HeatMapCell key={`${xValue}-${yValue}`} cell={cell} />
              ) : (
                <Box
                  key={`${xValue}-${yValue}`}
                  sx={{
                    width: cellWidth,
                    height: cellHeight,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                />
              )
            })}
          </Box>
        ))}
      </Box>

      {/* Color scale legend */}
      <Box
        sx={{
          position: 'absolute',
          right: 10,
          top: 50,
          width: 20,
          height: 200,
          background: `linear-gradient(to top, 
            rgba(25, 118, 210, 0.1) 0%, 
            rgba(25, 118, 210, 1) 100%)`,
          border: '1px solid rgba(0,0,0,0.2)',
        }}
      />
      
      {/* Legend labels */}
      <Box sx={{ position: 'absolute', right: 35, top: 50 }}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          {maxValue.toFixed(1)}
        </Typography>
      </Box>
      <Box sx={{ position: 'absolute', right: 35, top: 240 }}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          {minValue.toFixed(1)}
        </Typography>
      </Box>
    </Box>
  )
}