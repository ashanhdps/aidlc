package com.company.dataanalytics.domain.aggregates.user;

import com.company.dataanalytics.domain.events.UserAccountCreated;
import com.company.dataanalytics.domain.events.UserAccountDeactivated;
import com.company.dataanalytics.domain.events.UserRoleChanged;
import com.company.dataanalytics.domain.shared.AggregateRoot;
import com.company.dataanalytics.domain.valueobjects.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Aggregate root for user account management
 */
public class UserAccount extends AggregateRoot<UserId> {
    
    private Email email;
    private String username;
    private Role role;
    private AccountStatus accountStatus;
    private final Instant createdDate;
    private LastLoginTime lastLoginTime;
    private UserId createdBy;
    private UserId updatedBy;
    private Instant updatedDate;
    private final List<ActivityLog> activityLogs;
    
    public UserAccount(UserId id, Email email, String username, Role role, UserId createdBy) {
        super(id);
        if (email == null) {
            throw new IllegalArgumentException("Email cannot be null");
        }
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }
        if (role == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }
        
        this.email = email;
        this.username = username.trim();
        this.role = role;
        this.accountStatus = AccountStatus.PENDING;
        this.createdDate = Instant.now();
        this.lastLoginTime = LastLoginTime.never();
        this.createdBy = createdBy;
        this.activityLogs = new ArrayList<>();
        
        // Raise domain event
        addDomainEvent(new UserAccountCreated(id, email, role.getRoleName()));
    }
    
    public static UserAccount create(Email email, String username, Role role, UserId createdBy) {
        return new UserAccount(UserId.generate(), email, username, role, createdBy);
    }
    
    public void activate(UserId updatedBy) {
        if (this.accountStatus.isActive()) {
            return; // Already active
        }
        
        this.accountStatus = AccountStatus.ACTIVE;
        this.updatedBy = updatedBy;
        this.updatedDate = Instant.now();
        
        logActivity("ACCOUNT_ACTIVATED");
    }
    
    public void deactivate(UserId updatedBy) {
        if (this.accountStatus.isInactive()) {
            return; // Already inactive
        }
        
        this.accountStatus = AccountStatus.INACTIVE;
        this.updatedBy = updatedBy;
        this.updatedDate = Instant.now();
        
        logActivity("ACCOUNT_DEACTIVATED");
        addDomainEvent(new UserAccountDeactivated(getId(), email));
    }
    
    public void suspend(UserId updatedBy) {
        this.accountStatus = AccountStatus.SUSPENDED;
        this.updatedBy = updatedBy;
        this.updatedDate = Instant.now();
        
        logActivity("ACCOUNT_SUSPENDED");
    }
    
    public void changeRole(Role newRole, UserId updatedBy) {
        if (newRole == null) {
            throw new IllegalArgumentException("New role cannot be null");
        }
        
        Role oldRole = this.role;
        this.role = newRole;
        this.updatedBy = updatedBy;
        this.updatedDate = Instant.now();
        
        logActivity("ROLE_CHANGED");
        addDomainEvent(new UserRoleChanged(getId(), oldRole.getRoleName(), newRole.getRoleName()));
    }
    
    public void updateEmail(Email newEmail, UserId updatedBy) {
        if (newEmail == null) {
            throw new IllegalArgumentException("Email cannot be null");
        }
        
        this.email = newEmail;
        this.updatedBy = updatedBy;
        this.updatedDate = Instant.now();
        
        logActivity("EMAIL_UPDATED");
    }
    
    public void recordLogin() {
        this.lastLoginTime = LastLoginTime.now();
        logActivity("LOGIN");
    }
    
    public void recordLogin(String ipAddress, String userAgent) {
        this.lastLoginTime = LastLoginTime.now();
        ActivityLog loginLog = ActivityLog.create(getId(), "LOGIN", null, null, ipAddress, userAgent);
        this.activityLogs.add(loginLog);
    }
    
    public boolean hasPermission(String resource, String action) {
        return role.hasPermission(resource, action);
    }
    
    public boolean canAccessSystem() {
        return accountStatus.isActive();
    }
    
    private void logActivity(String action) {
        ActivityLog log = ActivityLog.create(getId(), action);
        this.activityLogs.add(log);
    }
    
    // Getters
    public Email getEmail() {
        return email;
    }
    
    public String getUsername() {
        return username;
    }
    
    public Role getRole() {
        return role;
    }
    
    public AccountStatus getAccountStatus() {
        return accountStatus;
    }
    
    public Instant getCreatedDate() {
        return createdDate;
    }
    
    public LastLoginTime getLastLoginTime() {
        return lastLoginTime;
    }
    
    public UserId getCreatedBy() {
        return createdBy;
    }
    
    public UserId getUpdatedBy() {
        return updatedBy;
    }
    
    public Instant getUpdatedDate() {
        return updatedDate;
    }
    
    public List<ActivityLog> getActivityLogs() {
        return new ArrayList<>(activityLogs);
    }
}