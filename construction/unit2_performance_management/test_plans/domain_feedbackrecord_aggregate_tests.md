# Domain Layer Test Plan: FeedbackRecord Aggregate
## Unit 2: Performance Management Service

**Document Version**: 1.0  
**Date**: December 16, 2024  
**Test Focus**: FeedbackRecord Aggregate and related entities

---

## 1. Test Scope

### 1.1 Components Under Test

**Aggregate Root:**
- `FeedbackRecord` - Manages feedback lifecycle and responses

**Entities:**
- `FeedbackResponse` - Individual response to feedback

**Value Objects:**
- `FeedbackContext` - Immutable feedback context with KPI linkage

**Domain Events:**
- `FeedbackProvided`
- `FeedbackResponseProvided`

### 1.2 User Stories Covered
- **US-019**: Provide KPI-Specific Feedback
- **US-020**: Receive Performance Feedback

### 1.3 Business Rules to Test
1. Feedback must be linked to a specific KPI
2. Feedback cannot be deleted, only archived
3. Only feedback receiver can respond
4. Feedback status transitions: Created → Acknowledged → Responded → Resolved
5. Response text must not be empty
6. Response text maximum length is 2000 characters
7. Feedback content maximum length is 5000 characters

---

## 2. Test Strategy

### 2.1 Test Approach
- **Pure Unit Tests**: No external dependencies
- **Fast Execution**: All tests < 100ms
- **Isolated**: Each test creates its own aggregate
- **Comprehensive**: Cover all business rules and state transitions

### 2.2 Test Framework
- **JUnit 5**: Test framework
- **AssertJ**: Fluent assertions
- **Test Data Builders**: Fluent API for test data

### 2.3 Test Coverage Targets
- **Line Coverage**: 95%
- **Branch Coverage**: 90%
- **Mutation Coverage**: 85%

---

## 3. FeedbackRecord Aggregate Tests

### 3.1 Test Class: `FeedbackRecordTest`

#### 3.1.1 Creation and Initialization Tests (US-019)

**TC-DOM-FB-CREATE-001: Create feedback with valid data**
```
Given: Valid giver ID, receiver ID, KPI ID, KPI name, feedback type, content
When: FeedbackRecord.create() is called
Then:
  - Feedback ID is generated
  - Status is Created
  - Created date is set to now
  - All data is stored correctly
  - FeedbackProvided event is raised
  - Responses list is empty
```

**TC-DOM-FB-CREATE-002: Create positive feedback**
```
Given: Feedback type = Positive
When: FeedbackRecord is created
Then:
  - Feedback type is Positive
  - Feedback is created successfully
```

**TC-DOM-FB-CREATE-003: Create improvement feedback**
```
Given: Feedback type = Improvement
When: FeedbackRecord is created
Then:
  - Feedback type is Improvement
  - Feedback is created successfully
```

**TC-DOM-FB-CREATE-004: Reject feedback without KPI linkage**
```
Given: Null KPI ID
When: FeedbackRecord creation is attempted
Then: InvalidFeedbackOperationException is thrown with message "Feedback must be linked to a KPI"
```

**TC-DOM-FB-CREATE-005: Reject feedback with empty content**
```
Given: Empty content text
When: FeedbackRecord creation is attempted
Then: InvalidFeedbackOperationException is thrown with message "Feedback content cannot be empty"
```

**TC-DOM-FB-CREATE-006: Reject feedback with whitespace-only content**
```
Given: Content text with only whitespace
When: FeedbackRecord creation is attempted
Then: InvalidFeedbackOperationException is thrown
```

**TC-DOM-FB-CREATE-007: Reject feedback exceeding max length**
```
Given: Content text with 5001 characters
When: FeedbackRecord creation is attempted
Then: InvalidFeedbackOperationException is thrown with message "Feedback content cannot exceed 5000 characters"
```

**TC-DOM-FB-CREATE-008: Accept feedback at max length boundary**
```
Given: Content text with exactly 5000 characters
When: FeedbackRecord is created
Then: Feedback is created successfully
```

**TC-DOM-FB-CREATE-009: Store KPI name with feedback**
```
Given: Valid feedback data with KPI name "Sales Target Achievement"
When: FeedbackRecord is created
Then: KPI name is stored in feedback context
```

#### 3.1.2 Feedback Acknowledgment Tests (US-020)

**TC-DOM-FB-ACK-001: Acknowledge feedback in Created status**
```
Given: Feedback in Created status
When: acknowledge() is called
Then:
  - Status changes to Acknowledged
  - No event is raised (acknowledgment is internal state)
```

**TC-DOM-FB-ACK-002: Reject acknowledgment when not in Created status**
```
Given: Feedback in Acknowledged status
When: acknowledge() is called
Then: InvalidFeedbackOperationException is thrown with message "Feedback can only be acknowledged when in Created status"
```

**TC-DOM-FB-ACK-003: Reject acknowledgment when Responded**
```
Given: Feedback in Responded status
When: acknowledge() is called
Then: InvalidFeedbackOperationException is thrown
```

**TC-DOM-FB-ACK-004: Reject acknowledgment when Resolved**
```
Given: Feedback in Resolved status
When: acknowledge() is called
Then: InvalidFeedbackOperationException is thrown
```

#### 3.1.3 Feedback Response Tests (US-020)

**TC-DOM-FB-RESP-001: Add response from receiver**
```
Given: Feedback in Created or Acknowledged status
  And: Responder ID equals receiver ID
  And: Valid response text
When: addResponse() is called
Then:
  - Response is added to responses list
  - Response ID is generated
  - Response date is set to now
  - Status changes to Responded
  - FeedbackResponseProvided event is raised
```

**TC-DOM-FB-RESP-002: Reject response from non-receiver**
```
Given: Feedback with receiver ID = User1
  And: Responder ID = User2 (different user)
When: addResponse() is called
Then: InvalidFeedbackOperationException is thrown with message "Only feedback receiver can respond"
```

**TC-DOM-FB-RESP-003: Reject response with empty text**
```
Given: Valid responder (receiver)
  And: Empty response text
When: addResponse() is called
Then: InvalidFeedbackOperationException is thrown with message "Response text cannot be empty"
```

**TC-DOM-FB-RESP-004: Reject response with whitespace-only text**
```
Given: Valid responder
  And: Response text with only whitespace
When: addResponse() is called
Then: InvalidFeedbackOperationException is thrown
```

**TC-DOM-FB-RESP-005: Reject response exceeding max length**
```
Given: Valid responder
  And: Response text with 2001 characters
When: addResponse() is called
Then: InvalidFeedbackOperationException is thrown with message "Response text cannot exceed 2000 characters"
```

**TC-DOM-FB-RESP-006: Accept response at max length boundary**
```
Given: Valid responder
  And: Response text with exactly 2000 characters
When: addResponse() is called
Then: Response is added successfully
```

**TC-DOM-FB-RESP-007: Add multiple responses**
```
Given: Feedback with one response already added
  And: Valid responder (receiver)
When: addResponse() is called again
Then:
  - Second response is added
  - Responses list contains 2 responses
  - Status remains Responded
```

**TC-DOM-FB-RESP-008: Response maintains chronological order**
```
Given: Feedback with no responses
When: Three responses are added sequentially
Then: Responses list maintains chronological order by response date
```

**TC-DOM-FB-RESP-009: Each response has unique ID**
```
Given: Feedback with multiple responses
When: Response IDs are checked
Then: All response IDs are unique
```

#### 3.1.4 Feedback Resolution Tests

**TC-DOM-FB-RESOLVE-001: Resolve feedback from any status**
```
Given: Feedback in Created/Acknowledged/Responded status
When: resolve() is called
Then: Status changes to Resolved
```

**TC-DOM-FB-RESOLVE-002: Reject resolution of already resolved feedback**
```
Given: Feedback in Resolved status
When: resolve() is called
Then: InvalidFeedbackOperationException is thrown with message "Feedback is already resolved"
```

**TC-DOM-FB-RESOLVE-003: Resolve feedback without responses**
```
Given: Feedback in Acknowledged status with no responses
When: resolve() is called
Then: Feedback is resolved successfully
```

**TC-DOM-FB-RESOLVE-004: Resolve feedback with responses**
```
Given: Feedback in Responded status with 2 responses
When: resolve() is called
Then: Feedback is resolved successfully
```

#### 3.1.5 State Transition Tests

**TC-DOM-FB-STATE-001: Valid transition Created → Acknowledged**
```
Given: Feedback in Created status
When: acknowledge() is called
Then: Status changes to Acknowledged
```

**TC-DOM-FB-STATE-002: Valid transition Created → Responded**
```
Given: Feedback in Created status
When: addResponse() is called
Then: Status changes to Responded (skipping Acknowledged)
```

**TC-DOM-FB-STATE-003: Valid transition Acknowledged → Responded**
```
Given: Feedback in Acknowledged status
When: addResponse() is called
Then: Status changes to Responded
```

**TC-DOM-FB-STATE-004: Valid transition Created → Resolved**
```
Given: Feedback in Created status
When: resolve() is called
Then: Status changes to Resolved
```

**TC-DOM-FB-STATE-005: Valid transition Acknowledged → Resolved**
```
Given: Feedback in Acknowledged status
When: resolve() is called
Then: Status changes to Resolved
```

**TC-DOM-FB-STATE-006: Valid transition Responded → Resolved**
```
Given: Feedback in Responded status
When: resolve() is called
Then: Status changes to Resolved
```

**TC-DOM-FB-STATE-007: Cannot transition from Resolved**
```
Given: Feedback in Resolved status
When: Any state-changing operation is attempted
Then: InvalidFeedbackOperationException is thrown
```

#### 3.1.6 Business Rule Tests

**TC-DOM-FB-RULE-001: Feedback cannot be deleted**
```
Given: Any feedback record
When: canBeDeleted() is called
Then: Returns false (feedback can only be archived)
```

**TC-DOM-FB-RULE-002: Feedback must have KPI linkage**
```
Given: Attempt to create feedback without KPI
When: FeedbackRecord creation is attempted
Then: InvalidFeedbackOperationException is thrown
```

**TC-DOM-FB-RULE-003: Receiver validation on response**
```
Given: Feedback with specific receiver
When: Different user attempts to respond
Then: InvalidFeedbackOperationException is thrown
```

#### 3.1.7 Domain Event Tests

**TC-DOM-FB-EVENT-001: FeedbackProvided event structure**
```
Given: Valid feedback data
When: FeedbackRecord is created
Then: Event contains:
  - Event ID (UUID)
  - Feedback ID
  - Giver ID
  - Receiver ID
  - KPI ID
  - Feedback type
  - Created date
```

**TC-DOM-FB-EVENT-002: FeedbackProvided event raised on creation**
```
Given: Valid feedback data
When: FeedbackRecord.create() is called
Then: FeedbackProvided event is in domain events list
```

**TC-DOM-FB-EVENT-003: FeedbackResponseProvided event structure**
```
Given: Feedback with response added
When: addResponse() is called
Then: Event contains:
  - Event ID (UUID)
  - Feedback ID
  - Response ID
  - Responder ID
  - Response date
```

**TC-DOM-FB-EVENT-004: FeedbackResponseProvided event raised on response**
```
Given: Feedback in Created status
When: addResponse() is called
Then: FeedbackResponseProvided event is in domain events list
```

**TC-DOM-FB-EVENT-005: Multiple response events accumulated**
```
Given: Feedback with no responses
When: Two responses are added
Then: Two FeedbackResponseProvided events are in domain events list
```

**TC-DOM-FB-EVENT-006: Events cleared after retrieval**
```
Given: Feedback with domain events
When: getDomainEvents() is called
  And: clearDomainEvents() is called
Then: Domain events list is empty
```

---

## 4. FeedbackResponse Entity Tests

### 4.1 Test Class: `FeedbackResponseTest`

**TC-DOM-FRESP-001: Create response with valid data**
```
Given: Valid response ID, responder ID, response text, response date
When: FeedbackResponse is created
Then: All values are stored correctly
```

**TC-DOM-FRESP-002: Validate response text not null**
```
Given: Null response text
When: FeedbackResponse creation is attempted
Then: InvalidFeedbackOperationException is thrown
```

**TC-DOM-FRESP-003: Validate response text not empty**
```
Given: Empty response text
When: FeedbackResponse creation is attempted
Then: InvalidFeedbackOperationException is thrown
```

**TC-DOM-FRESP-004: Validate response text max length**
```
Given: Response text with 2001 characters
When: FeedbackResponse creation is attempted
Then: InvalidFeedbackOperationException is thrown
```

**TC-DOM-FRESP-005: Accept response at max length boundary**
```
Given: Response text with exactly 2000 characters
When: FeedbackResponse is created
Then: Response is created successfully
```

**TC-DOM-FRESP-006: Response date is immutable**
```
Given: Created feedback response
When: Attempt to modify response date
Then: Date cannot be changed
```

**TC-DOM-FRESP-007: Response text is immutable**
```
Given: Created feedback response
When: Attempt to modify response text
Then: Text cannot be changed
```

---

## 5. FeedbackContext Value Object Tests

### 5.1 Test Class: `FeedbackContextTest`

**TC-DOM-FCTX-001: Create context with valid data**
```
Given: Valid KPI ID, KPI name, content text
When: FeedbackContext is created
Then: All values are stored correctly
```

**TC-DOM-FCTX-002: Validate KPI ID not null**
```
Given: Null KPI ID
When: FeedbackContext creation is attempted
Then: InvalidFeedbackOperationException is thrown with message "Feedback must be linked to a KPI"
```

**TC-DOM-FCTX-003: Validate content text not null**
```
Given: Null content text
When: FeedbackContext creation is attempted
Then: InvalidFeedbackOperationException is thrown
```

**TC-DOM-FCTX-004: Validate content text not empty**
```
Given: Empty content text
When: FeedbackContext creation is attempted
Then: InvalidFeedbackOperationException is thrown with message "Feedback content cannot be empty"
```

**TC-DOM-FCTX-005: Validate content text max length**
```
Given: Content text with 5001 characters
When: FeedbackContext creation is attempted
Then: InvalidFeedbackOperationException is thrown with message "Feedback content cannot exceed 5000 characters"
```

**TC-DOM-FCTX-006: Accept content at max length boundary**
```
Given: Content text with exactly 5000 characters
When: FeedbackContext is created
Then: Context is created successfully
```

**TC-DOM-FCTX-007: Value object equality - same values**
```
Given: Two FeedbackContext objects with identical values
When: equals() is called
Then: Returns true
```

**TC-DOM-FCTX-008: Value object equality - different KPI IDs**
```
Given: Two FeedbackContext objects with different KPI IDs
When: equals() is called
Then: Returns false
```

**TC-DOM-FCTX-009: Value object equality - different content**
```
Given: Two FeedbackContext objects with different content text
When: equals() is called
Then: Returns false
```

**TC-DOM-FCTX-010: Value object immutability**
```
Given: Created FeedbackContext
When: Attempt to modify any field
Then: Fields cannot be changed (compile-time safety)
```

**TC-DOM-FCTX-011: Hash code consistency**
```
Given: Two FeedbackContext objects with identical values
When: hashCode() is called on both
Then: Hash codes are equal
```

**TC-DOM-FCTX-012: KPI name can be null**
```
Given: Valid KPI ID, null KPI name, valid content
When: FeedbackContext is created
Then: Context is created successfully
```

**TC-DOM-FCTX-013: KPI name stored correctly**
```
Given: KPI name "Sales Target Achievement"
When: FeedbackContext is created
Then: KPI name is retrievable and correct
```

---

## 6. Integration Scenarios

### 6.1 Complete Feedback Lifecycle Tests

**TC-DOM-FB-LIFECYCLE-001: Complete feedback flow**
```
Given: New feedback created
When: Following operations performed in sequence:
  1. acknowledge()
  2. addResponse("First response")
  3. addResponse("Follow-up question")
  4. resolve()
Then:
  - Status progresses: Created → Acknowledged → Responded → Resolved
  - 2 responses are stored
  - 3 domain events raised (1 FeedbackProvided, 2 FeedbackResponseProvided)
```

**TC-DOM-FB-LIFECYCLE-002: Feedback without acknowledgment**
```
Given: New feedback created
When: Following operations performed:
  1. addResponse("Direct response")
  2. resolve()
Then:
  - Status progresses: Created → Responded → Resolved
  - Acknowledgment step is skipped
```

**TC-DOM-FB-LIFECYCLE-003: Feedback resolved without response**
```
Given: New feedback created
When: Following operations performed:
  1. acknowledge()
  2. resolve()
Then:
  - Status progresses: Created → Acknowledged → Resolved
  - No responses in list
```

---

## 7. Edge Cases and Boundary Tests

### 7.1 Edge Case Tests

**TC-DOM-FB-EDGE-001: Feedback with minimum content length**
```
Given: Content text with 1 character
When: FeedbackRecord is created
Then: Feedback is created successfully
```

**TC-DOM-FB-EDGE-002: Response with minimum length**
```
Given: Response text with 1 character
When: addResponse() is called
Then: Response is added successfully
```

**TC-DOM-FB-EDGE-003: Feedback with special characters**
```
Given: Content text with special characters (!@#$%^&*)
When: FeedbackRecord is created
Then: Feedback is created successfully with special characters preserved
```

**TC-DOM-FB-EDGE-004: Feedback with Unicode characters**
```
Given: Content text with Unicode characters (emoji, Chinese, Arabic)
When: FeedbackRecord is created
Then: Feedback is created successfully with Unicode preserved
```

**TC-DOM-FB-EDGE-005: Feedback with line breaks**
```
Given: Content text with multiple line breaks
When: FeedbackRecord is created
Then: Feedback is created successfully with line breaks preserved
```

**TC-DOM-FB-EDGE-006: Response with HTML-like content**
```
Given: Response text with HTML tags
When: addResponse() is called
Then: Response is added with HTML tags as plain text
```

**TC-DOM-FB-EDGE-007: Same receiver responds multiple times**
```
Given: Feedback with one response from receiver
When: Same receiver adds another response
Then: Both responses are stored successfully
```

---

## 8. Test Data Builders

### 8.1 FeedbackRecordBuilder

```java
public class FeedbackRecordBuilder {
    private UUID giverId = UUID.randomUUID();
    private UUID receiverId = UUID.randomUUID();
    private UUID kpiId = UUID.randomUUID();
    private String kpiName = "Sales Target";
    private FeedbackType feedbackType = FeedbackType.POSITIVE;
    private String contentText = "Great job on achieving your sales target!";
    
    public FeedbackRecordBuilder fromGiver(UUID giverId) { ... }
    public FeedbackRecordBuilder toReceiver(UUID receiverId) { ... }
    public FeedbackRecordBuilder forKpi(UUID kpiId, String kpiName) { ... }
    public FeedbackRecordBuilder withType(FeedbackType type) { ... }
    public FeedbackRecordBuilder withContent(String content) { ... }
    public FeedbackRecord build() { ... }
}
```

### 8.2 FeedbackContextBuilder

```java
public class FeedbackContextBuilder {
    private UUID kpiId = UUID.randomUUID();
    private String kpiName = "Sales Target";
    private String contentText = "Good performance";
    
    public FeedbackContextBuilder forKpi(UUID kpiId, String kpiName) { ... }
    public FeedbackContextBuilder withContent(String content) { ... }
    public FeedbackContext build() { ... }
}
```

---

## 9. Test Execution

### 9.1 Running Tests

```bash
# Run all feedback domain tests
mvn test -Dtest=com.company.performance.domain.aggregate.feedback.**

# Run specific test class
mvn test -Dtest=FeedbackRecordTest

# Run with coverage
mvn test jacoco:report
```

### 9.2 Expected Results

- **Total Tests**: 52
- **Execution Time**: < 3 seconds
- **Pass Rate**: 100%
- **Coverage**: > 95%

---

## 10. Success Criteria

- ✅ All 52 test cases pass
- ✅ Line coverage ≥ 95%
- ✅ Branch coverage ≥ 90%
- ✅ No flaky tests
- ✅ All business rules validated
- ✅ All state transitions tested
- ✅ All domain events tested
- ✅ Edge cases covered

---

**Document Status**: ✅ READY FOR IMPLEMENTATION  
**Next Steps**: Implement test cases using JUnit 5 and AssertJ
