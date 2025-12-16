/**
 * ProtectedRoute Component Tests
 * Tests for route protection, RBAC, and permission-based access
 */

import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../utils/testUtils'
import { ProtectedRoute } from '../ProtectedRoute'

// Mock useNavigate and useLocation
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  const authenticatedState = {
    session: {
      authentication: {
        isAuthenticated: true,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        expiresAt: '2024-12-31T23:59:59Z',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: { id: 'role-1', name: 'employee', permissions: ['dashboard:read'] },
          department: 'Engineering',
          permissions: ['dashboard:read'],
        },
      },
      user: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: { id: 'role-1', name: 'employee', permissions: ['dashboard:read'] },
        department: 'Engineering',
        permissions: ['dashboard:read'],
      },
      permissions: {
        roles: ['employee'],
        permissions: ['dashboard:read'],
        canAccess: { 'dashboard:read': true },
      },
      loading: { isLoading: false, error: null },
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: { email: true, push: true, inApp: true, frequency: 'immediate' },
        dashboard: { defaultView: 'personal', autoRefresh: true, refreshInterval: 300000 },
      },
      navigation: { currentPath: '/', previousPath: null, breadcrumbs: [] },
    },
  }

  const unauthenticatedState = {
    session: {
      authentication: {
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        expiresAt: null,
        user: null,
      },
      user: null,
      permissions: {
        roles: [],
        permissions: [],
        canAccess: {},
      },
      loading: { isLoading: false, error: null },
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: { email: true, push: true, inApp: true, frequency: 'immediate' },
        dashboard: { defaultView: 'personal', autoRefresh: true, refreshInterval: 300000 },
      },
      navigation: { currentPath: '/', previousPath: null, breadcrumbs: [] },
    },
  }

  describe('Authentication Check', () => {
    it('should render children when authenticated', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        { initialState: authenticatedState }
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('should redirect to login when not authenticated', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        { initialState: unauthenticatedState }
      )

      expect(screen.getByTestId('navigate')).toHaveTextContent('/login')
    })
  })

  describe('Permission-Based Access', () => {
    it('should allow access when user has required permission', () => {
      renderWithProviders(
        <ProtectedRoute requiredPermissions={['dashboard:read']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        { initialState: authenticatedState }
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('should deny access when user lacks required permission', () => {
      renderWithProviders(
        <ProtectedRoute requiredPermissions={['admin:write']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        { initialState: authenticatedState }
      )

      expect(screen.getByTestId('navigate')).toHaveTextContent('/unauthorized')
    })

    it('should allow access when user has any of required permissions (requireAll=false)', () => {
      const stateWithMultiplePermissions = {
        ...authenticatedState,
        session: {
          ...authenticatedState.session,
          permissions: {
            roles: ['employee'],
            permissions: ['dashboard:read', 'assessment:read'],
            canAccess: { 'dashboard:read': true, 'assessment:read': true },
          },
        },
      }

      renderWithProviders(
        <ProtectedRoute 
          requiredPermissions={['dashboard:read', 'admin:write']} 
          requireAll={false}
        >
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        { initialState: stateWithMultiplePermissions }
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('should deny access when user lacks all required permissions (requireAll=true)', () => {
      renderWithProviders(
        <ProtectedRoute 
          requiredPermissions={['dashboard:read', 'admin:write']} 
          requireAll={true}
        >
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        { initialState: authenticatedState }
      )

      expect(screen.getByTestId('navigate')).toHaveTextContent('/unauthorized')
    })
  })

  describe('Role-Based Access', () => {
    it('should allow access when user has required role', () => {
      renderWithProviders(
        <ProtectedRoute requiredRoles={['employee']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        { initialState: authenticatedState }
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('should deny access when user lacks required role', () => {
      renderWithProviders(
        <ProtectedRoute requiredRoles={['admin']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        { initialState: authenticatedState }
      )

      expect(screen.getByTestId('navigate')).toHaveTextContent('/unauthorized')
    })

    it('should allow access when user has any of required roles', () => {
      renderWithProviders(
        <ProtectedRoute requiredRoles={['employee', 'admin']} requireAll={false}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        { initialState: authenticatedState }
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      const loadingState = {
        ...authenticatedState,
        session: {
          ...authenticatedState.session,
          loading: { isLoading: true, error: null },
        },
      }

      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>,
        { initialState: loadingState }
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })
})
