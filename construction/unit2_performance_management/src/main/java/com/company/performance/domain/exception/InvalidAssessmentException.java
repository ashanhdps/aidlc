package com.company.performance.domain.exception;

/**
 * Exception thrown when assessment validation fails
 */
public class InvalidAssessmentException extends DomainException {
    
    public InvalidAssessmentException(String message) {
        super(message);
    }
    
    public InvalidAssessmentException(String message, Throwable cause) {
        super(message, cause);
    }
}
