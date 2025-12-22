import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  allowedRoles?: string[]
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  redirectTo = '/dashboard'
}) => {
  const { user, authentication } = useAppSelector(state => state.session)
  
  // Check if user is authenticated
  if (!authentication?.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const userRole = user?.role?.name || 'employee'

  // Check role-based access
  let hasAccess = true

  if (requiredRole) {
    hasAccess = userRole === requiredRole
  } else if (allowedRoles && allowedRoles.length > 0) {
    hasAccess = allowedRoles.includes(userRole)
  }

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}