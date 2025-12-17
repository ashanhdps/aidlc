import React from 'react'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { renderWithProviders, mockTestData } from '../../utils/testUtils'
import { DashboardContainer } from '../../aggregates/dashboard/components/DashboardContainer'
import { AssessmentContainer } from '../../aggregates/assessment/components/AssessmentContainer'
import { FeedbackContainer } from '../../aggregates/feedback/components/FeedbackContainer'
import App from '../../App'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  const mockState = {
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

  describe('Dashboard Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<DashboardContainer />, {
        initialState: mockState
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels for widgets', () => {
      const { container } = renderWithProviders(<DashboardContainer />, {
        initialState: mockState
      })

      const widgets = container.querySelectorAll('[role="region"]')
      widgets.forEach(widget => {
        expect(widget).toHaveAttribute('aria-label')
      })
    })

    it('should support keyboard navigation', () => {
      const { container } = renderWithProviders(<DashboardContainer />, {
        initialState: mockState
      })

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      focusableElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })

  describe('Assessment Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<AssessmentContainer />, {
        initialState: mockState
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper form labels', () => {
      const { container } = renderWithProviders(<AssessmentContainer />, {
        initialState: mockState
      })

      const inputs = container.querySelectorAll('input, select, textarea')
      inputs.forEach(input => {
        const id = input.getAttribute('id')
        if (id) {
          const label = container.querySelector(`label[for="${id}"]`)
          expect(label).toBeInTheDocument()
        }
      })
    })

    it('should announce validation errors', () => {
      const errorState = {
        ...mockState,
        assessment: {
          ...mockState.assessment,
          validation: {
            errors: [{ field: 'test-field', message: 'This field is required' }],
            isValid: false
          }
        }
      }

      const { container } = renderWithProviders(<AssessmentContainer />, {
        initialState: errorState
      })

      const errorMessages = container.querySelectorAll('[role="alert"]')
      expect(errorMessages.length).toBeGreaterThan(0)
    })
  })

  describe('Feedback Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<FeedbackContainer />, {
        initialState: mockState
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading hierarchy', () => {
      const { container } = renderWithProviders(<FeedbackContainer />, {
        initialState: mockState
      })

      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      let previousLevel = 0

      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1))
        expect(level).toBeLessThanOrEqual(previousLevel + 1)
        previousLevel = level
      })
    })

    it('should have accessible thread navigation', () => {
      const { container } = renderWithProviders(<FeedbackContainer />, {
        initialState: mockState
      })

      const threadList = container.querySelector('[role="list"]')
      if (threadList) {
        const threadItems = threadList.querySelectorAll('[role="listitem"]')
        threadItems.forEach(item => {
          expect(item).toHaveAttribute('tabindex', '0')
        })
      }
    })
  })

  describe('Application-wide Accessibility', () => {
    it('should not have accessibility violations in main app', async () => {
      const { container } = renderWithProviders(<App />, {
        initialState: mockState,
        route: '/dashboard'
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper landmark roles', () => {
      const { container } = renderWithProviders(<App />, {
        initialState: mockState,
        route: '/dashboard'
      })

      expect(container.querySelector('[role="banner"]')).toBeInTheDocument()
      expect(container.querySelector('[role="navigation"]')).toBeInTheDocument()
      expect(container.querySelector('[role="main"]')).toBeInTheDocument()
    })

    it('should have skip links for keyboard users', () => {
      const { container } = renderWithProviders(<App />, {
        initialState: mockState,
        route: '/dashboard'
      })

      const skipLink = container.querySelector('a[href="#main-content"]')
      expect(skipLink).toBeInTheDocument()
    })

    it('should support high contrast mode', () => {
      const { container } = renderWithProviders(<App />, {
        initialState: mockState,
        route: '/dashboard'
      })

      // Check that colors have sufficient contrast
      const elements = container.querySelectorAll('*')
      elements.forEach(element => {
        const styles = window.getComputedStyle(element)
        const backgroundColor = styles.backgroundColor
        const color = styles.color

        // Basic check - ensure colors are not the same
        if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
          expect(backgroundColor).not.toBe(color)
        }
      })
    })

    it('should have proper focus management', () => {
      const { container } = renderWithProviders(<App />, {
        initialState: mockState,
        route: '/dashboard'
      })

      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )

      // Ensure all focusable elements have visible focus indicators
      focusableElements.forEach(element => {
        element.focus()
        const styles = window.getComputedStyle(element, ':focus')
        expect(styles.outline).not.toBe('none')
      })
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper ARIA live regions for dynamic content', () => {
      const { container } = renderWithProviders(<App />, {
        initialState: mockState,
        route: '/dashboard'
      })

      const liveRegions = container.querySelectorAll('[aria-live]')
      expect(liveRegions.length).toBeGreaterThan(0)

      liveRegions.forEach(region => {
        const ariaLive = region.getAttribute('aria-live')
        expect(['polite', 'assertive', 'off']).toContain(ariaLive)
      })
    })

    it('should have descriptive button labels', () => {
      const { container } = renderWithProviders(<App />, {
        initialState: mockState,
        route: '/dashboard'
      })

      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.trim().length > 0
        const hasAriaLabel = button.hasAttribute('aria-label')
        const hasAriaLabelledBy = button.hasAttribute('aria-labelledby')

        expect(hasText || hasAriaLabel || hasAriaLabelledBy).toBe(true)
      })
    })

    it('should have proper table headers for data tables', () => {
      const { container } = renderWithProviders(<App />, {
        initialState: mockState,
        route: '/dashboard'
      })

      const tables = container.querySelectorAll('table')
      tables.forEach(table => {
        const headers = table.querySelectorAll('th')
        if (headers.length > 0) {
          headers.forEach(header => {
            expect(header).toHaveAttribute('scope')
          })
        }
      })
    })
  })
})