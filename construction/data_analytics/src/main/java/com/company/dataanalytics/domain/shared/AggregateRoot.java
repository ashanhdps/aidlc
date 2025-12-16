package com.company.dataanalytics.domain.shared;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Base class for all aggregate roots in the domain.
 * Provides domain event handling capabilities.
 */
public abstract class AggregateRoot<T> extends Entity<T> {
    
    private final List<DomainEvent> domainEvents = new ArrayList<>();
    
    protected AggregateRoot(T id) {
        super(id);
    }
    
    /**
     * Add a domain event to be published
     */
    protected void addDomainEvent(DomainEvent event) {
        this.domainEvents.add(event);
    }
    
    /**
     * Get all domain events and clear the list
     */
    public List<DomainEvent> getAndClearDomainEvents() {
        List<DomainEvent> events = new ArrayList<>(this.domainEvents);
        this.domainEvents.clear();
        return events;
    }
    
    /**
     * Get domain events without clearing
     */
    public List<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(this.domainEvents);
    }
    
    /**
     * Clear all domain events
     */
    public void clearDomainEvents() {
        this.domainEvents.clear();
    }
}