import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { FeedbackThread, FeedbackMessage, NotificationState } from '../../../types/domain'
import { LoadingState } from '../../../types/common'

interface SearchState {
  query: string
  filters: {
    status?: string[]
    dateRange?: { start: string; end: string }
    participants?: string[]
  }
  results: FeedbackThread[]
}

interface FeedbackPreferences {
  autoMarkAsRead: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  groupByThread: boolean
}

interface FeedbackState {
  threads: FeedbackThread[]
  notifications: NotificationState
  search: SearchState
  preferences: FeedbackPreferences
  currentThread: FeedbackThread | null
  loading: LoadingState
}

const initialState: FeedbackState = {
  threads: [],
  notifications: {
    unreadCount: 0,
    notifications: [],
  },
  search: {
    query: '',
    filters: {},
    results: [],
  },
  preferences: {
    autoMarkAsRead: true,
    emailNotifications: true,
    pushNotifications: true,
    groupByThread: true,
  },
  currentThread: null,
  loading: {
    isLoading: false,
    error: null,
  },
}

export const feedbackSlice = createSlice({
  name: 'feedback',
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
    setThreads: (state, action: PayloadAction<FeedbackThread[]>) => {
      state.threads = action.payload
    },
    addThread: (state, action: PayloadAction<FeedbackThread>) => {
      state.threads.unshift(action.payload)
    },
    updateThread: (state, action: PayloadAction<FeedbackThread>) => {
      const index = state.threads.findIndex(t => t.id === action.payload.id)
      if (index >= 0) {
        state.threads[index] = action.payload
      }
    },
    setCurrentThread: (state, action: PayloadAction<FeedbackThread>) => {
      state.currentThread = action.payload
    },
    addMessage: (state, action: PayloadAction<{ threadId: string; message: FeedbackMessage }>) => {
      const thread = state.threads.find(t => t.id === action.payload.threadId)
      if (thread) {
        thread.messages.push(action.payload.message)
      }
      
      if (state.currentThread && state.currentThread.id === action.payload.threadId) {
        state.currentThread.messages.push(action.payload.message)
      }
    },
    markMessageAsRead: (state, action: PayloadAction<{ threadId: string; messageId: string; userId: string }>) => {
      const thread = state.threads.find(t => t.id === action.payload.threadId)
      if (thread) {
        const message = thread.messages.find(m => m.id === action.payload.messageId)
        if (message && !message.readBy.includes(action.payload.userId)) {
          message.readBy.push(action.payload.userId)
        }
      }
    },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.notifications.unshift(action.payload)
      state.notifications.unreadCount += 1
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1)
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.search.query = action.payload
    },
    setSearchFilters: (state, action: PayloadAction<SearchState['filters']>) => {
      state.search.filters = action.payload
    },
    setSearchResults: (state, action: PayloadAction<FeedbackThread[]>) => {
      state.search.results = action.payload
    },
    updatePreferences: (state, action: PayloadAction<Partial<FeedbackPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },
    resolveThread: (state, action: PayloadAction<string>) => {
      const thread = state.threads.find(t => t.id === action.payload)
      if (thread) {
        thread.status = 'resolved'
      }
      
      if (state.currentThread && state.currentThread.id === action.payload) {
        state.currentThread.status = 'resolved'
      }
    },
    archiveThread: (state, action: PayloadAction<string>) => {
      const thread = state.threads.find(t => t.id === action.payload)
      if (thread) {
        thread.status = 'archived'
      }
      
      if (state.currentThread && state.currentThread.id === action.payload) {
        state.currentThread.status = 'archived'
      }
    },
    clearNotifications: (state) => {
      state.notifications.notifications = []
      state.notifications.unreadCount = 0
    },
  },
})

export const {
  setLoading,
  setError,
  setThreads,
  addThread,
  updateThread,
  setCurrentThread,
  addMessage,
  markMessageAsRead,
  addNotification,
  markNotificationAsRead,
  setSearchQuery,
  setSearchFilters,
  setSearchResults,
  updatePreferences,
  resolveThread,
  archiveThread,
  clearNotifications,
} = feedbackSlice.actions