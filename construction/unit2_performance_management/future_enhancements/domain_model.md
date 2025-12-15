# Domain Model - Unit 2: Performance Management Service

## 1. Domain Analysis & Understanding

### 1.1 Core Domain Concepts

Based on the user stories (US-014 through US-026), the following core domain concepts have been identified:

**Performance Review Domain:**
- Review Template Configuration
- Review Cycle Management
- Self-Assessment Process
- Manager Assessment & Scoring
- Review Calibration
- Performance Scoring & Calculation

**Feedback & Recognition Domain:**
- Real-time Feedback (KPI-specific)
- Peer Recognition System
- Recognition Rewards (monetary/non-monetary)
- Feedback Response & Conversation
- External Platform Integration (Slack/Teams)

**Coaching & Development Domain:**
- Coaching Questions (manual & AI-generated)
- Coaching Resource Library
- Coaching Session Tracking
- Development Planning

### 1.2 Business Processes & Workflows

#### Performance Review Lifecycle
1. **Template Configuration** (US-014)
   - HR creates review template with KPI/competency weightings
   - Template assigned to roles/departments
   - Rating scales and criteria defined

2. **Review Cycle Initiation** (US-015)
   - Review cycle created based on template
   - Participants assigned
   - KPI data automatically pulled from KPI Management Service
   - Review process triggered after KPI finalization

3. **Self-Assessment** (US-016)
   - Employee completes self-assessment
   - Rates own KPI performance with comments
   - Uploads evidence/proof of performance
   - Indicates extra mile efforts
   - Saves drafts and submits

4. **Manager Assessment** (US-017)
   - Supervisor accesses employee self-assessment
   - Provides manager ratings alongside self-ratings
   - System highlights discrepancies
   - Adds detailed comments and recommendations
   - Recommends salary adjustments/promotions

5. **Calibration** (US-018)
   - Calibration session with multiple managers
   - Rating comparison with organizational benchmarks
   - Adjustment suggestions for consistency
   - Bias pattern tracking
   - Final rating consensus

6. **Review Completion**
   - Final scores calculated
   - Review archived
   - Performance insights generated

#### Feedback Flow
1. **Feedback Creation** (US-019, US-020)
   - Supervisor provides KPI-specific feedback
   - System suggests feedback based on KPI performance
   - Feedback linked to specific KPIs
   - Immediate visibility to employee
   - Follow-up conversations scheduled

2. **Feedback Response** (US-020)
   - Employee receives notification
   - Employee responds or asks clarifying questions
   - Feedback history tracked

3. **Recognition Flow** (US-021, US-022)
   - Employee recognizes colleague (anonymous option)
   - Recognition linked to KPI impact
   - Monetary/non-monetary reward selection
   - Same-team limitation enforcement
   - Visibility settings applied
   - Slack/Teams bot integration for instant recognition

#### Coaching Flow
1. **Coaching Question Management** (US-023, US-024)
   - Supervisor creates custom coaching questions per KPI
   - Questions categorized by performance level
   - AI generates contextual questions from KPI descriptions
   - Questions saved and reused
   - Templates and examples provided

2. **Coaching Resource Access** (US-025)
   - Database of coaching questions by KPI type
   - Search by keyword/category
   - Best practices and success stories
   - Community contributions and ratings

3. **Coaching Session Tracking** (US-026)
   - Log coaching session details
   - Track frequency and effectiveness
   - Link sessions to KPI improvements
   - Generate coaching reports

### 1.3 Domain Invariants & Business Rules

#### Review Management Rules
- A review template must have KPI weight + competency weight = 100%
- Review cycles must have non-overlapping date ranges for the same employee
- Self-assessment must be submitted before manager assessment can begin
- Manager assessment cannot be submitted without self-assessment completion
- Review scores are calculated based on template weightings (immutable after calculation)
- Calibration can only occur after manager assessments are completed
- Review cycle status transitions: Draft → Active → In Progress → Calibration → Completed → Archived
- Evidence uploads are optional but encouraged for self-assessment
- Rating scales must be consistent within a review template

#### Feedback & Recognition Rules
- Feedback must be linked to a specific KPI or be general behavioral feedback
- Feedback giver must have appropriate relationship to receiver (supervisor, peer, direct report)
- Recognition from the same team member has frequency limitations (prevent gaming)
- Anonymous recognition must still enforce team boundary rules
- Monetary rewards require approval workflow (not detailed in stories but implied)
- Feedback cannot be deleted, only marked as resolved/archived
- Recognition must specify KPI impact when linked to performance

#### Coaching Rules
- Coaching questions must be categorized by performance level (exceeding/meeting/below)
- AI-generated questions can be customized before saving
- Coaching sessions must be logged within 48 hours of occurrence (business policy)
- Coaching resources require quality ratings before being widely shared
- Coaching effectiveness is measured by subsequent KPI improvement

### 1.4 Bounded Context Boundaries

**Performance Management Bounded Context** owns:
- Review template definitions and configurations
- Review cycle orchestration and state management
- Assessment data (self and manager)
- Calibration session data and adjustments
- Feedback records and conversations
- Recognition data and reward tracking
- Coaching questions, resources, and session logs

**Integration Points:**

**Consumes from KPI Management Service:**
- KPI definitions (read-only)
- KPI assignments per employee (read-only)
- KPI achievement data for review calculations (read-only)
- KPI finalization status (triggers review process)

**Provides to Data & Analytics Service:**
- Performance review results and scores
- Feedback frequency and sentiment data
- Recognition patterns and engagement metrics
- Coaching session effectiveness data
- Calibration outcomes and rating distributions

**Serves Frontend Application:**
- All review, feedback, recognition, and coaching APIs
- Real-time notifications for feedback and recognition
- Review status and progress tracking

**Integrates with External Systems:**
- Slack/Teams APIs for bot interactions (anti-corruption layer needed)
- Notification Service for alerts and reminders
- Document Storage for evidence uploads
- AI Service for coaching question generation (external integration)

**Bounded Context Responsibilities:**
- Enforce review lifecycle and state transitions
- Calculate performance scores based on templates
- Manage feedback and recognition workflows
- Maintain coaching resource library
- Ensure data consistency within performance management domain
- Publish domain events for external consumption

---

## 2. Aggregate Identification & Design

### 2.1 Aggregate Design Principles Applied

Aggregates are designed based on:
- **Transactional Consistency Boundaries**: What must be consistent together?
- **Business Invariants**: What rules must always be enforced?
- **Lifecycle Cohesion**: What entities share the same lifecycle?
- **Change Frequency**: What changes together?

### 2.2 Identified Aggregates

#### Aggregate 1: ReviewTemplate
**Aggregate Root:** ReviewTemplate

**Transactional Boundary Rationale:**
- Template configuration must be consistent (weights must sum to 100%)
- Rating scales and criteria are tightly coupled to the template
- Role/department assignments are part of template definition
- Changes to template affect all future review cycles using it

**Aggregate Members:**
- ReviewTemplate (Root)
- TemplateSection (Entity)
- RatingScale (Value Object)
- CompetencyCriteria (Value Object)
- RoleAssignment (Value Object)

**Lifecycle States:**
- Draft → Active → Archived

**State Transitions:**
- Draft → Active: When template is validated and approved
- Active → Archived: When template is no longer in use (cannot delete if used in cycles)

**Invariants Protected:**
- KPI weight + competency weight = 100%
- At least one rating scale must be defined
- Rating scale values must be in ascending order
- Template must have at least one section
- Active templates cannot be modified (must create new version)

---

#### Aggregate 2: ReviewCycle
**Aggregate Root:** ReviewCycle

**Transactional Boundary Rationale:**
- Review cycle orchestrates the entire review process
- Participant assignments and their statuses must be consistent
- Cycle dates and deadlines are cohesive
- Cycle status transitions affect all participants
- Calibration is part of the review cycle completion process

**Aggregate Members:**
- ReviewCycle (Root)
- ReviewParticipant (Entity) - tracks individual employee participation
- SelfAssessment (Entity) - employee's self-evaluation
- ManagerAssessment (Entity) - supervisor's evaluation
- CalibrationAdjustment (Entity) - calibration changes to ratings
- AssessmentScore (Value Object)
- AssessmentComment (Value Object)
- EvidenceAttachment (Value Object)
- ScoreDiscrepancy (Value Object)

**Lifecycle States:**
- Draft → Active → InProgress → AwaitingCalibration → Calibrated → Completed → Archived

**State Transitions:**
- Draft → Active: When cycle is published and participants notified
- Active → InProgress: When first self-assessment is started
- InProgress → AwaitingCalibration: When all manager assessments are submitted
- AwaitingCalibration → Calibrated: When calibration session completes
- Calibrated → Completed: When all final scores are confirmed
- Completed → Archived: After retention period or manual archival

**Invariants Protected:**
- Self-assessment must be submitted before manager assessment
- Manager assessment cannot be submitted without self-assessment
- Calibration can only occur after all manager assessments are complete
- Final scores are immutable after calibration
- Cycle dates must be valid (start < end)
- Participants cannot be removed once cycle is active
- Each participant can have only one self-assessment and one manager assessment per cycle
- Score calculations must follow template weightings

**Design Decision - Calibration within ReviewCycle:**
Calibration is modeled as part of the ReviewCycle aggregate because:
- Calibration adjustments directly modify assessment scores within the cycle
- Calibration is a step in the review cycle lifecycle
- Transactional consistency is needed between calibration and final scores
- Calibration session data is specific to a review cycle

---

#### Aggregate 3: FeedbackRecord
**Aggregate Root:** FeedbackRecord

**Transactional Boundary Rationale:**
- Feedback creation and response are tightly coupled
- Feedback status and conversation thread must be consistent
- Feedback is an independent unit that can exist without a review cycle
- Each feedback record has its own lifecycle

**Aggregate Members:**
- FeedbackRecord (Root)
- FeedbackResponse (Entity) - responses to the feedback
- FeedbackContext (Value Object) - KPI linkage, type, etc.
- FeedbackContent (Value Object)
- FollowUpAction (Value Object)

**Lifecycle States:**
- Created → Acknowledged → Responded → Resolved → Archived

**State Transitions:**
- Created → Acknowledged: When receiver views the feedback
- Acknowledged → Responded: When receiver provides a response
- Responded → Resolved: When conversation is marked complete
- Resolved → Archived: After retention period

**Invariants Protected:**
- Feedback must have a giver and receiver
- Feedback must be linked to a KPI or marked as general behavioral
- Feedback type must be specified (positive/improvement/coaching)
- Feedback cannot be deleted, only archived
- Responses must be from the feedback receiver
- Follow-up actions can only be added by the feedback giver

---

#### Aggregate 4: Recognition
**Aggregate Root:** Recognition

**Transactional Boundary Rationale:**
- Recognition is an independent event with its own lifecycle
- Reward allocation and recognition visibility are coupled
- Anonymous recognition rules must be enforced at creation
- Recognition frequency limits are per recognition instance

**Aggregate Members:**
- Recognition (Root)
- RecognitionReward (Value Object)
- KPIImpact (Value Object)
- VisibilitySettings (Value Object)
- AnonymityContext (Value Object)

**Lifecycle States:**
- Created → Published → Acknowledged → Archived

**State Transitions:**
- Created → Published: When recognition passes validation and is visible
- Published → Acknowledged: When receiver acknowledges the recognition
- Acknowledged → Archived: After retention period

**Invariants Protected:**
- Recognition must have a giver and receiver (even if anonymous)
- Same-team recognition frequency limits enforced
- Anonymous recognition must still track giver internally for limit enforcement
- Monetary rewards require approval before publishing
- Recognition cannot be modified after publishing
- KPI impact must be specified if linked to performance
- Visibility settings must be valid for the organizational context

**Design Decision - Anonymous Recognition:**
- Giver identity is stored but marked as anonymous
- Team boundary validation occurs at creation time
- Frequency limits checked against internal giver ID
- External visibility respects anonymity setting

---

#### Aggregate 5: CoachingQuestion
**Aggregate Root:** CoachingQuestion

**Transactional Boundary Rationale:**
- Coaching questions are reusable resources with independent lifecycle
- Question effectiveness and usage tracking are coupled
- AI-generated vs manual questions have different metadata
- Questions can be shared and rated independently

**Aggregate Members:**
- CoachingQuestion (Root)
- QuestionContext (Value Object) - KPI type, performance level
- QuestionMetadata (Value Object) - creator, AI-generated flag, usage count
- EffectivenessRating (Value Object)

**Lifecycle States:**
- Draft → Active → Archived

**State Transitions:**
- Draft → Active: When question is validated and published
- Active → Archived: When question is no longer relevant

**Invariants Protected:**
- Question must be categorized by KPI type and performance level
- AI-generated questions must retain generation metadata
- Effectiveness ratings must be from users who have used the question
- Questions cannot be deleted if used in coaching sessions
- Question content cannot be empty

---

#### Aggregate 6: CoachingResource
**Aggregate Root:** CoachingResource

**Transactional Boundary Rationale:**
- Coaching resources are independent knowledge base items
- Resource ratings and contributions are coupled
- Resources have their own versioning and update lifecycle

**Aggregate Members:**
- CoachingResource (Root)
- ResourceContent (Value Object)
- ResourceMetadata (Value Object) - category, KPI type, tags
- ResourceRating (Entity) - user ratings and reviews
- ResourceVersion (Value Object)

**Lifecycle States:**
- Draft → UnderReview → Published → Archived

**State Transitions:**
- Draft → UnderReview: When resource is submitted for quality review
- UnderReview → Published: When resource passes quality threshold
- Published → Archived: When resource is outdated or superseded

**Invariants Protected:**
- Resources must have minimum quality rating before wide publication
- Resources must be categorized by KPI type or marked as general
- Resource content cannot be empty
- Ratings must be from authenticated users
- Resources cannot be deleted if referenced in coaching sessions

---

#### Aggregate 7: CoachingSession
**Aggregate Root:** CoachingSession

**Transactional Boundary Rationale:**
- Coaching session is a discrete event with specific outcomes
- Session topics, questions used, and outcomes are cohesive
- Session effectiveness tracking is coupled to the session
- Follow-up actions are part of the session lifecycle

**Aggregate Members:**
- CoachingSession (Root)
- SessionTopic (Entity) - topics discussed with KPI linkage
- SessionOutcome (Value Object)
- QuestionUsed (Value Object) - references to CoachingQuestion
- FollowUpAction (Value Object)
- EffectivenessMetric (Value Object)

**Lifecycle States:**
- Scheduled → InProgress → Completed → FollowUpPending → Closed

**State Transitions:**
- Scheduled → InProgress: When session starts
- InProgress → Completed: When session ends and notes are saved
- Completed → FollowUpPending: When follow-up actions are defined
- FollowUpPending → Closed: When all follow-ups are completed or session is archived

**Invariants Protected:**
- Session must have a supervisor and employee
- Session must be logged within 48 hours of occurrence
- Session duration must be positive
- Topics must be linked to KPIs or marked as general development
- Effectiveness metrics can only be added after session completion
- Follow-up actions must have due dates

---

### 2.3 Aggregate Relationship Overview

```
ReviewTemplate (1) ----< (N) ReviewCycle
    - A template can be used by multiple review cycles
    - Reference by TemplateId (not composition)

ReviewCycle (1) ----< (N) FeedbackRecord
    - Feedback can optionally reference a review cycle
    - Reference by CycleId (loose coupling)

ReviewCycle (1) ----< (N) CoachingSession
    - Coaching sessions can be triggered by review outcomes
    - Reference by CycleId (loose coupling)

CoachingQuestion (N) <----< (N) CoachingSession
    - Sessions reference questions used
    - Reference by QuestionId (not composition)

CoachingResource (N) <----< (N) CoachingSession
    - Sessions reference resources used
    - Reference by ResourceId (not composition)

FeedbackRecord (N) ----< (1) Employee
    - Feedback given to/from employees
    - Reference by EmployeeId (external aggregate)

Recognition (N) ----< (1) Employee
    - Recognition given to/from employees
    - Reference by EmployeeId (external aggregate)

CoachingSession (N) ----< (1) Supervisor
CoachingSession (N) ----< (1) Employee
    - Sessions involve supervisor and employee
    - Reference by SupervisorId, EmployeeId (external aggregates)
```

**Note:** Employee, Supervisor, and KPI are external aggregates from other bounded contexts. References are by ID only, never direct object references.

---

## 3. Entities & Value Objects Design

### 3.1 Design Principles

**Entities:**
- Have unique identity that persists over time
- Identity is immutable
- Equality based on identity, not attributes
- Have lifecycle and state transitions
- Can be mutable (within invariant constraints)

**Value Objects:**
- No conceptual identity
- Immutable
- Equality based on attribute values
- Represent descriptive aspects of the domain
- Can be shared and replaced

### 3.2 Aggregate 1: ReviewTemplate

#### Entities

**ReviewTemplate (Aggregate Root)**
- Identity: TemplateId (GUID)
- Attributes:
  - Name (string)
  - Description (string)
  - KPIWeight (percentage, 0-100)
  - CompetencyWeight (percentage, 0-100)
  - ReviewCycleFrequency (enum: Annual, SemiAnnual, Quarterly)
  - Status (enum: Draft, Active, Archived)
  - CreatedBy (UserId)
  - CreatedDate (timestamp)
  - LastModifiedDate (timestamp)
  - Version (int)
- Relationships:
  - Contains: List<TemplateSection>
  - Contains: RatingScale
  - Contains: List<CompetencyCriteria>
  - Contains: List<RoleAssignment>
- Behaviors:
  - Activate(): Validates and activates template
  - Archive(): Archives template if not in use
  - CreateNewVersion(): Creates new version for modifications
  - ValidateWeights(): Ensures KPI + Competency weights = 100%

**TemplateSection (Entity)**
- Identity: SectionId (GUID)
- Attributes:
  - Name (string)
  - Description (string)
  - SectionType (enum: KPIBased, CompetencyBased, Qualitative)
  - Weight (percentage)
  - DisplayOrder (int)
  - IsRequired (bool)
- Behaviors:
  - UpdateWeight(newWeight): Updates section weight
  - Reorder(newOrder): Changes display order

#### Value Objects

**RatingScale (Value Object)**
- Attributes:
  - ScaleName (string)
  - MinValue (decimal)
  - MaxValue (decimal)
  - Increments (decimal)
  - Labels (Dictionary<decimal, string>) - e.g., {1: "Below Expectations", 5: "Exceeds Expectations"}
- Validation:
  - MinValue < MaxValue
  - Increments > 0
  - Labels must cover the scale range

**CompetencyCriteria (Value Object)**
- Attributes:
  - CompetencyName (string)
  - Description (string)
  - BehavioralIndicators (List<string>)
  - Weight (percentage)
- Validation:
  - CompetencyName cannot be empty
  - Weight must be positive

**RoleAssignment (Value Object)**
- Attributes:
  - RoleId (string)
  - DepartmentId (string)
  - AssignmentType (enum: Role, Department, Individual)
- Validation:
  - At least one of RoleId or DepartmentId must be specified

---

### 3.3 Aggregate 2: ReviewCycle

#### Entities

**ReviewCycle (Aggregate Root)**
- Identity: CycleId (GUID)
- Attributes:
  - TemplateId (GUID) - reference to ReviewTemplate
  - CycleName (string)
  - StartDate (date)
  - EndDate (date)
  - SelfAssessmentDeadline (date)
  - ManagerAssessmentDeadline (date)
  - CalibrationDate (date)
  - Status (enum: Draft, Active, InProgress, AwaitingCalibration, Calibrated, Completed, Archived)
  - CreatedBy (UserId)
  - CreatedDate (timestamp)
- Relationships:
  - Contains: List<ReviewParticipant>
- Behaviors:
  - Activate(): Publishes cycle and notifies participants
  - StartSelfAssessment(participantId): Transitions participant to self-assessment
  - SubmitSelfAssessment(participantId, assessment): Records self-assessment
  - StartManagerAssessment(participantId): Enables manager assessment
  - SubmitManagerAssessment(participantId, assessment): Records manager assessment
  - InitiateCalibration(): Transitions to calibration phase
  - ApplyCalibrationAdjustments(adjustments): Applies calibration changes
  - Complete(): Finalizes cycle and calculates final scores
  - ValidateDates(): Ensures date sequence is valid

**ReviewParticipant (Entity)**
- Identity: ParticipantId (GUID)
- Attributes:
  - EmployeeId (GUID) - external reference
  - SupervisorId (GUID) - external reference
  - ParticipantStatus (enum: Pending, SelfAssessmentInProgress, SelfAssessmentSubmitted, ManagerAssessmentInProgress, ManagerAssessmentSubmitted, Calibrated, Completed)
  - AssignedDate (timestamp)
- Relationships:
  - Contains: SelfAssessment (optional, 0..1)
  - Contains: ManagerAssessment (optional, 0..1)
  - Contains: List<CalibrationAdjustment>
- Behaviors:
  - StartSelfAssessment(): Creates self-assessment
  - SubmitSelfAssessment(): Marks self-assessment as submitted
  - StartManagerAssessment(): Creates manager assessment
  - SubmitManagerAssessment(): Marks manager assessment as submitted
  - ApplyCalibration(adjustment): Applies calibration adjustment
  - CalculateFinalScore(): Computes final performance score

**SelfAssessment (Entity)**
- Identity: AssessmentId (GUID)
- Attributes:
  - SubmittedDate (timestamp)
  - Status (enum: Draft, Submitted)
  - Comments (string)
  - Goals (string)
  - ExtraMileEfforts (string)
- Relationships:
  - Contains: List<AssessmentScore> - KPI and competency scores
  - Contains: List<EvidenceAttachment>
- Behaviors:
  - AddScore(kpiId, score, comment): Adds KPI/competency score
  - AttachEvidence(evidence): Adds supporting evidence
  - Submit(): Marks assessment as submitted
  - SaveDraft(): Saves work in progress

**ManagerAssessment (Entity)**
- Identity: AssessmentId (GUID)
- Attributes:
  - SubmittedDate (timestamp)
  - Status (enum: Draft, Submitted)
  - OverallComments (string)
  - SalaryAdjustmentRecommendation (string)
  - PromotionRecommendation (string)
- Relationships:
  - Contains: List<AssessmentScore> - KPI and competency scores
  - Contains: List<ScoreDiscrepancy> - differences from self-assessment
- Behaviors:
  - AddScore(kpiId, score, comment): Adds KPI/competency score
  - CalculateDiscrepancies(selfAssessment): Identifies score differences
  - Submit(): Marks assessment as submitted
  - SaveDraft(): Saves work in progress

**CalibrationAdjustment (Entity)**
- Identity: AdjustmentId (GUID)
- Attributes:
  - CalibrationSessionId (GUID)
  - AdjustedBy (UserId)
  - AdjustmentDate (timestamp)
  - Rationale (string)
  - OrganizationalBenchmark (decimal)
- Relationships:
  - Contains: List<ScoreAdjustment> - before/after scores
- Behaviors:
  - ApplyAdjustment(): Modifies participant's final scores
  - RecordRationale(reason): Documents calibration reasoning

#### Value Objects

**AssessmentScore (Value Object)**
- Attributes:
  - KPIId (GUID) - reference to external KPI
  - ScoreType (enum: KPI, Competency)
  - RatingValue (decimal)
  - AchievementPercentage (decimal) - for KPI scores
  - Comment (string)
  - Weight (percentage)
- Validation:
  - RatingValue must be within template's rating scale
  - AchievementPercentage must be 0-100 for KPI scores

**AssessmentComment (Value Object)**
- Attributes:
  - CommentText (string)
  - CommentType (enum: Strength, ImprovementArea, Goal, General)
  - Timestamp (timestamp)
- Validation:
  - CommentText cannot be empty

**EvidenceAttachment (Value Object)**
- Attributes:
  - FileName (string)
  - FileUrl (string)
  - FileType (string)
  - UploadedDate (timestamp)
  - Description (string)
- Validation:
  - FileUrl must be valid
  - FileType must be allowed (documents, images)

**ScoreDiscrepancy (Value Object)**
- Attributes:
  - KPIId (GUID)
  - SelfScore (decimal)
  - ManagerScore (decimal)
  - Difference (decimal)
  - DiscrepancyLevel (enum: Minor, Moderate, Significant)
- Calculation:
  - Difference = ManagerScore - SelfScore
  - DiscrepancyLevel based on absolute difference threshold

**ScoreAdjustment (Value Object)**
- Attributes:
  - KPIId (GUID)
  - OriginalScore (decimal)
  - AdjustedScore (decimal)
  - AdjustmentReason (string)
- Validation:
  - AdjustedScore must be within rating scale

---

### 3.4 Aggregate 3: FeedbackRecord

#### Entities

**FeedbackRecord (Aggregate Root)**
- Identity: FeedbackId (GUID)
- Attributes:
  - GiverId (GUID) - external reference to User
  - ReceiverId (GUID) - external reference to User
  - CreatedDate (timestamp)
  - Status (enum: Created, Acknowledged, Responded, Resolved, Archived)
  - FeedbackType (enum: Positive, Improvement, Coaching, General)
- Relationships:
  - Contains: FeedbackContext
  - Contains: FeedbackContent
  - Contains: List<FeedbackResponse>
  - Contains: List<FollowUpAction>
- Behaviors:
  - Acknowledge(): Marks feedback as acknowledged by receiver
  - AddResponse(response): Adds receiver's response
  - Resolve(): Marks feedback conversation as resolved
  - Archive(): Archives feedback after retention period
  - AddFollowUpAction(action): Adds follow-up action

**FeedbackResponse (Entity)**
- Identity: ResponseId (GUID)
- Attributes:
  - ResponderId (GUID) - must be receiver
  - ResponseText (string)
  - ResponseDate (timestamp)
  - IsQuestion (bool)
- Behaviors:
  - Edit(newText): Allows editing within time window
  - MarkAsQuestion(): Flags response as needing clarification

#### Value Objects

**FeedbackContext (Value Object)**
- Attributes:
  - KPIId (GUID) - optional, null for general feedback
  - KPIName (string) - denormalized for display
  - ContextDescription (string)
  - IsKPISpecific (bool)
- Validation:
  - If IsKPISpecific is true, KPIId must be provided

**FeedbackContent (Value Object)**
- Attributes:
  - ContentText (string)
  - RecognitionAspects (List<string>) - for positive feedback
  - ImprovementSuggestions (List<string>) - for improvement feedback
  - TrainingMaterialLinks (List<string>) - suggested resources
- Validation:
  - ContentText cannot be empty
  - At least one aspect/suggestion for typed feedback

**FollowUpAction (Value Object)**
- Attributes:
  - ActionDescription (string)
  - DueDate (date)
  - Status (enum: Pending, Completed, Cancelled)
  - CompletedDate (timestamp)
- Validation:
  - DueDate must be in the future when created

---

### 3.5 Aggregate 4: Recognition

#### Entities

**Recognition (Aggregate Root)**
- Identity: RecognitionId (GUID)
- Attributes:
  - GiverId (GUID) - internal, may be hidden if anonymous
  - ReceiverId (GUID)
  - CreatedDate (timestamp)
  - Status (enum: Created, Published, Acknowledged, Archived)
  - RecognitionType (enum: PeerToPeer, SupervisorToEmployee, TeamRecognition)
  - IsAnonymous (bool)
- Relationships:
  - Contains: RecognitionReward
  - Contains: KPIImpact
  - Contains: VisibilitySettings
  - Contains: AnonymityContext
- Behaviors:
  - Publish(): Makes recognition visible per settings
  - Acknowledge(): Receiver acknowledges recognition
  - ValidateFrequencyLimit(giverId, receiverId): Checks same-team limits
  - Archive(): Archives recognition after retention period

#### Value Objects

**RecognitionReward (Value Object)**
- Attributes:
  - RewardType (enum: Monetary, NonMonetary, Points, Badge)
  - RewardValue (decimal) - for monetary/points
  - RewardDescription (string)
  - RequiresApproval (bool)
  - ApprovalStatus (enum: Pending, Approved, Rejected)
- Validation:
  - Monetary rewards must have positive value
  - Monetary rewards require approval

**KPIImpact (Value Object)**
- Attributes:
  - KPIId (GUID) - optional
  - ImpactDescription (string)
  - ImpactLevel (enum: Minor, Moderate, Significant, Exceptional)
- Validation:
  - If KPIId is provided, ImpactDescription must be specified

**VisibilitySettings (Value Object)**
- Attributes:
  - VisibilityScope (enum: Private, Team, Department, Organization, Public)
  - VisibleToRoles (List<string>)
  - ShowInFeed (bool)
- Validation:
  - VisibilityScope must be appropriate for organization

**AnonymityContext (Value Object)**
- Attributes:
  - IsAnonymous (bool)
  - InternalGiverId (GUID) - stored for limit enforcement
  - GiverTeamId (GUID) - for team boundary validation
  - AnonymityReason (string)
- Validation:
  - If IsAnonymous, InternalGiverId must still be stored
  - Team boundary validation occurs at creation

---

### 3.6 Aggregate 5: CoachingQuestion

#### Entities

**CoachingQuestion (Aggregate Root)**
- Identity: QuestionId (GUID)
- Attributes:
  - QuestionText (string)
  - Status (enum: Draft, Active, Archived)
  - CreatedBy (UserId)
  - CreatedDate (timestamp)
  - LastModifiedDate (timestamp)
  - IsAIGenerated (bool)
  - UsageCount (int)
  - AverageEffectivenessRating (decimal)
- Relationships:
  - Contains: QuestionContext
  - Contains: QuestionMetadata
  - Contains: List<EffectivenessRating>
- Behaviors:
  - Activate(): Publishes question for use
  - Archive(): Archives question
  - IncrementUsage(): Tracks question usage
  - AddEffectivenessRating(rating): Records effectiveness feedback
  - RecalculateAverageRating(): Updates average effectiveness

#### Value Objects

**QuestionContext (Value Object)**
- Attributes:
  - KPIType (string) - e.g., "Sales Revenue", "Customer Satisfaction"
  - PerformanceLevel (enum: BelowExpectations, MeetingExpectations, ExceedingExpectations)
  - ApplicableScenarios (List<string>)
- Validation:
  - KPIType cannot be empty
  - PerformanceLevel must be specified

**QuestionMetadata (Value Object)**
- Attributes:
  - CreatorId (UserId)
  - AIGenerationModel (string) - if AI-generated
  - AIGenerationPrompt (string) - if AI-generated
  - SourceKPIDescription (string) - original KPI description used
  - Tags (List<string>)
  - Category (string)
- Validation:
  - If IsAIGenerated, AI metadata must be present

**EffectivenessRating (Value Object)**
- Attributes:
  - RatedBy (UserId)
  - RatingValue (decimal, 1-5)
  - RatingComment (string)
  - RatedDate (timestamp)
  - UsageContext (string) - how it was used
- Validation:
  - RatingValue must be 1-5
  - RatedBy must have used the question

---

### 3.7 Aggregate 6: CoachingResource

#### Entities

**CoachingResource (Aggregate Root)**
- Identity: ResourceId (GUID)
- Attributes:
  - Title (string)
  - Status (enum: Draft, UnderReview, Published, Archived)
  - CreatedBy (UserId)
  - CreatedDate (timestamp)
  - LastModifiedDate (timestamp)
  - CurrentVersion (int)
  - AverageRating (decimal)
- Relationships:
  - Contains: ResourceContent
  - Contains: ResourceMetadata
  - Contains: List<ResourceRating>
  - Contains: List<ResourceVersion>
- Behaviors:
  - SubmitForReview(): Moves to review status
  - Publish(): Publishes resource if quality threshold met
  - Archive(): Archives outdated resource
  - AddRating(rating): Records user rating
  - CreateNewVersion(content): Creates new version
  - RecalculateAverageRating(): Updates average rating

**ResourceRating (Entity)**
- Identity: RatingId (GUID)
- Attributes:
  - RatedBy (UserId)
  - RatingValue (decimal, 1-5)
  - ReviewText (string)
  - RatedDate (timestamp)
  - IsVerifiedUser (bool) - user has used the resource
- Behaviors:
  - Update(newRating, newReview): Updates rating
  - MarkAsHelpful(userId): Tracks helpfulness votes

#### Value Objects

**ResourceContent (Value Object)**
- Attributes:
  - ContentText (string)
  - ContentFormat (enum: Text, Markdown, HTML, PDF, Video)
  - ContentUrl (string) - for external resources
  - BestPractices (List<string>)
  - SuccessStories (List<string>)
  - Examples (List<string>)
- Validation:
  - Either ContentText or ContentUrl must be provided
  - ContentFormat must match content type

**ResourceMetadata (Value Object)**
- Attributes:
  - Category (string)
  - KPIType (string) - optional, null for general resources
  - Tags (List<string>)
  - TargetAudience (enum: Supervisors, Employees, HR, All)
  - DifficultyLevel (enum: Beginner, Intermediate, Advanced)
  - EstimatedReadTime (int) - in minutes
- Validation:
  - Category cannot be empty
  - Tags must be non-empty list

**ResourceVersion (Value Object)**
- Attributes:
  - VersionNumber (int)
  - VersionDate (timestamp)
  - ChangeDescription (string)
  - ModifiedBy (UserId)
- Validation:
  - VersionNumber must increment
  - ChangeDescription required for versions > 1

---

### 3.8 Aggregate 7: CoachingSession

#### Entities

**CoachingSession (Aggregate Root)**
- Identity: SessionId (GUID)
- Attributes:
  - SupervisorId (GUID) - external reference
  - EmployeeId (GUID) - external reference
  - ScheduledDate (timestamp)
  - ActualDate (timestamp)
  - Duration (int) - in minutes
  - Status (enum: Scheduled, InProgress, Completed, FollowUpPending, Closed)
  - LoggedDate (timestamp)
  - OverallNotes (string)
- Relationships:
  - Contains: List<SessionTopic>
  - Contains: SessionOutcome
  - Contains: List<QuestionUsed>
  - Contains: List<FollowUpAction>
  - Contains: EffectivenessMetric (optional)
- Behaviors:
  - Start(): Marks session as in progress
  - Complete(notes, outcome): Completes session
  - AddTopic(topic): Adds discussion topic
  - RecordQuestionUsed(questionId): Tracks coaching questions used
  - AddFollowUpAction(action): Adds follow-up action
  - RecordEffectiveness(metric): Records effectiveness after follow-up period
  - Close(): Closes session after follow-ups complete
  - ValidateLoggingDeadline(): Ensures logged within 48 hours

**SessionTopic (Entity)**
- Identity: TopicId (GUID)
- Attributes:
  - TopicName (string)
  - KPIId (GUID) - optional, null for general development
  - DiscussionNotes (string)
  - TopicType (enum: KPIPerformance, CareerDevelopment, SkillBuilding, BehavioralFeedback)
  - TimeSpent (int) - in minutes
- Behaviors:
  - UpdateNotes(notes): Updates discussion notes
  - LinkToKPI(kpiId): Associates topic with KPI

#### Value Objects

**SessionOutcome (Value Object)**
- Attributes:
  - OutcomeSummary (string)
  - KeyInsights (List<string>)
  - EmployeeCommitments (List<string>)
  - SupervisorCommitments (List<string>)
  - NextSessionDate (date) - optional
- Validation:
  - OutcomeSummary cannot be empty
  - At least one insight or commitment

**QuestionUsed (Value Object)**
- Attributes:
  - QuestionId (GUID) - reference to CoachingQuestion
  - QuestionText (string) - denormalized
  - EmployeeResponse (string)
  - WasEffective (bool)
- Validation:
  - QuestionId must reference valid coaching question

**FollowUpAction (Value Object)**
- Attributes:
  - ActionDescription (string)
  - AssignedTo (enum: Employee, Supervisor, Both)
  - DueDate (date)
  - Status (enum: Pending, InProgress, Completed, Cancelled)
  - CompletedDate (timestamp)
  - CompletionNotes (string)
- Validation:
  - DueDate must be after session date
  - ActionDescription cannot be empty

**EffectivenessMetric (Value Object)**
- Attributes:
  - MeasuredDate (timestamp)
  - KPIImprovementPercentage (decimal) - if linked to KPI
  - EmployeeSatisfactionRating (decimal, 1-5)
  - SupervisorSatisfactionRating (decimal, 1-5)
  - BehavioralChangeObserved (bool)
  - Notes (string)
- Validation:
  - MeasuredDate must be after session completion
  - Ratings must be 1-5

---

### 3.9 Entity Relationship Navigation Patterns

**Within Aggregate Boundaries:**
- Direct object references allowed
- Parent entity has collection of child entities
- Child entities can navigate to parent via reference

**Across Aggregate Boundaries:**
- Reference by ID only (GUID)
- No direct object references
- Use repositories to load related aggregates
- Consider eventual consistency for cross-aggregate operations

**External References:**
- Employee, Supervisor, User, KPI are external aggregates
- Always reference by ID
- Denormalize frequently accessed attributes (e.g., names) for display
- Refresh denormalized data via domain events

---

## 4. Domain Events Design

### 4.1 Domain Event Principles

Domain events represent significant business occurrences that:
- Have already happened (past tense naming)
- Are immutable once created
- Contain all necessary data for consumers
- Include metadata (timestamp, event ID, aggregate ID, version)
- Enable eventual consistency across aggregates and bounded contexts
- Trigger side effects and integrations

### 4.2 Event Structure Template

All domain events follow this structure:
```
Event Name: <AggregateRoot><ActionCompleted>
Event ID: GUID
Timestamp: ISO 8601 timestamp
Aggregate ID: GUID of the aggregate root
Aggregate Type: Name of aggregate root
Event Version: Semantic version (e.g., 1.0)
Correlation ID: GUID for tracking related events
Causation ID: GUID of the event that caused this event
Payload: Event-specific data
Metadata: Additional context (user ID, tenant ID, etc.)
```

### 4.3 Review Management Domain Events

#### ReviewTemplateCreated
**When:** A new review template is created
**Triggered By:** ReviewTemplate.Create()
**Consumers:** Data & Analytics Service, Frontend Application
**Payload:**
- TemplateId (GUID)
- TemplateName (string)
- KPIWeight (decimal)
- CompetencyWeight (decimal)
- ReviewCycleFrequency (enum)
- CreatedBy (UserId)
- RoleAssignments (List<RoleAssignment>)

**Business Impact:**
- Analytics service can prepare reporting templates
- Frontend can refresh template lists

---

#### ReviewTemplateActivated
**When:** A review template is activated for use
**Triggered By:** ReviewTemplate.Activate()
**Consumers:** Data & Analytics Service, Frontend Application
**Payload:**
- TemplateId (GUID)
- TemplateName (string)
- ActivatedBy (UserId)
- ActivationDate (timestamp)

**Business Impact:**
- Template becomes available for review cycle creation
- Notifications sent to relevant HR personnel

---

#### ReviewCycleCreated
**When:** A new review cycle is created
**Triggered By:** ReviewCycle.Create()
**Consumers:** Data & Analytics Service, Frontend Application, Notification Service
**Payload:**
- CycleId (GUID)
- TemplateId (GUID)
- CycleName (string)
- StartDate (date)
- EndDate (date)
- ParticipantCount (int)
- ParticipantIds (List<GUID>)
- CreatedBy (UserId)

**Business Impact:**
- Participants are notified of upcoming review
- Analytics service prepares performance data aggregation
- Calendar reminders scheduled

---

#### ReviewCycleActivated
**When:** A review cycle is activated and participants can begin
**Triggered By:** ReviewCycle.Activate()
**Consumers:** Frontend Application, Notification Service, KPI Management Service
**Payload:**
- CycleId (GUID)
- CycleName (string)
- SelfAssessmentDeadline (date)
- ManagerAssessmentDeadline (date)
- ParticipantIds (List<GUID>)
- ActivatedBy (UserId)

**Business Impact:**
- Participants receive notifications to begin self-assessment
- KPI data is pulled and frozen for the review period
- Deadline reminders scheduled

---

#### SelfAssessmentStarted
**When:** An employee starts their self-assessment
**Triggered By:** ReviewParticipant.StartSelfAssessment()
**Consumers:** Data & Analytics Service, Frontend Application
**Payload:**
- CycleId (GUID)
- ParticipantId (GUID)
- EmployeeId (GUID)
- AssessmentId (GUID)
- StartedDate (timestamp)

**Business Impact:**
- Progress tracking updated
- Supervisor notified that employee has started

---

#### SelfAssessmentSubmitted
**When:** An employee submits their self-assessment
**Triggered By:** SelfAssessment.Submit()
**Consumers:** Frontend Application, Notification Service, Data & Analytics Service
**Payload:**
- CycleId (GUID)
- ParticipantId (GUID)
- EmployeeId (GUID)
- SupervisorId (GUID)
- AssessmentId (GUID)
- SubmittedDate (timestamp)
- KPIScores (List<AssessmentScore>)
- CompetencyScores (List<AssessmentScore>)
- EvidenceCount (int)
- ExtraMileEffortsProvided (bool)

**Business Impact:**
- Supervisor notified to begin manager assessment
- Analytics service records self-assessment patterns
- Progress tracking updated

---

#### ManagerAssessmentStarted
**When:** A supervisor starts manager assessment
**Triggered By:** ReviewParticipant.StartManagerAssessment()
**Consumers:** Data & Analytics Service, Frontend Application
**Payload:**
- CycleId (GUID)
- ParticipantId (GUID)
- EmployeeId (GUID)
- SupervisorId (GUID)
- AssessmentId (GUID)
- StartedDate (timestamp)

**Business Impact:**
- Progress tracking updated
- Employee notified that supervisor is reviewing

---

#### ManagerAssessmentSubmitted
**When:** A supervisor submits manager assessment
**Triggered By:** ManagerAssessment.Submit()
**Consumers:** Frontend Application, Notification Service, Data & Analytics Service
**Payload:**
- CycleId (GUID)
- ParticipantId (GUID)
- EmployeeId (GUID)
- SupervisorId (GUID)
- AssessmentId (GUID)
- SubmittedDate (timestamp)
- KPIScores (List<AssessmentScore>)
- CompetencyScores (List<AssessmentScore>)
- Discrepancies (List<ScoreDiscrepancy>)
- SalaryAdjustmentRecommended (bool)
- PromotionRecommended (bool)

**Business Impact:**
- Employee notified of completed assessment
- Calibration readiness checked
- Analytics service records assessment patterns and discrepancies

---

#### ReviewCalibrationInitiated
**When:** Calibration phase begins for a review cycle
**Triggered By:** ReviewCycle.InitiateCalibration()
**Consumers:** Frontend Application, Notification Service, Data & Analytics Service
**Payload:**
- CycleId (GUID)
- CalibrationSessionId (GUID)
- ParticipantCount (int)
- SupervisorIds (List<GUID>)
- InitiatedBy (UserId)
- InitiatedDate (timestamp)

**Business Impact:**
- Supervisors notified of calibration session
- Rating distribution analysis prepared
- Calibration meeting scheduled

---

#### ReviewCalibrationCompleted
**When:** Calibration adjustments are applied
**Triggered By:** ReviewCycle.ApplyCalibrationAdjustments()
**Consumers:** Frontend Application, Data & Analytics Service
**Payload:**
- CycleId (GUID)
- CalibrationSessionId (GUID)
- AdjustmentCount (int)
- AdjustedParticipants (List<GUID>)
- RatingDistribution (Dictionary<string, int>)
- CompletedBy (UserId)
- CompletedDate (timestamp)

**Business Impact:**
- Final scores updated
- Analytics service records calibration patterns
- Bias detection algorithms updated

---

#### ReviewCycleCompleted
**When:** A review cycle is completed
**Triggered By:** ReviewCycle.Complete()
**Consumers:** Frontend Application, Data & Analytics Service, KPI Management Service, Notification Service
**Payload:**
- CycleId (GUID)
- CycleName (string)
- CompletedDate (timestamp)
- ParticipantCount (int)
- CompletionRate (decimal)
- AverageScore (decimal)
- HighPerformerCount (int)
- LowPerformerCount (int)
- CompletedBy (UserId)

**Business Impact:**
- Participants notified of final results
- Performance data sent to Data & Analytics Service
- Next cycle planning can begin
- KPI assignments may be updated based on results

---

### 4.4 Feedback & Recognition Domain Events

#### FeedbackProvided
**When:** Feedback is given to an employee
**Triggered By:** FeedbackRecord.Create()
**Consumers:** Frontend Application, Notification Service, Data & Analytics Service
**Payload:**
- FeedbackId (GUID)
- GiverId (GUID)
- ReceiverId (GUID)
- FeedbackType (enum)
- KPIId (GUID) - optional
- IsKPISpecific (bool)
- CreatedDate (timestamp)
- HasTrainingMaterialSuggestions (bool)

**Business Impact:**
- Receiver notified of new feedback
- Analytics service tracks feedback frequency
- Training recommendations may be triggered

---

#### FeedbackAcknowledged
**When:** Feedback is acknowledged by receiver
**Triggered By:** FeedbackRecord.Acknowledge()
**Consumers:** Frontend Application, Data & Analytics Service
**Payload:**
- FeedbackId (GUID)
- ReceiverId (GUID)
- AcknowledgedDate (timestamp)

**Business Impact:**
- Giver notified of acknowledgment
- Feedback engagement metrics updated

---

#### FeedbackResponseProvided
**When:** Receiver responds to feedback
**Triggered By:** FeedbackRecord.AddResponse()
**Consumers:** Frontend Application, Notification Service, Data & Analytics Service
**Payload:**
- FeedbackId (GUID)
- ResponseId (GUID)
- ResponderId (GUID)
- GiverId (GUID)
- IsQuestion (bool)
- ResponseDate (timestamp)

**Business Impact:**
- Giver notified of response
- Conversation tracking updated
- Follow-up may be needed if question asked

---

#### FeedbackResolved
**When:** Feedback conversation is marked as resolved
**Triggered By:** FeedbackRecord.Resolve()
**Consumers:** Data & Analytics Service, Frontend Application
**Payload:**
- FeedbackId (GUID)
- GiverId (GUID)
- ReceiverId (GUID)
- ResolvedDate (timestamp)
- ConversationLength (int) - number of responses
- TimeToResolution (int) - in days

**Business Impact:**
- Analytics service records resolution patterns
- Feedback effectiveness metrics updated

---

#### RecognitionGiven
**When:** Recognition is given to an employee
**Triggered By:** Recognition.Create()
**Consumers:** Frontend Application, Notification Service, Data & Analytics Service
**Payload:**
- RecognitionId (GUID)
- GiverId (GUID) - internal only if anonymous
- ReceiverId (GUID)
- RecognitionType (enum)
- IsAnonymous (bool)
- RewardType (enum)
- RewardValue (decimal)
- KPIId (GUID) - optional
- HasKPIImpact (bool)
- VisibilityScope (enum)
- CreatedDate (timestamp)

**Business Impact:**
- Receiver notified of recognition
- Recognition feed updated per visibility settings
- Analytics service tracks recognition patterns
- Monetary rewards trigger approval workflow

---

#### RecognitionPublished
**When:** Recognition is published and visible
**Triggered By:** Recognition.Publish()
**Consumers:** Frontend Application, Data & Analytics Service, External Integration (Slack/Teams)
**Payload:**
- RecognitionId (GUID)
- ReceiverId (GUID)
- RecognitionType (enum)
- IsAnonymous (bool)
- VisibilityScope (enum)
- PublishedDate (timestamp)
- ShowInExternalPlatforms (bool)

**Business Impact:**
- Recognition appears in feeds
- External platforms (Slack/Teams) notified if configured
- Team morale metrics updated

---

#### RecognitionAcknowledged
**When:** Recognition is acknowledged by receiver
**Triggered By:** Recognition.Acknowledge()
**Consumers:** Frontend Application, Data & Analytics Service
**Payload:**
- RecognitionId (GUID)
- ReceiverId (GUID)
- AcknowledgedDate (timestamp)

**Business Impact:**
- Giver notified (if not anonymous)
- Recognition engagement metrics updated

---

### 4.5 Coaching & Development Domain Events

#### CoachingQuestionCreated
**When:** A new coaching question is created
**Triggered By:** CoachingQuestion.Create()
**Consumers:** Data & Analytics Service, Frontend Application
**Payload:**
- QuestionId (GUID)
- QuestionText (string)
- KPIType (string)
- PerformanceLevel (enum)
- IsAIGenerated (bool)
- CreatedBy (UserId)
- CreatedDate (timestamp)

**Business Impact:**
- Question library updated
- AI learning model may be updated with feedback

---

#### CoachingQuestionUsed
**When:** A coaching question is used in a session
**Triggered By:** CoachingSession.RecordQuestionUsed()
**Consumers:** Data & Analytics Service
**Payload:**
- QuestionId (GUID)
- SessionId (GUID)
- SupervisorId (GUID)
- EmployeeId (GUID)
- UsedDate (timestamp)
- WasEffective (bool)

**Business Impact:**
- Question usage count incremented
- Effectiveness tracking updated
- Popular questions identified

---

#### CoachingResourcePublished
**When:** A coaching resource is published
**Triggered By:** CoachingResource.Publish()
**Consumers:** Frontend Application, Notification Service, Data & Analytics Service
**Payload:**
- ResourceId (GUID)
- Title (string)
- Category (string)
- KPIType (string)
- CreatedBy (UserId)
- PublishedDate (timestamp)
- QualityRating (decimal)

**Business Impact:**
- Resource library updated
- Relevant supervisors notified
- Resource discovery improved

---

#### CoachingSessionScheduled
**When:** A coaching session is scheduled
**Triggered By:** CoachingSession.Create()
**Consumers:** Frontend Application, Notification Service
**Payload:**
- SessionId (GUID)
- SupervisorId (GUID)
- EmployeeId (GUID)
- ScheduledDate (timestamp)
- EstimatedDuration (int)

**Business Impact:**
- Calendar invites sent
- Reminders scheduled
- Coaching frequency tracked

---

#### CoachingSessionCompleted
**When:** A coaching session is completed and logged
**Triggered By:** CoachingSession.Complete()
**Consumers:** Frontend Application, Data & Analytics Service, KPI Management Service
**Payload:**
- SessionId (GUID)
- SupervisorId (GUID)
- EmployeeId (GUID)
- ActualDate (timestamp)
- Duration (int)
- TopicCount (int)
- KPIIds (List<GUID>) - KPIs discussed
- FollowUpActionCount (int)
- LoggedDate (timestamp)

**Business Impact:**
- Coaching history updated
- Analytics service tracks coaching effectiveness
- KPI improvement correlation analysis triggered
- Follow-up reminders scheduled

---

#### CoachingEffectivenessRecorded
**When:** Coaching session effectiveness is measured
**Triggered By:** CoachingSession.RecordEffectiveness()
**Consumers:** Data & Analytics Service
**Payload:**
- SessionId (GUID)
- SupervisorId (GUID)
- EmployeeId (GUID)
- KPIImprovementPercentage (decimal)
- EmployeeSatisfactionRating (decimal)
- SupervisorSatisfactionRating (decimal)
- BehavioralChangeObserved (bool)
- MeasuredDate (timestamp)

**Business Impact:**
- Coaching ROI calculated
- Supervisor coaching effectiveness tracked
- Best practices identified
- Coaching recommendations refined

---

### 4.6 Integration Domain Events

#### SlackRecognitionReceived
**When:** Recognition is received via Slack bot
**Triggered By:** External Slack integration
**Consumers:** Recognition Aggregate, Data & Analytics Service
**Payload:**
- SlackUserId (string)
- SlackChannelId (string)
- RecognitionText (string)
- RecipientSlackUserId (string)
- Timestamp (timestamp)
- SlackMessageId (string)

**Business Impact:**
- Recognition created in system
- Slack message linked to recognition record
- Cross-platform recognition tracked

---

#### TeamsRecognitionReceived
**When:** Recognition is received via Teams bot
**Triggered By:** External Teams integration
**Consumers:** Recognition Aggregate, Data & Analytics Service
**Payload:**
- TeamsUserId (string)
- TeamsChannelId (string)
- RecognitionText (string)
- RecipientTeamsUserId (string)
- Timestamp (timestamp)
- TeamsMessageId (string)

**Business Impact:**
- Recognition created in system
- Teams message linked to recognition record
- Cross-platform recognition tracked

---

### 4.7 Event Ordering & Causality

**Review Lifecycle Event Chain:**
```
ReviewTemplateCreated
  → ReviewTemplateActivated
    → ReviewCycleCreated
      → ReviewCycleActivated
        → SelfAssessmentStarted
          → SelfAssessmentSubmitted
            → ManagerAssessmentStarted
              → ManagerAssessmentSubmitted
                → ReviewCalibrationInitiated
                  → ReviewCalibrationCompleted
                    → ReviewCycleCompleted
```

**Feedback Lifecycle Event Chain:**
```
FeedbackProvided
  → FeedbackAcknowledged
    → FeedbackResponseProvided (0..N times)
      → FeedbackResolved
```

**Recognition Lifecycle Event Chain:**
```
RecognitionGiven
  → RecognitionPublished
    → RecognitionAcknowledged
```

**Coaching Lifecycle Event Chain:**
```
CoachingSessionScheduled
  → CoachingSessionCompleted
    → CoachingEffectivenessRecorded
```

### 4.8 Event Versioning Strategy

Events are versioned to handle schema evolution:
- **Major Version Change**: Breaking changes (field removal, type change)
- **Minor Version Change**: Additive changes (new optional fields)
- **Patch Version Change**: Documentation or metadata updates

Event consumers must handle multiple versions gracefully using:
- Version-specific deserializers
- Upcasting (converting old events to new format)
- Downcasting (converting new events to old format for legacy consumers)

---

## 5. Domain Services & Policies

### 5.1 Domain Service Principles

Domain Services are used when:
- An operation involves multiple aggregates
- The operation doesn't naturally belong to any single entity
- The operation represents a significant business process
- Complex calculations or algorithms are needed
- External data or services are required for domain logic

Domain Services are:
- Stateless
- Defined by their interface (contract)
- Named after domain activities (verbs)
- Part of the domain layer (not infrastructure)

### 5.2 Domain Services

#### PerformanceScoreCalculationService

**Responsibility:** Calculate final performance scores based on review template weightings and assessment data

**Interface:**
```
CalculateFinalScore(
  templateId: GUID,
  kpiScores: List<AssessmentScore>,
  competencyScores: List<AssessmentScore>
) : FinalPerformanceScore

CalculateWeightedKPIScore(
  kpiScores: List<AssessmentScore>,
  kpiWeight: decimal
) : decimal

CalculateWeightedCompetencyScore(
  competencyScores: List<AssessmentScore>,
  competencyWeight: decimal
) : decimal

ValidateScoreConsistency(
  selfAssessment: SelfAssessment,
  managerAssessment: ManagerAssessment
) : List<ScoreDiscrepancy>
```

**Dependencies:**
- ReviewTemplate Repository (to get template configuration)
- KPI Management Service (to get KPI definitions and weights)

**Business Rules:**
- Final score = (KPI weighted average × KPI weight) + (Competency weighted average × Competency weight)
- Individual KPI scores are weighted by their importance
- Competency scores are averaged equally unless specified otherwise
- Score must be within template's rating scale range
- Rounding rules: Round to 2 decimal places

**Usage:**
- Called by ReviewCycle when calculating participant final scores
- Called during calibration to recalculate adjusted scores
- Called by Data & Analytics Service for performance reporting

---

#### CalibrationService

**Responsibility:** Facilitate calibration process and ensure rating consistency across organization

**Interface:**
```
AnalyzeRatingDistribution(
  cycleId: GUID
) : RatingDistributionAnalysis

IdentifyRatingBias(
  supervisorId: GUID,
  cycleId: GUID
) : BiasAnalysis

SuggestCalibrationAdjustments(
  cycleId: GUID,
  organizationalBenchmarks: BenchmarkData
) : List<CalibrationSuggestion>

ApplyCalibrationAdjustments(
  cycleId: GUID,
  adjustments: List<CalibrationAdjustment>
) : CalibrationResult

ValidateCalibrationConsistency(
  adjustments: List<CalibrationAdjustment>
) : ValidationResult
```

**Dependencies:**
- ReviewCycle Repository
- Data & Analytics Service (for organizational benchmarks)

**Business Rules:**
- Rating distribution should follow organizational curve (e.g., bell curve)
- Identify supervisors with consistently high or low ratings (leniency/severity bias)
- Suggest adjustments to align with benchmarks while respecting individual performance
- Calibration adjustments must be documented with rationale
- Adjusted scores must remain within rating scale
- Calibration can only occur after all manager assessments are submitted

**Calibration Algorithms:**
- **Distribution Analysis**: Compare supervisor's rating distribution to organizational average
- **Bias Detection**: Statistical analysis of supervisor's historical rating patterns
- **Adjustment Suggestions**: Recommend score changes to align with benchmarks
- **Consistency Validation**: Ensure adjustments don't create new inconsistencies

**Usage:**
- Called during review calibration phase
- Used by HR and senior management for calibration sessions
- Provides data for calibration meetings

---

#### FeedbackRecommendationService

**Responsibility:** Suggest feedback based on KPI performance and provide coaching recommendations

**Interface:**
```
SuggestFeedbackForKPIPerformance(
  employeeId: GUID,
  kpiId: GUID,
  performanceData: KPIPerformanceData
) : List<FeedbackSuggestion>

RecommendTrainingMaterials(
  kpiId: GUID,
  performanceGap: decimal
) : List<TrainingRecommendation>

IdentifyFeedbackOpportunities(
  supervisorId: GUID
) : List<FeedbackOpportunity>

AnalyzeFeedbackEffectiveness(
  feedbackId: GUID,
  subsequentPerformance: KPIPerformanceData
) : EffectivenessAnalysis
```

**Dependencies:**
- KPI Management Service (for KPI performance data)
- CoachingResource Repository (for training materials)
- FeedbackRecord Repository (for feedback history)

**Business Rules:**
- Positive feedback suggested when KPI achievement > 100%
- Improvement feedback suggested when KPI achievement < 90%
- Coaching feedback suggested when performance is declining over time
- Training materials matched to KPI type and performance gap
- Feedback frequency should be balanced (not overwhelming)

**Recommendation Algorithms:**
- **Performance Threshold Analysis**: Trigger feedback based on achievement thresholds
- **Trend Detection**: Identify improving or declining performance patterns
- **Gap Analysis**: Calculate performance gap and recommend appropriate interventions
- **Effectiveness Tracking**: Correlate feedback with subsequent performance changes

**Usage:**
- Called when supervisor is providing feedback
- Used by system to generate proactive feedback suggestions
- Integrated with KPI dashboard for real-time recommendations

---

#### RecognitionValidationService

**Responsibility:** Validate recognition rules and enforce frequency limits

**Interface:**
```
ValidateRecognitionEligibility(
  giverId: GUID,
  receiverId: GUID,
  recognitionType: RecognitionType
) : ValidationResult

CheckFrequencyLimits(
  giverId: GUID,
  receiverId: GUID,
  timeWindow: TimeSpan
) : FrequencyCheckResult

ValidateTeamBoundary(
  giverId: GUID,
  receiverId: GUID,
  isAnonymous: bool
) : ValidationResult

ValidateMonetaryReward(
  rewardValue: decimal,
  giverId: GUID
) : ValidationResult
```

**Dependencies:**
- Recognition Repository (for recognition history)
- User Management Service (for team and organizational structure)

**Business Rules:**
- Same-team recognition limited to once per week per giver-receiver pair
- Anonymous recognition must still enforce team boundary rules
- Monetary rewards require supervisor approval
- Monetary rewards have maximum limits based on giver's role
- Recognition cannot be given to self
- Cross-team recognition has no frequency limits

**Validation Logic:**
- **Frequency Check**: Query recognition history within time window
- **Team Boundary**: Verify giver and receiver are in same team (even if anonymous)
- **Monetary Limits**: Check giver's authorization level for reward amount
- **Relationship Validation**: Ensure appropriate organizational relationship

**Usage:**
- Called before creating recognition
- Used by frontend to show eligibility status
- Enforces business rules at domain level

---

#### CoachingQuestionGenerationService

**Responsibility:** Generate AI-powered coaching questions based on KPI descriptions

**Interface:**
```
GenerateCoachingQuestions(
  kpiDescription: string,
  kpiType: string,
  performanceLevel: PerformanceLevel
) : List<GeneratedQuestion>

ImproveExistingQuestion(
  questionText: string,
  context: QuestionContext
) : ImprovedQuestion

CategorizeQuestion(
  questionText: string
) : QuestionContext

ValidateQuestionQuality(
  questionText: string
) : QualityScore
```

**Dependencies:**
- External AI Service (GPT/LLM integration)
- CoachingQuestion Repository (for learning from existing questions)

**Business Rules:**
- Generated questions must be relevant to KPI type
- Questions should be open-ended (not yes/no)
- Questions categorized by performance level (below/meeting/exceeding)
- AI-generated questions marked with generation metadata
- Questions can be customized before saving
- Quality threshold must be met before publication

**Generation Algorithms:**
- **Context Analysis**: Parse KPI description to understand measurement and goals
- **Performance-Level Adaptation**: Tailor questions to performance level
- **Question Templates**: Use proven question frameworks (GROW model, 5 Whys, etc.)
- **Quality Scoring**: Evaluate question clarity, relevance, and actionability

**Usage:**
- Called when supervisor creates coaching questions
- Used to populate coaching question library
- Integrated with KPI definition workflow

---

#### CoachingEffectivenessTrackingService

**Responsibility:** Track and analyze coaching session effectiveness

**Interface:**
```
CalculateCoachingROI(
  sessionId: GUID,
  kpiImprovementData: KPIPerformanceData
) : CoachingROI

AnalyzeSupervisorCoachingEffectiveness(
  supervisorId: GUID,
  timeWindow: TimeSpan
) : SupervisorEffectivenessReport

IdentifyEffectiveCoachingPatterns(
  organizationId: GUID
) : List<CoachingPattern>

RecommendCoachingApproach(
  employeeId: GUID,
  performanceIssues: List<PerformanceIssue>
) : CoachingRecommendation
```

**Dependencies:**
- CoachingSession Repository
- KPI Management Service (for performance data)
- Data & Analytics Service (for trend analysis)

**Business Rules:**
- Effectiveness measured by KPI improvement within 30-90 days post-session
- Minimum 3 sessions required for supervisor effectiveness analysis
- Coaching ROI calculated as (performance improvement value) / (time invested)
- Effective patterns identified when correlation > 0.7
- Recommendations based on successful patterns for similar situations

**Analysis Algorithms:**
- **Correlation Analysis**: Link coaching sessions to subsequent KPI improvements
- **Pattern Recognition**: Identify common elements in effective coaching sessions
- **Comparative Analysis**: Compare supervisor effectiveness across organization
- **Predictive Modeling**: Recommend coaching approaches based on historical success

**Usage:**
- Called after coaching session follow-up period
- Used for supervisor development and training
- Provides insights for coaching best practices

---

### 5.3 Domain Policies

Domain Policies are business rules that:
- Are enforced consistently across the domain
- May involve multiple aggregates
- Represent organizational standards
- Can be configured or customized

#### ReviewCyclePolicy

**Policy Name:** Review Cycle Validation Policy

**Rules:**
- Review cycles cannot overlap for the same employee
- Self-assessment deadline must be before manager assessment deadline
- Manager assessment deadline must be before calibration date
- Minimum review cycle duration: 2 weeks
- Maximum review cycle duration: 6 months
- Participants cannot be added after cycle is activated
- Participants can be removed only if they haven't started assessment

**Enforcement:**
- Validated when creating or modifying review cycle
- Enforced by ReviewCycle aggregate
- Violations throw domain exceptions

**Configuration:**
- Minimum/maximum durations configurable per organization
- Deadline buffer periods configurable

---

#### AssessmentSubmissionPolicy

**Policy Name:** Assessment Submission Rules Policy

**Rules:**
- Self-assessment must be submitted before manager assessment can begin
- Assessments cannot be modified after submission
- Evidence attachments limited to 10 files per assessment
- Maximum file size: 10MB per attachment
- Allowed file types: PDF, DOC, DOCX, JPG, PNG
- Assessments must be submitted by deadline (grace period: 24 hours)
- Late submissions require approval

**Enforcement:**
- Validated during assessment submission
- Enforced by SelfAssessment and ManagerAssessment entities
- File validation performed before upload

**Configuration:**
- File limits and types configurable per organization
- Grace period configurable
- Late submission approval workflow configurable

---

#### FeedbackFrequencyPolicy

**Policy Name:** Feedback Frequency and Quality Policy

**Rules:**
- Minimum feedback frequency: Once per month per direct report
- Maximum feedback frequency: No limit (encourage frequent feedback)
- Feedback must be at least 50 characters for improvement type
- Positive feedback can be brief (minimum 20 characters)
- Feedback linked to KPI must reference valid KPI
- Feedback response time target: 48 hours
- Unresolved feedback escalated after 7 days

**Enforcement:**
- Frequency tracked by FeedbackRecommendationService
- Character limits validated by FeedbackRecord aggregate
- Escalation handled by domain event subscribers

**Configuration:**
- Minimum frequency configurable per organization
- Character limits configurable
- Escalation timeframes configurable

---

#### RecognitionLimitPolicy

**Policy Name:** Recognition Frequency and Reward Limits Policy

**Rules:**
- Same-team recognition: Maximum once per week per giver-receiver pair
- Cross-team recognition: No frequency limits
- Anonymous recognition: Same frequency limits apply (tracked internally)
- Monetary rewards: Maximum $500 per recognition (supervisor level)
- Monetary rewards: Maximum $1000 per recognition (manager level)
- Monetary rewards: Require approval for amounts > $100
- Non-monetary rewards: No limits
- Recognition must include meaningful description (minimum 30 characters)

**Enforcement:**
- Validated by RecognitionValidationService
- Enforced before recognition creation
- Approval workflow triggered for monetary rewards

**Configuration:**
- Frequency limits configurable per organization
- Monetary limits configurable by role
- Approval thresholds configurable

---

#### CalibrationConsistencyPolicy

**Policy Name:** Calibration and Rating Consistency Policy

**Rules:**
- Calibration required when rating distribution deviates > 20% from organizational norm
- Maximum rating adjustment: ±1 point on rating scale
- Calibration adjustments require documented rationale
- Calibration session must include minimum 3 supervisors
- Rating distribution target: 10% exceptional, 20% exceeds, 40% meets, 20% below, 10% unsatisfactory
- Supervisor with > 50% ratings in single category flagged for bias review

**Enforcement:**
- Validated by CalibrationService
- Enforced during calibration phase
- Bias detection automated

**Configuration:**
- Distribution targets configurable per organization
- Adjustment limits configurable
- Bias thresholds configurable

---

#### CoachingSessionPolicy

**Policy Name:** Coaching Session Logging and Follow-up Policy

**Rules:**
- Coaching sessions must be logged within 48 hours of occurrence
- Minimum session duration: 15 minutes
- Maximum session duration: 2 hours (longer sessions split into multiple)
- Follow-up actions must have due dates within 90 days
- Coaching effectiveness measured 30-90 days post-session
- Minimum coaching frequency: Once per quarter per direct report
- High-priority coaching (performance issues): Once per month

**Enforcement:**
- Logging deadline validated by CoachingSession aggregate
- Duration limits enforced during session creation
- Follow-up reminders automated

**Configuration:**
- Logging deadline configurable
- Duration limits configurable
- Minimum frequency configurable by performance level

---

#### DataRetentionPolicy

**Policy Name:** Performance Data Retention Policy

**Rules:**
- Active review cycles: Retained indefinitely
- Completed review cycles: Retained for 7 years
- Feedback records: Retained for 5 years
- Recognition records: Retained for 5 years
- Coaching sessions: Retained for 5 years
- Archived data: Moved to cold storage after retention period
- Personal data: Deleted upon employee termination + 90 days (GDPR compliance)

**Enforcement:**
- Automated archival processes
- Scheduled cleanup jobs
- Compliance reporting

**Configuration:**
- Retention periods configurable per data type
- Compliance requirements vary by jurisdiction

---

### 5.4 Service Interaction Patterns

**Pattern 1: Score Calculation Flow**
```
ReviewCycle.CalculateFinalScore()
  → PerformanceScoreCalculationService.CalculateFinalScore()
    → ReviewTemplate Repository (get template)
    → KPI Management Service (get KPI weights)
    → Calculate weighted scores
    → Return FinalPerformanceScore
  → Update ReviewParticipant with final score
  → Publish ReviewCycleCompleted event
```

**Pattern 2: Calibration Flow**
```
ReviewCycle.InitiateCalibration()
  → CalibrationService.AnalyzeRatingDistribution()
    → Data & Analytics Service (get benchmarks)
    → Identify outliers and bias
    → Return RatingDistributionAnalysis
  → CalibrationService.SuggestCalibrationAdjustments()
    → Generate adjustment recommendations
    → Return List<CalibrationSuggestion>
  → Human review and approval
  → ReviewCycle.ApplyCalibrationAdjustments()
    → CalibrationService.ApplyCalibrationAdjustments()
    → Update participant scores
    → Publish ReviewCalibrationCompleted event
```

**Pattern 3: Feedback Recommendation Flow**
```
Supervisor views employee KPI dashboard
  → FeedbackRecommendationService.SuggestFeedbackForKPIPerformance()
    → KPI Management Service (get performance data)
    → Analyze performance trends
    → CoachingResource Repository (get training materials)
    → Return List<FeedbackSuggestion>
  → Supervisor creates feedback
  → FeedbackRecord.Create()
    → Publish FeedbackProvided event
```

**Pattern 4: Recognition Validation Flow**
```
Employee creates recognition
  → RecognitionValidationService.ValidateRecognitionEligibility()
    → Check frequency limits
    → Validate team boundary
    → Validate monetary reward limits
    → Return ValidationResult
  → If valid: Recognition.Create()
    → Publish RecognitionGiven event
  → If invalid: Return validation errors
```

---

## 6. Repository Interfaces

### 6.1 Repository Design Principles

Repositories:
- Provide collection-like interface for aggregate roots
- Abstract persistence mechanism from domain logic
- Return domain objects, not data transfer objects
- Support both retrieval and persistence operations
- Use specification pattern for complex queries
- Maintain aggregate boundaries (no cross-aggregate queries)
- Return null or throw exception for not found (consistent strategy)

### 6.2 Repository Interfaces

#### IReviewTemplateRepository

**Purpose:** Manage ReviewTemplate aggregate persistence and retrieval

**Interface:**
```
// Command Operations
Add(template: ReviewTemplate) : void
Update(template: ReviewTemplate) : void
Remove(templateId: GUID) : void

// Query Operations
GetById(templateId: GUID) : ReviewTemplate
GetByName(name: string) : ReviewTemplate
GetActiveTemplates() : List<ReviewTemplate>
GetTemplatesByRole(roleId: string) : List<ReviewTemplate>
GetTemplatesByDepartment(departmentId: string) : List<ReviewTemplate>
GetTemplatesByFrequency(frequency: ReviewCycleFrequency) : List<ReviewTemplate>
GetAllTemplates(includeArchived: bool) : List<ReviewTemplate>
Exists(templateId: GUID) : bool
IsTemplateInUse(templateId: GUID) : bool

// Specification-based Query
Find(specification: ISpecification<ReviewTemplate>) : List<ReviewTemplate>
```

**Persistence Requirements:**
- Template sections stored as part of aggregate
- Rating scales stored as value objects
- Competency criteria stored as value objects
- Role assignments stored as value objects
- Support for optimistic concurrency (version field)
- Audit trail for template changes

**Query Patterns:**
- Frequently queried by role and department
- Active templates cached for performance
- Template usage tracking for archival decisions

---

#### IReviewCycleRepository

**Purpose:** Manage ReviewCycle aggregate persistence and retrieval

**Interface:**
```
// Command Operations
Add(cycle: ReviewCycle) : void
Update(cycle: ReviewCycle) : void
Remove(cycleId: GUID) : void

// Query Operations
GetById(cycleId: GUID) : ReviewCycle
GetByName(name: string) : ReviewCycle
GetActiveCycles() : List<ReviewCycle>
GetCyclesByTemplate(templateId: GUID) : List<ReviewCycle>
GetCyclesByStatus(status: ReviewCycleStatus) : List<ReviewCycle>
GetCyclesByDateRange(startDate: Date, endDate: Date) : List<ReviewCycle>
GetCyclesForEmployee(employeeId: GUID) : List<ReviewCycle>
GetCyclesForSupervisor(supervisorId: GUID) : List<ReviewCycle>
GetParticipant(participantId: GUID) : ReviewParticipant
GetParticipantByCycleAndEmployee(cycleId: GUID, employeeId: GUID) : ReviewParticipant
GetPendingSelfAssessments(employeeId: GUID) : List<ReviewParticipant>
GetPendingManagerAssessments(supervisorId: GUID) : List<ReviewParticipant>
GetCyclesAwaitingCalibration() : List<ReviewCycle>
Exists(cycleId: GUID) : bool
HasOverlappingCycle(employeeId: GUID, startDate: Date, endDate: Date) : bool

// Specification-based Query
Find(specification: ISpecification<ReviewCycle>) : List<ReviewCycle>
```

**Persistence Requirements:**
- Participants stored as part of aggregate
- Self-assessments and manager assessments stored as entities within participant
- Assessment scores stored as value objects
- Evidence attachments stored as value objects (file URLs)
- Calibration adjustments stored as entities
- Support for optimistic concurrency
- Large aggregate - consider snapshot strategy for performance

**Query Patterns:**
- Frequently queried by employee and supervisor
- Status-based queries for workflow management
- Date range queries for reporting
- Participant-level queries for assessment workflows
- Consider read model for dashboard queries

---

#### IFeedbackRecordRepository

**Purpose:** Manage FeedbackRecord aggregate persistence and retrieval

**Interface:**
```
// Command Operations
Add(feedback: FeedbackRecord) : void
Update(feedback: FeedbackRecord) : void
Remove(feedbackId: GUID) : void

// Query Operations
GetById(feedbackId: GUID) : FeedbackRecord
GetFeedbackForEmployee(employeeId: GUID, asGiver: bool, asReceiver: bool) : List<FeedbackRecord>
GetFeedbackByKPI(kpiId: GUID) : List<FeedbackRecord>
GetFeedbackByType(feedbackType: FeedbackType) : List<FeedbackRecord>
GetFeedbackByStatus(status: FeedbackStatus) : List<FeedbackRecord>
GetFeedbackByDateRange(startDate: Date, endDate: Date) : List<FeedbackRecord>
GetFeedbackBetweenUsers(giverId: GUID, receiverId: GUID) : List<FeedbackRecord>
GetUnresolvedFeedback(receiverId: GUID) : List<FeedbackRecord>
GetFeedbackRequiringFollowUp() : List<FeedbackRecord>
GetFeedbackTrends(employeeId: GUID, timeWindow: TimeSpan) : FeedbackTrendData
Exists(feedbackId: GUID) : bool

// Specification-based Query
Find(specification: ISpecification<FeedbackRecord>) : List<FeedbackRecord>
```

**Persistence Requirements:**
- Feedback responses stored as entities within aggregate
- Feedback context and content stored as value objects
- Follow-up actions stored as value objects
- Support for soft delete (archival)
- Full-text search on feedback content
- Indexed by employee, KPI, date for performance

**Query Patterns:**
- Frequently queried by employee (both as giver and receiver)
- KPI-specific queries for performance correlation
- Status-based queries for workflow management
- Trend analysis requires time-series queries
- Consider read model for analytics

---

#### IRecognitionRepository

**Purpose:** Manage Recognition aggregate persistence and retrieval

**Interface:**
```
// Command Operations
Add(recognition: Recognition) : void
Update(recognition: Recognition) : void
Remove(recognitionId: GUID) : void

// Query Operations
GetById(recognitionId: GUID) : Recognition
GetRecognitionForEmployee(employeeId: GUID, asGiver: bool, asReceiver: bool) : List<Recognition>
GetRecognitionByType(recognitionType: RecognitionType) : List<Recognition>
GetRecognitionByDateRange(startDate: Date, endDate: Date) : List<Recognition>
GetRecognitionFeed(visibilityScope: VisibilityScope, limit: int, offset: int) : List<Recognition>
GetRecognitionByKPI(kpiId: GUID) : List<Recognition>
GetRecognitionBetweenUsers(giverId: GUID, receiverId: GUID, timeWindow: TimeSpan) : List<Recognition>
GetMonetaryRecognitionsPendingApproval() : List<Recognition>
GetRecognitionFrequency(giverId: GUID, receiverId: GUID, timeWindow: TimeSpan) : int
GetTeamRecognitionStats(teamId: GUID, timeWindow: TimeSpan) : RecognitionStats
Exists(recognitionId: GUID) : bool

// Specification-based Query
Find(specification: ISpecification<Recognition>) : List<Recognition>
```

**Persistence Requirements:**
- Recognition reward, KPI impact, visibility settings stored as value objects
- Anonymity context stored securely (giver ID encrypted if anonymous)
- Support for soft delete (archival)
- Indexed by employee, date, visibility for feed queries
- Monetary rewards tracked separately for approval workflow

**Query Patterns:**
- Feed queries require pagination and visibility filtering
- Frequency checks for validation
- Team-level aggregations for analytics
- Anonymous recognition requires special handling
- Consider caching for feed performance

---

#### ICoachingQuestionRepository

**Purpose:** Manage CoachingQuestion aggregate persistence and retrieval

**Interface:**
```
// Command Operations
Add(question: CoachingQuestion) : void
Update(question: CoachingQuestion) : void
Remove(questionId: GUID) : void

// Query Operations
GetById(questionId: GUID) : CoachingQuestion
GetActiveQuestions() : List<CoachingQuestion>
GetQuestionsByKPIType(kpiType: string) : List<CoachingQuestion>
GetQuestionsByPerformanceLevel(level: PerformanceLevel) : List<CoachingQuestion>
GetQuestionsByCreator(creatorId: GUID) : List<CoachingQuestion>
GetAIGeneratedQuestions() : List<CoachingQuestion>
GetMostUsedQuestions(limit: int) : List<CoachingQuestion>
GetHighestRatedQuestions(minRating: decimal, limit: int) : List<CoachingQuestion>
SearchQuestions(keyword: string) : List<CoachingQuestion>
GetQuestionsByTags(tags: List<string>) : List<CoachingQuestion>
Exists(questionId: GUID) : bool

// Specification-based Query
Find(specification: ISpecification<CoachingQuestion>) : List<CoachingQuestion>
```

**Persistence Requirements:**
- Question context and metadata stored as value objects
- Effectiveness ratings stored as value objects
- Support for full-text search on question text
- Indexed by KPI type, performance level, usage count
- AI generation metadata preserved

**Query Patterns:**
- Frequently searched by KPI type and performance level
- Popular questions cached for performance
- Rating-based queries for quality filtering
- Tag-based search for discovery
- Consider read model for search functionality

---

#### ICoachingResourceRepository

**Purpose:** Manage CoachingResource aggregate persistence and retrieval

**Interface:**
```
// Command Operations
Add(resource: CoachingResource) : void
Update(resource: CoachingResource) : void
Remove(resourceId: GUID) : void

// Query Operations
GetById(resourceId: GUID) : CoachingResource
GetPublishedResources() : List<CoachingResource>
GetResourcesByCategory(category: string) : List<CoachingResource>
GetResourcesByKPIType(kpiType: string) : List<CoachingResource>
GetResourcesByCreator(creatorId: GUID) : List<CoachingResource>
GetResourcesUnderReview() : List<CoachingResource>
GetHighestRatedResources(minRating: decimal, limit: int) : List<CoachingResource>
SearchResources(keyword: string) : List<CoachingResource>
GetResourcesByTags(tags: List<string>) : List<CoachingResource>
GetResourcesByTargetAudience(audience: TargetAudience) : List<CoachingResource>
GetResourceVersion(resourceId: GUID, version: int) : ResourceVersion
Exists(resourceId: GUID) : bool

// Specification-based Query
Find(specification: ISpecification<CoachingResource>) : List<CoachingResource>
```

**Persistence Requirements:**
- Resource content and metadata stored as value objects
- Resource ratings stored as entities within aggregate
- Resource versions stored as value objects (version history)
- Support for full-text search on content
- Large content may require blob storage (store URLs)
- Indexed by category, KPI type, rating, tags

**Query Patterns:**
- Frequently searched by category and KPI type
- Quality filtering by rating
- Tag-based discovery
- Version history for audit
- Consider read model for search and discovery

---

#### ICoachingSessionRepository

**Purpose:** Manage CoachingSession aggregate persistence and retrieval

**Interface:**
```
// Command Operations
Add(session: CoachingSession) : void
Update(session: CoachingSession) : void
Remove(sessionId: GUID) : void

// Query Operations
GetById(sessionId: GUID) : CoachingSession
GetSessionsBySupervisor(supervisorId: GUID) : List<CoachingSession>
GetSessionsByEmployee(employeeId: GUID) : List<CoachingSession>
GetSessionsByStatus(status: CoachingSessionStatus) : List<CoachingSession>
GetSessionsByDateRange(startDate: Date, endDate: Date) : List<CoachingSession>
GetSessionsForSupervisorAndEmployee(supervisorId: GUID, employeeId: GUID) : List<CoachingSession>
GetSessionsByKPI(kpiId: GUID) : List<CoachingSession>
GetSessionsWithPendingFollowUps() : List<CoachingSession>
GetSessionsForEffectivenessTracking(minDaysSinceCompletion: int) : List<CoachingSession>
GetSupervisorCoachingStats(supervisorId: GUID, timeWindow: TimeSpan) : CoachingStats
GetEmployeeCoachingHistory(employeeId: GUID) : List<CoachingSession>
Exists(sessionId: GUID) : bool

// Specification-based Query
Find(specification: ISpecification<CoachingSession>) : List<CoachingSession>
```

**Persistence Requirements:**
- Session topics stored as entities within aggregate
- Session outcome, questions used, follow-up actions stored as value objects
- Effectiveness metrics stored as value objects
- Indexed by supervisor, employee, date, status
- Support for time-series queries for effectiveness tracking

**Query Patterns:**
- Frequently queried by supervisor and employee
- Status-based queries for workflow management
- Follow-up tracking requires date-based queries
- Effectiveness analysis requires correlation with KPI data
- Consider read model for analytics and reporting

---

### 6.3 Repository Implementation Considerations

#### Persistence Technology
- **Relational Database (SQL)**: Recommended for transactional consistency
  - ReviewCycle, ReviewTemplate, FeedbackRecord, Recognition
  - Strong consistency requirements
  - Complex queries and joins
  
- **Document Database (NoSQL)**: Consider for read-heavy aggregates
  - CoachingQuestion, CoachingResource
  - Flexible schema for content
  - Full-text search capabilities
  
- **Hybrid Approach**: Use both based on aggregate characteristics
  - Write to SQL for consistency
  - Replicate to NoSQL for read performance

#### Caching Strategy
- **Cache Active Templates**: Frequently accessed, rarely changed
- **Cache Popular Coaching Questions**: High read, low write
- **Cache Recognition Feed**: Time-based invalidation
- **Cache User Permissions**: Cross-cutting concern

#### Query Optimization
- **Indexes**: Create indexes on frequently queried fields
  - Employee ID, Supervisor ID, Date ranges, Status fields
- **Read Models**: Create denormalized read models for complex queries
  - Dashboard views, Analytics reports, Feed queries
- **Pagination**: Implement pagination for large result sets
- **Lazy Loading**: Load child entities on demand for large aggregates

#### Concurrency Control
- **Optimistic Locking**: Use version field for conflict detection
- **Pessimistic Locking**: Consider for high-contention scenarios (calibration)
- **Event Sourcing**: Consider for audit trail requirements

#### Data Archival
- **Soft Delete**: Mark records as archived rather than physical delete
- **Cold Storage**: Move old data to separate storage after retention period
- **Compliance**: Ensure GDPR and data retention compliance

---

### 6.4 Specification Pattern Examples

Specifications encapsulate query logic for reusability and testability.

#### ReviewCycleSpecifications

```
ActiveCyclesForEmployeeSpecification(employeeId: GUID)
  - Filters cycles where employee is participant and status is Active or InProgress

PendingCalibrationSpecification()
  - Filters cycles where status is AwaitingCalibration

OverdueSelfAssessmentsSpecification(deadline: Date)
  - Filters participants where self-assessment not submitted and deadline passed

CyclesByTemplateAndDateRangeSpecification(templateId: GUID, startDate: Date, endDate: Date)
  - Filters cycles by template and date range
```

#### FeedbackRecordSpecifications

```
UnresolvedFeedbackForEmployeeSpecification(employeeId: GUID)
  - Filters feedback where receiver is employee and status is not Resolved

KPISpecificFeedbackSpecification(kpiId: GUID, startDate: Date, endDate: Date)
  - Filters feedback linked to specific KPI within date range

FeedbackRequiringFollowUpSpecification()
  - Filters feedback with pending follow-up actions
```

#### RecognitionSpecifications

```
RecognitionFeedSpecification(visibilityScope: VisibilityScope, userId: GUID)
  - Filters recognition visible to user based on scope and permissions

MonetaryRecognitionPendingApprovalSpecification()
  - Filters recognition with monetary rewards requiring approval

HighImpactRecognitionSpecification(impactLevel: ImpactLevel)
  - Filters recognition with significant or exceptional KPI impact
```

---

## 7. Integration Points & Anti-Corruption Layer

### 7.1 Integration Architecture Principles

**Anti-Corruption Layer (ACL):**
- Protects domain model from external system changes
- Translates between external models and domain models
- Isolates domain from external API changes
- Provides adapter pattern for external services
- Handles external system failures gracefully

**Integration Patterns:**
- **Request-Response**: Synchronous calls for immediate data needs
- **Event-Driven**: Asynchronous communication via domain events
- **Polling**: Periodic data synchronization
- **Webhook**: External systems push data to our service

### 7.2 Integration with KPI Management Service

**Relationship:** Performance Management consumes KPI data (downstream consumer)

**Integration Type:** Request-Response + Event-Driven

#### Consumed APIs

**1. Get KPI Definitions**
```
External API: GET /api/v1/kpi-management/kpis/{kpi_id}
Purpose: Retrieve KPI details for review context
Frequency: On-demand during review creation and assessment
```

**ACL Interface:**
```
IKPIManagementService
  GetKPIDefinition(kpiId: GUID) : KPIDefinition
  GetKPIDefinitions(kpiIds: List<GUID>) : List<KPIDefinition>
  GetKPIsByEmployee(employeeId: GUID) : List<KPIAssignment>
```

**Domain Model Mapping:**
```
External KPI Model → Domain KPIDefinition Value Object
  - kpi_id → KPIId
  - kpi_name → KPIName
  - description → Description
  - measurement_unit → MeasurementUnit
  - target_value → TargetValue
  - weight → Weight
```

**2. Get KPI Assignments**
```
External API: GET /api/v1/kpi-management/assignments/employee/{employee_id}
Purpose: Retrieve employee's assigned KPIs for review
Frequency: When creating review cycle, during assessment
```

**ACL Interface:**
```
IKPIManagementService
  GetEmployeeKPIAssignments(employeeId: GUID) : List<KPIAssignment>
  GetEmployeeKPIAssignmentsByDate(employeeId: GUID, effectiveDate: Date) : List<KPIAssignment>
```

**Domain Model Mapping:**
```
External Assignment Model → Domain KPIAssignment Value Object
  - assignment_id → AssignmentId
  - employee_id → EmployeeId
  - kpi_id → KPIId
  - custom_target → CustomTarget
  - effective_date → EffectiveDate
  - weight → Weight
```

**3. Get KPI Performance Data**
```
External API: GET /api/v1/kpi-management/performance/employee/{employee_id}
Purpose: Retrieve actual KPI performance for review scoring
Frequency: During review cycle, when calculating scores
```

**ACL Interface:**
```
IKPIManagementService
  GetKPIPerformanceData(employeeId: GUID, kpiId: GUID, startDate: Date, endDate: Date) : KPIPerformanceData
  GetAllKPIPerformanceForEmployee(employeeId: GUID, startDate: Date, endDate: Date) : List<KPIPerformanceData>
```

**Domain Model Mapping:**
```
External Performance Model → Domain KPIPerformanceData Value Object
  - kpi_id → KPIId
  - actual_value → ActualValue
  - target_value → TargetValue
  - achievement_percentage → AchievementPercentage
  - measurement_date → MeasurementDate
  - trend → PerformanceTrend
```

#### Consumed Events

**KPIFinalized Event**
```
Event: KPIFinalized
Purpose: Trigger review process when KPIs are finalized
Handler: ReviewCycleService.OnKPIFinalized()
Action: Check if review cycle should be initiated
```

**KPIAssignmentChanged Event**
```
Event: KPIAssignmentChanged
Purpose: Update review context when KPI assignments change
Handler: ReviewCycleService.OnKPIAssignmentChanged()
Action: Update participant KPI list if review is in progress
```

#### Error Handling

**Failure Scenarios:**
- KPI Management Service unavailable
- KPI data not found
- KPI data inconsistent

**Resilience Strategies:**
- **Circuit Breaker**: Stop calling after repeated failures
- **Retry with Backoff**: Retry failed requests with exponential backoff
- **Fallback**: Use cached KPI data if available
- **Graceful Degradation**: Allow review to proceed with manual KPI entry

**ACL Implementation:**
```
KPIManagementServiceAdapter implements IKPIManagementService
  - Wraps HTTP client for external API calls
  - Implements retry logic and circuit breaker
  - Translates external models to domain models
  - Caches frequently accessed KPI definitions
  - Logs integration failures for monitoring
```

---

### 7.3 Integration with Data & Analytics Service

**Relationship:** Performance Management provides data to Analytics (upstream provider)

**Integration Type:** Event-Driven + Request-Response

#### Provided Events

Performance Management publishes domain events that Analytics consumes:

**1. Review Lifecycle Events**
- ReviewCycleCompleted
- SelfAssessmentSubmitted
- ManagerAssessmentSubmitted
- ReviewCalibrationCompleted

**Purpose:** Analytics aggregates review data for reporting and insights

**2. Feedback Events**
- FeedbackProvided
- FeedbackResolved

**Purpose:** Analytics tracks feedback patterns and effectiveness

**3. Recognition Events**
- RecognitionGiven
- RecognitionPublished

**Purpose:** Analytics measures recognition engagement and impact

**4. Coaching Events**
- CoachingSessionCompleted
- CoachingEffectivenessRecorded

**Purpose:** Analytics correlates coaching with performance improvements

#### Provided APIs

**1. Get Review Results**
```
API: GET /api/v1/performance-management/reviews/{cycle_id}/results
Purpose: Provide review results for analytics and reporting
Consumer: Data & Analytics Service
```

**2. Get Feedback Summary**
```
API: GET /api/v1/performance-management/feedback/summary
Purpose: Provide feedback statistics for analytics
Consumer: Data & Analytics Service
```

**3. Get Recognition Analytics**
```
API: GET /api/v1/performance-management/recognition/analytics
Purpose: Provide recognition data for engagement metrics
Consumer: Data & Analytics Service
```

**4. Get Coaching Effectiveness**
```
API: GET /api/v1/performance-management/coaching/effectiveness
Purpose: Provide coaching effectiveness data for ROI analysis
Consumer: Data & Analytics Service
```

#### Consumed Services from Analytics

**1. Get Organizational Benchmarks**
```
External API: GET /api/v1/data-analytics/benchmarks/organization
Purpose: Retrieve benchmarks for calibration
Frequency: During calibration phase
```

**ACL Interface:**
```
IAnalyticsService
  GetOrganizationalBenchmarks(organizationId: GUID) : BenchmarkData
  GetDepartmentBenchmarks(departmentId: GUID) : BenchmarkData
  GetRoleBenchmarks(roleId: GUID) : BenchmarkData
```

**2. Get Performance Insights**
```
External API: GET /api/v1/data-analytics/insights/employee/{employee_id}
Purpose: Retrieve AI-generated insights for coaching recommendations
Frequency: When supervisor accesses coaching tools
```

**ACL Interface:**
```
IAnalyticsService
  GetEmployeeInsights(employeeId: GUID) : List<PerformanceInsight>
  GetTeamInsights(supervisorId: GUID) : List<TeamInsight>
```

**ACL Implementation:**
```
AnalyticsServiceAdapter implements IAnalyticsService
  - Wraps HTTP client for external API calls
  - Translates external models to domain models
  - Implements caching for benchmark data
  - Handles service unavailability gracefully
```

---

### 7.4 Integration with External Platforms (Slack/Teams)

**Relationship:** Bidirectional integration for recognition and feedback

**Integration Type:** Webhook + Bot Commands

#### Slack Integration

**Inbound: Slack → Performance Management**

**1. Recognition Command**
```
Slack Command: /kudos @user for [reason]
Webhook: POST /api/v1/performance-management/integrations/slack/webhook
Payload: Slack event payload with command details
```

**ACL Interface:**
```
ISlackIntegrationService
  HandleRecognitionCommand(slackEvent: SlackEvent) : RecognitionResult
  HandleFeedbackCommand(slackEvent: SlackEvent) : FeedbackResult
  ValidateSlackUser(slackUserId: string) : UserId
  MapSlackUserToEmployee(slackUserId: string) : EmployeeId
```

**Domain Model Mapping:**
```
Slack Event → Domain Recognition
  - user_id (giver) → Map to EmployeeId via user mapping
  - mentioned_user_id (receiver) → Map to EmployeeId
  - text → Recognition content
  - channel_id → Visibility context
  - timestamp → CreatedDate
```

**2. Feedback Command**
```
Slack Command: /feedback @user [feedback text]
Webhook: POST /api/v1/performance-management/integrations/slack/webhook
```

**Outbound: Performance Management → Slack**

**1. Recognition Notification**
```
Trigger: RecognitionPublished event
Action: Post message to Slack channel
API: Slack Web API - chat.postMessage
```

**2. Feedback Notification**
```
Trigger: FeedbackProvided event
Action: Send direct message to employee
API: Slack Web API - chat.postMessage
```

**ACL Implementation:**
```
SlackIntegrationAdapter implements ISlackIntegrationService
  - Validates Slack webhook signatures
  - Maps Slack users to internal employee IDs
  - Translates Slack events to domain commands
  - Formats domain data for Slack messages
  - Handles Slack API rate limits
  - Manages Slack bot token securely
```

**Anti-Corruption Layer Responsibilities:**
- **User Mapping**: Maintain mapping between Slack user IDs and employee IDs
- **Command Parsing**: Parse Slack command syntax into domain operations
- **Message Formatting**: Format domain data into Slack message blocks
- **Error Handling**: Translate domain errors into user-friendly Slack messages
- **Rate Limiting**: Respect Slack API rate limits
- **Security**: Validate webhook signatures, secure token storage

#### Teams Integration

**Inbound: Teams → Performance Management**

**1. Recognition Command**
```
Teams Command: @PerformanceBot recognize @user for [reason]
Webhook: POST /api/v1/performance-management/integrations/teams/webhook
Payload: Teams activity payload
```

**ACL Interface:**
```
ITeamsIntegrationService
  HandleRecognitionCommand(teamsActivity: TeamsActivity) : RecognitionResult
  HandleFeedbackCommand(teamsActivity: TeamsActivity) : FeedbackResult
  ValidateTeamsUser(teamsUserId: string) : UserId
  MapTeamsUserToEmployee(teamsUserId: string) : EmployeeId
```

**Domain Model Mapping:**
```
Teams Activity → Domain Recognition
  - from.id (giver) → Map to EmployeeId
  - mentioned_user.id (receiver) → Map to EmployeeId
  - text → Recognition content
  - conversation.id → Visibility context
  - timestamp → CreatedDate
```

**Outbound: Performance Management → Teams**

**1. Recognition Notification**
```
Trigger: RecognitionPublished event
Action: Post adaptive card to Teams channel
API: Teams Bot Framework - sendActivity
```

**2. Feedback Notification**
```
Trigger: FeedbackProvided event
Action: Send direct message to employee
API: Teams Bot Framework - sendActivity
```

**ACL Implementation:**
```
TeamsIntegrationAdapter implements ITeamsIntegrationService
  - Validates Teams activity signatures
  - Maps Teams users to internal employee IDs
  - Translates Teams activities to domain commands
  - Formats domain data into Teams adaptive cards
  - Handles Teams API throttling
  - Manages Teams bot credentials securely
```

---

### 7.5 Integration with AI Service (Coaching Question Generation)

**Relationship:** Performance Management consumes AI services

**Integration Type:** Request-Response

**External Service:** OpenAI GPT / Azure OpenAI / Custom LLM

**ACL Interface:**
```
IAIService
  GenerateCoachingQuestions(kpiDescription: string, kpiType: string, performanceLevel: PerformanceLevel) : List<GeneratedQuestion>
  ImproveQuestion(questionText: string, context: QuestionContext) : ImprovedQuestion
  CategorizeQuestion(questionText: string) : QuestionContext
  ValidateQuestionQuality(questionText: string) : QualityScore
```

**Domain Model Mapping:**
```
AI Response → Domain CoachingQuestion
  - generated_text → QuestionText
  - confidence_score → QualityScore
  - category → QuestionContext
  - metadata → QuestionMetadata (AI model, prompt, etc.)
```

**ACL Implementation:**
```
AIServiceAdapter implements IAIService
  - Wraps AI service API client
  - Constructs prompts from domain context
  - Parses AI responses into domain objects
  - Implements retry logic for transient failures
  - Caches similar requests to reduce API calls
  - Handles AI service rate limits
  - Logs AI interactions for audit and improvement
```

**Prompt Engineering:**
```
Generate Coaching Questions Prompt Template:
"You are an expert performance coach. Generate 5 coaching questions for the following KPI:

KPI Type: {kpiType}
KPI Description: {kpiDescription}
Performance Level: {performanceLevel}

The questions should be:
- Open-ended (not yes/no)
- Focused on understanding and improvement
- Appropriate for the performance level
- Actionable and specific

Format: Return as JSON array of questions with rationale."
```

**Error Handling:**
- AI service unavailable: Return pre-defined question templates
- Low quality response: Retry with refined prompt
- Rate limit exceeded: Queue request for later processing
- Invalid response format: Log error and return fallback

---

### 7.6 Integration with Notification Service

**Relationship:** Performance Management triggers notifications

**Integration Type:** Event-Driven

**ACL Interface:**
```
INotificationService
  SendReviewNotification(recipientId: GUID, notificationType: NotificationType, context: NotificationContext) : void
  SendFeedbackNotification(recipientId: GUID, feedbackId: GUID) : void
  SendRecognitionNotification(recipientId: GUID, recognitionId: GUID) : void
  SendCoachingReminder(recipientId: GUID, sessionId: GUID) : void
  SendDeadlineReminder(recipientId: GUID, cycleId: GUID, deadline: Date) : void
```

**Notification Triggers:**
- ReviewCycleActivated → Notify participants
- SelfAssessmentSubmitted → Notify supervisor
- ManagerAssessmentSubmitted → Notify employee
- FeedbackProvided → Notify receiver
- RecognitionGiven → Notify receiver
- CoachingSessionScheduled → Notify both parties
- Deadline approaching → Notify pending participants

**ACL Implementation:**
```
NotificationServiceAdapter implements INotificationService
  - Subscribes to domain events
  - Translates domain events to notification requests
  - Determines notification channels (email, in-app, push)
  - Handles notification preferences per user
  - Implements retry logic for failed notifications
```

---

### 7.7 Integration with Document Storage Service

**Relationship:** Performance Management stores evidence attachments

**Integration Type:** Request-Response

**ACL Interface:**
```
IDocumentStorageService
  UploadDocument(file: FileStream, metadata: DocumentMetadata) : DocumentUrl
  GetDocument(documentUrl: string) : FileStream
  DeleteDocument(documentUrl: string) : void
  ValidateDocument(file: FileStream) : ValidationResult
```

**Domain Model Mapping:**
```
Uploaded File → Domain EvidenceAttachment Value Object
  - file_url → FileUrl
  - file_name → FileName
  - file_type → FileType
  - upload_date → UploadedDate
  - file_size → FileSize
```

**ACL Implementation:**
```
DocumentStorageAdapter implements IDocumentStorageService
  - Wraps cloud storage API (Azure Blob, AWS S3, etc.)
  - Validates file types and sizes before upload
  - Generates secure URLs with expiration
  - Implements virus scanning integration
  - Handles storage failures gracefully
  - Manages storage quotas
```

**Security Considerations:**
- Validate file types (whitelist: PDF, DOC, DOCX, JPG, PNG)
- Scan for viruses before storage
- Generate time-limited signed URLs for access
- Encrypt files at rest
- Implement access control based on user permissions

---

### 7.8 Data Transformation Patterns

#### Pattern 1: External Model to Domain Model
```
External API Response → ACL Adapter → Domain Value Object/Entity

Example: KPI Definition
External JSON:
{
  "kpi_id": "123e4567-e89b-12d3-a456-426614174000",
  "kpi_name": "Sales Revenue",
  "description": "Monthly sales revenue target",
  "measurement_unit": "USD",
  "target_value": 100000,
  "weight": 0.3
}

Domain Model:
KPIDefinition {
  KPIId: GUID("123e4567-e89b-12d3-a456-426614174000"),
  KPIName: "Sales Revenue",
  Description: "Monthly sales revenue target",
  MeasurementUnit: "USD",
  TargetValue: 100000.00,
  Weight: 0.30
}
```

#### Pattern 2: Domain Event to External Event
```
Domain Event → ACL Adapter → External Event Format

Example: Recognition Published
Domain Event:
RecognitionPublished {
  RecognitionId: GUID,
  ReceiverId: GUID,
  RecognitionType: PeerToPeer,
  IsAnonymous: false,
  PublishedDate: timestamp
}

Slack Message:
{
  "channel": "#team-recognition",
  "text": "🎉 @john.doe received recognition!",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Recognition Alert!*\n@john.doe was recognized for outstanding work!"
      }
    }
  ]
}
```

#### Pattern 3: External Command to Domain Command
```
External Command → ACL Adapter → Domain Command

Example: Slack Recognition Command
Slack Event:
{
  "type": "slash_command",
  "command": "/kudos",
  "text": "@jane.doe for excellent customer service",
  "user_id": "U123456",
  "channel_id": "C789012"
}

Domain Command:
CreateRecognitionCommand {
  GiverId: GUID (mapped from U123456),
  ReceiverId: GUID (mapped from @jane.doe),
  RecognitionType: PeerToPeer,
  Content: "excellent customer service",
  VisibilityScope: Team,
  IsAnonymous: false
}
```

---

### 7.9 Integration Resilience Patterns

#### Circuit Breaker Pattern
```
State: Closed → Open → Half-Open → Closed

Closed: Normal operation, requests pass through
Open: After threshold failures, requests fail fast
Half-Open: After timeout, allow test request
  - Success → Close circuit
  - Failure → Reopen circuit
```

#### Retry with Exponential Backoff
```
Attempt 1: Immediate
Attempt 2: Wait 1 second
Attempt 3: Wait 2 seconds
Attempt 4: Wait 4 seconds
Attempt 5: Wait 8 seconds
Max Attempts: 5
```

#### Fallback Strategies
```
Primary: Call external service
Fallback 1: Use cached data
Fallback 2: Use default values
Fallback 3: Degrade functionality gracefully
Fallback 4: Queue for later processing
```

#### Timeout Configuration
```
KPI Management Service: 5 seconds
Data & Analytics Service: 10 seconds
AI Service: 30 seconds
Slack/Teams API: 10 seconds
Document Storage: 60 seconds
```

---


## 8. Aggregate Diagrams & Domain Model Summary

### 8.1 Tactical DDD Patterns Used

**Aggregates (7 identified):**
1. ReviewTemplate - Manages review configuration
2. ReviewCycle - Orchestrates review process
3. FeedbackRecord - Manages feedback lifecycle
4. Recognition - Handles recognition events
5. CoachingQuestion - Manages coaching question library
6. CoachingResource - Manages coaching resource library
7. CoachingSession - Tracks coaching sessions

**Entities (13 identified):**
- TemplateSection, ReviewParticipant, SelfAssessment, ManagerAssessment
- CalibrationAdjustment, FeedbackResponse, ResourceRating
- SessionTopic (within aggregates)

**Value Objects (30+ identified):**
- RatingScale, CompetencyCriteria, AssessmentScore, ScoreDiscrepancy
- FeedbackContext, FeedbackContent, RecognitionReward, KPIImpact
- QuestionContext, SessionOutcome, EffectivenessMetric, etc.

**Domain Events (25+ identified):**
- Review lifecycle events (8)
- Feedback events (4)
- Recognition events (3)
- Coaching events (5)
- Integration events (5+)

**Domain Services (6 identified):**
- PerformanceScoreCalculationService
- CalibrationService
- FeedbackRecommendationService
- RecognitionValidationService
- CoachingQuestionGenerationService
- CoachingEffectivenessTrackingService

**Repositories (7 identified):**
- One per aggregate root

**Policies (6 identified):**
- ReviewCyclePolicy, AssessmentSubmissionPolicy
- FeedbackFrequencyPolicy, RecognitionLimitPolicy
- CalibrationConsistencyPolicy, CoachingSessionPolicy


### 8.2 User Story Coverage Validation

**US-014: Configure Review Templates** ✓
- Covered by: ReviewTemplate aggregate
- Entities: ReviewTemplate, TemplateSection
- Value Objects: RatingScale, CompetencyCriteria, RoleAssignment
- Repository: IReviewTemplateRepository

**US-015: Structure KPI-Based Reviews** ✓
- Covered by: ReviewCycle aggregate, PerformanceScoreCalculationService
- Integration: KPI Management Service (consume KPI data)
- Domain Service: PerformanceScoreCalculationService
- Events: ReviewCycleCreated, ReviewCycleActivated

**US-016: Conduct Self-Assessment** ✓
- Covered by: SelfAssessment entity within ReviewCycle
- Value Objects: AssessmentScore, EvidenceAttachment
- Events: SelfAssessmentStarted, SelfAssessmentSubmitted
- Policy: AssessmentSubmissionPolicy

**US-017: Manager Performance Scoring** ✓
- Covered by: ManagerAssessment entity within ReviewCycle
- Value Objects: AssessmentScore, ScoreDiscrepancy
- Events: ManagerAssessmentStarted, ManagerAssessmentSubmitted
- Domain Service: PerformanceScoreCalculationService

**US-018: Review Calibration Tools** ✓
- Covered by: CalibrationAdjustment entity, CalibrationService
- Domain Service: CalibrationService
- Events: ReviewCalibrationInitiated, ReviewCalibrationCompleted
- Policy: CalibrationConsistencyPolicy

**US-019: Provide KPI-Specific Feedback** ✓
- Covered by: FeedbackRecord aggregate
- Value Objects: FeedbackContext, FeedbackContent
- Domain Service: FeedbackRecommendationService
- Events: FeedbackProvided
- Integration: KPI Management Service

**US-020: Receive Performance Feedback** ✓
- Covered by: FeedbackRecord aggregate, FeedbackResponse entity
- Events: FeedbackAcknowledged, FeedbackResponseProvided
- Repository: IFeedbackRecordRepository

**US-021: Peer Recognition System** ✓
- Covered by: Recognition aggregate
- Value Objects: RecognitionReward, KPIImpact, AnonymityContext
- Domain Service: RecognitionValidationService
- Events: RecognitionGiven, RecognitionPublished
- Policy: RecognitionLimitPolicy

**US-022: Slack/Teams Integration** ✓
- Covered by: Anti-Corruption Layer (SlackIntegrationAdapter, TeamsIntegrationAdapter)
- Events: SlackRecognitionReceived, TeamsRecognitionReceived
- Integration: External platform webhooks and APIs

**US-023: Create KPI Coaching Questions** ✓
- Covered by: CoachingQuestion aggregate
- Value Objects: QuestionContext, QuestionMetadata
- Repository: ICoachingQuestionRepository
- Events: CoachingQuestionCreated

**US-024: AI-Generated Coaching Questions** ✓
- Covered by: CoachingQuestionGenerationService
- Integration: AI Service (via ACL)
- Value Objects: QuestionMetadata (AI generation tracking)

**US-025: Access Coaching Database** ✓
- Covered by: CoachingResource aggregate
- Value Objects: ResourceContent, ResourceMetadata
- Repository: ICoachingResourceRepository
- Events: CoachingResourcePublished

**US-026: Coaching Session Tracking** ✓
- Covered by: CoachingSession aggregate
- Entities: SessionTopic
- Value Objects: SessionOutcome, EffectivenessMetric
- Domain Service: CoachingEffectivenessTrackingService
- Events: CoachingSessionCompleted, CoachingEffectivenessRecorded
- Policy: CoachingSessionPolicy

**All 13 user stories are fully covered by the domain model.**

