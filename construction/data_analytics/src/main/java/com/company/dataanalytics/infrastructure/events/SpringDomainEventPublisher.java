package com.company.dataanalytics.infrastructure.events;

import com.company.dataanalytics.domain.shared.DomainEvent;
import com.company.dataanalytics.domain.shared.DomainEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Spring-based implementation of DomainEventPublisher
 */
@Component
public class SpringDomainEventPublisher implements DomainEventPublisher {
    
    private static final Logger logger = LoggerFactory.getLogger(SpringDomainEventPublisher.class);
    
    private final ApplicationEventPublisher applicationEventPublisher;
    private final InMemoryEventStore eventStore;
    
    public SpringDomainEventPublisher(ApplicationEventPublisher applicationEventPublisher, 
                                    InMemoryEventStore eventStore) {
        this.applicationEventPublisher = applicationEventPublisher;
        this.eventStore = eventStore;
    }
    
    @Override
    public void publish(DomainEvent event) {
        if (event == null) {
            logger.warn("Attempted to publish null domain event");
            return;
        }
        
        try {
            // Store event in event store
            eventStore.store(event);
            
            // Publish event through Spring's event mechanism
            applicationEventPublisher.publishEvent(event);
            
            logger.debug("Published domain event: {}", event);
            
        } catch (Exception e) {
            logger.error("Failed to publish domain event: {}", event, e);
            throw new RuntimeException("Failed to publish domain event", e);
        }
    }
    
    @Override
    public void publishAll(Iterable<DomainEvent> events) {
        if (events == null) {
            logger.warn("Attempted to publish null events collection");
            return;
        }
        
        for (DomainEvent event : events) {
            publish(event);
        }
    }
}