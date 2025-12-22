import React from 'react'
import { useAppSelector } from '../../hooks/redux'

interface AdminOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showMessage?: boolean
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ 
  children, 
  fallback,
  showMessage = true 
}) => {
  const { user } = useAppSelector(state => state.session)
  const userRole = user?.role?.name || 'employee'
  const isAdmin = userRole === 'admin'

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (!showMessage) {
      return null
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Administrator Access Required</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            This section is restricted to system administrators only. 
            User management operations require elevated privileges.
          </p>
          <div className="mt-4 p-3 bg-yellow-50 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Current Role:</strong> {userRole} | <strong>Required Role:</strong> admin
            </p>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Contact your system administrator if you need access to this feature.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook for checking admin status
export const useIsAdmin = () => {
  const { user } = useAppSelector(state => state.session)
  const userRole = user?.role?.name || 'employee'
  return userRole === 'admin'
}