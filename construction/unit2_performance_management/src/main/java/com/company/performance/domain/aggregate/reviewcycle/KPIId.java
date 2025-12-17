package com.company.performance.domain.aggregate.reviewcycle;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object representing the unique identity of a KPI
 */
public class KPIId {
    
    private final UUID value;
    
    public KPIId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("KPIId cannot be null");
        }
        this.value = value;
    }
    
    public static KPIId generate() {
        return new KPIId(UUID.randomUUID());
    }
    
    public static KPIId of(String value) {
        return new KPIId(UUID.fromString(value));
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        KPIId that = (KPIId) o;
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
