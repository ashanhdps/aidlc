package com.company.performance.demo;

import com.company.performance.application.service.FeedbackApplicationService;
import com.company.performance.application.service.ReviewCycleApplicationService;
import com.company.performance.domain.aggregate.feedback.FeedbackId;
import com.company.performance.domain.aggregate.feedback.FeedbackRecord;
import com.company.performance.domain.aggregate.feedback.FeedbackType;
import com.company.performance.domain.aggregate.reviewcycle.*;
import com.company.performance.infrastructure.messaging.InMemoryEventStore;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Demo application for Performance Management Service
 * Demonstrates all 4 user stories: US-016, US-017, US-019, US-020
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.company.performance")
public class PerformanceManagementDemo implements CommandLineRunner {
    
    private final ReviewCycleApplicationService reviewCycleService;
    private final FeedbackApplicationService feedbackService;
    private final InMemoryEventStore eventStore;
    
    public PerformanceManagementDemo(
            ReviewCycleApplicationService reviewCycleService,
            FeedbackApplicationService feedbackService,
            InMemoryEventStore eventStore) {
        
        this.reviewCycleService = reviewCycleService;
        this.feedbackService = feedbackService;
        this.eventStore = eventStore;
    }
    
    public static void main(String[] args) {
        SpringApplication.run(PerformanceManagementDemo.class, args);
    }
    
    @Override
    public void run(String... args) {
        // Only run demo if this is the main class being executed
        // Check if we're running from PerformanceManagementApplication (REST API mode)
        String mainClass = System.getProperty("sun.java.command");
        if (mainClass != null && !mainClass.contains("PerformanceManagementDemo")) {
            // Running in REST API mode, skip demo
            System.out.println("\n" + "=".repeat(80));
            System.out.println("PERFORMANCE MANAGEMENT SERVICE - REST API MODE");
            System.out.println("Server started successfully. API available at: http://localhost:8081/api/v1/performance-management");
            System.out.println("See API_DOCUMENTATION.md for endpoint details");
            System.out.println("=".repeat(80) + "\n");
            return;
        }
        
        System.out.println("\n" + "=".repeat(80));
        System.out.println("PERFORMANCE MANAGEMENT SERVICE - PoC DEMONSTRATION");
        System.out.println("Unit 2: Performance Management Service (Workshop Version)");
        System.out.println("=".repeat(80) + "\n");
        
        try {
            // Demo Scenario 1: Complete Review Cycle (US-016, US-017)
            demoReviewCycle();
            
            // Demo Scenario 2: Feedback Flow (US-019, US-020)
            demoFeedbackFlow();
            
            // Demo Scenario 3: Query Operations
            demoQueryOperations();
            
            // Print all domain events
            printDomainEvents();
            
            System.out.println("\n" + "=".repeat(80));
            System.out.println("DEMO COMPLETED SUCCESSFULLY!");
            System.out.println("=".repeat(80) + "\n");
            
        } catch (Exception e) {
            System.err.println("\n❌ ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void demoReviewCycle() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 1: COMPLETE REVIEW CYCLE (US-016, US-017)");
        System.out.println("-".repeat(80));
        
        // Create test data
        UserId employee1 = UserId.generate();
        UserId employee2 = UserId.generate();
        UserId supervisor = UserId.generate();
        KPIId kpi1 = KPIId.generate();
        KPIId kpi2 = KPIId.generate();
        
        System.out.println("\n📋 Creating Review Cycle: Q4 2024 Performance Review");
        System.out.println("   Employees: 2");
        System.out.println("   Supervisor: 1");
        
        // Create participants
        ReviewParticipant participant1 = new ReviewParticipant(employee1, supervisor);
        ReviewParticipant participant2 = new ReviewParticipant(employee2, supervisor);
        
        // Create review cycle
        ReviewCycleId cycleId = reviewCycleService.createReviewCycle(
            "Q4 2024 Performance Review",
            LocalDate.of(2024, 10, 1),
            LocalDate.of(2024, 12, 31),
            Arrays.asList(participant1, participant2)
        );
        
        System.out.println("✅ Review Cycle Created: " + cycleId);
        
        // US-016: Submit Self-Assessments
        System.out.println("\n📝 US-016: Submitting Self-Assessments");
        
        List<AssessmentScore> employee1SelfScores = Arrays.asList(
            new AssessmentScore(kpi1, new BigDecimal("4.5"), new BigDecimal("90"), "Exceeded targets"),
            new AssessmentScore(kpi2, new BigDecimal("4.0"), new BigDecimal("85"), "Met expectations")
        );
        
        reviewCycleService.submitSelfAssessment(
            cycleId,
            participant1.getId(),
            employee1SelfScores,
            "Strong performance this quarter",
            "Led 2 major initiatives"
        );
        
        System.out.println("   ✅ Employee 1 self-assessment submitted");
        
        List<AssessmentScore> employee2SelfScores = Arrays.asList(
            new AssessmentScore(kpi1, new BigDecimal("3.5"), new BigDecimal("75"), "Good progress"),
            new AssessmentScore(kpi2, new BigDecimal("4.0"), new BigDecimal("80"), "Solid performance")
        );
        
        reviewCycleService.submitSelfAssessment(
            cycleId,
            participant2.getId(),
            employee2SelfScores,
            "Consistent performance",
            "Mentored junior team members"
        );
        
        System.out.println("   ✅ Employee 2 self-assessment submitted");
        
        // US-017: Submit Manager Assessments
        System.out.println("\n👔 US-017: Submitting Manager Assessments");
        
        List<AssessmentScore> employee1ManagerScores = Arrays.asList(
            new AssessmentScore(kpi1, new BigDecimal("4.5"), new BigDecimal("92"), "Outstanding work"),
            new AssessmentScore(kpi2, new BigDecimal("4.5"), new BigDecimal("88"), "Excellent results")
        );
        
        reviewCycleService.submitManagerAssessment(
            cycleId,
            participant1.getId(),
            employee1ManagerScores,
            "Top performer this quarter. Recommend for promotion."
        );
        
        System.out.println("   ✅ Employee 1 manager assessment submitted");
        
        List<AssessmentScore> employee2ManagerScores = Arrays.asList(
            new AssessmentScore(kpi1, new BigDecimal("3.5"), new BigDecimal("78"), "Meets expectations"),
            new AssessmentScore(kpi2, new BigDecimal("4.0"), new BigDecimal("82"), "Good work")
        );
        
        reviewCycleService.submitManagerAssessment(
            cycleId,
            participant2.getId(),
            employee2ManagerScores,
            "Solid contributor. Continue development in key areas."
        );
        
        System.out.println("   ✅ Employee 2 manager assessment submitted");
        
        // Complete review cycle
        System.out.println("\n🏁 Completing Review Cycle");
        reviewCycleService.completeReviewCycle(cycleId);
        System.out.println("   ✅ Review cycle completed");
        
        // Display results
        ReviewCycle cycle = reviewCycleService.getReviewCycle(cycleId);
        System.out.println("\n📊 REVIEW CYCLE RESULTS:");
        System.out.println("   Status: " + cycle.getStatus());
        for (ReviewParticipant p : cycle.getParticipants()) {
            System.out.println("   Participant: " + p.getId());
            System.out.println("      Status: " + p.getStatus());
            System.out.println("      Final Score: " + p.getFinalScore());
        }
    }
    
    private void demoFeedbackFlow() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 2: FEEDBACK FLOW (US-019, US-020)");
        System.out.println("-".repeat(80));
        
        // Create test data
        UserId supervisor = UserId.generate();
        UserId employee = UserId.generate();
        KPIId kpi = KPIId.generate();
        
        // US-019: Provide Feedback
        System.out.println("\n💬 US-019: Supervisor Provides Feedback");
        
        FeedbackId feedbackId = feedbackService.provideFeedback(
            supervisor,
            employee,
            kpi,
            "Customer Satisfaction Score",
            FeedbackType.POSITIVE,
            "Excellent work on the customer service initiative. " +
            "Your approach to handling difficult situations has been exemplary."
        );
        
        System.out.println("   ✅ Positive feedback provided: " + feedbackId);
        
        // US-020: Employee Receives and Responds to Feedback
        System.out.println("\n👤 US-020: Employee Receives and Responds to Feedback");
        
        System.out.println("   📬 Employee acknowledges feedback");
        feedbackService.acknowledgeFeedback(feedbackId);
        System.out.println("   ✅ Feedback acknowledged");
        
        System.out.println("   💭 Employee responds to feedback");
        feedbackService.respondToFeedback(
            feedbackId,
            employee,
            "Thank you for the positive feedback! I've been focusing on improving " +
            "my communication skills and I'm glad it's making a difference."
        );
        System.out.println("   ✅ Response submitted");
        
        System.out.println("   ✔️  Supervisor resolves feedback");
        feedbackService.resolveFeedback(feedbackId);
        System.out.println("   ✅ Feedback resolved");
        
        // Display feedback details
        FeedbackRecord feedback = feedbackService.getFeedback(feedbackId);
        System.out.println("\n📋 FEEDBACK DETAILS:");
        System.out.println("   ID: " + feedback.getId());
        System.out.println("   Type: " + feedback.getFeedbackType());
        System.out.println("   Status: " + feedback.getStatus());
        System.out.println("   KPI: " + feedback.getContext().getKpiName());
        System.out.println("   Responses: " + feedback.getResponses().size());
    }
    
    private void demoQueryOperations() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 3: QUERY OPERATIONS");
        System.out.println("-".repeat(80));
        
        System.out.println("\n🔍 Querying System Data");
        
        List<ReviewCycle> allCycles = reviewCycleService.getAllReviewCycles();
        System.out.println("   Total Review Cycles: " + allCycles.size());
        
        List<FeedbackRecord> allFeedback = feedbackService.getAllFeedback();
        System.out.println("   Total Feedback Records: " + allFeedback.size());
        
        System.out.println("   ✅ Query operations completed");
    }
    
    private void printDomainEvents() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("DOMAIN EVENTS PUBLISHED");
        System.out.println("-".repeat(80));
        
        List<com.company.performance.domain.event.DomainEvent> events = eventStore.getEvents();
        System.out.println("\nTotal Events: " + events.size());
        
        for (int i = 0; i < events.size(); i++) {
            var event = events.get(i);
            System.out.println("\n" + (i + 1) + ". " + event.getEventType());
            System.out.println("   Aggregate: " + event.getAggregateType());
            System.out.println("   Occurred At: " + event.getOccurredAt());
            System.out.println("   Event ID: " + event.getEventId());
        }
    }
}
