package com.company.dataanalytics.api.dto.response;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Response DTO for performance data
 */
public class PerformanceDataResponse {
    
    private String id;
    private String employeeId;
    private String kpiId;
    private Double value;
    private String unit;
    private LocalDate dataDate;
    private Instant createdDate;
    
    // Constructors
    public PerformanceDataResponse() {}
    
    public PerformanceDataResponse(String id, String employeeId, String kpiId, Double value, 
                                 String unit, LocalDate dataDate, Instant createdDate) {
        this.id = id;
        this.employeeId = employeeId;
        this.kpiId = kpiId;
        this.value = value;
        this.unit = unit;
        this.dataDate = dataDate;
        this.createdDate = createdDate;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
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
    
    public Instant getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }
}