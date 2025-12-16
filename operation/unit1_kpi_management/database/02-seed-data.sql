-- KPI Management Service - Seed Data
-- Initial data for testing and demonstration

\c kpi_management;
SET search_path TO kpi_management, public;

-- =====================================================
-- SEED DATA FOR TESTING
-- =====================================================

-- Sample Organization ID (in real system, this would come from user management service)
INSERT INTO kpi_definitions (
    id,
    name,
    description,
    category,
    measurement_type,
    default_target_value,
    default_target_unit,
    default_target_comparison_type,
    default_weight,
    measurement_frequency,
    data_source_config,
    organization_id,
    department,
    job_role,
    created_by
) VALUES 
-- Sales KPIs
(
    uuid_generate_v4(),
    'Monthly Sales Revenue',
    'Total sales revenue generated per month',
    'SALES',
    'NUMERICAL',
    50000.00,
    'USD',
    'GREATER_THAN_OR_EQUAL',
    25.00,
    'MONTHLY',
    '{"source": "salesforce", "metric": "total_revenue", "filters": {"period": "monthly"}}',
    uuid_generate_v4(),
    'Sales',
    'Sales Representative',
    uuid_generate_v4()
),
(
    uuid_generate_v4(),
    'Lead Conversion Rate',
    'Percentage of leads converted to customers',
    'SALES',
    'PERCENTAGE',
    15.00,
    'PERCENT',
    'GREATER_THAN_OR_EQUAL',
    20.00,
    'MONTHLY',
    '{"source": "crm", "metric": "conversion_rate", "calculation": "converted_leads/total_leads*100"}',
    uuid_generate_v4(),
    'Sales',
    'Sales Representative',
    uuid_generate_v4()
),
(
    uuid_generate_v4(),
    'Customer Acquisition Cost',
    'Average cost to acquire a new customer',
    'SALES',
    'NUMERICAL',
    500.00,
    'USD',
    'LESS_THAN_OR_EQUAL',
    15.00,
    'MONTHLY',
    '{"source": "marketing_analytics", "metric": "cac", "calculation": "marketing_spend/new_customers"}',
    uuid_generate_v4(),
    'Sales',
    'Sales Manager',
    uuid_generate_v4()
),

-- Marketing KPIs
(
    uuid_generate_v4(),
    'Website Traffic Growth',
    'Monthly growth in website unique visitors',
    'MARKETING',
    'PERCENTAGE',
    10.00,
    'PERCENT',
    'GREATER_THAN_OR_EQUAL',
    20.00,
    'MONTHLY',
    '{"source": "google_analytics", "metric": "unique_visitors_growth"}',
    uuid_generate_v4(),
    'Marketing',
    'Digital Marketing Specialist',
    uuid_generate_v4()
),
(
    uuid_generate_v4(),
    'Email Campaign Open Rate',
    'Percentage of email recipients who open campaigns',
    'MARKETING',
    'PERCENTAGE',
    25.00,
    'PERCENT',
    'GREATER_THAN_OR_EQUAL',
    15.00,
    'WEEKLY',
    '{"source": "mailchimp", "metric": "open_rate"}',
    uuid_generate_v4(),
    'Marketing',
    'Email Marketing Specialist',
    uuid_generate_v4()
),

-- Operations KPIs
(
    uuid_generate_v4(),
    'Project Delivery On Time',
    'Percentage of projects delivered on or before deadline',
    'OPERATIONS',
    'PERCENTAGE',
    90.00,
    'PERCENT',
    'GREATER_THAN_OR_EQUAL',
    25.00,
    'MONTHLY',
    '{"source": "project_management", "metric": "on_time_delivery"}',
    uuid_generate_v4(),
    'Operations',
    'Project Manager',
    uuid_generate_v4()
),
(
    uuid_generate_v4(),
    'System Uptime',
    'Percentage of time systems are operational',
    'OPERATIONS',
    'PERCENTAGE',
    99.50,
    'PERCENT',
    'GREATER_THAN_OR_EQUAL',
    30.00,
    'MONTHLY',
    '{"source": "monitoring", "metric": "uptime_percentage"}',
    uuid_generate_v4(),
    'IT',
    'System Administrator',
    uuid_generate_v4()
),

-- Customer Service KPIs
(
    uuid_generate_v4(),
    'Customer Satisfaction Score',
    'Average customer satisfaction rating',
    'CUSTOMER_SERVICE',
    'RATING',
    4.50,
    'STARS',
    'GREATER_THAN_OR_EQUAL',
    25.00,
    'MONTHLY',
    '{"source": "survey", "metric": "csat_average"}',
    uuid_generate_v4(),
    'Customer Service',
    'Customer Service Representative',
    uuid_generate_v4()
),
(
    uuid_generate_v4(),
    'First Call Resolution Rate',
    'Percentage of issues resolved on first contact',
    'CUSTOMER_SERVICE',
    'PERCENTAGE',
    80.00,
    'PERCENT',
    'GREATER_THAN_OR_EQUAL',
    20.00,
    'WEEKLY',
    '{"source": "helpdesk", "metric": "fcr_rate"}',
    uuid_generate_v4(),
    'Customer Service',
    'Customer Service Representative',
    uuid_generate_v4()
),

-- HR KPIs
(
    uuid_generate_v4(),
    'Employee Retention Rate',
    'Percentage of employees retained over 12 months',
    'HR',
    'PERCENTAGE',
    85.00,
    'PERCENT',
    'GREATER_THAN_OR_EQUAL',
    20.00,
    'QUARTERLY',
    '{"source": "hris", "metric": "retention_rate"}',
    uuid_generate_v4(),
    'Human Resources',
    'HR Manager',
    uuid_generate_v4()
);

-- =====================================================
-- SAMPLE EMPLOYEE PORTFOLIOS
-- =====================================================

-- Create sample employee portfolios
INSERT INTO employee_kpi_portfolios (
    employee_id,
    organization_id,
    total_weight,
    portfolio_status,
    weight_validation_mode,
    max_assignments,
    created_by
) VALUES 
(
    uuid_generate_v4(),
    uuid_generate_v4(),
    0.00,
    'ACTIVE',
    'FLEXIBLE',
    10,
    uuid_generate_v4()
),
(
    uuid_generate_v4(),
    uuid_generate_v4(),
    0.00,
    'ACTIVE',
    'FLEXIBLE',
    8,
    uuid_generate_v4()
),
(
    uuid_generate_v4(),
    uuid_generate_v4(),
    0.00,
    'ACTIVE',
    'STRICT',
    12,
    uuid_generate_v4()
);

-- =====================================================
-- SAMPLE AI SUGGESTIONS
-- =====================================================

INSERT INTO ai_suggestions (
    id,
    organization_id,
    job_title,
    department,
    employee_level,
    suggested_kpi_name,
    suggested_description,
    suggested_category,
    suggested_measurement_type,
    suggested_target_value,
    suggested_target_unit,
    suggested_weight,
    suggested_frequency,
    confidence_score,
    rationale,
    benchmark_data,
    ai_model_version,
    status
) VALUES 
(
    uuid_generate_v4(),
    uuid_generate_v4(),
    'Software Developer',
    'Engineering',
    'Mid-Level',
    'Code Quality Score',
    'Average code quality score based on automated analysis',
    'QUALITY',
    'RATING',
    4.00,
    'SCORE',
    20.00,
    'WEEKLY',
    0.8500,
    'Based on industry benchmarks for software developers, code quality is a key performance indicator that correlates with reduced bugs and maintenance costs.',
    '{"industry_average": 3.8, "top_performers": 4.2, "source": "Stack Overflow Developer Survey 2023"}',
    'GPT-4-KPI-v1.2',
    'PENDING'
),
(
    uuid_generate_v4(),
    uuid_generate_v4(),
    'Marketing Manager',
    'Marketing',
    'Senior',
    'Brand Awareness Growth',
    'Monthly growth in brand awareness metrics',
    'MARKETING',
    'PERCENTAGE',
    5.00,
    'PERCENT',
    25.00,
    'MONTHLY',
    0.7800,
    'Brand awareness is crucial for marketing managers and directly impacts customer acquisition and market share growth.',
    '{"industry_average": 3.2, "top_performers": 7.1, "methodology": "Brand tracking surveys"}',
    'GPT-4-KPI-v1.2',
    'UNDER_REVIEW'
);

-- =====================================================
-- SAMPLE APPROVAL WORKFLOWS
-- =====================================================

INSERT INTO approval_workflows (
    id,
    organization_id,
    workflow_type,
    entity_type,
    entity_id,
    change_data,
    change_summary,
    change_impact,
    submitted_by,
    priority
) VALUES 
(
    uuid_generate_v4(),
    uuid_generate_v4(),
    'CREATE',
    'KPI_DEFINITION',
    uuid_generate_v4(),
    '{"name": "Customer Lifetime Value", "category": "SALES", "target": 5000, "weight": 30}',
    'New KPI definition for Customer Lifetime Value tracking',
    'MEDIUM',
    uuid_generate_v4(),
    'NORMAL'
),
(
    uuid_generate_v4(),
    uuid_generate_v4(),
    'UPDATE',
    'KPI_ASSIGNMENT',
    uuid_generate_v4(),
    '{"old_weight": 20, "new_weight": 25, "reason": "Increased focus on sales performance"}',
    'Weight adjustment for sales KPI assignment',
    'LOW',
    uuid_generate_v4(),
    'NORMAL'
);

-- =====================================================
-- SAMPLE DOMAIN EVENTS
-- =====================================================

INSERT INTO domain_events (
    event_type,
    event_version,
    aggregate_type,
    aggregate_id,
    aggregate_version,
    event_data,
    event_metadata,
    correlation_id
) VALUES 
(
    'KPIDefinitionCreated',
    1,
    'KPIDefinition',
    uuid_generate_v4(),
    1,
    '{"name": "Monthly Sales Revenue", "category": "SALES", "createdBy": "system"}',
    '{"source": "seed-data", "environment": "development"}',
    uuid_generate_v4()
),
(
    'EmployeeKPIPortfolioCreated',
    1,
    'EmployeeKPIPortfolio',
    uuid_generate_v4(),
    1,
    '{"employeeId": "emp-001", "organizationId": "org-001", "createdBy": "system"}',
    '{"source": "seed-data", "environment": "development"}',
    uuid_generate_v4()
);

-- =====================================================
-- CREATE SAMPLE VIEWS FOR REPORTING
-- =====================================================

-- View for active KPI assignments with details
CREATE OR REPLACE VIEW active_kpi_assignments AS
SELECT 
    ka.id as assignment_id,
    ka.employee_id,
    kd.name as kpi_name,
    kd.description as kpi_description,
    kd.category,
    kd.measurement_type,
    COALESCE(ka.custom_target_value, kd.default_target_value) as target_value,
    COALESCE(ka.custom_target_unit, kd.default_target_unit) as target_unit,
    COALESCE(ka.custom_weight, kd.default_weight) as weight,
    kd.measurement_frequency,
    ka.effective_date,
    ka.end_date,
    ka.status,
    ka.created_at as assigned_at
FROM kpi_assignments ka
JOIN kpi_definitions kd ON ka.kpi_definition_id = kd.id
WHERE ka.status = 'ACTIVE' 
  AND kd.is_active = true
  AND (ka.end_date IS NULL OR ka.end_date >= CURRENT_DATE);

-- View for KPI hierarchy with path information
CREATE OR REPLACE VIEW kpi_hierarchy_view AS
SELECT 
    h.id as hierarchy_id,
    h.organization_id,
    parent_kpi.name as parent_kpi_name,
    child_kpi.name as child_kpi_name,
    h.hierarchy_level,
    h.hierarchy_path,
    h.cascade_enabled,
    h.cascade_weight_factor
FROM kpi_hierarchy h
LEFT JOIN kpi_definitions parent_kpi ON h.parent_kpi_id = parent_kpi.id
JOIN kpi_definitions child_kpi ON h.child_kpi_id = child_kpi.id
WHERE child_kpi.is_active = true;

-- View for pending approvals
CREATE OR REPLACE VIEW pending_approvals AS
SELECT 
    aw.id as workflow_id,
    aw.workflow_type,
    aw.entity_type,
    aw.change_summary,
    aw.change_impact,
    aw.priority,
    aw.submitted_by,
    aw.submitted_at,
    aw.deadline,
    EXTRACT(DAYS FROM (aw.deadline - CURRENT_TIMESTAMP)) as days_until_deadline
FROM approval_workflows aw
WHERE aw.approval_status = 'PENDING'
  AND (aw.deadline IS NULL OR aw.deadline > CURRENT_TIMESTAMP)
ORDER BY aw.priority DESC, aw.submitted_at ASC;

-- =====================================================
-- CREATE FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to calculate portfolio weight total
CREATE OR REPLACE FUNCTION calculate_portfolio_weight(p_employee_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_weight DECIMAL(5,2);
BEGIN
    SELECT COALESCE(SUM(COALESCE(ka.custom_weight, kd.default_weight)), 0.00)
    INTO total_weight
    FROM kpi_assignments ka
    JOIN kpi_definitions kd ON ka.kpi_definition_id = kd.id
    WHERE ka.employee_id = p_employee_id
      AND ka.status = 'ACTIVE'
      AND kd.is_active = true
      AND (ka.end_date IS NULL OR ka.end_date >= CURRENT_DATE);
    
    RETURN total_weight;
END;
$$ LANGUAGE plpgsql;

-- Function to update portfolio weight
CREATE OR REPLACE FUNCTION update_portfolio_weight(p_employee_id UUID)
RETURNS VOID AS $$
DECLARE
    new_weight DECIMAL(5,2);
BEGIN
    new_weight := calculate_portfolio_weight(p_employee_id);
    
    UPDATE employee_kpi_portfolios 
    SET total_weight = new_weight,
        last_modified_at = CURRENT_TIMESTAMP
    WHERE employee_id = p_employee_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update portfolio weight when assignments change
CREATE OR REPLACE FUNCTION trigger_update_portfolio_weight()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_portfolio_weight(NEW.employee_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_portfolio_weight(OLD.employee_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kpi_assignments_portfolio_weight_trigger
    AFTER INSERT OR UPDATE OR DELETE ON kpi_assignments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_portfolio_weight();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp trigger to relevant tables
CREATE TRIGGER kpi_definitions_timestamp_trigger
    BEFORE UPDATE ON kpi_definitions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER kpi_assignments_timestamp_trigger
    BEFORE UPDATE ON kpi_assignments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER approval_workflows_timestamp_trigger
    BEFORE UPDATE ON approval_workflows
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'KPI Management Service seed data inserted successfully!';
    RAISE NOTICE 'Sample data includes:';
    RAISE NOTICE '- % KPI definitions across multiple categories', (SELECT COUNT(*) FROM kpi_definitions);
    RAISE NOTICE '- % employee portfolios', (SELECT COUNT(*) FROM employee_kpi_portfolios);
    RAISE NOTICE '- % AI suggestions', (SELECT COUNT(*) FROM ai_suggestions);
    RAISE NOTICE '- % approval workflows', (SELECT COUNT(*) FROM approval_workflows);
    RAISE NOTICE '- % domain events', (SELECT COUNT(*) FROM domain_events);
    RAISE NOTICE 'Views created: active_kpi_assignments, kpi_hierarchy_view, pending_approvals';
    RAISE NOTICE 'Functions created: calculate_portfolio_weight, update_portfolio_weight';
    RAISE NOTICE 'Triggers created for automatic weight calculation and timestamp updates';
    RAISE NOTICE 'Database is ready for application connection!';
END $$;