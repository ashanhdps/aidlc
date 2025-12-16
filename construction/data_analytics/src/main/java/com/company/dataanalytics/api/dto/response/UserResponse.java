package com.company.dataanalytics.api.dto.response;

import java.time.Instant;

/**
 * Response DTO for user information
 */
public class UserResponse {
    
    private String id;
    private String email;
    private String username;
    private String role;
    private String accountStatus;
    private Instant createdDate;
    private Instant lastLoginTime;
    private String createdBy;
    private String updatedBy;
    private Instant updatedDate;
    
    // Constructors
    public UserResponse() {}
    
    public UserResponse(String id, String email, String username, String role, String accountStatus,
                       Instant createdDate, Instant lastLoginTime, String createdBy, String updatedBy, Instant updatedDate) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.role = role;
        this.accountStatus = accountStatus;
        this.createdDate = createdDate;
        this.lastLoginTime = lastLoginTime;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.updatedDate = updatedDate;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getAccountStatus() {
        return accountStatus;
    }
    
    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }
    
    public Instant getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }
    
    public Instant getLastLoginTime() {
        return lastLoginTime;
    }
    
    public void setLastLoginTime(Instant lastLoginTime) {
        this.lastLoginTime = lastLoginTime;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public String getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    public Instant getUpdatedDate() {
        return updatedDate;
    }
    
    public void setUpdatedDate(Instant updatedDate) {
        this.updatedDate = updatedDate;
    }
}