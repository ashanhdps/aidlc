package com.company.performance.domain.aggregate.reviewcycle;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object representing the unique identity of an Assessment entity
 */
public class AssessmentId {
    
    private final UUID value;
    
    public AssessmentId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("AssessmentId cannot be null");
        }
        this.value = value;
    }
    
    public static AssessmentId generate() {
        return new AssessmentId(UUID.randomUUID());
    }
    
    public static AssessmentId of(String value) {
        return new AssessmentId(UUID.fromString(value));
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AssessmentId that = (AssessmentId) o;
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
