package com.company.dataanalytics.infrastructure.config;

import com.company.dataanalytics.domain.services.ReportGenerationService;
import com.company.dataanalytics.domain.services.UserAdministrationService;
import com.company.dataanalytics.domain.shared.DomainEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for infrastructure layer components
 */
@Configuration
public class InfrastructureConfig {
    
    /**
     * Configure Report Generation Service
     */
    @Bean
    public ReportGenerationService reportGenerationService(DomainEventPublisher eventPublisher) {
        return new ReportGenerationService(eventPublisher);
    }
    
    /**
     * Configure User Administration Service
     */
    @Bean
    public UserAdministrationService userAdministrationService(DomainEventPublisher eventPublisher) {
        return new UserAdministrationService(eventPublisher);
    }
}