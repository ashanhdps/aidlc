package com.company.kpi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main application class for KPI Management Service
 * 
 * This Spring Boot application implements a Domain-Driven Design (DDD) approach
 * for managing Key Performance Indicators with hexagonal architecture.
 */
@SpringBootApplication
@EnableTransactionManagement
@EnableAsync
@ConfigurationPropertiesScan
public class KpiManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(KpiManagementApplication.class, args);
    }
}