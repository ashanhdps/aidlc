# Unit 4: Frontend Application - Logical Design

## Logical Design Overview

This document defines the comprehensive logical design for Unit 4: Frontend Application of the Employee Performance System, implementing a containerized React application architecture using AWS ECS Fargate. The design translates the domain model into a scalable, event-driven frontend solution deployed in the ap-southeast-1 region with Prometheus monitoring.

## Technology Stack

### Core Technologies
- **Frontend Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **UI Component Library**: Material-UI (MUI) v5
- **Data Visualization**: Recharts with D3.js integration
- **Real-time Communication**: Socket.io client
- **Build Tool**: Vite for fast development and optimized builds
- **Testing**: Jest + React Testing Library + Cypress

### Infrastructure & Deployment
- **Container Platform**: AWS ECS Fargate
- **AWS Region**: ap-southeast-1 (Singapore)
- **Load Balancer**: Application Load Balancer (ALB)
- **CDN**: Amazon CloudFront
- **Static Assets**: Amazon S3
- **Monitoring**: Prometheus + Grafana
- **Logging**: AWS CloudWatch Logs

### Development & CI/CD
- **Package Manager**: npm
- **Code Quality**: ESLint + Prettier + Husky
- **CI/CD**: AWS CodePipeline + CodeBuild
- **Environment Management**: AWS Parameter Store
- **Security**: AWS Secrets Manager for sensitive data

## Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    CloudFront CDN                           │
│                 (Global Distribution)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Application Load Balancer                    │
│                  (ap-southeast-1)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 ECS Fargate Cluster                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   React     │ │   React     │ │   React     │          │
│  │ Container 1 │ │ Container 2 │ │ Container N │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Backend Services Integration                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │     KPI     │ │Performance  │ │Data & Analytics│        │
│  │ Management  │ │ Management  │ │   Service    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```
## Application Architecture

### Domain-Driven Frontend Architecture

Based on the domain model, the application follows a layered architecture that maps domain concepts to React components and services:

```
┌─────────────────────────────────────────────────────────────┐
│                 Presentation Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Dashboard  │ │ Assessment  │ │  Feedback   │          │
│  │ Components  │ │ Components  │ │ Components  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Application Layer                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Redux     │ │    RTK      │ │  WebSocket  │          │
│  │   Store     │ │   Query     │ │   Manager   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Domain Layer                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Domain    │ │   Domain    │ │   Domain    │          │
│  │  Services   │ │   Events    │ │  Policies   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Infrastructure Layer                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ API Clients │ │   Cache     │ │   Local     │          │
│  │             │ │  Manager    │ │  Storage    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### 1. Dashboard Aggregate Components
```typescript
// Dashboard Container (Smart Component)
DashboardContainer
├── DashboardLayout
├── DashboardFilters
├── WidgetGrid
│   ├── KPIWidget
│   ├── ChartWidget
│   ├── InsightWidget
│   └── CustomWidget
└── DashboardCustomizer
```

#### 2. Data Visualization Aggregate Components
```typescript
// Visualization Container
VisualizationContainer
├── ChartRenderer
│   ├── LineChart
│   ├── BarChart
│   ├── PieChart
│   └── HeatMap
├── InteractionLayer
├── ExportControls
└── ChartConfiguration
```

#### 3. Assessment Interface Aggregate Components
```typescript
// Assessment Container
AssessmentContainer
├── FormRenderer
│   ├── FormSection
│   ├── FormField
│   ├── ValidationDisplay
│   └── ProgressIndicator
├── DraftManager
├── DocumentUploader
└── SubmissionHandler
```

#### 4. Feedback Interface Aggregate Components
```typescript
// Feedback Container
FeedbackContainer
├── FeedbackList
├── FeedbackThread
│   ├── FeedbackMessage
│   ├── ResponseForm
│   └── ThreadActions
├── NotificationPanel
└── FeedbackSearch
```

#### 5. User Session Aggregate Components
```typescript
// Session Container
SessionContainer
├── AuthenticationManager
├── UserPreferences
├── NavigationManager
├── ThemeProvider
└── PermissionGate
```
## State Management Architecture

### Redux Store Structure

The Redux store is organized around domain aggregates with clear separation of concerns:

```typescript
// Root State Structure
interface RootState {
  // Dashboard Aggregate State
  dashboard: {
    configurations: DashboardConfiguration[];
    widgets: WidgetState[];
    filters: FilterContext;
    layout: LayoutState;
    loading: LoadingState;
  };
  
  // Visualization Aggregate State
  visualization: {
    charts: ChartState[];
    interactions: InteractionState;
    exports: ExportState[];
    configurations: ChartConfiguration[];
  };
  
  // Assessment Aggregate State
  assessment: {
    forms: FormState[];
    drafts: DraftState[];
    validations: ValidationState[];
    submissions: SubmissionState[];
  };
  
  // Feedback Aggregate State
  feedback: {
    threads: FeedbackThread[];
    notifications: NotificationState[];
    search: SearchState;
    preferences: FeedbackPreferences;
  };
  
  // Session Aggregate State
  session: {
    user: UserProfile;
    authentication: AuthState;
    preferences: UserPreferences;
    navigation: NavigationState;
    permissions: PermissionState;
  };
  
  // API State (RTK Query)
  api: {
    kpiManagement: KPIApiState;
    performanceManagement: PerformanceApiState;
    dataAnalytics: AnalyticsApiState;
  };
}
```

### RTK Query API Integration

Each backend service has dedicated API slice with caching and real-time updates:

```typescript
// KPI Management API Slice
const kpiManagementApi = createApi({
  reducerPath: 'kpiManagementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/kpi-management',
    prepareHeaders: (headers, { getState }) => {
      headers.set('authorization', `Bearer ${getToken(getState())}`);
      return headers;
    },
  }),
  tagTypes: ['KPI', 'Assignment', 'Hierarchy', 'AISuggestion'],
  endpoints: (builder) => ({
    getKPIs: builder.query<KPI[], KPIFilters>({
      query: (filters) => ({ url: '/kpis', params: filters }),
      providesTags: ['KPI'],
    }),
    getAssignments: builder.query<Assignment[], AssignmentFilters>({
      query: (filters) => ({ url: '/assignments', params: filters }),
      providesTags: ['Assignment'],
    }),
    // Additional endpoints...
  }),
});

// Performance Management API Slice
const performanceManagementApi = createApi({
  reducerPath: 'performanceManagementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/performance-management',
    prepareHeaders: (headers, { getState }) => {
      headers.set('authorization', `Bearer ${getToken(getState())}`);
      return headers;
    },
  }),
  tagTypes: ['Template', 'Cycle', 'Assessment', 'Feedback', 'Recognition'],
  endpoints: (builder) => ({
    getTemplates: builder.query<Template[], TemplateFilters>({
      query: (filters) => ({ url: '/templates', params: filters }),
      providesTags: ['Template'],
    }),
    // Additional endpoints...
  }),
});

// Data & Analytics API Slice
const dataAnalyticsApi = createApi({
  reducerPath: 'dataAnalyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/data-analytics',
    prepareHeaders: (headers, { getState }) => {
      headers.set('authorization', `Bearer ${getToken(getState())}`);
      return headers;
    },
  }),
  tagTypes: ['Performance', 'Insights', 'Reports', 'Integration'],
  endpoints: (builder) => ({
    getPerformanceData: builder.query<PerformanceData[], PerformanceFilters>({
      query: (filters) => ({ url: '/performance/employee', params: filters }),
      providesTags: ['Performance'],
    }),
    // Additional endpoints...
  }),
});
```
## Real-time Communication Architecture

### WebSocket Integration

Real-time updates are managed through Socket.io with automatic reconnection and event routing:

```typescript
// WebSocket Manager Service
class WebSocketManager {
  private socket: Socket;
  private eventHandlers: Map<string, EventHandler[]>;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  connect(token: string): void {
    this.socket = io('/api/realtime', {
      auth: { token },
      transports: ['websocket'],
      upgrade: true,
    });

    this.setupEventHandlers();
    this.setupReconnectionLogic();
  }

  private setupEventHandlers(): void {
    // Dashboard real-time updates
    this.socket.on('dashboard:kpi-updated', (data) => {
      store.dispatch(dashboardSlice.actions.updateKPIData(data));
    });

    // Performance data updates
    this.socket.on('performance:data-updated', (data) => {
      store.dispatch(performanceApi.util.invalidateTags(['Performance']));
    });

    // Feedback notifications
    this.socket.on('feedback:new-feedback', (data) => {
      store.dispatch(feedbackSlice.actions.addNotification(data));
    });

    // Assessment updates
    this.socket.on('assessment:status-changed', (data) => {
      store.dispatch(assessmentSlice.actions.updateStatus(data));
    });
  }

  subscribeToUserEvents(userId: string): void {
    this.socket.emit('subscribe', { userId, events: ['kpi', 'feedback', 'assessment'] });
  }

  subscribeToTeamEvents(teamId: string): void {
    this.socket.emit('subscribe', { teamId, events: ['team-performance', 'team-feedback'] });
  }
}
```

### Event-Driven Updates

The application uses domain events to coordinate UI updates:

```typescript
// Domain Event System
interface DomainEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  publish(event: DomainEvent): void {
    const handlers = this.handlers.get(event.type) || [];
    handlers.forEach(handler => handler(event));
  }
}

// Event Handlers for Domain Aggregates
const dashboardEventHandlers = {
  'dashboard:loaded': (event) => {
    // Update dashboard loading state
    store.dispatch(dashboardSlice.actions.setLoaded(event.payload));
  },
  'widget:updated': (event) => {
    // Update specific widget data
    store.dispatch(dashboardSlice.actions.updateWidget(event.payload));
  },
  'filter:applied': (event) => {
    // Apply filters across dashboard
    store.dispatch(dashboardSlice.actions.applyFilters(event.payload));
  },
};
```
## Container Architecture (ECS Fargate)

### Container Configuration

#### Dockerfile
```dockerfile
# Multi-stage build for optimized production container
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### ECS Task Definition
```json
{
  "family": "frontend-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "frontend-container",
      "image": "ACCOUNT.dkr.ecr.ap-southeast-1.amazonaws.com/frontend-app:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/frontend-app",
          "awslogs-region": "ap-southeast-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "API_BASE_URL",
          "value": "https://api.performance-system.com"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:ACCOUNT:secret:frontend/jwt-secret"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:80/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### ECS Service Configuration

#### Service Definition
```json
{
  "serviceName": "frontend-service",
  "cluster": "performance-system-cluster",
  "taskDefinition": "frontend-app:REVISION",
  "desiredCount": 3,
  "launchType": "FARGATE",
  "platformVersion": "LATEST",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": [
        "subnet-12345678",
        "subnet-87654321"
      ],
      "securityGroups": [
        "sg-frontend-app"
      ],
      "assignPublicIp": "DISABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:ap-southeast-1:ACCOUNT:targetgroup/frontend-tg",
      "containerName": "frontend-container",
      "containerPort": 80
    }
  ],
  "serviceRegistries": [
    {
      "registryArn": "arn:aws:servicediscovery:ap-southeast-1:ACCOUNT:service/srv-frontend"
    }
  ]
}
```

### Auto-Scaling Configuration

```json
{
  "scalingPolicy": {
    "targetTrackingScalingPolicies": [
      {
        "targetValue": 70.0,
        "scaleOutCooldown": 300,
        "scaleInCooldown": 300,
        "predefinedMetricSpecification": {
          "predefinedMetricType": "ECSServiceAverageCPUUtilization"
        }
      },
      {
        "targetValue": 80.0,
        "scaleOutCooldown": 300,
        "scaleInCooldown": 300,
        "predefinedMetricSpecification": {
          "predefinedMetricType": "ECSServiceAverageMemoryUtilization"
        }
      }
    ]
  },
  "minCapacity": 2,
  "maxCapacity": 10
}
```
## Security Architecture

### Authentication & Authorization

#### JWT Token Management
```typescript
// Token Management Service
class TokenManager {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private refreshTimer: NodeJS.Timeout | null = null;

  setTokens(accessToken: string, refreshToken: string): void {
    // Store tokens securely (httpOnly cookies in production)
    sessionStorage.setItem(this.TOKEN_KEY, accessToken);
    sessionStorage.setItem(this.REFRESH_KEY, refreshToken);
    
    this.scheduleTokenRefresh(accessToken);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  private scheduleTokenRefresh(token: string): void {
    const payload = this.decodeToken(token);
    const expirationTime = payload.exp * 1000;
    const refreshTime = expirationTime - (5 * 60 * 1000); // 5 minutes before expiry
    const timeUntilRefresh = refreshTime - Date.now();

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshAccessToken();
      }, timeUntilRefresh);
    }
  }

  private async refreshAccessToken(): Promise<void> {
    const refreshToken = sessionStorage.getItem(this.REFRESH_KEY);
    if (!refreshToken) {
      this.logout();
      return;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { accessToken, refreshToken: newRefreshToken } = await response.json();
        this.setTokens(accessToken, newRefreshToken);
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
    }
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_KEY);
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    window.location.href = '/login';
  }
}
```

#### Route Protection
```typescript
// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}> = ({ children, requiredPermissions = [], fallback = <LoginRedirect /> }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.session);
  const hasPermissions = requiredPermissions.every(permission => 
    user?.permissions?.includes(permission)
  );

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (requiredPermissions.length > 0 && !hasPermissions) {
    return <UnauthorizedAccess />;
  }

  return <>{children}</>;
};

// Route Configuration
const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/dashboard" element={
      <ProtectedRoute requiredPermissions={['dashboard:read']}>
        <DashboardPage />
      </ProtectedRoute>
    } />
    <Route path="/assessments" element={
      <ProtectedRoute requiredPermissions={['assessment:read']}>
        <AssessmentPage />
      </ProtectedRoute>
    } />
    <Route path="/team" element={
      <ProtectedRoute requiredPermissions={['team:read']}>
        <TeamDashboardPage />
      </ProtectedRoute>
    } />
  </Routes>
);
```

### Content Security Policy

```typescript
// CSP Configuration
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'wss:', 'https://api.performance-system.com'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};
```

### Input Validation & Sanitization

```typescript
// Input Validation Service
class ValidationService {
  static sanitizeInput(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [],
    });
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateKPIScore(score: number): boolean {
    return typeof score === 'number' && score >= 0 && score <= 100;
  }

  static validateFormData(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
    const errors: ValidationError[] = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }
      
      if (value !== undefined && rules.type && typeof value !== rules.type) {
        errors.push({ field, message: `${field} must be of type ${rules.type}` });
      }
      
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
      }
      
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push({ field, message: `${field} must not exceed ${rules.maxLength} characters` });
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
}
```
## Monitoring & Observability (Prometheus Integration)

### Metrics Collection

#### Custom Metrics Service
```typescript
// Prometheus Metrics Service
class MetricsService {
  private metricsEndpoint = '/metrics';
  private metrics: Map<string, Metric> = new Map();

  // Counter for user interactions
  incrementUserAction(action: string, component: string): void {
    const metricName = `frontend_user_actions_total`;
    const labels = { action, component };
    this.incrementCounter(metricName, labels);
  }

  // Histogram for API response times
  recordAPIResponseTime(endpoint: string, method: string, duration: number): void {
    const metricName = `frontend_api_request_duration_seconds`;
    const labels = { endpoint, method };
    this.recordHistogram(metricName, labels, duration / 1000);
  }

  // Gauge for active users
  setActiveUsers(count: number): void {
    const metricName = `frontend_active_users`;
    this.setGauge(metricName, {}, count);
  }

  // Error rate tracking
  recordError(errorType: string, component: string): void {
    const metricName = `frontend_errors_total`;
    const labels = { error_type: errorType, component };
    this.incrementCounter(metricName, labels);
  }

  // Performance metrics
  recordPageLoadTime(page: string, loadTime: number): void {
    const metricName = `frontend_page_load_duration_seconds`;
    const labels = { page };
    this.recordHistogram(metricName, labels, loadTime / 1000);
  }

  private incrementCounter(name: string, labels: Record<string, string>): void {
    // Implementation for counter increment
    const key = `${name}_${JSON.stringify(labels)}`;
    const existing = this.metrics.get(key) || { type: 'counter', value: 0, labels };
    existing.value += 1;
    this.metrics.set(key, existing);
  }

  private recordHistogram(name: string, labels: Record<string, string>, value: number): void {
    // Implementation for histogram recording
    const key = `${name}_${JSON.stringify(labels)}`;
    const existing = this.metrics.get(key) || { 
      type: 'histogram', 
      buckets: new Map(), 
      sum: 0, 
      count: 0, 
      labels 
    };
    
    existing.sum += value;
    existing.count += 1;
    
    // Update buckets
    const buckets = [0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    buckets.forEach(bucket => {
      if (value <= bucket) {
        existing.buckets.set(bucket, (existing.buckets.get(bucket) || 0) + 1);
      }
    });
    
    this.metrics.set(key, existing);
  }

  async exportMetrics(): Promise<string> {
    let output = '';
    
    for (const [key, metric] of this.metrics) {
      if (metric.type === 'counter') {
        output += `# TYPE ${metric.name} counter\n`;
        output += `${metric.name}{${this.formatLabels(metric.labels)}} ${metric.value}\n`;
      } else if (metric.type === 'histogram') {
        output += `# TYPE ${metric.name} histogram\n`;
        for (const [bucket, count] of metric.buckets) {
          output += `${metric.name}_bucket{${this.formatLabels(metric.labels)},le="${bucket}"} ${count}\n`;
        }
        output += `${metric.name}_sum{${this.formatLabels(metric.labels)}} ${metric.sum}\n`;
        output += `${metric.name}_count{${this.formatLabels(metric.labels)}} ${metric.count}\n`;
      }
    }
    
    return output;
  }

  private formatLabels(labels: Record<string, string>): string {
    return Object.entries(labels)
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');
  }
}
```

#### Performance Monitoring Hook
```typescript
// React Hook for Performance Monitoring
const usePerformanceMonitoring = (componentName: string) => {
  const metricsService = useMetricsService();
  const renderStartTime = useRef<number>();

  useEffect(() => {
    renderStartTime.current = performance.now();
    
    return () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        metricsService.recordPageLoadTime(componentName, renderTime);
      }
    };
  }, [componentName, metricsService]);

  const trackUserAction = useCallback((action: string) => {
    metricsService.incrementUserAction(action, componentName);
  }, [componentName, metricsService]);

  const trackError = useCallback((error: Error) => {
    metricsService.recordError(error.name, componentName);
  }, [componentName, metricsService]);

  return { trackUserAction, trackError };
};
```

### Health Checks & Monitoring

#### Health Check Endpoint
```typescript
// Health Check Service
class HealthCheckService {
  async getHealthStatus(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkAPIConnectivity(),
      this.checkWebSocketConnection(),
      this.checkLocalStorage(),
      this.checkMemoryUsage(),
    ]);

    const results = checks.map((check, index) => ({
      name: ['api', 'websocket', 'localStorage', 'memory'][index],
      status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      details: check.status === 'fulfilled' ? check.value : check.reason,
    }));

    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
      version: process.env.REACT_APP_VERSION || 'unknown',
    };
  }

  private async checkAPIConnectivity(): Promise<string> {
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        timeout: 5000 
      });
      return response.ok ? 'API accessible' : 'API unreachable';
    } catch (error) {
      throw new Error(`API connectivity failed: ${error.message}`);
    }
  }

  private async checkWebSocketConnection(): Promise<string> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket('/api/realtime');
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve('WebSocket connection successful');
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      };
    });
  }

  private async checkLocalStorage(): Promise<string> {
    try {
      const testKey = '__health_check__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return 'Local storage accessible';
    } catch (error) {
      throw new Error('Local storage not accessible');
    }
  }

  private async checkMemoryUsage(): Promise<string> {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      
      if (usedMB / limitMB > 0.9) {
        throw new Error(`High memory usage: ${usedMB}MB / ${limitMB}MB`);
      }
      
      return `Memory usage: ${usedMB}MB / ${limitMB}MB`;
    }
    
    return 'Memory monitoring not available';
  }
}
```
## Environment Management

### Multi-Environment Configuration

#### Environment-Specific Settings
```typescript
// Environment Configuration
interface EnvironmentConfig {
  apiBaseUrl: string;
  websocketUrl: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  enableDebugTools: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    apiBaseUrl: 'http://localhost:3001/api/v1',
    websocketUrl: 'ws://localhost:3001',
    logLevel: 'debug',
    enableMetrics: true,
    enableDebugTools: true,
    cacheTimeout: 60000, // 1 minute
    maxRetries: 3,
  },
  staging: {
    apiBaseUrl: 'https://staging-api.performance-system.com/api/v1',
    websocketUrl: 'wss://staging-api.performance-system.com',
    logLevel: 'info',
    enableMetrics: true,
    enableDebugTools: true,
    cacheTimeout: 300000, // 5 minutes
    maxRetries: 5,
  },
  production: {
    apiBaseUrl: 'https://api.performance-system.com/api/v1',
    websocketUrl: 'wss://api.performance-system.com',
    logLevel: 'warn',
    enableMetrics: true,
    enableDebugTools: false,
    cacheTimeout: 600000, // 10 minutes
    maxRetries: 5,
  },
};

export const getConfig = (): EnvironmentConfig => {
  const env = process.env.NODE_ENV || 'development';
  return environments[env] || environments.development;
};
```

#### AWS Parameter Store Integration
```typescript
// Configuration Service
class ConfigurationService {
  private config: EnvironmentConfig;
  private parameterCache: Map<string, any> = new Map();

  async initialize(): Promise<void> {
    this.config = getConfig();
    
    if (process.env.NODE_ENV === 'production') {
      await this.loadParametersFromAWS();
    }
  }

  private async loadParametersFromAWS(): Promise<void> {
    try {
      const parameters = [
        '/frontend/api-base-url',
        '/frontend/websocket-url',
        '/frontend/log-level',
        '/frontend/cache-timeout',
      ];

      for (const paramName of parameters) {
        const value = await this.getParameter(paramName);
        this.parameterCache.set(paramName, value);
      }

      // Override config with AWS parameters
      this.config.apiBaseUrl = this.parameterCache.get('/frontend/api-base-url') || this.config.apiBaseUrl;
      this.config.websocketUrl = this.parameterCache.get('/frontend/websocket-url') || this.config.websocketUrl;
      this.config.logLevel = this.parameterCache.get('/frontend/log-level') || this.config.logLevel;
      this.config.cacheTimeout = parseInt(this.parameterCache.get('/frontend/cache-timeout')) || this.config.cacheTimeout;
    } catch (error) {
      console.error('Failed to load AWS parameters:', error);
      // Continue with default configuration
    }
  }

  private async getParameter(name: string): Promise<string> {
    // In a real implementation, this would use AWS SDK
    // For now, return environment variables as fallback
    const envKey = name.replace(/\//g, '_').replace(/-/g, '_').toUpperCase();
    return process.env[envKey] || '';
  }

  getConfig(): EnvironmentConfig {
    return this.config;
  }
}
```

### Container Environment Variables

#### ECS Task Definition Environment Configuration
```json
{
  "environment": [
    {
      "name": "NODE_ENV",
      "value": "${ENVIRONMENT}"
    },
    {
      "name": "REACT_APP_VERSION",
      "value": "${BUILD_VERSION}"
    },
    {
      "name": "REACT_APP_BUILD_DATE",
      "value": "${BUILD_DATE}"
    }
  ],
  "secrets": [
    {
      "name": "REACT_APP_API_BASE_URL",
      "valueFrom": "arn:aws:ssm:ap-southeast-1:ACCOUNT:parameter/frontend/${ENVIRONMENT}/api-base-url"
    },
    {
      "name": "REACT_APP_WEBSOCKET_URL",
      "valueFrom": "arn:aws:ssm:ap-southeast-1:ACCOUNT:parameter/frontend/${ENVIRONMENT}/websocket-url"
    },
    {
      "name": "REACT_APP_LOG_LEVEL",
      "valueFrom": "arn:aws:ssm:ap-southeast-1:ACCOUNT:parameter/frontend/${ENVIRONMENT}/log-level"
    }
  ]
}
```

## CI/CD Pipeline Architecture

### Build Pipeline (AWS CodePipeline)

#### Pipeline Configuration
```yaml
# buildspec.yml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com
      - REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/frontend-app
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}
  
  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker image...
      - docker build -t $REPOSITORY_URI:latest .
      - docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG
  
  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker images...
      - docker push $REPOSITORY_URI:latest
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - echo Writing image definitions file...
      - printf '[{"name":"frontend-container","imageUri":"%s"}]' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json

artifacts:
  files:
    - imagedefinitions.json
    - taskdef.json
```

#### Deployment Strategy
```typescript
// Deployment Configuration
interface DeploymentConfig {
  environment: 'dev' | 'staging' | 'production';
  cluster: string;
  service: string;
  taskDefinition: string;
  desiredCount: number;
  deploymentConfiguration: {
    maximumPercent: number;
    minimumHealthyPercent: number;
  };
}

const deploymentConfigs: Record<string, DeploymentConfig> = {
  dev: {
    environment: 'dev',
    cluster: 'performance-system-dev',
    service: 'frontend-service-dev',
    taskDefinition: 'frontend-app-dev',
    desiredCount: 1,
    deploymentConfiguration: {
      maximumPercent: 200,
      minimumHealthyPercent: 0,
    },
  },
  staging: {
    environment: 'staging',
    cluster: 'performance-system-staging',
    service: 'frontend-service-staging',
    taskDefinition: 'frontend-app-staging',
    desiredCount: 2,
    deploymentConfiguration: {
      maximumPercent: 200,
      minimumHealthyPercent: 50,
    },
  },
  production: {
    environment: 'production',
    cluster: 'performance-system-prod',
    service: 'frontend-service-prod',
    taskDefinition: 'frontend-app-prod',
    desiredCount: 3,
    deploymentConfiguration: {
      maximumPercent: 200,
      minimumHealthyPercent: 100,
    },
  },
};
```
## Performance Optimization

### Code Splitting & Lazy Loading

#### Route-Based Code Splitting
```typescript
// Lazy-loaded route components
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AssessmentPage = lazy(() => import('../pages/AssessmentPage'));
const FeedbackPage = lazy(() => import('../pages/FeedbackPage'));
const TeamDashboardPage = lazy(() => import('../pages/TeamDashboardPage'));
const ExecutiveDashboardPage = lazy(() => import('../pages/ExecutiveDashboardPage'));

// Route configuration with suspense
const AppRoutes: React.FC = () => (
  <Suspense fallback={<PageLoadingSpinner />}>
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/assessments" element={<AssessmentPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/team" element={<TeamDashboardPage />} />
      <Route path="/executive" element={<ExecutiveDashboardPage />} />
    </Routes>
  </Suspense>
);
```

#### Component-Level Code Splitting
```typescript
// Dynamic component loading for heavy visualizations
const ChartRenderer: React.FC<ChartProps> = ({ chartType, data }) => {
  const [ChartComponent, setChartComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChart = async () => {
      setLoading(true);
      
      try {
        let component;
        switch (chartType) {
          case 'line':
            component = await import('../components/charts/LineChart');
            break;
          case 'bar':
            component = await import('../components/charts/BarChart');
            break;
          case 'pie':
            component = await import('../components/charts/PieChart');
            break;
          case 'heatmap':
            component = await import('../components/charts/HeatMap');
            break;
          default:
            component = await import('../components/charts/DefaultChart');
        }
        
        setChartComponent(() => component.default);
      } catch (error) {
        console.error('Failed to load chart component:', error);
        setChartComponent(() => () => <div>Chart loading failed</div>);
      } finally {
        setLoading(false);
      }
    };

    loadChart();
  }, [chartType]);

  if (loading) {
    return <ChartLoadingSkeleton />;
  }

  return ChartComponent ? <ChartComponent data={data} /> : null;
};
```

### Caching Strategy

#### Multi-Level Caching
```typescript
// Cache Manager Service
class CacheManager {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private readonly MAX_MEMORY_ENTRIES = 1000;
  private readonly DEFAULT_TTL = 300000; // 5 minutes

  // Memory cache (fastest)
  setMemoryCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    if (this.memoryCache.size >= this.MAX_MEMORY_ENTRIES) {
      this.evictOldestEntry();
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  getMemoryCache(key: string): any | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Session storage cache (survives page refresh)
  setSessionCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    const entry = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    try {
      sessionStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Session storage cache failed:', error);
    }
  }

  getSessionCache(key: string): any | null {
    try {
      const item = sessionStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const entry = JSON.parse(item);
      if (Date.now() - entry.timestamp > entry.ttl) {
        sessionStorage.removeItem(`cache_${key}`);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Session storage cache retrieval failed:', error);
      return null;
    }
  }

  // IndexedDB cache (for large datasets)
  async setIndexedDBCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      await store.put({
        key,
        data,
        timestamp: Date.now(),
        ttl,
      });
    } catch (error) {
      console.warn('IndexedDB cache failed:', error);
    }
  }

  async getIndexedDBCache(key: string): Promise<any | null> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const entry = await store.get(key);

      if (!entry) return null;

      if (Date.now() - entry.timestamp > entry.ttl) {
        await this.deleteIndexedDBCache(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('IndexedDB cache retrieval failed:', error);
      return null;
    }
  }

  // Unified cache interface
  async get(key: string): Promise<any | null> {
    // Try memory cache first (fastest)
    let data = this.getMemoryCache(key);
    if (data) return data;

    // Try session storage (medium speed)
    data = this.getSessionCache(key);
    if (data) {
      // Promote to memory cache
      this.setMemoryCache(key, data);
      return data;
    }

    // Try IndexedDB (slowest but largest capacity)
    data = await this.getIndexedDBCache(key);
    if (data) {
      // Promote to higher-level caches
      this.setMemoryCache(key, data);
      this.setSessionCache(key, data);
      return data;
    }

    return null;
  }

  async set(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    // Store in all cache levels
    this.setMemoryCache(key, data, ttl);
    this.setSessionCache(key, data, ttl);
    await this.setIndexedDBCache(key, data, ttl);
  }

  private evictOldestEntry(): void {
    const oldestKey = this.memoryCache.keys().next().value;
    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PerformanceSystemCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  private async deleteIndexedDBCache(key: string): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await store.delete(key);
    } catch (error) {
      console.warn('IndexedDB cache deletion failed:', error);
    }
  }
}
```

### Virtual Scrolling for Large Datasets

```typescript
// Virtual Scrolling Hook
const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleStart,
    visibleEnd,
  };
};

// Virtual List Component
const VirtualList: React.FC<{
  items: any[];
  itemHeight: number;
  height: number;
  renderItem: (item: any, index: number) => React.ReactNode;
}> = ({ items, itemHeight, height, renderItem }) => {
  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleStart,
  } = useVirtualScrolling(items, itemHeight, height);

  return (
    <div
      style={{ height, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, visibleStart + index)
          )}
        </div>
      </div>
    </div>
  );
};
```
## Accessibility & Internationalization

### WCAG 2.1 AA Compliance

#### Accessibility Service
```typescript
// Accessibility Service
class AccessibilityService {
  // Focus management for modals and dynamic content
  static manageFocus(element: HTMLElement): () => void {
    const previousActiveElement = document.activeElement as HTMLElement;
    
    // Set focus to the element
    element.focus();
    
    // Return cleanup function
    return () => {
      if (previousActiveElement && previousActiveElement.focus) {
        previousActiveElement.focus();
      }
    };
  }

  // Announce dynamic content changes to screen readers
  static announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Keyboard navigation helper
  static handleKeyboardNavigation(
    event: KeyboardEvent,
    handlers: Record<string, () => void>
  ): void {
    const handler = handlers[event.key];
    if (handler) {
      event.preventDefault();
      handler();
    }
  }

  // Color contrast validation
  static validateColorContrast(foreground: string, background: string): boolean {
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    
    const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                    (Math.min(fgLuminance, bgLuminance) + 0.05);
    
    return contrast >= 4.5; // WCAG AA standard
  }

  private static getLuminance(color: string): number {
    // Convert hex to RGB and calculate relative luminance
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
```

#### Accessible Components
```typescript
// Accessible Modal Component
const AccessibleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Trap focus within modal
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
        
        if (event.key === 'Tab') {
          trapFocus(event, modalRef.current);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        
        // Restore focus
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="modal-content"
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="modal-close"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Focus trap utility
const trapFocus = (event: KeyboardEvent, container: HTMLElement | null) => {
  if (!container) return;
  
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
};
```

### Internationalization (i18n)

#### i18n Configuration
```typescript
// i18n Configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
```

#### Translation Hook
```typescript
// Translation Hook with Pluralization and Formatting
const useTranslation = (namespace?: string) => {
  const { t, i18n } = useReactI18next(namespace);
  
  const formatMessage = useCallback((
    key: string,
    values?: Record<string, any>,
    options?: { count?: number; context?: string }
  ) => {
    return t(key, { ...values, ...options });
  }, [t]);
  
  const formatDate = useCallback((date: Date, format: 'short' | 'long' | 'relative' = 'short') => {
    const locale = i18n.language;
    
    switch (format) {
      case 'short':
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(date);
      
      case 'long':
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);
      
      case 'relative':
        return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
          .format(Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 'day');
      
      default:
        return date.toLocaleDateString(locale);
    }
  }, [i18n.language]);
  
  const formatNumber = useCallback((
    number: number,
    options?: Intl.NumberFormatOptions
  ) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  }, [i18n.language]);
  
  const formatCurrency = useCallback((
    amount: number,
    currency: string = 'USD'
  ) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
    }).format(amount);
  }, [i18n.language]);
  
  return {
    t: formatMessage,
    formatDate,
    formatNumber,
    formatCurrency,
    changeLanguage: i18n.changeLanguage,
    currentLanguage: i18n.language,
    isRTL: ['ar', 'he', 'fa'].includes(i18n.language),
  };
};
```

#### RTL Support
```typescript
// RTL Layout Service
class RTLService {
  static applyRTLStyles(isRTL: boolean): void {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = isRTL ? 'ar' : 'en'; // Example
    
    // Apply RTL-specific CSS classes
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }
  
  static getTextAlign(isRTL: boolean): 'left' | 'right' {
    return isRTL ? 'right' : 'left';
  }
  
  static getMarginDirection(isRTL: boolean): 'marginLeft' | 'marginRight' {
    return isRTL ? 'marginRight' : 'marginLeft';
  }
  
  static getPaddingDirection(isRTL: boolean): 'paddingLeft' | 'paddingRight' {
    return isRTL ? 'paddingRight' : 'paddingLeft';
  }
}

// RTL-aware styled components
const RTLAwareContainer = styled.div<{ isRTL: boolean }>`
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  
  .icon {
    transform: ${props => props.isRTL ? 'scaleX(-1)' : 'none'};
  }
  
  .margin-start {
    ${props => props.isRTL ? 'margin-right' : 'margin-left'}: 1rem;
  }
  
  .margin-end {
    ${props => props.isRTL ? 'margin-left' : 'margin-right'}: 1rem;
  }
`;
```
## Testing Architecture

### Testing Strategy

#### Unit Testing with Jest & React Testing Library
```typescript
// Test Utilities
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            {children}
          </I18nextProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Custom hooks for testing
export const renderHookWithProviders = <T,>(
  hook: () => T,
  options: { preloadedState?: any } = {}
) => {
  const { preloadedState = {} } = options;
  const store = setupStore(preloadedState);
  
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );
  
  return renderHook(hook, { wrapper });
};
```

#### Component Testing Examples
```typescript
// Dashboard Component Tests
describe('DashboardContainer', () => {
  const mockKPIData = [
    { id: '1', name: 'Sales Target', current: 85, target: 100, status: 'yellow' },
    { id: '2', name: 'Customer Satisfaction', current: 92, target: 90, status: 'green' },
  ];

  beforeEach(() => {
    // Mock API responses
    server.use(
      rest.get('/api/v1/kpi-management/assignments', (req, res, ctx) => {
        return res(ctx.json(mockKPIData));
      })
    );
  });

  it('renders dashboard with KPI widgets', async () => {
    const { getByTestId, findByText } = renderWithProviders(<DashboardContainer />);
    
    // Wait for data to load
    await findByText('Sales Target');
    await findByText('Customer Satisfaction');
    
    // Check if widgets are rendered
    expect(getByTestId('kpi-widget-1')).toBeInTheDocument();
    expect(getByTestId('kpi-widget-2')).toBeInTheDocument();
  });

  it('applies filters correctly', async () => {
    const { getByLabelText, findByText } = renderWithProviders(<DashboardContainer />);
    
    // Apply time filter
    const timeFilter = getByLabelText('Time Period');
    fireEvent.change(timeFilter, { target: { value: 'monthly' } });
    
    // Verify API call with filter
    await waitFor(() => {
      expect(server.handlers[0]).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.objectContaining({
            searchParams: expect.objectContaining({
              get: expect.any(Function)
            })
          })
        })
      );
    });
  });

  it('handles real-time updates', async () => {
    const { findByText, getByTestId } = renderWithProviders(<DashboardContainer />);
    
    await findByText('Sales Target');
    
    // Simulate WebSocket update
    act(() => {
      mockWebSocket.emit('dashboard:kpi-updated', {
        id: '1',
        current: 90,
        status: 'green'
      });
    });
    
    // Verify UI update
    await waitFor(() => {
      expect(getByTestId('kpi-widget-1')).toHaveTextContent('90');
      expect(getByTestId('kpi-widget-1')).toHaveClass('status-green');
    });
  });
});
```

#### Integration Testing with Cypress
```typescript
// Cypress Integration Tests
describe('Dashboard Integration', () => {
  beforeEach(() => {
    // Mock authentication
    cy.login('employee@company.com', 'password');
    
    // Mock API responses
    cy.intercept('GET', '/api/v1/kpi-management/assignments', {
      fixture: 'kpi-assignments.json'
    }).as('getKPIAssignments');
    
    cy.intercept('GET', '/api/v1/data-analytics/performance/employee/*', {
      fixture: 'performance-data.json'
    }).as('getPerformanceData');
  });

  it('displays personal dashboard with real-time updates', () => {
    cy.visit('/dashboard');
    
    // Wait for initial data load
    cy.wait(['@getKPIAssignments', '@getPerformanceData']);
    
    // Verify dashboard elements
    cy.get('[data-testid="dashboard-container"]').should('be.visible');
    cy.get('[data-testid="kpi-widget"]').should('have.length.at.least', 1);
    
    // Test filter functionality
    cy.get('[data-testid="time-filter"]').select('quarterly');
    cy.wait('@getPerformanceData');
    
    // Verify chart updates
    cy.get('[data-testid="trend-chart"]').should('be.visible');
    
    // Test real-time updates
    cy.mockWebSocketMessage('dashboard:kpi-updated', {
      id: 'kpi-1',
      current: 95,
      status: 'green'
    });
    
    cy.get('[data-testid="kpi-widget-kpi-1"]')
      .should('contain', '95')
      .should('have.class', 'status-green');
  });

  it('handles assessment form submission', () => {
    cy.visit('/assessments');
    
    // Fill out assessment form
    cy.get('[data-testid="self-assessment-form"]').within(() => {
      cy.get('input[name="goal1-rating"]').type('4');
      cy.get('textarea[name="goal1-comments"]').type('Exceeded expectations in Q4');
      
      cy.get('input[name="goal2-rating"]').type('3');
      cy.get('textarea[name="goal2-comments"]').type('Met most objectives');
    });
    
    // Test draft saving
    cy.get('[data-testid="save-draft-btn"]').click();
    cy.get('[data-testid="draft-saved-indicator"]').should('be.visible');
    
    // Submit assessment
    cy.get('[data-testid="submit-assessment-btn"]').click();
    
    // Verify submission
    cy.get('[data-testid="submission-success"]').should('be.visible');
    cy.url().should('include', '/assessments/submitted');
  });
});
```

### Performance Testing

#### Lighthouse CI Integration
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
          temporaryPublicStorage: true
```

#### Lighthouse Configuration
```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "url": [
        "http://localhost/",
        "http://localhost/dashboard",
        "http://localhost/assessments",
        "http://localhost/feedback"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

## Validation Against User Stories

### US-007: View Personal KPI Dashboard ✅
- **Components**: DashboardContainer, KPIWidget, ChartRenderer
- **State Management**: Dashboard slice with real-time updates
- **Performance**: Virtual scrolling for large KPI lists, caching strategy
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### US-008: Access KPI Details ✅
- **Components**: VisualizationContainer, DetailModal, ExportControls
- **Features**: Drill-down functionality, data export, historical analysis
- **Performance**: Lazy loading of detailed charts, progressive data loading

### US-009: AI-Driven Performance Insights ✅
- **Components**: InsightWidget, RecommendationPanel, FeedbackForm
- **Integration**: AI insights API consumption with caching
- **UX**: Interactive what-if scenarios, feedback collection

### US-010: Monitor Team Performance ✅
- **Components**: TeamDashboardContainer, TeamComparisonChart, EmployeeCard
- **Features**: Team filtering, performance comparisons, coaching recommendations
- **Real-time**: WebSocket updates for team performance changes

### US-011: AI-Powered Team Insights ✅
- **Components**: TeamInsightPanel, OptimizationSuggestions, BenchmarkingChart
- **Features**: Team analytics, resource allocation suggestions, burnout detection

### US-012: Executive Performance Overview ✅
- **Components**: ExecutiveDashboardContainer, OrganizationalChart, DrillDownInterface
- **Features**: Multi-level drill-down, strategic KPI alignment, predictive analytics

### US-016: Conduct Self-Assessment ✅
- **Components**: AssessmentContainer, FormRenderer, DraftManager
- **Features**: Form validation, draft saving, document upload, progress tracking
- **Accessibility**: Form accessibility, error handling, keyboard navigation

### US-017: Manager Performance Scoring ✅
- **Components**: ManagerAssessmentInterface, ComparisonView, BulkActions
- **Features**: Side-by-side comparison, discrepancy highlighting, bulk operations

### US-020: Receive Performance Feedback ✅
- **Components**: FeedbackContainer, FeedbackThread, NotificationPanel
- **Features**: Threaded conversations, search functionality, notification management
- **Real-time**: WebSocket notifications, live feedback updates

## Implementation Guidelines

### Development Standards
- **TypeScript**: Strict mode enabled, comprehensive type definitions
- **Code Quality**: ESLint + Prettier configuration, pre-commit hooks
- **Component Structure**: Atomic design principles, reusable components
- **State Management**: Redux Toolkit patterns, normalized state structure
- **Testing**: Minimum 80% code coverage, comprehensive integration tests

### Deployment Process
1. **Development**: Local development with hot reloading
2. **Staging**: Automated deployment to staging environment for testing
3. **Production**: Blue-green deployment with health checks and rollback capability

### Monitoring & Alerting
- **Performance**: Core Web Vitals monitoring, bundle size tracking
- **Errors**: Real-time error tracking and alerting
- **Usage**: User analytics and feature adoption metrics
- **Infrastructure**: Container health, resource utilization, auto-scaling metrics

---

## Summary

This logical design provides a comprehensive blueprint for implementing Unit 4: Frontend Application with:

- **Modern React Architecture**: TypeScript, Redux Toolkit, Material-UI
- **Containerized Deployment**: ECS Fargate with auto-scaling and load balancing
- **Performance Optimization**: Code splitting, caching, virtual scrolling
- **Security**: JWT authentication, input validation, CSP implementation
- **Monitoring**: Prometheus integration, health checks, performance tracking
- **Accessibility**: WCAG 2.1 AA compliance, internationalization support
- **Testing**: Comprehensive unit, integration, and performance testing

The design ensures scalability, maintainability, and excellent user experience while meeting all functional requirements from the 9 user stories.

---

**Logical Design Status**: ✅ COMPLETE - Ready for implementation
**Date Completed**: December 16, 2025
**Technology Stack**: React + TypeScript + ECS Fargate + Prometheus
**Validation**: All 9 user stories covered with comprehensive technical implementation