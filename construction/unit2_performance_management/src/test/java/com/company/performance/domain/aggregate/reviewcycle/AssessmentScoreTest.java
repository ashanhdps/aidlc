package com.company.performance.domain.aggregate.reviewcycle;

import com.company.performance.domain.exception.InvalidAssessmentException;
import com.company.performance.testutil.builders.AssessmentScoreBuilder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for AssessmentScore value object
 * Tests validation rules, immutability, and equality
 */
@DisplayName("AssessmentScore Value Object Tests")
class AssessmentScoreTest {
    
    // TC-DOM-SCORE-001: Create score with valid data
    @Test
    @DisplayName("Should create assessment score with valid data")
    void createScore_withValidData_createsSuccessfully() {
        // Arrange
        KPIId kpiId = new KPIId(UUID.randomUUID());
        BigDecimal rating = new BigDecimal("3.5");
        BigDecimal achievement = new BigDecimal("85");
        String comment = "Good performance";
        
        // Act
        AssessmentScore score = new AssessmentScore(kpiId, rating, achievement, comment);
        
        // Assert
        assertThat(score).isNotNull();
        assertThat(score.getKpiId()).isEqualTo(kpiId);
        assertThat(score.getRatingValue()).isEqualByComparingTo(rating);
        assertThat(score.getAchievementPercentage()).isEqualByComparingTo(achievement);
        assertThat(score.getComment()).isEqualTo(comment);
    }
    
    // TC-DOM-SCORE-002: Validate rating minimum (1.0)
    @Test
    @DisplayName("Should reject rating below minimum (1.0)")
    void createScore_withRatingBelowMinimum_throwsException() {
        // Arrange
        BigDecimal invalidRating = new BigDecimal("0.9");
        
        // Act & Assert
        assertThatThrownBy(() -> 
            new AssessmentScoreBuilder()
                .withRating(invalidRating)
                .build()
        )
        .isInstanceOf(InvalidAssessmentException.class)
        .hasMessageContaining("Rating must be between 1.0 and 5.0");
    }
    
    // TC-DOM-SCORE-003: Validate rating maximum (5.0)
    @Test
    @DisplayName("Should reject rating above maximum (5.0)")
    void createScore_withRatingAboveMaximum_throwsException() {
        // Arrange
        BigDecimal invalidRating = new BigDecimal("5.1");
        
        // Act & Assert
        assertThatThrownBy(() -> 
            new AssessmentScoreBuilder()
                .withRating(invalidRating)
                .build()
        )
        .isInstanceOf(InvalidAssessmentException.class)
        .hasMessageContaining("Rating must be between 1.0 and 5.0");
    }
    
    // TC-DOM-SCORE-004: Accept rating at minimum boundary (1.0)
    @Test
    @DisplayName("Should accept rating at minimum boundary (1.0)")
    void createScore_withRatingAtMinimumBoundary_createsSuccessfully() {
        // Act
        AssessmentScore score = new AssessmentScoreBuilder()
            .withRating(1.0)
            .build();
        
        // Assert
        assertThat(score.getRatingValue()).isEqualByComparingTo(new BigDecimal("1.0"));
    }
    
    // TC-DOM-SCORE-005: Accept rating at maximum boundary (5.0)
    @Test
    @DisplayName("Should accept rating at maximum boundary (5.0)")
    void createScore_withRatingAtMaximumBoundary_createsSuccessfully() {
        // Act
        AssessmentScore score = new AssessmentScoreBuilder()
            .withRating(5.0)
            .build();
        
        // Assert
        assertThat(score.getRatingValue()).isEqualByComparingTo(new BigDecimal("5.0"));
    }
    
    // TC-DOM-SCORE-006: Validate achievement minimum (0)
    @Test
    @DisplayName("Should reject achievement below minimum (0)")
    void createScore_withAchievementBelowMinimum_throwsException() {
        // Arrange
        BigDecimal invalidAchievement = new BigDecimal("-1");
        
        // Act & Assert
        assertThatThrownBy(() -> 
            new AssessmentScoreBuilder()
                .withAchievement(invalidAchievement)
                .build()
        )
        .isInstanceOf(InvalidAssessmentException.class)
        .hasMessageContaining("Achievement percentage must be between 0 and 100");
    }
    
    // TC-DOM-SCORE-007: Validate achievement maximum (100)
    @Test
    @DisplayName("Should reject achievement above maximum (100)")
    void createScore_withAchievementAboveMaximum_throwsException() {
        // Arrange
        BigDecimal invalidAchievement = new BigDecimal("101");
        
        // Act & Assert
        assertThatThrownBy(() -> 
            new AssessmentScoreBuilder()
                .withAchievement(invalidAchievement)
                .build()
        )
        .isInstanceOf(InvalidAssessmentException.class)
        .hasMessageContaining("Achievement percentage must be between 0 and 100");
    }
    
    // TC-DOM-SCORE-008: Accept achievement at minimum boundary (0)
    @Test
    @DisplayName("Should accept achievement at minimum boundary (0)")
    void createScore_withAchievementAtMinimumBoundary_createsSuccessfully() {
        // Act
        AssessmentScore score = new AssessmentScoreBuilder()
            .withAchievement(0.0)
            .build();
        
        // Assert
        assertThat(score.getAchievementPercentage()).isEqualByComparingTo(BigDecimal.ZERO);
    }
    
    // TC-DOM-SCORE-009: Accept achievement at maximum boundary (100)
    @Test
    @DisplayName("Should accept achievement at maximum boundary (100)")
    void createScore_withAchievementAtMaximumBoundary_createsSuccessfully() {
        // Act
        AssessmentScore score = new AssessmentScoreBuilder()
            .withAchievement(100.0)
            .build();
        
        // Assert
        assertThat(score.getAchievementPercentage()).isEqualByComparingTo(new BigDecimal("100"));
    }
    
    // TC-DOM-SCORE-010: Value object equality - same values
    @Test
    @DisplayName("Should be equal when all values are identical")
    void equals_withIdenticalValues_returnsTrue() {
        // Arrange
        KPIId kpiId = new KPIId(UUID.randomUUID());
        AssessmentScore score1 = new AssessmentScoreBuilder()
            .forKpi(kpiId)
            .withRating(4.0)
            .withAchievement(85.0)
            .withComment("Good")
            .build();
        
        AssessmentScore score2 = new AssessmentScoreBuilder()
            .forKpi(kpiId)
            .withRating(4.0)
            .withAchievement(85.0)
            .withComment("Good")
            .build();
        
        // Act & Assert
        assertThat(score1).isEqualTo(score2);
        assertThat(score1.hashCode()).isEqualTo(score2.hashCode());
    }
    
    // TC-DOM-SCORE-011: Value object equality - different values
    @Test
    @DisplayName("Should not be equal when values differ")
    void equals_withDifferentRatings_returnsFalse() {
        // Arrange
        KPIId kpiId = new KPIId(UUID.randomUUID());
        AssessmentScore score1 = new AssessmentScoreBuilder()
            .forKpi(kpiId)
            .withRating(4.0)
            .build();
        
        AssessmentScore score2 = new AssessmentScoreBuilder()
            .forKpi(kpiId)
            .withRating(3.0)
            .build();
        
        // Act & Assert
        assertThat(score1).isNotEqualTo(score2);
    }
    
    // TC-DOM-SCORE-013: Hash code consistency
    @Test
    @DisplayName("Should have consistent hash codes for equal objects")
    void hashCode_withIdenticalValues_isConsistent() {
        // Arrange
        KPIId kpiId = new KPIId(UUID.randomUUID());
        AssessmentScore score1 = new AssessmentScoreBuilder()
            .forKpi(kpiId)
            .withRating(4.0)
            .withAchievement(85.0)
            .build();
        
        AssessmentScore score2 = new AssessmentScoreBuilder()
            .forKpi(kpiId)
            .withRating(4.0)
            .withAchievement(85.0)
            .build();
        
        // Act & Assert
        assertThat(score1.hashCode()).isEqualTo(score2.hashCode());
    }
    
    // TC-DOM-SCORE-014: Comment can be null
    @Test
    @DisplayName("Should accept null comment")
    void createScore_withNullComment_createsSuccessfully() {
        // Act
        AssessmentScore score = new AssessmentScoreBuilder()
            .withoutComment()
            .build();
        
        // Assert
        assertThat(score.getComment()).isNull();
    }
    
    // TC-DOM-SCORE-015: Comment can be empty string
    @Test
    @DisplayName("Should accept empty comment")
    void createScore_withEmptyComment_createsSuccessfully() {
        // Act
        AssessmentScore score = new AssessmentScoreBuilder()
            .withComment("")
            .build();
        
        // Assert
        assertThat(score.getComment()).isEmpty();
    }
}
