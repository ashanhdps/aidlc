import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { dashboardSlice } from '../aggregates/dashboard/store/dashboardSlice'
import { visualizationSlice } from '../aggregates/visualization/store/visualizationSlice'
import { assessmentSlice } from '../aggregates/assessment/store/assessmentSlice'
import { feedbackSlice } from '../aggregates/feedback/store/feedbackSlice'
import { sessionSlice } from '../aggregates/session/store/sessionSlice'
import { kpiManagementApi } from './api/kpiManagementApi'
import { performanceManagementApi } from './api/performanceManagementApi'
import { dataAnalyticsApi } from './api/dataAnalyticsApi'

export const store = configureStore({
  reducer: {
    // Domain aggregates
    dashboard: dashboardSlice.reducer,
    visualization: visualizationSlice.reducer,
    assessment: assessmentSlice.reducer,
    feedback: feedbackSlice.reducer,
    session: sessionSlice.reducer,
    
    // API slices
    [kpiManagementApi.reducerPath]: kpiManagementApi.reducer,
    [performanceManagementApi.reducerPath]: performanceManagementApi.reducer,
    [dataAnalyticsApi.reducerPath]: dataAnalyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(kpiManagementApi.middleware)
      .concat(performanceManagementApi.middleware)
      .concat(dataAnalyticsApi.middleware),
  devTools: import.meta.env.MODE !== 'production',
})

// Enable listener behavior for the store
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch