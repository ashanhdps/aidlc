package com.company.dataanalytics.userstories;

import com.company.dataanalytics.infrastructure.config.DataSeeder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureTestMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests for US-029: HR Analytics Dashboard
 * As an HR Personnel, I want to access HR-specific analytics and insights
 * So that I can optimize performance management processes
 */
@SpringBootTest
@AutoConfigureTestMvc
@ActiveProfiles("test")
@DisplayName("US-029: HR Analytics Dashboard")
class US029HRAnalyticsDashboardTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DataSeeder dataSeeder;

    @BeforeEach
    void setUp() {
        dataSeeder.seedDemoData();
    }

    @Test
    @DisplayName("Should display employee engagement and performance trends")
    void shouldDisplayEmployeeEngagementAndPerformanceTrends() throws Exception {
        // Get employee engagement metrics
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/engagement"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallEngagementScore").isNumber())
                .andExpect(jsonPath("$.engagementTrends").isArray())
                .andExpect(jsonPath("$.engagementByDepartment").exists())
                .andExpect(jsonPath("$.engagementFactors").isArray())
                .andExpect(jsonPath("$.period").exists())
                .andExpect(jsonPath("$.lastUpdated").exists());

        // Get performance trends by department
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/performance-trends")
                        .param("period", "6months")
                        .param("groupBy", "department"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period").value("6months"))
                .andExpect(jsonPath("$.trends").isArray())
                .andExpect(jsonPath("$.trends[0].department").exists())
                .andExpect(jsonPath("$.trends[0].averagePerformance").isNumber())
                .andExpect(jsonPath("$.trends[0].trendDirection").exists())
                .andExpect(jsonPath("$.trends[0].monthlyData").isArray());

        // Get performance trends by role
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/performance-trends")
                        .param("period", "3months")
                        .param("groupBy", "role"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trends").isArray())
                .andExpect(jsonPath("$.trends[0].role").exists())
                .andExpect(jsonPath("$.trends[0].employeeCount").isNumber());

        // Get engagement correlation with performance
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/engagement-performance-correlation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correlationCoefficient").isNumber())
                .andExpect(jsonPath("$.significanceLevel").isNumber())
                .andExpect(jsonPath("$.insights").isArray())
                .andExpect(jsonPath("$.recommendations").isArray());
    }

    @Test
    @DisplayName("Should analyze KPI effectiveness and adoption rates")
    void shouldAnalyzeKPIEffectivenessAndAdoptionRates() throws Exception {
        // Get KPI effectiveness analysis
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/kpi-effectiveness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kpiAnalysis").isArray())
                .andExpect(jsonPath("$.kpiAnalysis[0].kpiId").exists())
                .andExpect(jsonPath("$.kpiAnalysis[0].kpiName").exists())
                .andExpect(jsonPath("$.kpiAnalysis[0].adoptionRate").isNumber())
                .andExpect(jsonPath("$.kpiAnalysis[0].effectivenessScore").isNumber())
                .andExpect(jsonPath("$.kpiAnalysis[0].averagePerformance").isNumber())
                .andExpect(jsonPath("$.kpiAnalysis[0].improvementTrend").exists())
                .andExpect(jsonPath("$.kpiAnalysis[0].usageStatistics").exists());

        // Get KPI adoption rates by department
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/kpi-adoption")
                        .param("groupBy", "department"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.adoptionByDepartment").isArray())
                .andExpect(jsonPath("$.adoptionByDepartment[0].department").exists())
                .andExpect(jsonPath("$.adoptionByDepartment[0].totalKPIs").isNumber())
                .andExpect(jsonPath("$.adoptionByDepartment[0].activeKPIs").isNumber())
                .andExpect(jsonPath("$.adoptionByDepartment[0].adoptionRate").isNumber());

        // Get KPI performance distribution
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/kpi-performance-distribution")
                        .param("kpiId", "kpi-sales-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kpiId").value("kpi-sales-001"))
                .andExpect(jsonPath("$.distribution").isArray())
                .andExpect(jsonPath("$.statistics.mean").isNumber())
                .andExpect(jsonPath("$.statistics.median").isNumber())
                .andExpect(jsonPath("$.statistics.standardDeviation").isNumber())
                .andExpect(jsonPath("$.performanceBands").exists());

        // Get underperforming KPIs analysis
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/underperforming-kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.underperformingKPIs").isArray())
                .andExpect(jsonPath("$.underperformingKPIs[0].kpiId").exists())
                .andExpect(jsonPath("$.underperformingKPIs[0].averagePerformance").isNumber())
                .andExpect(jsonPath("$.underperformingKPIs[0].targetPerformance").isNumber())
                .andExpect(jsonPath("$.underperformingKPIs[0].gap").isNumber())
                .andExpect(jsonPath("$.underperformingKPIs[0].affectedEmployees").isNumber())
                .andExpect(jsonPath("$.recommendations").isArray());
    }

    @Test
    @DisplayName("Should provide insights on coaching and feedback patterns")
    void shouldProvideInsightsOnCoachingAndFeedbackPatterns() throws Exception {
        // Get coaching effectiveness analysis
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/coaching-effectiveness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.coachingMetrics").exists())
                .andExpect(jsonPath("$.coachingMetrics.totalCoachingSessions").isNumber())
                .andExpect(jsonPath("$.coachingMetrics.averageSessionsPerEmployee").isNumber())
                .andExpect(jsonPath("$.coachingMetrics.coachingImpactScore").isNumber())
                .andExpect(jsonPath("$.coachingPatterns").isArray())
                .andExpect(jsonPath("$.coachingOutcomes").exists());

        // Get feedback frequency and quality analysis
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/feedback-patterns"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.feedbackMetrics").exists())
                .andExpect(jsonPath("$.feedbackMetrics.totalFeedbackGiven").isNumber())
                .andExpect(jsonPath("$.feedbackMetrics.averageFeedbackPerEmployee").isNumber())
                .andExpect(jsonPath("$.feedbackMetrics.feedbackQualityScore").isNumber())
                .andExpect(jsonPath("$.feedbackTrends").isArray())
                .andExpect(jsonPath("$.feedbackByType").exists());

        // Get manager coaching effectiveness
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/manager-coaching-effectiveness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.managerAnalysis").isArray())
                .andExpect(jsonPath("$.managerAnalysis[0].managerId").exists())
                .andExpect(jsonPath("$.managerAnalysis[0].teamSize").isNumber())
                .andExpect(jsonPath("$.managerAnalysis[0].coachingFrequency").isNumber())
                .andExpect(jsonPath("$.managerAnalysis[0].teamPerformanceImprovement").isNumber())
                .andExpect(jsonPath("$.managerAnalysis[0].coachingEffectivenessScore").isNumber());

        // Get feedback response and action rates
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/feedback-response-rates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.responseRates").exists())
                .andExpect(jsonPath("$.responseRates.overallResponseRate").isNumber())
                .andExpect(jsonPath("$.responseRates.averageResponseTime").isNumber())
                .andExpect(jsonPath("$.actionTakenRate").isNumber())
                .andExpect(jsonPath("$.improvementAfterFeedback").isNumber());
    }

    @Test
    @DisplayName("Should identify high performers and development opportunities")
    void shouldIdentifyHighPerformersAndDevelopmentOpportunities() throws Exception {
        // Get high performers analysis
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/high-performers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.highPerformers").isArray())
                .andExpect(jsonPath("$.highPerformers[0].employeeId").exists())
                .andExpect(jsonPath("$.highPerformers[0].overallScore").isNumber())
                .andExpect(jsonPath("$.highPerformers[0].consistencyScore").isNumber())
                .andExpect(jsonPath("$.highPerformers[0].improvementTrend").exists())
                .andExpect(jsonPath("$.highPerformers[0].strengthAreas").isArray())
                .andExpect(jsonPath("$.criteria").exists())
                .andExpect(jsonPath("$.totalHighPerformers").isNumber());

        // Get development opportunities analysis
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/development-opportunities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.developmentOpportunities").isArray())
                .andExpect(jsonPath("$.developmentOpportunities[0].employeeId").exists())
                .andExpect(jsonPath("$.developmentOpportunities[0].currentPerformance").isNumber())
                .andExpect(jsonPath("$.developmentOpportunities[0].potentialScore").isNumber())
                .andExpect(jsonPath("$.developmentOpportunities[0].developmentAreas").isArray())
                .andExpect(jsonPath("$.developmentOpportunities[0].recommendedActions").isArray())
                .andExpect(jsonPath("$.developmentOpportunities[0].priority").exists());

        // Get talent pipeline analysis
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/talent-pipeline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pipelineAnalysis").exists())
                .andExpect(jsonPath("$.pipelineAnalysis.readyForPromotion").isNumber())
                .andExpect(jsonPath("$.pipelineAnalysis.highPotential").isNumber())
                .andExpect(jsonPath("$.pipelineAnalysis.needsDevelopment").isNumber())
                .andExpect(jsonPath("$.pipelineAnalysis.atRisk").isNumber())
                .andExpect(jsonPath("$.successorPlanning").isArray());

        // Get performance improvement candidates
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/improvement-candidates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.improvementCandidates").isArray())
                .andExpect(jsonPath("$.improvementCandidates[0].employeeId").exists())
                .andExpect(jsonPath("$.improvementCandidates[0].currentPerformance").isNumber())
                .andExpect(jsonPath("$.improvementCandidates[0].performanceGap").isNumber())
                .andExpect(jsonPath("$.improvementCandidates[0].improvementPlan").exists())
                .andExpect(jsonPath("$.improvementCandidates[0].timeframe").exists());
    }

    @Test
    @DisplayName("Should support workforce planning and talent management analytics")
    void shouldSupportWorkforcePlanningAndTalentManagement() throws Exception {
        // Get workforce composition analysis
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/workforce-composition"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.composition").exists())
                .andExpect(jsonPath("$.composition.byDepartment").exists())
                .andExpect(jsonPath("$.composition.byRole").exists())
                .andExpect(jsonPath("$.composition.byPerformanceLevel").exists())
                .andExpect(jsonPath("$.composition.byTenure").exists())
                .andExpect(jsonPath("$.totalEmployees").isNumber())
                .andExpect(jsonPath("$.diversityMetrics").exists());

        // Get retention and turnover analysis
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/retention-analysis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.retentionMetrics").exists())
                .andExpect(jsonPath("$.retentionMetrics.overallRetentionRate").isNumber())
                .andExpect(jsonPath("$.retentionMetrics.retentionByDepartment").exists())
                .andExpect(jsonPath("$.retentionMetrics.retentionByPerformance").exists())
                .andExpect(jsonPath("$.turnoverRisk").isArray())
                .andExpect(jsonPath("$.retentionStrategies").isArray());

        // Get skills gap analysis
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/skills-gap-analysis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.skillsAnalysis").exists())
                .andExpect(jsonPath("$.skillsAnalysis.criticalSkillGaps").isArray())
                .andExpect(jsonPath("$.skillsAnalysis.emergingSkillNeeds").isArray())
                .andExpect(jsonPath("$.skillsAnalysis.trainingRecommendations").isArray())
                .andExpect(jsonPath("$.skillsAnalysis.hiringPriorities").isArray());

        // Get succession planning insights
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/succession-planning"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successionPlanning").exists())
                .andExpect(jsonPath("$.successionPlanning.keyPositions").isArray())
                .andExpect(jsonPath("$.successionPlanning.readySuccessors").isNumber())
                .andExpect(jsonPath("$.successionPlanning.developingSuccessors").isNumber())
                .andExpect(jsonPath("$.successionPlanning.criticalGaps").isArray())
                .andExpect(jsonPath("$.successionPlanning.developmentPlans").isArray());
    }

    @Test
    @DisplayName("Should provide customizable HR dashboard with key metrics")
    void shouldProvideCustomizableHRDashboardWithKeyMetrics() throws Exception {
        // Get default HR dashboard
        mockMvc.perform(get("/api/v1/data-analytics/hr/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dashboardId").exists())
                .andExpect(jsonPath("$.widgets").isArray())
                .andExpect(jsonPath("$.widgets[0].widgetType").exists())
                .andExpect(jsonPath("$.widgets[0].title").exists())
                .andExpect(jsonPath("$.widgets[0].data").exists())
                .andExpect(jsonPath("$.lastUpdated").exists())
                .andExpect(jsonPath("$.refreshInterval").isNumber());

        // Customize dashboard configuration
        String dashboardConfigJson = """
                {
                    "dashboardName": "Custom HR Analytics Dashboard",
                    "widgets": [
                        {
                            "widgetType": "PERFORMANCE_OVERVIEW",
                            "title": "Team Performance Overview",
                            "position": {"row": 1, "col": 1, "width": 2, "height": 1},
                            "configuration": {
                                "period": "30days",
                                "groupBy": "department"
                            }
                        },
                        {
                            "widgetType": "KPI_EFFECTIVENESS",
                            "title": "KPI Effectiveness Analysis",
                            "position": {"row": 1, "col": 3, "width": 2, "height": 1},
                            "configuration": {
                                "showTrends": true,
                                "includeAdoptionRates": true
                            }
                        },
                        {
                            "widgetType": "HIGH_PERFORMERS",
                            "title": "Top Performers This Quarter",
                            "position": {"row": 2, "col": 1, "width": 1, "height": 1},
                            "configuration": {
                                "limit": 10,
                                "period": "quarter"
                            }
                        },
                        {
                            "widgetType": "DEVELOPMENT_OPPORTUNITIES",
                            "title": "Development Focus Areas",
                            "position": {"row": 2, "col": 2, "width": 1, "height": 1},
                            "configuration": {
                                "priorityLevel": "HIGH"
                            }
                        }
                    ],
                    "refreshInterval": 300,
                    "autoRefresh": true
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/hr/dashboard/customize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dashboardConfigJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dashboardName").value("Custom HR Analytics Dashboard"))
                .andExpect(jsonPath("$.widgets").isArray())
                .andExpect(jsonPath("$.widgets.length()").value(4))
                .andExpect(jsonPath("$.refreshInterval").value(300));

        // Get customized dashboard data
        mockMvc.perform(get("/api/v1/data-analytics/hr/dashboard/custom"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.widgets").isArray())
                .andExpect(jsonPath("$.widgets[?(@.widgetType == 'PERFORMANCE_OVERVIEW')]").exists())
                .andExpect(jsonPath("$.widgets[?(@.widgetType == 'KPI_EFFECTIVENESS')]").exists());
    }

    @Test
    @DisplayName("Should provide real-time alerts and notifications for HR insights")
    void shouldProvideRealTimeAlertsAndNotificationsForHRInsights() throws Exception {
        // Get HR alert configurations
        mockMvc.perform(get("/api/v1/data-analytics/hr/alerts/configurations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alertConfigurations").isArray())
                .andExpect(jsonPath("$.alertConfigurations[0].alertType").exists())
                .andExpect(jsonPath("$.alertConfigurations[0].threshold").exists())
                .andExpect(jsonPath("$.alertConfigurations[0].enabled").isBoolean());

        // Configure custom HR alerts
        String alertConfigJson = """
                {
                    "alertConfigurations": [
                        {
                            "alertType": "PERFORMANCE_DECLINE",
                            "threshold": {
                                "performanceDropPercentage": 15,
                                "timeWindow": "30days"
                            },
                            "enabled": true,
                            "recipients": ["hr@company.com", "manager@company.com"],
                            "severity": "HIGH"
                        },
                        {
                            "alertType": "LOW_ENGAGEMENT",
                            "threshold": {
                                "engagementScore": 60,
                                "departmentLevel": true
                            },
                            "enabled": true,
                            "recipients": ["hr@company.com"],
                            "severity": "MEDIUM"
                        },
                        {
                            "alertType": "HIGH_PERFORMER_RISK",
                            "threshold": {
                                "performanceLevel": "TOP_10_PERCENT",
                                "engagementDrop": 20
                            },
                            "enabled": true,
                            "recipients": ["hr@company.com", "executive@company.com"],
                            "severity": "CRITICAL"
                        }
                    ]
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/hr/alerts/configure")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(alertConfigJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alertConfigurations").isArray())
                .andExpect(jsonPath("$.alertConfigurations.length()").value(3));

        // Get active HR alerts
        mockMvc.perform(get("/api/v1/data-analytics/hr/alerts/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeAlerts").isArray())
                .andExpect(jsonPath("$.activeAlerts[0].alertId").exists())
                .andExpect(jsonPath("$.activeAlerts[0].alertType").exists())
                .andExpect(jsonPath("$.activeAlerts[0].severity").exists())
                .andExpect(jsonPath("$.activeAlerts[0].triggeredAt").exists())
                .andExpect(jsonPath("$.activeAlerts[0].description").exists());

        // Get alert history and trends
        mockMvc.perform(get("/api/v1/data-analytics/hr/alerts/history")
                        .param("period", "90days"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alertHistory").isArray())
                .andExpect(jsonPath("$.alertTrends").exists())
                .andExpect(jsonPath("$.alertSummary").exists());
    }

    @Test
    @DisplayName("Should export HR analytics data in multiple formats")
    void shouldExportHRAnalyticsDataInMultipleFormats() throws Exception {
        // Export performance trends as CSV
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/performance-trends/export")
                        .param("format", "CSV")
                        .param("period", "6months"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=performance-trends.csv"));

        // Export KPI effectiveness as Excel
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/kpi-effectiveness/export")
                        .param("format", "EXCEL"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));

        // Export high performers list as PDF
        mockMvc.perform(get("/api/v1/data-analytics/hr/analytics/high-performers/export")
                        .param("format", "PDF"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"));

        // Export comprehensive HR report
        String reportRequestJson = """
                {
                    "reportType": "COMPREHENSIVE_HR_ANALYTICS",
                    "period": "quarter",
                    "includeCharts": true,
                    "sections": [
                        "PERFORMANCE_OVERVIEW",
                        "KPI_ANALYSIS",
                        "TALENT_INSIGHTS",
                        "WORKFORCE_PLANNING"
                    ],
                    "format": "PDF"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/hr/analytics/export-report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportRequestJson))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.reportId").exists())
                .andExpect(jsonPath("$.status").value("GENERATING"))
                .andExpect(jsonPath("$.estimatedCompletionTime").exists());
    }
}