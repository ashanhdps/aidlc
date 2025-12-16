import { ApiError } from '../types/common'

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode?: number
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode?: number,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', undefined, true)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends AppError {
  public readonly field?: string

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, true)
    this.name = 'ValidationError'
    this.field = field
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401, true)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403, true)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND_ERROR', 404, true)
    this.name = 'NotFoundError'
  }
}

// Error handling utilities
export const errorHandlers = {
  // Convert API error to AppError
  fromApiError(apiError: ApiError): AppError {
    return new AppError(
      apiError.message,
      apiError.code,
      undefined,
      true
    )
  },

  // Convert fetch error to AppError
  fromFetchError(error: any): AppError {
    if (error.name === 'AbortError') {
      return new AppError('Request was cancelled', 'REQUEST_CANCELLED')
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new NetworkError('Network connection failed')
    }
    
    return new AppError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR'
    )
  },

  // Get user-friendly error message
  getUserMessage(error: Error): string {
    if (error instanceof AppError) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          return 'Please check your internet connection and try again.'
        case 'AUTH_ERROR':
          return 'Please log in to continue.'
        case 'AUTHORIZATION_ERROR':
          return 'You don\'t have permission to perform this action.'
        case 'NOT_FOUND_ERROR':
          return 'The requested resource was not found.'
        case 'VALIDATION_ERROR':
          return error.message
        default:
          return error.message
      }
    }
    
    return 'An unexpected error occurred. Please try again.'
  },

  // Check if error is retryable
  isRetryable(error: Error): boolean {
    if (error instanceof AppError) {
      return ['NETWORK_ERROR', 'TIMEOUT_ERROR'].includes(error.code)
    }
    return false
  },

  // Log error for debugging
  logError(error: Error, context?: string): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    }

    if (error instanceof AppError) {
      errorInfo.code = error.code
      errorInfo.statusCode = error.statusCode
      errorInfo.isOperational = error.isOperational
    }

    console.error('Application Error:', errorInfo)
  }
}

// Retry utility
export interface RetryOptions {
  maxAttempts: number
  delay: number
  backoff: 'linear' | 'exponential'
  retryCondition?: (error: Error) => boolean
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    retryCondition = errorHandlers.isRetryable
  } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts || !retryCondition(lastError)) {
        throw lastError
      }

      const waitTime = backoff === 'exponential' 
        ? delay * Math.pow(2, attempt - 1)
        : delay * attempt

      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw lastError!
}

// Global error boundary handler
export function setupGlobalErrorHandler(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandlers.logError(
      new Error(event.reason?.message || 'Unhandled promise rejection'),
      'unhandledrejection'
    )
    event.preventDefault()
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorHandlers.logError(
      event.error || new Error(event.message),
      'uncaught'
    )
  })
}