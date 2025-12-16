package com.company.performance.api.exception;

import com.company.performance.domain.exception.DomainException;
import com.company.performance.domain.exception.FeedbackNotFoundException;
import com.company.performance.domain.exception.InvalidAssessmentException;
import com.company.performance.domain.exception.ReviewCycleNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for REST API
 * Converts domain exceptions to appropriate HTTP responses
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ReviewCycleNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleReviewCycleNotFound(
            ReviewCycleNotFoundException ex) {
        
        return buildErrorResponse(
            "REVIEW_CYCLE_NOT_FOUND",
            ex.getMessage(),
            HttpStatus.NOT_FOUND
        );
    }
    
    @ExceptionHandler(FeedbackNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleFeedbackNotFound(
            FeedbackNotFoundException ex) {
        
        return buildErrorResponse(
            "FEEDBACK_NOT_FOUND",
            ex.getMessage(),
            HttpStatus.NOT_FOUND
        );
    }
    
    @ExceptionHandler(InvalidAssessmentException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidAssessment(
            InvalidAssessmentException ex) {
        
        return buildErrorResponse(
            "INVALID_ASSESSMENT",
            ex.getMessage(),
            HttpStatus.BAD_REQUEST
        );
    }
    
    @ExceptionHandler(DomainException.class)
    public ResponseEntity<Map<String, Object>> handleDomainException(
            DomainException ex) {
        
        return buildErrorResponse(
            "DOMAIN_ERROR",
            ex.getMessage(),
            HttpStatus.BAD_REQUEST
        );
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex) {
        
        return buildErrorResponse(
            "INVALID_REQUEST",
            ex.getMessage(),
            HttpStatus.BAD_REQUEST
        );
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex) {
        
        return buildErrorResponse(
            "INTERNAL_SERVER_ERROR",
            "An unexpected error occurred: " + ex.getMessage(),
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
    
    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            String errorCode,
            String message,
            HttpStatus status) {
        
        Map<String, Object> error = new HashMap<>();
        error.put("code", errorCode);
        error.put("message", message);
        error.put("timestamp", Instant.now().toString());
        error.put("status", status.value());
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", error);
        
        return ResponseEntity.status(status).body(response);
    }
}
