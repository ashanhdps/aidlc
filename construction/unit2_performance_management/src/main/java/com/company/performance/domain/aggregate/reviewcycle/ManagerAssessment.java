package com.company.performance.domain.aggregate.reviewcycle;

import com.company.performance.domain.exception.InvalidAssessmentException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Entity representing a manager's assessment of an employee
 * Immutable after creation
 */
public class ManagerAssessment {
    
    private final AssessmentId id;
    private final Instant submittedDate;
    private final String overallComments;
    private final List<AssessmentScore> kpiScores;
    
    public ManagerAssessment(
            List<AssessmentScore> kpiScores,
            String overallComments) {
        
        validateKpiScores(kpiScores);
        
        this.id = AssessmentId.generate();
        this.submittedDate = Instant.now();
        this.kpiScores = new ArrayList<>(kpiScores);
        this.overallComments = overallComments;
    }
    
    private void validateKpiScores(List<AssessmentScore> scores) {
        if (scores == null || scores.isEmpty()) {
            throw new InvalidAssessmentException("At least one KPI score is required");
        }
    }
    
    public AssessmentId getId() {
        return id;
    }
    
    public Instant getSubmittedDate() {
        return submittedDate;
    }
    
    public String getOverallComments() {
        return overallComments;
    }
    
    public List<AssessmentScore> getKpiScores() {
        return Collections.unmodifiableList(kpiScores);
    }
}
