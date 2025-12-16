import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ChartConfiguration } from '../../../../types/domain'

interface BarChartProps {
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

export const BarChart: React.FC<BarChartProps> = ({
  data,
  configuration,
  dimensions,
  selectedPoints,
  onDataPointSelect,
}) => {
  const colors = [
    '#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0',
    '#00acc1', '#d32f2f', '#689f38', '#f57c00', '#512da8'
  ]

  // Extract series names from data (excluding 'x' and metadata fields)
  const seriesNames = data.length > 0 
    ? Object.keys(data[0]).filter(key => 
        key !== 'x' && !key.endsWith('_metadata')
      )
    : []

  const handleClick = (data: any) => {
    if (data && data.activePayload) {
      const pointId = `${data.activeLabel}-${data.activePayload[0]?.dataKey}`
      onDataPointSelect([pointId])
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${configuration.axes.xAxis.label || 'Category'}: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {`${entry.dataKey}: ${entry.value?.toLocaleString()}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const isSelected = (dataKey: string, index: number) => {
    const pointId = `${data[index]?.x}-${dataKey}`
    return selectedPoints.includes(pointId)
  }

  return (
    <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
      <RechartsBarChart 
        data={data} 
        onClick={handleClick}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="x"
          name={configuration.axes.xAxis.label}
          angle={data.length > 10 ? -45 : 0}
          textAnchor={data.length > 10 ? 'end' : 'middle'}
          height={data.length > 10 ? 80 : 60}
          interval={0}
        />
        <YAxis 
          name={configuration.axes.yAxis.label}
          domain={[
            configuration.axes.yAxis.min || 0,
            configuration.axes.yAxis.max || 'dataMax'
          ]}
        />
        <Tooltip content={<CustomTooltip />} />
        {configuration.legend.show && <Legend />}
        
        {seriesNames.map((seriesName, seriesIndex) => (
          <Bar
            key={seriesName}
            dataKey={seriesName}
            name={seriesName}
            fill={colors[seriesIndex % colors.length]}
            radius={[2, 2, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  isSelected(seriesName, index)
                    ? '#ff6b6b' // Highlight color for selected bars
                    : colors[seriesIndex % colors.length]
                }
                stroke={isSelected(seriesName, index) ? '#ff4757' : 'none'}
                strokeWidth={isSelected(seriesName, index) ? 2 : 0}
              />
            ))}
          </Bar>
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}