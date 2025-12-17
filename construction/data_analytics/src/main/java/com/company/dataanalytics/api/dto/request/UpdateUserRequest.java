package com.company.dataanalytics.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

/**
 * Request DTO for updating user information
 */
public class UpdateUserRequest {
    
    @Email(message = "Email must be valid")
    private String email;
    
    @Pattern(regexp = "ADMIN|HR|SUPERVISOR|EMPLOYEE", message = "Role must be one of: ADMIN, HR, SUPERVISOR, EMPLOYEE")
    private String role;
    
    // Constructors
    public UpdateUserRequest() {}
    
    public UpdateUserRequest(String email, String role) {
        this.email = email;
        this.role = role;
    }
    
    // Getters and Setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
}