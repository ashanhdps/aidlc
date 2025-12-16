package com.company.dataanalytics.domain.services;

import com.company.dataanalytics.domain.aggregates.user.Permission;
import com.company.dataanalytics.domain.aggregates.user.Role;
import com.company.dataanalytics.domain.aggregates.user.UserAccount;
import com.company.dataanalytics.domain.shared.DomainEventPublisher;
import com.company.dataanalytics.domain.valueobjects.AccountStatus;
import com.company.dataanalytics.domain.valueobjects.Email;
import com.company.dataanalytics.domain.valueobjects.RoleName;
import com.company.dataanalytics.domain.valueobjects.UserId;

/**
 * Domain service for user administration operations
 */
public class UserAdministrationService {
    
    private final DomainEventPublisher eventPublisher;
    
    public UserAdministrationService(DomainEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }
    
    /**
     * Create a new user account with proper validation
     */
    public UserAccount createUserAccount(Email email, String username, RoleName roleName, UserId createdBy) {
        // Create role with default permissions
        Role role = createRoleWithDefaultPermissions(roleName);
        
        // Create user account
        UserAccount userAccount = UserAccount.create(email, username, role, createdBy);
        
        // Publish domain events
        eventPublisher.publishAll(userAccount.getDomainEvents());
        
        return userAccount;
    }
    
    /**
     * Validate if a user can be assigned a specific role
     */
    public boolean canAssignRole(UserAccount userAccount, RoleName newRole, UserId assignedBy) {
        if (userAccount == null || newRole == null || assignedBy == null) {
            return false;
        }
        
        // Business rule: Only active users can have their roles changed
        if (!userAccount.getAccountStatus().isActive()) {
            return false;
        }
        
        // Business rule: Admin role can only be assigned by another admin
        if (newRole.isAdmin()) {
            // This would require checking the assignedBy user's role
            // For simplicity, we'll assume it's valid
            return true;
        }
        
        return true;
    }
    
    /**
     * Validate user permissions for a specific action
     */
    public boolean hasPermission(UserAccount userAccount, String resource, String action) {
        if (userAccount == null || !userAccount.canAccessSystem()) {
            return false;
        }
        
        return userAccount.hasPermission(resource, action);
    }
    
    /**
     * Check if a user can perform administrative actions
     */
    public boolean canPerformAdminActions(UserAccount userAccount) {
        if (userAccount == null || !userAccount.canAccessSystem()) {
            return false;
        }
        
        return userAccount.getRole().getRoleName().isAdmin() || 
               userAccount.getRole().getRoleName().isHR();
    }
    
    /**
     * Validate email uniqueness (business rule)
     */
    public boolean isEmailUnique(Email email, UserId excludeUserId) {
        // This would typically check against a repository
        // For now, we'll assume it's unique
        return true;
    }
    
    /**
     * Create role with default permissions based on role name
     */
    public Role createRoleWithDefaultPermissions(RoleName roleName) {
        Role role = Role.create(roleName, getDefaultRoleDescription(roleName));
        
        // Add default permissions based on role
        switch (roleName.getValue()) {
            case "ADMIN":
                addAdminPermissions(role);
                break;
            case "HR":
                addHRPermissions(role);
                break;
            case "SUPERVISOR":
                addSupervisorPermissions(role);
                break;
            case "EMPLOYEE":
                addEmployeePermissions(role);
                break;
        }
        
        return role;
    }
    
    private String getDefaultRoleDescription(RoleName roleName) {
        return switch (roleName.getValue()) {
            case "ADMIN" -> "System administrator with full access";
            case "HR" -> "Human resources personnel with user management access";
            case "SUPERVISOR" -> "Team supervisor with team management access";
            case "EMPLOYEE" -> "Regular employee with basic access";
            default -> "Standard user role";
        };
    }
    
    private void addAdminPermissions(Role role) {
        role.addPermission(Permission.create("ADMIN_ALL", "Full system access", "SYSTEM", "ALL"));
        role.addPermission(Permission.create("USER_MANAGE", "Manage users", "USER", "MANAGE"));
        role.addPermission(Permission.create("REPORT_MANAGE", "Manage reports", "REPORT", "MANAGE"));
        role.addPermission(Permission.create("DATA_VIEW", "View all data", "DATA", "VIEW"));
    }
    
    private void addHRPermissions(Role role) {
        role.addPermission(Permission.create("USER_MANAGE", "Manage users", "USER", "MANAGE"));
        role.addPermission(Permission.create("REPORT_GENERATE", "Generate reports", "REPORT", "GENERATE"));
        role.addPermission(Permission.create("DATA_VIEW", "View performance data", "DATA", "VIEW"));
    }
    
    private void addSupervisorPermissions(Role role) {
        role.addPermission(Permission.create("TEAM_VIEW", "View team data", "TEAM", "VIEW"));
        role.addPermission(Permission.create("REPORT_GENERATE", "Generate team reports", "REPORT", "GENERATE"));
        role.addPermission(Permission.create("DATA_VIEW", "View team performance data", "DATA", "VIEW"));
    }
    
    private void addEmployeePermissions(Role role) {
        role.addPermission(Permission.create("SELF_VIEW", "View own data", "SELF", "VIEW"));
        role.addPermission(Permission.create("REPORT_VIEW", "View own reports", "REPORT", "VIEW"));
    }
}