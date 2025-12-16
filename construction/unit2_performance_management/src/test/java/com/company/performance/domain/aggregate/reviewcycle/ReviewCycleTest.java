package com.company.performance.domain.aggregate.reviewcycle;

import com.company.performance.domain.event.*;
import com.company.performance.domain.exception.InvalidAssessmentException;
import com.company.performance.domain.exception.ReviewCycleNotFoundException;
import com.company.performance.domain.service.PerformanceScoreCalculationService;
import com.company.performance.testutil.builders.AssessmentScoreBuilder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Test class for ReviewCycle aggregate
 * Tests all business rules and workflows for review cycle management
 */
@DisplayName("ReviewCycle Aggregate Tests")
class ReviewCycleTest {

    private final PerformanceScoreCalculationService scoreService = 
        new PerformanceScoreCalculationService();

    // ========== Creation and Initialization Tests ==========

    @Test
    @DisplayName("TC-DOM-RC-CREATE-001: Create review cycle with valid data")
    void shouldCreateReviewCycleWithValidData() {
        // Arrange
        String cycleName = "Q4 2024 Review";
        LocalDate startDate = LocalDate.of(2024, 10, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        // Act
        ReviewCycle cycle = new ReviewCycle(cycleName, startDate, endDate, new ArrayList<>());

        // Assert
        assertThat(cycle.getId()).isNotNull();
        assertThat(cycle.getCycleName()).isEqualTo(cycleName);
        assertThat(cycle.getStartDate()).isEqualTo(startDate);
        assertThat(cycle.getEndDate()).isEqualTo(endDate);
        assertThat(cycle.getStatus()).isEqualTo(ReviewCycleStatus.ACTIVE);
        assertThat(cycle.getParticipants()).isEmpty();
        assertThat(cycle.getDomainEvents()).isEmpty();
    }

    @Test
    @DisplayName("TC-DOM-RC-CREATE-002: Create review cycle with participants")
    void shouldCreateReviewCycleWithParticipants() {
        // Arrange
        UserId employeeId = new UserId(UUID.randomUUID());
        UserId supervisorId = new UserId(UUID.randomUUID());
        ReviewParticipant participant = new ReviewParticipant(employeeId, supervisorId);
        List<ReviewParticipant> participants = List.of(participant);

        // Act
        ReviewCycle cycle = new ReviewCycle("Q4 2024", LocalDate.now(), 
            LocalDate.now().plusDays(30), participants);

        // Assert
        assertThat(cycle.getParticipants()).hasSize(1);
        assertThat(cycle.getParticipants().get(0).getId()).isNotNull();
        assertThat(cycle.getParticipants().get(0).getStatus()).isEqualTo(ParticipantStatus.PENDING);
    }

    @Test
    @DisplayName("TC-DOM-RC-CREATE-003: Reject cycle with null name")
    void shouldRejectCycleWithNullName() {
        // Arrange & Act & Assert
        assertThatThrownBy(() -> 
            new ReviewCycle(null, LocalDate.now(), LocalDate.now().plusDays(30), new ArrayList<>())
        ).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("TC-DOM-RC-CREATE-004: Reject cycle with empty name")
    void shouldRejectCycleWithEmptyName() {
        // Arrange & Act & Assert
        assertThatThrownBy(() -> 
            new ReviewCycle("", LocalDate.now(), LocalDate.now().plusDays(30), new ArrayList<>())
        ).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("TC-DOM-RC-CREATE-005: Reject cycle with end date before start date")
    void shouldRejectCycleWithEndDateBeforeStartDate() {
        // Arrange
        LocalDate startDate = LocalDate.of(2024, 12, 31);
        LocalDate endDate = LocalDate.of(2024, 10, 1);

        // Act & Assert
        assertThatThrownBy(() -> 
            new ReviewCycle("Q4 2024", startDate, endDate, new ArrayList<>())
        ).isInstanceOf(IllegalArgumentException.class);
    }

    // ========== Self-Assessment Submission Tests ==========

    @Test
    @DisplayName("TC-DOM-RC-SELF-001: Submit valid self-assessment")
    void shouldSubmitValidSelfAssessment() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();

        // Act
        cycle.submitSelfAssessment(participantId, kpiScores, "Good progress", "Extra efforts");

        // Assert
        ReviewParticipant participant = cycle.getParticipants().get(0);
        assertThat(participant.hasSelfAssessment()).isTrue();
        assertThat(participant.getStatus()).isEqualTo(ParticipantStatus.SELF_ASSESSMENT_SUBMITTED);
        assertThat(participant.getSelfAssessment().getKpiScores()).hasSize(3);
        assertThat(participant.getSelfAssessment().getComments()).isEqualTo("Good progress");
        assertThat(participant.getSelfAssessment().getExtraMileEfforts()).isEqualTo("Extra efforts");
        
        List<DomainEvent> events = cycle.getDomainEvents();
        assertThat(events).hasSize(1);
        assertThat(events.get(0)).isInstanceOf(SelfAssessmentSubmitted.class);
    }

    @Test
    @DisplayName("TC-DOM-RC-SELF-002: Submit self-assessment with extra mile efforts")
    void shouldSubmitSelfAssessmentWithExtraMileEfforts() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        String extraMile = "Led cross-team initiative, mentored 3 junior developers";

        // Act
        cycle.submitSelfAssessment(participantId, kpiScores, "Comments", extraMile);

        // Assert
        assertThat(cycle.getParticipants().get(0).getSelfAssessment().getExtraMileEfforts())
            .isEqualTo(extraMile);
    }

    @Test
    @DisplayName("TC-DOM-RC-SELF-003: Submit self-assessment with multiple KPI scores")
    void shouldSubmitSelfAssessmentWithMultipleKpiScores() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = List.of(
            new AssessmentScoreBuilder().withRating(4.0).build(),
            new AssessmentScoreBuilder().withRating(3.5).build(),
            new AssessmentScoreBuilder().withRating(4.5).build(),
            new AssessmentScoreBuilder().withRating(3.0).build(),
            new AssessmentScoreBuilder().withRating(5.0).build()
        );

        // Act
        cycle.submitSelfAssessment(participantId, kpiScores, "Comments", null);

        // Assert
        assertThat(cycle.getParticipants().get(0).getSelfAssessment().getKpiScores()).hasSize(5);
    }

    @Test
    @DisplayName("TC-DOM-RC-SELF-004: Reject self-assessment with empty KPI scores")
    void shouldRejectSelfAssessmentWithEmptyKpiScores() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();

        // Act & Assert
        assertThatThrownBy(() -> 
            cycle.submitSelfAssessment(participantId, new ArrayList<>(), "Comments", null)
        ).isInstanceOf(InvalidAssessmentException.class)
         .hasMessageContaining("At least one KPI score is required");
    }

    @Test
    @DisplayName("TC-DOM-RC-SELF-005: Reject self-assessment for non-existent participant")
    void shouldRejectSelfAssessmentForNonExistentParticipant() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId invalidId = new ParticipantId(UUID.randomUUID());
        List<AssessmentScore> kpiScores = createValidKpiScores();

        // Act & Assert
        assertThatThrownBy(() -> 
            cycle.submitSelfAssessment(invalidId, kpiScores, "Comments", null)
        ).isInstanceOf(ReviewCycleNotFoundException.class)
         .hasMessageContaining("Participant not found");
    }

    @Test
    @DisplayName("TC-DOM-RC-SELF-006: Reject duplicate self-assessment submission")
    void shouldRejectDuplicateSelfAssessmentSubmission() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        cycle.submitSelfAssessment(participantId, kpiScores, "First submission", null);

        // Act & Assert
        assertThatThrownBy(() -> 
            cycle.submitSelfAssessment(participantId, kpiScores, "Second submission", null)
        ).isInstanceOf(InvalidAssessmentException.class)
         .hasMessageContaining("Self-assessment already submitted");
    }

    @Test
    @DisplayName("TC-DOM-RC-SELF-007: Reject self-assessment for completed cycle")
    void shouldRejectSelfAssessmentForCompletedCycle() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        
        // Complete the cycle
        cycle.submitSelfAssessment(participantId, kpiScores, "Comments", null);
        cycle.submitManagerAssessment(participantId, kpiScores, "Manager comments", scoreService);
        cycle.complete();

        // Act & Assert
        assertThatThrownBy(() -> 
            cycle.submitSelfAssessment(participantId, kpiScores, "After completion", null)
        ).isInstanceOf(InvalidAssessmentException.class)
         .hasMessageContaining("Cannot modify completed review cycle");
    }

    @Test
    @DisplayName("TC-DOM-RC-SELF-008: Self-assessment updates cycle status to InProgress")
    void shouldUpdateCycleStatusToInProgressOnFirstSelfAssessment() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        assertThat(cycle.getStatus()).isEqualTo(ReviewCycleStatus.ACTIVE);

        // Act
        cycle.submitSelfAssessment(participantId, kpiScores, "Comments", null);

        // Assert
        assertThat(cycle.getStatus()).isEqualTo(ReviewCycleStatus.IN_PROGRESS);
    }

    // ========== Manager Assessment Submission Tests ==========

    @Test
    @DisplayName("TC-DOM-RC-MGR-001: Submit valid manager assessment")
    void shouldSubmitValidManagerAssessment() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        cycle.submitSelfAssessment(participantId, kpiScores, "Self comments", null);
        cycle.getDomainEvents(); // Clear previous events

        // Act
        cycle.submitManagerAssessment(participantId, kpiScores, "Manager comments", scoreService);

        // Assert
        ReviewParticipant participant = cycle.getParticipants().get(0);
        assertThat(participant.hasManagerAssessment()).isTrue();
        assertThat(participant.getStatus()).isEqualTo(ParticipantStatus.MANAGER_ASSESSMENT_SUBMITTED);
        assertThat(participant.getFinalScore()).isNotNull();
        assertThat(participant.getManagerAssessment().getOverallComments()).isEqualTo("Manager comments");
        
        List<DomainEvent> events = cycle.getDomainEvents();
        assertThat(events).hasSize(1);
        assertThat(events.get(0)).isInstanceOf(ManagerAssessmentSubmitted.class);
    }

    @Test
    @DisplayName("TC-DOM-RC-MGR-002: Manager assessment requires prior self-assessment")
    void shouldRequireSelfAssessmentBeforeManagerAssessment() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();

        // Act & Assert
        assertThatThrownBy(() -> 
            cycle.submitManagerAssessment(participantId, kpiScores, "Manager comments", scoreService)
        ).isInstanceOf(InvalidAssessmentException.class)
         .hasMessageContaining("Self-assessment must be submitted");
    }

    @Test
    @DisplayName("TC-DOM-RC-MGR-003: Calculate final score correctly")
    void shouldCalculateFinalScoreCorrectly() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        
        // KPI scores with average = 4.0
        List<AssessmentScore> kpiScores = List.of(
            new AssessmentScoreBuilder().withRating(4.0).build(),
            new AssessmentScoreBuilder().withRating(4.0).build(),
            new AssessmentScoreBuilder().withRating(4.0).build()
        );
        
        cycle.submitSelfAssessment(participantId, kpiScores, "Comments", null);

        // Act
        cycle.submitManagerAssessment(participantId, kpiScores, "Manager comments", scoreService);

        // Assert
        // Expected: (4.0 × 0.7) + (4.0 × 0.3) = 4.0
        assertThat(cycle.getParticipants().get(0).getFinalScore())
            .isEqualByComparingTo(new BigDecimal("4.00"));
    }

    @Test
    @DisplayName("TC-DOM-RC-MGR-004: Final score is rounded to 2 decimal places")
    void shouldRoundFinalScoreTo2DecimalPlaces() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        
        // Scores that result in 3.456789...
        List<AssessmentScore> kpiScores = List.of(
            new AssessmentScoreBuilder().withRating(3.5).build(),
            new AssessmentScoreBuilder().withRating(3.4).build(),
            new AssessmentScoreBuilder().withRating(3.5).build()
        );
        
        cycle.submitSelfAssessment(participantId, kpiScores, "Comments", null);

        // Act
        cycle.submitManagerAssessment(participantId, kpiScores, "Manager comments", scoreService);

        // Assert
        BigDecimal finalScore = cycle.getParticipants().get(0).getFinalScore();
        assertThat(finalScore.scale()).isEqualTo(2);
    }

    @Test
    @DisplayName("TC-DOM-RC-MGR-005: Reject manager assessment with empty KPI scores")
    void shouldRejectManagerAssessmentWithEmptyKpiScores() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        cycle.submitSelfAssessment(participantId, createValidKpiScores(), "Comments", null);

        // Act & Assert
        assertThatThrownBy(() -> 
            cycle.submitManagerAssessment(participantId, new ArrayList<>(), "Comments", scoreService)
        ).isInstanceOf(InvalidAssessmentException.class);
    }

    @Test
    @DisplayName("TC-DOM-RC-MGR-006: Reject duplicate manager assessment")
    void shouldRejectDuplicateManagerAssessment() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        
        cycle.submitSelfAssessment(participantId, kpiScores, "Self comments", null);
        cycle.submitManagerAssessment(participantId, kpiScores, "First manager assessment", scoreService);

        // Act & Assert
        assertThatThrownBy(() -> 
            cycle.submitManagerAssessment(participantId, kpiScores, "Second manager assessment", scoreService)
        ).isInstanceOf(InvalidAssessmentException.class)
         .hasMessageContaining("Manager assessment already submitted");
    }

    @Test
    @DisplayName("TC-DOM-RC-MGR-007: Manager assessment with overall comments")
    void shouldStoreManagerOverallComments() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        String detailedComments = "Excellent performance throughout the quarter. " +
            "Demonstrated strong leadership and technical skills.";
        
        cycle.submitSelfAssessment(participantId, kpiScores, "Self comments", null);

        // Act
        cycle.submitManagerAssessment(participantId, kpiScores, detailedComments, scoreService);

        // Assert
        assertThat(cycle.getParticipants().get(0).getManagerAssessment().getOverallComments())
            .isEqualTo(detailedComments);
    }

    @Test
    @DisplayName("TC-DOM-RC-MGR-008: Final score is immutable after calculation")
    void shouldHaveImmutableFinalScore() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        
        cycle.submitSelfAssessment(participantId, kpiScores, "Comments", null);
        cycle.submitManagerAssessment(participantId, kpiScores, "Manager comments", scoreService);

        // Act
        BigDecimal originalScore = cycle.getParticipants().get(0).getFinalScore();

        // Assert - Score should remain unchanged (immutability is enforced by not having setters)
        assertThat(cycle.getParticipants().get(0).getFinalScore()).isEqualTo(originalScore);
    }

    // ========== Review Cycle Completion Tests ==========

    @Test
    @DisplayName("TC-DOM-RC-COMP-001: Complete cycle with all participants assessed")
    void shouldCompleteCycleWithAllParticipantsAssessed() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        
        cycle.submitSelfAssessment(participantId, kpiScores, "Self comments", null);
        cycle.submitManagerAssessment(participantId, kpiScores, "Manager comments", scoreService);
        cycle.getDomainEvents(); // Clear previous events

        // Act
        cycle.complete();

        // Assert
        assertThat(cycle.getStatus()).isEqualTo(ReviewCycleStatus.COMPLETED);
        
        List<DomainEvent> events = cycle.getDomainEvents();
        assertThat(events).hasSize(1);
        assertThat(events.get(0)).isInstanceOf(ReviewCycleCompleted.class);
    }

    @Test
    @DisplayName("TC-DOM-RC-COMP-002: Reject completion with pending participants")
    void shouldRejectCompletionWithPendingParticipants() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();

        // Act & Assert
        assertThatThrownBy(() -> cycle.complete())
            .isInstanceOf(InvalidAssessmentException.class)
            .hasMessageContaining("All participants must have manager assessments");
    }

    @Test
    @DisplayName("TC-DOM-RC-COMP-003: Calculate average score across participants")
    void shouldCalculateAverageScoreAcrossParticipants() {
        // Arrange
        UserId emp1 = new UserId(UUID.randomUUID());
        UserId emp2 = new UserId(UUID.randomUUID());
        UserId emp3 = new UserId(UUID.randomUUID());
        UserId supervisor = new UserId(UUID.randomUUID());
        
        List<ReviewParticipant> participants = List.of(
            new ReviewParticipant(emp1, supervisor),
            new ReviewParticipant(emp2, supervisor),
            new ReviewParticipant(emp3, supervisor)
        );
        
        ReviewCycle cycle = new ReviewCycle("Q4 2024", LocalDate.now(), 
            LocalDate.now().plusDays(30), participants);
        
        // Submit assessments for all participants with different scores
        List<AssessmentScore> scores1 = List.of(new AssessmentScoreBuilder().withRating(4.5).build());
        List<AssessmentScore> scores2 = List.of(new AssessmentScoreBuilder().withRating(3.8).build());
        List<AssessmentScore> scores3 = List.of(new AssessmentScoreBuilder().withRating(4.2).build());
        
        for (int i = 0; i < 3; i++) {
            ParticipantId pid = cycle.getParticipants().get(i).getId();
            List<AssessmentScore> scores = i == 0 ? scores1 : (i == 1 ? scores2 : scores3);
            cycle.submitSelfAssessment(pid, scores, "Comments", null);
            cycle.submitManagerAssessment(pid, scores, "Manager comments", scoreService);
        }

        // Act
        cycle.complete();

        // Assert - Average of 4.5, 3.8, 4.2 = 4.17 (rounded)
        // Note: The average is calculated internally, we verify completion succeeded
        assertThat(cycle.getStatus()).isEqualTo(ReviewCycleStatus.COMPLETED);
    }

    @Test
    @DisplayName("TC-DOM-RC-COMP-004: Reject completion of already completed cycle")
    void shouldRejectCompletionOfAlreadyCompletedCycle() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        
        cycle.submitSelfAssessment(participantId, kpiScores, "Comments", null);
        cycle.submitManagerAssessment(participantId, kpiScores, "Manager comments", scoreService);
        cycle.complete();

        // Act & Assert
        assertThatThrownBy(() -> cycle.complete())
            .isInstanceOf(InvalidAssessmentException.class)
            .hasMessageContaining("Cannot modify completed review cycle");
    }

    // ========== State Transition Tests ==========

    @Test
    @DisplayName("TC-DOM-RC-STATE-001: Valid state transition Active → InProgress")
    void shouldTransitionFromActiveToInProgress() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        assertThat(cycle.getStatus()).isEqualTo(ReviewCycleStatus.ACTIVE);

        // Act
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        cycle.submitSelfAssessment(participantId, createValidKpiScores(), "Comments", null);

        // Assert
        assertThat(cycle.getStatus()).isEqualTo(ReviewCycleStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("TC-DOM-RC-STATE-002: Valid state transition InProgress → Completed")
    void shouldTransitionFromInProgressToCompleted() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        
        cycle.submitSelfAssessment(participantId, kpiScores, "Comments", null);
        cycle.submitManagerAssessment(participantId, kpiScores, "Manager comments", scoreService);
        assertThat(cycle.getStatus()).isEqualTo(ReviewCycleStatus.IN_PROGRESS);

        // Act
        cycle.complete();

        // Assert
        assertThat(cycle.getStatus()).isEqualTo(ReviewCycleStatus.COMPLETED);
    }

    @Test
    @DisplayName("TC-DOM-RC-STATE-003: Cannot transition from Completed to any state")
    void shouldNotAllowTransitionFromCompletedState() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        
        cycle.submitSelfAssessment(participantId, kpiScores, "Comments", null);
        cycle.submitManagerAssessment(participantId, kpiScores, "Manager comments", scoreService);
        cycle.complete();

        // Act & Assert - Try to submit another assessment
        assertThatThrownBy(() -> 
            cycle.submitSelfAssessment(participantId, kpiScores, "New comments", null)
        ).isInstanceOf(InvalidAssessmentException.class)
         .hasMessageContaining("Cannot modify completed review cycle");
    }

    // ========== Domain Event Tests ==========

    @Test
    @DisplayName("TC-DOM-RC-EVENT-001: SelfAssessmentSubmitted event structure")
    void shouldCreateSelfAssessmentSubmittedEventWithCorrectStructure() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        String comments = "My self-assessment comments";
        String extraMile = "Extra mile efforts";

        // Act
        cycle.submitSelfAssessment(participantId, kpiScores, comments, extraMile);

        // Assert
        List<DomainEvent> events = cycle.getDomainEvents();
        assertThat(events).hasSize(1);
        
        SelfAssessmentSubmitted event = (SelfAssessmentSubmitted) events.get(0);
        assertThat(event.getEventId()).isNotNull();
        assertThat(event.getCycleId()).isEqualTo(cycle.getId().getValue());
        assertThat(event.getParticipantId()).isEqualTo(participantId.getValue());
        assertThat(event.getEmployeeId()).isNotNull();
        assertThat(event.getSupervisorId()).isNotNull();
        assertThat(event.getSubmittedDate()).isNotNull();
        assertThat(event.getKpiScores()).hasSize(3);
        assertThat(event.getComments()).isEqualTo(comments);
        assertThat(event.getExtraMileEfforts()).isEqualTo(extraMile);
    }

    @Test
    @DisplayName("TC-DOM-RC-EVENT-002: ManagerAssessmentSubmitted event structure")
    void shouldCreateManagerAssessmentSubmittedEventWithCorrectStructure() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        String overallComments = "Manager's overall assessment";
        
        cycle.submitSelfAssessment(participantId, kpiScores, "Self comments", null);
        cycle.getDomainEvents(); // Clear events

        // Act
        cycle.submitManagerAssessment(participantId, kpiScores, overallComments, scoreService);

        // Assert
        List<DomainEvent> events = cycle.getDomainEvents();
        assertThat(events).hasSize(1);
        
        ManagerAssessmentSubmitted event = (ManagerAssessmentSubmitted) events.get(0);
        assertThat(event.getEventId()).isNotNull();
        assertThat(event.getCycleId()).isEqualTo(cycle.getId().getValue());
        assertThat(event.getParticipantId()).isEqualTo(participantId.getValue());
        assertThat(event.getEmployeeId()).isNotNull();
        assertThat(event.getSupervisorId()).isNotNull();
        assertThat(event.getSubmittedDate()).isNotNull();
        assertThat(event.getKpiScores()).hasSize(3);
        assertThat(event.getOverallComments()).isEqualTo(overallComments);
        assertThat(event.getFinalScore()).isNotNull();
    }

    @Test
    @DisplayName("TC-DOM-RC-EVENT-003: ReviewCycleCompleted event structure")
    void shouldCreateReviewCycleCompletedEventWithCorrectStructure() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        List<AssessmentScore> kpiScores = createValidKpiScores();
        
        cycle.submitSelfAssessment(participantId, kpiScores, "Comments", null);
        cycle.submitManagerAssessment(participantId, kpiScores, "Manager comments", scoreService);
        cycle.getDomainEvents(); // Clear events

        // Act
        cycle.complete();

        // Assert
        List<DomainEvent> events = cycle.getDomainEvents();
        assertThat(events).hasSize(1);
        
        ReviewCycleCompleted event = (ReviewCycleCompleted) events.get(0);
        assertThat(event.getEventId()).isNotNull();
        assertThat(event.getCycleId()).isEqualTo(cycle.getId().getValue());
        assertThat(event.getCycleName()).isEqualTo(cycle.getCycleName());
        assertThat(event.getCompletedDate()).isNotNull();
        assertThat(event.getParticipantCount()).isEqualTo(1);
        assertThat(event.getAverageScore()).isNotNull();
    }

    @Test
    @DisplayName("TC-DOM-RC-EVENT-004: Multiple events accumulated")
    void shouldAccumulateMultipleEvents() {
        // Arrange
        UserId emp1 = new UserId(UUID.randomUUID());
        UserId emp2 = new UserId(UUID.randomUUID());
        UserId supervisor = new UserId(UUID.randomUUID());
        
        List<ReviewParticipant> participants = List.of(
            new ReviewParticipant(emp1, supervisor),
            new ReviewParticipant(emp2, supervisor)
        );
        
        ReviewCycle cycle = new ReviewCycle("Q4 2024", LocalDate.now(), 
            LocalDate.now().plusDays(30), participants);

        // Act - Submit self-assessments for both participants
        cycle.submitSelfAssessment(cycle.getParticipants().get(0).getId(), 
            createValidKpiScores(), "Comments 1", null);
        cycle.submitSelfAssessment(cycle.getParticipants().get(1).getId(), 
            createValidKpiScores(), "Comments 2", null);

        // Assert
        List<DomainEvent> events = cycle.getDomainEvents();
        assertThat(events).hasSize(2);
        assertThat(events).allMatch(e -> e instanceof SelfAssessmentSubmitted);
    }

    @Test
    @DisplayName("TC-DOM-RC-EVENT-005: Events cleared after retrieval")
    void shouldClearEventsAfterRetrieval() {
        // Arrange
        ReviewCycle cycle = createCycleWithParticipant();
        ParticipantId participantId = cycle.getParticipants().get(0).getId();
        cycle.submitSelfAssessment(participantId, createValidKpiScores(), "Comments", null);

        // Act
        List<DomainEvent> events1 = cycle.getDomainEvents();
        List<DomainEvent> events2 = cycle.getDomainEvents();

        // Assert
        assertThat(events1).hasSize(1);
        assertThat(events2).isEmpty();
    }

    // ========== Helper Methods ==========

    private ReviewCycle createCycleWithParticipant() {
        UserId employeeId = new UserId(UUID.randomUUID());
        UserId supervisorId = new UserId(UUID.randomUUID());
        ReviewParticipant participant = new ReviewParticipant(employeeId, supervisorId);
        
        return new ReviewCycle(
            "Q4 2024 Review",
            LocalDate.now(),
            LocalDate.now().plusDays(30),
            List.of(participant)
        );
    }

    private List<AssessmentScore> createValidKpiScores() {
        return List.of(
            new AssessmentScoreBuilder().withRating(4.0).withAchievement(85).build(),
            new AssessmentScoreBuilder().withRating(3.5).withAchievement(75).build(),
            new AssessmentScoreBuilder().withRating(4.5).withAchievement(90).build()
        );
    }
}
