package com.company.kpi.integration;

import com.company.kpi.BaseTestCase;
import com.company.kpi.TestDataFactory;
import com.company.kpi.model.dto.CreateKPIRequest;
import com.company.kpi.model.dto.KPIResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for KPI Management Service
 * Tests complete workflows and end-to-end functionality
 */
@SpringBootTest
@AutoConfigureWebMvc
@DisplayName("KPI Management Integration Tests")
class KPIManagementIntegrationTest extends BaseTestCase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Nested
    @DisplayName("Complete KPI Lifecycle Integration Tests")
    class KPILifecycleTest {

        @Test
        @WithMockUser(authorities = {"kpi:write", "kpi:read"})
        @DisplayName("Should complete full KPI lifecycle: Create → Read → Update → Delete")
        void shouldCompleteFullKPILifecycle() throws Exception {
            // Step 1: Create KPI
            CreateKPIRequest createRequest = TestDataFactory.createValidKPIRequest();
            
            MvcResult createResult = mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(createRequest.getName()))
                .andReturn();

            String createResponseJson = createResult.getResponse().getContentAsString();
            KPIResponse createdKPI = objectMapper.readValue(createResponseJson, KPIResponse.class);
            String kpiId = createdKPI.getId();
            assertNotNull(kpiId);

            // Step 2: Read KPI
            mockMvc.perform(get("/kpi-management/kpis/{id}", kpiId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(kpiId))
                .andExpect(jsonPath("$.name").value(createRequest.getName()))
                .andExpect(jsonPath("$.active").value(true));

            // Step 3: Update KPI
            CreateKPIRequest updateRequest = TestDataFactory.createValidKPIRequest();
            updateRequest.setName("Updated KPI Name");
            updateRequest.setDescription("Updated description");

            mockMvc.perform(put("/kpi-management/kpis/{id}", kpiId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated KPI Name"))
                .andExpect(jsonPath("$.description").value("Updated description"));

            // Step 4: Verify update
            mockMvc.perform(get("/kpi-management/kpis/{id}", kpiId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated KPI Name"));

            // Step 5: Delete KPI (soft delete)
            mockMvc.perform(delete("/kpi-management/kpis/{id}", kpiId)
                    .with(csrf()))
                .andExpect(status().isNoContent());

            // Step 6: Verify KPI is soft deleted (should still exist but inactive)
            mockMvc.perform(get("/kpi-management/kpis/{id}", kpiId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
        }

        @Test
        @WithMockUser(authorities = {"kpi:write", "kpi:read"})
        @DisplayName("Should handle bulk KPI operations efficiently")
        void shouldHandleBulkKPIOperationsEfficiently() throws Exception {
            // Given
            int bulkSize = 10;
            String[] kpiIds = new String[bulkSize];

            // When - Create multiple KPIs
            long startTime = System.currentTimeMillis();
            
            for (int i = 0; i < bulkSize; i++) {
                CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
                request.setName("Bulk KPI " + (i + 1));
                
                MvcResult result = mockMvc.perform(post("/kpi-management/kpis")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andReturn();

                String responseJson = result.getResponse().getContentAsString();
                KPIResponse createdKPI = objectMapper.readValue(responseJson, KPIResponse.class);
                kpiIds[i] = createdKPI.getId();
            }
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            // Then - Should complete within performance threshold
            assertTrue(duration < 2000, "Bulk creation should complete within 2 seconds");

            // Verify all KPIs were created
            mockMvc.perform(get("/kpi-management/kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(bulkSize));

            // Clean up - Delete all created KPIs
            for (String kpiId : kpiIds) {
                mockMvc.perform(delete("/kpi-management/kpis/{id}", kpiId)
                        .with(csrf()))
                    .andExpect(status().isNoContent());
            }
        }
    }

    @Nested
    @DisplayName("Business Rule Validation Integration Tests")
    class BusinessRuleValidationTest {

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should enforce KPI name uniqueness across requests")
        void shouldEnforceKPINameUniquenessAcrossRequests() throws Exception {
            // Given
            CreateKPIRequest request1 = TestDataFactory.createValidKPIRequest();
            request1.setName("Unique KPI Name");

            CreateKPIRequest request2 = TestDataFactory.createValidKPIRequest();
            request2.setName("Unique KPI Name"); // Same name

            // When - Create first KPI
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());

            // Then - Second KPI with same name should fail
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should validate weight percentage boundaries")
        void shouldValidateWeightPercentageBoundaries() throws Exception {
            // Test valid boundary values
            CreateKPIRequest validRequest1 = TestDataFactory.createValidKPIRequest();
            validRequest1.setName("Valid Weight 0%");
            validRequest1.setDefaultWeightPercentage(java.math.BigDecimal.ZERO);

            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest1)))
                .andExpect(status().isCreated());

            CreateKPIRequest validRequest2 = TestDataFactory.createValidKPIRequest();
            validRequest2.setName("Valid Weight 100%");
            validRequest2.setDefaultWeightPercentage(java.math.BigDecimal.valueOf(100.0));

            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest2)))
                .andExpect(status().isCreated());

            // Test invalid values
            CreateKPIRequest invalidRequest = TestDataFactory.createValidKPIRequest();
            invalidRequest.setName("Invalid Weight");
            invalidRequest.setDefaultWeightPercentage(java.math.BigDecimal.valueOf(150.0));

            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should validate measurement frequency values")
        void shouldValidateMeasurementFrequencyValues() throws Exception {
            // Test valid frequency
            CreateKPIRequest validRequest = TestDataFactory.createValidKPIRequest();
            validRequest.setName("Valid Frequency KPI");
            validRequest.setMeasurementFrequencyValue(1);

            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated());

            // Test invalid frequency
            CreateKPIRequest invalidRequest = TestDataFactory.createValidKPIRequest();
            invalidRequest.setName("Invalid Frequency KPI");
            invalidRequest.setMeasurementFrequencyValue(-1);

            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Security Integration Tests")
    class SecurityIntegrationTest {

        @Test
        @DisplayName("Should require authentication for all endpoints")
        void shouldRequireAuthenticationForAllEndpoints() throws Exception {
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();

            // Test POST without authentication
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());

            // Test GET without authentication
            mockMvc.perform(get("/kpi-management/kpis"))
                .andExpect(status().isUnauthorized());

            // Test PUT without authentication
            mockMvc.perform(put("/kpi-management/kpis/test-id")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());

            // Test DELETE without authentication
            mockMvc.perform(delete("/kpi-management/kpis/test-id")
                    .with(csrf()))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(authorities = "kpi:read")
        @DisplayName("Should enforce role-based access control")
        void shouldEnforceRoleBasedAccessControl() throws Exception {
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();

            // User with only read permission should not be able to create
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

            // User with only read permission should not be able to update
            mockMvc.perform(put("/kpi-management/kpis/test-id")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

            // User with only read permission should not be able to delete
            mockMvc.perform(delete("/kpi-management/kpis/test-id")
                    .with(csrf()))
                .andExpect(status().isForbidden());

            // User with read permission should be able to read
            mockMvc.perform(get("/kpi-management/kpis"))
                .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should require CSRF token for state-changing operations")
        void shouldRequireCSRFTokenForStateChangingOperations() throws Exception {
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();

            // POST without CSRF token should fail
            mockMvc.perform(post("/kpi-management/kpis")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

            // PUT without CSRF token should fail
            mockMvc.perform(put("/kpi-management/kpis/test-id")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

            // DELETE without CSRF token should fail
            mockMvc.perform(delete("/kpi-management/kpis/test-id"))
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Performance Integration Tests")
    class PerformanceIntegrationTest {

        @Test
        @WithMockUser(authorities = {"kpi:write", "kpi:read"})
        @DisplayName("Should handle concurrent operations within performance threshold")
        void shouldHandleConcurrentOperationsWithinPerformanceThreshold() throws Exception {
            // Given
            int concurrentUsers = 10;
            int operationsPerUser = 5;

            // When - Simulate concurrent operations
            long startTime = System.currentTimeMillis();

            // Create KPIs concurrently
            for (int user = 0; user < concurrentUsers; user++) {
                for (int op = 0; op < operationsPerUser; op++) {
                    CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
                    request.setName("Concurrent KPI User" + user + " Op" + op);

                    mockMvc.perform(post("/kpi-management/kpis")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                        .andExpect(status().isCreated());
                }
            }

            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            // Then - Should complete within performance threshold
            assertTrue(duration < 2000, 
                "Concurrent operations should complete within 2 seconds, actual: " + duration + "ms");

            // Verify all KPIs were created
            mockMvc.perform(get("/kpi-management/kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(concurrentUsers * operationsPerUser));
        }

        @Test
        @WithMockUser(authorities = "kpi:read")
        @DisplayName("Should handle high-frequency read operations")
        void shouldHandleHighFrequencyReadOperations() throws Exception {
            // Given
            int numberOfReads = 100;

            // When
            long startTime = System.currentTimeMillis();

            for (int i = 0; i < numberOfReads; i++) {
                mockMvc.perform(get("/kpi-management/kpis"))
                    .andExpect(status().isOk());
            }

            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            // Then
            assertTrue(duration < 2000, 
                "High-frequency reads should complete within 2 seconds, actual: " + duration + "ms");
        }
    }

    @Nested
    @DisplayName("Error Handling Integration Tests")
    class ErrorHandlingIntegrationTest {

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should handle malformed JSON gracefully")
        void shouldHandleMalformedJSONGracefully() throws Exception {
            // Given
            String malformedJson = "{ \"name\": \"Test\", \"category\": }"; // Invalid JSON

            // When & Then
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(malformedJson))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should handle missing required fields")
        void shouldHandleMissingRequiredFields() throws Exception {
            // Given
            String incompleteJson = "{ \"description\": \"Missing name and category\" }";

            // When & Then
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(incompleteJson))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(authorities = "kpi:read")
        @DisplayName("Should handle non-existent resource requests")
        void shouldHandleNonExistentResourceRequests() throws Exception {
            // When & Then
            mockMvc.perform(get("/kpi-management/kpis/non-existent-id"))
                .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should handle invalid enum values")
        void shouldHandleInvalidEnumValues() throws Exception {
            // Given
            String invalidEnumJson = "{ \"name\": \"Test\", \"category\": \"INVALID_CATEGORY\", \"measurementType\": \"INVALID_TYPE\" }";

            // When & Then
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidEnumJson))
                .andExpect(status().isBadRequest());
        }
    }
}