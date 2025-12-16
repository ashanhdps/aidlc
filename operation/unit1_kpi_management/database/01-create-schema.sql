-- KPI Management Service Database Schema
-- PostgreSQL DDL for migrating from SQLite/H2 to PostgreSQL

-- Create database (run this separately as superuser if needed)
-- CREATE DATABASE kpi_management;

-- Connect to the database
\c kpi_management;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas for organization
CREATE SCHEMA IF NOT EXISTS kpi_management;
SET search_path TO kpi_management, public;

-- =====================================================
-- KPI DEFINITIONS TABLE
-- =====================================================
CREATE TABLE kpi_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    measurement_type VARCHAR(50) NOT NULL,
    
    -- Target configuration
    default_target_value DECIMAL(10,2),
    default_target_unit VARCHAR(50),
    default_target_comparison_type VARCHAR(20) DEFAULT 'GREATER_THAN_OR_EQUAL',
    
    -- Weight configuration
    default_weight DECIMAL(5,2) CHECK (default_weight >= 0 AND default_weight <= 100),
    
    -- Frequency configuration
    measurement_frequency VARCHAR(20) NOT NULL,
    
    -- Data source configuration (JSON)
    data_source_config JSONB,
    
    -- Organizational context
    organization_id UUID NOT NULL,
    department VARCHAR(100),
    job_role VARCHAR(100),
    
    -- Audit fields
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    archived_at TIMESTAMP WITH TIME ZONE,
    archived_by UUID,
    
    -- Constraints
    UNIQUE(name, organization_id),
    CHECK (measurement_frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')),
    CHECK (category IN ('SALES', 'MARKETING', 'OPERATIONS', 'FINANCE', 'HR', 'CUSTOMER_SERVICE', 'QUALITY', 'SAFETY')),
    CHECK (measurement_type IN ('NUMERICAL', 'PERCENTAGE', 'BOOLEAN', 'RATING'))
);

-- Create indexes for performance
CREATE INDEX idx_kpi_definitions_organization ON kpi_definitions(organization_id);
CREATE INDEX idx_kpi_definitions_category ON kpi_definitions(category);
CREATE INDEX idx_kpi_definitions_active ON kpi_definitions(is_active) WHERE is_active = true;
CREATE INDEX idx_kpi_definitions_created_at ON kpi_definitions(created_at);

-- =====================================================
-- EMPLOYEE KPI PORTFOLIOS TABLE
-- =====================================================
CREATE TABLE employee_kpi_portfolios (
    employee_id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    
    -- Portfolio metadata
    total_weight DECIMAL(5,2) DEFAULT 0.00,
    portfolio_status VARCHAR(50) DEFAULT 'ACTIVE',
    
    -- Validation settings
    weight_validation_mode VARCHAR(20) DEFAULT 'FLEXIBLE',
    max_assignments INTEGER DEFAULT 10,
    
    -- Audit fields
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified_by UUID,
    last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    
    -- Constraints
    CHECK (portfolio_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    CHECK (weight_validation_mode IN ('STRICT', 'FLEXIBLE', 'NONE')),
    CHECK (total_weight >= 0 AND total_weight <= 200), -- Allow some flexibility
    CHECK (max_assignments > 0 AND max_assignments <= 50)
);

-- Create indexes
CREATE INDEX idx_employee_portfolios_org ON employee_kpi_portfolios(organization_id);
CREATE INDEX idx_employee_portfolios_status ON employee_kpi_portfolios(portfolio_status);

-- =====================================================
-- KPI ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE kpi_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employee_kpi_portfolios(employee_id),
    kpi_definition_id UUID NOT NULL REFERENCES kpi_definitions(id),
    
    -- Custom assignment configuration
    custom_target_value DECIMAL(10,2),
    custom_target_unit VARCHAR(50),
    custom_target_comparison_type VARCHAR(20),
    custom_weight DECIMAL(5,2) CHECK (custom_weight >= 0 AND custom_weight <= 100),
    
    -- Assignment period
    effective_date DATE NOT NULL,
    end_date DATE,
    
    -- Assignment context
    assigned_by UUID NOT NULL,
    assignment_reason TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    
    -- Constraints
    UNIQUE(employee_id, kpi_definition_id, effective_date),
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'COMPLETED')),
    CHECK (end_date IS NULL OR end_date >= effective_date),
    CHECK (custom_target_comparison_type IN ('GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL', 'EQUAL'))
);

-- Create indexes
CREATE INDEX idx_kpi_assignments_employee ON kpi_assignments(employee_id);
CREATE INDEX idx_kpi_assignments_kpi ON kpi_assignments(kpi_definition_id);
CREATE INDEX idx_kpi_assignments_effective_date ON kpi_assignments(effective_date);
CREATE INDEX idx_kpi_assignments_status ON kpi_assignments(status);
CREATE INDEX idx_kpi_assignments_active ON kpi_assignments(employee_id, status) WHERE status = 'ACTIVE';

-- =====================================================
-- KPI HIERARCHY TABLE
-- =====================================================
CREATE TABLE kpi_hierarchy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    
    -- Hierarchy structure
    parent_kpi_id UUID REFERENCES kpi_definitions(id),
    child_kpi_id UUID NOT NULL REFERENCES kpi_definitions(id),
    
    -- Hierarchy metadata
    hierarchy_level INTEGER NOT NULL,
    hierarchy_path TEXT, -- Materialized path for efficient queries
    
    -- Cascading configuration
    cascade_enabled BOOLEAN DEFAULT true,
    cascade_weight_factor DECIMAL(5,4) DEFAULT 1.0000,
    cascade_rules JSONB,
    
    -- Audit fields
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(parent_kpi_id, child_kpi_id),
    CHECK (parent_kpi_id != child_kpi_id), -- Prevent self-reference
    CHECK (hierarchy_level >= 0 AND hierarchy_level <= 10),
    CHECK (cascade_weight_factor > 0 AND cascade_weight_factor <= 2.0)
);

-- Create indexes
CREATE INDEX idx_kpi_hierarchy_org ON kpi_hierarchy(organization_id);
CREATE INDEX idx_kpi_hierarchy_parent ON kpi_hierarchy(parent_kpi_id);
CREATE INDEX idx_kpi_hierarchy_child ON kpi_hierarchy(child_kpi_id);
CREATE INDEX idx_kpi_hierarchy_level ON kpi_hierarchy(hierarchy_level);
CREATE INDEX idx_kpi_hierarchy_path ON kpi_hierarchy USING gin(to_tsvector('english', hierarchy_path));

-- =====================================================
-- AI SUGGESTIONS TABLE
-- =====================================================
CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    
    -- Suggestion context
    job_title VARCHAR(200),
    department VARCHAR(100),
    employee_level VARCHAR(50),
    
    -- Suggested KPI
    suggested_kpi_name VARCHAR(255) NOT NULL,
    suggested_description TEXT,
    suggested_category VARCHAR(100),
    suggested_measurement_type VARCHAR(50),
    suggested_target_value DECIMAL(10,2),
    suggested_target_unit VARCHAR(50),
    suggested_weight DECIMAL(5,2),
    suggested_frequency VARCHAR(20),
    
    -- AI metadata
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    rationale TEXT,
    benchmark_data JSONB,
    ai_model_version VARCHAR(50),
    
    -- Review status
    status VARCHAR(50) DEFAULT 'PENDING',
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_decision VARCHAR(50),
    review_comments TEXT,
    
    -- Implementation
    implemented_as_kpi_id UUID REFERENCES kpi_definitions(id),
    implemented_at TIMESTAMP WITH TIME ZONE,
    
    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'IMPLEMENTED')),
    CHECK (review_decision IN ('APPROVE', 'REJECT', 'MODIFY')),
    CHECK (suggested_frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'))
);

-- Create indexes
CREATE INDEX idx_ai_suggestions_org ON ai_suggestions(organization_id);
CREATE INDEX idx_ai_suggestions_status ON ai_suggestions(status);
CREATE INDEX idx_ai_suggestions_job_title ON ai_suggestions(job_title);
CREATE INDEX idx_ai_suggestions_expires_at ON ai_suggestions(expires_at);
CREATE INDEX idx_ai_suggestions_confidence ON ai_suggestions(confidence_score DESC);

-- =====================================================
-- APPROVAL WORKFLOWS TABLE
-- =====================================================
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    
    -- Workflow context
    workflow_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- KPI_DEFINITION, KPI_ASSIGNMENT, etc.
    entity_id UUID NOT NULL,
    
    -- Change data
    change_data JSONB NOT NULL,
    change_summary TEXT,
    change_impact VARCHAR(50),
    
    -- Maker-Checker
    submitted_by UUID NOT NULL, -- Maker
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Approval
    approver_id UUID, -- Checker
    approval_status VARCHAR(50) DEFAULT 'PENDING',
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_comments TEXT,
    
    -- Emergency override
    emergency_override BOOLEAN DEFAULT false,
    override_by UUID,
    override_at TIMESTAMP WITH TIME ZONE,
    override_reason TEXT,
    
    -- Priority and deadlines
    priority VARCHAR(20) DEFAULT 'NORMAL',
    deadline TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    
    -- Constraints
    CHECK (workflow_type IN ('CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'MODIFY_ASSIGNMENT')),
    CHECK (entity_type IN ('KPI_DEFINITION', 'KPI_ASSIGNMENT', 'EMPLOYEE_PORTFOLIO', 'AI_SUGGESTION')),
    CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED')),
    CHECK (change_impact IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    CHECK (submitted_by != approver_id) -- Maker-checker separation
);

-- Create indexes
CREATE INDEX idx_approval_workflows_org ON approval_workflows(organization_id);
CREATE INDEX idx_approval_workflows_status ON approval_workflows(approval_status);
CREATE INDEX idx_approval_workflows_type ON approval_workflows(workflow_type);
CREATE INDEX idx_approval_workflows_entity ON approval_workflows(entity_type, entity_id);
CREATE INDEX idx_approval_workflows_submitter ON approval_workflows(submitted_by);
CREATE INDEX idx_approval_workflows_approver ON approval_workflows(approver_id);
CREATE INDEX idx_approval_workflows_deadline ON approval_workflows(deadline) WHERE deadline IS NOT NULL;

-- =====================================================
-- DOMAIN EVENTS TABLE (Event Sourcing)
-- =====================================================
CREATE TABLE domain_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event identification
    event_type VARCHAR(100) NOT NULL,
    event_version INTEGER DEFAULT 1,
    
    -- Aggregate information
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id UUID NOT NULL,
    aggregate_version INTEGER NOT NULL,
    
    -- Event data
    event_data JSONB NOT NULL,
    event_metadata JSONB,
    
    -- Correlation and causation
    correlation_id UUID,
    causation_id UUID,
    
    -- Timing
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Processing
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Sequence for ordering
    sequence_number BIGSERIAL,
    
    -- Constraints
    CHECK (aggregate_version > 0),
    CHECK (event_version > 0)
);

-- Create indexes for event sourcing
CREATE INDEX idx_domain_events_aggregate ON domain_events(aggregate_type, aggregate_id);
CREATE INDEX idx_domain_events_sequence ON domain_events(sequence_number);
CREATE INDEX idx_domain_events_occurred_at ON domain_events(occurred_at);
CREATE INDEX idx_domain_events_type ON domain_events(event_type);
CREATE INDEX idx_domain_events_correlation ON domain_events(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_domain_events_unprocessed ON domain_events(processed, occurred_at) WHERE processed = false;

-- =====================================================
-- AUDIT LOG TABLE
-- =====================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What was changed
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    
    -- Change details
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Who and when
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Context
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    
    -- Constraints
    CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Create indexes for audit log
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);
CREATE INDEX idx_audit_log_operation ON audit_log(operation);

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON SCHEMA kpi_management IS 'KPI Management Service database schema';

COMMENT ON TABLE kpi_definitions IS 'Master table for KPI definitions and templates';
COMMENT ON TABLE employee_kpi_portfolios IS 'Employee KPI portfolio management';
COMMENT ON TABLE kpi_assignments IS 'Individual KPI assignments to employees';
COMMENT ON TABLE kpi_hierarchy IS 'Organizational KPI hierarchy and cascading rules';
COMMENT ON TABLE ai_suggestions IS 'AI-generated KPI suggestions and recommendations';
COMMENT ON TABLE approval_workflows IS 'Maker-checker approval workflows';
COMMENT ON TABLE domain_events IS 'Event sourcing store for domain events';
COMMENT ON TABLE audit_log IS 'Audit trail for all data changes';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Create application user (run this as superuser)
-- CREATE USER kpi_app_user WITH PASSWORD 'secure_password_here';

-- Grant schema permissions
-- GRANT USAGE ON SCHEMA kpi_management TO kpi_app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA kpi_management TO kpi_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA kpi_management TO kpi_app_user;

-- Grant permissions on future objects
-- ALTER DEFAULT PRIVILEGES IN SCHEMA kpi_management GRANT ALL ON TABLES TO kpi_app_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA kpi_management GRANT ALL ON SEQUENCES TO kpi_app_user;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'KPI Management Service database schema created successfully!';
    RAISE NOTICE 'Tables created: %, %, %, %, %, %, %, %', 
        'kpi_definitions', 'employee_kpi_portfolios', 'kpi_assignments', 
        'kpi_hierarchy', 'ai_suggestions', 'approval_workflows', 
        'domain_events', 'audit_log';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run 02-seed-data.sql to populate initial data';
    RAISE NOTICE '2. Configure application database connection';
    RAISE NOTICE '3. Test database connectivity';
END $$;