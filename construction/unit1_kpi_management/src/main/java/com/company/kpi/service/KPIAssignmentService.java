package com.company.kpi.service;

import com.company.kpi.model.AssignmentStatus;
import com.company.kpi.model.KPIAssignment;
import com.company.kpi.model.KPIDefinition;
import com.company.kpi.model.dto.CreateKPIAssignmentRequest;
import com.company.kpi.repository.interfaces.KPIAssignmentRepositoryInterface;
import com.company.kpi.repository.interfaces.KPIDefinitionRepositoryInterface;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service layer for KPI Assignment business logic
 */
@Service
public class KPIAssignmentService {
    
    private static final Logger logger = LoggerFactory.getLogger(KPIAssignmentService.class);
    
    @Autowired
    private KPIAssignmentRepositoryInterface kpiAssignmentRepository;
    
    @Autowired
    private KPIDefinitionRepositoryInterface kpiDefinitionRepository;
    
    @Value("${app.kpi.max-assignments-per-employee:10}")
    private int maxAssignmentsPerEmployee;
    
    /**
     * Assigns a KPI to an employee
     */
    public KPIAssignment assignKPI(CreateKPIAssignmentRequest request, String assignedBy) {
        logger.info("Assigning KPI {} to employee {} by user: {}", 
            request.getKpiDefinitionId(), request.getEmployeeId(), assignedBy);
        
        // Validate the request
        validateAssignmentRequest(request);
        
        // Check if KPI Definition exists
        KPIDefinition kpiDefinition = kpiDefinitionRepository.findById(request.getKpiDefinitionId())
            .orElseThrow(() -> new IllegalArgumentException("KPI Definition not found: " + request.getKpiDefinitionId()));
        
        // Check if assignment already exists
        Optional<KPIAssignment> existingAssignment = kpiAssignmentRepository
            .findByEmployeeIdAndKpiDefinitionId(request.getEmployeeId(), request.getKpiDefinitionId());
        
        if (existingAssignment.isPresent() && existingAssignment.get().getStatus() == AssignmentStatus.ACTIVE) {
            throw new IllegalArgumentException("KPI is already assigned to this employee");
        }
        
        // Check assignment limits
        List<KPIAssignment> currentAssignments = kpiAssignmentRepository.findActiveByEmployeeId(request.getEmployeeId());
        if (currentAssignments.size() >= maxAssignmentsPerEmployee) {
            throw new IllegalArgumentException("Employee has reached maximum number of KPI assignments: " + maxAssignmentsPerEmployee);
        }
        
        // Validate weight distribution
        validateWeightDistribution(request.getEmployeeId(), request.getCustomWeightPercentage(), currentAssignments);
        
        // Create the assignment
        KPIAssignment assignment = new KPIAssignment(request.getEmployeeId(), request.getKpiDefinitionId(), assignedBy);
        assignment.setAssignmentId(UUID.randomUUID().toString());
        assignment.setCustomTargetValue(request.getCustomTargetValue() != null ? 
            request.getCustomTargetValue() : kpiDefinition.getDefaultTargetValue());
        assignment.setCustomTargetUnit(request.getCustomTargetUnit() != null ? 
            request.getCustomTargetUnit() : kpiDefinition.getDefaultTargetUnit());
        assignment.setCustomTargetComparisonType(request.getCustomTargetComparisonType() != null ? 
            request.getCustomTargetComparisonType() : kpiDefinition.getDefaultTargetComparisonType());
        assignment.setCustomWeightPercentage(request.getCustomWeightPercentage() != null ? 
            request.getCustomWeightPercentage() : kpiDefinition.getDefaultWeightPercentage());
        assignment.setCustomWeightIsFlexible(request.isCustomWeightIsFlexible());
        assignment.setEffectiveDate(request.getEffectiveDate());
        assignment.setEndDate(request.getEndDate());
        
        // Save the assignment
        KPIAssignment savedAssignment = kpiAssignmentRepository.save(assignment);
        
        logger.info("Successfully assigned KPI {} to employee {}", 
            request.getKpiDefinitionId(), request.getEmployeeId());
        
        return savedAssignment;
    }
    
    /**
     * Gets all KPI assignments for an employee
     */
    public List<KPIAssignment> getEmployeeAssignments(String employeeId) {
        logger.debug("Retrieving KPI assignments for employee: {}", employeeId);
        return kpiAssignmentRepository.findByEmployeeId(employeeId);
    }
    
    /**
     * Gets active KPI assignments for an employee
     */
    public List<KPIAssignment> getActiveEmployeeAssignments(String employeeId) {
        logger.debug("Retrieving active KPI assignments for employee: {}", employeeId);
        return kpiAssignmentRepository.findActiveByEmployeeId(employeeId);
    }
    
    /**
     * Gets all assignments for a specific KPI
     */
    public List<KPIAssignment> getKPIAssignments(String kpiDefinitionId) {
        logger.debug("Retrieving assignments for KPI: {}", kpiDefinitionId);
        return kpiAssignmentRepository.findByKpiDefinitionId(kpiDefinitionId);
    }
    
    /**
     * Get assignments with filters
     */
    public List<KPIAssignment> getAssignmentsWithFilters(String employeeId, String supervisorId, String kpiId, String effectiveDate) {
        logger.debug("Getting assignments with filters - employee: {}, supervisor: {}, kpi: {}", employeeId, supervisorId, kpiId);
        
        // For now, we'll get all assignments and filter in memory
        // In a real implementation, this would be done at the database level
        List<KPIAssignment> allAssignments = kpiAssignmentRepository.findAll();
        
        return allAssignments.stream()
            .filter(assignment -> employeeId == null || assignment.getEmployeeId().equals(employeeId))
            .filter(assignment -> supervisorId == null || assignment.getSupervisorId().equals(supervisorId))
            .filter(assignment -> kpiId == null || assignment.getKpiDefinitionId().equals(kpiId))
            // Note: effectiveDate filtering would need proper date parsing in real implementation
            .collect(Collectors.toList());
    }
    
    /**
     * Get bulk assignments for multiple employees
     */
    public Map<String, List<KPIAssignment>> getBulkAssignments(String[] employeeIds) {
        logger.debug("Getting bulk assignments for {} employees", employeeIds.length);
        
        Map<String, List<KPIAssignment>> bulkAssignments = new HashMap<>();
        
        for (String employeeId : employeeIds) {
            List<KPIAssignment> employeeAssignments = getActiveEmployeeAssignments(employeeId.trim());
            bulkAssignments.put(employeeId.trim(), employeeAssignments);
        }
        
        return bulkAssignments;
    }
    
    /**
     * Updates a KPI assignment
     */
    public KPIAssignment updateAssignment(String employeeId, String kpiDefinitionId, 
                                        CreateKPIAssignmentRequest request, String updatedBy) {
        logger.info("Updating KPI assignment for employee {} and KPI {} by user: {}", 
            employeeId, kpiDefinitionId, updatedBy);
        
        KPIAssignment existingAssignment = kpiAssignmentRepository
            .findByEmployeeIdAndKpiDefinitionId(employeeId, kpiDefinitionId)
            .orElseThrow(() -> new IllegalArgumentException("KPI assignment not found"));
        
        // Validate the request
        validateAssignmentRequest(request);
        
        // Update properties
        existingAssignment.setCustomTargetValue(request.getCustomTargetValue());
        existingAssignment.setCustomTargetUnit(request.getCustomTargetUnit());
        existingAssignment.setCustomTargetComparisonType(request.getCustomTargetComparisonType());
        existingAssignment.setCustomWeightPercentage(request.getCustomWeightPercentage());
        existingAssignment.setCustomWeightIsFlexible(request.isCustomWeightIsFlexible());
        existingAssignment.setEffectiveDate(request.getEffectiveDate());
        existingAssignment.setEndDate(request.getEndDate());
        existingAssignment.setUpdatedAt(LocalDateTime.now());
        
        KPIAssignment updatedAssignment = kpiAssignmentRepository.save(existingAssignment);
        
        logger.info("Successfully updated KPI assignment for employee {} and KPI {}", 
            employeeId, kpiDefinitionId);
        
        return updatedAssignment;
    }
    
    /**
     * Removes a KPI assignment (soft delete)
     */
    public void removeAssignment(String employeeId, String kpiDefinitionId, String removedBy) {
        logger.info("Removing KPI assignment for employee {} and KPI {} by user: {}", 
            employeeId, kpiDefinitionId, removedBy);
        
        KPIAssignment assignment = kpiAssignmentRepository
            .findByEmployeeIdAndKpiDefinitionId(employeeId, kpiDefinitionId)
            .orElseThrow(() -> new IllegalArgumentException("KPI assignment not found"));
        
        // Soft delete by changing status
        assignment.setStatus(AssignmentStatus.EXPIRED);
        assignment.setUpdatedAt(LocalDateTime.now());
        
        kpiAssignmentRepository.save(assignment);
        
        logger.info("Successfully removed KPI assignment for employee {} and KPI {}", 
            employeeId, kpiDefinitionId);
    }
    
    /**
     * Validates assignment request
     */
    private void validateAssignmentRequest(CreateKPIAssignmentRequest request) {
        if (request.getEmployeeId() == null || request.getEmployeeId().trim().isEmpty()) {
            throw new IllegalArgumentException("Employee ID is required");
        }
        
        if (request.getKpiDefinitionId() == null || request.getKpiDefinitionId().trim().isEmpty()) {
            throw new IllegalArgumentException("KPI Definition ID is required");
        }
        
        if (request.getEffectiveDate() == null) {
            throw new IllegalArgumentException("Effective date is required");
        }
        
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getEffectiveDate())) {
            throw new IllegalArgumentException("End date cannot be before effective date");
        }
        
        if (request.getCustomWeightPercentage() != null && 
            (request.getCustomWeightPercentage().doubleValue() < 0 || 
             request.getCustomWeightPercentage().doubleValue() > 100)) {
            throw new IllegalArgumentException("Weight percentage must be between 0 and 100");
        }
    }
    
    /**
     * Validates weight distribution for flexible weight assignments
     */
    private void validateWeightDistribution(String employeeId, BigDecimal newWeight, List<KPIAssignment> currentAssignments) {
        if (newWeight == null) {
            return; // Will use default weight
        }
        
        // For flexible weight validation, we allow total to exceed 100%
        // This is configurable based on organizational rules
        BigDecimal totalWeight = currentAssignments.stream()
            .filter(assignment -> assignment.getCustomWeightPercentage() != null)
            .map(KPIAssignment::getCustomWeightPercentage)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        totalWeight = totalWeight.add(newWeight);
        
        // Log warning if total weight exceeds 100% but don't fail (flexible validation)
        if (totalWeight.doubleValue() > 100) {
            logger.warn("Total weight percentage for employee {} exceeds 100%: {}", employeeId, totalWeight);
        }
    }
}