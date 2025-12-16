package com.company.kpi.controller;

import com.company.kpi.model.KPIAssignment;
import com.company.kpi.model.dto.CreateKPIAssignmentRequest;
import com.company.kpi.service.KPIAssignmentService;
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
import java.util.Map;

/**
 * REST Controller for KPI Assignment management
 */
@RestController
@RequestMapping("/kpi-management/assignments")
@Tag(name = "KPI Assignments", description = "KPI Assignment management APIs")
public class KPIAssignmentController {
    
    private static final Logger logger = LoggerFactory.getLogger(KPIAssignmentController.class);
    
    @Autowired
    private KPIAssignmentService kpiAssignmentService;
    
    @Operation(summary = "Assign a KPI to an employee")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "KPI assigned successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "409", description = "KPI already assigned to employee")
    })
    @PostMapping
    public ResponseEntity<KPIAssignment> assignKPI(
            @Valid @RequestBody CreateKPIAssignmentRequest request,
            Authentication authentication) {
        
        logger.info("Assigning KPI {} to employee {} by user: {}", 
            request.getKpiDefinitionId(), request.getEmployeeId(), authentication.getName());
        
        try {
            KPIAssignment assignment = kpiAssignmentService.assignKPI(request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid KPI assignment request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error assigning KPI", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get KPI assignments with filters")
    @ApiResponse(responseCode = "200", description = "KPI assignments retrieved successfully")
    @GetMapping
    public ResponseEntity<List<KPIAssignment>> getAssignments(
            @Parameter(description = "Employee ID filter") @RequestParam(required = false) String employee_id,
            @Parameter(description = "Supervisor ID filter") @RequestParam(required = false) String supervisor_id,
            @Parameter(description = "KPI ID filter") @RequestParam(required = false) String kpi_id,
            @Parameter(description = "Effective date filter") @RequestParam(required = false) String effective_date) {
        
        logger.debug("Retrieving KPI assignments with filters - employee: {}, supervisor: {}, kpi: {}", 
            employee_id, supervisor_id, kpi_id);
        
        try {
            List<KPIAssignment> assignments = kpiAssignmentService.getAssignmentsWithFilters(
                employee_id, supervisor_id, kpi_id, effective_date);
            return ResponseEntity.ok(assignments);
            
        } catch (Exception e) {
            logger.error("Error retrieving assignments with filters", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get KPI assignments for an employee")
    @ApiResponse(responseCode = "200", description = "Employee KPI assignments retrieved successfully")
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<KPIAssignment>> getEmployeeAssignments(
            @Parameter(description = "Employee ID") @PathVariable String employeeId,
            @Parameter(description = "Filter by active status") @RequestParam(required = false, defaultValue = "true") boolean activeOnly) {
        
        logger.debug("Retrieving KPI assignments for employee: {} (activeOnly: {})", employeeId, activeOnly);
        
        try {
            List<KPIAssignment> assignments = activeOnly ? 
                kpiAssignmentService.getActiveEmployeeAssignments(employeeId) :
                kpiAssignmentService.getEmployeeAssignments(employeeId);
            
            return ResponseEntity.ok(assignments);
            
        } catch (Exception e) {
            logger.error("Error retrieving employee assignments for: {}", employeeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get assignments for a specific KPI")
    @ApiResponse(responseCode = "200", description = "KPI assignments retrieved successfully")
    @GetMapping("/kpi/{kpiDefinitionId}")
    public ResponseEntity<List<KPIAssignment>> getKPIAssignments(
            @Parameter(description = "KPI Definition ID") @PathVariable String kpiDefinitionId) {
        
        logger.debug("Retrieving assignments for KPI: {}", kpiDefinitionId);
        
        try {
            List<KPIAssignment> assignments = kpiAssignmentService.getKPIAssignments(kpiDefinitionId);
            return ResponseEntity.ok(assignments);
            
        } catch (Exception e) {
            logger.error("Error retrieving KPI assignments for: {}", kpiDefinitionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Update a KPI assignment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "KPI assignment updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "KPI assignment not found")
    })
    @PutMapping("/employee/{employeeId}/kpi/{kpiDefinitionId}")
    public ResponseEntity<KPIAssignment> updateAssignment(
            @Parameter(description = "Employee ID") @PathVariable String employeeId,
            @Parameter(description = "KPI Definition ID") @PathVariable String kpiDefinitionId,
            @Valid @RequestBody CreateKPIAssignmentRequest request,
            Authentication authentication) {
        
        logger.info("Updating KPI assignment for employee {} and KPI {} by user: {}", 
            employeeId, kpiDefinitionId, authentication.getName());
        
        try {
            KPIAssignment assignment = kpiAssignmentService.updateAssignment(
                employeeId, kpiDefinitionId, request, authentication.getName());
            return ResponseEntity.ok(assignment);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid KPI assignment update: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error updating KPI assignment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Get bulk employee assignments")
    @ApiResponse(responseCode = "200", description = "Bulk employee assignments retrieved successfully")
    @GetMapping("/bulk")
    public ResponseEntity<Map<String, List<KPIAssignment>>> getBulkAssignments(
            @Parameter(description = "Comma-separated employee IDs") @RequestParam String employee_ids) {
        
        logger.debug("Getting bulk assignments for employees: {}", employee_ids);
        
        try {
            String[] employeeIds = employee_ids.split(",");
            Map<String, List<KPIAssignment>> bulkAssignments = kpiAssignmentService.getBulkAssignments(employeeIds);
            return ResponseEntity.ok(bulkAssignments);
            
        } catch (Exception e) {
            logger.error("Error retrieving bulk assignments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @Operation(summary = "Remove a KPI assignment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "KPI assignment removed successfully"),
        @ApiResponse(responseCode = "404", description = "KPI assignment not found")
    })
    @DeleteMapping("/employee/{employeeId}/kpi/{kpiDefinitionId}")
    public ResponseEntity<Void> removeAssignment(
            @Parameter(description = "Employee ID") @PathVariable String employeeId,
            @Parameter(description = "KPI Definition ID") @PathVariable String kpiDefinitionId,
            Authentication authentication) {
        
        logger.info("Removing KPI assignment for employee {} and KPI {} by user: {}", 
            employeeId, kpiDefinitionId, authentication.getName());
        
        try {
            kpiAssignmentService.removeAssignment(employeeId, kpiDefinitionId, authentication.getName());
            return ResponseEntity.noContent().build();
            
        } catch (IllegalArgumentException e) {
            logger.warn("KPI assignment not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error removing KPI assignment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}