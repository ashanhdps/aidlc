-- Data Analytics Service - Database Setup Script
-- This script creates the database schema for the Data Analytics Service

-- Create database (if running as superuser)
-- CREATE DATABASE dataanalytics;
-- \c dataanalytics;

-- Create schema
CREATE SCHEMA IF NOT EXISTS data_analytics;
SET search_path TO data_analytics;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_time TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_account_status CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    CONSTRAINT chk_role_name CHECK (role_name IN ('ADMIN', 'HR', 'SUPERVISOR', 'EMPLOYEE'))
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    assigned_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- User role assignments
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id UUID,
    details TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID,
    report_name VARCHAR(255) NOT NULL,
    report_format VARCHAR(10) NOT NULL,
    generation_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    file_path VARCHAR(500),
    file_size BIGINT,
    generated_by UUID NOT NULL,
    generation_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completion_timestamp TIMESTAMP,
    parameters JSONB,
    error_message TEXT,
    
    FOREIGN KEY (generated_by) REFERENCES users(id),
    CONSTRAINT chk_report_format CHECK (report_format IN ('PDF', 'CSV', 'EXCEL', 'JSON')),
    CONSTRAINT chk_generation_status CHECK (generation_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'))
);

-- Report templates table
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    configuration JSONB NOT NULL,
    created_by UUID NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Performance data table
CREATE TABLE IF NOT EXISTS performance_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(255) NOT NULL,
    kpi_id VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50),
    data_timestamp TIMESTAMP NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(100),
    metadata JSONB,
    quality_score DECIMAL(3,2) DEFAULT 1.0,
    
    CONSTRAINT chk_quality_score CHECK (quality_score >= 0.0 AND quality_score <= 1.0)
);

-- Audit trail table
CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    change_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT,
    
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_name);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_timestamp ON activity_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_timestamp ON activity_logs(action, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_reports_generated_by ON reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(generation_status);
CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON reports(generation_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_data_employee_date ON performance_data(employee_id, data_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_data_kpi_date ON performance_data(kpi_id, data_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_data_timestamp ON performance_data(data_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail(change_timestamp DESC);

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
    ('ADMIN', 'System Administrator with full access'),
    ('HR', 'Human Resources personnel with user management access'),
    ('SUPERVISOR', 'Team supervisor with team member access'),
    ('EMPLOYEE', 'Regular employee with limited access')
ON CONFLICT (role_name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (permission_name, description, resource, action) VALUES
    ('MANAGE_USERS', 'Create, update, and delete users', 'users', 'manage'),
    ('VIEW_ALL_USERS', 'View all user information', 'users', 'view_all'),
    ('VIEW_OWN_DATA', 'View own user data and performance', 'users', 'view_own'),
    ('MANAGE_REPORTS', 'Create and manage report templates', 'reports', 'manage'),
    ('GENERATE_REPORTS', 'Generate reports from templates', 'reports', 'generate'),
    ('VIEW_REPORTS', 'View generated reports', 'reports', 'view'),
    ('MANAGE_SYSTEM', 'System administration and configuration', 'system', 'manage'),
    ('VIEW_ANALYTICS', 'View analytics and dashboards', 'analytics', 'view'),
    ('MANAGE_PERFORMANCE_DATA', 'Manage performance data', 'performance', 'manage'),
    ('VIEW_TEAM_DATA', 'View team performance data', 'performance', 'view_team')
ON CONFLICT (permission_name) DO NOTHING;

-- Assign permissions to roles
WITH role_permission_mapping AS (
    SELECT 
        r.id as role_id,
        p.id as permission_id
    FROM roles r
    CROSS JOIN permissions p
    WHERE 
        (r.role_name = 'ADMIN') OR
        (r.role_name = 'HR' AND p.permission_name IN ('MANAGE_USERS', 'VIEW_ALL_USERS', 'VIEW_ANALYTICS', 'GENERATE_REPORTS', 'VIEW_REPORTS')) OR
        (r.role_name = 'SUPERVISOR' AND p.permission_name IN ('VIEW_TEAM_DATA', 'GENERATE_REPORTS', 'VIEW_REPORTS', 'VIEW_ANALYTICS')) OR
        (r.role_name = 'EMPLOYEE' AND p.permission_name IN ('VIEW_OWN_DATA', 'VIEW_REPORTS'))
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT role_id, permission_id FROM role_permission_mapping
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Insert default report templates
INSERT INTO report_templates (template_name, description, configuration, created_by) VALUES
    ('Employee Performance Summary', 'Standard employee performance report', 
     '{"supportedFormats": ["PDF", "CSV"], "estimatedMinutes": 3, "requiredParameters": {"employeeId": "string", "period": "string"}}',
     (SELECT id FROM users WHERE role_name = 'ADMIN' LIMIT 1)),
    ('Team Performance Dashboard', 'Team-level performance analytics report',
     '{"supportedFormats": ["PDF", "EXCEL"], "estimatedMinutes": 5, "requiredParameters": {"supervisorId": "string", "period": "string"}}',
     (SELECT id FROM users WHERE role_name = 'ADMIN' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Create a function to update last_modified timestamp
CREATE OR REPLACE FUNCTION update_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for last_modified updates
CREATE TRIGGER update_users_last_modified
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified();

CREATE TRIGGER update_report_templates_last_modified
    BEFORE UPDATE ON report_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified();

-- Create a function for audit trail
CREATE OR REPLACE FUNCTION create_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_trail (entity_type, entity_id, action, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_trail (entity_type, entity_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_trail (entity_type, entity_id, action, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for important tables
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_trail();

CREATE TRIGGER audit_reports
    AFTER INSERT OR UPDATE OR DELETE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_trail();

-- Grant permissions to application user (replace 'app_user' with actual username)
-- GRANT USAGE ON SCHEMA data_analytics TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA data_analytics TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA data_analytics TO app_user;

-- Display setup completion message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Schema: data_analytics';
    RAISE NOTICE 'Tables created: %, %, %, %, %, %, %, %, %, %', 
        'users', 'roles', 'permissions', 'role_permissions', 'user_roles',
        'activity_logs', 'reports', 'report_templates', 'performance_data', 'audit_trail';
END $$;