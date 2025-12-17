import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'
import type { Template, Assessment, TemplateFilters, AssessmentFilters } from '../../types/domain'

const getToken = (state: RootState) => state.session.authentication.token

export const performanceManagementApi = createApi({
  reducerPath: 'performanceManagementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/performance-management',
    prepareHeaders: (headers, { getState }) => {
      const token = getToken(getState() as RootState)
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Template', 'Cycle', 'Assessment', 'Feedback', 'Recognition'],
  endpoints: (builder) => ({
    getTemplates: builder.query<Template[], TemplateFilters>({
      query: (filters) => ({ 
        url: '/templates', 
        params: filters 
      }),
      providesTags: ['Template'],
      // Mock implementation
      queryFn: async (filters) => {
        await new Promise(resolve => setTimeout(resolve, 400))
        
        const mockTemplates: Template[] = [
          {
            id: '1',
            name: 'Annual Performance Review',
            description: 'Comprehensive annual performance evaluation',
            sections: [
              {
                id: 'goals',
                title: 'Goal Achievement',
                fields: [
                  {
                    id: 'goal1',
                    type: 'rating',
                    label: 'Primary Goal Achievement',
                    required: true,
                    options: ['1', '2', '3', '4', '5'],
                    order: 1,
                  },
                  {
                    id: 'goal1-comments',
                    type: 'textarea',
                    label: 'Comments on Goal Achievement',
                    required: false,
                    order: 2,
                  },
                ],
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
        
        return { data: mockTemplates }
      },
    }),
    
    getAssessments: builder.query<Assessment[], AssessmentFilters>({
      query: (filters) => ({ 
        url: '/assessments', 
        params: filters 
      }),
      providesTags: ['Assessment'],
      // Mock implementation
      queryFn: async (filters) => {
        await new Promise(resolve => setTimeout(resolve, 350))
        
        const mockAssessments: Assessment[] = [
          {
            id: '1',
            templateId: '1',
            userId: 'user1',
            reviewerId: 'manager1',
            status: 'draft',
            responses: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
        
        return { data: mockAssessments }
      },
    }),
  }),
})