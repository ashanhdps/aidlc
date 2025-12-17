package com.company.dataanalytics.api.mappers;

import com.company.dataanalytics.api.dto.response.PerformanceDataResponse;
import com.company.dataanalytics.domain.aggregates.performance.PerformanceData;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for converting between PerformanceData domain objects and DTOs
 */
@Component
public class PerformanceDataMapper {
    
    /**
     * Convert PerformanceData domain object to PerformanceDataResponse DTO
     */
    public PerformanceDataResponse toResponse(PerformanceData performanceData) {
        if (performanceData == null) {
            return null;
        }
        
        return new PerformanceDataResponse(
            performanceData.getId().toString(),
            performanceData.getEmployeeId().toString(),
            performanceData.getKpiId().toString(),
            performanceData.getMetricValue().getDoubleValue(),
            performanceData.getMetricValue().getUnit(),
            performanceData.getDataTimestamp().getDate(),
            performanceData.getCreatedDate()
        );
    }
    
    /**
     * Convert list of PerformanceData domain objects to list of PerformanceDataResponse DTOs
     */
    public List<PerformanceDataResponse> toResponseList(List<PerformanceData> performanceDataList) {
        if (performanceDataList == null) {
            return null;
        }
        
        return performanceDataList.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
}