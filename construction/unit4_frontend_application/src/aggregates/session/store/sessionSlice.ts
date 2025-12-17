import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserProfile, AuthState, UserPreferences } from '../../../types/domain'
import { LoadingState } from '../../../types/common'

interface NavigationState {
  currentPath: string
  previousPath: string | null
  breadcrumbs: { label: string; path: string }[]
}

interface PermissionState {
  roles: string[]
  permissions: string[]
  canAccess: Record<string, boolean>
}

interface SessionState {
  user: UserProfile | null
  authentication: AuthState
  preferences: UserPreferences
  navigation: NavigationState
  permissions: PermissionState
  loading: LoadingState
}

const initialState: SessionState = {
  user: null,
  authentication: {
    isAuthenticated: false,
    token: null,
    refreshToken: null,
    expiresAt: null,
    user: null,
  },
  preferences: {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      inApp: true,
      frequency: 'immediate',
    },
    dashboard: {
      defaultView: 'personal',
      autoRefresh: true,
      refreshInterval: 300000,
    },
  },
  navigation: {
    currentPath: '/',
    previousPath: null,
    breadcrumbs: [],
  },
  permissions: {
    roles: [],
    permissions: [],
    canAccess: {},
  },
  loading: {
    isLoading: false,
    error: null,
  },
}

export const sessionSlice = createSlice({
  name: 'session',
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
    login: (state, action: PayloadAction<{ user: UserProfile; token: string; refreshToken: string; expiresAt: string }>) => {
      state.authentication = {
        isAuthenticated: true,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        user: action.payload.user,
      }
      state.user = action.payload.user
      state.permissions = {
        roles: [action.payload.user.role.name],
        permissions: action.payload.user.permissions,
        canAccess: action.payload.user.permissions.reduce((acc, perm) => {
          acc[perm] = true
          return acc
        }, {} as Record<string, boolean>),
      }
    },
    logout: (state) => {
      state.authentication = {
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        expiresAt: null,
        user: null,
      }
      state.user = null
      state.permissions = {
        roles: [],
        permissions: [],
        canAccess: {},
      }
    },
    refreshToken: (state, action: PayloadAction<{ token: string; expiresAt: string }>) => {
      state.authentication.token = action.payload.token
      state.authentication.expiresAt = action.payload.expiresAt
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },
    setCurrentPath: (state, action: PayloadAction<string>) => {
      state.navigation.previousPath = state.navigation.currentPath
      state.navigation.currentPath = action.payload
    },
    setBreadcrumbs: (state, action: PayloadAction<{ label: string; path: string }[]>) => {
      state.navigation.breadcrumbs = action.payload
    },
    updatePermissions: (state, action: PayloadAction<{ permissions: string[]; canAccess: Record<string, boolean> }>) => {
      state.permissions.permissions = action.payload.permissions
      state.permissions.canAccess = action.payload.canAccess
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        if (state.authentication.user) {
          state.authentication.user = { ...state.authentication.user, ...action.payload }
        }
      }
    },
    setSessionExpired: (state) => {
      state.authentication.isAuthenticated = false
      state.authentication.token = null
      state.loading.error = 'Session expired. Please log in again.'
    },
    clearError: (state) => {
      state.loading.error = null
    },
    initializeFromStorage: (state, action: PayloadAction<{ 
      token: string | null
      user: UserProfile | null
      preferences: UserPreferences
    }>) => {
      if (action.payload.token && action.payload.user) {
        state.authentication = {
          isAuthenticated: true,
          token: action.payload.token,
          refreshToken: null,
          expiresAt: null,
          user: action.payload.user,
        }
        state.user = action.payload.user
        state.permissions = {
          roles: [action.payload.user.role.name],
          permissions: action.payload.user.permissions,
          canAccess: action.payload.user.permissions.reduce((acc, perm) => {
            acc[perm] = true
            return acc
          }, {} as Record<string, boolean>),
        }
      }
      state.preferences = action.payload.preferences
    },
  },
})

export const {
  setLoading,
  setError,
  login,
  logout,
  refreshToken,
  updatePreferences,
  setCurrentPath,
  setBreadcrumbs,
  updatePermissions,
  updateProfile,
  setSessionExpired,
  clearError,
  initializeFromStorage,
} = sessionSlice.actions