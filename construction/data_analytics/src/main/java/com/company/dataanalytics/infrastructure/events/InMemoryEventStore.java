package com.company.dataanalytics.infrastructure.events;

import com.company.dataanalytics.domain.shared.DomainEvent;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * In-memory implementation of event store for domain events
 */
@Component
public class InMemoryEventStore {
    
    private final List<StoredEvent> events = new CopyOnWriteArrayList<>();
    private final Map<String, List<StoredEvent>> eventsByType = new ConcurrentHashMap<>();
    
    /**
     * Store a domain event
     */
    public void store(DomainEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("Event cannot be null");
        }
        
        StoredEvent storedEvent = new StoredEvent(
            event.getEventId().toString(),
            event.getEventType(),
            event.getOccurredOn(),
            event
        );
        
        events.add(storedEvent);
        eventsByType.computeIfAbsent(event.getEventType(), k -> new CopyOnWriteArrayList<>()).add(storedEvent);
    }
    
    /**
     * Get all events
     */
    public List<DomainEvent> getAllEvents() {
        return events.stream()
            .map(StoredEvent::getEvent)
            .collect(Collectors.toList());
    }
    
    /**
     * Get events by type
     */
    public List<DomainEvent> getEventsByType(String eventType) {
        return eventsByType.getOrDefault(eventType, Collections.emptyList())
            .stream()
            .map(StoredEvent::getEvent)
            .collect(Collectors.toList());
    }
    
    /**
     * Get events after a specific timestamp
     */
    public List<DomainEvent> getEventsAfter(Instant timestamp) {
        return events.stream()
            .filter(storedEvent -> storedEvent.getOccurredOn().isAfter(timestamp))
            .map(StoredEvent::getEvent)
            .collect(Collectors.toList());
    }
    
    /**
     * Get events within a time range
     */
    public List<DomainEvent> getEventsBetween(Instant startTime, Instant endTime) {
        return events.stream()
            .filter(storedEvent -> {
                Instant occurredOn = storedEvent.getOccurredOn();
                return !occurredOn.isBefore(startTime) && !occurredOn.isAfter(endTime);
            })
            .map(StoredEvent::getEvent)
            .collect(Collectors.toList());
    }
    
    /**
     * Get recent events with limit
     */
    public List<DomainEvent> getRecentEvents(int limit) {
        return events.stream()
            .sorted((e1, e2) -> e2.getOccurredOn().compareTo(e1.getOccurredOn())) // Latest first
            .limit(limit)
            .map(StoredEvent::getEvent)
            .collect(Collectors.toList());
    }
    
    /**
     * Count total events
     */
    public long count() {
        return events.size();
    }
    
    /**
     * Count events by type
     */
    public long countByType(String eventType) {
        return eventsByType.getOrDefault(eventType, Collections.emptyList()).size();
    }
    
    /**
     * Clear all events (for testing)
     */
    public void clear() {
        events.clear();
        eventsByType.clear();
    }
    
    /**
     * Get all event types
     */
    public Set<String> getAllEventTypes() {
        return new HashSet<>(eventsByType.keySet());
    }
    
    /**
     * Internal class to store event metadata
     */
    private static class StoredEvent {
        private final String eventId;
        private final String eventType;
        private final Instant occurredOn;
        private final DomainEvent event;
        
        public StoredEvent(String eventId, String eventType, Instant occurredOn, DomainEvent event) {
            this.eventId = eventId;
            this.eventType = eventType;
            this.occurredOn = occurredOn;
            this.event = event;
        }
        
        public String getEventId() {
            return eventId;
        }
        
        public String getEventType() {
            return eventType;
        }
        
        public Instant getOccurredOn() {
            return occurredOn;
        }
        
        public DomainEvent getEvent() {
            return event;
        }
    }
}