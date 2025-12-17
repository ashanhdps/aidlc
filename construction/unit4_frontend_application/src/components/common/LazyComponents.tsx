import React, { Suspense } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { loadComponent } from '../../utils/performance'

// Loading fallback component
const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="200px"
    gap={2}
  >
    <CircularProgress />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
)

// Error boundary for lazy components
class LazyComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component loading error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="200px"
          gap={2}
        >
          <Typography variant="h6" color="error">
            Failed to load component
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please refresh the page to try again
          </Typography>
        </Box>
      )
    }

    return this.props.children
  }
}

// HOC for lazy loading components
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  loadingMessage?: string,
  errorFallback?: React.ReactNode
) {
  const LazyComponent = loadComponent(importFunc)

  return React.forwardRef<any, P>((props, ref) => (
    <LazyComponentErrorBoundary fallback={errorFallback}>
      <Suspense fallback={<LoadingFallback message={loadingMessage} />}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </LazyComponentErrorBoundary>
  ))
}

// Lazy loaded page components
export const LazyDashboardPage = withLazyLoading(
  () => import('../../pages/DashboardPage'),
  'Loading Dashboard...'
)

export const LazyAssessmentPage = withLazyLoading(
  () => import('../../pages/AssessmentPage'),
  'Loading Assessment...'
)

export const LazyFeedbackPage = withLazyLoading(
  () => import('../../pages/FeedbackPage'),
  'Loading Feedback...'
)

export const LazyTeamDashboardPage = withLazyLoading(
  () => import('../../pages/TeamDashboardPage'),
  'Loading Team Dashboard...'
)

export const LazyExecutiveDashboardPage = withLazyLoading(
  () => import('../../pages/ExecutiveDashboardPage'),
  'Loading Executive Dashboard...'
)

export const LazySettingsPage = withLazyLoading(
  () => import('../../pages/SettingsPage'),
  'Loading Settings...'
)

// Lazy loaded aggregate components
export const LazyDashboardContainer = withLazyLoading(
  () => import('../../aggregates/dashboard/components/DashboardContainer'),
  'Loading Dashboard Components...'
)

export const LazyVisualizationContainer = withLazyLoading(
  () => import('../../aggregates/visualization/components/VisualizationContainer'),
  'Loading Visualization Components...'
)

export const LazyAssessmentContainer = withLazyLoading(
  () => import('../../aggregates/assessment/components/AssessmentContainer'),
  'Loading Assessment Components...'
)

export const LazyFeedbackContainer = withLazyLoading(
  () => import('../../aggregates/feedback/components/FeedbackContainer'),
  'Loading Feedback Components...'
)

// Lazy loaded chart components
export const LazyLineChart = withLazyLoading(
  () => import('../../aggregates/visualization/components/charts/LineChart'),
  'Loading Chart...'
)

export const LazyBarChart = withLazyLoading(
  () => import('../../aggregates/visualization/components/charts/BarChart'),
  'Loading Chart...'
)

export const LazyPieChart = withLazyLoading(
  () => import('../../aggregates/visualization/components/charts/PieChart'),
  'Loading Chart...'
)

export const LazyHeatMap = withLazyLoading(
  () => import('../../aggregates/visualization/components/charts/HeatMap'),
  'Loading Chart...'
)

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload dashboard components as they're most commonly accessed
  import('../../pages/DashboardPage')
  import('../../aggregates/dashboard/components/DashboardContainer')
  
  // Preload authentication components
  import('../../pages/LoginPage')
  import('../../components/auth/ProtectedRoute')
}

// Component for managing lazy loading state
export const LazyLoadManager: React.FC<{
  children: React.ReactNode
  preloadOnMount?: boolean
}> = ({ children, preloadOnMount = true }) => {
  React.useEffect(() => {
    if (preloadOnMount) {
      // Preload critical components after initial render
      setTimeout(preloadCriticalComponents, 100)
    }
  }, [preloadOnMount])

  return <>{children}</>
}