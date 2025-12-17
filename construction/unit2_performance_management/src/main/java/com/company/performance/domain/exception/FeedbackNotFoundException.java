package com.company.performance.domain.exception;

import com.company.performance.domain.aggregate.feedback.FeedbackId;

/**
 * Exception thrown when feedback cannot be found
 */
public class FeedbackNotFoundException extends DomainException {
    
    public FeedbackNotFoundException(FeedbackId feedbackId) {
        super("Feedback not found: " + feedbackId);
    }
    
    public FeedbackNotFoundException(String message) {
        super(message);
    }
}
