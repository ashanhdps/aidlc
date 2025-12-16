package com.company.kpi.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * Request to generate AI KPI suggestions
 */
@Schema(description = "Request to generate AI KPI suggestions")
public class GenerateAISuggestionRequest {
    
    @Schema(description = "Job title to generate suggestions for", example = "Sales Manager")
    @NotBlank(message = "Job title is required")
    private String job_title;
    
    @Schema(description = "Department", example = "Sales")
    @NotBlank(message = "Department is required")
    private String department;
    
    @Schema(description = "Additional context for AI suggestions", example = "Focus on customer retention and revenue growth")
    private String context;
    
    // Constructors
    public GenerateAISuggestionRequest() {}
    
    public GenerateAISuggestionRequest(String jobTitle, String department) {
        this.job_title = jobTitle;
        this.department = department;
    }
    
    // Getters and setters
    public String getJob_title() { return job_title; }
    public void setJob_title(String job_title) { this.job_title = job_title; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
}