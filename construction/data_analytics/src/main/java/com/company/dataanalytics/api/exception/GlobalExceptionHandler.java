package com.company.dataanalytics.api.exception;

import com.company.dataanalytics.api.dto.response.ApiErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Global exception handler for REST API controllers
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    /**
     * Handle validation errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex, WebRequest request) {
        String requestId = UUID.randomUUID().toString();
        
        String details = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        
        ApiErrorResponse errorResponse = new ApiErrorResponse(
            "VALIDATION_ERROR",
            "Request validation failed",
            details,
            requestId
        );
        
        logger.warn("Validation error [{}]: {}", requestId, details);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
    
    /**
     * Handle illegal argument exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        String requestId = UUID.randomUUID().toString();
        
        ApiErrorResponse errorResponse = new ApiErrorResponse(
            "INVALID_ARGUMENT",
            "Invalid argument provided",
            ex.getMessage(),
            requestId
        );
        
        logger.warn("Invalid argument error [{}]: {}", requestId, ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
    
    /**
     * Handle illegal state exceptions
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalStateException(IllegalStateException ex, WebRequest request) {
        String requestId = UUID.randomUUID().toString();
        
        ApiErrorResponse errorResponse = new ApiErrorResponse(
            "INVALID_STATE",
            "Invalid operation state",
            ex.getMessage(),
            requestId
        );
        
        logger.warn("Invalid state error [{}]: {}", requestId, ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }
    
    /**
     * Handle runtime exceptions
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiErrorResponse> handleRuntimeException(RuntimeException ex, WebRequest request) {
        String requestId = UUID.randomUUID().toString();
        
        ApiErrorResponse errorResponse = new ApiErrorResponse(
            "RUNTIME_ERROR",
            "An unexpected error occurred",
            ex.getMessage(),
            requestId
        );
        
        logger.error("Runtime error [{}]: {}", requestId, ex.getMessage(), ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
    
    /**
     * Handle all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(Exception ex, WebRequest request) {
        String requestId = UUID.randomUUID().toString();
        
        ApiErrorResponse errorResponse = new ApiErrorResponse(
            "INTERNAL_ERROR",
            "An internal server error occurred",
            "Please contact support with request ID: " + requestId,
            requestId
        );
        
        logger.error("Unexpected error [{}]: {}", requestId, ex.getMessage(), ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}