package com.company.kpi.service;

import com.company.kpi.model.*;
import com.company.kpi.repository.interfaces.ApprovalWorkflowRepositoryInterface;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing approval workflows (Maker-Checker process)
 */
@Service
public class ApprovalWorkflowService {
    
    private static final Logger logger = LoggerFactory.getLogger(ApprovalWorkflowService.class);
    
    @Autowired
    private ApprovalWorkflowRepositoryInterface approvalWorkflowRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Submits a change request for approval
     */
    public ApprovalWorkflow submitForApproval(ChangeRequestType requestType, String entityId, 
                                            Object originalData, Object proposedData, 
                                            String justification, String makerId) {
        logger.info("Submitting approval request: {} for entity {} by maker: {}", 
            requestType, entityId, makerId);
        
        try {
            ApprovalWorkflow workflow = new ApprovalWorkflow(requestType, entityId, makerId);
            workflow.setWorkflowId(UUID.randomUUID().toString());
            workflow.setJustification(justification);
            
            // Serialize data to JSON
            if (originalData != null) {
                workflow.setOriginalData(objectMapper.writeValueAsString(originalData));
            }
            workflow.setProposedData(objectMapper.writeValueAsString(proposedData));
            
            // Determine priority based on request type
            workflow.setPriority(determinePriority(requestType));
            
            // Assign checker based on request type and maker role
            String checkerId = assignChecker(requestType, makerId);
            workflow.setCheckerId(checkerId);
            
            ApprovalWorkflow savedWorkflow = approvalWorkflowRepository.save(workflow);
            
            logger.info("Approval request submitted with ID: {}", savedWorkflow.getWorkflowId());
            return savedWorkflow;
            
        } catch (Exception e) {
            logger.error("Error submitting approval request", e);
            throw new RuntimeException("Failed to submit approval request", e);
        }
    }
    
    /**
     * Approves a change request
     */
    public ApprovalWorkflow approveRequest(String workflowId, String checkerId, String reason) {
        logger.info("Approving request {} by checker: {}", workflowId, checkerId);
        
        ApprovalWorkflow workflow = approvalWorkflowRepository.findById(workflowId)
            .orElseThrow(() -> new IllegalArgumentException("Approval workflow not found: " + workflowId));
        
        validateCheckerAuthority(workflow, checkerId);
        
        workflow.setStatus(ApprovalStatus.APPROVED);
        workflow.setDecisionReason(reason);
        workflow.setDecidedAt(LocalDateTime.now());
        
        ApprovalWorkflow updatedWorkflow = approvalWorkflowRepository.save(workflow);
        
        logger.info("Request {} approved by checker: {}", workflowId, checkerId);
        return updatedWorkflow;
    }
    
    /**
     * Rejects a change request
     */
    public ApprovalWorkflow rejectRequest(String workflowId, String checkerId, String reason) {
        logger.info("Rejecting request {} by checker: {}", workflowId, checkerId);
        
        ApprovalWorkflow workflow = approvalWorkflowRepository.findById(workflowId)
            .orElseThrow(() -> new IllegalArgumentException("Approval workflow not found: " + workflowId));
        
        validateCheckerAuthority(workflow, checkerId);
        
        workflow.setStatus(ApprovalStatus.REJECTED);
        workflow.setDecisionReason(reason);
        workflow.setDecidedAt(LocalDateTime.now());
        
        ApprovalWorkflow updatedWorkflow = approvalWorkflowRepository.save(workflow);
        
        logger.info("Request {} rejected by checker: {}", workflowId, checkerId);
        return updatedWorkflow;
    }
    
    /**
     * Gets pending approval requests for a checker
     */
    public List<ApprovalWorkflow> getPendingApprovals(String checkerId) {
        logger.debug("Getting pending approvals for checker: {}", checkerId);
        return approvalWorkflowRepository.findByCheckerIdAndStatus(checkerId, ApprovalStatus.PENDING);
    }
    
    /**
     * Gets approval requests submitted by a maker
     */
    public List<ApprovalWorkflow> getMakerRequests(String makerId) {
        logger.debug("Getting requests submitted by maker: {}", makerId);
        return approvalWorkflowRepository.findByMakerId(makerId);
    }
    
    /**
     * Gets all approval workflows
     */
    public List<ApprovalWorkflow> getAllApprovals() {
        return approvalWorkflowRepository.findAll();
    }
    
    /**
     * Checks if a change requires approval based on business rules
     */
    public boolean requiresApproval(ChangeRequestType requestType, Object originalData, Object proposedData) {
        switch (requestType) {
            case KPI_CREATE:
                return true; // All new KPIs require approval
            case KPI_UPDATE:
                return isSignificantKPIChange(originalData, proposedData);
            case KPI_DELETE:
                return true; // All deletions require approval
            case ASSIGNMENT_CREATE:
                return isHighValueAssignment(proposedData);
            case ASSIGNMENT_MODIFY:
                return isSignificantAssignmentChange(originalData, proposedData);
            case ASSIGNMENT_REMOVE:
                return true; // All removals require approval
            default:
                return false;
        }
    }
    
    /**
     * Determines priority based on request type
     */
    private Priority determinePriority(ChangeRequestType requestType) {
        switch (requestType) {
            case KPI_DELETE:
            case ASSIGNMENT_REMOVE:
                return Priority.HIGH;
            case KPI_CREATE:
            case ASSIGNMENT_CREATE:
                return Priority.MEDIUM;
            case BULK_ASSIGNMENT:
                return Priority.HIGH;
            default:
                return Priority.MEDIUM;
        }
    }
    
    /**
     * Assigns checker based on request type and organizational hierarchy
     */
    private String assignChecker(ChangeRequestType requestType, String makerId) {
        // In a real system, this would query organizational hierarchy
        // For demo purposes, we'll use simple role-based assignment
        
        // Supervisors (makers) -> HR (checkers)
        // For demo, assign to admin user as checker
        return "admin"; // In production, this would be dynamic based on org structure
    }
    
    /**
     * Validates checker authority
     */
    private void validateCheckerAuthority(ApprovalWorkflow workflow, String checkerId) {
        if (!workflow.getCheckerId().equals(checkerId)) {
            throw new IllegalArgumentException("User does not have authority to approve this request");
        }
        
        if (workflow.getMakerId().equals(checkerId)) {
            throw new IllegalArgumentException("Maker cannot approve their own request");
        }
        
        if (workflow.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalArgumentException("Request is not in pending status");
        }
    }
    
    /**
     * Checks if KPI change is significant enough to require approval
     */
    private boolean isSignificantKPIChange(Object originalData, Object proposedData) {
        // In a real implementation, this would compare the actual data
        // For demo purposes, assume all updates are significant
        return true;
    }
    
    /**
     * Checks if assignment is high-value and requires approval
     */
    private boolean isHighValueAssignment(Object proposedData) {
        // In a real implementation, this would check assignment details
        // For demo purposes, assume all assignments require approval
        return true;
    }
    
    /**
     * Checks if assignment change is significant
     */
    private boolean isSignificantAssignmentChange(Object originalData, Object proposedData) {
        // In a real implementation, this would compare weight changes, target changes, etc.
        // For demo purposes, assume all changes are significant
        return true;
    }
}