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
 * Tests for US-028: Generate Performance Reports
 * As an Executive Manager, I want to generate comprehensive performance analytics and reports
 * So that I can make data-driven organizational decisions
 */
@SpringBootTest
@AutoConfigureTestMvc
@ActiveProfiles("test")
@DisplayName("US-028: Generate Performance Reports")
class US028GeneratePerformanceReportsTest {

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
    @DisplayName("Should create custom reports with various metrics and filters")
    void shouldCreateCustomReportsWithVariousMetricsAndFilters() throws Exception {
        // Create custom performance report with multiple filters
        String customReportJson = """
                {
                    "reportName": "Q4 Sales Team Performance Analysis",
                    "reportType": "CUSTOM_PERFORMANCE_REPORT",
                    "description": "Comprehensive analysis of sales team performance for Q4 2024",
                    "filters": {
                        "departments": ["Sales"],
                        "roles": ["EMPLOYEE", "SUPERVISOR"],
                        "dateRange": {
                            "startDate": "2024-10-01",
                            "endDate": "2024-12-31"
                        },
                        "kpiIds": ["kpi-sales-001", "kpi-quality-002"],
                        "performanceThreshold": {
                            "minimum": 70.0,
                            "maximum": 100.0
                        }
                    },
                    "metrics": [
                        "AVERAGE_PERFORMANCE",
                        "PERFORMANCE_DISTRIBUTION",
                        "TREND_ANALYSIS",
                        "GOAL_ACHIEVEMENT_RATE",
                        "IMPROVEMENT_RATE",
                        "COMPARATIVE_ANALYSIS"
                    ],
                    "groupBy": ["department", "role", "manager"],
                    "sortBy": "averagePerformance",
                    "sortOrder": "DESC",
                    "format": "PDF",
                    "includeCharts": true,
                    "includeDetailedBreakdown": true
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/reports/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(customReportJson))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.reportId").exists())
                .andExpect(jsonPath("$.reportName").value("Q4 Sales Team Performance Analysis"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.estimatedCompletionTime").exists())
                .andReturn().getResponse().getContentAsString();

        String reportId = objectMapper.readTree(response).get("reportId").asText();

        // Verify report configuration was saved
        mockMvc.perform(get("/api/v1/data-analytics/reports/" + reportId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reportName").value("Q4 Sales Team Performance Analysis"))
                .andExpect(jsonPath("$.filters.departments[0]").value("Sales"))
                .andExpect(jsonPath("$.metrics").isArray())
                .andExpect(jsonPath("$.metrics.length()").value(6));

        // Test report with different filter combinations
        String departmentReportJson = """
                {
                    "reportName": "Department Comparison Report",
                    "reportType": "DEPARTMENT_COMPARISON",
                    "filters": {
                        "departments": ["Sales", "Engineering", "Marketing"],
                        "dateRange": {
                            "startDate": "2024-11-01",
                            "endDate": "2024-12-16"
                        }
                    },
                    "metrics": ["AVERAGE_PERFORMANCE", "EMPLOYEE_COUNT", "TOP_PERFORMERS"],
                    "format": "EXCEL"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/reports/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(departmentReportJson))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.reportType").value("DEPARTMENT_COMPARISON"))
                .andExpect(jsonPath("$.format").value("EXCEL"));
    }

    @Test
    @DisplayName("Should include trend analysis and predictive insights in reports")
    void shouldIncludeTrendAnalysisAndPredictiveInsights() throws Exception {
        // Generate report with advanced analytics
        String analyticsReportJson = """
                {
                    "reportName": "Performance Trends and Predictions",
                    "reportType": "ADVANCED_ANALYTICS",
                    "description": "Comprehensive trend analysis with predictive insights for strategic planning",
                    "filters": {
                        "dateRange": {
                            "startDate": "2024-06-01",
                            "endDate": "2024-12-16"
                        },
                        "includeAllEmployees": true
                    },
                    "analytics": {
                        "trendAnalysis": {
                            "enabled": true,
                            "trendPeriod": "monthly",
                            "includeSeasonality": true,
                            "detectAnomalies": true
                        },
                        "predictiveInsights": {
                            "enabled": true,
                            "forecastPeriod": "3months",
                            "confidenceLevel": 95,
                            "includeScenarios": ["optimistic", "realistic", "pessimistic"]
                        },
                        "correlationAnalysis": {
                            "enabled": true,
                            "analyzeKPICorrelations": true,
                            "analyzeDepartmentCorrelations": true
                        },
                        "benchmarking": {
                            "enabled": true,
                            "benchmarkAgainst": ["industry", "historical", "targets"]
                        }
                    },
                    "format": "PDF",
                    "includeExecutiveSummary": true
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/reports/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(analyticsReportJson))
                .andExpected(status().isAccepted())
                .andReturn().getResponse().getContentAsString();

        String reportId = objectMapper.readTree(response).get("reportId").asText();

        // Check report includes trend analysis
        mockMvc.perform(get("/api/v1/data-analytics/reports/" + reportId + "/preview"))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.sections").isArray())
                .andExpected(jsonPath("$.sections[?(@.type == 'TREND_ANALYSIS')]").exists())
                .andExpected(jsonPath("$.sections[?(@.type == 'PREDICTIVE_INSIGHTS')]").exists())
                .andExpected(jsonPath("$.sections[?(@.type == 'CORRELATION_ANALYSIS')]").exists())
                .andExpected(jsonPath("$.executiveSummary").exists());

        // Get trend analysis data specifically
        mockMvc.perform(get("/api/v1/data-analytics/reports/" + reportId + "/trend-analysis"))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.trends").isArray())
                .andExpected(jsonPath("$.trends[0].metric").exists())
                .andExpected(jsonPath("$.trends[0].direction").exists())
                .andExpected(jsonPath("$.trends[0].strength").isNumber())
                .andExpected(jsonPath("$.trends[0].significance").isNumber())
                .andExpected(jsonPath("$.seasonalityDetected").isBoolean())
                .andExpected(jsonPath("$.anomalies").isArray());

        // Get predictive insights
        mockMvc.perform(get("/api/v1/data-analytics/reports/" + reportId + "/predictive-insights"))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.predictions").isArray())
                .andExpected(jsonPath("$.predictions[0].metric").exists())
                .andExpected(jsonPath("$.predictions[0].forecastValue").isNumber())
                .andExpected(jsonPath("$.predictions[0].confidenceInterval").exists())
                .andExpected(jsonPath("$.predictions[0].scenarios").exists())
                .andExpected(jsonPath("$.modelAccuracy").isNumber());
    }

    @Test
    @DisplayName("Should schedule automated report generation and distribution")
    void shouldScheduleAutomatedReportGenerationAndDistribution() throws Exception {
        // Create scheduled report
        String scheduledReportJson = """
                {
                    "reportName": "Weekly Performance Summary",
                    "reportType": "SCHEDULED_SUMMARY",
                    "description": "Automated weekly performance summary for executive team",
                    "template": {
                        "filters": {
                            "dateRange": {
                                "type": "RELATIVE",
                                "period": "LAST_7_DAYS"
                            },
                            "includeAllDepartments": true
                        },
                        "metrics": [
                            "WEEKLY_PERFORMANCE_AVERAGE",
                            "PERFORMANCE_CHANGE",
                            "TOP_PERFORMERS",
                            "AREAS_OF_CONCERN",
                            "KEY_ACHIEVEMENTS"
                        ],
                        "format": "PDF"
                    },
                    "schedule": {
                        "frequency": "WEEKLY",
                        "dayOfWeek": "MONDAY",
                        "time": "08:00",
                        "timezone": "UTC",
                        "startDate": "2024-12-23",
                        "endDate": "2025-03-31"
                    },
                    "distribution": {
                        "recipients": [
                            {
                                "email": "executive@company.com",
                                "role": "PRIMARY_RECIPIENT",
                                "deliveryMethod": "EMAIL"
                            },
                            {
                                "email": "hr@company.com",
                                "role": "CC_RECIPIENT",
                                "deliveryMethod": "EMAIL"
                            }
                        ],
                        "subject": "Weekly Performance Summary - {{date}}",
                        "message": "Please find attached the weekly performance summary report.",
                        "includeDirectLink": true
                    },
                    "notifications": {
                        "onSuccess": true,
                        "onFailure": true,
                        "notifyRecipients": ["admin@company.com"]
                    }
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/reports/schedule")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(scheduledReportJson))
                .andExpected(status().isCreated())
                .andExpected(jsonPath("$.scheduleId").exists())
                .andExpected(jsonPath("$.reportName").value("Weekly Performance Summary"))
                .andExpected(jsonPath("$.schedule.frequency").value("WEEKLY"))
                .andExpected(jsonPath("$.nextExecutionTime").exists())
                .andReturn().getResponse().getContentAsString();

        String scheduleId = objectMapper.readTree(response).get("scheduleId").asText();

        // Verify scheduled report configuration
        mockMvc.perform(get("/api/v1/data-analytics/reports/schedules/" + scheduleId))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.schedule.frequency").value("WEEKLY"))
                .andExpected(jsonPath("$.distribution.recipients").isArray())
                .andExpected(jsonPath("$.distribution.recipients.length()").value(2));

        // Get all scheduled reports
        mockMvc.perform(get("/api/v1/data-analytics/reports/schedules"))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$").isArray())
                .andExpected(jsonPath("$[?(@.scheduleId == '" + scheduleId + "')]").exists());

        // Test schedule modification
        String updateScheduleJson = """
                {
                    "schedule": {
                        "frequency": "DAILY",
                        "time": "07:00"
                    },
                    "distribution": {
                        "recipients": [
                            {
                                "email": "executive@company.com",
                                "role": "PRIMARY_RECIPIENT",
                                "deliveryMethod": "EMAIL"
                            }
                        ]
                    }
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/reports/schedules/" + scheduleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateScheduleJson))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.schedule.frequency").value("DAILY"))
                .andExpected(jsonPath("$.distribution.recipients.length()").value(1));
    }

    @Test
    @DisplayName("Should export reports in multiple formats with proper formatting")
    void shouldExportReportsInMultipleFormatsWithProperFormatting() throws Exception {
        // Generate report for export testing
        String reportJson = """
                {
                    "reportName": "Multi-Format Export Test",
                    "reportType": "PERFORMANCE_SUMMARY",
                    "filters": {
                        "dateRange": {
                            "startDate": "2024-12-01",
                            "endDate": "2024-12-16"
                        }
                    },
                    "metrics": ["AVERAGE_PERFORMANCE", "TOP_PERFORMERS", "DEPARTMENT_BREAKDOWN"],
                    "format": "PDF"
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/reports/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportJson))
                .andExpected(status().isAccepted())
                .andReturn().getResponse().getContentAsString();

        String reportId = objectMapper.readTree(response).get("reportId").asText();

        // Wait for report generation (simulate completion)
        Thread.sleep(1000);

        // Export as PDF
        mockMvc.perform(get("/api/v1/data-analytics/reports/" + reportId + "/export")
                        .param("format", "PDF"))
                .andExpected(status().isOk())
                .andExpected(header().string("Content-Type", "application/pdf"))
                .andExpected(header().string("Content-Disposition", "attachment; filename=Multi-Format Export Test.pdf"));

        // Export as Excel
        mockMvc.perform(get("/api/v1/data-analytics/reports/" + reportId + "/export")
                        .param("format", "EXCEL"))
                .andExpected(status().isOk())
                .andExpected(header().string("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpected(header().string("Content-Disposition", "attachment; filename=Multi-Format Export Test.xlsx"));

        // Export as CSV
        mockMvc.perform(get("/api/v1/data-analytics/reports/" + reportId + "/export")
                        .param("format", "CSV"))
                .andExpected(status().isOk())
                .andExpected(header().string("Content-Type", "text/csv"))
                .andExpected(header().string("Content-Disposition", "attachment; filename=Multi-Format Export Test.csv"));

        // Export as PowerPoint
        mockMvc.perform(get("/api/v1/data-analytics/reports/" + reportId + "/export")
                        .param("format", "POWERPOINT"))
                .andExpected(status().isOk())
                .andExpected(header().string("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation"))
                .andExpected(header().string("Content-Disposition", "attachment; filename=Multi-Format Export Test.pptx"));

        // Test export with custom formatting options
        String customExportJson = """
                {
                    "format": "PDF",
                    "options": {
                        "includeCharts": true,
                        "includeRawData": false,
                        "pageOrientation": "LANDSCAPE",
                        "fontSize": "MEDIUM",
                        "colorScheme": "CORPORATE",
                        "includeWatermark": true,
                        "watermarkText": "CONFIDENTIAL"
                    }
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/reports/" + reportId + "/export-custom")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(customExportJson))
                .andExpected(status().isOk())
                .andExpected(header().string("Content-Type", "application/pdf"));
    }

    @Test
    @DisplayName("Should create and customize executive dashboards with KPIs")
    void shouldCreateAndCustomizeExecutiveDashboardsWithKPIs() throws Exception {
        // Create executive dashboard
        String dashboardJson = """
                {
                    "dashboardName": "Executive Performance Dashboard",
                    "description": "High-level performance overview for executive decision making",
                    "dashboardType": "EXECUTIVE",
                    "layout": {
                        "columns": 4,
                        "rows": 3
                    },
                    "widgets": [
                        {
                            "widgetType": "KPI_SUMMARY",
                            "title": "Overall Performance",
                            "position": {"row": 1, "col": 1, "width": 2, "height": 1},
                            "configuration": {
                                "kpiIds": ["kpi-sales-001", "kpi-quality-002", "kpi-efficiency-003"],
                                "displayType": "GAUGE",
                                "showTrend": true,
                                "period": "30days"
                            }
                        },
                        {
                            "widgetType": "PERFORMANCE_TREND",
                            "title": "Performance Trends",
                            "position": {"row": 1, "col": 3, "width": 2, "height": 1},
                            "configuration": {
                                "chartType": "LINE",
                                "period": "6months",
                                "groupBy": "month"
                            }
                        },
                        {
                            "widgetType": "TOP_PERFORMERS",
                            "title": "Top Performers",
                            "position": {"row": 2, "col": 1, "width": 1, "height": 1},
                            "configuration": {
                                "limit": 5,
                                "period": "current_quarter"
                            }
                        },
                        {
                            "widgetType": "DEPARTMENT_COMPARISON",
                            "title": "Department Performance",
                            "position": {"row": 2, "col": 2, "width": 2, "height": 1},
                            "configuration": {
                                "chartType": "BAR",
                                "metric": "AVERAGE_PERFORMANCE"
                            }
                        },
                        {
                            "widgetType": "ALERTS_SUMMARY",
                            "title": "Performance Alerts",
                            "position": {"row": 2, "col": 4, "width": 1, "height": 1},
                            "configuration": {
                                "showCriticalOnly": true,
                                "limit": 10
                            }
                        },
                        {
                            "widgetType": "GOAL_ACHIEVEMENT",
                            "title": "Goal Achievement Rate",
                            "position": {"row": 3, "col": 1, "width": 4, "height": 1},
                            "configuration": {
                                "chartType": "PROGRESS_BAR",
                                "groupBy": "department",
                                "showTargets": true
                            }
                        }
                    ],
                    "refreshInterval": 300,
                    "autoRefresh": true,
                    "accessControl": {
                        "allowedRoles": ["EXECUTIVE", "ADMIN"],
                        "allowedUsers": ["executive@company.com", "ceo@company.com"]
                    }
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/dashboards/executive")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(dashboardJson))
                .andExpected(status().isCreated())
                .andExpected(jsonPath("$.dashboardId").exists())
                .andExpected(jsonPath("$.dashboardName").value("Executive Performance Dashboard"))
                .andExpected(jsonPath("$.widgets").isArray())
                .andExpected(jsonPath("$.widgets.length()").value(6))
                .andReturn().getResponse().getContentAsString();

        String dashboardId = objectMapper.readTree(response).get("dashboardId").asText();

        // Get dashboard data
        mockMvc.perform(get("/api/v1/data-analytics/dashboards/" + dashboardId))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.widgets").isArray())
                .andExpected(jsonPath("$.widgets[0].data").exists())
                .andExpected(jsonPath("$.lastUpdated").exists());

        // Customize dashboard layout
        String customizationJson = """
                {
                    "widgets": [
                        {
                            "widgetId": "existing-widget-id",
                            "position": {"row": 1, "col": 1, "width": 3, "height": 1},
                            "configuration": {
                                "period": "90days"
                            }
                        }
                    ],
                    "addWidgets": [
                        {
                            "widgetType": "REVENUE_IMPACT",
                            "title": "Performance Revenue Impact",
                            "position": {"row": 3, "col": 1, "width": 2, "height": 1},
                            "configuration": {
                                "showProjections": true,
                                "currency": "USD"
                            }
                        }
                    ]
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/dashboards/" + dashboardId + "/customize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(customizationJson))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.widgets").isArray());

        // Get dashboard widget data individually
        mockMvc.perform(get("/api/v1/data-analytics/dashboards/" + dashboardId + "/widgets/KPI_SUMMARY"))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.widgetType").value("KPI_SUMMARY"))
                .andExpected(jsonPath("$.data").exists())
                .andExpected(jsonPath("$.lastUpdated").exists());
    }

    @Test
    @DisplayName("Should share reports with specific stakeholders and manage permissions")
    void shouldShareReportsWithSpecificStakeholdersAndManagePermissions() throws Exception {
        // Generate report for sharing
        String reportJson = """
                {
                    "reportName": "Confidential Performance Analysis",
                    "reportType": "PERFORMANCE_ANALYSIS",
                    "filters": {
                        "dateRange": {
                            "startDate": "2024-11-01",
                            "endDate": "2024-12-16"
                        }
                    },
                    "format": "PDF"
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/reports/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reportJson))
                .andExpected(status().isAccepted())
                .andReturn().getResponse().getContentAsString();

        String reportId = objectMapper.readTree(response).get("reportId").asText();

        // Share report with specific stakeholders
        String shareRequestJson = """
                {
                    "shareWith": [
                        {
                            "email": "executive@company.com",
                            "role": "VIEWER",
                            "permissions": ["VIEW", "DOWNLOAD"],
                            "expirationDate": "2025-01-31"
                        },
                        {
                            "email": "hr@company.com",
                            "role": "COLLABORATOR",
                            "permissions": ["VIEW", "DOWNLOAD", "COMMENT"],
                            "expirationDate": "2025-01-31"
                        },
                        {
                            "email": "supervisor@company.com",
                            "role": "VIEWER",
                            "permissions": ["VIEW"],
                            "expirationDate": "2024-12-31"
                        }
                    ],
                    "shareSettings": {
                        "requireLogin": true,
                        "allowForwarding": false,
                        "trackAccess": true,
                        "watermarkEnabled": true,
                        "downloadLimit": 5
                    },
                    "notification": {
                        "sendEmail": true,
                        "subject": "Performance Analysis Report - Confidential",
                        "message": "Please find the confidential performance analysis report. This document contains sensitive information and should be handled accordingly.",
                        "includeDirectLink": true
                    }
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/reports/" + reportId + "/share")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(shareRequestJson))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.shareId").exists())
                .andExpected(jsonPath("$.sharedWith").isArray())
                .andExpected(jsonPath("$.sharedWith.length()").value(3))
                .andExpected(jsonPath("$.shareSettings.requireLogin").value(true));

        // Get report sharing status
        mockMvc.perform(get("/api/v1/data-analytics/reports/" + reportId + "/sharing"))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.isShared").value(true))
                .andExpected(jsonPath("$.sharedWith").isArray())
                .andExpected(jsonPath("$.accessLog").isArray());

        // Update sharing permissions
        String updatePermissionsJson = """
                {
                    "email": "supervisor@company.com",
                    "permissions": ["VIEW", "DOWNLOAD"],
                    "expirationDate": "2025-01-15"
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/reports/" + reportId + "/sharing/supervisor@company.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePermissionsJson))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.permissions").isArray())
                .andExpected(jsonPath("$.permissions.length()").value(2));

        // Revoke access
        mockMvc.perform(delete("/api/v1/data-analytics/reports/" + reportId + "/sharing/supervisor@company.com"))
                .andExpected(status().isNoContent());

        // Verify access was revoked
        mockMvc.perform(get("/api/v1/data-analytics/reports/" + reportId + "/sharing"))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.sharedWith.length()").value(2))
                .andExpected(jsonPath("$.sharedWith[?(@.email == 'supervisor@company.com')]").doesNotExist());
    }

    @Test
    @DisplayName("Should save and reuse report templates for efficiency")
    void shouldSaveAndReuseReportTemplatesForEfficiency() throws Exception {
        // Create reusable report template
        String templateJson = """
                {
                    "templateName": "Monthly Department Performance Template",
                    "description": "Standard template for monthly department performance analysis",
                    "category": "DEPARTMENT_ANALYSIS",
                    "template": {
                        "reportType": "DEPARTMENT_PERFORMANCE",
                        "filters": {
                            "dateRange": {
                                "type": "RELATIVE",
                                "period": "LAST_30_DAYS"
                            },
                            "departments": "{{DEPARTMENTS}}",
                            "includeSubordinates": true
                        },
                        "metrics": [
                            "AVERAGE_PERFORMANCE",
                            "PERFORMANCE_DISTRIBUTION",
                            "TOP_PERFORMERS",
                            "IMPROVEMENT_AREAS",
                            "GOAL_ACHIEVEMENT_RATE"
                        ],
                        "groupBy": ["department", "role"],
                        "sortBy": "averagePerformance",
                        "includeCharts": true,
                        "format": "{{FORMAT}}"
                    },
                    "parameters": [
                        {
                            "name": "DEPARTMENTS",
                            "type": "MULTI_SELECT",
                            "required": true,
                            "options": ["Sales", "Engineering", "Marketing", "HR", "Finance"],
                            "defaultValue": ["Sales"]
                        },
                        {
                            "name": "FORMAT",
                            "type": "SELECT",
                            "required": true,
                            "options": ["PDF", "EXCEL", "POWERPOINT"],
                            "defaultValue": "PDF"
                        }
                    ],
                    "accessControl": {
                        "allowedRoles": ["EXECUTIVE", "HR", "ADMIN"],
                        "isPublic": false
                    }
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/reports/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(templateJson))
                .andExpected(status().isCreated())
                .andExpected(jsonPath("$.templateId").exists())
                .andExpected(jsonPath("$.templateName").value("Monthly Department Performance Template"))
                .andExpected(jsonPath("$.parameters").isArray())
                .andExpected(jsonPath("$.parameters.length()").value(2))
                .andReturn().getResponse().getContentAsString();

        String templateId = objectMapper.readTree(response).get("templateId").asText();

        // Use template to generate report
        String generateFromTemplateJson = """
                {
                    "templateId": """ + "\"" + templateId + "\"" + """,
                    "reportName": "December Sales Department Performance",
                    "parameters": {
                        "DEPARTMENTS": ["Sales"],
                        "FORMAT": "PDF"
                    },
                    "customizations": {
                        "description": "December 2024 sales department performance analysis",
                        "additionalFilters": {
                            "performanceThreshold": {
                                "minimum": 75.0
                            }
                        }
                    }
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/reports/generate-from-template")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(generateFromTemplateJson))
                .andExpected(status().isAccepted())
                .andExpected(jsonPath("$.reportName").value("December Sales Department Performance"))
                .andExpected(jsonPath("$.templateId").value(templateId))
                .andExpected(jsonPath("$.status").value("PENDING"));

        // Get all available templates
        mockMvc.perform(get("/api/v1/data-analytics/reports/templates"))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$").isArray())
                .andExpected(jsonPath("$[?(@.templateId == '" + templateId + "')]").exists());

        // Get template by category
        mockMvc.perform(get("/api/v1/data-analytics/reports/templates")
                        .param("category", "DEPARTMENT_ANALYSIS"))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$").isArray())
                .andExpected(jsonPath("$[0].category").value("DEPARTMENT_ANALYSIS"));

        // Update template
        String updateTemplateJson = """
                {
                    "description": "Updated standard template for monthly department performance analysis with enhanced metrics",
                    "template": {
                        "metrics": [
                            "AVERAGE_PERFORMANCE",
                            "PERFORMANCE_DISTRIBUTION",
                            "TOP_PERFORMERS",
                            "IMPROVEMENT_AREAS",
                            "GOAL_ACHIEVEMENT_RATE",
                            "EMPLOYEE_SATISFACTION_CORRELATION"
                        ]
                    }
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/reports/templates/" + templateId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateTemplateJson))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.template.metrics").isArray())
                .andExpected(jsonPath("$.template.metrics.length()").value(6));
    }
}