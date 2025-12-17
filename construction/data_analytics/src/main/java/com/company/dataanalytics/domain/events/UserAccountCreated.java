package com.company.dataanalytics.domain.events;

import com.company.dataanalytics.domain.shared.DomainEvent;
import com.company.dataanalytics.domain.valueobjects.Email;
import com.company.dataanalytics.domain.valueobjects.RoleName;
import com.company.dataanalytics.domain.valueobjects.UserId;

/**
 * Domain event raised when a new user account is created
 */
public class UserAccountCreated extends DomainEvent {
    
    private final UserId userId;
    private final Email email;
    private final RoleName roleName;
    
    public UserAccountCreated(UserId userId, Email email, RoleName roleName) {
        super();
        this.userId = userId;
        this.email = email;
        this.roleName = roleName;
    }
    
    public UserId getUserId() {
        return userId;
    }
    
    public Email getEmail() {
        return email;
    }
    
    public RoleName getRoleName() {
        return roleName;
    }
    
    @Override
    public String toString() {
        return String.format("UserAccountCreated{userId=%s, email=%s, role=%s, occurredOn=%s}", 
            userId, email, roleName, getOccurredOn());
    }
}