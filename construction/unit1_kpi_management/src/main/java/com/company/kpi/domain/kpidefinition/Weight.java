package com.company.kpi.domain.kpidefinition;

import com.company.kpi.domain.shared.ValueObject;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Value object representing a KPI weight percentage
 */
public class Weight implements ValueObject {
    
    private final BigDecimal percentage;
    private final boolean isFlexible;
    
    public Weight(BigDecimal percentage, boolean isFlexible) {
        this.percentage = Objects.requireNonNull(percentage, "Weight percentage cannot be null");
        this.isFlexible = isFlexible;
        validate();
    }
    
    public static Weight of(double percentage) {
        return new Weight(BigDecimal.valueOf(percentage), true);
    }
    
    public static Weight strict(double percentage) {
        return new Weight(BigDecimal.valueOf(percentage), false);
    }
    
    public BigDecimal getPercentage() {
        return percentage;
    }
    
    public boolean isFlexible() {
        return isFlexible;
    }
    
    @Override
    public void validate() {
        if (percentage.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Weight percentage cannot be negative");
        }
        if (percentage.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Weight percentage cannot exceed 100%");
        }
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Weight weight = (Weight) obj;
        return isFlexible == weight.isFlexible &&
               Objects.equals(percentage, weight.percentage);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(percentage, isFlexible);
    }
    
    @Override
    public String toString() {
        return String.format("%.2f%% (%s)", percentage, isFlexible ? "flexible" : "strict");
    }
}