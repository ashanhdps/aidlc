# E2E Test Plan: Review Cycle Workflow
## Unit 2: Performance Management Service

**Document Version**: 1.0  
**Date**: December 16, 2024  
**Test Focus**: End-to-end review cycle workflows

---

## 1. Test Scope

### 1.1 Workflows Under Test

**Complete Review Cycle Workflow:**
1. HR creates review cycle
2. Employee submits self-assessment
3. Manager submits manager assessment
4. System calculates final score
5. HR completes review cycle

**Cross-Service Integration:**
- Integration with KPI Management Service
- Event publishing to Kafka
- Data persistence in DynamoDB

### 1.2 User Stories Covered
- **US-016**: Conduct Self-Assessment
- **US-017**: Manager Performance Scoring

### 1.3 Test Objectives
- Validate complete business workflows
- Test cross-service integration
- Verify event-driven architecture
- Ensure data consistency
- Test real-world scenarios

---

## 2. Test Strategy

### 2.1 Test Approach
- **Full System Integration**: All components running
- **TestContainers**: DynamoDB Local, Kafka
- **WireMock**: Mock KPI Management Service
- **Real HTTP Calls**: REST Assured
- **Event Verification**: Kafka consumer verification

### 2.2 Test Environment
- Spring Boot application running
- DynamoDB Local in Docker
- Kafka in Docker
- WireMock server for external services
- Test data seeded before each test

### 2.3 Test Data Strategy
- Create fresh test data for each test
- Use realistic data (names, dates, scores)
- Clean up after each test
- Isolated test execution

---

## 3. Complete Review Cycle Workflow Tests

### 3.1 Happy Path - Complete Review Cycle

**TC-E2E-RC-001: Complete review cycle workflow**

**Scenario:** HR creates a review cycle, employee submits self-assessment, manager submits assessment, and HR completes the cycle.

**Test Steps:**

```
Step 1: HR creates review cycle
  Given: Authenticated as HR user
  When: POST /cycles with:
    - cycleName: "Q4 2024 Performance Review"
    - startDate: 2024-10-01
    - endDate: 2024-12-31
    - participants: [
        { employeeId: "emp-001", supervisorId: "mgr-001" }
      ]
  Then:
    - Status: 201 Created
    - Response contains cycleId
    - Cycle status is Active
    - Participant status is Pending

Step 2: Verify cycle in database
  When: Query DynamoDB for cycle
  Then:
    - Cycle exists with correct data
    - Participant exists with Pending status

Step 3: Employee retrieves KPI assignments (mock)
  Given: WireMock configured to return KPI assignments
  When: System calls KPI Management Service
  Then:
    - Returns 5 KPI assignments for employee
    - Each KPI has ID, name, target, weight

Step 4: Employee submits self-assessment
  Given: Authenticated as EMPLOYEE (emp-001)
  When: POST /cycles/{cycleId}/participants/{participantId}/self-assessment with:
    - kpiScores: [
        { kpiId: "kpi-1", ratingValue: 4.0, achievementPercentage: 85, comment: "Met target" },
        { kpiId: "kpi-2", ratingValue: 3.5, achievementPercentage: 75, comment: "Good progress" },
        ... (5 KPIs total)
      ]
    - comments: "Overall good performance this quarter"
    - extraMileEfforts: "Led team initiative for process improvement"
  Then:
    - Status: 201 Created
    - Response contains assessmentId
    - Participant status is SelfAssessmentSubmitted

Step 5: Verify self-assessment in database
  When: Query DynamoDB for participant
  Then:
    - Self-assessment exists
    - All KPI scores stored
    - Comments and extra mile efforts stored

Step 6: Verify SelfAssessmentSubmitted event published
  When: Consume from Kafka topic
  Then:
    - Event exists with correct payload
    - Event contains cycleId, participantId, employeeId
    - Event contains all KPI scores

Step 7: Manager retrieves employee's self-assessment
  Given: Authenticated as SUPERVISOR (mgr-001)
  When: GET /cycles/{cycleId}/participants/{participantId}/self-assessment
  Then:
    - Status: 200 OK
    - Response contains full self-assessment
    - Can see employee's ratings and comments

Step 8: Manager retrieves KPI performance data (mock)
  Given: WireMock configured to return KPI performance data
  When: System calls KPI Management Service
  Then:
    - Returns actual achievement percentages
    - Returns performance trends

Step 9: Manager submits manager assessment
  Given: Authenticated as SUPERVISOR (mgr-001)
  When: POST /cycles/{cycleId}/participants/{participantId}/manager-assessment with:
    - kpiScores: [
        { kpiId: "kpi-1", ratingValue: 4.0, achievementPercentage: 85, comment: "Excellent work" },
        { kpiId: "kpi-2", ratingValue: 3.0, achievementPercentage: 70, comment: "Room for improvement" },
        ... (5 KPIs total)
      ]
    - overallComments: "Strong performer, recommend for promotion"
  Then:
    - Status: 201 Created
    - Response contains assessmentId and finalScore
    - Final score calculated: (KPI avg × 0.7) + (Comp avg × 0.3)
    - Participant status is ManagerAssessmentSubmitted

Step 10: Verify manager assessment in database
  When: Query DynamoDB for participant
  Then:
    - Manager assessment exists
    - Final score is stored
    - All KPI scores and comments stored

Step 11: Verify ManagerAssessmentSubmitted event published
  When: Consume from Kafka topic
  Then:
    - Event exists with correct payload
    - Event contains finalScore
    - Event contains all assessment data

Step 12: Compare self vs manager assessment
  Given: Authenticated as SUPERVISOR or HR
  When: GET /cycles/{cycleId}/participants/{participantId}/comparison
  Then:
    - Status: 200 OK
    - Response contains both assessments
    - Discrepancies calculated correctly
    - Shows KPIs where ratings differ by >1 point

Step 13: HR completes review cycle
  Given: Authenticated as HR
  When: PUT /cycles/{cycleId}/complete
  Then:
    - Status: 200 OK
    - Cycle status is Completed
    - Average score calculated across all participants
    - Completion date set

Step 14: Verify cycle completion in database
  When: Query DynamoDB for cycle
  Then:
    - Cycle status is Completed
    - Average score is stored
    - Completion date is set

Step 15: Verify ReviewCycleCompleted event published
  When: Consume from Kafka topic
  Then:
    - Event exists with correct payload
    - Event contains participantCount, averageScore
    - Event contains completion date

Step 16: Verify no further modifications allowed
  Given: Authenticated as EMPLOYEE
  When: Attempt to submit self-assessment again
  Then:
    - Status: 409 Conflict
    - Error indicates cycle is completed
```

**Expected Duration:** 30-45 seconds  
**Success Criteria:**
- ✅ All 16 steps complete successfully
- ✅ Data persisted correctly at each step
- ✅ Events published for each major action
- ✅ Status transitions correct
- ✅ Final score calculated accurately

---

### 3.2 Multiple Participants Workflow

**TC-E2E-RC-002: Review cycle with multiple participants**

**Scenario:** HR creates cycle with 3 participants, all complete assessments, HR completes cycle.

**Test Steps:**

```
Step 1: HR creates review cycle with 3 participants
  When: POST /cycles with 3 participants
  Then: All 3 participants created with Pending status

Step 2: First employee submits self-assessment
  When: Employee 1 submits assessment
  Then: Participant 1 status updated

Step 3: Second employee submits self-assessment
  When: Employee 2 submits assessment
  Then: Participant 2 status updated

Step 4: Third employee submits self-assessment
  When: Employee 3 submits assessment
  Then: Participant 3 status updated

Step 5: Manager submits assessments for all 3
  When: Manager submits 3 assessments
  Then: All participants have final scores

Step 6: HR completes cycle
  When: PUT /cycles/{cycleId}/complete
  Then:
    - Average score = (score1 + score2 + score3) / 3
    - All participants marked as Completed

Step 7: Verify all events published
  When: Consume from Kafka
  Then:
    - 3 SelfAssessmentSubmitted events
    - 3 ManagerAssessmentSubmitted events
    - 1 ReviewCycleCompleted event
```

**Expected Duration:** 45-60 seconds  
**Success Criteria:**
- ✅ All participants processed correctly
- ✅ Average score calculated correctly
- ✅ All events published

---

### 3.3 Error Recovery Workflow

**TC-E2E-RC-003: Handle manager assessment before self-assessment**

**Scenario:** Manager attempts to submit assessment before employee submits self-assessment.

**Test Steps:**

```
Step 1: HR creates review cycle
  When: POST /cycles
  Then: Cycle created successfully

Step 2: Manager attempts to submit assessment first
  Given: Self-assessment NOT submitted
  When: POST manager-assessment
  Then:
    - Status: 409 Conflict
    - Error: MANAGER_ASSESSMENT_REQUIRES_SELF
    - Participant status remains Pending

Step 3: Employee submits self-assessment
  When: POST self-assessment
  Then: Status: 201 Created

Step 4: Manager submits assessment (retry)
  When: POST manager-assessment
  Then:
    - Status: 201 Created
    - Assessment accepted this time
```

**Expected Duration:** 15-20 seconds  
**Success Criteria:**
- ✅ Business rule enforced
- ✅ Clear error message
- ✅ Successful retry after correction

---

### 3.4 Concurrent Submissions Workflow

**TC-E2E-RC-004: Handle concurrent self-assessment submissions**

**Scenario:** Employee attempts to submit self-assessment twice simultaneously.

**Test Steps:**

```
Step 1: HR creates review cycle
  When: POST /cycles
  Then: Cycle created

Step 2: Employee submits self-assessment twice concurrently
  When: Two POST requests sent simultaneously
  Then:
    - One request: 201 Created
    - Other request: 409 Conflict (duplicate)
    - Only one assessment stored in database

Step 3: Verify data consistency
  When: Query database
  Then: Only one self-assessment exists
```

**Expected Duration:** 10-15 seconds  
**Success Criteria:**
- ✅ Idempotency maintained
- ✅ No duplicate data
- ✅ Consistent state

---

## 4. Cross-Service Integration Tests

### 4.1 KPI Management Service Integration

**TC-E2E-INT-001: Retrieve KPI assignments during assessment**

**Test Steps:**

```
Step 1: Configure WireMock for KPI assignments
  Given: WireMock stub configured
  When: GET /api/v1/kpi-management/assignments/employee/{employeeId}
  Then: Returns mock KPI assignments

Step 2: Employee submits self-assessment
  When: POST self-assessment
  Then:
    - System calls KPI Management Service
    - Validates KPI IDs against assignments
    - Accepts assessment if KPIs valid

Step 3: Verify WireMock received request
  When: Check WireMock request log
  Then: Request to KPI Management Service logged
```

**TC-E2E-INT-002: Handle KPI service unavailable**

**Test Steps:**

```
Step 1: Configure WireMock to return 503
  Given: WireMock returns Service Unavailable
  When: System attempts to call KPI service
  Then:
    - Circuit breaker activates
    - Retry mechanism attempts 3 times
    - Falls back to cached data or returns error

Step 2: Employee submits assessment
  When: POST self-assessment
  Then:
    - Status: 503 Service Unavailable
    - Error message indicates external service issue
```

---

### 4.2 Event-Driven Architecture Tests

**TC-E2E-EVT-001: Event publishing and consumption**

**Test Steps:**

```
Step 1: Submit self-assessment
  When: POST self-assessment
  Then: SelfAssessmentSubmitted event published

Step 2: Verify event in Kafka
  When: Consume from performance-management.domain-events topic
  Then:
    - Event exists
    - Event structure correct
    - Event payload complete

Step 3: Verify event in outbox table
  When: Query event_outbox table
  Then:
    - Event stored with status=PUBLISHED
    - Published_at timestamp set

Step 4: Simulate event consumer
  When: Mock consumer processes event
  Then:
    - Event processed successfully
    - Idempotency key prevents duplicate processing
```

**TC-E2E-EVT-002: Event ordering guarantee**

**Test Steps:**

```
Step 1: Submit multiple assessments for same cycle
  When: 3 assessments submitted sequentially
  Then: 3 events published

Step 2: Verify event ordering
  When: Consume events from Kafka
  Then:
    - Events received in correct order
    - Timestamps increase monotonically
    - Aggregate ID used as partition key
```

---

## 5. Data Consistency Tests

### 5.1 Database Consistency

**TC-E2E-DATA-001: Verify data consistency across operations**

**Test Steps:**

```
Step 1: Create review cycle
  When: POST /cycles
  Then: Verify in DynamoDB

Step 2: Submit self-assessment
  When: POST self-assessment
  Then:
    - Verify assessment in DynamoDB
    - Verify participant status updated
    - Verify cycle status updated

Step 3: Submit manager assessment
  When: POST manager-assessment
  Then:
    - Verify assessment in DynamoDB
    - Verify final score stored
    - Verify participant status updated

Step 4: Query all data
  When: GET various endpoints
  Then: All data consistent across queries
```

---

## 6. Performance and Load Tests

### 6.1 Workflow Performance

**TC-E2E-PERF-001: Complete workflow performance**

**Test Steps:**

```
Step 1: Execute complete review cycle workflow
  When: All steps from TC-E2E-RC-001
  Then:
    - Total execution time < 30 seconds
    - Each API call < 500ms
    - Database queries < 100ms
    - Event publishing < 200ms
```

**TC-E2E-PERF-002: Concurrent workflows**

**Test Steps:**

```
Step 1: Execute 10 review cycles concurrently
  When: 10 complete workflows run simultaneously
  Then:
    - All workflows complete successfully
    - No deadlocks or race conditions
    - Response times within acceptable range
    - No data corruption
```

---

## 7. Test Execution

### 7.1 Running E2E Tests

```bash
# Run all E2E tests
mvn test -Dtest=com.company.performance.e2e.**

# Run specific workflow test
mvn test -Dtest=ReviewCycleWorkflowTest

# Run with TestContainers
mvn test -Dtest=**/*E2ETest

# Run with detailed logging
mvn test -Dtest=**/*E2ETest -Dlogging.level.root=DEBUG
```

### 7.2 Test Environment Setup

```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers
public class ReviewCycleWorkflowTest {
    
    @Container
    static DynamoDBContainer dynamodb = new DynamoDBContainer();
    
    @Container
    static KafkaContainer kafka = new KafkaContainer();
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    private WireMockServer wireMockServer;
    
    @BeforeEach
    void setup() {
        // Start WireMock
        wireMockServer = new WireMockServer(8089);
        wireMockServer.start();
        
        // Configure stubs
        configureKPIServiceStubs();
        
        // Clean database
        cleanDatabase();
    }
    
    @AfterEach
    void teardown() {
        wireMockServer.stop();
    }
}
```

### 7.3 Expected Results

- **Total Tests**: 8 E2E workflows
- **Execution Time**: 3-5 minutes total
- **Pass Rate**: 100%
- **Coverage**: All critical workflows

---

## 8. Success Criteria

- ✅ All E2E workflows pass
- ✅ Complete review cycle workflow validated
- ✅ Cross-service integration working
- ✅ Event-driven architecture verified
- ✅ Data consistency maintained
- ✅ Performance benchmarks met
- ✅ Error handling validated
- ✅ Concurrent operations handled

---

## 9. Test Data

### 9.1 Sample Test Data

**Review Cycle:**
```json
{
  "cycleName": "Q4 2024 Performance Review",
  "startDate": "2024-10-01",
  "endDate": "2024-12-31",
  "participants": [
    {
      "employeeId": "emp-001",
      "supervisorId": "mgr-001"
    }
  ]
}
```

**Self-Assessment:**
```json
{
  "kpiScores": [
    {
      "kpiId": "kpi-001",
      "ratingValue": 4.0,
      "achievementPercentage": 85.0,
      "comment": "Met sales target for Q4"
    },
    {
      "kpiId": "kpi-002",
      "ratingValue": 3.5,
      "achievementPercentage": 75.0,
      "comment": "Good customer satisfaction scores"
    }
  ],
  "comments": "Overall strong performance this quarter",
  "extraMileEfforts": "Led team initiative for process improvement"
}
```

**Manager Assessment:**
```json
{
  "kpiScores": [
    {
      "kpiId": "kpi-001",
      "ratingValue": 4.0,
      "achievementPercentage": 85.0,
      "comment": "Excellent sales performance"
    },
    {
      "kpiId": "kpi-002",
      "ratingValue": 3.0,
      "achievementPercentage": 70.0,
      "comment": "Room for improvement in customer relations"
    }
  ],
  "overallComments": "Strong performer, recommend for promotion"
}
```

---

## 10. Troubleshooting

### 10.1 Common Issues

**Issue: TestContainers not starting**
- Solution: Ensure Docker is running
- Check Docker resources (memory, CPU)
- Verify network connectivity

**Issue: WireMock stubs not matching**
- Solution: Check stub configuration
- Verify request URL and headers
- Enable WireMock request logging

**Issue: Kafka events not consumed**
- Solution: Check topic configuration
- Verify consumer group settings
- Check Kafka container logs

**Issue: Database state not clean**
- Solution: Ensure cleanup in @AfterEach
- Use unique IDs for each test
- Consider using @DirtiesContext

---

**Document Status**: ✅ READY FOR IMPLEMENTATION  
**Next Steps**: Implement E2E tests using Spring Boot Test and TestContainers
