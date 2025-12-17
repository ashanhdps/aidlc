package com.company.dataanalytics.domain.aggregates.user;

import com.company.dataanalytics.domain.shared.Entity;
import com.company.dataanalytics.domain.valueobjects.UserId;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing a user activity log entry
 */
public class ActivityLog extends Entity<UUID> {
    
    private final UserId userId;
    private final String action;
    private final String resource;
    private final UUID resourceId;
    private final Instant timestamp;
    private final String ipAddress;
    private final String userAgent;
    
    public ActivityLog(UUID id, UserId userId, String action, String resource, 
                      UUID resourceId, String ipAddress, String userAgent) {
        super(id);
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (action == null || action.trim().isEmpty()) {
            throw new IllegalArgumentException("Action cannot be null or empty");
        }
        
        this.userId = userId;
        this.action = action.trim();
        this.resource = resource;
        this.resourceId = resourceId;
        this.timestamp = Instant.now();
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }
    
    public static ActivityLog create(UserId userId, String action, String resource, 
                                   UUID resourceId, String ipAddress, String userAgent) {
        return new ActivityLog(UUID.randomUUID(), userId, action, resource, 
                             resourceId, ipAddress, userAgent);
    }
    
    public static ActivityLog create(UserId userId, String action) {
        return create(userId, action, null, null, null, null);
    }
    
    // Getters
    public UserId getUserId() {
        return userId;
    }
    
    public String getAction() {
        return action;
    }
    
    public String getResource() {
        return resource;
    }
    
    public UUID getResourceId() {
        return resourceId;
    }
    
    public Instant getTimestamp() {
        return timestamp;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
}