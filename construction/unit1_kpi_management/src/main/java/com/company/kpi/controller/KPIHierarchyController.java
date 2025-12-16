package com.company.kpi.controller;

import com.company.kpi.model.KPIHierarchy;
import com.company.kpi.model.dto.KPIHierarchyResponse;
import com.company.kpi.service.KPIHierarchyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for KPI Hierarchy management
 */
@RestController
@RequestMapping("/kpi-management/hierarchy")
@Tag(name = "KPI Hierarchy", description = "KPI hierarchy and cascading APIs")
public class KPIHierarchyController {
    
    private static final Logger logger = LoggerFactory.getLogger(KPIHierarchyController.class);
    
    @Autowired
    private KPIHierarchyService kpiHierarchyService;
    
    @Operation(summary = "Retrieve complete KPI hierarchy")
    @ApiResponse(responseCode = "200", description = "KPI hierarchy retrieved successfully")
    @GetMapping
    public ResponseEntity<List<KPIHierarchyResponse>> getHierarchy(
            @Parameter(description = "Hierarchy level filter") @RequestParam(required = false) String level,
            @Parameter(description = "Parent KPI ID filter") @RequestParam(required = false) String parent_id) {
        
        logger.debug("Getting KPI hierarchy - level: {}, parent_id: {}", level, parent_id);
        
        try {
            KPIHierarchy.HierarchyLevel hierarchyLevel = null;
            if (level != null) {
                try {
                    hierarchyLevel = KPIHierarchy.HierarchyLevel.valueOf(level.toUpperCase());
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid hierarchy level: {}", level);
                    return ResponseEntity.badRequest().build();
                }
            }
            
            List<KPIHierarchyResponse> hierarchy = kpiHierarchyService.getHierarchy(hierarchyLevel, parent_id);
            return ResponseEntity.ok(hierarchy);
            
        } catch (Exception e) {
            logger.error("Error retrieving KPI hierarchy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get all child KPIs for cascading")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Child KPI relationships retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Parent KPI not found")
    })
    @GetMapping("/cascade/{parent_kpi_id}")
    public ResponseEntity<List<KPIHierarchy>> getCascadeChildren(
            @Parameter(description = "Parent KPI ID") @PathVariable String parent_kpi_id) {
        
        logger.debug("Getting cascade children for parent KPI: {}", parent_kpi_id);
        
        try {
            List<KPIHierarchy> children = kpiHierarchyService.getCascadeChildren(parent_kpi_id);
            return ResponseEntity.ok(children);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Parent KPI not found: {}", parent_kpi_id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error retrieving cascade children for KPI: {}", parent_kpi_id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Create KPI hierarchy relationship")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "KPI hierarchy created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid hierarchy data or circular reference"),
        @ApiResponse(responseCode = "404", description = "Parent or child KPI not found")
    })
    @PostMapping
    public ResponseEntity<KPIHierarchy> createHierarchy(
            @Parameter(description = "Parent KPI ID") @RequestParam String parent_kpi_id,
            @Parameter(description = "Child KPI ID") @RequestParam String child_kpi_id,
            @Parameter(description = "Hierarchy level") @RequestParam String level) {
        
        logger.info("Creating KPI hierarchy: parent={}, child={}, level={}", parent_kpi_id, child_kpi_id, level);
        
        try {
            KPIHierarchy.HierarchyLevel hierarchyLevel = KPIHierarchy.HierarchyLevel.valueOf(level.toUpperCase());
            
            KPIHierarchy hierarchy = kpiHierarchyService.createHierarchy(
                parent_kpi_id, child_kpi_id, hierarchyLevel, "current-user");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(hierarchy);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid hierarchy creation request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error creating KPI hierarchy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}