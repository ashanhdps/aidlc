/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="@testing-library/jest-dom" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WEBSOCKET_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_WEBSOCKETS: string
  readonly VITE_ENABLE_OFFLINE_MODE: string
  readonly VITE_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Extend global types for better TypeScript support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

// Ensure React JSX runtime is available
declare module 'react/jsx-runtime' {
  export * from 'react/jsx-runtime'
}

declare module 'react/jsx-dev-runtime' {
  export * from 'react/jsx-dev-runtime'
}

// Fix for recharts d3-shape types
declare module 'recharts' {
  export * from 'recharts/types/index'
}

export {}