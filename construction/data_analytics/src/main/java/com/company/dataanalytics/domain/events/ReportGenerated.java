package com.company.dataanalytics.domain.events;

import com.company.dataanalytics.domain.shared.DomainEvent;
import com.company.dataanalytics.domain.valueobjects.ReportFormat;
import com.company.dataanalytics.domain.valueobjects.ReportId;
import com.company.dataanalytics.domain.valueobjects.UserId;

/**
 * Domain event raised when a report is successfully generated
 */
public class ReportGenerated extends DomainEvent {
    
    private final ReportId reportId;
    private final String reportName;
    private final ReportFormat reportFormat;
    private final UserId generatedBy;
    
    public ReportGenerated(ReportId reportId, String reportName, ReportFormat reportFormat, UserId generatedBy) {
        super();
        this.reportId = reportId;
        this.reportName = reportName;
        this.reportFormat = reportFormat;
        this.generatedBy = generatedBy;
    }
    
    public ReportId getReportId() {
        return reportId;
    }
    
    public String getReportName() {
        return reportName;
    }
    
    public ReportFormat getReportFormat() {
        return reportFormat;
    }
    
    public UserId getGeneratedBy() {
        return generatedBy;
    }
    
    @Override
    public String toString() {
        return String.format("ReportGenerated{reportId=%s, reportName=%s, format=%s, generatedBy=%s, occurredOn=%s}", 
            reportId, reportName, reportFormat, generatedBy, getOccurredOn());
    }
}