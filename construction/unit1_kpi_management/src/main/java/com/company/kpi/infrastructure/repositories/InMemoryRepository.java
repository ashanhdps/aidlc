package com.company.kpi.infrastructure.repositories;

import com.company.kpi.domain.shared.AggregateRoot;
import com.company.kpi.domain.shared.Repository;
import com.company.kpi.infrastructure.events.InMemoryEventStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Base in-memory repository implementation for demo purposes.
 * In production, this would be replaced with persistent storage.
 */
public abstract class InMemoryRepository<T extends AggregateRoot<ID>, ID> implements Repository<T, ID> {
    
    private static final Logger logger = LoggerFactory.getLogger(InMemoryRepository.class);
    
    protected final Map<ID, T> storage = new ConcurrentHashMap<>();
    protected final InMemoryEventStore eventStore;
    
    protected InMemoryRepository(InMemoryEventStore eventStore) {
        this.eventStore = eventStore;
    }
    
    @Override
    public T save(T aggregate) {
        logger.debug("Saving aggregate: {}", aggregate);
        
        // Store the aggregate
        storage.put(aggregate.getId(), aggregate);
        
        // Publish domain events
        if (aggregate.hasDomainEvents()) {
            eventStore.storeAll(aggregate.getDomainEvents());
        }
        
        logger.debug("Saved aggregate with ID: {}", aggregate.getId());
        return aggregate;
    }
    
    @Override
    public Optional<T> findById(ID id) {
        logger.debug("Finding aggregate by ID: {}", id);
        T aggregate = storage.get(id);
        return Optional.ofNullable(aggregate);
    }
    
    @Override
    public List<T> findAll() {
        logger.debug("Finding all aggregates");
        return new ArrayList<>(storage.values());
    }
    
    @Override
    public void deleteById(ID id) {
        logger.debug("Deleting aggregate by ID: {}", id);
        storage.remove(id);
    }
    
    @Override
    public boolean existsById(ID id) {
        return storage.containsKey(id);
    }
    
    @Override
    public long count() {
        return storage.size();
    }
    
    /**
     * Clears all data (for testing)
     */
    public void clear() {
        storage.clear();
        logger.debug("Cleared all data from repository");
    }
}