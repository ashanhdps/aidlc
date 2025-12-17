package com.company.dataanalytics.api.dto.response;

import java.time.Instant;
import java.util.Map;

/**
 * Response DTO for report template information
 */
public class ReportTemplateResponse {
    
    private String id;
    private String templateName;
    private String description;
    private Map<String, Object> configuration;
    private String createdBy;
    private Instant createdDate;
    private boolean active;
    
    // Constructors
    public ReportTemplateResponse() {}
    
    public ReportTemplateResponse(String id, String templateName, String description, 
                                Map<String, Object> configuration, String createdBy, 
                                Instant createdDate, boolean active) {
        this.id = id;
        this.templateName = templateName;
        this.description = description;
        this.configuration = configuration;
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.active = active;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTemplateName() {
        return templateName;
    }
    
    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Map<String, Object> getConfiguration() {
        return configuration;
    }
    
    public void setConfiguration(Map<String, Object> configuration) {
        this.configuration = configuration;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public Instant getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
}