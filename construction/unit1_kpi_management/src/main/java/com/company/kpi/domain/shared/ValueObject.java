package com.company.kpi.domain.shared;

/**
 * Marker interface for value objects in the domain model.
 * Value objects are immutable and defined by their attributes rather than identity.
 */
public interface ValueObject {
    
    /**
     * Validates the value object's invariants
     * @throws IllegalArgumentException if the value object is invalid
     */
    default void validate() {
        // Default implementation does nothing
        // Subclasses should override if validation is needed
    }
}