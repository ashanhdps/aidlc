package com.company.kpi.infrastructure.repositories.entities;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DynamoDB entity for KPI Definition aggregate
 */
@DynamoDbBean
public class KPIDefinitionEntity {
    
    private String id;
    private String name;
    private String description;
    private String category;
    private String measurementType;
    private BigDecimal defaultTargetValue;
    private String defaultTargetUnit;
    private String defaultTargetComparisonType;
    private BigDecimal defaultWeightPercentage;
    private boolean defaultWeightIsFlexible;
    private String measurementFrequencyType;
    private int measurementFrequencyValue;
    private String dataSource;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isActive;
    
    public KPIDefinitionEntity() {
        // Default constructor required by DynamoDB
    }
    
    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getMeasurementType() {
        return measurementType;
    }
    
    public void setMeasurementType(String measurementType) {
        this.measurementType = measurementType;
    }
    
    public BigDecimal getDefaultTargetValue() {
        return defaultTargetValue;
    }
    
    public void setDefaultTargetValue(BigDecimal defaultTargetValue) {
        this.defaultTargetValue = defaultTargetValue;
    }
    
    public String getDefaultTargetUnit() {
        return defaultTargetUnit;
    }
    
    public void setDefaultTargetUnit(String defaultTargetUnit) {
        this.defaultTargetUnit = defaultTargetUnit;
    }
    
    public String getDefaultTargetComparisonType() {
        return defaultTargetComparisonType;
    }
    
    public void setDefaultTargetComparisonType(String defaultTargetComparisonType) {
        this.defaultTargetComparisonType = defaultTargetComparisonType;
    }
    
    public BigDecimal getDefaultWeightPercentage() {
        return defaultWeightPercentage;
    }
    
    public void setDefaultWeightPercentage(BigDecimal defaultWeightPercentage) {
        this.defaultWeightPercentage = defaultWeightPercentage;
    }
    
    public boolean isDefaultWeightIsFlexible() {
        return defaultWeightIsFlexible;
    }
    
    public void setDefaultWeightIsFlexible(boolean defaultWeightIsFlexible) {
        this.defaultWeightIsFlexible = defaultWeightIsFlexible;
    }
    
    public String getMeasurementFrequencyType() {
        return measurementFrequencyType;
    }
    
    public void setMeasurementFrequencyType(String measurementFrequencyType) {
        this.measurementFrequencyType = measurementFrequencyType;
    }
    
    public int getMeasurementFrequencyValue() {
        return measurementFrequencyValue;
    }
    
    public void setMeasurementFrequencyValue(int measurementFrequencyValue) {
        this.measurementFrequencyValue = measurementFrequencyValue;
    }
    
    public String getDataSource() {
        return dataSource;
    }
    
    public void setDataSource(String dataSource) {
        this.dataSource = dataSource;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
}