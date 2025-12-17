import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { configureStore } from '@reduxjs/toolkit'
import { RootState } from '../store/store'
import { dashboardSlice } from '../aggregates/dashboard/store/dashboardSlice'
import { visualizationSlice } from '../aggregates/visualization/store/visualizationSlice'
import { assessmentSlice } from '../aggregates/assessment/store/assessmentSlice'
import { feedbackSlice } from '../aggregates/feedback/store/feedbackSlice'
import { sessionSlice } from '../aggregates/session/store/sessionSlice'
import { kpiManagementApi } from '../store/api/kpiManagementApi'
import { performanceManagementApi } from '../store/api/performanceManagementApi'
import { dataAnalyticsApi } from '../store/api/dataAnalyticsApi'
import { createTheme } from '@mui/material/styles'

// Test theme
const testTheme = createTheme({
  palette: {
    mode: 'light',
  },
})

// Mock store setup
export function setupTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      dashboard: dashboardSlice.reducer,
      visualization: visualizationSlice.reducer,
      assessment: assessmentSlice.reducer,
      feedback: feedbackSlice.reducer,
      session: sessionSlice.reducer,
      [kpiManagementApi.reducerPath]: kpiManagementApi.reducer,
      [performanceManagementApi.reducerPath]: performanceManagementApi.reducer,
      [dataAnalyticsApi.reducerPath]: dataAnalyticsApi.reducer,
    },
    preloadedState: preloadedState as any,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode
  initialState?: Partial<RootState>
  route?: string
}

function TestWrapper({ children, initialState, route = '/' }: TestWrapperProps) {
  const store = setupTestStore(initialState)
  
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={testTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  )
}

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Partial<RootState>
  route?: string
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { initialState, route, ...renderOptions } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper initialState={initialState} route={route}>
      {children}
    </TestWrapper>
  )

  return {
    store: setupTestStore(initialState),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Mock data generators for tests
export const mockTestData = {
  user: {
    id: 'test-user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: {
      id: 'role-1',
      name: 'employee' as const,
      permissions: ['read:own_kpis', 'write:own_assessments']
    },
    department: 'Engineering',
    permissions: ['read:own_kpis', 'write:own_assessments']
  },

  kpi: {
    id: 'test-kpi-1',
    name: 'Test KPI',
    description: 'Test KPI description',
    current: 85,
    target: 100,
    unit: '%',
    status: 'yellow' as const,
    trend: 'up' as const,
    category: 'Performance',
    lastUpdated: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  dashboard: {
    id: 'test-dashboard-1',
    userId: 'test-user-1',
    name: 'Test Dashboard',
    description: 'Test dashboard description',
    layout: {
      columns: 12,
      rows: 6,
      responsive: true
    },
    widgets: [],
    filters: {
      timeRange: {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        period: 'monthly' as const
      }
    },
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  assessment: {
    id: 'test-assessment-1',
    templateId: 'test-template-1',
    userId: 'test-user-1',
    status: 'draft' as const,
    responses: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  feedbackThread: {
    id: 'test-thread-1',
    title: 'Test Feedback Thread',
    participants: ['test-user-1', 'manager-1'],
    messages: [],
    status: 'active' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
}

// Mock API responses
export const mockApiResponses = {
  success: function<T>(data: T) {
    return {
      data,
      success: true,
      timestamp: new Date().toISOString()
    }
  },

  error: (message: string, code: string = 'TEST_ERROR') => ({
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString()
    }
  })
}

// Test utilities
export const testUtils = {
  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock localStorage
  mockLocalStorage: () => {
    const store: Record<string, string> = {}
    
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key]
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key])
      })
    }
  },

  // Mock fetch
  mockFetch: (response: any, ok: boolean = true) => {
    return jest.fn(() =>
      Promise.resolve({
        ok,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response))
      })
    )
  },

  // Create mock event
  createMockEvent: (type: string, data: any = {}) => ({
    type,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: { value: '' },
    ...data
  })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'