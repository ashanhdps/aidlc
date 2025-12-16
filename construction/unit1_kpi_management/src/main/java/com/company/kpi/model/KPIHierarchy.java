package com.company.kpi.model;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

/**
 * KPI Hierarchy model for cascading KPIs
 */
@Schema(description = "KPI Hierarchy structure")
public class KPIHierarchy {
    
    @Schema(description = "Hierarchy ID")
    private String hierarchyId;
    
    @Schema(description = "Parent KPI ID")
    private String parentKpiId;
    
    @Schema(description = "Child KPI ID")
    private String childKpiId;
    
    @Schema(description = "Hierarchy level (company/department/individual)")
    private HierarchyLevel level;
    
    @Schema(description = "Department or unit ID")
    private String unitId;
    
    @Schema(description = "Weight contribution from parent")
    private Double weightContribution;
    
    @Schema(description = "Cascade multiplier")
    private Double cascadeMultiplier;
    
    @Schema(description = "Created by user")
    private String createdBy;
    
    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
    
    @Schema(description = "Last updated timestamp")
    private LocalDateTime updatedAt;
    
    @Schema(description = "Active status")
    private boolean active;
    
    // Constructors
    public KPIHierarchy() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.active = true;
    }
    
    public KPIHierarchy(String parentKpiId, String childKpiId, HierarchyLevel level, String createdBy) {
        this();
        this.parentKpiId = parentKpiId;
        this.childKpiId = childKpiId;
        this.level = level;
        this.createdBy = createdBy;
    }
    
    // Getters and setters
    public String getHierarchyId() { return hierarchyId; }
    public void setHierarchyId(String hierarchyId) { this.hierarchyId = hierarchyId; }
    
    public String getParentKpiId() { return parentKpiId; }
    public void setParentKpiId(String parentKpiId) { this.parentKpiId = parentKpiId; }
    
    public String getChildKpiId() { return childKpiId; }
    public void setChildKpiId(String childKpiId) { this.childKpiId = childKpiId; }
    
    public HierarchyLevel getLevel() { return level; }
    public void setLevel(HierarchyLevel level) { this.level = level; }
    
    public String getUnitId() { return unitId; }
    public void setUnitId(String unitId) { this.unitId = unitId; }
    
    public Double getWeightContribution() { return weightContribution; }
    public void setWeightContribution(Double weightContribution) { this.weightContribution = weightContribution; }
    
    public Double getCascadeMultiplier() { return cascadeMultiplier; }
    public void setCascadeMultiplier(Double cascadeMultiplier) { this.cascadeMultiplier = cascadeMultiplier; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    /**
     * Hierarchy levels enum
     */
    public enum HierarchyLevel {
        COMPANY,
        DEPARTMENT,
        TEAM,
        INDIVIDUAL
    }
}