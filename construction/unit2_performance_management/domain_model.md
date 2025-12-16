# Domain Model - Unit 2: Performance Management Service (1-Day Workshop Version)

## Workshop Scope

**Focus:** Core performance review and feedback features that can be implemented in 1 day
**User Stories Covered:** US-016, US-017, US-019, US-020 (4 essential stories)
**Excluded:** Review templates, calibration, recognition, coaching (can be added later)

---

## 1. Domain Overview

### 1.1 Core Concepts (Simplified)

**Performance Review Domain:**
- Simple Review Cycle (fixed template)
- Self-Assessment Process
- Manager Assessment & Scoring

**Feedback Domain:**
- Real-time KPI-specific Feedback
- Feedback Response & Conversation

### 1.2 Essential Business Flows

#### Simplified Review Process
1. **Review Cycle Creation** - HR creates review cycle with participants
2. **Self-Assessment** (US-016) - Employee rates KPI performance, adds comments
3. **Manager Assessment** (US-017) - Supervisor rates and compares with self-assessment
4. **Review Completion** - Final scores calculated

#### Feedback Flow
1. **Feedback Creation** (US-019) - Supervisor provides KPI-specific feedback
2. **Feedback Response** (US-020) - Employee receives and responds to feedback

### 1.3 Key Business Rules

**Review Rules:**
- Self-assessment must be submitted before manager assessment
- KPI achievement data pulled from KPI Management Service
- Final score = 70% KPI + 30% Competency (fixed weighting)

**Feedback Rules:**
- Feedback must be linked to a specific KPI
- Feedback cannot be deleted, only archived

---

## 2. Aggregates (Simplified - 2 Aggregates)

### Aggregate 1: ReviewCycle

**Purpose:** Manage the review process for employees

**Aggregate Members:**
- ReviewCycle (Root)
- ReviewParticipant (Entity)
- SelfAssessment (Entity)
- ManagerAssessment (Entity)
- AssessmentScore (Value Object)

**Lifecycle States:**
- Active → InProgress → Completed

**Key Behaviors:**
- SubmitSelfAssessment(participantId, scores, comments)
- SubmitManagerAssessment(participantId, scores, comments)
- CalculateFinalScore(participantId)
- Complete()

**Invariants:**
- Self-assessment must be submitted before manager assessment
- Final scores are immutable after calculation

---

### Aggregate 2: FeedbackRecord

**Purpose:** Manage feedback conversations

**Aggregate Members:**
- FeedbackRecord (Root)
- FeedbackResponse (Entity)
- FeedbackContext (Value Object)

**Lifecycle States:**
- Created → Acknowledged → Responded → Resolved

**Key Behaviors:**
- Acknowledge()
- AddResponse(responseText)
- Resolve()

**Invariants:**
- Feedback must be linked to a KPI
- Responses must be from the feedback receiver

---

## 3. Entities & Value Objects (Essential Only)

### ReviewCycle Aggregate

**ReviewCycle (Root)**
```
Identity: CycleId (GUID)
Attributes:
  - CycleName (string)
  - StartDate (date)
  - EndDate (date)
  - Status (enum: Active, InProgress, Completed)
  
Behaviors:
  - SubmitSelfAssessment(participantId, assessment)
  - SubmitManagerAssessment(participantId, assessment)
  - CalculateFinalScore(participantId)
  - Complete()
```

**ReviewParticipant (Entity)**
```
Identity: ParticipantId (GUID)
Attributes:
  - EmployeeId (GUID)
  - SupervisorId (GUID)
  - Status (enum: Pending, SelfAssessmentSubmitted, ManagerAssessmentSubmitted, Completed)
  - FinalScore (decimal)
  
Contains:
  - SelfAssessment (0..1)
  - ManagerAssessment (0..1)
```

**SelfAssessment (Entity)**
```
Identity: AssessmentId (GUID)
Attributes:
  - SubmittedDate (timestamp)
  - Comments (string)
  - ExtraMileEfforts (string)
  
Contains:
  - List<AssessmentScore> (KPI scores)
```

**ManagerAssessment (Entity)**
```
Identity: AssessmentId (GUID)
Attributes:
  - SubmittedDate (timestamp)
  - OverallComments (string)
  
Contains:
  - List<AssessmentScore> (KPI scores)
```

**AssessmentScore (Value Object)**
```
Attributes:
  - KPIId (GUID)
  - RatingValue (decimal, 1-5)
  - AchievementPercentage (decimal, 0-100)
  - Comment (string)
```

---

### FeedbackRecord Aggregate

**FeedbackRecord (Root)**
```
Identity: FeedbackId (GUID)
Attributes:
  - GiverId (GUID)
  - ReceiverId (GUID)
  - CreatedDate (timestamp)
  - Status (enum: Created, Acknowledged, Responded, Resolved)
  - FeedbackType (enum: Positive, Improvement)
  
Contains:
  - FeedbackContext (Value Object)
  - List<FeedbackResponse> (Entities)
  
Behaviors:
  - Acknowledge()
  - AddResponse(responseText)
  - Resolve()
```

**FeedbackResponse (Entity)**
```
Identity: ResponseId (GUID)
Attributes:
  - ResponderId (GUID)
  - ResponseText (string)
  - ResponseDate (timestamp)
```

**FeedbackContext (Value Object)**
```
Attributes:
  - KPIId (GUID)
  - KPIName (string)
  - ContentText (string)
```

---

## 4. Domain Events (Essential Only)

### Review Events

**SelfAssessmentSubmitted**
```
Payload:
  - CycleId (GUID)
  - EmployeeId (GUID)
  - SupervisorId (GUID)
  - SubmittedDate (timestamp)
  - KPIScores (List<AssessmentScore>)
  
Consumers: Frontend, Notification Service
```

**ManagerAssessmentSubmitted**
```
Payload:
  - CycleId (GUID)
  - EmployeeId (GUID)
  - SupervisorId (GUID)
  - SubmittedDate (timestamp)
  - KPIScores (List<AssessmentScore>)
  - FinalScore (decimal)
  
Consumers: Frontend, Data & Analytics Service
```

**ReviewCycleCompleted**
```
Payload:
  - CycleId (GUID)
  - CompletedDate (timestamp)
  - ParticipantCount (int)
  - AverageScore (decimal)
  
Consumers: Data & Analytics Service
```

### Feedback Events

**FeedbackProvided**
```
Payload:
  - FeedbackId (GUID)
  - GiverId (GUID)
  - ReceiverId (GUID)
  - KPIId (GUID)
  - FeedbackType (enum)
  - CreatedDate (timestamp)
  
Consumers: Frontend, Notification Service
```

**FeedbackResponseProvided**
```
Payload:
  - FeedbackId (GUID)
  - ResponderId (GUID)
  - ResponseDate (timestamp)
  
Consumers: Frontend, Notification Service
```

---

## 5. Domain Services (Simplified - 1 Service)

### PerformanceScoreCalculationService

**Purpose:** Calculate final performance scores

**Interface:**
```
CalculateFinalScore(
  kpiScores: List<AssessmentScore>,
  competencyScores: List<AssessmentScore>
) : decimal
```

**Business Rules:**
- Final score = (KPI average × 0.7) + (Competency average × 0.3)
- Round to 2 decimal places
- Score range: 1.0 to 5.0

**Dependencies:**
- KPI Management Service (to get KPI achievement data)

---

## 6. Repository Interfaces (Simplified)

### IReviewCycleRepository

```
// Commands
Add(cycle: ReviewCycle) : void
Update(cycle: ReviewCycle) : void

// Queries
GetById(cycleId: GUID) : ReviewCycle
GetActiveCycles() : List<ReviewCycle>
GetCyclesForEmployee(employeeId: GUID) : List<ReviewCycle>
GetCyclesForSupervisor(supervisorId: GUID) : List<ReviewCycle>
GetParticipant(participantId: GUID) : ReviewParticipant
```

### IFeedbackRecordRepository

```
// Commands
Add(feedback: FeedbackRecord) : void
Update(feedback: FeedbackRecord) : void

// Queries
GetById(feedbackId: GUID) : FeedbackRecord
GetFeedbackForEmployee(employeeId: GUID) : List<FeedbackRecord>
GetFeedbackByKPI(kpiId: GUID) : List<FeedbackRecord>
GetUnresolvedFeedback(receiverId: GUID) : List<FeedbackRecord>
```

---

## 7. Integration Points (Simplified)

### Consumes from KPI Management Service

**Get KPI Assignments**
```
API: GET /api/v1/kpi-management/assignments/employee/{employee_id}
Purpose: Get employee's KPIs for review
When: During review cycle creation
```

**Get KPI Performance Data**
```
API: GET /api/v1/kpi-management/performance/employee/{employee_id}
Purpose: Get actual KPI achievement percentages
When: During assessment scoring
```

**ACL Interface:**
```
IKPIManagementService
  GetEmployeeKPIAssignments(employeeId: GUID) : List<KPIAssignment>
  GetKPIPerformanceData(employeeId: GUID, kpiId: GUID) : KPIPerformanceData
```

### Provides to Data & Analytics Service

**Domain Events Published:**
- ManagerAssessmentSubmitted (for performance analytics)
- ReviewCycleCompleted (for reporting)
- FeedbackProvided (for feedback analytics)

---

## 8. Workshop Implementation Plan

### Phase 1: Core Review (3 hours)
1. **Setup Domain Layer**
   - Create ReviewCycle aggregate
   - Create ReviewParticipant, SelfAssessment, ManagerAssessment entities
   - Create AssessmentScore value object

2. **Implement Review Logic**
   - SubmitSelfAssessment behavior
   - SubmitManagerAssessment behavior
   - PerformanceScoreCalculationService

3. **Repository & Events**
   - IReviewCycleRepository interface
   - SelfAssessmentSubmitted event
   - ManagerAssessmentSubmitted event

### Phase 2: Feedback System (2 hours)
1. **Setup Feedback Domain**
   - Create FeedbackRecord aggregate
   - Create FeedbackResponse entity
   - Create FeedbackContext value object

2. **Implement Feedback Logic**
   - Acknowledge behavior
   - AddResponse behavior
   - Resolve behavior

3. **Repository & Events**
   - IFeedbackRecordRepository interface
   - FeedbackProvided event
   - FeedbackResponseProvided event

### Phase 3: Integration & Testing (3 hours)
1. **KPI Service Integration**
   - Implement IKPIManagementService ACL
   - Mock KPI data for testing

2. **API Layer**
   - Review cycle endpoints
   - Feedback endpoints

3. **Testing**
   - Unit tests for aggregates
   - Integration tests for workflows
   - End-to-end scenario testing

---

## 9. User Story Coverage

### ✅ US-016: Conduct Self-Assessment
- **Covered by:** ReviewCycle.SubmitSelfAssessment()
- **Components:** SelfAssessment entity, AssessmentScore value object
- **Events:** SelfAssessmentSubmitted

### ✅ US-017: Manager Performance Scoring
- **Covered by:** ReviewCycle.SubmitManagerAssessment()
- **Components:** ManagerAssessment entity, PerformanceScoreCalculationService
- **Events:** ManagerAssessmentSubmitted

### ✅ US-019: Provide KPI-Specific Feedback
- **Covered by:** FeedbackRecord aggregate
- **Components:** FeedbackContext value object
- **Events:** FeedbackProvided

### ✅ US-020: Receive Performance Feedback
- **Covered by:** FeedbackRecord.Acknowledge(), FeedbackRecord.AddResponse()
- **Components:** FeedbackResponse entity
- **Events:** FeedbackResponseProvided

---

## 10. What's Excluded (Future Enhancements)

**Not in Workshop Scope:**
- ❌ Review templates (US-014, US-015) - Using fixed template
- ❌ Calibration tools (US-018) - Manual calibration only
- ❌ Recognition system (US-021, US-022) - Separate feature
- ❌ Coaching questions (US-023, US-024, US-025, US-026) - Separate feature
- ❌ Complex policies and validation rules
- ❌ Advanced domain services
- ❌ Slack/Teams integration

**Can be added incrementally after workshop:**
1. Add ReviewTemplate aggregate for configurable templates
2. Add CalibrationService for rating consistency
3. Add Recognition aggregate for peer recognition
4. Add CoachingQuestion/Resource/Session aggregates
5. Add external platform integrations

---

## 11. Simplified Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend Application                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         Performance Management Service (Unit 2)          │
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  ReviewCycle     │      │  FeedbackRecord  │        │
│  │  Aggregate       │      │  Aggregate       │        │
│  └──────────────────┘      └──────────────────┘        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  PerformanceScoreCalculationService              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  IReviewCycle    │      │  IFeedbackRecord │        │
│  │  Repository      │      │  Repository      │        │
│  └──────────────────┘      └──────────────────┘        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              KPI Management Service (Unit 1)             │
│         (Get KPI assignments and performance data)       │
└─────────────────────────────────────────────────────────┘
```

---

## 12. Success Criteria for Workshop

**By end of workshop, participants should have:**

1. ✅ Working ReviewCycle aggregate with self and manager assessments
2. ✅ Working FeedbackRecord aggregate with responses
3. ✅ Score calculation service
4. ✅ Repository interfaces implemented
5. ✅ Domain events published
6. ✅ Integration with KPI Management Service (mocked)
7. ✅ Basic API endpoints for review and feedback
8. ✅ Unit tests for core domain logic

**Deliverables:**
- Functional domain model code
- Repository implementations
- API endpoints
- Unit tests
- Integration tests
- Documentation

---

**Workshop Duration:** 8 hours (1 day)
**Complexity:** Medium
**Prerequisites:** Understanding of DDD concepts, C#/.NET or Java/Spring
**Team Size:** 2-4 developers
