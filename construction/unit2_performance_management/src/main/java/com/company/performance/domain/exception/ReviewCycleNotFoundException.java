package com.company.performance.domain.exception;

import com.company.performance.domain.aggregate.reviewcycle.ReviewCycleId;

/**
 * Exception thrown when a review cycle cannot be found
 */
public class ReviewCycleNotFoundException extends DomainException {
    
    public ReviewCycleNotFoundException(ReviewCycleId cycleId) {
        super("Review cycle not found: " + cycleId);
    }
    
    public ReviewCycleNotFoundException(String message) {
        super(message);
    }
}
