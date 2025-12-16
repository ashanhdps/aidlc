package com.company.kpi.repository;

import com.company.kpi.model.ApprovalStatus;
import com.company.kpi.model.ApprovalWorkflow;
import org.springframework.beans.factory.annotation.Value;
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
 * DynamoDB repository for Approval Workflow
 */
@Repository
public class ApprovalWorkflowRepository {
    
    private final DynamoDbTable<ApprovalWorkflow> table;
    private final String tableName;
    
    public ApprovalWorkflowRepository(DynamoDbEnhancedClient dynamoDbClient,
                                    @Value("${aws.dynamodb.table-prefix:kpi-management-}") String tablePrefix) {
        this.tableName = tablePrefix + "approval-workflows";
        this.table = dynamoDbClient.table(tableName, TableSchema.fromBean(ApprovalWorkflow.class));
        
        // Create table if it doesn't exist (for demo purposes)
        createTableIfNotExists();
    }
    
    /**
     * Saves an Approval Workflow
     */
    public ApprovalWorkflow save(ApprovalWorkflow workflow) {
        table.putItem(workflow);
        return workflow;
    }
    
    /**
     * Finds Approval Workflow by ID
     */
    public Optional<ApprovalWorkflow> findById(String workflowId) {
        Key key = Key.builder().partitionValue(workflowId).build();
        ApprovalWorkflow workflow = table.getItem(key);
        return Optional.ofNullable(workflow);
    }
    
    /**
     * Finds all Approval Workflows
     */
    public List<ApprovalWorkflow> findAll() {
        return table.scan(ScanEnhancedRequest.builder().build())
            .items()
            .stream()
            .collect(Collectors.toList());
    }
    
    /**
     * Finds workflows by checker ID and status
     */
    public List<ApprovalWorkflow> findByCheckerIdAndStatus(String checkerId, ApprovalStatus status) {
        return findAll().stream()
            .filter(workflow -> checkerId.equals(workflow.getCheckerId()) && 
                              workflow.getStatus() == status)
            .collect(Collectors.toList());
    }
    
    /**
     * Finds workflows by maker ID
     */
    public List<ApprovalWorkflow> findByMakerId(String makerId) {
        return findAll().stream()
            .filter(workflow -> makerId.equals(workflow.getMakerId()))
            .collect(Collectors.toList());
    }
    
    /**
     * Finds pending workflows
     */
    public List<ApprovalWorkflow> findPendingWorkflows() {
        return findAll().stream()
            .filter(workflow -> workflow.getStatus() == ApprovalStatus.PENDING)
            .collect(Collectors.toList());
    }
    
    /**
     * Deletes Approval Workflow by ID
     */
    public void deleteById(String workflowId) {
        Key key = Key.builder().partitionValue(workflowId).build();
        table.deleteItem(key);
    }
    
    /**
     * Counts total Approval Workflows
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