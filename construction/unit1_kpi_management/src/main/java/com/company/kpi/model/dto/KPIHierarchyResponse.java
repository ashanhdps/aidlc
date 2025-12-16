package com.company.kpi.model.dto;

import com.company.kpi.model.KPIHierarchy;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * KPI Hierarchy response with nested structure
 */
@Schema(description = "KPI Hierarchy response with nested children")
public class KPIHierarchyResponse {
    
    @Schema(description = "KPI ID")
    private String kpiId;
    
    @Schema(description = "KPI name")
    private String kpiName;
    
    @Schema(description = "Hierarchy level")
    private KPIHierarchy.HierarchyLevel level;
    
    @Schema(description = "Parent KPI ID")
    private String parentKpiId;
    
    @Schema(description = "Child KPIs")
    private List<KPIHierarchyResponse> children;
    
    @Schema(description = "Weight contribution")
    private Double weightContribution;
    
    @Schema(description = "Cascade multiplier")
    private Double cascadeMultiplier;
    
    @Schema(description = "Unit/Department ID")
    private String unitId;
    
    // Constructors
    public KPIHierarchyResponse() {}
    
    public KPIHierarchyResponse(String kpiId, String kpiName, KPIHierarchy.HierarchyLevel level) {
        this.kpiId = kpiId;
        this.kpiName = kpiName;
        this.level = level;
    }
    
    // Getters and setters
    public String getKpiId() { return kpiId; }
    public void setKpiId(String kpiId) { this.kpiId = kpiId; }
    
    public String getKpiName() { return kpiName; }
    public void setKpiName(String kpiName) { this.kpiName = kpiName; }
    
    public KPIHierarchy.HierarchyLevel getLevel() { return level; }
    public void setLevel(KPIHierarchy.HierarchyLevel level) { this.level = level; }
    
    public String getParentKpiId() { return parentKpiId; }
    public void setParentKpiId(String parentKpiId) { this.parentKpiId = parentKpiId; }
    
    public List<KPIHierarchyResponse> getChildren() { return children; }
    public void setChildren(List<KPIHierarchyResponse> children) { this.children = children; }
    
    public Double getWeightContribution() { return weightContribution; }
    public void setWeightContribution(Double weightContribution) { this.weightContribution = weightContribution; }
    
    public Double getCascadeMultiplier() { return cascadeMultiplier; }
    public void setCascadeMultiplier(Double cascadeMultiplier) { this.cascadeMultiplier = cascadeMultiplier; }
    
    public String getUnitId() { return unitId; }
    public void setUnitId(String unitId) { this.unitId = unitId; }
}