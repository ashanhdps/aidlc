# Data Analytics Service - Demo Script

## Overview
This demo script demonstrates the complete functionality of the Data Analytics Service for the Employee Performance System. The service provides user management, report generation, and performance data analytics capabilities.

## Prerequisites
- Java 17 installed
- Maven installed
- Port 8080 available

## Starting the Application

1. **Navigate to the project directory:**
   ```bash
   cd construction/data_analytics
   ```

2. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

3. **Verify the application is running:**
   ```bash
   curl http://localhost:8080/api/v1/data-analytics/health
   ```

## Demo Scenarios

### Scenario 1: System Health Check

**Check basic health:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/health"
```

**Check detailed system status:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/health/detailed"
```

**Check system statistics:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/health/stats"
```

### Scenario 2: User Management

**Get all users:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/admin/users"
```

**Get active users only:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/admin/users?activeOnly=true"
```

**Get users by role:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/admin/users?role=EMPLOYEE"
```

**Get user by email:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/admin/users/by-email?email=john.doe@company.com"
```

**Create a new user:**
```bash
curl -X POST "http://localhost:8080/api/v1/data-analytics/admin/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new.employee@company.com",
    "username": "new_employee",
    "role": "EMPLOYEE"
  }'
```

### Scenario 3: Performance Data Management

**Get performance data for an employee:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/performance/employee/john.doe@company.com"
```

**Get performance data with date range:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/performance/employee/john.doe@company.com?startDate=2024-12-01&endDate=2024-12-16"
```

**Get aggregated performance data:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/performance/employee/john.doe@company.com/aggregated?startDate=2024-12-01&endDate=2024-12-16"
```

**Get team performance data:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/performance/team/supervisor@company.com?employeeIds=john.doe@company.com,jane.smith@company.com"
```

**Get organization performance data:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/performance/organization?startDate=2024-12-01&endDate=2024-12-16"
```

**Record new performance data:**
```bash
curl -X POST "http://localhost:8080/api/v1/data-analytics/performance" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "john.doe@company.com",
    "kpiId": "kpi-sales-001",
    "value": 95.5,
    "unit": "points",
    "dataDate": "2024-12-16"
  }'
```

**Get performance statistics:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/performance/statistics?employeeId=john.doe@company.com&kpiId=kpi-sales-001&startDate=2024-12-01&endDate=2024-12-16"
```

**Get performance trends:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/performance/trends?employeeId=john.doe@company.com&kpiId=kpi-sales-001&startDate=2024-12-01&endDate=2024-12-16"
```

### Scenario 4: Report Management

**Get all report templates:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/reports/templates"
```

**Create a new report template:**
```bash
curl -X POST "http://localhost:8080/api/v1/data-analytics/reports/templates" \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "Custom Performance Report",
    "description": "Custom template for performance analysis",
    "configuration": {
      "supportedFormats": ["PDF", "CSV"],
      "estimatedMinutes": 2,
      "requiredParameters": {
        "employeeId": "string",
        "period": "string"
      }
    }
  }'
```

**Generate an ad-hoc report:**
```bash
curl -X POST "http://localhost:8080/api/v1/data-analytics/reports/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "reportName": "Demo Performance Report",
    "format": "PDF",
    "parameters": {
      "employeeId": "john.doe@company.com",
      "startDate": "2024-12-01",
      "endDate": "2024-12-16"
    }
  }'
```

**Get all reports:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/reports"
```

**Get report by status:**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/reports?status=PENDING"
```

**Check report status (replace {reportId} with actual ID):**
```bash
curl -X GET "http://localhost:8080/api/v1/data-analytics/reports/{reportId}/status"
```

**Estimate report generation time:**
```bash
curl -X POST "http://localhost:8080/api/v1/data-analytics/reports/estimate-time" \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "employeeCount": 10,
      "dateRange": "30days"
    }
  }'
```

### Scenario 5: Bulk Operations

**Bulk update performance data:**
```bash
curl -X POST "http://localhost:8080/api/v1/data-analytics/performance/bulk-update" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "employeeId": "john.doe@company.com",
      "kpiId": "kpi-sales-001",
      "value": 88.5,
      "unit": "points",
      "dataDate": "2024-12-16"
    },
    {
      "employeeId": "jane.smith@company.com",
      "kpiId": "kpi-quality-002",
      "value": 92.0,
      "unit": "percentage",
      "dataDate": "2024-12-16"
    }
  ]'
```

## Expected Demo Results

### 1. System Health
- ✅ Service is UP and running
- ✅ All components are healthy
- ✅ Demo data is loaded (6 users, 2 templates, 279+ performance data points)

### 2. User Management
- ✅ 6 demo users created (1 Admin, 1 HR, 1 Supervisor, 3 Employees)
- ✅ Role-based access control working
- ✅ User activation/deactivation working
- ✅ Email uniqueness validation working

### 3. Performance Data
- ✅ 30 days of sample data for 3 employees across 3 KPIs
- ✅ Aggregation and statistics calculations working
- ✅ Date range filtering working
- ✅ Trend analysis working

### 4. Report Generation
- ✅ 2 pre-configured report templates
- ✅ Ad-hoc report generation working
- ✅ Report status tracking working
- ✅ Multiple format support (PDF, CSV, Excel)

### 5. Integration Compliance
- ✅ All API endpoints from integration contract implemented
- ✅ Proper error handling with standardized responses
- ✅ Request validation working
- ✅ CORS enabled for frontend integration

## Key Features Demonstrated

1. **Domain-Driven Design**: Clean separation of concerns with proper aggregates
2. **Event-Driven Architecture**: Domain events published and stored
3. **CQRS Pattern**: Separate command and query operations
4. **In-Memory Storage**: Fast, demo-ready data storage
5. **RESTful APIs**: Complete REST API implementation
6. **Validation**: Comprehensive request validation
7. **Error Handling**: Standardized error responses
8. **Health Monitoring**: System health and statistics endpoints

## Troubleshooting

**If the application fails to start:**
1. Check Java version: `java -version` (should be 17+)
2. Check Maven version: `mvn -version`
3. Check port availability: `netstat -an | grep 8080`
4. Check application logs for specific errors

**If API calls fail:**
1. Verify the application is running: `curl http://localhost:8080/api/v1/data-analytics/health`
2. Check request format and headers
3. Verify the endpoint URL is correct
4. Check application logs for error details

## Next Steps

After the demo, the application can be:
1. **Containerized**: Docker image creation for deployment
2. **Deployed**: ECS Fargate deployment configuration
3. **Secured**: JWT authentication implementation
4. **Tested**: Comprehensive test suite
5. **Monitored**: Production monitoring and alerting

---

**Demo Duration**: 15-20 minutes
**Complexity**: Beginner to Intermediate
**Prerequisites**: Basic REST API knowledge
**Tools**: curl, web browser, or Postman