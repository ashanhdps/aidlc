package com.company.dataanalytics.application.services;

import com.company.dataanalytics.domain.aggregates.user.UserAccount;
import com.company.dataanalytics.domain.repositories.IUserAccountRepository;
import com.company.dataanalytics.domain.services.UserAdministrationService;
import com.company.dataanalytics.domain.shared.DomainEventPublisher;
import com.company.dataanalytics.domain.valueobjects.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Application service for user management use cases
 */
@Service
@Transactional
public class UserApplicationService {
    
    private final IUserAccountRepository userRepository;
    private final UserAdministrationService userAdminService;
    private final DomainEventPublisher eventPublisher;
    
    public UserApplicationService(IUserAccountRepository userRepository,
                                UserAdministrationService userAdminService,
                                DomainEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.userAdminService = userAdminService;
        this.eventPublisher = eventPublisher;
    }
    
    /**
     * Create a new user account
     */
    public UserId createUser(String email, String username, String password, String roleName, UserId createdBy) {
        // Validate email uniqueness
        Email userEmail = Email.of(email);
        if (userRepository.existsByEmail(userEmail)) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }
        
        // Create user account through domain service
        RoleName role = RoleName.of(roleName);
        UserAccount userAccount = userAdminService.createUserAccount(userEmail, username, password, role, createdBy);
        
        // Save user account
        userRepository.save(userAccount);
        
        // Publish domain events
        eventPublisher.publishAll(userAccount.getDomainEvents());
        userAccount.clearDomainEvents();
        
        return userAccount.getId();
    }
    
    /**
     * Update user information
     */
    public void updateUser(UserId userId, String newEmail, UserId updatedBy) {
        UserAccount userAccount = getUserById(userId);
        
        if (newEmail != null && !newEmail.trim().isEmpty()) {
            Email email = Email.of(newEmail);
            
            // Check email uniqueness
            if (userRepository.existsByEmail(email) && !userAccount.getEmail().equals(email)) {
                throw new IllegalArgumentException("Email already exists: " + newEmail);
            }
            
            userAccount.updateEmail(email, updatedBy);
        }
        
        userRepository.save(userAccount);
        eventPublisher.publishAll(userAccount.getDomainEvents());
        userAccount.clearDomainEvents();
    }
    
    /**
     * Change user role
     */
    public void changeUserRole(UserId userId, String newRoleName, UserId changedBy) {
        UserAccount userAccount = getUserById(userId);
        RoleName roleName = RoleName.of(newRoleName);
        
        // Validate role change through domain service
        if (!userAdminService.canAssignRole(userAccount, roleName, changedBy)) {
            throw new IllegalArgumentException("Cannot assign role " + newRoleName + " to user");
        }
        
        // Create new role with permissions
        var newRole = userAdminService.createRoleWithDefaultPermissions(roleName);
        userAccount.changeRole(newRole, changedBy);
        
        userRepository.save(userAccount);
        eventPublisher.publishAll(userAccount.getDomainEvents());
        userAccount.clearDomainEvents();
    }
    
    /**
     * Activate user account
     */
    public void activateUser(UserId userId, UserId activatedBy) {
        UserAccount userAccount = getUserById(userId);
        userAccount.activate(activatedBy);
        
        userRepository.save(userAccount);
        eventPublisher.publishAll(userAccount.getDomainEvents());
        userAccount.clearDomainEvents();
    }
    
    /**
     * Deactivate user account
     */
    public void deactivateUser(UserId userId, UserId deactivatedBy) {
        UserAccount userAccount = getUserById(userId);
        userAccount.deactivate(deactivatedBy);
        
        userRepository.save(userAccount);
        eventPublisher.publishAll(userAccount.getDomainEvents());
        userAccount.clearDomainEvents();
    }
    
    /**
     * Record user login
     */
    public void recordLogin(UserId userId, String ipAddress, String userAgent) {
        UserAccount userAccount = getUserById(userId);
        userAccount.recordLogin(ipAddress, userAgent);
        
        userRepository.save(userAccount);
    }
    
    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public UserAccount getUserById(UserId userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }
    
    /**
     * Get user by email
     */
    @Transactional(readOnly = true)
    public Optional<UserAccount> getUserByEmail(String email) {
        return userRepository.findByEmail(Email.of(email));
    }
    
    /**
     * Get user by username
     */
    @Transactional(readOnly = true)
    public Optional<UserAccount> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Get all active users
     */
    @Transactional(readOnly = true)
    public List<UserAccount> getActiveUsers() {
        return userRepository.findActiveUsers();
    }
    
    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<UserAccount> getUsersByRole(String roleName) {
        return userRepository.findByRole(RoleName.of(roleName));
    }
    
    /**
     * Get users with pagination
     */
    @Transactional(readOnly = true)
    public List<UserAccount> getUsers(int page, int size) {
        return userRepository.findAll(page, size);
    }
    
    /**
     * Check if user has permission
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(UserId userId, String resource, String action) {
        UserAccount userAccount = getUserById(userId);
        return userAdminService.hasPermission(userAccount, resource, action);
    }
    
    /**
     * Check if user can perform admin actions
     */
    @Transactional(readOnly = true)
    public boolean canPerformAdminActions(UserId userId) {
        UserAccount userAccount = getUserById(userId);
        return userAdminService.canPerformAdminActions(userAccount);
    }
}