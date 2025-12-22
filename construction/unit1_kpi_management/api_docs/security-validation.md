# Security Configuration Validation

## Overview
This document validates that the security configuration matches the actual controller endpoints and provides test cases for each permission level.

## Fixed Security Configuration

### ✅ **Corrected Endpoint Mappings**

| Controller | Actual Path | Security Config Path | Status |
|------------|-------------|---------------------|---------|
| KPIDefinitionController | `/kpi-management/kpis` | `/kpi-management/kpis/**` | ✅ **FIXED** |
| KPIAssignmentController | `/kpi-management/assignments` | `/kpi-management/assignments/**` | ✅ **FIXED** |
| ApprovalWorkflowController | `/kpi-management/approval-workflows` | `/kpi-management/approval-workflows/**` | ✅ **FIXED** |
| KPIDataController | `/kpi-management/data` | `/kpi-management/data/**` | ✅ **FIXED** |

## Security Rules Validation

### 1. KPI Definitions (`/kpi-management/kpis`)

#### **GET Endpoints**
- **Path**: `/kpi-management/kpis/**`
- **Required Permissions**: `VIEW_ALL`, `VIEW_TEAM`, or `VIEW_OWN`
- **Allowed Users**: admin, hr, supervisor, manager
- **Denied Users**: employee (for viewing all KPIs)

#### **POST Endpoints**
- **Path**: `/kpi-management/kpis`
- **Required Permissions**: `CREATE_KPI`
- **Allowed Users**: supervisor
- **Denied Users**: admin, hr, manager, employee

#### **PUT Endpoints**
- **Path**: `/kpi-management/kpis/**`
- **Required Permissions**: `MODIFY_KPI`
- **Allowed Users**: supervisor
- **Denied Users**: admin, hr, manager, employee

#### **DELETE Endpoints**
- **Path**: `/kpi-management/kpis/**`
- **Required Permissions**: `MODIFY_KPI`
- **Allowed Users**: supervisor
- **Denied Users**: admin, hr, manager, employee

### 2. KPI Assignments (`/kpi-management/assignments`)

#### **GET Endpoints**
- **Path**: `/kpi-management/assignments/**`
- **Required Permissions**: `VIEW_ALL` or `VIEW_TEAM`
- **Allowed Users**: admin, hr, manager
- **Denied Users**: supervisor, employee

#### **POST Endpoints**
- **Path**: `/kpi-management/assignments`
- **Required Permissions**: `ASSIGN_KPI`
- **Allowed Users**: supervisor, manager
- **Denied Users**: admin, hr, employee

#### **PUT Endpoints**
- **Path**: `/kpi-management/assignments/**`
- **Required Permissions**: `ASSIGN_KPI`
- **Allowed Users**: supervisor, manager
- **Denied Users**: admin, hr, employee

#### **DELETE Endpoints**
- **Path**: `/kpi-management/assignments/**`
- **Required Permissions**: `ASSIGN_KPI`
- **Allowed Users**: supervisor, manager
- **Denied Users**: admin, hr, employee

### 3. Approval Workflows (`/kpi-management/approval-workflows`)

#### **GET /pending**
- **Path**: `/kpi-management/approval-workflows/pending`
- **Required Permissions**: `APPROVE_CHANGES`
- **Allowed Users**: hr
- **Denied Users**: admin, supervisor, manager, employee

#### **GET /my-requests**
- **Path**: `/kpi-management/approval-workflows/my-requests`
- **Required Permissions**: `ROLE_MAKER` or `ROLE_SUPERVISOR`
- **Allowed Users**: supervisor
- **Denied Users**: admin, hr, manager, employee

#### **GET /all**
- **Path**: `/kpi-management/approval-workflows/all`
- **Required Permissions**: `VIEW_ALL`
- **Allowed Users**: admin, hr
- **Denied Users**: supervisor, manager, employee

#### **POST /approve & /reject**
- **Path**: `/kpi-management/approval-workflows/*/approve` & `/kpi-management/approval-workflows/*/reject`
- **Required Permissions**: `APPROVE_CHANGES`
- **Allowed Users**: hr
- **Denied Users**: admin, supervisor, manager, employee

### 4. KPI Data (`/kpi-management/data`)

#### **All Endpoints**
- **Path**: `/kpi-management/data/**`
- **Required Permissions**: Authenticated user
- **Allowed Users**: All authenticated users (admin, hr, supervisor, manager, employee)
- **Denied Users**: Unauthenticated requests

## Test Cases

### Test Case 1: KPI Definition Access Control

```bash
# Should succeed (admin has VIEW_ALL)
curl -X GET "http://localhost:8080/api/v1/kpi-management/kpis" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
# Expected: 200

# Should fail (employee lacks VIEW_ALL/VIEW_TEAM for all KPIs)
curl -X GET "http://localhost:8080/api/v1/kpi-management/kpis" \
  -H "Authorization: Basic ZW1wbG95ZWU6ZW1wbG95ZWUxMjM="
# Expected: 403
```

### Test Case 2: KPI Creation Permissions

```bash
# Should succeed (supervisor has CREATE_KPI)
curl -X POST "http://localhost:8080/api/v1/kpi-management/kpis" \
  -H "Authorization: Basic c3VwZXJ2aXNvcjpzdXBlcnZpc29yMTIz" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test KPI","category":"SALES","measurementType":"CURRENCY"}'
# Expected: 201

# Should fail (manager lacks CREATE_KPI)
curl -X POST "http://localhost:8080/api/v1/kpi-management/kpis" \
  -H "Authorization: Basic bWFuYWdlcjptYW5hZ2VyMTIz" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test KPI","category":"SALES","measurementType":"CURRENCY"}'
# Expected: 403
```

### Test Case 3: Assignment Permissions

```bash
# Should succeed (manager has ASSIGN_KPI)
curl -X POST "http://localhost:8080/api/v1/kpi-management/assignments" \
  -H "Authorization: Basic bWFuYWdlcjptYW5hZ2VyMTIz" \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"emp-001","kpiDefinitionId":"kpi-001"}'
# Expected: 201

# Should fail (employee lacks ASSIGN_KPI)
curl -X POST "http://localhost:8080/api/v1/kpi-management/assignments" \
  -H "Authorization: Basic ZW1wbG95ZWU6ZW1wbG95ZWUxMjM=" \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"emp-001","kpiDefinitionId":"kpi-001"}'
# Expected: 403
```

### Test Case 4: Approval Workflow Permissions

```bash
# Should succeed (hr has APPROVE_CHANGES)
curl -X GET "http://localhost:8080/api/v1/kpi-management/approval-workflows/pending" \
  -H "Authorization: Basic aHI6aHIxMjM="
# Expected: 200

# Should fail (employee lacks APPROVE_CHANGES)
curl -X GET "http://localhost:8080/api/v1/kpi-management/approval-workflows/pending" \
  -H "Authorization: Basic ZW1wbG95ZWU6ZW1wbG95ZWUxMjM="
# Expected: 403
```

### Test Case 5: Data Access (All Authenticated)

```bash
# Should succeed (any authenticated user)
curl -X GET "http://localhost:8080/api/v1/kpi-management/data/sales/emp-001?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Basic ZW1wbG95ZWU6ZW1wbG95ZWUxMjM="
# Expected: 200

# Should fail (no authentication)
curl -X GET "http://localhost:8080/api/v1/kpi-management/data/sales/emp-001?startDate=2025-01-01&endDate=2025-01-31"
# Expected: 401
```

## User Permissions Matrix

| User | Role | Authorities | Can Do |
|------|------|-------------|---------|
| **admin** | ADMIN | ROLE_ADMIN, VIEW_ALL, APPROVE_EMERGENCY | View all data, emergency approvals |
| **hr** | HR/APPROVER | ROLE_HR, ROLE_APPROVER, APPROVE_CHANGES, VIEW_ALL | Approve changes, view all data |
| **supervisor** | SUPERVISOR/MAKER | ROLE_SUPERVISOR, ROLE_MAKER, CREATE_KPI, MODIFY_KPI, ASSIGN_KPI | Create/modify KPIs, assign KPIs |
| **manager** | MANAGER | ROLE_MANAGER, VIEW_TEAM, ASSIGN_KPI | View team data, assign KPIs |
| **employee** | EMPLOYEE | ROLE_EMPLOYEE, VIEW_OWN | View own data only |

## Validation Script

Run the validation script to test all security rules:

```bash
.\validate-security.bat
```

This script tests various endpoints with different user roles and reports the HTTP status codes to verify proper access control.

## Security Best Practices Implemented

1. **Principle of Least Privilege**: Users only have minimum required permissions
2. **Role-Based Access Control**: Permissions assigned based on job roles
3. **HTTP Method-Specific Rules**: Different permissions for GET/POST/PUT/DELETE
4. **Path-Specific Security**: Granular control over different endpoint paths
5. **Authentication Required**: All endpoints require valid credentials
6. **Clear Permission Hierarchy**: Well-defined authority levels

## Troubleshooting

### Common Issues:

1. **403 Forbidden**: User lacks required authority
   - Solution: Use appropriate user role for the endpoint

2. **401 Unauthorized**: Invalid or missing credentials
   - Solution: Provide valid Basic Auth header

3. **404 Not Found**: Endpoint path mismatch
   - Solution: Verify endpoint URLs match controller mappings

4. **Security Config Not Applied**: Changes not taking effect
   - Solution: Restart application after security config changes