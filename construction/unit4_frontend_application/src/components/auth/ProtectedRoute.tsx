import { useEffect, useState, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { initializeFromStorage } from '../../aggregates/session/store/sessionSlice'
import { AuthenticationManager } from '../../aggregates/session/services/AuthenticationManager'
import { UserPreferencesManager } from '../../aggregates/session/services/UserPreferencesManager'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermissions?: string[]
  requiredRoles?: string[]
  requireAll?: boolean
}

export const ProtectedRoute = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAll = false,
}: ProtectedRouteProps) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { authentication, permissions, loading } = useAppSelector((state) => state.session)
  const [isCheckingStorage, setIsCheckingStorage] = useState(true)
  
  const authManager = new AuthenticationManager()
  const preferencesManager = new UserPreferencesManager()

  useEffect(() => {
    // Initialize session from storage on first load
    if (!authentication.isAuthenticated && !loading.isLoading) {
      const storedAuth = authManager.getStoredAuthState()
      const storedPreferences = preferencesManager.loadPreferences()
      
      if (storedAuth) {
        dispatch(initializeFromStorage({
          token: storedAuth.token,
          user: storedAuth.user,
          preferences: storedPreferences,
        }))
      }
    }
    // Mark storage check as complete
    setIsCheckingStorage(false)
  }, [dispatch, authentication.isAuthenticated, loading.isLoading])

  // Show loading while checking authentication or storage
  if (loading.isLoading || isCheckingStorage) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    )
  }

  // Redirect to login if not authenticated
  if (!authentication.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check permissions if specified
  if (requiredPermissions.length > 0 || requiredRoles.length > 0) {
    const hasRequiredPermissions = requiredPermissions.length === 0 || (
      requireAll
        ? requiredPermissions.every(permission => permissions.permissions.includes(permission))
        : requiredPermissions.some(permission => permissions.permissions.includes(permission))
    )

    const hasRequiredRoles = requiredRoles.length === 0 || (
      requireAll
        ? requiredRoles.every(role => permissions.roles.includes(role))
        : requiredRoles.some(role => permissions.roles.includes(role))
    )

    const hasAccess = requiredPermissions.length > 0 && requiredRoles.length > 0
      ? hasRequiredPermissions && hasRequiredRoles
      : hasRequiredPermissions && hasRequiredRoles

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}