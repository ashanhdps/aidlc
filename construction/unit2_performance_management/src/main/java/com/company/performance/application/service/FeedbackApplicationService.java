package com.company.performance.application.service;

import com.company.performance.domain.aggregate.feedback.FeedbackId;
import com.company.performance.domain.aggregate.feedback.FeedbackRecord;
import com.company.performance.domain.aggregate.feedback.FeedbackType;
import com.company.performance.domain.aggregate.reviewcycle.KPIId;
import com.company.performance.domain.aggregate.reviewcycle.UserId;
import com.company.performance.domain.exception.FeedbackNotFoundException;
import com.company.performance.domain.repository.IFeedbackRecordRepository;
import com.company.performance.infrastructure.messaging.DomainEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Application Service for Feedback operations
 * Orchestrates use cases for feedback management
 * 
 * Implements:
 * - US-019: Provide KPI-Specific Feedback
 * - US-020: Receive Performance Feedback
 */
@Service
public class FeedbackApplicationService {
    
    private final IFeedbackRecordRepository feedbackRepository;
    private final DomainEventPublisher eventPublisher;
    
    public FeedbackApplicationService(
            IFeedbackRecordRepository feedbackRepository,
            DomainEventPublisher eventPublisher) {
        
        this.feedbackRepository = feedbackRepository;
        this.eventPublisher = eventPublisher;
    }
    
    /**
     * Provide feedback (US-019)
     */
    public FeedbackId provideFeedback(
            UserId giverId,
            UserId receiverId,
            KPIId kpiId,
            String kpiName,
            FeedbackType feedbackType,
            String contentText) {
        
        // Create feedback aggregate
        FeedbackRecord feedback = FeedbackRecord.create(
            giverId,
            receiverId,
            kpiId,
            kpiName,
            feedbackType,
            contentText
        );
        
        // Save aggregate
        feedbackRepository.save(feedback);
        
        // Publish domain events
        eventPublisher.publishAll(feedback.getDomainEvents());
        
        return feedback.getId();
    }
    
    /**
     * Acknowledge feedback (US-020)
     */
    public void acknowledgeFeedback(FeedbackId feedbackId) {
        // Load aggregate
        FeedbackRecord feedback = feedbackRepository.findById(feedbackId)
            .orElseThrow(() -> new FeedbackNotFoundException(feedbackId));
        
        // Execute domain logic
        feedback.acknowledge();
        
        // Save aggregate
        feedbackRepository.update(feedback);
    }
    
    /**
     * Respond to feedback (US-020)
     */
    public void respondToFeedback(
            FeedbackId feedbackId,
            UserId responderId,
            String responseText) {
        
        // Load aggregate
        FeedbackRecord feedback = feedbackRepository.findById(feedbackId)
            .orElseThrow(() -> new FeedbackNotFoundException(feedbackId));
        
        // Execute domain logic
        feedback.addResponse(responderId, responseText);
        
        // Save aggregate
        feedbackRepository.update(feedback);
        
        // Publish domain events
        eventPublisher.publishAll(feedback.getDomainEvents());
    }
    
    /**
     * Resolve feedback
     */
    public void resolveFeedback(FeedbackId feedbackId) {
        // Load aggregate
        FeedbackRecord feedback = feedbackRepository.findById(feedbackId)
            .orElseThrow(() -> new FeedbackNotFoundException(feedbackId));
        
        // Execute domain logic
        feedback.resolve();
        
        // Save aggregate
        feedbackRepository.update(feedback);
    }
    
    /**
     * Get feedback for employee (US-020)
     */
    public List<FeedbackRecord> getFeedbackForEmployee(UserId employeeId) {
        return feedbackRepository.findByReceiver(employeeId);
    }
    
    /**
     * Get unresolved feedback for employee
     */
    public List<FeedbackRecord> getUnresolvedFeedback(UserId employeeId) {
        return feedbackRepository.findUnresolvedForReceiver(employeeId);
    }
    
    /**
     * Get feedback by ID
     */
    public FeedbackRecord getFeedback(FeedbackId feedbackId) {
        return feedbackRepository.findById(feedbackId)
            .orElseThrow(() -> new FeedbackNotFoundException(feedbackId));
    }
    
    /**
     * Get all feedback
     */
    public List<FeedbackRecord> getAllFeedback() {
        return feedbackRepository.findAll();
    }
}
