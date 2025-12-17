package com.company.dataanalytics.domain.events;

import com.company.dataanalytics.domain.shared.DomainEvent;
import com.company.dataanalytics.domain.valueobjects.Email;
import com.company.dataanalytics.domain.valueobjects.UserId;

/**
 * Domain event raised when a user account is deactivated
 */
public class UserAccountDeactivated extends DomainEvent {
    
    private final UserId userId;
    private final Email email;
    
    public UserAccountDeactivated(UserId userId, Email email) {
        super();
        this.userId = userId;
        this.email = email;
    }
    
    public UserId getUserId() {
        return userId;
    }
    
    public Email getEmail() {
        return email;
    }
    
    @Override
    public String toString() {
        return String.format("UserAccountDeactivated{userId=%s, email=%s, occurredOn=%s}", 
            userId, email, getOccurredOn());
    }
}