package com.company.performance.testutil.builders;

import com.company.performance.domain.aggregate.reviewcycle.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Test data builder for ReviewCycle aggregate
 * Provides fluent API for creating test data
 */
public class ReviewCycleBuilder {
    
    private String cycleName = "Q4 2024 Performance Review";
    private LocalDate startDate = LocalDate.now();
    private LocalDate endDate = LocalDate.now().plusDays(30);
    private List<ReviewParticipant> participants = new ArrayList<>();
    
    public ReviewCycleBuilder withName(String name) {
        this.cycleName = name;
        return this;
    }
    
    public ReviewCycleBuilder withDates(LocalDate start, LocalDate end) {
        this.startDate = start;
        this.endDate = end;
        return this;
    }
    
    public ReviewCycleBuilder withStartDate(LocalDate start) {
        this.startDate = start;
        return this;
    }
    
    public ReviewCycleBuilder withEndDate(LocalDate end) {
        this.endDate = end;
        return this;
    }
    
    public ReviewCycleBuilder withParticipant(ReviewParticipant participant) {
        this.participants.add(participant);
        return this;
    }
    
    public ReviewCycleBuilder withParticipants(List<ReviewParticipant> participants) {
        this.participants = new ArrayList<>(participants);
        return this;
    }
    
    public ReviewCycleBuilder withParticipant(UUID employeeId, UUID supervisorId) {
        this.participants.add(new ReviewParticipant(
            new EmployeeId(employeeId),
            new SupervisorId(supervisorId)
        ));
        return this;
    }
    
    public ReviewCycle build() {
        return new ReviewCycle(cycleName, startDate, endDate, participants);
    }
    
    /**
     * Creates a default review cycle with no participants
     */
    public static ReviewCycle defaultCycle() {
        return new ReviewCycleBuilder().build();
    }
    
    /**
     * Creates a review cycle with one participant
     */
    public static ReviewCycle cycleWithOneParticipant() {
        return new ReviewCycleBuilder()
            .withParticipant(UUID.randomUUID(), UUID.randomUUID())
            .build();
    }
    
    /**
     * Creates a review cycle with multiple participants
     */
    public static ReviewCycle cycleWithMultipleParticipants(int count) {
        ReviewCycleBuilder builder = new ReviewCycleBuilder();
        for (int i = 0; i < count; i++) {
            builder.withParticipant(UUID.randomUUID(), UUID.randomUUID());
        }
        return builder.build();
    }
}
