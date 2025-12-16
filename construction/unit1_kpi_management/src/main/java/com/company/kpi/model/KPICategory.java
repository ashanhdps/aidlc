package com.company.kpi.model;

/**
 * Enumeration of KPI categories
 */
public enum KPICategory {
    SALES("Sales Performance"),
    MARKETING("Marketing Effectiveness"),
    OPERATIONS("Operational Efficiency"),
    OPERATIONAL("Operational Efficiency"), // Alias for OPERATIONS
    FINANCE("Financial Performance"),
    FINANCIAL("Financial Performance"), // Alias for FINANCE
    CUSTOMER_SERVICE("Customer Service Quality"),
    CUSTOMER("Customer Metrics"), // Customer-related KPIs
    HUMAN_RESOURCES("HR Metrics"),
    QUALITY("Quality Assurance"),
    PRODUCTIVITY("Productivity Metrics"),
    PERFORMANCE("Performance Metrics"), // General performance
    INNOVATION("Innovation & Development"),
    COMPLIANCE("Compliance & Risk");
    
    private final String description;
    
    KPICategory(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}