package com.company.performance.domain.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain event published when a response is provided to feedback
 */
public class FeedbackResponseProvided extends DomainEvent {
    
    private final UUID feedbackId;
    private final UUID responseId;
    private final UUID responderId;
    private final Instant responseDate;
    
    public FeedbackResponseProvided(
            UUID feedbackId,
            UUID responseId,
            UUID responderId,
            Instant responseDate) {
        
        super(feedbackId, "FeedbackRecord");
        this.feedbackId = feedbackId;
        this.responseId = responseId;
        this.responderId = responderId;
        this.responseDate = responseDate;
    }
    
    public UUID getFeedbackId() {
        return feedbackId;
    }
    
    public UUID getResponseId() {
        return responseId;
    }
    
    public UUID getResponderId() {
        return responderId;
    }
    
    public Instant getResponseDate() {
        return responseDate;
    }
    
    @Override
    public String toString() {
        return "FeedbackResponseProvided{" +
                "feedbackId=" + feedbackId +
                ", responseId=" + responseId +
                ", responderId=" + responderId +
                ", responseDate=" + responseDate +
                '}';
    }
}
