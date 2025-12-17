package com.company.performance.domain.aggregate.reviewcycle;

import java.math.BigDecimal;

/**
 * Entity representing a participant in a review cycle
 * Tracks the employee, supervisor, and assessment status
 */
public class ReviewParticipant {
    
    private final ParticipantId id;
    private final UserId employeeId;
    private final UserId supervisorId;
    private ParticipantStatus status;
    private SelfAssessment selfAssessment;
    private ManagerAssessment managerAssessment;
    private BigDecimal finalScore;
    
    public ReviewParticipant(UserId employeeId, UserId supervisorId) {
        this.id = ParticipantId.generate();
        this.employeeId = employeeId;
        this.supervisorId = supervisorId;
        this.status = ParticipantStatus.PENDING;
    }
    
    public boolean hasSelfAssessment() {
        return selfAssessment != null;
    }
    
    public boolean hasManagerAssessment() {
        return managerAssessment != null;
    }
    
    public void setSelfAssessment(SelfAssessment assessment) {
        this.selfAssessment = assessment;
        this.status = ParticipantStatus.SELF_ASSESSMENT_SUBMITTED;
    }
    
    public void setManagerAssessment(ManagerAssessment assessment, BigDecimal score) {
        this.managerAssessment = assessment;
        this.finalScore = score;
        this.status = ParticipantStatus.MANAGER_ASSESSMENT_SUBMITTED;
    }
    
    public void complete() {
        this.status = ParticipantStatus.COMPLETED;
    }
    
    // Getters
    public ParticipantId getId() {
        return id;
    }
    
    public UserId getEmployeeId() {
        return employeeId;
    }
    
    public UserId getSupervisorId() {
        return supervisorId;
    }
    
    public ParticipantStatus getStatus() {
        return status;
    }
    
    public SelfAssessment getSelfAssessment() {
        return selfAssessment;
    }
    
    public ManagerAssessment getManagerAssessment() {
        return managerAssessment;
    }
    
    public BigDecimal getFinalScore() {
        return finalScore;
    }
}
