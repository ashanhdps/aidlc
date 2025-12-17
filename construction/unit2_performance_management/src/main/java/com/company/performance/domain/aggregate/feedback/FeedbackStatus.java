package com.company.performance.domain.aggregate.feedback;

/**
 * Enum representing the lifecycle status of a FeedbackRecord
 */
public enum FeedbackStatus {
    /**
     * Feedback has been created and sent to receiver
     */
    CREATED,
    
    /**
     * Receiver has acknowledged receipt of feedback
     */
    ACKNOWLEDGED,
    
    /**
     * Receiver has responded to the feedback
     */
    RESPONDED,
    
    /**
     * Feedback conversation has been resolved
     */
    RESOLVED
}
