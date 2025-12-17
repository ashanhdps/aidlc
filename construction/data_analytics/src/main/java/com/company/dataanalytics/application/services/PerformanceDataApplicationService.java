package com.company.dataanalytics.application.services;

import com.company.dataanalytics.domain.aggregates.performance.PerformanceData;
import com.company.dataanalytics.domain.repositories.IPerformanceDataRepository;
import com.company.dataanalytics.domain.valueobjects.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Application service for performance data management use cases
 */
@Service
@Transactional
public class PerformanceDataApplicationService {
    
    private final IPerformanceDataRepository performanceDataRepository;
    
    public PerformanceDataApplicationService(IPerformanceDataRepository performanceDataRepository) {
        this.performanceDataRepository = performanceDataRepository;
    }
    
    /**
     * Record performance data
     */
    public UUID recordPerformanceData(String employeeId, String kpiId, double value, 
                                    String unit, LocalDate dataDate) {
        EmployeeId empId = EmployeeId.of(employeeId);
        KPIId kpiIdObj = KPIId.of(kpiId);
        MetricValue metricValue = MetricValue.of(value, unit);
        DataTimestamp timestamp = dataDate != null ? DataTimestamp.of(dataDate) : DataTimestamp.now();
        
        PerformanceData performanceData = PerformanceData.create(empId, kpiIdObj, metricValue, timestamp);
        
        performanceDataRepository.save(performanceData);
        
        return performanceData.getId();
    }
    
    /**
     * Update performance data value
     */
    public void updatePerformanceData(UUID dataId, double newValue, String unit) {
        PerformanceData performanceData = getPerformanceDataById(dataId);
        MetricValue newMetricValue = MetricValue.of(newValue, unit);
        
        performanceData.updateMetricValue(newMetricValue);
        performanceDataRepository.save(performanceData);
    }
    
    /**
     * Get performance data by ID
     */
    @Transactional(readOnly = true)
    public PerformanceData getPerformanceDataById(UUID dataId) {
        return performanceDataRepository.findById(dataId)
            .orElseThrow(() -> new IllegalArgumentException("Performance data not found: " + dataId));
    }
    
    /**
     * Get performance data for employee
     */
    @Transactional(readOnly = true)
    public List<PerformanceData> getPerformanceDataForEmployee(String employeeId) {
        EmployeeId empId = EmployeeId.of(employeeId);
        return performanceDataRepository.findByEmployee(empId);
    }
    
    /**
     * Get performance data for employee within date range
     */
    @Transactional(readOnly = true)
    public List<PerformanceData> getPerformanceDataForEmployee(String employeeId, 
                                                             LocalDate startDate, LocalDate endDate) {
        EmployeeId empId = EmployeeId.of(employeeId);
        return performanceDataRepository.findByEmployeeAndDateRange(empId, startDate, endDate);
    }
    
    /**
     * Get performance data for KPI
     */
    @Transactional(readOnly = true)
    public List<PerformanceData> getPerformanceDataForKPI(String kpiId) {
        KPIId kpiIdObj = KPIId.of(kpiId);
        return performanceDataRepository.findByKPI(kpiIdObj);
    }
    
    /**
     * Get performance data for KPI within date range
     */
    @Transactional(readOnly = true)
    public List<PerformanceData> getPerformanceDataForKPI(String kpiId, 
                                                         LocalDate startDate, LocalDate endDate) {
        KPIId kpiIdObj = KPIId.of(kpiId);
        return performanceDataRepository.findByKPIAndDateRange(kpiIdObj, startDate, endDate);
    }
    
    /**
     * Get performance data for employee and specific KPI
     */
    @Transactional(readOnly = true)
    public List<PerformanceData> getPerformanceDataForEmployeeAndKPI(String employeeId, String kpiId) {
        EmployeeId empId = EmployeeId.of(employeeId);
        KPIId kpiIdObj = KPIId.of(kpiId);
        return performanceDataRepository.findByEmployeeAndKPI(empId, kpiIdObj);
    }
    
    /**
     * Get latest performance data for employee
     */
    @Transactional(readOnly = true)
    public List<PerformanceData> getLatestPerformanceDataForEmployee(String employeeId, int limit) {
        EmployeeId empId = EmployeeId.of(employeeId);
        return performanceDataRepository.findLatestByEmployee(empId, limit);
    }
    
    /**
     * Get performance data within date range
     */
    @Transactional(readOnly = true)
    public List<PerformanceData> getPerformanceDataByDateRange(LocalDate startDate, LocalDate endDate) {
        return performanceDataRepository.findByDateRange(startDate, endDate);
    }
    
    /**
     * Get aggregated performance data for employee
     */
    @Transactional(readOnly = true)
    public Map<String, Double> getAggregatedPerformanceForEmployee(String employeeId, 
                                                                  LocalDate startDate, LocalDate endDate) {
        List<PerformanceData> data = getPerformanceDataForEmployee(employeeId, startDate, endDate);
        
        return data.stream()
            .collect(Collectors.groupingBy(
                pd -> pd.getKpiId().toString(),
                Collectors.averagingDouble(pd -> pd.getMetricValue().getDoubleValue())
            ));
    }
    
    /**
     * Get performance summary for multiple employees
     */
    @Transactional(readOnly = true)
    public Map<String, Map<String, Double>> getTeamPerformanceSummary(List<String> employeeIds, 
                                                                     LocalDate startDate, LocalDate endDate) {
        return employeeIds.stream()
            .collect(Collectors.toMap(
                empId -> empId,
                empId -> getAggregatedPerformanceForEmployee(empId, startDate, endDate)
            ));
    }
    
    /**
     * Calculate performance trends for employee
     */
    @Transactional(readOnly = true)
    public Map<String, List<Double>> getPerformanceTrends(String employeeId, String kpiId, 
                                                         LocalDate startDate, LocalDate endDate) {
        List<PerformanceData> data = getPerformanceDataForEmployee(employeeId, startDate, endDate)
            .stream()
            .filter(pd -> pd.getKpiId().toString().equals(kpiId))
            .sorted((pd1, pd2) -> pd1.getDataTimestamp().getValue().compareTo(pd2.getDataTimestamp().getValue()))
            .collect(Collectors.toList());
        
        List<Double> values = data.stream()
            .map(pd -> pd.getMetricValue().getDoubleValue())
            .collect(Collectors.toList());
        
        List<Double> dates = data.stream()
            .map(pd -> (double) pd.getDataTimestamp().getValue().getEpochSecond())
            .collect(Collectors.toList());
        
        return Map.of(
            "values", values,
            "timestamps", dates
        );
    }
    
    /**
     * Get performance statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPerformanceStatistics(String employeeId, String kpiId, 
                                                       LocalDate startDate, LocalDate endDate) {
        List<PerformanceData> data = performanceDataRepository.findByEmployeeAndDateRange(
            EmployeeId.of(employeeId), startDate, endDate)
            .stream()
            .filter(pd -> pd.getKpiId().toString().equals(kpiId))
            .collect(Collectors.toList());
        
        if (data.isEmpty()) {
            return Map.of("count", 0);
        }
        
        List<Double> values = data.stream()
            .map(pd -> pd.getMetricValue().getDoubleValue())
            .collect(Collectors.toList());
        
        double average = values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double min = values.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
        double max = values.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
        double sum = values.stream().mapToDouble(Double::doubleValue).sum();
        
        return Map.of(
            "count", data.size(),
            "average", average,
            "minimum", min,
            "maximum", max,
            "sum", sum,
            "latest", values.get(values.size() - 1)
        );
    }
    
    /**
     * Delete performance data
     */
    public void deletePerformanceData(UUID dataId) {
        performanceDataRepository.delete(dataId);
    }
    
    /**
     * Get performance data count for employee
     */
    @Transactional(readOnly = true)
    public long getPerformanceDataCount(String employeeId) {
        EmployeeId empId = EmployeeId.of(employeeId);
        return performanceDataRepository.countByEmployee(empId);
    }
    
    /**
     * Get performance data count for KPI
     */
    @Transactional(readOnly = true)
    public long getPerformanceDataCountForKPI(String kpiId) {
        KPIId kpiIdObj = KPIId.of(kpiId);
        return performanceDataRepository.countByKPI(kpiIdObj);
    }
}