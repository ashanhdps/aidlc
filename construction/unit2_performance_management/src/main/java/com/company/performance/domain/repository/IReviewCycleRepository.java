package com.company.performance.domain.repository;

import com.company.performance.domain.aggregate.reviewcycle.ReviewCycle;
import com.company.performance.domain.aggregate.reviewcycle.ReviewCycleId;
import com.company.performance.domain.aggregate.reviewcycle.ReviewCycleStatus;
import com.company.performance.domain.aggregate.reviewcycle.UserId;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ReviewCycle aggregate
 * Defines persistence operations for review cycles
 */
public interface IReviewCycleRepository {
    
    /**
     * Save a new review cycle
     */
    void save(ReviewCycle cycle);
    
    /**
     * Update an existing review cycle
     */
    void update(ReviewCycle cycle);
    
    /**
     * Find review cycle by ID
     */
    Optional<ReviewCycle> findById(ReviewCycleId cycleId);
    
    /**
     * Find all active review cycles
     */
    List<ReviewCycle> findActiveCycles();
    
    /**
     * Find review cycles by status
     */
    List<ReviewCycle> findByStatus(ReviewCycleStatus status);
    
    /**
     * Find review cycles for an employee
     */
    List<ReviewCycle> findCyclesForEmployee(UserId employeeId);
    
    /**
     * Find review cycles for a supervisor
     */
    List<ReviewCycle> findCyclesForSupervisor(UserId supervisorId);
    
    /**
     * Check if review cycle exists
     */
    boolean existsById(ReviewCycleId cycleId);
    
    /**
     * Get all review cycles
     */
    List<ReviewCycle> findAll();
}
