package com.company.kpi.model;

/**
 * Types of change requests that require approval
 */
public enum ChangeRequestType {
    KPI_CREATE("Create new KPI Definition"),
    KPI_UPDATE("Update existing KPI Definition"),
    KPI_DELETE("Delete KPI Definition"),
    ASSIGNMENT_CREATE("Create new KPI Assignment"),
    ASSIGNMENT_MODIFY("Modify existing KPI Assignment"),
    ASSIGNMENT_REMOVE("Remove KPI Assignment"),
    HIERARCHY_CHANGE("Change KPI Hierarchy"),
    BULK_ASSIGNMENT("Bulk KPI Assignment changes");
    
    private final String description;
    
    ChangeRequestType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}