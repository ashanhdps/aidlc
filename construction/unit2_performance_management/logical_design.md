# Logical Design for Unit 2: Performance Management Service (Workshop Version)

## Document Information
- **Version**: 1.0
- **Scope**: Workshop Version (4 User Stories: US-016, US-017, US-019, US-020)
- **Focus**: Core performance review and feedback features
- **Implementation Timeline**: 1-day workshop (8 hours)

## Overview
This document provides a comprehensive logical design for the Performance Management Service, translating the Domain Driven Design (DDD) domain model into a scalable, event-driven software architecture. The design focuses on the workshop version covering essential performance review and feedback capabilities that can be implemented in a single day.

## Technology Stack
- **Programming Language**: Java 17+ with Spring Boot 3.x
- **Database**: AWS DynamoDB (NoSQL)
- **Event Store**: Apache Kafka
- **Caching**: Redis
- **Monitoring**: Prometheus + Grafana
- **Container Platform**: Docker + Kubernetes (ECS Fargate deployment)
- **Cloud Platform**: AWS
- **API Style**: REST only

## Workshop Scope Summary

### Included Features
- ✅ Review Cycle Management (fixed template)
- ✅ Self-Assessment Submission (US-016)
- ✅ Manager Assessment & Scoring (US-017)
- ✅ KPI-Specific Feedback Provision (US-019)
- ✅ Feedback Reception & Response (US-020)
- ✅ Performance Score Calculation
- ✅ Integration with KPI Management Service

### Excluded Features (Future Enhancements)
- ❌ Configurable Review Templates (US-014, US-015)
- ❌ Calibration Tools (US-018)
- ❌ Recognition System (US-021, US-022)
- ❌ Coaching Resources (US-023, US-024, US-025, US-026)
- ❌ Slack/Teams Integration
- ❌ Advanced reporting and analytics

## System Architecture

### Hexagonal Architecture Layers


#### 1. Domain Layer (Core)
**Purpose**: Contains pure business logic and domain model

**Components**:
- **Aggregates**: ReviewCycle, FeedbackRecord
- **Entities**: ReviewParticipant, SelfAssessment, ManagerAssessment, FeedbackResponse
- **Value Objects**: AssessmentScore, FeedbackContext
- **Domain Services**: PerformanceScoreCalculationService
- **Domain Events**: SelfAssessmentSubmitted, ManagerAssessmentSubmitted, ReviewCycleCompleted, FeedbackProvided, FeedbackResponseProvided
- **Repository Interfaces**: IReviewCycleRepository, IFeedbackRecordRepository

**Dependencies**: None (dependency-free core)

**Package Structure**:
```
com.company.performance.domain
├── aggregate
│   ├── reviewcycle
│   │   ├── ReviewCycle.java (Aggregate Root)
│   │   ├── ReviewParticipant.java (Entity)
│   │   ├── SelfAssessment.java (Entity)
│   │   ├── ManagerAssessment.java (Entity)
│   │   └── AssessmentScore.java (Value Object)
│   └── feedback
│       ├── FeedbackRecord.java (Aggregate Root)
│       ├── FeedbackResponse.java (Entity)
│       └── FeedbackContext.java (Value Object)
├── service
│   └── PerformanceScoreCalculationService.java
├── event
│   ├── SelfAssessmentSubmitted.java
│   ├── ManagerAssessmentSubmitted.java
│   ├── ReviewCycleCompleted.java
│   ├── FeedbackProvided.java
│   └── FeedbackResponseProvided.java
├── repository
│   ├── IReviewCycleRepository.java
│   └── IFeedbackRecordRepository.java
└── exception
    ├── DomainException.java
    ├── InvalidAssessmentException.java
    └── FeedbackNotFoundException.java
```

#### 2. Application Layer
**Purpose**: Orchestrates domain operations and use cases

**Components**:
- **Application Services**: ReviewCycleApplicationService, FeedbackApplicationService
- **Command Handlers**: SubmitSelfAssessmentCommand, SubmitManagerAssessmentCommand, ProvideFeedbackCommand
- **Query Handlers**: GetReviewCycleQuery, GetFeedbackQuery
- **DTOs**: Request/Response objects for API communication
- **Mappers**: Domain to DTO conversion
- **Integration Services**: KPIManagementIntegrationService (ACL)

**Dependencies**: Domain Layer only

**Package Structure**:
```
com.company.performance.application
├── service
│   ├── ReviewCycleApplicationService.java
│   └── FeedbackApplicationService.java
├── command
│   ├── SubmitSelfAssessmentCommand.java
│   ├── SubmitManagerAssessmentCommand.java
│   ├── ProvideFeedbackCommand.java
│   └── RespondToFeedbackCommand.java
├── query
│   ├── GetReviewCycleQuery.java
│   ├── GetParticipantAssessmentQuery.java
│   └── GetFeedbackQuery.java
├── dto
│   ├── request
│   │   ├── CreateReviewCycleRequest.java
│   │   ├── SubmitSelfAssessmentRequest.java
│   │   ├── SubmitManagerAssessmentRequest.java
│   │   └── ProvideFeedbackRequest.java
│   └── response
│       ├── ReviewCycleResponse.java
│       ├── AssessmentResponse.java
│       └── FeedbackResponse.java
├── mapper
│   ├── ReviewCycleMapper.java
│   └── FeedbackMapper.java
└── integration
    ├── KPIManagementIntegrationService.java
    └── dto
        ├── KPIAssignmentDTO.java
        └── KPIPerformanceDataDTO.java
```


#### 3. Infrastructure Layer
**Purpose**: Implements technical concerns and external integrations

**Components**:
- **Repository Implementations**: DynamoDB repositories with AWS SDK
- **Database Entities**: DynamoDB entity mappings with annotations
- **Event Publishers**: Kafka producers for domain events
- **Event Consumers**: Kafka consumers for external events
- **External Service Clients**: REST clients for KPI Management Service
- **Configuration**: DynamoDB, Kafka, Redis, Security configurations
- **Table Definitions**: DynamoDB table schemas and GSI configurations

**Dependencies**: Domain and Application Layers

**Package Structure**:
```
com.company.performance.infrastructure
├── persistence
│   ├── repository
│   │   ├── ReviewCycleRepositoryImpl.java
│   │   └── FeedbackRecordRepositoryImpl.java
│   ├── entity
│   │   ├── ReviewCycleEntity.java
│   │   ├── ReviewParticipantEntity.java
│   │   ├── SelfAssessmentEntity.java
│   │   ├── ManagerAssessmentEntity.java
│   │   ├── AssessmentScoreEntity.java
│   │   ├── FeedbackRecordEntity.java
│   │   └── FeedbackResponseEntity.java
│   └── dynamodb
│       ├── DynamoDBConfig.java
│       ├── DynamoDBMapper.java
│       └── DynamoDBTableInitializer.java
├── messaging
│   ├── kafka
│   │   ├── producer
│   │   │   └── DomainEventPublisher.java
│   │   └── consumer
│   │       └── ExternalEventConsumer.java
│   └── event
│       └── EventSerializer.java
├── client
│   ├── KPIManagementServiceClient.java
│   └── resilience
│       ├── CircuitBreakerConfig.java
│       └── RetryConfig.java
├── cache
│   ├── RedisCacheConfig.java
│   └── CacheService.java
└── config
    ├── DatabaseConfig.java
    ├── KafkaConfig.java
    ├── SecurityConfig.java
    └── MonitoringConfig.java
```

#### 4. Presentation Layer (API)
**Purpose**: Exposes REST APIs and handles HTTP concerns

**Components**:
- **REST Controllers**: Endpoint handlers
- **Request/Response DTOs**: API contracts
- **Exception Handlers**: Global error handling
- **Security Filters**: JWT authentication and authorization
- **API Documentation**: OpenAPI/Swagger specifications
- **Validation**: Request validation and sanitization

**Dependencies**: Application Layer

**Package Structure**:
```
com.company.performance.api
├── controller
│   ├── ReviewCycleController.java
│   └── FeedbackController.java
├── dto
│   ├── request
│   │   └── (shared with application layer)
│   └── response
│       └── (shared with application layer)
├── exception
│   ├── GlobalExceptionHandler.java
│   └── ApiError.java
├── security
│   ├── JwtAuthenticationFilter.java
│   └── AuthorizationService.java
├── validation
│   ├── RequestValidator.java
│   └── ValidationGroups.java
└── config
    ├── OpenApiConfig.java
    └── WebMvcConfig.java
```


## Event-Driven Architecture Design

### Apache Kafka Integration

#### Kafka Topics Structure
**Domain Events Topic**:
- **Topic Name**: `performance-management.domain-events`
- **Partitions**: 3 (for parallel processing)
- **Replication Factor**: 3 (for high availability)
- **Retention**: 7 days
- **Purpose**: All domain events from ReviewCycle and FeedbackRecord aggregates

**Integration Events Topic**:
- **Topic Name**: `performance-management.integration-events`
- **Partitions**: 3
- **Replication Factor**: 3
- **Retention**: 30 days
- **Purpose**: Events consumed by Data & Analytics Service and Frontend

**Dead Letter Topic**:
- **Topic Name**: `performance-management.dead-letter`
- **Partitions**: 1
- **Replication Factor**: 3
- **Retention**: 90 days
- **Purpose**: Failed event processing for manual intervention

**Audit Events Topic**:
- **Topic Name**: `performance-management.audit`
- **Partitions**: 1
- **Replication Factor**: 3
- **Retention**: 365 days
- **Purpose**: Audit trail for compliance and security

#### Event Publishing Pattern

**Transactional Outbox Pattern Implementation**:

1. **Outbox Table Schema (DynamoDB)**:
```
Table Name: event_outbox
Partition Key: id (String - UUID)
Sort Key: created_at (Number - Unix timestamp)

Attributes:
- id (String, PK)
- created_at (Number, SK)
- aggregate_type (String)
- aggregate_id (String)
- event_type (String)
- event_payload (Map)
- event_metadata (Map)
- published_at (Number, optional)
- status (String) - PENDING, PUBLISHED, FAILED
- retry_count (Number)
- error_message (String, optional)
- ttl (Number) - For automatic cleanup after 90 days

Global Secondary Index (GSI):
- GSI Name: status-created_at-index
- Partition Key: status (String)
- Sort Key: created_at (Number)
- Projection: ALL
```

2. **Event Publishing Flow**:
   - Domain aggregate generates event
   - Event stored in outbox table within same database transaction
   - Separate publisher process polls outbox table
   - Events published to Kafka topic
   - Outbox record marked as published
   - Ensures exactly-once delivery guarantee

3. **Publisher Configuration**:
   - Polling interval: 100ms
   - Batch size: 50 events
   - Retry strategy: Exponential backoff (max 5 retries)
   - Error handling: Move to dead letter after max retries

#### Event Schema Design

**Base Event Structure**:
```json
{
  "eventId": "UUID",
  "eventType": "string",
  "aggregateId": "UUID",
  "aggregateType": "string",
  "occurredAt": "ISO-8601 timestamp",
  "version": "integer",
  "payload": {
    // Event-specific data
  },
  "metadata": {
    "userId": "UUID",
    "correlationId": "UUID",
    "causationId": "UUID"
  }
}
```

**SelfAssessmentSubmitted Event**:
```json
{
  "eventType": "SelfAssessmentSubmitted",
  "payload": {
    "cycleId": "UUID",
    "participantId": "UUID",
    "employeeId": "UUID",
    "supervisorId": "UUID",
    "submittedDate": "ISO-8601 timestamp",
    "kpiScores": [
      {
        "kpiId": "UUID",
        "ratingValue": "decimal",
        "achievementPercentage": "decimal",
        "comment": "string"
      }
    ],
    "comments": "string",
    "extraMileEfforts": "string"
  }
}
```

**ManagerAssessmentSubmitted Event**:
```json
{
  "eventType": "ManagerAssessmentSubmitted",
  "payload": {
    "cycleId": "UUID",
    "participantId": "UUID",
    "employeeId": "UUID",
    "supervisorId": "UUID",
    "submittedDate": "ISO-8601 timestamp",
    "kpiScores": [
      {
        "kpiId": "UUID",
        "ratingValue": "decimal",
        "achievementPercentage": "decimal",
        "comment": "string"
      }
    ],
    "overallComments": "string",
    "finalScore": "decimal"
  }
}
```


**FeedbackProvided Event**:
```json
{
  "eventType": "FeedbackProvided",
  "payload": {
    "feedbackId": "UUID",
    "giverId": "UUID",
    "receiverId": "UUID",
    "kpiId": "UUID",
    "kpiName": "string",
    "feedbackType": "Positive|Improvement",
    "contentText": "string",
    "createdDate": "ISO-8601 timestamp"
  }
}
```

**FeedbackResponseProvided Event**:
```json
{
  "eventType": "FeedbackResponseProvided",
  "payload": {
    "feedbackId": "UUID",
    "responseId": "UUID",
    "responderId": "UUID",
    "responseText": "string",
    "responseDate": "ISO-8601 timestamp"
  }
}
```

**ReviewCycleCompleted Event**:
```json
{
  "eventType": "ReviewCycleCompleted",
  "payload": {
    "cycleId": "UUID",
    "cycleName": "string",
    "completedDate": "ISO-8601 timestamp",
    "participantCount": "integer",
    "averageScore": "decimal",
    "completionRate": "decimal"
  }
}
```

#### Event Consumer Configuration

**Consumer Groups**:
- `performance-management-internal` - Internal event processing
- `data-analytics-consumer` - Data & Analytics Service consumption
- `notification-consumer` - Notification service consumption

**Consumer Properties**:
- Auto-commit: Disabled (manual commit after processing)
- Isolation level: Read committed
- Max poll records: 100
- Session timeout: 30 seconds
- Heartbeat interval: 10 seconds

#### Event Processing Guarantees

**Idempotency**:
- Event ID stored in processed_events table
- Duplicate detection before processing
- Idempotent event handlers for safe retry

**Ordering**:
- Events for same aggregate use aggregate ID as partition key
- Ensures ordering within same aggregate
- No ordering guarantee across different aggregates

**Error Handling**:
- Transient errors: Retry with exponential backoff
- Permanent errors: Move to dead letter queue
- Monitoring and alerting for failed events


## REST API Architecture Design

### API Design Principles

**RESTful Resource Design**:
- Resource-based URLs following REST conventions
- HTTP verbs for operations (GET, POST, PUT, PATCH)
- Stateless request/response pattern
- HATEOAS links for resource navigation (optional)
- Consistent error handling and status codes

**API Versioning Strategy**:
- URL path versioning: `/api/v1/performance-management/`
- Backward compatibility maintained for at least 2 versions
- Deprecation notices with 6-month migration timeline
- Feature flags for gradual rollout of new versions

### API Structure

#### Base URL Pattern
```
https://api.company.com/api/v1/performance-management/
```

#### Resource Endpoints Design

**Review Cycles Resource** (`/cycles`):

```
GET /cycles
Description: List review cycles with filtering
Query Parameters:
  - status: Active|InProgress|Completed
  - startDate: ISO-8601 date
  - endDate: ISO-8601 date
  - participantId: UUID (optional)
Response: 200 OK
  {
    "cycles": [
      {
        "cycleId": "UUID",
        "cycleName": "string",
        "startDate": "date",
        "endDate": "date",
        "status": "string",
        "participantCount": "integer"
      }
    ],
    "totalCount": "integer",
    "page": "integer",
    "pageSize": "integer"
  }

GET /cycles/{cycleId}
Description: Get specific review cycle details
Response: 200 OK
  {
    "cycleId": "UUID",
    "cycleName": "string",
    "startDate": "date",
    "endDate": "date",
    "status": "string",
    "participants": [
      {
        "participantId": "UUID",
        "employeeId": "UUID",
        "employeeName": "string",
        "supervisorId": "UUID",
        "supervisorName": "string",
        "status": "string",
        "finalScore": "decimal"
      }
    ]
  }

POST /cycles
Description: Create new review cycle
Request Body:
  {
    "cycleName": "string",
    "startDate": "date",
    "endDate": "date",
    "participants": [
      {
        "employeeId": "UUID",
        "supervisorId": "UUID"
      }
    ]
  }
Response: 201 Created
  {
    "cycleId": "UUID",
    "cycleName": "string",
    "status": "Active",
    "createdAt": "timestamp"
  }

PUT /cycles/{cycleId}/complete
Description: Complete review cycle
Response: 200 OK
  {
    "cycleId": "UUID",
    "status": "Completed",
    "completedAt": "timestamp",
    "averageScore": "decimal"
  }
```

**Self-Assessment Resource** (`/cycles/{cycleId}/participants/{participantId}/self-assessment`):

```
POST /cycles/{cycleId}/participants/{participantId}/self-assessment
Description: Submit self-assessment (US-016)
Request Body:
  {
    "kpiScores": [
      {
        "kpiId": "UUID",
        "ratingValue": "decimal (1-5)",
        "achievementPercentage": "decimal (0-100)",
        "comment": "string"
      }
    ],
    "comments": "string",
    "extraMileEfforts": "string"
  }
Response: 201 Created
  {
    "assessmentId": "UUID",
    "participantId": "UUID",
    "submittedDate": "timestamp",
    "status": "SelfAssessmentSubmitted"
  }

GET /cycles/{cycleId}/participants/{participantId}/self-assessment
Description: Get self-assessment details
Response: 200 OK
  {
    "assessmentId": "UUID",
    "participantId": "UUID",
    "employeeId": "UUID",
    "submittedDate": "timestamp",
    "kpiScores": [...],
    "comments": "string",
    "extraMileEfforts": "string"
  }
```


**Manager Assessment Resource** (`/cycles/{cycleId}/participants/{participantId}/manager-assessment`):

```
POST /cycles/{cycleId}/participants/{participantId}/manager-assessment
Description: Submit manager assessment (US-017)
Request Body:
  {
    "kpiScores": [
      {
        "kpiId": "UUID",
        "ratingValue": "decimal (1-5)",
        "achievementPercentage": "decimal (0-100)",
        "comment": "string"
      }
    ],
    "overallComments": "string"
  }
Response: 201 Created
  {
    "assessmentId": "UUID",
    "participantId": "UUID",
    "submittedDate": "timestamp",
    "finalScore": "decimal",
    "status": "ManagerAssessmentSubmitted"
  }

GET /cycles/{cycleId}/participants/{participantId}/manager-assessment
Description: Get manager assessment details
Response: 200 OK
  {
    "assessmentId": "UUID",
    "participantId": "UUID",
    "supervisorId": "UUID",
    "submittedDate": "timestamp",
    "kpiScores": [...],
    "overallComments": "string",
    "finalScore": "decimal"
  }

GET /cycles/{cycleId}/participants/{participantId}/comparison
Description: Compare self vs manager assessment
Response: 200 OK
  {
    "participantId": "UUID",
    "employeeId": "UUID",
    "supervisorId": "UUID",
    "selfAssessment": {...},
    "managerAssessment": {...},
    "discrepancies": [
      {
        "kpiId": "UUID",
        "kpiName": "string",
        "selfRating": "decimal",
        "managerRating": "decimal",
        "difference": "decimal"
      }
    ]
  }
```

**Feedback Resource** (`/feedback`):

```
POST /feedback
Description: Provide KPI-specific feedback (US-019)
Request Body:
  {
    "receiverId": "UUID",
    "kpiId": "UUID",
    "feedbackType": "Positive|Improvement",
    "contentText": "string"
  }
Response: 201 Created
  {
    "feedbackId": "UUID",
    "giverId": "UUID",
    "receiverId": "UUID",
    "createdDate": "timestamp",
    "status": "Created"
  }

GET /feedback/employee/{employeeId}
Description: Get feedback for employee (US-020)
Query Parameters:
  - startDate: ISO-8601 date
  - endDate: ISO-8601 date
  - feedbackType: Positive|Improvement
  - kpiId: UUID (optional)
  - status: Created|Acknowledged|Responded|Resolved
Response: 200 OK
  {
    "feedback": [
      {
        "feedbackId": "UUID",
        "giverId": "UUID",
        "giverName": "string",
        "receiverId": "UUID",
        "kpiId": "UUID",
        "kpiName": "string",
        "feedbackType": "string",
        "contentText": "string",
        "createdDate": "timestamp",
        "status": "string",
        "responses": [...]
      }
    ],
    "totalCount": "integer"
  }

GET /feedback/{feedbackId}
Description: Get specific feedback details
Response: 200 OK
  {
    "feedbackId": "UUID",
    "giverId": "UUID",
    "giverName": "string",
    "receiverId": "UUID",
    "receiverName": "string",
    "kpiId": "UUID",
    "kpiName": "string",
    "feedbackType": "string",
    "contentText": "string",
    "createdDate": "timestamp",
    "status": "string",
    "responses": [
      {
        "responseId": "UUID",
        "responderId": "UUID",
        "responderName": "string",
        "responseText": "string",
        "responseDate": "timestamp"
      }
    ]
  }

PUT /feedback/{feedbackId}/acknowledge
Description: Acknowledge feedback receipt
Response: 200 OK
  {
    "feedbackId": "UUID",
    "status": "Acknowledged",
    "acknowledgedAt": "timestamp"
  }

POST /feedback/{feedbackId}/responses
Description: Respond to feedback
Request Body:
  {
    "responseText": "string"
  }
Response: 201 Created
  {
    "responseId": "UUID",
    "feedbackId": "UUID",
    "responderId": "UUID",
    "responseDate": "timestamp"
  }

PUT /feedback/{feedbackId}/resolve
Description: Mark feedback as resolved
Response: 200 OK
  {
    "feedbackId": "UUID",
    "status": "Resolved",
    "resolvedAt": "timestamp"
  }
```


### API Security Design

#### Authentication & Authorization

**JWT Token-Based Authentication**:
- OAuth 2.0 / OpenID Connect integration with corporate identity provider
- JWT tokens with appropriate claims (userId, roles, scopes)
- Token expiration: 1 hour (access token), 7 days (refresh token)
- Token refresh mechanism for long-lived sessions
- Secure token storage and transmission (HTTPS only)

**JWT Token Structure**:
```json
{
  "sub": "user-uuid",
  "name": "John Doe",
  "email": "john.doe@company.com",
  "roles": ["EMPLOYEE", "SUPERVISOR"],
  "scopes": ["performance:read", "performance:write"],
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Authorization Levels**:
- `performance:read` - Read review cycles and feedback
- `performance:write:self` - Submit self-assessments
- `performance:write:manager` - Submit manager assessments
- `performance:feedback:give` - Provide feedback to others
- `performance:feedback:respond` - Respond to received feedback
- `performance:admin` - Full administrative access (create cycles, etc.)

**Role-Based Access Control (RBAC)**:
- **EMPLOYEE**: Can submit self-assessments, view own feedback, respond to feedback
- **SUPERVISOR**: Can submit manager assessments for direct reports, provide feedback
- **HR**: Can create review cycles, view all assessments, manage participants
- **ADMIN**: Full system access for configuration and administration

**Endpoint Authorization Matrix**:
```
POST /cycles                                    → HR, ADMIN
GET /cycles                                     → ALL (filtered by role)
POST /self-assessment                           → EMPLOYEE (own only)
POST /manager-assessment                        → SUPERVISOR (direct reports only)
POST /feedback                                  → SUPERVISOR, EMPLOYEE
GET /feedback/employee/{employeeId}             → EMPLOYEE (own), SUPERVISOR (reports), HR, ADMIN
POST /feedback/{feedbackId}/responses           → EMPLOYEE (receiver only)
```

#### API Rate Limiting & Throttling

**Rate Limiting Strategy**:
- **Per Service**: 1000 requests per minute
- **Per User**: 100 requests per minute
- **Per Endpoint**: Specific limits for resource-intensive operations
  - POST /cycles: 10 per hour (HR only)
  - POST /self-assessment: 50 per day per employee
  - POST /manager-assessment: 100 per day per supervisor
  - POST /feedback: 50 per day per user

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

**Rate Limit Exceeded Response**:
```
HTTP 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 60
  }
}
```

#### Security Headers & CORS

**Security Headers**:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

**CORS Configuration**:
- Allowed Origins: Frontend application domains (configured per environment)
- Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed Headers: Authorization, Content-Type, X-Request-ID
- Exposed Headers: X-RateLimit-*, X-Request-ID
- Max Age: 3600 seconds
- Credentials: Allowed

### API Error Handling

**Standard Error Response Format**:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error context",
    "timestamp": "ISO-8601 timestamp",
    "requestId": "UUID",
    "path": "/api/v1/performance-management/cycles"
  }
}
```

**HTTP Status Codes**:
- `200 OK` - Successful GET, PUT, PATCH requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Invalid request data or validation errors
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Business rule violation (e.g., self-assessment already submitted)
- `422 Unprocessable Entity` - Semantic validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Unexpected server errors
- `503 Service Unavailable` - Service temporarily unavailable

**Error Codes**:
- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_REQUIRED` - Authentication token missing
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `BUSINESS_RULE_VIOLATION` - Domain business rule violated
- `SELF_ASSESSMENT_ALREADY_SUBMITTED` - Cannot resubmit self-assessment
- `MANAGER_ASSESSMENT_REQUIRES_SELF` - Self-assessment must be submitted first
- `INVALID_FEEDBACK_RECEIVER` - Cannot provide feedback to specified user
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Unexpected error occurred


## Domain Layer Implementation Design

### Aggregate Implementation Patterns

#### ReviewCycle Aggregate

**Aggregate Root: ReviewCycle**

**Responsibilities**:
- Manage review cycle lifecycle (Active → InProgress → Completed)
- Coordinate participant assessments
- Enforce business rules (self-assessment before manager assessment)
- Calculate final scores
- Publish domain events

**Key Behaviors**:
```java
public class ReviewCycle {
    // Aggregate Root Identity
    private ReviewCycleId id;
    
    // Attributes
    private String cycleName;
    private LocalDate startDate;
    private LocalDate endDate;
    private ReviewCycleStatus status;
    private List<ReviewParticipant> participants;
    
    // Domain Events
    private List<DomainEvent> domainEvents;
    
    // Business Methods
    public void submitSelfAssessment(
        ParticipantId participantId,
        List<AssessmentScore> kpiScores,
        String comments,
        String extraMileEfforts
    ) {
        // Validate cycle is active
        // Find participant
        // Create self-assessment
        // Update participant status
        // Raise SelfAssessmentSubmitted event
    }
    
    public void submitManagerAssessment(
        ParticipantId participantId,
        List<AssessmentScore> kpiScores,
        String overallComments,
        PerformanceScoreCalculationService scoreService
    ) {
        // Validate self-assessment exists
        // Create manager assessment
        // Calculate final score using domain service
        // Update participant status
        // Raise ManagerAssessmentSubmitted event
    }
    
    public void complete() {
        // Validate all participants completed
        // Calculate average score
        // Update status to Completed
        // Raise ReviewCycleCompleted event
    }
    
    // Invariant Enforcement
    private void ensureSelfAssessmentSubmitted(ReviewParticipant participant) {
        if (!participant.hasSelfAssessment()) {
            throw new InvalidAssessmentException(
                "Self-assessment must be submitted before manager assessment"
            );
        }
    }
}
```

**Entity: ReviewParticipant**

**Responsibilities**:
- Track participant status in review cycle
- Hold self and manager assessments
- Maintain final score

**Key Attributes**:
```java
public class ReviewParticipant {
    private ParticipantId id;
    private EmployeeId employeeId;
    private SupervisorId supervisorId;
    private ParticipantStatus status;
    private SelfAssessment selfAssessment;
    private ManagerAssessment managerAssessment;
    private BigDecimal finalScore;
    
    public boolean hasSelfAssessment() {
        return selfAssessment != null;
    }
    
    public boolean hasManagerAssessment() {
        return managerAssessment != null;
    }
    
    public void setSelfAssessment(SelfAssessment assessment) {
        this.selfAssessment = assessment;
        this.status = ParticipantStatus.SELF_ASSESSMENT_SUBMITTED;
    }
    
    public void setManagerAssessment(ManagerAssessment assessment, BigDecimal score) {
        this.managerAssessment = assessment;
        this.finalScore = score;
        this.status = ParticipantStatus.MANAGER_ASSESSMENT_SUBMITTED;
    }
}
```

**Entity: SelfAssessment**

**Responsibilities**:
- Store employee's self-assessment data
- Maintain KPI scores and comments

**Key Attributes**:
```java
public class SelfAssessment {
    private AssessmentId id;
    private Instant submittedDate;
    private String comments;
    private String extraMileEfforts;
    private List<AssessmentScore> kpiScores;
    
    // Constructor enforces creation rules
    public SelfAssessment(
        List<AssessmentScore> kpiScores,
        String comments,
        String extraMileEfforts
    ) {
        validateKpiScores(kpiScores);
        this.id = AssessmentId.generate();
        this.submittedDate = Instant.now();
        this.kpiScores = new ArrayList<>(kpiScores);
        this.comments = comments;
        this.extraMileEfforts = extraMileEfforts;
    }
    
    private void validateKpiScores(List<AssessmentScore> scores) {
        if (scores == null || scores.isEmpty()) {
            throw new InvalidAssessmentException("At least one KPI score required");
        }
    }
}
```

**Entity: ManagerAssessment**

**Responsibilities**:
- Store manager's assessment data
- Maintain KPI scores and overall comments

**Key Attributes**:
```java
public class ManagerAssessment {
    private AssessmentId id;
    private Instant submittedDate;
    private String overallComments;
    private List<AssessmentScore> kpiScores;
    
    public ManagerAssessment(
        List<AssessmentScore> kpiScores,
        String overallComments
    ) {
        validateKpiScores(kpiScores);
        this.id = AssessmentId.generate();
        this.submittedDate = Instant.now();
        this.kpiScores = new ArrayList<>(kpiScores);
        this.overallComments = overallComments;
    }
    
    private void validateKpiScores(List<AssessmentScore> scores) {
        if (scores == null || scores.isEmpty()) {
            throw new InvalidAssessmentException("At least one KPI score required");
        }
    }
}
```

**Value Object: AssessmentScore**

**Responsibilities**:
- Represent immutable KPI score with rating and achievement
- Enforce valid rating range (1-5)
- Enforce valid achievement percentage (0-100)

**Implementation**:
```java
public class AssessmentScore {
    private final KPIId kpiId;
    private final BigDecimal ratingValue;
    private final BigDecimal achievementPercentage;
    private final String comment;
    
    public AssessmentScore(
        KPIId kpiId,
        BigDecimal ratingValue,
        BigDecimal achievementPercentage,
        String comment
    ) {
        validateRating(ratingValue);
        validateAchievement(achievementPercentage);
        
        this.kpiId = kpiId;
        this.ratingValue = ratingValue;
        this.achievementPercentage = achievementPercentage;
        this.comment = comment;
    }
    
    private void validateRating(BigDecimal rating) {
        if (rating.compareTo(BigDecimal.ONE) < 0 || 
            rating.compareTo(new BigDecimal("5")) > 0) {
            throw new InvalidAssessmentException(
                "Rating must be between 1.0 and 5.0"
            );
        }
    }
    
    private void validateAchievement(BigDecimal achievement) {
        if (achievement.compareTo(BigDecimal.ZERO) < 0 || 
            achievement.compareTo(new BigDecimal("100")) > 0) {
            throw new InvalidAssessmentException(
                "Achievement percentage must be between 0 and 100"
            );
        }
    }
    
    // Value object equality based on all fields
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AssessmentScore)) return false;
        AssessmentScore that = (AssessmentScore) o;
        return Objects.equals(kpiId, that.kpiId) &&
               Objects.equals(ratingValue, that.ratingValue) &&
               Objects.equals(achievementPercentage, that.achievementPercentage) &&
               Objects.equals(comment, that.comment);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(kpiId, ratingValue, achievementPercentage, comment);
    }
}
```


#### FeedbackRecord Aggregate

**Aggregate Root: FeedbackRecord**

**Responsibilities**:
- Manage feedback lifecycle (Created → Acknowledged → Responded → Resolved)
- Coordinate feedback responses
- Enforce business rules (feedback must be linked to KPI)
- Publish domain events

**Key Behaviors**:
```java
public class FeedbackRecord {
    // Aggregate Root Identity
    private FeedbackId id;
    
    // Attributes
    private UserId giverId;
    private UserId receiverId;
    private Instant createdDate;
    private FeedbackStatus status;
    private FeedbackType feedbackType;
    private FeedbackContext context;
    private List<FeedbackResponse> responses;
    
    // Domain Events
    private List<DomainEvent> domainEvents;
    
    // Factory Method
    public static FeedbackRecord create(
        UserId giverId,
        UserId receiverId,
        KPIId kpiId,
        String kpiName,
        FeedbackType feedbackType,
        String contentText
    ) {
        FeedbackRecord feedback = new FeedbackRecord();
        feedback.id = FeedbackId.generate();
        feedback.giverId = giverId;
        feedback.receiverId = receiverId;
        feedback.createdDate = Instant.now();
        feedback.status = FeedbackStatus.CREATED;
        feedback.feedbackType = feedbackType;
        feedback.context = new FeedbackContext(kpiId, kpiName, contentText);
        feedback.responses = new ArrayList<>();
        
        // Raise domain event
        feedback.addDomainEvent(new FeedbackProvided(
            feedback.id,
            giverId,
            receiverId,
            kpiId,
            feedbackType,
            feedback.createdDate
        ));
        
        return feedback;
    }
    
    // Business Methods
    public void acknowledge() {
        if (status != FeedbackStatus.CREATED) {
            throw new InvalidFeedbackOperationException(
                "Feedback can only be acknowledged when in Created status"
            );
        }
        this.status = FeedbackStatus.ACKNOWLEDGED;
    }
    
    public void addResponse(UserId responderId, String responseText) {
        // Validate responder is the receiver
        if (!responderId.equals(receiverId)) {
            throw new InvalidFeedbackOperationException(
                "Only feedback receiver can respond"
            );
        }
        
        FeedbackResponse response = new FeedbackResponse(
            ResponseId.generate(),
            responderId,
            responseText,
            Instant.now()
        );
        
        responses.add(response);
        this.status = FeedbackStatus.RESPONDED;
        
        // Raise domain event
        addDomainEvent(new FeedbackResponseProvided(
            this.id,
            response.getId(),
            responderId,
            response.getResponseDate()
        ));
    }
    
    public void resolve() {
        if (status == FeedbackStatus.RESOLVED) {
            throw new InvalidFeedbackOperationException(
                "Feedback is already resolved"
            );
        }
        this.status = FeedbackStatus.RESOLVED;
    }
    
    // Invariant: Feedback cannot be deleted, only archived
    public boolean canBeDeleted() {
        return false;
    }
}
```

**Entity: FeedbackResponse**

**Responsibilities**:
- Store response to feedback
- Track responder and response date

**Implementation**:
```java
public class FeedbackResponse {
    private ResponseId id;
    private UserId responderId;
    private String responseText;
    private Instant responseDate;
    
    public FeedbackResponse(
        ResponseId id,
        UserId responderId,
        String responseText,
        Instant responseDate
    ) {
        validateResponseText(responseText);
        this.id = id;
        this.responderId = responderId;
        this.responseText = responseText;
        this.responseDate = responseDate;
    }
    
    private void validateResponseText(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new InvalidFeedbackOperationException(
                "Response text cannot be empty"
            );
        }
        if (text.length() > 2000) {
            throw new InvalidFeedbackOperationException(
                "Response text cannot exceed 2000 characters"
            );
        }
    }
}
```

**Value Object: FeedbackContext**

**Responsibilities**:
- Represent immutable feedback context
- Link feedback to specific KPI
- Store feedback content

**Implementation**:
```java
public class FeedbackContext {
    private final KPIId kpiId;
    private final String kpiName;
    private final String contentText;
    
    public FeedbackContext(KPIId kpiId, String kpiName, String contentText) {
        validateKpiId(kpiId);
        validateContentText(contentText);
        
        this.kpiId = kpiId;
        this.kpiName = kpiName;
        this.contentText = contentText;
    }
    
    private void validateKpiId(KPIId kpiId) {
        if (kpiId == null) {
            throw new InvalidFeedbackOperationException(
                "Feedback must be linked to a KPI"
            );
        }
    }
    
    private void validateContentText(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new InvalidFeedbackOperationException(
                "Feedback content cannot be empty"
            );
        }
        if (text.length() > 5000) {
            throw new InvalidFeedbackOperationException(
                "Feedback content cannot exceed 5000 characters"
            );
        }
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FeedbackContext)) return false;
        FeedbackContext that = (FeedbackContext) o;
        return Objects.equals(kpiId, that.kpiId) &&
               Objects.equals(kpiName, that.kpiName) &&
               Objects.equals(contentText, that.contentText);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(kpiId, kpiName, contentText);
    }
}
```

### Domain Service Implementation

#### PerformanceScoreCalculationService

**Purpose**: Calculate final performance scores based on KPI and competency ratings

**Business Rules**:
- Final score = (KPI average × 0.7) + (Competency average × 0.3)
- Round to 2 decimal places
- Score range: 1.0 to 5.0

**Implementation**:
```java
@Service
public class PerformanceScoreCalculationService {
    
    private static final BigDecimal KPI_WEIGHT = new BigDecimal("0.7");
    private static final BigDecimal COMPETENCY_WEIGHT = new BigDecimal("0.3");
    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;
    
    public BigDecimal calculateFinalScore(
        List<AssessmentScore> kpiScores,
        List<AssessmentScore> competencyScores
    ) {
        validateScores(kpiScores, competencyScores);
        
        BigDecimal kpiAverage = calculateAverage(kpiScores);
        BigDecimal competencyAverage = calculateAverage(competencyScores);
        
        BigDecimal weightedKpi = kpiAverage.multiply(KPI_WEIGHT);
        BigDecimal weightedCompetency = competencyAverage.multiply(COMPETENCY_WEIGHT);
        
        BigDecimal finalScore = weightedKpi.add(weightedCompetency)
            .setScale(SCALE, ROUNDING_MODE);
        
        validateFinalScore(finalScore);
        
        return finalScore;
    }
    
    private BigDecimal calculateAverage(List<AssessmentScore> scores) {
        if (scores.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal sum = scores.stream()
            .map(AssessmentScore::getRatingValue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return sum.divide(
            new BigDecimal(scores.size()),
            SCALE,
            ROUNDING_MODE
        );
    }
    
    private void validateScores(
        List<AssessmentScore> kpiScores,
        List<AssessmentScore> competencyScores
    ) {
        if (kpiScores == null || kpiScores.isEmpty()) {
            throw new InvalidScoreCalculationException(
                "KPI scores are required for score calculation"
            );
        }
        if (competencyScores == null || competencyScores.isEmpty()) {
            throw new InvalidScoreCalculationException(
                "Competency scores are required for score calculation"
            );
        }
    }
    
    private void validateFinalScore(BigDecimal score) {
        if (score.compareTo(BigDecimal.ONE) < 0 || 
            score.compareTo(new BigDecimal("5")) > 0) {
            throw new InvalidScoreCalculationException(
                "Final score must be between 1.0 and 5.0"
            );
        }
    }
}
```


### Repository Interface Design

#### IReviewCycleRepository

**Purpose**: Persistence abstraction for ReviewCycle aggregate

**Interface Definition**:
```java
public interface IReviewCycleRepository {
    
    // Command Operations
    void save(ReviewCycle cycle);
    void update(ReviewCycle cycle);
    
    // Query Operations
    Optional<ReviewCycle> findById(ReviewCycleId cycleId);
    List<ReviewCycle> findActiveCycles();
    List<ReviewCycle> findByStatus(ReviewCycleStatus status);
    List<ReviewCycle> findCyclesForEmployee(EmployeeId employeeId);
    List<ReviewCycle> findCyclesForSupervisor(SupervisorId supervisorId);
    Optional<ReviewParticipant> findParticipant(ParticipantId participantId);
    
    // Pagination Support
    Page<ReviewCycle> findAll(Pageable pageable);
    Page<ReviewCycle> findByDateRange(
        LocalDate startDate,
        LocalDate endDate,
        Pageable pageable
    );
    
    // Existence Checks
    boolean existsById(ReviewCycleId cycleId);
    boolean existsActiveParticipant(EmployeeId employeeId);
}
```

#### IFeedbackRecordRepository

**Purpose**: Persistence abstraction for FeedbackRecord aggregate

**Interface Definition**:
```java
public interface IFeedbackRecordRepository {
    
    // Command Operations
    void save(FeedbackRecord feedback);
    void update(FeedbackRecord feedback);
    
    // Query Operations
    Optional<FeedbackRecord> findById(FeedbackId feedbackId);
    List<FeedbackRecord> findByReceiver(UserId receiverId);
    List<FeedbackRecord> findByGiver(UserId giverId);
    List<FeedbackRecord> findByKpi(KPIId kpiId);
    List<FeedbackRecord> findUnresolvedForReceiver(UserId receiverId);
    List<FeedbackRecord> findByReceiverAndDateRange(
        UserId receiverId,
        Instant startDate,
        Instant endDate
    );
    List<FeedbackRecord> findByReceiverAndType(
        UserId receiverId,
        FeedbackType feedbackType
    );
    
    // Pagination Support
    Page<FeedbackRecord> findAll(Pageable pageable);
    Page<FeedbackRecord> findByReceiverPaginated(
        UserId receiverId,
        Pageable pageable
    );
    
    // Statistics
    long countByReceiver(UserId receiverId);
    long countUnresolvedByReceiver(UserId receiverId);
}
```

### Domain Event Design

**Base Domain Event**:
```java
public abstract class DomainEvent {
    private final UUID eventId;
    private final Instant occurredAt;
    private final String eventType;
    private final UUID aggregateId;
    private final String aggregateType;
    private final int version;
    
    protected DomainEvent(UUID aggregateId, String aggregateType) {
        this.eventId = UUID.randomUUID();
        this.occurredAt = Instant.now();
        this.eventType = this.getClass().getSimpleName();
        this.aggregateId = aggregateId;
        this.aggregateType = aggregateType;
        this.version = 1;
    }
    
    // Getters
    public UUID getEventId() { return eventId; }
    public Instant getOccurredAt() { return occurredAt; }
    public String getEventType() { return eventType; }
    public UUID getAggregateId() { return aggregateId; }
    public String getAggregateType() { return aggregateType; }
    public int getVersion() { return version; }
}
```

**SelfAssessmentSubmitted Event**:
```java
public class SelfAssessmentSubmitted extends DomainEvent {
    private final UUID cycleId;
    private final UUID participantId;
    private final UUID employeeId;
    private final UUID supervisorId;
    private final Instant submittedDate;
    private final List<AssessmentScoreDTO> kpiScores;
    private final String comments;
    private final String extraMileEfforts;
    
    public SelfAssessmentSubmitted(
        UUID cycleId,
        UUID participantId,
        UUID employeeId,
        UUID supervisorId,
        Instant submittedDate,
        List<AssessmentScoreDTO> kpiScores,
        String comments,
        String extraMileEfforts
    ) {
        super(cycleId, "ReviewCycle");
        this.cycleId = cycleId;
        this.participantId = participantId;
        this.employeeId = employeeId;
        this.supervisorId = supervisorId;
        this.submittedDate = submittedDate;
        this.kpiScores = kpiScores;
        this.comments = comments;
        this.extraMileEfforts = extraMileEfforts;
    }
    
    // Getters for all fields
}
```

**ManagerAssessmentSubmitted Event**:
```java
public class ManagerAssessmentSubmitted extends DomainEvent {
    private final UUID cycleId;
    private final UUID participantId;
    private final UUID employeeId;
    private final UUID supervisorId;
    private final Instant submittedDate;
    private final List<AssessmentScoreDTO> kpiScores;
    private final String overallComments;
    private final BigDecimal finalScore;
    
    public ManagerAssessmentSubmitted(
        UUID cycleId,
        UUID participantId,
        UUID employeeId,
        UUID supervisorId,
        Instant submittedDate,
        List<AssessmentScoreDTO> kpiScores,
        String overallComments,
        BigDecimal finalScore
    ) {
        super(cycleId, "ReviewCycle");
        this.cycleId = cycleId;
        this.participantId = participantId;
        this.employeeId = employeeId;
        this.supervisorId = supervisorId;
        this.submittedDate = submittedDate;
        this.kpiScores = kpiScores;
        this.overallComments = overallComments;
        this.finalScore = finalScore;
    }
    
    // Getters for all fields
}
```

**FeedbackProvided Event**:
```java
public class FeedbackProvided extends DomainEvent {
    private final UUID feedbackId;
    private final UUID giverId;
    private final UUID receiverId;
    private final UUID kpiId;
    private final String kpiName;
    private final FeedbackType feedbackType;
    private final Instant createdDate;
    
    public FeedbackProvided(
        UUID feedbackId,
        UUID giverId,
        UUID receiverId,
        UUID kpiId,
        FeedbackType feedbackType,
        Instant createdDate
    ) {
        super(feedbackId, "FeedbackRecord");
        this.feedbackId = feedbackId;
        this.giverId = giverId;
        this.receiverId = receiverId;
        this.kpiId = kpiId;
        this.feedbackType = feedbackType;
        this.createdDate = createdDate;
    }
    
    // Getters for all fields
}
```


## Application Layer Implementation Design

### Application Service Design

#### ReviewCycleApplicationService

**Purpose**: Orchestrate review cycle use cases and coordinate domain operations

**Responsibilities**:
- Handle commands for review cycle operations
- Coordinate with domain aggregates and services
- Publish domain events
- Manage transactions
- Integrate with external services (KPI Management)

**Implementation Structure**:
```java
@Service
@Transactional
public class ReviewCycleApplicationService {
    
    private final IReviewCycleRepository reviewCycleRepository;
    private final PerformanceScoreCalculationService scoreCalculationService;
    private final KPIManagementIntegrationService kpiIntegrationService;
    private final DomainEventPublisher eventPublisher;
    
    // Constructor injection
    public ReviewCycleApplicationService(
        IReviewCycleRepository reviewCycleRepository,
        PerformanceScoreCalculationService scoreCalculationService,
        KPIManagementIntegrationService kpiIntegrationService,
        DomainEventPublisher eventPublisher
    ) {
        this.reviewCycleRepository = reviewCycleRepository;
        this.scoreCalculationService = scoreCalculationService;
        this.kpiIntegrationService = kpiIntegrationService;
        this.eventPublisher = eventPublisher;
    }
    
    // Use Case: Create Review Cycle
    public ReviewCycleResponse createReviewCycle(CreateReviewCycleCommand command) {
        // Validate command
        // Create review cycle aggregate
        // Add participants
        // Save to repository
        // Publish events
        // Return response
    }
    
    // Use Case: Submit Self-Assessment (US-016)
    public AssessmentResponse submitSelfAssessment(
        SubmitSelfAssessmentCommand command
    ) {
        // Load review cycle aggregate
        ReviewCycle cycle = reviewCycleRepository
            .findById(command.getCycleId())
            .orElseThrow(() -> new ReviewCycleNotFoundException(command.getCycleId()));
        
        // Get KPI data from KPI Management Service
        List<KPIAssignmentDTO> kpiAssignments = kpiIntegrationService
            .getEmployeeKPIAssignments(command.getEmployeeId());
        
        // Validate KPI scores against assignments
        validateKpiScores(command.getKpiScores(), kpiAssignments);
        
        // Submit self-assessment to aggregate
        cycle.submitSelfAssessment(
            command.getParticipantId(),
            command.getKpiScores(),
            command.getComments(),
            command.getExtraMileEfforts()
        );
        
        // Save aggregate
        reviewCycleRepository.update(cycle);
        
        // Publish domain events
        cycle.getDomainEvents().forEach(eventPublisher::publish);
        
        // Return response
        return mapToAssessmentResponse(cycle, command.getParticipantId());
    }
    
    // Use Case: Submit Manager Assessment (US-017)
    public AssessmentResponse submitManagerAssessment(
        SubmitManagerAssessmentCommand command
    ) {
        // Load review cycle aggregate
        ReviewCycle cycle = reviewCycleRepository
            .findById(command.getCycleId())
            .orElseThrow(() -> new ReviewCycleNotFoundException(command.getCycleId()));
        
        // Get KPI performance data
        List<KPIPerformanceDataDTO> performanceData = kpiIntegrationService
            .getKPIPerformanceData(command.getEmployeeId());
        
        // Enrich assessment scores with actual performance data
        List<AssessmentScore> enrichedScores = enrichWithPerformanceData(
            command.getKpiScores(),
            performanceData
        );
        
        // Submit manager assessment to aggregate
        cycle.submitManagerAssessment(
            command.getParticipantId(),
            enrichedScores,
            command.getOverallComments(),
            scoreCalculationService
        );
        
        // Save aggregate
        reviewCycleRepository.update(cycle);
        
        // Publish domain events
        cycle.getDomainEvents().forEach(eventPublisher::publish);
        
        // Return response
        return mapToAssessmentResponse(cycle, command.getParticipantId());
    }
    
    // Use Case: Complete Review Cycle
    public ReviewCycleResponse completeReviewCycle(CompleteReviewCycleCommand command) {
        // Load review cycle
        // Validate all participants completed
        // Complete cycle
        // Save and publish events
        // Return response
    }
    
    // Query: Get Review Cycle
    @Transactional(readOnly = true)
    public ReviewCycleResponse getReviewCycle(UUID cycleId) {
        ReviewCycle cycle = reviewCycleRepository
            .findById(new ReviewCycleId(cycleId))
            .orElseThrow(() -> new ReviewCycleNotFoundException(cycleId));
        
        return ReviewCycleMapper.toResponse(cycle);
    }
    
    // Query: Get Participant Assessment Comparison
    @Transactional(readOnly = true)
    public AssessmentComparisonResponse getAssessmentComparison(
        UUID cycleId,
        UUID participantId
    ) {
        // Load cycle
        // Get participant
        // Compare self vs manager assessment
        // Calculate discrepancies
        // Return comparison response
    }
    
    // Private helper methods
    private void validateKpiScores(
        List<AssessmentScore> scores,
        List<KPIAssignmentDTO> assignments
    ) {
        // Validation logic
    }
    
    private List<AssessmentScore> enrichWithPerformanceData(
        List<AssessmentScore> scores,
        List<KPIPerformanceDataDTO> performanceData
    ) {
        // Enrichment logic
    }
}
```


#### FeedbackApplicationService

**Purpose**: Orchestrate feedback use cases and coordinate domain operations

**Implementation Structure**:
```java
@Service
@Transactional
public class FeedbackApplicationService {
    
    private final IFeedbackRecordRepository feedbackRepository;
    private final KPIManagementIntegrationService kpiIntegrationService;
    private final DomainEventPublisher eventPublisher;
    
    public FeedbackApplicationService(
        IFeedbackRecordRepository feedbackRepository,
        KPIManagementIntegrationService kpiIntegrationService,
        DomainEventPublisher eventPublisher
    ) {
        this.feedbackRepository = feedbackRepository;
        this.kpiIntegrationService = kpiIntegrationService;
        this.eventPublisher = eventPublisher;
    }
    
    // Use Case: Provide Feedback (US-019)
    public FeedbackResponse provideFeedback(ProvideFeedbackCommand command) {
        // Validate KPI exists and is assigned to receiver
        KPIAssignmentDTO kpiAssignment = kpiIntegrationService
            .validateKPIAssignment(command.getReceiverId(), command.getKpiId());
        
        // Create feedback aggregate
        FeedbackRecord feedback = FeedbackRecord.create(
            command.getGiverId(),
            command.getReceiverId(),
            command.getKpiId(),
            kpiAssignment.getKpiName(),
            command.getFeedbackType(),
            command.getContentText()
        );
        
        // Save aggregate
        feedbackRepository.save(feedback);
        
        // Publish domain events
        feedback.getDomainEvents().forEach(eventPublisher::publish);
        
        // Return response
        return FeedbackMapper.toResponse(feedback);
    }
    
    // Use Case: Acknowledge Feedback (US-020)
    public FeedbackResponse acknowledgeFeedback(AcknowledgeFeedbackCommand command) {
        // Load feedback aggregate
        FeedbackRecord feedback = feedbackRepository
            .findById(command.getFeedbackId())
            .orElseThrow(() -> new FeedbackNotFoundException(command.getFeedbackId()));
        
        // Acknowledge feedback
        feedback.acknowledge();
        
        // Save aggregate
        feedbackRepository.update(feedback);
        
        // Return response
        return FeedbackMapper.toResponse(feedback);
    }
    
    // Use Case: Respond to Feedback (US-020)
    public FeedbackResponse respondToFeedback(RespondToFeedbackCommand command) {
        // Load feedback aggregate
        FeedbackRecord feedback = feedbackRepository
            .findById(command.getFeedbackId())
            .orElseThrow(() -> new FeedbackNotFoundException(command.getFeedbackId()));
        
        // Add response
        feedback.addResponse(
            command.getResponderId(),
            command.getResponseText()
        );
        
        // Save aggregate
        feedbackRepository.update(feedback);
        
        // Publish domain events
        feedback.getDomainEvents().forEach(eventPublisher::publish);
        
        // Return response
        return FeedbackMapper.toResponse(feedback);
    }
    
    // Use Case: Resolve Feedback
    public FeedbackResponse resolveFeedback(ResolveFeedbackCommand command) {
        // Load feedback aggregate
        FeedbackRecord feedback = feedbackRepository
            .findById(command.getFeedbackId())
            .orElseThrow(() -> new FeedbackNotFoundException(command.getFeedbackId()));
        
        // Resolve feedback
        feedback.resolve();
        
        // Save aggregate
        feedbackRepository.update(feedback);
        
        // Return response
        return FeedbackMapper.toResponse(feedback);
    }
    
    // Query: Get Feedback for Employee (US-020)
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getFeedbackForEmployee(
        UUID employeeId,
        FeedbackQueryFilter filter
    ) {
        List<FeedbackRecord> feedbackRecords;
        
        if (filter.hasDateRange()) {
            feedbackRecords = feedbackRepository.findByReceiverAndDateRange(
                new UserId(employeeId),
                filter.getStartDate(),
                filter.getEndDate()
            );
        } else {
            feedbackRecords = feedbackRepository.findByReceiver(
                new UserId(employeeId)
            );
        }
        
        // Apply additional filters
        if (filter.hasFeedbackType()) {
            feedbackRecords = feedbackRecords.stream()
                .filter(f -> f.getFeedbackType() == filter.getFeedbackType())
                .collect(Collectors.toList());
        }
        
        if (filter.hasKpiId()) {
            feedbackRecords = feedbackRecords.stream()
                .filter(f -> f.getContext().getKpiId().equals(filter.getKpiId()))
                .collect(Collectors.toList());
        }
        
        return feedbackRecords.stream()
            .map(FeedbackMapper::toResponse)
            .collect(Collectors.toList());
    }
    
    // Query: Get Unresolved Feedback
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getUnresolvedFeedback(UUID employeeId) {
        List<FeedbackRecord> feedbackRecords = feedbackRepository
            .findUnresolvedForReceiver(new UserId(employeeId));
        
        return feedbackRecords.stream()
            .map(FeedbackMapper::toResponse)
            .collect(Collectors.toList());
    }
}
```

### Command and Query Objects

#### Commands

**SubmitSelfAssessmentCommand**:
```java
public class SubmitSelfAssessmentCommand {
    private final UUID cycleId;
    private final UUID participantId;
    private final UUID employeeId;
    private final List<AssessmentScore> kpiScores;
    private final String comments;
    private final String extraMileEfforts;
    
    // Constructor, getters, validation
}
```

**SubmitManagerAssessmentCommand**:
```java
public class SubmitManagerAssessmentCommand {
    private final UUID cycleId;
    private final UUID participantId;
    private final UUID employeeId;
    private final UUID supervisorId;
    private final List<AssessmentScore> kpiScores;
    private final String overallComments;
    
    // Constructor, getters, validation
}
```

**ProvideFeedbackCommand**:
```java
public class ProvideFeedbackCommand {
    private final UUID giverId;
    private final UUID receiverId;
    private final UUID kpiId;
    private final FeedbackType feedbackType;
    private final String contentText;
    
    // Constructor, getters, validation
}
```

**RespondToFeedbackCommand**:
```java
public class RespondToFeedbackCommand {
    private final UUID feedbackId;
    private final UUID responderId;
    private final String responseText;
    
    // Constructor, getters, validation
}
```

#### Queries

**FeedbackQueryFilter**:
```java
public class FeedbackQueryFilter {
    private Instant startDate;
    private Instant endDate;
    private FeedbackType feedbackType;
    private UUID kpiId;
    private FeedbackStatus status;
    
    public boolean hasDateRange() {
        return startDate != null && endDate != null;
    }
    
    public boolean hasFeedbackType() {
        return feedbackType != null;
    }
    
    public boolean hasKpiId() {
        return kpiId != null;
    }
    
    // Getters and setters
}
```


### Integration Service Design (Anti-Corruption Layer)

#### KPIManagementIntegrationService

**Purpose**: Integrate with KPI Management Service while protecting domain model

**Responsibilities**:
- Call KPI Management Service APIs
- Transform external DTOs to domain objects
- Handle integration failures gracefully
- Implement circuit breaker and retry patterns

**Implementation**:
```java
@Service
public class KPIManagementIntegrationService {
    
    private final KPIManagementServiceClient client;
    private final CircuitBreaker circuitBreaker;
    
    public KPIManagementIntegrationService(
        KPIManagementServiceClient client,
        CircuitBreakerRegistry circuitBreakerRegistry
    ) {
        this.client = client;
        this.circuitBreaker = circuitBreakerRegistry
            .circuitBreaker("kpi-management-service");
    }
    
    // Get employee KPI assignments
    public List<KPIAssignmentDTO> getEmployeeKPIAssignments(UUID employeeId) {
        return circuitBreaker.executeSupplier(() -> {
            try {
                // Call external API
                KPIAssignmentsResponse response = client
                    .getEmployeeAssignments(employeeId);
                
                // Transform to internal DTOs
                return response.getAssignments().stream()
                    .map(this::transformToKPIAssignmentDTO)
                    .collect(Collectors.toList());
                    
            } catch (FeignException.NotFound e) {
                throw new EmployeeKPINotFoundException(employeeId);
            } catch (FeignException e) {
                throw new KPIServiceIntegrationException(
                    "Failed to retrieve KPI assignments", e
                );
            }
        });
    }
    
    // Get KPI performance data
    public List<KPIPerformanceDataDTO> getKPIPerformanceData(UUID employeeId) {
        return circuitBreaker.executeSupplier(() -> {
            try {
                // Call external API
                KPIPerformanceResponse response = client
                    .getEmployeePerformance(employeeId);
                
                // Transform to internal DTOs
                return response.getPerformanceData().stream()
                    .map(this::transformToKPIPerformanceDTO)
                    .collect(Collectors.toList());
                    
            } catch (FeignException e) {
                throw new KPIServiceIntegrationException(
                    "Failed to retrieve KPI performance data", e
                );
            }
        });
    }
    
    // Validate KPI assignment
    public KPIAssignmentDTO validateKPIAssignment(UUID employeeId, UUID kpiId) {
        List<KPIAssignmentDTO> assignments = getEmployeeKPIAssignments(employeeId);
        
        return assignments.stream()
            .filter(a -> a.getKpiId().equals(kpiId))
            .findFirst()
            .orElseThrow(() -> new KPINotAssignedException(employeeId, kpiId));
    }
    
    // Private transformation methods
    private KPIAssignmentDTO transformToKPIAssignmentDTO(
        ExternalKPIAssignment external
    ) {
        return new KPIAssignmentDTO(
            external.getKpiId(),
            external.getKpiName(),
            external.getKpiDescription(),
            external.getTargetValue(),
            external.getEffectiveDate()
        );
    }
    
    private KPIPerformanceDataDTO transformToKPIPerformanceDTO(
        ExternalKPIPerformance external
    ) {
        return new KPIPerformanceDataDTO(
            external.getKpiId(),
            external.getActualValue(),
            external.getTargetValue(),
            external.getAchievementPercentage(),
            external.getMeasurementDate()
        );
    }
}
```

#### Circuit Breaker Configuration

**Resilience4j Configuration**:
```java
@Configuration
public class CircuitBreakerConfig {
    
    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            .failureRateThreshold(50)
            .waitDurationInOpenState(Duration.ofSeconds(30))
            .slidingWindowSize(10)
            .minimumNumberOfCalls(5)
            .permittedNumberOfCallsInHalfOpenState(3)
            .build();
        
        return CircuitBreakerRegistry.of(config);
    }
    
    @Bean
    public RetryRegistry retryRegistry() {
        RetryConfig config = RetryConfig.custom()
            .maxAttempts(3)
            .waitDuration(Duration.ofMillis(500))
            .retryExceptions(FeignException.class)
            .ignoreExceptions(FeignException.NotFound.class)
            .build();
        
        return RetryRegistry.of(config);
    }
}
```


## Infrastructure Layer Implementation Design

### DynamoDB Table Design

#### DynamoDB Single-Table Design Pattern

**Table 1: ReviewCycles**

```
Table Name: ReviewCycles
Partition Key: PK (String) = "CYCLE#{cycleId}"
Sort Key: SK (String) = "METADATA" or "PARTICIPANT#{participantId}" or "PARTICIPANT#{participantId}#SELF" or "PARTICIPANT#{participantId}#MANAGER"

Billing Mode: PAY_PER_REQUEST (On-Demand) or PROVISIONED
Point-in-Time Recovery: Enabled
Encryption: AWS-managed keys

Item Types:

1. Review Cycle Metadata:
   PK: "CYCLE#{cycleId}"
   SK: "METADATA"
   EntityType: "ReviewCycle"
   CycleId: (String)
   CycleName: (String)
   StartDate: (String, ISO-8601)
   EndDate: (String, ISO-8601)
   Status: (String) - ACTIVE, IN_PROGRESS, COMPLETED
   CreatedAt: (Number, Unix timestamp)
   UpdatedAt: (Number, Unix timestamp)
   Version: (Number)
   GSI1PK: "STATUS#{status}"
   GSI1SK: "CYCLE#{startDate}"
   
2. Review Participant:
   PK: "CYCLE#{cycleId}"
   SK: "PARTICIPANT#{participantId}"
   EntityType: "ReviewParticipant"
   ParticipantId: (String)
   EmployeeId: (String)
   SupervisorId: (String)
   Status: (String) - PENDING, SELF_ASSESSMENT_SUBMITTED, MANAGER_ASSESSMENT_SUBMITTED, COMPLETED
   FinalScore: (Number, optional)
   CreatedAt: (Number)
   UpdatedAt: (Number)
   GSI2PK: "EMPLOYEE#{employeeId}"
   GSI2SK: "CYCLE#{cycleId}"
   GSI3PK: "SUPERVISOR#{supervisorId}"
   GSI3SK: "CYCLE#{cycleId}"

3. Self-Assessment:
   PK: "CYCLE#{cycleId}"
   SK: "PARTICIPANT#{participantId}#SELF"
   EntityType: "SelfAssessment"
   AssessmentId: (String)
   ParticipantId: (String)
   SubmittedDate: (Number, Unix timestamp)
   Comments: (String)
   ExtraMileEfforts: (String)
   KPIScores: (List of Maps)
     - KPIId: (String)
     - RatingValue: (Number, 1.0-5.0)
     - AchievementPercentage: (Number, 0-100)
     - Comment: (String)
   CreatedAt: (Number)
   UpdatedAt: (Number)

4. Manager Assessment:
   PK: "CYCLE#{cycleId}"
   SK: "PARTICIPANT#{participantId}#MANAGER"
   EntityType: "ManagerAssessment"
   AssessmentId: (String)
   ParticipantId: (String)
   SubmittedDate: (Number, Unix timestamp)
   OverallComments: (String)
   KPIScores: (List of Maps)
     - KPIId: (String)
     - RatingValue: (Number, 1.0-5.0)
     - AchievementPercentage: (Number, 0-100)
     - Comment: (String)
   CreatedAt: (Number)
   UpdatedAt: (Number)

Global Secondary Indexes:

GSI1 - Query by Status and Date:
  Name: StatusDateIndex
  Partition Key: GSI1PK (String)
  Sort Key: GSI1SK (String)
  Projection: ALL
  Purpose: Query cycles by status and date range

GSI2 - Query by Employee:
  Name: EmployeeIndex
  Partition Key: GSI2PK (String)
  Sort Key: GSI2SK (String)
  Projection: ALL
  Purpose: Query all cycles for an employee

GSI3 - Query by Supervisor:
  Name: SupervisorIndex
  Partition Key: GSI3PK (String)
  Sort Key: GSI3SK (String)
  Projection: ALL
  Purpose: Query all cycles for a supervisor
```

**Table 2: FeedbackRecords**

```
Table Name: FeedbackRecords
Partition Key: PK (String) = "FEEDBACK#{feedbackId}"
Sort Key: SK (String) = "METADATA" or "RESPONSE#{responseId}"

Billing Mode: PAY_PER_REQUEST (On-Demand)
Point-in-Time Recovery: Enabled
Encryption: AWS-managed keys

Item Types:

1. Feedback Metadata:
   PK: "FEEDBACK#{feedbackId}"
   SK: "METADATA"
   EntityType: "FeedbackRecord"
   FeedbackId: (String)
   GiverId: (String)
   ReceiverId: (String)
   KPIId: (String)
   KPIName: (String)
   FeedbackType: (String) - POSITIVE, IMPROVEMENT
   ContentText: (String)
   Status: (String) - CREATED, ACKNOWLEDGED, RESPONDED, RESOLVED
   CreatedDate: (Number, Unix timestamp)
   UpdatedAt: (Number)
   Version: (Number)
   GSI1PK: "RECEIVER#{receiverId}"
   GSI1SK: "FEEDBACK#{createdDate}"
   GSI2PK: "GIVER#{giverId}"
   GSI2SK: "FEEDBACK#{createdDate}"
   GSI3PK: "KPI#{kpiId}"
   GSI3SK: "FEEDBACK#{createdDate}"
   GSI4PK: "STATUS#{status}"
   GSI4SK: "RECEIVER#{receiverId}#DATE#{createdDate}"

2. Feedback Response:
   PK: "FEEDBACK#{feedbackId}"
   SK: "RESPONSE#{responseId}"
   EntityType: "FeedbackResponse"
   ResponseId: (String)
   FeedbackId: (String)
   ResponderId: (String)
   ResponseText: (String)
   ResponseDate: (Number, Unix timestamp)
   CreatedAt: (Number)

Global Secondary Indexes:

GSI1 - Query by Receiver:
  Name: ReceiverIndex
  Partition Key: GSI1PK (String)
  Sort Key: GSI1SK (String)
  Projection: ALL
  Purpose: Query all feedback for a receiver

GSI2 - Query by Giver:
  Name: GiverIndex
  Partition Key: GSI2PK (String)
  Sort Key: GSI2SK (String)
  Projection: ALL
  Purpose: Query all feedback given by a user

GSI3 - Query by KPI:
  Name: KPIIndex
  Partition Key: GSI3PK (String)
  Sort Key: GSI3SK (String)
  Projection: ALL
  Purpose: Query all feedback for a specific KPI

GSI4 - Query by Status and Receiver:
  Name: StatusReceiverIndex
  Partition Key: GSI4PK (String)
  Sort Key: GSI4SK (String)
  Projection: ALL
  Purpose: Query unresolved feedback for a receiver
```

**Table 3: EventOutbox**

```
Table Name: EventOutbox
Partition Key: PK (String) = "OUTBOX#{id}"
Sort Key: SK (Number) = createdAt (Unix timestamp)

Billing Mode: PAY_PER_REQUEST (On-Demand)
Time to Live (TTL): Enabled on TTL attribute (90 days)
Streams: Enabled (NEW_AND_OLD_IMAGES) for event processing

Attributes:
  PK: (String, Partition Key)
  SK: (Number, Sort Key)
  Id: (String)
  AggregateType: (String)
  AggregateId: (String)
  EventType: (String)
  EventPayload: (Map)
  EventMetadata: (Map)
  CreatedAt: (Number, Unix timestamp)
  PublishedAt: (Number, optional)
  Status: (String) - PENDING, PUBLISHED, FAILED
  RetryCount: (Number)
  ErrorMessage: (String, optional)
  TTL: (Number, Unix timestamp + 90 days)
  GSI1PK: "STATUS#{status}"
  GSI1SK: (Number) createdAt

Global Secondary Index:

GSI1 - Query by Status:
  Name: StatusIndex
  Partition Key: GSI1PK (String)
  Sort Key: GSI1SK (Number)
  Projection: ALL
  Purpose: Query pending events for publishing
```


### DynamoDB Entity Mappings (AWS SDK v2)

#### ReviewCycleEntity

```java
@DynamoDbBean
public class ReviewCycleEntity {
    
    private String pk;  // "CYCLE#{cycleId}"
    private String sk;  // "METADATA"
    private String entityType;  // "ReviewCycle"
    private String cycleId;
    private String cycleName;
    private String startDate;  // ISO-8601 format
    private String endDate;    // ISO-8601 format
    private String status;     // ACTIVE, IN_PROGRESS, COMPLETED
    private Long createdAt;    // Unix timestamp
    private Long updatedAt;    // Unix timestamp
    private Integer version;
    
    // GSI attributes
    private String gsi1Pk;  // "STATUS#{status}"
    private String gsi1Sk;  // "CYCLE#{startDate}"
    
    @DynamoDbPartitionKey
    @DynamoDbAttribute("PK")
    public String getPk() {
        return pk;
    }
    
    @DynamoDbSortKey
    @DynamoDbAttribute("SK")
    public String getSk() {
        return sk;
    }
    
    @DynamoDbAttribute("EntityType")
    public String getEntityType() {
        return entityType;
    }
    
    @DynamoDbAttribute("CycleId")
    public String getCycleId() {
        return cycleId;
    }
    
    @DynamoDbAttribute("CycleName")
    public String getCycleName() {
        return cycleName;
    }
    
    @DynamoDbAttribute("StartDate")
    public String getStartDate() {
        return startDate;
    }
    
    @DynamoDbAttribute("EndDate")
    public String getEndDate() {
        return endDate;
    }
    
    @DynamoDbAttribute("Status")
    public String getStatus() {
        return status;
    }
    
    @DynamoDbAttribute("CreatedAt")
    public Long getCreatedAt() {
        return createdAt;
    }
    
    @DynamoDbAttribute("UpdatedAt")
    public Long getUpdatedAt() {
        return updatedAt;
    }
    
    @DynamoDbAttribute("Version")
    public Integer getVersion() {
        return version;
    }
    
    @DynamoDbSecondaryPartitionKey(indexNames = "StatusDateIndex")
    @DynamoDbAttribute("GSI1PK")
    public String getGsi1Pk() {
        return gsi1Pk;
    }
    
    @DynamoDbSecondarySortKey(indexNames = "StatusDateIndex")
    @DynamoDbAttribute("GSI1SK")
    public String getGsi1Sk() {
        return gsi1Sk;
    }
    
    // Setters omitted for brevity
}
```

#### ReviewParticipantEntity

```java
@DynamoDbBean
public class ReviewParticipantEntity {
    
    private String pk;  // "CYCLE#{cycleId}"
    private String sk;  // "PARTICIPANT#{participantId}"
    private String entityType;  // "ReviewParticipant"
    private String participantId;
    private String employeeId;
    private String supervisorId;
    private String status;  // PENDING, SELF_ASSESSMENT_SUBMITTED, etc.
    private BigDecimal finalScore;
    private Long createdAt;
    private Long updatedAt;
    
    // GSI attributes
    private String gsi2Pk;  // "EMPLOYEE#{employeeId}"
    private String gsi2Sk;  // "CYCLE#{cycleId}"
    private String gsi3Pk;  // "SUPERVISOR#{supervisorId}"
    private String gsi3Sk;  // "CYCLE#{cycleId}"
    
    @DynamoDbPartitionKey
    @DynamoDbAttribute("PK")
    public String getPk() {
        return pk;
    }
    
    @DynamoDbSortKey
    @DynamoDbAttribute("SK")
    public String getSk() {
        return sk;
    }
    
    @DynamoDbAttribute("EntityType")
    public String getEntityType() {
        return entityType;
    }
    
    @DynamoDbAttribute("ParticipantId")
    public String getParticipantId() {
        return participantId;
    }
    
    @DynamoDbAttribute("EmployeeId")
    public String getEmployeeId() {
        return employeeId;
    }
    
    @DynamoDbAttribute("SupervisorId")
    public String getSupervisorId() {
        return supervisorId;
    }
    
    @DynamoDbAttribute("Status")
    public String getStatus() {
        return status;
    }
    
    @DynamoDbAttribute("FinalScore")
    public BigDecimal getFinalScore() {
        return finalScore;
    }
    
    @DynamoDbSecondaryPartitionKey(indexNames = "EmployeeIndex")
    @DynamoDbAttribute("GSI2PK")
    public String getGsi2Pk() {
        return gsi2Pk;
    }
    
    @DynamoDbSecondarySortKey(indexNames = "EmployeeIndex")
    @DynamoDbAttribute("GSI2SK")
    public String getGsi2Sk() {
        return gsi2Sk;
    }
    
    @DynamoDbSecondaryPartitionKey(indexNames = "SupervisorIndex")
    @DynamoDbAttribute("GSI3PK")
    public String getGsi3Pk() {
        return gsi3Pk;
    }
    
    @DynamoDbSecondarySortKey(indexNames = "SupervisorIndex")
    @DynamoDbAttribute("GSI3SK")
    public String getGsi3Sk() {
        return gsi3Sk;
    }
    
    // Setters omitted for brevity
}
```

#### SelfAssessmentEntity

```java
@DynamoDbBean
public class SelfAssessmentEntity {
    
    private String pk;  // "CYCLE#{cycleId}"
    private String sk;  // "PARTICIPANT#{participantId}#SELF"
    private String entityType;  // "SelfAssessment"
    private String assessmentId;
    private String participantId;
    private Long submittedDate;
    private String comments;
    private String extraMileEfforts;
    private List<AssessmentScoreItem> kpiScores;
    private Long createdAt;
    private Long updatedAt;
    
    @DynamoDbPartitionKey
    @DynamoDbAttribute("PK")
    public String getPk() {
        return pk;
    }
    
    @DynamoDbSortKey
    @DynamoDbAttribute("SK")
    public String getSk() {
        return sk;
    }
    
    @DynamoDbAttribute("KPIScores")
    public List<AssessmentScoreItem> getKpiScores() {
        return kpiScores;
    }
    
    // Other getters/setters
}

@DynamoDbBean
public static class AssessmentScoreItem {
    private String kpiId;
    private BigDecimal ratingValue;
    private BigDecimal achievementPercentage;
    private String comment;
    
    // Getters and setters
}
```

#### FeedbackRecordEntity

```java
@DynamoDbBean
public class FeedbackRecordEntity {
    
    private String pk;  // "FEEDBACK#{feedbackId}"
    private String sk;  // "METADATA"
    private String entityType;  // "FeedbackRecord"
    private String feedbackId;
    private String giverId;
    private String receiverId;
    private String kpiId;
    private String kpiName;
    private String feedbackType;  // POSITIVE, IMPROVEMENT
    private String contentText;
    private String status;  // CREATED, ACKNOWLEDGED, RESPONDED, RESOLVED
    private Long createdDate;
    private Long updatedAt;
    private Integer version;
    
    // GSI attributes
    private String gsi1Pk;  // "RECEIVER#{receiverId}"
    private String gsi1Sk;  // "FEEDBACK#{createdDate}"
    private String gsi2Pk;  // "GIVER#{giverId}"
    private String gsi2Sk;  // "FEEDBACK#{createdDate}"
    private String gsi3Pk;  // "KPI#{kpiId}"
    private String gsi3Sk;  // "FEEDBACK#{createdDate}"
    private String gsi4Pk;  // "STATUS#{status}"
    private String gsi4Sk;  // "RECEIVER#{receiverId}#DATE#{createdDate}"
    
    @DynamoDbPartitionKey
    @DynamoDbAttribute("PK")
    public String getPk() {
        return pk;
    }
    
    @DynamoDbSortKey
    @DynamoDbAttribute("SK")
    public String getSk() {
        return sk;
    }
    
    @DynamoDbSecondaryPartitionKey(indexNames = "ReceiverIndex")
    @DynamoDbAttribute("GSI1PK")
    public String getGsi1Pk() {
        return gsi1Pk;
    }
    
    @DynamoDbSecondarySortKey(indexNames = "ReceiverIndex")
    @DynamoDbAttribute("GSI1SK")
    public String getGsi1Sk() {
        return gsi1Sk;
    }
    
    // Additional GSI getters/setters
    // Other getters/setters omitted for brevity
}
```

#### FeedbackResponseEntity

```java
@DynamoDbBean
public class FeedbackResponseEntity {
    
    private String pk;  // "FEEDBACK#{feedbackId}"
    private String sk;  // "RESPONSE#{responseId}"
    private String entityType;  // "FeedbackResponse"
    private String responseId;
    private String feedbackId;
    private String responderId;
    private String responseText;
    private Long responseDate;
    private Long createdAt;
    
    @DynamoDbPartitionKey
    @DynamoDbAttribute("PK")
    public String getPk() {
        return pk;
    }
    
    @DynamoDbSortKey
    @DynamoDbAttribute("SK")
    public String getSk() {
        return sk;
    }
    
    // Other getters/setters
}
```

### Repository Implementation (DynamoDB)

#### ReviewCycleRepositoryImpl

```java
@Repository
public class ReviewCycleRepositoryImpl implements IReviewCycleRepository {
    
    private final DynamoDbEnhancedClient dynamoDbClient;
    private final DynamoDbTable<ReviewCycleEntity> cycleTable;
    private final DynamoDbTable<ReviewParticipantEntity> participantTable;
    private final ReviewCycleMapper mapper;
    
    public ReviewCycleRepositoryImpl(
        DynamoDbEnhancedClient dynamoDbClient,
        ReviewCycleMapper mapper,
        @Value("${aws.dynamodb.table-prefix}") String tablePrefix
    ) {
        this.dynamoDbClient = dynamoDbClient;
        this.mapper = mapper;
        
        TableSchema<ReviewCycleEntity> cycleSchema = TableSchema.fromBean(ReviewCycleEntity.class);
        this.cycleTable = dynamoDbClient.table(tablePrefix + "ReviewCycles", cycleSchema);
        
        TableSchema<ReviewParticipantEntity> participantSchema = TableSchema.fromBean(ReviewParticipantEntity.class);
        this.participantTable = dynamoDbClient.table(tablePrefix + "ReviewCycles", participantSchema);
    }
    
    @Override
    public void save(ReviewCycle cycle) {
        // Convert domain to entities
        ReviewCycleEntity cycleEntity = mapper.toCycleEntity(cycle);
        List<ReviewParticipantEntity> participantEntities = mapper.toParticipantEntities(cycle);
        
        // Batch write all items
        WriteBatch.Builder<ReviewCycleEntity> cycleWriteBatch = WriteBatch.builder(ReviewCycleEntity.class)
            .mappedTableResource(cycleTable)
            .addPutItem(cycleEntity);
        
        WriteBatch.Builder<ReviewParticipantEntity> participantWriteBatch = WriteBatch.builder(ReviewParticipantEntity.class)
            .mappedTableResource(participantTable);
        
        participantEntities.forEach(participantWriteBatch::addPutItem);
        
        dynamoDbClient.batchWriteItem(r -> r
            .addWriteBatch(cycleWriteBatch.build())
            .addWriteBatch(participantWriteBatch.build())
        );
    }
    
    @Override
    public Optional<ReviewCycle> findById(ReviewCycleId cycleId) {
        String pk = "CYCLE#" + cycleId.getValue();
        
        // Query all items for this cycle
        QueryConditional queryConditional = QueryConditional
            .keyEqualTo(Key.builder()
                .partitionValue(pk)
                .build());
        
        QueryEnhancedRequest request = QueryEnhancedRequest.builder()
            .queryConditional(queryConditional)
            .build();
        
        PageIterable<ReviewCycleEntity> results = cycleTable.query(request);
        
        // Reconstruct domain aggregate from items
        return mapper.toDomain(results.items().stream().collect(Collectors.toList()));
    }
    
    @Override
    public List<ReviewCycle> findActiveCycles() {
        // Query GSI1 by status
        String gsi1Pk = "STATUS#ACTIVE";
        
        QueryConditional queryConditional = QueryConditional
            .keyEqualTo(Key.builder()
                .partitionValue(gsi1Pk)
                .build());
        
        QueryEnhancedRequest request = QueryEnhancedRequest.builder()
            .queryConditional(queryConditional)
            .build();
        
        DynamoDbIndex<ReviewCycleEntity> gsi1 = cycleTable.index("StatusDateIndex");
        PageIterable<ReviewCycleEntity> results = gsi1.query(request);
        
        return results.items().stream()
            .map(mapper::toDomainFromMetadata)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<ReviewCycle> findCyclesForEmployee(EmployeeId employeeId) {
        // Query GSI2 by employee
        String gsi2Pk = "EMPLOYEE#" + employeeId.getValue();
        
        QueryConditional queryConditional = QueryConditional
            .keyEqualTo(Key.builder()
                .partitionValue(gsi2Pk)
                .build());
        
        QueryEnhancedRequest request = QueryEnhancedRequest.builder()
            .queryConditional(queryConditional)
            .build();
        
        DynamoDbIndex<ReviewParticipantEntity> gsi2 = participantTable.index("EmployeeIndex");
        PageIterable<ReviewParticipantEntity> results = gsi2.query(request);
        
        // For each participant, fetch full cycle data
        return results.items().stream()
            .map(p -> findById(new ReviewCycleId(extractCycleIdFromPk(p.getPk()))))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<ReviewCycle> findCyclesForSupervisor(SupervisorId supervisorId) {
        // Query GSI3 by supervisor
        String gsi3Pk = "SUPERVISOR#" + supervisorId.getValue();
        
        QueryConditional queryConditional = QueryConditional
            .keyEqualTo(Key.builder()
                .partitionValue(gsi3Pk)
                .build());
        
        QueryEnhancedRequest request = QueryEnhancedRequest.builder()
            .queryConditional(queryConditional)
            .build();
        
        DynamoDbIndex<ReviewParticipantEntity> gsi3 = participantTable.index("SupervisorIndex");
        PageIterable<ReviewParticipantEntity> results = gsi3.query(request);
        
        return results.items().stream()
            .map(p -> findById(new ReviewCycleId(extractCycleIdFromPk(p.getPk()))))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
    }
    
    private String extractCycleIdFromPk(String pk) {
        return pk.replace("CYCLE#", "");
    }
}
```

#### FeedbackRecordRepositoryImpl

```java
@Repository
public class FeedbackRecordRepositoryImpl implements IFeedbackRecordRepository {
    
    private final DynamoDbEnhancedClient dynamoDbClient;
    private final DynamoDbTable<FeedbackRecordEntity> feedbackTable;
    private final DynamoDbTable<FeedbackResponseEntity> responseTable;
    private final FeedbackMapper mapper;
    
    public FeedbackRecordRepositoryImpl(
        DynamoDbEnhancedClient dynamoDbClient,
        FeedbackMapper mapper,
        @Value("${aws.dynamodb.table-prefix}") String tablePrefix
    ) {
        this.dynamoDbClient = dynamoDbClient;
        this.mapper = mapper;
        
        TableSchema<FeedbackRecordEntity> feedbackSchema = TableSchema.fromBean(FeedbackRecordEntity.class);
        this.feedbackTable = dynamoDbClient.table(tablePrefix + "FeedbackRecords", feedbackSchema);
        
        TableSchema<FeedbackResponseEntity> responseSchema = TableSchema.fromBean(FeedbackResponseEntity.class);
        this.responseTable = dynamoDbClient.table(tablePrefix + "FeedbackRecords", responseSchema);
    }
    
    @Override
    public void save(FeedbackRecord feedback) {
        FeedbackRecordEntity entity = mapper.toEntity(feedback);
        feedbackTable.putItem(entity);
    }
    
    @Override
    public Optional<FeedbackRecord> findById(FeedbackId feedbackId) {
        String pk = "FEEDBACK#" + feedbackId.getValue();
        
        QueryConditional queryConditional = QueryConditional
            .keyEqualTo(Key.builder()
                .partitionValue(pk)
                .build());
        
        QueryEnhancedRequest request = QueryEnhancedRequest.builder()
            .queryConditional(queryConditional)
            .build();
        
        PageIterable<FeedbackRecordEntity> results = feedbackTable.query(request);
        
        return mapper.toDomain(results.items().stream().collect(Collectors.toList()));
    }
    
    @Override
    public List<FeedbackRecord> findFeedbackForEmployee(EmployeeId employeeId) {
        // Query GSI1 by receiver
        String gsi1Pk = "RECEIVER#" + employeeId.getValue();
        
        QueryConditional queryConditional = QueryConditional
            .keyEqualTo(Key.builder()
                .partitionValue(gsi1Pk)
                .build());
        
        QueryEnhancedRequest request = QueryEnhancedRequest.builder()
            .queryConditional(queryConditional)
            .build();
        
        DynamoDbIndex<FeedbackRecordEntity> gsi1 = feedbackTable.index("ReceiverIndex");
        PageIterable<FeedbackRecordEntity> results = gsi1.query(request);
        
        return results.items().stream()
            .map(mapper::toDomainFromMetadata)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<FeedbackRecord> findUnresolvedFeedback(EmployeeId receiverId) {
        // Query GSI4 by status and receiver
        String gsi4Pk = "STATUS#CREATED";
        String gsi4SkPrefix = "RECEIVER#" + receiverId.getValue();
        
        QueryConditional queryConditional = QueryConditional
            .sortBeginsWith(Key.builder()
                .partitionValue(gsi4Pk)
                .sortValue(gsi4SkPrefix)
                .build());
        
        QueryEnhancedRequest request = QueryEnhancedRequest.builder()
            .queryConditional(queryConditional)
            .build();
        
        DynamoDbIndex<FeedbackRecordEntity> gsi4 = feedbackTable.index("StatusReceiverIndex");
        PageIterable<FeedbackRecordEntity> results = gsi4.query(request);
        
        return results.items().stream()
            .map(mapper::toDomainFromMetadata)
            .collect(Collectors.toList());
    }
}
```


### Caching Strategy Design

#### Redis Caching Configuration

**Cache Configuration**:
```java
@Configuration
@EnableCaching
public class RedisCacheConfig {
    
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new StringRedisSerializer()
                )
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer()
                )
            )
            .disableCachingNullValues();
        
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // Review cycles cache - 1 hour TTL
        cacheConfigurations.put("reviewCycles",
            config.entryTtl(Duration.ofHours(1)));
        
        // Feedback cache - 30 minutes TTL
        cacheConfigurations.put("feedback",
            config.entryTtl(Duration.ofMinutes(30)));
        
        // KPI assignments cache - 2 hours TTL
        cacheConfigurations.put("kpiAssignments",
            config.entryTtl(Duration.ofHours(2)));
        
        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .withInitialCacheConfigurations(cacheConfigurations)
            .build();
    }
}
```

**Caching Strategy**:

1. **Review Cycles**:
   - Cache active review cycles (frequently accessed)
   - Invalidate on status change or completion
   - Cache key: `reviewCycle:{cycleId}`

2. **Feedback Records**:
   - Cache employee feedback lists (frequently accessed)
   - Invalidate on new feedback or response
   - Cache key: `feedback:employee:{employeeId}`

3. **KPI Assignments** (from external service):
   - Cache KPI assignments to reduce external calls
   - Longer TTL since assignments change infrequently
   - Cache key: `kpiAssignments:employee:{employeeId}`

**Cache Annotations**:
```java
@Service
public class ReviewCycleApplicationService {
    
    @Cacheable(value = "reviewCycles", key = "#cycleId")
    public ReviewCycleResponse getReviewCycle(UUID cycleId) {
        // Method implementation
    }
    
    @CacheEvict(value = "reviewCycles", key = "#command.cycleId")
    public AssessmentResponse submitSelfAssessment(
        SubmitSelfAssessmentCommand command
    ) {
        // Method implementation
    }
    
    @CacheEvict(value = "reviewCycles", allEntries = true)
    public ReviewCycleResponse completeReviewCycle(
        CompleteReviewCycleCommand command
    ) {
        // Method implementation
    }
}

@Service
public class FeedbackApplicationService {
    
    @Cacheable(value = "feedback", key = "'employee:' + #employeeId")
    public List<FeedbackResponse> getFeedbackForEmployee(
        UUID employeeId,
        FeedbackQueryFilter filter
    ) {
        // Method implementation
    }
    
    @CacheEvict(value = "feedback", key = "'employee:' + #command.receiverId")
    public FeedbackResponse provideFeedback(ProvideFeedbackCommand command) {
        // Method implementation
    }
}
```


## Monitoring and Observability Design

### Prometheus Metrics Configuration

**Metrics to Collect**:

1. **Application Metrics**:
   - Request count and duration by endpoint
   - Success/error rates
   - Active requests
   - JVM metrics (heap, GC, threads)

2. **Business Metrics**:
   - Self-assessments submitted per hour
   - Manager assessments submitted per hour
   - Feedback provided per hour
   - Average assessment completion time
   - Review cycle completion rate

3. **Integration Metrics**:
   - KPI Management Service call count
   - KPI Management Service response time
   - Circuit breaker state changes
   - Integration failure rate

4. **Database Metrics**:
   - Connection pool usage
   - Query execution time
   - Transaction duration
   - Slow query count

**Prometheus Configuration**:
```java
@Configuration
public class PrometheusConfig {
    
    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config()
            .commonTags(
                "application", "performance-management-service",
                "environment", "${spring.profiles.active}"
            );
    }
    
    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }
}
```

**Custom Business Metrics**:
```java
@Component
public class PerformanceMetrics {
    
    private final Counter selfAssessmentsSubmitted;
    private final Counter managerAssessmentsSubmitted;
    private final Counter feedbackProvided;
    private final Timer assessmentCompletionTime;
    
    public PerformanceMetrics(MeterRegistry registry) {
        this.selfAssessmentsSubmitted = Counter.builder("self_assessments_submitted_total")
            .description("Total number of self-assessments submitted")
            .register(registry);
        
        this.managerAssessmentsSubmitted = Counter.builder("manager_assessments_submitted_total")
            .description("Total number of manager assessments submitted")
            .register(registry);
        
        this.feedbackProvided = Counter.builder("feedback_provided_total")
            .description("Total number of feedback records provided")
            .tag("type", "all")
            .register(registry);
        
        this.assessmentCompletionTime = Timer.builder("assessment_completion_duration")
            .description("Time taken to complete assessment")
            .register(registry);
    }
    
    public void recordSelfAssessmentSubmitted() {
        selfAssessmentsSubmitted.increment();
    }
    
    public void recordManagerAssessmentSubmitted() {
        managerAssessmentsSubmitted.increment();
    }
    
    public void recordFeedbackProvided(FeedbackType type) {
        Counter.builder("feedback_provided_total")
            .tag("type", type.name())
            .register(registry)
            .increment();
    }
    
    public void recordAssessmentCompletion(Duration duration) {
        assessmentCompletionTime.record(duration);
    }
}
```

### Grafana Dashboard Design

**Dashboard Panels**:

1. **Overview Panel**:
   - Total assessments submitted (today/week/month)
   - Total feedback provided (today/week/month)
   - Active review cycles count
   - System health status

2. **Performance Panel**:
   - API response time (p50, p95, p99)
   - Request rate per endpoint
   - Error rate percentage
   - Database query performance

3. **Business Metrics Panel**:
   - Assessment submission trends (time series)
   - Feedback provision trends (time series)
   - Review cycle completion rate
   - Average time to complete assessments

4. **Integration Health Panel**:
   - KPI Management Service availability
   - Circuit breaker status
   - Integration call success rate
   - Integration response time

5. **Infrastructure Panel**:
   - JVM heap usage
   - GC pause time
   - Thread count
   - Database connection pool usage

### Structured Logging Design

**Logging Configuration**:
```java
@Configuration
public class LoggingConfig {
    
    @Bean
    public LogstashEncoder logstashEncoder() {
        LogstashEncoder encoder = new LogstashEncoder();
        encoder.setIncludeMdc(true);
        encoder.setIncludeContext(true);
        encoder.setIncludeCallerData(false);
        encoder.setCustomFields("{\"application\":\"performance-management-service\"}");
        return encoder;
    }
}
```

**Logging Levels**:
- `ERROR`: System errors, integration failures, unhandled exceptions
- `WARN`: Business rule violations, validation failures, circuit breaker open
- `INFO`: Business events (assessment submitted, feedback provided), API calls
- `DEBUG`: Detailed flow information, query execution
- `TRACE`: Very detailed debugging information

**Correlation ID Tracking**:
```java
@Component
public class CorrelationIdFilter extends OncePerRequestFilter {
    
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String CORRELATION_ID_MDC_KEY = "correlationId";
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }
        
        MDC.put(CORRELATION_ID_MDC_KEY, correlationId);
        response.setHeader(CORRELATION_ID_HEADER, correlationId);
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(CORRELATION_ID_MDC_KEY);
        }
    }
}
```

**Structured Log Format**:
```json
{
  "timestamp": "2024-12-16T10:30:00.000Z",
  "level": "INFO",
  "logger": "com.company.performance.application.ReviewCycleApplicationService",
  "message": "Self-assessment submitted successfully",
  "correlationId": "abc-123-def-456",
  "userId": "user-uuid",
  "cycleId": "cycle-uuid",
  "participantId": "participant-uuid",
  "duration": 150,
  "application": "performance-management-service",
  "environment": "production"
}
```


## Deployment Architecture Design

### Docker Containerization

**Dockerfile**:

```dockerfile
# Multi-stage build for optimized image size
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY src/pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy JAR from build stage
COPY --from=build /app/target/performance-management-service.jar app.jar

# Set ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# JVM options
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### Kubernetes Deployment

**Deployment Manifest**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: performance-management-service
  namespace: performance-system
  labels:
    app: performance-management
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: performance-management
  template:
    metadata:
      labels:
        app: performance-management
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      serviceAccountName: performance-management-sa
      containers:
      - name: performance-management
        image: company-registry/performance-management-service:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
          protocol: TCP
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            secretKeyRef:
              name: performance-db-secret
              key: jdbc-url
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: performance-db-secret
              key: username
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: performance-db-secret
              key: password
        - name: SPRING_KAFKA_BOOTSTRAP_SERVERS
          valueFrom:
            configMapKeyRef:
              name: kafka-config
              key: bootstrap-servers
        - name: SPRING_REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: host
        - name: SPRING_REDIS_PORT
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: port
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: performance-management-config
---
apiVersion: v1
kind: Service
metadata:
  name: performance-management-service
  namespace: performance-system
  labels:
    app: performance-management
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: performance-management
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: performance-management-hpa
  namespace: performance-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: performance-management-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max
```

**ConfigMap**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: performance-management-config
  namespace: performance-system
data:
  application.yml: |
    server:
      port: 8080
      shutdown: graceful
    
    spring:
      application:
        name: performance-management-service
      
      jpa:
        hibernate:
          ddl-auto: validate
        properties:
          hibernate:
            dialect: org.hibernate.dialect.PostgreSQLDialect
            format_sql: true
            jdbc:
              batch_size: 20
            order_inserts: true
            order_updates: true
      
      kafka:
        producer:
          key-serializer: org.apache.kafka.common.serialization.StringSerializer
          value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
          acks: all
          retries: 3
        consumer:
          key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
          value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
          auto-offset-reset: earliest
          enable-auto-commit: false
      
      cache:
        type: redis
        redis:
          time-to-live: 1800000
    
    management:
      endpoints:
        web:
          exposure:
            include: health,info,metrics,prometheus
      endpoint:
        health:
          probes:
            enabled: true
          show-details: when-authorized
      metrics:
        export:
          prometheus:
            enabled: true
    
    resilience4j:
      circuitbreaker:
        instances:
          kpi-management-service:
            registerHealthIndicator: true
            slidingWindowSize: 10
            minimumNumberOfCalls: 5
            permittedNumberOfCallsInHalfOpenState: 3
            automaticTransitionFromOpenToHalfOpenEnabled: true
            waitDurationInOpenState: 30s
            failureRateThreshold: 50
            eventConsumerBufferSize: 10
```


### AWS ECS Fargate Deployment (Alternative to Kubernetes)

**ECS Task Definition**:
```json
{
  "family": "performance-management-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account-id:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account-id:role/performanceManagementTaskRole",
  "containerDefinitions": [
    {
      "name": "performance-management",
      "image": "account-id.dkr.ecr.region.amazonaws.com/performance-management:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "SPRING_DATASOURCE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:performance-db-url"
        },
        {
          "name": "SPRING_DATASOURCE_USERNAME",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:performance-db-username"
        },
        {
          "name": "SPRING_DATASOURCE_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:performance-db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/performance-management-service",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

**ECS Service Definition**:
```json
{
  "serviceName": "performance-management-service",
  "cluster": "performance-system-cluster",
  "taskDefinition": "performance-management-service:latest",
  "desiredCount": 3,
  "launchType": "FARGATE",
  "platformVersion": "LATEST",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": [
        "subnet-private-1a",
        "subnet-private-1b",
        "subnet-private-1c"
      ],
      "securityGroups": [
        "sg-performance-management"
      ],
      "assignPublicIp": "DISABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:region:account-id:targetgroup/performance-mgmt-tg",
      "containerName": "performance-management",
      "containerPort": 8080
    }
  ],
  "healthCheckGracePeriodSeconds": 60,
  "deploymentConfiguration": {
    "maximumPercent": 200,
    "minimumHealthyPercent": 100,
    "deploymentCircuitBreaker": {
      "enable": true,
      "rollback": true
    }
  },
  "enableECSManagedTags": true,
  "propagateTags": "SERVICE"
}
```

**Auto Scaling Configuration**:
```json
{
  "ServiceNamespace": "ecs",
  "ResourceId": "service/performance-system-cluster/performance-management-service",
  "ScalableDimension": "ecs:service:DesiredCount",
  "MinCapacity": 3,
  "MaxCapacity": 10,
  "TargetTrackingScalingPolicies": [
    {
      "PolicyName": "cpu-scaling-policy",
      "TargetValue": 70.0,
      "PredefinedMetricSpecification": {
        "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
      },
      "ScaleInCooldown": 300,
      "ScaleOutCooldown": 60
    },
    {
      "PolicyName": "memory-scaling-policy",
      "TargetValue": 80.0,
      "PredefinedMetricSpecification": {
        "PredefinedMetricType": "ECSServiceAverageMemoryUtilization"
      },
      "ScaleInCooldown": 300,
      "ScaleOutCooldown": 60
    }
  ]
}
```


## Testing Strategy Design

### Unit Testing Strategy

**Domain Layer Testing**:

**Aggregate Testing**:
```java
@ExtendWith(MockitoExtension.class)
class ReviewCycleTest {
    
    private ReviewCycle reviewCycle;
    private PerformanceScoreCalculationService scoreService;
    
    @BeforeEach
    void setUp() {
        scoreService = new PerformanceScoreCalculationService();
        reviewCycle = new ReviewCycle(
            ReviewCycleId.generate(),
            "Q4 2024 Review",
            LocalDate.of(2024, 10, 1),
            LocalDate.of(2024, 12, 31)
        );
    }
    
    @Test
    void shouldSubmitSelfAssessment() {
        // Given
        ParticipantId participantId = ParticipantId.generate();
        reviewCycle.addParticipant(
            participantId,
            EmployeeId.generate(),
            SupervisorId.generate()
        );
        
        List<AssessmentScore> scores = Arrays.asList(
            new AssessmentScore(
                KPIId.generate(),
                new BigDecimal("4.0"),
                new BigDecimal("85.0"),
                "Good performance"
            )
        );
        
        // When
        reviewCycle.submitSelfAssessment(
            participantId,
            scores,
            "Overall good quarter",
            "Helped onboard new team member"
        );
        
        // Then
        ReviewParticipant participant = reviewCycle.getParticipant(participantId);
        assertThat(participant.getStatus())
            .isEqualTo(ParticipantStatus.SELF_ASSESSMENT_SUBMITTED);
        assertThat(participant.hasSelfAssessment()).isTrue();
        assertThat(reviewCycle.getDomainEvents())
            .hasSize(1)
            .first()
            .isInstanceOf(SelfAssessmentSubmitted.class);
    }
    
    @Test
    void shouldNotSubmitManagerAssessmentWithoutSelfAssessment() {
        // Given
        ParticipantId participantId = ParticipantId.generate();
        reviewCycle.addParticipant(
            participantId,
            EmployeeId.generate(),
            SupervisorId.generate()
        );
        
        List<AssessmentScore> scores = Arrays.asList(
            new AssessmentScore(
                KPIId.generate(),
                new BigDecimal("4.0"),
                new BigDecimal("85.0"),
                "Good performance"
            )
        );
        
        // When & Then
        assertThatThrownBy(() ->
            reviewCycle.submitManagerAssessment(
                participantId,
                scores,
                "Good work",
                scoreService
            )
        )
        .isInstanceOf(InvalidAssessmentException.class)
        .hasMessageContaining("Self-assessment must be submitted first");
    }
    
    @Test
    void shouldCalculateFinalScoreCorrectly() {
        // Given
        ParticipantId participantId = ParticipantId.generate();
        reviewCycle.addParticipant(
            participantId,
            EmployeeId.generate(),
            SupervisorId.generate()
        );
        
        // Submit self-assessment first
        reviewCycle.submitSelfAssessment(
            participantId,
            createKpiScores(),
            "Comments",
            "Extra efforts"
        );
        
        // When
        reviewCycle.submitManagerAssessment(
            participantId,
            createKpiScores(),
            "Overall comments",
            scoreService
        );
        
        // Then
        ReviewParticipant participant = reviewCycle.getParticipant(participantId);
        assertThat(participant.getFinalScore()).isNotNull();
        assertThat(participant.getFinalScore())
            .isBetween(new BigDecimal("1.0"), new BigDecimal("5.0"));
    }
}
```

**Domain Service Testing**:
```java
class PerformanceScoreCalculationServiceTest {
    
    private PerformanceScoreCalculationService service;
    
    @BeforeEach
    void setUp() {
        service = new PerformanceScoreCalculationService();
    }
    
    @Test
    void shouldCalculateCorrectFinalScore() {
        // Given
        List<AssessmentScore> kpiScores = Arrays.asList(
            createScore(new BigDecimal("4.0")),
            createScore(new BigDecimal("5.0")),
            createScore(new BigDecimal("3.0"))
        );
        
        List<AssessmentScore> competencyScores = Arrays.asList(
            createScore(new BigDecimal("4.0")),
            createScore(new BigDecimal("4.0"))
        );
        
        // When
        BigDecimal finalScore = service.calculateFinalScore(
            kpiScores,
            competencyScores
        );
        
        // Then
        // KPI average: (4.0 + 5.0 + 3.0) / 3 = 4.0
        // Competency average: (4.0 + 4.0) / 2 = 4.0
        // Final: (4.0 * 0.7) + (4.0 * 0.3) = 4.0
        assertThat(finalScore).isEqualByComparingTo(new BigDecimal("4.00"));
    }
    
    @Test
    void shouldThrowExceptionWhenKpiScoresEmpty() {
        // Given
        List<AssessmentScore> kpiScores = Collections.emptyList();
        List<AssessmentScore> competencyScores = Arrays.asList(
            createScore(new BigDecimal("4.0"))
        );
        
        // When & Then
        assertThatThrownBy(() ->
            service.calculateFinalScore(kpiScores, competencyScores)
        )
        .isInstanceOf(InvalidScoreCalculationException.class)
        .hasMessageContaining("KPI scores are required");
    }
}
```

### Integration Testing Strategy

**Repository Integration Tests**:
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class ReviewCycleRepositoryIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");
    
    @Autowired
    private JpaReviewCycleRepository jpaRepository;
    
    private ReviewCycleRepositoryImpl repository;
    private ReviewCycleMapper mapper;
    
    @BeforeEach
    void setUp() {
        mapper = new ReviewCycleMapper();
        repository = new ReviewCycleRepositoryImpl(jpaRepository, mapper);
    }
    
    @Test
    void shouldSaveAndRetrieveReviewCycle() {
        // Given
        ReviewCycle cycle = new ReviewCycle(
            ReviewCycleId.generate(),
            "Q4 2024 Review",
            LocalDate.of(2024, 10, 1),
            LocalDate.of(2024, 12, 31)
        );
        
        // When
        repository.save(cycle);
        Optional<ReviewCycle> retrieved = repository.findById(cycle.getId());
        
        // Then
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getCycleName()).isEqualTo("Q4 2024 Review");
    }
    
    @Test
    void shouldFindCyclesForEmployee() {
        // Given
        EmployeeId employeeId = EmployeeId.generate();
        ReviewCycle cycle = createCycleWithParticipant(employeeId);
        repository.save(cycle);
        
        // When
        List<ReviewCycle> cycles = repository.findCyclesForEmployee(employeeId);
        
        // Then
        assertThat(cycles).hasSize(1);
        assertThat(cycles.get(0).getId()).isEqualTo(cycle.getId());
    }
}
```

**API Integration Tests**:
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
class ReviewCycleControllerIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");
    
    @Container
    static KafkaContainer kafka = new KafkaContainer(
        DockerImageName.parse("confluentinc/cp-kafka:7.5.0")
    );
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private KPIManagementIntegrationService kpiIntegrationService;
    
    @Test
    @WithMockUser(roles = "HR")
    void shouldCreateReviewCycle() throws Exception {
        // Given
        CreateReviewCycleRequest request = new CreateReviewCycleRequest(
            "Q4 2024 Review",
            LocalDate.of(2024, 10, 1),
            LocalDate.of(2024, 12, 31),
            Arrays.asList(
                new ParticipantRequest(
                    UUID.randomUUID(),
                    UUID.randomUUID()
                )
            )
        );
        
        // When & Then
        mockMvc.perform(post("/api/v1/performance-management/cycles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.cycleId").exists())
            .andExpect(jsonPath("$.cycleName").value("Q4 2024 Review"))
            .andExpect(jsonPath("$.status").value("ACTIVE"));
    }
    
    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void shouldSubmitSelfAssessment() throws Exception {
        // Given
        UUID cycleId = createTestCycle();
        UUID participantId = getParticipantId(cycleId);
        
        when(kpiIntegrationService.getEmployeeKPIAssignments(any()))
            .thenReturn(createMockKPIAssignments());
        
        SubmitSelfAssessmentRequest request = new SubmitSelfAssessmentRequest(
            Arrays.asList(
                new AssessmentScoreRequest(
                    UUID.randomUUID(),
                    new BigDecimal("4.0"),
                    new BigDecimal("85.0"),
                    "Good performance"
                )
            ),
            "Overall good quarter",
            "Helped onboard new team member"
        );
        
        // When & Then
        mockMvc.perform(post("/api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/self-assessment",
                cycleId, participantId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.assessmentId").exists())
            .andExpect(jsonPath("$.status").value("SELF_ASSESSMENT_SUBMITTED"));
    }
}
```



### Contract Testing Strategy

**Consumer-Driven Contract Tests with KPI Management Service**:

**Contract Definition**:
```java
@SpringBootTest
@AutoConfigureWireMock(port = 0)
class KPIManagementServiceContractTest {
    
    @Autowired
    private KPIManagementServiceClient client;
    
    @Test
    void shouldGetEmployeeKPIAssignments() {
        // Given
        UUID employeeId = UUID.randomUUID();
        
        stubFor(get(urlEqualTo("/api/v1/kpi-management/assignments/employee/" + employeeId))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("""
                    {
                      "assignments": [
                        {
                          "assignmentId": "uuid",
                          "kpiId": "uuid",
                          "kpiName": "Sales Target",
                          "customTarget": 100000,
                          "effectiveDate": "2024-01-01"
                        }
                      ]
                    }
                    """)));
        
        // When
        List<KPIAssignmentDTO> assignments = client.getEmployeeKPIAssignments(employeeId);
        
        // Then
        assertThat(assignments).hasSize(1);
        assertThat(assignments.get(0).getKpiName()).isEqualTo("Sales Target");
    }
    
    @Test
    void shouldHandleKPIServiceUnavailable() {
        // Given
        UUID employeeId = UUID.randomUUID();
        
        stubFor(get(urlEqualTo("/api/v1/kpi-management/assignments/employee/" + employeeId))
            .willReturn(aResponse()
                .withStatus(503)
                .withFixedDelay(5000)));
        
        // When & Then
        assertThatThrownBy(() -> client.getEmployeeKPIAssignments(employeeId))
            .isInstanceOf(ServiceUnavailableException.class);
    }
}
```

**Pact Contract Testing** (Alternative approach):
```java
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "kpi-management-service")
class KPIManagementServicePactTest {
    
    @Pact(consumer = "performance-management-service")
    public RequestResponsePact getEmployeeKPIAssignments(PactDslWithProvider builder) {
        return builder
            .given("employee has KPI assignments")
            .uponReceiving("a request for employee KPI assignments")
            .path("/api/v1/kpi-management/assignments/employee/123e4567-e89b-12d3-a456-426614174000")
            .method("GET")
            .willRespondWith()
            .status(200)
            .body(new PactDslJsonBody()
                .minArrayLike("assignments", 1)
                    .uuid("assignmentId")
                    .uuid("kpiId")
                    .stringType("kpiName", "Sales Target")
                    .numberType("customTarget", 100000)
                    .date("effectiveDate", "yyyy-MM-dd")
                .closeObject()
                .closeArray())
            .toPact();
    }
}
```


### Performance and Load Testing Strategy

**Load Testing Configuration**:

**JMeter Test Plan Structure**:
```xml
<!-- Review Cycle Creation Load Test -->
<ThreadGroup>
  <name>Review Cycle Creation</name>
  <numThreads>10</numThreads>
  <rampTime>60</rampTime>
  <duration>300</duration>
  
  <HTTPSamplerProxy>
    <path>/api/v1/performance-management/cycles</path>
    <method>POST</method>
    <body>{
      "cycleName": "Load Test Cycle ${__UUID}",
      "startDate": "2024-10-01",
      "endDate": "2024-12-31",
      "participants": [...]
    }</body>
  </HTTPSamplerProxy>
</ThreadGroup>

<!-- Self-Assessment Submission Load Test -->
<ThreadGroup>
  <name>Self Assessment Submission</name>
  <numThreads>100</numThreads>
  <rampTime>120</rampTime>
  <duration>600</duration>
  
  <HTTPSamplerProxy>
    <path>/api/v1/performance-management/cycles/${cycleId}/participants/${participantId}/self-assessment</path>
    <method>POST</method>
  </HTTPSamplerProxy>
</ThreadGroup>
```

**Gatling Load Test** (Alternative):
```scala
class PerformanceManagementLoadTest extends Simulation {
  
  val httpProtocol = http
    .baseUrl("https://api.company.com")
    .acceptHeader("application/json")
    .authorizationHeader("Bearer ${jwt_token}")
  
  val selfAssessmentScenario = scenario("Submit Self Assessment")
    .exec(http("Submit Self Assessment")
      .post("/api/v1/performance-management/cycles/${cycleId}/participants/${participantId}/self-assessment")
      .body(StringBody("""{"kpiScores": [...], "comments": "Load test"}"""))
      .check(status.is(201)))
  
  setUp(
    selfAssessmentScenario.inject(
      rampUsers(100) during (2 minutes),
      constantUsersPerSec(50) during (5 minutes)
    )
  ).protocols(httpProtocol)
   .assertions(
     global.responseTime.max.lt(2000),
     global.successfulRequests.percent.gt(95)
   )
}
```


**Performance Benchmarks and SLAs**:

| Operation | Target Response Time | Max Response Time | Throughput (req/sec) |
|-----------|---------------------|-------------------|---------------------|
| Create Review Cycle | < 500ms | < 1000ms | 10 |
| Submit Self Assessment | < 300ms | < 800ms | 100 |
| Submit Manager Assessment | < 400ms | < 1000ms | 100 |
| Get Review Cycle Details | < 200ms | < 500ms | 200 |
| Provide Feedback | < 250ms | < 600ms | 50 |
| Get Feedback List | < 300ms | < 700ms | 150 |

**Stress Testing Scenarios**:
- Peak load: 500 concurrent users submitting assessments
- Sustained load: 200 concurrent users for 1 hour
- Spike test: 0 to 300 users in 30 seconds
- Endurance test: 100 concurrent users for 4 hours

### End-to-End Testing Strategy

**E2E Test Scenarios**:

**Scenario 1: Complete Review Cycle Workflow**:
```gherkin
Feature: Complete Performance Review Cycle

  Scenario: Employee completes self-assessment and manager provides assessment
    Given a review cycle "Q4 2024" exists with status "Active"
    And employee "John Doe" is a participant in the cycle
    And employee has 3 KPI assignments
    
    When employee submits self-assessment with:
      | KPI | Rating | Achievement | Comment |
      | Sales Target | 4.0 | 85% | Met quarterly target |
      | Customer Satisfaction | 5.0 | 95% | Exceeded expectations |
      | Team Collaboration | 4.0 | 80% | Good team player |
    And employee adds comments "Overall good quarter"
    And employee adds extra mile efforts "Mentored new team member"
    
    Then self-assessment should be saved successfully
    And participant status should be "SELF_ASSESSMENT_SUBMITTED"
    And SelfAssessmentSubmitted event should be published
    And supervisor should receive notification
    
    When supervisor submits manager assessment with:
      | KPI | Rating | Achievement | Comment |
      | Sales Target | 4.0 | 85% | Consistent performance |
      | Customer Satisfaction | 4.5 | 92% | Strong customer focus |
      | Team Collaboration | 4.0 | 80% | Collaborative approach |
    And supervisor adds overall comments "Strong performance this quarter"
    
    Then manager assessment should be saved successfully
    And final score should be calculated as 4.17
    And participant status should be "MANAGER_ASSESSMENT_SUBMITTED"
    And ManagerAssessmentSubmitted event should be published
    And employee should receive notification
```

**Scenario 2: Feedback Provision and Response**:
```gherkin
Feature: KPI-Specific Feedback

  Scenario: Supervisor provides feedback and employee responds
    Given supervisor "Jane Smith" manages employee "John Doe"
    And employee has KPI "Sales Target" assigned
    
    When supervisor provides feedback:
      | Field | Value |
      | Receiver | John Doe |
      | KPI | Sales Target |
      | Type | Positive |
      | Content | Great work on closing the enterprise deal |
    
    Then feedback should be created successfully
    And FeedbackProvided event should be published
    And employee should receive notification
    And feedback status should be "Created"
    
    When employee acknowledges feedback
    Then feedback status should be "Acknowledged"
    
    When employee responds with "Thank you for the recognition"
    Then feedback response should be saved
    And FeedbackResponseProvided event should be published
    And supervisor should receive notification
    And feedback status should be "Responded"
```



### Test Data Management

**Test Data Strategy**:

**Database Seeding for Tests**:
```java
@Component
public class TestDataSeeder {
    
    public ReviewCycle createTestReviewCycle(String cycleName) {
        return ReviewCycle.builder()
            .id(ReviewCycleId.generate())
            .cycleName(cycleName)
            .startDate(LocalDate.now())
            .endDate(LocalDate.now().plusMonths(3))
            .status(ReviewCycleStatus.ACTIVE)
            .build();
    }
    
    public ReviewParticipant createTestParticipant(
        EmployeeId employeeId,
        SupervisorId supervisorId
    ) {
        return ReviewParticipant.builder()
            .id(ParticipantId.generate())
            .employeeId(employeeId)
            .supervisorId(supervisorId)
            .status(ParticipantStatus.PENDING)
            .build();
    }
    
    public List<AssessmentScore> createTestKPIScores() {
        return Arrays.asList(
            new AssessmentScore(
                KPIId.generate(),
                new BigDecimal("4.0"),
                new BigDecimal("85.0"),
                "Test comment"
            ),
            new AssessmentScore(
                KPIId.generate(),
                new BigDecimal("5.0"),
                new BigDecimal("95.0"),
                "Excellent performance"
            )
        );
    }
}
```

**Test Data Cleanup**:
```java
@TestConfiguration
public class TestDataCleanupConfig {
    
    @Bean
    public TestDataCleaner testDataCleaner(
        JpaReviewCycleRepository reviewCycleRepo,
        JpaFeedbackRecordRepository feedbackRepo
    ) {
        return new TestDataCleaner(reviewCycleRepo, feedbackRepo);
    }
}

public class TestDataCleaner {
    
    @Transactional
    public void cleanupTestData() {
        reviewCycleRepo.deleteAll();
        feedbackRepo.deleteAll();
    }
    
    @Transactional
    public void cleanupTestDataOlderThan(Duration duration) {
        Instant cutoff = Instant.now().minus(duration);
        reviewCycleRepo.deleteByCreatedAtBefore(cutoff);
        feedbackRepo.deleteByCreatedAtBefore(cutoff);
    }
}
```

### Code Coverage Requirements

**Coverage Targets**:
- Domain Layer: 90% line coverage, 85% branch coverage
- Application Layer: 85% line coverage, 80% branch coverage
- Infrastructure Layer: 70% line coverage, 65% branch coverage
- API Layer: 80% line coverage, 75% branch coverage
- Overall Project: 80% line coverage, 75% branch coverage

**JaCoCo Configuration**:
```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
        <execution>
            <id>check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>PACKAGE</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```



## Implementation Roadmap

### Phase 1: Foundation Setup (Day 1 - Hours 1-2)

**Objectives**: Set up project structure and core infrastructure

**Tasks**:
1. **Project Initialization**
   - Create Spring Boot project with required dependencies
   - Set up multi-module Maven/Gradle structure
   - Configure application properties for all environments
   - Set up Git repository and branching strategy

2. **Infrastructure Setup**
   - Configure PostgreSQL database connection
   - Set up Kafka broker connection
   - Configure Redis cache connection
   - Set up Docker Compose for local development

3. **Base Package Structure**
   - Create domain, application, infrastructure, and api packages
   - Set up base classes and interfaces
   - Configure dependency injection

**Deliverables**:
- ✅ Runnable Spring Boot application
- ✅ Database connection verified
- ✅ Kafka connection verified
- ✅ Package structure in place

**Team Assignment**: 1 developer (Infrastructure specialist)

---

### Phase 2: Domain Layer Implementation (Day 1 - Hours 2-4)

**Objectives**: Implement core domain model

**Tasks**:
1. **ReviewCycle Aggregate**
   - Implement ReviewCycle aggregate root
   - Implement ReviewParticipant entity
   - Implement SelfAssessment entity
   - Implement ManagerAssessment entity
   - Implement AssessmentScore value object
   - Add domain events

2. **FeedbackRecord Aggregate**
   - Implement FeedbackRecord aggregate root
   - Implement FeedbackResponse entity
   - Implement FeedbackContext value object
   - Add domain events

3. **Domain Services**
   - Implement PerformanceScoreCalculationService
   - Add business rule validation

4. **Repository Interfaces**
   - Define IReviewCycleRepository interface
   - Define IFeedbackRecordRepository interface

**Deliverables**:
- ✅ Complete domain model implementation
- ✅ Unit tests for aggregates (90% coverage)
- ✅ Unit tests for domain services

**Team Assignment**: 2 developers (Domain experts)

---

### Phase 3: Infrastructure Layer Implementation (Day 1 - Hours 4-5)

**Objectives**: Implement persistence and external integrations

**Tasks**:
1. **Database Schema**
   - Create Flyway migration scripts
   - Define JPA entities
   - Create database indexes

2. **Repository Implementations**
   - Implement ReviewCycleRepositoryImpl
   - Implement FeedbackRecordRepositoryImpl
   - Implement JPA repositories
   - Add entity mappers

3. **Event Infrastructure**
   - Implement Kafka event publisher
   - Implement transactional outbox pattern
   - Configure event serialization

4. **External Service Clients**
   - Implement KPIManagementServiceClient
   - Add circuit breaker configuration
   - Add retry logic

**Deliverables**:
- ✅ Database schema created
- ✅ Repository implementations complete
- ✅ Event publishing working
- ✅ Integration tests for repositories

**Team Assignment**: 2 developers (Infrastructure specialists)

---

### Phase 4: Application Layer Implementation (Day 1 - Hours 5-6)

**Objectives**: Implement use cases and application services

**Tasks**:
1. **Application Services**
   - Implement ReviewCycleApplicationService
   - Implement FeedbackApplicationService

2. **Command Handlers**
   - Implement SubmitSelfAssessmentCommand handler
   - Implement SubmitManagerAssessmentCommand handler
   - Implement ProvideFeedbackCommand handler
   - Implement RespondToFeedbackCommand handler

3. **Query Handlers**
   - Implement GetReviewCycleQuery handler
   - Implement GetParticipantAssessmentQuery handler
   - Implement GetFeedbackQuery handler

4. **DTOs and Mappers**
   - Create request/response DTOs
   - Implement domain-to-DTO mappers

**Deliverables**:
- ✅ Application services complete
- ✅ Command and query handlers implemented
- ✅ Unit tests for application layer

**Team Assignment**: 2 developers (Application layer specialists)

---

### Phase 5: API Layer Implementation (Day 1 - Hours 6-7)

**Objectives**: Expose REST APIs

**Tasks**:
1. **REST Controllers**
   - Implement ReviewCycleController
   - Implement FeedbackController

2. **Security Configuration**
   - Configure JWT authentication
   - Implement authorization rules
   - Add rate limiting

3. **Error Handling**
   - Implement GlobalExceptionHandler
   - Add validation
   - Configure error responses

4. **API Documentation**
   - Configure OpenAPI/Swagger
   - Add API documentation annotations

**Deliverables**:
- ✅ REST APIs exposed and documented
- ✅ Security configured
- ✅ API integration tests passing

**Team Assignment**: 1 developer (API specialist)

---

### Phase 6: Testing and Quality Assurance (Day 1 - Hour 7-8)

**Objectives**: Comprehensive testing and quality checks

**Tasks**:
1. **Integration Testing**
   - Run all integration tests
   - Test end-to-end workflows
   - Verify event publishing

2. **Performance Testing**
   - Run load tests
   - Verify response times meet SLAs
   - Check resource utilization

3. **Security Testing**
   - Verify authentication and authorization
   - Test rate limiting
   - Check for security vulnerabilities

4. **Code Quality**
   - Run static code analysis
   - Verify code coverage meets targets
   - Fix any quality issues

**Deliverables**:
- ✅ All tests passing
- ✅ Performance benchmarks met
- ✅ Security verified
- ✅ Code quality standards met

**Team Assignment**: All developers (pair testing)

---

### Phase 7: Deployment and Documentation (Post-Workshop)

**Objectives**: Deploy to staging and complete documentation

**Tasks**:
1. **Containerization**
   - Build Docker images
   - Push to container registry
   - Configure ECS task definitions

2. **Deployment**
   - Deploy to staging environment
   - Run smoke tests
   - Monitor application health

3. **Documentation**
   - Complete API documentation
   - Write deployment guide
   - Create runbook for operations

4. **Handover**
   - Knowledge transfer session
   - Demo to stakeholders
   - Plan for production deployment

**Deliverables**:
- ✅ Application deployed to staging
- ✅ Documentation complete
- ✅ Team trained on the system

**Team Assignment**: 1 developer + DevOps engineer



### Team Structure and Responsibilities

**Recommended Team Composition** (4 developers for 1-day workshop):

**Developer 1: Domain Expert & Tech Lead**
- Lead domain model implementation
- Implement ReviewCycle aggregate
- Implement domain services
- Code review and quality assurance
- Technical decision making

**Developer 2: Domain Expert**
- Implement FeedbackRecord aggregate
- Implement domain events
- Write unit tests for domain layer
- Pair with Developer 1 on complex logic

**Developer 3: Infrastructure Specialist**
- Set up project infrastructure
- Implement repository layer
- Configure Kafka and event publishing
- Implement external service clients
- Database schema and migrations

**Developer 4: Application & API Specialist**
- Implement application services
- Implement REST controllers
- Configure security and authentication
- API documentation
- Integration testing

**Optional: DevOps Engineer** (for deployment phase)
- Container configuration
- ECS deployment
- Monitoring setup
- CI/CD pipeline

---

### Development Best Practices

**Code Standards**:
- Follow Java coding conventions
- Use meaningful variable and method names
- Keep methods small and focused (< 20 lines)
- Write self-documenting code with minimal comments
- Use design patterns appropriately

**Git Workflow**:
- Feature branch workflow
- Branch naming: `feature/US-XXX-description`
- Commit messages: `[US-XXX] Description of change`
- Pull request reviews required
- Squash commits before merging

**Testing Standards**:
- Write tests before or alongside implementation (TDD)
- Follow AAA pattern (Arrange, Act, Assert)
- Use meaningful test names describing behavior
- Mock external dependencies
- Maintain code coverage targets

**Documentation Standards**:
- Document public APIs with JavaDoc
- Keep README updated
- Document architectural decisions (ADRs)
- Maintain API documentation in OpenAPI format

---

### Risk Mitigation Strategies

**Technical Risks**:

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Kafka integration issues | High | Medium | Use embedded Kafka for local dev, have fallback to synchronous processing |
| Database performance bottlenecks | High | Low | Implement proper indexing, use connection pooling, monitor query performance |
| External service (KPI Management) unavailable | Medium | Medium | Implement circuit breaker, cache KPI data, graceful degradation |
| Authentication/Authorization complexity | Medium | Low | Use proven Spring Security patterns, test thoroughly |
| Event ordering issues | Medium | Low | Use aggregate ID as partition key, implement idempotent handlers |

**Schedule Risks**:

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Scope creep during workshop | High | High | Strict adherence to workshop scope (4 user stories only) |
| Team member unavailability | Medium | Low | Cross-train team members, document decisions |
| Technical blockers | Medium | Medium | Have senior developer available for support |
| Integration delays | Low | Low | Mock external services, test integrations early |

**Quality Risks**:

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Insufficient test coverage | High | Medium | Enforce coverage gates in CI/CD, pair programming |
| Security vulnerabilities | High | Low | Use security scanning tools, follow OWASP guidelines |
| Performance issues | Medium | Low | Load test early, monitor metrics, optimize queries |
| Poor code quality | Medium | Low | Code reviews, static analysis, pair programming |



### Success Metrics

**Workshop Success Criteria**:
- ✅ All 4 user stories (US-016, US-017, US-019, US-020) implemented
- ✅ Domain model fully implemented with 90%+ test coverage
- ✅ REST APIs exposed and documented
- ✅ Integration with KPI Management Service working
- ✅ Events published to Kafka successfully
- ✅ Application deployable to staging environment
- ✅ All acceptance criteria met for included user stories

**Technical Quality Metrics**:
- Code coverage: ≥ 80% overall, ≥ 90% domain layer
- API response times: < 500ms for 95th percentile
- Zero critical security vulnerabilities
- Zero high-priority bugs
- All integration tests passing
- Static code analysis score: A grade

**Business Value Metrics**:
- Functional review cycle workflow end-to-end
- Employees can submit self-assessments
- Supervisors can submit manager assessments
- Performance scores calculated correctly
- Feedback can be provided and responded to
- Events published for analytics consumption

---

## Future Enhancements (Post-Workshop)

### Phase 2 Enhancements (Week 2)

**Review Templates (US-014, US-015)**:
- Add ReviewTemplate aggregate
- Configurable KPI/competency weightings
- Template assignment to roles/departments
- Template versioning

**Calibration Tools (US-018)**:
- Add CalibrationSession aggregate
- Rating distribution analysis
- Calibration adjustment workflows
- Bias detection algorithms

**Estimated Effort**: 3-5 days

---

### Phase 3 Enhancements (Week 3-4)

**Recognition System (US-021, US-022)**:
- Add Recognition aggregate
- Peer recognition workflows
- Monetary and non-monetary rewards
- Recognition feed and analytics
- Slack/Teams bot integration

**Estimated Effort**: 5-7 days

---

### Phase 4 Enhancements (Week 5-6)

**Coaching Resources (US-023, US-024, US-025, US-026)**:
- Add CoachingQuestion aggregate
- Add CoachingResource aggregate
- Add CoachingSession aggregate
- AI-generated coaching questions
- Coaching database and search
- Session tracking and effectiveness metrics

**Estimated Effort**: 7-10 days

---

### Phase 5 Enhancements (Future)

**Advanced Features**:
- Multi-language support
- Advanced analytics and insights
- Mobile application support
- Offline capability
- Advanced reporting
- Integration with learning management systems
- 360-degree feedback
- Continuous performance management

**Estimated Effort**: 15-20 days



## Appendix A: Key Architectural Decisions

### ADR-001: Hexagonal Architecture Pattern

**Status**: Accepted

**Context**: Need clear separation of concerns and testability

**Decision**: Adopt hexagonal (ports and adapters) architecture with clear boundaries between domain, application, infrastructure, and presentation layers

**Consequences**:
- ✅ Domain logic isolated and highly testable
- ✅ Easy to swap infrastructure implementations
- ✅ Clear dependency direction (inward)
- ⚠️ More initial setup complexity
- ⚠️ Requires discipline to maintain boundaries

---

### ADR-002: Event Sourcing with Transactional Outbox

**Status**: Accepted

**Context**: Need reliable event publishing with exactly-once delivery guarantee

**Decision**: Use transactional outbox pattern with Kafka for event publishing

**Consequences**:
- ✅ Guaranteed event delivery
- ✅ Events stored in same transaction as domain changes
- ✅ Event replay capability
- ⚠️ Additional complexity in infrastructure
- ⚠️ Requires outbox polling mechanism

---

### ADR-003: PostgreSQL for Primary Data Store

**Status**: Accepted

**Context**: Need reliable, ACID-compliant database for transactional data

**Decision**: Use PostgreSQL 15+ as primary database with JPA/Hibernate

**Consequences**:
- ✅ Strong consistency guarantees
- ✅ Rich query capabilities
- ✅ JSON support for flexible data
- ✅ Mature ecosystem and tooling
- ⚠️ Requires careful schema design for performance

---

### ADR-004: Apache Kafka for Event Bus

**Status**: Accepted

**Context**: Need scalable, reliable event streaming platform

**Decision**: Use Apache Kafka for domain event publishing and consumption

**Consequences**:
- ✅ High throughput and scalability
- ✅ Event replay capability
- ✅ Multiple consumer support
- ✅ Industry standard
- ⚠️ Operational complexity
- ⚠️ Requires Kafka expertise

---

### ADR-005: Redis for Caching

**Status**: Accepted

**Context**: Need fast caching layer for frequently accessed data

**Decision**: Use Redis for distributed caching

**Consequences**:
- ✅ Very fast read performance
- ✅ Distributed caching support
- ✅ Rich data structures
- ⚠️ Additional infrastructure component
- ⚠️ Cache invalidation complexity

---

### ADR-006: JWT for Authentication

**Status**: Accepted

**Context**: Need stateless authentication for REST APIs

**Decision**: Use JWT tokens with OAuth 2.0 / OpenID Connect

**Consequences**:
- ✅ Stateless authentication
- ✅ Industry standard
- ✅ Easy integration with identity providers
- ⚠️ Token size overhead
- ⚠️ Token revocation complexity

---

### ADR-007: Workshop Scope Limitation

**Status**: Accepted

**Context**: Need to deliver working system in 1-day workshop

**Decision**: Limit scope to 4 essential user stories (US-016, US-017, US-019, US-020)

**Consequences**:
- ✅ Achievable in 1 day
- ✅ Core functionality delivered
- ✅ Foundation for future enhancements
- ⚠️ Limited feature set initially
- ⚠️ Requires clear communication of scope

---

### ADR-008: REST-Only API (No GraphQL)

**Status**: Accepted

**Context**: Need to choose API style for external communication

**Decision**: Use REST APIs only, no GraphQL for workshop version

**Consequences**:
- ✅ Simpler implementation
- ✅ Well-understood by all developers
- ✅ Good tooling support
- ⚠️ Less flexible querying
- ⚠️ Potential over-fetching/under-fetching



## Appendix B: Integration Specifications

### Integration with KPI Management Service

**Service Endpoint**: `https://api.company.com/api/v1/kpi-management`

**Required APIs**:

1. **Get Employee KPI Assignments**
   - Endpoint: `GET /assignments/employee/{employee_id}`
   - Purpose: Retrieve KPI assignments for review cycle
   - Called: During review cycle creation and assessment submission
   - Response: List of KPI assignments with targets

2. **Get KPI Performance Data**
   - Endpoint: `GET /performance/employee/{employee_id}`
   - Purpose: Retrieve actual KPI achievement data
   - Called: During assessment scoring
   - Response: KPI performance metrics

**Circuit Breaker Configuration**:
```yaml
resilience4j:
  circuitbreaker:
    instances:
      kpiManagementService:
        registerHealthIndicator: true
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        permittedNumberOfCallsInHalfOpenState: 3
        automaticTransitionFromOpenToHalfOpenEnabled: true
        waitDurationInOpenState: 10s
        failureRateThreshold: 50
        slowCallRateThreshold: 100
        slowCallDurationThreshold: 2s
```

**Retry Configuration**:
```yaml
resilience4j:
  retry:
    instances:
      kpiManagementService:
        maxAttempts: 3
        waitDuration: 1s
        exponentialBackoffMultiplier: 2
        retryExceptions:
          - java.net.ConnectException
          - java.net.SocketTimeoutException
```

---

### Integration with Data & Analytics Service

**Event Publishing**:

**Events Published**:
1. `SelfAssessmentSubmitted` - When employee submits self-assessment
2. `ManagerAssessmentSubmitted` - When supervisor submits manager assessment
3. `ReviewCycleCompleted` - When review cycle is completed
4. `FeedbackProvided` - When feedback is given
5. `FeedbackResponseProvided` - When feedback response is added

**Kafka Topic**: `performance-management.integration-events`

**Event Schema Versioning**:
- Use Avro schema registry for event schema management
- Backward compatibility required for schema evolution
- Version included in event metadata

---

### Integration with Notification Service

**Event Consumption**:

**Events Consumed by Notification Service**:
1. `SelfAssessmentSubmitted` → Notify supervisor
2. `ManagerAssessmentSubmitted` → Notify employee
3. `FeedbackProvided` → Notify feedback receiver
4. `FeedbackResponseProvided` → Notify feedback giver

**Notification Channels**:
- Email notifications
- In-app notifications
- Push notifications (future)



---

## Appendix B: DynamoDB Schema Reference

### Complete DynamoDB Table Structure

**Table 1: ReviewCycles**
```
Table Name: ReviewCycles
Billing Mode: PAY_PER_REQUEST
Encryption: AWS-managed (SSE)
Point-in-Time Recovery: Enabled
Streams: Enabled (NEW_AND_OLD_IMAGES)

Primary Key:
├── PK (String, Partition Key) = "CYCLE#{cycleId}"
└── SK (String, Sort Key) = "METADATA" | "PARTICIPANT#{participantId}" | "PARTICIPANT#{participantId}#SELF" | "PARTICIPANT#{participantId}#MANAGER"

Attributes:
├── EntityType (String) - "ReviewCycle" | "ReviewParticipant" | "SelfAssessment" | "ManagerAssessment"
├── CycleId (String)
├── CycleName (String)
├── StartDate (String, ISO-8601)
├── EndDate (String, ISO-8601)
├── Status (String)
├── EmployeeId (String)
├── SupervisorId (String)
├── ParticipantId (String)
├── FinalScore (Number)
├── SubmittedDate (Number, Unix timestamp)
├── Comments (String)
├── ExtraMileEfforts (String)
├── OverallComments (String)
├── KPIScores (List of Maps)
├── CreatedAt (Number, Unix timestamp)
├── UpdatedAt (Number, Unix timestamp)
└── Version (Number)

Global Secondary Indexes:
├── GSI1: StatusDateIndex
│   ├── GSI1PK (String, Partition Key) = "STATUS#{status}"
│   ├── GSI1SK (String, Sort Key) = "CYCLE#{startDate}"
│   └── Projection: ALL
├── GSI2: EmployeeIndex
│   ├── GSI2PK (String, Partition Key) = "EMPLOYEE#{employeeId}"
│   ├── GSI2SK (String, Sort Key) = "CYCLE#{cycleId}"
│   └── Projection: ALL
└── GSI3: SupervisorIndex
    ├── GSI3PK (String, Partition Key) = "SUPERVISOR#{supervisorId}"
    ├── GSI3SK (String, Sort Key) = "CYCLE#{cycleId}"
    └── Projection: ALL
```

**Table 2: FeedbackRecords**
```
Table Name: FeedbackRecords
Billing Mode: PAY_PER_REQUEST
Encryption: AWS-managed (SSE)
Point-in-Time Recovery: Enabled
Streams: Enabled (NEW_AND_OLD_IMAGES)

Primary Key:
├── PK (String, Partition Key) = "FEEDBACK#{feedbackId}"
└── SK (String, Sort Key) = "METADATA" | "RESPONSE#{responseId}"

Attributes:
├── EntityType (String) - "FeedbackRecord" | "FeedbackResponse"
├── FeedbackId (String)
├── GiverId (String)
├── ReceiverId (String)
├── KPIId (String)
├── KPIName (String)
├── FeedbackType (String) - "POSITIVE" | "IMPROVEMENT"
├── ContentText (String)
├── Status (String) - "CREATED" | "ACKNOWLEDGED" | "RESPONDED" | "RESOLVED"
├── ResponseId (String)
├── ResponderId (String)
├── ResponseText (String)
├── ResponseDate (Number, Unix timestamp)
├── CreatedDate (Number, Unix timestamp)
├── CreatedAt (Number, Unix timestamp)
├── UpdatedAt (Number, Unix timestamp)
└── Version (Number)

Global Secondary Indexes:
├── GSI1: ReceiverIndex
│   ├── GSI1PK (String, Partition Key) = "RECEIVER#{receiverId}"
│   ├── GSI1SK (String, Sort Key) = "FEEDBACK#{createdDate}"
│   └── Projection: ALL
├── GSI2: GiverIndex
│   ├── GSI2PK (String, Partition Key) = "GIVER#{giverId}"
│   ├── GSI2SK (String, Sort Key) = "FEEDBACK#{createdDate}"
│   └── Projection: ALL
├── GSI3: KPIIndex
│   ├── GSI3PK (String, Partition Key) = "KPI#{kpiId}"
│   ├── GSI3SK (String, Sort Key) = "FEEDBACK#{createdDate}"
│   └── Projection: ALL
└── GSI4: StatusReceiverIndex
    ├── GSI4PK (String, Partition Key) = "STATUS#{status}"
    ├── GSI4SK (String, Sort Key) = "RECEIVER#{receiverId}#DATE#{createdDate}"
    └── Projection: ALL
```

**Table 3: EventOutbox**
```
Table Name: EventOutbox
Billing Mode: PAY_PER_REQUEST
Encryption: AWS-managed (SSE)
Time to Live (TTL): Enabled on TTL attribute (90 days)
Streams: Enabled (NEW_AND_OLD_IMAGES)

Primary Key:
├── PK (String, Partition Key) = "OUTBOX#{id}"
└── SK (Number, Sort Key) = createdAt (Unix timestamp)

Attributes:
├── Id (String)
├── AggregateType (String)
├── AggregateId (String)
├── EventType (String)
├── EventPayload (Map)
├── EventMetadata (Map)
├── CreatedAt (Number, Unix timestamp)
├── PublishedAt (Number, Unix timestamp, optional)
├── Status (String) - "PENDING" | "PUBLISHED" | "FAILED"
├── RetryCount (Number)
├── ErrorMessage (String, optional)
└── TTL (Number, Unix timestamp + 90 days)

Global Secondary Index:
└── GSI1: StatusIndex
    ├── GSI1PK (String, Partition Key) = "STATUS#{status}"
    ├── GSI1SK (Number, Sort Key) = createdAt
    └── Projection: ALL
```

### Access Patterns and Query Examples

**ReviewCycles Table:**
```
1. Get review cycle by ID:
   Query: PK = "CYCLE#{cycleId}" AND SK = "METADATA"

2. Get all participants for a cycle:
   Query: PK = "CYCLE#{cycleId}" AND SK begins_with "PARTICIPANT#"

3. Get self-assessment for participant:
   Query: PK = "CYCLE#{cycleId}" AND SK = "PARTICIPANT#{participantId}#SELF"

4. Get manager assessment for participant:
   Query: PK = "CYCLE#{cycleId}" AND SK = "PARTICIPANT#{participantId}#MANAGER"

5. Query cycles by status:
   Query GSI1: GSI1PK = "STATUS#ACTIVE"

6. Query cycles for employee:
   Query GSI2: GSI2PK = "EMPLOYEE#{employeeId}"

7. Query cycles for supervisor:
   Query GSI3: GSI3PK = "SUPERVISOR#{supervisorId}"
```

**FeedbackRecords Table:**
```
1. Get feedback by ID:
   Query: PK = "FEEDBACK#{feedbackId}" AND SK = "METADATA"

2. Get all responses for feedback:
   Query: PK = "FEEDBACK#{feedbackId}" AND SK begins_with "RESPONSE#"

3. Query feedback for receiver:
   Query GSI1: GSI1PK = "RECEIVER#{receiverId}"

4. Query feedback by giver:
   Query GSI2: GSI2PK = "GIVER#{giverId}"

5. Query feedback for KPI:
   Query GSI3: GSI3PK = "KPI#{kpiId}"

6. Query unresolved feedback for receiver:
   Query GSI4: GSI4PK = "STATUS#CREATED" AND GSI4SK begins_with "RECEIVER#{receiverId}"
```

**EventOutbox Table:**
```
1. Get pending events:
   Query GSI1: GSI1PK = "STATUS#PENDING" ORDER BY GSI1SK ASC

2. Get event by ID:
   Query: PK = "OUTBOX#{id}"
```

### Capacity Planning

**Estimated Read/Write Capacity:**
```
ReviewCycles Table:
- Estimated Item Size: 2-5 KB (with participants and assessments)
- Read Capacity: 50-100 RCU (provisioned) or PAY_PER_REQUEST
- Write Capacity: 20-50 WCU (provisioned) or PAY_PER_REQUEST
- GSI Capacity: Same as base table

FeedbackRecords Table:
- Estimated Item Size: 1-3 KB
- Read Capacity: 100-200 RCU or PAY_PER_REQUEST
- Write Capacity: 50-100 WCU or PAY_PER_REQUEST
- GSI Capacity: Same as base table

EventOutbox Table:
- Estimated Item Size: 2-10 KB
- Read Capacity: 20-50 RCU or PAY_PER_REQUEST
- Write Capacity: 50-100 WCU or PAY_PER_REQUEST
- GSI Capacity: Same as base table

Recommendation: Start with PAY_PER_REQUEST billing mode for flexibility
```

---

## Appendix C: API Endpoint Summary

### Complete Endpoint Reference

**Review Cycles**:
```
GET    /api/v1/performance-management/cycles
POST   /api/v1/performance-management/cycles
GET    /api/v1/performance-management/cycles/{cycleId}
PUT    /api/v1/performance-management/cycles/{cycleId}/complete
```

**Self-Assessments**:
```
POST   /api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/self-assessment
GET    /api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/self-assessment
```

**Manager Assessments**:
```
POST   /api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/manager-assessment
GET    /api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/manager-assessment
GET    /api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/comparison
```

**Feedback**:
```
POST   /api/v1/performance-management/feedback
GET    /api/v1/performance-management/feedback/employee/{employeeId}
GET    /api/v1/performance-management/feedback/{feedbackId}
PUT    /api/v1/performance-management/feedback/{feedbackId}/acknowledge
POST   /api/v1/performance-management/feedback/{feedbackId}/responses
PUT    /api/v1/performance-management/feedback/{feedbackId}/resolve
```

**Health & Monitoring**:
```
GET    /actuator/health
GET    /actuator/metrics
GET    /actuator/prometheus
```

---

## Appendix D: Configuration Reference

### Application Configuration Template

**application.yml**:
```yaml
spring:
  application:
    name: performance-management-service
  
  # DynamoDB Configuration
  cloud:
    aws:
      region:
        static: ${AWS_REGION:us-east-1}
      credentials:
        access-key: ${AWS_ACCESS_KEY_ID:}
        secret-key: ${AWS_SECRET_ACCESS_KEY:}
      dynamodb:
        endpoint: ${DYNAMODB_ENDPOINT:} # For local development with DynamoDB Local
        
# AWS DynamoDB SDK Configuration
aws:
  dynamodb:
    table-prefix: ${DYNAMODB_TABLE_PREFIX:dev-}
    read-capacity: 5
    write-capacity: 5
    billing-mode: PAY_PER_REQUEST # or PROVISIONED
    enable-streams: true
    point-in-time-recovery: true
  
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      properties:
        enable.idempotence: true
    consumer:
      group-id: performance-management-service
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      auto-offset-reset: earliest
      enable-auto-commit: false
      properties:
        spring.json.trusted.packages: "*"
  
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 20
          max-idle: 10
          min-idle: 5

server:
  port: ${SERVER_PORT:8080}
  compression:
    enabled: true
  http2:
    enabled: true

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
  health:
    livenessState:
      enabled: true
    readinessState:
      enabled: true

logging:
  level:
    root: INFO
    com.company.performance: DEBUG
    org.springframework.web: INFO
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

# Custom Application Properties
performance-management:
  kpi-service:
    base-url: ${KPI_SERVICE_URL:http://localhost:8081}
    timeout: 5000
  event:
    outbox:
      polling-interval: 100
      batch-size: 50
      max-retries: 5
  security:
    jwt:
      secret: ${JWT_SECRET:your-secret-key}
      expiration: 3600000
  rate-limit:
    per-user: 100
    per-service: 1000
```

### Environment-Specific Configurations

**application-dev.yml**:
```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true

logging:
  level:
    com.company.performance: DEBUG
    org.springframework: DEBUG
```

**application-staging.yml**:
```yaml
spring:
  jpa:
    show-sql: false

logging:
  level:
    com.company.performance: INFO
    org.springframework: INFO
```

**application-prod.yml**:
```yaml
spring:
  jpa:
    show-sql: false
  
logging:
  level:
    root: WARN
    com.company.performance: INFO
    org.springframework: WARN

management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
```

---

## Appendix E: Monitoring and Alerting Configuration

### Prometheus Alerts

**performance-management-alerts.yml**:
```yaml
groups:
  - name: performance_management_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
      
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"
      
      - alert: DynamoDBThrottling
        expr: rate(aws_dynamodb_user_errors_total{error="ProvisionedThroughputExceededException"}[5m]) > 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "DynamoDB requests being throttled"
          description: "DynamoDB throttling detected at {{ $value }} requests/sec"
      
      - alert: DynamoDBHighLatency
        expr: aws_dynamodb_successful_request_latency_average > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High DynamoDB latency detected"
          description: "Average latency is {{ $value }}ms"
      
      - alert: KafkaConsumerLag
        expr: kafka_consumer_lag > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High Kafka consumer lag"
          description: "Consumer lag is {{ $value }} messages"
      
      - alert: EventOutboxBacklog
        expr: event_outbox_pending_count > 100
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Event outbox has large backlog"
          description: "{{ $value }} events pending in outbox"
```

### Grafana Dashboard Configuration

**Key Metrics to Monitor**:
1. **Application Health**
   - Request rate (requests/sec)
   - Error rate (errors/sec)
   - Response time (p50, p95, p99)
   - Active connections

2. **Database Metrics**
   - Connection pool usage
   - Query execution time
   - Transaction rate
   - Deadlock count

3. **Kafka Metrics**
   - Producer throughput
   - Consumer lag
   - Failed message count
   - Partition distribution

4. **Business Metrics**
   - Self-assessments submitted per hour
   - Manager assessments submitted per hour
   - Feedback provided per hour
   - Review cycles completed per day

5. **Infrastructure Metrics**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network throughput

---

## Summary and Conclusion

### Document Overview

This logical design document provides a comprehensive blueprint for implementing the Performance Management Service (Workshop Version) using Domain-Driven Design principles and modern cloud-native architecture patterns.

### Key Architectural Decisions

1. **Hexagonal Architecture**: Clear separation of concerns with domain at the core
2. **Event-Driven Design**: Kafka-based event streaming with transactional outbox pattern
3. **CQRS Pattern**: Separation of command and query responsibilities
4. **Microservices Architecture**: Independent, scalable service with well-defined boundaries
5. **Cloud-Native Deployment**: Containerized deployment on ECS Fargate with Kubernetes orchestration

### Technology Stack Summary

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Programming Language | Java 17 + Spring Boot 3.x | Mature ecosystem, strong typing, excellent tooling |
| Database | AWS DynamoDB | Fully managed NoSQL, serverless, automatic scaling, single-digit millisecond latency |
| Event Streaming | Apache Kafka | High throughput, durability, scalability |
| Caching | Redis | Fast in-memory caching, distributed support |
| Monitoring | Prometheus + Grafana | Industry standard, rich metrics, flexible dashboards |
| Container Platform | Docker + Kubernetes | Portability, orchestration, scalability |
| Cloud Provider | AWS (ECS Fargate) | Managed containers, serverless compute, rich ecosystem |

### Implementation Readiness

**What's Covered**:
- ✅ Complete domain model implementation guidance
- ✅ Detailed application layer design
- ✅ Infrastructure layer specifications
- ✅ REST API design and security
- ✅ Event-driven architecture patterns
- ✅ Database schema and optimization
- ✅ Monitoring and observability
- ✅ Deployment architecture
- ✅ Comprehensive testing strategy
- ✅ Implementation roadmap with timeline
- ✅ Risk mitigation strategies

**Ready for Development**:
- Development team can start implementation immediately
- All architectural decisions documented and justified
- Clear package structure and coding patterns defined
- Testing strategy and quality gates established
- Deployment pipeline and infrastructure defined

### Workshop Scope Achievement

**User Stories Covered**:
1. ✅ **US-016**: Conduct Self-Assessment - Complete implementation design
2. ✅ **US-017**: Manager Performance Scoring - Complete implementation design
3. ✅ **US-019**: Provide KPI-Specific Feedback - Complete implementation design
4. ✅ **US-020**: Receive Performance Feedback - Complete implementation design

**Acceptance Criteria**:
- All acceptance criteria for the 4 user stories are addressed in the design
- Integration points with KPI Management Service clearly defined
- Event publishing to Data & Analytics Service specified
- Security and authorization requirements covered

### Scalability and Performance

**Design Supports**:
- Horizontal scaling through stateless service design
- Database optimization through proper indexing and connection pooling
- Caching strategy for frequently accessed data
- Asynchronous processing through event-driven architecture
- Load balancing and auto-scaling capabilities

**Performance Targets**:
- API response times: < 500ms (95th percentile)
- Throughput: 100+ requests/second per instance
- Database queries: < 100ms for most operations
- Event processing: < 1 second end-to-end latency

### Security and Compliance

**Security Measures**:
- JWT-based authentication and authorization
- Role-based access control (RBAC)
- API rate limiting and throttling
- Data encryption at rest and in transit
- Audit logging for compliance
- Security headers and CORS configuration

### Extensibility and Future Enhancements

**Design Supports Future Extensions**:
- Review templates (US-014, US-015)
- Calibration tools (US-018)
- Recognition system (US-021, US-022)
- Coaching resources (US-023-026)
- Additional integrations (Slack, Teams)
- Advanced analytics and reporting

**Architectural Flexibility**:
- Clean architecture allows easy addition of new features
- Event-driven design supports new consumers
- Repository pattern allows database changes
- Hexagonal architecture supports new adapters

### Next Steps

**Immediate Actions**:
1. **Team Formation**: Assemble 4-developer team as per roadmap
2. **Environment Setup**: Provision development infrastructure (PostgreSQL, Kafka, Redis)
3. **Repository Setup**: Initialize Git repository with base project structure
4. **Sprint Planning**: Break down implementation roadmap into detailed tasks
5. **Kickoff Workshop**: Conduct 1-day implementation workshop

**Post-Workshop Actions**:
1. **Deployment**: Deploy to staging environment
2. **Testing**: Conduct comprehensive testing (functional, performance, security)
3. **Documentation**: Complete API documentation and runbooks
4. **Training**: Train operations team on monitoring and support
5. **Production Deployment**: Plan and execute production rollout

### Success Criteria Validation

**Technical Success**:
- ✅ All domain model components designed
- ✅ All integration contracts specified
- ✅ Scalability requirements addressed
- ✅ Security requirements met
- ✅ Clear implementation guidance provided
- ✅ All architectural decisions documented

**Business Success**:
- ✅ Supports complete review cycle workflow
- ✅ Enables self-assessment submission
- ✅ Enables manager assessment and scoring
- ✅ Supports KPI-specific feedback
- ✅ Enables feedback response and conversation
- ✅ Provides foundation for future enhancements

### Conclusion

This logical design document provides a production-ready blueprint for implementing the Performance Management Service. The design balances immediate workshop goals (4 user stories in 1 day) with long-term extensibility and scalability requirements.

The architecture leverages industry-standard patterns and technologies, ensuring maintainability, testability, and operational excellence. The comprehensive implementation roadmap provides clear guidance for the development team to execute the workshop successfully.

**The design is complete, validated, and ready for implementation.**

---

**Document Status**: ✅ COMPLETE
**Version**: 1.0
**Date**: December 16, 2025
**Prepared By**: Software Architecture Team
**Approved For**: Workshop Implementation

---

## Document Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-16 | Architecture Team | Initial complete logical design document |

---

**End of Document**
