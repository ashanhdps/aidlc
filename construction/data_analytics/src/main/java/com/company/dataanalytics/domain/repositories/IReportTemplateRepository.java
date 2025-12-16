package com.company.dataanalytics.domain.repositories;

import com.company.dataanalytics.domain.aggregates.report.ReportTemplate;
import com.company.dataanalytics.domain.valueobjects.TemplateId;
import com.company.dataanalytics.domain.valueobjects.UserId;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ReportTemplate entity
 */
public interface IReportTemplateRepository {
    
    /**
     * Find template by ID
     */
    Optional<ReportTemplate> findById(TemplateId templateId);
    
    /**
     * Find template by name
     */
    Optional<ReportTemplate> findByName(String templateName);
    
    /**
     * Find all active templates
     */
    List<ReportTemplate> findActiveTemplates();
    
    /**
     * Find templates created by a specific user
     */
    List<ReportTemplate> findByCreatedBy(UserId createdBy);
    
    /**
     * Find all templates with pagination
     */
    List<ReportTemplate> findAll(int page, int size);
    
    /**
     * Save template
     */
    void save(ReportTemplate template);
    
    /**
     * Delete template
     */
    void delete(TemplateId templateId);
    
    /**
     * Check if template name exists
     */
    boolean existsByName(String templateName);
    
    /**
     * Count total templates
     */
    long count();
    
    /**
     * Count active templates
     */
    long countActive();
}