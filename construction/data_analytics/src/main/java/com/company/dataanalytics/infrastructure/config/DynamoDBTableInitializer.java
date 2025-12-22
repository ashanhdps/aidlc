package com.company.dataanalytics.infrastructure.config;

import com.company.dataanalytics.infrastructure.persistence.entities.UserAccountEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.CreateTableEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.EnhancedGlobalSecondaryIndex;
import software.amazon.awssdk.services.dynamodb.model.ProjectionType;
import software.amazon.awssdk.services.dynamodb.model.ProvisionedThroughput;
import software.amazon.awssdk.services.dynamodb.model.ResourceInUseException;

/**
 * Initializes DynamoDB tables and indexes on application startup
 */
@Component
@Profile("!test") // Don't run in test profile
@Order(1) // Run before data seeding
public class DynamoDBTableInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DynamoDBTableInitializer.class);
    
    private final DynamoDbEnhancedClient dynamoDbClient;

    public DynamoDBTableInitializer(DynamoDbEnhancedClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    @Override
    public void run(String... args) {
        createUserAccountsTable();
    }

    private void createUserAccountsTable() {
        try {
            DynamoDbTable<UserAccountEntity> table = dynamoDbClient.table("UserAccounts", 
                    TableSchema.fromBean(UserAccountEntity.class));

            // Create email index
            EnhancedGlobalSecondaryIndex emailIndex = EnhancedGlobalSecondaryIndex.builder()
                    .indexName("email-index")
                    .projection(software.amazon.awssdk.services.dynamodb.model.Projection.builder()
                            .projectionType(ProjectionType.ALL)
                            .build())
                    .provisionedThroughput(ProvisionedThroughput.builder()
                            .readCapacityUnits(5L)
                            .writeCapacityUnits(5L)
                            .build())
                    .build();

            // Create role index
            EnhancedGlobalSecondaryIndex roleIndex = EnhancedGlobalSecondaryIndex.builder()
                    .indexName("role-index")
                    .projection(software.amazon.awssdk.services.dynamodb.model.Projection.builder()
                            .projectionType(ProjectionType.ALL)
                            .build())
                    .provisionedThroughput(ProvisionedThroughput.builder()
                            .readCapacityUnits(5L)
                            .writeCapacityUnits(5L)
                            .build())
                    .build();

            CreateTableEnhancedRequest createTableRequest = CreateTableEnhancedRequest.builder()
                    .globalSecondaryIndices(emailIndex, roleIndex)
                    .provisionedThroughput(ProvisionedThroughput.builder()
                            .readCapacityUnits(10L)
                            .writeCapacityUnits(10L)
                            .build())
                    .build();

            table.createTable(createTableRequest);
            
            // Wait for table to be active
            table.describeTable();
            
            logger.info("UserAccounts table created successfully with indexes");
            
        } catch (ResourceInUseException e) {
            logger.info("UserAccounts table already exists");
        } catch (Exception e) {
            logger.error("Failed to create UserAccounts table: {}", e.getMessage(), e);
        }
    }
}