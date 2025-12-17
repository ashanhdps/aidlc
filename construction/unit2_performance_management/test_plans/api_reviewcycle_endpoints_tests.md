# API Layer Test Plan: Review Cycle Endpoints
## Unit 2: Performance Management Service

**Document Version**: 1.0  
**Date**: December 16, 2024  
**Test Focus**: REST API endpoints for Review Cycle operations

---

## 1. Test Scope

### 1.1 Endpoints Under Test

**Review Cycle Management:**
- `POST /api/v1/performance-management/cycles` - Create review cycle
- `GET /api/v1/performance-management/cycles` - List review cycles
- `GET /api/v1/performance-management/cycles/{cycleId}` - Get cycle details
- `PUT /api/v1/performance-management/cycles/{cycleId}/complete` - Complete cycle

**Self-Assessment (US-016):**
- `POST /api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/self-assessment` - Submit self-assessment
- `GET /api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/self-assessment` - Get self-assessment

**Manager Assessment (US-017):**
- `POST /api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/manager-assessment` - Submit manager assessment
- `GET /api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/manager-assessment` - Get manager assessment
- `GET /api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/comparison` - Compare assessments

### 1.2 User Stories Covered
- **US-016**: Conduct Self-Assessment
- **US-017**: Manager Performance Scoring

### 1.3 Test Categories
- Request/Response validation
- Authentication and authorization
- Error handling
- Rate limiting
- CORS and security headers
- Performance benchmarks

---

## 2. Test Strategy

### 2.1 Test Approach
- **Spring MockMvc**: Controller layer testing with full Spring context
- **REST Assured**: Full HTTP integration testing
- **WireMock**: Mock external KPI Management Service
- **TestContainers**: DynamoDB and Kafka for integration

### 2.2 Test Framework
- **JUnit 5**: Test framework
- **Spring Boot Test**: Spring integration
- **REST Assured**: API testing
- **JSON Path**: Response validation
- **Hamcrest**: Matchers

### 2.3 Test Coverage Targets
- **Endpoint Coverage**: 100%
- **Status Code Coverage**: All expected codes
- **Error Scenario Coverage**: 95%

---

## 3. Create Review Cycle Tests

### 3.1 POST /cycles - Create Review Cycle

**TC-API-RC-CREATE-001: Create cycle with valid data (HR role)**
```
Given: Authenticated as HR user
  And: Valid request body with cycle name, dates, participants
When: POST /cycles
Then:
  - Status: 201 Created
  - Response contains cycleId, cycleName, status=Active, createdAt
  - Location header contains cycle URL
```

**TC-API-RC-CREATE-002: Reject creation without authentication**
```
Given: No authentication token
When: POST /cycles
Then:
  - Status: 401 Unauthorized
  - Response contains error code AUTHENTICATION_REQUIRED
```

**TC-API-RC-CREATE-003: Reject creation with insufficient permissions**
```
Given: Authenticated as EMPLOYEE user
When: POST /cycles
Then:
  - Status: 403 Forbidden
  - Response contains error code INSUFFICIENT_PERMISSIONS
```

**TC-API-RC-CREATE-004: Reject invalid request body**
```
Given: Authenticated as HR
  And: Request body with missing cycleName
When: POST /cycles
Then:
  - Status: 400 Bad Request
  - Response contains validation errors
```

**TC-API-RC-CREATE-005: Reject end date before start date**
```
Given: Authenticated as HR
  And: End date is before start date
When: POST /cycles
Then:
  - Status: 400 Bad Request
  - Response contains error message about invalid dates
```

**TC-API-RC-CREATE-006: Rate limiting enforcement**
```
Given: Authenticated as HR
When: POST /cycles called 11 times in 1 hour
Then:
  - First 10 requests: 201 Created
  - 11th request: 429 Too Many Requests
  - Response contains X-RateLimit-* headers
```

---

## 4. List Review Cycles Tests

### 4.1 GET /cycles - List Review Cycles

**TC-API-RC-LIST-001: List all cycles (HR role)**
```
Given: Authenticated as HR user
  And: 5 review cycles exist
When: GET /cycles
Then:
  - Status: 200 OK
  - Response contains array of 5 cycles
  - Each cycle has cycleId, cycleName, status, dates
```

**TC-API-RC-LIST-002: Filter by status**
```
Given: Authenticated as HR
  And: Cycles with various statuses exist
When: GET /cycles?status=Active
Then:
  - Status: 200 OK
  - Response contains only Active cycles
```

**TC-API-RC-LIST-003: Filter by date range**
```
Given: Authenticated as HR
When: GET /cycles?startDate=2024-01-01&endDate=2024-12-31
Then:
  - Status: 200 OK
  - Response contains cycles within date range
```

**TC-API-RC-LIST-004: Employee sees only own cycles**
```
Given: Authenticated as EMPLOYEE
  And: Employee is participant in 2 cycles
When: GET /cycles
Then:
  - Status: 200 OK
  - Response contains only 2 cycles where employee is participant
```

**TC-API-RC-LIST-005: Supervisor sees direct reports' cycles**
```
Given: Authenticated as SUPERVISOR
  And: Supervisor has 3 direct reports
When: GET /cycles
Then:
  - Status: 200 OK
  - Response contains cycles for supervisor's direct reports
```

**TC-API-RC-LIST-006: Pagination support**
```
Given: Authenticated as HR
  And: 25 cycles exist
When: GET /cycles?page=0&pageSize=10
Then:
  - Status: 200 OK
  - Response contains 10 cycles
  - Response includes totalCount=25, page=0, pageSize=10
```

---

## 5. Get Review Cycle Details Tests

### 5.1 GET /cycles/{cycleId} - Get Cycle Details

**TC-API-RC-GET-001: Get cycle details (HR role)**
```
Given: Authenticated as HR
  And: Cycle exists with ID {cycleId}
When: GET /cycles/{cycleId}
Then:
  - Status: 200 OK
  - Response contains full cycle details
  - Response includes participants array
```

**TC-API-RC-GET-002: Get cycle details (Employee - own cycle)**
```
Given: Authenticated as EMPLOYEE
  And: Employee is participant in cycle
When: GET /cycles/{cycleId}
Then:
  - Status: 200 OK
  - Response contains cycle details
```

**TC-API-RC-GET-003: Reject access to non-participant cycle**
```
Given: Authenticated as EMPLOYEE
  And: Employee is NOT participant in cycle
When: GET /cycles/{cycleId}
Then:
  - Status: 403 Forbidden
  - Response contains error code INSUFFICIENT_PERMISSIONS
```

**TC-API-RC-GET-004: Handle non-existent cycle**
```
Given: Authenticated as HR
  And: Cycle ID does not exist
When: GET /cycles/{invalidCycleId}
Then:
  - Status: 404 Not Found
  - Response contains error code RESOURCE_NOT_FOUND
```

**TC-API-RC-GET-005: Handle invalid UUID format**
```
Given: Authenticated as HR
When: GET /cycles/invalid-uuid-format
Then:
  - Status: 400 Bad Request
  - Response contains validation error
```

---

## 6. Submit Self-Assessment Tests (US-016)

### 6.1 POST /cycles/{cycleId}/participants/{participantId}/self-assessment

**TC-API-RC-SELF-001: Submit valid self-assessment**
```
Given: Authenticated as EMPLOYEE
  And: Employee is participant in active cycle
  And: Valid request body with kpiScores, comments, extraMileEfforts
When: POST /cycles/{cycleId}/participants/{participantId}/self-assessment
Then:
  - Status: 201 Created
  - Response contains assessmentId, participantId, submittedDate
  - Response contains status=SelfAssessmentSubmitted
```

**TC-API-RC-SELF-002: Validate KPI scores structure**
```
Given: Authenticated as EMPLOYEE
  And: Request body with valid KPI scores array
When: POST self-assessment
Then:
  - Status: 201 Created
  - Each KPI score has kpiId, ratingValue, achievementPercentage, comment
```

**TC-API-RC-SELF-003: Reject invalid rating value**
```
Given: Authenticated as EMPLOYEE
  And: Request body with ratingValue=6.0 (exceeds max)
When: POST self-assessment
Then:
  - Status: 400 Bad Request
  - Response contains validation error for rating range
```

**TC-API-RC-SELF-004: Reject invalid achievement percentage**
```
Given: Authenticated as EMPLOYEE
  And: Request body with achievementPercentage=150 (exceeds max)
When: POST self-assessment
Then:
  - Status: 400 Bad Request
  - Response contains validation error for achievement range
```

**TC-API-RC-SELF-005: Reject empty KPI scores**
```
Given: Authenticated as EMPLOYEE
  And: Request body with empty kpiScores array
When: POST self-assessment
Then:
  - Status: 400 Bad Request
  - Response contains error about required KPI scores
```

**TC-API-RC-SELF-006: Reject duplicate submission**
```
Given: Authenticated as EMPLOYEE
  And: Self-assessment already submitted
When: POST self-assessment again
Then:
  - Status: 409 Conflict
  - Response contains error code SELF_ASSESSMENT_ALREADY_SUBMITTED
```

**TC-API-RC-SELF-007: Reject submission for wrong participant**
```
Given: Authenticated as EMPLOYEE (User A)
  And: Participant ID belongs to User B
When: POST self-assessment
Then:
  - Status: 403 Forbidden
  - Response contains error code INSUFFICIENT_PERMISSIONS
```

**TC-API-RC-SELF-008: Reject submission for completed cycle**
```
Given: Authenticated as EMPLOYEE
  And: Review cycle is Completed
When: POST self-assessment
Then:
  - Status: 409 Conflict
  - Response contains error about cycle status
```

**TC-API-RC-SELF-009: Include extra mile efforts**
```
Given: Authenticated as EMPLOYEE
  And: Request includes extraMileEfforts field
When: POST self-assessment
Then:
  - Status: 201 Created
  - Extra mile efforts are stored
```

**TC-API-RC-SELF-010: Rate limiting per employee**
```
Given: Authenticated as EMPLOYEE
When: POST self-assessment called 51 times in 1 day
Then:
  - First 50 requests: 201 Created or 409 Conflict
  - 51st request: 429 Too Many Requests
```

---

## 7. Get Self-Assessment Tests

### 7.1 GET /cycles/{cycleId}/participants/{participantId}/self-assessment

**TC-API-RC-SELF-GET-001: Get own self-assessment**
```
Given: Authenticated as EMPLOYEE
  And: Self-assessment exists
When: GET self-assessment
Then:
  - Status: 200 OK
  - Response contains full assessment details
  - Response includes kpiScores, comments, extraMileEfforts
```

**TC-API-RC-SELF-GET-002: Supervisor can view direct report's assessment**
```
Given: Authenticated as SUPERVISOR
  And: Employee is direct report
  And: Self-assessment exists
When: GET self-assessment
Then:
  - Status: 200 OK
  - Response contains assessment details
```

**TC-API-RC-SELF-GET-003: Handle non-existent assessment**
```
Given: Authenticated as EMPLOYEE
  And: Self-assessment not yet submitted
When: GET self-assessment
Then:
  - Status: 404 Not Found
  - Response contains error code RESOURCE_NOT_FOUND
```

**TC-API-RC-SELF-GET-004: Reject unauthorized access**
```
Given: Authenticated as EMPLOYEE (User A)
  And: Participant belongs to User B
When: GET self-assessment
Then:
  - Status: 403 Forbidden
```

---

## 8. Submit Manager Assessment Tests (US-017)

### 8.1 POST /cycles/{cycleId}/participants/{participantId}/manager-assessment

**TC-API-RC-MGR-001: Submit valid manager assessment**
```
Given: Authenticated as SUPERVISOR
  And: Employee is direct report
  And: Self-assessment already submitted
  And: Valid request body with kpiScores, overallComments
When: POST manager-assessment
Then:
  - Status: 201 Created
  - Response contains assessmentId, finalScore, submittedDate
  - Response contains status=ManagerAssessmentSubmitted
```

**TC-API-RC-MGR-002: Final score calculated correctly**
```
Given: Authenticated as SUPERVISOR
  And: Request with KPI and competency scores
When: POST manager-assessment
Then:
  - Status: 201 Created
  - Response contains finalScore = (KPI avg × 0.7) + (Comp avg × 0.3)
  - Final score rounded to 2 decimal places
```

**TC-API-RC-MGR-003: Reject without prior self-assessment**
```
Given: Authenticated as SUPERVISOR
  And: Self-assessment NOT submitted
When: POST manager-assessment
Then:
  - Status: 409 Conflict
  - Response contains error code MANAGER_ASSESSMENT_REQUIRES_SELF
```

**TC-API-RC-MGR-004: Reject submission for non-direct report**
```
Given: Authenticated as SUPERVISOR
  And: Employee is NOT direct report
When: POST manager-assessment
Then:
  - Status: 403 Forbidden
  - Response contains error code INSUFFICIENT_PERMISSIONS
```

**TC-API-RC-MGR-005: Reject duplicate submission**
```
Given: Authenticated as SUPERVISOR
  And: Manager assessment already submitted
When: POST manager-assessment again
Then:
  - Status: 409 Conflict
  - Response contains error about duplicate submission
```

**TC-API-RC-MGR-006: Validate KPI scores structure**
```
Given: Authenticated as SUPERVISOR
  And: Request with invalid KPI scores
When: POST manager-assessment
Then:
  - Status: 400 Bad Request
  - Response contains validation errors
```

**TC-API-RC-MGR-007: Include overall comments**
```
Given: Authenticated as SUPERVISOR
  And: Request includes overallComments
When: POST manager-assessment
Then:
  - Status: 201 Created
  - Overall comments are stored
```

**TC-API-RC-MGR-008: Rate limiting per supervisor**
```
Given: Authenticated as SUPERVISOR
When: POST manager-assessment called 101 times in 1 day
Then:
  - First 100 requests: 201 Created or 409 Conflict
  - 101st request: 429 Too Many Requests
```

---

## 9. Get Manager Assessment Tests

### 9.1 GET /cycles/{cycleId}/participants/{participantId}/manager-assessment

**TC-API-RC-MGR-GET-001: Supervisor gets own assessment**
```
Given: Authenticated as SUPERVISOR
  And: Manager assessment exists
When: GET manager-assessment
Then:
  - Status: 200 OK
  - Response contains full assessment details
  - Response includes finalScore
```

**TC-API-RC-MGR-GET-002: Employee views own manager assessment**
```
Given: Authenticated as EMPLOYEE
  And: Manager assessment exists
When: GET manager-assessment
Then:
  - Status: 200 OK
  - Response contains assessment details
```

**TC-API-RC-MGR-GET-003: HR can view any assessment**
```
Given: Authenticated as HR
  And: Manager assessment exists
When: GET manager-assessment
Then:
  - Status: 200 OK
  - Response contains assessment details
```

**TC-API-RC-MGR-GET-004: Handle non-existent assessment**
```
Given: Authenticated as SUPERVISOR
  And: Manager assessment not yet submitted
When: GET manager-assessment
Then:
  - Status: 404 Not Found
```

---

## 10. Assessment Comparison Tests (US-017)

### 10.1 GET /cycles/{cycleId}/participants/{participantId}/comparison

**TC-API-RC-COMP-001: Compare self vs manager assessment**
```
Given: Authenticated as SUPERVISOR or HR
  And: Both assessments exist
When: GET comparison
Then:
  - Status: 200 OK
  - Response contains selfAssessment and managerAssessment
  - Response includes discrepancies array
```

**TC-API-RC-COMP-002: Discrepancies calculated correctly**
```
Given: Both assessments exist
  And: Self-rating=4.0, Manager-rating=3.0 for KPI-1
When: GET comparison
Then:
  - Discrepancies array contains entry for KPI-1
  - Difference = 1.0
  - Entry includes kpiId, kpiName, selfRating, managerRating
```

**TC-API-RC-COMP-003: Employee can view own comparison**
```
Given: Authenticated as EMPLOYEE
  And: Both assessments exist
When: GET comparison
Then:
  - Status: 200 OK
  - Response contains comparison data
```

**TC-API-RC-COMP-004: Reject when assessments incomplete**
```
Given: Authenticated as SUPERVISOR
  And: Only self-assessment exists
When: GET comparison
Then:
  - Status: 409 Conflict
  - Response contains error about incomplete assessments
```

---

## 11. Complete Review Cycle Tests

### 11.1 PUT /cycles/{cycleId}/complete

**TC-API-RC-COMP-001: Complete cycle with all assessments**
```
Given: Authenticated as HR
  And: All participants have manager assessments
When: PUT /cycles/{cycleId}/complete
Then:
  - Status: 200 OK
  - Response contains status=Completed, completedAt, averageScore
```

**TC-API-RC-COMP-002: Reject completion with pending participants**
```
Given: Authenticated as HR
  And: Some participants missing assessments
When: PUT /cycles/{cycleId}/complete
Then:
  - Status: 409 Conflict
  - Response contains error about pending participants
```

**TC-API-RC-COMP-003: Reject completion by non-HR**
```
Given: Authenticated as SUPERVISOR
When: PUT /cycles/{cycleId}/complete
Then:
  - Status: 403 Forbidden
```

**TC-API-RC-COMP-004: Reject duplicate completion**
```
Given: Authenticated as HR
  And: Cycle already completed
When: PUT /cycles/{cycleId}/complete
Then:
  - Status: 409 Conflict
```

---

## 12. Security and CORS Tests

### 12.1 Security Headers

**TC-API-SEC-001: Security headers present**
```
Given: Any authenticated request
When: Any endpoint is called
Then: Response includes:
  - Strict-Transport-Security
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
```

**TC-API-SEC-002: CORS headers for allowed origin**
```
Given: Request from allowed origin
When: OPTIONS request (preflight)
Then: Response includes:
  - Access-Control-Allow-Origin
  - Access-Control-Allow-Methods
  - Access-Control-Allow-Headers
```

**TC-API-SEC-003: CORS rejects disallowed origin**
```
Given: Request from disallowed origin
When: OPTIONS request
Then: CORS headers not present
```

### 12.2 Rate Limiting

**TC-API-RATE-001: Rate limit headers present**
```
Given: Authenticated request
When: Any endpoint is called
Then: Response includes:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset
```

**TC-API-RATE-002: Rate limit per user enforced**
```
Given: Authenticated user
When: 101 requests in 1 minute
Then:
  - First 100: Success
  - 101st: 429 Too Many Requests
  - Response includes retryAfter
```

---

## 13. Error Handling Tests

### 13.1 Standard Error Response Format

**TC-API-ERR-001: 400 Bad Request format**
```
Given: Invalid request
When: Endpoint is called
Then: Response contains:
  - error.code
  - error.message
  - error.details
  - error.timestamp
  - error.requestId
  - error.path
```

**TC-API-ERR-002: 500 Internal Server Error handling**
```
Given: Unexpected server error occurs
When: Endpoint is called
Then:
  - Status: 500
  - Response contains generic error message
  - Sensitive details not exposed
  - Error logged with request ID
```

**TC-API-ERR-003: Request ID tracking**
```
Given: Any request
When: Error occurs
Then:
  - Response contains unique requestId
  - Same requestId in logs
```

---

## 14. Performance Tests

### 14.1 Response Time Benchmarks

**TC-API-PERF-001: GET endpoints < 200ms**
```
Given: Authenticated request
When: GET /cycles or GET /cycles/{id}
Then: Response time < 200ms (95th percentile)
```

**TC-API-PERF-002: POST endpoints < 500ms**
```
Given: Authenticated request
When: POST self-assessment or manager-assessment
Then: Response time < 500ms (95th percentile)
```

**TC-API-PERF-003: Concurrent requests handling**
```
Given: 50 concurrent requests
When: Various endpoints called simultaneously
Then:
  - All requests complete successfully
  - No timeout errors
  - Response times within acceptable range
```

---

## 15. Test Execution

### 15.1 Running Tests

```bash
# Run all API tests
mvn test -Dtest=com.company.performance.api.controller.**

# Run specific endpoint tests
mvn test -Dtest=ReviewCycleControllerTest

# Run with REST Assured
mvn test -Dtest=**/*ApiTest

# Run with coverage
mvn test jacoco:report
```

### 15.2 Expected Results

- **Total Tests**: 48
- **Execution Time**: < 30 seconds
- **Pass Rate**: 100%
- **Coverage**: > 85%

---

## 16. Success Criteria

- ✅ All 48 test cases pass
- ✅ All endpoints tested
- ✅ All status codes validated
- ✅ Authentication/authorization enforced
- ✅ Rate limiting working
- ✅ Error handling consistent
- ✅ Performance benchmarks met
- ✅ Security headers present

---

**Document Status**: ✅ READY FOR IMPLEMENTATION  
**Next Steps**: Implement API tests using Spring MockMvc and REST Assured
