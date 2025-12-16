package com.company.dataanalytics.infrastructure.config;

import com.company.dataanalytics.application.services.PerformanceDataApplicationService;
import com.company.dataanalytics.application.services.ReportApplicationService;
import com.company.dataanalytics.application.services.UserApplicationService;
import com.company.dataanalytics.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Map;

/**
 * Data seeder to populate demo data on application startup
 */
@Component
public class DataSeeder implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);
    
    private final UserApplicationService userService;
    private final ReportApplicationService reportService;
    private final PerformanceDataApplicationService performanceService;
    
    public DataSeeder(UserApplicationService userService,
                     ReportApplicationService reportService,
                     PerformanceDataApplicationService performanceService) {
        this.userService = userService;
        this.reportService = reportService;
        this.performanceService = performanceService;
    }
    
    @Override
    public void run(String... args) throws Exception {
        logger.info("Starting data seeding for demo...");
        
        try {
            seedUsers();
            seedReportTemplates();
            seedPerformanceData();
            seedSampleReports();
            
            logger.info("Demo data seeding completed successfully!");
        } catch (Exception e) {
            logger.error("Error during data seeding: {}", e.getMessage(), e);
        }
    }
    
    private void seedUsers() {
        logger.info("Seeding demo users...");
        
        // Create system admin user first
        UserId adminId = userService.createUser("admin@company.com", "admin", "ADMIN", null);
        logger.info("Created admin user: {}", adminId);
        
        // Create HR user
        UserId hrId = userService.createUser("hr@company.com", "hr_manager", "HR", adminId);
        userService.activateUser(hrId, adminId);
        logger.info("Created HR user: {}", hrId);
        
        // Create supervisor user
        UserId supervisorId = userService.createUser("supervisor@company.com", "team_lead", "SUPERVISOR", adminId);
        userService.activateUser(supervisorId, adminId);
        logger.info("Created supervisor user: {}", supervisorId);
        
        // Create employee users
        UserId emp1Id = userService.createUser("john.doe@company.com", "john_doe", "EMPLOYEE", adminId);
        userService.activateUser(emp1Id, adminId);
        
        UserId emp2Id = userService.createUser("jane.smith@company.com", "jane_smith", "EMPLOYEE", adminId);
        userService.activateUser(emp2Id, adminId);
        
        UserId emp3Id = userService.createUser("bob.wilson@company.com", "bob_wilson", "EMPLOYEE", adminId);
        userService.activateUser(emp3Id, adminId);
        
        logger.info("Created {} demo users", 6);
    }
    
    private void seedReportTemplates() {
        logger.info("Seeding report templates...");
        
        UserId adminId = userService.getUserByEmail("admin@company.com").get().getId();
        
        // Employee Performance Report Template
        Map<String, Object> perfConfig = Map.of(
            "supportedFormats", java.util.List.of("PDF", "CSV"),
            "estimatedMinutes", 3,
            "requiredParameters", Map.of(
                "employeeId", "string",
                "startDate", "date",
                "endDate", "date"
            )
        );
        
        reportService.createReportTemplate(
            "Employee Performance Report",
            "Comprehensive performance report for individual employees",
            perfConfig,
            adminId
        );
        
        // Team Summary Report Template
        Map<String, Object> teamConfig = Map.of(
            "supportedFormats", java.util.List.of("PDF", "EXCEL"),
            "estimatedMinutes", 5,
            "requiredParameters", Map.of(
                "supervisorId", "string",
                "startDate", "date",
                "endDate", "date"
            )
        );
        
        reportService.createReportTemplate(
            "Team Performance Summary",
            "Team-level performance analytics and insights",
            teamConfig,
            adminId
        );
        
        logger.info("Created {} report templates", 2);
    }
    
    private void seedPerformanceData() {
        logger.info("Seeding performance data...");
        
        // Sample KPI IDs
        String salesKpiId = "kpi-sales-001";
        String qualityKpiId = "kpi-quality-002";
        String efficiencyKpiId = "kpi-efficiency-003";
        
        // Sample Employee IDs (using email as identifier for demo)
        String[] employeeIds = {"john.doe@company.com", "jane.smith@company.com", "bob.wilson@company.com"};
        
        // Generate sample data for the last 30 days
        LocalDate startDate = LocalDate.now().minusDays(30);
        LocalDate endDate = LocalDate.now();
        
        int dataPointsCreated = 0;
        
        for (String employeeId : employeeIds) {
            LocalDate currentDate = startDate;
            
            while (!currentDate.isAfter(endDate)) {
                // Sales KPI data (random values between 80-120)
                double salesValue = 80 + Math.random() * 40;
                performanceService.recordPerformanceData(employeeId, salesKpiId, salesValue, "points", currentDate);
                
                // Quality KPI data (random values between 85-100)
                double qualityValue = 85 + Math.random() * 15;
                performanceService.recordPerformanceData(employeeId, qualityKpiId, qualityValue, "percentage", currentDate);
                
                // Efficiency KPI data (random values between 70-110)
                double efficiencyValue = 70 + Math.random() * 40;
                performanceService.recordPerformanceData(employeeId, efficiencyKpiId, efficiencyValue, "tasks/day", currentDate);
                
                dataPointsCreated += 3;
                currentDate = currentDate.plusDays(1);
            }
        }
        
        logger.info("Created {} performance data points", dataPointsCreated);
    }
    
    private void seedSampleReports() {
        logger.info("Seeding sample reports...");
        
        UserId adminId = userService.getUserByEmail("admin@company.com").get().getId();
        
        // Generate a sample employee report
        Map<String, Object> reportParams = Map.of(
            "employeeId", "john.doe@company.com",
            "startDate", LocalDate.now().minusDays(7).toString(),
            "endDate", LocalDate.now().toString()
        );
        
        reportService.generateAdHocReport(
            "Weekly Performance Report - John Doe",
            "PDF",
            adminId,
            reportParams
        );
        
        // Generate a sample team report
        Map<String, Object> teamParams = Map.of(
            "supervisorId", "supervisor@company.com",
            "startDate", LocalDate.now().minusDays(30).toString(),
            "endDate", LocalDate.now().toString()
        );
        
        reportService.generateAdHocReport(
            "Monthly Team Performance Summary",
            "CSV",
            adminId,
            teamParams
        );
        
        logger.info("Created {} sample reports", 2);
    }
}