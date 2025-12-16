package com.company.kpi.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.*;

/**
 * Utility to verify and explore SQLite database contents
 */
@Component
@ConditionalOnProperty(name = "app.database.verify", havingValue = "true")
public class DatabaseVerificationUtil implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseVerificationUtil.class);
    
    @Autowired(required = false)
    private DataSource dataSource;
    
    @Override
    public void run(String... args) throws Exception {
        if (dataSource != null) {
            verifyDatabase();
        } else {
            logger.info("DataSource not available - likely using DynamoDB");
        }
    }
    
    private void verifyDatabase() {
        logger.info("=== DATABASE VERIFICATION ===");
        
        try (Connection conn = dataSource.getConnection()) {
            logger.info("Database URL: {}", conn.getMetaData().getURL());
            logger.info("Database Product: {}", conn.getMetaData().getDatabaseProductName());
            logger.info("Database Version: {}", conn.getMetaData().getDatabaseProductVersion());
            
            // List all tables
            listTables(conn);
            
            // Check KPI definitions table
            checkKPIDefinitionsTable(conn);
            
        } catch (SQLException e) {
            logger.error("Error verifying database", e);
        }
        
        logger.info("=== END DATABASE VERIFICATION ===");
    }
    
    private void listTables(Connection conn) throws SQLException {
        logger.info("\n--- TABLES ---");
        DatabaseMetaData metaData = conn.getMetaData();
        ResultSet tables = metaData.getTables(null, null, "%", new String[]{"TABLE"});
        
        while (tables.next()) {
            String tableName = tables.getString("TABLE_NAME");
            logger.info("Table: {}", tableName);
        }
    }
    
    private void checkKPIDefinitionsTable(Connection conn) throws SQLException {
        logger.info("\n--- KPI DEFINITIONS TABLE ---");
        
        // Check if table exists and get structure
        String sql = "SELECT name FROM sqlite_master WHERE type='table' AND name='kpi_definitions'";
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                logger.info("✅ kpi_definitions table exists");
                
                // Get table schema
                showTableSchema(conn, "kpi_definitions");
                
                // Count records
                countRecords(conn, "kpi_definitions");
                
                // Show sample data
                showSampleData(conn);
                
            } else {
                logger.warn("❌ kpi_definitions table does not exist");
            }
        }
    }
    
    private void showTableSchema(Connection conn, String tableName) throws SQLException {
        logger.info("\n--- TABLE SCHEMA: {} ---", tableName);
        String sql = "PRAGMA table_info(" + tableName + ")";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            logger.info("Columns:");
            while (rs.next()) {
                String columnName = rs.getString("name");
                String dataType = rs.getString("type");
                boolean notNull = rs.getBoolean("notnull");
                String defaultValue = rs.getString("dflt_value");
                boolean primaryKey = rs.getBoolean("pk");
                
                logger.info("  - {} {} {} {} {}", 
                    columnName, 
                    dataType,
                    notNull ? "NOT NULL" : "NULL",
                    defaultValue != null ? "DEFAULT " + defaultValue : "",
                    primaryKey ? "PRIMARY KEY" : "");
            }
        }
    }
    
    private void countRecords(Connection conn, String tableName) throws SQLException {
        String sql = "SELECT COUNT(*) as count FROM " + tableName;
        
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                int count = rs.getInt("count");
                logger.info("Record count in {}: {}", tableName, count);
            }
        }
    }
    
    private void showSampleData(Connection conn) throws SQLException {
        logger.info("\n--- SAMPLE KPI DEFINITIONS ---");
        String sql = "SELECT id, name, category, measurement_type, is_active FROM kpi_definitions LIMIT 5";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            logger.info("Sample records:");
            while (rs.next()) {
                logger.info("  ID: {}, Name: {}, Category: {}, Type: {}, Active: {}", 
                    rs.getString("id"),
                    rs.getString("name"),
                    rs.getString("category"),
                    rs.getString("measurement_type"),
                    rs.getBoolean("is_active"));
            }
        }
    }
}