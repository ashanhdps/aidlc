package com.company.kpi.controller;

import com.company.kpi.model.AISuggestion;
import com.company.kpi.model.dto.AISuggestionDecisionRequest;
import com.company.kpi.model.dto.GenerateAISuggestionRequest;
import com.company.kpi.service.AISuggestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for AI KPI Suggestions
 */
@RestController
@RequestMapping("/kpi-management/ai-suggestions")
@Tag(name = "AI Suggestions", description = "AI-powered KPI suggestion APIs")
public class AISuggestionController {
    
    private static final Logger logger = LoggerFactory.getLogger(AISuggestionController.class);
    
    @Autowired
    private AISuggestionService aiSuggestionService;
    
    @Operation(summary = "Retrieve pending AI KPI suggestions")
    @ApiResponse(responseCode = "200", description = "AI suggestions retrieved successfully")
    @GetMapping
    public ResponseEntity<List<AISuggestion>> getAISuggestions(
            @Parameter(description = "Filter by status") @RequestParam(required = false) String status,
            @Parameter(description = "Filter by job title") @RequestParam(required = false) String job_title,
            @Parameter(description = "Filter by department") @RequestParam(required = false) String department,
            @Parameter(description = "Filter by assigned user") @RequestParam(required = false) String assigned_to) {
        
        logger.debug("Getting AI suggestions - status: {}, job_title: {}, department: {}, assigned_to: {}", 
            status, job_title, department, assigned_to);
        
        try {
            AISuggestion.SuggestionStatus suggestionStatus = null;
            if (status != null) {
                try {
                    suggestionStatus = AISuggestion.SuggestionStatus.valueOf(status.toUpperCase());
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid suggestion status: {}", status);
                    return ResponseEntity.badRequest().build();
                }
            }
            
            List<AISuggestion> suggestions = aiSuggestionService.getPendingSuggestions(
                suggestionStatus, job_title, department, assigned_to);
            
            return ResponseEntity.ok(suggestions);
            
        } catch (Exception e) {
            logger.error("Error retrieving AI suggestions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Generate AI KPI suggestions for job title")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "AI suggestions generated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    @PostMapping("/generate")
    public ResponseEntity<List<AISuggestion>> generateSuggestions(
            @Valid @RequestBody GenerateAISuggestionRequest request) {
        
        logger.info("Generating AI suggestions for job title: {} in department: {}", 
            request.getJob_title(), request.getDepartment());
        
        try {
            List<AISuggestion> suggestions = aiSuggestionService.generateSuggestions(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(suggestions);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid suggestion generation request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error generating AI suggestions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Approve or reject AI suggestion")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "AI suggestion updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid decision request"),
        @ApiResponse(responseCode = "404", description = "AI suggestion not found")
    })
    @PutMapping("/{suggestion_id}/approve")
    public ResponseEntity<AISuggestion> updateSuggestionStatus(
            @Parameter(description = "AI Suggestion ID") @PathVariable String suggestion_id,
            @Valid @RequestBody AISuggestionDecisionRequest request,
            Authentication authentication) {
        
        logger.info("Updating AI suggestion {} to status: {} by user: {}", 
            suggestion_id, request.getStatus(), authentication.getName());
        
        try {
            AISuggestion updatedSuggestion = aiSuggestionService.updateSuggestionStatus(
                suggestion_id, request.getStatus(), request.getFeedback(), authentication.getName());
            
            return ResponseEntity.ok(updatedSuggestion);
            
        } catch (IllegalArgumentException e) {
            logger.warn("AI suggestion not found: {}", suggestion_id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating AI suggestion: {}", suggestion_id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get AI suggestion history for user")
    @ApiResponse(responseCode = "200", description = "AI suggestion history retrieved successfully")
    @GetMapping("/history/{user_id}")
    public ResponseEntity<List<AISuggestion>> getSuggestionHistory(
            @Parameter(description = "User ID") @PathVariable String user_id) {
        
        logger.debug("Getting AI suggestion history for user: {}", user_id);
        
        try {
            List<AISuggestion> history = aiSuggestionService.getSuggestionHistory(user_id);
            return ResponseEntity.ok(history);
            
        } catch (Exception e) {
            logger.error("Error retrieving AI suggestion history for user: {}", user_id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}