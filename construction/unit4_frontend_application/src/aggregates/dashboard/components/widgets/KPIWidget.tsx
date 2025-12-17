import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Info,
  Refresh,
} from '@mui/icons-material'
import { KPI, DashboardWidget } from '../../../../types/domain'

interface KPIWidgetProps {
  widget: DashboardWidget
  kpi?: KPI
  isCustomizing: boolean
  onUpdate: (widget: DashboardWidget) => void
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  widget,
  kpi,
  isCustomizing,
  onUpdate,
}) => {
  if (!kpi) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">
          No KPI data available
        </Typography>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'success'
      case 'yellow': return 'warning'
      case 'red': return 'error'
      default: return 'default'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" />
      case 'down': return <TrendingDown color="error" />
      case 'stable': return <TrendingFlat color="action" />
      default: return <TrendingFlat color="action" />
    }
  }

  const getProgressPercentage = () => {
    if (kpi.target === 0) return 0
    return Math.min(100, (kpi.current / kpi.target) * 100)
  }

  const handleRefresh = () => {
    // Trigger widget refresh
    onUpdate({
      ...widget,
      data: { ...kpi, lastUpdated: new Date().toISOString() },
    })
  }

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h3" sx={{ fontSize: '1rem', fontWeight: 600 }}>
            {kpi.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            {getTrendIcon(kpi.trend)}
            <Tooltip title="Refresh data">
              <IconButton size="small" onClick={handleRefresh}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '2.5em' }}>
          {kpi.description}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={2}>
          <Typography 
            variant="h3" 
            component="div" 
            sx={{ 
              fontSize: '2rem', 
              fontWeight: 700,
              color: `${getStatusColor(kpi.status)}.main`,
            }}
          >
            {kpi.current.toLocaleString()}
            <Typography component="span" variant="body2" sx={{ ml: 0.5 }}>
              {kpi.unit}
            </Typography>
          </Typography>
          
          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary">
              Target
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {kpi.target.toLocaleString()}{kpi.unit}
            </Typography>
          </Box>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {getProgressPercentage().toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgressPercentage()}
            color={getStatusColor(kpi.status) as any}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Chip
            label={kpi.status === 'green' ? 'On Track' : kpi.status === 'yellow' ? 'At Risk' : 'Behind'}
            size="small"
            color={getStatusColor(kpi.status) as any}
            variant="filled"
          />
          
          <Box display="flex" alignItems="center" gap={0.5}>
            <Tooltip title={`Last updated: ${new Date(kpi.lastUpdated).toLocaleString()}`}>
              <Info fontSize="small" color="action" />
            </Tooltip>
            <Typography variant="caption" color="text.secondary">
              {new Date(kpi.lastUpdated).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        {kpi.category && (
          <Box mt={1}>
            <Chip
              label={kpi.category}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        )}
      </CardContent>

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
            KPI Widget
          </Typography>
        </Box>
      )}
    </Card>
  )
}