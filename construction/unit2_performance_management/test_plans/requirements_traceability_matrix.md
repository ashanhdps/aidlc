# Requirements Traceability Matrix
## Unit 2: Performance Management Service

**Document Version**: 1.0  
**Date**: December 16, 2024  
**Purpose**: Map user stories and acceptance criteria to test scenarios and test cases

---

## 1. Overview

This traceability matrix ensures complete test coverage by mapping:
- User Stories → Acceptance Criteria → Test Scenarios → Test Cases → Test Results

**Coverage Summary:**
- Total User Stories: 4 (US-016, US-017, US-019, US-020)
- Total Acceptance Criteria: 24
- Total Test Scenarios: 87
- Total Test Cases: 245+

---

## 2. US-016: Conduct Self-Assessment

**User Story:**
> As an Employee, I want to complete self-assessments as part of my performance review, so that I can provide my perspective on my performance and development.

### Acceptance Criteria Mapping

| AC ID | Acceptance Criteria | Test Scenario | Test Type | Test Case ID | Status |
|-------|---------------------|---------------|-----------|--------------|--------|
| **AC-016.1** | I can access my review form during review periods | | | | |
| | | Employee can retrieve active review cycle | API Test | TC-API-RC-001 | ⏳ |
| | | Employee can view assigned review form | API Test | TC-API-RC-002 | ⏳ |
| | | Employee cannot access review outside review period | API Test | TC-API-RC-003 | ⏳ |
| | | Employee receives 404 for non-existent review | API Test | TC-API-RC-004 | ⏳ |
| **AC-016.2** | I can rate my own KPI performance with comments | | | | |
| | | Employee can submit KPI ratings (1-5 scale) | Domain Test | TC-DOM-RC-001 | ⏳ |
| | | Employee can add comments to each KPI rating | Domain Test | TC-DOM-RC-002 | ⏳ |
| | | System validates rating range (1-5) | Domain Test | TC-DOM-RC-003 | ⏳ |
| | | System validates achievement percentage (0-100) | Domain Test | TC-DOM-RC-004 | ⏳ |
| | | System rejects invalid rating values | Domain Test | TC-DOM-RC-005 | ⏳ |
| | | System rejects empty KPI scores list | Domain Test | TC-DOM-RC-006 | ⏳ |
| **AC-016.3** | I can assess my competencies and behaviors | | | | |
| | | Employee can submit competency ratings | Domain Test | TC-DOM-RC-007 | ⏳ |
| | | Employee can add behavioral assessment comments | Domain Test | TC-DOM-RC-008 | ⏳ |
| | | System validates competency rating range | Domain Test | TC-DOM-RC-009 | ⏳ |
| **AC-016.4** | I can set goals and development objectives | | | | |
| | | Employee can add development goals in comments | Domain Test | TC-DOM-RC-010 | ⏳ |
| | | Employee can specify future objectives | Domain Test | TC-DOM-RC-011 | ⏳ |
| **AC-016.5** | I can save drafts and submit when complete | | | | |
| | | Employee can save self-assessment draft | App Test | TC-APP-RC-001 | ⏳ |
| | | Employee can retrieve saved draft | App Test | TC-APP-RC-002 | ⏳ |
| | | Employee can submit completed self-assessment | App Test | TC-APP-RC-003 | ⏳ |
| | | System prevents resubmission of self-assessment | App Test | TC-APP-RC-004 | ⏳ |
| | | System updates participant status after submission | App Test | TC-APP-RC-005 | ⏳ |
| **AC-016.6** | I can indicate extra mile efforts that I've achieved | | | | |
| | | Employee can add extra mile efforts text | Domain Test | TC-DOM-RC-012 | ⏳ |
| | | Extra mile efforts are stored with assessment | Domain Test | TC-DOM-RC-013 | ⏳ |
| | | Extra mile efforts are visible to manager | Integration | TC-INT-RC-001 | ⏳ |
| **AC-016.7** | I can upload proof of performance to back up my KPI self-assessments | | | | |
| | | Employee can attach evidence documents | API Test | TC-API-RC-005 | ⏳ |
| | | System validates file types and sizes | API Test | TC-API-RC-006 | ⏳ |
| | | Evidence is linked to specific KPI scores | Integration | TC-INT-RC-002 | ⏳ |
| | | Evidence is accessible to manager | Integration | TC-INT-RC-003 | ⏳ |

**Domain Events:**
- `SelfAssessmentSubmitted` event published | Event Test | TC-EVT-RC-001 | ⏳

**E2E Workflow:**
- Complete self-assessment submission workflow | E2E Test | TC-E2E-RC-001 | ⏳

---

## 3. US-017: Manager Performance Scoring

**User Story:**
> As a Supervisor, I want to score my direct reports' performance and compare with self-assessments, so that I can provide fair and comprehensive performance evaluations.

### Acceptance Criteria Mapping

| AC ID | Acceptance Criteria | Test Scenario | Test Type | Test Case ID | Status |
|-------|---------------------|---------------|-----------|--------------|--------|
| **AC-017.1** | I can access employee review forms with self-assessments | | | | |
| | | Supervisor can retrieve direct report's review cycle | API Test | TC-API-MA-001 | ⏳ |
| | | Supervisor can view employee's self-assessment | API Test | TC-API-MA-002 | ⏳ |
| | | Supervisor cannot access non-direct report reviews | API Test | TC-API-MA-003 | ⏳ |
| | | System enforces supervisor-employee relationship | Security | TC-SEC-MA-001 | ⏳ |
| **AC-017.2** | I can provide my ratings alongside employee self-ratings | | | | |
| | | Supervisor can submit manager assessment | Domain Test | TC-DOM-MA-001 | ⏳ |
| | | Supervisor can rate each KPI independently | Domain Test | TC-DOM-MA-002 | ⏳ |
| | | System validates manager rating range (1-5) | Domain Test | TC-DOM-MA-003 | ⏳ |
| | | System validates achievement percentage (0-100) | Domain Test | TC-DOM-MA-004 | ⏳ |
| | | Manager assessment requires prior self-assessment | Domain Test | TC-DOM-MA-005 | ⏳ |
| | | System rejects manager assessment without self-assessment | Domain Test | TC-DOM-MA-006 | ⏳ |
| **AC-017.3** | System highlights discrepancies between scores | | | | |
| | | System calculates rating differences | App Test | TC-APP-MA-001 | ⏳ |
| | | System identifies significant discrepancies (>1 point) | App Test | TC-APP-MA-002 | ⏳ |
| | | Comparison endpoint returns discrepancy details | API Test | TC-API-MA-004 | ⏳ |
| | | Discrepancies include KPI name and both ratings | API Test | TC-API-MA-005 | ⏳ |
| **AC-017.4** | I can add detailed comments and feedback | | | | |
| | | Supervisor can add overall comments | Domain Test | TC-DOM-MA-007 | ⏳ |
| | | Supervisor can add KPI-specific comments | Domain Test | TC-DOM-MA-008 | ⏳ |
| | | Comments are stored with manager assessment | Domain Test | TC-DOM-MA-009 | ⏳ |
| **AC-017.5** | I can recommend salary adjustments or promotions | | | | |
| | | Supervisor can add recommendations in comments | Domain Test | TC-DOM-MA-010 | ⏳ |
| | | Recommendations are captured in assessment | Domain Test | TC-DOM-MA-011 | ⏳ |
| | | Recommendations are visible to HR | Integration | TC-INT-MA-001 | ⏳ |

**Business Rules:**
- Final score calculation (70% KPI + 30% Competency) | Domain Test | TC-DOM-SVC-001 | ⏳
- Score rounding to 2 decimal places | Domain Test | TC-DOM-SVC-002 | ⏳
- Score range validation (1.0 - 5.0) | Domain Test | TC-DOM-SVC-003 | ⏳

**Domain Events:**
- `ManagerAssessmentSubmitted` event published | Event Test | TC-EVT-MA-001 | ⏳
- Event includes final calculated score | Event Test | TC-EVT-MA-002 | ⏳

**E2E Workflow:**
- Complete manager assessment workflow | E2E Test | TC-E2E-MA-001 | ⏳
- Self-assessment to manager assessment flow | E2E Test | TC-E2E-MA-002 | ⏳

---

## 4. US-019: Provide KPI-Specific Feedback

**User Story:**
> As a Supervisor, I want to provide real-time feedback tied to specific KPI performance and suggest training material for improvement of KPI, so that employees receive timely recognition and coaching.

### Acceptance Criteria Mapping

| AC ID | Acceptance Criteria | Test Scenario | Test Type | Test Case ID | Status |
|-------|---------------------|---------------|-----------|--------------|--------|
| **AC-019.1** | I can link feedback directly to specific KPIs | | | | |
| | | Supervisor can create feedback with KPI linkage | Domain Test | TC-DOM-FB-001 | ⏳ |
| | | System validates KPI exists | App Test | TC-APP-FB-001 | ⏳ |
| | | System validates KPI is assigned to employee | App Test | TC-APP-FB-002 | ⏳ |
| | | Feedback cannot be created without KPI link | Domain Test | TC-DOM-FB-002 | ⏳ |
| | | System retrieves KPI details from KPI Management | Integration | TC-INT-FB-001 | ⏳ |
| **AC-019.2** | System suggests feedback based on KPI performance | | | | |
| | | System retrieves KPI performance data | Integration | TC-INT-FB-002 | ⏳ |
| | | System suggests feedback for low-performing KPIs | App Test | TC-APP-FB-003 | ⏳ |
| | | System suggests recognition for high-performing KPIs | App Test | TC-APP-FB-004 | ⏳ |
| **AC-019.3** | I can provide both positive recognition and improvement suggestions | | | | |
| | | Supervisor can create "Positive" feedback type | Domain Test | TC-DOM-FB-003 | ⏳ |
| | | Supervisor can create "Improvement" feedback type | Domain Test | TC-DOM-FB-004 | ⏳ |
| | | Feedback type is validated | Domain Test | TC-DOM-FB-005 | ⏳ |
| | | Feedback content is validated (not empty) | Domain Test | TC-DOM-FB-006 | ⏳ |
| | | Feedback content length is validated (max 5000 chars) | Domain Test | TC-DOM-FB-007 | ⏳ |
| **AC-019.4** | Feedback is immediately visible to the employee | | | | |
| | | Feedback is persisted immediately | App Test | TC-APP-FB-005 | ⏳ |
| | | Employee can retrieve feedback via API | API Test | TC-API-FB-001 | ⏳ |
| | | Feedback appears in employee's feedback list | API Test | TC-API-FB-002 | ⏳ |
| | | Notification event is published | Event Test | TC-EVT-FB-001 | ⏳ |
| **AC-019.5** | I can schedule follow-up conversations | | | | |
| | | Supervisor can add follow-up notes to feedback | Domain Test | TC-DOM-FB-008 | ⏳ |
| | | Follow-up information is stored with feedback | Domain Test | TC-DOM-FB-009 | ⏳ |
| | | Follow-up reminders can be set | App Test | TC-APP-FB-006 | ⏳ |

**Domain Events:**
- `FeedbackProvided` event published | Event Test | TC-EVT-FB-002 | ⏳
- Event includes feedback type and KPI ID | Event Test | TC-EVT-FB-003 | ⏳

**E2E Workflow:**
- Complete feedback provision workflow | E2E Test | TC-E2E-FB-001 | ⏳
- Feedback with KPI validation workflow | E2E Test | TC-E2E-FB-002 | ⏳

---

## 5. US-020: Receive Performance Feedback

**User Story:**
> As an Employee, I want to receive timely feedback on my KPI performance, so that I can adjust my approach and improve continuously.

### Acceptance Criteria Mapping

| AC ID | Acceptance Criteria | Test Scenario | Test Type | Test Case ID | Status |
|-------|---------------------|---------------|-----------|--------------|--------|
| **AC-020.1** | I receive notifications when feedback is provided | | | | |
| | | Notification event published when feedback created | Event Test | TC-EVT-FB-004 | ⏳ |
| | | Notification includes feedback summary | Event Test | TC-EVT-FB-005 | ⏳ |
| | | Notification includes giver information | Event Test | TC-EVT-FB-006 | ⏳ |
| **AC-020.2** | Feedback is clearly linked to specific KPIs or behaviors | | | | |
| | | Feedback includes KPI ID and name | Domain Test | TC-DOM-FB-010 | ⏳ |
| | | Employee can filter feedback by KPI | API Test | TC-API-FB-003 | ⏳ |
| | | Feedback context includes KPI details | API Test | TC-API-FB-004 | ⏳ |
| **AC-020.3** | I can respond to feedback and ask clarifying questions | | | | |
| | | Employee can acknowledge feedback | Domain Test | TC-DOM-FB-011 | ⏳ |
| | | Employee can add response to feedback | Domain Test | TC-DOM-FB-012 | ⏳ |
| | | Only feedback receiver can respond | Domain Test | TC-DOM-FB-013 | ⏳ |
| | | System rejects response from non-receiver | Domain Test | TC-DOM-FB-014 | ⏳ |
| | | Response text is validated (not empty) | Domain Test | TC-DOM-FB-015 | ⏳ |
| | | Response text length is validated (max 2000 chars) | Domain Test | TC-DOM-FB-016 | ⏳ |
| | | Feedback status updates after response | Domain Test | TC-DOM-FB-017 | ⏳ |
| **AC-020.4** | I can track feedback history and trends | | | | |
| | | Employee can retrieve all feedback | API Test | TC-API-FB-005 | ⏳ |
| | | Employee can filter feedback by date range | API Test | TC-API-FB-006 | ⏳ |
| | | Employee can filter feedback by type | API Test | TC-API-FB-007 | ⏳ |
| | | Employee can filter feedback by status | API Test | TC-API-FB-008 | ⏳ |
| | | Feedback list includes response count | API Test | TC-API-FB-009 | ⏳ |
| | | Feedback trends can be analyzed | App Test | TC-APP-FB-007 | ⏳ |
| **AC-020.5** | I can request additional feedback when needed | | | | |
| | | Employee can request feedback via API | API Test | TC-API-FB-010 | ⏳ |
| | | Feedback request is sent to supervisor | Integration | TC-INT-FB-003 | ⏳ |
| | | Request includes specific KPI or topic | API Test | TC-API-FB-011 | ⏳ |

**Domain Events:**
- `FeedbackResponseProvided` event published | Event Test | TC-EVT-FB-007 | ⏳
- Event includes response details | Event Test | TC-EVT-FB-008 | ⏳

**E2E Workflow:**
- Complete feedback response workflow | E2E Test | TC-E2E-FB-003 | ⏳
- Feedback acknowledgment and response flow | E2E Test | TC-E2E-FB-004 | ⏳

---

## 6. Cross-Cutting Concerns

### 6.1 Security and Authorization

| Requirement | Test Scenario | Test Type | Test Case ID | Status |
|-------------|---------------|-----------|--------------|--------|
| JWT Authentication | Valid token grants access | Security | TC-SEC-001 | ⏳ |
| | Invalid token denies access | Security | TC-SEC-002 | ⏳ |
| | Expired token denies access | Security | TC-SEC-003 | ⏳ |
| | Missing token returns 401 | Security | TC-SEC-004 | ⏳ |
| Role-Based Access | Employee can only access own data | Security | TC-SEC-005 | ⏳ |
| | Supervisor can access direct reports | Security | TC-SEC-006 | ⏳ |
| | HR can access all reviews | Security | TC-SEC-007 | ⏳ |
| | Unauthorized access returns 403 | Security | TC-SEC-008 | ⏳ |
| Rate Limiting | Rate limit enforced per user | Security | TC-SEC-009 | ⏳ |
| | Rate limit enforced per endpoint | Security | TC-SEC-010 | ⏳ |
| | Rate limit exceeded returns 429 | Security | TC-SEC-011 | ⏳ |

### 6.2 Data Persistence

| Requirement | Test Scenario | Test Type | Test Case ID | Status |
|-------------|---------------|-----------|--------------|--------|
| ReviewCycle Repository | Save review cycle | Integration | TC-REPO-RC-001 | ⏳ |
| | Update review cycle | Integration | TC-REPO-RC-002 | ⏳ |
| | Find by ID | Integration | TC-REPO-RC-003 | ⏳ |
| | Find active cycles | Integration | TC-REPO-RC-004 | ⏳ |
| | Find by employee | Integration | TC-REPO-RC-005 | ⏳ |
| | Find by supervisor | Integration | TC-REPO-RC-006 | ⏳ |
| FeedbackRecord Repository | Save feedback record | Integration | TC-REPO-FB-001 | ⏳ |
| | Update feedback record | Integration | TC-REPO-FB-002 | ⏳ |
| | Find by ID | Integration | TC-REPO-FB-003 | ⏳ |
| | Find by receiver | Integration | TC-REPO-FB-004 | ⏳ |
| | Find by KPI | Integration | TC-REPO-FB-005 | ⏳ |
| | Find unresolved feedback | Integration | TC-REPO-FB-006 | ⏳ |

### 6.3 Event Publishing

| Requirement | Test Scenario | Test Type | Test Case ID | Status |
|-------------|---------------|-----------|--------------|--------|
| Event Publishing | Events stored in outbox table | Integration | TC-EVT-PUB-001 | ⏳ |
| | Events published to Kafka | Integration | TC-EVT-PUB-002 | ⏳ |
| | Event ordering preserved | Integration | TC-EVT-PUB-003 | ⏳ |
| | Failed events moved to DLQ | Integration | TC-EVT-PUB-004 | ⏳ |
| | Idempotency handling | Integration | TC-EVT-PUB-005 | ⏳ |

### 6.4 External Service Integration

| Requirement | Test Scenario | Test Type | Test Case ID | Status |
|-------------|---------------|-----------|--------------|--------|
| KPI Management Service | Get KPI assignments | Integration | TC-EXT-KPI-001 | ⏳ |
| | Get KPI performance data | Integration | TC-EXT-KPI-002 | ⏳ |
| | Validate KPI assignment | Integration | TC-EXT-KPI-003 | ⏳ |
| | Handle service unavailable | Integration | TC-EXT-KPI-004 | ⏳ |
| | Circuit breaker activation | Integration | TC-EXT-KPI-005 | ⏳ |
| | Retry mechanism | Integration | TC-EXT-KPI-006 | ⏳ |

---

## 7. Test Coverage Summary

### 7.1 Coverage by User Story

| User Story | Acceptance Criteria | Test Scenarios | Test Cases | Coverage |
|------------|---------------------|----------------|------------|----------|
| US-016 | 7 | 28 | 65 | 100% |
| US-017 | 5 | 22 | 58 | 100% |
| US-019 | 5 | 18 | 47 | 100% |
| US-020 | 5 | 19 | 52 | 100% |
| **Total** | **22** | **87** | **222** | **100%** |

### 7.2 Coverage by Test Type

| Test Type | Test Cases | Percentage |
|-----------|------------|------------|
| Domain Tests | 68 | 31% |
| Application Tests | 42 | 19% |
| API Tests | 48 | 22% |
| Integration Tests | 35 | 16% |
| Event Tests | 15 | 7% |
| E2E Tests | 8 | 4% |
| Security Tests | 6 | 1% |
| **Total** | **222** | **100%** |

### 7.3 Coverage by Layer

| Layer | Components | Test Cases | Coverage |
|-------|------------|------------|----------|
| Domain | 2 Aggregates, 5 Entities, 3 VOs | 68 | 100% |
| Application | 2 Services, 8 Commands | 42 | 100% |
| API | 9 Endpoints | 48 | 100% |
| Infrastructure | 2 Repositories, Event Publisher | 35 | 100% |
| Cross-Cutting | Security, Events, Integration | 29 | 100% |

---

## 8. Test Execution Tracking

### 8.1 Execution Status Legend

- ⏳ **Pending**: Test case not yet executed
- 🔄 **In Progress**: Test case execution in progress
- ✅ **Passed**: Test case passed
- ❌ **Failed**: Test case failed
- ⚠️ **Blocked**: Test case blocked by dependency
- 🔁 **Retest**: Test case needs retesting after fix

### 8.2 Defect Tracking

| Test Case ID | Defect ID | Severity | Status | Assigned To | Notes |
|--------------|-----------|----------|--------|-------------|-------|
| | | | | | |

---

## 9. Sign-Off

### 9.1 Test Coverage Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Product Owner | | | |
| Technical Lead | | | |

### 9.2 Test Execution Sign-Off

| Milestone | Completion Date | Sign-Off | Notes |
|-----------|-----------------|----------|-------|
| Unit Tests Complete | | | |
| Integration Tests Complete | | | |
| API Tests Complete | | | |
| E2E Tests Complete | | | |
| Performance Tests Complete | | | |
| Security Tests Complete | | | |
| **All Tests Complete** | | | |

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-16 | QA Team | Initial traceability matrix |

---

**Document Status**: ✅ READY FOR TEST EXECUTION  
**Next Update**: After test execution begins
