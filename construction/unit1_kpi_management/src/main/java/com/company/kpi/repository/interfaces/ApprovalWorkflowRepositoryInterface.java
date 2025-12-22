package com.company.kpi.repository.interfaces;

import com.company.kpi.model.ApprovalStatus;
import com.company.kpi.model.ApprovalWorkflow;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Approval Workflow operations
 */
public interface ApprovalWorkflowRepositoryInterface {
    
    ApprovalWorkflow save(ApprovalWorkflow approvalWorkflow);
    
    Optional<ApprovalWorkflow> findById(String id);
    
    List<ApprovalWorkflow> findAll();
    
    List<ApprovalWorkflow> findByKpiAssignmentId(String kpiAssignmentId);
    
    List<ApprovalWorkflow> findByStatus(ApprovalStatus status);
    
    List<ApprovalWorkflow> findByApproverId(String approverId);
    
    void deleteById(String id);
    
    boolean existsById(String id);
    
    List<ApprovalWorkflow> findByCheckerIdAndStatus(String checkerId, ApprovalStatus status);
    
    List<ApprovalWorkflow> findByMakerId(String makerId);
}