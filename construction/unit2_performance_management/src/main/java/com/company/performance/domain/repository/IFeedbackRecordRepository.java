package com.company.performance.domain.repository;

import com.company.performance.domain.aggregate.feedback.FeedbackId;
import com.company.performance.domain.aggregate.feedback.FeedbackRecord;
import com.company.performance.domain.aggregate.reviewcycle.KPIId;
import com.company.performance.domain.aggregate.reviewcycle.UserId;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for FeedbackRecord aggregate
 * Defines persistence operations for feedback records
 */
public interface IFeedbackRecordRepository {
    
    /**
     * Save a new feedback record
     */
    void save(FeedbackRecord feedback);
    
    /**
     * Update an existing feedback record
     */
    void update(FeedbackRecord feedback);
    
    /**
     * Find feedback by ID
     */
    Optional<FeedbackRecord> findById(FeedbackId feedbackId);
    
    /**
     * Find all feedback for a receiver
     */
    List<FeedbackRecord> findByReceiver(UserId receiverId);
    
    /**
     * Find all feedback given by a user
     */
    List<FeedbackRecord> findByGiver(UserId giverId);
    
    /**
     * Find feedback for a specific KPI
     */
    List<FeedbackRecord> findByKpi(KPIId kpiId);
    
    /**
     * Find unresolved feedback for a receiver
     */
    List<FeedbackRecord> findUnresolvedForReceiver(UserId receiverId);
    
    /**
     * Find feedback by receiver and date range
     */
    List<FeedbackRecord> findByReceiverAndDateRange(
        UserId receiverId,
        Instant startDate,
        Instant endDate
    );
    
    /**
     * Get all feedback records
     */
    List<FeedbackRecord> findAll();
}
