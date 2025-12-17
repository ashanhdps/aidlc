# Logical Design - Unit 3: Data & Analytics Service

## Overview
This document defines the logical design for Unit 3: Data & Analytics Service, a containerized microservice running on AWS ECS Fargate. The design is simplified for a one-day workshop scope, focusing on essential features:

**Core Responsibilities:**
- Basic system administration and user management
- Simple report generation and template management  
- Basic performance data display (read-only)

**Simplified Scope (3 Aggregates Only):**
- User Account Aggregate - User management with roles and permissions
- Report Aggregate - Basic report generation with templates
- Performance Data Aggregate - Read-only performance metrics display

## Architecture Principles

### Design Principles
- **Simplicity First**: Minimal complexity suitable for one-day workshop
- **Domain-Driven Design**: Clear separation of domain logic from infrastructure
- **Containerized Deployment**: Single container service on ECS Fargate
- **API-First**: RESTful APIs for all external communication
- **Event-Driven**: Domain events for loose coupling with other services

### Technology Stack
- **Runtime**: Java 17 with Spring Boot 3.x
- **Database**: PostgreSQL 15
- **Caching**: Redis 7.x
- **Message Queue**: AWS SQS
- **File Storage**: AWS S3
- **Container Platform**: AWS ECS Fargate
- **Load Balancer**: AWS Application Load Balancer (ALB)

### Quality Attributes
- **Performance**: API response times <500ms, report generation <5 minutes
- **Scalability**: 50-100 concurrent users, 100,000 data points per day
- **Security**: Role-based access control, basic audit logging
- **Reliability**: Basic error handling and graceful degradation

## High-Level Architecture

### Service Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Data & Analytics Service                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   API       │  │  Domain     │  │   Infrastructure    │  │
│  │   Layer     │  │   Layer     │  │      Layer          │  │
│  │             │  │             │  │                     │  │
│  │ Controllers │  │ Aggregates  │  │ Repositories        │  │
│  │ DTOs        │  │ Services    │  │ External APIs       │  │
│  │ Validation  │  │ Events      │  │ Database Access     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Container Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      ECS Fargate Cluster                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Data Analytics Service                 │    │
│  │                                                     │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   Task 1    │  │   Task 2    │  │   Task N    │  │    │
│  │  │             │  │             │  │             │  │    │
│  │  │ Spring Boot │  │ Spring Boot │  │ Spring Boot │  │    │
│  │  │ Application │  │ Application │  │ Application │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Application Layer Design

### API Layer Structure
```
src/main/java/com/company/dataanalytics/
├── api/
│   ├── controllers/
│   │   ├── UserController.java
│   │   ├── ReportController.java
│   │   └── PerformanceDataController.java
│   ├── dto/
│   │   ├── request/
│   │   │   ├── CreateUserRequest.java
│   │   │   ├── GenerateReportRequest.java
│   │   │   └── UpdateUserRequest.java
│   │   └── response/
│   │       ├── UserResponse.java
│   │       ├── ReportResponse.java
│   │       └── PerformanceDataResponse.java
│   └── validation/
│       ├── UserValidation.java
│       └── ReportValidation.java
```

### API Endpoints Design

#### User Management APIs
- `GET /api/v1/data-analytics/admin/users` - List users with pagination
- `GET /api/v1/data-analytics/admin/users/{userId}` - Get user details
- `POST /api/v1/data-analytics/admin/users` - Create new user
- `PUT /api/v1/data-analytics/admin/users/{userId}` - Update user
- `DELETE /api/v1/data-analytics/admin/users/{userId}` - Deactivate user

#### Report Management APIs
- `GET /api/v1/data-analytics/reports` - List reports with filters
- `GET /api/v1/data-analytics/reports/{reportId}` - Get report details
- `POST /api/v1/data-analytics/reports/generate` - Generate new report
- `GET /api/v1/data-analytics/reports/templates` - List report templates
- `POST /api/v1/data-analytics/reports/templates` - Create report template

#### Performance Data APIs
- `GET /api/v1/data-analytics/performance/employee/{employeeId}` - Get employee performance data
- `GET /api/v1/data-analytics/performance/team/{supervisorId}` - Get team performance data
- `GET /api/v1/data-analytics/performance/organization` - Get organization performance data

### Application Services Design
```
src/main/java/com/company/dataanalytics/
├── application/
│   ├── services/
│   │   ├── UserApplicationService.java
│   │   ├── ReportApplicationService.java
│   │   └── PerformanceDataApplicationService.java
│   ├── handlers/
│   │   ├── UserEventHandler.java
│   │   └── ReportEventHandler.java
│   └── mappers/
│       ├── UserMapper.java
│       ├── ReportMapper.java
│       └── PerformanceDataMapper.java
```

## Domain Layer Design

### Domain Model Implementation
```
src/main/java/com/company/dataanalytics/
├── domain/
│   ├── aggregates/
│   │   ├── user/
│   │   │   ├── UserAccount.java (Aggregate Root)
│   │   │   ├── Role.java
│   │   │   ├── Permission.java
│   │   │   └── ActivityLog.java
│   │   ├── report/
│   │   │   ├── Report.java (Aggregate Root)
│   │   │   └── ReportTemplate.java
│   │   └── performance/
│   │       └── PerformanceData.java (Aggregate Root)
│   ├── valueobjects/
│   │   ├── UserId.java
│   │   ├── Email.java
│   │   ├── RoleName.java
│   │   ├── PermissionLevel.java
│   │   ├── AccountStatus.java
│   │   ├── LastLoginTime.java
│   │   ├── ReportId.java
│   │   ├── TemplateId.java
│   │   ├── ReportFormat.java
│   │   ├── GenerationStatus.java
│   │   ├── EmployeeId.java
│   │   ├── KPIId.java
│   │   ├── MetricValue.java
│   │   └── DataTimestamp.java
│   ├── events/
│   │   ├── UserAccountCreated.java
│   │   ├── UserRoleChanged.java
│   │   ├── UserAccountDeactivated.java
│   │   ├── ReportGenerated.java
│   │   ├── ReportGenerationFailed.java
│   │   └── ReportTemplateCreated.java
│   ├── services/
│   │   ├── ReportGenerationService.java
│   │   └── UserAdministrationService.java
│   └── repositories/
│       ├── IUserAccountRepository.java
│       ├── IReportRepository.java
│       └── IPerformanceDataRepository.java
```

### Domain Services Implementation

#### Report Generation Service
- **Purpose**: Handle complex report generation logic
- **Responsibilities**:
  - Validate report parameters and templates
  - Coordinate data aggregation from multiple sources
  - Handle report format conversion (PDF, CSV)
  - Manage report file storage and access

#### User Administration Service
- **Purpose**: Handle complex user management operations
- **Responsibilities**:
  - Validate user creation and updates
  - Manage role assignments and permissions
  - Handle user authentication and authorization
  - Coordinate user activity logging

## Data Architecture Design

### Database Schema Design

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    account_status VARCHAR(20) NOT NULL,
    created_date TIMESTAMP NOT NULL,
    last_login_time TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    updated_date TIMESTAMP
);
```

#### Roles Table
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true
);
```

#### Permissions Table
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL
);
```

#### User Role Assignments Table
```sql
CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_date TIMESTAMP NOT NULL,
    assigned_by UUID,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);
```

#### Activity Logs Table
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id UUID,
    timestamp TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_timestamp (user_id, timestamp),
    INDEX idx_action_timestamp (action, timestamp)
);
```

#### Reports Table
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    template_id UUID,
    report_name VARCHAR(255) NOT NULL,
    report_format VARCHAR(10) NOT NULL,
    generation_status VARCHAR(20) NOT NULL,
    file_path VARCHAR(500),
    generated_by UUID NOT NULL,
    generation_timestamp TIMESTAMP NOT NULL,
    parameters JSONB,
    FOREIGN KEY (generated_by) REFERENCES users(id)
);
```

#### Report Templates Table
```sql
CREATE TABLE report_templates (
    id UUID PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    configuration JSONB NOT NULL,
    created_by UUID NOT NULL,
    created_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Performance Data Table
```sql
CREATE TABLE performance_data (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    kpi_id UUID NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    data_timestamp TIMESTAMP NOT NULL,
    created_date TIMESTAMP NOT NULL,
    INDEX idx_employee_date (employee_id, data_timestamp),
    INDEX idx_kpi_date (kpi_id, data_timestamp)
);
```

### Repository Implementation Design
```
src/main/java/com/company/dataanalytics/
├── infrastructure/
│   ├── repositories/
│   │   ├── UserAccountRepositoryImpl.java
│   │   ├── ReportRepositoryImpl.java
│   │   └── PerformanceDataRepositoryImpl.java
│   ├── entities/
│   │   ├── UserEntity.java
│   │   ├── RoleEntity.java
│   │   ├── PermissionEntity.java
│   │   ├── ActivityLogEntity.java
│   │   ├── ReportEntity.java
│   │   ├── ReportTemplateEntity.java
│   │   └── PerformanceDataEntity.java
│   └── mappers/
│       ├── UserEntityMapper.java
│       ├── RoleEntityMapper.java
│       ├── ReportEntityMapper.java
│       ├── ReportTemplateEntityMapper.java
│       └── PerformanceDataEntityMapper.java
```

### Caching Strategy
- **User Data**: Cache user profiles and permissions (TTL: 30 minutes)
- **Report Templates**: Cache active templates (TTL: 1 hour)
- **Performance Data**: Cache frequently accessed metrics (TTL: 15 minutes)

## Integration Architecture Design

### Internal Service Integration

#### KPI Management Service Integration
- **Purpose**: Retrieve KPI definitions and assignments for reporting
- **Pattern**: HTTP REST client with circuit breaker
- **Endpoints Used**:
  - `GET /api/v1/kpi-management/kpis` - Get KPI definitions
  - `GET /api/v1/kpi-management/assignments/employee/{employeeId}` - Get employee KPIs

#### Performance Management Service Integration
- **Purpose**: Retrieve performance data for analytics and reporting
- **Pattern**: HTTP REST client with retry logic
- **Endpoints Used**:
  - `GET /api/v1/performance-management/feedback/employee/{employeeId}` - Get feedback data
  - `GET /api/v1/performance-management/assessments/employee/{employeeId}` - Get assessment data

### External Service Integration

#### Authentication Service
- **Purpose**: User authentication and JWT token validation
- **Pattern**: JWT token validation filter
- **Implementation**: Spring Security with JWT

#### File Storage Service (AWS S3)
- **Purpose**: Store generated report files
- **Pattern**: AWS SDK integration
- **Configuration**: S3 bucket with appropriate IAM policies

### Event Publishing Design
```
src/main/java/com/company/dataanalytics/
├── infrastructure/
│   ├── events/
│   │   ├── EventPublisher.java
│   │   ├── SQSEventPublisher.java
│   │   └── EventSerializer.java
│   └── messaging/
│       ├── SQSConfiguration.java
│       └── MessageHandler.java
```

## ECS Fargate Container Design

### Container Configuration

#### Dockerfile Design
```dockerfile
FROM openjdk:17-jre-slim

# Application setup
WORKDIR /app
COPY target/data-analytics-service.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run application
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Task Definition
- **CPU**: 512 CPU units (0.5 vCPU)
- **Memory**: 1024 MB (1 GB)
- **Network Mode**: awsvpc
- **Launch Type**: FARGATE

#### Service Configuration
- **Desired Count**: 2 tasks (for basic redundancy)
- **Auto Scaling**: Target 70% CPU utilization
- **Health Check**: Spring Boot Actuator health endpoint
- **Load Balancer**: Application Load Balancer with health checks

### Networking Design
- **VPC**: Private subnets for ECS tasks
- **Security Groups**: 
  - Inbound: Port 8080 from ALB only
  - Outbound: HTTPS (443) for external APIs, PostgreSQL (5432), Redis (6379)
- **Service Discovery**: AWS Cloud Map for internal service communication

## Monitoring and Observability Design

### Logging Strategy
- **Framework**: SLF4J with Logback
- **Format**: Structured JSON logging
- **Destination**: AWS CloudWatch Logs
- **Log Levels**: INFO for business events, DEBUG for troubleshooting

#### Log Structure Example
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "data-analytics-service",
  "traceId": "abc123",
  "userId": "user-456",
  "event": "ReportGenerated",
  "reportId": "report-789",
  "duration": 2500
}
```

### Metrics Collection
- **Framework**: Spring Boot Actuator with Micrometer
- **Destination**: AWS CloudWatch Metrics
- **Key Metrics**:
  - API response times and error rates
  - Report generation success/failure rates
  - Database connection pool metrics
  - JVM memory and CPU usage

### Health Checks
- **Endpoint**: `/actuator/health`
- **Checks**: Database connectivity, Redis connectivity, disk space
- **Load Balancer**: Health check every 30 seconds
- **ECS**: Container health check every 30 seconds

### Alerting
- **Platform**: AWS CloudWatch Alarms
- **Key Alerts**:
  - API error rate > 5%
  - Report generation failure rate > 10%
  - Database connection failures
  - High memory usage (>80%)

## Security Architecture Design

### Authentication and Authorization
- **Authentication**: JWT token validation
- **Authorization**: Role-based access control (RBAC)
- **Roles**: Admin, HR, Supervisor, Employee
- **Implementation**: Spring Security with custom filters

#### Security Filter Chain
```
JWT Authentication Filter → Role Authorization Filter → API Controllers
```

### API Security
- **Rate Limiting**: 100 requests per minute per user
- **Input Validation**: Bean Validation (JSR-303) annotations
- **SQL Injection Prevention**: Parameterized queries with JPA
- **XSS Prevention**: Input sanitization and output encoding

### Data Security
- **Encryption at Rest**: AWS RDS encryption
- **Encryption in Transit**: TLS 1.3 for all communications
- **Sensitive Data**: Mask PII in logs and responses
- **Database Access**: Connection pooling with encrypted connections

### Audit Logging
- **Events**: User creation, role changes, report generation
- **Format**: Structured audit logs with user context
- **Storage**: Separate audit log table with retention policy
- **Compliance**: Basic audit trail for security reviews

## Background Processing Design

### Report Generation Processing
- **Pattern**: Asynchronous processing with SQS
- **Flow**: API request → SQS message → Background processor → File storage
- **Retry Logic**: Exponential backoff with dead letter queue
- **Status Tracking**: Database status updates with polling endpoint

#### Report Generation Flow
```
1. User requests report → API validates request
2. API creates report record with "PENDING" status
3. API publishes message to SQS queue
4. Background processor picks up message
5. Processor generates report and uploads to S3
6. Processor updates report status to "COMPLETED"
7. User polls for completion or receives notification
```

### Scheduled Tasks
- **Framework**: Spring Boot @Scheduled annotations
- **Tasks**: 
  - Cleanup old report files (daily)
  - Update performance data cache (hourly)
  - Generate system health reports (weekly)

## Configuration and Administration Design

### Configuration Management
- **External Configuration**: AWS Systems Manager Parameter Store
- **Environment Variables**: Container environment variables
- **Profiles**: Spring profiles for different environments (dev, staging, prod)

#### Key Configuration Parameters
- Database connection settings
- Redis connection settings
- AWS S3 bucket configuration
- JWT secret keys
- Rate limiting parameters

### System Administration
- **Admin APIs**: User management, system configuration
- **Monitoring Dashboard**: Basic health and metrics view
- **Log Access**: CloudWatch Logs console access
- **Database Administration**: RDS console access with proper IAM roles

### Deployment Strategy
- **CI/CD Pipeline**: GitHub Actions or AWS CodePipeline
- **Blue-Green Deployment**: ECS service updates with health checks
- **Rollback Strategy**: Previous task definition rollback
- **Environment Promotion**: Automated testing and promotion pipeline

## Implementation Guidance

### Development Team Structure
- **Backend Developer**: Spring Boot application development
- **DevOps Engineer**: Container and AWS infrastructure setup
- **QA Engineer**: API testing and integration testing

### Development Phases (One-Day Workshop)

#### Phase 1: Core Setup (2 hours)
- Spring Boot project setup with dependencies
- Basic domain model implementation
- Database schema creation
- Docker container setup

#### Phase 2: API Implementation (3 hours)
- User management APIs
- Basic report generation APIs
- Performance data display APIs
- Input validation and error handling

#### Phase 3: Integration (2 hours)
- Database integration with JPA
- Basic caching with Redis
- File storage with S3
- JWT authentication setup

#### Phase 4: Testing and Deployment (1 hour)
- Basic unit tests
- Integration testing
- Container deployment to ECS
- Basic monitoring setup

### Coding Standards
- **Java**: Google Java Style Guide
- **REST APIs**: RESTful design principles
- **Database**: Consistent naming conventions
- **Error Handling**: Standardized error response format
- **Documentation**: OpenAPI/Swagger documentation

### Testing Strategy
- **Unit Tests**: Domain logic and service layer testing
- **Integration Tests**: API endpoint testing with TestContainers
- **Contract Tests**: API contract validation
- **Performance Tests**: Basic load testing for key endpoints

## Risk Mitigation

### Technical Risks
- **Database Performance**: Connection pooling and query optimization
- **Memory Usage**: JVM tuning and memory monitoring
- **External Dependencies**: Circuit breakers and retry logic
- **Container Failures**: Health checks and auto-scaling

### Operational Risks
- **Data Loss**: Regular database backups
- **Security Breaches**: Input validation and audit logging
- **Service Downtime**: Multi-AZ deployment and health checks
- **Scalability Issues**: Auto-scaling policies and performance monitoring

## Success Criteria

### Functional Requirements
- ✅ User management with role-based access control
- ✅ Basic report generation with PDF and CSV formats
- ✅ Performance data display and filtering
- ✅ Integration with other services via REST APIs

### Non-Functional Requirements
- ✅ API response times under 500ms
- ✅ Support for 50-100 concurrent users
- ✅ Handle 100,000 performance data points per day
- ✅ Basic security with authentication and authorization

### Workshop Deliverables
- ✅ Working Spring Boot application
- ✅ Containerized deployment on ECS Fargate
- ✅ Basic monitoring and logging
- ✅ API documentation and testing
- ✅ Simple CI/CD pipeline setup

---

**Logical Design Status**: ✅ COMPLETED FOR ONE-DAY WORKSHOP
**Scope**: Essential features with simplified architecture suitable for workshop timeframe
**Technology Stack**: Java/Spring Boot, PostgreSQL, Redis, AWS ECS Fargate
**Next Steps**: Ready for implementation and hands-on development workshop