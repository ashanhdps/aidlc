package com.company.kpi.infrastructure.events;

import com.company.kpi.domain.shared.DomainEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * In-memory implementation of event store for demo purposes.
 * In production, this would be replaced with a persistent event store like Kafka.
 */
@Component
public class InMemoryEventStore {
    
    private static final Logger logger = LoggerFactory.getLogger(InMemoryEventStore.class);
    
    private final List<DomainEvent> events = new CopyOnWriteArrayList<>();
    private final List<EventHandler> handlers = new CopyOnWriteArrayList<>();
    
    /**
     * Stores and publishes a domain event
     */
    public void store(DomainEvent event) {
        logger.debug("Storing domain event: {}", event);
        events.add(event);
        publishEvent(event);
    }
    
    /**
     * Stores and publishes multiple domain events
     */
    public void storeAll(List<DomainEvent> events) {
        for (DomainEvent event : events) {
            store(event);
        }
    }
    
    /**
     * Gets all stored events
     */
    public List<DomainEvent> getAllEvents() {
        return Collections.unmodifiableList(new ArrayList<>(events));
    }
    
    /**
     * Gets events for a specific aggregate
     */
    public List<DomainEvent> getEventsForAggregate(String aggregateId) {
        return events.stream()
            .filter(event -> event.getAggregateId().equals(aggregateId))
            .toList();
    }
    
    /**
     * Registers an event handler
     */
    public void registerHandler(EventHandler handler) {
        handlers.add(handler);
        logger.debug("Registered event handler: {}", handler.getClass().getSimpleName());
    }
    
    /**
     * Publishes an event to all registered handlers
     */
    private void publishEvent(DomainEvent event) {
        logger.debug("Publishing event to {} handlers: {}", handlers.size(), event);
        for (EventHandler handler : handlers) {
            try {
                if (handler.canHandle(event)) {
                    handler.handle(event);
                }
            } catch (Exception e) {
                logger.error("Error handling event {} with handler {}", 
                    event, handler.getClass().getSimpleName(), e);
            }
        }
    }
    
    /**
     * Clears all stored events (for testing)
     */
    public void clear() {
        events.clear();
        logger.debug("Cleared all events from event store");
    }
}