package com.company.kpi.controller;

import com.company.kpi.model.KPICategory;
import com.company.kpi.model.KPIDefinition;
import com.company.kpi.model.dto.CreateKPIRequest;
import com.company.kpi.model.dto.KPIResponse;
import com.company.kpi.service.KPIDefinitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for KPI Definition management
 */
@RestController
@RequestMapping("/kpi-management/kpis")
@Tag(name = "KPI Definitions", description = "KPI Definition management APIs")
public class KPIDefinitionController {
    
    private static final Logger logger = LoggerFactory.getLogger(KPIDefinitionController.class);
    
    @Autowired
    private KPIDefinitionService kpiDefinitionService;
    
    @Operation(summary = "Create a new KPI Definition")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "KPI Definition created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "409", description = "KPI with same name already exists")
    })
    @PostMapping
    public ResponseEntity<KPIResponse> createKPI(
            @Valid @RequestBody CreateKPIRequest request,
            Authentication authentication) {
        
        logger.info("Creating KPI: {} by user: {}", request.getName(), authentication.getName());
        
        try {
            KPIDefinition kpi = kpiDefinitionService.createKPI(request, authentication.getName());
            KPIResponse response = convertToResponse(kpi);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid KPI creation request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error creating KPI", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get all KPI Definitions")
    @ApiResponse(responseCode = "200", description = "List of KPI Definitions retrieved successfully")
    @GetMapping
    public ResponseEntity<List<KPIResponse>> getAllKPIs(
            @Parameter(description = "Filter by category") @RequestParam(required = false) KPICategory category,
            @Parameter(description = "Filter by active status") @RequestParam(required = false, defaultValue = "true") boolean activeOnly) {
        
        logger.debug("Retrieving KPIs - category: {}, activeOnly: {}", category, activeOnly);
        
        try {
            List<KPIDefinition> kpis;
            
            if (category != null) {
                kpis = kpiDefinitionService.getKPIsByCategory(category);
            } else if (activeOnly) {
                kpis = kpiDefinitionService.getActiveKPIs();
            } else {
                kpis = kpiDefinitionService.getAllKPIs();
            }
            
            List<KPIResponse> responses = kpis.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            logger.error("Error retrieving KPIs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get KPI Definition by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "KPI Definition retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "KPI Definition not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<KPIResponse> getKPIById(
            @Parameter(description = "KPI Definition ID") @PathVariable String id) {
        
        logger.debug("Retrieving KPI by ID: {}", id);
        
        try {
            return kpiDefinitionService.getKPIById(id)
                .map(kpi -> ResponseEntity.ok(convertToResponse(kpi)))
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            logger.error("Error retrieving KPI by ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Update an existing KPI Definition")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "KPI Definition updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "KPI Definition not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<KPIResponse> updateKPI(
            @Parameter(description = "KPI Definition ID") @PathVariable String id,
            @Valid @RequestBody CreateKPIRequest request,
            Authentication authentication) {
        
        logger.info("Updating KPI: {} by user: {}", id, authentication.getName());
        
        try {
            KPIDefinition kpi = kpiDefinitionService.updateKPI(id, request, authentication.getName());
            KPIResponse response = convertToResponse(kpi);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid KPI update request for ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error updating KPI: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Delete a KPI Definition")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "KPI Definition deleted successfully"),
        @ApiResponse(responseCode = "404", description = "KPI Definition not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKPI(
            @Parameter(description = "KPI Definition ID") @PathVariable String id,
            Authentication authentication) {
        
        logger.info("Deleting KPI: {} by user: {}", id, authentication.getName());
        
        try {
            kpiDefinitionService.deleteKPI(id, authentication.getName());
            return ResponseEntity.noContent().build();
            
        } catch (IllegalArgumentException e) {
            logger.warn("KPI not found for deletion: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting KPI: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Converts KPI Definition to Response DTO
     */
    private KPIResponse convertToResponse(KPIDefinition kpi) {
        KPIResponse response = new KPIResponse();
        response.setId(kpi.getId());
        response.setName(kpi.getName());
        response.setDescription(kpi.getDescription());
        response.setCategory(kpi.getCategory());
        response.setMeasurementType(kpi.getMeasurementType());
        response.setDefaultTargetValue(kpi.getDefaultTargetValue());
        response.setDefaultTargetUnit(kpi.getDefaultTargetUnit());
        response.setDefaultTargetComparisonType(kpi.getDefaultTargetComparisonType());
        response.setDefaultWeightPercentage(kpi.getDefaultWeightPercentage());
        response.setDefaultWeightIsFlexible(kpi.isDefaultWeightIsFlexible());
        response.setMeasurementFrequencyType(kpi.getMeasurementFrequencyType());
        response.setMeasurementFrequencyValue(kpi.getMeasurementFrequencyValue());
        response.setDataSource(kpi.getDataSource());
        response.setCreatedBy(kpi.getCreatedBy());
        response.setCreatedAt(kpi.getCreatedAt());
        response.setUpdatedAt(kpi.getUpdatedAt());
        response.setActive(kpi.isActive());
        return response;
    }
}