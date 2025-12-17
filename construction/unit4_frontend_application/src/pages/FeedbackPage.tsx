import React, { useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useAppSelector } from '../hooks/redux'
import { FeedbackContainer } from '../aggregates/feedback/components/FeedbackContainer'
import { metricsService } from '../services/MetricsService'

const FeedbackPage: React.FC = () => {
  const { user } = useAppSelector(state => state.session)

  useEffect(() => {
    metricsService.trackPageLoad('feedback')
    metricsService.trackUserInteraction('page_visit', 'FeedbackPage')
  }, [])

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Feedback & Communication
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Engage in meaningful conversations about performance and development.
        </Typography>
      </Box>
      
      <FeedbackContainer userId={user?.id || 'user-1'} />
    </Box>
  )
}
export default FeedbackPage