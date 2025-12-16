package com.company.dataanalytics.api.controllers;

import com.company.dataanalytics.api.dto.request.CreateUserRequest;
import com.company.dataanalytics.api.dto.request.UpdateUserRequest;
import com.company.dataanalytics.api.dto.response.UserResponse;
import com.company.dataanalytics.api.mappers.UserMapper;
import com.company.dataanalytics.application.services.UserApplicationService;
import com.company.dataanalytics.domain.aggregates.user.UserAccount;
import com.company.dataanalytics.domain.valueobjects.UserId;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for user management operations
 */
@RestController
@RequestMapping("/admin/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    private final UserApplicationService userApplicationService;
    private final UserMapper userMapper;
    
    public UserController(UserApplicationService userApplicationService, UserMapper userMapper) {
        this.userApplicationService = userApplicationService;
        this.userMapper = userMapper;
    }
    
    /**
     * Get all users with pagination
     */
    @GetMapping
    public ResponseEntity<List<UserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        
        List<UserAccount> users;
        
        if (activeOnly) {
            users = userApplicationService.getActiveUsers();
        } else if (role != null && !role.trim().isEmpty()) {
            users = userApplicationService.getUsersByRole(role);
        } else {
            users = userApplicationService.getUsers(page, size);
        }
        
        List<UserResponse> response = userMapper.toResponseList(users);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get user by ID
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        try {
            UserId userIdObj = UserId.of(userId);
            UserAccount user = userApplicationService.getUserById(userIdObj);
            UserResponse response = userMapper.toResponse(user);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get user by email
     */
    @GetMapping("/by-email")
    public ResponseEntity<UserResponse> getUserByEmail(@RequestParam String email) {
        Optional<UserAccount> user = userApplicationService.getUserByEmail(email);
        
        if (user.isPresent()) {
            UserResponse response = userMapper.toResponse(user.get());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Create new user
     */
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            // For demo purposes, use a system admin user ID
            UserId createdBy = UserId.generate(); // In real implementation, get from JWT token
            
            UserId userId = userApplicationService.createUser(
                request.getEmail(),
                request.getUsername(),
                request.getRole(),
                createdBy
            );
            
            UserAccount createdUser = userApplicationService.getUserById(userId);
            UserResponse response = userMapper.toResponse(createdUser);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update user
     */
    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String userId,
                                                  @Valid @RequestBody UpdateUserRequest request) {
        try {
            UserId userIdObj = UserId.of(userId);
            UserId updatedBy = UserId.generate(); // In real implementation, get from JWT token
            
            // Update email if provided
            if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                userApplicationService.updateUser(userIdObj, request.getEmail(), updatedBy);
            }
            
            // Update role if provided
            if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
                userApplicationService.changeUserRole(userIdObj, request.getRole(), updatedBy);
            }
            
            UserAccount updatedUser = userApplicationService.getUserById(userIdObj);
            UserResponse response = userMapper.toResponse(updatedUser);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Activate user
     */
    @PostMapping("/{userId}/activate")
    public ResponseEntity<UserResponse> activateUser(@PathVariable String userId) {
        try {
            UserId userIdObj = UserId.of(userId);
            UserId activatedBy = UserId.generate(); // In real implementation, get from JWT token
            
            userApplicationService.activateUser(userIdObj, activatedBy);
            
            UserAccount user = userApplicationService.getUserById(userIdObj);
            UserResponse response = userMapper.toResponse(user);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Deactivate user
     */
    @PostMapping("/{userId}/deactivate")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable String userId) {
        try {
            UserId userIdObj = UserId.of(userId);
            UserId deactivatedBy = UserId.generate(); // In real implementation, get from JWT token
            
            userApplicationService.deactivateUser(userIdObj, deactivatedBy);
            
            UserAccount user = userApplicationService.getUserById(userIdObj);
            UserResponse response = userMapper.toResponse(user);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Check user permissions
     */
    @GetMapping("/{userId}/permissions")
    public ResponseEntity<Boolean> checkPermission(@PathVariable String userId,
                                                  @RequestParam String resource,
                                                  @RequestParam String action) {
        try {
            UserId userIdObj = UserId.of(userId);
            boolean hasPermission = userApplicationService.hasPermission(userIdObj, resource, action);
            return ResponseEntity.ok(hasPermission);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Check if user can perform admin actions
     */
    @GetMapping("/{userId}/admin-access")
    public ResponseEntity<Boolean> checkAdminAccess(@PathVariable String userId) {
        try {
            UserId userIdObj = UserId.of(userId);
            boolean canPerformAdmin = userApplicationService.canPerformAdminActions(userIdObj);
            return ResponseEntity.ok(canPerformAdmin);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}