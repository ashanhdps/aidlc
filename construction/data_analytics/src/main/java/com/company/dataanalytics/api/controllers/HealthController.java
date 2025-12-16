package com.company.dataanalytics.api.controllers;

import com.company.dataanalytics.infrastructure.events.InMemoryEventStore;
import com.company.dataanalytics.infrastructure.repositories.InMemoryUserAccountRepository;
import com.company.dataanalytics.infrastructure.repositories.InMemoryReportRepository;
import com.company.dataanalytics.infrastructure.repositories.InMemoryPerformanceDataRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Health check controller for system status
 */
@RestController
@RequestMapping("/health")
@CrossOrigin(origins = "*")
public class HealthController {
    
    private final InMemoryUserAccountRepository userRepository;
    private final InMemoryReportRepository reportRepository;
    private final InMemoryPerformanceDataRepository performanceRepository;
    private final InMemoryEventStore eventStore;
    
    public HealthController(InMemoryUserAccountRepository userRepository,
                           InMemoryReportRepository reportRepository,
                           InMemoryPerformanceDataRepository performanceRepository,
                           InMemoryEventStore eventStore) {
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.performanceRepository = performanceRepository;
        this.eventStore = eventStore;
    }
    
    /**
     * Basic health check
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = Map.of(
            "status", "UP",
            "timestamp", Instant.now(),
            "service", "Data Analytics Service",
            "version", "1.0.0"
        );
        
        return ResponseEntity.ok(health);
    }
    
    /**
     * Detailed system status
     */
    @GetMapping("/detailed")
    public ResponseEntity<Map<String, Object>> detailedHealth() {
        Map<String, Object> health = Map.of(
            "status", "UP",
            "timestamp", Instant.now(),
            "service", "Data Analytics Service",
            "version", "1.0.0",
            "components", Map.of(
                "database", Map.of(
                    "status", "UP",
                    "type", "In-Memory H2"
                ),
                "repositories", Map.of(
                    "status", "UP",
                    "userCount", userRepository.count(),
                    "reportCount", reportRepository.count(),
                    "performanceDataCount", performanceRepository.count()
                ),
                "eventStore", Map.of(
                    "status", "UP",
                    "eventCount", eventStore.count(),
                    "eventTypes", eventStore.getAllEventTypes().size()
                )
            )
        );
        
        return ResponseEntity.ok(health);
    }
    
    /**
     * System statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> systemStats() {
        Map<String, Object> stats = Map.of(
            "users", Map.of(
                "total", userRepository.count(),
                "active", userRepository.countActive()
            ),
            "reports", Map.of(
                "total", reportRepository.count(),
                "pending", reportRepository.findPendingReports().size(),
                "failed", reportRepository.findFailedReports().size()
            ),
            "performanceData", Map.of(
                "total", performanceRepository.count(),
                "recent", performanceRepository.findRecentData(10).size()
            ),
            "events", Map.of(
                "total", eventStore.count(),
                "types", eventStore.getAllEventTypes()
            )
        );
        
        return ResponseEntity.ok(stats);
    }
}