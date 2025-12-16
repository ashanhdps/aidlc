package com.company.performance.infrastructure.persistence.inmemory;

import com.company.performance.domain.aggregate.reviewcycle.ReviewCycle;
import com.company.performance.domain.aggregate.reviewcycle.ReviewCycleId;
import com.company.performance.domain.aggregate.reviewcycle.ReviewCycleStatus;
import com.company.performance.domain.aggregate.reviewcycle.UserId;
import com.company.performance.domain.repository.IReviewCycleRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory implementation of IReviewCycleRepository
 * Thread-safe using ConcurrentHashMap
 */
@Repository
public class InMemoryReviewCycleRepository implements IReviewCycleRepository {
    
    private final Map<ReviewCycleId, ReviewCycle> storage = new ConcurrentHashMap<>();
    
    @Override
    public void save(ReviewCycle cycle) {
        storage.put(cycle.getId(), cycle);
    }
    
    @Override
    public void update(ReviewCycle cycle) {
        storage.put(cycle.getId(), cycle);
    }
    
    @Override
    public Optional<ReviewCycle> findById(ReviewCycleId cycleId) {
        return Optional.ofNullable(storage.get(cycleId));
    }
    
    @Override
    public List<ReviewCycle> findActiveCycles() {
        return storage.values().stream()
            .filter(cycle -> cycle.getStatus() == ReviewCycleStatus.ACTIVE)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<ReviewCycle> findByStatus(ReviewCycleStatus status) {
        return storage.values().stream()
            .filter(cycle -> cycle.getStatus() == status)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<ReviewCycle> findCyclesForEmployee(UserId employeeId) {
        return storage.values().stream()
            .filter(cycle -> cycle.getParticipants().stream()
                .anyMatch(p -> p.getEmployeeId().equals(employeeId)))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<ReviewCycle> findCyclesForSupervisor(UserId supervisorId) {
        return storage.values().stream()
            .filter(cycle -> cycle.getParticipants().stream()
                .anyMatch(p -> p.getSupervisorId().equals(supervisorId)))
            .collect(Collectors.toList());
    }
    
    @Override
    public boolean existsById(ReviewCycleId cycleId) {
        return storage.containsKey(cycleId);
    }
    
    @Override
    public List<ReviewCycle> findAll() {
        return List.copyOf(storage.values());
    }
    
    /**
     * Clear all data (useful for testing)
     */
    public void clear() {
        storage.clear();
    }
}
