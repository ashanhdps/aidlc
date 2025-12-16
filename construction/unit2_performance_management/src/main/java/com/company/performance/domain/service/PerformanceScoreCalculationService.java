package com.company.performance.domain.service;

import com.company.performance.domain.aggregate.reviewcycle.AssessmentScore;
import com.company.performance.domain.exception.InvalidAssessmentException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Domain Service for calculating final performance scores
 * Business Rule: Final score = (KPI average × 0.7) + (Competency average × 0.3)
 */
@Service
public class PerformanceScoreCalculationService {
    
    private static final BigDecimal KPI_WEIGHT = new BigDecimal("0.7");
    private static final BigDecimal COMPETENCY_WEIGHT = new BigDecimal("0.3");
    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;
    
    /**
     * Calculate final performance score based on KPI and competency scores
     * For PoC: We'll use KPI scores only and assume competency scores equal KPI scores
     */
    public BigDecimal calculateFinalScore(List<AssessmentScore> kpiScores) {
        validateScores(kpiScores);
        
        BigDecimal kpiAverage = calculateAverage(kpiScores);
        // For PoC simplicity: competency average = KPI average
        BigDecimal competencyAverage = kpiAverage;
        
        BigDecimal weightedKpi = kpiAverage.multiply(KPI_WEIGHT);
        BigDecimal weightedCompetency = competencyAverage.multiply(COMPETENCY_WEIGHT);
        
        BigDecimal finalScore = weightedKpi.add(weightedCompetency)
            .setScale(SCALE, ROUNDING_MODE);
        
        validateFinalScore(finalScore);
        
        return finalScore;
    }
    
    private BigDecimal calculateAverage(List<AssessmentScore> scores) {
        if (scores.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal sum = scores.stream()
            .map(AssessmentScore::getRatingValue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return sum.divide(
            new BigDecimal(scores.size()),
            SCALE,
            ROUNDING_MODE
        );
    }
    
    private void validateScores(List<AssessmentScore> kpiScores) {
        if (kpiScores == null || kpiScores.isEmpty()) {
            throw new InvalidAssessmentException(
                "KPI scores are required for score calculation"
            );
        }
    }
    
    private void validateFinalScore(BigDecimal score) {
        if (score.compareTo(BigDecimal.ONE) < 0 || 
            score.compareTo(new BigDecimal("5")) > 0) {
            throw new InvalidAssessmentException(
                "Final score must be between 1.0 and 5.0, got: " + score
            );
        }
    }
}
