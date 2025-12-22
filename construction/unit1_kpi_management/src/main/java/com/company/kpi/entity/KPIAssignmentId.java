package com.company.kpi.entity;

import java.io.Serializable;
import java.util.Objects;

/**
 * Composite ID for KPI Assignment Entity
 */
public class KPIAssignmentId implements Serializable {
    
    private String employeeId;
    private String kpiDefinitionId;
    
    // Constructors
    public KPIAssignmentId() {}
    
    public KPIAssignmentId(String employeeId, String kpiDefinitionId) {
        this.employeeId = employeeId;
        this.kpiDefinitionId = kpiDefinitionId;
    }
    
    // Getters and Setters
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    
    public String getKpiDefinitionId() { return kpiDefinitionId; }
    public void setKpiDefinitionId(String kpiDefinitionId) { this.kpiDefinitionId = kpiDefinitionId; }
    
    // equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        KPIAssignmentId that = (KPIAssignmentId) o;
        return Objects.equals(employeeId, that.employeeId) &&
               Objects.equals(kpiDefinitionId, that.kpiDefinitionId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(employeeId, kpiDefinitionId);
    }
}