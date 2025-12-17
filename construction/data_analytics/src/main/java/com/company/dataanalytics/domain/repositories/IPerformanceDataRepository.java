package com.company.dataanalytics.domain.repositories;

import com.company.dataanalytics.domain.aggregates.performance.PerformanceData;
import com.company.dataanalytics.domain.valueobjects.DataTimestamp;
import com.company.dataanalytics.domain.valueobjects.EmployeeId;
import com.company.dataanalytics.domain.valueobjects.KPIId;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for PerformanceData aggregate
 */
public interface IPerformanceDataRepository {
    
    /**
     * Find performance data by ID
     */
    Optional<PerformanceData> findById(UUID id);
    
    /**
     * Find all performance data for a specific employee
     */
    List<PerformanceData> findByEmployee(EmployeeId employeeId);
    
    /**
     * Find all performance data for a specific KPI
     */
    List<PerformanceData> findByKPI(KPIId kpiId);
    
    /**
     * Find performance data for an employee and specific KPI
     */
    List<PerformanceData> findByEmployeeAndKPI(EmployeeId employeeId, KPIId kpiId);
    
    /**
     * Find performance data within a date range
     */
    List<PerformanceData> findByDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find performance data for an employee within a date range
     */
    List<PerformanceData> findByEmployeeAndDateRange(EmployeeId employeeId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Find performance data for a KPI within a date range
     */
    List<PerformanceData> findByKPIAndDateRange(KPIId kpiId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Find latest performance data for an employee
     */
    List<PerformanceData> findLatestByEmployee(EmployeeId employeeId, int limit);
    
    /**
     * Find all performance data with pagination
     */
    List<PerformanceData> findAll(int page, int size);
    
    /**
     * Save performance data
     */
    void save(PerformanceData performanceData);
    
    /**
     * Delete performance data
     */
    void delete(UUID id);
    
    /**
     * Count total performance data records
     */
    long count();
    
    /**
     * Count performance data records for an employee
     */
    long countByEmployee(EmployeeId employeeId);
    
    /**
     * Count performance data records for a KPI
     */
    long countByKPI(KPIId kpiId);
}