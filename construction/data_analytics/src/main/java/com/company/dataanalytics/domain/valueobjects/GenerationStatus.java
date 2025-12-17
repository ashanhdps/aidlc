package com.company.dataanalytics.domain.valueobjects;

import com.company.dataanalytics.domain.shared.ValueObject;

import java.util.Objects;

/**
 * Value object representing the status of report generation
 */
public class GenerationStatus implements ValueObject {
    
    public static final GenerationStatus PENDING = new GenerationStatus("PENDING");
    public static final GenerationStatus IN_PROGRESS = new GenerationStatus("IN_PROGRESS");
    public static final GenerationStatus COMPLETED = new GenerationStatus("COMPLETED");
    public static final GenerationStatus FAILED = new GenerationStatus("FAILED");
    public static final GenerationStatus CANCELLED = new GenerationStatus("CANCELLED");
    
    private final String value;
    
    private GenerationStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Generation status cannot be null or empty");
        }
        this.value = value.trim().toUpperCase();
    }
    
    public static GenerationStatus of(String value) {
        return new GenerationStatus(value);
    }
    
    public String getValue() {
        return value;
    }
    
    public boolean isPending() {
        return PENDING.equals(this);
    }
    
    public boolean isInProgress() {
        return IN_PROGRESS.equals(this);
    }
    
    public boolean isCompleted() {
        return COMPLETED.equals(this);
    }
    
    public boolean isFailed() {
        return FAILED.equals(this);
    }
    
    public boolean isCancelled() {
        return CANCELLED.equals(this);
    }
    
    public boolean isFinished() {
        return isCompleted() || isFailed() || isCancelled();
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        GenerationStatus that = (GenerationStatus) obj;
        return Objects.equals(value, that.value);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
    
    @Override
    public String toString() {
        return value;
    }
}