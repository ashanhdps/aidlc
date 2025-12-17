package com.company.performance.domain.aggregate.reviewcycle;

import com.company.performance.domain.exception.InvalidAssessmentException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Entity representing an employee's self-assessment
 * Immutable after creation
 */
public class SelfAssessment {
    
    private final AssessmentId id;
    private final Instant submittedDate;
    private final String comments;
    private final String extraMileEfforts;
    private final List<AssessmentScore> kpiScores;
    
    public SelfAssessment(
            List<AssessmentScore> kpiScores,
            String comments,
            String extraMileEfforts) {
        
        validateKpiScores(kpiScores);
        
        this.id = AssessmentId.generate();
        this.submittedDate = Instant.now();
        this.kpiScores = new ArrayList<>(kpiScores);
        this.comments = comments;
        this.extraMileEfforts = extraMileEfforts;
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
    
    public String getComments() {
        return comments;
    }
    
    public String getExtraMileEfforts() {
        return extraMileEfforts;
    }
    
    public List<AssessmentScore> getKpiScores() {
        return Collections.unmodifiableList(kpiScores);
    }
}
