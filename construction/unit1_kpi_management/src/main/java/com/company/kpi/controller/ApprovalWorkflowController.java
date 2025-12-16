package com.company.kpi.controller;

import com.company.kpi.model.ApprovalWorkflow;
import com.company.kpi.model.dto.ApprovalDecisionRequest;
import com.company.kpi.service.ApprovalWorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Approval Workflow management (Maker-Checker process)
 */
@RestController
@RequestMapping("/kpi-management/approval-workflows")
@Tag(name = "Approval Workflows", description = "Maker-Checker approval process APIs")
public class ApprovalWorkflowController {
    
    private static final Logger logger = LoggerFactory.getLogger(ApprovalWorkflowController.class);
    
    @Autowired
    private ApprovalWorkflowService approvalWorkflowService;
    
    @Operation(summary = "Get pending approval requests for current user (Checker)")
    @ApiResponse(responseCode = "200", description = "Pending approval requests retrieved successfully")
    @GetMapping("/pending")
    public ResponseEntity<List<ApprovalWorkflow>> getPendingApprovals(Authentication authentication) {
        logger.debug("Getting pending approvals for checker: {}", authentication.getName());
        
        try {
            List<ApprovalWorkflow> pendingApprovals = approvalWorkflowService.getPendingApprovals(authentication.getName());
            return ResponseEntity.ok(pendingApprovals);
            
        } catch (Exception e) {
            logger.error("Error retrieving pending approvals", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get approval requests submitted by current user (Maker)")
    @ApiResponse(responseCode = "200", description = "Maker requests retrieved successfully")
    @GetMapping("/my-requests")
    public ResponseEntity<List<ApprovalWorkflow>> getMyRequests(Authentication authentication) {
        logger.debug("Getting requests submitted by maker: {}", authentication.getName());
        
        try {
            List<ApprovalWorkflow> makerRequests = approvalWorkflowService.getMakerRequests(authentication.getName());
            return ResponseEntity.ok(makerRequests);
            
        } catch (Exception e) {
            logger.error("Error retrieving maker requests", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get all approval workflows (Admin only)")
    @ApiResponse(responseCode = "200", description = "All approval workflows retrieved successfully")
    @GetMapping("/all")
    public ResponseEntity<List<ApprovalWorkflow>> getAllApprovals(Authentication authentication) {
        logger.debug("Getting all approval workflows for admin: {}", authentication.getName());
        
        try {
            // In a real system, you'd check if user has admin role
            List<ApprovalWorkflow> allApprovals = approvalWorkflowService.getAllApprovals();
            return ResponseEntity.ok(allApprovals);
            
        } catch (Exception e) {
            logger.error("Error retrieving all approvals", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Approve a change request")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Request approved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid approval request"),
        @ApiResponse(responseCode = "403", description = "User not authorized to approve this request"),
        @ApiResponse(responseCode = "404", description = "Approval workflow not found")
    })
    @PostMapping("/{workflowId}/approve")
    public ResponseEntity<ApprovalWorkflow> approveRequest(
            @Parameter(description = "Workflow ID") @PathVariable String workflowId,
            @Valid @RequestBody ApprovalDecisionRequest request,
            Authentication authentication) {
        
        logger.info("Approving request {} by checker: {}", workflowId, authentication.getName());
        
        try {
            ApprovalWorkflow approvedWorkflow = approvalWorkflowService.approveRequest(
                workflowId, authentication.getName(), request.getReason());
            
            return ResponseEntity.ok(approvedWorkflow);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid approval request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error approving request: {}", workflowId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Reject a change request")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Request rejected successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid rejection request"),
        @ApiResponse(responseCode = "403", description = "User not authorized to reject this request"),
        @ApiResponse(responseCode = "404", description = "Approval workflow not found")
    })
    @PostMapping("/{workflowId}/reject")
    public ResponseEntity<ApprovalWorkflow> rejectRequest(
            @Parameter(description = "Workflow ID") @PathVariable String workflowId,
            @Valid @RequestBody ApprovalDecisionRequest request,
            Authentication authentication) {
        
        logger.info("Rejecting request {} by checker: {}", workflowId, authentication.getName());
        
        try {
            ApprovalWorkflow rejectedWorkflow = approvalWorkflowService.rejectRequest(
                workflowId, authentication.getName(), request.getReason());
            
            return ResponseEntity.ok(rejectedWorkflow);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid rejection request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error rejecting request: {}", workflowId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get approval workflow by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Approval workflow retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Approval workflow not found")
    })
    @GetMapping("/{workflowId}")
    public ResponseEntity<ApprovalWorkflow> getWorkflowById(
            @Parameter(description = "Workflow ID") @PathVariable String workflowId) {
        
        logger.debug("Getting approval workflow by ID: {}", workflowId);
        
        try {
            // In a real system, you'd check user permissions to view this workflow
            return approvalWorkflowService.getAllApprovals().stream()
                .filter(workflow -> workflow.getWorkflowId().equals(workflowId))
                .findFirst()
                .map(workflow -> ResponseEntity.ok(workflow))
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            logger.error("Error retrieving workflow by ID: {}", workflowId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}