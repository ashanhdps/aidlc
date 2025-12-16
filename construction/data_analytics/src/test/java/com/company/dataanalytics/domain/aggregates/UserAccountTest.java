package com.company.dataanalytics.domain.aggregates;

import com.company.dataanalytics.domain.aggregates.user.UserAccount;
import com.company.dataanalytics.domain.aggregates.user.Role;
import com.company.dataanalytics.domain.aggregates.user.Permission;
import com.company.dataanalytics.domain.valueobjects.*;
import com.company.dataanalytics.domain.shared.DomainException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for UserAccount aggregate root
 */
@DisplayName("UserAccount Domain Tests")
class UserAccountTest {

    @Test
    @DisplayName("Should create valid user account with required fields")
    void shouldCreateValidUserAccountWithRequiredFields() {
        // Given
        UserId userId = new UserId("user-123");
        Email email = new Email("test@company.com");
        RoleName roleName = new RoleName("EMPLOYEE");

        // When
        UserAccount userAccount = UserAccount.create(userId, email, "testuser", roleName);

        // Then
        assertNotNull(userAccount);
        assertEquals(userId, userAccount.getUserId());
        assertEquals(email, userAccount.getEmail());
        assertEquals("testuser", userAccount.getUsername());
        assertEquals(AccountStatus.ACTIVE, userAccount.getStatus());
        assertNotNull(userAccount.getCreatedAt());
        assertNull(userAccount.getLastLoginTime());
    }

    @Test
    @DisplayName("Should throw exception when creating user with invalid email")
    void shouldThrowExceptionWhenCreatingUserWithInvalidEmail() {
        // Given
        UserId userId = new UserId("user-123");
        RoleName roleName = new RoleName("EMPLOYEE");

        // When & Then
        assertThrows(DomainException.class, () -> {
            new Email("invalid-email");
        });
    }

    @Test
    @DisplayName("Should throw exception when creating user with null required fields")
    void shouldThrowExceptionWhenCreatingUserWithNullRequiredFields() {
        // Given
        Email email = new Email("test@company.com");
        RoleName roleName = new RoleName("EMPLOYEE");

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            UserAccount.create(null, email, "testuser", roleName);
        });

        assertThrows(IllegalArgumentException.class, () -> {
            UserAccount.create(new UserId("user-123"), null, "testuser", roleName);
        });

        assertThrows(IllegalArgumentException.class, () -> {
            UserAccount.create(new UserId("user-123"), email, null, roleName);
        });

        assertThrows(IllegalArgumentException.class, () -> {
            UserAccount.create(new UserId("user-123"), email, "testuser", null);
        });
    }

    @Test
    @DisplayName("Should deactivate user account successfully")
    void shouldDeactivateUserAccountSuccessfully() {
        // Given
        UserAccount userAccount = createTestUserAccount();
        assertEquals(AccountStatus.ACTIVE, userAccount.getStatus());

        // When
        userAccount.deactivate("Account no longer needed");

        // Then
        assertEquals(AccountStatus.INACTIVE, userAccount.getStatus());
        assertNotNull(userAccount.getDeactivatedAt());
    }

    @Test
    @DisplayName("Should reactivate deactivated user account")
    void shouldReactivateDeactivatedUserAccount() {
        // Given
        UserAccount userAccount = createTestUserAccount();
        userAccount.deactivate("Test deactivation");
        assertEquals(AccountStatus.INACTIVE, userAccount.getStatus());

        // When
        userAccount.activate();

        // Then
        assertEquals(AccountStatus.ACTIVE, userAccount.getStatus());
        assertNull(userAccount.getDeactivatedAt());
    }

    @Test
    @DisplayName("Should suspend user account with reason")
    void shouldSuspendUserAccountWithReason() {
        // Given
        UserAccount userAccount = createTestUserAccount();

        // When
        userAccount.suspend("Policy violation");

        // Then
        assertEquals(AccountStatus.SUSPENDED, userAccount.getStatus());
        assertNotNull(userAccount.getSuspendedAt());
    }

    @Test
    @DisplayName("Should update user role successfully")
    void shouldUpdateUserRoleSuccessfully() {
        // Given
        UserAccount userAccount = createTestUserAccount();
        RoleName newRole = new RoleName("SUPERVISOR");

        // When
        userAccount.updateRole(newRole);

        // Then
        assertEquals(newRole, userAccount.getRole().getRoleName());
    }

    @Test
    @DisplayName("Should record login activity")
    void shouldRecordLoginActivity() {
        // Given
        UserAccount userAccount = createTestUserAccount();
        assertNull(userAccount.getLastLoginTime());

        // When
        userAccount.recordLogin();

        // Then
        assertNotNull(userAccount.getLastLoginTime());
        assertTrue(userAccount.getLoginCount() > 0);
    }

    @Test
    @DisplayName("Should add permission to user role")
    void shouldAddPermissionToUserRole() {
        // Given
        UserAccount userAccount = createTestUserAccount();
        Permission newPermission = new Permission("READ_REPORTS", "Can read performance reports");

        // When
        userAccount.getRole().addPermission(newPermission);

        // Then
        assertTrue(userAccount.getRole().hasPermission("READ_REPORTS"));
    }

    @Test
    @DisplayName("Should remove permission from user role")
    void shouldRemovePermissionFromUserRole() {
        // Given
        UserAccount userAccount = createTestUserAccount();
        Permission permission = new Permission("READ_REPORTS", "Can read performance reports");
        userAccount.getRole().addPermission(permission);
        assertTrue(userAccount.getRole().hasPermission("READ_REPORTS"));

        // When
        userAccount.getRole().removePermission("READ_REPORTS");

        // Then
        assertFalse(userAccount.getRole().hasPermission("READ_REPORTS"));
    }

    @Test
    @DisplayName("Should validate business rules for user account operations")
    void shouldValidateBusinessRulesForUserAccountOperations() {
        // Given
        UserAccount userAccount = createTestUserAccount();

        // Test: Cannot deactivate already inactive account
        userAccount.deactivate("Test");
        assertThrows(DomainException.class, () -> {
            userAccount.deactivate("Already inactive");
        });

        // Test: Cannot activate already active account
        userAccount.activate();
        assertThrows(DomainException.class, () -> {
            userAccount.activate();
        });

        // Test: Cannot suspend inactive account
        userAccount.deactivate("Test");
        assertThrows(DomainException.class, () -> {
            userAccount.suspend("Cannot suspend inactive");
        });
    }

    @Test
    @DisplayName("Should track user activity log entries")
    void shouldTrackUserActivityLogEntries() {
        // Given
        UserAccount userAccount = createTestUserAccount();

        // When
        userAccount.recordActivity("LOGIN", "User logged in successfully");
        userAccount.recordActivity("VIEW_REPORT", "Viewed performance report");
        userAccount.recordActivity("LOGOUT", "User logged out");

        // Then
        assertEquals(3, userAccount.getActivityLogs().size());
        assertEquals("LOGIN", userAccount.getActivityLogs().get(0).getAction());
        assertEquals("VIEW_REPORT", userAccount.getActivityLogs().get(1).getAction());
        assertEquals("LOGOUT", userAccount.getActivityLogs().get(2).getAction());
    }

    @Test
    @DisplayName("Should validate email uniqueness constraint")
    void shouldValidateEmailUniquenessConstraint() {
        // Given
        Email email = new Email("unique@company.com");

        // When
        UserAccount user1 = UserAccount.create(
            new UserId("user-1"), 
            email, 
            "user1", 
            new RoleName("EMPLOYEE")
        );

        // Then - Creating another user with same email should be handled by repository layer
        // Domain model should allow creation but repository should enforce uniqueness
        UserAccount user2 = UserAccount.create(
            new UserId("user-2"), 
            email, 
            "user2", 
            new RoleName("EMPLOYEE")
        );

        assertNotNull(user1);
        assertNotNull(user2);
        assertEquals(email, user1.getEmail());
        assertEquals(email, user2.getEmail());
        // Repository layer should prevent saving duplicate emails
    }

    @Test
    @DisplayName("Should handle role-based permission validation")
    void shouldHandleRoleBasedPermissionValidation() {
        // Given
        UserAccount adminUser = createUserWithRole("ADMIN");
        UserAccount employeeUser = createUserWithRole("EMPLOYEE");

        // Setup admin permissions
        adminUser.getRole().addPermission(new Permission("MANAGE_USERS", "Can manage user accounts"));
        adminUser.getRole().addPermission(new Permission("VIEW_ALL_REPORTS", "Can view all reports"));

        // Setup employee permissions
        employeeUser.getRole().addPermission(new Permission("VIEW_OWN_REPORTS", "Can view own reports"));

        // Then
        assertTrue(adminUser.getRole().hasPermission("MANAGE_USERS"));
        assertTrue(adminUser.getRole().hasPermission("VIEW_ALL_REPORTS"));
        assertFalse(adminUser.getRole().hasPermission("NONEXISTENT_PERMISSION"));

        assertFalse(employeeUser.getRole().hasPermission("MANAGE_USERS"));
        assertFalse(employeeUser.getRole().hasPermission("VIEW_ALL_REPORTS"));
        assertTrue(employeeUser.getRole().hasPermission("VIEW_OWN_REPORTS"));
    }

    @Test
    @DisplayName("Should update username with validation")
    void shouldUpdateUsernameWithValidation() {
        // Given
        UserAccount userAccount = createTestUserAccount();
        String originalUsername = userAccount.getUsername();

        // When
        userAccount.updateUsername("new_username");

        // Then
        assertEquals("new_username", userAccount.getUsername());
        assertNotEquals(originalUsername, userAccount.getUsername());
    }

    @Test
    @DisplayName("Should throw exception for invalid username")
    void shouldThrowExceptionForInvalidUsername() {
        // Given
        UserAccount userAccount = createTestUserAccount();

        // When & Then
        assertThrows(DomainException.class, () -> {
            userAccount.updateUsername("");
        });

        assertThrows(DomainException.class, () -> {
            userAccount.updateUsername(null);
        });

        assertThrows(DomainException.class, () -> {
            userAccount.updateUsername("a"); // Too short
        });

        assertThrows(DomainException.class, () -> {
            userAccount.updateUsername("this_username_is_way_too_long_and_exceeds_maximum_length_limit");
        });
    }

    private UserAccount createTestUserAccount() {
        return UserAccount.create(
            new UserId("test-user-123"),
            new Email("test@company.com"),
            "testuser",
            new RoleName("EMPLOYEE")
        );
    }

    private UserAccount createUserWithRole(String roleName) {
        return UserAccount.create(
            new UserId("user-" + roleName.toLowerCase()),
            new Email(roleName.toLowerCase() + "@company.com"),
            roleName.toLowerCase() + "_user",
            new RoleName(roleName)
        );
    }
}