# Troubleshooting Guide

## JSX Runtime Error Fix

If you encounter the error: `Cannot find module 'react/jsx-runtime'`, follow these steps:

### 1. Install Dependencies
```bash
# Remove existing node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install dependencies
npm install

# Or use the provided script
chmod +x install-deps.sh
./install-deps.sh
```

### 2. Verify TypeScript Configuration
Ensure your `tsconfig.json` has the correct JSX configuration:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

### 3. Verify Vite Configuration
Ensure your `vite.config.ts` has the correct React plugin configuration:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    })
  ]
})
```

### 4. Check Dependencies
Ensure you have the correct versions of React and TypeScript:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "typescript": "^5.2.2"
  }
}
```

### 5. Clear TypeScript Cache
```bash
# Clear TypeScript cache
npx tsc --build --clean

# Restart your IDE/editor
# VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### 6. Restart Development Server
```bash
npm run dev
```

## Common Issues

### Module Resolution Issues
If you're still having module resolution issues:

1. Check that all dependencies are installed:
   ```bash
   npm ls react react-dom @types/react @types/react-dom
   ```

2. Verify your IDE is using the correct TypeScript version:
   - VS Code: Check bottom status bar for TypeScript version
   - Should match the version in package.json

3. Try deleting `.vite` cache:
   ```bash
   rm -rf .vite
   npm run dev
   ```

### Build Issues
If you encounter build issues:

1. Clear all caches:
   ```bash
   rm -rf node_modules package-lock.json .vite dist
   npm install
   npm run build
   ```

2. Check for conflicting dependencies:
   ```bash
   npm ls
   ```

### Testing Issues
If Jest tests are failing:

1. Ensure Jest configuration is correct in `jest.config.js`
2. Check that all test dependencies are installed
3. Run tests with verbose output:
   ```bash
   npm test -- --verbose
   ```

## Getting Help

If you're still experiencing issues:

1. Check the console for specific error messages
2. Verify all configuration files match the examples above
3. Try creating a minimal reproduction case
4. Check the project's GitHub issues for similar problems

## Environment Setup

Make sure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A modern IDE with TypeScript support (VS Code recommended)

## Quick Fix Script

Run this script to reset everything:

```bash
#!/bin/bash
echo "Resetting project..."
rm -rf node_modules package-lock.json .vite dist
npm install
echo "Project reset complete. Try running 'npm run dev' now."
```