package com.company.dataanalytics.infrastructure.config;

import com.company.dataanalytics.domain.aggregates.user.Role;
import com.company.dataanalytics.domain.aggregates.user.UserAccount;
import com.company.dataanalytics.domain.repositories.IUserAccountRepository;
import com.company.dataanalytics.domain.valueobjects.Email;
import com.company.dataanalytics.domain.valueobjects.RoleName;
import com.company.dataanalytics.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds initial data for the data analytics service
 */
@Component
@Profile("!test") // Don't run in test profile
@Order(2) // Run after table initialization
public class DataAnalyticsDataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataAnalyticsDataSeeder.class);

    private final IUserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.initialize-data:true}")
    private boolean initializeData;

    public DataAnalyticsDataSeeder(IUserAccountRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!initializeData) {
            logger.info("Data initialization disabled");
            return;
        }

        try {
            seedUsers();
            logger.info("Data seeding completed successfully");
        } catch (Exception e) {
            logger.error("Failed to seed data: {}", e.getMessage(), e);
        }
    }

    private void seedUsers() {
        // Create admin user
        if (!userRepository.existsByEmail(Email.of("admin@company.com"))) {
            Role adminRole = Role.create(RoleName.of("ADMIN"), "System Administrator");
            UserId systemUserId = UserId.generate();
            
            // Hash the password
            String hashedPassword = passwordEncoder.encode("admin123");
            
            UserAccount adminUser = UserAccount.create(
                    Email.of("admin@company.com"),
                    "admin",
                    hashedPassword,
                    adminRole,
                    systemUserId
            );
            adminUser.activate(systemUserId);
            
            userRepository.save(adminUser);
            logger.info("Created admin user: admin@company.com");
        }

        // Create analyst user
        if (!userRepository.existsByEmail(Email.of("analyst@company.com"))) {
            Role analystRole = Role.create(RoleName.of("ANALYST"), "Data Analyst");
            UserId systemUserId = UserId.generate();
            
            // Hash the password
            String hashedPassword = passwordEncoder.encode("analyst123");
            
            UserAccount analystUser = UserAccount.create(
                    Email.of("analyst@company.com"),
                    "analyst",
                    hashedPassword,
                    analystRole,
                    systemUserId
            );
            analystUser.activate(systemUserId);
            
            userRepository.save(analystUser);
            logger.info("Created analyst user: analyst@company.com");
        }

        // Create manager user
        if (!userRepository.existsByEmail(Email.of("manager@company.com"))) {
            Role managerRole = Role.create(RoleName.of("MANAGER"), "Performance Manager");
            UserId systemUserId = UserId.generate();
            
            // Hash the password
            String hashedPassword = passwordEncoder.encode("manager123");
            
            UserAccount managerUser = UserAccount.create(
                    Email.of("manager@company.com"),
                    "manager",
                    hashedPassword,
                    managerRole,
                    systemUserId
            );
            managerUser.activate(systemUserId);
            
            userRepository.save(managerUser);
            logger.info("Created manager user: manager@company.com");
        }
    }
}