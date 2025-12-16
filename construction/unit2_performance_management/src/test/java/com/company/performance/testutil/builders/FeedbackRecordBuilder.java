package com.company.performance.testutil.builders;

import com.company.performance.domain.aggregate.feedback.*;

import java.util.UUID;

/**
 * Test data builder for FeedbackRecord aggregate
 */
public class FeedbackRecordBuilder {
    
    private UserId giverId = new UserId(UUID.randomUUID());
    private UserId receiverId = new UserId(UUID.randomUUID());
    private KPIId kpiId = new KPIId(UUID.randomUUID());
    private String kpiName = "Sales Target";
    private FeedbackType feedbackType = FeedbackType.POSITIVE;
    private String contentText = "Great job on achieving your sales target!";
    
    public FeedbackRecordBuilder fromGiver(UUID giverId) {
        this.giverId = new UserId(giverId);
        return this;
    }
    
    public FeedbackRecordBuilder fromGiver(UserId giverId) {
        this.giverId = giverId;
        return this;
    }
    
    public FeedbackRecordBuilder toReceiver(UUID receiverId) {
        this.receiverId = new UserId(receiverId);
        return this;
    }
    
    public FeedbackRecordBuilder toReceiver(UserId receiverId) {
        this.receiverId = receiverId;
        return this;
    }
    
    public FeedbackRecordBuilder forKpi(UUID kpiId, String kpiName) {
        this.kpiId = new KPIId(kpiId);
        this.kpiName = kpiName;
        return this;
    }
    
    public FeedbackRecordBuilder forKpi(KPIId kpiId, String kpiName) {
        this.kpiId = kpiId;
        this.kpiName = kpiName;
        return this;
    }
    
    public FeedbackRecordBuilder withType(FeedbackType type) {
        this.feedbackType = type;
        return this;
    }
    
    public FeedbackRecordBuilder asPositive() {
        this.feedbackType = FeedbackType.POSITIVE;
        return this;
    }
    
    public FeedbackRecordBuilder asImprovement() {
        this.feedbackType = FeedbackType.IMPROVEMENT;
        return this;
    }
    
    public FeedbackRecordBuilder withContent(String content) {
        this.contentText = content;
        return this;
    }
    
    public FeedbackRecord build() {
        return FeedbackRecord.create(
            giverId,
            receiverId,
            kpiId,
            kpiName,
            feedbackType,
            contentText
        );
    }
    
    public static FeedbackRecord defaultFeedback() {
        return new FeedbackRecordBuilder().build();
    }
    
    public static FeedbackRecord positiveFeedback() {
        return new FeedbackRecordBuilder()
            .asPositive()
            .withContent("Excellent work on this KPI!")
            .build();
    }
    
    public static FeedbackRecord improvementFeedback() {
        return new FeedbackRecordBuilder()
            .asImprovement()
            .withContent("There's room for improvement in this area")
            .build();
    }
}
