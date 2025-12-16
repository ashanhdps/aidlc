package com.company.dataanalytics.domain.shared;

/**
 * Base class for all domain-specific exceptions.
 * These exceptions represent business rule violations.
 */
public abstract class DomainException extends RuntimeException {
    
    protected DomainException(String message) {
        super(message);
    }
    
    protected DomainException(String message, Throwable cause) {
        super(message, cause);
    }
}