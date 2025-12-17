package com.company.dataanalytics.application.services;

import com.company.dataanalytics.domain.aggregates.report.Report;
import com.company.dataanalytics.domain.aggregates.report.ReportTemplate;
import com.company.dataanalytics.domain.repositories.IReportRepository;
import com.company.dataanalytics.domain.repositories.IReportTemplateRepository;
import com.company.dataanalytics.domain.services.ReportGenerationService;
import com.company.dataanalytics.domain.shared.DomainEventPublisher;
import com.company.dataanalytics.domain.valueobjects.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Application service for report management use cases
 */
@Service
@Transactional
public class ReportApplicationService {
    
    private final IReportRepository reportRepository;
    private final IReportTemplateRepository templateRepository;
    private final ReportGenerationService reportGenerationService;
    private final DomainEventPublisher eventPublisher;
    
    public ReportApplicationService(IReportRepository reportRepository,
                                  IReportTemplateRepository templateRepository,
                                  ReportGenerationService reportGenerationService,
                                  DomainEventPublisher eventPublisher) {
        this.reportRepository = reportRepository;
        this.templateRepository = templateRepository;
        this.reportGenerationService = reportGenerationService;
        this.eventPublisher = eventPublisher;
    }
    
    /**
     * Generate report from template
     */
    public ReportId generateReportFromTemplate(TemplateId templateId, String reportName, 
                                             String format, UserId generatedBy, 
                                             Map<String, Object> parameters) {
        // Get template
        ReportTemplate template = getTemplateById(templateId);
        
        // Validate parameters
        if (!reportGenerationService.validateReportParameters(template, parameters)) {
            throw new IllegalArgumentException("Invalid report parameters for template");
        }
        
        // Check format support
        ReportFormat reportFormat = ReportFormat.of(format);
        if (!reportGenerationService.isFormatSupported(template, reportFormat)) {
            throw new IllegalArgumentException("Format " + format + " not supported by template");
        }
        
        // Generate report through domain service
        Report report = reportGenerationService.generateFromTemplate(
            template, reportName, reportFormat, generatedBy, parameters);
        
        // Save report
        reportRepository.save(report);
        
        // Publish domain events
        eventPublisher.publishAll(report.getDomainEvents());
        report.clearDomainEvents();
        
        return report.getId();
    }
    
    /**
     * Generate ad-hoc report
     */
    public ReportId generateAdHocReport(String reportName, String format, 
                                      UserId generatedBy, Map<String, Object> parameters) {
        ReportFormat reportFormat = ReportFormat.of(format);
        
        // Generate report through domain service
        Report report = reportGenerationService.generateAdHocReport(
            reportName, reportFormat, generatedBy, parameters);
        
        // Save report
        reportRepository.save(report);
        
        // Publish domain events
        eventPublisher.publishAll(report.getDomainEvents());
        report.clearDomainEvents();
        
        return report.getId();
    }
    
    /**
     * Start report generation process
     */
    public void startReportGeneration(ReportId reportId) {
        Report report = getReportById(reportId);
        report.startGeneration();
        
        reportRepository.save(report);
    }
    
    /**
     * Complete report generation
     */
    public void completeReportGeneration(ReportId reportId, String filePath) {
        Report report = getReportById(reportId);
        report.completeGeneration(filePath);
        
        reportRepository.save(report);
        eventPublisher.publishAll(report.getDomainEvents());
        report.clearDomainEvents();
    }
    
    /**
     * Fail report generation
     */
    public void failReportGeneration(ReportId reportId, String errorMessage) {
        Report report = getReportById(reportId);
        report.failGeneration(errorMessage);
        
        reportRepository.save(report);
        eventPublisher.publishAll(report.getDomainEvents());
        report.clearDomainEvents();
    }
    
    /**
     * Cancel report generation
     */
    public void cancelReportGeneration(ReportId reportId) {
        Report report = getReportById(reportId);
        report.cancelGeneration();
        
        reportRepository.save(report);
    }
    
    /**
     * Create report template
     */
    public TemplateId createReportTemplate(String templateName, String description,
                                         Map<String, Object> configuration, UserId createdBy) {
        // Check template name uniqueness
        if (templateRepository.existsByName(templateName)) {
            throw new IllegalArgumentException("Template name already exists: " + templateName);
        }
        
        // Create template
        ReportTemplate template = ReportTemplate.create(templateName, description, configuration, createdBy);
        
        // Save template
        templateRepository.save(template);
        
        return template.getId();
    }
    
    /**
     * Update report template
     */
    public void updateReportTemplate(TemplateId templateId, String newName, String newDescription,
                                   Map<String, Object> newConfiguration) {
        ReportTemplate template = getTemplateById(templateId);
        
        // Check name uniqueness if changing name
        if (newName != null && !template.getTemplateName().equals(newName)) {
            if (templateRepository.existsByName(newName)) {
                throw new IllegalArgumentException("Template name already exists: " + newName);
            }
            template.updateName(newName);
        }
        
        if (newDescription != null) {
            template.updateDescription(newDescription);
        }
        
        if (newConfiguration != null) {
            template.updateConfiguration(newConfiguration);
        }
        
        templateRepository.save(template);
    }
    
    /**
     * Activate/Deactivate template
     */
    public void setTemplateActive(TemplateId templateId, boolean active) {
        ReportTemplate template = getTemplateById(templateId);
        
        if (active) {
            template.activate();
        } else {
            template.deactivate();
        }
        
        templateRepository.save(template);
    }
    
    /**
     * Get report by ID
     */
    @Transactional(readOnly = true)
    public Report getReportById(ReportId reportId) {
        return reportRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportId));
    }
    
    /**
     * Get template by ID
     */
    @Transactional(readOnly = true)
    public ReportTemplate getTemplateById(TemplateId templateId) {
        return templateRepository.findById(templateId)
            .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));
    }
    
    /**
     * Get reports by user
     */
    @Transactional(readOnly = true)
    public List<Report> getReportsByUser(UserId userId) {
        return reportRepository.findByGeneratedBy(userId);
    }
    
    /**
     * Get reports by status
     */
    @Transactional(readOnly = true)
    public List<Report> getReportsByStatus(String status) {
        return reportRepository.findByStatus(GenerationStatus.of(status));
    }
    
    /**
     * Get reports by date range
     */
    @Transactional(readOnly = true)
    public List<Report> getReportsByDateRange(Instant startDate, Instant endDate) {
        return reportRepository.findByGenerationTimestampBetween(startDate, endDate);
    }
    
    /**
     * Get all active templates
     */
    @Transactional(readOnly = true)
    public List<ReportTemplate> getActiveTemplates() {
        return templateRepository.findActiveTemplates();
    }
    
    /**
     * Get templates by user
     */
    @Transactional(readOnly = true)
    public List<ReportTemplate> getTemplatesByUser(UserId userId) {
        return templateRepository.findByCreatedBy(userId);
    }
    
    /**
     * Get pending reports for processing
     */
    @Transactional(readOnly = true)
    public List<Report> getPendingReports() {
        return reportRepository.findPendingReports();
    }
    
    /**
     * Get failed reports for retry
     */
    @Transactional(readOnly = true)
    public List<Report> getFailedReports() {
        return reportRepository.findFailedReports();
    }
    
    /**
     * Estimate report generation time
     */
    @Transactional(readOnly = true)
    public long estimateGenerationTime(TemplateId templateId, Map<String, Object> parameters) {
        ReportTemplate template = getTemplateById(templateId);
        return reportGenerationService.estimateGenerationTimeMinutes(template, parameters);
    }
}