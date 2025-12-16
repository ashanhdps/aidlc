package com.company.kpi.domain.shared;

import java.util.List;
import java.util.Optional;

/**
 * Base repository interface for aggregate roots.
 * Defines common repository operations following DDD patterns.
 */
public interface Repository<T extends AggregateRoot<ID>, ID> {
    
    /**
     * Saves an aggregate root
     */
    T save(T aggregate);
    
    /**
     * Finds an aggregate by its ID
     */
    Optional<T> findById(ID id);
    
    /**
     * Finds all aggregates
     */
    List<T> findAll();
    
    /**
     * Deletes an aggregate by its ID
     */
    void deleteById(ID id);
    
    /**
     * Checks if an aggregate exists by its ID
     */
    boolean existsById(ID id);
    
    /**
     * Counts the total number of aggregates
     */
    long count();
}