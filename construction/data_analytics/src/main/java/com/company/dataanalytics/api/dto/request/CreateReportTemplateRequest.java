package com.company.dataanalytics.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Map;

/**
 * Request DTO for creating a report template
 */
public class CreateReportTemplateRequest {
    
    @NotBlank(message = "Template name is required")
    @Size(min = 3, max = 100, message = "Template name must be between 3 and 100 characters")
    private String templateName;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    private Map<String, Object> configuration;
    
    // Constructors
    public CreateReportTemplateRequest() {}
    
    public CreateReportTemplateRequest(String templateName, String description, Map<String, Object> configuration) {
        this.templateName = templateName;
        this.description = description;
        this.configuration = configuration;
    }
    
    // Getters and Setters
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
}