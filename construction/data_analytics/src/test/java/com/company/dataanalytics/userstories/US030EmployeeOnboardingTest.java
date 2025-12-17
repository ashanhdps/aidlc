package com.company.dataanalytics.userstories;

import com.company.dataanalytics.infrastructure.config.DataSeeder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureTestMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests for US-030: Employee Onboarding Management
 * As an HR Personnel, I want to manage employee onboarding with automated KPI assignment
 * So that new employees have clear performance expectations from day one
 */
@SpringBootTest
@AutoConfigureTestMvc
@ActiveProfiles("test")
@DisplayName("US-030: Employee Onboarding Management")
class US030EmployeeOnboardingTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DataSeeder dataSeeder;

    @BeforeEach
    void setUp() {
        dataSeeder.seedDemoData();
    }

    @Test
    @DisplayName("Should create and manage employee accounts during onboarding")
    void shouldCreateAndManageEmployeeAccountsDuringOnboarding() throws Exception {
        // Create onboarding workflow for new employee
        String onboardingRequestJson = """
                {
                    "employeeDetails": {
                        "email": "new.hire@company.com",
                        "firstName": "Alex",
                        "lastName": "Johnson",
                        "jobTitle": "Sales Representative",
                        "department": "Sales",
                        "managerId": "supervisor@company.com",
                        "startDate": "2024-12-20",
                        "employeeId": "EMP-2024-001"
                    },
                    "onboardingSettings": {
                        "autoAssignKPIs": true,
                        "sendWelcomeEmail": true,
                        "createManagerNotification": true,
                        "scheduleOrientationSession": true
                    }
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/admin/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(onboardingRequestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.onboardingId").exists())
                .andExpect(jsonPath("$.employeeDetails.email").value("new.hire@company.com"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.createdBy").exists())
                .andReturn().getResponse().getContentAsString();

        String onboardingId = objectMapper.readTree(response).get("onboardingId").asText();

        // Verify employee account was created
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/by-email")
                        .param("email", "new.hire@company.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("new.hire@company.com"))
                .andExpect(jsonPath("$.role").value("EMPLOYEE"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // Check onboarding status
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding/" + onboardingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.employeeDetails.email").value("new.hire@company.com"));
    }

    @Test
    @DisplayName("Should automatically suggest role-appropriate KPIs based on job title and department")
    void shouldAutomaticallySuggestRoleAppropriateKPIs() throws Exception {
        // Test KPI suggestions for Sales Representative
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding/kpi-suggestions")
                        .param("jobTitle", "Sales Representative")
                        .param("department", "Sales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestedKPIs").isArray())
                .andExpect(jsonPath("$.suggestedKPIs.length()").greaterThan(0))
                .andExpect(jsonPath("$.suggestedKPIs[?(@.kpiId == 'kpi-sales-001')]").exists())
                .andExpect(jsonPath("$.suggestedKPIs[0].kpiName").exists())
                .andExpect(jsonPath("$.suggestedKPIs[0].description").exists())
                .andExpect(jsonPath("$.suggestedKPIs[0].suggestedWeight").exists())
                .andExpect(jsonPath("$.suggestedKPIs[0].rationale").exists());

        // Test KPI suggestions for Customer Support role
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding/kpi-suggestions")
                        .param("jobTitle", "Customer Support Specialist")
                        .param("department", "Customer Service"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestedKPIs").isArray())
                .andExpect(jsonPath("$.suggestedKPIs[?(@.kpiId == 'kpi-quality-002')]").exists());

        // Test KPI suggestions for Management role
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding/kpi-suggestions")
                        .param("jobTitle", "Team Lead")
                        .param("department", "Engineering"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestedKPIs").isArray())
                .andExpect(jsonPath("$.suggestedKPIs[?(@.kpiId == 'kpi-efficiency-003')]").exists());
    }

    @Test
    @DisplayName("Should allow HR to review and customize KPI assignments during onboarding")
    void shouldAllowHRToReviewAndCustomizeKPIAssignments() throws Exception {
        // Create onboarding workflow
        String onboardingRequestJson = """
                {
                    "employeeDetails": {
                        "email": "customizable.hire@company.com",
                        "firstName": "Sarah",
                        "lastName": "Wilson",
                        "jobTitle": "Marketing Specialist",
                        "department": "Marketing",
                        "managerId": "supervisor@company.com",
                        "startDate": "2024-12-22"
                    }
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/admin/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(onboardingRequestJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String onboardingId = objectMapper.readTree(response).get("onboardingId").asText();

        // Get suggested KPIs for review
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding/" + onboardingId + "/suggested-kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestedKPIs").isArray())
                .andExpect(jsonPath("$.totalSuggestedWeight").isNumber());

        // Customize KPI assignments
        String customKPIAssignmentJson = """
                {
                    "kpiAssignments": [
                        {
                            "kpiId": "kpi-sales-001",
                            "weight": 40,
                            "target": 85.0,
                            "customized": true,
                            "customizationReason": "Adjusted weight to reflect marketing focus on lead generation"
                        },
                        {
                            "kpiId": "kpi-quality-002",
                            "weight": 35,
                            "target": 90.0,
                            "customized": false
                        },
                        {
                            "kpiId": "kpi-efficiency-003",
                            "weight": 25,
                            "target": 80.0,
                            "customized": true,
                            "customizationReason": "Lower weight as efficiency is secondary for marketing role"
                        }
                    ],
                    "customizationNotes": "KPI weights adjusted to better reflect marketing specialist responsibilities with emphasis on lead generation and campaign quality",
                    "reviewedBy": "hr@company.com"
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/onboarding/" + onboardingId + "/kpi-assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(customKPIAssignmentJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kpiAssignments").isArray())
                .andExpect(jsonPath("$.kpiAssignments.length()").value(3))
                .andExpect(jsonPath("$.customizationNotes").exists())
                .andExpect(jsonPath("$.totalWeight").value(100))
                .andExpect(jsonPath("$.reviewedBy").value("hr@company.com"));

        // Verify customizations are saved
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding/" + onboardingId + "/kpi-assignments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kpiAssignments[?(@.customized == true)]").exists())
                .andExpect(jsonPath("$.kpiAssignments[?(@.kpiId == 'kpi-sales-001')].customizationReason").exists());
    }

    @Test
    @DisplayName("Should ensure KPI assignments are effective from employee start date")
    void shouldEnsureKPIAssignmentsEffectiveFromStartDate() throws Exception {
        // Create onboarding with future start date
        String futureOnboardingJson = """
                {
                    "employeeDetails": {
                        "email": "future.start@company.com",
                        "firstName": "Michael",
                        "lastName": "Brown",
                        "jobTitle": "Software Engineer",
                        "department": "Engineering",
                        "managerId": "supervisor@company.com",
                        "startDate": "2024-12-25"
                    },
                    "kpiAssignments": [
                        {
                            "kpiId": "kpi-efficiency-003",
                            "weight": 60,
                            "target": 85.0,
                            "effectiveDate": "2024-12-25"
                        },
                        {
                            "kpiId": "kpi-quality-002",
                            "weight": 40,
                            "target": 90.0,
                            "effectiveDate": "2024-12-25"
                        }
                    ]
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/admin/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(futureOnboardingJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String onboardingId = objectMapper.readTree(response).get("onboardingId").asText();

        // Verify KPI assignments have correct effective dates
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding/" + onboardingId + "/kpi-assignments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kpiAssignments[0].effectiveDate").value("2024-12-25"))
                .andExpect(jsonPath("$.kpiAssignments[1].effectiveDate").value("2024-12-25"));

        // Verify employee account shows correct start date
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/by-email")
                        .param("email", "future.start@company.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startDate").value("2024-12-25"));

        // Test that KPIs are not active before start date (if current date < start date)
        mockMvc.perform(get("/api/v1/data-analytics/performance/employee/future.start@company.com/active-kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeKPIs").isArray())
                .andExpect(jsonPath("$.effectiveDate").value("2024-12-25"));
    }

    @Test
    @DisplayName("Should track onboarding checklist completion progress")
    void shouldTrackOnboardingChecklistCompletionProgress() throws Exception {
        // Create comprehensive onboarding workflow
        String onboardingRequestJson = """
                {
                    "employeeDetails": {
                        "email": "checklist.test@company.com",
                        "firstName": "Emma",
                        "lastName": "Davis",
                        "jobTitle": "Product Manager",
                        "department": "Product",
                        "managerId": "supervisor@company.com",
                        "startDate": "2024-12-18"
                    },
                    "onboardingChecklist": {
                        "includeKPIAssignment": true,
                        "includeSystemAccess": true,
                        "includeOrientationScheduling": true,
                        "includeDocumentCollection": true,
                        "includeMentorAssignment": true
                    }
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/admin/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(onboardingRequestJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String onboardingId = objectMapper.readTree(response).get("onboardingId").asText();

        // Get initial checklist status
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding/" + onboardingId + "/checklist"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.checklistItems").isArray())
                .andExpect(jsonPath("$.checklistItems.length()").greaterThan(0))
                .andExpect(jsonPath("$.completionPercentage").isNumber())
                .andExpect(jsonPath("$.totalItems").isNumber())
                .andExpect(jsonPath("$.completedItems").isNumber());

        // Complete KPI assignment step
        String kpiCompletionJson = """
                {
                    "checklistItemId": "kpi-assignment",
                    "status": "COMPLETED",
                    "completedBy": "hr@company.com",
                    "completionDate": "2024-12-16T10:00:00Z",
                    "notes": "KPI assignments reviewed and finalized with employee and manager"
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/onboarding/" + onboardingId + "/checklist/kpi-assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(kpiCompletionJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.completedBy").value("hr@company.com"));

        // Verify updated completion progress
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding/" + onboardingId + "/checklist"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completionPercentage").greaterThan(0))
                .andExpect(jsonPath("$.completedItems").greaterThan(0))
                .andExpect(jsonPath("$.checklistItems[?(@.id == 'kpi-assignment')].status").value("COMPLETED"));

        // Get overall onboarding progress
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding/" + onboardingId + "/progress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallProgress").isNumber())
                .andExpect(jsonPath("$.currentPhase").exists())
                .andExpect(jsonPath("$.nextSteps").isArray())
                .andExpect(jsonPath("$.estimatedCompletion").exists());
    }

    @Test
    @DisplayName("Should send notifications to new employee and manager about KPI assignments")
    void shouldSendNotificationsAboutKPIAssignments() throws Exception {
        // Create onboarding with notification settings
        String onboardingRequestJson = """
                {
                    "employeeDetails": {
                        "email": "notification.test@company.com",
                        "firstName": "David",
                        "lastName": "Miller",
                        "jobTitle": "Data Analyst",
                        "department": "Analytics",
                        "managerId": "supervisor@company.com",
                        "startDate": "2024-12-19"
                    },
                    "notificationSettings": {
                        "notifyEmployee": true,
                        "notifyManager": true,
                        "notifyHR": true,
                        "includeKPIExplanations": true,
                        "includeWelcomeMessage": true
                    }
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/admin/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(onboardingRequestJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String onboardingId = objectMapper.readTree(response).get("onboardingId").asText();

        // Complete KPI assignment to trigger notifications
        String kpiAssignmentJson = """
                {
                    "kpiAssignments": [
                        {
                            "kpiId": "kpi-efficiency-003",
                            "weight": 70,
                            "target": 85.0
                        },
                        {
                            "kpiId": "kpi-quality-002",
                            "weight": 30,
                            "target": 90.0
                        }
                    ]
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/onboarding/" + onboardingId + "/kpi-assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(kpiAssignmentJson))
                .andExpect(status().isOk());

        // Verify employee notification was created
        mockMvc.perform(get("/api/v1/data-analytics/admin/notifications")
                        .param("recipientId", "notification.test@company.com")
                        .param("type", "KPI_ASSIGNMENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.onboardingId == '" + onboardingId + "')]").exists())
                .andExpect(jsonPath("$[0].subject").exists())
                .andExpect(jsonPath("$[0].message").exists())
                .andExpect(jsonPath("$[0].includesKPIExplanations").value(true));

        // Verify manager notification was created
        mockMvc.perform(get("/api/v1/data-analytics/admin/notifications")
                        .param("recipientId", "supervisor@company.com")
                        .param("type", "NEW_TEAM_MEMBER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.onboardingId == '" + onboardingId + "')]").exists());

        // Verify HR notification was created
        mockMvc.perform(get("/api/v1/data-analytics/admin/notifications")
                        .param("recipientId", "hr@company.com")
                        .param("type", "ONBOARDING_COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.onboardingId == '" + onboardingId + "')]").exists());
    }

    @Test
    @DisplayName("Should provide onboarding status tracking and reporting")
    void shouldProvideOnboardingStatusTrackingAndReporting() throws Exception {
        // Get all active onboarding processes
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].onboardingId").exists())
                .andExpect(jsonPath("$[0].employeeDetails").exists())
                .andExpect(jsonPath("$[0].status").exists())
                .andExpect(jsonPath("$[0].progress").exists());

        // Get onboarding processes by status
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding")
                        .param("status", "IN_PROGRESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.status == 'IN_PROGRESS')]").exists());

        // Get onboarding analytics
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalOnboardingProcesses").isNumber())
                .andExpect(jsonPath("$.completedThisMonth").isNumber())
                .andExpect(jsonPath("$.averageCompletionTime").isNumber())
                .andExpect(jsonPath("$.onboardingByDepartment").exists())
                .andExpect(jsonPath("$.commonKPIAssignments").isArray());

        // Get onboarding trends
        mockMvc.perform(get("/api/v1/data-analytics/admin/onboarding/trends")
                        .param("period", "90days"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period").value("90days"))
                .andExpect(jsonPath("$.trends").isArray())
                .andExpect(jsonPath("$.insights").exists());
    }

    @Test
    @DisplayName("Should handle onboarding workflow error scenarios")
    void shouldHandleOnboardingWorkflowErrors() throws Exception {
        // Test duplicate employee email
        String duplicateEmailJson = """
                {
                    "employeeDetails": {
                        "email": "john.doe@company.com",
                        "firstName": "Duplicate",
                        "lastName": "User",
                        "jobTitle": "Test Role",
                        "department": "Test",
                        "managerId": "supervisor@company.com",
                        "startDate": "2024-12-20"
                    }
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicateEmailJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Employee Already Exists"));

        // Test invalid manager ID
        String invalidManagerJson = """
                {
                    "employeeDetails": {
                        "email": "invalid.manager@company.com",
                        "firstName": "Test",
                        "lastName": "Employee",
                        "jobTitle": "Test Role",
                        "department": "Test",
                        "managerId": "nonexistent@company.com",
                        "startDate": "2024-12-20"
                    }
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidManagerJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid Manager"));

        // Test invalid start date (past date)
        String pastDateJson = """
                {
                    "employeeDetails": {
                        "email": "past.date@company.com",
                        "firstName": "Past",
                        "lastName": "Date",
                        "jobTitle": "Test Role",
                        "department": "Test",
                        "managerId": "supervisor@company.com",
                        "startDate": "2020-01-01"
                    }
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(pastDateJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid Start Date"));

        // Test missing required fields
        String incompleteDataJson = """
                {
                    "employeeDetails": {
                        "email": "incomplete@company.com"
                    }
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/onboarding")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(incompleteDataJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.details").isArray());
    }
}