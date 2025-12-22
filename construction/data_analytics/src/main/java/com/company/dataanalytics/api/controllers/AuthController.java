package com.company.dataanalytics.api.controllers;

import com.company.dataanalytics.api.dto.request.LoginRequest;
import com.company.dataanalytics.api.dto.response.AuthResponse;
import com.company.dataanalytics.application.services.UserApplicationService;
import com.company.dataanalytics.domain.aggregates.user.UserAccount;
import com.company.dataanalytics.domain.valueobjects.Email;
import com.company.dataanalytics.infrastructure.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Authentication controller for JWT token generation
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserApplicationService userApplicationService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Health check endpoint for auth service
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is running");
    }

    /**
     * Login endpoint to generate JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // For demo purposes, we'll use simple username/password validation
            // In production, this should validate against the user database
            String token = authenticateAndGenerateToken(loginRequest.getUsername(), loginRequest.getPassword());
            
            if (token != null) {
                // Extract user info from token for response
                String role = jwtUtil.extractRole(token);
                String userId = jwtUtil.extractUserId(token);
                
                AuthResponse response = new AuthResponse();
                response.setToken(token);
                response.setUsername(loginRequest.getUsername());
                response.setRole(role);
                response.setUserId(userId);
                response.setTokenType("Bearer");
                response.setExpiresIn(86400); // 24 hours
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid credentials"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Authentication failed"));
        }
    }

    /**
     * Validate token endpoint
     */
    @PostMapping("/validate")
    public ResponseEntity<AuthResponse> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                
                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.extractUsername(token);
                    String role = jwtUtil.extractRole(token);
                    String userId = jwtUtil.extractUserId(token);
                    
                    AuthResponse response = new AuthResponse();
                    response.setToken(token);
                    response.setUsername(username);
                    response.setRole(role);
                    response.setUserId(userId);
                    response.setTokenType("Bearer");
                    response.setValid(true);
                    
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Invalid or expired token"));
                }
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Missing or invalid Authorization header"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Token validation failed"));
        }
    }

    /**
     * Refresh token endpoint
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String oldToken = authHeader.substring(7);
                
                if (jwtUtil.validateToken(oldToken)) {
                    String username = jwtUtil.extractUsername(oldToken);
                    String role = jwtUtil.extractRole(oldToken);
                    String userId = jwtUtil.extractUserId(oldToken);
                    
                    // Generate new token
                    String newToken = jwtUtil.generateToken(username, role, userId);
                    
                    AuthResponse response = new AuthResponse();
                    response.setToken(newToken);
                    response.setUsername(username);
                    response.setRole(role);
                    response.setUserId(userId);
                    response.setTokenType("Bearer");
                    response.setExpiresIn(86400);
                    
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Invalid or expired token"));
                }
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Missing or invalid Authorization header"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Token refresh failed"));
        }
    }

    private String authenticateAndGenerateToken(String username, String password) {
        // Demo authentication - replace with proper user validation
        String role = null;
        String userId = null;
        
        // Try to find user by username first
        try {
            Optional<UserAccount> userOpt = userApplicationService.getUserByUsername(username);
            
            if (userOpt.isPresent()) {
                UserAccount user = userOpt.get();
                
                // Verify password
                if (passwordEncoder.matches(password, user.getPasswordHash())) {
                    
                    // Check if account is active
                    if (!user.canAccessSystem()) {
                        return null; // Account not active
                    }
                    
                    role = user.getRole().getRoleName().getValue();
                    userId = user.getId().getValue().toString();
                    
                    // Record login
                    userApplicationService.recordLogin(user.getId(), null, null);
                    
                    // Generate JWT token
                    return jwtUtil.generateToken(username, role, userId);
                }
            }
        } catch (Exception e) {
            // Fall back to demo users if database lookup fails
        }
        
        // Fallback to demo authentication for backward compatibility
        if ("admin".equals(username) && "admin123".equals(password)) {
            role = "ADMIN";
            userId = "admin-001";
        } else if ("manager".equals(username) && "manager123".equals(password)) {
            role = "MANAGER";
            userId = "manager-001";
        } else if ("analyst".equals(username) && "analyst123".equals(password)) {
            role = "ANALYST";
            userId = "analyst-001";
        } else if ("employee".equals(username) && "employee123".equals(password)) {
            role = "EMPLOYEE";
            userId = "employee-001";
        } else {
            // Try to find user in database by email
            try {
                Optional<UserAccount> userOpt = userApplicationService.getUserByEmail(Email.of(username + "@company.com").toString());
                if (userOpt.isPresent()) {
                    UserAccount user = userOpt.get();
                    // In production, validate password hash
                    role = user.getRole().getRoleName().getValue();
                    userId = user.getId().getValue().toString();
                }
            } catch (Exception e) {
                // User not found
                return null;
            }
        }
        
        if (role != null && userId != null) {
            return jwtUtil.generateToken(username, role, userId);
        }
        
        return null;
    }

    private AuthResponse createErrorResponse(String message) {
        AuthResponse response = new AuthResponse();
        response.setError(message);
        response.setValid(false);
        return response;
    }
}