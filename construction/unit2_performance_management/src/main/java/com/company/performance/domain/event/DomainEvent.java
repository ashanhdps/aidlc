package com.company.performance.domain.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Base class for all domain events
 */
public abstract class DomainEvent {
    
    private final UUID eventId;
    private final Instant occurredAt;
    private final String eventType;
    private final UUID aggregateId;
    private final String aggregateType;
    private final int version;
    
    protected DomainEvent(UUID aggregateId, String aggregateType) {
        this.eventId = UUID.randomUUID();
        this.occurredAt = Instant.now();
        this.eventType = this.getClass().getSimpleName();
        this.aggregateId = aggregateId;
        this.aggregateType = aggregateType;
        this.version = 1;
    }
    
    public UUID getEventId() {
        return eventId;
    }
    
    public Instant getOccurredAt() {
        return occurredAt;
    }
    
    public String getEventType() {
        return eventType;
    }
    
    public UUID getAggregateId() {
        return aggregateId;
    }
    
    public String getAggregateType() {
        return aggregateType;
    }
    
    public int getVersion() {
        return version;
    }
}
