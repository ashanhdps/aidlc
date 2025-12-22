import * as React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, Box, AppBar, Toolbar, Typography, Container } from '@mui/material'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { AuthGuard } from './components/auth/AuthGuard'
import { UserProfile } from './components/auth/UserProfile'
import { Navigation } from './components/layout/Navigation'
import { ConnectionTest } from './components/test/ConnectionTest'

// Import original pages
import DashboardPage from './pages/DashboardPage'
import MyKPIsPage from './pages/MyKPIsPage'
import TeamKPIsPage from './pages/TeamKPIsPage'
import TeamDashboardPage from './pages/TeamDashboardPage'
import KPIDefinitionsPage from './pages/KPIDefinitionsPage'
import KPIAdminPage from './pages/KPIAdminPage'
import KPIApprovalPage from './pages/KPIApprovalPage'
import AssessmentPage from './pages/AssessmentPage'
import FeedbackPage from './pages/FeedbackPage'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

const AppContent: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Performance Management System
          </Typography>
          <UserProfile />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-kpis" element={<MyKPIsPage />} />
          <Route path="/team-kpis" element={<TeamKPIsPage />} />
          <Route path="/team" element={<TeamDashboardPage />} />
          <Route path="/kpi-definitions" element={<KPIDefinitionsPage />} />
          <Route path="/kpi-admin" element={<KPIAdminPage />} />
          <Route path="/kpi-approval" element={<KPIApprovalPage />} />
          <Route path="/assessments" element={<AssessmentPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/connection-test" element={<ConnectionTest />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Container>
    </Box>
  )
}

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthGuard>
            <AppContent />
          </AuthGuard>
        </Router>
      </ThemeProvider>
    </Provider>
  )
}

export default App