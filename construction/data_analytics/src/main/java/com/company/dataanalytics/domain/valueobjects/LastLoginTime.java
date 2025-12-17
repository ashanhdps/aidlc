package com.company.dataanalytics.domain.valueobjects;

import com.company.dataanalytics.domain.shared.ValueObject;

import java.time.Instant;
import java.util.Objects;

/**
 * Value object representing the last login time of a user
 */
public class LastLoginTime implements ValueObject {
    
    private final Instant value;
    
    private LastLoginTime(Instant value) {
        this.value = value; // Can be null for users who never logged in
    }
    
    public static LastLoginTime of(Instant value) {
        return new LastLoginTime(value);
    }
    
    public static LastLoginTime now() {
        return new LastLoginTime(Instant.now());
    }
    
    public static LastLoginTime never() {
        return new LastLoginTime(null);
    }
    
    public Instant getValue() {
        return value;
    }
    
    public boolean hasNeverLoggedIn() {
        return value == null;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        LastLoginTime that = (LastLoginTime) obj;
        return Objects.equals(value, that.value);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
    
    @Override
    public String toString() {
        return value != null ? value.toString() : "Never";
    }
}