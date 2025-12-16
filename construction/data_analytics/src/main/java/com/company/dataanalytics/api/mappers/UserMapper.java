package com.company.dataanalytics.api.mappers;

import com.company.dataanalytics.api.dto.response.UserResponse;
import com.company.dataanalytics.domain.aggregates.user.UserAccount;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for converting between UserAccount domain objects and DTOs
 */
@Component
public class UserMapper {
    
    /**
     * Convert UserAccount domain object to UserResponse DTO
     */
    public UserResponse toResponse(UserAccount userAccount) {
        if (userAccount == null) {
            return null;
        }
        
        return new UserResponse(
            userAccount.getId().toString(),
            userAccount.getEmail().getValue(),
            userAccount.getUsername(),
            userAccount.getRole().getRoleName().getValue(),
            userAccount.getAccountStatus().getValue(),
            userAccount.getCreatedDate(),
            userAccount.getLastLoginTime().hasNeverLoggedIn() ? null : userAccount.getLastLoginTime().getValue(),
            userAccount.getCreatedBy() != null ? userAccount.getCreatedBy().toString() : null,
            userAccount.getUpdatedBy() != null ? userAccount.getUpdatedBy().toString() : null,
            userAccount.getUpdatedDate()
        );
    }
    
    /**
     * Convert list of UserAccount domain objects to list of UserResponse DTOs
     */
    public List<UserResponse> toResponseList(List<UserAccount> userAccounts) {
        if (userAccounts == null) {
            return null;
        }
        
        return userAccounts.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
}