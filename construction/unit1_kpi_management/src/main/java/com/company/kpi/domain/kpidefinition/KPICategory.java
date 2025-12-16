package com.company.kpi.domain.kpidefinition;

/**
 * Enumeration of KPI categories
 */
public enum KPICategory {
    SALES("Sales Performance"),
    MARKETING("Marketing Effectiveness"),
    OPERATIONS("Operational Efficiency"),
    FINANCE("Financial Performance"),
    CUSTOMER_SERVICE("Customer Service Quality"),
    HUMAN_RESOURCES("HR Metrics"),
    QUALITY("Quality Assurance"),
    PRODUCTIVITY("Productivity Metrics"),
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