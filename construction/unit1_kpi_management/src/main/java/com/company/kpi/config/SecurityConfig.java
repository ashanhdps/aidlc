package com.company.kpi.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.company.kpi.infrastructure.security.JwtAuthenticationFilter;

/**
 * Security configuration with JWT authentication for KPI Management Service
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    private CorsConfigurationSource corsConfigurationSource;
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                
                // KPI Definition endpoints - Role-based access
                .requestMatchers("GET", "/api/v1/kpi-management/kpis/**").hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR", "ANALYST", "EMPLOYEE")
                .requestMatchers("POST", "/api/v1/kpi-management/kpis").hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR")
                .requestMatchers("PUT", "/api/v1/kpi-management/kpis/**").hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR")
                .requestMatchers("DELETE", "/api/v1/kpi-management/kpis/**").hasAnyRole("ADMIN", "MANAGER")

                // KPI Assignment endpoints - Supervisors and managers can assign
                .requestMatchers("GET", "/api/v1/kpi-management/assignments/**").hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR", "ANALYST")
                .requestMatchers("POST", "/api/v1/kpi-management/assignments").hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR")
                .requestMatchers("PUT", "/api/v1/kpi-management/assignments/**").hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR")
                .requestMatchers("DELETE", "/api/v1/kpi-management/assignments/**").hasAnyRole("ADMIN", "MANAGER")

                // Approval workflow endpoints - Admin and managers can approve
                .requestMatchers("GET", "/api/v1/kpi-management/approval-workflows/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("POST", "/api/v1/kpi-management/approval-workflows/*/approve").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("POST", "/api/v1/kpi-management/approval-workflows/*/reject").hasAnyRole("ADMIN", "MANAGER")
                
                // KPI Data endpoints - All authenticated users can view data
                .requestMatchers("/api/v1/kpi-management/data/**").authenticated()
                
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .httpBasic(httpBasic -> httpBasic.disable());
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}