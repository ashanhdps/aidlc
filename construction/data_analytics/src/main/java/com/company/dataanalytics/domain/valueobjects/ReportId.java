package com.company.dataanalytics.domain.valueobjects;

import com.company.dataanalytics.domain.shared.ValueObject;

import java.util.Objects;
import java.util.UUID;

/**
 * Value object representing a unique report identifier
 */
public class ReportId implements ValueObject {
    
    private final UUID value;
    
    private ReportId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("ReportId cannot be null");
        }
        this.value = value;
    }
    
    public static ReportId of(UUID value) {
        return new ReportId(value);
    }
    
    public static ReportId of(String value) {
        try {
            return new ReportId(UUID.fromString(value));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid ReportId format: " + value, e);
        }
    }
    
    public static ReportId generate() {
        return new ReportId(UUID.randomUUID());
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        ReportId reportId = (ReportId) obj;
        return Objects.equals(value, reportId.value);
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