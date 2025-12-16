package com.company.performance.domain.aggregate.reviewcycle;

import com.company.performance.domain.exception.InvalidAssessmentException;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Value Object representing a KPI assessment score
 * Immutable and validates rating and achievement ranges
 */
public class AssessmentScore {
    
    private final KPIId kpiId;
    private final BigDecimal ratingValue;
    private final BigDecimal achievementPercentage;
    private final String comment;
    
    public AssessmentScore(
            KPIId kpiId,
            BigDecimal ratingValue,
            BigDecimal achievementPercentage,
            String comment) {
        
        validateKpiId(kpiId);
        validateRating(ratingValue);
        validateAchievement(achievementPercentage);
        
        this.kpiId = kpiId;
        this.ratingValue = ratingValue;
        this.achievementPercentage = achievementPercentage;
        this.comment = comment;
    }
    
    private void validateKpiId(KPIId kpiId) {
        if (kpiId == null) {
            throw new InvalidAssessmentException("KPI ID cannot be null");
        }
    }
    
    private void validateRating(BigDecimal rating) {
        if (rating == null) {
            throw new InvalidAssessmentException("Rating value cannot be null");
        }
        if (rating.compareTo(BigDecimal.ONE) < 0 || 
            rating.compareTo(new BigDecimal("5")) > 0) {
            throw new InvalidAssessmentException(
                "Rating must be between 1.0 and 5.0, got: " + rating
            );
        }
    }
    
    private void validateAchievement(BigDecimal achievement) {
        if (achievement == null) {
            throw new InvalidAssessmentException("Achievement percentage cannot be null");
        }
        if (achievement.compareTo(BigDecimal.ZERO) < 0 || 
            achievement.compareTo(new BigDecimal("100")) > 0) {
            throw new InvalidAssessmentException(
                "Achievement percentage must be between 0 and 100, got: " + achievement
            );
        }
    }
    
    public KPIId getKpiId() {
        return kpiId;
    }
    
    public BigDecimal getRatingValue() {
        return ratingValue;
    }
    
    public BigDecimal getAchievementPercentage() {
        return achievementPercentage;
    }
    
    public String getComment() {
        return comment;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AssessmentScore that = (AssessmentScore) o;
        return Objects.equals(kpiId, that.kpiId) &&
               Objects.equals(ratingValue, that.ratingValue) &&
               Objects.equals(achievementPercentage, that.achievementPercentage) &&
               Objects.equals(comment, that.comment);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(kpiId, ratingValue, achievementPercentage, comment);
    }
    
    @Override
    public String toString() {
        return "AssessmentScore{" +
                "kpiId=" + kpiId +
                ", ratingValue=" + ratingValue +
                ", achievementPercentage=" + achievementPercentage +
                ", comment='" + comment + '\'' +
                '}';
    }
}
