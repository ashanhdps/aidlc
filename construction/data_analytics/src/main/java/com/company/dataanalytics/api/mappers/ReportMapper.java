package com.company.dataanalytics.api.mappers;

import com.company.dataanalytics.api.dto.response.ReportResponse;
import com.company.dataanalytics.api.dto.response.ReportTemplateResponse;
import com.company.dataanalytics.domain.aggregates.report.Report;
import com.company.dataanalytics.domain.aggregates.report.ReportTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for converting between Report domain objects and DTOs
 */
@Component
public class ReportMapper {
    
    /**
     * Convert Report domain object to ReportResponse DTO
     */
    public ReportResponse toResponse(Report report) {
        if (report == null) {
            return null;
        }
        
        return new ReportResponse(
            report.getId().toString(),
            report.getTemplateId() != null ? report.getTemplateId().toString() : null,
            report.getReportName(),
            report.getReportFormat().getValue(),
            report.getGenerationStatus().getValue(),
            report.getFilePath(),
            report.getGeneratedBy().toString(),
            report.getGenerationTimestamp(),
            report.getCompletedTimestamp(),
            report.getParameters(),
            report.getErrorMessage(),
            report.isAvailableForDownload(),
            report.generateFileName()
        );
    }
    
    /**
     * Convert list of Report domain objects to list of ReportResponse DTOs
     */
    public List<ReportResponse> toResponseList(List<Report> reports) {
        if (reports == null) {
            return null;
        }
        
        return reports.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Convert ReportTemplate domain object to ReportTemplateResponse DTO
     */
    public ReportTemplateResponse toTemplateResponse(ReportTemplate template) {
        if (template == null) {
            return null;
        }
        
        return new ReportTemplateResponse(
            template.getId().toString(),
            template.getTemplateName(),
            template.getDescription(),
            template.getConfiguration(),
            template.getCreatedBy().toString(),
            template.getCreatedDate(),
            template.isActive()
        );
    }
    
    /**
     * Convert list of ReportTemplate domain objects to list of ReportTemplateResponse DTOs
     */
    public List<ReportTemplateResponse> toTemplateResponseList(List<ReportTemplate> templates) {
        if (templates == null) {
            return null;
        }
        
        return templates.stream()
            .map(this::toTemplateResponse)
            .collect(Collectors.toList());
    }
}