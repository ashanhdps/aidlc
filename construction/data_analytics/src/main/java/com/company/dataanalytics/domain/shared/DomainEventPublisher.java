package com.company.dataanalytics.domain.shared;

/**
 * Interface for publishing domain events.
 * This allows the domain layer to publish events without depending on infrastructure.
 */
public interface DomainEventPublisher {
    
    /**
     * Publish a domain event
     * @param event the domain event to publish
     */
    void publish(DomainEvent event);
    
    /**
     * Publish multiple domain events
     * @param events the domain events to publish
     */
    default void publishAll(Iterable<DomainEvent> events) {
        events.forEach(this::publish);
    }
}