package com.company.dataanalytics.infrastructure.repositories;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import com.company.dataanalytics.domain.aggregates.user.UserAccount;
import com.company.dataanalytics.domain.repositories.IUserAccountRepository;
import com.company.dataanalytics.domain.valueobjects.Email;
import com.company.dataanalytics.domain.valueobjects.RoleName;
import com.company.dataanalytics.domain.valueobjects.UserId;
import com.company.dataanalytics.infrastructure.persistence.entities.UserAccountEntity;
import com.company.dataanalytics.infrastructure.persistence.mappers.UserAccountEntityMapper;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;

/**
 * DynamoDB implementation of IUserAccountRepository
 */
@Repository
@Primary
@Profile("!test") // Don't use as primary in test profile
public class DynamoDBUserAccountRepository implements IUserAccountRepository {

    private static final String TABLE_NAME = "UserAccounts";
    private static final String EMAIL_INDEX = "email-index";
    private static final String ROLE_INDEX = "role-index";

    private final DynamoDbTable<UserAccountEntity> table;
    private final DynamoDbIndex<UserAccountEntity> emailIndex;
    private final DynamoDbIndex<UserAccountEntity> roleIndex;
    private final UserAccountEntityMapper mapper;

    public DynamoDBUserAccountRepository(DynamoDbEnhancedClient dynamoDbClient, 
                                       UserAccountEntityMapper mapper) {
        this.table = dynamoDbClient.table(TABLE_NAME, software.amazon.awssdk.enhanced.dynamodb.TableSchema.fromBean(UserAccountEntity.class));
        this.emailIndex = table.index(EMAIL_INDEX);
        this.roleIndex = table.index(ROLE_INDEX);
        this.mapper = mapper;
    }

    @Override
    public Optional<UserAccount> findById(UserId userId) {
        try {
            Key key = Key.builder()
                    .partitionValue(userId.getValue().toString())
                    .build();

            UserAccountEntity entity = table.getItem(key);
            return Optional.ofNullable(mapper.toDomain(entity));
        } catch (Exception e) {
            // Log error and return empty
            return Optional.empty();
        }
    }

    @Override
    public Optional<UserAccount> findByEmail(Email email) {
        try {
            QueryConditional queryConditional = QueryConditional.keyEqualTo(
                    Key.builder().partitionValue(email.getValue()).build()
            );

            List<UserAccountEntity> entities = emailIndex.query(queryConditional)
                    .stream()
                    .flatMap(page -> page.items().stream())
                    .collect(Collectors.toList());

            if (!entities.isEmpty()) {
                return Optional.of(mapper.toDomain(entities.get(0)));
            }
            return Optional.empty();
        } catch (Exception e) {
            // Log error and return empty
            return Optional.empty();
        }
    }

    @Override
    public Optional<UserAccount> findByUsername(String username) {
        try {
            // Since we don't have a username index, we'll scan the table
            ScanEnhancedRequest scanRequest = ScanEnhancedRequest.builder()
                    .filterExpression(software.amazon.awssdk.enhanced.dynamodb.Expression.builder()
                            .expression("username = :username")
                            .putExpressionValue(":username", 
                                software.amazon.awssdk.services.dynamodb.model.AttributeValue.builder()
                                    .s(username)
                                    .build())
                            .build())
                    .build();

            List<UserAccountEntity> entities = table.scan(scanRequest)
                    .stream()
                    .flatMap(page -> page.items().stream())
                    .collect(Collectors.toList());

            if (!entities.isEmpty()) {
                return Optional.of(mapper.toDomain(entities.get(0)));
            }
            return Optional.empty();
        } catch (Exception e) {
            // Log error and return empty
            return Optional.empty();
        }
    }

    @Override
    public List<UserAccount> findByRole(RoleName roleName) {
        try {
            QueryConditional queryConditional = QueryConditional.keyEqualTo(
                    Key.builder().partitionValue(roleName.getValue()).build()
            );

            return roleIndex.query(queryConditional)
                    .stream()
                    .flatMap(page -> page.items().stream())
                    .map(mapper::toDomain)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Log error and return empty list
            return List.of();
        }
    }

    @Override
    public List<UserAccount> findActiveUsers() {
        try {
            ScanEnhancedRequest scanRequest = ScanEnhancedRequest.builder()
                    .filterExpression(software.amazon.awssdk.enhanced.dynamodb.Expression.builder()
                            .expression("accountStatus = :status")
                            .putExpressionValue(":status", 
                                software.amazon.awssdk.services.dynamodb.model.AttributeValue.builder()
                                    .s("ACTIVE")
                                    .build())
                            .build())
                    .build();

            return table.scan(scanRequest)
                    .stream()
                    .flatMap(page -> page.items().stream())
                    .map(mapper::toDomain)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Log error and return empty list
            return List.of();
        }
    }

    @Override
    public List<UserAccount> findAll(int page, int size) {
        try {
            // DynamoDB doesn't support traditional pagination, so we'll scan and skip/limit
            return table.scan()
                    .stream()
                    .flatMap(scanPage -> scanPage.items().stream())
                    .sorted((e1, e2) -> e1.getCreatedDate().compareTo(e2.getCreatedDate()))
                    .skip((long) page * size)
                    .limit(size)
                    .map(mapper::toDomain)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Log error and return empty list
            return List.of();
        }
    }

    @Override
    public void save(UserAccount userAccount) {
        try {
            UserAccountEntity entity = mapper.toEntity(userAccount);
            table.putItem(entity);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save user account: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(UserId userId) {
        try {
            Key key = Key.builder()
                    .partitionValue(userId.getValue().toString())
                    .build();
            table.deleteItem(key);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete user account: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean existsByEmail(Email email) {
        return findByEmail(email).isPresent();
    }

    @Override
    public long count() {
        try {
            return table.scan()
                    .stream()
                    .flatMap(page -> page.items().stream())
                    .count();
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public long countActive() {
        try {
            ScanEnhancedRequest scanRequest = ScanEnhancedRequest.builder()
                    .filterExpression(software.amazon.awssdk.enhanced.dynamodb.Expression.builder()
                            .expression("accountStatus = :status")
                            .putExpressionValue(":status", 
                                software.amazon.awssdk.services.dynamodb.model.AttributeValue.builder()
                                    .s("ACTIVE")
                                    .build())
                            .build())
                    .build();

            return table.scan(scanRequest)
                    .stream()
                    .flatMap(page -> page.items().stream())
                    .count();
        } catch (Exception e) {
            return 0;
        }
    }
}