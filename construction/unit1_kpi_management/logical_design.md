# Logical Design for Unit 1: KPI Management Service

## Overview
This document provides a comprehensive logical design for the KPI Management Service, translating the Domain Driven Design (DDD) domain model into a scalable, event-driven software architecture using Java Spring Boot, PostgreSQL, Apache Kafka, and AWS cloud infrastructure.

## Technology Stack
- **Programming Language**: Java 17+ with Spring Boot 3.x
- **Database**: PostgreSQL 15+ with JPA/Hibernate
- **Event Store**: Apache Kafka
- **Caching**: Redis
- **Monitoring**: Prometheus + Grafana
- **Container Platform**: Docker + AWS ECS Fargate
- **Cloud Platform**: AWS
- **API Style**: REST only

## System Architecture

### Hexagonal Architecture Layers

#### 1. Domain Layer (Core)
**Purpose**: Contains pure business logic and domain model
**Components**:
- Aggregates (KPIDefinition, EmployeeKPIPortfolio, KPIHierarchy, AISuggestion, ApprovalWorkflow)
- Entities and Value Objects
- Domain Services and Policies
- Domain Events
- Repository Interfaces

**Dependencies**: None (dependency-free core)

#### 2. Application Layer
**Purpose**: Orchestrates domain operations and use cases
**Components**:
- Application Services (Use Case handlers)
- Command and Query handlers (CQRS)
- DTOs and Mappers
- Integration Services
- Event Publishers

**Dependencies**: Domain Layer only

#### 3. Infrastructure Layer
**Purpose**: Implements technical concerns and external integrations
**Components**:
- Repository Implementations (JPA/Hibernate)
- External Service Clients
- Event Handlers (Kafka consumers/producers)
- Configuration and Security
- Database Migrations

**Dependencies**: Domain and Application Layers

#### 4. Presentation Layer (API)
**Purpose**: Exposes REST APIs and handles HTTP concerns
**Components**:
- REST Controllers
- Request/Response DTOs
- API Documentation (OpenAPI/Swagger)
- Exception Handlers
- Security Filters

**Dependencies**: Application Layer

## Event-Driven Architecture Design

### Apache Kafka Integration

#### Event Store Configuration
**Kafka Topics Structure**:
- `kpi-management.domain-events` - All domain events from aggregates
- `kpi-management.integration-events` - Events for other services
- `kpi-management.dead-letter` - Failed event processing
- `kpi-management.audit` - Audit trail events

#### Event Publishing Patterns
**Transactional Outbox Pattern**:
- Domain events stored in PostgreSQL outbox table within same transaction
- Kafka Connect or dedicated publisher reads outbox and publishes to Kafka
- Ensures exactly-once delivery and consistency

**Event Schema Registry**:
- Avro schemas for all events stored in Confluent Schema Registry
- Backward compatibility enforced for event evolution
- Version management for event schema changes

#### Event Processing Patterns
**Event Sourcing for Aggregates**:
- All aggregate state changes captured as events
- Event replay capability for aggregate reconstruction
- Snapshot storage for performance optimization

**CQRS Implementation**:
- Command side: Processes commands and generates events
- Query side: Consumes events to build read models
- Separate read/write data stores for optimal performance

### Event Flow Architecture

#### Domain Event Flow
1. **Command Processing** → Domain Aggregate → Domain Event Generated
2. **Event Storage** → Outbox Table (PostgreSQL) → Kafka Topic
3. **Event Processing** → Event Handlers → Side Effects (notifications, integrations)
4. **Read Model Updates** → Query Database Updates → Cache Invalidation

#### Integration Event Flow
1. **Cross-Service Events** → Integration Event Publisher → Kafka Integration Topic
2. **External Service Consumption** → Event Transformation → Service-Specific Processing
3. **Response Events** → Return Integration Events → Original Service Processing

## REST API Architecture Design

### API Design Principles
**RESTful Resource Design**:
- Resource-based URLs following REST conventions
- HTTP verbs for operations (GET, POST, PUT, DELETE, PATCH)
- Stateless request/response pattern
- Consistent error handling and status codes

**API Versioning Strategy**:
- URL path versioning: `/api/v1/kpi-management/`
- Backward compatibility maintained for at least 2 versions
- Deprecation notices with migration timeline
- Feature flags for gradual rollout of new versions

### API Structure

#### Base URL Pattern
```
https://api.company.com/api/v1/kpi-management/
```

#### Resource Endpoints Design

**KPI Definitions Resource**:
- `GET /kpis` - List KPI definitions with filtering
- `GET /kpis/{kpiId}` - Get specific KPI definition
- `POST /kpis` - Create new KPI definition
- `PUT /kpis/{kpiId}` - Update KPI definition
- `DELETE /kpis/{kpiId}` - Soft delete KPI definition
- `GET /kpis/{kpiId}/assignments` - Get assignments for KPI

**KPI Assignments Resource**:
- `GET /assignments` - List assignments with filtering
- `GET /assignments/employee/{employeeId}` - Employee's assignments
- `POST /assignments` - Create new assignment
- `PUT /assignments/{assignmentId}` - Update assignment
- `DELETE /assignments/{assignmentId}` - Remove assignment
- `GET /assignments/bulk` - Bulk assignment retrieval

**KPI Hierarchy Resource**:
- `GET /hierarchy` - Get organizational KPI hierarchy
- `POST /hierarchy/cascade` - Trigger cascading operation
- `GET /hierarchy/{nodeId}/children` - Get child nodes
- `POST /hierarchy/relationships` - Create hierarchy relationship

**AI Suggestions Resource**:
- `POST /ai-suggestions/generate` - Generate AI suggestions
- `GET /ai-suggestions` - List pending suggestions
- `PUT /ai-suggestions/{suggestionId}/review` - Review suggestion
- `POST /ai-suggestions/{suggestionId}/implement` - Implement suggestion

**Approval Workflows Resource**:
- `GET /approvals` - List approval requests
- `POST /approvals` - Submit approval request
- `PUT /approvals/{workflowId}/decision` - Make approval decision
- `POST /approvals/{workflowId}/emergency-override` - Emergency override

### API Security Design

#### Authentication & Authorization
**JWT Token-Based Authentication**:
- OAuth 2.0 / OpenID Connect integration
- JWT tokens with appropriate claims and scopes
- Token refresh mechanism for long-lived sessions
- Role-based access control (RBAC) enforcement

**Authorization Levels**:
- `kpi:read` - Read KPI definitions and assignments
- `kpi:write` - Create and update KPIs
- `kpi:assign` - Assign KPIs to employees
- `kpi:approve` - Approve KPI changes
- `kpi:admin` - Full administrative access

#### Rate Limiting & Security
**API Rate Limiting**:
- 1000 requests per minute per service
- 100 requests per minute per user
- Burst allowance for legitimate high-frequency operations
- Rate limit headers in responses

**Security Headers**:
- CORS configuration for frontend domains
- Content Security Policy (CSP) headers
- X-Frame-Options and X-Content-Type-Options
- Request ID tracking for audit and debugging

## Domain Layer Implementation Design

### Aggregate Implementation Structure

#### 1. KPI Definition Aggregate
**Package Structure**: `com.company.kpi.domain.kpidefinition`

**Aggregate Root**: `KPIDefinition`
- Identity: `KPIDefinitionId` (UUID-based value object)
- Invariants: Name uniqueness, valid measurement configuration
- Behaviors: `create()`, `updateMetadata()`, `configureDataSource()`, `archive()`
- Events: `KPIDefinitionCreated`, `KPIDefinitionUpdated`, `KPIDefinitionArchived`

**Entities**:
- `KPITemplate` - Predefined configurations for roles
- `DataSourceConfiguration` - External data source settings

**Value Objects**:
- `KPIName`, `KPIDescription`, `MeasurementType`, `Target`, `Weight`, `Frequency`

**Domain Events**:
- Published via `@DomainEvents` annotation in Spring Data
- Event payload includes aggregate ID and change details
- Automatic event publishing on aggregate save

#### 2. Employee KPI Portfolio Aggregate
**Package Structure**: `com.company.kpi.domain.portfolio`

**Aggregate Root**: `EmployeeKPIPortfolio`
- Identity: `EmployeeId` (external reference)
- Invariants: Assignment date consistency, weight validation rules
- Behaviors: `assignKPI()`, `modifyAssignment()`, `removeAssignment()`, `validatePortfolio()`
- Events: `KPIAssigned`, `KPIAssignmentModified`, `KPIAssignmentRemoved`

**Entities**:
- `KPIAssignment` - Individual KPI assignment with custom targets
- `AssignmentHistory` - Historical changes tracking

**Value Objects**:
- `CustomTarget`, `CustomWeight`, `EffectiveDate`, `AssignmentStatus`

#### 3. KPI Hierarchy Aggregate
**Package Structure**: `com.company.kpi.domain.hierarchy`

**Aggregate Root**: `KPIHierarchy`
- Identity: `HierarchyId` (organization-scoped)
- Invariants: Acyclic relationships, valid hierarchy levels
- Behaviors: `addLevel()`, `createRelationship()`, `executeCascading()`
- Events: `KPIHierarchyCreated`, `KPICascadeTriggered`, `KPICascadeCompleted`

**Entities**:
- `HierarchyNode` - Individual nodes in hierarchy tree
- `CascadeOperation` - Cascading change operations

**Value Objects**:
- `HierarchyLevel`, `CascadeRules`, `CascadeImpact`

#### 4. AI Suggestion Aggregate
**Package Structure**: `com.company.kpi.domain.aisuggestion`

**Aggregate Root**: `AISuggestion`
- Identity: `AISuggestionId` (UUID-based)
- Invariants: Valid confidence score, expiration rules
- Behaviors: `generateSuggestion()`, `reviewSuggestion()`, `provideFeedback()`
- Events: `AISuggestionGenerated`, `AISuggestionReviewed`, `AISuggestionImplemented`

**Entities**:
- `SuggestedKPI` - Individual KPI recommendations
- `FeedbackRecord` - Learning feedback data

**Value Objects**:
- `ConfidenceScore`, `Rationale`, `BenchmarkData`, `SuggestionStatus`

#### 5. Approval Workflow Aggregate
**Package Structure**: `com.company.kpi.domain.approval`

**Aggregate Root**: `ApprovalWorkflow`
- Identity: `ApprovalWorkflowId` (UUID-based)
- Invariants: Maker-checker separation, valid authority levels
- Behaviors: `submitForApproval()`, `makeDecision()`, `emergencyOverride()`
- Events: `ApprovalRequestSubmitted`, `ApprovalDecisionMade`, `EmergencyOverrideExecuted`

**Entities**:
- `ApprovalDecision` - Individual approval decisions
- `ChangeRequest` - Requested changes with justification

**Value Objects**:
- `ChangeData`, `ApprovalStatus`, `Priority`, `DecisionReason`

### Domain Services Implementation

#### KPIValidationService
**Interface**: `com.company.kpi.domain.service.KPIValidationService`
**Implementation**: Stateless Spring service with `@Service` annotation
**Dependencies**: Injected via constructor
**Methods**:
- `ValidationResult validateKPIDefinition(KPIDefinition kpi)`
- `ValidationResult validateAssignmentPortfolio(EmployeeKPIPortfolio portfolio)`
- `ValidationResult validateWeightDistribution(List<KPIAssignment> assignments)`

#### KPICascadingService
**Interface**: `com.company.kpi.domain.service.KPICascadingService`
**Implementation**: Complex business logic for hierarchy operations
**Dependencies**: `KPIHierarchyRepository`, `NotificationService`
**Methods**:
- `CascadeImpact calculateCascadeImpact(HierarchyId id, List<ChangeData> changes)`
- `CascadeResult executeCascading(HierarchyId id, HierarchyNodeId triggerId)`

#### AIRecommendationService
**Interface**: `com.company.kpi.domain.service.AIRecommendationService`
**Implementation**: Integration with ML models and external services
**Dependencies**: `AIModelRepository`, `BenchmarkDataService`
**Methods**:
- `AISuggestion generateKPISuggestions(String jobTitle, String department)`
- `void processLearningFeedback(AISuggestionId id, FeedbackData feedback)`

### Repository Interface Design

#### Base Repository Pattern
**Generic Interface**: `com.company.kpi.domain.repository.Repository<T, ID>`
**Methods**: `save(T aggregate)`, `findById(ID id)`, `delete(ID id)`
**Event Publishing**: Automatic domain event publishing on save operations

#### Specific Repository Interfaces

**IKPIDefinitionRepository**:
```java
public interface IKPIDefinitionRepository extends Repository<KPIDefinition, KPIDefinitionId> {
    Optional<KPIDefinition> findByName(String name, OrganizationId orgId);
    List<KPIDefinition> findByCategory(KPICategory category);
    List<KPIDefinition> findActiveDefinitions(OrganizationId orgId);
    boolean existsByName(String name, OrganizationId orgId);
}
```

**IEmployeeKPIPortfolioRepository**:
```java
public interface IEmployeeKPIPortfolioRepository extends Repository<EmployeeKPIPortfolio, EmployeeId> {
    List<KPIAssignment> findAssignmentsByKPI(KPIDefinitionId kpiId);
    List<EmployeeKPIPortfolio> findPortfoliosByManager(UserId managerId);
    Optional<KPIAssignment> findActiveAssignment(EmployeeId empId, KPIDefinitionId kpiId);
}
```

**IKPIHierarchyRepository**:
```java
public interface IKPIHierarchyRepository extends Repository<KPIHierarchy, HierarchyId> {
    Optional<KPIHierarchy> findByOrganization(OrganizationId orgId);
    List<HierarchyNode> findChildNodes(HierarchyNodeId parentId);
    List<HierarchyNode> findHierarchyPath(HierarchyNodeId fromId, HierarchyNodeId toId);
}
```

## Application Layer Implementation Design

### CQRS Pattern Implementation

#### Command Side Design
**Command Handler Pattern**:
- `@Component` annotated command handlers
- One handler per command type
- Transactional boundary management
- Domain event publishing

**Command Objects**:
```java
// Example command structure
public class CreateKPIDefinitionCommand {
    private final String name;
    private final String description;
    private final KPICategory category;
    private final MeasurementType measurementType;
    private final Target defaultTarget;
    // Constructor, getters, validation
}
```

**Command Handler Example**:
```java
@Component
@Transactional
public class CreateKPIDefinitionCommandHandler {
    
    public KPIDefinitionId handle(CreateKPIDefinitionCommand command) {
        // 1. Validate command
        // 2. Load required aggregates
        // 3. Execute domain operation
        // 4. Save aggregate (events published automatically)
        // 5. Return result
    }
}
```

#### Query Side Design
**Query Handler Pattern**:
- Separate read models optimized for queries
- `@Repository` annotated query repositories
- Direct database access for performance
- Caching integration with Redis

**Query Objects**:
```java
public class GetEmployeeKPIsQuery {
    private final EmployeeId employeeId;
    private final LocalDate effectiveDate;
    private final boolean includeInactive;
    // Constructor, getters
}
```

**Read Model Design**:
- Denormalized views for common queries
- PostgreSQL materialized views for complex aggregations
- Redis caching for frequently accessed data
- Event-driven read model updates

### Application Services Design

#### KPIManagementApplicationService
**Responsibilities**:
- Orchestrate KPI definition operations
- Handle complex multi-aggregate operations
- Coordinate with external services
- Manage transaction boundaries

**Key Methods**:
- `KPIDefinitionId createKPIDefinition(CreateKPIDefinitionCommand cmd)`
- `void updateKPIDefinition(UpdateKPIDefinitionCommand cmd)`
- `void assignKPIToEmployee(AssignKPICommand cmd)`
- `void processAISuggestions(ProcessAISuggestionsCommand cmd)`

#### IntegrationApplicationService
**Responsibilities**:
- Handle integration with external services
- Process incoming integration events
- Publish outbound integration events
- Manage external service failures

**Integration Patterns**:
- Circuit breaker for external service calls
- Retry mechanisms with exponential backoff
- Fallback strategies for service unavailability
- Correlation ID tracking for distributed tracing

## Infrastructure Layer Implementation Design

### Database Design (PostgreSQL + JPA/Hibernate)

#### Database Schema Design

**Aggregate Tables Structure**:

**kpi_definitions Table**:
```sql
CREATE TABLE kpi_definitions (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    measurement_type VARCHAR(50) NOT NULL,
    default_target_value DECIMAL(10,2),
    default_target_unit VARCHAR(50),
    default_weight DECIMAL(5,2),
    measurement_frequency VARCHAR(20) NOT NULL,
    data_source_config JSONB,
    organization_id UUID NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(name, organization_id)
);
```

**employee_kpi_portfolios Table**:
```sql
CREATE TABLE employee_kpi_portfolios (
    employee_id UUID PRIMARY KEY,
    total_weight DECIMAL(5,2),
    portfolio_status VARCHAR(50),
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1
);
```

**kpi_assignments Table**:
```sql
CREATE TABLE kpi_assignments (
    id UUID PRIMARY KEY,
    employee_id UUID REFERENCES employee_kpi_portfolios(employee_id),
    kpi_definition_id UUID REFERENCES kpi_definitions(id),
    custom_target_value DECIMAL(10,2),
    custom_target_unit VARCHAR(50),
    custom_weight DECIMAL(5,2),
    effective_date DATE NOT NULL,
    end_date DATE,
    assigned_by UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, kpi_definition_id, effective_date)
);
```

**Event Store Tables**:
```sql
-- Outbox pattern for reliable event publishing
CREATE TABLE domain_events_outbox (
    id UUID PRIMARY KEY,
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    event_version INTEGER NOT NULL,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed BOOLEAN DEFAULT false
);

-- Event sourcing store
CREATE TABLE event_store (
    id UUID PRIMARY KEY,
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    event_version INTEGER NOT NULL,
    sequence_number BIGSERIAL,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    correlation_id UUID,
    causation_id UUID
);
```

#### JPA Entity Mapping Strategy

**Aggregate Root Mapping**:
```java
@Entity
@Table(name = "kpi_definitions")
public class KPIDefinitionEntity {
    @Id
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    private KPICategory category;
    
    @Embedded
    private TargetValue defaultTarget;
    
    @Convert(converter = DataSourceConfigConverter.class)
    private DataSourceConfig dataSourceConfig;
    
    @Version
    private Integer version;
    
    // JPA lifecycle callbacks for domain events
    @PostPersist
    @PostUpdate
    @PostRemove
    private void publishDomainEvents() {
        // Publish domain events via Spring Application Events
    }
}
```

**Value Object Embedding**:
```java
@Embeddable
public class TargetValue {
    @Column(name = "target_value")
    private BigDecimal value;
    
    @Column(name = "target_unit")
    private String unit;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "comparison_type")
    private ComparisonType comparisonType;
}
```

#### Repository Implementation Pattern

**Base Repository Implementation**:
```java
@Repository
@Transactional
public abstract class BaseJpaRepository<T, ID> implements Repository<T, ID> {
    
    @PersistenceContext
    protected EntityManager entityManager;
    
    @Override
    public void save(T aggregate) {
        entityManager.merge(aggregate);
        // Domain events published via JPA lifecycle callbacks
    }
    
    @Override
    public Optional<T> findById(ID id) {
        return Optional.ofNullable(entityManager.find(getEntityClass(), id));
    }
    
    protected abstract Class<T> getEntityClass();
}
```

### Caching Strategy (Redis)

#### Cache Configuration
**Redis Setup**:
- AWS ElastiCache for Redis cluster
- Spring Data Redis with Lettuce client
- JSON serialization for complex objects
- TTL-based expiration policies

**Caching Patterns**:

**Read-Through Cache**:
```java
@Cacheable(value = "kpi-definitions", key = "#id")
public Optional<KPIDefinition> findById(KPIDefinitionId id) {
    // Database lookup if not in cache
}
```

**Write-Through Cache**:
```java
@CacheEvict(value = "kpi-definitions", key = "#kpi.id")
public void save(KPIDefinition kpi) {
    // Save to database and invalidate cache
}
```

**Cache-Aside for Complex Queries**:
```java
@Service
public class KPIQueryService {
    
    public List<KPIAssignment> getEmployeeAssignments(EmployeeId employeeId) {
        String cacheKey = "employee-assignments:" + employeeId;
        List<KPIAssignment> cached = redisTemplate.opsForValue().get(cacheKey);
        
        if (cached == null) {
            cached = repository.findByEmployeeId(employeeId);
            redisTemplate.opsForValue().set(cacheKey, cached, Duration.ofMinutes(15));
        }
        
        return cached;
    }
}
```

#### Cache Invalidation Strategy
**Event-Driven Invalidation**:
- Domain events trigger cache invalidation
- Selective invalidation based on affected data
- Bulk invalidation for hierarchy changes
- Cache warming for frequently accessed data

### Event Processing (Apache Kafka)

#### Kafka Configuration
**Producer Configuration**:
```java
@Configuration
public class KafkaProducerConfig {
    
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaBootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        props.put(ProducerConfig.ACKS_CONFIG, "all"); // Ensure durability
        props.put(ProducerConfig.RETRIES_CONFIG, 3);
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        return new DefaultKafkaProducerFactory<>(props);
    }
}
```

**Consumer Configuration**:
```java
@Configuration
public class KafkaConsumerConfig {
    
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaBootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "kpi-management-service");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false); // Manual commit for reliability
        return new DefaultKafkaConsumerFactory<>(props);
    }
}
```

#### Event Publishing Implementation
**Outbox Pattern Publisher**:
```java
@Component
public class OutboxEventPublisher {
    
    @EventListener
    @Async
    public void handleDomainEvent(DomainEvent event) {
        // Store in outbox table within same transaction
        OutboxEvent outboxEvent = new OutboxEvent(
            event.getAggregateId(),
            event.getClass().getSimpleName(),
            event,
            event.getOccurredAt()
        );
        
        outboxRepository.save(outboxEvent);
    }
    
    @Scheduled(fixedDelay = 5000) // Every 5 seconds
    public void publishPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxRepository.findUnprocessedEvents();
        
        for (OutboxEvent event : pendingEvents) {
            try {
                kafkaTemplate.send("kpi-management.domain-events", event.getEventData());
                event.markAsProcessed();
                outboxRepository.save(event);
            } catch (Exception e) {
                // Log error and retry later
                log.error("Failed to publish event: {}", event.getId(), e);
            }
        }
    }
}
```

#### Event Consumer Implementation
```java
@Component
public class IntegrationEventConsumer {
    
    @KafkaListener(topics = "performance-management.review-completed")
    public void handleReviewCompleted(ReviewCompletedEvent event) {
        try {
            // Process integration event
            integrationService.handleReviewCompleted(event);
            
            // Manual commit after successful processing
            acknowledgment.acknowledge();
        } catch (Exception e) {
            // Error handling - send to dead letter topic
            log.error("Failed to process review completed event", e);
            throw e; // Trigger retry mechanism
        }
    }
}
```

## Security and Cross-Cutting Concerns

### Security Implementation

#### JWT Authentication
**Spring Security Configuration**:
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/v1/kpi-management/kpis/**").hasAuthority("kpi:read")
                .requestMatchers(HttpMethod.POST, "/api/v1/kpi-management/kpis").hasAuthority("kpi:write")
                .requestMatchers("/api/v1/kpi-management/assignments/**").hasAuthority("kpi:assign")
                .requestMatchers("/api/v1/kpi-management/approvals/**").hasAuthority("kpi:approve")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        
        return http.build();
    }
}
```

#### Role-Based Access Control
**Authority Mapping**:
- `kpi:read` - View KPI definitions and assignments
- `kpi:write` - Create and update KPI definitions
- `kpi:assign` - Assign KPIs to employees (Supervisors)
- `kpi:approve` - Approve KPI changes (HR)
- `kpi:admin` - Full administrative access (Admin)

**Method-Level Security**:
```java
@PreAuthorize("hasAuthority('kpi:assign') and @securityService.canAssignToEmployee(#command.employeeId)")
public void assignKPI(AssignKPICommand command) {
    // Implementation
}
```

### Monitoring and Observability (Prometheus)

#### Metrics Configuration
**Custom Metrics**:
```java
@Component
public class KPIMetrics {
    
    private final Counter kpiCreatedCounter = Counter.builder("kpi_definitions_created_total")
        .description("Total number of KPI definitions created")
        .register(Metrics.globalRegistry);
    
    private final Timer assignmentProcessingTime = Timer.builder("kpi_assignment_processing_duration")
        .description("Time taken to process KPI assignments")
        .register(Metrics.globalRegistry);
    
    private final Gauge activeAssignmentsGauge = Gauge.builder("kpi_assignments_active")
        .description("Number of active KPI assignments")
        .register(Metrics.globalRegistry, this, KPIMetrics::getActiveAssignmentsCount);
}
```

**Health Checks**:
```java
@Component
public class KPIHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        try {
            // Check database connectivity
            repository.findById(KPIDefinitionId.of("health-check"));
            
            // Check Kafka connectivity
            kafkaTemplate.send("health-check", "ping").get(5, TimeUnit.SECONDS);
            
            // Check Redis connectivity
            redisTemplate.opsForValue().get("health-check");
            
            return Health.up()
                .withDetail("database", "UP")
                .withDetail("kafka", "UP")
                .withDetail("redis", "UP")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

### Logging Strategy
**Structured Logging**:
```java
@Slf4j
@Component
public class KPIApplicationService {
    
    public KPIDefinitionId createKPI(CreateKPICommand command) {
        MDC.put("operation", "create-kpi");
        MDC.put("userId", command.getCreatedBy().toString());
        
        try {
            log.info("Creating KPI definition: name={}, category={}", 
                command.getName(), command.getCategory());
            
            KPIDefinitionId result = kpiService.createKPI(command);
            
            log.info("KPI definition created successfully: id={}", result);
            return result;
            
        } catch (Exception e) {
            log.error("Failed to create KPI definition: name={}", command.getName(), e);
            throw e;
        } finally {
            MDC.clear();
        }
    }
}
```

## Deployment and DevOps Design

### Containerization (Docker + AWS ECS Fargate)

#### ECS Fargate Architecture Benefits
**Serverless Container Management**:
- **No Infrastructure Management**: No EC2 instances to manage or patch
- **Automatic Scaling**: Built-in auto-scaling based on CPU/memory utilization
- **Pay-per-Use**: Only pay for the compute resources your containers actually use
- **High Availability**: Automatic distribution across multiple AZs
- **Security**: Isolated compute environment per task
- **Integration**: Native integration with AWS services (ALB, CloudWatch, Secrets Manager)

**Fargate vs Kubernetes Advantages**:
- **Reduced Operational Overhead**: No cluster management or node provisioning
- **Faster Deployment**: Simplified deployment process without Kubernetes complexity
- **Cost Optimization**: No idle EC2 instances, pay only for running tasks
- **AWS Native**: Better integration with AWS security and monitoring services
- **Simplified Networking**: VPC networking without complex CNI configurations

#### Docker Configuration
**Dockerfile**:
```dockerfile
FROM openjdk:17-jre-slim

# Create application user
RUN addgroup --system spring && adduser --system spring --ingroup spring

# Copy application
COPY target/kpi-management-service.jar app.jar

# Set ownership
RUN chown spring:spring app.jar

USER spring:spring

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app.jar"]
```

#### ECS Fargate Task Definition
**Task Definition (JSON)**:
```json
{
  "family": "kpi-management-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/kpiManagementTaskRole",
  "containerDefinitions": [
    {
      "name": "kpi-management-service",
      "image": "account.dkr.ecr.region.amazonaws.com/kpi-management-service:latest",
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
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:kpi-db-credentials"
        }
      ],
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:8080/actuator/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/kpi-management-service",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

**ECS Service Configuration**:
```json
{
  "serviceName": "kpi-management-service",
  "cluster": "kpi-management-cluster",
  "taskDefinition": "kpi-management-service:1",
  "desiredCount": 3,
  "launchType": "FARGATE",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": [
        "subnet-12345678",
        "subnet-87654321"
      ],
      "securityGroups": [
        "sg-kpi-management"
      ],
      "assignPublicIp": "DISABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:region:account:targetgroup/kpi-management-tg",
      "containerName": "kpi-management-service",
      "containerPort": 8080
    }
  ],
  "deploymentConfiguration": {
    "maximumPercent": 200,
    "minimumHealthyPercent": 50,
    "deploymentCircuitBreaker": {
      "enable": true,
      "rollback": true
    }
  }
}
```

### AWS Infrastructure Design

#### AWS Services Architecture
**Core Services**:
- **ECS Fargate** - Serverless container orchestration
- **RDS PostgreSQL** - Primary database with Multi-AZ deployment
- **ElastiCache Redis** - Caching layer
- **MSK (Managed Streaming for Kafka)** - Event streaming
- **ALB (Application Load Balancer)** - Load balancing and SSL termination
- **Route 53** - DNS management
- **CloudWatch** - Monitoring and logging
- **Secrets Manager** - Secrets and configuration management
- **ECR (Elastic Container Registry)** - Container image repository

**Infrastructure as Code (Terraform)**:
```hcl
# ECS Cluster
resource "aws_ecs_cluster" "kpi_management" {
  name = "kpi-management-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
  
  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight           = 1
  }
}

# ECS Service
resource "aws_ecs_service" "kpi_management_service" {
  name            = "kpi-management-service"
  cluster         = aws_ecs_cluster.kpi_management.id
  task_definition = aws_ecs_task_definition.kpi_management.arn
  desired_count   = 3
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_groups = [aws_security_group.ecs_service.id]
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.kpi_management.arn
    container_name   = "kpi-management-service"
    container_port   = 8080
  }
  
  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 50
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "kpi_database" {
  identifier = "kpi-management-db"
  engine     = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.large"
  allocated_storage = 100
  storage_encrypted = true
  
  db_name  = "kpi_management"
  username = "kpi_admin"
  password = random_password.db_password.result
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  multi_az = true
  
  tags = {
    Name = "KPI Management Database"
  }
}
```

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up project structure and build configuration
- [ ] Implement domain model (aggregates, entities, value objects)
- [ ] Set up PostgreSQL database and JPA mappings
- [ ] Implement basic repository interfaces
- [ ] Set up Spring Boot application with basic configuration

### Phase 2: Core Functionality (Weeks 3-4)
- [ ] Implement KPI Definition aggregate and services
- [ ] Implement Employee KPI Portfolio aggregate
- [ ] Set up REST API controllers and DTOs
- [ ] Implement basic CRUD operations
- [ ] Add input validation and error handling

### Phase 3: Advanced Features (Weeks 5-6)
- [ ] Implement KPI Hierarchy and cascading logic
- [ ] Add AI Suggestion aggregate and services
- [ ] Implement Approval Workflow aggregate
- [ ] Set up event sourcing and CQRS patterns
- [ ] Add Redis caching layer

### Phase 4: Integration and Events (Weeks 7-8)
- [ ] Set up Apache Kafka integration
- [ ] Implement event publishing and consumption
- [ ] Add integration with external services
- [ ] Implement outbox pattern for reliable messaging
- [ ] Add circuit breakers and retry mechanisms

### Phase 5: Security and Monitoring (Weeks 9-10)
- [ ] Implement JWT authentication and authorization
- [ ] Add role-based access control
- [ ] Set up Prometheus metrics and monitoring
- [ ] Implement structured logging
- [ ] Add health checks and readiness probes

### Phase 6: Testing and Quality (Weeks 11-12)
- [ ] Implement comprehensive unit tests
- [ ] Add integration tests with test containers
- [ ] Set up contract testing with other services
- [ ] Implement performance and load testing
- [ ] Add code quality gates and static analysis

### Phase 7: Deployment and DevOps (Weeks 13-14)
- [ ] Create Docker containers and ECS Fargate task definitions
- [ ] Set up AWS infrastructure with Terraform (ECS, ALB, RDS, ElastiCache)
- [ ] Implement CI/CD pipelines with CodePipeline and CodeBuild
- [ ] Set up monitoring and alerting with CloudWatch and Prometheus
- [ ] Conduct end-to-end testing in staging environment

### Phase 8: Production Readiness (Weeks 15-16)
- [ ] Performance tuning and optimization
- [ ] Security hardening and penetration testing
- [ ] Disaster recovery testing
- [ ] Documentation and runbook creation
- [ ] Production deployment and go-live support

## Risk Mitigation Strategies

### Technical Risks
1. **Event Ordering Issues**: Implement event versioning and idempotent processing
2. **Database Performance**: Use connection pooling, query optimization, and read replicas
3. **Kafka Message Loss**: Configure proper acknowledgments and replication
4. **Cache Inconsistency**: Implement proper cache invalidation strategies
5. **Service Dependencies**: Use circuit breakers and graceful degradation

### Operational Risks
1. **Deployment Failures**: Implement blue-green deployments and automated rollbacks
2. **Data Migration Issues**: Use database migration tools and backup strategies
3. **Monitoring Blind Spots**: Comprehensive metrics and alerting coverage
4. **Security Vulnerabilities**: Regular security scans and dependency updates
5. **Scalability Bottlenecks**: Load testing and auto-scaling configuration

---
**Status**: LOGICAL DESIGN COMPLETED
**Last Updated**: December 15, 2025
**Implementation Ready**: All architectural components defined with clear implementation guidance