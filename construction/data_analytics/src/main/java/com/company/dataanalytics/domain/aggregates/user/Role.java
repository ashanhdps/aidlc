package com.company.dataanalytics.domain.aggregates.user;

import com.company.dataanalytics.domain.shared.Entity;
import com.company.dataanalytics.domain.valueobjects.RoleName;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Entity representing a user role with permissions
 */
public class Role extends Entity<UUID> {
    
    private final RoleName roleName;
    private final String description;
    private final Set<Permission> permissions;
    private final Instant createdDate;
    private boolean isActive;
    
    public Role(UUID id, RoleName roleName, String description) {
        super(id);
        if (roleName == null) {
            throw new IllegalArgumentException("Role name cannot be null");
        }
        this.roleName = roleName;
        this.description = description;
        this.permissions = new HashSet<>();
        this.createdDate = Instant.now();
        this.isActive = true;
    }
    
    public static Role create(RoleName roleName, String description) {
        return new Role(UUID.randomUUID(), roleName, description);
    }
    
    public void addPermission(Permission permission) {
        if (permission == null) {
            throw new IllegalArgumentException("Permission cannot be null");
        }
        this.permissions.add(permission);
    }
    
    public void removePermission(Permission permission) {
        this.permissions.remove(permission);
    }
    
    public boolean hasPermission(String resource, String action) {
        return permissions.stream()
            .anyMatch(p -> p.allows(resource, action));
    }
    
    public void activate() {
        this.isActive = true;
    }
    
    public void deactivate() {
        this.isActive = false;
    }
    
    // Getters
    public RoleName getRoleName() {
        return roleName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public Set<Permission> getPermissions() {
        return new HashSet<>(permissions);
    }
    
    public Instant getCreatedDate() {
        return createdDate;
    }
    
    public boolean isActive() {
        return isActive;
    }
}