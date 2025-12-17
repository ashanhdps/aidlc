package com.company.dataanalytics.domain.events;

import com.company.dataanalytics.domain.shared.DomainEvent;
import com.company.dataanalytics.domain.valueobjects.ReportId;
import com.company.dataanalytics.domain.valueobjects.UserId;

/**
 * Domain event raised when report generation fails
 */
public class ReportGenerationFailed extends DomainEvent {
    
    private final ReportId reportId;
    private final String reportName;
    private final String errorMessage;
    private final UserId generatedBy;
    
    public ReportGenerationFailed(ReportId reportId, String reportName, String errorMessage, UserId generatedBy) {
        super();
        this.reportId = reportId;
        this.reportName = reportName;
        this.errorMessage = errorMessage;
        this.generatedBy = generatedBy;
    }
    
    public ReportId getReportId() {
        return reportId;
    }
    
    public String getReportName() {
        return reportName;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public UserId getGeneratedBy() {
        return generatedBy;
    }
    
    @Override
    public String toString() {
        return String.format("ReportGenerationFailed{reportId=%s, reportName=%s, error=%s, generatedBy=%s, occurredOn=%s}", 
            reportId, reportName, errorMessage, generatedBy, getOccurredOn());
    }
}