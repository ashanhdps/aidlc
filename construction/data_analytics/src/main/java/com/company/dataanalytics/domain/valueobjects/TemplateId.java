package com.company.dataanalytics.domain.valueobjects;

import com.company.dataanalytics.domain.shared.ValueObject;

import java.util.Objects;
import java.util.UUID;

/**
 * Value object representing a unique template identifier
 */
public class TemplateId implements ValueObject {
    
    private final UUID value;
    
    private TemplateId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("TemplateId cannot be null");
        }
        this.value = value;
    }
    
    public static TemplateId of(UUID value) {
        return new TemplateId(value);
    }
    
    public static TemplateId of(String value) {
        try {
            return new TemplateId(UUID.fromString(value));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid TemplateId format: " + value, e);
        }
    }
    
    public static TemplateId generate() {
        return new TemplateId(UUID.randomUUID());
    }
    
    public UUID getValue() {
        return value;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        TemplateId that = (TemplateId) obj;
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