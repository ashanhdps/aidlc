package com.company.performance.domain.event;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Domain event published when a review cycle is completed
 */
public class ReviewCycleCompleted extends DomainEvent {
    
    private final UUID cycleId;
    private final String cycleName;
    private final Instant completedDate;
    private final int participantCount;
    private final BigDecimal averageScore;
    
    public ReviewCycleCompleted(
            UUID cycleId,
            String cycleName,
            Instant completedDate,
            int participantCount,
            BigDecimal averageScore) {
        
        super(cycleId, "ReviewCycle");
        this.cycleId = cycleId;
        this.cycleName = cycleName;
        this.completedDate = completedDate;
        this.participantCount = participantCount;
        this.averageScore = averageScore;
    }
    
    public UUID getCycleId() {
        return cycleId;
    }
    
    public String getCycleName() {
        return cycleName;
    }
    
    public Instant getCompletedDate() {
        return completedDate;
    }
    
    public int getParticipantCount() {
        return participantCount;
    }
    
    public BigDecimal getAverageScore() {
        return averageScore;
    }
    
    @Override
    public String toString() {
        return "ReviewCycleCompleted{" +
                "cycleId=" + cycleId +
                ", cycleName='" + cycleName + '\'' +
                ", participantCount=" + participantCount +
                ", averageScore=" + averageScore +
                '}';
    }
}
