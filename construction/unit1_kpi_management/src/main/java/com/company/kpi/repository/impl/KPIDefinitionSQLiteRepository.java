package com.company.kpi.repository.impl;

import com.company.kpi.model.KPICategory;
import com.company.kpi.model.KPIDefinition;
import com.company.kpi.repository.interfaces.KPIDefinitionRepositoryInterface;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * SQLite implementation of KPI Definition Repository
 */
@Repository
@ConditionalOnProperty(name = "app.database.type", havingValue = "sqlite")
public class KPIDefinitionSQLiteRepository implements KPIDefinitionRepositoryInterface {
    
    private static final Logger logger = LoggerFactory.getLogger(KPIDefinitionSQLiteRepository.class);
    
    private final DataSource dataSource;
    
    public KPIDefinitionSQLiteRepository(DataSource dataSource) {
        this.dataSource = dataSource;
        initializeTable();
    }
    
    @Override
    public KPIDefinition save(KPIDefinition kpi) {
        String sql = """
            INSERT OR REPLACE INTO kpi_definitions (
                id, name, description, category, measurement_type, default_target_value,
                default_target_unit, default_target_comparison_type, default_weight_percentage,
                default_weight_is_flexible, measurement_frequency_type, measurement_frequency_value,
                data_source, created_by, created_at, updated_at, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, kpi.getId());
            stmt.setString(2, kpi.getName());
            stmt.setString(3, kpi.getDescription());
            stmt.setString(4, kpi.getCategory().name());
            stmt.setString(5, kpi.getMeasurementType().name());
            stmt.setBigDecimal(6, kpi.getDefaultTargetValue());
            stmt.setString(7, kpi.getDefaultTargetUnit());
            stmt.setString(8, kpi.getDefaultTargetComparisonType().name());
            stmt.setBigDecimal(9, kpi.getDefaultWeightPercentage());
            stmt.setBoolean(10, kpi.isDefaultWeightIsFlexible());
            stmt.setString(11, kpi.getMeasurementFrequencyType());
            stmt.setInt(12, kpi.getMeasurementFrequencyValue());
            stmt.setString(13, kpi.getDataSource());
            stmt.setString(14, kpi.getCreatedBy());
            stmt.setTimestamp(15, Timestamp.valueOf(kpi.getCreatedAt()));
            stmt.setTimestamp(16, Timestamp.valueOf(kpi.getUpdatedAt()));
            stmt.setBoolean(17, kpi.isActive());
            
            stmt.executeUpdate();
            logger.debug("Saved KPI Definition: {}", kpi.getId());
            return kpi;
            
        } catch (SQLException e) {
            logger.error("Error saving KPI Definition: {}", kpi.getId(), e);
            throw new RuntimeException("Failed to save KPI Definition", e);
        }
    }
    
    @Override
    public Optional<KPIDefinition> findById(String id) {
        String sql = "SELECT * FROM kpi_definitions WHERE id = ?";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToKPI(rs));
            }
            return Optional.empty();
            
        } catch (SQLException e) {
            logger.error("Error finding KPI Definition by ID: {}", id, e);
            throw new RuntimeException("Failed to find KPI Definition", e);
        }
    }
    
    @Override
    public List<KPIDefinition> findAll() {
        String sql = "SELECT * FROM kpi_definitions ORDER BY created_at DESC";
        List<KPIDefinition> kpis = new ArrayList<>();
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                kpis.add(mapResultSetToKPI(rs));
            }
            
        } catch (SQLException e) {
            logger.error("Error finding all KPI Definitions", e);
            throw new RuntimeException("Failed to find KPI Definitions", e);
        }
        
        return kpis;
    }
    
    @Override
    public Optional<KPIDefinition> findByName(String name) {
        String sql = "SELECT * FROM kpi_definitions WHERE name = ?";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, name);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return Optional.of(mapResultSetToKPI(rs));
            }
            return Optional.empty();
            
        } catch (SQLException e) {
            logger.error("Error finding KPI Definition by name: {}", name, e);
            throw new RuntimeException("Failed to find KPI Definition", e);
        }
    }
    
    @Override
    public boolean existsByName(String name) {
        return findByName(name).isPresent();
    }
    
    @Override
    public List<KPIDefinition> findByCategory(KPICategory category) {
        String sql = "SELECT * FROM kpi_definitions WHERE category = ? ORDER BY created_at DESC";
        List<KPIDefinition> kpis = new ArrayList<>();
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, category.name());
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                kpis.add(mapResultSetToKPI(rs));
            }
            
        } catch (SQLException e) {
            logger.error("Error finding KPI Definitions by category: {}", category, e);
            throw new RuntimeException("Failed to find KPI Definitions", e);
        }
        
        return kpis;
    }
    
    @Override
    public List<KPIDefinition> findByIsActiveTrue() {
        String sql = "SELECT * FROM kpi_definitions WHERE is_active = true ORDER BY created_at DESC";
        List<KPIDefinition> kpis = new ArrayList<>();
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                kpis.add(mapResultSetToKPI(rs));
            }
            
        } catch (SQLException e) {
            logger.error("Error finding active KPI Definitions", e);
            throw new RuntimeException("Failed to find active KPI Definitions", e);
        }
        
        return kpis;
    }
    
    @Override
    public void deleteById(String id) {
        String sql = "DELETE FROM kpi_definitions WHERE id = ?";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, id);
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                logger.debug("Deleted KPI Definition: {}", id);
            } else {
                logger.warn("No KPI Definition found to delete: {}", id);
            }
            
        } catch (SQLException e) {
            logger.error("Error deleting KPI Definition: {}", id, e);
            throw new RuntimeException("Failed to delete KPI Definition", e);
        }
    }
    
    @Override
    public long count() {
        String sql = "SELECT COUNT(*) FROM kpi_definitions";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                return rs.getLong(1);
            }
            return 0;
            
        } catch (SQLException e) {
            logger.error("Error counting KPI Definitions", e);
            throw new RuntimeException("Failed to count KPI Definitions", e);
        }
    }
    
    /**
     * Initialize SQLite table
     */
    private void initializeTable() {
        String sql = """
            CREATE TABLE IF NOT EXISTS kpi_definitions (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                category TEXT NOT NULL,
                measurement_type TEXT NOT NULL,
                default_target_value DECIMAL,
                default_target_unit TEXT,
                default_target_comparison_type TEXT,
                default_weight_percentage DECIMAL,
                default_weight_is_flexible BOOLEAN,
                measurement_frequency_type TEXT,
                measurement_frequency_value INTEGER,
                data_source TEXT,
                created_by TEXT,
                created_at TIMESTAMP,
                updated_at TIMESTAMP,
                is_active BOOLEAN DEFAULT true
            )
            """;
        
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            
            stmt.execute(sql);
            logger.info("Initialized KPI Definitions SQLite table");
            
        } catch (SQLException e) {
            logger.error("Error initializing SQLite table", e);
            throw new RuntimeException("Failed to initialize SQLite table", e);
        }
    }
    
    /**
     * Map ResultSet to KPI Definition
     */
    private KPIDefinition mapResultSetToKPI(ResultSet rs) throws SQLException {
        KPIDefinition kpi = new KPIDefinition();
        kpi.setId(rs.getString("id"));
        kpi.setName(rs.getString("name"));
        kpi.setDescription(rs.getString("description"));
        kpi.setCategory(KPICategory.valueOf(rs.getString("category")));
        kpi.setMeasurementType(com.company.kpi.model.MeasurementType.valueOf(rs.getString("measurement_type")));
        kpi.setDefaultTargetValue(rs.getBigDecimal("default_target_value"));
        kpi.setDefaultTargetUnit(rs.getString("default_target_unit"));
        kpi.setDefaultTargetComparisonType(com.company.kpi.model.ComparisonType.valueOf(rs.getString("default_target_comparison_type")));
        kpi.setDefaultWeightPercentage(rs.getBigDecimal("default_weight_percentage"));
        kpi.setDefaultWeightIsFlexible(rs.getBoolean("default_weight_is_flexible"));
        kpi.setMeasurementFrequencyType(rs.getString("measurement_frequency_type"));
        kpi.setMeasurementFrequencyValue(rs.getInt("measurement_frequency_value"));
        kpi.setDataSource(rs.getString("data_source"));
        kpi.setCreatedBy(rs.getString("created_by"));
        kpi.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        kpi.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        kpi.setActive(rs.getBoolean("is_active"));
        return kpi;
    }
}