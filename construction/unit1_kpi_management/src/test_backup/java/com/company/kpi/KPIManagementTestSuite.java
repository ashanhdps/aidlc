package com.company.kpi;

import com.company.kpi.controller.KPIDefinitionControllerTest;
import com.company.kpi.domain.KPIDefinitionAggregateTest;
import com.company.kpi.integration.KPIManagementIntegrationTest;
import com.company.kpi.service.KPIDefinitionServiceTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;

/**
 * Test Suite for KPI Management Service
 * Runs all test categories in organized sequence
 */
@Suite
@SelectClasses({
    // Domain Layer Tests
    KPIDefinitionAggregateTest.class,
    
    // Service Layer Tests
    KPIDefinitionServiceTest.class,
    
    // Controller Layer Tests
    KPIDefinitionControllerTest.class,
    
    // Integration Tests
    KPIManagementIntegrationTest.class
})
@DisplayName("KPI Management Service Test Suite")
public class KPIManagementTestSuite {
    
    // Test suite configuration
    // This class serves as an entry point for running all tests
    // Individual test classes can also be run independently
    
    /*
     * Test Execution Order:
     * 1. Domain Layer Tests - Test business logic and domain rules
     * 2. Service Layer Tests - Test application services and business operations
     * 3. Controller Layer Tests - Test REST API endpoints and HTTP handling
     * 4. Integration Tests - Test complete workflows and system integration
     */
}