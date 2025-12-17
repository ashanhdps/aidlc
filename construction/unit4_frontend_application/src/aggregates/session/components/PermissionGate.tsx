import React from 'react'
import { Box, Alert, Button, Typography } from '@mui/material'
import { Lock as LockIcon, Home as HomeIcon } from '@mui/icons-material'
import { useAppSelector } from '../../../hooks/redux'
import { UserRole } from '../../../types/domain'

interface PermissionGateProps {
  children: React.ReactNode
  permissions?: string[]
  roles?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  showFallback?: boolean
  redirectTo?: string
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback,
  showFallback = true,
  redirectTo,
}) => {
  const { user, permissions: userPermissions } = useAppSelector((state) => state.session)

  const hasPermission = (permission: string): boolean => {
    return userPermissions.permissions.includes(permission) || 
           userPermissions.canAccess[permission] === true
  }

  const hasRole = (role: string): boolean => {
    return user?.role.name === role || userPermissions.roles.includes(role)
  }

  const checkPermissions = (): boolean => {
    if (permissions.length === 0 && roles.length === 0) {
      return true // No restrictions
    }

    let hasRequiredPermissions = true
    let hasRequiredRoles = true

    // Check permissions
    if (permissions.length > 0) {
      if (requireAll) {
        hasRequiredPermissions = permissions.every(permission => hasPermission(permission))
      } else {
        hasRequiredPermissions = permissions.some(permission => hasPermission(permission))
      }
    }

    // Check roles
    if (roles.length > 0) {
      if (requireAll) {
        hasRequiredRoles = roles.every(role => hasRole(role))
      } else {
        hasRequiredRoles = roles.some(role => hasRole(role))
      }
    }

    // If both permissions and roles are specified, both must pass
    if (permissions.length > 0 && roles.length > 0) {
      return hasRequiredPermissions && hasRequiredRoles
    }

    // If only one type is specified, that one must pass
    return hasRequiredPermissions && hasRequiredRoles
  }

  const hasAccess = checkPermissions()

  if (hasAccess) {
    return <>{children}</>
  }

  // User doesn't have access
  if (!showFallback) {
    return null
  }

  if (fallback) {
    return <>{fallback}</>
  }

  // Default access denied UI
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        p: 4,
        textAlign: 'center',
      }}
    >
      <LockIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      
      <Typography variant="h5" gutterBottom>
        Access Denied
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        You don't have permission to access this content.
      </Typography>

      {permissions.length > 0 && (
        <Alert severity="info" sx={{ mb: 2, maxWidth: 400 }}>
          <Typography variant="body2">
            Required permissions: {permissions.join(', ')}
          </Typography>
        </Alert>
      )}

      {roles.length > 0 && (
        <Alert severity="info" sx={{ mb: 2, maxWidth: 400 }}>
          <Typography variant="body2">
            Required roles: {roles.join(', ')}
          </Typography>
        </Alert>
      )}

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          onClick={() => {
            if (redirectTo) {
              window.location.href = redirectTo
            } else {
              window.history.back()
            }
          }}
        >
          Go Back
        </Button>
        
        <Button
          variant="contained"
          onClick={() => {
            window.location.href = '/dashboard'
          }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Box>
  )
}

// Higher-order component version
export const withPermissions = (
  permissions?: string[],
  roles?: string[],
  requireAll?: boolean
) => {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function PermissionWrappedComponent(props: P) {
      return (
        <PermissionGate
          permissions={permissions}
          roles={roles}
          requireAll={requireAll}
        >
          <Component {...props} />
        </PermissionGate>
      )
    }
  }
}

// Hook for checking permissions in components
export const usePermissions = () => {
  const { user, permissions: userPermissions } = useAppSelector((state) => state.session)

  const hasPermission = (permission: string): boolean => {
    return userPermissions.permissions.includes(permission) || 
           userPermissions.canAccess[permission] === true
  }

  const hasRole = (role: string): boolean => {
    return user?.role.name === role || userPermissions.roles.includes(role)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role))
  }

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => hasRole(role))
  }

  const canAccess = (
    permissions: string[] = [],
    roles: string[] = [],
    requireAll: boolean = false
  ): boolean => {
    if (permissions.length === 0 && roles.length === 0) {
      return true
    }

    let hasRequiredPermissions = true
    let hasRequiredRoles = true

    if (permissions.length > 0) {
      hasRequiredPermissions = requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions)
    }

    if (roles.length > 0) {
      hasRequiredRoles = requireAll 
        ? hasAllRoles(roles)
        : hasAnyRole(roles)
    }

    if (permissions.length > 0 && roles.length > 0) {
      return hasRequiredPermissions && hasRequiredRoles
    }

    return hasRequiredPermissions && hasRequiredRoles
  }

  return {
    user,
    permissions: userPermissions.permissions,
    roles: userPermissions.roles,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    canAccess,
  }
}