package com.company.kpi.infrastructure.repositories;

import com.company.kpi.domain.shared.AggregateRoot;
import com.company.kpi.domain.shared.Repository;
import com.company.kpi.infrastructure.events.InMemoryEventStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
 * Base DynamoDB repository implementation for aggregates.
 * Provides common DynamoDB operations with domain event publishing.
 */
public abstract class DynamoDBRepository<T extends AggregateRoot<ID>, ID, E> implements Repository<T, ID> {
    
    private static final Logger logger = LoggerFactory.getLogger(DynamoDBRepository.class);
    
    protected final DynamoDbTable<E> table;
    protected final InMemoryEventStore eventStore;
    protected final String tableName;
    
    protected DynamoDBRepository(DynamoDbEnhancedClient dynamoDbClient, 
                               InMemoryEventStore eventStore,
                               String tableName, 
                               Class<E> entityClass) {
        this.eventStore = eventStore;
        this.tableName = tableName;
        this.table = dynamoDbClient.table(tableName, TableSchema.fromBean(entityClass));
        
        // Create table if it doesn't exist (for demo purposes)
        createTableIfNotExists();
    }
    
    @Override
    public T save(T aggregate) {
        logger.debug("Saving aggregate to DynamoDB: {}", aggregate);
        
        try {
            // Convert domain aggregate to DynamoDB entity
            E entity = toDynamoEntity(aggregate);
            
            // Save to DynamoDB
            table.putItem(entity);
            
            // Publish domain events
            if (aggregate.hasDomainEvents()) {
                eventStore.storeAll(aggregate.getDomainEvents());
            }
            
            logger.debug("Saved aggregate to DynamoDB with ID: {}", aggregate.getId());
            return aggregate;
            
        } catch (Exception e) {
            logger.error("Error saving aggregate to DynamoDB: {}", aggregate.getId(), e);
            throw new RuntimeException("Failed to save aggregate", e);
        }
    }
    
    @Override
    public Optional<T> findById(ID id) {
        logger.debug("Finding aggregate by ID in DynamoDB: {}", id);
        
        try {
            Key key = Key.builder()
                .partitionValue(id.toString())
                .build();
            
            E entity = table.getItem(key);
            
            if (entity != null) {
                T aggregate = fromDynamoEntity(entity);
                logger.debug("Found aggregate in DynamoDB: {}", id);
                return Optional.of(aggregate);
            } else {
                logger.debug("Aggregate not found in DynamoDB: {}", id);
                return Optional.empty();
            }
            
        } catch (Exception e) {
            logger.error("Error finding aggregate by ID in DynamoDB: {}", id, e);
            throw new RuntimeException("Failed to find aggregate", e);
        }
    }
    
    @Override
    public List<T> findAll() {
        logger.debug("Finding all aggregates in DynamoDB table: {}", tableName);
        
        try {
            return table.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .map(this::fromDynamoEntity)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            logger.error("Error finding all aggregates in DynamoDB", e);
            throw new RuntimeException("Failed to find all aggregates", e);
        }
    }
    
    @Override
    public void deleteById(ID id) {
        logger.debug("Deleting aggregate by ID in DynamoDB: {}", id);
        
        try {
            Key key = Key.builder()
                .partitionValue(id.toString())
                .build();
            
            table.deleteItem(key);
            logger.debug("Deleted aggregate from DynamoDB: {}", id);
            
        } catch (Exception e) {
            logger.error("Error deleting aggregate by ID in DynamoDB: {}", id, e);
            throw new RuntimeException("Failed to delete aggregate", e);
        }
    }
    
    @Override
    public boolean existsById(ID id) {
        return findById(id).isPresent();
    }
    
    @Override
    public long count() {
        try {
            return table.scan().items().stream().count();
        } catch (Exception e) {
            logger.error("Error counting aggregates in DynamoDB", e);
            return 0;
        }
    }
    
    /**
     * Creates the DynamoDB table if it doesn't exist
     */
    private void createTableIfNotExists() {
        try {
            table.createTable(CreateTableEnhancedRequest.builder()
                .build());
            logger.info("Created DynamoDB table: {}", tableName);
        } catch (ResourceNotFoundException e) {
            // Table already exists, which is fine
            logger.debug("DynamoDB table already exists: {}", tableName);
        } catch (Exception e) {
            logger.warn("Could not create DynamoDB table {}: {}", tableName, e.getMessage());
        }
    }
    
    /**
     * Converts domain aggregate to DynamoDB entity
     */
    protected abstract E toDynamoEntity(T aggregate);
    
    /**
     * Converts DynamoDB entity to domain aggregate
     */
    protected abstract T fromDynamoEntity(E entity);
}