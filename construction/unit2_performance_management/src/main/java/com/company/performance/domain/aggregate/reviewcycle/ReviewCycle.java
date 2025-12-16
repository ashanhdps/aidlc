package com.company.performance.domain.aggregate.reviewcycle;

import com.company.performance.domain.event.*;
import com.company.performance.domain.exception.InvalidAssessmentException;
import com.company.performance.domain.exception.ReviewCycleNotFoundException;
import com.company.performance.domain.service.PerformanceScoreCalculationService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Aggregate Root: ReviewCycle
 * Manages the performance review process for employees
 * 
 * Lifecycle: ACTIVE → IN_PROGRESS → COMPLETED
 * 
 * Business Rules:
 * - Self-assessment must be submitted before manager assessment
 * - Final scores are calculated using PerformanceScoreCalculationService
 * - Review cycle can only be completed when all participants have manager assessments
 */
public class ReviewCycle {
    
    private final ReviewCycleId id;
    private final String cycleName;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private ReviewCycleStatus status;
    private final List<ReviewParticipant> participants;
    private final List<DomainEvent> domainEvents;
    
    public ReviewCycle(
            String cycleName,
            LocalDate startDate,
            LocalDate endDate,
            List<ReviewParticipant> participants) {
        
        validateCycleName(cycleName);
        validateDates(startDate, endDate);
        
        this.id = ReviewCycleId.generate();
        this.cycleName = cycleName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = ReviewCycleStatus.ACTIVE;
        this.participants = new ArrayList<>(participants);
        this.domainEvents = new ArrayList<>();
    }
    
    private void validateCycleName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Cycle name cannot be null or empty");
        }
    }
    
    private void validateDates(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start date and end date cannot be null");
        }
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
    }
    
    /**
     * Submit self-assessment for a participant (US-016)
     */
    public void submitSelfAssessment(
            ParticipantId participantId,
            List<AssessmentScore> kpiScores,
            String comments,
            String extraMileEfforts) {
        
        ensureCycleIsActive();
        
        ReviewParticipant participant = findParticipant(participantId);
        
        if (participant.hasSelfAssessment()) {
            throw new InvalidAssessmentException(
                "Self-assessment already submitted for participant: " + participantId
            );
        }
        
        SelfAssessment assessment = new SelfAssessment(kpiScores, comments, extraMileEfforts);
        participant.setSelfAssessment(assessment);
        
        updateStatusToInProgress();
        
        // Raise domain event
        addDomainEvent(new SelfAssessmentSubmitted(
            id.getValue(),
            participant.getId().getValue(),
            participant.getEmployeeId().getValue(),
            participant.getSupervisorId().getValue(),
            assessment.getSubmittedDate(),
            kpiScores,
            comments,
            extraMileEfforts
        ));
    }
    
    /**
     * Submit manager assessment for a participant (US-017)
     */
    public void submitManagerAssessment(
            ParticipantId participantId,
            List<AssessmentScore> kpiScores,
            String overallComments,
            PerformanceScoreCalculationService scoreService) {
        
        ensureCycleIsActive();
        
        ReviewParticipant participant = findParticipant(participantId);
        
        // Business Rule: Self-assessment must be submitted first
        ensureSelfAssessmentSubmitted(participant);
        
        if (participant.hasManagerAssessment()) {
            throw new InvalidAssessmentException(
                "Manager assessment already submitted for participant: " + participantId
            );
        }
        
        ManagerAssessment assessment = new ManagerAssessment(kpiScores, overallComments);
        
        // Calculate final score using domain service
        BigDecimal finalScore = scoreService.calculateFinalScore(kpiScores);
        
        participant.setManagerAssessment(assessment, finalScore);
        
        // Raise domain event
        addDomainEvent(new ManagerAssessmentSubmitted(
            id.getValue(),
            participant.getId().getValue(),
            participant.getEmployeeId().getValue(),
            participant.getSupervisorId().getValue(),
            assessment.getSubmittedDate(),
            kpiScores,
            overallComments,
            finalScore
        ));
    }
    
    /**
     * Complete the review cycle
     */
    public void complete() {
        ensureCycleIsActive();
        ensureAllParticipantsCompleted();
        
        this.status = ReviewCycleStatus.COMPLETED;
        
        BigDecimal averageScore = calculateAverageScore();
        
        // Raise domain event
        addDomainEvent(new ReviewCycleCompleted(
            id.getValue(),
            cycleName,
            Instant.now(),
            participants.size(),
            averageScore
        ));
    }
    
    // Private helper methods
    
    private void ensureCycleIsActive() {
        if (status == ReviewCycleStatus.COMPLETED) {
            throw new InvalidAssessmentException(
                "Cannot modify completed review cycle: " + id
            );
        }
    }
    
    private void ensureSelfAssessmentSubmitted(ReviewParticipant participant) {
        if (!participant.hasSelfAssessment()) {
            throw new InvalidAssessmentException(
                "Self-assessment must be submitted before manager assessment for participant: " 
                + participant.getId()
            );
        }
    }
    
    private void ensureAllParticipantsCompleted() {
        boolean allCompleted = participants.stream()
            .allMatch(ReviewParticipant::hasManagerAssessment);
        
        if (!allCompleted) {
            throw new InvalidAssessmentException(
                "All participants must have manager assessments before completing cycle"
            );
        }
    }
    
    private ReviewParticipant findParticipant(ParticipantId participantId) {
        return participants.stream()
            .filter(p -> p.getId().equals(participantId))
            .findFirst()
            .orElseThrow(() -> new ReviewCycleNotFoundException(
                "Participant not found: " + participantId
            ));
    }
    
    private void updateStatusToInProgress() {
        if (status == ReviewCycleStatus.ACTIVE) {
            this.status = ReviewCycleStatus.IN_PROGRESS;
        }
    }
    
    private BigDecimal calculateAverageScore() {
        if (participants.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal sum = participants.stream()
            .map(ReviewParticipant::getFinalScore)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return sum.divide(
            new BigDecimal(participants.size()),
            2,
            RoundingMode.HALF_UP
        );
    }
    
    private void addDomainEvent(DomainEvent event) {
        domainEvents.add(event);
    }
    
    // Getters
    
    public ReviewCycleId getId() {
        return id;
    }
    
    public String getCycleName() {
        return cycleName;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public ReviewCycleStatus getStatus() {
        return status;
    }
    
    public List<ReviewParticipant> getParticipants() {
        return Collections.unmodifiableList(participants);
    }
    
    public List<DomainEvent> getDomainEvents() {
        List<DomainEvent> events = new ArrayList<>(domainEvents);
        domainEvents.clear();
        return events;
    }
}
