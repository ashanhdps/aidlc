import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'
import type { KPI, Assignment, KPIFilters, AssignmentFilters } from '../../types/domain'

const getToken = (state: RootState) => state.session.authentication.token

export const kpiManagementApi = createApi({
  reducerPath: 'kpiManagementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/kpi-management',
    prepareHeaders: (headers, { getState }) => {
      const token = getToken(getState() as RootState)
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['KPI', 'Assignment', 'Hierarchy', 'AISuggestion'],
  endpoints: (builder) => ({
    getKPIs: builder.query<KPI[], KPIFilters>({
      query: (filters) => ({ 
        url: '/kpis', 
        params: filters 
      }),
      providesTags: ['KPI'],
      // Mock implementation for development
      queryFn: async (filters) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const mockKPIs: KPI[] = [
          {
            id: '1',
            name: 'Sales Target',
            description: 'Monthly sales target achievement',
            current: 85,
            target: 100,
            unit: '%',
            status: 'yellow',
            trend: 'up',
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Customer Satisfaction',
            description: 'Customer satisfaction score',
            current: 92,
            target: 90,
            unit: '%',
            status: 'green',
            trend: 'up',
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Project Completion',
            description: 'On-time project completion rate',
            current: 78,
            target: 85,
            unit: '%',
            status: 'red',
            trend: 'down',
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
        
        return { data: mockKPIs }
      },
    }),
    
    getAssignments: builder.query<Assignment[], AssignmentFilters>({
      query: (filters) => ({ 
        url: '/assignments', 
        params: filters 
      }),
      providesTags: ['Assignment'],
      // Mock implementation
      queryFn: async (filters) => {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const mockAssignments: Assignment[] = [
          {
            id: '1',
            kpiId: '1',
            userId: 'user1',
            assignedBy: 'manager1',
            assignedAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            kpiId: '2',
            userId: 'user1',
            assignedBy: 'manager1',
            assignedAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
        
        return { data: mockAssignments }
      },
    }),
  }),
})