package com.company.performance.domain.event;

import com.company.performance.domain.aggregate.reviewcycle.AssessmentScore;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Domain event published when an employee submits a self-assessment
 */
public class SelfAssessmentSubmitted extends DomainEvent {
    
    private final UUID cycleId;
    private final UUID participantId;
    private final UUID employeeId;
    private final UUID supervisorId;
    private final Instant submittedDate;
    private final List<AssessmentScore> kpiScores;
    private final String comments;
    private final String extraMileEfforts;
    
    public SelfAssessmentSubmitted(
            UUID cycleId,
            UUID participantId,
            UUID employeeId,
            UUID supervisorId,
            Instant submittedDate,
            List<AssessmentScore> kpiScores,
            String comments,
            String extraMileEfforts) {
        
        super(cycleId, "ReviewCycle");
        this.cycleId = cycleId;
        this.participantId = participantId;
        this.employeeId = employeeId;
        this.supervisorId = supervisorId;
        this.submittedDate = submittedDate;
        this.kpiScores = kpiScores;
        this.comments = comments;
        this.extraMileEfforts = extraMileEfforts;
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
    
    public String getComments() {
        return comments;
    }
    
    public String getExtraMileEfforts() {
        return extraMileEfforts;
    }
    
    @Override
    public String toString() {
        return "SelfAssessmentSubmitted{" +
                "cycleId=" + cycleId +
                ", participantId=" + participantId +
                ", employeeId=" + employeeId +
                ", submittedDate=" + submittedDate +
                '}';
    }
}
