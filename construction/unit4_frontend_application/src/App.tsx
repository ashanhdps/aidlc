import { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { CustomThemeProvider } from './aggregates/session/components/ThemeProvider'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { LazyLoadManager } from './components/common/LazyComponents'
import { setupGlobalErrorHandler } from './utils/errorHandling'
import { applicationIntegrator } from './utils/integration'

// Lazy load pages for better performance
import { lazy } from 'react'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'))
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'))
const TeamDashboardPage = lazy(() => import('./pages/TeamDashboardPage'))
const ExecutiveDashboardPage = lazy(() => import('./pages/ExecutiveDashboardPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const MyKPIsPage = lazy(() => import('./pages/MyKPIsPage'))
const TeamKPIsPage = lazy(() => import('./pages/TeamKPIsPage'))
const KPIAdminPage = lazy(() => import('./pages/KPIAdminPage'))
const KPIApprovalPage = lazy(() => import('./pages/KPIApprovalPage'))

// These are loaded immediately as they're critical for authentication flow
import { LoginPage, UnauthorizedPage, NotFoundPage } from './pages'

// Loading fallback component
const PageLoadingFallback = () => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    minHeight="400px"
  >
    <CircularProgress />
  </Box>
)

function App() {
  // Setup global error handling and application integration
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Setup global error handling
        setupGlobalErrorHandler()
        
        // Initialize application integration
        await applicationIntegrator.initialize()
        
        console.log('Application initialized successfully')
      } catch (error) {
        console.error('Failed to initialize application:', error)
      }
    }

    initializeApp()

    // Cleanup on unmount
    return () => {
      applicationIntegrator.cleanup()
    }
  }, [])

  return (
    <ErrorBoundary>
      <CustomThemeProvider>
        <LazyLoadManager>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Routes>
              {/* Public routes - loaded immediately */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Protected routes with lazy loading */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Suspense fallback={<PageLoadingFallback />}>
                        <Routes>
                          {/* Dashboard - All users */}
                          <Route 
                            path="/dashboard" 
                            element={
                              <ErrorBoundary>
                                <DashboardPage />
                              </ErrorBoundary>
                            } 
                          />
                          
                          {/* Employee: My KPIs - view assigned KPIs */}
                          <Route 
                            path="/my-kpis" 
                            element={
                              <ProtectedRoute requiredRoles={['employee']}>
                                <ErrorBoundary>
                                  <MyKPIsPage />
                                </ErrorBoundary>
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* Employee: Self-Evaluation */}
                          <Route 
                            path="/assessments/self" 
                            element={
                              <ProtectedRoute requiredPermissions={['assessment:self']}>
                                <ErrorBoundary>
                                  <AssessmentPage />
                                </ErrorBoundary>
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* Assessments - All users with assessment:read */}
                          <Route 
                            path="/assessments" 
                            element={
                              <ErrorBoundary>
                                <AssessmentPage />
                              </ErrorBoundary>
                            } 
                          />
                          
                          {/* Feedback - All users */}
                          <Route 
                            path="/feedback" 
                            element={
                              <ErrorBoundary>
                                <FeedbackPage />
                              </ErrorBoundary>
                            } 
                          />
                          
                          {/* Supervisor: Team KPI Management */}
                          <Route 
                            path="/team-kpis" 
                            element={
                              <ProtectedRoute requiredRoles={['supervisor']}>
                                <ErrorBoundary>
                                  <TeamKPIsPage />
                                </ErrorBoundary>
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* Supervisor/HR: Team Dashboard */}
                          <Route 
                            path="/team" 
                            element={
                              <ProtectedRoute requiredRoles={['supervisor', 'manager']}>
                                <ErrorBoundary>
                                  <TeamDashboardPage />
                                </ErrorBoundary>
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* HR: KPI Administration */}
                          <Route 
                            path="/kpi-admin" 
                            element={
                              <ProtectedRoute requiredRoles={['manager']}>
                                <ErrorBoundary>
                                  <KPIAdminPage />
                                </ErrorBoundary>
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* HR: KPI Approval Queue */}
                          <Route 
                            path="/kpi-approval" 
                            element={
                              <ProtectedRoute requiredPermissions={['kpi:approve']}>
                                <ErrorBoundary>
                                  <KPIApprovalPage />
                                </ErrorBoundary>
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* Executive: Reports Dashboard */}
                          <Route 
                            path="/executive" 
                            element={
                              <ProtectedRoute requiredRoles={['executive']}>
                                <ErrorBoundary>
                                  <ExecutiveDashboardPage />
                                </ErrorBoundary>
                              </ProtectedRoute>
                            } 
                          />
                          
                          {/* Settings - All users */}
                          <Route 
                            path="/settings/*" 
                            element={
                              <ErrorBoundary>
                                <SettingsPage />
                              </ErrorBoundary>
                            } 
                          />
                          
                          {/* Catch all - 404 */}
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </Suspense>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Box>
        </LazyLoadManager>
      </CustomThemeProvider>
    </ErrorBoundary>
  )
}

export default App