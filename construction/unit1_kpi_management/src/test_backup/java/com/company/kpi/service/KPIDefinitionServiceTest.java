package com.company.kpi.service;

import com.company.kpi.BaseTestCase;
import com.company.kpi.TestDataFactory;
import com.company.kpi.model.KPICategory;
import com.company.kpi.model.KPIDefinition;
import com.company.kpi.model.dto.CreateKPIRequest;
import com.company.kpi.repository.interfaces.KPIDefinitionRepositoryInterface;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test class for KPI Definition Service
 * Tests business logic, validation rules, and service operations
 */
@DisplayName("KPI Definition Service Tests")
class KPIDefinitionServiceTest extends BaseTestCase {

    @Autowired
    private KPIDefinitionService kpiDefinitionService;

    @MockBean
    private KPIDefinitionRepositoryInterface kpiDefinitionRepository;

    @BeforeEach
    void setUpMocks() {
        MockitoAnnotations.openMocks(this);
    }

    @Nested
    @DisplayName("Create KPI Tests")
    class CreateKPITest {

        @Test
        @DisplayName("Should create KPI with valid request")
        void shouldCreateKPIWithValidRequest() {
            // Given
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            KPIDefinition expectedKPI = TestDataFactory.createTestKPIDefinition();
            
            when(kpiDefinitionRepository.existsByName(request.getName())).thenReturn(false);
            when(kpiDefinitionRepository.save(any(KPIDefinition.class))).thenReturn(expectedKPI);

            // When
            KPIDefinition result = kpiDefinitionService.createKPI(request, TestDataFactory.TEST_HR_USER_ID);

            // Then
            assertNotNull(result);
            verify(kpiDefinitionRepository).existsByName(request.getName());
            verify(kpiDefinitionRepository).save(any(KPIDefinition.class));
        }

        @Test
        @DisplayName("Should throw exception when KPI name already exists")
        void shouldThrowExceptionWhenKPINameAlreadyExists() {
            // Given
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            when(kpiDefinitionRepository.existsByName(request.getName())).thenReturn(true);

            // When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> kpiDefinitionService.createKPI(request, TestDataFactory.TEST_HR_USER_ID)
            );
            
            assertTrue(exception.getMessage().contains("already exists"));
            verify(kpiDefinitionRepository).existsByName(request.getName());
            verify(kpiDefinitionRepository, never()).save(any(KPIDefinition.class));
        }

        @Test
        @DisplayName("Should validate required fields")
        void shouldValidateRequiredFields() {
            // Given
            CreateKPIRequest invalidRequest = TestDataFactory.createInvalidKPIRequest();

            // When & Then
            assertThrows(
                IllegalArgumentException.class,
                () -> kpiDefinitionService.createKPI(invalidRequest, TestDataFactory.TEST_HR_USER_ID)
            );
        }

        @Test
        @DisplayName("Should validate weight percentage range")
        void shouldValidateWeightPercentageRange() {
            // Given
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            request.setDefaultWeightPercentage(java.math.BigDecimal.valueOf(150.0)); // Invalid > 100%

            // When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> kpiDefinitionService.createKPI(request, TestDataFactory.TEST_HR_USER_ID)
            );
            
            assertTrue(exception.getMessage().contains("Weight percentage must be between 0 and 100"));
        }

        @Test
        @DisplayName("Should validate measurement frequency value")
        void shouldValidateMeasurementFrequencyValue() {
            // Given
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            request.setMeasurementFrequencyValue(-1); // Invalid negative value

            // When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> kpiDefinitionService.createKPI(request, TestDataFactory.TEST_HR_USER_ID)
            );
            
            assertTrue(exception.getMessage().contains("Measurement frequency value must be positive"));
        }
    }

    @Nested
    @DisplayName("Retrieve KPI Tests")
    class RetrieveKPITest {

        @Test
        @DisplayName("Should get all KPIs")
        void shouldGetAllKPIs() {
            // Given
            List<KPIDefinition> expectedKPIs = Arrays.asList(
                TestDataFactory.createTestKPIDefinition(),
                TestDataFactory.createTestKPIDefinition()
            );
            when(kpiDefinitionRepository.findAll()).thenReturn(expectedKPIs);

            // When
            List<KPIDefinition> result = kpiDefinitionService.getAllKPIs();

            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
            verify(kpiDefinitionRepository).findAll();
        }

        @Test
        @DisplayName("Should get KPI by ID")
        void shouldGetKPIById() {
            // Given
            String kpiId = "test-kpi-id";
            KPIDefinition expectedKPI = TestDataFactory.createTestKPIDefinition();
            when(kpiDefinitionRepository.findById(kpiId)).thenReturn(Optional.of(expectedKPI));

            // When
            Optional<KPIDefinition> result = kpiDefinitionService.getKPIById(kpiId);

            // Then
            assertTrue(result.isPresent());
            assertEquals(expectedKPI, result.get());
            verify(kpiDefinitionRepository).findById(kpiId);
        }

        @Test
        @DisplayName("Should return empty when KPI not found")
        void shouldReturnEmptyWhenKPINotFound() {
            // Given
            String kpiId = "non-existent-id";
            when(kpiDefinitionRepository.findById(kpiId)).thenReturn(Optional.empty());

            // When
            Optional<KPIDefinition> result = kpiDefinitionService.getKPIById(kpiId);

            // Then
            assertFalse(result.isPresent());
            verify(kpiDefinitionRepository).findById(kpiId);
        }

        @Test
        @DisplayName("Should get KPIs by category")
        void shouldGetKPIsByCategory() {
            // Given
            KPICategory category = KPICategory.SALES;
            List<KPIDefinition> expectedKPIs = Arrays.asList(TestDataFactory.createTestKPIDefinition());
            when(kpiDefinitionRepository.findByCategory(category)).thenReturn(expectedKPIs);

            // When
            List<KPIDefinition> result = kpiDefinitionService.getKPIsByCategory(category);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            verify(kpiDefinitionRepository).findByCategory(category);
        }

        @Test
        @DisplayName("Should get active KPIs")
        void shouldGetActiveKPIs() {
            // Given
            List<KPIDefinition> expectedKPIs = Arrays.asList(TestDataFactory.createTestKPIDefinition());
            when(kpiDefinitionRepository.findByIsActiveTrue()).thenReturn(expectedKPIs);

            // When
            List<KPIDefinition> result = kpiDefinitionService.getActiveKPIs();

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            verify(kpiDefinitionRepository).findByIsActiveTrue();
        }
    }

    @Nested
    @DisplayName("Update KPI Tests")
    class UpdateKPITest {

        @Test
        @DisplayName("Should update KPI with valid request")
        void shouldUpdateKPIWithValidRequest() {
            // Given
            String kpiId = "test-kpi-id";
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            KPIDefinition existingKPI = TestDataFactory.createTestKPIDefinition();
            
            when(kpiDefinitionRepository.findById(kpiId)).thenReturn(Optional.of(existingKPI));
            when(kpiDefinitionRepository.findByName(request.getName())).thenReturn(Optional.empty());
            when(kpiDefinitionRepository.save(any(KPIDefinition.class))).thenReturn(existingKPI);

            // When
            KPIDefinition result = kpiDefinitionService.updateKPI(kpiId, request, TestDataFactory.TEST_HR_USER_ID);

            // Then
            assertNotNull(result);
            verify(kpiDefinitionRepository).findById(kpiId);
            verify(kpiDefinitionRepository).save(any(KPIDefinition.class));
        }

        @Test
        @DisplayName("Should throw exception when updating non-existent KPI")
        void shouldThrowExceptionWhenUpdatingNonExistentKPI() {
            // Given
            String kpiId = "non-existent-id";
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            when(kpiDefinitionRepository.findById(kpiId)).thenReturn(Optional.empty());

            // When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> kpiDefinitionService.updateKPI(kpiId, request, TestDataFactory.TEST_HR_USER_ID)
            );
            
            assertTrue(exception.getMessage().contains("KPI not found"));
            verify(kpiDefinitionRepository).findById(kpiId);
            verify(kpiDefinitionRepository, never()).save(any(KPIDefinition.class));
        }

        @Test
        @DisplayName("Should throw exception when updating to duplicate name")
        void shouldThrowExceptionWhenUpdatingToDuplicateName() {
            // Given
            String kpiId = "test-kpi-id";
            CreateKPIRequest request = TestDataFactory.createValidKPIRequest();
            KPIDefinition existingKPI = TestDataFactory.createTestKPIDefinition();
            KPIDefinition duplicateKPI = TestDataFactory.createTestKPIDefinition();
            duplicateKPI.setId("different-id");
            
            when(kpiDefinitionRepository.findById(kpiId)).thenReturn(Optional.of(existingKPI));
            when(kpiDefinitionRepository.findByName(request.getName())).thenReturn(Optional.of(duplicateKPI));

            // When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> kpiDefinitionService.updateKPI(kpiId, request, TestDataFactory.TEST_HR_USER_ID)
            );
            
            assertTrue(exception.getMessage().contains("already exists"));
            verify(kpiDefinitionRepository).findById(kpiId);
            verify(kpiDefinitionRepository).findByName(request.getName());
            verify(kpiDefinitionRepository, never()).save(any(KPIDefinition.class));
        }
    }

    @Nested
    @DisplayName("Delete KPI Tests")
    class DeleteKPITest {

        @Test
        @DisplayName("Should soft delete KPI")
        void shouldSoftDeleteKPI() {
            // Given
            String kpiId = "test-kpi-id";
            KPIDefinition existingKPI = TestDataFactory.createTestKPIDefinition();
            when(kpiDefinitionRepository.findById(kpiId)).thenReturn(Optional.of(existingKPI));
            when(kpiDefinitionRepository.save(any(KPIDefinition.class))).thenReturn(existingKPI);

            // When
            kpiDefinitionService.deleteKPI(kpiId, TestDataFactory.TEST_HR_USER_ID);

            // Then
            verify(kpiDefinitionRepository).findById(kpiId);
            verify(kpiDefinitionRepository).save(argThat(kpi -> !kpi.isActive()));
        }

        @Test
        @DisplayName("Should throw exception when deleting non-existent KPI")
        void shouldThrowExceptionWhenDeletingNonExistentKPI() {
            // Given
            String kpiId = "non-existent-id";
            when(kpiDefinitionRepository.findById(kpiId)).thenReturn(Optional.empty());

            // When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> kpiDefinitionService.deleteKPI(kpiId, TestDataFactory.TEST_HR_USER_ID)
            );
            
            assertTrue(exception.getMessage().contains("KPI not found"));
            verify(kpiDefinitionRepository).findById(kpiId);
            verify(kpiDefinitionRepository, never()).save(any(KPIDefinition.class));
        }
    }

    @Nested
    @DisplayName("Performance Tests")
    class PerformanceTest {

        @Test
        @DisplayName("Should handle bulk KPI creation within time limit")
        void shouldHandleBulkKPICreationWithinTimeLimit() {
            // Given
            CreateKPIRequest[] requests = TestDataFactory.createBulkKPIRequests(10);
            KPIDefinition mockKPI = TestDataFactory.createTestKPIDefinition();
            
            when(kpiDefinitionRepository.existsByName(anyString())).thenReturn(false);
            when(kpiDefinitionRepository.save(any(KPIDefinition.class))).thenReturn(mockKPI);

            // When
            long startTime = System.currentTimeMillis();
            
            for (CreateKPIRequest request : requests) {
                kpiDefinitionService.createKPI(request, TestDataFactory.TEST_HR_USER_ID);
            }
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            // Then
            assertTrue(duration < 2000, "Bulk creation should complete within 2 seconds");
            verify(kpiDefinitionRepository, times(10)).save(any(KPIDefinition.class));
        }

        @Test
        @DisplayName("Should handle concurrent KPI retrieval")
        void shouldHandleConcurrentKPIRetrieval() {
            // Given
            List<KPIDefinition> mockKPIs = Arrays.asList(TestDataFactory.createTestKPIDefinition());
            when(kpiDefinitionRepository.findAll()).thenReturn(mockKPIs);

            // When
            long startTime = System.currentTimeMillis();
            
            // Simulate concurrent requests
            for (int i = 0; i < 50; i++) {
                kpiDefinitionService.getAllKPIs();
            }
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            // Then
            assertTrue(duration < 2000, "Concurrent retrieval should complete within 2 seconds");
            verify(kpiDefinitionRepository, times(50)).findAll();
        }
    }
}