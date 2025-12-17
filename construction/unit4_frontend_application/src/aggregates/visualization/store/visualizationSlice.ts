import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Visualization, ChartConfiguration } from '../../../types/domain'
import { LoadingState } from '../../../types/common'

interface InteractionState {
  selectedDataPoints: string[]
  zoomLevel: number
  panOffset: { x: number; y: number }
}

interface ExportState {
  isExporting: boolean
  exportFormat: 'csv' | 'excel' | 'pdf' | null
  exportProgress: number
}

interface VisualizationState {
  charts: Visualization[]
  interactions: InteractionState
  exports: ExportState[]
  configurations: ChartConfiguration[]
  loading: LoadingState
}

const initialState: VisualizationState = {
  charts: [],
  interactions: {
    selectedDataPoints: [],
    zoomLevel: 1,
    panOffset: { x: 0, y: 0 },
  },
  exports: [],
  configurations: [],
  loading: {
    isLoading: false,
    error: null,
  },
}

export const visualizationSlice = createSlice({
  name: 'visualization',
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
    addChart: (state, action: PayloadAction<Visualization>) => {
      state.charts.push(action.payload)
    },
    updateChart: (state, action: PayloadAction<Visualization>) => {
      const index = state.charts.findIndex(c => c.id === action.payload.id)
      if (index >= 0) {
        state.charts[index] = action.payload
      }
    },
    removeChart: (state, action: PayloadAction<string>) => {
      state.charts = state.charts.filter(c => c.id !== action.payload)
    },
    selectDataPoints: (state, action: PayloadAction<string[]>) => {
      state.interactions.selectedDataPoints = action.payload
    },
    setZoomLevel: (state, action: PayloadAction<number>) => {
      state.interactions.zoomLevel = action.payload
    },
    setPanOffset: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.interactions.panOffset = action.payload
    },
    startExport: (state, action: PayloadAction<{ format: 'csv' | 'excel' | 'pdf'; chartId: string }>) => {
      state.exports.push({
        isExporting: true,
        exportFormat: action.payload.format,
        exportProgress: 0,
      })
    },
    updateExportProgress: (state, action: PayloadAction<{ index: number; progress: number }>) => {
      if (state.exports[action.payload.index]) {
        state.exports[action.payload.index].exportProgress = action.payload.progress
      }
    },
    completeExport: (state, action: PayloadAction<number>) => {
      if (state.exports[action.payload]) {
        state.exports[action.payload].isExporting = false
        state.exports[action.payload].exportProgress = 100
      }
    },
    resetInteractions: (state) => {
      state.interactions = {
        selectedDataPoints: [],
        zoomLevel: 1,
        panOffset: { x: 0, y: 0 },
      }
    },
  },
})

export const {
  setLoading,
  setError,
  addChart,
  updateChart,
  removeChart,
  selectDataPoints,
  setZoomLevel,
  setPanOffset,
  startExport,
  updateExportProgress,
  completeExport,
  resetInteractions,
} = visualizationSlice.actions