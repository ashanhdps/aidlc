package com.company.dataanalytics.domain.valueobjects;

import com.company.dataanalytics.domain.shared.ValueObject;

import java.util.Objects;
import java.util.UUID;

/**
 * Value object representing a unique KPI identifier
 */
public class KPIId implements ValueObject {
    
    private final UUID value;
    
    private KPIId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("KPIId cannot be null");
        }
        this.value = value;
    }
    
    public static KPIId of(UUID value) {
        return new KPIId(value);
    }
    
    public static KPIId of(String value) {
        try {
            return new KPIId(UUID.fromString(value));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid KPIId format: " + value, e);
        }
    }
    
    public static KPIId generate() {
        return new KPIId(UUID.randomUUID());
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        KPIId kpiId = (KPIId) obj;
        return Objects.equals(value, kpiId.value);
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