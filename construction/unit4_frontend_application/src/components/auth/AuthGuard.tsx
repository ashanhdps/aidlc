import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { initializeFromStorage } from '../../aggregates/session/store/sessionSlice'
import { LoginForm } from './LoginForm'
import { UserProfile } from '../../types/domain'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector(state => state.session.authentication)

  useEffect(() => {
    // Check for stored authentication on app load
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_profile')

    if (storedToken && storedUser) {
      try {
        const userProfile: UserProfile = JSON.parse(storedUser)
        dispatch(initializeFromStorage({
          token: storedToken,
          user: userProfile,
          preferences: {
            theme: 'light',
            language: 'en',
            timezone: 'UTC',
            notifications: {
              email: true,
              push: true,
              inApp: true,
              frequency: 'immediate',
            },
            dashboard: {
              defaultView: 'personal',
              autoRefresh: true,
              refreshInterval: 300000,
            },
          }
        }))
      } catch (error) {
        console.error('Failed to restore authentication:', error)
        // Clear invalid stored data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_profile')
      }
    }
  }, [dispatch])

  if (!isAuthenticated || !user) {
    return <LoginForm />
  }

  return <>{children}</>
}