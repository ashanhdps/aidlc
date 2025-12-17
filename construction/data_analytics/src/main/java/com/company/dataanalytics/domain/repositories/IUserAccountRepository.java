package com.company.dataanalytics.domain.repositories;

import com.company.dataanalytics.domain.aggregates.user.UserAccount;
import com.company.dataanalytics.domain.valueobjects.Email;
import com.company.dataanalytics.domain.valueobjects.RoleName;
import com.company.dataanalytics.domain.valueobjects.UserId;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserAccount aggregate
 */
public interface IUserAccountRepository {
    
    /**
     * Find user account by ID
     */
    Optional<UserAccount> findById(UserId userId);
    
    /**
     * Find user account by email
     */
    Optional<UserAccount> findByEmail(Email email);
    
    /**
     * Find all users with a specific role
     */
    List<UserAccount> findByRole(RoleName roleName);
    
    /**
     * Find all active users
     */
    List<UserAccount> findActiveUsers();
    
    /**
     * Find all users with pagination
     */
    List<UserAccount> findAll(int page, int size);
    
    /**
     * Save user account
     */
    void save(UserAccount userAccount);
    
    /**
     * Delete user account
     */
    void delete(UserId userId);
    
    /**
     * Check if email exists
     */
    boolean existsByEmail(Email email);
    
    /**
     * Count total users
     */
    long count();
    
    /**
     * Count active users
     */
    long countActive();
}