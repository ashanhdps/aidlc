package com.company.kpi.repository;

import com.company.kpi.model.KPICategory;
import com.company.kpi.model.KPIDefinition;
import com.company.kpi.repository.interfaces.KPIDefinitionRepositoryInterface;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.CreateTableEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * DynamoDB repository for KPI Definition
 */
@Repository("kpiDefinitionRepositoryImpl")
public class KPIDefinitionRepository implements KPIDefinitionRepositoryInterface {
    
    private final DynamoDbTable<KPIDefinition> table;
    private final String tableName;
    
    public KPIDefinitionRepository(DynamoDbEnhancedClient dynamoDbClient,
                                 @Value("${aws.dynamodb.table-prefix:kpi-management-}") String tablePrefix) {
        this.tableName = tablePrefix + "kpi-definitions";
        this.table = dynamoDbClient.table(tableName, TableSchema.fromBean(KPIDefinition.class));
        
        // Create table if it doesn't exist (for demo purposes)
        createTableIfNotExists();
    }
    
    /**
     * Saves a KPI Definition
     */
    public KPIDefinition save(KPIDefinition kpi) {
        table.putItem(kpi);
        return kpi;
    }
    
    /**
     * Finds KPI Definition by ID
     */
    public Optional<KPIDefinition> findById(String id) {
        Key key = Key.builder().partitionValue(id).build();
        KPIDefinition kpi = table.getItem(key);
        return Optional.ofNullable(kpi);
    }
    
    /**
     * Finds all KPI Definitions
     */
    public List<KPIDefinition> findAll() {
        return table.scan(ScanEnhancedRequest.builder().build())
            .items()
            .stream()
            .collect(Collectors.toList());
    }
    
    /**
     * Finds KPI Definition by name
     */
    public Optional<KPIDefinition> findByName(String name) {
        return findAll().stream()
            .filter(kpi -> kpi.getName().equals(name))
            .findFirst();
    }
    
    /**
     * Checks if KPI Definition exists by name
     */
    public boolean existsByName(String name) {
        return findByName(name).isPresent();
    }
    
    /**
     * Finds KPI Definitions by category
     */
    public List<KPIDefinition> findByCategory(KPICategory category) {
        return findAll().stream()
            .filter(kpi -> kpi.getCategory() == category)
            .collect(Collectors.toList());
    }
    
    /**
     * Finds active KPI Definitions
     */
    public List<KPIDefinition> findByIsActiveTrue() {
        return findAll().stream()
            .filter(KPIDefinition::isActive)
            .collect(Collectors.toList());
    }
    
    /**
     * Deletes KPI Definition by ID
     */
    public void deleteById(String id) {
        Key key = Key.builder().partitionValue(id).build();
        table.deleteItem(key);
    }
    
    /**
     * Counts total KPI Definitions
     */
    public long count() {
        return findAll().size();
    }
    
    /**
     * Checks if KPI Definition exists by ID
     */
    public boolean existsById(String id) {
        return findById(id).isPresent();
    }
    
    /**
     * Finds KPI Definitions by department
     */
    public List<KPIDefinition> findByDepartment(String department) {
        return findAll().stream()
            .filter(kpi -> department.equals(kpi.getDepartment()))
            .collect(Collectors.toList());
    }
    
    /**
     * Creates the DynamoDB table if it doesn't exist
     */
    private void createTableIfNotExists() {
        try {
            table.createTable(CreateTableEnhancedRequest.builder().build());
        } catch (ResourceNotFoundException e) {
            // Table already exists, which is fine
        } catch (Exception e) {
            // Log warning but don't fail the application
            System.out.println("Could not create DynamoDB table " + tableName + ": " + e.getMessage());
        }
    }
}