package com.company.performance.domain.aggregate.feedback;

import com.company.performance.domain.aggregate.reviewcycle.KPIId;
import com.company.performance.domain.exception.InvalidFeedbackOperationException;

import java.util.Objects;

/**
 * Value Object representing the context of feedback
 * Links feedback to a specific KPI and contains the feedback content
 */
public class FeedbackContext {
    
    private final KPIId kpiId;
    private final String kpiName;
    private final String contentText;
    
    public FeedbackContext(KPIId kpiId, String kpiName, String contentText) {
        validateKpiId(kpiId);
        validateContentText(contentText);
        
        this.kpiId = kpiId;
        this.kpiName = kpiName;
        this.contentText = contentText;
    }
    
    private void validateKpiId(KPIId kpiId) {
        if (kpiId == null) {
            throw new InvalidFeedbackOperationException(
                "Feedback must be linked to a KPI"
            );
        }
    }
    
    private void validateContentText(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new InvalidFeedbackOperationException(
                "Feedback content cannot be empty"
            );
        }
        if (text.length() > 5000) {
            throw new InvalidFeedbackOperationException(
                "Feedback content cannot exceed 5000 characters"
            );
        }
    }
    
    public KPIId getKpiId() {
        return kpiId;
    }
    
    public String getKpiName() {
        return kpiName;
    }
    
    public String getContentText() {
        return contentText;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FeedbackContext that = (FeedbackContext) o;
        return Objects.equals(kpiId, that.kpiId) &&
               Objects.equals(kpiName, that.kpiName) &&
               Objects.equals(contentText, that.contentText);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(kpiId, kpiName, contentText);
    }
    
    @Override
    public String toString() {
        return "FeedbackContext{" +
                "kpiId=" + kpiId +
                ", kpiName='" + kpiName + '\'' +
                ", contentText='" + contentText + '\'' +
                '}';
    }
}
