# Data Analytics Service

## Overview
The Data Analytics Service is a Spring Boot microservice that provides user management, performance data analytics, and report generation capabilities for the Employee Performance System. Built using Domain-Driven Design (DDD) principles with clean architecture.

## Features
- 🔐 **User Management**: Complete RBAC with roles (Admin, HR, Supervisor, Employee)
- 📊 **Performance Analytics**: Employee and team performance data management
- 📋 **Report Generation**: Template-based and ad-hoc report generation
- 🎯 **Event-Driven**: Domain events for loose coupling
- 🚀 **RESTful APIs**: Complete REST API with 30+ endpoints
- ✅ **Validation**: Comprehensive request validation
- 🔍 **Health Monitoring**: System health and statistics endpoints

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+

### Running the Application

1. **Clone and navigate to the project:**
   ```bash
   cd construction/data_analytics
   ```

2. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

3. **Verify it's running:**
   ```bash
   curl http://localhost:8080/api/v1/data-analytics/health
   ```

### Demo Data
The application automatically seeds demo data on startup:
- 6 users (Admin, HR, Supervisor, 3 Employees)
- 2 report templates
- 30 days of performance data
- Sample reports

## API Endpoints

### Health & System
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system status
- `GET /health/stats` - System statistics

### User Management
- `GET /admin/users` - List users
- `POST /admin/users` - Create user
- `GET /admin/users/{id}` - Get user by ID
- `PUT /admin/users/{id}` - Update user
- `POST /admin/users/{id}/activate` - Activate user

### Performance Data
- `GET /performance/employee/{id}` - Employee performance data
- `GET /performance/team/{supervisorId}` - Team performance data
- `GET /performance/organization` - Organization metrics
- `POST /performance` - Record performance data
- `POST /performance/bulk-update` - Bulk data update

### Reports
- `POST /reports/generate` - Generate report
- `GET /reports` - List reports
- `GET /reports/{id}/status` - Report status
- `GET /reports/templates` - List templates
- `POST /reports/templates` - Create template

## Architecture

### Domain-Driven Design
- **Aggregates**: UserAccount, Report, PerformanceData
- **Value Objects**: UserId, Email, ReportFormat, MetricValue, etc.
- **Domain Events**: UserAccountCreated, ReportGenerated, etc.
- **Domain Services**: ReportGenerationService, UserAdministrationService

### Clean Architecture Layers
```
┌─────────────────────────────────────────┐
│              API Layer                  │
│  Controllers, DTOs, Exception Handling  │
├─────────────────────────────────────────┤
│           Application Layer             │
│     Services, Mappers, Use Cases       │
├─────────────────────────────────────────┤
│             Domain Layer                │
│   Aggregates, Services, Events, Rules  │
├─────────────────────────────────────────┤
│          Infrastructure Layer           │
│   Repositories, Event Store, Config    │
└─────────────────────────────────────────┘
```

## Technology Stack
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: H2 (in-memory)
- **Build Tool**: Maven
- **Documentation**: PDF/CSV generation with iText/Commons CSV
- **Testing**: JUnit 5, Spring Boot Test

## Demo Script
See [demo/demo-script.md](demo/demo-script.md) for a complete demo walkthrough with curl commands.

## Sample API Calls

### Create a User
```bash
curl -X POST "http://localhost:8080/api/v1/data-analytics/admin/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "username": "test_user",
    "role": "EMPLOYEE"
  }'
```

### Record Performance Data
```bash
curl -X POST "http://localhost:8080/api/v1/data-analytics/performance" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "john.doe@company.com",
    "kpiId": "kpi-sales-001",
    "value": 95.5,
    "unit": "points"
  }'
```

### Generate a Report
```bash
curl -X POST "http://localhost:8080/api/v1/data-analytics/reports/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "reportName": "Performance Report",
    "format": "PDF",
    "parameters": {
      "employeeId": "john.doe@company.com"
    }
  }'
```

## Development

### Running Tests
```bash
mvn test
```

### Building
```bash
mvn clean package
```

### Code Structure
```
src/main/java/com/company/dataanalytics/
├── api/                    # REST controllers and DTOs
├── application/            # Application services
├── domain/                 # Domain model (aggregates, events, services)
├── infrastructure/         # Repositories, configuration
└── DataAnalyticsServiceApplication.java
```

## Integration
This service integrates with:
- **KPI Management Service**: Consumes KPI definitions
- **Performance Management Service**: Provides performance insights
- **Frontend Application**: Serves all UI data needs

## Next Steps
- 🔐 JWT Authentication implementation
- 🐳 Docker containerization
- ☁️ AWS ECS Fargate deployment
- 🧪 Comprehensive test suite
- 📊 Production monitoring

## Support
For questions or issues, please refer to the demo script or check the application logs.