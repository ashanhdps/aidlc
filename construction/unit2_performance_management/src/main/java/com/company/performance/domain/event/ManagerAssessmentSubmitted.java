package com.company.performance.domain.event;

import com.company.performance.domain.aggregate.reviewcycle.AssessmentScore;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Domain event published when a manager submits an assessment
 */
public class ManagerAssessmentSubmitted extends DomainEvent {
    
    private final UUID cycleId;
    private final UUID participantId;
    private final UUID employeeId;
    private final UUID supervisorId;
    private final Instant submittedDate;
    private final List<AssessmentScore> kpiScores;
    private final String overallComments;
    private final BigDecimal finalScore;
    
    public ManagerAssessmentSubmitted(
            UUID cycleId,
            UUID participantId,
            UUID employeeId,
            UUID supervisorId,
            Instant submittedDate,
            List<AssessmentScore> kpiScores,
            String overallComments,
            BigDecimal finalScore) {
        
        super(cycleId, "ReviewCycle");
        this.cycleId = cycleId;
        this.participantId = participantId;
        this.employeeId = employeeId;
        this.supervisorId = supervisorId;
        this.submittedDate = submittedDate;
        this.kpiScores = kpiScores;
        this.overallComments = overallComments;
        this.finalScore = finalScore;
    }
    
    // Getters
    public UUID getCycleId() {
        return cycleId;
    }
    
    public UUID getParticipantId() {
        return participantId;
    }
    
    public UUID getEmployeeId() {
        return employeeId;
    }
    
    public UUID getSupervisorId() {
        return supervisorId;
    }
    
    public Instant getSubmittedDate() {
        return submittedDate;
    }
    
    public List<AssessmentScore> getKpiScores() {
        return kpiScores;
    }
    
    public String getOverallComments() {
        return overallComments;
    }
    
    public BigDecimal getFinalScore() {
        return finalScore;
    }
    
    @Override
    public String toString() {
        return "ManagerAssessmentSubmitted{" +
                "cycleId=" + cycleId +
                ", participantId=" + participantId +
                ", employeeId=" + employeeId +
                ", finalScore=" + finalScore +
                ", submittedDate=" + submittedDate +
                '}';
    }
}
