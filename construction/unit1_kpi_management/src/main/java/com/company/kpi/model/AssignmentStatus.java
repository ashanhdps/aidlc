package com.company.kpi.model;

/**
 * Enumeration of KPI assignment statuses
 */
public enum AssignmentStatus {
    DRAFT("Draft - Not yet active"),
    ACTIVE("Active assignment"),
    SUSPENDED("Temporarily suspended"),
    EXPIRED("Assignment has expired"),
    PENDING_APPROVAL("Waiting for approval");
    
    private final String description;
    
    AssignmentStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}