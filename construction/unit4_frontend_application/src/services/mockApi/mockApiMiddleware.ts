import { Middleware } from '@reduxjs/toolkit'
import { mockDataService } from './mockDataService'

// Mock API middleware for intercepting API calls and returning mock data
export const mockApiMiddleware: Middleware = (store) => (next) => (action) => {
  // Check if this is an RTK Query action
  if (action.type?.endsWith('/pending')) {
    const endpoint = action.meta?.arg?.endpointName
    const originalArgs = action.meta?.arg?.originalArgs
    
    // Handle different endpoints
    switch (endpoint) {
      case 'getKPIs':
        handleMockKPIs(store, action, originalArgs)
        break
      case 'getDashboard':
        handleMockDashboard(store, action, originalArgs)
        break
      case 'getPerformanceData':
        handleMockPerformanceData(store, action, originalArgs)
        break
      case 'getAssessmentTemplates':
        handleMockAssessmentTemplates(store, action)
        break
      case 'getFeedbackThreads':
        handleMockFeedbackThreads(store, action, originalArgs)
        break
      case 'getInsights':
        handleMockInsights(store, action, originalArgs)
        break
      case 'getUserProfile':
        handleMockUserProfile(store, action, originalArgs)
        break
    }
  }
  
  return next(action)
}

// Mock handlers
async function handleMockKPIs(store: any, action: any, args: any) {
  try {
    const response = await mockDataService.getKPIs(args?.userId || 'current-user')
    store.dispatch({
      type: action.type.replace('/pending', '/fulfilled'),
      payload: response.data,
      meta: action.meta
    })
  } catch (error) {
    store.dispatch({
      type: action.type.replace('/pending', '/rejected'),
      error: { message: (error as Error).message },
      meta: action.meta
    })
  }
}

async function handleMockDashboard(store: any, action: any, args: any) {
  try {
    const response = await mockDataService.getDashboard(args?.userId || 'current-user')
    store.dispatch({
      type: action.type.replace('/pending', '/fulfilled'),
      payload: response.data,
      meta: action.meta
    })
  } catch (error) {
    store.dispatch({
      type: action.type.replace('/pending', '/rejected'),
      error: { message: (error as Error).message },
      meta: action.meta
    })
  }
}

async function handleMockPerformanceData(store: any, action: any, args: any) {
  try {
    const response = await mockDataService.getPerformanceData(
      args?.userId || 'current-user',
      args?.kpiId || '1'
    )
    store.dispatch({
      type: action.type.replace('/pending', '/fulfilled'),
      payload: response.data,
      meta: action.meta
    })
  } catch (error) {
    store.dispatch({
      type: action.type.replace('/pending', '/rejected'),
      error: { message: (error as Error).message },
      meta: action.meta
    })
  }
}

async function handleMockAssessmentTemplates(store: any, action: any) {
  try {
    const response = await mockDataService.getAssessmentTemplates()
    store.dispatch({
      type: action.type.replace('/pending', '/fulfilled'),
      payload: response.data,
      meta: action.meta
    })
  } catch (error) {
    store.dispatch({
      type: action.type.replace('/pending', '/rejected'),
      error: { message: (error as Error).message },
      meta: action.meta
    })
  }
}

async function handleMockFeedbackThreads(store: any, action: any, args: any) {
  try {
    const response = await mockDataService.getFeedbackThreads(args?.userId || 'current-user')
    store.dispatch({
      type: action.type.replace('/pending', '/fulfilled'),
      payload: response.data,
      meta: action.meta
    })
  } catch (error) {
    store.dispatch({
      type: action.type.replace('/pending', '/rejected'),
      error: { message: (error as Error).message },
      meta: action.meta
    })
  }
}

async function handleMockInsights(store: any, action: any, args: any) {
  try {
    const response = await mockDataService.getInsights(args?.userId || 'current-user')
    store.dispatch({
      type: action.type.replace('/pending', '/fulfilled'),
      payload: response.data,
      meta: action.meta
    })
  } catch (error) {
    store.dispatch({
      type: action.type.replace('/pending', '/rejected'),
      error: { message: (error as Error).message },
      meta: action.meta
    })
  }
}

async function handleMockUserProfile(store: any, action: any, args: any) {
  try {
    const response = await mockDataService.getUserProfile(args?.userId || 'current-user')
    store.dispatch({
      type: action.type.replace('/pending', '/fulfilled'),
      payload: response.data,
      meta: action.meta
    })
  } catch (error) {
    store.dispatch({
      type: action.type.replace('/pending', '/rejected'),
      error: { message: (error as Error).message },
      meta: action.meta
    })
  }
}