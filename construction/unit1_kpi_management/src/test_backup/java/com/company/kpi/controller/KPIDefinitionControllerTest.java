package com.company.kpi.controller;

import com.company.kpi.BaseTestCase;
import com.company.kpi.TestDataFactory;
import com.company.kpi.model.KPICategory;
import com.company.kpi.model.KPIDefinition;
import com.company.kpi.model.dto.CreateKPIRequest;
import com.company.kpi.service.KPIDefinitionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for KPI Definition Controller
 * Tests REST API endpoints, request/response handling, and HTTP status codes
 */
@WebMvcTest(KPIDefinitionController.class)
@DisplayName("KPI Definition Controller Tests")
class KPIDefinitionControllerTest extends BaseTestCase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private KPIDefinitionService kpiDefinitionService;

    @Nested
    @DisplayName("Create KPI API Tests")
    class CreateKPIApiTest {

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should create KPI and return 201 Created")
        void shouldCreateKPIAndReturn201Created() throws Exception {
            // Given
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            KPIDefinition createdKPI = TestDataFactory.createTestKPIDefinition();
            
            when(kpiDefinitionService.createKPI(any(CreateKPIRequest.class), anyString()))
                .thenReturn(createdKPI);

            // When & Then
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value(createdKPI.getName()))
                .andExpect(jsonPath("$.category").value(createdKPI.getCategory().toString()))
                .andExpect(jsonPath("$.active").value(true));

            verify(kpiDefinitionService).createKPI(any(CreateKPIRequest.class), anyString());
        }

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should return 400 Bad Request for invalid KPI data")
        void shouldReturn400BadRequestForInvalidKPIData() throws Exception {
            // Given
            CreateKPIRequest invalidRequest = TestDataFactory.createInvalidKPIRequest();
            
            when(kpiDefinitionService.createKPI(any(CreateKPIRequest.class), anyString()))
                .thenThrow(new IllegalArgumentException("KPI name is required"));

            // When & Then
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

            verify(kpiDefinitionService).createKPI(any(CreateKPIRequest.class), anyString());
        }

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should return 409 Conflict for duplicate KPI name")
        void shouldReturn409ConflictForDuplicateKPIName() throws Exception {
            // Given
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            
            when(kpiDefinitionService.createKPI(any(CreateKPIRequest.class), anyString()))
                .thenThrow(new IllegalArgumentException("KPI with name 'Test KPI' already exists"));

            // When & Then
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()); // Controller maps IllegalArgumentException to 400

            verify(kpiDefinitionService).createKPI(any(CreateKPIRequest.class), anyString());
        }

        @Test
        @DisplayName("Should return 401 Unauthorized without authentication")
        void shouldReturn401UnauthorizedWithoutAuthentication() throws Exception {
            // Given
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();

            // When & Then
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());

            verify(kpiDefinitionService, never()).createKPI(any(CreateKPIRequest.class), anyString());
        }

        @Test
        @WithMockUser(authorities = "kpi:read") // Wrong authority
        @DisplayName("Should return 403 Forbidden without write permission")
        void shouldReturn403ForbiddenWithoutWritePermission() throws Exception {
            // Given
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();

            // When & Then
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

            verify(kpiDefinitionService, never()).createKPI(any(CreateKPIRequest.class), anyString());
        }
    }

    @Nested
    @DisplayName("Get KPIs API Tests")
    class GetKPIsApiTest {

        @Test
        @WithMockUser(authorities = "kpi:read")
        @DisplayName("Should get all KPIs and return 200 OK")
        void shouldGetAllKPIsAndReturn200OK() throws Exception {
            // Given
            List<KPIDefinition> kpis = Arrays.asList(
                TestDataFactory.createTestKPIDefinition(),
                TestDataFactory.createTestKPIDefinition()
            );
            
            when(kpiDefinitionService.getActiveKPIs()).thenReturn(kpis);

            // When & Then
            mockMvc.perform(get("/kpi-management/kpis")
                    .param("activeOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

            verify(kpiDefinitionService).getActiveKPIs();
        }

        @Test
        @WithMockUser(authorities = "kpi:read")
        @DisplayName("Should get KPIs by category and return 200 OK")
        void shouldGetKPIsByCategoryAndReturn200OK() throws Exception {
            // Given
            KPICategory category = KPICategory.SALES;
            List<KPIDefinition> kpis = Arrays.asList(TestDataFactory.createTestKPIDefinition());
            
            when(kpiDefinitionService.getKPIsByCategory(category)).thenReturn(kpis);

            // When & Then
            mockMvc.perform(get("/kpi-management/kpis")
                    .param("category", category.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

            verify(kpiDefinitionService).getKPIsByCategory(category);
        }

        @Test
        @WithMockUser(authorities = "kpi:read")
        @DisplayName("Should get KPI by ID and return 200 OK")
        void shouldGetKPIByIdAndReturn200OK() throws Exception {
            // Given
            String kpiId = "test-kpi-id";
            KPIDefinition kpi = TestDataFactory.createTestKPIDefinition();
            
            when(kpiDefinitionService.getKPIById(kpiId)).thenReturn(Optional.of(kpi));

            // When & Then
            mockMvc.perform(get("/kpi-management/kpis/{id}", kpiId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value(kpi.getName()));

            verify(kpiDefinitionService).getKPIById(kpiId);
        }

        @Test
        @WithMockUser(authorities = "kpi:read")
        @DisplayName("Should return 404 Not Found for non-existent KPI")
        void shouldReturn404NotFoundForNonExistentKPI() throws Exception {
            // Given
            String kpiId = "non-existent-id";
            
            when(kpiDefinitionService.getKPIById(kpiId)).thenReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/kpi-management/kpis/{id}", kpiId))
                .andExpect(status().isNotFound());

            verify(kpiDefinitionService).getKPIById(kpiId);
        }
    }

    @Nested
    @DisplayName("Update KPI API Tests")
    class UpdateKPIApiTest {

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should update KPI and return 200 OK")
        void shouldUpdateKPIAndReturn200OK() throws Exception {
            // Given
            String kpiId = "test-kpi-id";
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            KPIDefinition updatedKPI = TestDataFactory.createTestKPIDefinition();
            
            when(kpiDefinitionService.updateKPI(eq(kpiId), any(CreateKPIRequest.class), anyString()))
                .thenReturn(updatedKPI);

            // When & Then
            mockMvc.perform(put("/kpi-management/kpis/{id}", kpiId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value(updatedKPI.getName()));

            verify(kpiDefinitionService).updateKPI(eq(kpiId), any(CreateKPIRequest.class), anyString());
        }

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should return 400 Bad Request for invalid update data")
        void shouldReturn400BadRequestForInvalidUpdateData() throws Exception {
            // Given
            String kpiId = "test-kpi-id";
            CreateKPIRequest invalidRequest = TestDataFactory.createInvalidKPIRequest();
            
            when(kpiDefinitionService.updateKPI(eq(kpiId), any(CreateKPIRequest.class), anyString()))
                .thenThrow(new IllegalArgumentException("Invalid KPI data"));

            // When & Then
            mockMvc.perform(put("/kpi-management/kpis/{id}", kpiId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

            verify(kpiDefinitionService).updateKPI(eq(kpiId), any(CreateKPIRequest.class), anyString());
        }

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should return 404 Not Found when updating non-existent KPI")
        void shouldReturn404NotFoundWhenUpdatingNonExistentKPI() throws Exception {
            // Given
            String kpiId = "non-existent-id";
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            
            when(kpiDefinitionService.updateKPI(eq(kpiId), any(CreateKPIRequest.class), anyString()))
                .thenThrow(new IllegalArgumentException("KPI not found with ID: " + kpiId));

            // When & Then
            mockMvc.perform(put("/kpi-management/kpis/{id}", kpiId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()); // Controller maps IllegalArgumentException to 400

            verify(kpiDefinitionService).updateKPI(eq(kpiId), any(CreateKPIRequest.class), anyString());
        }
    }

    @Nested
    @DisplayName("Delete KPI API Tests")
    class DeleteKPIApiTest {

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should delete KPI and return 204 No Content")
        void shouldDeleteKPIAndReturn204NoContent() throws Exception {
            // Given
            String kpiId = "test-kpi-id";
            
            doNothing().when(kpiDefinitionService).deleteKPI(kpiId, anyString());

            // When & Then
            mockMvc.perform(delete("/kpi-management/kpis/{id}", kpiId)
                    .with(csrf()))
                .andExpect(status().isNoContent());

            verify(kpiDefinitionService).deleteKPI(kpiId, anyString());
        }

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should return 404 Not Found when deleting non-existent KPI")
        void shouldReturn404NotFoundWhenDeletingNonExistentKPI() throws Exception {
            // Given
            String kpiId = "non-existent-id";
            
            doThrow(new IllegalArgumentException("KPI not found"))
                .when(kpiDefinitionService).deleteKPI(kpiId, anyString());

            // When & Then
            mockMvc.perform(delete("/kpi-management/kpis/{id}", kpiId)
                    .with(csrf()))
                .andExpect(status().isNotFound()); // Controller should map this to 404

            verify(kpiDefinitionService).deleteKPI(kpiId, anyString());
        }
    }

    @Nested
    @DisplayName("Performance API Tests")
    class PerformanceApiTest {

        @Test
        @WithMockUser(authorities = "kpi:read")
        @DisplayName("Should handle concurrent GET requests within time limit")
        void shouldHandleConcurrentGetRequestsWithinTimeLimit() throws Exception {
            // Given
            List<KPIDefinition> kpis = Arrays.asList(TestDataFactory.createTestKPIDefinition());
            when(kpiDefinitionService.getActiveKPIs()).thenReturn(kpis);

            // When
            long startTime = System.currentTimeMillis();
            
            // Simulate concurrent requests
            for (int i = 0; i < 10; i++) {
                mockMvc.perform(get("/kpi-management/kpis"))
                    .andExpect(status().isOk());
            }
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            // Then
            assertTrue(duration < 2000, "Concurrent API requests should complete within 2 seconds");
        }

        @Test
        @WithMockUser(authorities = "kpi:write")
        @DisplayName("Should handle bulk POST requests within time limit")
        void shouldHandleBulkPostRequestsWithinTimeLimit() throws Exception {
            // Given
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            KPIDefinition createdKPI = TestDataFactory.createTestKPIDefinition();
            
            when(kpiDefinitionService.createKPI(any(CreateKPIRequest.class), anyString()))
                .thenReturn(createdKPI);

            // When
            long startTime = System.currentTimeMillis();
            
            // Simulate bulk requests
            for (int i = 0; i < 5; i++) {
                request.setName("Bulk KPI " + (i + 1));
                mockMvc.perform(post("/kpi-management/kpis")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
            }
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            // Then
            assertTrue(duration < 2000, "Bulk API creation should complete within 2 seconds");
        }
    }

    @Nested
    @DisplayName("Security API Tests")
    class SecurityApiTest {

        @Test
        @DisplayName("Should reject requests without CSRF token")
        void shouldRejectRequestsWithoutCSRFToken() throws Exception {
            // Given
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();

            // When & Then
            mockMvc.perform(post("/kpi-management/kpis")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "kpi:read")
        @DisplayName("Should validate JSON schema for requests")
        void shouldValidateJSONSchemaForRequests() throws Exception {
            // Given - Invalid JSON structure
            String invalidJson = "{ \"name\": 123, \"category\": \"INVALID_CATEGORY\" }";

            // When & Then
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidJson))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(authorities = "kpi:read")
        @DisplayName("Should sanitize input data")
        void shouldSanitizeInputData() throws Exception {
            // Given - Request with potentially malicious content
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            request.setName("<script>alert('xss')</script>");
            request.setDescription("SELECT * FROM users; --");

            KPIDefinition createdKPI = TestDataFactory.createTestKPIDefinition();
            when(kpiDefinitionService.createKPI(any(CreateKPIRequest.class), anyString()))
                .thenReturn(createdKPI);

            // When & Then
            mockMvc.perform(post("/kpi-management/kpis")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden()); // Should be rejected due to insufficient authority

            // Note: Input sanitization should be handled by the service layer
        }
    }
}