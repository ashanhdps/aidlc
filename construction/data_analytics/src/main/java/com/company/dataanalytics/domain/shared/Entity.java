package com.company.dataanalytics.domain.shared;

import java.util.Objects;

/**
 * Base class for all entities in the domain.
 * Provides identity and equality semantics.
 */
public abstract class Entity<T> {
    
    protected final T id;
    
    protected Entity(T id) {
        if (id == null) {
            throw new IllegalArgumentException("Entity ID cannot be null");
        }
        this.id = id;
    }
    
    public T getId() {
        return id;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        Entity<?> entity = (Entity<?>) obj;
        return Objects.equals(id, entity.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    @Override
    public String toString() {
        return String.format("%s{id=%s}", getClass().getSimpleName(), id);
    }
}