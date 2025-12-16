package com.company.kpi.domain.kpidefinition;

import com.company.kpi.domain.shared.ValueObject;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Value object representing a KPI target value
 */
public class Target implements ValueObject {
    
    private final BigDecimal value;
    private final String unit;
    private final ComparisonType comparisonType;
    
    public Target(BigDecimal value, String unit, ComparisonType comparisonType) {
        this.value = Objects.requireNonNull(value, "Target value cannot be null");
        this.unit = Objects.requireNonNull(unit, "Target unit cannot be null");
        this.comparisonType = Objects.requireNonNull(comparisonType, "Comparison type cannot be null");
        validate();
    }
    
    public BigDecimal getValue() {
        return value;
    }
    
    public String getUnit() {
        return unit;
    }
    
    public ComparisonType getComparisonType() {
        return comparisonType;
    }
    
    @Override
    public void validate() {
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Target value cannot be negative");
        }
        if (unit.trim().isEmpty()) {
            throw new IllegalArgumentException("Target unit cannot be empty");
        }
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Target target = (Target) obj;
        return Objects.equals(value, target.value) &&
               Objects.equals(unit, target.unit) &&
               comparisonType == target.comparisonType;
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value, unit, comparisonType);
    }
    
    @Override
    public String toString() {
        return String.format("%s %s (%s)", value, unit, comparisonType);
    }
}