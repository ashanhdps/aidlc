package com.company.kpi.model;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * AI KPI Suggestion model
 */
@Schema(description = "AI-generated KPI suggestion")
public class AISuggestion {
    
    @Schema(description = "Suggestion ID")
    private String suggestionId;
    
    @Schema(description = "Suggested KPI name")
    private String suggestedKpiName;
    
    @Schema(description = "Suggested KPI description")
    private String suggestedKpiDescription;
    
    @Schema(description = "Job title this suggestion is for")
    private String jobTitle;
    
    @Schema(description = "Department")
    private String department;
    
    @Schema(description = "KPI category")
    private KPICategory category;
    
    @Schema(description = "Suggested measurement type")
    private MeasurementType measurementType;
    
    @Schema(description = "Suggested target value")
    private Double suggestedTargetValue;
    
    @Schema(description = "Suggested target unit")
    private String suggestedTargetUnit;
    
    @Schema(description = "AI rationale for suggestion")
    private String rationale;
    
    @Schema(description = "Confidence score (0-100)")
    private Double confidenceScore;
    
    @Schema(description = "Suggestion status")
    private SuggestionStatus status;
    
    @Schema(description = "Assigned to user for review")
    private String assignedTo;
    
    @Schema(description = "Reviewer feedback")
    private String feedback;
    
    @Schema(description = "Created by AI system")
    private String createdBy;
    
    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
    
    @Schema(description = "Last updated timestamp")
    private LocalDateTime updatedAt;
    
    @Schema(description = "Reviewed by user")
    private String reviewedBy;
    
    @Schema(description = "Review timestamp")
    private LocalDateTime reviewedAt;
    
    // Constructors
    public AISuggestion() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = SuggestionStatus.PENDING;
        this.createdBy = "AI_SYSTEM";
    }
    
    public AISuggestion(String jobTitle, String department, String suggestedKpiName) {
        this();
        this.jobTitle = jobTitle;
        this.department = department;
        this.suggestedKpiName = suggestedKpiName;
    }
    
    // Getters and setters
    public String getSuggestionId() { return suggestionId; }
    public void setSuggestionId(String suggestionId) { this.suggestionId = suggestionId; }
    
    public String getSuggestedKpiName() { return suggestedKpiName; }
    public void setSuggestedKpiName(String suggestedKpiName) { this.suggestedKpiName = suggestedKpiName; }
    
    public String getSuggestedKpiDescription() { return suggestedKpiDescription; }
    public void setSuggestedKpiDescription(String suggestedKpiDescription) { this.suggestedKpiDescription = suggestedKpiDescription; }
    
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public KPICategory getCategory() { return category; }
    public void setCategory(KPICategory category) { this.category = category; }
    
    public MeasurementType getMeasurementType() { return measurementType; }
    public void setMeasurementType(MeasurementType measurementType) { this.measurementType = measurementType; }
    
    public Double getSuggestedTargetValue() { return suggestedTargetValue; }
    public void setSuggestedTargetValue(Double suggestedTargetValue) { this.suggestedTargetValue = suggestedTargetValue; }
    
    public String getSuggestedTargetUnit() { return suggestedTargetUnit; }
    public void setSuggestedTargetUnit(String suggestedTargetUnit) { this.suggestedTargetUnit = suggestedTargetUnit; }
    
    public String getRationale() { return rationale; }
    public void setRationale(String rationale) { this.rationale = rationale; }
    
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
    
    public SuggestionStatus getStatus() { return status; }
    public void setStatus(SuggestionStatus status) { this.status = status; }
    
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
    
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    
    /**
     * AI Suggestion status enum
     */
    public enum SuggestionStatus {
        PENDING,
        APPROVED,
        REJECTED,
        IMPLEMENTED
    }
}