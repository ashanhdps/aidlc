import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockTestData } from '../../utils/testUtils'
import { AssessmentContainer } from '../../aggregates/assessment/components/AssessmentContainer'

describe('AssessmentContainer', () => {
  const mockTemplate = {
    id: 'template-1',
    name: 'Test Assessment Template',
    description: 'Test template description',
    version: 1,
    sections: [
      {
        id: 'section-1',
        title: 'Performance Goals',
        description: 'Evaluate your performance goals',
        order: 1,
        fields: [
          {
            id: 'field-1',
            type: 'rating' as const,
            label: 'Goal Achievement',
            required: true,
            validation: [{ type: 'required' as const, message: 'Rating is required' }],
            options: ['1', '2', '3', '4', '5'],
            order: 1
          },
          {
            id: 'field-2',
            type: 'textarea' as const,
            label: 'Comments',
            placeholder: 'Enter your comments...',
            required: false,
            validation: [],
            order: 2
          }
        ]
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
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
        currentPath: '/assessments',
        breadcrumbs: [],
        sidebarOpen: true
      }
    },
    assessment: {
      templates: [mockTemplate],
      currentAssessment: null,
      currentTemplate: mockTemplate,
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
        totalSections: 1,
        completedFields: 0,
        totalFields: 2,
        percentage: 0
      },
      loading: {
        templates: false,
        assessment: false,
        saving: false
      },
      error: null
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders assessment form with template fields', async () => {
    renderWithProviders(<AssessmentContainer />, {
      initialState: mockInitialState
    })

    await waitFor(() => {
      expect(screen.getByText('Test Assessment Template')).toBeInTheDocument()
      expect(screen.getByText('Performance Goals')).toBeInTheDocument()
      expect(screen.getByLabelText('Goal Achievement')).toBeInTheDocument()
      expect(screen.getByLabelText('Comments')).toBeInTheDocument()
    })
  })

  it('handles form field input', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<AssessmentContainer />, {
      initialState: mockInitialState
    })

    // Fill in rating field
    const ratingField = screen.getByLabelText('Goal Achievement')
    await user.selectOptions(ratingField, '4')

    // Fill in textarea
    const commentsField = screen.getByLabelText('Comments')
    await user.type(commentsField, 'Great progress this quarter')

    await waitFor(() => {
      expect(ratingField).toHaveValue('4')
      expect(commentsField).toHaveValue('Great progress this quarter')
    })
  })

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<AssessmentContainer />, {
      initialState: mockInitialState
    })

    // Try to submit without filling required field
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Rating is required')).toBeInTheDocument()
    })
  })

  it('saves draft automatically', async () => {
    const user = userEvent.setup()
    
    renderWithProviders(<AssessmentContainer />, {
      initialState: mockInitialState
    })

    const commentsField = screen.getByLabelText('Comments')
    await user.type(commentsField, 'Auto-save test')

    // Should trigger auto-save after typing
    await waitFor(() => {
      expect(screen.getByText(/draft saved/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays progress indicator', () => {
    const progressState = {
      ...mockInitialState,
      assessment: {
        ...mockInitialState.assessment,
        progress: {
          completedSections: 0,
          totalSections: 1,
          completedFields: 1,
          totalFields: 2,
          percentage: 50
        }
      }
    }

    renderWithProviders(<AssessmentContainer />, {
      initialState: progressState
    })

    expect(screen.getByText('50% Complete')).toBeInTheDocument()
  })

  it('handles form submission', async () => {
    const user = userEvent.setup()
    
    const completedState = {
      ...mockInitialState,
      assessment: {
        ...mockInitialState.assessment,
        responses: {
          'field-1': '4',
          'field-2': 'Completed assessment'
        },
        validation: {
          errors: [],
          isValid: true
        }
      }
    }

    renderWithProviders(<AssessmentContainer />, {
      initialState: completedState
    })

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/assessment submitted/i)).toBeInTheDocument()
    })
  })

  it('handles loading states', () => {
    const loadingState = {
      ...mockInitialState,
      assessment: {
        ...mockInitialState.assessment,
        loading: {
          templates: true,
          assessment: false,
          saving: false
        }
      }
    }

    renderWithProviders(<AssessmentContainer />, {
      initialState: loadingState
    })

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('displays error state', () => {
    const errorState = {
      ...mockInitialState,
      assessment: {
        ...mockInitialState.assessment,
        error: 'Failed to load assessment template'
      }
    }

    renderWithProviders(<AssessmentContainer />, {
      initialState: errorState
    })

    expect(screen.getByText(/failed to load assessment template/i)).toBeInTheDocument()
  })
})