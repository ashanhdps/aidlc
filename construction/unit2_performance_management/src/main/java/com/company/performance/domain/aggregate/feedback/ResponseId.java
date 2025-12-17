package com.company.performance.domain.aggregate.feedback;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object representing the unique identity of a FeedbackResponse entity
 */
public class ResponseId {
    
    private final UUID value;
    
    public ResponseId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("ResponseId cannot be null");
        }
        this.value = value;
    }
    
    public static ResponseId generate() {
        return new ResponseId(UUID.randomUUID());
    }
    
    public static ResponseId of(String value) {
        return new ResponseId(UUID.fromString(value));
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ResponseId that = (ResponseId) o;
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
