package com.company.dataanalytics.domain.aggregates.report;

import com.company.dataanalytics.domain.shared.Entity;
import com.company.dataanalytics.domain.valueobjects.TemplateId;
import com.company.dataanalytics.domain.valueobjects.UserId;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Entity representing a report template configuration
 */
public class ReportTemplate extends Entity<TemplateId> {
    
    private String templateName;
    private String description;
    private final Map<String, Object> configuration;
    private final UserId createdBy;
    private final Instant createdDate;
    private boolean isActive;
    
    public ReportTemplate(TemplateId id, String templateName, String description, 
                         Map<String, Object> configuration, UserId createdBy) {
        super(id);
        if (templateName == null || templateName.trim().isEmpty()) {
            throw new IllegalArgumentException("Template name cannot be null or empty");
        }
        if (createdBy == null) {
            throw new IllegalArgumentException("Created by cannot be null");
        }
        
        this.templateName = templateName.trim();
        this.description = description;
        this.configuration = new HashMap<>(configuration != null ? configuration : new HashMap<>());
        this.createdBy = createdBy;
        this.createdDate = Instant.now();
        this.isActive = true;
    }
    
    public static ReportTemplate create(String templateName, String description, 
                                      Map<String, Object> configuration, UserId createdBy) {
        return new ReportTemplate(TemplateId.generate(), templateName, description, configuration, createdBy);
    }
    
    public void updateName(String newName) {
        if (newName == null || newName.trim().isEmpty()) {
            throw new IllegalArgumentException("Template name cannot be null or empty");
        }
        this.templateName = newName.trim();
    }
    
    public void updateDescription(String newDescription) {
        this.description = newDescription;
    }
    
    public void updateConfiguration(Map<String, Object> newConfiguration) {
        this.configuration.clear();
        if (newConfiguration != null) {
            this.configuration.putAll(newConfiguration);
        }
    }
    
    public void addConfigurationProperty(String key, Object value) {
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalArgumentException("Configuration key cannot be null or empty");
        }
        this.configuration.put(key.trim(), value);
    }
    
    public void removeConfigurationProperty(String key) {
        this.configuration.remove(key);
    }
    
    public void activate() {
        this.isActive = true;
    }
    
    public void deactivate() {
        this.isActive = false;
    }
    
    public Object getConfigurationProperty(String key) {
        return this.configuration.get(key);
    }
    
    public boolean hasConfigurationProperty(String key) {
        return this.configuration.containsKey(key);
    }
    
    // Getters
    public String getTemplateName() {
        return templateName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public Map<String, Object> getConfiguration() {
        return new HashMap<>(configuration);
    }
    
    public UserId getCreatedBy() {
        return createdBy;
    }
    
    public Instant getCreatedDate() {
        return createdDate;
    }
    
    public boolean isActive() {
        return isActive;
    }
}