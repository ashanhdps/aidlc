package com.company.kpi.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * Standardized error response format as per integration contract
 */
@Schema(description = "Standard error response format")
public class ErrorResponse {
    
    @Schema(description = "Error details")
    private ErrorDetails error;
    
    public ErrorResponse() {}
    
    public ErrorResponse(String code, String message, String details, String requestId) {
        this.error = new ErrorDetails(code, message, details, requestId);
    }
    
    public ErrorDetails getError() {
        return error;
    }
    
    public void setError(ErrorDetails error) {
        this.error = error;
    }
    
    @Schema(description = "Error details object")
    public static class ErrorDetails {
        @Schema(description = "Error code", example = "VALIDATION_ERROR")
        private String code;
        
        @Schema(description = "Human readable error message", example = "Invalid input data")
        private String message;
        
        @Schema(description = "Additional error context", example = "Field 'name' is required")
        private String details;
        
        @Schema(description = "Request timestamp")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
        private LocalDateTime timestamp;
        
        @Schema(description = "Unique request identifier")
        private String requestId;
        
        public ErrorDetails() {
            this.timestamp = LocalDateTime.now();
        }
        
        public ErrorDetails(String code, String message, String details, String requestId) {
            this.code = code;
            this.message = message;
            this.details = details;
            this.requestId = requestId;
            this.timestamp = LocalDateTime.now();
        }
        
        // Getters and setters
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        
        public String getRequestId() { return requestId; }
        public void setRequestId(String requestId) { this.requestId = requestId; }
    }
}