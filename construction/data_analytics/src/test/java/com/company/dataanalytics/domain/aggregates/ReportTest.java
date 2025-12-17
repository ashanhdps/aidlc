package com.company.dataanalytics.domain.aggregates;

import com.company.dataanalytics.domain.aggregates.report.Report;
import com.company.dataanalytics.domain.aggregates.report.ReportTemplate;
import com.company.dataanalytics.domain.valueobjects.*;
import com.company.dataanalytics.domain.shared.DomainException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Report aggregate root
 */
@DisplayName("Report Domain Tests")
class ReportTest {

    @Test
    @DisplayName("Should create report with valid parameters")
    void shouldCreateReportWithValidParameters() {
        // Given
        ReportId reportId = new ReportId("report-123");
        String reportName = "Test Performance Report";
        ReportFormat format = ReportFormat.PDF;
        UserId requestedBy = new UserId("user-123");
        Map<String, Object> parameters = createTestParameters();

        // When
        Report report = Report.create(reportId, reportName, format, requestedBy, parameters);

        // Then
        assertNotNull(report);
        assertEquals(reportId, report.getReportId());
        assertEquals(reportName, report.getReportName());
        assertEquals(format, report.getFormat());
        assertEquals(requestedBy, report.getRequestedBy());
        assertEquals(GenerationStatus.PENDING, report.getStatus());
        assertNotNull(report.getCreatedAt());
        assertNull(report.getCompletedAt());
        assertNull(report.getFilePath());
    }

    @Test
    @DisplayName("Should create report from template")
    void shouldCreateReportFromTemplate() {
        // Given
        ReportTemplate template = createTestTemplate();
        ReportId reportId = new ReportId("report-from-template-123");
        String reportName = "Monthly Sales Report";
        UserId requestedBy = new UserId("user-123");
        Map<String, Object> parameters = createTestParameters();

        // When
        Report report = Report.createFromTemplate(reportId, reportName, template, requestedBy, parameters);

        // Then
        assertNotNull(report);
        assertEquals(reportId, report.getReportId());
        assertEquals(reportName, report.getReportName());
        assertEquals(template.getTemplateId(), report.getTemplateId());
        assertEquals(GenerationStatus.PENDING, report.getStatus());
        assertEquals(parameters, report.getParameters());
    }

    @Test
    @DisplayName("Should start report generation successfully")
    void shouldStartReportGenerationSuccessfully() {
        // Given
        Report report = createTestReport();
        assertEquals(GenerationStatus.PENDING, report.getStatus());

        // When
        report.startGeneration();

        // Then
        assertEquals(GenerationStatus.IN_PROGRESS, report.getStatus());
        assertNotNull(report.getStartedAt());
    }

    @Test
    @DisplayName("Should complete report generation with file path")
    void shouldCompleteReportGenerationWithFilePath() {
        // Given
        Report report = createTestReport();
        report.startGeneration();
        String filePath = "/reports/test-report-123.pdf";

        // When
        report.completeGeneration(filePath);

        // Then
        assertEquals(GenerationStatus.COMPLETED, report.getStatus());
        assertEquals(filePath, report.getFilePath());
        assertNotNull(report.getCompletedAt());
        assertTrue(report.getGenerationTimeMinutes() >= 0);
    }

    @Test
    @DisplayName("Should fail report generation with error message")
    void shouldFailReportGenerationWithErrorMessage() {
        // Given
        Report report = createTestReport();
        report.startGeneration();
        String errorMessage = "Database connection failed";

        // When
        report.failGeneration(errorMessage);

        // Then
        assertEquals(GenerationStatus.FAILED, report.getStatus());
        assertEquals(errorMessage, report.getErrorMessage());
        assertNotNull(report.getCompletedAt());
        assertNull(report.getFilePath());
    }

    @Test
    @DisplayName("Should cancel pending report generation")
    void shouldCancelPendingReportGeneration() {
        // Given
        Report report = createTestReport();
        assertEquals(GenerationStatus.PENDING, report.getStatus());

        // When
        report.cancel("User requested cancellation");

        // Then
        assertEquals(GenerationStatus.CANCELLED, report.getStatus());
        assertNotNull(report.getCompletedAt());
    }

    @Test
    @DisplayName("Should validate state transitions for report generation")
    void shouldValidateStateTransitionsForReportGeneration() {
        // Given
        Report report = createTestReport();

        // Test: Cannot start generation twice
        report.startGeneration();
        assertThrows(DomainException.class, () -> {
            report.startGeneration();
        });

        // Test: Cannot complete without starting
        Report pendingReport = createTestReport();
        assertThrows(DomainException.class, () -> {
            pendingReport.completeGeneration("/path/to/file.pdf");
        });

        // Test: Cannot fail without starting
        Report anotherPendingReport = createTestReport();
        assertThrows(DomainException.class, () -> {
            anotherPendingReport.failGeneration("Error message");
        });

        // Test: Cannot cancel completed report
        report.completeGeneration("/path/to/file.pdf");
        assertThrows(DomainException.class, () -> {
            report.cancel("Cannot cancel completed");
        });
    }

    @Test
    @DisplayName("Should calculate generation time correctly")
    void shouldCalculateGenerationTimeCorrectly() {
        // Given
        Report report = createTestReport();

        // When
        report.startGeneration();
        // Simulate some processing time
        try {
            Thread.sleep(100); // 100ms
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        report.completeGeneration("/path/to/file.pdf");

        // Then
        assertTrue(report.getGenerationTimeMinutes() >= 0);
        assertNotNull(report.getStartedAt());
        assertNotNull(report.getCompletedAt());
        assertTrue(report.getCompletedAt().isAfter(report.getStartedAt()));
    }

    @Test
    @DisplayName("Should validate required parameters")
    void shouldValidateRequiredParameters() {
        // Given
        ReportId reportId = new ReportId("report-123");
        String reportName = "Test Report";
        ReportFormat format = ReportFormat.PDF;
        UserId requestedBy = new UserId("user-123");

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            Report.create(null, reportName, format, requestedBy, createTestParameters());
        });

        assertThrows(IllegalArgumentException.class, () -> {
            Report.create(reportId, null, format, requestedBy, createTestParameters());
        });

        assertThrows(IllegalArgumentException.class, () -> {
            Report.create(reportId, "", format, requestedBy, createTestParameters());
        });

        assertThrows(IllegalArgumentException.class, () -> {
            Report.create(reportId, reportName, null, requestedBy, createTestParameters());
        });

        assertThrows(IllegalArgumentException.class, () -> {
            Report.create(reportId, reportName, format, null, createTestParameters());
        });
    }

    @Test
    @DisplayName("Should handle report parameters correctly")
    void shouldHandleReportParametersCorrectly() {
        // Given
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("employeeId", "emp-123");
        parameters.put("startDate", "2024-01-01");
        parameters.put("endDate", "2024-12-31");
        parameters.put("includeCharts", true);
        parameters.put("departments", new String[]{"Sales", "Marketing"});

        Report report = createTestReportWithParameters(parameters);

        // When & Then
        assertEquals(parameters, report.getParameters());
        assertEquals("emp-123", report.getParameters().get("employeeId"));
        assertEquals("2024-01-01", report.getParameters().get("startDate"));
        assertEquals("2024-12-31", report.getParameters().get("endDate"));
        assertEquals(true, report.getParameters().get("includeCharts"));
        assertArrayEquals(new String[]{"Sales", "Marketing"}, 
                         (String[]) report.getParameters().get("departments"));
    }

    @Test
    @DisplayName("Should support different report formats")
    void shouldSupportDifferentReportFormats() {
        // Test PDF format
        Report pdfReport = createTestReportWithFormat(ReportFormat.PDF);
        assertEquals(ReportFormat.PDF, pdfReport.getFormat());

        // Test Excel format
        Report excelReport = createTestReportWithFormat(ReportFormat.EXCEL);
        assertEquals(ReportFormat.EXCEL, excelReport.getFormat());

        // Test CSV format
        Report csvReport = createTestReportWithFormat(ReportFormat.CSV);
        assertEquals(ReportFormat.CSV, csvReport.getFormat());

        // Test PowerPoint format
        Report pptReport = createTestReportWithFormat(ReportFormat.POWERPOINT);
        assertEquals(ReportFormat.POWERPOINT, pptReport.getFormat());
    }

    @Test
    @DisplayName("Should track report access and downloads")
    void shouldTrackReportAccessAndDownloads() {
        // Given
        Report report = createTestReport();
        report.startGeneration();
        report.completeGeneration("/path/to/file.pdf");

        UserId accessedBy = new UserId("user-456");

        // When
        report.recordAccess(accessedBy, "VIEW");
        report.recordAccess(accessedBy, "DOWNLOAD");
        report.recordAccess(new UserId("user-789"), "VIEW");

        // Then
        assertEquals(3, report.getAccessLog().size());
        assertEquals(2, report.getAccessLog().stream()
                .mapToInt(log -> log.getAccessedBy().equals(accessedBy) ? 1 : 0)
                .sum());
    }

    @Test
    @DisplayName("Should validate report name constraints")
    void shouldValidateReportNameConstraints() {
        // Given
        ReportId reportId = new ReportId("report-123");
        ReportFormat format = ReportFormat.PDF;
        UserId requestedBy = new UserId("user-123");
        Map<String, Object> parameters = createTestParameters();

        // When & Then
        assertThrows(DomainException.class, () -> {
            Report.create(reportId, "A", format, requestedBy, parameters); // Too short
        });

        assertThrows(DomainException.class, () -> {
            String longName = "A".repeat(256); // Too long
            Report.create(reportId, longName, format, requestedBy, parameters);
        });

        // Valid names should work
        assertDoesNotThrow(() -> {
            Report.create(reportId, "Valid Report Name", format, requestedBy, parameters);
        });

        assertDoesNotThrow(() -> {
            Report.create(new ReportId("report-124"), "Another Valid Name 123", format, requestedBy, parameters);
        });
    }

    @Test
    @DisplayName("Should handle report expiration")
    void shouldHandleReportExpiration() {
        // Given
        Report report = createTestReport();
        report.startGeneration();
        report.completeGeneration("/path/to/file.pdf");

        LocalDateTime expirationDate = LocalDateTime.now().plusDays(30);

        // When
        report.setExpirationDate(expirationDate);

        // Then
        assertEquals(expirationDate, report.getExpirationDate());
        assertFalse(report.isExpired());

        // Test expired report
        LocalDateTime pastDate = LocalDateTime.now().minusDays(1);
        report.setExpirationDate(pastDate);
        assertTrue(report.isExpired());
    }

    @Test
    @DisplayName("Should update report metadata")
    void shouldUpdateReportMetadata() {
        // Given
        Report report = createTestReport();
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("fileSize", 1024000L);
        metadata.put("pageCount", 15);
        metadata.put("chartCount", 5);

        // When
        report.updateMetadata(metadata);

        // Then
        assertEquals(metadata, report.getMetadata());
        assertEquals(1024000L, report.getMetadata().get("fileSize"));
        assertEquals(15, report.getMetadata().get("pageCount"));
        assertEquals(5, report.getMetadata().get("chartCount"));
    }

    private Report createTestReport() {
        return Report.create(
            new ReportId("test-report-123"),
            "Test Performance Report",
            ReportFormat.PDF,
            new UserId("user-123"),
            createTestParameters()
        );
    }

    private Report createTestReportWithFormat(ReportFormat format) {
        return Report.create(
            new ReportId("test-report-" + format.name().toLowerCase()),
            "Test Report - " + format.name(),
            format,
            new UserId("user-123"),
            createTestParameters()
        );
    }

    private Report createTestReportWithParameters(Map<String, Object> parameters) {
        return Report.create(
            new ReportId("test-report-params"),
            "Test Report with Parameters",
            ReportFormat.PDF,
            new UserId("user-123"),
            parameters
        );
    }

    private Map<String, Object> createTestParameters() {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("employeeId", "emp-123");
        parameters.put("startDate", "2024-01-01");
        parameters.put("endDate", "2024-12-31");
        return parameters;
    }

    private ReportTemplate createTestTemplate() {
        return ReportTemplate.create(
            new TemplateId("template-123"),
            "Test Template",
            "Test template description",
            createTestTemplateConfiguration()
        );
    }

    private Map<String, Object> createTestTemplateConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("supportedFormats", new String[]{"PDF", "EXCEL"});
        config.put("estimatedMinutes", 5);
        return config;
    }
}