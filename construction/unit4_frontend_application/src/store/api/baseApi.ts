import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).session.authentication.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    headers.set('content-type', 'application/json')
    return headers
  },
})

// Base API configuration
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery,
  tagTypes: ['KPI', 'Assignment', 'Template', 'Assessment', 'Feedback', 'Performance', 'Insights'],
  endpoints: () => ({}),
})