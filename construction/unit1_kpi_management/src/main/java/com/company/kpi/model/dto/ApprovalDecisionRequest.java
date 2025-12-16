package com.company.kpi.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * Request for approval workflow decisions
 */
@Schema(description = "Approval workflow decision request")
public class ApprovalDecisionRequest {
    
    @Schema(description = "Reason for approval/rejection", example = "Approved after review")
    @NotBlank(message = "Reason is required")
    private String reason;
    
    // Constructors
    public ApprovalDecisionRequest() {}
    
    public ApprovalDecisionRequest(String reason) {
        this.reason = reason;
    }
    
    // Getters and setters
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}