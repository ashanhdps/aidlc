package com.company.performance.application.service;

import com.company.performance.domain.aggregate.reviewcycle.*;
import com.company.performance.domain.exception.ReviewCycleNotFoundException;
import com.company.performance.domain.repository.IReviewCycleRepository;
import com.company.performance.domain.service.PerformanceScoreCalculationService;
import com.company.performance.infrastructure.messaging.DomainEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Application Service for ReviewCycle operations
 * Orchestrates use cases for performance reviews
 * 
 * Implements:
 * - US-016: Conduct Self-Assessment
 * - US-017: Manager Performance Scoring
 */
@Service
public class ReviewCycleApplicationService {
    
    private final IReviewCycleRepository reviewCycleRepository;
    private final PerformanceScoreCalculationService scoreCalculationService;
    private final DomainEventPublisher eventPublisher;
    
    public ReviewCycleApplicationService(
            IReviewCycleRepository reviewCycleRepository,
            PerformanceScoreCalculationService scoreCalculationService,
            DomainEventPublisher eventPublisher) {
        
        this.reviewCycleRepository = reviewCycleRepository;
        this.scoreCalculationService = scoreCalculationService;
        this.eventPublisher = eventPublisher;
    }
    
    /**
     * Create a new review cycle
     */
    public ReviewCycleId createReviewCycle(
            String cycleName,
            LocalDate startDate,
            LocalDate endDate,
            List<ReviewParticipant> participants) {
        
        ReviewCycle cycle = new ReviewCycle(cycleName, startDate, endDate, participants);
        reviewCycleRepository.save(cycle);
        
        // Publish any domain events
        eventPublisher.publishAll(cycle.getDomainEvents());
        
        return cycle.getId();
    }
    
    /**
     * Submit self-assessment (US-016)
     */
    public void submitSelfAssessment(
            ReviewCycleId cycleId,
            ParticipantId participantId,
            List<AssessmentScore> kpiScores,
            String comments,
            String extraMileEfforts) {
        
        // Load aggregate
        ReviewCycle cycle = reviewCycleRepository.findById(cycleId)
            .orElseThrow(() -> new ReviewCycleNotFoundException(cycleId));
        
        // Execute domain logic
        cycle.submitSelfAssessment(participantId, kpiScores, comments, extraMileEfforts);
        
        // Save aggregate
        reviewCycleRepository.update(cycle);
        
        // Publish domain events
        eventPublisher.publishAll(cycle.getDomainEvents());
    }
    
    /**
     * Submit manager assessment (US-017)
     */
    public void submitManagerAssessment(
            ReviewCycleId cycleId,
            ParticipantId participantId,
            List<AssessmentScore> kpiScores,
            String overallComments) {
        
        // Load aggregate
        ReviewCycle cycle = reviewCycleRepository.findById(cycleId)
            .orElseThrow(() -> new ReviewCycleNotFoundException(cycleId));
        
        // Execute domain logic with score calculation service
        cycle.submitManagerAssessment(
            participantId,
            kpiScores,
            overallComments,
            scoreCalculationService
        );
        
        // Save aggregate
        reviewCycleRepository.update(cycle);
        
        // Publish domain events
        eventPublisher.publishAll(cycle.getDomainEvents());
    }
    
    /**
     * Complete review cycle
     */
    public void completeReviewCycle(ReviewCycleId cycleId) {
        // Load aggregate
        ReviewCycle cycle = reviewCycleRepository.findById(cycleId)
            .orElseThrow(() -> new ReviewCycleNotFoundException(cycleId));
        
        // Execute domain logic
        cycle.complete();
        
        // Save aggregate
        reviewCycleRepository.update(cycle);
        
        // Publish domain events
        eventPublisher.publishAll(cycle.getDomainEvents());
    }
    
    /**
     * Get review cycle by ID
     */
    public ReviewCycle getReviewCycle(ReviewCycleId cycleId) {
        return reviewCycleRepository.findById(cycleId)
            .orElseThrow(() -> new ReviewCycleNotFoundException(cycleId));
    }
    
    /**
     * Get all review cycles
     */
    public List<ReviewCycle> getAllReviewCycles() {
        return reviewCycleRepository.findAll();
    }
    
    /**
     * Get active review cycles
     */
    public List<ReviewCycle> getActiveReviewCycles() {
        return reviewCycleRepository.findActiveCycles();
    }
}
