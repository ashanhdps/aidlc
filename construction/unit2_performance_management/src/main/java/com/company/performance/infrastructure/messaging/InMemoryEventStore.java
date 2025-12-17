package com.company.performance.infrastructure.messaging;

import com.company.performance.domain.event.DomainEvent;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * In-memory event store for domain events
 * Thread-safe using CopyOnWriteArrayList
 */
@Component
public class InMemoryEventStore {
    
    private final List<DomainEvent> events = new CopyOnWriteArrayList<>();
    
    /**
     * Publish an event to the store
     */
    public void publish(DomainEvent event) {
        events.add(event);
        System.out.println("[EVENT PUBLISHED] " + event.getEventType() + " - " + event);
    }
    
    /**
     * Publish multiple events
     */
    public void publishAll(List<DomainEvent> eventList) {
        eventList.forEach(this::publish);
    }
    
    /**
     * Get all events
     */
    public List<DomainEvent> getEvents() {
        return Collections.unmodifiableList(new ArrayList<>(events));
    }
    
    /**
     * Get events by aggregate ID
     */
    public List<DomainEvent> getEventsByAggregateId(UUID aggregateId) {
        return events.stream()
            .filter(event -> event.getAggregateId().equals(aggregateId))
            .collect(Collectors.toList());
    }
    
    /**
     * Get events by type
     */
    public List<DomainEvent> getEventsByType(String eventType) {
        return events.stream()
            .filter(event -> event.getEventType().equals(eventType))
            .collect(Collectors.toList());
    }
    
    /**
     * Get event count
     */
    public int getEventCount() {
        return events.size();
    }
    
    /**
     * Clear all events (useful for testing)
     */
    public void clear() {
        events.clear();
    }
}
