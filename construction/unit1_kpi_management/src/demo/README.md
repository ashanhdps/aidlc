# KPI Management Service Demo

This demo showcases the KPI Management Service implementation using AWS DynamoDB (local) for data persistence.

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- wget or curl (for downloading DynamoDB Local)

## Quick Start

### Option 1: Automated Demo Script (Recommended)

```bash
# Linux/Mac
./run-demo.sh

# Windows
run-demo.bat
```

This automated script will:
- Check all prerequisites
- Download and start DynamoDB Local
- Build and start the application
- Provide all necessary URLs and credentials

### Option 2: Manual Setup

#### 1. Start Local DynamoDB

```bash
# Make the setup script executable (Linux/Mac)
chmod +x src/demo/setup-local-dynamodb.sh

# Run the setup script
./src/demo/setup-local-dynamodb.sh
```

#### 2. Start the Application

```bash
# Set the demo profile
export SPRING_PROFILES_ACTIVE=demo
export DATABASE_TYPE=dynamodb

# Start the application
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

The application will start on port 8088 with the following endpoints:

- **Swagger UI**: http://localhost:8088/api/v1/swagger-ui.html
- **API Documentation**: http://localhost:8088/api/v1/api-docs
- **Health Check**: http://localhost:8088/api/v1/actuator/health

### 3. Demo Scenarios

The application includes pre-populated demo data with:
- 5 sample KPI definitions across different categories
- Sample employee KPI portfolios
- Demo approval workflows

#### Basic Authentication
Available users with Maker-Checker roles:
- **Admin**: username: `admin`, password: `admin123` (view all, emergency override)
- **HR**: username: `hr`, password: `hr123` (APPROVER - can approve changes)
- **Supervisor**: username: `supervisor`, password: `supervisor123` (MAKER - can create/modify KPIs)
- **Manager**: username: `manager`, password: `manager123` (can assign KPIs to team)
- **Employee**: username: `employee`, password: `employee123` (view own KPIs)

## API Examples

### 1. Get All KPI Definitions
```bash
curl -u admin:admin123 http://localhost:8080/api/v1/kpi-definitions
```

### 2. Create a New KPI Definition
```bash
curl -u admin:admin123 -X POST http://localhost:8080/api/v1/kpi-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Satisfaction Score",
    "description": "Monthly customer satisfaction rating",
    "category": "CUSTOMER_SERVICE",
    "measurementType": "RATING",
    "defaultTarget": {
      "value": 4.5,
      "unit": "stars",
      "comparisonType": "GREATER_THAN_OR_EQUAL"
    },
    "defaultWeight": {
      "percentage": 25.0,
      "flexible": true
    },
    "measurementFrequency": {
      "intervalType": "MONTHLY",
      "intervalValue": 1
    },
    "dataSource": "customer-survey-api"
  }'
```

### 3. Get KPI Definition by ID
```bash
curl -u admin:admin123 http://localhost:8080/api/v1/kpi-definitions/{kpi-id}
```

### 4. Assign KPI to Employee
```bash
curl -u admin:admin123 -X POST http://localhost:8080/api/v1/kpi-assignments \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "emp-001",
    "kpiDefinitionId": "{kpi-id}",
    "customTargetValue": 5000,
    "customTargetUnit": "units",
    "customTargetComparisonType": "GREATER_THAN_OR_EQUAL",
    "customWeightPercentage": 30.0,
    "customWeightIsFlexible": true,
    "effectiveDate": "2024-01-01"
  }'
```

### 5. Get Employee KPI Assignments
```bash
curl -u admin:admin123 http://localhost:8080/api/v1/kpi-assignments/employee/emp-001
```

### 6. Get Assignments for a KPI
```bash
curl -u admin:admin123 http://localhost:8080/api/v1/kpi-assignments/kpi/{kpi-id}
```

### 7. Get Third-Party KPI Data (Sales from Salesforce)
```bash
curl -u admin:admin123 "http://localhost:8080/api/v1/kpi-data/sales/emp-001?startDate=2024-01-01&endDate=2024-01-31"
```

### 8. Get Customer Satisfaction Data
```bash
curl -u admin:admin123 "http://localhost:8080/api/v1/kpi-data/customer-satisfaction/emp-001?startDate=2024-01-01&endDate=2024-01-31"
```

### 9. Get Pending Approval Requests (HR/Checker)
```bash
curl -u hr:hr123 http://localhost:8080/api/v1/approval-workflows/pending
```

### 10. Approve a Change Request (HR/Checker)
```bash
curl -u hr:hr123 -X POST http://localhost:8080/api/v1/approval-workflows/{workflow-id}/approve \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Change approved after review. Meets business requirements."
  }'
```

### 11. View My Submitted Requests (Supervisor/Maker)
```bash
curl -u supervisor:supervisor123 http://localhost:8080/api/v1/approval-workflows/my-requests
```

## DynamoDB Tables

The application creates the following DynamoDB tables:
- `kpi-management-kpi-definitions` - KPI definitions and templates
- `kpi-management-kpi-assignments` - Employee KPI assignments
- `kpi-management-kpi-hierarchy` - Organizational KPI hierarchy (future)
- `kpi-management-ai-suggestions` - AI-generated recommendations (future)
- `kpi-management-approval-workflows` - Approval processes (future)

## Monitoring

- **Metrics**: http://localhost:8080/api/v1/actuator/metrics
- **Health**: http://localhost:8080/api/v1/actuator/health
- **Info**: http://localhost:8080/api/v1/actuator/info

## Stopping the Demo

```bash
# Stop DynamoDB Local
kill $(cat demo/dynamodb.pid)

# Stop the Spring Boot application
Ctrl+C
```

## Architecture Highlights

- **Layered Architecture**: Clean separation with Controller, Service, Repository, and Config layers
- **Spring Boot**: Modern Java framework with auto-configuration and embedded server
- **AWS DynamoDB**: Production-ready NoSQL database with local development support
- **RESTful APIs**: Complete REST API with OpenAPI/Swagger documentation
- **Basic Authentication**: Simple security with multiple user roles
- **Data Validation**: Input validation with detailed error responses

## Demo Workflows

### Currently Implemented:
1. **KPI Definition Management**: Create, update, and manage KPI definitions
2. **Employee KPI Assignment**: Assign KPIs to employees with custom targets and weights
3. **Portfolio Management**: View and manage employee KPI portfolios

### Future Implementation:
4. **Hierarchy Management**: Create organizational KPI hierarchies
5. **AI Suggestions**: Generate and review AI-powered KPI recommendations
6. **Approval Workflows**: Maker-checker approval process for critical changes

### Demo Data:
- 5 sample KPI definitions across different categories
- 5 sample employees (emp-001 to emp-005) with KPI assignments
- Various KPI categories: Sales, Customer Service, Productivity, Marketing, Quality