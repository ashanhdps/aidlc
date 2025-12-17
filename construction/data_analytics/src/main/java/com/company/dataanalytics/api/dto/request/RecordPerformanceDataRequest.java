package com.company.dataanalytics.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Request DTO for recording performance data
 */
public class RecordPerformanceDataRequest {
    
    @NotBlank(message = "Employee ID is required")
    private String employeeId;
    
    @NotBlank(message = "KPI ID is required")
    private String kpiId;
    
    @NotNull(message = "Value is required")
    private Double value;
    
    private String unit;
    
    private LocalDate dataDate;
    
    // Constructors
    public RecordPerformanceDataRequest() {}
    
    public RecordPerformanceDataRequest(String employeeId, String kpiId, Double value, String unit, LocalDate dataDate) {
        this.employeeId = employeeId;
        this.kpiId = kpiId;
        this.value = value;
        this.unit = unit;
        this.dataDate = dataDate;
    }
    
    // Getters and Setters
    public String getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }
    
    public String getKpiId() {
        return kpiId;
    }
    
    public void setKpiId(String kpiId) {
        this.kpiId = kpiId;
    }
    
    public Double getValue() {
        return value;
    }
    
    public void setValue(Double value) {
        this.value = value;
    }
    
    public String getUnit() {
        return unit;
    }
    
    public void setUnit(String unit) {
        this.unit = unit;
    }
    
    public LocalDate getDataDate() {
        return dataDate;
    }
    
    public void setDataDate(LocalDate dataDate) {
        this.dataDate = dataDate;
    }
}