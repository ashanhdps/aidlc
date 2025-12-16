import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockTestData } from '../../utils/testUtils'
import { FeedbackContainer } from '../../aggregates/feedback/components/FeedbackContainer'

describe('FeedbackContainer', () => {
  const mockFeedbackMessage = {
    id: 'msg-1',
    threadId: 'thread-1',
    senderId: 'manager-1',
    content: 'Great work on the quarterly goals!',
    type: 'feedback' as const,
    sentiment: 'positive' as const,
    readBy: ['test-user-1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }

  const mockThread = {
    ...mockTestData.feedbackThread,
    messages: [mockFeedbackMessage]
  }

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
        currentPath: '/feedback',
        breadcrumbs: [],
        sidebarOpen: true
      }
    },
    feedback: {
      threads: [mockThread],
      currentThread: mockThread,
      searchQuery: '',
      filters: {
        status: [],
        sentiment: [],
        dateRange: null
      },
      notifications: {
        unreadCount: 1,
        notifications: [
          {
            id: 'notif-1',
            userId: 'test-user-1',
            type: 'feedback' as const,
            title: 'New Feedback',
            message: 'You have received new feedback',
            read: false,
            priority: 'medium' as const,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]
      },
      loading: {
        threads: false,
        messages: false,
        sending: false
      },
      error: null
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders feedback threads list', async () => {
    renderWithProviders(<FeedbackContainer />, {
      initialState: mockInitialState
    })

    await waitFor(() => {
      expect(screen.getByText('Test Feedback Thread')).toBeInTheDocument()
      expect(screen.getByText('Great work on the quarterly goals!')).toBeInTheDocument()
    })
  })

  it('handles thread selection', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<FeedbackContainer />, {
      initialState: mockInitialState
    })

    const threadItem = screen.getByText('Test Feedback Thread')
    await user.click(threadItem)

    await waitFor(() => {
      expect(screen.getByText('Great work on the quarterly goals!')).toBeInTheDocument()
    })
  })

  it('handles feedback search', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<FeedbackContainer />, {
      initialState: mockInitialState
    })

    const searchInput = screen.getByPlaceholderText(/search feedback/i)
    await user.type(searchInput, 'quarterly')

    await waitFor(() => {
      expect(searchInput).toHaveValue('quarterly')
    })
  })

  it('sends new feedback response', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<FeedbackContainer />, {
      initialState: mockInitialState
    })

    // Find response form
    const responseInput = screen.getByPlaceholderText(/type your response/i)
    await user.type(responseInput, 'Thank you for the feedback!')

    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Thank you for the feedback!')).toBeInTheDocument()
    })
  })

  it('displays notification panel', () => {
    renderWithProviders(<FeedbackContainer />, {
      initialState: mockInitialState
    })

    expect(screen.getByText('1')).toBeInTheDocument() // Unread count badge
    expect(screen.getByText('New Feedback')).toBeInTheDocument()
  })

  it('handles notification dismissal', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<FeedbackContainer />, {
      initialState: mockInitialState
    })

    const dismissButton = screen.getByRole('button', { name: /dismiss/i })
    await user.click(dismissButton)

    await waitFor(() => {
      expect(screen.queryByText('New Feedback')).not.toBeInTheDocument()
    })
  })

  it('filters feedback by status', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<FeedbackContainer />, {
      initialState: mockInitialState
    })

    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)

    const activeFilter = screen.getByRole('checkbox', { name: /active/i })
    await user.click(activeFilter)

    await waitFor(() => {
      expect(activeFilter).toBeChecked()
    })
  })

  it('handles loading states', () => {
    const loadingState = {
      ...mockInitialState,
      feedback: {
        ...mockInitialState.feedback,
        loading: {
          threads: true,
          messages: false,
          sending: false
        }
      }
    }

    renderWithProviders(<FeedbackContainer />, {
      initialState: loadingState
    })

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('displays error state', () => {
    const errorState = {
      ...mockInitialState,
      feedback: {
        ...mockInitialState.feedback,
        error: 'Failed to load feedback threads'
      }
    }

    renderWithProviders(<FeedbackContainer />, {
      initialState: errorState
    })

    expect(screen.getByText(/failed to load feedback threads/i)).toBeInTheDocument()
  })

  it('handles thread actions', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<FeedbackContainer />, {
      initialState: mockInitialState
    })

    const actionsButton = screen.getByRole('button', { name: /actions/i })
    await user.click(actionsButton)

    await waitFor(() => {
      expect(screen.getByText(/mark as resolved/i)).toBeInTheDocument()
      expect(screen.getByText(/archive thread/i)).toBeInTheDocument()
    })
  })
})