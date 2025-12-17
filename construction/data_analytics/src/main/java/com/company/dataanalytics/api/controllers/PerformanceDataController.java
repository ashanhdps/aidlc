package com.company.dataanalytics.api.controllers;

import com.company.dataanalytics.api.dto.request.RecordPerformanceDataRequest;
import com.company.dataanalytics.api.dto.response.PerformanceDataResponse;
import com.company.dataanalytics.api.mappers.PerformanceDataMapper;
import com.company.dataanalytics.application.services.PerformanceDataApplicationService;
import com.company.dataanalytics.domain.aggregates.performance.PerformanceData;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for performance data operations
 */
@RestController
@RequestMapping("/performance")
@CrossOrigin(origins = "*")
public class PerformanceDataController {
    
    private final PerformanceDataApplicationService performanceDataApplicationService;
    private final PerformanceDataMapper performanceDataMapper;
    
    public PerformanceDataController(PerformanceDataApplicationService performanceDataApplicationService,
                                   PerformanceDataMapper performanceDataMapper) {
        this.performanceDataApplicationService = performanceDataApplicationService;
        this.performanceDataMapper = performanceDataMapper;
    }
    
    /**
     * Get performance data for specific employee
     */
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PerformanceDataResponse>> getPerformanceDataForEmployee(
            @PathVariable String employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String kpiId,
            @RequestParam(defaultValue = "50") int limit) {
        
        try {
            List<PerformanceData> performanceDataList;
            
            if (kpiId != null && !kpiId.trim().isEmpty()) {
                performanceDataList = performanceDataApplicationService.getPerformanceDataForEmployeeAndKPI(employeeId, kpiId);
            } else if (startDate != null && endDate != null) {
                performanceDataList = performanceDataApplicationService.getPerformanceDataForEmployee(employeeId, startDate, endDate);
            } else if (limit > 0) {
                performanceDataList = performanceDataApplicationService.getLatestPerformanceDataForEmployee(employeeId, limit);
            } else {
                performanceDataList = performanceDataApplicationService.getPerformanceDataForEmployee(employeeId);
            }
            
            List<PerformanceDataResponse> response = performanceDataMapper.toResponseList(performanceDataList);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get aggregated team performance data
     */
    @GetMapping("/team/{supervisorId}")
    public ResponseEntity<Map<String, Object>> getTeamPerformanceData(
            @PathVariable String supervisorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) List<String> employeeIds) {
        
        try {
            // For demo purposes, use provided employee IDs or generate sample team
            List<String> teamEmployeeIds = employeeIds != null && !employeeIds.isEmpty() 
                ? employeeIds 
                : List.of("emp1", "emp2", "emp3"); // Sample team
            
            LocalDate effectiveStartDate = startDate != null ? startDate : LocalDate.now().minusMonths(1);
            LocalDate effectiveEndDate = endDate != null ? endDate : LocalDate.now();
            
            Map<String, Map<String, Double>> teamSummary = performanceDataApplicationService
                .getTeamPerformanceSummary(teamEmployeeIds, effectiveStartDate, effectiveEndDate);
            
            Map<String, Object> response = Map.of(
                "supervisorId", supervisorId,
                "startDate", effectiveStartDate,
                "endDate", effectiveEndDate,
                "teamSize", teamEmployeeIds.size(),
                "performanceData", teamSummary
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get organization-wide performance metrics
     */
    @GetMapping("/organization")
    public ResponseEntity<Map<String, Object>> getOrganizationPerformanceData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) List<String> departmentIds) {
        
        try {
            LocalDate effectiveStartDate = startDate != null ? startDate : LocalDate.now().minusMonths(3);
            LocalDate effectiveEndDate = endDate != null ? endDate : LocalDate.now();
            
            // For demo purposes, get sample organizational data
            List<PerformanceData> orgData = performanceDataApplicationService
                .getPerformanceDataByDateRange(effectiveStartDate, effectiveEndDate);
            
            Map<String, Object> response = Map.of(
                "startDate", effectiveStartDate,
                "endDate", effectiveEndDate,
                "totalDataPoints", orgData.size(),
                "departments", departmentIds != null ? departmentIds : List.of("IT", "HR", "Sales"),
                "summary", "Organization performance data for " + orgData.size() + " data points"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Record new performance data
     */
    @PostMapping
    public ResponseEntity<PerformanceDataResponse> recordPerformanceData(@Valid @RequestBody RecordPerformanceDataRequest request) {
        try {
            UUID dataId = performanceDataApplicationService.recordPerformanceData(
                request.getEmployeeId(),
                request.getKpiId(),
                request.getValue(),
                request.getUnit(),
                request.getDataDate()
            );
            
            PerformanceData performanceData = performanceDataApplicationService.getPerformanceDataById(dataId);
            PerformanceDataResponse response = performanceDataMapper.toResponse(performanceData);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Bulk update performance data from external sources
     */
    @PostMapping("/bulk-update")
    public ResponseEntity<Map<String, Object>> bulkUpdatePerformanceData(@RequestBody List<RecordPerformanceDataRequest> requests) {
        try {
            int successCount = 0;
            int errorCount = 0;
            
            for (RecordPerformanceDataRequest request : requests) {
                try {
                    performanceDataApplicationService.recordPerformanceData(
                        request.getEmployeeId(),
                        request.getKpiId(),
                        request.getValue(),
                        request.getUnit(),
                        request.getDataDate()
                    );
                    successCount++;
                } catch (Exception e) {
                    errorCount++;
                }
            }
            
            Map<String, Object> response = Map.of(
                "totalRequests", requests.size(),
                "successCount", successCount,
                "errorCount", errorCount,
                "status", errorCount == 0 ? "SUCCESS" : "PARTIAL_SUCCESS"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get performance data by ID
     */
    @GetMapping("/{dataId}")
    public ResponseEntity<PerformanceDataResponse> getPerformanceDataById(@PathVariable String dataId) {
        try {
            UUID dataIdObj = UUID.fromString(dataId);
            PerformanceData performanceData = performanceDataApplicationService.getPerformanceDataById(dataIdObj);
            PerformanceDataResponse response = performanceDataMapper.toResponse(performanceData);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get performance trends for employee and KPI
     */
    @GetMapping("/trends")
    public ResponseEntity<Map<String, List<Double>>> getPerformanceTrends(
            @RequestParam String employeeId,
            @RequestParam String kpiId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            Map<String, List<Double>> trends = performanceDataApplicationService
                .getPerformanceTrends(employeeId, kpiId, startDate, endDate);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get performance statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPerformanceStatistics(
            @RequestParam String employeeId,
            @RequestParam String kpiId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            Map<String, Object> statistics = performanceDataApplicationService
                .getPerformanceStatistics(employeeId, kpiId, startDate, endDate);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get aggregated performance for employee
     */
    @GetMapping("/employee/{employeeId}/aggregated")
    public ResponseEntity<Map<String, Double>> getAggregatedPerformance(
            @PathVariable String employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            Map<String, Double> aggregatedData = performanceDataApplicationService
                .getAggregatedPerformanceForEmployee(employeeId, startDate, endDate);
            return ResponseEntity.ok(aggregatedData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Delete performance data
     */
    @DeleteMapping("/{dataId}")
    public ResponseEntity<Void> deletePerformanceData(@PathVariable String dataId) {
        try {
            UUID dataIdObj = UUID.fromString(dataId);
            performanceDataApplicationService.deletePerformanceData(dataIdObj);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}