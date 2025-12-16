import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockTestData } from '../../utils/testUtils'
import { DashboardContainer } from '../../aggregates/dashboard/components/DashboardContainer'

// Mock the services
jest.mock('../../services/mockApi/mockDataService', () => ({
  mockDataService: {
    getDashboard: jest.fn(),
    getKPIs: jest.fn(),
    getInsights: jest.fn()
  }
}))

describe('DashboardContainer', () => {
  const mockInitialState = {
    session: {
      auth: {
        isAuthenticated: true,
        user: mockTestData.user,
        token: 'mock-token',
        refreshToken: null,
        expiresAt: null
      },
      preferences: {
        theme: 'light' as const,
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          inApp: true,
          frequency: 'immediate' as const
        },
        dashboard: {
          defaultView: 'personal' as const,
          autoRefresh: true,
          refreshInterval: 300000
        }
      },
      navigation: {
        currentPath: '/dashboard',
        breadcrumbs: [],
        sidebarOpen: true
      }
    },
    dashboard: {
      current: mockTestData.dashboard,
      widgets: [],
      filters: mockTestData.dashboard.filters,
      customization: {
        isCustomizing: false,
        availableWidgets: []
      },
      loading: {
        dashboard: false,
        widgets: false,
        insights: false
      },
      error: null
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dashboard container with loading state', () => {
    const loadingState = {
      ...mockInitialState,
      dashboard: {
        ...mockInitialState.dashboard,
        loading: {
          dashboard: true,
          widgets: true,
          insights: true
        }
      }
    }

    renderWithProviders(<DashboardContainer />, {
      initialState: loadingState
    })

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders dashboard with widgets when loaded', async () => {
    renderWithProviders(<DashboardContainer />, {
      initialState: mockInitialState
    })

    await waitFor(() => {
      expect(screen.getByText('Test Dashboard')).toBeInTheDocument()
    })
  })

  it('handles dashboard customization toggle', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<DashboardContainer />, {
      initialState: mockInitialState
    })

    const customizeButton = screen.getByRole('button', { name: /customize/i })
    await user.click(customizeButton)

    // Should show customization panel
    await waitFor(() => {
      expect(screen.getByText(/dashboard customization/i)).toBeInTheDocument()
    })
  })

  it('displays error state when dashboard fails to load', () => {
    const errorState = {
      ...mockInitialState,
      dashboard: {
        ...mockInitialState.dashboard,
        error: 'Failed to load dashboard'
      }
    }

    renderWithProviders(<DashboardContainer />, {
      initialState: errorState
    })

    expect(screen.getByText(/failed to load dashboard/i)).toBeInTheDocument()
  })

  it('handles filter changes', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<DashboardContainer />, {
      initialState: mockInitialState
    })

    // Find and interact with filter controls
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)

    // Should show filter panel
    await waitFor(() => {
      expect(screen.getByText(/time range/i)).toBeInTheDocument()
    })
  })

  it('refreshes dashboard data', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<DashboardContainer />, {
      initialState: mockInitialState
    })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await user.click(refreshButton)

    // Should trigger data refresh
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  it('handles responsive layout changes', () => {
    // Mock window resize
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    renderWithProviders(<DashboardContainer />, {
      initialState: mockInitialState
    })

    // Should adapt to mobile layout
    expect(screen.getByTestId('dashboard-container')).toHaveClass('mobile-layout')
  })
})