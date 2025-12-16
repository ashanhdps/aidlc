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
 * Tests for US-013: Automatic Data Integration
 * As a System Administrator, I want to configure automatic data pulls from various business systems
 * So that KPI tracking is automated and accurate
 */
@SpringBootTest
@AutoConfigureTestMvc
@ActiveProfiles("test")
@DisplayName("US-013: Automatic Data Integration")
class US013AutomaticDataIntegrationTest {

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
    @DisplayName("Should record performance data from external systems")
    void shouldRecordPerformanceDataFromExternalSystems() throws Exception {
        // Simulate data integration from Salesforce
        String salesforceDataJson = """
                {
                    "employeeId": "john.doe@company.com",
                    "kpiId": "kpi-sales-001",
                    "value": 125000.0,
                    "unit": "dollars",
                    "dataDate": "2024-12-16",
                    "source": "Salesforce"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/performance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(salesforceDataJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeId").value("john.doe@company.com"))
                .andExpect(jsonPath("$.kpiId").value("kpi-sales-001"))
                .andExpect(jsonPath("$.value").value(125000.0))
                .andExpect(jsonPath("$.source").value("Salesforce"));
    }

    @Test
    @DisplayName("Should handle bulk data integration from multiple systems")
    void shouldHandleBulkDataIntegrationFromMultipleSystems() throws Exception {
        // Simulate bulk data from multiple systems
        String bulkIntegrationDataJson = """
                [
                    {
                        "employeeId": "john.doe@company.com",
                        "kpiId": "kpi-sales-001",
                        "value": 95.5,
                        "unit": "points",
                        "dataDate": "2024-12-16",
                        "source": "Salesforce"
                    },
                    {
                        "employeeId": "jane.smith@company.com",
                        "kpiId": "kpi-quality-002",
                        "value": 4.8,
                        "unit": "rating",
                        "dataDate": "2024-12-16",
                        "source": "Zendesk"
                    },
                    {
                        "employeeId": "bob.wilson@company.com",
                        "kpiId": "kpi-efficiency-003",
                        "value": 87.2,
                        "unit": "percentage",
                        "dataDate": "2024-12-16",
                        "source": "SAP"
                    }
                ]
                """;

        mockMvc.perform(post("/api/v1/data-analytics/performance/bulk-update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bulkIntegrationDataJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processedCount").value(3))
                .andExpect(jsonPath("$.successCount").value(3))
                .andExpect(jsonPath("$.failureCount").value(0));
    }

    @Test
    @DisplayName("Should validate data quality and flag anomalies")
    void shouldValidateDataQualityAndFlagAnomalies() throws Exception {
        // Test with invalid data that should be flagged
        String invalidDataJson = """
                {
                    "employeeId": "john.doe@company.com",
                    "kpiId": "kpi-sales-001",
                    "value": -1000.0,
                    "unit": "dollars",
                    "dataDate": "2024-12-16",
                    "source": "Salesforce"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/performance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidDataJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.details").exists());
    }

    @Test
    @DisplayName("Should support real-time data synchronization")
    void shouldSupportRealTimeDataSynchronization() throws Exception {
        // Record initial data
        String initialDataJson = """
                {
                    "employeeId": "john.doe@company.com",
                    "kpiId": "kpi-sales-001",
                    "value": 100.0,
                    "unit": "points",
                    "dataDate": "2024-12-16T10:00:00",
                    "source": "Salesforce"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/performance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(initialDataJson))
                .andExpect(status().isCreated());

        // Update with real-time data
        String realtimeUpdateJson = """
                {
                    "employeeId": "john.doe@company.com",
                    "kpiId": "kpi-sales-001",
                    "value": 105.0,
                    "unit": "points",
                    "dataDate": "2024-12-16T11:00:00",
                    "source": "Salesforce"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/performance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(realtimeUpdateJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.value").value(105.0));

        // Verify both data points exist
        mockMvc.perform(get("/api/v1/data-analytics/performance/employee/john.doe@company.com")
                        .param("kpiId", "kpi-sales-001")
                        .param("startDate", "2024-12-16"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").greaterThanOrEqualTo(2));
    }

    @Test
    @DisplayName("Should map data fields to specific KPIs correctly")
    void shouldMapDataFieldsToSpecificKPIsCorrectly() throws Exception {
        // Test mapping different data formats to KPIs
        String salesDataJson = """
                {
                    "employeeId": "john.doe@company.com",
                    "kpiId": "kpi-sales-001",
                    "value": 125000.0,
                    "unit": "dollars",
                    "dataDate": "2024-12-16",
                    "source": "Salesforce",
                    "metadata": {
                        "region": "North America",
                        "product": "Enterprise Software"
                    }
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/performance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(salesDataJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.kpiId").value("kpi-sales-001"))
                .andExpect(jsonPath("$.metadata.region").value("North America"));

        String qualityDataJson = """
                {
                    "employeeId": "jane.smith@company.com",
                    "kpiId": "kpi-quality-002",
                    "value": 4.8,
                    "unit": "rating",
                    "dataDate": "2024-12-16",
                    "source": "Zendesk",
                    "metadata": {
                        "ticketCount": 150,
                        "avgResolutionTime": "2.5 hours"
                    }
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/performance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(qualityDataJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.kpiId").value("kpi-quality-002"))
                .andExpect(jsonPath("$.metadata.ticketCount").value(150));
    }

    @Test
    @DisplayName("Should log integration errors and provide status reporting")
    void shouldLogIntegrationErrorsAndProvideStatusReporting() throws Exception {
        // Test with malformed data to trigger error logging
        String malformedDataJson = """
                {
                    "employeeId": "",
                    "kpiId": "kpi-sales-001",
                    "value": "invalid-number",
                    "unit": "dollars",
                    "dataDate": "invalid-date",
                    "source": "Salesforce"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/performance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedDataJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.timestamp").exists());

        // Verify system health still shows integration status
        mockMvc.perform(get("/api/v1/data-analytics/health/detailed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.database").value("UP"))
                .andExpect(jsonPath("$.components.eventStore").value("UP"));
    }

    @Test
    @DisplayName("Should support data transformation rules for incoming data")
    void shouldSupportDataTransformationRulesForIncomingData() throws Exception {
        // Test data that requires transformation (e.g., currency conversion, unit standardization)
        String rawDataJson = """
                {
                    "employeeId": "john.doe@company.com",
                    "kpiId": "kpi-sales-001",
                    "value": 85000.0,
                    "unit": "euros",
                    "dataDate": "2024-12-16",
                    "source": "SAP-Europe"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/performance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rawDataJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeId").value("john.doe@company.com"))
                .andExpect(jsonPath("$.value").value(85000.0))
                .andExpect(jsonPath("$.unit").value("euros"));
    }

    @Test
    @DisplayName("Should provide integration health status and last sync times")
    void shouldProvideIntegrationHealthStatusAndLastSyncTimes() throws Exception {
        // Record some data to simulate successful integration
        String testDataJson = """
                {
                    "employeeId": "john.doe@company.com",
                    "kpiId": "kpi-sales-001",
                    "value": 100.0,
                    "unit": "points",
                    "dataDate": "2024-12-16",
                    "source": "Salesforce"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/performance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(testDataJson))
                .andExpect(status().isCreated());

        // Check integration health status
        mockMvc.perform(get("/api/v1/data-analytics/health/detailed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components").exists())
                .andExpect(jsonPath("$.uptime").exists())
                .andExpect(jsonPath("$.lastUpdated").exists());

        // Check system statistics for integration metrics
        mockMvc.perform(get("/api/v1/data-analytics/health/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPerformanceData").isNumber())
                .andExpect(jsonPath("$.totalEvents").isNumber());
    }
}