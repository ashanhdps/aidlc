package com.company.performance.api.dto.request;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request DTO for submitting manager assessment
 */
public class SubmitManagerAssessmentRequest {
    
    private List<KPIScoreDTO> kpiScores;
    private String overallComments;
    
    public static class KPIScoreDTO {
        private String kpiId;
        private BigDecimal ratingValue;
        private BigDecimal achievementPercentage;
        private String comment;
        
        // Getters and Setters
        public String getKpiId() {
            return kpiId;
        }
        
        public void setKpiId(String kpiId) {
            this.kpiId = kpiId;
        }
        
        public BigDecimal getRatingValue() {
            return ratingValue;
        }
        
        public void setRatingValue(BigDecimal ratingValue) {
            this.ratingValue = ratingValue;
        }
        
        public BigDecimal getAchievementPercentage() {
            return achievementPercentage;
        }
        
        public void setAchievementPercentage(BigDecimal achievementPercentage) {
            this.achievementPercentage = achievementPercentage;
        }
        
        public String getComment() {
            return comment;
        }
        
        public void setComment(String comment) {
            this.comment = comment;
        }
    }
    
    // Getters and Setters
    public List<KPIScoreDTO> getKpiScores() {
        return kpiScores;
    }
    
    public void setKpiScores(List<KPIScoreDTO> kpiScores) {
        this.kpiScores = kpiScores;
    }
    
    public String getOverallComments() {
        return overallComments;
    }
    
    public void setOverallComments(String overallComments) {
        this.overallComments = overallComments;
    }
}
