package com.company.dataanalytics.infrastructure.repositories;

import com.company.dataanalytics.domain.aggregates.user.UserAccount;
import com.company.dataanalytics.domain.repositories.IUserAccountRepository;
import com.company.dataanalytics.domain.valueobjects.AccountStatus;
import com.company.dataanalytics.domain.valueobjects.Email;
import com.company.dataanalytics.domain.valueobjects.RoleName;
import com.company.dataanalytics.domain.valueobjects.UserId;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory implementation of IUserAccountRepository
 */
@Repository
public class InMemoryUserAccountRepository implements IUserAccountRepository {
    
    private final Map<UserId, UserAccount> users = new ConcurrentHashMap<>();
    private final Map<Email, UserId> emailIndex = new ConcurrentHashMap<>();
    
    @Override
    public Optional<UserAccount> findById(UserId userId) {
        return Optional.ofNullable(users.get(userId));
    }
    
    @Override
    public Optional<UserAccount> findByEmail(Email email) {
        UserId userId = emailIndex.get(email);
        return userId != null ? findById(userId) : Optional.empty();
    }
    
    @Override
    public List<UserAccount> findByRole(RoleName roleName) {
        return users.values().stream()
            .filter(user -> user.getRole().getRoleName().equals(roleName))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<UserAccount> findActiveUsers() {
        return users.values().stream()
            .filter(user -> user.getAccountStatus().isActive())
            .collect(Collectors.toList());
    }
    
    @Override
    public List<UserAccount> findAll(int page, int size) {
        return users.values().stream()
            .sorted((u1, u2) -> u1.getCreatedDate().compareTo(u2.getCreatedDate()))
            .skip((long) page * size)
            .limit(size)
            .collect(Collectors.toList());
    }
    
    @Override
    public void save(UserAccount userAccount) {
        if (userAccount == null) {
            throw new IllegalArgumentException("User account cannot be null");
        }
        
        // Update email index
        emailIndex.put(userAccount.getEmail(), userAccount.getId());
        
        // Save user
        users.put(userAccount.getId(), userAccount);
    }
    
    @Override
    public void delete(UserId userId) {
        UserAccount user = users.remove(userId);
        if (user != null) {
            emailIndex.remove(user.getEmail());
        }
    }
    
    @Override
    public boolean existsByEmail(Email email) {
        return emailIndex.containsKey(email);
    }
    
    @Override
    public long count() {
        return users.size();
    }
    
    @Override
    public long countActive() {
        return users.values().stream()
            .mapToLong(user -> user.getAccountStatus().isActive() ? 1 : 0)
            .sum();
    }
    
    // Additional utility methods for testing and demo
    public void clear() {
        users.clear();
        emailIndex.clear();
    }
    
    public List<UserAccount> findAll() {
        return new ArrayList<>(users.values());
    }
}