package com.company.performance.domain.aggregate.reviewcycle;

/**
 * Enum representing the lifecycle status of a ReviewCycle
 */
public enum ReviewCycleStatus {
    /**
     * Review cycle is created and participants can start assessments
     */
    ACTIVE,
    
    /**
     * Review cycle is in progress with some assessments submitted
     */
    IN_PROGRESS,
    
    /**
     * Review cycle is completed with all assessments finalized
     */
    COMPLETED
}
