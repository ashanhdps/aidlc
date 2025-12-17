package com.company.dataanalytics.domain.events;

import com.company.dataanalytics.domain.shared.DomainEvent;
import com.company.dataanalytics.domain.valueobjects.RoleName;
import com.company.dataanalytics.domain.valueobjects.UserId;

/**
 * Domain event raised when a user's role is changed
 */
public class UserRoleChanged extends DomainEvent {
    
    private final UserId userId;
    private final RoleName oldRole;
    private final RoleName newRole;
    
    public UserRoleChanged(UserId userId, RoleName oldRole, RoleName newRole) {
        super();
        this.userId = userId;
        this.oldRole = oldRole;
        this.newRole = newRole;
    }
    
    public UserId getUserId() {
        return userId;
    }
    
    public RoleName getOldRole() {
        return oldRole;
    }
    
    public RoleName getNewRole() {
        return newRole;
    }
    
    @Override
    public String toString() {
        return String.format("UserRoleChanged{userId=%s, oldRole=%s, newRole=%s, occurredOn=%s}", 
            userId, oldRole, newRole, getOccurredOn());
    }
}