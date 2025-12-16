package com.company.dataanalytics.infrastructure.repositories;

import com.company.dataanalytics.domain.aggregates.performance.PerformanceData;
import com.company.dataanalytics.domain.repositories.IPerformanceDataRepository;
import com.company.dataanalytics.domain.valueobjects.EmployeeId;
import com.company.dataanalytics.domain.valueobjects.KPIId;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-memory implementation of IPerformanceDataRepository
 */
@Repository
public class InMemoryPerformanceDataRepository implements IPerformanceDataRepository {
    
    private final Map<UUID, PerformanceData> performanceData = new ConcurrentHashMap<>();
    
    @Override
    public Optional<PerformanceData> findById(UUID id) {
        return Optional.ofNullable(performanceData.get(id));
    }
    
    @Override
    public List<PerformanceData> findByEmployee(EmployeeId employeeId) {
        return performanceData.values().stream()
            .filter(data -> data.getEmployeeId().equals(employeeId))
            .sorted((d1, d2) -> d2.getDataTimestamp().getValue().compareTo(d1.getDataTimestamp().getValue())) // Latest first
            .collect(Collectors.toList());
    }
    
    @Override
    public List<PerformanceData> findByKPI(KPIId kpiId) {
        return performanceData.values().stream()
            .filter(data -> data.getKpiId().equals(kpiId))
            .sorted((d1, d2) -> d2.getDataTimestamp().getValue().compareTo(d1.getDataTimestamp().getValue())) // Latest first
            .collect(Collectors.toList());
    }
    
    @Override
    public List<PerformanceData> findByEmployeeAndKPI(EmployeeId employeeId, KPIId kpiId) {
        return performanceData.values().stream()
            .filter(data -> data.getEmployeeId().equals(employeeId) && data.getKpiId().equals(kpiId))
            .sorted((d1, d2) -> d2.getDataTimestamp().getValue().compareTo(d1.getDataTimestamp().getValue())) // Latest first
            .collect(Collectors.toList());
    }
    
    @Override
    public List<PerformanceData> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return performanceData.values().stream()
            .filter(data -> {
                LocalDate dataDate = data.getDataTimestamp().getDate();
                return !dataDate.isBefore(startDate) && !dataDate.isAfter(endDate);
            })
            .sorted((d1, d2) -> d2.getDataTimestamp().getValue().compareTo(d1.getDataTimestamp().getValue())) // Latest first
            .collect(Collectors.toList());
    }
    
    @Override
    public List<PerformanceData> findByEmployeeAndDateRange(EmployeeId employeeId, LocalDate startDate, LocalDate endDate) {
        return performanceData.values().stream()
            .filter(data -> {
                LocalDate dataDate = data.getDataTimestamp().getDate();
                return data.getEmployeeId().equals(employeeId) &&
                       !dataDate.isBefore(startDate) && !dataDate.isAfter(endDate);
            })
            .sorted((d1, d2) -> d2.getDataTimestamp().getValue().compareTo(d1.getDataTimestamp().getValue())) // Latest first
            .collect(Collectors.toList());
    }
    
    @Override
    public List<PerformanceData> findByKPIAndDateRange(KPIId kpiId, LocalDate startDate, LocalDate endDate) {
        return performanceData.values().stream()
            .filter(data -> {
                LocalDate dataDate = data.getDataTimestamp().getDate();
                return data.getKpiId().equals(kpiId) &&
                       !dataDate.isBefore(startDate) && !dataDate.isAfter(endDate);
            })
            .sorted((d1, d2) -> d2.getDataTimestamp().getValue().compareTo(d1.getDataTimestamp().getValue())) // Latest first
            .collect(Collectors.toList());
    }
    
    @Override
    public List<PerformanceData> findLatestByEmployee(EmployeeId employeeId, int limit) {
        return performanceData.values().stream()
            .filter(data -> data.getEmployeeId().equals(employeeId))
            .sorted((d1, d2) -> d2.getDataTimestamp().getValue().compareTo(d1.getDataTimestamp().getValue())) // Latest first
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<PerformanceData> findAll(int page, int size) {
        return performanceData.values().stream()
            .sorted((d1, d2) -> d2.getDataTimestamp().getValue().compareTo(d1.getDataTimestamp().getValue())) // Latest first
            .skip((long) page * size)
            .limit(size)
            .collect(Collectors.toList());
    }
    
    @Override
    public void save(PerformanceData data) {
        if (data == null) {
            throw new IllegalArgumentException("Performance data cannot be null");
        }
        performanceData.put(data.getId(), data);
    }
    
    @Override
    public void delete(UUID id) {
        performanceData.remove(id);
    }
    
    @Override
    public long count() {
        return performanceData.size();
    }
    
    @Override
    public long countByEmployee(EmployeeId employeeId) {
        return performanceData.values().stream()
            .mapToLong(data -> data.getEmployeeId().equals(employeeId) ? 1 : 0)
            .sum();
    }
    
    @Override
    public long countByKPI(KPIId kpiId) {
        return performanceData.values().stream()
            .mapToLong(data -> data.getKpiId().equals(kpiId) ? 1 : 0)
            .sum();
    }
    
    // Additional utility methods for testing and demo
    public void clear() {
        performanceData.clear();
    }
    
    public List<PerformanceData> findAll() {
        return new ArrayList<>(performanceData.values());
    }
    
    public List<PerformanceData> findRecentData(int limit) {
        return performanceData.values().stream()
            .sorted((d1, d2) -> d2.getDataTimestamp().getValue().compareTo(d1.getDataTimestamp().getValue()))
            .limit(limit)
            .collect(Collectors.toList());
    }
}