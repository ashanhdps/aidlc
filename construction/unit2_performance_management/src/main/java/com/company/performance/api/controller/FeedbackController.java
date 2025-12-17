package com.company.performance.api.controller;

import com.company.performance.api.dto.request.ProvideFeedbackRequest;
import com.company.performance.api.dto.request.RespondToFeedbackRequest;
import com.company.performance.application.service.FeedbackApplicationService;
import com.company.performance.domain.aggregate.feedback.FeedbackId;
import com.company.performance.domain.aggregate.feedback.FeedbackRecord;
import com.company.performance.domain.aggregate.feedback.FeedbackType;
import com.company.performance.domain.aggregate.reviewcycle.KPIId;
import com.company.performance.domain.aggregate.reviewcycle.UserId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for Feedback operations
 * Implements US-019 and US-020
 */
@RestController
@RequestMapping("/api/v1/performance-management/feedback")
public class FeedbackController {
    
    private final FeedbackApplicationService feedbackService;
    
    public FeedbackController(FeedbackApplicationService feedbackService) {
        this.feedbackService = feedbackService;
    }
    
    /**
     * Provide feedback (US-019)
     * POST /api/v1/performance-management/feedback
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> provideFeedback(
            @RequestHeader("X-User-Id") String giverId,
            @RequestBody ProvideFeedbackRequest request) {
        
        // Execute use case
        FeedbackId feedbackId = feedbackService.provideFeedback(
            UserId.of(giverId),
            UserId.of(request.getReceiverId()),
            KPIId.of(request.getKpiId()),
            request.getKpiName(),
            FeedbackType.valueOf(request.getFeedbackType()),
            request.getContentText()
        );
        
        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Feedback provided successfully");
        response.put("feedbackId", feedbackId.toString());
        response.put("giverId", giverId);
        response.put("receiverId", request.getReceiverId());
        response.put("status", "CREATED");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get feedback for employee (US-020)
     * GET /api/v1/performance-management/feedback/employee/{employeeId}
     */
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<Map<String, Object>> getFeedbackForEmployee(
            @PathVariable String employeeId) {
        
        List<FeedbackRecord> feedbackList = feedbackService.getFeedbackForEmployee(
            UserId.of(employeeId)
        );
        
        List<Map<String, Object>> feedbackDTOs = feedbackList.stream()
            .map(this::mapFeedbackToDTO)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("feedback", feedbackDTOs);
        response.put("totalCount", feedbackList.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get specific feedback details
     * GET /api/v1/performance-management/feedback/{feedbackId}
     */
    @GetMapping("/{feedbackId}")
    public ResponseEntity<Map<String, Object>> getFeedback(@PathVariable String feedbackId) {
        FeedbackRecord feedback = feedbackService.getFeedback(FeedbackId.of(feedbackId));
        
        Map<String, Object> response = mapFeedbackToDTO(feedback);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Acknowledge feedback (US-020)
     * PUT /api/v1/performance-management/feedback/{feedbackId}/acknowledge
     */
    @PutMapping("/{feedbackId}/acknowledge")
    public ResponseEntity<Map<String, Object>> acknowledgeFeedback(
            @PathVariable String feedbackId) {
        
        feedbackService.acknowledgeFeedback(FeedbackId.of(feedbackId));
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Feedback acknowledged successfully");
        response.put("feedbackId", feedbackId);
        response.put("status", "ACKNOWLEDGED");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Respond to feedback (US-020)
     * POST /api/v1/performance-management/feedback/{feedbackId}/responses
     */
    @PostMapping("/{feedbackId}/responses")
    public ResponseEntity<Map<String, Object>> respondToFeedback(
            @PathVariable String feedbackId,
            @RequestHeader("X-User-Id") String responderId,
            @RequestBody RespondToFeedbackRequest request) {
        
        feedbackService.respondToFeedback(
            FeedbackId.of(feedbackId),
            UserId.of(responderId),
            request.getResponseText()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Response submitted successfully");
        response.put("feedbackId", feedbackId);
        response.put("responderId", responderId);
        response.put("status", "RESPONDED");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Resolve feedback
     * PUT /api/v1/performance-management/feedback/{feedbackId}/resolve
     */
    @PutMapping("/{feedbackId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveFeedback(
            @PathVariable String feedbackId) {
        
        feedbackService.resolveFeedback(FeedbackId.of(feedbackId));
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Feedback resolved successfully");
        response.put("feedbackId", feedbackId);
        response.put("status", "RESOLVED");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get unresolved feedback for employee
     * GET /api/v1/performance-management/feedback/employee/{employeeId}/unresolved
     */
    @GetMapping("/employee/{employeeId}/unresolved")
    public ResponseEntity<Map<String, Object>> getUnresolvedFeedback(
            @PathVariable String employeeId) {
        
        List<FeedbackRecord> feedbackList = feedbackService.getUnresolvedFeedback(
            UserId.of(employeeId)
        );
        
        List<Map<String, Object>> feedbackDTOs = feedbackList.stream()
            .map(this::mapFeedbackToDTO)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("feedback", feedbackDTOs);
        response.put("totalCount", feedbackList.size());
        
        return ResponseEntity.ok(response);
    }
    
    // Helper method to map domain object to DTO
    private Map<String, Object> mapFeedbackToDTO(FeedbackRecord feedback) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("feedbackId", feedback.getId().toString());
        dto.put("giverId", feedback.getGiverId().toString());
        dto.put("receiverId", feedback.getReceiverId().toString());
        dto.put("kpiId", feedback.getContext().getKpiId().toString());
        dto.put("kpiName", feedback.getContext().getKpiName());
        dto.put("feedbackType", feedback.getFeedbackType().toString());
        dto.put("contentText", feedback.getContext().getContentText());
        dto.put("status", feedback.getStatus().toString());
        dto.put("createdDate", feedback.getCreatedDate().toString());
        dto.put("responseCount", feedback.getResponses().size());
        
        return dto;
    }
}
