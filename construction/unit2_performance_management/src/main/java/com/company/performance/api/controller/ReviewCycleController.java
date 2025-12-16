package com.company.performance.api.controller;

import com.company.performance.api.dto.request.SubmitManagerAssessmentRequest;
import com.company.performance.api.dto.request.SubmitSelfAssessmentRequest;
import com.company.performance.application.service.ReviewCycleApplicationService;
import com.company.performance.domain.aggregate.reviewcycle.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for Review Cycle operations
 * Implements US-016 and US-017
 */
@RestController
@RequestMapping("/api/v1/performance-management/cycles")
public class ReviewCycleController {
    
    private final ReviewCycleApplicationService reviewCycleService;
    
    public ReviewCycleController(ReviewCycleApplicationService reviewCycleService) {
        this.reviewCycleService = reviewCycleService;
    }
    
    /**
     * Submit self-assessment (US-016)
     * POST /api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/self-assessment
     */
    @PostMapping("/{cycleId}/participants/{participantId}/self-assessment")
    public ResponseEntity<Map<String, Object>> submitSelfAssessment(
            @PathVariable String cycleId,
            @PathVariable String participantId,
            @RequestBody SubmitSelfAssessmentRequest request) {
        
        // Convert DTOs to domain objects
        List<AssessmentScore> scores = request.getKpiScores().stream()
            .map(dto -> new AssessmentScore(
                KPIId.of(dto.getKpiId()),
                dto.getRatingValue(),
                dto.getAchievementPercentage(),
                dto.getComment()
            ))
            .collect(Collectors.toList());
        
        // Execute use case
        reviewCycleService.submitSelfAssessment(
            ReviewCycleId.of(cycleId),
            ParticipantId.of(participantId),
            scores,
            request.getComments(),
            request.getExtraMileEfforts()
        );
        
        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Self-assessment submitted successfully");
        response.put("cycleId", cycleId);
        response.put("participantId", participantId);
        response.put("status", "SELF_ASSESSMENT_SUBMITTED");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Submit manager assessment (US-017)
     * POST /api/v1/performance-management/cycles/{cycleId}/participants/{participantId}/manager-assessment
     */
    @PostMapping("/{cycleId}/participants/{participantId}/manager-assessment")
    public ResponseEntity<Map<String, Object>> submitManagerAssessment(
            @PathVariable String cycleId,
            @PathVariable String participantId,
            @RequestBody SubmitManagerAssessmentRequest request) {
        
        // Convert DTOs to domain objects
        List<AssessmentScore> scores = request.getKpiScores().stream()
            .map(dto -> new AssessmentScore(
                KPIId.of(dto.getKpiId()),
                dto.getRatingValue(),
                dto.getAchievementPercentage(),
                dto.getComment()
            ))
            .collect(Collectors.toList());
        
        // Execute use case
        reviewCycleService.submitManagerAssessment(
            ReviewCycleId.of(cycleId),
            ParticipantId.of(participantId),
            scores,
            request.getOverallComments()
        );
        
        // Get updated cycle to retrieve final score
        ReviewCycle cycle = reviewCycleService.getReviewCycle(ReviewCycleId.of(cycleId));
        ReviewParticipant participant = cycle.getParticipants().stream()
            .filter(p -> p.getId().toString().equals(participantId))
            .findFirst()
            .orElseThrow();
        
        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Manager assessment submitted successfully");
        response.put("cycleId", cycleId);
        response.put("participantId", participantId);
        response.put("finalScore", participant.getFinalScore());
        response.put("status", "MANAGER_ASSESSMENT_SUBMITTED");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get review cycle details
     * GET /api/v1/performance-management/cycles/{cycleId}
     */
    @GetMapping("/{cycleId}")
    public ResponseEntity<Map<String, Object>> getReviewCycle(@PathVariable String cycleId) {
        ReviewCycle cycle = reviewCycleService.getReviewCycle(ReviewCycleId.of(cycleId));
        
        Map<String, Object> response = new HashMap<>();
        response.put("cycleId", cycle.getId().toString());
        response.put("cycleName", cycle.getCycleName());
        response.put("startDate", cycle.getStartDate().toString());
        response.put("endDate", cycle.getEndDate().toString());
        response.put("status", cycle.getStatus().toString());
        response.put("participantCount", cycle.getParticipants().size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all review cycles
     * GET /api/v1/performance-management/cycles
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllReviewCycles() {
        List<ReviewCycle> cycles = reviewCycleService.getAllReviewCycles();
        
        List<Map<String, Object>> cycleList = cycles.stream()
            .map(cycle -> {
                Map<String, Object> cycleMap = new HashMap<>();
                cycleMap.put("cycleId", cycle.getId().toString());
                cycleMap.put("cycleName", cycle.getCycleName());
                cycleMap.put("status", cycle.getStatus().toString());
                cycleMap.put("participantCount", cycle.getParticipants().size());
                return cycleMap;
            })
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("cycles", cycleList);
        response.put("totalCount", cycles.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Complete review cycle
     * PUT /api/v1/performance-management/cycles/{cycleId}/complete
     */
    @PutMapping("/{cycleId}/complete")
    public ResponseEntity<Map<String, Object>> completeReviewCycle(@PathVariable String cycleId) {
        reviewCycleService.completeReviewCycle(ReviewCycleId.of(cycleId));
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Review cycle completed successfully");
        response.put("cycleId", cycleId);
        response.put("status", "COMPLETED");
        
        return ResponseEntity.ok(response);
    }
}
