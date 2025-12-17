/**
 * Session Slice Unit Tests
 * Tests for authentication, session management, and user preferences
 */

import { configureStore } from '@reduxjs/toolkit'
import {
  sessionSlice,
  login,
  logout,
  refreshToken,
  updatePreferences,
  setCurrentPath,
  initializeFromStorage,
  setSessionExpired,
} from '../sessionSlice'

describe('Session Slice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        session: sessionSlice.reducer,
      },
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().session
      expect(state.authentication.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.permissions.roles).toEqual([])
      expect(state.permissions.permissions).toEqual([])
    })
  })

  describe('Login Action', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: {
        id: 'role-1',
        name: 'employee' as const,
        permissions: ['dashboard:read', 'assessment:read'],
      },
      department: 'Engineering',
      permissions: ['dashboard:read', 'assessment:read'],
      avatar: undefined,
    }

    it('should set authenticated state on login', () => {
      store.dispatch(
        login({
          user: mockUser,
          token: 'test-token',
          refreshToken: 'test-refresh-token',
          expiresAt: '2024-12-31T23:59:59Z',
        })
      )

      const state = store.getState().session
      expect(state.authentication.isAuthenticated).toBe(true)
      expect(state.authentication.token).toBe('test-token')
      expect(state.user).toEqual(mockUser)
    })

    it('should set user permissions on login', () => {
      store.dispatch(
        login({
          user: mockUser,
          token: 'test-token',
          refreshToken: 'test-refresh-token',
          expiresAt: '2024-12-31T23:59:59Z',
        })
      )

      const state = store.getState().session
      expect(state.permissions.roles).toContain('employee')
      expect(state.permissions.permissions).toContain('dashboard:read')
      expect(state.permissions.canAccess['dashboard:read']).toBe(true)
    })
  })

  describe('Logout Action', () => {
    it('should clear authentication state on logout', () => {
      // First login
      store.dispatch(
        login({
          user: {
            id: 'user-1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: { id: 'role-1', name: 'employee', permissions: [] },
            department: 'Engineering',
            permissions: [],
            avatar: undefined,
          },
          token: 'test-token',
          refreshToken: 'test-refresh-token',
          expiresAt: '2024-12-31T23:59:59Z',
        })
      )

      // Then logout
      store.dispatch(logout())

      const state = store.getState().session
      expect(state.authentication.isAuthenticated).toBe(false)
      expect(state.authentication.token).toBeNull()
      expect(state.user).toBeNull()
      expect(state.permissions.roles).toEqual([])
    })
  })

  describe('Refresh Token Action', () => {
    it('should update token on refresh', () => {
      store.dispatch(
        refreshToken({
          token: 'new-token',
          expiresAt: '2024-12-31T23:59:59Z',
        })
      )

      const state = store.getState().session
      expect(state.authentication.token).toBe('new-token')
      expect(state.authentication.expiresAt).toBe('2024-12-31T23:59:59Z')
    })
  })

  describe('Update Preferences Action', () => {
    it('should update user preferences', () => {
      store.dispatch(
        updatePreferences({
          theme: 'dark',
          language: 'es',
        })
      )

      const state = store.getState().session
      expect(state.preferences.theme).toBe('dark')
      expect(state.preferences.language).toBe('es')
    })

    it('should merge preferences with existing state', () => {
      store.dispatch(updatePreferences({ theme: 'dark' }))
      store.dispatch(updatePreferences({ language: 'fr' }))

      const state = store.getState().session
      expect(state.preferences.theme).toBe('dark')
      expect(state.preferences.language).toBe('fr')
    })
  })

  describe('Navigation Actions', () => {
    it('should update current path', () => {
      store.dispatch(setCurrentPath('/dashboard'))

      const state = store.getState().session
      expect(state.navigation.currentPath).toBe('/dashboard')
    })

    it('should track previous path', () => {
      store.dispatch(setCurrentPath('/dashboard'))
      store.dispatch(setCurrentPath('/assessments'))

      const state = store.getState().session
      expect(state.navigation.currentPath).toBe('/assessments')
      expect(state.navigation.previousPath).toBe('/dashboard')
    })
  })

  describe('Initialize From Storage Action', () => {
    it('should restore session from storage', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: { id: 'role-1', name: 'employee' as const, permissions: ['read'] },
        department: 'Engineering',
        permissions: ['read'],
        avatar: undefined,
      }

      store.dispatch(
        initializeFromStorage({
          token: 'stored-token',
          user: mockUser,
          preferences: {
            theme: 'dark',
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
          },
        })
      )

      const state = store.getState().session
      expect(state.authentication.isAuthenticated).toBe(true)
      expect(state.authentication.token).toBe('stored-token')
      expect(state.user).toEqual(mockUser)
      expect(state.preferences.theme).toBe('dark')
    })
  })

  describe('Session Expired Action', () => {
    it('should mark session as expired', () => {
      // First login
      store.dispatch(
        login({
          user: {
            id: 'user-1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: { id: 'role-1', name: 'employee', permissions: [] },
            department: 'Engineering',
            permissions: [],
            avatar: undefined,
          },
          token: 'test-token',
          refreshToken: 'test-refresh-token',
          expiresAt: '2024-12-31T23:59:59Z',
        })
      )

      // Then expire session
      store.dispatch(setSessionExpired())

      const state = store.getState().session
      expect(state.authentication.isAuthenticated).toBe(false)
      expect(state.authentication.token).toBeNull()
      expect(state.loading.error).toBe('Session expired. Please log in again.')
    })
  })
})
