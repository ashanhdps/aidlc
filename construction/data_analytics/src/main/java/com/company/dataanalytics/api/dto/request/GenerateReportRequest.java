package com.company.dataanalytics.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Map;

/**
 * Request DTO for generating a report
 */
public class GenerateReportRequest {
    
    private String templateId;
    
    @NotBlank(message = "Report name is required")
    @Size(min = 3, max = 100, message = "Report name must be between 3 and 100 characters")
    private String reportName;
    
    @NotBlank(message = "Format is required")
    @Pattern(regexp = "PDF|CSV|EXCEL", message = "Format must be one of: PDF, CSV, EXCEL")
    private String format;
    
    private Map<String, Object> parameters;
    
    // Constructors
    public GenerateReportRequest() {}
    
    public GenerateReportRequest(String templateId, String reportName, String format, Map<String, Object> parameters) {
        this.templateId = templateId;
        this.reportName = reportName;
        this.format = format;
        this.parameters = parameters;
    }
    
    // Getters and Setters
    public String getTemplateId() {
        return templateId;
    }
    
    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }
    
    public String getReportName() {
        return reportName;
    }
    
    public void setReportName(String reportName) {
        this.reportName = reportName;
    }
    
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
    
    public Map<String, Object> getParameters() {
        return parameters;
    }
    
    public void setParameters(Map<String, Object> parameters) {
        this.parameters = parameters;
    }
}