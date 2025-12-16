package com.company.performance.testutil.builders;

import java.math.BigDecimal;
import java.util.UUID;

import com.company.performance.domain.aggregate.reviewcycle.AssessmentScore;
import com.company.performance.domain.aggregate.reviewcycle.KPIId;

/**
 * Test data builder for AssessmentScore value object
 * Provides fluent API for creating test data
 */
public class AssessmentScoreBuilder {
    
    private KPIId kpiId = new KPIId(UUID.randomUUID());
    private BigDecimal ratingValue = new BigDecimal("3.5");
    private BigDecimal achievementPercentage = new BigDecimal("85");
    private String comment = "Good performance";
    
    public AssessmentScoreBuilder forKpi(UUID kpiId) {
        this.kpiId = new KPIId(kpiId);
        return this;
    }
    
    public AssessmentScoreBuilder forKpi(KPIId kpiId) {
        this.kpiId = kpiId;
        return this;
    }
    
    public AssessmentScoreBuilder withRating(double rating) {
        this.ratingValue = BigDecimal.valueOf(rating);
        return this;
    }
    
    public AssessmentScoreBuilder withRating(BigDecimal rating) {
        this.ratingValue = rating;
        return this;
    }
    
    public AssessmentScoreBuilder withAchievement(double achievement) {
        this.achievementPercentage = BigDecimal.valueOf(achievement);
        return this;
    }
    
    public AssessmentScoreBuilder withAchievement(BigDecimal achievement) {
        this.achievementPercentage = achievement;
        return this;
    }
    
    public AssessmentScoreBuilder withComment(String comment) {
        this.comment = comment;
        return this;
    }
    
    public AssessmentScoreBuilder withoutComment() {
        this.comment = null;
        return this;
    }
    
    public AssessmentScore build() {
        return new AssessmentScore(kpiId, ratingValue, achievementPercentage, comment);
    }
    
    /**
     * Creates a default valid assessment score
     */
    public static AssessmentScore defaultScore() {
        return new AssessmentScoreBuilder().build();
    }
    
    /**
     * Creates an assessment score with minimum valid values
     */
    public static AssessmentScore minimumScore() {
        return new AssessmentScoreBuilder()
            .withRating(1.0)
            .withAchievement(0.0)
            .build();
    }
    
    /**
     * Creates an assessment score with maximum valid values
     */
    public static AssessmentScore maximumScore() {
        return new AssessmentScoreBuilder()
            .withRating(5.0)
            .withAchievement(100.0)
            .build();
    }
}
