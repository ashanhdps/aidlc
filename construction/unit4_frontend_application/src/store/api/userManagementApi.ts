import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

// User Management Types
export interface User {
  id: string
  email: string
  username: string
  role: string
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED'
  createdDate: string
  lastModifiedDate?: string
  createdBy: string
  lastModifiedBy?: string
  lastLoginTime?: string
}

export interface CreateUserRequest {
  email: string
  username: string
  password: string
  role: string
}

export interface UpdateUserRequest {
  email?: string
  role?: string
}

export interface UserFilters {
  page?: number
  size?: number
  role?: string
  activeOnly?: boolean
}

export interface UserPermissionCheck {
  resource: string
  action: string
}

const getAuthHeaders = (getState: () => unknown) => {
  const state = getState() as RootState
  const auth = state.session?.authentication
  const user = state.session?.user
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  // Check if user has admin role for user management operations
  const userRole = user?.role?.name || 'employee'
  if (userRole.toLowerCase() !== 'admin') {
    console.warn('User management operations require admin role, current role:', userRole)
  }
  
  if (auth?.isAuthenticated && auth.token) {
    headers['Authorization'] = `Bearer ${auth.token}`
  }
  
  return headers
}

export const userManagementApi = createApi({
  reducerPath: 'userManagementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8088/api/v1/data-analytics',
    prepareHeaders: (headers, { getState }) => {
      const authHeaders = getAuthHeaders(getState)
      Object.entries(authHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })
      return headers
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Get all users with pagination and filters
    getUsers: builder.query<User[], UserFilters>({
      query: (filters = {}) => ({
        url: '/admin/users',
        params: {
          page: filters.page || 0,
          size: filters.size || 20,
          role: filters.role,
          activeOnly: filters.activeOnly || false
        }
      }),
      providesTags: ['User'],
    }),

    // Get user by ID
    getUserById: builder.query<User, string>({
      query: (userId) => `/admin/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // Get user by email
    getUserByEmail: builder.query<User, string>({
      query: (email) => ({
        url: '/admin/users/by-email',
        params: { email }
      }),
      providesTags: (result, error, email) => [{ type: 'User', id: email }],
    }),

    // Create new user
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (userData) => ({
        url: '/admin/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Update user
    updateUser: builder.mutation<User, { userId: string; data: UpdateUserRequest }>({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }],
    }),

    // Activate user
    activateUser: builder.mutation<User, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/activate`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // Deactivate user
    deactivateUser: builder.mutation<User, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // Check user permissions
    checkUserPermissions: builder.query<boolean, { userId: string; resource: string; action: string }>({
      query: ({ userId, resource, action }) => ({
        url: `/admin/users/${userId}/permissions`,
        params: { resource, action }
      }),
    }),

    // Check admin access
    checkAdminAccess: builder.query<boolean, string>({
      query: (userId) => `/admin/users/${userId}/admin-access`,
    }),
  }),
})

// Export hooks for use in components
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetUserByEmailQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useCheckUserPermissionsQuery,
  useCheckAdminAccessQuery,
} = userManagementApi