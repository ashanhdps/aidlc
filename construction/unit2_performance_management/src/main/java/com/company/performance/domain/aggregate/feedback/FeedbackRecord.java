package com.company.performance.domain.aggregate.feedback;

import com.company.performance.domain.aggregate.reviewcycle.KPIId;
import com.company.performance.domain.aggregate.reviewcycle.UserId;
import com.company.performance.domain.event.DomainEvent;
import com.company.performance.domain.event.FeedbackProvided;
import com.company.performance.domain.event.FeedbackResponseProvided;
import com.company.performance.domain.exception.InvalidFeedbackOperationException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Aggregate Root: FeedbackRecord
 * Manages feedback conversations between users
 * 
 * Lifecycle: CREATED → ACKNOWLEDGED → RESPONDED → RESOLVED
 * 
 * Business Rules:
 * - Feedback must be linked to a specific KPI
 * - Only the receiver can respond to feedback
 * - Feedback cannot be deleted, only archived
 */
public class FeedbackRecord {
    
    private final FeedbackId id;
    private final UserId giverId;
    private final UserId receiverId;
    private final Instant createdDate;
    private FeedbackStatus status;
    private final FeedbackType feedbackType;
    private final FeedbackContext context;
    private final List<FeedbackResponse> responses;
    private final List<DomainEvent> domainEvents;
    
    // Private constructor - use factory method
    private FeedbackRecord(
            UserId giverId,
            UserId receiverId,
            KPIId kpiId,
            String kpiName,
            FeedbackType feedbackType,
            String contentText) {
        
        this.id = FeedbackId.generate();
        this.giverId = giverId;
        this.receiverId = receiverId;
        this.createdDate = Instant.now();
        this.status = FeedbackStatus.CREATED;
        this.feedbackType = feedbackType;
        this.context = new FeedbackContext(kpiId, kpiName, contentText);
        this.responses = new ArrayList<>();
        this.domainEvents = new ArrayList<>();
    }
    
    /**
     * Factory method to create new feedback (US-019)
     */
    public static FeedbackRecord create(
            UserId giverId,
            UserId receiverId,
            KPIId kpiId,
            String kpiName,
            FeedbackType feedbackType,
            String contentText) {
        
        FeedbackRecord feedback = new FeedbackRecord(
            giverId,
            receiverId,
            kpiId,
            kpiName,
            feedbackType,
            contentText
        );
        
        // Raise domain event
        feedback.addDomainEvent(new FeedbackProvided(
            feedback.id.getValue(),
            giverId.getValue(),
            receiverId.getValue(),
            kpiId.getValue(),
            feedbackType,
            feedback.createdDate
        ));
        
        return feedback;
    }
    
    /**
     * Acknowledge feedback receipt (US-020)
     */
    public void acknowledge() {
        if (status != FeedbackStatus.CREATED) {
            throw new InvalidFeedbackOperationException(
                "Feedback can only be acknowledged when in Created status"
            );
        }
        this.status = FeedbackStatus.ACKNOWLEDGED;
    }
    
    /**
     * Add response to feedback (US-020)
     */
    public void addResponse(UserId responderId, String responseText) {
        // Business Rule: Only receiver can respond
        if (!responderId.equals(receiverId)) {
            throw new InvalidFeedbackOperationException(
                "Only feedback receiver can respond"
            );
        }
        
        FeedbackResponse response = new FeedbackResponse(responderId, responseText);
        responses.add(response);
        this.status = FeedbackStatus.RESPONDED;
        
        // Raise domain event
        addDomainEvent(new FeedbackResponseProvided(
            this.id.getValue(),
            response.getId().getValue(),
            responderId.getValue(),
            response.getResponseDate()
        ));
    }
    
    /**
     * Mark feedback as resolved
     */
    public void resolve() {
        if (status == FeedbackStatus.RESOLVED) {
            throw new InvalidFeedbackOperationException(
                "Feedback is already resolved"
            );
        }
        this.status = FeedbackStatus.RESOLVED;
    }
    
    /**
     * Business Rule: Feedback cannot be deleted
     */
    public boolean canBeDeleted() {
        return false;
    }
    
    private void addDomainEvent(DomainEvent event) {
        domainEvents.add(event);
    }
    
    // Getters
    
    public FeedbackId getId() {
        return id;
    }
    
    public UserId getGiverId() {
        return giverId;
    }
    
    public UserId getReceiverId() {
        return receiverId;
    }
    
    public Instant getCreatedDate() {
        return createdDate;
    }
    
    public FeedbackStatus getStatus() {
        return status;
    }
    
    public FeedbackType getFeedbackType() {
        return feedbackType;
    }
    
    public FeedbackContext getContext() {
        return context;
    }
    
    public List<FeedbackResponse> getResponses() {
        return Collections.unmodifiableList(responses);
    }
    
    public List<DomainEvent> getDomainEvents() {
        List<DomainEvent> events = new ArrayList<>(domainEvents);
        domainEvents.clear();
        return events;
    }
}
