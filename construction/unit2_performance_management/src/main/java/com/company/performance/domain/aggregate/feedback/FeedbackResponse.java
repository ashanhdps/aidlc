package com.company.performance.domain.aggregate.feedback;

import com.company.performance.domain.aggregate.reviewcycle.UserId;
import com.company.performance.domain.exception.InvalidFeedbackOperationException;

import java.time.Instant;

/**
 * Entity representing a response to feedback
 * Immutable after creation
 */
public class FeedbackResponse {
    
    private final ResponseId id;
    private final UserId responderId;
    private final String responseText;
    private final Instant responseDate;
    
    public FeedbackResponse(
            UserId responderId,
            String responseText) {
        
        validateResponseText(responseText);
        
        this.id = ResponseId.generate();
        this.responderId = responderId;
        this.responseText = responseText;
        this.responseDate = Instant.now();
    }
    
    private void validateResponseText(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new InvalidFeedbackOperationException(
                "Response text cannot be empty"
            );
        }
        if (text.length() > 2000) {
            throw new InvalidFeedbackOperationException(
                "Response text cannot exceed 2000 characters"
            );
        }
    }
    
    public ResponseId getId() {
        return id;
    }
    
    public UserId getResponderId() {
        return responderId;
    }
    
    public String getResponseText() {
        return responseText;
    }
    
    public Instant getResponseDate() {
        return responseDate;
    }
}
