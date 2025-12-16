package com.company.kpi.domain.shared;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Base class for all aggregate roots in the domain model.
 * Provides domain event management capabilities.
 */
public abstract class AggregateRoot<T> extends Entity<T> {
    
    private final List<DomainEvent> domainEvents = new ArrayList<>();
    
    protected AggregateRoot(T id) {
        super(id);
    }
    
    /**
     * Adds a domain event to be published
     */
    protected void addDomainEvent(DomainEvent event) {
        this.domainEvents.add(event);
    }
    
    /**
     * Gets all domain events and clears the list
     */
    public List<DomainEvent> getDomainEvents() {
        List<DomainEvent> events = new ArrayList<>(this.domainEvents);
        this.domainEvents.clear();
        return Collections.unmodifiableList(events);
    }
    
    /**
     * Clears all domain events without returning them
     */
    public void clearDomainEvents() {
        this.domainEvents.clear();
    }
    
    /**
     * Checks if there are any unpublished domain events
     */
    public boolean hasDomainEvents() {
        return !this.domainEvents.isEmpty();
    }
}