package com.company.dataanalytics.domain.valueobjects;

import com.company.dataanalytics.domain.shared.ValueObject;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Objects;

/**
 * Value object representing when performance data was recorded
 */
public class DataTimestamp implements ValueObject {
    
    private final Instant value;
    
    private DataTimestamp(Instant value) {
        if (value == null) {
            throw new IllegalArgumentException("Data timestamp cannot be null");
        }
        this.value = value;
    }
    
    public static DataTimestamp of(Instant value) {
        return new DataTimestamp(value);
    }
    
    public static DataTimestamp of(LocalDate date) {
        return new DataTimestamp(date.atStartOfDay().toInstant(ZoneOffset.UTC));
    }
    
    public static DataTimestamp now() {
        return new DataTimestamp(Instant.now());
    }
    
    public Instant getValue() {
        return value;
    }
    
    public LocalDate getDate() {
        return value.atOffset(ZoneOffset.UTC).toLocalDate();
    }
    
    public boolean isBefore(DataTimestamp other) {
        return value.isBefore(other.value);
    }
    
    public boolean isAfter(DataTimestamp other) {
        return value.isAfter(other.value);
    }
    
    public boolean isSameDay(DataTimestamp other) {
        return getDate().equals(other.getDate());
    }
    
    public boolean isToday() {
        return getDate().equals(LocalDate.now());
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        DataTimestamp that = (DataTimestamp) obj;
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