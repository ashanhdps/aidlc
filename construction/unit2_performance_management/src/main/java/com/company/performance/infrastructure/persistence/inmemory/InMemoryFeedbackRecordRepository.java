package com.company.performance.infrastructure.persistence.inmemory;

import com.company.performance.domain.aggregate.feedback.FeedbackId;
import com.company.performance.domain.aggregate.feedback.FeedbackRecord;
import com.company.performance.domain.aggregate.feedback.FeedbackStatus;
import com.company.performance.domain.aggregate.reviewcycle.KPIId;
import com.company.performance.domain.aggregate.reviewcycle.UserId;
import com.company.performance.domain.repository.IFeedbackRecordRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory implementation of IFeedbackRecordRepository
 * Thread-safe using ConcurrentHashMap
 */
@Repository
public class InMemoryFeedbackRecordRepository implements IFeedbackRecordRepository {
    
    private final Map<FeedbackId, FeedbackRecord> storage = new ConcurrentHashMap<>();
    
    @Override
    public void save(FeedbackRecord feedback) {
        storage.put(feedback.getId(), feedback);
    }
    
    @Override
    public void update(FeedbackRecord feedback) {
        storage.put(feedback.getId(), feedback);
    }
    
    @Override
    public Optional<FeedbackRecord> findById(FeedbackId feedbackId) {
        return Optional.ofNullable(storage.get(feedbackId));
    }
    
    @Override
    public List<FeedbackRecord> findByReceiver(UserId receiverId) {
        return storage.values().stream()
            .filter(feedback -> feedback.getReceiverId().equals(receiverId))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<FeedbackRecord> findByGiver(UserId giverId) {
        return storage.values().stream()
            .filter(feedback -> feedback.getGiverId().equals(giverId))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<FeedbackRecord> findByKpi(KPIId kpiId) {
        return storage.values().stream()
            .filter(feedback -> feedback.getContext().getKpiId().equals(kpiId))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<FeedbackRecord> findUnresolvedForReceiver(UserId receiverId) {
        return storage.values().stream()
            .filter(feedback -> feedback.getReceiverId().equals(receiverId))
            .filter(feedback -> feedback.getStatus() != FeedbackStatus.RESOLVED)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<FeedbackRecord> findByReceiverAndDateRange(
            UserId receiverId,
            Instant startDate,
            Instant endDate) {
        
        return storage.values().stream()
            .filter(feedback -> feedback.getReceiverId().equals(receiverId))
            .filter(feedback -> !feedback.getCreatedDate().isBefore(startDate))
            .filter(feedback -> !feedback.getCreatedDate().isAfter(endDate))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<FeedbackRecord> findAll() {
        return List.copyOf(storage.values());
    }
    
    /**
     * Clear all data (useful for testing)
     */
    public void clear() {
        storage.clear();
    }
}
