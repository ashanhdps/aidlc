import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { sessionSlice } from '../aggregates/session/store/sessionSlice'
import { kpiManagementApi } from './api/kpiManagementApi'

export const store = configureStore({
  reducer: {
    // Essential slices only
    session: sessionSlice.reducer,
    
    // API slices
    [kpiManagementApi.reducerPath]: kpiManagementApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(kpiManagementApi.middleware),
  devTools: import.meta.env.MODE !== 'production',
})

// Enable listener behavior for the store
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch