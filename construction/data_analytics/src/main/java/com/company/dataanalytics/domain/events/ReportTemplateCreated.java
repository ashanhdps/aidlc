package com.company.dataanalytics.domain.events;

import com.company.dataanalytics.domain.shared.DomainEvent;
import com.company.dataanalytics.domain.valueobjects.TemplateId;
import com.company.dataanalytics.domain.valueobjects.UserId;

/**
 * Domain event raised when a new report template is created
 */
public class ReportTemplateCreated extends DomainEvent {
    
    private final TemplateId templateId;
    private final String templateName;
    private final UserId createdBy;
    
    public ReportTemplateCreated(TemplateId templateId, String templateName, UserId createdBy) {
        super();
        this.templateId = templateId;
        this.templateName = templateName;
        this.createdBy = createdBy;
    }
    
    public TemplateId getTemplateId() {
        return templateId;
    }
    
    public String getTemplateName() {
        return templateName;
    }
    
    public UserId getCreatedBy() {
        return createdBy;
    }
    
    @Override
    public String toString() {
        return String.format("ReportTemplateCreated{templateId=%s, templateName=%s, createdBy=%s, occurredOn=%s}", 
            templateId, templateName, createdBy, getOccurredOn());
    }
}