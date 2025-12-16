package com.company.performance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application for Performance Management Service
 * Unit 2: Performance Management Service (Workshop Version)
 * 
 * This is a simplified implementation using in-memory storage for demonstration purposes.
 * Covers User Stories: US-016, US-017, US-019, US-020
 */
@SpringBootApplication
public class PerformanceManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(PerformanceManagementApplication.class, args);
    }
}
