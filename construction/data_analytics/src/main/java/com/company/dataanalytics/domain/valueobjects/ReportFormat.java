package com.company.dataanalytics.domain.valueobjects;

import com.company.dataanalytics.domain.shared.ValueObject;

import java.util.Objects;

/**
 * Value object representing the format of a report
 */
public class ReportFormat implements ValueObject {
    
    public static final ReportFormat PDF = new ReportFormat("PDF");
    public static final ReportFormat CSV = new ReportFormat("CSV");
    public static final ReportFormat EXCEL = new ReportFormat("EXCEL");
    
    private final String value;
    
    private ReportFormat(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Report format cannot be null or empty");
        }
        this.value = value.trim().toUpperCase();
    }
    
    public static ReportFormat of(String value) {
        return new ReportFormat(value);
    }
    
    public String getValue() {
        return value;
    }
    
    public boolean isPdf() {
        return PDF.equals(this);
    }
    
    public boolean isCsv() {
        return CSV.equals(this);
    }
    
    public boolean isExcel() {
        return EXCEL.equals(this);
    }
    
    public String getFileExtension() {
        return switch (value) {
            case "PDF" -> ".pdf";
            case "CSV" -> ".csv";
            case "EXCEL" -> ".xlsx";
            default -> ".txt";
        };
    }
    
    public String getMimeType() {
        return switch (value) {
            case "PDF" -> "application/pdf";
            case "CSV" -> "text/csv";
            case "EXCEL" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            default -> "text/plain";
        };
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        ReportFormat that = (ReportFormat) obj;
        return Objects.equals(value, that.value);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
    
    @Override
    public String toString() {
        return value;
    }
}