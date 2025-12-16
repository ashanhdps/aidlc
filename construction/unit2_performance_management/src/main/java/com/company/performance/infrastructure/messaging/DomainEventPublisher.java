package com.company.performance.infrastructure.messaging;

import com.company.performance.domain.event.DomainEvent;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Domain event publisher
 * Delegates to the event store for publishing
 */
@Component
public class DomainEventPublisher {
    
    private final InMemoryEventStore eventStore;
    
    public DomainEventPublisher(InMemoryEventStore eventStore) {
        this.eventStore = eventStore;
    }
    
    /**
     * Publish a single domain event
     */
    public void publish(DomainEvent event) {
        eventStore.publish(event);
    }
    
    /**
     * Publish multiple domain events
     */
    public void publishAll(List<DomainEvent> events) {
        eventStore.publishAll(events);
    }
}
