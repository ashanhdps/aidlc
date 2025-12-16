package com.company.performance.domain.exception;

/**
 * Exception thrown when an invalid feedback operation is attempted
 */
public class InvalidFeedbackOperationException extends DomainException {
    
    public InvalidFeedbackOperationException(String message) {
        super(message);
    }
    
    public InvalidFeedbackOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
