package com.company.performance.domain.event;

import com.company.performance.domain.aggregate.feedback.FeedbackType;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain event published when feedback is provided
 */
public class FeedbackProvided extends DomainEvent {
    
    private final UUID feedbackId;
    private final UUID giverId;
    private final UUID receiverId;
    private final UUID kpiId;
    private final FeedbackType feedbackType;
    private final Instant createdDate;
    
    public FeedbackProvided(
            UUID feedbackId,
            UUID giverId,
            UUID receiverId,
            UUID kpiId,
            FeedbackType feedbackType,
            Instant createdDate) {
        
        super(feedbackId, "FeedbackRecord");
        this.feedbackId = feedbackId;
        this.giverId = giverId;
        this.receiverId = receiverId;
        this.kpiId = kpiId;
        this.feedbackType = feedbackType;
        this.createdDate = createdDate;
    }
    
    public UUID getFeedbackId() {
        return feedbackId;
    }
    
    public UUID getGiverId() {
        return giverId;
    }
    
    public UUID getReceiverId() {
        return receiverId;
    }
    
    public UUID getKpiId() {
        return kpiId;
    }
    
    public FeedbackType getFeedbackType() {
        return feedbackType;
    }
    
    public Instant getCreatedDate() {
        return createdDate;
    }
    
    @Override
    public String toString() {
        return "FeedbackProvided{" +
                "feedbackId=" + feedbackId +
                ", giverId=" + giverId +
                ", receiverId=" + receiverId +
                ", kpiId=" + kpiId +
                ", feedbackType=" + feedbackType +
                '}';
    }
}
