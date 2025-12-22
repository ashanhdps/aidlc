package com.company.kpi.repository.interfaces;

import com.company.kpi.model.KPICategory;
import com.company.kpi.model.KPIDefinition;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for KPI Definition operations
 */
public interface KPIDefinitionRepositoryInterface {
    
    KPIDefinition save(KPIDefinition kpiDefinition);
    
    Optional<KPIDefinition> findById(String id);
    
    List<KPIDefinition> findAll();
    
    List<KPIDefinition> findByCategory(KPICategory category);
    
    List<KPIDefinition> findByDepartment(String department);
    
    void deleteById(String id);
    
    boolean existsById(String id);
    
    long count();
    
    boolean existsByName(String name);
    
    List<KPIDefinition> findByIsActiveTrue();
    
    Optional<KPIDefinition> findByName(String name);
}