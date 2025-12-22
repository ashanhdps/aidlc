import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Authentication Types
export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  tokenType: string
  username: string
  role: string
  userId: string
  expiresIn: number
  valid?: boolean
  error?: string
}

export interface TokenValidationResponse {
  valid: boolean
  username?: string
  role?: string
  userId?: string
  error?: string
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8088/api/v1/data-analytics/auth',
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Login to get JWT token
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Validate existing token
    validateToken: builder.query<AuthResponse, string>({
      query: (token) => ({
        url: '/validate',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }),
    }),

    // Refresh token
    refreshToken: builder.mutation<AuthResponse, string>({
      query: (token) => ({
        url: '/refresh',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useValidateTokenQuery,
  useRefreshTokenMutation,
} = authApi