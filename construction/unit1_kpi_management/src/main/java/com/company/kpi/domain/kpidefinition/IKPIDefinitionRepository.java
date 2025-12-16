package com.company.kpi.domain.kpidefinition;

import com.company.kpi.domain.shared.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for KPI Definition aggregate
 */
public interface IKPIDefinitionRepository extends Repository<KPIDefinition, KPIDefinitionId> {
    
    /**
     * Finds a KPI definition by name within an organization
     */
    Optional<KPIDefinition> findByName(String name, String organizationId);
    
    /**
     * Finds KPI definitions by category
     */
    List<KPIDefinition> findByCategory(KPICategory category);
    
    /**
     * Finds all active KPI definitions for an organization
     */
    List<KPIDefinition> findActiveDefinitions(String organizationId);
    
    /**
     * Checks if a KPI definition exists by name within an organization
     */
    boolean existsByName(String name, String organizationId);
}