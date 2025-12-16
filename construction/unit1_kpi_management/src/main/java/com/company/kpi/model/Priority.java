package com.company.kpi.model;

/**
 * Priority levels for approval requests
 */
public enum Priority {
    LOW("Low priority"),
    MEDIUM("Medium priority"),
    HIGH("High priority"),
    CRITICAL("Critical priority"),
    EMERGENCY("Emergency priority");
    
    private final String description;
    
    Priority(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}