package com.company.dataanalytics.domain.valueobjects;

import com.company.dataanalytics.domain.shared.ValueObject;

import java.util.Objects;

/**
 * Value object representing a role name
 */
public class RoleName implements ValueObject {
    
    public static final RoleName ADMIN = new RoleName("ADMIN");
    public static final RoleName HR = new RoleName("HR");
    public static final RoleName SUPERVISOR = new RoleName("SUPERVISOR");
    public static final RoleName EMPLOYEE = new RoleName("EMPLOYEE");
    
    private final String value;
    
    private RoleName(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Role name cannot be null or empty");
        }
        this.value = value.trim().toUpperCase();
    }
    
    public static RoleName of(String value) {
        return new RoleName(value);
    }
    
    public String getValue() {
        return value;
    }
    
    public boolean isAdmin() {
        return ADMIN.equals(this);
    }
    
    public boolean isHR() {
        return HR.equals(this);
    }
    
    public boolean isSupervisor() {
        return SUPERVISOR.equals(this);
    }
    
    public boolean isEmployee() {
        return EMPLOYEE.equals(this);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        RoleName roleName = (RoleName) obj;
        return Objects.equals(value, roleName.value);
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