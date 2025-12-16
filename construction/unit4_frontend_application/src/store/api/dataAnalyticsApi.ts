import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'
import type { PerformanceData, PerformanceFilters, InsightData } from '../../types/domain'

const getToken = (state: RootState) => state.session.authentication.token

export const dataAnalyticsApi = createApi({
  reducerPath: 'dataAnalyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/data-analytics',
    prepareHeaders: (headers, { getState }) => {
      const token = getToken(getState() as RootState)
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Performance', 'Insights', 'Reports', 'Integration'],
  endpoints: (builder) => ({
    getPerformanceData: builder.query<PerformanceData[], PerformanceFilters>({
      query: (filters) => ({ 
        url: '/performance/employee', 
        params: filters 
      }),
      providesTags: ['Performance'],
      // Mock implementation
      queryFn: async (filters) => {
        await new Promise(resolve => setTimeout(resolve, 600))
        
        const mockData: PerformanceData[] = [
          {
            id: '1',
            userId: 'user1',
            kpiId: '1',
            value: 85,
            target: 100,
            period: '2024-01',
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            userId: 'user1',
            kpiId: '2',
            value: 92,
            target: 90,
            period: '2024-01',
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
        
        return { data: mockData }
      },
    }),
    
    getInsights: builder.query<InsightData[], { userId: string }>({
      query: ({ userId }) => ({ 
        url: `/insights/${userId}` 
      }),
      providesTags: ['Insights'],
      // Mock implementation
      queryFn: async ({ userId }) => {
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const mockInsights: InsightData[] = [
          {
            id: '1',
            type: 'recommendation',
            title: 'Improve Sales Performance',
            description: 'Focus on lead qualification to improve conversion rates',
            priority: 'high',
            actionable: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'trend',
            title: 'Customer Satisfaction Trending Up',
            description: 'Your customer satisfaction scores have improved by 15% this quarter',
            priority: 'medium',
            actionable: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
        
        return { data: mockInsights }
      },
    }),
  }),
})