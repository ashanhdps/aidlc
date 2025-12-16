import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts'
import { ChartConfiguration } from '../../../../types/domain'

interface LineChartProps {
  data: any[]
  configuration: ChartConfiguration
  dimensions: { width: number | string; height: number | string }
  selectedPoints: string[]
  zoomLevel: number
  panOffset: { x: number; y: number }
  onDataPointSelect: (points: string[]) => void
  onZoom: (level: number) => void
  onPan: (offset: { x: number; y: number }) => void
  scatter?: boolean
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  configuration,
  dimensions,
  selectedPoints,
  onDataPointSelect,
  scatter = false,
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
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${configuration.axes.xAxis.label || 'X'}: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (scatter) {
    return (
      <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
        <ScatterChart data={data} onClick={handleClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="x" 
            type="number"
            name={configuration.axes.xAxis.label}
            domain={configuration.axes.xAxis.type === 'number' ? ['dataMin', 'dataMax'] : undefined}
          />
          <YAxis 
            type="number"
            name={configuration.axes.yAxis.label}
            domain={[
              configuration.axes.yAxis.min || 'dataMin',
              configuration.axes.yAxis.max || 'dataMax'
            ]}
          />
          <Tooltip content={<CustomTooltip />} />
          {configuration.legend.show && <Legend />}
          {seriesNames.map((seriesName, index) => (
            <Scatter
              key={seriesName}
              name={seriesName}
              data={data.map(d => ({ x: d.x, y: d[seriesName] })).filter(d => d.y !== null)}
              fill={colors[index % colors.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
      <RechartsLineChart data={data} onClick={handleClick}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="x"
          name={configuration.axes.xAxis.label}
          type={configuration.axes.xAxis.type === 'number' ? 'number' : 'category'}
        />
        <YAxis 
          name={configuration.axes.yAxis.label}
          domain={[
            configuration.axes.yAxis.min || 'dataMin',
            configuration.axes.yAxis.max || 'dataMax'
          ]}
        />
        <Tooltip content={<CustomTooltip />} />
        {configuration.legend.show && <Legend />}
        {seriesNames.map((seriesName, index) => (
          <Line
            key={seriesName}
            type="monotone"
            dataKey={seriesName}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ 
              r: 6, 
              stroke: colors[index % colors.length],
              strokeWidth: 2,
              fill: 'white'
            }}
            connectNulls={false}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}