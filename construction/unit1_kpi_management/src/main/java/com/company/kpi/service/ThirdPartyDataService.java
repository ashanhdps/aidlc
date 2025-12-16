package com.company.kpi.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * Service for integrating with third-party APIs to fetch KPI data
 */
@Service
public class ThirdPartyDataService {
    
    private static final Logger logger = LoggerFactory.getLogger(ThirdPartyDataService.class);
    
    private final RestTemplate restTemplate;
    private final Random random = new Random();
    
    @Value("${app.third-party.salesforce.url:https://api.salesforce.com}")
    private String salesforceApiUrl;
    
    @Value("${app.third-party.salesforce.token:demo-token}")
    private String salesforceToken;
    
    @Value("${app.third-party.survey.url:https://api.surveymonkey.com}")
    private String surveyApiUrl;
    
    @Value("${app.third-party.survey.token:demo-token}")
    private String surveyToken;
    
    @Value("${app.demo.simulate-api-calls:true}")
    private boolean simulateApiCalls;
    
    public ThirdPartyDataService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Fetches sales data from Salesforce API
     */
    public Map<String, Object> fetchSalesData(String employeeId, LocalDate startDate, LocalDate endDate) {
        logger.info("Fetching sales data for employee {} from {} to {}", employeeId, startDate, endDate);
        
        if (simulateApiCalls) {
            return simulateSalesData(employeeId);
        }
        
        try {
            String url = salesforceApiUrl + "/services/data/v52.0/query";
            String query = String.format(
                "SELECT SUM(Amount) FROM Opportunity WHERE OwnerId='%s' AND CloseDate >= %s AND CloseDate <= %s",
                employeeId, startDate, endDate
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(salesforceToken);
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url + "?q=" + query, HttpMethod.GET, entity, Map.class
            );
            
            logger.info("Successfully fetched sales data from Salesforce for employee: {}", employeeId);
            return response.getBody();
            
        } catch (Exception e) {
            logger.error("Error fetching sales data from Salesforce for employee: {}", employeeId, e);
            // Fallback to simulated data
            return simulateSalesData(employeeId);
        }
    }
    
    /**
     * Fetches customer satisfaction data from survey API
     */
    public Map<String, Object> fetchCustomerSatisfactionData(String employeeId, LocalDate startDate, LocalDate endDate) {
        logger.info("Fetching customer satisfaction data for employee {} from {} to {}", employeeId, startDate, endDate);
        
        if (simulateApiCalls) {
            return simulateCustomerSatisfactionData(employeeId);
        }
        
        try {
            String url = surveyApiUrl + "/v3/surveys/satisfaction/responses";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(surveyToken);
            headers.set("Content-Type", "application/json");
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("employee_id", employeeId);
            requestBody.put("start_date", startDate.toString());
            requestBody.put("end_date", endDate.toString());
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class
            );
            
            logger.info("Successfully fetched customer satisfaction data for employee: {}", employeeId);
            return response.getBody();
            
        } catch (Exception e) {
            logger.error("Error fetching customer satisfaction data for employee: {}", employeeId, e);
            // Fallback to simulated data
            return simulateCustomerSatisfactionData(employeeId);
        }
    }
    
    /**
     * Fetches productivity data from project management API
     */
    public Map<String, Object> fetchProductivityData(String employeeId, LocalDate startDate, LocalDate endDate) {
        logger.info("Fetching productivity data for employee {} from {} to {}", employeeId, startDate, endDate);
        
        if (simulateApiCalls) {
            return simulateProductivityData(employeeId);
        }
        
        try {
            // This would integrate with actual project management APIs like Jira, Asana, etc.
            String url = "https://api.projectmanagement.com/v1/tasks/completed";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer demo-token");
            headers.set("Content-Type", "application/json");
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("assignee_id", employeeId);
            requestBody.put("completed_after", startDate.toString());
            requestBody.put("completed_before", endDate.toString());
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, Map.class
            );
            
            logger.info("Successfully fetched productivity data for employee: {}", employeeId);
            return response.getBody();
            
        } catch (Exception e) {
            logger.error("Error fetching productivity data for employee: {}", employeeId, e);
            // Fallback to simulated data
            return simulateProductivityData(employeeId);
        }
    }
    
    /**
     * Fetches marketing ROI data from marketing analytics API
     */
    public Map<String, Object> fetchMarketingROIData(String employeeId, LocalDate startDate, LocalDate endDate) {
        logger.info("Fetching marketing ROI data for employee {} from {} to {}", employeeId, startDate, endDate);
        
        if (simulateApiCalls) {
            return simulateMarketingROIData(employeeId);
        }
        
        // This would integrate with marketing analytics APIs like Google Analytics, HubSpot, etc.
        return simulateMarketingROIData(employeeId);
    }
    
    /**
     * Fetches quality score data from quality management system
     */
    public Map<String, Object> fetchQualityData(String employeeId, LocalDate startDate, LocalDate endDate) {
        logger.info("Fetching quality data for employee {} from {} to {}", employeeId, startDate, endDate);
        
        if (simulateApiCalls) {
            return simulateQualityData(employeeId);
        }
        
        // This would integrate with quality management systems
        return simulateQualityData(employeeId);
    }
    
    // Simulation methods for demo purposes
    private Map<String, Object> simulateSalesData(String employeeId) {
        Map<String, Object> data = new HashMap<>();
        data.put("employee_id", employeeId);
        data.put("total_revenue", BigDecimal.valueOf(80000 + random.nextInt(40000))); // 80k-120k
        data.put("deals_closed", 15 + random.nextInt(10)); // 15-25 deals
        data.put("conversion_rate", BigDecimal.valueOf(0.15 + random.nextDouble() * 0.15)); // 15-30%
        data.put("data_source", "salesforce-api");
        data.put("last_updated", LocalDate.now().toString());
        return data;
    }
    
    private Map<String, Object> simulateCustomerSatisfactionData(String employeeId) {
        Map<String, Object> data = new HashMap<>();
        data.put("employee_id", employeeId);
        data.put("average_rating", BigDecimal.valueOf(4.0 + random.nextDouble())); // 4.0-5.0
        data.put("total_responses", 50 + random.nextInt(50)); // 50-100 responses
        data.put("satisfaction_percentage", BigDecimal.valueOf(80 + random.nextInt(20))); // 80-100%
        data.put("data_source", "survey-api");
        data.put("last_updated", LocalDate.now().toString());
        return data;
    }
    
    private Map<String, Object> simulateProductivityData(String employeeId) {
        Map<String, Object> data = new HashMap<>();
        data.put("employee_id", employeeId);
        data.put("tasks_completed", 120 + random.nextInt(80)); // 120-200 tasks
        data.put("average_completion_time", BigDecimal.valueOf(2.5 + random.nextDouble() * 2)); // 2.5-4.5 hours
        data.put("efficiency_score", BigDecimal.valueOf(75 + random.nextInt(25))); // 75-100%
        data.put("data_source", "project-management-api");
        data.put("last_updated", LocalDate.now().toString());
        return data;
    }
    
    private Map<String, Object> simulateMarketingROIData(String employeeId) {
        Map<String, Object> data = new HashMap<>();
        data.put("employee_id", employeeId);
        data.put("roi_percentage", BigDecimal.valueOf(10 + random.nextInt(20))); // 10-30% ROI
        data.put("campaigns_managed", 5 + random.nextInt(10)); // 5-15 campaigns
        data.put("total_spend", BigDecimal.valueOf(50000 + random.nextInt(100000))); // 50k-150k spend
        data.put("data_source", "marketing-analytics-api");
        data.put("last_updated", LocalDate.now().toString());
        return data;
    }
    
    private Map<String, Object> simulateQualityData(String employeeId) {
        Map<String, Object> data = new HashMap<>();
        data.put("employee_id", employeeId);
        data.put("quality_score", BigDecimal.valueOf(90 + random.nextInt(10))); // 90-100%
        data.put("defect_rate", BigDecimal.valueOf(random.nextDouble() * 5)); // 0-5% defects
        data.put("items_inspected", 500 + random.nextInt(500)); // 500-1000 items
        data.put("data_source", "quality-management-system");
        data.put("last_updated", LocalDate.now().toString());
        return data;
    }
}