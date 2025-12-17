# Deployment Guide

This guide covers deployment options and configurations for the Unit 4 Frontend Application.

## Build Process

### Production Build
```bash
# Install dependencies
npm ci

# Run linting and tests
npm run lint
npm run test

# Create production build
npm run build
```

The build process creates optimized files in the `dist/` directory:
- Minified JavaScript bundles with code splitting
- Optimized CSS with vendor prefixes
- Compressed assets (images, fonts)
- Service worker for caching (if enabled)

### Build Configuration

#### Environment Variables
Create `.env.production` file:
```env
# API Configuration
VITE_API_BASE_URL=https://api.yourcompany.com
VITE_WEBSOCKET_URL=wss://ws.yourcompany.com

# Application Configuration
VITE_APP_NAME=Performance Management System
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_WEBSOCKETS=true
VITE_ENABLE_OFFLINE_MODE=true

# Security
VITE_ENABLE_CSP=true
VITE_ENABLE_HTTPS_ONLY=true
```

#### Vite Configuration
Update `vite.config.ts` for production:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
```

## Deployment Options

### 1. Static Hosting (Recommended)

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

**netlify.toml**:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### AWS S3 + CloudFront
```bash
# Build application
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 2. Container Deployment

#### Docker
**Dockerfile**:
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

**Build and run**:
```bash
# Build image
docker build -t unit4-frontend .

# Run container
docker run -p 80:80 unit4-frontend
```

#### Docker Compose
**docker-compose.yml**:
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  # Optional: Add reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
```

### 3. Kubernetes Deployment

**deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: unit4-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: unit4-frontend
  template:
    metadata:
      labels:
        app: unit4-frontend
    spec:
      containers:
      - name: frontend
        image: unit4-frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: unit4-frontend-service
spec:
  selector:
    app: unit4-frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## Performance Optimization

### 1. Bundle Analysis
```bash
# Analyze bundle size
npm run build -- --analyze

# Or use webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets/*.js
```

### 2. Caching Strategy
```nginx
# Nginx caching configuration
location ~* \.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
}

location ~* \.(png|jpg|jpeg|gif|ico|svg)$ {
    expires 6M;
    add_header Cache-Control "public";
}

location /index.html {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### 3. CDN Configuration
```javascript
// Configure CDN for static assets
const CDN_URL = 'https://cdn.yourcompany.com'

// Update vite.config.ts
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? CDN_URL : '/',
  // ... other config
})
```

## Security Configuration

### 1. Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.yourcompany.com wss://ws.yourcompany.com;
">
```

### 2. Environment-specific Security
```typescript
// Security configuration
const securityConfig = {
  production: {
    enableCSP: true,
    enableHTTPS: true,
    enableHSTS: true,
    cookieSecure: true
  },
  development: {
    enableCSP: false,
    enableHTTPS: false,
    enableHSTS: false,
    cookieSecure: false
  }
}
```

## Monitoring & Logging

### 1. Application Monitoring
```typescript
// Add to main.tsx
import { initializeMonitoring } from './utils/monitoring'

if (import.meta.env.PROD) {
  initializeMonitoring({
    apiKey: import.meta.env.VITE_MONITORING_API_KEY,
    environment: import.meta.env.VITE_ENVIRONMENT
  })
}
```

### 2. Error Tracking
```typescript
// Error boundary with reporting
class ProductionErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.PROD) {
      // Send to error tracking service
      errorTracker.captureException(error, {
        extra: errorInfo,
        tags: {
          component: 'ErrorBoundary'
        }
      })
    }
  }
}
```

### 3. Performance Monitoring
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Send to analytics service
  analytics.track('web-vital', {
    name: metric.name,
    value: metric.value,
    id: metric.id
  })
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

## Health Checks

### 1. Application Health Endpoint
```typescript
// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    uptime: process.uptime()
  })
})
```

### 2. Kubernetes Health Checks
```yaml
# Add to deployment.yaml
livenessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Rollback Strategy

### 1. Blue-Green Deployment
```bash
# Deploy to staging environment
kubectl apply -f deployment-staging.yaml

# Test staging environment
npm run test:e2e -- --env=staging

# Switch traffic to new version
kubectl patch service unit4-frontend-service -p '{"spec":{"selector":{"version":"v2"}}}'

# Rollback if needed
kubectl patch service unit4-frontend-service -p '{"spec":{"selector":{"version":"v1"}}}'
```

### 2. Canary Deployment
```yaml
# Canary deployment configuration
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: unit4-frontend
spec:
  replicas: 5
  strategy:
    canary:
      steps:
      - setWeight: 20
      - pause: {duration: 10m}
      - setWeight: 40
      - pause: {duration: 10m}
      - setWeight: 60
      - pause: {duration: 10m}
      - setWeight: 80
      - pause: {duration: 10m}
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

3. **Route Issues**
   - Ensure server is configured for SPA routing
   - Check nginx/Apache configuration for fallback to index.html

4. **Environment Variables**
   - Verify all required environment variables are set
   - Check variable naming (must start with VITE_)

### Debugging Production Issues
```typescript
// Add debug logging
if (import.meta.env.VITE_DEBUG === 'true') {
  console.log('Debug mode enabled')
  // Enable additional logging
}
```

## Maintenance

### 1. Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Audit for vulnerabilities
npm audit
npm audit fix
```

### 2. Performance Monitoring
- Monitor Core Web Vitals
- Track bundle size changes
- Monitor error rates
- Check user engagement metrics

### 3. Security Updates
- Regular dependency updates
- Security header validation
- SSL certificate renewal
- Access log monitoring

---

For additional support, contact the DevOps team or create an issue in the repository.