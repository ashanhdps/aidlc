package com.company.performance.domain.aggregate.feedback;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object representing the unique identity of a FeedbackRecord aggregate
 */
public class FeedbackId {
    
    private final UUID value;
    
    public FeedbackId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("FeedbackId cannot be null");
        }
        this.value = value;
    }
    
    public static FeedbackId generate() {
        return new FeedbackId(UUID.randomUUID());
    }
    
    public static FeedbackId of(String value) {
        return new FeedbackId(UUID.fromString(value));
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FeedbackId that = (FeedbackId) o;
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
