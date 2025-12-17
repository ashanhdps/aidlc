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
 * Tests for US-031: Maker-Checker Approval Workflow
 * As a System Administrator, I want to implement maker-checker approval processes for critical system changes
 * So that important modifications are reviewed and approved before implementation
 */
@SpringBootTest
@AutoConfigureTestMvc
@ActiveProfiles("test")
@DisplayName("US-031: Maker-Checker Approval Workflow")
class US031MakerCheckerApprovalTest {

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
    @DisplayName("Should identify critical changes requiring approval")
    void shouldIdentifyCriticalChangesRequiringApproval() throws Exception {
        // Test critical user role change (requires approval)
        String criticalRoleChangeJson = """
                {
                    "userId": "john.doe@company.com",
                    "newRole": "ADMIN",
                    "justification": "Promoting to admin role for system management responsibilities",
                    "supportingDocuments": ["promotion-approval.pdf", "security-clearance.pdf"]
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/approval-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(criticalRoleChangeJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requestType").value("USER_ROLE_CHANGE"))
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"))
                .andExpect(jsonPath("$.requiresApproval").value(true))
                .andExpect(jsonPath("$.justification").value("Promoting to admin role for system management responsibilities"));

        // Test non-critical change (auto-approved)
        String nonCriticalChangeJson = """
                {
                    "userId": "john.doe@company.com",
                    "username": "john.doe.updated",
                    "justification": "Username update for consistency"
                }
                """;

        mockMvc.perform(post("/api/v1/data-analytics/admin/approval-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nonCriticalChangeJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requestType").value("USER_PROFILE_UPDATE"))
                .andExpect(jsonPath("$.status").value("AUTO_APPROVED"))
                .andExpect(jsonPath("$.requiresApproval").value(false));
    }

    @Test
    @DisplayName("Should handle maker submission with proper validation")
    void shouldHandleMakerSubmissionWithValidation() throws Exception {
        // Test complete approval request submission
        String approvalRequestJson = """
                {
                    "requestType": "SYSTEM_CONFIGURATION_CHANGE",
                    "description": "Update system integration settings for Salesforce",
                    "justification": "Required to support new sales team structure and reporting requirements",
                    "supportingDocuments": [
                        "salesforce-integration-spec.pdf",
                        "security-review.pdf",
                        "business-justification.docx"
                    ],
                    "proposedChanges": {
                        "integrationEndpoint": "https://new-salesforce-api.company.com/v2",
                        "syncFrequency": "hourly",
                        "dataMapping": {
                            "salesAmount": "kpi-sales-001",
                            "customerSatisfaction": "kpi-quality-002"
                        }
                    },
                    "impactAnalysis": {
                        "affectedUsers": 150,
                        "affectedSystems": ["Salesforce", "Data Analytics", "Reporting"],
                        "estimatedDowntime": "15 minutes",
                        "rollbackPlan": "Revert to previous integration settings"
                    },
                    "requestedBy": "admin@company.com",
                    "urgency": "MEDIUM"
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/admin/approval-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(approvalRequestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requestType").value("SYSTEM_CONFIGURATION_CHANGE"))
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"))
                .andExpect(jsonPath("$.requestedBy").value("admin@company.com"))
                .andExpect(jsonPath("$.urgency").value("MEDIUM"))
                .andExpect(jsonPath("$.impactAnalysis").exists())
                .andReturn().getResponse().getContentAsString();

        String requestId = objectMapper.readTree(response).get("requestId").asText();

        // Verify request can be retrieved
        mockMvc.perform(get("/api/v1/data-analytics/admin/approval-requests/" + requestId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value(requestId))
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"));
    }

    @Test
    @DisplayName("Should notify checker and provide change impact analysis")
    void shouldNotifyCheckerWithImpactAnalysis() throws Exception {
        // Submit approval request
        String approvalRequestJson = """
                {
                    "requestType": "USER_ROLE_CHANGE",
                    "description": "Promote Jane Smith to HR Manager role",
                    "justification": "Jane has demonstrated excellent performance and is ready for management responsibilities",
                    "proposedChanges": {
                        "userId": "jane.smith@company.com",
                        "currentRole": "EMPLOYEE",
                        "newRole": "HR",
                        "effectiveDate": "2024-12-20"
                    },
                    "impactAnalysis": {
                        "affectedUsers": 1,
                        "newPermissions": ["USER_MANAGEMENT", "REPORT_ACCESS", "ANALYTICS_VIEW"],
                        "dataAccessLevel": "HR_CONFIDENTIAL",
                        "complianceRequirements": ["Background check completed", "Security training completed"]
                    },
                    "requestedBy": "admin@company.com"
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/admin/approval-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(approvalRequestJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String requestId = objectMapper.readTree(response).get("requestId").asText();

        // Check pending approvals for checker
        mockMvc.perform(get("/api/v1/data-analytics/admin/approval-requests/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.requestId == '" + requestId + "')]").exists())
                .andExpect(jsonPath("$[?(@.requestId == '" + requestId + "')].impactAnalysis").exists());

        // Get detailed impact analysis
        mockMvc.perform(get("/api/v1/data-analytics/admin/approval-requests/" + requestId + "/impact-analysis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.affectedUsers").value(1))
                .andExpect(jsonPath("$.newPermissions").isArray())
                .andExpect(jsonPath("$.dataAccessLevel").value("HR_CONFIDENTIAL"))
                .andExpect(jsonPath("$.complianceRequirements").isArray());

        // Check notification was created
        mockMvc.perform(get("/api/v1/data-analytics/admin/notifications")
                        .param("type", "APPROVAL_REQUEST")
                        .param("status", "UNREAD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.requestId == '" + requestId + "')]").exists());
    }

    @Test
    @DisplayName("Should allow checker to approve requests with detailed comments")
    void shouldAllowCheckerApprovalWithComments() throws Exception {
        // Create approval request first
        String approvalRequestJson = """
                {
                    "requestType": "SYSTEM_CONFIGURATION_CHANGE",
                    "description": "Update data retention policy",
                    "justification": "Compliance with new data protection regulations",
                    "proposedChanges": {
                        "retentionPeriod": "7 years",
                        "archivalPolicy": "automated",
                        "deletionSchedule": "quarterly"
                    },
                    "requestedBy": "admin@company.com"
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/admin/approval-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(approvalRequestJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String requestId = objectMapper.readTree(response).get("requestId").asText();

        // Approve the request with detailed comments
        String approvalJson = """
                {
                    "decision": "APPROVED",
                    "comments": "Request approved after thorough review. The proposed data retention policy aligns with regulatory requirements and business needs. Implementation should proceed as planned.",
                    "conditions": [
                        "Implement gradual rollout over 2 weeks",
                        "Monitor system performance during transition",
                        "Prepare rollback plan in case of issues"
                    ],
                    "approvedBy": "hr@company.com",
                    "approvalDate": "2024-12-16T14:30:00Z"
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/approval-requests/" + requestId + "/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(approvalJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.approvedBy").value("hr@company.com"))
                .andExpect(jsonPath("$.approvalComments").value("Request approved after thorough review. The proposed data retention policy aligns with regulatory requirements and business needs. Implementation should proceed as planned."))
                .andExpect(jsonPath("$.conditions").isArray())
                .andExpect(jsonPath("$.conditions.length()").value(3));

        // Verify approval history is recorded
        mockMvc.perform(get("/api/v1/data-analytics/admin/approval-requests/" + requestId + "/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.action == 'APPROVED')]").exists())
                .andExpect(jsonPath("$[?(@.action == 'APPROVED')].timestamp").exists());
    }

    @Test
    @DisplayName("Should allow checker to reject requests with detailed feedback")
    void shouldAllowCheckerRejectionWithFeedback() throws Exception {
        // Create approval request
        String approvalRequestJson = """
                {
                    "requestType": "USER_ROLE_CHANGE",
                    "description": "Promote employee to admin role",
                    "justification": "Need additional admin access",
                    "proposedChanges": {
                        "userId": "bob.wilson@company.com",
                        "newRole": "ADMIN"
                    },
                    "requestedBy": "supervisor@company.com"
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/admin/approval-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(approvalRequestJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String requestId = objectMapper.readTree(response).get("requestId").asText();

        // Reject the request with detailed feedback
        String rejectionJson = """
                {
                    "decision": "REJECTED",
                    "comments": "Request rejected due to insufficient justification and missing security clearance documentation. The proposed role change would grant excessive privileges without demonstrated business need.",
                    "requiredActions": [
                        "Provide detailed business justification with specific use cases",
                        "Complete security clearance process",
                        "Obtain department head approval",
                        "Submit security risk assessment"
                    ],
                    "rejectedBy": "hr@company.com",
                    "rejectionDate": "2024-12-16T15:45:00Z",
                    "canResubmit": true,
                    "resubmissionRequirements": "Address all required actions listed above"
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/approval-requests/" + requestId + "/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rejectionJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectedBy").value("hr@company.com"))
                .andExpect(jsonPath("$.rejectionComments").exists())
                .andExpect(jsonPath("$.requiredActions").isArray())
                .andExpect(jsonPath("$.canResubmit").value(true));

        // Verify rejection notification is created
        mockMvc.perform(get("/api/v1/data-analytics/admin/notifications")
                        .param("recipientId", "supervisor@company.com")
                        .param("type", "APPROVAL_REJECTED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.requestId == '" + requestId + "')]").exists());
    }

    @Test
    @DisplayName("Should allow checker to request modifications with specific guidance")
    void shouldAllowCheckerToRequestModifications() throws Exception {
        // Create approval request
        String approvalRequestJson = """
                {
                    "requestType": "SYSTEM_CONFIGURATION_CHANGE",
                    "description": "Update API rate limits",
                    "justification": "Improve system performance",
                    "proposedChanges": {
                        "maxRequestsPerMinute": 1000,
                        "burstLimit": 2000
                    },
                    "requestedBy": "admin@company.com"
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/admin/approval-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(approvalRequestJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String requestId = objectMapper.readTree(response).get("requestId").asText();

        // Request modifications
        String modificationRequestJson = """
                {
                    "decision": "MODIFICATION_REQUIRED",
                    "comments": "The proposed rate limits are too aggressive and may impact system stability. Please revise with more conservative values and provide performance testing results.",
                    "requestedModifications": [
                        {
                            "field": "maxRequestsPerMinute",
                            "currentValue": 1000,
                            "suggestedValue": 500,
                            "reason": "Start with conservative limit and gradually increase based on monitoring"
                        },
                        {
                            "field": "burstLimit",
                            "currentValue": 2000,
                            "suggestedValue": 1000,
                            "reason": "Maintain 2:1 ratio with base limit for consistency"
                        }
                    ],
                    "additionalRequirements": [
                        "Provide load testing results with proposed values",
                        "Include monitoring and alerting plan",
                        "Define rollback criteria and procedures"
                    ],
                    "reviewedBy": "hr@company.com",
                    "reviewDate": "2024-12-16T16:00:00Z"
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/approval-requests/" + requestId + "/request-modifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(modificationRequestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("MODIFICATION_REQUIRED"))
                .andExpect(jsonPath("$.reviewedBy").value("hr@company.com"))
                .andExpect(jsonPath("$.requestedModifications").isArray())
                .andExpect(jsonPath("$.requestedModifications.length()").value(2))
                .andExpect(jsonPath("$.additionalRequirements").isArray());

        // Verify modification request notification
        mockMvc.perform(get("/api/v1/data-analytics/admin/notifications")
                        .param("recipientId", "admin@company.com")
                        .param("type", "MODIFICATION_REQUIRED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.requestId == '" + requestId + "')]").exists());
    }

    @Test
    @DisplayName("Should track complete approval workflow history")
    void shouldTrackCompleteApprovalWorkflowHistory() throws Exception {
        // Create, modify, and approve a request to generate full history
        String initialRequestJson = """
                {
                    "requestType": "USER_ROLE_CHANGE",
                    "description": "Update user permissions",
                    "justification": "Role change required for new responsibilities",
                    "proposedChanges": {
                        "userId": "test.user@company.com",
                        "newRole": "SUPERVISOR"
                    },
                    "requestedBy": "admin@company.com"
                }
                """;

        String response = mockMvc.perform(post("/api/v1/data-analytics/admin/approval-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(initialRequestJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String requestId = objectMapper.readTree(response).get("requestId").asText();

        // Request modification
        String modificationJson = """
                {
                    "decision": "MODIFICATION_REQUIRED",
                    "comments": "Please provide additional justification",
                    "reviewedBy": "hr@company.com"
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/approval-requests/" + requestId + "/request-modifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(modificationJson))
                .andExpect(status().isOk());

        // Resubmit with modifications
        String resubmissionJson = """
                {
                    "justification": "Updated justification: User will be managing a team of 5 employees and needs supervisor-level access for performance reviews and team coordination",
                    "additionalDocuments": ["team-structure.pdf", "job-description.pdf"]
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/approval-requests/" + requestId + "/resubmit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resubmissionJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"));

        // Final approval
        String approvalJson = """
                {
                    "decision": "APPROVED",
                    "comments": "Approved with updated justification",
                    "approvedBy": "hr@company.com"
                }
                """;

        mockMvc.perform(put("/api/v1/data-analytics/admin/approval-requests/" + requestId + "/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(approvalJson))
                .andExpect(status().isOk());

        // Verify complete history
        mockMvc.perform(get("/api/v1/data-analytics/admin/approval-requests/" + requestId + "/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").greaterThanOrEqualTo(4)) // Created, Modified, Resubmitted, Approved
                .andExpect(jsonPath("$[?(@.action == 'CREATED')]").exists())
                .andExpect(jsonPath("$[?(@.action == 'MODIFICATION_REQUIRED')]").exists())
                .andExpect(jsonPath("$[?(@.action == 'RESUBMITTED')]").exists())
                .andExpect(jsonPath("$[?(@.action == 'APPROVED')]").exists());

        // Verify audit trail includes all workflow steps
        mockMvc.perform(get("/api/v1/data-analytics/admin/audit-trail")
                        .param("entityType", "APPROVAL_REQUEST")
                        .param("entityId", requestId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").greaterThanOrEqualTo(4));
    }

    @Test
    @DisplayName("Should provide approval workflow analytics and reporting")
    void shouldProvideApprovalWorkflowAnalytics() throws Exception {
        // Get approval workflow statistics
        mockMvc.perform(get("/api/v1/data-analytics/admin/approval-requests/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRequests").isNumber())
                .andExpect(jsonPath("$.pendingRequests").isNumber())
                .andExpect(jsonPath("$.approvedRequests").isNumber())
                .andExpect(jsonPath("$.rejectedRequests").isNumber())
                .andExpect(jsonPath("$.averageApprovalTime").isNumber())
                .andExpect(jsonPath("$.requestsByType").exists());

        // Get approval trends
        mockMvc.perform(get("/api/v1/data-analytics/admin/approval-requests/trends")
                        .param("period", "30days"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period").value("30days"))
                .andExpect(jsonPath("$.trends").isArray());

        // Get checker performance metrics
        mockMvc.perform(get("/api/v1/data-analytics/admin/approval-requests/checker-metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].checkerId").exists())
                .andExpect(jsonPath("$[0].totalReviewed").isNumber())
                .andExpect(jsonPath("$[0].averageReviewTime").isNumber());
    }
}