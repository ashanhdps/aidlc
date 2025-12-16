package com.company.kpi.domain.kpidefinition.events;

import com.company.kpi.domain.shared.DomainEvent;

import java.time.LocalDateTime;

/**
 * Domain event raised when a KPI Definition is updated
 */
public class KPIDefinitionUpdated extends DomainEvent {
    
    private final String name;
    private final LocalDateTime updatedAt;
    
    public KPIDefinitionUpdated(String aggregateId, String name, LocalDateTime updatedAt) {
        super(aggregateId);
        this.name = name;
        this.updatedAt = updatedAt;
    }
    
    public String getName() {
        return name;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}