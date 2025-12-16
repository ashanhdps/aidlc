package com.company.kpi.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * KPI Assignment to Employee model
 */
@DynamoDbBean
public class KPIAssignment {
    
    private String employeeId;
    private String kpiDefinitionId;
    private String assignmentId;
    private String supervisorId;
    private BigDecimal customTargetValue;
    private String customTargetUnit;
    private ComparisonType customTargetComparisonType;
    private BigDecimal customWeightPercentage;
    private boolean customWeightIsFlexible;
    private LocalDate effectiveDate;
    private LocalDate endDate;
    private String assignedBy;
    private AssignmentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public KPIAssignment() {}
    
    public KPIAssignment(String employeeId, String kpiDefinitionId, String assignedBy) {
        this.employeeId = employeeId;
        this.kpiDefinitionId = kpiDefinitionId;
        this.assignedBy = assignedBy;
        this.status = AssignmentStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.effectiveDate = LocalDate.now();
    }
    
    // Getters and Setters
    @DynamoDbPartitionKey
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    
    @DynamoDbSortKey
    public String getKpiDefinitionId() { return kpiDefinitionId; }
    public void setKpiDefinitionId(String kpiDefinitionId) { this.kpiDefinitionId = kpiDefinitionId; }
    
    public String getAssignmentId() { return assignmentId; }
    public void setAssignmentId(String assignmentId) { this.assignmentId = assignmentId; }
    
    public String getSupervisorId() { return supervisorId; }
    public void setSupervisorId(String supervisorId) { this.supervisorId = supervisorId; }
    
    public BigDecimal getCustomTargetValue() { return customTargetValue; }
    public void setCustomTargetValue(BigDecimal customTargetValue) { this.customTargetValue = customTargetValue; }
    
    public String getCustomTargetUnit() { return customTargetUnit; }
    public void setCustomTargetUnit(String customTargetUnit) { this.customTargetUnit = customTargetUnit; }
    
    public ComparisonType getCustomTargetComparisonType() { return customTargetComparisonType; }
    public void setCustomTargetComparisonType(ComparisonType customTargetComparisonType) { 
        this.customTargetComparisonType = customTargetComparisonType; 
    }
    
    public BigDecimal getCustomWeightPercentage() { return customWeightPercentage; }
    public void setCustomWeightPercentage(BigDecimal customWeightPercentage) { 
        this.customWeightPercentage = customWeightPercentage; 
    }
    
    public boolean isCustomWeightIsFlexible() { return customWeightIsFlexible; }
    public void setCustomWeightIsFlexible(boolean customWeightIsFlexible) { 
        this.customWeightIsFlexible = customWeightIsFlexible; 
    }
    
    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }
    
    public AssignmentStatus getStatus() { return status; }
    public void setStatus(AssignmentStatus status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}