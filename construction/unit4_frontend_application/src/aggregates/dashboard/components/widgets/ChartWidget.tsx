import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material'
import {
  MoreVert,
  Refresh,
  GetApp,
  Settings,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { KPI, DashboardWidget } from '../../../../types/domain'

interface ChartWidgetProps {
  widget: DashboardWidget
  data?: KPI[]
  isCustomizing: boolean
  onUpdate: (widget: DashboardWidget) => void
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  widget,
  data = [],
  isCustomizing,
  onUpdate,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleRefresh = () => {
    onUpdate({
      ...widget,
      data: { refreshed: new Date().toISOString() },
    })
    handleMenuClose()
  }

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting chart data...')
    handleMenuClose()
  }

  const handleConfigure = () => {
    // Implement configuration
    console.log('Configuring chart...')
    handleMenuClose()
  }

  // Transform KPI data for charts
  const getChartData = () => {
    return data.map((kpi) => ({
      name: kpi.name,
      current: kpi.current,
      target: kpi.target,
      percentage: kpi.target > 0 ? (kpi.current / kpi.target) * 100 : 0,
      status: kpi.status,
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return '#4caf50'
      case 'yellow': return '#ff9800'
      case 'red': return '#f44336'
      default: return '#9e9e9e'
    }
  }

  const renderChart = () => {
    const chartData = getChartData()
    const chartType = widget.configuration.chartType || 'bar'

    if (chartData.length === 0) {
      return (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          color="text.secondary"
        >
          No data available
        </Box>
      )
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <RechartsTooltip />
              {widget.configuration.showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke="#1976d2" 
                strokeWidth={2}
                name="Current"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#dc004e" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <RechartsTooltip />
              {widget.configuration.showLegend && <Legend />}
              <Bar dataKey="current" name="Current">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            height="100%"
            color="text.secondary"
          >
            Unsupported chart type: {chartType}
          </Box>
        )
    }
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
            {widget.title}
          </Typography>
        }
        action={
          <Box>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={handleRefresh}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ flexGrow: 1, pt: 0, '&:last-child': { pb: 2 } }}>
        <Box sx={{ height: 'calc(100% - 20px)', minHeight: 200 }}>
          {renderChart()}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRefresh}>
          <Refresh fontSize="small" sx={{ mr: 1 }} />
          Refresh Data
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <GetApp fontSize="small" sx={{ mr: 1 }} />
          Export Chart
        </MenuItem>
        <MenuItem onClick={handleConfigure}>
          <Settings fontSize="small" sx={{ mr: 1 }} />
          Configure
        </MenuItem>
      </Menu>

      {isCustomizing && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ 
            bgcolor: 'background.paper', 
            px: 1, 
            py: 0.5, 
            borderRadius: 0.5,
            border: 1,
            borderColor: 'divider',
          }}>
            Chart Widget ({widget.configuration.chartType || 'bar'})
          </Typography>
        </Box>
      )}
    </Card>
  )
}