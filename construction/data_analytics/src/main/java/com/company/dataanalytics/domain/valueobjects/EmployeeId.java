package com.company.dataanalytics.domain.valueobjects;

import com.company.dataanalytics.domain.shared.ValueObject;

import java.util.Objects;
import java.util.UUID;

/**
 * Value object representing a unique employee identifier
 */
public class EmployeeId implements ValueObject {
    
    private final UUID value;
    
    private EmployeeId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("EmployeeId cannot be null");
        }
        this.value = value;
    }
    
    public static EmployeeId of(UUID value) {
        return new EmployeeId(value);
    }
    
    public static EmployeeId of(String value) {
        try {
            return new EmployeeId(UUID.fromString(value));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid EmployeeId format: " + value, e);
        }
    }
    
    public static EmployeeId generate() {
        return new EmployeeId(UUID.randomUUID());
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        EmployeeId that = (EmployeeId) obj;
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