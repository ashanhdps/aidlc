package com.company.dataanalytics.domain.aggregates.performance;

import com.company.dataanalytics.domain.shared.AggregateRoot;
import com.company.dataanalytics.domain.valueobjects.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Aggregate root for performance data management
 */
public class PerformanceData extends AggregateRoot<UUID> {
    
    private final EmployeeId employeeId;
    private final KPIId kpiId;
    private MetricValue metricValue;
    private final DataTimestamp dataTimestamp;
    private final Instant createdDate;
    
    public PerformanceData(UUID id, EmployeeId employeeId, KPIId kpiId, 
                          MetricValue metricValue, DataTimestamp dataTimestamp) {
        super(id);
        if (employeeId == null) {
            throw new IllegalArgumentException("Employee ID cannot be null");
        }
        if (kpiId == null) {
            throw new IllegalArgumentException("KPI ID cannot be null");
        }
        if (metricValue == null) {
            throw new IllegalArgumentException("Metric value cannot be null");
        }
        if (dataTimestamp == null) {
            throw new IllegalArgumentException("Data timestamp cannot be null");
        }
        
        this.employeeId = employeeId;
        this.kpiId = kpiId;
        this.metricValue = metricValue;
        this.dataTimestamp = dataTimestamp;
        this.createdDate = Instant.now();
    }
    
    public static PerformanceData create(EmployeeId employeeId, KPIId kpiId, 
                                       MetricValue metricValue, DataTimestamp dataTimestamp) {
        return new PerformanceData(UUID.randomUUID(), employeeId, kpiId, metricValue, dataTimestamp);
    }
    
    public static PerformanceData create(EmployeeId employeeId, KPIId kpiId, MetricValue metricValue) {
        return new PerformanceData(UUID.randomUUID(), employeeId, kpiId, metricValue, DataTimestamp.now());
    }
    
    public void updateMetricValue(MetricValue newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("Metric value cannot be null");
        }
        this.metricValue = newValue;
    }
    
    public boolean isForEmployee(EmployeeId employeeId) {
        return this.employeeId.equals(employeeId);
    }
    
    public boolean isForKPI(KPIId kpiId) {
        return this.kpiId.equals(kpiId);
    }
    
    public boolean isFromToday() {
        return dataTimestamp.isToday();
    }
    
    public boolean isFromSameDay(DataTimestamp timestamp) {
        return dataTimestamp.isSameDay(timestamp);
    }
    
    public boolean isRecordedAfter(DataTimestamp timestamp) {
        return dataTimestamp.isAfter(timestamp);
    }
    
    public boolean isRecordedBefore(DataTimestamp timestamp) {
        return dataTimestamp.isBefore(timestamp);
    }
    
    // Getters
    public EmployeeId getEmployeeId() {
        return employeeId;
    }
    
    public KPIId getKpiId() {
        return kpiId;
    }
    
    public MetricValue getMetricValue() {
        return metricValue;
    }
    
    public DataTimestamp getDataTimestamp() {
        return dataTimestamp;
    }
    
    public Instant getCreatedDate() {
        return createdDate;
    }
}