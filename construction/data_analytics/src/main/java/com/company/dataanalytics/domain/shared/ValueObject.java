package com.company.dataanalytics.domain.shared;

/**
 * Marker interface for value objects in the domain.
 * Value objects are immutable and compared by value equality.
 */
public interface ValueObject {
    
    /**
     * Validate the value object's invariants
     * @throws IllegalArgumentException if the value object is invalid
     */
    default void validate() {
        // Default implementation does nothing
        // Subclasses should override if validation is needed
    }
}