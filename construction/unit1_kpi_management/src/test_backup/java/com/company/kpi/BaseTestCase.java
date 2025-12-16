package com.company.kpi;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.transaction.annotation.Transactional;

/**
 * Base test case for all KPI Management Service tests
 * Provides common test configuration and utilities
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = TestApplication.class)
@ActiveProfiles("test")
@Transactional
public abstract class BaseTestCase {
    
    @BeforeEach
    void setUp() {
        // Common test setup
        cleanupTestData();
        initializeTestData();
    }
    
    /**
     * Clean up test data before each test
     */
    protected void cleanupTestData() {
        // Override in subclasses if needed
    }
    
    /**
     * Initialize test data before each test
     */
    protected void initializeTestData() {
        // Override in subclasses if needed
    }
    
    /**
     * Helper method to create test correlation ID
     */
    protected String createTestCorrelationId() {
        return "test-" + System.currentTimeMillis();
    }
}