package com.company.kpi.domain.kpidefinition;

import com.company.kpi.domain.shared.ValueObject;

import java.util.Objects;

/**
 * Value object representing KPI measurement frequency
 */
public class Frequency implements ValueObject {
    
    private final IntervalType intervalType;
    private final int intervalValue;
    
    public Frequency(IntervalType intervalType, int intervalValue) {
        this.intervalType = Objects.requireNonNull(intervalType, "Interval type cannot be null");
        this.intervalValue = intervalValue;
        validate();
    }
    
    public static Frequency daily() {
        return new Frequency(IntervalType.DAILY, 1);
    }
    
    public static Frequency weekly() {
        return new Frequency(IntervalType.WEEKLY, 1);
    }
    
    public static Frequency monthly() {
        return new Frequency(IntervalType.MONTHLY, 1);
    }
    
    public static Frequency quarterly() {
        return new Frequency(IntervalType.QUARTERLY, 1);
    }
    
    public IntervalType getIntervalType() {
        return intervalType;
    }
    
    public int getIntervalValue() {
        return intervalValue;
    }
    
    @Override
    public void validate() {
        if (intervalValue <= 0) {
            throw new IllegalArgumentException("Interval value must be positive");
        }
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Frequency frequency = (Frequency) obj;
        return intervalValue == frequency.intervalValue &&
               intervalType == frequency.intervalType;
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(intervalType, intervalValue);
    }
    
    @Override
    public String toString() {
        return String.format("Every %d %s", intervalValue, intervalType.name().toLowerCase());
    }
    
    public enum IntervalType {
        DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
    }
}