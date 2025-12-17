package com.company.dataanalytics.demo;

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
 * Integration tests that validate all demo script scenarios work correctly.
 * These tests ensure the demo presentation will run smoothly.
 */
@SpringBootTest
@AutoConfigureTestMvc
@ActiveProfiles("test")
@DisplayName("Demo Script Validation Tests")
class DemoScriptValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DataSeeder dataSeeder;

    @BeforeEach
    void setUp() {
        // Ensure demo data is loaded before each test
        dataSeeder.seedDemoData();
    }

    @Test
    @DisplayName("Scenario 1: System Health Check - All endpoints should work")
    void shouldValidateSystemHealthCheckScenario() throws Exception {
        // Basic health check
        mockMvc.perform(get("/api/v1/data-analytics/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));

        // Detailed system status
        mockMvc.perform(get("/api/v1/data-analytics/health/detailed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components").exists());

        // System statistics
        mockMvc.perform(get("/api/v1/data-analytics/health/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(6))
                .andExpect(jsonPath("$.totalReports").value(2));
    }

    @Test
    @DisplayName("Scenario 2: User Management - All user operations should work")
    void shouldValidateUserManagementScenario() throws Exception {
        // Get all users
        mockMvc.perform(get("/api/v1/data-analytics/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(6));

        // Get active users only
        mockMvc.perform(get("/api/v1/data-analytics/admin/users?activeOnly=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get users by role
        mockMvc.perform(get("/api/v1/data-analytics/admin/users?role=EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get user by email
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/by-email?email=john.doe@company.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("john.doe@company.com"));

        // Create new user
        String newUserJson = """
                {
                    "email": "new.employee@company.com",
                    "username": "new_employee",
                    "role": "EMPLOYEE"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newUserJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("new.employee@company.com"))
                .andExpect(jsonPath("$.role").value("EMPLOYEE"));
    }

    @Test
    @DisplayName("Scenario 3: Performance Data Management - All performance operations should work")
    void shouldValidatePerformanceDataScenario() throws Exception {
        // Get performance data for an employee
        mockMvc.perform(get("/api/v1/data-analytics/performance/employee/john.doe@company.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get performance data with date range
        mockMvc.perform(get("/api/v1/data-analytics/performance/employee/john.doe@company.com")
                        .param("startDate", "2024-12-01")
                        .param("endDate", "2024-12-16"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get aggregated performance data
        mockMvc.perform(get("/api/v1/data-analytics/performance/employee/john.doe@company.com/aggregated")
                        .param("startDate", "2024-12-01")
                        .param("endDate", "2024-12-16"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value("john.doe@company.com"));

        // Get team performance data
        mockMvc.perform(get("/api/v1/data-analytics/performance/team/supervisor@company.com")
                        .param("employeeIds", "john.doe@company.com,jane.smith@company.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get organization performance data
        mockMvc.perform(get("/api/v1/data-analytics/performance/organization")
                        .param("startDate", "2024-12-01")
                        .param("endDate", "2024-12-16"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEmployees").isNumber());

        // Record new performance data
        String performanceDataJson = """
                {
                    "employeeId": "john.doe@company.com",
                    "kpiId": "kpi-sales-001",
                    "value": 95.5,
                    "unit": "points",
                    "dataDate": "2024-12-16"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/performance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(performanceDataJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeId").value("john.doe@company.com"))
                .andExpect(jsonPath("$.value").value(95.5));

        // Get performance statistics
        mockMvc.perform(get("/api/v1/data-analytics/performance/statistics")
                        .param("employeeId", "john.doe@company.com")
                        .param("kpiId", "kpi-sales-001")
                        .param("startDate", "2024-12-01")
                        .param("endDate", "2024-12-16"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value("john.doe@company.com"));

        // Get performance trends
        mockMvc.perform(get("/api/v1/data-analytics/performance/trends")
                        .param("employeeId", "john.doe@company.com")
                        .param("kpiId", "kpi-sales-001")
                        .param("startDate", "2024-12-01")
                        .param("endDate", "2024-12-16"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value("john.doe@company.com"));
    }

    @Test
    @DisplayName("Scenario 4: Report Management - All report operations should work")
    void shouldValidateReportManagementScenario() throws Exception {
        // Get all report templates
        mockMvc.perform(get("/api/v1/data-analytics/reports/templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

        // Create new report template
        String templateJson = """
                {
                    "templateName": "Custom Performance Report",
                    "description": "Custom template for performance analysis",
                    "configuration": {
                        "supportedFormats": ["PDF", "CSV"],
                        "estimatedMinutes": 2,
                        "requiredParameters": {
                            "employeeId": "string",
                            "period": "string"
                        }
                    }
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/reports/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(templateJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.templateName").value("Custom Performance Report"));

        // Generate ad-hoc report
        String reportJson = """
                {
                    "reportName": "Demo Performance Report",
                    "format": "PDF",
                    "parameters": {
                        "employeeId": "john.doe@company.com",
                        "startDate": "2024-12-01",
                        "endDate": "2024-12-16"
                    }
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/reports/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportJson))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.reportName").value("Demo Performance Report"))
                .andExpect(jsonPath("$.status").value("PENDING"));

        // Get all reports
        mockMvc.perform(get("/api/v1/data-analytics/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Get reports by status
        mockMvc.perform(get("/api/v1/data-analytics/reports?status=PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Estimate report generation time
        String estimateJson = """
                {
                    "parameters": {
                        "employeeCount": 10,
                        "dateRange": "30days"
                    }
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/reports/estimate-time")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(estimateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estimatedMinutes").isNumber());
    }

    @Test
    @DisplayName("Scenario 5: Bulk Operations - Bulk update should work")
    void shouldValidateBulkOperationsScenario() throws Exception {
        String bulkDataJson = """
                [
                    {
                        "employeeId": "john.doe@company.com",
                        "kpiId": "kpi-sales-001",
                        "value": 88.5,
                        "unit": "points",
                        "dataDate": "2024-12-16"
                    },
                    {
                        "employeeId": "jane.smith@company.com",
                        "kpiId": "kpi-quality-002",
                        "value": 92.0,
                        "unit": "percentage",
                        "dataDate": "2024-12-16"
                    }
                ]
                """;

        mockMvc.perform(post("/api/v1/data-analytics/performance/bulk-update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bulkDataJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processedCount").value(2))
                .andExpect(jsonPath("$.successCount").value(2))
                .andExpect(jsonPath("$.failureCount").value(0));
    }

    @Test
    @DisplayName("Demo Data Validation - Ensure all demo data is properly loaded")
    void shouldValidateDemoDataIsProperlyLoaded() throws Exception {
        // Verify users are loaded
        mockMvc.perform(get("/api/v1/data-analytics/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6));

        // Verify report templates are loaded
        mockMvc.perform(get("/api/v1/data-analytics/reports/templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        // Verify performance data is loaded
        mockMvc.perform(get("/api/v1/data-analytics/performance/employee/john.doe@company.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").greaterThan(0));

        // Verify system statistics reflect demo data
        mockMvc.perform(get("/api/v1/data-analytics/health/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(6))
                .andExpect(jsonPath("$.totalReports").value(2))
                .andExpect(jsonPath("$.totalPerformanceData").greaterThan(0));
    }
}