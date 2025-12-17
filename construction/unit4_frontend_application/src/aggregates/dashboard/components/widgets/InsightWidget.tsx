import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Collapse,
  Alert,
  Tooltip,
} from '@mui/material'
import {
  Lightbulb,
  TrendingUp,
  Warning,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  ThumbUp,
  ThumbDown,
  Share,
} from '@mui/icons-material'
import { InsightData, DashboardWidget } from '../../../../types/domain'

interface InsightWidgetProps {
  widget: DashboardWidget
  insight?: InsightData
  isCustomizing: boolean
  onUpdate: (widget: DashboardWidget) => void
}

export const InsightWidget: React.FC<InsightWidgetProps> = ({
  widget,
  insight,
  isCustomizing,
  onUpdate,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null)

  if (!insight) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">
          No insights available
        </Typography>
      </Card>
    )
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <Lightbulb color="primary" />
      case 'trend': return <TrendingUp color="success" />
      case 'alert': return <Warning color="warning" />
      case 'achievement': return <CheckCircle color="success" />
      default: return <Lightbulb color="action" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  const getInsightTypeLabel = (type: string) => {
    switch (type) {
      case 'recommendation': return 'Recommendation'
      case 'trend': return 'Trend Analysis'
      case 'alert': return 'Alert'
      case 'achievement': return 'Achievement'
      default: return 'Insight'
    }
  }

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type)
    // In a real app, this would send feedback to the backend
    console.log(`Insight ${insight.id} marked as ${type}`)
  }

  const handleShare = () => {
    // Implement sharing functionality
    console.log('Sharing insight:', insight.id)
  }

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <CardHeader
        avatar={getInsightIcon(insight.type)}
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              {insight.title}
            </Typography>
            <Chip
              label={getInsightTypeLabel(insight.type)}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        }
        action={
          <Box display="flex" alignItems="center">
            <Chip
              label={insight.priority}
              size="small"
              color={getPriorityColor(insight.priority) as any}
              sx={{ mr: 1 }}
            />
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {insight.description}
        </Typography>

        <Collapse in={expanded}>
          <Box sx={{ mb: 2 }}>
            {insight.actionable && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This insight includes actionable recommendations
              </Alert>
            )}

            <Typography variant="body2" sx={{ mb: 2 }}>
              Generated on {new Date(insight.createdAt).toLocaleDateString()}
            </Typography>

            {insight.kpiIds && insight.kpiIds.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Related KPIs:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                  {insight.kpiIds.map((kpiId) => (
                    <Chip
                      key={kpiId}
                      label={`KPI-${kpiId}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Box display="flex" gap={1}>
                <Tooltip title="Mark as helpful">
                  <IconButton
                    size="small"
                    onClick={() => handleFeedback('helpful')}
                    color={feedback === 'helpful' ? 'success' : 'default'}
                  >
                    <ThumbUp fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Mark as not helpful">
                  <IconButton
                    size="small"
                    onClick={() => handleFeedback('not-helpful')}
                    color={feedback === 'not-helpful' ? 'error' : 'default'}
                  >
                    <ThumbDown fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share insight">
                  <IconButton size="small" onClick={handleShare}>
                    <Share fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {insight.actionable && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    // Handle action implementation
                    console.log('Taking action on insight:', insight.id)
                  }}
                >
                  Take Action
                </Button>
              )}
            </Box>
          </Box>
        </Collapse>

        {!expanded && insight.actionable && (
          <Box mt={2}>
            <Button
              size="small"
              variant="contained"
              fullWidth
              onClick={() => setExpanded(true)}
            >
              View Recommendations
            </Button>
          </Box>
        )}

        {feedback && (
          <Box mt={2}>
            <Alert 
              severity={feedback === 'helpful' ? 'success' : 'info'}
              sx={{ fontSize: '0.8rem' }}
            >
              Thank you for your feedback!
            </Alert>
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
            Insight Widget
          </Typography>
        </Box>
      )}
    </Card>
  )
}