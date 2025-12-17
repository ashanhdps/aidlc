package com.company.dataanalytics.domain.services;

import com.company.dataanalytics.domain.aggregates.report.Report;
import com.company.dataanalytics.domain.aggregates.report.ReportTemplate;
import com.company.dataanalytics.domain.shared.DomainEventPublisher;
import com.company.dataanalytics.domain.valueobjects.ReportFormat;
import com.company.dataanalytics.domain.valueobjects.UserId;

import java.util.Map;

/**
 * Domain service for report generation operations
 */
public class ReportGenerationService {
    
    private final DomainEventPublisher eventPublisher;
    
    public ReportGenerationService(DomainEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }
    
    /**
     * Generate a report from a template
     */
    public Report generateFromTemplate(ReportTemplate template, String reportName, 
                                     ReportFormat format, UserId generatedBy, 
                                     Map<String, Object> parameters) {
        if (template == null) {
            throw new IllegalArgumentException("Template cannot be null");
        }
        if (!template.isActive()) {
            throw new IllegalArgumentException("Cannot generate report from inactive template");
        }
        
        // Validate template configuration
        validateTemplateConfiguration(template);
        
        // Create report with template
        Report report = Report.create(template.getId(), reportName, format, generatedBy, parameters);
        
        // Publish domain events
        eventPublisher.publishAll(report.getDomainEvents());
        
        return report;
    }
    
    /**
     * Generate a report without a template
     */
    public Report generateAdHocReport(String reportName, ReportFormat format, 
                                    UserId generatedBy, Map<String, Object> parameters) {
        // Create ad-hoc report
        Report report = Report.create(reportName, format, generatedBy);
        
        // Publish domain events
        eventPublisher.publishAll(report.getDomainEvents());
        
        return report;
    }
    
    /**
     * Validate report parameters against template requirements
     */
    public boolean validateReportParameters(ReportTemplate template, Map<String, Object> parameters) {
        if (template == null) {
            return false;
        }
        
        // Check required parameters from template configuration
        Map<String, Object> templateConfig = template.getConfiguration();
        
        if (templateConfig.containsKey("requiredParameters")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> requiredParams = (Map<String, Object>) templateConfig.get("requiredParameters");
            
            for (String requiredParam : requiredParams.keySet()) {
                if (!parameters.containsKey(requiredParam)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Check if a report format is supported by the template
     */
    public boolean isFormatSupported(ReportTemplate template, ReportFormat format) {
        if (template == null || format == null) {
            return false;
        }
        
        Map<String, Object> config = template.getConfiguration();
        if (config.containsKey("supportedFormats")) {
            @SuppressWarnings("unchecked")
            java.util.List<String> supportedFormats = (java.util.List<String>) config.get("supportedFormats");
            return supportedFormats.contains(format.getValue());
        }
        
        // If no specific formats configured, support all
        return true;
    }
    
    /**
     * Calculate estimated generation time based on template complexity
     */
    public long estimateGenerationTimeMinutes(ReportTemplate template, Map<String, Object> parameters) {
        if (template == null) {
            return 1; // Default 1 minute for ad-hoc reports
        }
        
        Map<String, Object> config = template.getConfiguration();
        
        // Base time from template configuration
        long baseTime = 2; // Default 2 minutes
        if (config.containsKey("estimatedMinutes")) {
            baseTime = ((Number) config.get("estimatedMinutes")).longValue();
        }
        
        // Adjust based on parameters (e.g., date range, number of employees)
        if (parameters != null) {
            if (parameters.containsKey("employeeCount")) {
                int employeeCount = ((Number) parameters.get("employeeCount")).intValue();
                baseTime += (employeeCount / 100); // Add 1 minute per 100 employees
            }
        }
        
        return Math.max(1, baseTime); // Minimum 1 minute
    }
    
    private void validateTemplateConfiguration(ReportTemplate template) {
        Map<String, Object> config = template.getConfiguration();
        
        // Validate required configuration properties
        if (config.isEmpty()) {
            throw new IllegalArgumentException("Template configuration cannot be empty");
        }
        
        // Additional validation logic can be added here
        // For example, checking for required configuration keys
    }
}