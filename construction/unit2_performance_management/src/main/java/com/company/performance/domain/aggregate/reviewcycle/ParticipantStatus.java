package com.company.performance.domain.aggregate.reviewcycle;

/**
 * Enum representing the status of a ReviewParticipant in the review process
 */
public enum ParticipantStatus {
    /**
     * Participant has been added but no assessments submitted yet
     */
    PENDING,
    
    /**
     * Employee has submitted self-assessment
     */
    SELF_ASSESSMENT_SUBMITTED,
    
    /**
     * Manager has submitted assessment and final score calculated
     */
    MANAGER_ASSESSMENT_SUBMITTED,
    
    /**
     * Review process completed for this participant
     */
    COMPLETED
}
