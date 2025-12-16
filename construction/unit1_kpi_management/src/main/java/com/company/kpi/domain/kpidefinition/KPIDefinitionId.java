package com.company.kpi.domain.kpidefinition;

import com.company.kpi.domain.shared.ValueObject;

import java.util.Objects;
import java.util.UUID;

/**
 * Value object representing a KPI Definition identifier
 */
public class KPIDefinitionId implements ValueObject {
    
    private final String value;
    
    private KPIDefinitionId(String value) {
        this.value = Objects.requireNonNull(value, "KPI Definition ID cannot be null");
        validate();
    }
    
    public static KPIDefinitionId generate() {
        return new KPIDefinitionId(UUID.randomUUID().toString());
    }
    
    public static KPIDefinitionId of(String value) {
        return new KPIDefinitionId(value);
    }
    
    public String getValue() {
        return value;
    }
    
    @Override
    public void validate() {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("KPI Definition ID cannot be null or empty");
        }
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        KPIDefinitionId that = (KPIDefinitionId) obj;
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