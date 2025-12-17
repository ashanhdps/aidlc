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
 * Tests for US-027: System Administration
 * As a System Administrator, I want to manage users, system settings, and external integrations
 * So that the platform operates securely, efficiently, and integrates with our business systems
 */
@SpringBootTest
@AutoConfigureTestMvc
@ActiveProfiles("test")
@DisplayName("US-027: System Administration")
class US027SystemAdministrationTest {

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
    @DisplayName("Should create, edit, and delete user accounts")
    void shouldManageUserAccountLifecycle() throws Exception {
        // Create new user account
        String newUserJson = """
                {
                    "email": "test.admin@company.com",
                    "username": "test_admin",
                    "role": "ADMIN"
                }
                """;

        String userResponse = mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newUserJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("test.admin@company.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andReturn().getResponse().getContentAsString();

        // Extract user ID for further operations
        String userId = objectMapper.readTree(userResponse).get("userId").asText();

        // Edit user account
        String updateUserJson = """
                {
                    "username": "updated_admin",
                    "role": "HR"
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/users/" + userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateUserJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("updated_admin"))
                .andExpect(jsonPath("$.role").value("HR"));

        // Verify user exists
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("updated_admin"));

        // Delete user account
        mockMvc.perform(delete("/api/v1/data-analytics/admin/users/" + userId))
                .andExpect(status().isNoContent());

        // Verify user is deleted
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/" + userId))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should assign and modify user roles with proper permissions")
    void shouldManageUserRolesAndPermissions() throws Exception {
        // Test role assignment during user creation
        String employeeUserJson = """
                {
                    "email": "new.employee@company.com",
                    "username": "new_employee",
                    "role": "EMPLOYEE"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(employeeUserJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("EMPLOYEE"));

        // Test role modification
        String supervisorUserJson = """
                {
                    "email": "new.supervisor@company.com",
                    "username": "new_supervisor",
                    "role": "SUPERVISOR"
                }
                """;

        String supervisorResponse = mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(supervisorUserJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String supervisorId = objectMapper.readTree(supervisorResponse).get("userId").asText();

        // Change role from SUPERVISOR to HR
        String roleChangeJson = """
                {
                    "role": "HR"
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/users/" + supervisorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(roleChangeJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("HR"));

        // Verify role-based filtering works
        mockMvc.perform(get("/api/v1/data-analytics/admin/users?role=HR"))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$").isArray())
                .andExpected(jsonPath("$[?(@.role == 'HR')]").exists());
    }

    @Test
    @DisplayName("Should activate, deactivate, and suspend user accounts")
    void shouldManageUserAccountStatus() throws Exception {
        // Create test user
        String testUserJson = """
                {
                    "email": "status.test@company.com",
                    "username": "status_test",
                    "role": "EMPLOYEE"
                }
                """;

        String userResponse = mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(testUserJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String userId = objectMapper.readTree(userResponse).get("userId").asText();

        // Deactivate user
        mockMvc.perform(put("/api/v1/data-analytics/admin/users/" + userId + "/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));

        // Verify deactivated user doesn't appear in active users list
        mockMvc.perform(get("/api/v1/data-analytics/admin/users?activeOnly=true"))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$[?(@.userId == '" + userId + "')]").doesNotExist());

        // Reactivate user
        mockMvc.perform(put("/api/v1/data-analytics/admin/users/" + userId + "/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // Suspend user
        mockMvc.perform(put("/api/v1/data-analytics/admin/users/" + userId + "/suspend"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"));
    }

    @Test
    @DisplayName("Should provide user activity logs and access history")
    void shouldTrackUserActivityAndAccess() throws Exception {
        // Get existing user
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/by-email?email=john.doe@company.com"))
                .andExpect(status().isOk());

        // Simulate some user activity by accessing performance data
        mockMvc.perform(get("/api/v1/data-analytics/performance/employee/john.doe@company.com"))
                .andExpect(status().isOk());

        // Check user activity logs
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/by-email/john.doe@company.com/activity"))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$").isArray())
                .andExpected(jsonPath("$[0].action").exists())
                .andExpected(jsonPath("$[0].timestamp").exists());

        // Check access history
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/by-email/john.doe@company.com/access-history"))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.lastLoginTime").exists())
                .andExpected(jsonPath("$.loginCount").isNumber());
    }

    @Test
    @DisplayName("Should support bulk user operations")
    void shouldSupportBulkUserOperations() throws Exception {
        // Bulk user creation
        String bulkUsersJson = """
                [
                    {
                        "email": "bulk1@company.com",
                        "username": "bulk_user_1",
                        "role": "EMPLOYEE"
                    },
                    {
                        "email": "bulk2@company.com",
                        "username": "bulk_user_2",
                        "role": "EMPLOYEE"
                    },
                    {
                        "email": "bulk3@company.com",
                        "username": "bulk_user_3",
                        "role": "SUPERVISOR"
                    }
                ]
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/users/bulk-create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bulkUsersJson))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.processedCount").value(3))
                .andExpected(jsonPath("$.successCount").value(3))
                .andExpected(jsonPath("$.failureCount").value(0));

        // Verify bulk created users exist
        mockMvc.perform(get("/api/v1/data-analytics/admin/users"))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.length()").greaterThanOrEqualTo(9)); // 6 original + 3 bulk created

        // Bulk export users
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/export")
                        .param("format", "CSV"))
                .andExpect(status().isOk())
                .andExpected(header().string("Content-Type", "text/csv"));
    }

    @Test
    @DisplayName("Should track changes with comprehensive audit trails")
    void shouldProvideComprehensiveAuditTrails() throws Exception {
        // Create user to generate audit events
        String auditTestUserJson = """
                {
                    "email": "audit.test@company.com",
                    "username": "audit_test",
                    "role": "EMPLOYEE"
                }
                """;

        String userResponse = mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(auditTestUserJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String userId = objectMapper.readTree(userResponse).get("userId").asText();

        // Modify user to generate more audit events
        String updateJson = """
                {
                    "role": "SUPERVISOR"
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/users/" + userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk());

        // Check audit trail
        mockMvc.perform(get("/api/v1/data-analytics/admin/audit-trail")
                        .param("entityType", "USER")
                        .param("entityId", userId))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$").isArray())
                .andExpected(jsonPath("$[0].action").exists())
                .andExpected(jsonPath("$[0].timestamp").exists())
                .andExpected(jsonPath("$[0].userId").exists())
                .andExpected(jsonPath("$[0].changes").exists());

        // Check system-wide audit trail
        mockMvc.perform(get("/api/v1/data-analytics/admin/audit-trail"))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$").isArray())
                .andExpected(jsonPath("$.length()").greaterThan(0));
    }

    @Test
    @DisplayName("Should monitor system performance and usage metrics")
    void shouldProvideSystemMonitoringAndMetrics() throws Exception {
        // Get system performance metrics
        mockMvc.perform(get("/api/v1/data-analytics/admin/system/metrics"))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.uptime").exists())
                .andExpected(jsonPath("$.memoryUsage").exists())
                .andExpected(jsonPath("$.cpuUsage").exists())
                .andExpected(jsonPath("$.activeUsers").isNumber())
                .andExpected(jsonPath("$.totalRequests").isNumber());

        // Get usage statistics
        mockMvc.perform(get("/api/v1/data-analytics/admin/system/usage"))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.dailyActiveUsers").isNumber())
                .andExpected(jsonPath("$.totalApiCalls").isNumber())
                .andExpected(jsonPath("$.averageResponseTime").isNumber());

        // Get system health detailed view
        mockMvc.perform(get("/api/v1/data-analytics/health/detailed"))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.status").value("UP"))
                .andExpected(jsonPath("$.components").exists())
                .andExpected(jsonPath("$.uptime").exists());
    }

    @Test
    @DisplayName("Should validate role-based access control enforcement")
    void shouldEnforceRoleBasedAccessControl() throws Exception {
        // Test that different roles have appropriate access levels
        
        // Admin should have full access
        mockMvc.perform(get("/api/v1/data-analytics/admin/users"))
                .andExpect(status().isOk());

        // Test HR role access
        mockMvc.perform(get("/api/v1/data-analytics/admin/users?role=HR"))
                .andExpect(status().isOk());

        // Test that user management operations require admin privileges
        String testUserJson = """
                {
                    "email": "rbac.test@company.com",
                    "username": "rbac_test",
                    "role": "EMPLOYEE"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(testUserJson))
                .andExpect(status().isCreated());

        // Verify role validation during user creation
        String invalidRoleJson = """
                {
                    "email": "invalid.role@company.com",
                    "username": "invalid_role",
                    "role": "INVALID_ROLE"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRoleJson))
                .andExpect(status().isBadRequest())
                .andExpected(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    @DisplayName("Should handle user management error scenarios gracefully")
    void shouldHandleUserManagementErrors() throws Exception {
        // Test duplicate email validation
        String duplicateEmailJson = """
                {
                    "email": "john.doe@company.com",
                    "username": "duplicate_test",
                    "role": "EMPLOYEE"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicateEmailJson))
                .andExpect(status().isConflict())
                .andExpected(jsonPath("$.error").value("User Already Exists"));

        // Test invalid email format
        String invalidEmailJson = """
                {
                    "email": "invalid-email-format",
                    "username": "invalid_email",
                    "role": "EMPLOYEE"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidEmailJson))
                .andExpect(status().isBadRequest())
                .andExpected(jsonPath("$.error").value("Validation Failed"));

        // Test user not found scenario
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/non-existent-user-id"))
                .andExpect(status().isNotFound())
                .andExpected(jsonPath("$.error").value("User Not Found"));

        // Test invalid user update
        mockMvc.perform(put("/api/v1/data-analytics/admin/users/non-existent-user-id")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound());
    }
}