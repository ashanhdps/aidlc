import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { loginWithJWT } from '../../aggregates/session/store/sessionSlice'
import { LoginForm } from './LoginForm'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector(state => state.session.authentication)

  useEffect(() => {
    // Check for stored JWT token on app load
    const storedToken = localStorage.getItem('jwt_token')
    const storedUserInfo = localStorage.getItem('user_info')

    if (storedToken && storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo)
        
        // Restore authentication from stored JWT
        dispatch(loginWithJWT({
          token: storedToken,
          username: userInfo.username,
          role: userInfo.role,
          userId: userInfo.userId,
          expiresIn: 86400 // Default 24 hours, will be validated by backend
        }))
      } catch (error) {
        console.error('Failed to restore authentication:', error)
        // Clear invalid stored data
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('user_info')
      }
    }
  }, [dispatch])

  if (!isAuthenticated || !user) {
    return <LoginForm onSuccess={() => {
      // Authentication successful, component will re-render
    }} />
  }

  return <>{children}</>
}