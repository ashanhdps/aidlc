package com.company.kpi;

import com.company.kpi.model.*;
import com.company.kpi.model.dto.CreateKPIRequest;
import com.company.kpi.domain.kpidefinition.Frequency;
import com.company.kpi.domain.kpidefinition.Target;
import com.company.kpi.domain.kpidefinition.Weight;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Factory class for creating test data objects
 * Provides consistent test data creation across all test cases
 */
public class TestDataFactory {
    
    // Test user IDs
    public static final String TEST_HR_USER_ID = "hr-user-001";
    public static final String TEST_SUPERVISOR_USER_ID = "supervisor-001";
    public static final String TEST_EMPLOYEE_USER_ID = "employee-001";
    public static final String TEST_ADMIN_USER_ID = "admin-001";
    
    // Test organization ID
    public static final String TEST_ORGANIZATION_ID = "org-001";
    
    /**
     * Creates a valid CreateKPIRequest for testing
     */
    public static CreateKPIRequest createValidKPIRequest() {
        CreateKPIRequest request = new CreateKPIRequest();
        request.setName("Test Sales Revenue KPI");
        request.setDescription("Monthly sales revenue target for testing");
        request.setCategory(KPICategory.SALES);
        request.setMeasurementType(MeasurementType.CURRENCY);
        request.setDefaultTargetValue(new BigDecimal("100000.00"));
        request.setDefaultTargetUnit("USD");
        request.setDefaultTargetComparisonType(ComparisonType.GREATER_THAN_OR_EQUAL);
        request.setDefaultWeightPercentage(new BigDecimal("25.0"));
        request.setDefaultWeightIsFlexible(true);
        request.setMeasurementFrequencyType(Frequency.IntervalType.MONTHLY);
        request.setMeasurementFrequencyValue(1);
        request.setDataSource("salesforce");
        return request;
    }
    
    /**
     * Creates a KPI Definition for testing
     */
    public static KPIDefinition createTestKPIDefinition() {
        KPIDefinition kpi = new KPIDefinition(
            "Test Customer Satisfaction KPI",
            "Customer satisfaction score measurement",
            KPICategory.CUSTOMER_SERVICE,
            MeasurementType.PERCENTAGE,
            TEST_HR_USER_ID
        );
        kpi.setId(UUID.randomUUID().toString());
        kpi.setDefaultTargetValue(new BigDecimal("85.0"));
        kpi.setDefaultTargetUnit("%");
        kpi.setDefaultTargetComparisonType(ComparisonType.GREATER_THAN_OR_EQUAL);
        kpi.setDefaultWeightPercentage(new BigDecimal("20.0"));
        kpi.setDefaultWeightIsFlexible(true);
        kpi.setMeasurementFrequencyType(Frequency.IntervalType.QUARTERLY);
        kpi.setMeasurementFrequencyValue(1);
        kpi.setDataSource("survey_system");
        return kpi;
    }
    
    /**
     * Creates a KPI Assignment for testing
     */
    public static KPIAssignment createTestKPIAssignment() {
        KPIAssignment assignment = new KPIAssignment();
        assignment.setId(UUID.randomUUID().toString());
        assignment.setEmployeeId(TEST_EMPLOYEE_USER_ID);
        assignment.setKpiDefinitionId(UUID.randomUUID().toString());
        assignment.setCustomTargetValue(new BigDecimal("90.0"));
        assignment.setCustomTargetUnit("%");
        assignment.setCustomTargetComparisonType(ComparisonType.GREATER_THAN_OR_EQUAL);
        assignment.setCustomWeightPercentage(new BigDecimal("30.0"));
        assignment.setCustomWeightIsFlexible(true);
        assignment.setEffectiveDate(LocalDate.now());
        assignment.setEndDate(LocalDate.now().plusYears(1));
        assignment.setAssignedBy(TEST_SUPERVISOR_USER_ID);
        assignment.setStatus(AssignmentStatus.ACTIVE);
        assignment.setCreatedAt(LocalDateTime.now());
        return assignment;
    }
    
    /**
     * Creates an AI Suggestion for testing
     */
    public static AISuggestion createTestAISuggestion() {
        AISuggestion suggestion = new AISuggestion();
        suggestion.setId(UUID.randomUUID().toString());
        suggestion.setJobTitle("Sales Manager");
        suggestion.setDepartment("Sales");
        suggestion.setConfidenceScore(new BigDecimal("0.85"));
        suggestion.setRationale("Based on industry benchmarks for sales management roles");
        suggestion.setStatus("PENDING_REVIEW");
        suggestion.setCreatedAt(LocalDateTime.now());
        suggestion.setExpiresAt(LocalDateTime.now().plusDays(30));
        return suggestion;
    }
    
    /**
     * Creates an Approval Workflow for testing
     */
    public static ApprovalWorkflow createTestApprovalWorkflow() {
        ApprovalWorkflow workflow = new ApprovalWorkflow();
        workflow.setId(UUID.randomUUID().toString());
        workflow.setRequestType(ChangeRequestType.KPI_UPDATE);
        workflow.setEntityId(UUID.randomUUID().toString());
        workflow.setJustification("Updating KPI target based on market conditions");
        workflow.setMakerId(TEST_SUPERVISOR_USER_ID);
        workflow.setStatus(ApprovalStatus.PENDING);
        workflow.setPriority(Priority.MEDIUM);
        workflow.setCreatedAt(LocalDateTime.now());
        return workflow;
    }
    
    /**
     * Creates a KPI Hierarchy for testing
     */
    public static KPIHierarchy createTestKPIHierarchy() {
        KPIHierarchy hierarchy = new KPIHierarchy();
        hierarchy.setId(UUID.randomUUID().toString());
        hierarchy.setOrganizationId(TEST_ORGANIZATION_ID);
        hierarchy.setName("Test Sales Hierarchy");
        hierarchy.setDescription("Test hierarchy for sales KPIs");
        hierarchy.setCreatedBy(TEST_HR_USER_ID);
        hierarchy.setCreatedAt(LocalDateTime.now());
        return hierarchy;
    }
    
    /**
     * Creates invalid KPI request for negative testing
     */
    public static CreateKPIRequest createInvalidKPIRequest() {
        CreateKPIRequest request = new CreateKPIRequest();
        // Missing required fields for validation testing
        request.setName(""); // Invalid empty name
        request.setDefaultWeightPercentage(new BigDecimal("150.0")); // Invalid weight > 100%
        request.setMeasurementFrequencyValue(-1); // Invalid negative frequency
        return request;
    }
    
    /**
     * Creates test data for performance testing
     */
    public static CreateKPIRequest[] createBulkKPIRequests(int count) {
        CreateKPIRequest[] requests = new CreateKPIRequest[count];
        for (int i = 0; i < count; i++) {
            CreateKPIRequest request = createValidKPIRequest();
            request.setName("Bulk Test KPI " + (i + 1));
            request.setDescription("Bulk test KPI number " + (i + 1));
            requests[i] = request;
        }
        return requests;
    }
}