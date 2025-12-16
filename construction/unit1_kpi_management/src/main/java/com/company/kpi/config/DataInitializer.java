package com.company.kpi.config;

import com.company.kpi.model.*;
import com.company.kpi.repository.interfaces.KPIDefinitionRepositoryInterface;
import com.company.kpi.repository.KPIAssignmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Initializes demo data for the KPI Management Service
 */
@Component
public class DataInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Autowired
    private KPIDefinitionRepositoryInterface kpiDefinitionRepository;
    
    @Autowired
    private KPIAssignmentRepository kpiAssignmentRepository;
    
    @Value("${app.demo.initialize-data:true}")
    private boolean initializeData;
    
    @Override
    public void run(String... args) throws Exception {
        if (initializeData) {
            logger.info("Initializing demo data...");
            initializeDemoKPIs();
            initializeDemoAssignments();
            logger.info("Demo data initialization completed");
        }
    }
    
    private void initializeDemoKPIs() {
        // Check if data already exists
        if (kpiDefinitionRepository.count() > 0) {
            logger.info("Demo data already exists, skipping initialization");
            return;
        }
        
        // Create sample KPI definitions
        createKPI("Monthly Sales Revenue", "Total sales revenue generated per month", 
                 KPICategory.SALES, MeasurementType.CURRENCY, 
                 new BigDecimal("100000"), "USD", ComparisonType.GREATER_THAN_OR_EQUAL,
                 new BigDecimal("30"), "salesforce-api");
        
        createKPI("Customer Satisfaction Score", "Average customer satisfaction rating", 
                 KPICategory.CUSTOMER_SERVICE, MeasurementType.RATING, 
                 new BigDecimal("4.5"), "stars", ComparisonType.GREATER_THAN_OR_EQUAL,
                 new BigDecimal("25"), "survey-api");
        
        createKPI("Employee Productivity", "Tasks completed per employee per day", 
                 KPICategory.PRODUCTIVITY, MeasurementType.COUNT, 
                 new BigDecimal("8"), "tasks", ComparisonType.GREATER_THAN_OR_EQUAL,
                 new BigDecimal("20"), "project-management-api");
        
        createKPI("Marketing ROI", "Return on investment for marketing campaigns", 
                 KPICategory.MARKETING, MeasurementType.PERCENTAGE, 
                 new BigDecimal("15"), "%", ComparisonType.GREATER_THAN_OR_EQUAL,
                 new BigDecimal("15"), "marketing-analytics-api");
        
        createKPI("Quality Score", "Product quality rating based on defects", 
                 KPICategory.QUALITY, MeasurementType.PERCENTAGE, 
                 new BigDecimal("95"), "%", ComparisonType.GREATER_THAN_OR_EQUAL,
                 new BigDecimal("10"), "quality-management-system");
        
        logger.info("Created {} sample KPI definitions", 5);
    }
    
    private void createKPI(String name, String description, KPICategory category, 
                          MeasurementType measurementType, BigDecimal targetValue, 
                          String targetUnit, ComparisonType comparisonType,
                          BigDecimal weightPercentage, String dataSource) {
        
        KPIDefinition kpi = new KPIDefinition(name, description, category, measurementType, "system");
        kpi.setId(UUID.randomUUID().toString());
        kpi.setDefaultTargetValue(targetValue);
        kpi.setDefaultTargetUnit(targetUnit);
        kpi.setDefaultTargetComparisonType(comparisonType);
        kpi.setDefaultWeightPercentage(weightPercentage);
        kpi.setDefaultWeightIsFlexible(true);
        kpi.setMeasurementFrequencyType("MONTHLY");
        kpi.setMeasurementFrequencyValue(1);
        kpi.setDataSource(dataSource);
        
        kpiDefinitionRepository.save(kpi);
        logger.debug("Created KPI: {}", name);
    }
    
    private void initializeDemoAssignments() {
        // Check if assignment data already exists
        if (kpiAssignmentRepository.count() > 0) {
            logger.info("Demo assignment data already exists, skipping initialization");
            return;
        }
        
        // Get all KPIs for assignment
        List<KPIDefinition> kpis = kpiDefinitionRepository.findAll();
        if (kpis.isEmpty()) {
            logger.warn("No KPIs found for creating demo assignments");
            return;
        }
        
        // Create sample employees and assign KPIs
        String[] employeeIds = {"emp-001", "emp-002", "emp-003", "emp-004", "emp-005"};
        
        for (String employeeId : employeeIds) {
            // Assign 2-3 KPIs to each employee
            for (int i = 0; i < Math.min(3, kpis.size()); i++) {
                KPIDefinition kpi = kpis.get(i);
                createKPIAssignment(employeeId, kpi);
            }
        }
        
        logger.info("Created demo KPI assignments for {} employees", employeeIds.length);
    }
    
    private void createKPIAssignment(String employeeId, KPIDefinition kpi) {
        KPIAssignment assignment = new KPIAssignment(employeeId, kpi.getId(), "system");
        assignment.setAssignmentId(UUID.randomUUID().toString());
        assignment.setCustomTargetValue(kpi.getDefaultTargetValue());
        assignment.setCustomTargetUnit(kpi.getDefaultTargetUnit());
        assignment.setCustomTargetComparisonType(kpi.getDefaultTargetComparisonType());
        assignment.setCustomWeightPercentage(kpi.getDefaultWeightPercentage());
        assignment.setCustomWeightIsFlexible(kpi.isDefaultWeightIsFlexible());
        assignment.setEffectiveDate(LocalDate.now());
        assignment.setStatus(AssignmentStatus.ACTIVE);
        
        kpiAssignmentRepository.save(assignment);
        logger.debug("Created assignment: {} -> {}", employeeId, kpi.getName());
    }
}