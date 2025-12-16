package com.company.kpi.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

import java.time.LocalDateTime;

/**
 * Approval Workflow for Maker-Checker process
 */
@DynamoDbBean
public class ApprovalWorkflow {
    
    private String workflowId;
    private ChangeRequestType requestType;
    private String entityId; // ID of the entity being changed (KPI ID, Assignment ID, etc.)
    private String originalData; // JSON representation of original data
    private String proposedData; // JSON representation of proposed changes
    private String justification;
    private String makerId; // User who initiated the change
    private String checkerId; // User who will approve/reject
    private ApprovalStatus status;
    private Priority priority;
    private String decisionReason;
    private LocalDateTime createdAt;
    private LocalDateTime decidedAt;
    private LocalDateTime dueDate;
    
    // Constructors
    public ApprovalWorkflow() {}
    
    public ApprovalWorkflow(ChangeRequestType requestType, String entityId, String makerId) {
        this.requestType = requestType;
        this.entityId = entityId;
        this.makerId = makerId;
        this.status = ApprovalStatus.PENDING;
        this.priority = Priority.MEDIUM;
        this.createdAt = LocalDateTime.now();
        this.dueDate = LocalDateTime.now().plusHours(48); // Default 48 hours
    }
    
    // Getters and Setters
    @DynamoDbPartitionKey
    public String getWorkflowId() { return workflowId; }
    public void setWorkflowId(String workflowId) { this.workflowId = workflowId; }
    
    public ChangeRequestType getRequestType() { return requestType; }
    public void setRequestType(ChangeRequestType requestType) { this.requestType = requestType; }
    
    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    
    public String getOriginalData() { return originalData; }
    public void setOriginalData(String originalData) { this.originalData = originalData; }
    
    public String getProposedData() { return proposedData; }
    public void setProposedData(String proposedData) { this.proposedData = proposedData; }
    
    public String getJustification() { return justification; }
    public void setJustification(String justification) { this.justification = justification; }
    
    public String getMakerId() { return makerId; }
    public void setMakerId(String makerId) { this.makerId = makerId; }
    
    public String getCheckerId() { return checkerId; }
    public void setCheckerId(String checkerId) { this.checkerId = checkerId; }
    
    public ApprovalStatus getStatus() { return status; }
    public void setStatus(ApprovalStatus status) { this.status = status; }
    
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    
    public String getDecisionReason() { return decisionReason; }
    public void setDecisionReason(String decisionReason) { this.decisionReason = decisionReason; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getDecidedAt() { return decidedAt; }
    public void setDecidedAt(LocalDateTime decidedAt) { this.decidedAt = decidedAt; }
    
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
}