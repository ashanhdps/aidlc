# Postman Collection Guide

## Overview
This guide provides ready-to-use Postman requests for testing the KPI Management Service APIs.

## Setup Instructions

### 1. Import Environment Variables

Create a new Postman environment with these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:8080/api/v1` | Base API URL |
| `admin_auth` | `YWRtaW46YWRtaW4xMjM=` | Admin Basic Auth |
| `hr_auth` | `aHI6aHIxMjM=` | HR Basic Auth |
| `supervisor_auth` | `c3VwZXJ2aXNvcjpzdXBlcnZpc29yMTIz` | Supervisor Basic Auth |
| `manager_auth` | `bWFuYWdlcjptYW5hZ2VyMTIz` | Manager Basic Auth |
| `employee_auth` | `ZW1wbG95ZWU6ZW1wbG95ZWUxMjM=` | Employee Basic Auth |

### 2. Collection Structure

```
KPI Management API/
├── 01 - Health Check/
├── 02 - KPI Definitions/
│   ├── Create KPI
│   ├── Get All KPIs
│   ├── Get KPI by ID
│   ├── Update KPI
│   └── Delete KPI
├── 03 - KPI Assignments/
│   ├── Assign KPI
│   ├── Get Assignments
│   ├── Get Employee Assignments
│   ├── Update Assignment
│   └── Remove Assignment
├── 04 - Approval Workflows/
│   ├── Get Pending Approvals
│   ├── Get My Requests
│   ├── Approve Request
│   └── Reject Request
└── 05 - KPI Data/
    ├── Get Sales Data
    ├── Get Customer Satisfaction
    ├── Get Productivity Data
    ├── Get Marketing ROI
    └── Get Quality Data
```

## Request Examples

### 1. Health Check

**GET** `{{base_url}}/actuator/health`

**Headers:**
```
(No authentication required)
```

---

### 2. Create KPI Definition

**POST** `{{base_url}}/kpi-management/kpis`

**Headers:**
```
Authorization: Basic {{supervisor_auth}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Monthly Sales Revenue",
  "description": "Total sales revenue generated per month",
  "category": "SALES",
  "measurementType": "CURRENCY",
  "defaultTargetValue": 50000.00,
  "defaultTargetUnit": "USD",
  "defaultTargetComparisonType": "GREATER_THAN_OR_EQUAL",
  "defaultWeightPercentage": 25.0,
  "defaultWeightIsFlexible": true,
  "measurementFrequencyType": "MONTHLY",
  "measurementFrequencyValue": 1,
  "dataSource": "Salesforce API"
}
```

**Tests (JavaScript):**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has KPI ID", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.id).to.not.be.undefined;
    pm.environment.set("kpi_id", jsonData.id);
});
```

---

### 3. Get All KPIs

**GET** `{{base_url}}/kpi-management/kpis`

**Headers:**
```
Authorization: Basic {{admin_auth}}
```

**Query Parameters:**
```
category: SALES (optional)
activeOnly: true (optional)
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});
```

---

### 4. Assign KPI to Employee

**POST** `{{base_url}}/kpi-management/assignments`

**Headers:**
```
Authorization: Basic {{manager_auth}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "employeeId": "emp-001",
  "kpiDefinitionId": "{{kpi_id}}",
  "supervisorId": "sup-001",
  "customTargetValue": 55000.00,
  "customTargetUnit": "USD",
  "customTargetComparisonType": "GREATER_THAN_OR_EQUAL",
  "customWeightPercentage": 30.0,
  "effectiveDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

**Tests:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Assignment created", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.employeeId).to.eql("emp-001");
    pm.environment.set("assignment_id", jsonData.assignmentId);
});
```

---

### 5. Get Pending Approvals

**GET** `{{base_url}}/kpi-management/approval-workflows/pending`

**Headers:**
```
Authorization: Basic {{hr_auth}}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
    if (jsonData.length > 0) {
        pm.environment.set("workflow_id", jsonData[0].workflowId);
    }
});
```

---

### 6. Approve Request

**POST** `{{base_url}}/kpi-management/approval-workflows/{{workflow_id}}/approve`

**Headers:**
```
Authorization: Basic {{hr_auth}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "reason": "Approved - employee meets requirements for KPI assignment"
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Request approved", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("APPROVED");
});
```

---

### 7. Get Sales Data

**GET** `{{base_url}}/kpi-management/data/sales/emp-001`

**Headers:**
```
Authorization: Basic {{admin_auth}}
```

**Query Parameters:**
```
startDate: 2025-01-01
endDate: 2025-01-31
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Sales data returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.employeeId).to.eql("emp-001");
    pm.expect(jsonData.metrics).to.not.be.undefined;
});
```

## Pre-request Scripts

### Global Authentication Helper

Add this to your collection's Pre-request Script:

```javascript
// Helper function to set authentication based on user type
function setAuth(userType) {
    const authMap = {
        'admin': pm.environment.get('admin_auth'),
        'hr': pm.environment.get('hr_auth'),
        'supervisor': pm.environment.get('supervisor_auth'),
        'manager': pm.environment.get('manager_auth'),
        'employee': pm.environment.get('employee_auth')
    };
    
    if (authMap[userType]) {
        pm.request.headers.add({
            key: 'Authorization',
            value: 'Basic ' + authMap[userType]
        });
    }
}

// Usage: setAuth('admin');
```

### Dynamic Date Generation

```javascript
// Generate dates for testing
const today = new Date();
const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

pm.environment.set('start_date', startDate.toISOString().split('T')[0]);
pm.environment.set('end_date', endDate.toISOString().split('T')[0]);
```

## Test Scenarios

### 1. Complete KPI Lifecycle

Run requests in this order:
1. Health Check
2. Create KPI Definition (as supervisor)
3. Get All KPIs (verify creation)
4. Assign KPI (as manager)
5. Get Employee Assignments (verify assignment)
6. Get Sales Data (verify data integration)

### 2. Approval Workflow Testing

1. Create KPI that requires approval
2. Get Pending Approvals (as HR)
3. Approve Request (as HR)
4. Verify KPI is active

### 3. Permission Testing

Test the same endpoint with different user roles:
- Admin: Should have full access
- HR: Should access approval workflows
- Supervisor: Should create/modify KPIs
- Manager: Should assign KPIs
- Employee: Should only view own data

## Error Handling Tests

### Test Invalid Scenarios

1. **401 Unauthorized:**
   ```javascript
   pm.test("Unauthorized access blocked", function () {
       pm.response.to.have.status(401);
   });
   ```

2. **404 Not Found:**
   ```javascript
   pm.test("Invalid ID returns 404", function () {
       pm.response.to.have.status(404);
   });
   ```

3. **400 Bad Request:**
   ```javascript
   pm.test("Invalid data returns 400", function () {
       pm.response.to.have.status(400);
   });
   ```

## Collection Variables

Set these at the collection level:

```javascript
{
    "kpi_id": "",
    "assignment_id": "",
    "workflow_id": "",
    "employee_id": "emp-001",
    "start_date": "2025-01-01",
    "end_date": "2025-01-31"
}
```

## Running the Collection

### 1. Manual Testing
- Run requests individually
- Check responses and update environment variables
- Follow the logical flow of operations

### 2. Automated Testing
- Use Collection Runner for automated testing
- Set up data files for bulk testing
- Configure iterations for load testing

### 3. CI/CD Integration
- Export collection and environment
- Use Newman CLI for automated testing
- Integrate with build pipelines

## Tips

1. **Use environment variables** for dynamic values
2. **Set up proper test assertions** for each request
3. **Chain requests** using environment variables
4. **Test error scenarios** not just happy paths
5. **Document your test cases** in request descriptions