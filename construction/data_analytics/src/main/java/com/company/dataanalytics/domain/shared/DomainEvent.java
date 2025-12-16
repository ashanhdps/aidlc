package com.company.dataanalytics.domain.shared;

import java.time.Instant;
import java.util.UUID;

/**
 * Base class for all domain events.
 * Domain events represent significant business occurrences.
 */
public abstract class DomainEvent {
    
    private final UUID eventId;
    private final Instant occurredOn;
    private final String eventType;
    
    protected DomainEvent() {
        this.eventId = UUID.randomUUID();
        this.occurredOn = Instant.now();
        this.eventType = this.getClass().getSimpleName();
    }
    
    public UUID getEventId() {
        return eventId;
    }
    
    public Instant getOccurredOn() {
        return occurredOn;
    }
    
    public String getEventType() {
        return eventType;
    }
    
    @Override
    public String toString() {
        return String.format("%s{eventId=%s, occurredOn=%s}", 
            eventType, eventId, occurredOn);
    }
}