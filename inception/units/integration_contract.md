# Integration Contract - Employee Performance System (Revised Architecture)

## Overview
This document defines the API contracts between the four units of the Employee Performance System with the revised architecture that includes a dedicated Frontend Application unit. The three backend services expose APIs that the Frontend Application consumes, ensuring clear separation between frontend and backend concerns.

## Architecture Overview
- **Unit 1**: KPI Management Service (Backend)
- **Unit 2**: Performance Management Service (Backend) 
- **Unit 3**: Data & Analytics Service (Backend)
- **Unit 4**: Frontend Application (UI/Client)

## Authentication & Authorization
- **Authentication**: All API calls require JWT tokens with appropriate scopes
- **Authorization**: Role-based access control (RBAC) enforced at endpoint level
- **Rate Limiting**: 1000 requests per minute per service, 100 requests per minute per user
- **CORS**: Configured to allow Frontend Application domain access
- **Error Handling**: Standardized HTTP status codes and error response format

### Standard Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error context",
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "uuid"
  }
}
```

---

## Unit 1: KPI Management Service

### Base URL: `/api/v1/kpi-management`

### Endpoints Exposed

#### 1.1 KPI Definitions
```
GET /kpis
- Description: Retrieve KPI definitions with optional filters
- Query Parameters: role_id, department_id, status, created_after
- Response: Array of KPI definition objects
- Consumed by: Frontend Application, Performance Management Service, Data & Analytics Service

GET /kpis/{kpi_id}
- Description: Get specific KPI definition details
- Response: KPI definition object with full details
- Consumed by: Frontend Application, Performance Management Service, Data & Analytics Service

POST /kpis
- Description: Create new KPI definition
- Request Body: KPI definition object
- Response: Created KPI with generated ID
- Consumed by: Frontend Application

PUT /kpis/{kpi_id}
- Description: Update existing KPI definition
- Request Body: Updated KPI definition object
- Response: Updated KPI definition
- Consumed by: Frontend Application

DELETE /kpis/{kpi_id}
- Description: Delete KPI definition (soft delete)
- Response: Deletion confirmation
- Consumed by: Frontend Application
```

#### 1.2 KPI Assignments
```
GET /assignments
- Description: Retrieve KPI assignments with filters
- Query Parameters: employee_id, supervisor_id, kpi_id, effective_date
- Response: Array of KPI assignment objects
- Consumed by: Frontend Application, Performance Management Service, Data & Analytics Service

GET /assignments/employee/{employee_id}
- Description: Get all KPI assignments for specific employee
- Response: Array of assigned KPIs with targets and effective dates
- Consumed by: Frontend Application, Performance Management Service, Data & Analytics Service

POST /assignments
- Description: Create new KPI assignment
- Request Body: Assignment object (employee_id, kpi_id, custom_target, effective_date)
- Response: Created assignment with ID
- Consumed by: Frontend Application

PUT /assignments/{assignment_id}
- Description: Update KPI assignment
- Request Body: Updated assignment object
- Response: Updated assignment
- Consumed by: Frontend Application

GET /assignments/bulk
- Description: Get multiple employee assignments in one call
- Query Parameters: employee_ids (comma-separated)
- Response: Grouped assignment data by employee
- Consumed by: Frontend Application (for team dashboards)
```

#### 1.3 KPI Hierarchy
```
GET /hierarchy
- Description: Retrieve complete KPI hierarchy
- Query Parameters: level (company/department/individual), parent_id
- Response: Hierarchical KPI structure
- Consumed by: Frontend Application, Data & Analytics Service

GET /hierarchy/cascade/{parent_kpi_id}
- Description: Get all child KPIs for cascading
- Response: Array of child KPI relationships
- Consumed by: Frontend Application, Data & Analytics Service
```

#### 1.4 AI Suggestions
```
GET /ai-suggestions
- Description: Retrieve pending AI KPI suggestions
- Query Parameters: status, job_title, department, assigned_to
- Response: Array of AI suggestion objects
- Consumed by: Frontend Application

POST /ai-suggestions/generate
- Description: Generate AI KPI suggestions for job title
- Request Body: { job_title, department, context }
- Response: Array of suggested KPIs with rationale
- Consumed by: Frontend Application

PUT /ai-suggestions/{suggestion_id}/approve
- Description: Approve or reject AI suggestion
- Request Body: { status: "approved|rejected", feedback }
- Response: Updated suggestion status
- Consumed by: Frontend Application

GET /ai-suggestions/history/{user_id}
- Description: Get AI suggestion history for user
- Response: Historical AI suggestions with outcomes
- Consumed by: Frontend Application
```

---

## Unit 2: Performance Management Service

### Base URL: `/api/v1/performance-management`

### Endpoints Exposed

#### 2.1 Review Templates
```
GET /templates
- Description: Get available review templates
- Query Parameters: role, department, active_only
- Response: Array of review template objects
- Consumed by: Frontend Application, Data & Analytics Service

GET /templates/{template_id}
- Description: Get specific review template details
- Response: Complete template configuration
- Consumed by: Frontend Application

POST /templates
- Description: Create new review template
- Request Body: Template configuration object
- Response: Created template with ID
- Consumed by: Frontend Application

PUT /templates/{template_id}
- Description: Update review template
- Request Body: Updated template configuration
- Response: Updated template
- Consumed by: Frontend Application
```

#### 2.2 Review Cycles
```
GET /cycles
- Description: Get review cycles with filters
- Query Parameters: status, start_date, end_date, template_id, participant_id
- Response: Array of review cycle objects
- Consumed by: Frontend Application, Data & Analytics Service

GET /cycles/{cycle_id}/participants
- Description: Get participants and their review status
- Response: Array of participant objects with completion status
- Consumed by: Frontend Application

POST /cycles
- Description: Create new review cycle
- Request Body: Cycle configuration (template_id, participants, dates)
- Response: Created cycle with participant assignments
- Consumed by: Frontend Application

PUT /cycles/{cycle_id}/status
- Description: Update review cycle status
- Request Body: { status, reason }
- Response: Updated cycle status
- Consumed by: Frontend Application
```

#### 2.3 Review Assessments
```
GET /assessments/employee/{employee_id}
- Description: Get review assessments for employee
- Query Parameters: cycle_id, type (self|manager), include_scores
- Response: Array of assessment objects
- Consumed by: Frontend Application, Data & Analytics Service

GET /assessments/cycle/{cycle_id}
- Description: Get all assessments for specific cycle
- Query Parameters: status, employee_id, include_calibration
- Response: Array of assessment objects
- Consumed by: Frontend Application

POST /assessments
- Description: Create or update assessment
- Request Body: Assessment data (scores, comments, goals)
- Response: Created/updated assessment with calculated scores
- Consumed by: Frontend Application

GET /assessments/{assessment_id}/comparison
- Description: Compare self vs manager assessment
- Response: Side-by-side comparison with discrepancy analysis
- Consumed by: Frontend Application
```

#### 2.4 Calibration
```
GET /calibration/sessions
- Description: Get calibration session data
- Query Parameters: cycle_id, supervisor_id, status
- Response: Array of calibration session objects
- Consumed by: Frontend Application, Data & Analytics Service

POST /calibration/sessions
- Description: Create calibration session
- Request Body: Session configuration and participant reviews
- Response: Created session with initial calibration data
- Consumed by: Frontend Application

PUT /calibration/sessions/{session_id}/adjustments
- Description: Apply calibration adjustments
- Request Body: Array of rating adjustments with rationale
- Response: Updated review scores after calibration
- Consumed by: Frontend Application
```

#### 2.5 Feedback Management
```
GET /feedback/employee/{employee_id}
- Description: Get feedback history for employee
- Query Parameters: start_date, end_date, feedback_type, kpi_id, as_giver, as_receiver
- Response: Array of feedback objects with context
- Consumed by: Frontend Application, Data & Analytics Service

POST /feedback
- Description: Create new feedback entry
- Request Body: Feedback object (giver, receiver, content, kpi_id, type)
- Response: Created feedback with ID and timestamp
- Consumed by: Frontend Application

PUT /feedback/{feedback_id}/response
- Description: Respond to feedback
- Request Body: { response_content, status }
- Response: Updated feedback with response
- Consumed by: Frontend Application

GET /feedback/trends/{employee_id}
- Description: Get feedback trends and patterns
- Query Parameters: time_period, aggregation_level
- Response: Feedback trend analysis and insights
- Consumed by: Frontend Application, Data & Analytics Service
```

#### 2.6 Recognition System
```
GET /recognition/employee/{employee_id}
- Description: Get recognition history for employee
- Query Parameters: as_giver, as_receiver, start_date, end_date
- Response: Array of recognition objects
- Consumed by: Frontend Application, Data & Analytics Service

POST /recognition
- Description: Create recognition entry
- Request Body: Recognition object (giver, receiver, type, kpi_impact, reward)
- Response: Created recognition with ID
- Consumed by: Frontend Application

GET /recognition/feed
- Description: Get recognition feed for team/organization
- Query Parameters: scope, limit, offset
- Response: Paginated recognition feed
- Consumed by: Frontend Application

GET /recognition/analytics
- Description: Get recognition analytics and patterns
- Query Parameters: scope, time_period, team_id
- Response: Recognition metrics and engagement data
- Consumed by: Frontend Application, Data & Analytics Service
```

#### 2.7 Coaching Resources
```
GET /coaching/questions
- Description: Get coaching questions with filters
- Query Parameters: kpi_type, performance_level, creator_id
- Response: Array of coaching question objects
- Consumed by: Frontend Application

POST /coaching/questions
- Description: Create new coaching question
- Request Body: Question object (content, kpi_type, performance_level)
- Response: Created question with ID
- Consumed by: Frontend Application

GET /coaching/resources
- Description: Get coaching resources and materials
- Query Parameters: category, kpi_type, rating_min
- Response: Array of coaching resource objects
- Consumed by: Frontend Application

POST /coaching/sessions
- Description: Log new coaching session
- Request Body: Session object (supervisor, employee, topics, outcomes)
- Response: Created session with ID
- Consumed by: Frontend Application

GET /coaching/sessions/supervisor/{supervisor_id}
- Description: Get coaching sessions for supervisor
- Query Parameters: employee_id, start_date, end_date
- Response: Array of coaching session objects
- Consumed by: Frontend Application, Data & Analytics Service
```

#### 2.8 External Integrations
```
POST /integrations/slack/webhook
- Description: Handle Slack bot interactions
- Request Body: Slack event payload
- Response: Bot response or acknowledgment
- Consumed by: External Slack integration

POST /integrations/teams/webhook
- Description: Handle Teams bot interactions
- Request Body: Teams event payload
- Response: Bot response or acknowledgment
- Consumed by: External Teams integration

GET /integrations/status
- Description: Get integration health status
- Response: Status of external platform connections
- Consumed by: Frontend Application, Data & Analytics Service
```

---

## Unit 3: Data & Analytics Service

### Base URL: `/api/v1/data-analytics`

### Endpoints Exposed

#### 3.1 Performance Data
```
GET /performance/employee/{employee_id}
- Description: Get performance data for specific employee
- Query Parameters: start_date, end_date, kpi_ids, aggregation_level
- Response: Performance data with actual vs target values
- Consumed by: Frontend Application, Performance Management Service

GET /performance/team/{supervisor_id}
- Description: Get aggregated team performance data
- Query Parameters: start_date, end_date, include_individuals
- Response: Team performance metrics and individual summaries
- Consumed by: Frontend Application, Performance Management Service

GET /performance/organization
- Description: Get organization-wide performance metrics
- Query Parameters: start_date, end_date, department_ids, level
- Response: Aggregated organizational performance data
- Consumed by: Frontend Application, Performance Management Service

POST /performance/bulk-update
- Description: Bulk update performance data from external sources
- Request Body: Array of performance data points
- Response: Update status and any errors
- Consumed by: External data integrations

GET /performance/real-time/{employee_id}
- Description: Get real-time performance updates via WebSocket
- Response: WebSocket connection for live data updates
- Consumed by: Frontend Application
```

#### 3.2 Analytics & Insights
```
GET /insights/employee/{employee_id}
- Description: Get AI-generated insights for employee
- Query Parameters: insight_types, time_period
- Response: Array of personalized insights and recommendations
- Consumed by: Frontend Application, Performance Management Service

GET /insights/team/{supervisor_id}
- Description: Get team-level insights and recommendations
- Response: Team optimization suggestions and performance patterns
- Consumed by: Frontend Application, Performance Management Service

GET /insights/organization
- Description: Get organization-level insights and trends
- Query Parameters: department_ids, time_period
- Response: Strategic insights and organizational patterns
- Consumed by: Frontend Application

GET /analytics/trends
- Description: Get performance trends and patterns
- Query Parameters: scope (individual/team/organization), metrics, time_range
- Response: Trend analysis data and predictions
- Consumed by: Frontend Application, Performance Management Service

GET /analytics/correlations
- Description: Get KPI correlation analysis
- Query Parameters: employee_id, team_id, kpi_ids
- Response: Correlation data between different KPIs
- Consumed by: Frontend Application
```

#### 3.3 Reporting
```
POST /reports/generate
- Description: Generate custom performance reports
- Request Body: Report configuration (filters, metrics, format)
- Response: Report generation job ID
- Consumed by: Frontend Application

GET /reports/{report_id}/status
- Description: Check report generation status
- Response: Status and download URL when ready
- Consumed by: Frontend Application

GET /reports/templates
- Description: Get available report templates
- Response: Array of report template configurations
- Consumed by: Frontend Application

POST /reports/schedule
- Description: Schedule automated report generation
- Request Body: Report configuration and schedule settings
- Response: Scheduled report job ID
- Consumed by: Frontend Application

GET /reports/history
- Description: Get report generation history
- Query Parameters: user_id, start_date, end_date
- Response: Array of historical report objects
- Consumed by: Frontend Application
```

#### 3.4 Data Integration
```
GET /integrations/sources
- Description: Get configured data sources
- Response: Array of integration source configurations
- Consumed by: Frontend Application

POST /integrations/sources
- Description: Configure new data source integration
- Request Body: Integration configuration object
- Response: Created integration with connection test results
- Consumed by: Frontend Application

PUT /integrations/sources/{source_id}
- Description: Update data source configuration
- Request Body: Updated integration configuration
- Response: Updated integration status
- Consumed by: Frontend Application

GET /integrations/sync-status
- Description: Get data synchronization status
- Query Parameters: source_id, start_date, end_date
- Response: Sync status and error logs
- Consumed by: Frontend Application

POST /integrations/test-connection
- Description: Test data source connection
- Request Body: Connection parameters
- Response: Connection test results
- Consumed by: Frontend Application
```

#### 3.5 System Administration
```
GET /admin/users
- Description: Get user management data
- Query Parameters: role, status, department, search
- Response: Array of user objects with roles and permissions
- Consumed by: Frontend Application

POST /admin/users
- Description: Create new user account
- Request Body: User object with role assignments
- Response: Created user with generated ID
- Consumed by: Frontend Application

PUT /admin/users/{user_id}
- Description: Update user account and permissions
- Request Body: Updated user object
- Response: Updated user information
- Consumed by: Frontend Application

GET /admin/system-health
- Description: Get system health and performance metrics
- Response: System status, performance metrics, and alerts
- Consumed by: Frontend Application

GET /admin/audit-logs
- Description: Get system audit logs
- Query Parameters: user_id, action_type, start_date, end_date
- Response: Array of audit log entries
- Consumed by: Frontend Application

POST /admin/system-config
- Description: Update system configuration
- Request Body: Configuration parameters
- Response: Updated configuration status
- Consumed by: Frontend Application
```

---

## Unit 4: Frontend Application

### Frontend Architecture
The Frontend Application is a client-side application that consumes APIs from the three backend services. It does not expose APIs but rather provides user interfaces and manages client-side state.

### Key Frontend Responsibilities
- **User Interface Rendering**: All UI components and layouts
- **State Management**: Client-side application state and caching
- **API Integration**: Consuming backend APIs and handling responses
- **Real-time Updates**: WebSocket connections for live data
- **User Experience**: Navigation, form handling, and user interactions
- **Authentication**: JWT token management and session handling

### Frontend-Backend Communication Patterns

#### 1. Dashboard Data Flow
```
Frontend → Data & Analytics Service → Performance data
Frontend → KPI Management Service → KPI definitions and assignments
Frontend → Performance Management Service → Feedback and recognition data
```

#### 2. Performance Review Flow
```
Frontend → Performance Management Service → Review templates and cycles
Frontend → KPI Management Service → KPI data for review context
Frontend → Data & Analytics Service → Performance analytics for reviews
```

#### 3. Real-time Updates
```
Frontend ←→ Data & Analytics Service (WebSocket) → Live performance data
Frontend ←→ Performance Management Service (WebSocket) → Feedback notifications
```

## Security Considerations

### 1. API Security
- **JWT Authentication**: All API calls require valid JWT tokens
- **Role-Based Authorization**: Endpoints enforce user role permissions
- **Rate Limiting**: Prevents API abuse and ensures fair usage
- **Input Validation**: All inputs validated and sanitized
- **HTTPS Only**: All API communication over encrypted connections

### 2. Frontend Security
- **Token Storage**: JWT tokens stored securely (httpOnly cookies or secure storage)
- **XSS Protection**: Content Security Policy and input sanitization
- **CSRF Protection**: Anti-CSRF tokens for state-changing operations
- **Secure Headers**: Security headers configured for all responses

### 3. Data Privacy
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Access Logging**: All data access logged for audit purposes
- **Data Minimization**: Only necessary data exposed through APIs
- **Privacy Controls**: User privacy settings respected in all operations

## Monitoring & Observability

### 1. API Monitoring
- **Response Times**: Track API response times and performance
- **Error Rates**: Monitor API error rates and failure patterns
- **Usage Analytics**: Track API usage patterns and popular endpoints
- **Health Checks**: Regular health checks for all backend services

### 2. Frontend Monitoring
- **Page Load Times**: Monitor frontend performance and load times
- **User Interactions**: Track user engagement and feature usage
- **Error Tracking**: Client-side error monitoring and reporting
- **Performance Metrics**: Core Web Vitals and user experience metrics

### 3. Business Metrics
- **KPI Completion Rates**: Track KPI assignment and completion rates
- **Review Cycle Success**: Monitor review cycle completion and quality
- **User Engagement**: Track user activity and system adoption
- **Feedback Quality**: Monitor feedback frequency and effectiveness

---

**Integration Contract Status**: Complete - Revised architecture with dedicated Frontend Application unit and comprehensive API specifications