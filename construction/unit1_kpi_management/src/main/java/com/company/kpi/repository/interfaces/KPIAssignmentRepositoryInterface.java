package com.company.kpi.repository.interfaces;

import com.company.kpi.model.AssignmentStatus;
import com.company.kpi.model.KPIAssignment;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for KPI Assignment operations
 */
public interface KPIAssignmentRepositoryInterface {
    
    KPIAssignment save(KPIAssignment kpiAssignment);
    
    Optional<KPIAssignment> findById(String id);
    
    List<KPIAssignment> findAll();
    
    List<KPIAssignment> findByEmployeeId(String employeeId);
    
    List<KPIAssignment> findByKpiDefinitionId(String kpiDefinitionId);
    
    List<KPIAssignment> findByStatus(AssignmentStatus status);
    
    void deleteById(String id);
    
    boolean existsById(String id);
    
    long count();
    
    Optional<KPIAssignment> findByEmployeeIdAndKpiDefinitionId(String employeeId, String kpiDefinitionId);
    
    List<KPIAssignment> findActiveByEmployeeId(String employeeId);
}