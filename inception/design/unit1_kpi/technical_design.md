# Unit 1 KPI Management - Technical Design

## Overview
This document outlines the technical architecture, system design, and implementation specifications for the KPI Management unit.

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Backend       │
│   (React/Vue)   │◄──►│   (Express/     │◄──►│   Services      │
│                 │    │    FastAPI)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Auth Service  │    │   Database      │
                       │   (JWT/OAuth)   │    │   (PostgreSQL)  │
                       └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   AI/ML Engine  │
                                               │   (Python/      │
                                               │    TensorFlow)  │
                                               └─────────────────┘
```

## Database Design

### Core Tables

#### kpis
```sql
CREATE TABLE kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    measurement_type ENUM('numerical', 'percentage', 'boolean') NOT NULL,
    target_value DECIMAL(10,2),
    weight DECIMAL(5,2) CHECK (weight >= 0 AND weight <= 100),
    measurement_frequency ENUM('daily', 'weekly', 'monthly', 'quarterly') NOT NULL,
    data_source VARCHAR(255),
    calculation_method TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### kpi_assignments
```sql
CREATE TABLE kpi_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id UUID REFERENCES kpis(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    custom_target DECIMAL(10,2),
    custom_weight DECIMAL(5,2),
    effective_date DATE NOT NULL,
    end_date DATE,
    assigned_by UUID REFERENCES users(id),
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kpi_id, employee_id, effective_date)
);
```

#### kpi_hierarchy
```sql
CREATE TABLE kpi_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_kpi_id UUID REFERENCES kpis(id),
    child_kpi_id UUID REFERENCES kpis(id),
    hierarchy_level ENUM('company', 'department', 'team', 'individual') NOT NULL,
    weight_contribution DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_kpi_id, child_kpi_id)
);
```

#### ai_kpi_suggestions
```sql
CREATE TABLE ai_kpi_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    suggested_kpi_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    rationale TEXT,
    status ENUM('pending', 'approved', 'rejected', 'modified') DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### onboarding_kpi_templates
```sql
CREATE TABLE onboarding_kpi_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    kpi_template_data JSONB NOT NULL,
    auto_assign BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### maker_checker_requests
```sql
CREATE TABLE maker_checker_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_type ENUM('kpi_create', 'kpi_update', 'kpi_delete', 'assignment_change') NOT NULL,
    entity_id UUID NOT NULL,
    original_data JSONB,
    proposed_data JSONB NOT NULL,
    justification TEXT,
    maker_id UUID REFERENCES users(id) NOT NULL,
    checker_id UUID REFERENCES users(id),
    status ENUM('pending', 'approved', 'rejected', 'emergency_override') DEFAULT 'pending',
    decision_reason TEXT,
    emergency_override_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMP
);
```

## API Design

### REST Endpoints

#### KPI Management
```
GET    /api/v1/kpis                    # List all KPIs
POST   /api/v1/kpis                    # Create new KPI
GET    /api/v1/kpis/{id}               # Get specific KPI
PUT    /api/v1/kpis/{id}               # Update KPI
DELETE /api/v1/kpis/{id}               # Delete KPI
GET    /api/v1/kpis/categories         # Get KPI categories
```

#### KPI Assignments
```
GET    /api/v1/kpi-assignments         # List assignments
POST   /api/v1/kpi-assignments         # Create assignment
PUT    /api/v1/kpi-assignments/{id}    # Update assignment
DELETE /api/v1/kpi-assignments/{id}    # Remove assignment
GET    /api/v1/employees/{id}/kpis     # Get employee KPIs
```

#### AI Suggestions
```
POST   /api/v1/ai/kpi-suggestions      # Generate suggestions
GET    /api/v1/ai/kpi-suggestions      # List pending suggestions
PUT    /api/v1/ai/kpi-suggestions/{id} # Review suggestion
```

#### Onboarding
```
POST   /api/v1/onboarding/kpi-templates    # Create onboarding template
GET    /api/v1/onboarding/kpi-templates    # List templates
GET    /api/v1/onboarding/{employeeId}/kpis # Get onboarding KPIs
POST   /api/v1/onboarding/{employeeId}/assign # Assign onboarding KPIs
```

#### Maker-Checker
```
POST   /api/v1/maker-checker/requests      # Submit approval request
GET    /api/v1/maker-checker/requests      # List pending requests
PUT    /api/v1/maker-checker/requests/{id} # Approve/reject request
POST   /api/v1/maker-checker/emergency     # Emergency override
```

### Request/Response Examples

#### Create KPI Request
```json
{
  "name": "Sales Revenue Growth",
  "description": "Monthly sales revenue growth percentage",
  "category": "sales",
  "measurement_type": "percentage",
  "target_value": 15.0,
  "weight": 30.0,
  "measurement_frequency": "monthly",
  "data_source": "salesforce_api",
  "calculation_method": "((current_month - previous_month) / previous_month) * 100"
}
```

#### KPI Assignment Request
```json
{
  "kpi_id": "123e4567-e89b-12d3-a456-426614174000",
  "employee_id": "987fcdeb-51a2-43d1-b123-456789abcdef",
  "custom_target": 20.0,
  "custom_weight": 35.0,
  "effective_date": "2024-01-01"
}
```

## Service Layer Architecture

### KPI Service
```typescript
interface KPIService {
  createKPI(kpiData: CreateKPIRequest): Promise<KPI>;
  updateKPI(id: string, updates: UpdateKPIRequest): Promise<KPI>;
  deleteKPI(id: string): Promise<void>;
  getKPIById(id: string): Promise<KPI>;
  listKPIs(filters: KPIFilters): Promise<KPI[]>;
  validateKPIData(kpiData: KPIData): ValidationResult;
}
```

### Assignment Service
```typescript
interface AssignmentService {
  assignKPI(assignment: KPIAssignment): Promise<Assignment>;
  updateAssignment(id: string, updates: AssignmentUpdate): Promise<Assignment>;
  removeAssignment(id: string): Promise<void>;
  getEmployeeKPIs(employeeId: string): Promise<Assignment[]>;
  validateWeights(employeeId: string, assignments: Assignment[]): ValidationResult;
}
```

### AI Suggestion Service
```typescript
interface AISuggestionService {
  generateSuggestions(jobTitle: string, department: string): Promise<KPISuggestion[]>;
  reviewSuggestion(id: string, decision: ReviewDecision): Promise<void>;
  getPendingSuggestions(): Promise<KPISuggestion[]>;
  trainModel(feedbackData: FeedbackData[]): Promise<void>;
}
```

### Onboarding Service
```typescript
interface OnboardingService {
  createKPITemplate(template: OnboardingTemplate): Promise<Template>;
  getTemplateByRole(roleTitle: string, department: string): Promise<Template>;
  assignOnboardingKPIs(employeeId: string, customizations?: KPICustomization[]): Promise<Assignment[]>;
  completeKPIOnboarding(employeeId: string): Promise<void>;
  getOnboardingStatus(employeeId: string): Promise<OnboardingStatus>;
}
```

### Maker-Checker Service
```typescript
interface MakerCheckerService {
  submitRequest(request: ApprovalRequest): Promise<RequestId>;
  reviewRequest(requestId: string, decision: ApprovalDecision): Promise<void>;
  getPendingRequests(checkerId: string): Promise<ApprovalRequest[]>;
  emergencyOverride(requestId: string, overrideReason: string): Promise<void>;
  isChangeRequiresApproval(changeType: string, changeData: any): boolean;
}
```

## Data Integration Layer

### External System Connectors
```typescript
interface DataConnector {
  validateConnection(): Promise<boolean>;
  fetchData(query: DataQuery): Promise<any>;
  getSchema(): Promise<DataSchema>;
}

class SalesforceConnector implements DataConnector {
  // Implementation for Salesforce integration
}

class SAPConnector implements DataConnector {
  // Implementation for SAP integration
}

class GoogleSheetsConnector implements DataConnector {
  // Implementation for Google Sheets integration
}
```

## Security Considerations

### Authentication & Authorization
- JWT-based authentication for API access
- Role-based access control (RBAC) for KPI management
- Permission levels: Admin, HR Manager, Supervisor, Employee
- API rate limiting and request validation

### Data Security
- Encryption at rest for sensitive KPI data
- Encrypted communication (HTTPS/TLS)
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- Audit logging for all KPI operations

## Performance Optimization

### Caching Strategy
- Redis cache for frequently accessed KPIs
- Cache invalidation on KPI updates
- Employee KPI cache with TTL
- AI suggestion result caching

### Database Optimization
- Indexes on frequently queried columns
- Partitioning for large historical data
- Connection pooling for database access
- Query optimization for complex KPI hierarchies

## Monitoring and Logging

### Application Metrics
- API response times and error rates
- KPI creation and assignment success rates
- AI suggestion accuracy metrics
- User activity and engagement metrics

### Logging Strategy
- Structured logging with correlation IDs
- Audit logs for all KPI operations
- Error logging with stack traces
- Performance logging for slow queries

## Deployment Architecture

### Containerization
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Infrastructure
- Docker containers for microservices
- Kubernetes for orchestration
- Load balancer for high availability
- Auto-scaling based on CPU/memory usage
- Database clustering for redundancy

## Testing Strategy

### Unit Testing
- Service layer unit tests (Jest/Mocha)
- Database layer testing with test containers
- Mock external API dependencies
- Code coverage target: 90%

### Integration Testing
- API endpoint testing
- Database integration tests
- External system integration tests
- End-to-end workflow testing

### Performance Testing
- Load testing for concurrent users
- Stress testing for peak usage
- Database performance testing
- AI model inference performance testing