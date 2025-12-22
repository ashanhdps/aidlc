package com.company.kpi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Security configuration for basic authentication
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private CorsConfigurationSource corsConfigurationSource;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                
                // KPI Definition endpoints - Makers can create/modify, all can view
                .requestMatchers("GET", "/api/v1/kpi-management/kpis/**").hasAnyAuthority("VIEW_ALL", "VIEW_TEAM", "VIEW_OWN")
                .requestMatchers("POST", "/api/v1/kpi-management/kpis").hasAuthority("CREATE_KPI")
                .requestMatchers("PUT", "/api/v1/kpi-management/kpis/**").hasAuthority("MODIFY_KPI")
                .requestMatchers("DELETE", "/api/v1/kpi-management/kpis/**").hasAuthority("MODIFY_KPI")

                // KPI Assignment endpoints - Supervisors and managers can assign
                .requestMatchers("GET", "/api/v1/kpi-management/assignments/**").hasAnyAuthority("VIEW_ALL", "VIEW_TEAM")
                .requestMatchers("POST", "/api/v1/kpi-management/assignments").hasAuthority("ASSIGN_KPI")
                .requestMatchers("PUT", "/api/v1/kpi-management/assignments/**").hasAuthority("ASSIGN_KPI")
                .requestMatchers("DELETE", "/api/v1/kpi-management/assignments/**").hasAuthority("ASSIGN_KPI")

                // Approval workflow endpoints - Checkers can approve, makers can view their requests
                .requestMatchers("GET", "/api/v1/kpi-management/approval-workflows/pending").hasAuthority("APPROVE_CHANGES")
                .requestMatchers("GET", "/api/v1/kpi-management/approval-workflows/my-requests").hasAnyAuthority("ROLE_MAKER", "ROLE_SUPERVISOR")
                .requestMatchers("GET", "/api/v1/kpi-management/approval-workflows/all").hasAuthority("VIEW_ALL")
                .requestMatchers("POST", "/api/v1/kpi-management/approval-workflows/*/approve").hasAuthority("APPROVE_CHANGES")
                .requestMatchers("POST", "/api/v1/kpi-management/approval-workflows/*/reject").hasAuthority("APPROVE_CHANGES")
                
                // KPI Data endpoints - All authenticated users can view data
                .requestMatchers("/api/v1/kpi-management/data/**").authenticated()
                
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> {});
        
        return http.build();
    }
    
    @Bean
    public UserDetailsService userDetailsService() {
        // Admin - Regular view user (can view all data)
        UserDetails admin = User.builder()
            .username("admin")
            .password(passwordEncoder().encode("admin123"))
            .roles("ADMIN")
            .authorities("ROLE_ADMIN", "VIEW_ALL", "APPROVE_EMERGENCY")
            .build();
        
        // HR - Approver (can approve changes made by supervisors)
        UserDetails hr = User.builder()
            .username("hr")
            .password(passwordEncoder().encode("hr123"))
            .roles("HR", "APPROVER")
            .authorities("ROLE_HR", "ROLE_APPROVER", "APPROVE_CHANGES", "VIEW_ALL")
            .build();
        
        // Supervisor - Maker (can create/modify KPIs and assignments)
        UserDetails supervisor = User.builder()
            .username("supervisor")
            .password(passwordEncoder().encode("supervisor123"))
            .roles("SUPERVISOR", "MAKER")
            .authorities("ROLE_SUPERVISOR", "ROLE_MAKER", "CREATE_KPI", "MODIFY_KPI", "ASSIGN_KPI", "VIEW_TEAM")
            .build();
        
        // Manager - Can view and make some changes
        UserDetails manager = User.builder()
            .username("manager")
            .password(passwordEncoder().encode("manager123"))
            .roles("MANAGER")
            .authorities("ROLE_MANAGER", "VIEW_TEAM", "ASSIGN_KPI")
            .build();
        
        // Employee - Basic user (can view own KPIs)
        UserDetails employee = User.builder()
            .username("employee")
            .password(passwordEncoder().encode("employee123"))
            .roles("EMPLOYEE")
            .authorities("ROLE_EMPLOYEE", "VIEW_OWN")
            .build();
        
        return new InMemoryUserDetailsManager(admin, hr, supervisor, manager, employee);
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}