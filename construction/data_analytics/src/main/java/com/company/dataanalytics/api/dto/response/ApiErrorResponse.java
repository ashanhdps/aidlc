package com.company.dataanalytics.api.dto.response;

import java.time.Instant;

/**
 * Standard error response DTO for API errors
 */
public class ApiErrorResponse {
    
    private ErrorDetails error;
    
    public ApiErrorResponse() {}
    
    public ApiErrorResponse(String code, String message, String details, String requestId) {
        this.error = new ErrorDetails(code, message, details, Instant.now(), requestId);
    }
    
    public ErrorDetails getError() {
        return error;
    }
    
    public void setError(ErrorDetails error) {
        this.error = error;
    }
    
    public static class ErrorDetails {
        private String code;
        private String message;
        private String details;
        private Instant timestamp;
        private String requestId;
        
        public ErrorDetails() {}
        
        public ErrorDetails(String code, String message, String details, Instant timestamp, String requestId) {
            this.code = code;
            this.message = message;
            this.details = details;
            this.timestamp = timestamp;
            this.requestId = requestId;
        }
        
        // Getters and Setters
        public String getCode() {
            return code;
        }
        
        public void setCode(String code) {
            this.code = code;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
        
        public String getDetails() {
            return details;
        }
        
        public void setDetails(String details) {
            this.details = details;
        }
        
        public Instant getTimestamp() {
            return timestamp;
        }
        
        public void setTimestamp(Instant timestamp) {
            this.timestamp = timestamp;
        }
        
        public String getRequestId() {
            return requestId;
        }
        
        public void setRequestId(String requestId) {
            this.requestId = requestId;
        }
    }
}