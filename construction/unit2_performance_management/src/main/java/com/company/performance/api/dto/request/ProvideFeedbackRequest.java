package com.company.performance.api.dto.request;

/**
 * Request DTO for providing feedback
 */
public class ProvideFeedbackRequest {
    
    private String receiverId;
    private String kpiId;
    private String kpiName;
    private String feedbackType; // POSITIVE or IMPROVEMENT
    private String contentText;
    
    // Getters and Setters
    public String getReceiverId() {
        return receiverId;
    }
    
    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }
    
    public String getKpiId() {
        return kpiId;
    }
    
    public void setKpiId(String kpiId) {
        this.kpiId = kpiId;
    }
    
    public String getKpiName() {
        return kpiName;
    }
    
    public void setKpiName(String kpiName) {
        this.kpiName = kpiName;
    }
    
    public String getFeedbackType() {
        return feedbackType;
    }
    
    public void setFeedbackType(String feedbackType) {
        this.feedbackType = feedbackType;
    }
    
    public String getContentText() {
        return contentText;
    }
    
    public void setContentText(String contentText) {
        this.contentText = contentText;
    }
}
