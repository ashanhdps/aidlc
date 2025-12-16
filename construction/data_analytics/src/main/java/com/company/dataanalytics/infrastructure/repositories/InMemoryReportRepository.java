package com.company.dataanalytics.infrastructure.repositories;

import com.company.dataanalytics.domain.aggregates.report.Report;
import com.company.dataanalytics.domain.repositories.IReportRepository;
import com.company.dataanalytics.domain.valueobjects.GenerationStatus;
import com.company.dataanalytics.domain.valueobjects.ReportId;
import com.company.dataanalytics.domain.valueobjects.TemplateId;
import com.company.dataanalytics.domain.valueobjects.UserId;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory implementation of IReportRepository
 */
@Repository
public class InMemoryReportRepository implements IReportRepository {
    
    private final Map<ReportId, Report> reports = new ConcurrentHashMap<>();
    
    @Override
    public Optional<Report> findById(ReportId reportId) {
        return Optional.ofNullable(reports.get(reportId));
    }
    
    @Override
    public List<Report> findByTemplate(TemplateId templateId) {
        return reports.values().stream()
            .filter(report -> Objects.equals(report.getTemplateId(), templateId))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Report> findByGeneratedBy(UserId userId) {
        return reports.values().stream()
            .filter(report -> report.getGeneratedBy().equals(userId))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Report> findByStatus(GenerationStatus status) {
        return reports.values().stream()
            .filter(report -> report.getGenerationStatus().equals(status))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Report> findByGenerationTimestampBetween(Instant startDate, Instant endDate) {
        return reports.values().stream()
            .filter(report -> {
                Instant timestamp = report.getGenerationTimestamp();
                return !timestamp.isBefore(startDate) && !timestamp.isAfter(endDate);
            })
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Report> findAll(int page, int size) {
        return reports.values().stream()
            .sorted((r1, r2) -> r2.getGenerationTimestamp().compareTo(r1.getGenerationTimestamp())) // Latest first
            .skip((long) page * size)
            .limit(size)
            .collect(Collectors.toList());
    }
    
    @Override
    public void save(Report report) {
        if (report == null) {
            throw new IllegalArgumentException("Report cannot be null");
        }
        reports.put(report.getId(), report);
    }
    
    @Override
    public void delete(ReportId reportId) {
        reports.remove(reportId);
    }
    
    @Override
    public long count() {
        return reports.size();
    }
    
    @Override
    public long countByStatus(GenerationStatus status) {
        return reports.values().stream()
            .mapToLong(report -> report.getGenerationStatus().equals(status) ? 1 : 0)
            .sum();
    }
    
    @Override
    public List<Report> findPendingReports() {
        return findByStatus(GenerationStatus.PENDING);
    }
    
    @Override
    public List<Report> findFailedReports() {
        return findByStatus(GenerationStatus.FAILED);
    }
    
    // Additional utility methods for testing and demo
    public void clear() {
        reports.clear();
    }
    
    public List<Report> findAll() {
        return new ArrayList<>(reports.values());
    }
    
    public List<Report> findRecentReports(int limit) {
        return reports.values().stream()
            .sorted((r1, r2) -> r2.getGenerationTimestamp().compareTo(r1.getGenerationTimestamp()))
            .limit(limit)
            .collect(Collectors.toList());
    }
}