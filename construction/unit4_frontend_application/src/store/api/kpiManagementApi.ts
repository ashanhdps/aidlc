import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

// Backend API Types (matching the actual backend)
export interface KPIDefinition {
  id: string
  name: string
  description?: string
  category: 'SALES' | 'PRODUCTIVITY' | 'QUALITY' | 'CUSTOMER_SERVICE' | 'MARKETING' | 'OPERATIONS' | 'FINANCE' | 'HUMAN_RESOURCES' | 'INNOVATION' | 'COMPLIANCE'
  measurementType: 'CURRENCY' | 'PERCENTAGE' | 'COUNT' | 'RATIO' | 'TIME' | 'RATING'
  defaultTargetValue?: number
  defaultTargetUnit?: string
  defaultTargetComparisonType?: 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'EQUAL' | 'NOT_EQUAL'
  defaultWeightPercentage?: number
  defaultWeightIsFlexible?: boolean
  measurementFrequencyType?: string
  measurementFrequencyValue?: number
  dataSource?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  active: boolean
}

export interface CreateKPIRequest {
  name: string
  description?: string
  category: 'SALES' | 'PRODUCTIVITY' | 'QUALITY' | 'CUSTOMER_SERVICE' | 'MARKETING' | 'OPERATIONS' | 'FINANCE' | 'HUMAN_RESOURCES' | 'INNOVATION' | 'COMPLIANCE'
  measurementType: 'CURRENCY' | 'PERCENTAGE' | 'COUNT' | 'RATIO' | 'TIME' | 'RATING'
  defaultTargetValue?: number
  defaultTargetUnit?: string
  defaultTargetComparisonType?: 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'EQUAL' | 'NOT_EQUAL'
  defaultWeightPercentage?: number
  defaultWeightIsFlexible?: boolean
  measurementFrequencyType?: string
  measurementFrequencyValue?: number
  dataSource?: string
}

export interface KPIFilters {
  category?: 'SALES' | 'PRODUCTIVITY' | 'QUALITY' | 'CUSTOMER_SERVICE' | 'MARKETING' | 'OPERATIONS' | 'FINANCE' | 'HUMAN_RESOURCES' | 'INNOVATION' | 'COMPLIANCE'
  activeOnly?: boolean
}

export interface KPIAssignment {
  id: string
  employeeId: string
  kpiDefinitionId: string
  assignmentId?: string
  supervisorId?: string
  customTargetValue?: number
  customTargetUnit?: string
  customTargetComparisonType?: 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'EQUAL' | 'NOT_EQUAL'
  customWeightPercentage?: number
  customWeightIsFlexible?: boolean
  effectiveDate?: string
  endDate?: string
  assignedBy: string
  status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING_APPROVAL'
  createdAt: string
  updatedAt: string
}

export interface CreateKPIAssignmentRequest {
  kpiDefinitionId: string
  employeeId: string
  supervisorId?: string
  customTargetValue?: number
  customTargetUnit?: string
  customTargetComparisonType?: 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'EQUAL' | 'NOT_EQUAL'
  customWeightPercentage?: number
  customWeightIsFlexible?: boolean
  effectiveDate?: string
  endDate?: string
}

export interface KPIData {
  id: string
  assignmentId: string
  value: number
  unit: string
  recordedAt: string
  recordedBy: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateKPIDataRequest {
  assignmentId: string
  value: number
  unit: string
  notes?: string
}

export interface ApprovalWorkflow {
  id: string
  changeRequestType: 'KPI_DEFINITION_CREATE' | 'KPI_DEFINITION_UPDATE' | 'KPI_DEFINITION_DELETE' | 'KPI_ASSIGNMENT_CREATE' | 'KPI_ASSIGNMENT_UPDATE' | 'KPI_ASSIGNMENT_DELETE'
  requestedBy: string
  requestedAt: string
  requestData: Record<string, any>
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewedBy?: string
  reviewedAt?: string
  reviewComments?: string
  createdAt: string
  updatedAt: string
}

export interface AISuggestion {
  id: string
  type: 'KPI_OPTIMIZATION' | 'TARGET_ADJUSTMENT' | 'PERFORMANCE_INSIGHT'
  title: string
  description: string
  confidence: number
  suggestedAction?: string
  relatedKpiId?: string
  relatedEmployeeId?: string
  createdAt: string
}

const getAuthHeaders = (getState: () => unknown) => {
  const state = getState() as RootState
  const auth = state.session?.authentication
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  if (auth?.isAuthenticated && auth.token) {
    // Use the stored Basic Auth token (base64 encoded credentials)
    headers['Authorization'] = `Basic ${auth.token}`
  } else {
    // Fallback to admin credentials for development
    headers['Authorization'] = 'Basic YWRtaW46YWRtaW4xMjM='
  }
  
  return headers
}

export const kpiManagementApi = createApi({
  reducerPath: 'kpiManagementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const authHeaders = getAuthHeaders(getState)
      Object.entries(authHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })
      return headers
    },
  }),
  tagTypes: ['KPIDefinition', 'KPIAssignment', 'KPIData', 'ApprovalWorkflow', 'AISuggestion'],
  endpoints: (builder) => ({
    // KPI Definitions
    getKPIDefinitions: builder.query<KPIDefinition[], KPIFilters>({
      query: (filters = {}) => ({
        url: '/kpi-management/kpis',
        params: filters
      }),
      providesTags: ['KPIDefinition'],
    }),

    getKPIDefinitionById: builder.query<KPIDefinition, string>({
      query: (id) => `/kpi-management/kpis/${id}`,
      providesTags: (result, error, id) => [{ type: 'KPIDefinition', id }],
    }),

    createKPIDefinition: builder.mutation<KPIDefinition, CreateKPIRequest>({
      query: (kpiData) => ({
        url: '/kpi-management/kpis',
        method: 'POST',
        body: kpiData,
      }),
      invalidatesTags: ['KPIDefinition'],
    }),

    updateKPIDefinition: builder.mutation<KPIDefinition, { id: string; data: Partial<CreateKPIRequest> }>({
      query: ({ id, data }) => ({
        url: `/kpi-management/kpis/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'KPIDefinition', id }],
    }),

    deleteKPIDefinition: builder.mutation<void, string>({
      query: (id) => ({
        url: `/kpi-management/kpis/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'KPIDefinition', id }],
    }),

    // KPI Assignments
    getKPIAssignments: builder.query<KPIAssignment[], { employeeId?: string; supervisorId?: string; kpiId?: string; effectiveDate?: string }>({
      query: (filters = {}) => ({
        url: '/kpi-management/assignments',
        params: {
          employee_id: filters.employeeId,
          supervisor_id: filters.supervisorId,
          kpi_id: filters.kpiId,
          effective_date: filters.effectiveDate
        }
      }),
      providesTags: ['KPIAssignment'],
    }),

    getEmployeeAssignments: builder.query<KPIAssignment[], { employeeId: string; activeOnly?: boolean }>({
      query: ({ employeeId, activeOnly = true }) => ({
        url: `/kpi-management/assignments/employee/${employeeId}`,
        params: { activeOnly }
      }),
      providesTags: (result, error, { employeeId }) => [{ type: 'KPIAssignment', id: employeeId }],
    }),

    getKPIDefinitionAssignments: builder.query<KPIAssignment[], string>({
      query: (kpiDefinitionId) => `/kpi-management/assignments/kpi/${kpiDefinitionId}`,
      providesTags: (result, error, kpiDefinitionId) => [{ type: 'KPIAssignment', id: kpiDefinitionId }],
    }),

    getBulkAssignments: builder.query<Record<string, KPIAssignment[]>, string[]>({
      query: (employeeIds) => ({
        url: '/kpi-management/assignments/bulk',
        params: { employee_ids: employeeIds.join(',') }
      }),
      providesTags: ['KPIAssignment'],
    }),

    getKPIAssignmentById: builder.query<KPIAssignment, { employeeId: string; kpiDefinitionId: string }>({
      query: ({ employeeId, kpiDefinitionId }) => `/kpi-management/assignments/employee/${employeeId}/kpi/${kpiDefinitionId}`,
      providesTags: (result, error, { employeeId, kpiDefinitionId }) => [{ type: 'KPIAssignment', id: `${employeeId}#${kpiDefinitionId}` }],
    }),

    createKPIAssignment: builder.mutation<KPIAssignment, CreateKPIAssignmentRequest>({
      query: (assignmentData) => ({
        url: '/kpi-management/assignments',
        method: 'POST',
        body: assignmentData,
      }),
      invalidatesTags: ['KPIAssignment'],
    }),

    updateKPIAssignment: builder.mutation<KPIAssignment, { employeeId: string; kpiDefinitionId: string; data: Partial<CreateKPIAssignmentRequest> }>({
      query: ({ employeeId, kpiDefinitionId, data }) => ({
        url: `/kpi-management/assignments/employee/${employeeId}/kpi/${kpiDefinitionId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { employeeId, kpiDefinitionId }) => [{ type: 'KPIAssignment', id: `${employeeId}#${kpiDefinitionId}` }],
    }),

    deleteKPIAssignment: builder.mutation<void, { employeeId: string; kpiDefinitionId: string }>({
      query: ({ employeeId, kpiDefinitionId }) => ({
        url: `/kpi-management/assignments/employee/${employeeId}/kpi/${kpiDefinitionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { employeeId, kpiDefinitionId }) => [{ type: 'KPIAssignment', id: `${employeeId}#${kpiDefinitionId}` }],
    }),

    // KPI Data
    getKPIData: builder.query<KPIData[], { assignmentId?: string; employeeId?: string }>({
      query: (filters = {}) => ({
        url: '/kpi-management/data',
        params: filters
      }),
      providesTags: ['KPIData'],
    }),

    createKPIData: builder.mutation<KPIData, CreateKPIDataRequest>({
      query: (kpiData) => ({
        url: '/kpi-management/data',
        method: 'POST',
        body: kpiData,
      }),
      invalidatesTags: ['KPIData'],
    }),

    // Approval Workflows
    getApprovalWorkflows: builder.query<ApprovalWorkflow[], { status?: string; requestedBy?: string }>({
      query: (filters = {}) => ({
        url: '/kpi-management/approval-workflows',
        params: filters
      }),
      providesTags: ['ApprovalWorkflow'],
    }),

    approveWorkflow: builder.mutation<ApprovalWorkflow, { id: string; comments?: string }>({
      query: ({ id, comments }) => ({
        url: `/kpi-management/approval-workflows/${id}/approve`,
        method: 'POST',
        body: { comments },
      }),
      invalidatesTags: ['ApprovalWorkflow'],
    }),

    rejectWorkflow: builder.mutation<ApprovalWorkflow, { id: string; comments: string }>({
      query: ({ id, comments }) => ({
        url: `/kpi-management/approval-workflows/${id}/reject`,
        method: 'POST',
        body: { comments },
      }),
      invalidatesTags: ['ApprovalWorkflow'],
    }),

    // AI Suggestions
    getAISuggestions: builder.query<AISuggestion[], { employeeId?: string; kpiId?: string }>({
      query: (filters = {}) => ({
        url: '/kpi-management/ai-suggestions',
        params: filters
      }),
      providesTags: ['AISuggestion'],
    }),

    generateAISuggestions: builder.mutation<AISuggestion[], { employeeId?: string; kpiId?: string }>({
      query: (params) => ({
        url: '/kpi-management/ai-suggestions/generate',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['AISuggestion'],
    }),
  }),
})

// Export hooks for use in components
export const {
  useGetKPIDefinitionsQuery,
  useGetKPIDefinitionByIdQuery,
  useCreateKPIDefinitionMutation,
  useUpdateKPIDefinitionMutation,
  useDeleteKPIDefinitionMutation,
  useGetKPIAssignmentsQuery,
  useGetEmployeeAssignmentsQuery,
  useGetKPIDefinitionAssignmentsQuery,
  useGetBulkAssignmentsQuery,
  useGetKPIAssignmentByIdQuery,
  useCreateKPIAssignmentMutation,
  useUpdateKPIAssignmentMutation,
  useDeleteKPIAssignmentMutation,
  useGetKPIDataQuery,
  useCreateKPIDataMutation,
  useGetApprovalWorkflowsQuery,
  useApproveWorkflowMutation,
  useRejectWorkflowMutation,
  useGetAISuggestionsQuery,
  useGenerateAISuggestionsMutation,
} = kpiManagementApi