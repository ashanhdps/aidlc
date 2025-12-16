package com.company.kpi.service;

import com.company.kpi.model.KPICategory;
import com.company.kpi.model.KPIDefinition;
import com.company.kpi.model.dto.CreateKPIRequest;
import com.company.kpi.repository.interfaces.KPIDefinitionRepositoryInterface;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service layer for KPI Definition business logic
 */
@Service
public class KPIDefinitionService {
    
    private static final Logger logger = LoggerFactory.getLogger(KPIDefinitionService.class);
    
    @Autowired
    private KPIDefinitionRepositoryInterface kpiDefinitionRepository;
    
    /**
     * Creates a new KPI Definition
     */
    public KPIDefinition createKPI(CreateKPIRequest request, String createdBy) {
        logger.info("Creating new KPI: {} by user: {}", request.getName(), createdBy);
        
        // Validate business rules
        validateKPIRequest(request);
        
        // Check if KPI with same name already exists
        if (kpiDefinitionRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("KPI with name '" + request.getName() + "' already exists");
        }
        
        // Create KPI Definition
        KPIDefinition kpi = new KPIDefinition(
            request.getName(),
            request.getDescription(),
            request.getCategory(),
            request.getMeasurementType(),
            createdBy
        );
        
        // Set additional properties
        kpi.setId(UUID.randomUUID().toString());
        kpi.setDefaultTargetValue(request.getDefaultTargetValue());
        kpi.setDefaultTargetUnit(request.getDefaultTargetUnit());
        kpi.setDefaultTargetComparisonType(request.getDefaultTargetComparisonType());
        kpi.setDefaultWeightPercentage(request.getDefaultWeightPercentage());
        kpi.setDefaultWeightIsFlexible(request.isDefaultWeightIsFlexible());
        kpi.setMeasurementFrequencyType(request.getMeasurementFrequencyType());
        kpi.setMeasurementFrequencyValue(request.getMeasurementFrequencyValue());
        kpi.setDataSource(request.getDataSource());
        
        // Save to repository
        KPIDefinition savedKPI = kpiDefinitionRepository.save(kpi);
        
        logger.info("Successfully created KPI with ID: {}", savedKPI.getId());
        return savedKPI;
    }
    
    /**
     * Gets all KPI Definitions
     */
    public List<KPIDefinition> getAllKPIs() {
        logger.debug("Retrieving all KPI definitions");
        return kpiDefinitionRepository.findAll();
    }
    
    /**
     * Gets KPI Definition by ID
     */
    public Optional<KPIDefinition> getKPIById(String id) {
        logger.debug("Retrieving KPI by ID: {}", id);
        return kpiDefinitionRepository.findById(id);
    }
    
    /**
     * Gets KPI Definitions by category
     */
    public List<KPIDefinition> getKPIsByCategory(KPICategory category) {
        logger.debug("Retrieving KPIs by category: {}", category);
        return kpiDefinitionRepository.findByCategory(category);
    }
    
    /**
     * Gets active KPI Definitions
     */
    public List<KPIDefinition> getActiveKPIs() {
        logger.debug("Retrieving active KPI definitions");
        return kpiDefinitionRepository.findByIsActiveTrue();
    }
    
    /**
     * Updates an existing KPI Definition
     */
    public KPIDefinition updateKPI(String id, CreateKPIRequest request, String updatedBy) {
        logger.info("Updating KPI: {} by user: {}", id, updatedBy);
        
        KPIDefinition existingKPI = kpiDefinitionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("KPI not found with ID: " + id));
        
        // Validate business rules
        validateKPIRequest(request);
        
        // Check if another KPI with same name exists (excluding current one)
        Optional<KPIDefinition> duplicateKPI = kpiDefinitionRepository.findByName(request.getName());
        if (duplicateKPI.isPresent() && !duplicateKPI.get().getId().equals(id)) {
            throw new IllegalArgumentException("KPI with name '" + request.getName() + "' already exists");
        }
        
        // Update properties
        existingKPI.setName(request.getName());
        existingKPI.setDescription(request.getDescription());
        existingKPI.setCategory(request.getCategory());
        existingKPI.setMeasurementType(request.getMeasurementType());
        existingKPI.setDefaultTargetValue(request.getDefaultTargetValue());
        existingKPI.setDefaultTargetUnit(request.getDefaultTargetUnit());
        existingKPI.setDefaultTargetComparisonType(request.getDefaultTargetComparisonType());
        existingKPI.setDefaultWeightPercentage(request.getDefaultWeightPercentage());
        existingKPI.setDefaultWeightIsFlexible(request.isDefaultWeightIsFlexible());
        existingKPI.setMeasurementFrequencyType(request.getMeasurementFrequencyType());
        existingKPI.setMeasurementFrequencyValue(request.getMeasurementFrequencyValue());
        existingKPI.setDataSource(request.getDataSource());
        existingKPI.setUpdatedAt(LocalDateTime.now());
        
        KPIDefinition updatedKPI = kpiDefinitionRepository.save(existingKPI);
        
        logger.info("Successfully updated KPI with ID: {}", updatedKPI.getId());
        return updatedKPI;
    }
    
    /**
     * Deletes a KPI Definition (soft delete)
     */
    public void deleteKPI(String id, String deletedBy) {
        logger.info("Deleting KPI: {} by user: {}", id, deletedBy);
        
        KPIDefinition kpi = kpiDefinitionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("KPI not found with ID: " + id));
        
        // Soft delete by marking as inactive
        kpi.setActive(false);
        kpi.setUpdatedAt(LocalDateTime.now());
        
        kpiDefinitionRepository.save(kpi);
        
        logger.info("Successfully deleted KPI with ID: {}", id);
    }
    
    /**
     * Validates KPI request data
     */
    private void validateKPIRequest(CreateKPIRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("KPI name is required");
        }
        
        if (request.getCategory() == null) {
            throw new IllegalArgumentException("KPI category is required");
        }
        
        if (request.getMeasurementType() == null) {
            throw new IllegalArgumentException("Measurement type is required");
        }
        
        if (request.getDefaultWeightPercentage() != null && 
            (request.getDefaultWeightPercentage().doubleValue() < 0 || 
             request.getDefaultWeightPercentage().doubleValue() > 100)) {
            throw new IllegalArgumentException("Weight percentage must be between 0 and 100");
        }
        
        if (request.getMeasurementFrequencyValue() <= 0) {
            throw new IllegalArgumentException("Measurement frequency value must be positive");
        }
    }
}