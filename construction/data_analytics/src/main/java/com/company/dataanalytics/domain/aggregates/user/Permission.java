package com.company.dataanalytics.domain.aggregates.user;

import com.company.dataanalytics.domain.shared.Entity;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Entity representing a permission for a specific resource and action
 */
public class Permission extends Entity<UUID> {
    
    private final String permissionName;
    private final String description;
    private final String resource;
    private final String action;
    private final Instant createdDate;
    
    public Permission(UUID id, String permissionName, String description, String resource, String action) {
        super(id);
        if (permissionName == null || permissionName.trim().isEmpty()) {
            throw new IllegalArgumentException("Permission name cannot be null or empty");
        }
        if (resource == null || resource.trim().isEmpty()) {
            throw new IllegalArgumentException("Resource cannot be null or empty");
        }
        if (action == null || action.trim().isEmpty()) {
            throw new IllegalArgumentException("Action cannot be null or empty");
        }
        
        this.permissionName = permissionName.trim();
        this.description = description;
        this.resource = resource.trim().toUpperCase();
        this.action = action.trim().toUpperCase();
        this.createdDate = Instant.now();
    }
    
    public static Permission create(String permissionName, String description, String resource, String action) {
        return new Permission(UUID.randomUUID(), permissionName, description, resource, action);
    }
    
    public boolean allows(String resource, String action) {
        if (resource == null || action == null) {
            return false;
        }
        return this.resource.equals(resource.toUpperCase()) && 
               this.action.equals(action.toUpperCase());
    }
    
    // Getters
    public String getPermissionName() {
        return permissionName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public String getResource() {
        return resource;
    }
    
    public String getAction() {
        return action;
    }
    
    public Instant getCreatedDate() {
        return createdDate;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        if (!super.equals(obj)) return false;
        
        Permission that = (Permission) obj;
        return Objects.equals(permissionName, that.permissionName) &&
               Objects.equals(resource, that.resource) &&
               Objects.equals(action, that.action);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), permissionName, resource, action);
    }
}