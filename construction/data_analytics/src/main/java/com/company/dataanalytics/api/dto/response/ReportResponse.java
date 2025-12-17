package com.company.dataanalytics.api.dto.response;

import java.time.Instant;
import java.util.Map;

/**
 * Response DTO for report information
 */
public class ReportResponse {
    
    private String id;
    private String templateId;
    private String reportName;
    private String format;
    private String status;
    private String filePath;
    private String generatedBy;
    private Instant generationTimestamp;
    private Instant completedTimestamp;
    private Map<String, Object> parameters;
    private String errorMessage;
    private boolean availableForDownload;
    private String fileName;
    
    // Constructors
    public ReportResponse() {}
    
    public ReportResponse(String id, String templateId, String reportName, String format, String status,
                         String filePath, String generatedBy, Instant generationTimestamp, Instant completedTimestamp,
                         Map<String, Object> parameters, String errorMessage, boolean availableForDownload, String fileName) {
        this.id = id;
        this.templateId = templateId;
        this.reportName = reportName;
        this.format = format;
        this.status = status;
        this.filePath = filePath;
        this.generatedBy = generatedBy;
        this.generationTimestamp = generationTimestamp;
        this.completedTimestamp = completedTimestamp;
        this.parameters = parameters;
        this.errorMessage = errorMessage;
        this.availableForDownload = availableForDownload;
        this.fileName = fileName;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public String getGeneratedBy() {
        return generatedBy;
    }
    
    public void setGeneratedBy(String generatedBy) {
        this.generatedBy = generatedBy;
    }
    
    public Instant getGenerationTimestamp() {
        return generationTimestamp;
    }
    
    public void setGenerationTimestamp(Instant generationTimestamp) {
        this.generationTimestamp = generationTimestamp;
    }
    
    public Instant getCompletedTimestamp() {
        return completedTimestamp;
    }
    
    public void setCompletedTimestamp(Instant completedTimestamp) {
        this.completedTimestamp = completedTimestamp;
    }
    
    public Map<String, Object> getParameters() {
        return parameters;
    }
    
    public void setParameters(Map<String, Object> parameters) {
        this.parameters = parameters;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public boolean isAvailableForDownload() {
        return availableForDownload;
    }
    
    public void setAvailableForDownload(boolean availableForDownload) {
        this.availableForDownload = availableForDownload;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}