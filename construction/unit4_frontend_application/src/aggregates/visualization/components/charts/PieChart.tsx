import React, { useState } from 'react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartConfiguration } from '../../../../types/domain'

interface PieChartProps {
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

export const PieChart: React.FC<PieChartProps> = ({
  data,
  configuration,
  dimensions,
  selectedPoints,
  onDataPointSelect,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const colors = [
    '#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0',
    '#00acc1', '#d32f2f', '#689f38', '#f57c00', '#512da8',
    '#795548', '#607d8b', '#e91e63', '#673ab7', '#3f51b5'
  ]

  const handleClick = (data: any, index: number) => {
    const pointId = `pie-${index}-${data.name}`
    onDataPointSelect([pointId])
    setActiveIndex(index)
  }

  const handleMouseEnter = (data: any, index: number) => {
    setActiveIndex(index)
  }

  const handleMouseLeave = () => {
    setActiveIndex(null)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / getTotalValue()) * 100).toFixed(1)
      
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: payload[0].color }}>
            {data.name}
          </p>
          <p style={{ margin: 0 }}>
            Value: {data.value.toLocaleString()}
          </p>
          <p style={{ margin: 0 }}>
            Percentage: {percentage}%
          </p>
          {data.series && (
            <p style={{ margin: 0, fontSize: '0.8em', color: '#666' }}>
              Series: {data.series}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const getTotalValue = () => {
    return data.reduce((sum, entry) => sum + entry.value, 0)
  }

  const isSelected = (index: number) => {
    const pointId = `pie-${index}-${data[index]?.name}`
    return selectedPoints.includes(pointId)
  }

  const getRadius = (index: number) => {
    const baseRadius = 80
    const isActive = activeIndex === index
    const isSelectedPoint = isSelected(index)
    
    if (isActive || isSelectedPoint) {
      return { innerRadius: 0, outerRadius: baseRadius + 10 }
    }
    return { innerRadius: 0, outerRadius: baseRadius }
  }

  return (
    <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={CustomLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {data.map((entry, index) => {
            const radius = getRadius(index)
            return (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
                stroke={isSelected(index) ? '#333' : 'none'}
                strokeWidth={isSelected(index) ? 2 : 0}
                style={{
                  filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                  cursor: 'pointer',
                }}
                {...radius}
              />
            )
          })}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {configuration.legend.show && (
          <Legend 
            verticalAlign={configuration.legend.position === 'top' || configuration.legend.position === 'bottom' ? configuration.legend.position : 'bottom'}
            align={configuration.legend.position === 'left' || configuration.legend.position === 'right' ? configuration.legend.position : 'center'}
            layout={configuration.legend.position === 'left' || configuration.legend.position === 'right' ? 'vertical' : 'horizontal'}
            wrapperStyle={{
              paddingTop: configuration.legend.position === 'top' ? '0' : '20px',
              paddingBottom: configuration.legend.position === 'bottom' ? '0' : '20px',
            }}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}