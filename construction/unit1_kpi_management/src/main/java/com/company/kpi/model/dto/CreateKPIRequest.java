package com.company.kpi.model.dto;

import com.company.kpi.model.ComparisonType;
import com.company.kpi.model.KPICategory;
import com.company.kpi.model.MeasurementType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * DTO for creating a new KPI Definition
 */
public class CreateKPIRequest {
    
    @NotBlank(message = "KPI name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "KPI category is required")
    private KPICategory category;
    
    @NotNull(message = "Measurement type is required")
    private MeasurementType measurementType;
    
    @Positive(message = "Default target value must be positive")
    private BigDecimal defaultTargetValue;
    
    private String defaultTargetUnit;
    private ComparisonType defaultTargetComparisonType;
    
    @Positive(message = "Default weight percentage must be positive")
    private BigDecimal defaultWeightPercentage;
    
    private boolean defaultWeightIsFlexible = true;
    private String measurementFrequencyType = "MONTHLY";
    private int measurementFrequencyValue = 1;
    private String dataSource;
    
    // Constructors
    public CreateKPIRequest() {}
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public KPICategory getCategory() { return category; }
    public void setCategory(KPICategory category) { this.category = category; }
    
    public MeasurementType getMeasurementType() { return measurementType; }
    public void setMeasurementType(MeasurementType measurementType) { this.measurementType = measurementType; }
    
    public BigDecimal getDefaultTargetValue() { return defaultTargetValue; }
    public void setDefaultTargetValue(BigDecimal defaultTargetValue) { this.defaultTargetValue = defaultTargetValue; }
    
    public String getDefaultTargetUnit() { return defaultTargetUnit; }
    public void setDefaultTargetUnit(String defaultTargetUnit) { this.defaultTargetUnit = defaultTargetUnit; }
    
    public ComparisonType getDefaultTargetComparisonType() { return defaultTargetComparisonType; }
    public void setDefaultTargetComparisonType(ComparisonType defaultTargetComparisonType) { 
        this.defaultTargetComparisonType = defaultTargetComparisonType; 
    }
    
    public BigDecimal getDefaultWeightPercentage() { return defaultWeightPercentage; }
    public void setDefaultWeightPercentage(BigDecimal defaultWeightPercentage) { 
        this.defaultWeightPercentage = defaultWeightPercentage; 
    }
    
    public boolean isDefaultWeightIsFlexible() { return defaultWeightIsFlexible; }
    public void setDefaultWeightIsFlexible(boolean defaultWeightIsFlexible) { 
        this.defaultWeightIsFlexible = defaultWeightIsFlexible; 
    }
    
    public String getMeasurementFrequencyType() { return measurementFrequencyType; }
    public void setMeasurementFrequencyType(String measurementFrequencyType) { 
        this.measurementFrequencyType = measurementFrequencyType; 
    }
    
    public int getMeasurementFrequencyValue() { return measurementFrequencyValue; }
    public void setMeasurementFrequencyValue(int measurementFrequencyValue) { 
        this.measurementFrequencyValue = measurementFrequencyValue; 
    }
    
    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }
}