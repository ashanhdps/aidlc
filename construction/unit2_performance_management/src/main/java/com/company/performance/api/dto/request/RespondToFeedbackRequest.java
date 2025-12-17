package com.company.performance.api.dto.request;

/**
 * Request DTO for responding to feedback
 */
public class RespondToFeedbackRequest {
    
    private String responseText;
    
    // Getters and Setters
    public String getResponseText() {
        return responseText;
    }
    
    public void setResponseText(String responseText) {
        this.responseText = responseText;
    }
}
