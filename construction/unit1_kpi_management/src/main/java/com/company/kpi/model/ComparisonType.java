package com.company.kpi.model;

/**
 * Enumeration of comparison types for KPI targets
 */
public enum ComparisonType {
    GREATER_THAN("Greater Than"),
    LESS_THAN("Less Than"),
    EQUALS("Equals"),
    GREATER_THAN_OR_EQUAL("Greater Than or Equal"),
    LESS_THAN_OR_EQUAL("Less Than or Equal"),
    RANGE("Within Range");
    
    private final String description;
    
    ComparisonType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}