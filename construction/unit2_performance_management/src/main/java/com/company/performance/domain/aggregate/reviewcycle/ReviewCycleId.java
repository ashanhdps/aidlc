package com.company.performance.domain.aggregate.reviewcycle;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object representing the unique identity of a ReviewCycle aggregate
 */
public class ReviewCycleId {
    
    private final UUID value;
    
    public ReviewCycleId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("ReviewCycleId cannot be null");
        }
        this.value = value;
    }
    
    public static ReviewCycleId generate() {
        return new ReviewCycleId(UUID.randomUUID());
    }
    
    public static ReviewCycleId of(String value) {
        return new ReviewCycleId(UUID.fromString(value));
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReviewCycleId that = (ReviewCycleId) o;
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
