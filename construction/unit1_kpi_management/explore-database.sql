-- SQLite Database Exploration Script
-- Run this with: sqlite3 kpi-management.db < explore-database.sql

.headers on
.mode table

-- Show database info
.print "=== DATABASE INFO ==="
.databases

-- List all tables
.print "\n=== TABLES ==="
.tables

-- Show kpi_definitions table structure
.print "\n=== KPI DEFINITIONS TABLE SCHEMA ==="
.schema kpi_definitions

-- Count records in kpi_definitions
.print "\n=== RECORD COUNTS ==="
SELECT 'kpi_definitions' as table_name, COUNT(*) as record_count FROM kpi_definitions;

-- Show sample KPI definitions
.print "\n=== SAMPLE KPI DEFINITIONS ==="
SELECT 
    id,
    name,
    category,
    measurement_type,
    default_target_value,
    default_target_unit,
    is_active,
    created_by,
    created_at
FROM kpi_definitions 
LIMIT 10;

-- Show KPIs by category
.print "\n=== KPIs BY CATEGORY ==="
SELECT 
    category,
    COUNT(*) as count,
    GROUP_CONCAT(name, ', ') as kpi_names
FROM kpi_definitions 
GROUP BY category;

-- Show active vs inactive KPIs
.print "\n=== ACTIVE vs INACTIVE KPIs ==="
SELECT 
    CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END as status,
    COUNT(*) as count
FROM kpi_definitions 
GROUP BY is_active;

-- Show measurement types
.print "\n=== MEASUREMENT TYPES ==="
SELECT 
    measurement_type,
    COUNT(*) as count
FROM kpi_definitions 
GROUP BY measurement_type;

.print "\n=== EXPLORATION COMPLETE ==="