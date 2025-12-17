package com.company.dataanalytics.api.controllers;

import com.company.dataanalytics.api.dto.request.CreateReportTemplateRequest;
import com.company.dataanalytics.api.dto.request.GenerateReportRequest;
import com.company.dataanalytics.api.dto.response.ReportResponse;
import com.company.dataanalytics.api.dto.response.ReportTemplateResponse;
import com.company.dataanalytics.api.mappers.ReportMapper;
import com.company.dataanalytics.application.services.ReportApplicationService;
import com.company.dataanalytics.domain.aggregates.report.Report;
import com.company.dataanalytics.domain.aggregates.report.ReportTemplate;
import com.company.dataanalytics.domain.valueobjects.ReportId;
import com.company.dataanalytics.domain.valueobjects.TemplateId;
import com.company.dataanalytics.domain.valueobjects.UserId;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

/**
 * REST controller for report management operations
 */
@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "*")
public class ReportController {
    
    private final ReportApplicationService reportApplicationService;
    private final ReportMapper reportMapper;
    
    public ReportController(ReportApplicationService reportApplicationService, ReportMapper reportMapper) {
        this.reportApplicationService = reportApplicationService;
        this.reportMapper = reportMapper;
    }
    
    /**
     * Generate a new report
     */
    @PostMapping("/generate")
    public ResponseEntity<ReportResponse> generateReport(@Valid @RequestBody GenerateReportRequest request) {
        try {
            UserId generatedBy = UserId.generate(); // In real implementation, get from JWT token
            
            ReportId reportId;
            
            if (request.getTemplateId() != null && !request.getTemplateId().trim().isEmpty()) {
                // Generate from template
                TemplateId templateId = TemplateId.of(request.getTemplateId());
                reportId = reportApplicationService.generateReportFromTemplate(
                    templateId,
                    request.getReportName(),
                    request.getFormat(),
                    generatedBy,
                    request.getParameters()
                );
            } else {
                // Generate ad-hoc report
                reportId = reportApplicationService.generateAdHocReport(
                    request.getReportName(),
                    request.getFormat(),
                    generatedBy,
                    request.getParameters()
                );
            }
            
            Report report = reportApplicationService.getReportById(reportId);
            ReportResponse response = reportMapper.toResponse(report);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get report by ID
     */
    @GetMapping("/{reportId}")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable String reportId) {
        try {
            ReportId reportIdObj = ReportId.of(reportId);
            Report report = reportApplicationService.getReportById(reportIdObj);
            ReportResponse response = reportMapper.toResponse(report);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get report status
     */
    @GetMapping("/{reportId}/status")
    public ResponseEntity<Map<String, Object>> getReportStatus(@PathVariable String reportId) {
        try {
            ReportId reportIdObj = ReportId.of(reportId);
            Report report = reportApplicationService.getReportById(reportIdObj);
            
            Map<String, Object> status = Map.of(
                "reportId", report.getId().toString(),
                "status", report.getGenerationStatus().getValue(),
                "availableForDownload", report.isAvailableForDownload(),
                "filePath", report.getFilePath() != null ? report.getFilePath() : "",
                "errorMessage", report.getErrorMessage() != null ? report.getErrorMessage() : ""
            );
            
            return ResponseEntity.ok(status);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get reports with filters
     */
    @GetMapping
    public ResponseEntity<List<ReportResponse>> getReports(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<Report> reports;
        
        if (userId != null && !userId.trim().isEmpty()) {
            UserId userIdObj = UserId.of(userId);
            reports = reportApplicationService.getReportsByUser(userIdObj);
        } else if (status != null && !status.trim().isEmpty()) {
            reports = reportApplicationService.getReportsByStatus(status);
        } else if (startDate != null && endDate != null) {
            Instant startInstant = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
            Instant endInstant = endDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            reports = reportApplicationService.getReportsByDateRange(startInstant, endInstant);
        } else {
            // Get pending reports by default
            reports = reportApplicationService.getPendingReports();
        }
        
        List<ReportResponse> response = reportMapper.toResponseList(reports);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get failed reports for retry
     */
    @GetMapping("/failed")
    public ResponseEntity<List<ReportResponse>> getFailedReports() {
        List<Report> reports = reportApplicationService.getFailedReports();
        List<ReportResponse> response = reportMapper.toResponseList(reports);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Start report generation (for background processing)
     */
    @PostMapping("/{reportId}/start")
    public ResponseEntity<Void> startReportGeneration(@PathVariable String reportId) {
        try {
            ReportId reportIdObj = ReportId.of(reportId);
            reportApplicationService.startReportGeneration(reportIdObj);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Complete report generation (for background processing)
     */
    @PostMapping("/{reportId}/complete")
    public ResponseEntity<Void> completeReportGeneration(@PathVariable String reportId,
                                                        @RequestParam String filePath) {
        try {
            ReportId reportIdObj = ReportId.of(reportId);
            reportApplicationService.completeReportGeneration(reportIdObj, filePath);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Fail report generation (for background processing)
     */
    @PostMapping("/{reportId}/fail")
    public ResponseEntity<Void> failReportGeneration(@PathVariable String reportId,
                                                    @RequestParam String errorMessage) {
        try {
            ReportId reportIdObj = ReportId.of(reportId);
            reportApplicationService.failReportGeneration(reportIdObj, errorMessage);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Cancel report generation
     */
    @PostMapping("/{reportId}/cancel")
    public ResponseEntity<Void> cancelReportGeneration(@PathVariable String reportId) {
        try {
            ReportId reportIdObj = ReportId.of(reportId);
            reportApplicationService.cancelReportGeneration(reportIdObj);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all report templates
     */
    @GetMapping("/templates")
    public ResponseEntity<List<ReportTemplateResponse>> getReportTemplates(
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        
        List<ReportTemplate> templates;
        
        if (activeOnly) {
            templates = reportApplicationService.getActiveTemplates();
        } else {
            // For demo, return active templates only
            templates = reportApplicationService.getActiveTemplates();
        }
        
        List<ReportTemplateResponse> response = reportMapper.toTemplateResponseList(templates);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Create report template
     */
    @PostMapping("/templates")
    public ResponseEntity<ReportTemplateResponse> createReportTemplate(@Valid @RequestBody CreateReportTemplateRequest request) {
        try {
            UserId createdBy = UserId.generate(); // In real implementation, get from JWT token
            
            TemplateId templateId = reportApplicationService.createReportTemplate(
                request.getTemplateName(),
                request.getDescription(),
                request.getConfiguration(),
                createdBy
            );
            
            ReportTemplate template = reportApplicationService.getTemplateById(templateId);
            ReportTemplateResponse response = reportMapper.toTemplateResponse(template);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get template by ID
     */
    @GetMapping("/templates/{templateId}")
    public ResponseEntity<ReportTemplateResponse> getTemplateById(@PathVariable String templateId) {
        try {
            TemplateId templateIdObj = TemplateId.of(templateId);
            ReportTemplate template = reportApplicationService.getTemplateById(templateIdObj);
            ReportTemplateResponse response = reportMapper.toTemplateResponse(template);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Estimate report generation time
     */
    @PostMapping("/estimate-time")
    public ResponseEntity<Map<String, Object>> estimateGenerationTime(@RequestBody Map<String, Object> request) {
        try {
            String templateIdStr = (String) request.get("templateId");
            @SuppressWarnings("unchecked")
            Map<String, Object> parameters = (Map<String, Object>) request.get("parameters");
            
            if (templateIdStr != null && !templateIdStr.trim().isEmpty()) {
                TemplateId templateId = TemplateId.of(templateIdStr);
                long estimatedMinutes = reportApplicationService.estimateGenerationTime(templateId, parameters);
                
                Map<String, Object> response = Map.of(
                    "estimatedMinutes", estimatedMinutes,
                    "estimatedSeconds", estimatedMinutes * 60
                );
                
                return ResponseEntity.ok(response);
            } else {
                // Default estimation for ad-hoc reports
                Map<String, Object> response = Map.of(
                    "estimatedMinutes", 1,
                    "estimatedSeconds", 60
                );
                
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}