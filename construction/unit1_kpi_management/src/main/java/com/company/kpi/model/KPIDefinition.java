package com.company.kpi.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * KPI Definition domain model
 */
@DynamoDbBean
public class KPIDefinition {
    
    private String id;
    private String name;
    private String description;
    private KPICategory category;
    private MeasurementType measurementType;
    private BigDecimal defaultTargetValue;
    private String defaultTargetUnit;
    private ComparisonType defaultTargetComparisonType;
    private BigDecimal defaultWeightPercentage;
    private boolean defaultWeightIsFlexible;
    private String measurementFrequencyType;
    private int measurementFrequencyValue;
    private String dataSource;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isActive;
    
    // Constructors
    public KPIDefinition() {}
    
    public KPIDefinition(String name, String description, KPICategory category, 
                        MeasurementType measurementType, String createdBy) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.measurementType = measurementType;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
    }
    
    // Getters and Setters
    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
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
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    
    // Department field for filtering (can be derived from other fields or set separately)
    public String getDepartment() { 
        // For now, return a default or derive from category
        return category != null ? category.toString() : "GENERAL"; 
    }
}