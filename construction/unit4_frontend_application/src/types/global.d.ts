// Global type definitions for the application

declare global {
  interface Window {
    // Add any global window properties here
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any
  }

  // Environment variables
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      VITE_API_BASE_URL: string
      VITE_WEBSOCKET_URL: string
      VITE_APP_NAME: string
      VITE_APP_VERSION: string
      VITE_ENVIRONMENT: string
      VITE_ENABLE_ANALYTICS: string
      VITE_ENABLE_WEBSOCKETS: string
      VITE_ENABLE_OFFLINE_MODE: string
      VITE_DEBUG: string
    }
  }
}

// Module declarations for assets
declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

declare module '*.css' {
  const content: Record<string, string>
  export default content
}

declare module '*.scss' {
  const content: Record<string, string>
  export default content
}

declare module '*.sass' {
  const content: Record<string, string>
  export default content
}

declare module '*.less' {
  const content: Record<string, string>
  export default content
}

export {}