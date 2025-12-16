package com.company.kpi.service;

import com.company.kpi.model.AISuggestion;
import com.company.kpi.model.KPICategory;
import com.company.kpi.model.MeasurementType;
import com.company.kpi.model.dto.GenerateAISuggestionRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for AI-powered KPI suggestions
 */
@Service
public class AISuggestionService {
    
    private static final Logger logger = LoggerFactory.getLogger(AISuggestionService.class);
    
    // In-memory storage for demo purposes
    private final List<AISuggestion> suggestions = new ArrayList<>();
    
    /**
     * Get pending AI suggestions with filters
     */
    public List<AISuggestion> getPendingSuggestions(AISuggestion.SuggestionStatus status, 
                                                   String jobTitle, String department, String assignedTo) {
        logger.debug("Getting AI suggestions - status: {}, jobTitle: {}, department: {}, assignedTo: {}", 
            status, jobTitle, department, assignedTo);
        
        if (suggestions.isEmpty()) {
            initializeDemoSuggestions();
        }
        
        return suggestions.stream()
            .filter(s -> status == null || s.getStatus() == status)
            .filter(s -> jobTitle == null || jobTitle.equalsIgnoreCase(s.getJobTitle()))
            .filter(s -> department == null || department.equalsIgnoreCase(s.getDepartment()))
            .filter(s -> assignedTo == null || assignedTo.equalsIgnoreCase(s.getAssignedTo()))
            .collect(Collectors.toList());
    }
    
    /**
     * Generate AI KPI suggestions for job title
     */
    public List<AISuggestion> generateSuggestions(GenerateAISuggestionRequest request) {
        logger.info("Generating AI suggestions for job title: {} in department: {}", 
            request.getJob_title(), request.getDepartment());
        
        List<AISuggestion> newSuggestions = new ArrayList<>();
        
        // Simulate AI-generated suggestions based on job title and department
        Map<String, List<SuggestionTemplate>> templates = getJobTitleTemplates();
        String jobTitleKey = request.getJob_title().toLowerCase().replace(" ", "_");
        
        List<SuggestionTemplate> jobTemplates = templates.getOrDefault(jobTitleKey, 
            templates.get("default"));
        
        for (SuggestionTemplate template : jobTemplates) {
            AISuggestion suggestion = new AISuggestion(request.getJob_title(), request.getDepartment(), 
                template.name);
            suggestion.setSuggestionId(UUID.randomUUID().toString());
            suggestion.setSuggestedKpiDescription(template.description);
            suggestion.setCategory(template.category);
            suggestion.setMeasurementType(template.measurementType);
            suggestion.setSuggestedTargetValue(template.targetValue);
            suggestion.setSuggestedTargetUnit(template.targetUnit);
            suggestion.setRationale(template.rationale);
            suggestion.setConfidenceScore(template.confidenceScore);
            suggestion.setAssignedTo("hr-manager"); // Default assignment
            
            newSuggestions.add(suggestion);
            suggestions.add(suggestion);
        }
        
        logger.info("Generated {} AI suggestions for {}", newSuggestions.size(), request.getJob_title());
        return newSuggestions;
    }
    
    /**
     * Approve or reject AI suggestion
     */
    public AISuggestion updateSuggestionStatus(String suggestionId, AISuggestion.SuggestionStatus status, 
                                             String feedback, String reviewedBy) {
        logger.info("Updating AI suggestion {} to status: {} by user: {}", suggestionId, status, reviewedBy);
        
        AISuggestion suggestion = suggestions.stream()
            .filter(s -> s.getSuggestionId().equals(suggestionId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("AI suggestion not found: " + suggestionId));
        
        suggestion.setStatus(status);
        suggestion.setFeedback(feedback);
        suggestion.setReviewedBy(reviewedBy);
        suggestion.setReviewedAt(LocalDateTime.now());
        suggestion.setUpdatedAt(LocalDateTime.now());
        
        logger.info("Successfully updated AI suggestion {} to status: {}", suggestionId, status);
        return suggestion;
    }
    
    /**
     * Get AI suggestion history for user
     */
    public List<AISuggestion> getSuggestionHistory(String userId) {
        logger.debug("Getting AI suggestion history for user: {}", userId);
        
        return suggestions.stream()
            .filter(s -> userId.equals(s.getAssignedTo()) || userId.equals(s.getReviewedBy()))
            .sorted((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()))
            .collect(Collectors.toList());
    }
    
    /**
     * Initialize demo AI suggestions
     */
    private void initializeDemoSuggestions() {
        logger.info("Initializing demo AI suggestions");
        
        // Sales Manager suggestions
        AISuggestion salesSuggestion = new AISuggestion("Sales Manager", "Sales", "Monthly Revenue Target");
        salesSuggestion.setSuggestionId("ai-001");
        salesSuggestion.setSuggestedKpiDescription("Track monthly revenue achievement against targets");
        salesSuggestion.setCategory(KPICategory.FINANCIAL);
        salesSuggestion.setMeasurementType(MeasurementType.CURRENCY);
        salesSuggestion.setSuggestedTargetValue(100000.0);
        salesSuggestion.setSuggestedTargetUnit("USD");
        salesSuggestion.setRationale("Sales managers are typically measured on revenue achievement. This KPI aligns with business objectives.");
        salesSuggestion.setConfidenceScore(95.0);
        salesSuggestion.setAssignedTo("hr-manager");
        suggestions.add(salesSuggestion);
        
        // Marketing Manager suggestions
        AISuggestion marketingSuggestion = new AISuggestion("Marketing Manager", "Marketing", "Lead Conversion Rate");
        marketingSuggestion.setSuggestionId("ai-002");
        marketingSuggestion.setSuggestedKpiDescription("Percentage of marketing leads converted to sales");
        marketingSuggestion.setCategory(KPICategory.OPERATIONAL);
        marketingSuggestion.setMeasurementType(MeasurementType.PERCENTAGE);
        marketingSuggestion.setSuggestedTargetValue(15.0);
        marketingSuggestion.setSuggestedTargetUnit("%");
        marketingSuggestion.setRationale("Marketing effectiveness is best measured by lead quality and conversion rates.");
        marketingSuggestion.setConfidenceScore(88.0);
        marketingSuggestion.setAssignedTo("hr-manager");
        suggestions.add(marketingSuggestion);
        
        logger.info("Initialized {} demo AI suggestions", suggestions.size());
    }
    
    /**
     * Get job title suggestion templates
     */
    private Map<String, List<SuggestionTemplate>> getJobTitleTemplates() {
        Map<String, List<SuggestionTemplate>> templates = new HashMap<>();
        
        // Sales Manager templates
        templates.put("sales_manager", Arrays.asList(
            new SuggestionTemplate("Monthly Revenue Achievement", "Track monthly revenue against targets", 
                KPICategory.FINANCIAL, MeasurementType.CURRENCY, 100000.0, "USD", 
                "Revenue is the primary success metric for sales roles", 95.0),
            new SuggestionTemplate("Customer Acquisition Rate", "Number of new customers acquired per month", 
                KPICategory.CUSTOMER, MeasurementType.COUNT, 20.0, "customers", 
                "New customer acquisition drives business growth", 90.0)
        ));
        
        // Marketing Manager templates
        templates.put("marketing_manager", Arrays.asList(
            new SuggestionTemplate("Lead Conversion Rate", "Percentage of leads converted to sales", 
                KPICategory.OPERATIONAL, MeasurementType.PERCENTAGE, 15.0, "%", 
                "Marketing effectiveness measured by lead quality", 88.0),
            new SuggestionTemplate("Marketing ROI", "Return on investment for marketing campaigns", 
                KPICategory.FINANCIAL, MeasurementType.RATIO, 3.0, "ratio", 
                "ROI demonstrates marketing value to business", 85.0)
        ));
        
        // Default templates
        templates.put("default", Arrays.asList(
            new SuggestionTemplate("Performance Score", "Overall performance rating", 
                KPICategory.PERFORMANCE, MeasurementType.SCORE, 4.0, "out of 5", 
                "General performance metric applicable to most roles", 70.0)
        ));
        
        return templates;
    }
    
    /**
     * Internal class for suggestion templates
     */
    private static class SuggestionTemplate {
        String name;
        String description;
        KPICategory category;
        MeasurementType measurementType;
        Double targetValue;
        String targetUnit;
        String rationale;
        Double confidenceScore;
        
        SuggestionTemplate(String name, String description, KPICategory category, 
                          MeasurementType measurementType, Double targetValue, String targetUnit, 
                          String rationale, Double confidenceScore) {
            this.name = name;
            this.description = description;
            this.category = category;
            this.measurementType = measurementType;
            this.targetValue = targetValue;
            this.targetUnit = targetUnit;
            this.rationale = rationale;
            this.confidenceScore = confidenceScore;
        }
    }
}