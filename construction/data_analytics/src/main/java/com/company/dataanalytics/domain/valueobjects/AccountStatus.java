package com.company.dataanalytics.domain.valueobjects;

import com.company.dataanalytics.domain.shared.ValueObject;

import java.util.Objects;

/**
 * Value object representing the status of a user account
 */
public class AccountStatus implements ValueObject {
    
    public static final AccountStatus ACTIVE = new AccountStatus("ACTIVE");
    public static final AccountStatus INACTIVE = new AccountStatus("INACTIVE");
    public static final AccountStatus SUSPENDED = new AccountStatus("SUSPENDED");
    public static final AccountStatus PENDING = new AccountStatus("PENDING");
    
    private final String value;
    
    private AccountStatus(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Account status cannot be null or empty");
        }
        this.value = value.trim().toUpperCase();
    }
    
    public static AccountStatus of(String value) {
        return new AccountStatus(value);
    }
    
    public String getValue() {
        return value;
    }
    
    public boolean isActive() {
        return ACTIVE.equals(this);
    }
    
    public boolean isInactive() {
        return INACTIVE.equals(this);
    }
    
    public boolean isSuspended() {
        return SUSPENDED.equals(this);
    }
    
    public boolean isPending() {
        return PENDING.equals(this);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        AccountStatus that = (AccountStatus) obj;
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