package com.company.kpi.model.dto;

import com.company.kpi.model.ComparisonType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for creating a new KPI Assignment
 */
public class CreateKPIAssignmentRequest {
    
    @NotBlank(message = "Employee ID is required")
    private String employeeId;
    
    @NotBlank(message = "KPI Definition ID is required")
    private String kpiDefinitionId;
    
    @Positive(message = "Custom target value must be positive")
    private BigDecimal customTargetValue;
    
    private String customTargetUnit;
    private ComparisonType customTargetComparisonType;
    
    @Positive(message = "Custom weight percentage must be positive")
    private BigDecimal customWeightPercentage;
    
    private boolean customWeightIsFlexible = true;
    
    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;
    
    private LocalDate endDate;
    
    // Constructors
    public CreateKPIAssignmentRequest() {}
    
    // Getters and Setters
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    
    public String getKpiDefinitionId() { return kpiDefinitionId; }
    public void setKpiDefinitionId(String kpiDefinitionId) { this.kpiDefinitionId = kpiDefinitionId; }
    
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
}