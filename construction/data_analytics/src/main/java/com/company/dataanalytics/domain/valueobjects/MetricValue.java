package com.company.dataanalytics.domain.valueobjects;

import com.company.dataanalytics.domain.shared.ValueObject;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Value object representing a performance metric value
 */
public class MetricValue implements ValueObject {
    
    private final BigDecimal value;
    private final String unit;
    
    private MetricValue(BigDecimal value, String unit) {
        if (value == null) {
            throw new IllegalArgumentException("Metric value cannot be null");
        }
        this.value = value.setScale(2, RoundingMode.HALF_UP);
        this.unit = unit != null ? unit.trim() : "";
    }
    
    public static MetricValue of(BigDecimal value, String unit) {
        return new MetricValue(value, unit);
    }
    
    public static MetricValue of(double value, String unit) {
        return new MetricValue(BigDecimal.valueOf(value), unit);
    }
    
    public static MetricValue of(BigDecimal value) {
        return new MetricValue(value, null);
    }
    
    public static MetricValue of(double value) {
        return new MetricValue(BigDecimal.valueOf(value), null);
    }
    
    public BigDecimal getValue() {
        return value;
    }
    
    public String getUnit() {
        return unit;
    }
    
    public double getDoubleValue() {
        return value.doubleValue();
    }
    
    public boolean hasUnit() {
        return unit != null && !unit.isEmpty();
    }
    
    public MetricValue add(MetricValue other) {
        if (!Objects.equals(this.unit, other.unit)) {
            throw new IllegalArgumentException("Cannot add metric values with different units");
        }
        return new MetricValue(this.value.add(other.value), this.unit);
    }
    
    public MetricValue subtract(MetricValue other) {
        if (!Objects.equals(this.unit, other.unit)) {
            throw new IllegalArgumentException("Cannot subtract metric values with different units");
        }
        return new MetricValue(this.value.subtract(other.value), this.unit);
    }
    
    public MetricValue multiply(BigDecimal multiplier) {
        return new MetricValue(this.value.multiply(multiplier), this.unit);
    }
    
    public MetricValue divide(BigDecimal divisor) {
        if (divisor.compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException("Cannot divide by zero");
        }
        return new MetricValue(this.value.divide(divisor, 2, RoundingMode.HALF_UP), this.unit);
    }
    
    public boolean isPositive() {
        return value.compareTo(BigDecimal.ZERO) > 0;
    }
    
    public boolean isNegative() {
        return value.compareTo(BigDecimal.ZERO) < 0;
    }
    
    public boolean isZero() {
        return value.compareTo(BigDecimal.ZERO) == 0;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        MetricValue that = (MetricValue) obj;
        return Objects.equals(value, that.value) && Objects.equals(unit, that.unit);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value, unit);
    }
    
    @Override
    public String toString() {
        return hasUnit() ? String.format("%s %s", value, unit) : value.toString();
    }
}