package com.company.kpi.model;

/**
 * Enumeration of KPI measurement types
 */
public enum MeasurementType {
    NUMERICAL("Numerical Value"),
    PERCENTAGE("Percentage"),
    BOOLEAN("Yes/No"),
    CURRENCY("Currency Amount"),
    COUNT("Count/Quantity"),
    RATING("Rating Scale"),
    RATIO("Ratio/Proportion"), // For ratios like ROI
    SCORE("Score/Rating"); // For scoring systems
    
    private final String description;
    
    MeasurementType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}