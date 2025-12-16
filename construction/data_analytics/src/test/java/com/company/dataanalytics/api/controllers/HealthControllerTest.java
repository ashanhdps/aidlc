package com.company.dataanalytics.api.controllers;

import com.company.dataanalytics.infrastructure.events.InMemoryEventStore;
import com.company.dataanalytics.infrastructure.repositories.InMemoryPerformanceDataRepository;
import com.company.dataanalytics.infrastructure.repositories.InMemoryReportRepository;
import com.company.dataanalytics.infrastructure.repositories.InMemoryUserAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for HealthController - Critical for demo success
 */
@WebMvcTest(HealthController.class)
class HealthControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private InMemoryUserAccountRepository userRepository;
    
    @MockBean
    private InMemoryReportRepository reportRepository;
    
    @MockBean
    private InMemoryPerformanceDataRepository performanceRepository;
    
    @MockBean
    private InMemoryEventStore eventStore;
    
    @Test
    void shouldReturnHealthStatusUp() throws Exception {
        mockMvc.perform(get("/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"))
            .andExpect(jsonPath("$.service").value("Data Analytics Service"))
            .andExpect(jsonPath("$.version").value("1.0.0"))
            .andExpect(jsonPath("$.timestamp").exists());
    }
    
    @Test
    void shouldReturnDetailedHealthStatus() throws Exception {
        // Mock repository counts for detailed health check
        when(userRepository.count()).thenReturn(6L);
        when(reportRepository.count()).thenReturn(2L);
        when(performanceRepository.count()).thenReturn(279L);
        when(eventStore.count()).thenReturn(10L);
        when(eventStore.getAllEventTypes()).thenReturn(java.util.Set.of("UserAccountCreated", "ReportGenerated"));
        
        mockMvc.perform(get("/health/detailed"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"))
            .andExpect(jsonPath("$.components.database.status").value("UP"))
            .andExpect(jsonPath("$.components.database.type").value("In-Memory H2"))
            .andExpect(jsonPath("$.components.repositories.status").value("UP"))
            .andExpect(jsonPath("$.components.repositories.userCount").value(6))
            .andExpect(jsonPath("$.components.repositories.reportCount").value(2))
            .andExpect(jsonPath("$.components.repositories.performanceDataCount").value(279))
            .andExpect(jsonPath("$.components.eventStore.status").value("UP"))
            .andExpect(jsonPath("$.components.eventStore.eventCount").value(10))
            .andExpect(jsonPath("$.components.eventStore.eventTypes").value(2));
    }
    
    @Test
    void shouldReturnSystemStatistics() throws Exception {
        // Mock repository data for statistics
        when(userRepository.count()).thenReturn(6L);
        when(userRepository.countActive()).thenReturn(5L);
        when(reportRepository.count()).thenReturn(2L);
        when(reportRepository.findPendingReports()).thenReturn(java.util.List.of());
        when(reportRepository.findFailedReports()).thenReturn(java.util.List.of());
        when(performanceRepository.count()).thenReturn(279L);
        when(performanceRepository.findRecentData(10)).thenReturn(java.util.List.of());
        when(eventStore.count()).thenReturn(10L);
        when(eventStore.getAllEventTypes()).thenReturn(java.util.Set.of("UserAccountCreated", "ReportGenerated"));
        
        mockMvc.perform(get("/health/stats"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.users.total").value(6))
            .andExpect(jsonPath("$.users.active").value(5))
            .andExpect(jsonPath("$.reports.total").value(2))
            .andExpect(jsonPath("$.reports.pending").value(0))
            .andExpect(jsonPath("$.reports.failed").value(0))
            .andExpect(jsonPath("$.performanceData.total").value(279))
            .andExpect(jsonPath("$.performanceData.recent").value(0))
            .andExpect(jsonPath("$.events.total").value(10))
            .andExpect(jsonPath("$.events.types").isArray());
    }
}