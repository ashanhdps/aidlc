import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dashboard, DashboardWidget } from '../../../types/domain'
import { FilterContext, LoadingState } from '../../../types/common'

interface DashboardState {
  configurations: Dashboard[]
  currentDashboard: Dashboard | null
  widgets: DashboardWidget[]
  filters: FilterContext
  layout: {
    columns: number
    rows: number
    responsive: boolean
  }
  loading: LoadingState
}

const initialState: DashboardState = {
  configurations: [],
  currentDashboard: null,
  widgets: [],
  filters: {
    timeRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      period: 'monthly',
    },
  },
  layout: {
    columns: 12,
    rows: 6,
    responsive: true,
  },
  loading: {
    isLoading: false,
    error: null,
  },
}

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.isLoading = action.payload
      if (action.payload) {
        state.loading.error = null
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.loading.error = action.payload
      state.loading.isLoading = false
    },
    setCurrentDashboard: (state, action: PayloadAction<Dashboard>) => {
      state.currentDashboard = action.payload
      state.widgets = action.payload.widgets
      state.filters = action.payload.filters
      state.layout = action.payload.layout
    },
    updateWidget: (state, action: PayloadAction<DashboardWidget>) => {
      const index = state.widgets.findIndex(w => w.id === action.payload.id)
      if (index >= 0) {
        state.widgets[index] = action.payload
      } else {
        state.widgets.push(action.payload)
      }
      
      // Update current dashboard if it exists
      if (state.currentDashboard) {
        state.currentDashboard.widgets = state.widgets
      }
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(w => w.id !== action.payload)
      
      if (state.currentDashboard) {
        state.currentDashboard.widgets = state.widgets
      }
    },
    applyFilters: (state, action: PayloadAction<FilterContext>) => {
      state.filters = action.payload
      
      if (state.currentDashboard) {
        state.currentDashboard.filters = action.payload
      }
    },
    updateLayout: (state, action: PayloadAction<{ columns: number; rows: number; responsive: boolean }>) => {
      state.layout = action.payload
      
      if (state.currentDashboard) {
        state.currentDashboard.layout = action.payload
      }
    },
    updateKPIData: (state, action: PayloadAction<{ widgetId: string; data: any }>) => {
      const widget = state.widgets.find(w => w.id === action.payload.widgetId)
      if (widget) {
        widget.data = action.payload.data
      }
    },
    setLoaded: (state, action: PayloadAction<Dashboard>) => {
      state.loading.isLoading = false
      state.loading.error = null
      state.currentDashboard = action.payload
      state.widgets = action.payload.widgets
      state.filters = action.payload.filters
      state.layout = action.payload.layout
    },
  },
})

export const {
  setLoading,
  setError,
  setCurrentDashboard,
  updateWidget,
  removeWidget,
  applyFilters,
  updateLayout,
  updateKPIData,
  setLoaded,
} = dashboardSlice.actions