package com.company.dataanalytics.infrastructure.persistence.mappers;

import com.company.dataanalytics.domain.aggregates.user.Role;
import com.company.dataanalytics.domain.aggregates.user.UserAccount;
import com.company.dataanalytics.domain.valueobjects.*;
import com.company.dataanalytics.infrastructure.persistence.entities.UserAccountEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper between UserAccount domain object and UserAccountEntity
 */
@Component
public class UserAccountEntityMapper {

    public UserAccountEntity toEntity(UserAccount userAccount) {
        if (userAccount == null) {
            return null;
        }

        UserAccountEntity entity = new UserAccountEntity();
        entity.setUserId(userAccount.getId().getValue().toString());
        entity.setEmail(userAccount.getEmail().getValue());
        entity.setUsername(userAccount.getUsername());
        entity.setPasswordHash(userAccount.getPasswordHash());
        entity.setRoleName(userAccount.getRole().getRoleName().getValue());
        entity.setAccountStatus(userAccount.getAccountStatus().toString());
        entity.setCreatedDate(userAccount.getCreatedDate());
        entity.setLastModifiedDate(userAccount.getUpdatedDate());
        entity.setCreatedBy(userAccount.getCreatedBy().getValue().toString());
        
        if (userAccount.getUpdatedBy() != null) {
            entity.setLastModifiedBy(userAccount.getUpdatedBy().getValue().toString());
        }
        
        if (userAccount.getLastLoginTime() != null) {
            entity.setLastLoginTime(userAccount.getLastLoginTime().getValue());
        }

        return entity;
    }

    public UserAccount toDomain(UserAccountEntity entity) {
        if (entity == null) {
            return null;
        }

        UserId userId = UserId.of(entity.getUserId());
        Email email = Email.of(entity.getEmail());
        RoleName roleName = RoleName.of(entity.getRoleName());
        
        // Create a basic role - in a real implementation, you might want to fetch full role details
        Role role = Role.create(roleName, "Role: " + roleName.getValue());
        
        UserId createdBy = UserId.of(entity.getCreatedBy());

        // Create the user account using the updated constructor with password
        UserAccount userAccount = new UserAccount(userId, email, entity.getUsername(), 
                                                entity.getPasswordHash(), role, createdBy);
        
        return userAccount;
    }
}