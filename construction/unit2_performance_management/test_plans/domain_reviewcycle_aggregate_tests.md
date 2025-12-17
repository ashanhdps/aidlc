# Domain Layer Test Plan: ReviewCycle Aggregate
## Unit 2: Performance Management Service

**Document Version**: 1.0  
**Date**: December 16, 2024  
**Test Focus**: ReviewCycle Aggregate and related entities

---

## 1. Test Scope

### 1.1 Components Under Test

**Aggregate Root:**
- `ReviewCycle` - Manages review cycle lifecycle and participant assessments

**Entities:**
- `ReviewParticipant` - Tracks participant status and assessments
- `SelfAssessment` - Employee's self-assessment data
- `ManagerAssessment` - Manager's assessment data

**Value Objects:**
- `AssessmentScore` - Immutable KPI/competency score

**Domain Services:**
- `PerformanceScoreCalculationService` - Calculates final performance scores

**Domain Events:**
- `SelfAssessmentSubmitted`
- `ManagerAssessmentSubmitted`
- `ReviewCycleCompleted`

### 1.2 User Stories Covered
- **US-016**: Conduct Self-Assessment
- **US-017**: Manager Performance Scoring

### 1.3 Business Rules to Test
1. Self-assessment must be submitted before manager assessment
2. Final score = (KPI average × 0.7) + (Competency average × 0.3)
3. Rating values must be between 1.0 and 5.0
4. Achievement percentages must be between 0 and 100
5. Final scores are immutable after calculation
6. Review cycle status transitions: Active → InProgress → Completed

---

## 2. Test Strategy

### 2.1 Test Approach
- **Pure Unit Tests**: No external dependencies, no mocks needed
- **Fast Execution**: All tests should complete in < 100ms
- **Isolated**: Each test creates its own aggregate instance
- **Comprehensive**: Cover all business rules and edge cases

### 2.2 Test Framework
- **JUnit 5**: Test framework
- **AssertJ**: Fluent assertions
- **Test Data Builders**: Fluent API for test data creation

### 2.3 Test Coverage Targets
- **Line Coverage**: 95%
- **Branch Coverage**: 90%
- **Mutation Coverage**: 85%

---

## 3. ReviewCycle Aggregate Tests

### 3.1 Test Class: `ReviewCycleTest`

#### 3.1.1 Creation and Initialization Tests

**TC-DOM-RC-CREATE-001: Create review cycle with valid data**
```
Given: Valid cycle name, start date, end date
When: ReviewCycle is created
Then: 
  - Cycle ID is generated
  - Status is Active
  - Participants list is empty
  - Domain events list is empty
```

**TC-DOM-RC-CREATE-002: Create review cycle with participants**
```
Given: Valid cycle data and list of participants
When: ReviewCycle is created with participants
Then:
  - All participants are added
  - Each participant has Pending status
  - Participant IDs are generated
```

**TC-DOM-RC-CREATE-003: Reject cycle with null name**
```
Given: Null cycle name
When: ReviewCycle creation is attempted
Then: IllegalArgumentException is thrown
```

**TC-DOM-RC-CREATE-004: Reject cycle with empty name**
```
Given: Empty string cycle name
When: ReviewCycle creation is attempted
Then: IllegalArgumentException is thrown
```

**TC-DOM-RC-CREATE-005: Reject cycle with end date before start date**
```
Given: End date is before start date
When: ReviewCycle creation is attempted
Then: IllegalArgumentException is thrown
```

#### 3.1.2 Self-Assessment Submission Tests (US-016)

**TC-DOM-RC-SELF-001: Submit valid self-assessment**
```
Given: Active review cycle with participant
  And: Valid KPI scores and comments
When: submitSelfAssessment is called
Then:
  - Self-assessment is created
  - Participant status is SelfAssessmentSubmitted
  - SelfAssessmentSubmitted event is raised
  - Assessment ID is generated
  - Submitted date is set
```

**TC-DOM-RC-SELF-002: Submit self-assessment with extra mile efforts**
```
Given: Active review cycle with participant
  And: Valid KPI scores, comments, and extra mile efforts
When: submitSelfAssessment is called
Then:
  - Self-assessment includes extra mile efforts
  - Extra mile efforts are stored correctly
```

**TC-DOM-RC-SELF-003: Submit self-assessment with multiple KPI scores**
```
Given: Active review cycle with participant
  And: Multiple KPI scores (5 KPIs)
When: submitSelfAssessment is called
Then:
  - All KPI scores are stored
  - Each score has correct KPI ID
  - Each score has rating and achievement percentage
```

**TC-DOM-RC-SELF-004: Reject self-assessment with empty KPI scores**
```
Given: Active review cycle with participant
  And: Empty KPI scores list
When: submitSelfAssessment is called
Then: InvalidAssessmentException is thrown
```

**TC-DOM-RC-SELF-005: Reject self-assessment for non-existent participant**
```
Given: Active review cycle
  And: Invalid participant ID
When: submitSelfAssessment is called
Then: ParticipantNotFoundException is thrown
```

**TC-DOM-RC-SELF-006: Reject duplicate self-assessment submission**
```
Given: Review cycle with participant who already submitted self-assessment
When: submitSelfAssessment is called again
Then: InvalidAssessmentException is thrown with message "Self-assessment already submitted"
```

**TC-DOM-RC-SELF-007: Reject self-assessment for completed cycle**
```
Given: Completed review cycle
When: submitSelfAssessment is called
Then: InvalidCycleStateException is thrown
```

**TC-DOM-RC-SELF-008: Self-assessment updates cycle status to InProgress**
```
Given: Active review cycle with no assessments
When: First self-assessment is submitted
Then: Cycle status changes to InProgress
```

#### 3.1.3 Manager Assessment Submission Tests (US-017)

**TC-DOM-RC-MGR-001: Submit valid manager assessment**
```
Given: Review cycle with participant who submitted self-assessment
  And: Valid KPI scores and overall comments
  And: PerformanceScoreCalculationService
When: submitManagerAssessment is called
Then:
  - Manager assessment is created
  - Final score is calculated
  - Participant status is ManagerAssessmentSubmitted
  - ManagerAssessmentSubmitted event is raised
  - Assessment ID is generated
```

**TC-DOM-RC-MGR-002: Manager assessment requires prior self-assessment**
```
Given: Review cycle with participant (no self-assessment)
  And: Valid manager assessment data
When: submitManagerAssessment is called
Then: InvalidAssessmentException is thrown with message "Self-assessment must be submitted first"
```

**TC-DOM-RC-MGR-003: Calculate final score correctly**
```
Given: Review cycle with self-assessment submitted
  And: KPI scores average = 4.0
  And: Competency scores average = 3.5
When: submitManagerAssessment is called
Then: Final score = (4.0 × 0.7) + (3.5 × 0.3) = 3.85
```

**TC-DOM-RC-MGR-004: Final score is rounded to 2 decimal places**
```
Given: Review cycle with self-assessment
  And: Scores that result in 3.456789
When: submitManagerAssessment is called
Then: Final score = 3.46 (rounded)
```

**TC-DOM-RC-MGR-005: Reject manager assessment with empty KPI scores**
```
Given: Review cycle with self-assessment
  And: Empty KPI scores list
When: submitManagerAssessment is called
Then: InvalidAssessmentException is thrown
```

**TC-DOM-RC-MGR-006: Reject duplicate manager assessment**
```
Given: Participant with both assessments already submitted
When: submitManagerAssessment is called again
Then: InvalidAssessmentException is thrown
```

**TC-DOM-RC-MGR-007: Manager assessment with overall comments**
```
Given: Review cycle with self-assessment
  And: Manager assessment with detailed comments
When: submitManagerAssessment is called
Then:
  - Overall comments are stored
  - Comments are accessible from assessment
```

**TC-DOM-RC-MGR-008: Final score is immutable after calculation**
```
Given: Participant with completed manager assessment
When: Attempt to modify final score directly
Then: Score cannot be changed (immutable)
```

#### 3.1.4 Review Cycle Completion Tests

**TC-DOM-RC-COMP-001: Complete cycle with all participants assessed**
```
Given: Review cycle with all participants having manager assessments
When: complete() is called
Then:
  - Cycle status is Completed
  - ReviewCycleCompleted event is raised
  - Average score is calculated
  - Completion date is set
```

**TC-DOM-RC-COMP-002: Reject completion with pending participants**
```
Given: Review cycle with some participants not assessed
When: complete() is called
Then: InvalidCycleStateException is thrown
```

**TC-DOM-RC-COMP-003: Calculate average score across participants**
```
Given: Review cycle with 3 participants
  And: Final scores: 4.5, 3.8, 4.2
When: complete() is called
Then: Average score = 4.17 (rounded)
```

**TC-DOM-RC-COMP-004: Reject completion of already completed cycle**
```
Given: Already completed review cycle
When: complete() is called again
Then: InvalidCycleStateException is thrown
```

#### 3.1.5 State Transition Tests

**TC-DOM-RC-STATE-001: Valid state transition Active → InProgress**
```
Given: Active review cycle
When: First self-assessment is submitted
Then: Status changes to InProgress
```

**TC-DOM-RC-STATE-002: Valid state transition InProgress → Completed**
```
Given: InProgress review cycle with all assessments
When: complete() is called
Then: Status changes to Completed
```

**TC-DOM-RC-STATE-003: Cannot transition from Completed to any state**
```
Given: Completed review cycle
When: Any state-changing operation is attempted
Then: InvalidCycleStateException is thrown
```

#### 3.1.6 Domain Event Tests

**TC-DOM-RC-EVENT-001: SelfAssessmentSubmitted event structure**
```
Given: Review cycle with participant
When: Self-assessment is submitted
Then: Event contains:
  - Event ID (UUID)
  - Cycle ID
  - Participant ID
  - Employee ID
  - Supervisor ID
  - Submitted date
  - KPI scores
  - Comments
  - Extra mile efforts
```

**TC-DOM-RC-EVENT-002: ManagerAssessmentSubmitted event structure**
```
Given: Review cycle with self-assessment
When: Manager assessment is submitted
Then: Event contains:
  - Event ID (UUID)
  - Cycle ID
  - Participant ID
  - Employee ID
  - Supervisor ID
  - Submitted date
  - KPI scores
  - Overall comments
  - Final score
```

**TC-DOM-RC-EVENT-003: ReviewCycleCompleted event structure**
```
Given: Review cycle with all assessments
When: Cycle is completed
Then: Event contains:
  - Event ID (UUID)
  - Cycle ID
  - Cycle name
  - Completed date
  - Participant count
  - Average score
  - Completion rate
```

**TC-DOM-RC-EVENT-004: Multiple events accumulated**
```
Given: Review cycle with 2 participants
When: Both submit self-assessments
Then: 2 SelfAssessmentSubmitted events are in domain events list
```

**TC-DOM-RC-EVENT-005: Events cleared after retrieval**
```
Given: Review cycle with domain events
When: getDomainEvents() is called
  And: clearDomainEvents() is called
Then: Domain events list is empty
```

---

## 4. ReviewParticipant Entity Tests

### 4.1 Test Class: `ReviewParticipantTest`

**TC-DOM-PART-001: Create participant with valid data**
```
Given: Valid employee ID and supervisor ID
When: ReviewParticipant is created
Then:
  - Participant ID is generated
  - Status is Pending
  - Self-assessment is null
  - Manager assessment is null
  - Final score is null
```

**TC-DOM-PART-002: Check hasSelfAssessment() when no assessment**
```
Given: New participant
When: hasSelfAssessment() is called
Then: Returns false
```

**TC-DOM-PART-003: Check hasSelfAssessment() after submission**
```
Given: Participant with self-assessment
When: hasSelfAssessment() is called
Then: Returns true
```

**TC-DOM-PART-004: Check hasManagerAssessment() when no assessment**
```
Given: Participant with only self-assessment
When: hasManagerAssessment() is called
Then: Returns false
```

**TC-DOM-PART-005: Check hasManagerAssessment() after submission**
```
Given: Participant with both assessments
When: hasManagerAssessment() is called
Then: Returns true
```

**TC-DOM-PART-006: Set self-assessment updates status**
```
Given: Participant with Pending status
When: setSelfAssessment() is called
Then: Status changes to SelfAssessmentSubmitted
```

**TC-DOM-PART-007: Set manager assessment updates status and score**
```
Given: Participant with SelfAssessmentSubmitted status
When: setManagerAssessment() is called with score 4.25
Then:
  - Status changes to ManagerAssessmentSubmitted
  - Final score is 4.25
```

---

## 5. SelfAssessment Entity Tests

### 5.1 Test Class: `SelfAssessmentTest`

**TC-DOM-SELF-001: Create self-assessment with valid data**
```
Given: Valid KPI scores, comments, extra mile efforts
When: SelfAssessment is created
Then:
  - Assessment ID is generated
  - Submitted date is set to now
  - All data is stored correctly
```

**TC-DOM-SELF-002: Validate KPI scores not null**
```
Given: Null KPI scores
When: SelfAssessment creation is attempted
Then: InvalidAssessmentException is thrown
```

**TC-DOM-SELF-003: Validate KPI scores not empty**
```
Given: Empty KPI scores list
When: SelfAssessment creation is attempted
Then: InvalidAssessmentException is thrown
```

**TC-DOM-SELF-004: Store multiple KPI scores**
```
Given: 5 different KPI scores
When: SelfAssessment is created
Then: All 5 scores are stored and retrievable
```

**TC-DOM-SELF-005: Comments can be null**
```
Given: Valid KPI scores, null comments
When: SelfAssessment is created
Then: Assessment is created successfully
```

**TC-DOM-SELF-006: Extra mile efforts can be null**
```
Given: Valid KPI scores, null extra mile efforts
When: SelfAssessment is created
Then: Assessment is created successfully
```

**TC-DOM-SELF-007: Submitted date is immutable**
```
Given: Created self-assessment
When: Attempt to modify submitted date
Then: Date cannot be changed
```

---

## 6. ManagerAssessment Entity Tests

### 6.1 Test Class: `ManagerAssessmentTest`

**TC-DOM-MGR-001: Create manager assessment with valid data**
```
Given: Valid KPI scores and overall comments
When: ManagerAssessment is created
Then:
  - Assessment ID is generated
  - Submitted date is set to now
  - All data is stored correctly
```

**TC-DOM-MGR-002: Validate KPI scores not null**
```
Given: Null KPI scores
When: ManagerAssessment creation is attempted
Then: InvalidAssessmentException is thrown
```

**TC-DOM-MGR-003: Validate KPI scores not empty**
```
Given: Empty KPI scores list
When: ManagerAssessment creation is attempted
Then: InvalidAssessmentException is thrown
```

**TC-DOM-MGR-004: Overall comments can be null**
```
Given: Valid KPI scores, null comments
When: ManagerAssessment is created
Then: Assessment is created successfully
```

**TC-DOM-MGR-005: Store detailed overall comments**
```
Given: KPI scores and long detailed comments (1000 chars)
When: ManagerAssessment is created
Then: Comments are stored completely
```

---

## 7. AssessmentScore Value Object Tests

### 7.1 Test Class: `AssessmentScoreTest`

**TC-DOM-SCORE-001: Create score with valid data**
```
Given: Valid KPI ID, rating 3.5, achievement 85%, comment
When: AssessmentScore is created
Then: All values are stored correctly
```

**TC-DOM-SCORE-002: Validate rating minimum (1.0)**
```
Given: Rating value 0.9
When: AssessmentScore creation is attempted
Then: InvalidAssessmentException is thrown
```

**TC-DOM-SCORE-003: Validate rating maximum (5.0)**
```
Given: Rating value 5.1
When: AssessmentScore creation is attempted
Then: InvalidAssessmentException is thrown
```

**TC-DOM-SCORE-004: Accept rating at minimum boundary (1.0)**
```
Given: Rating value 1.0
When: AssessmentScore is created
Then: Score is created successfully
```

**TC-DOM-SCORE-005: Accept rating at maximum boundary (5.0)**
```
Given: Rating value 5.0
When: AssessmentScore is created
Then: Score is created successfully
```

**TC-DOM-SCORE-006: Validate achievement minimum (0)**
```
Given: Achievement percentage -1
When: AssessmentScore creation is attempted
Then: InvalidAssessmentException is thrown
```

**TC-DOM-SCORE-007: Validate achievement maximum (100)**
```
Given: Achievement percentage 101
When: AssessmentScore creation is attempted
Then: InvalidAssessmentException is thrown
```

**TC-DOM-SCORE-008: Accept achievement at minimum boundary (0)**
```
Given: Achievement percentage 0
When: AssessmentScore is created
Then: Score is created successfully
```

**TC-DOM-SCORE-009: Accept achievement at maximum boundary (100)**
```
Given: Achievement percentage 100
When: AssessmentScore is created
Then: Score is created successfully
```

**TC-DOM-SCORE-010: Value object equality - same values**
```
Given: Two AssessmentScore objects with identical values
When: equals() is called
Then: Returns true
```

**TC-DOM-SCORE-011: Value object equality - different values**
```
Given: Two AssessmentScore objects with different ratings
When: equals() is called
Then: Returns false
```

**TC-DOM-SCORE-012: Value object immutability**
```
Given: Created AssessmentScore
When: Attempt to modify any field
Then: Fields cannot be changed (compile-time safety)
```

**TC-DOM-SCORE-013: Hash code consistency**
```
Given: Two AssessmentScore objects with identical values
When: hashCode() is called on both
Then: Hash codes are equal
```

**TC-DOM-SCORE-014: Comment can be null**
```
Given: Valid KPI ID, rating, achievement, null comment
When: AssessmentScore is created
Then: Score is created successfully
```

**TC-DOM-SCORE-015: Comment can be empty string**
```
Given: Valid KPI ID, rating, achievement, empty comment
When: AssessmentScore is created
Then: Score is created successfully
```

---

## 8. PerformanceScoreCalculationService Tests

### 8.1 Test Class: `PerformanceScoreCalculationServiceTest`

**TC-DOM-SVC-001: Calculate score with standard values**
```
Given: KPI scores average = 4.0, Competency scores average = 3.5
When: calculateFinalScore() is called
Then: Final score = (4.0 × 0.7) + (3.5 × 0.3) = 3.85
```

**TC-DOM-SVC-002: Calculate score with minimum values**
```
Given: KPI scores average = 1.0, Competency scores average = 1.0
When: calculateFinalScore() is called
Then: Final score = 1.0
```

**TC-DOM-SVC-003: Calculate score with maximum values**
```
Given: KPI scores average = 5.0, Competency scores average = 5.0
When: calculateFinalScore() is called
Then: Final score = 5.0
```

**TC-DOM-SVC-004: Round score to 2 decimal places**
```
Given: Scores that result in 3.456789
When: calculateFinalScore() is called
Then: Final score = 3.46
```

**TC-DOM-SVC-005: Round score using HALF_UP rounding**
```
Given: Scores that result in 3.455
When: calculateFinalScore() is called
Then: Final score = 3.46 (rounded up)
```

**TC-DOM-SVC-006: Validate KPI scores not null**
```
Given: Null KPI scores
When: calculateFinalScore() is called
Then: InvalidScoreCalculationException is thrown
```

**TC-DOM-SVC-007: Validate KPI scores not empty**
```
Given: Empty KPI scores list
When: calculateFinalScore() is called
Then: InvalidScoreCalculationException is thrown
```

**TC-DOM-SVC-008: Validate competency scores not null**
```
Given: Valid KPI scores, null competency scores
When: calculateFinalScore() is called
Then: InvalidScoreCalculationException is thrown
```

**TC-DOM-SVC-009: Validate competency scores not empty**
```
Given: Valid KPI scores, empty competency scores
When: calculateFinalScore() is called
Then: InvalidScoreCalculationException is thrown
```

**TC-DOM-SVC-010: Calculate average with multiple scores**
```
Given: KPI scores [4.0, 3.5, 4.5, 3.0, 5.0]
When: calculateFinalScore() is called
Then: KPI average = 4.0, used in calculation
```

**TC-DOM-SVC-011: Validate final score range minimum**
```
Given: Scores that result in 0.5
When: calculateFinalScore() is called
Then: InvalidScoreCalculationException is thrown
```

**TC-DOM-SVC-012: Validate final score range maximum**
```
Given: Scores that result in 5.5
When: calculateFinalScore() is called
Then: InvalidScoreCalculationException is thrown
```

**TC-DOM-SVC-013: Correct weighting applied (70/30)**
```
Given: KPI average = 4.0, Competency average = 2.0
When: calculateFinalScore() is called
Then: Final score = 3.4 (verifying 70/30 split)
```

---

## 9. Test Data Builders

### 9.1 ReviewCycleBuilder

```java
public class ReviewCycleBuilder {
    private String cycleName = "Q4 2024 Review";
    private LocalDate startDate = LocalDate.now();
    private LocalDate endDate = LocalDate.now().plusDays(30);
    private List<ReviewParticipant> participants = new ArrayList<>();
    
    public ReviewCycleBuilder withName(String name) { ... }
    public ReviewCycleBuilder withDates(LocalDate start, LocalDate end) { ... }
    public ReviewCycleBuilder withParticipant(ReviewParticipant participant) { ... }
    public ReviewCycle build() { ... }
}
```

### 9.2 AssessmentScoreBuilder

```java
public class AssessmentScoreBuilder {
    private UUID kpiId = UUID.randomUUID();
    private BigDecimal rating = new BigDecimal("3.5");
    private BigDecimal achievement = new BigDecimal("85");
    private String comment = "Good performance";
    
    public AssessmentScoreBuilder forKpi(UUID kpiId) { ... }
    public AssessmentScoreBuilder withRating(double rating) { ... }
    public AssessmentScoreBuilder withAchievement(double achievement) { ... }
    public AssessmentScore build() { ... }
}
```

---

## 10. Test Execution

### 10.1 Running Tests

```bash
# Run all domain tests
mvn test -Dtest=com.company.performance.domain.**

# Run specific test class
mvn test -Dtest=ReviewCycleTest

# Run with coverage
mvn test jacoco:report
```

### 10.2 Expected Results

- **Total Tests**: 68
- **Execution Time**: < 5 seconds
- **Pass Rate**: 100%
- **Coverage**: > 95%

---

## 11. Success Criteria

- ✅ All 68 test cases pass
- ✅ Line coverage ≥ 95%
- ✅ Branch coverage ≥ 90%
- ✅ No flaky tests
- ✅ All business rules validated
- ✅ All edge cases covered
- ✅ All domain events tested

---

**Document Status**: ✅ READY FOR IMPLEMENTATION  
**Next Steps**: Implement test cases using JUnit 5 and AssertJ
