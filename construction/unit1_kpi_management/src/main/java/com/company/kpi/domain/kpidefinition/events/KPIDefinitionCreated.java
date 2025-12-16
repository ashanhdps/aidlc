package com.company.kpi.domain.kpidefinition.events;

import com.company.kpi.domain.shared.DomainEvent;
import com.company.kpi.domain.kpidefinition.KPICategory;

import java.time.LocalDateTime;

/**
 * Domain event raised when a KPI Definition is created
 */
public class KPIDefinitionCreated extends DomainEvent {
    
    private final String name;
    private final KPICategory category;
    private final String createdBy;
    private final LocalDateTime createdAt;
    
    public KPIDefinitionCreated(String aggregateId, String name, KPICategory category, 
                               String createdBy, LocalDateTime createdAt) {
        super(aggregateId);
        this.name = name;
        this.category = category;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }
    
    public String getName() {
        return name;
    }
    
    public KPICategory getCategory() {
        return category;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}