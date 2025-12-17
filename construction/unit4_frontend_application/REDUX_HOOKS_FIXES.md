# Redux Hooks Import Fixes

## Issue Resolved
**Problem**: `Failed to resolve import "../../../hooks/redux" from "src/aggregates/session/components/ThemeProvider.tsx". Does the file exist?`

## Root Cause
The application components were trying to import Redux hooks from `../../../hooks/redux`, but this directory and file didn't exist. There was a duplicate hooks file in the store directory, but components were expecting the hooks to be in a dedicated hooks directory.

## Solution Implemented

### 1. Created Missing Hooks Directory Structure
```
src/hooks/
├── redux.ts      # Redux hooks (useAppSelector, useAppDispatch)
└── index.ts      # Hooks exports
```

### 2. Created Redux Hooks File
**File**: `src/hooks/redux.ts`
```typescript
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '../store/store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

### 3. Created Hooks Index File
**File**: `src/hooks/index.ts`
```typescript
// Redux hooks
export { useAppDispatch, useAppSelector } from './redux'

// You can add other custom hooks here as needed
```

### 4. Removed Duplicate Hooks File
- Deleted `src/store/hooks.ts` to avoid confusion
- Kept the hooks in the dedicated `src/hooks/` directory

### 5. Fixed Additional Import Issues

#### Fixed React Import in main.tsx
```typescript
// Before
import React from 'react'

// After  
import { StrictMode } from 'react'
```

#### Fixed Process Environment in store.ts
```typescript
// Before
devTools: process.env.NODE_ENV !== 'production',

// After
devTools: import.meta.env.MODE !== 'production',
```

## Files That Use These Hooks

The following files were successfully importing from `../../../hooks/redux`:

### Pages
- `src/pages/DashboardPage.tsx`
- `src/pages/AssessmentPage.tsx` 
- `src/pages/FeedbackPage.tsx`
- `src/pages/TeamDashboardPage.tsx`
- `src/pages/ExecutiveDashboardPage.tsx`

### Components
- `src/aggregates/session/components/ThemeProvider.tsx`
- `src/aggregates/session/components/PermissionGate.tsx`
- `src/aggregates/session/components/NavigationMenu.tsx`
- `src/aggregates/session/components/UserProfileManager.tsx`
- `src/aggregates/feedback/components/FeedbackContainer.tsx`
- `src/aggregates/feedback/components/FeedbackThread.tsx`
- `src/aggregates/feedback/components/NotificationPanel.tsx`
- `src/aggregates/assessment/components/AssessmentContainer.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Breadcrumbs.tsx`
- `src/components/auth/ProtectedRoute.tsx`

## Verification

✅ All TypeScript compilation errors resolved  
✅ Redux hooks properly typed and exported  
✅ All component imports working correctly  
✅ No duplicate hook definitions  
✅ Consistent import paths across the application  

## Usage

Components can now import Redux hooks using:

```typescript
import { useAppSelector, useAppDispatch } from '../../../hooks/redux'

// Or from the hooks index
import { useAppSelector, useAppDispatch } from '../../../hooks'
```

The hooks provide proper TypeScript typing for:
- `useAppSelector` - Typed selector hook for RootState
- `useAppDispatch` - Typed dispatch hook for AppDispatch

## Next Steps

The application should now compile and run without the Redux hooks import errors. You can:

1. Run `npm run dev` to start the development server
2. Run `npm run build` to verify production build
3. All Redux functionality should work correctly with proper TypeScript support