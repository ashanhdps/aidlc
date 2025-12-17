# Performance Management Service - REST API Documentation

## Base URL
```
http://localhost:8081/api/v1/performance-management
```

## Overview
This REST API provides endpoints for the Performance Management Service covering:
- **US-016**: Submit Self-Assessment
- **US-017**: Submit Manager Assessment  
- **US-019**: Provide Feedback
- **US-020**: Receive and Respond to Feedback

---

## Review Cycle Endpoints

### 1. Get All Review Cycles
**Endpoint**: `GET /cycles`

**Description**: Retrieve all review cycles in the system

**Response**:
```json
{
  "cycles": [
    {
      "cycleId": "cycle-2024-q4",
      "cycleName": "2024 Q4 Performance Review",
      "status": "IN_PROGRESS",
      "participantCount": 2
    }
  ],
  "totalCount": 1
}
```

**cURL Example**:
```bash
curl http://localhost:8081/api/v1/performance-management/cycles
```

---

### 2. Get Review Cycle Details
**Endpoint**: `GET /cycles/{cycleId}`

**Description**: Get detailed information about a specific review cycle

**Response**:
```json
{
  "cycleId": "cycle-2024-q4",
  "cycleName": "2024 Q4 Performance Review",
  "startDate": "2024-10-01",
  "endDate": "2024-12-31",
  "status": "IN_PROGRESS",
  "participantCount": 2
}
```

**cURL Example**:
```bash
curl http://localhost:8081/api/v1/performance-management/cycles/cycle-2024-q4
```

---

### 3. Submit Self-Assessment (US-016)
**Endpoint**: `POST /cycles/{cycleId}/participants/{participantId}/self-assessment`

**Description**: Employee submits their self-assessment for a review cycle

**Request Body**:
```json
{
  "kpiScores": [
    {
      "kpiId": "kpi-001",
      "ratingValue": 4,
      "achievementPercentage": 95.0,
      "comment": "Exceeded expectations on project delivery"
    },
    {
      "kpiId": "kpi-002",
      "ratingValue": 5,
      "achievementPercentage": 100.0,
      "comment": "Led team collaboration initiatives"
    }
  ],
  "comments": "Strong performance this quarter with focus on quality",
  "extraMileEfforts": "Mentored 2 junior developers, improved CI/CD pipeline"
}
```

**Response**:
```json
{
  "message": "Self-assessment submitted successfully",
  "cycleId": "cycle-2024-q4",
  "participantId": "emp-001",
  "status": "SELF_ASSESSMENT_SUBMITTED"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8081/api/v1/performance-management/cycles/cycle-2024-q4/participants/emp-001/self-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "kpiScores": [
      {
        "kpiId": "kpi-001",
        "ratingValue": 4,
        "achievementPercentage": 95.0,
        "comment": "Exceeded expectations"
      }
    ],
    "comments": "Strong performance",
    "extraMileEfforts": "Mentored junior developers"
  }'
```

---

### 4. Submit Manager Assessment (US-017)
**Endpoint**: `POST /cycles/{cycleId}/participants/{participantId}/manager-assessment`

**Description**: Manager submits assessment for an employee

**Request Body**:
```json
{
  "kpiScores": [
    {
      "kpiId": "kpi-001",
      "ratingValue": 4,
      "achievementPercentage": 90.0,
      "comment": "Solid performance with room for growth"
    },
    {
      "kpiId": "kpi-002",
      "ratingValue": 5,
      "achievementPercentage": 100.0,
      "comment": "Exceptional leadership skills"
    }
  ],
  "overallComments": "Strong contributor to team success"
}
```

**Response**:
```json
{
  "message": "Manager assessment submitted successfully",
  "cycleId": "cycle-2024-q4",
  "participantId": "emp-001",
  "finalScore": 4.5,
  "status": "MANAGER_ASSESSMENT_SUBMITTED"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8081/api/v1/performance-management/cycles/cycle-2024-q4/participants/emp-001/manager-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "kpiScores": [
      {
        "kpiId": "kpi-001",
        "ratingValue": 4,
        "achievementPercentage": 90.0,
        "comment": "Solid performance"
      }
    ],
    "overallComments": "Strong contributor"
  }'
```

---

### 5. Complete Review Cycle
**Endpoint**: `PUT /cycles/{cycleId}/complete`

**Description**: Mark a review cycle as completed

**Response**:
```json
{
  "message": "Review cycle completed successfully",
  "cycleId": "cycle-2024-q4",
  "status": "COMPLETED"
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:8081/api/v1/performance-management/cycles/cycle-2024-q4/complete
```

---

## Feedback Endpoints

### 6. Provide Feedback (US-019)
**Endpoint**: `POST /feedback`

**Description**: Provide feedback to another employee

**Headers**:
- `X-User-Id`: ID of the person giving feedback

**Request Body**:
```json
{
  "receiverId": "emp-002",
  "kpiId": "kpi-001",
  "kpiName": "Code Quality",
  "feedbackType": "CONSTRUCTIVE",
  "contentText": "Great attention to detail in code reviews. Consider adding more unit tests."
}
```

**Feedback Types**:
- `POSITIVE`: Positive reinforcement
- `CONSTRUCTIVE`: Areas for improvement
- `DEVELOPMENTAL`: Growth opportunities

**Response**:
```json
{
  "message": "Feedback provided successfully",
  "feedbackId": "feedback-12345",
  "giverId": "emp-001",
  "receiverId": "emp-002",
  "status": "CREATED"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8081/api/v1/performance-management/feedback \
  -H "Content-Type: application/json" \
  -H "X-User-Id: emp-001" \
  -d '{
    "receiverId": "emp-002",
    "kpiId": "kpi-001",
    "kpiName": "Code Quality",
    "feedbackType": "CONSTRUCTIVE",
    "contentText": "Great work on code reviews"
  }'
```

---

### 7. Get Feedback for Employee (US-020)
**Endpoint**: `GET /feedback/employee/{employeeId}`

**Description**: Retrieve all feedback received by an employee

**Response**:
```json
{
  "feedback": [
    {
      "feedbackId": "feedback-12345",
      "giverId": "emp-001",
      "receiverId": "emp-002",
      "kpiId": "kpi-001",
      "kpiName": "Code Quality",
      "feedbackType": "CONSTRUCTIVE",
      "contentText": "Great attention to detail",
      "status": "ACKNOWLEDGED",
      "createdDate": "2024-12-16T10:30:00",
      "responseCount": 1
    }
  ],
  "totalCount": 1
}
```

**cURL Example**:
```bash
curl http://localhost:8081/api/v1/performance-management/feedback/employee/emp-002
```

---

### 8. Get Specific Feedback
**Endpoint**: `GET /feedback/{feedbackId}`

**Description**: Get details of a specific feedback record

**Response**:
```json
{
  "feedbackId": "feedback-12345",
  "giverId": "emp-001",
  "receiverId": "emp-002",
  "kpiId": "kpi-001",
  "kpiName": "Code Quality",
  "feedbackType": "CONSTRUCTIVE",
  "contentText": "Great attention to detail",
  "status": "ACKNOWLEDGED",
  "createdDate": "2024-12-16T10:30:00",
  "responseCount": 1
}
```

**cURL Example**:
```bash
curl http://localhost:8081/api/v1/performance-management/feedback/feedback-12345
```

---

### 9. Acknowledge Feedback (US-020)
**Endpoint**: `PUT /feedback/{feedbackId}/acknowledge`

**Description**: Mark feedback as acknowledged (read)

**Response**:
```json
{
  "message": "Feedback acknowledged successfully",
  "feedbackId": "feedback-12345",
  "status": "ACKNOWLEDGED"
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/feedback-12345/acknowledge
```

---

### 10. Respond to Feedback (US-020)
**Endpoint**: `POST /feedback/{feedbackId}/responses`

**Description**: Add a response to received feedback

**Headers**:
- `X-User-Id`: ID of the person responding

**Request Body**:
```json
{
  "responseText": "Thank you for the feedback. I will focus on adding more unit tests."
}
```

**Response**:
```json
{
  "message": "Response submitted successfully",
  "feedbackId": "feedback-12345",
  "responderId": "emp-002",
  "status": "RESPONDED"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8081/api/v1/performance-management/feedback/feedback-12345/responses \
  -H "Content-Type: application/json" \
  -H "X-User-Id: emp-002" \
  -d '{
    "responseText": "Thank you for the feedback"
  }'
```

---

### 11. Resolve Feedback
**Endpoint**: `PUT /feedback/{feedbackId}/resolve`

**Description**: Mark feedback as resolved

**Response**:
```json
{
  "message": "Feedback resolved successfully",
  "feedbackId": "feedback-12345",
  "status": "RESOLVED"
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:8081/api/v1/performance-management/feedback/feedback-12345/resolve
```

---

### 12. Get Unresolved Feedback
**Endpoint**: `GET /feedback/employee/{employeeId}/unresolved`

**Description**: Get all unresolved feedback for an employee

**Response**:
```json
{
  "feedback": [
    {
      "feedbackId": "feedback-12345",
      "giverId": "emp-001",
      "receiverId": "emp-002",
      "kpiId": "kpi-001",
      "kpiName": "Code Quality",
      "feedbackType": "CONSTRUCTIVE",
      "contentText": "Great attention to detail",
      "status": "ACKNOWLEDGED",
      "createdDate": "2024-12-16T10:30:00",
      "responseCount": 1
    }
  ],
  "totalCount": 1
}
```

**cURL Example**:
```bash
curl http://localhost:8081/api/v1/performance-management/feedback/employee/emp-002/unresolved
```

---

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request**:
```json
{
  "error": "Bad Request",
  "message": "Invalid input data",
  "timestamp": "2024-12-16T10:30:00"
}
```

**404 Not Found**:
```json
{
  "error": "Not Found",
  "message": "Review cycle not found: cycle-123",
  "timestamp": "2024-12-16T10:30:00"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "timestamp": "2024-12-16T10:30:00"
}
```

---

## Testing the API

### Quick Start Test Sequence

1. **Check if server is running**:
```bash
curl http://localhost:8081/api/v1/performance-management/cycles
```

2. **The system starts empty** - you'll get:
```json
{"cycles":[],"totalCount":0}
```

3. **To test with data**, you need to:
   - First create review cycles (currently only possible through demo data)
   - Or use the demo application to populate test data

### Running with Demo Data

To populate the system with test data, you can run the demo:

```bash
# Stop the REST API server first
# Then run the demo to create test data
$env:JAVA_HOME="C:\Program Files\Java\jdk-23"
C:\apache-maven-3.9.11-bin\apache-maven-3.9.11\bin\mvn.cmd exec:java -Dexec.mainClass="com.company.performance.demo.PerformanceManagementDemo"
```

---

## Notes

- All dates are in ISO-8601 format
- All IDs are strings
- Rating values are integers (1-5)
- Achievement percentages are decimals (0.0-100.0)
- The system uses in-memory storage (data is lost on restart)
- No authentication/authorization implemented (PoC level)
