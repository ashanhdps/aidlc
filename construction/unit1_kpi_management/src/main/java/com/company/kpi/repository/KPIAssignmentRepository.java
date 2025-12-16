package com.company.kpi.repository;

import com.company.kpi.model.AssignmentStatus;
import com.company.kpi.model.KPIAssignment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.CreateTableEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * DynamoDB repository for KPI Assignment
 */
@Repository
public class KPIAssignmentRepository {
    
    private final DynamoDbTable<KPIAssignment> table;
    private final String tableName;
    
    public KPIAssignmentRepository(DynamoDbEnhancedClient dynamoDbClient,
                                 @Value("${aws.dynamodb.table-prefix:kpi-management-}") String tablePrefix) {
        this.tableName = tablePrefix + "kpi-assignments";
        this.table = dynamoDbClient.table(tableName, TableSchema.fromBean(KPIAssignment.class));
        
        // Create table if it doesn't exist (for demo purposes)
        createTableIfNotExists();
    }
    
    /**
     * Saves a KPI Assignment
     */
    public KPIAssignment save(KPIAssignment assignment) {
        table.putItem(assignment);
        return assignment;
    }
    
    /**
     * Finds KPI Assignment by employee ID and KPI Definition ID
     */
    public Optional<KPIAssignment> findByEmployeeIdAndKpiDefinitionId(String employeeId, String kpiDefinitionId) {
        Key key = Key.builder()
            .partitionValue(employeeId)
            .sortValue(kpiDefinitionId)
            .build();
        KPIAssignment assignment = table.getItem(key);
        return Optional.ofNullable(assignment);
    }
    
    /**
     * Finds all KPI Assignments for an employee
     */
    public List<KPIAssignment> findByEmployeeId(String employeeId) {
        QueryConditional queryConditional = QueryConditional.keyEqualTo(
            Key.builder().partitionValue(employeeId).build()
        );
        
        return table.query(queryConditional)
            .items()
            .stream()
            .collect(Collectors.toList());
    }
    
    /**
     * Finds all active KPI Assignments for an employee
     */
    public List<KPIAssignment> findActiveByEmployeeId(String employeeId) {
        return findByEmployeeId(employeeId).stream()
            .filter(assignment -> assignment.getStatus() == AssignmentStatus.ACTIVE)
            .collect(Collectors.toList());
    }
    
    /**
     * Finds all KPI Assignments for a specific KPI Definition
     */
    public List<KPIAssignment> findByKpiDefinitionId(String kpiDefinitionId) {
        return table.scan(ScanEnhancedRequest.builder().build())
            .items()
            .stream()
            .filter(assignment -> assignment.getKpiDefinitionId().equals(kpiDefinitionId))
            .collect(Collectors.toList());
    }
    
    /**
     * Finds all KPI Assignments
     */
    public List<KPIAssignment> findAll() {
        return table.scan(ScanEnhancedRequest.builder().build())
            .items()
            .stream()
            .collect(Collectors.toList());
    }
    
    /**
     * Deletes KPI Assignment
     */
    public void delete(String employeeId, String kpiDefinitionId) {
        Key key = Key.builder()
            .partitionValue(employeeId)
            .sortValue(kpiDefinitionId)
            .build();
        table.deleteItem(key);
    }
    
    /**
     * Counts total KPI Assignments
     */
    public long count() {
        return findAll().size();
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