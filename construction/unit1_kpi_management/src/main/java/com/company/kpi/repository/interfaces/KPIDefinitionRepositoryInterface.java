package com.company.kpi.repository.interfaces;

import com.company.kpi.model.KPICategory;
import com.company.kpi.model.KPIDefinition;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for KPI Definition - database agnostic
 */
public interface KPIDefinitionRepositoryInterface {
    
    /**
     * Saves a KPI Definition
     */
    KPIDefinition save(KPIDefinition kpi);
    
    /**
     * Finds KPI Definition by ID
     */
    Optional<KPIDefinition> findById(String id);
    
    /**
     * Finds all KPI Definitions
     */
    List<KPIDefinition> findAll();
    
    /**
     * Finds KPI Definition by name
     */
    Optional<KPIDefinition> findByName(String name);
    
    /**
     * Checks if KPI Definition exists by name
     */
    boolean existsByName(String name);
    
    /**
     * Finds KPI Definitions by category
     */
    List<KPIDefinition> findByCategory(KPICategory category);
    
    /**
     * Finds active KPI Definitions
     */
    List<KPIDefinition> findByIsActiveTrue();
    
    /**
     * Deletes KPI Definition by ID
     */
    void deleteById(String id);
    
    /**
     * Counts total KPI Definitions
     */
    long count();
}