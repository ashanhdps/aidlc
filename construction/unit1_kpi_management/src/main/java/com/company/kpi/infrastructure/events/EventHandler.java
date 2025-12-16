package com.company.kpi.infrastructure.events;

import com.company.kpi.domain.shared.DomainEvent;

/**
 * Interface for handling domain events.
 * Event handlers process domain events and perform side effects.
 */
public interface EventHandler {
    
    /**
     * Checks if this handler can handle the given event
     */
    boolean canHandle(DomainEvent event);
    
    /**
     * Handles the domain event
     */
    void handle(DomainEvent event);
}