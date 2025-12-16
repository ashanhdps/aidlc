package com.company.kpi.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

/**
 * Database configuration for multiple database support
 */
@Configuration
public class DatabaseConfig {
    
    /**
     * SQLite DataSource configuration
     */
    @Bean
    @Primary
    @ConditionalOnProperty(name = "app.database.type", havingValue = "sqlite")
    public DataSource sqliteDataSource() {
        return DataSourceBuilder.create()
            .driverClassName("org.sqlite.JDBC")
            .url("jdbc:sqlite:kpi-management.db")
            .build();
    }
    
    /**
     * H2 DataSource configuration (alternative for testing)
     */
    @Bean
    @ConditionalOnProperty(name = "app.database.type", havingValue = "h2")
    public DataSource h2DataSource() {
        return DataSourceBuilder.create()
            .driverClassName("org.h2.Driver")
            .url("jdbc:h2:mem:kpi-management;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE")
            .username("sa")
            .password("")
            .build();
    }
}