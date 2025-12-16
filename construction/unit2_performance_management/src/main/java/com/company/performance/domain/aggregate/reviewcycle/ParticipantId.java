package com.company.performance.domain.aggregate.reviewcycle;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object representing the unique identity of a ReviewParticipant entity
 */
public class ParticipantId {
    
    private final UUID value;
    
    public ParticipantId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("ParticipantId cannot be null");
        }
        this.value = value;
    }
    
    public static ParticipantId generate() {
        return new ParticipantId(UUID.randomUUID());
    }
    
    public static ParticipantId of(String value) {
        return new ParticipantId(UUID.fromString(value));
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ParticipantId that = (ParticipantId) o;
        return Objects.equals(value, that.value);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
    
    @Override
    public String toString() {
        return value.toString();
    }
}
