import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockTestData } from '../../utils/testUtils'
import App from '../../App'

// Mock the services
jest.mock('../../services/mockApi/mockDataService')
jest.mock('../../services/WebSocketManager')

describe('User Workflows Integration Tests', () => {
  const mockAuthenticatedState = {
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
    },
    assessment: {
      templates: [],
      currentAssessment: null,
      currentTemplate: null,
      responses: {},
      validation: {
        errors: [],
        isValid: true
      },
      draft: {
        assessmentId: '',
        responses: {},
        lastSaved: '',
        autoSaveEnabled: true
      },
      progress: {
        completedSections: 0,
        totalSections: 0,
        completedFields: 0,
        totalFields: 0,
        percentage: 0
      },
      loading: {
        templates: false,
        assessment: false,
        saving: false
      },
      error: null
    },
    feedback: {
      threads: [],
      currentThread: null,
      searchQuery: '',
      filters: {
        status: [],
        sentiment: [],
        dateRange: null
      },
      notifications: {
        unreadCount: 0,
        notifications: []
      },
      loading: {
        threads: false,
        messages: false,
        sending: false
      },
      error: null
    },
    visualization: {
      charts: [],
      currentChart: null,
      configuration: {
        type: 'line',
        responsive: true,
        legend: { show: true, position: 'top' },
        axes: {
          xAxis: { type: 'category' },
          yAxis: { type: 'number' }
        },
        tooltip: { show: true }
      },
      interactions: {
        selectedDataPoint: null,
        hoveredElement: null,
        zoomLevel: 1
      },
      export: {
        isExporting: false,
        format: 'png',
        options: {}
      },
      loading: {
        charts: false,
        data: false,
        export: false
      },
      error: null
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Dashboard Workflow', () => {
    it('completes full dashboard interaction workflow', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<App />, {
        initialState: mockAuthenticatedState,
        route: '/dashboard'
      })

      // Should load dashboard
      await waitFor(() => {
        expect(screen.getByText('Test Dashboard')).toBeInTheDocument()
      })

      // Customize dashboard
      const customizeButton = screen.getByRole('button', { name: /customize/i })
      await user.click(customizeButton)

      await waitFor(() => {
        expect(screen.getByText(/dashboard customization/i)).toBeInTheDocument()
      })

      // Add a widget
      const addWidgetButton = screen.getByRole('button', { name: /add widget/i })
      await user.click(addWidgetButton)

      // Select KPI widget
      const kpiWidgetOption = screen.getByText(/kpi widget/i)
      await user.click(kpiWidgetOption)

      // Save customization
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.queryByText(/dashboard customization/i)).not.toBeInTheDocument()
      })
    })

    it('handles dashboard filtering and refresh', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<App />, {
        initialState: mockAuthenticatedState,
        route: '/dashboard'
      })

      // Open filters
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)

      // Change time range
      const timeRangeSelect = screen.getByLabelText(/time range/i)
      await user.selectOptions(timeRangeSelect, 'weekly')

      // Apply filters
      const applyButton = screen.getByRole('button', { name: /apply/i })
      await user.click(applyButton)

      // Refresh dashboard
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await user.click(refreshButton)

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
      })
    })
  })

  describe('Assessment Workflow', () => {
    it('completes full assessment submission workflow', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<App />, {
        initialState: mockAuthenticatedState,
        route: '/assessments'
      })

      // Navigate to assessments
      await waitFor(() => {
        expect(screen.getByText(/assessments/i)).toBeInTheDocument()
      })

      // Start new assessment
      const startButton = screen.getByRole('button', { name: /start assessment/i })
      await user.click(startButton)

      // Fill out form fields (mock)
      const ratingField = screen.getByLabelText(/rating/i)
      await user.selectOptions(ratingField, '4')

      const textField = screen.getByLabelText(/comments/i)
      await user.type(textField, 'Excellent progress this quarter')

      // Save draft
      const saveDraftButton = screen.getByRole('button', { name: /save draft/i })
      await user.click(saveDraftButton)

      await waitFor(() => {
        expect(screen.getByText(/draft saved/i)).toBeInTheDocument()
      })

      // Submit assessment
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/assessment submitted/i)).toBeInTheDocument()
      })
    })
  })

  describe('Feedback Workflow', () => {
    it('completes feedback interaction workflow', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<App />, {
        initialState: mockAuthenticatedState,
        route: '/feedback'
      })

      // Navigate to feedback
      await waitFor(() => {
        expect(screen.getByText(/feedback/i)).toBeInTheDocument()
      })

      // Search for feedback
      const searchInput = screen.getByPlaceholderText(/search feedback/i)
      await user.type(searchInput, 'performance')

      // Select a thread
      const threadItem = screen.getByText(/performance discussion/i)
      await user.click(threadItem)

      // Reply to feedback
      const replyInput = screen.getByPlaceholderText(/type your response/i)
      await user.type(replyInput, 'Thank you for the constructive feedback!')

      const sendButton = screen.getByRole('button', { name: /send/i })
      await user.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText('Thank you for the constructive feedback!')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Workflow', () => {
    it('navigates between all main sections', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<App />, {
        initialState: mockAuthenticatedState,
        route: '/dashboard'
      })

      // Start at dashboard
      expect(screen.getByText('Test Dashboard')).toBeInTheDocument()

      // Navigate to assessments
      const assessmentsLink = screen.getByRole('link', { name: /assessments/i })
      await user.click(assessmentsLink)

      await waitFor(() => {
        expect(window.location.pathname).toBe('/assessments')
      })

      // Navigate to feedback
      const feedbackLink = screen.getByRole('link', { name: /feedback/i })
      await user.click(feedbackLink)

      await waitFor(() => {
        expect(window.location.pathname).toBe('/feedback')
      })

      // Navigate to settings
      const settingsLink = screen.getByRole('link', { name: /settings/i })
      await user.click(settingsLink)

      await waitFor(() => {
        expect(window.location.pathname).toBe('/settings')
      })
    })
  })

  describe('Error Handling Workflow', () => {
    it('handles network errors gracefully', async () => {
      const errorState = {
        ...mockAuthenticatedState,
        dashboard: {
          ...mockAuthenticatedState.dashboard,
          error: 'Network error occurred'
        }
      }

      renderWithProviders(<App />, {
        initialState: errorState,
        route: '/dashboard'
      })

      expect(screen.getByText(/network error occurred/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('handles authentication errors', async () => {
      const unauthenticatedState = {
        ...mockAuthenticatedState,
        session: {
          ...mockAuthenticatedState.session,
          auth: {
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null
          }
        }
      }

      renderWithProviders(<App />, {
        initialState: unauthenticatedState,
        route: '/dashboard'
      })

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login')
      })
    })
  })
})