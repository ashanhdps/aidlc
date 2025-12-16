/**
 * Dashboard Slice Unit Tests
 * Tests for dashboard state management, widgets, and filters
 */

import { configureStore } from '@reduxjs/toolkit'
import {
  dashboardSlice,
  setCurrentDashboard,
  updateWidget,
  removeWidget,
  applyFilters,
  setLoading,
  setError,
  updateLayout,
  updateKPIData,
  setLoaded,
} from '../dashboardSlice'

describe('Dashboard Slice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        dashboard: dashboardSlice.reducer,
      },
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().dashboard
      expect(state.widgets).toEqual([])
      expect(state.loading.isLoading).toBe(false)
      expect(state.loading.error).toBeNull()
      expect(state.currentDashboard).toBeNull()
    })
  })

  describe('Dashboard Configuration', () => {
    const mockDashboard = {
      id: 'dashboard-1',
      userId: 'user-1',
      name: 'My Dashboard',
      description: 'Test dashboard',
      layout: { columns: 12, rows: 6, responsive: true },
      widgets: [],
      filters: {
        timeRange: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          period: 'monthly' as const,
        },
      },
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    it('should set current dashboard', () => {
      store.dispatch(setCurrentDashboard(mockDashboard))

      const state = store.getState().dashboard
      expect(state.currentDashboard).toEqual(mockDashboard)
    })

    it('should update widgets when setting dashboard', () => {
      const dashboardWithWidgets = {
        ...mockDashboard,
        widgets: [
          {
            id: 'widget-1',
            type: 'kpi' as const,
            title: 'Sales KPI',
            position: { x: 0, y: 0, width: 4, height: 2 },
            config: { kpiId: 'kpi-1' },
          },
        ],
      }

      store.dispatch(setCurrentDashboard(dashboardWithWidgets))

      const state = store.getState().dashboard
      expect(state.widgets).toHaveLength(1)
    })
  })

  describe('Widget Management', () => {
    const mockWidget = {
      id: 'widget-1',
      type: 'kpi' as const,
      title: 'Sales KPI',
      position: { x: 0, y: 0, width: 4, height: 2 },
      config: { kpiId: 'kpi-1' },
    }

    it('should add a widget via updateWidget', () => {
      store.dispatch(updateWidget(mockWidget))

      const state = store.getState().dashboard
      expect(state.widgets).toHaveLength(1)
      expect(state.widgets[0]).toEqual(mockWidget)
    })

    it('should update existing widget', () => {
      store.dispatch(updateWidget(mockWidget))
      store.dispatch(
        updateWidget({
          ...mockWidget,
          title: 'Updated Sales KPI',
        })
      )

      const state = store.getState().dashboard
      expect(state.widgets).toHaveLength(1)
      expect(state.widgets[0].title).toBe('Updated Sales KPI')
    })

    it('should remove a widget', () => {
      store.dispatch(updateWidget(mockWidget))
      store.dispatch(removeWidget('widget-1'))

      const state = store.getState().dashboard
      expect(state.widgets).toHaveLength(0)
    })

    it('should handle multiple widgets', () => {
      const widget2 = { ...mockWidget, id: 'widget-2', title: 'Revenue KPI' }
      
      store.dispatch(updateWidget(mockWidget))
      store.dispatch(updateWidget(widget2))

      const state = store.getState().dashboard
      expect(state.widgets).toHaveLength(2)
    })
  })

  describe('Filter Management', () => {
    it('should apply filters', () => {
      const filters = {
        timeRange: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          period: 'monthly' as const,
        },
        departments: ['Engineering', 'Sales'],
        kpiTypes: ['performance', 'quality'],
      }

      store.dispatch(applyFilters(filters))

      const state = store.getState().dashboard
      expect(state.filters).toEqual(filters)
    })

    it('should replace filters completely', () => {
      store.dispatch(
        applyFilters({
          timeRange: {
            startDate: '2024-01-01',
            endDate: '2024-06-30',
            period: 'quarterly' as const,
          },
        })
      )

      store.dispatch(
        applyFilters({
          timeRange: {
            startDate: '2024-07-01',
            endDate: '2024-12-31',
            period: 'monthly' as const,
          },
          departments: ['Engineering'],
        })
      )

      const state = store.getState().dashboard
      expect(state.filters.timeRange?.period).toBe('monthly')
      expect(state.filters.departments).toContain('Engineering')
    })
  })

  describe('Layout Management', () => {
    it('should update layout', () => {
      store.dispatch(updateLayout({ columns: 16, rows: 8, responsive: false }))

      const state = store.getState().dashboard
      expect(state.layout.columns).toBe(16)
      expect(state.layout.rows).toBe(8)
      expect(state.layout.responsive).toBe(false)
    })
  })

  describe('KPI Data Updates', () => {
    it('should update KPI data for a widget', () => {
      const mockWidget = {
        id: 'widget-1',
        type: 'kpi' as const,
        title: 'Sales KPI',
        position: { x: 0, y: 0, width: 4, height: 2 },
        config: { kpiId: 'kpi-1' },
      }

      store.dispatch(updateWidget(mockWidget))
      store.dispatch(updateKPIData({ widgetId: 'widget-1', data: { value: 85, target: 100 } }))

      const state = store.getState().dashboard
      expect(state.widgets[0].data).toEqual({ value: 85, target: 100 })
    })
  })

  describe('Loading State', () => {
    it('should set loading state', () => {
      store.dispatch(setLoading(true))

      const state = store.getState().dashboard
      expect(state.loading.isLoading).toBe(true)
    })

    it('should clear error when loading starts', () => {
      store.dispatch(setError('Previous error'))
      store.dispatch(setLoading(true))

      const state = store.getState().dashboard
      expect(state.loading.error).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should set error state', () => {
      store.dispatch(setError('Failed to load dashboard'))

      const state = store.getState().dashboard
      expect(state.loading.error).toBe('Failed to load dashboard')
      expect(state.loading.isLoading).toBe(false)
    })
  })

  describe('Set Loaded Action', () => {
    it('should set dashboard as loaded', () => {
      const mockDashboard = {
        id: 'dashboard-1',
        userId: 'user-1',
        name: 'My Dashboard',
        description: 'Test dashboard',
        layout: { columns: 12, rows: 6, responsive: true },
        widgets: [],
        filters: {
          timeRange: {
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            period: 'monthly' as const,
          },
        },
        isDefault: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      store.dispatch(setLoading(true))
      store.dispatch(setLoaded(mockDashboard))

      const state = store.getState().dashboard
      expect(state.loading.isLoading).toBe(false)
      expect(state.currentDashboard).toEqual(mockDashboard)
    })
  })
})
