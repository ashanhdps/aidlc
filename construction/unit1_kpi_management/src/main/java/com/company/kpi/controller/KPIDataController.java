package com.company.kpi.controller;

import com.company.kpi.service.ThirdPartyDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * REST Controller for KPI data integration with third-party APIs
 */
@RestController
@RequestMapping("/kpi-management/data")
@Tag(name = "KPI Data Integration", description = "Third-party API integration for KPI data")
public class KPIDataController {
    
    private static final Logger logger = LoggerFactory.getLogger(KPIDataController.class);
    
    @Autowired
    private ThirdPartyDataService thirdPartyDataService;
    
    @Operation(summary = "Get sales data from Salesforce API")
    @ApiResponse(responseCode = "200", description = "Sales data retrieved successfully")
    @GetMapping("/sales/{employeeId}")
    public ResponseEntity<Map<String, Object>> getSalesData(
            @Parameter(description = "Employee ID") @PathVariable String employeeId,
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        logger.info("Getting sales data for employee {} from {} to {}", employeeId, startDate, endDate);
        
        try {
            Map<String, Object> salesData = thirdPartyDataService.fetchSalesData(employeeId, startDate, endDate);
            return ResponseEntity.ok(salesData);
            
        } catch (Exception e) {
            logger.error("Error retrieving sales data for employee: {}", employeeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get customer satisfaction data from survey API")
    @ApiResponse(responseCode = "200", description = "Customer satisfaction data retrieved successfully")
    @GetMapping("/customer-satisfaction/{employeeId}")
    public ResponseEntity<Map<String, Object>> getCustomerSatisfactionData(
            @Parameter(description = "Employee ID") @PathVariable String employeeId,
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        logger.info("Getting customer satisfaction data for employee {} from {} to {}", employeeId, startDate, endDate);
        
        try {
            Map<String, Object> satisfactionData = thirdPartyDataService.fetchCustomerSatisfactionData(employeeId, startDate, endDate);
            return ResponseEntity.ok(satisfactionData);
            
        } catch (Exception e) {
            logger.error("Error retrieving customer satisfaction data for employee: {}", employeeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get productivity data from project management API")
    @ApiResponse(responseCode = "200", description = "Productivity data retrieved successfully")
    @GetMapping("/productivity/{employeeId}")
    public ResponseEntity<Map<String, Object>> getProductivityData(
            @Parameter(description = "Employee ID") @PathVariable String employeeId,
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        logger.info("Getting productivity data for employee {} from {} to {}", employeeId, startDate, endDate);
        
        try {
            Map<String, Object> productivityData = thirdPartyDataService.fetchProductivityData(employeeId, startDate, endDate);
            return ResponseEntity.ok(productivityData);
            
        } catch (Exception e) {
            logger.error("Error retrieving productivity data for employee: {}", employeeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get marketing ROI data from marketing analytics API")
    @ApiResponse(responseCode = "200", description = "Marketing ROI data retrieved successfully")
    @GetMapping("/marketing-roi/{employeeId}")
    public ResponseEntity<Map<String, Object>> getMarketingROIData(
            @Parameter(description = "Employee ID") @PathVariable String employeeId,
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        logger.info("Getting marketing ROI data for employee {} from {} to {}", employeeId, startDate, endDate);
        
        try {
            Map<String, Object> roiData = thirdPartyDataService.fetchMarketingROIData(employeeId, startDate, endDate);
            return ResponseEntity.ok(roiData);
            
        } catch (Exception e) {
            logger.error("Error retrieving marketing ROI data for employee: {}", employeeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get quality data from quality management system")
    @ApiResponse(responseCode = "200", description = "Quality data retrieved successfully")
    @GetMapping("/quality/{employeeId}")
    public ResponseEntity<Map<String, Object>> getQualityData(
            @Parameter(description = "Employee ID") @PathVariable String employeeId,
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        logger.info("Getting quality data for employee {} from {} to {}", employeeId, startDate, endDate);
        
        try {
            Map<String, Object> qualityData = thirdPartyDataService.fetchQualityData(employeeId, startDate, endDate);
            return ResponseEntity.ok(qualityData);
            
        } catch (Exception e) {
            logger.error("Error retrieving quality data for employee: {}", employeeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}