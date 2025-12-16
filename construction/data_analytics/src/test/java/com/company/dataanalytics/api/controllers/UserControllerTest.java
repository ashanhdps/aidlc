package com.company.dataanalytics.api.controllers;

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

@SpringBootTest
@AutoConfigureTestMvc
@ActiveProfiles("test")
@DisplayName("User Controller API Tests")
class UserControllerTest {

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
    @DisplayName("Should get all users")
    void shouldGetAllUsers() throws Exception {
        mockMvc.perform(get("/api/v1/data-analytics/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(6))
                .andExpect(jsonPath("$[0].userId").exists())
                .andExpect(jsonPath("$[0].email").exists())
                .andExpect(jsonPath("$[0].role").exists())
                .andExpect(jsonPath("$[0].status").exists());
    }

    @Test
    @DisplayName("Should filter users by role")
    void shouldFilterUsersByRole() throws Exception {
        mockMvc.perform(get("/api/v1/data-analytics/admin/users?role=ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[*].role").value(org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.is("ADMIN"))));

        mockMvc.perform(get("/api/v1/data-analytics/admin/users?role=EMPLOYEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[*].role").value(org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.is("EMPLOYEE"))));
    }

    @Test
    @DisplayName("Should filter active users only")
    void shouldFilterActiveUsersOnly() throws Exception {
        mockMvc.perform(get("/api/v1/data-analytics/admin/users?activeOnly=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[*].status").value(org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.is("ACTIVE"))));
    }

    @Test
    @DisplayName("Should get user by email")
    void shouldGetUserByEmail() throws Exception {
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/by-email?email=john.doe@company.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("john.doe@company.com"))
                .andExpect(jsonPath("$.username").exists())
                .andExpect(jsonPath("$.role").exists());
    }

    @Test
    @DisplayName("Should return 404 for non-existent user email")
    void shouldReturn404ForNonExistentUserEmail() throws Exception {
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/by-email?email=nonexistent@company.com"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("User Not Found"));
    }

    @Test
    @DisplayName("Should create new user")
    void shouldCreateNewUser() throws Exception {
        String newUserJson = """
                {
                    "email": "test.user@company.com",
                    "username": "test_user",
                    "role": "EMPLOYEE"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newUserJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("test.user@company.com"))
                .andExpect(jsonPath("$.username").value("test_user"))
                .andExpect(jsonPath("$.role").value("EMPLOYEE"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.userId").exists())
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    @DisplayName("Should validate required fields when creating user")
    void shouldValidateRequiredFieldsWhenCreatingUser() throws Exception {
        String invalidUserJson = """
                {
                    "email": "",
                    "username": "",
                    "role": "INVALID_ROLE"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidUserJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.details").exists());
    }

    @Test
    @DisplayName("Should prevent duplicate email addresses")
    void shouldPreventDuplicateEmailAddresses() throws Exception {
        String duplicateEmailJson = """
                {
                    "email": "john.doe@company.com",
                    "username": "duplicate_user",
                    "role": "EMPLOYEE"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicateEmailJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.details").value(org.hamcrest.Matchers.containsString("email")));
    }

    @Test
    @DisplayName("Should update existing user")
    void shouldUpdateExistingUser() throws Exception {
        // Get existing user first
        String userResponse = mockMvc.perform(get("/api/v1/data-analytics/admin/users/by-email?email=john.doe@company.com"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String userId = objectMapper.readTree(userResponse).get("userId").asText();

        String updateUserJson = """
                {
                    "username": "john_doe_updated",
                    "role": "SUPERVISOR"
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/users/" + userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateUserJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("john_doe_updated"))
                .andExpect(jsonPath("$.role").value("SUPERVISOR"))
                .andExpect(jsonPath("$.email").value("john.doe@company.com")) // Email should remain unchanged
                .andExpect(jsonPath("$.lastModified").exists());
    }

    @Test
    @DisplayName("Should activate and deactivate users")
    void shouldActivateAndDeactivateUsers() throws Exception {
        // Get existing user
        String userResponse = mockMvc.perform(get("/api/v1/data-analytics/admin/users/by-email?email=jane.smith@company.com"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String userId = objectMapper.readTree(userResponse).get("userId").asText();

        // Deactivate user
        mockMvc.perform(put("/api/v1/data-analytics/admin/users/" + userId + "/deactivate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"))
                .andExpect(jsonPath("$.lastModified").exists());

        // Verify user is deactivated
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));

        // Reactivate user
        mockMvc.perform(put("/api/v1/data-analytics/admin/users/" + userId + "/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Should delete user")
    void shouldDeleteUser() throws Exception {
        // Create user to delete
        String newUserJson = """
                {
                    "email": "delete.me@company.com",
                    "username": "delete_me",
                    "role": "EMPLOYEE"
                }
                """;

        String createdUserResponse = mockMvc.perform(post("/api/v1/data-analytics/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newUserJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String userId = objectMapper.readTree(createdUserResponse).get("userId").asText();

        // Delete user
        mockMvc.perform(delete("/api/v1/data-analytics/admin/users/" + userId))
                .andExpect(status().isNoContent());

        // Verify user is deleted
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/" + userId))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should get user activity logs")
    void shouldGetUserActivityLogs() throws Exception {
        // Get existing user
        String userResponse = mockMvc.perform(get("/api/v1/data-analytics/admin/users/by-email?email=john.doe@company.com"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String userId = objectMapper.readTree(userResponse).get("userId").asText();

        // Get activity logs
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/" + userId + "/activity"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].userId").value(userId))
                .andExpect(jsonPath("$[0].action").exists())
                .andExpect(jsonPath("$[0].timestamp").exists());
    }

    @Test
    @DisplayName("Should get user audit trail")
    void shouldGetUserAuditTrail() throws Exception {
        // Get existing user
        String userResponse = mockMvc.perform(get("/api/v1/data-analytics/admin/users/by-email?email=john.doe@company.com"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String userId = objectMapper.readTree(userResponse).get("userId").asText();

        // Get audit trail
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/" + userId + "/audit-trail"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Should support bulk user operations")
    void shouldSupportBulkUserOperations() throws Exception {
        // Bulk create users
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
                    }
                ]
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/users/bulk-import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bulkUsersJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processedCount").value(2))
                .andExpect(jsonPath("$.successCount").value(2))
                .andExpect(jsonPath("$.failureCount").value(0));

        // Bulk export users
        mockMvc.perform(get("/api/v1/data-analytics/admin/users/export"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(8)); // 6 original + 2 bulk created
    }

    @Test
    @DisplayName("Should handle invalid user ID gracefully")
    void shouldHandleInvalidUserIdGracefully() throws Exception {
        String invalidUserId = "invalid-user-id";

        mockMvc.perform(get("/api/v1/data-analytics/admin/users/" + invalidUserId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("User Not Found"));

        mockMvc.perform(put("/api/v1/data-analytics/admin/users/" + invalidUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/data-analytics/admin/users/" + invalidUserId))
                .andExpect(status().isNotFound());
    }
}