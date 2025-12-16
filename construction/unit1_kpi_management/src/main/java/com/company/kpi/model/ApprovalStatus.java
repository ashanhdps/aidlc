package com.company.kpi.model;

/**
 * Status of approval workflow
 */
public enum ApprovalStatus {
    PENDING("Pending approval"),
    IN_REVIEW("Under review by checker"),
    APPROVED("Approved by checker"),
    REJECTED("Rejected by checker"),
    REQUIRES_MODIFICATION("Requires modification"),
    EMERGENCY_OVERRIDE("Emergency override applied"),
    EXPIRED("Approval request expired");
    
    private final String description;
    
    ApprovalStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}