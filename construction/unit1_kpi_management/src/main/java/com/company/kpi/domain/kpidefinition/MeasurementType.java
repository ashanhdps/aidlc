package com.company.kpi.domain.kpidefinition;

/**
 * Enumeration of KPI measurement types
 */
public enum MeasurementType {
    NUMERICAL("Numerical Value"),
    PERCENTAGE("Percentage"),
    BOOLEAN("Yes/No"),
    CURRENCY("Currency Amount"),
    COUNT("Count/Quantity"),
    RATING("Rating Scale");
    
    private final String description;
    
    MeasurementType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}