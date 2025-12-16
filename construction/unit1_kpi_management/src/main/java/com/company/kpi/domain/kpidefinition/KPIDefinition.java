package com.company.kpi.domain.kpidefinition;

import com.company.kpi.domain.shared.AggregateRoot;
import com.company.kpi.domain.kpidefinition.events.KPIDefinitionCreated;
import com.company.kpi.domain.kpidefinition.events.KPIDefinitionUpdated;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * KPI Definition aggregate root
 * Manages the lifecycle and consistency of KPI templates and their metadata
 */
public class KPIDefinition extends AggregateRoot<KPIDefinitionId> {
    
    private String name;
    private String description;
    private KPICategory category;
    private MeasurementType measurementType;
    private Target defaultTarget;
    private Weight defaultWeight;
    private Frequency measurementFrequency;
    private String dataSource;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isActive;
    
    // Private constructor for aggregate reconstruction
    private KPIDefinition(KPIDefinitionId id) {
        super(id);
    }
    
    /**
     * Creates a new KPI Definition
     */
    public static KPIDefinition create(
            String name,
            String description,
            KPICategory category,
            MeasurementType measurementType,
            Target defaultTarget,
            Weight defaultWeight,
            Frequency measurementFrequency,
            String dataSource,
            String createdBy) {
        
        // Validate inputs
        Objects.requireNonNull(name, "KPI name cannot be null");
        Objects.requireNonNull(category, "KPI category cannot be null");
        Objects.requireNonNull(measurementType, "Measurement type cannot be null");
        Objects.requireNonNull(createdBy, "Created by cannot be null");
        
        if (name.trim().isEmpty()) {
            throw new IllegalArgumentException("KPI name cannot be empty");
        }
        
        KPIDefinitionId id = KPIDefinitionId.generate();
        KPIDefinition kpi = new KPIDefinition(id);
        
        kpi.name = name.trim();
        kpi.description = description != null ? description.trim() : "";
        kpi.category = category;
        kpi.measurementType = measurementType;
        kpi.defaultTarget = defaultTarget;
        kpi.defaultWeight = defaultWeight;
        kpi.measurementFrequency = measurementFrequency;
        kpi.dataSource = dataSource;
        kpi.createdBy = createdBy;
        kpi.createdAt = LocalDateTime.now();
        kpi.updatedAt = LocalDateTime.now();
        kpi.isActive = true;
        
        // Raise domain event
        kpi.addDomainEvent(new KPIDefinitionCreated(
            id.getValue(),
            name,
            category,
            createdBy,
            kpi.createdAt
        ));
        
        return kpi;
    }
    
    /**
     * Updates KPI metadata
     */
    public void updateMetadata(String name, String description, Target defaultTarget, Weight defaultWeight) {
        Objects.requireNonNull(name, "KPI name cannot be null");
        
        if (name.trim().isEmpty()) {
            throw new IllegalArgumentException("KPI name cannot be empty");
        }
        
        this.name = name.trim();
        this.description = description != null ? description.trim() : "";
        this.defaultTarget = defaultTarget;
        this.defaultWeight = defaultWeight;
        this.updatedAt = LocalDateTime.now();
        
        // Raise domain event
        addDomainEvent(new KPIDefinitionUpdated(
            getId().getValue(),
            name,
            this.updatedAt
        ));
    }
    
    /**
     * Archives the KPI definition
     */
    public void archive() {
        this.isActive = false;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Activates the KPI definition
     */
    public void activate() {
        this.isActive = true;
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters
    public String getName() { return name; }
    public String getDescription() { return description; }
    public KPICategory getCategory() { return category; }
    public MeasurementType getMeasurementType() { return measurementType; }
    public Target getDefaultTarget() { return defaultTarget; }
    public Weight getDefaultWeight() { return defaultWeight; }
    public Frequency getMeasurementFrequency() { return measurementFrequency; }
    public String getDataSource() { return dataSource; }
    public String getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public boolean isActive() { return isActive; }
}