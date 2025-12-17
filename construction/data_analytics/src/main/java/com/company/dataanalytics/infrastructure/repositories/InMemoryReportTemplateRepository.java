package com.company.dataanalytics.infrastructure.repositories;

import com.company.dataanalytics.domain.aggregates.report.ReportTemplate;
import com.company.dataanalytics.domain.repositories.IReportTemplateRepository;
import com.company.dataanalytics.domain.valueobjects.TemplateId;
import com.company.dataanalytics.domain.valueobjects.UserId;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory implementation of IReportTemplateRepository
 */
@Repository
public class InMemoryReportTemplateRepository implements IReportTemplateRepository {
    
    private final Map<TemplateId, ReportTemplate> templates = new ConcurrentHashMap<>();
    private final Map<String, TemplateId> nameIndex = new ConcurrentHashMap<>();
    
    @Override
    public Optional<ReportTemplate> findById(TemplateId templateId) {
        return Optional.ofNullable(templates.get(templateId));
    }
    
    @Override
    public Optional<ReportTemplate> findByName(String templateName) {
        TemplateId templateId = nameIndex.get(templateName.toLowerCase());
        return templateId != null ? findById(templateId) : Optional.empty();
    }
    
    @Override
    public List<ReportTemplate> findActiveTemplates() {
        return templates.values().stream()
            .filter(ReportTemplate::isActive)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<ReportTemplate> findByCreatedBy(UserId createdBy) {
        return templates.values().stream()
            .filter(template -> template.getCreatedBy().equals(createdBy))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<ReportTemplate> findAll(int page, int size) {
        return templates.values().stream()
            .sorted((t1, t2) -> t1.getCreatedDate().compareTo(t2.getCreatedDate()))
            .skip((long) page * size)
            .limit(size)
            .collect(Collectors.toList());
    }
    
    @Override
    public void save(ReportTemplate template) {
        if (template == null) {
            throw new IllegalArgumentException("Template cannot be null");
        }
        
        // Update name index
        nameIndex.put(template.getTemplateName().toLowerCase(), template.getId());
        
        // Save template
        templates.put(template.getId(), template);
    }
    
    @Override
    public void delete(TemplateId templateId) {
        ReportTemplate template = templates.remove(templateId);
        if (template != null) {
            nameIndex.remove(template.getTemplateName().toLowerCase());
        }
    }
    
    @Override
    public boolean existsByName(String templateName) {
        return nameIndex.containsKey(templateName.toLowerCase());
    }
    
    @Override
    public long count() {
        return templates.size();
    }
    
    @Override
    public long countActive() {
        return templates.values().stream()
            .mapToLong(template -> template.isActive() ? 1 : 0)
            .sum();
    }
    
    // Additional utility methods for testing and demo
    public void clear() {
        templates.clear();
        nameIndex.clear();
    }
    
    public List<ReportTemplate> findAll() {
        return new ArrayList<>(templates.values());
    }
}