package com.company.kpi.infrastructure.repositories;

import com.company.kpi.domain.kpidefinition.*;
import com.company.kpi.infrastructure.events.InMemoryEventStore;
import com.company.kpi.infrastructure.repositories.entities.KPIDefinitionEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * DynamoDB implementation of KPI Definition repository
 */
@Repository
public class KPIDefinitionRepository extends DynamoDBRepository<KPIDefinition, KPIDefinitionId, KPIDefinitionEntity> 
    implements IKPIDefinitionRepository {
    
    public KPIDefinitionRepository(DynamoDbEnhancedClient dynamoDbClient,
                                 InMemoryEventStore eventStore,
                                 @Value("${aws.dynamodb.table-prefix:kpi-management-}") String tablePrefix) {
        super(dynamoDbClient, eventStore, tablePrefix + "kpi-definitions", KPIDefinitionEntity.class);
    }
    
    @Override
    public Optional<KPIDefinition> findByName(String name, String organizationId) {
        // For demo purposes, we'll scan the table
        // In production, you'd use a GSI (Global Secondary Index)
        return findAll().stream()
            .filter(kpi -> kpi.getName().equals(name))
            .findFirst();
    }
    
    @Override
    public List<KPIDefinition> findByCategory(KPICategory category) {
        return findAll().stream()
            .filter(kpi -> kpi.getCategory() == category)
            .toList();
    }
    
    @Override
    public List<KPIDefinition> findActiveDefinitions(String organizationId) {
        return findAll().stream()
            .filter(KPIDefinition::isActive)
            .toList();
    }
    
    @Override
    public boolean existsByName(String name, String organizationId) {
        return findByName(name, organizationId).isPresent();
    }
    
    @Override
    protected KPIDefinitionEntity toDynamoEntity(KPIDefinition aggregate) {
        KPIDefinitionEntity entity = new KPIDefinitionEntity();
        
        entity.setId(aggregate.getId().getValue());
        entity.setName(aggregate.getName());
        entity.setDescription(aggregate.getDescription());
        entity.setCategory(aggregate.getCategory().name());
        entity.setMeasurementType(aggregate.getMeasurementType().name());
        
        if (aggregate.getDefaultTarget() != null) {
            entity.setDefaultTargetValue(aggregate.getDefaultTarget().getValue());
            entity.setDefaultTargetUnit(aggregate.getDefaultTarget().getUnit());
            entity.setDefaultTargetComparisonType(aggregate.getDefaultTarget().getComparisonType().name());
        }
        
        if (aggregate.getDefaultWeight() != null) {
            entity.setDefaultWeightPercentage(aggregate.getDefaultWeight().getPercentage());
            entity.setDefaultWeightIsFlexible(aggregate.getDefaultWeight().isFlexible());
        }
        
        if (aggregate.getMeasurementFrequency() != null) {
            entity.setMeasurementFrequencyType(aggregate.getMeasurementFrequency().getIntervalType().name());
            entity.setMeasurementFrequencyValue(aggregate.getMeasurementFrequency().getIntervalValue());
        }
        
        entity.setDataSource(aggregate.getDataSource());
        entity.setCreatedBy(aggregate.getCreatedBy());
        entity.setCreatedAt(aggregate.getCreatedAt());
        entity.setUpdatedAt(aggregate.getUpdatedAt());
        entity.setActive(aggregate.isActive());
        
        return entity;
    }
    
    @Override
    protected KPIDefinition fromDynamoEntity(KPIDefinitionEntity entity) {
        try {
            // Create the aggregate using reflection to set private fields
            // In a real implementation, you might use a factory method or builder
            KPIDefinition kpi = createKPIDefinitionFromEntity(entity);
            return kpi;
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert DynamoDB entity to domain aggregate", e);
        }
    }
    
    private KPIDefinition createKPIDefinitionFromEntity(KPIDefinitionEntity entity) throws Exception {
        // Create target
        Target target = null;
        if (entity.getDefaultTargetValue() != null) {
            target = new Target(
                entity.getDefaultTargetValue(),
                entity.getDefaultTargetUnit(),
                ComparisonType.valueOf(entity.getDefaultTargetComparisonType())
            );
        }
        
        // Create weight
        Weight weight = null;
        if (entity.getDefaultWeightPercentage() != null) {
            weight = new Weight(entity.getDefaultWeightPercentage(), entity.isDefaultWeightIsFlexible());
        }
        
        // Create frequency
        Frequency frequency = null;
        if (entity.getMeasurementFrequencyType() != null) {
            frequency = new Frequency(
                Frequency.IntervalType.valueOf(entity.getMeasurementFrequencyType()),
                entity.getMeasurementFrequencyValue()
            );
        }
        
        // Create the KPI Definition using the factory method
        KPIDefinition kpi = KPIDefinition.create(
            entity.getName(),
            entity.getDescription(),
            KPICategory.valueOf(entity.getCategory()),
            MeasurementType.valueOf(entity.getMeasurementType()),
            target,
            weight,
            frequency,
            entity.getDataSource(),
            entity.getCreatedBy()
        );
        
        // Set the ID and other fields using reflection (since they're private)
        setPrivateField(kpi, "id", KPIDefinitionId.of(entity.getId()));
        setPrivateField(kpi, "createdAt", entity.getCreatedAt());
        setPrivateField(kpi, "updatedAt", entity.getUpdatedAt());
        setPrivateField(kpi, "isActive", entity.isActive());
        
        // Clear domain events since this is a reconstituted aggregate
        kpi.clearDomainEvents();
        
        return kpi;
    }
    
    private void setPrivateField(Object obj, String fieldName, Object value) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }
}