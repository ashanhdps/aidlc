package com.company.dataanalytics.infrastructure;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.company.dataanalytics.domain.aggregates.user.Role;
import com.company.dataanalytics.domain.aggregates.user.UserAccount;
import com.company.dataanalytics.domain.repositories.IUserAccountRepository;
import com.company.dataanalytics.domain.valueobjects.Email;
import com.company.dataanalytics.domain.valueobjects.RoleName;
import com.company.dataanalytics.domain.valueobjects.UserId;

/**
 * Test to verify repository operations work correctly
 */
@SpringBootTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private IUserAccountRepository userRepository;

    @Test
    void testUserRepositoryOperations() {
        // Create a test user
        Role testRole = Role.create(RoleName.of("TEST_ROLE"), "Test Role");
        UserId createdBy = UserId.generate();
        
        UserAccount testUser = UserAccount.create(
                Email.of("test@example.com"),
                "testuser",
                testRole,
                createdBy
        );

        // Save the user
        assertDoesNotThrow(() -> userRepository.save(testUser));

        // Retrieve the user by email
        var retrievedUser = userRepository.findByEmail(Email.of("test@example.com"));
        assertTrue(retrievedUser.isPresent());
        assertEquals("testuser", retrievedUser.get().getUsername());

        // Retrieve the user by ID
        var userById = userRepository.findById(testUser.getId());
        assertTrue(userById.isPresent());
        assertEquals("testuser", userById.get().getUsername());

        // Check if email exists
        assertTrue(userRepository.existsByEmail(Email.of("test@example.com")));
        assertFalse(userRepository.existsByEmail(Email.of("nonexistent@example.com")));

        // Count users
        long count = userRepository.count();
        assertTrue(count > 0);
    }
}