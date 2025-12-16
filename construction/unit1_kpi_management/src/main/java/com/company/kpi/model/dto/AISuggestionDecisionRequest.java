package com.company.kpi.model.dto;

import com.company.kpi.model.AISuggestion;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * Request to approve or reject AI suggestion
 */
@Schema(description = "Request to approve or reject AI suggestion")
public class AISuggestionDecisionRequest {
    
    @Schema(description = "Decision status", example = "approved")
    @NotNull(message = "Status is required")
    private AISuggestion.SuggestionStatus status;
    
    @Schema(description = "Feedback on the decision", example = "Good suggestion, aligns with our goals")
    private String feedback;
    
    // Constructors
    public AISuggestionDecisionRequest() {}
    
    public AISuggestionDecisionRequest(AISuggestion.SuggestionStatus status, String feedback) {
        this.status = status;
        this.feedback = feedback;
    }
    
    // Getters and setters
    public AISuggestion.SuggestionStatus getStatus() { return status; }
    public void setStatus(AISuggestion.SuggestionStatus status) { this.status = status; }
    
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}