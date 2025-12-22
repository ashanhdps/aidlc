# KPI Assignments API

## Overview
Manage KPI assignments to employees, including creation, retrieval, updates, and removal.

## Base Path
```
/kpi-management/assignments
```

## Endpoints

### 1. Assign KPI to Employee

**POST** `/kpi-management/assignments`

Assigns a KPI to an employee.

**Required Permissions:** `ASSIGN_KPI`

#### Request Body
```json
{
  "employeeId": "emp-001",
  "kpiDefinitionId": "kpi-001",
  "supervisorId": "sup-001",
  "customTargetValue": 55000.00,
  "customTargetUnit": "USD",
  "customTargetComparisonType": "GREATER_THAN_OR_EQUAL",
  "customWeightPercentage": 30.0,
  "customWeightIsFlexible": false,
  "effectiveDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

#### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | string | Yes | Employee ID |
| `kpiDefinitionId` | string | Yes | KPI Definition ID |
| `supervisorId` | string | No | Supervisor ID |
| `customTargetValue` | number | No | Custom target value (overrides default) |
| `customTargetUnit` | string | No | Custom target unit |
| `customTargetComparisonType` | enum | No | Custom comparison type |
| `customWeightPercentage` | number | No | Custom weight percentage |
| `customWeightIsFlexible` | boolean | No | Whether custom weight is flexible |
| `effectiveDate` | date | No | Assignment effective date |
| `endDate` | date | No | Assignment end date |

#### Response (201 Created)
```json
{
  "employeeId": "emp-001",
  "kpiDefinitionId": "kpi-001",
  "assignmentId": "assign-001",
  "supervisorId": "sup-001",
  "customTargetValue": 55000.00,
  "customTargetUnit": "USD",
  "customTargetComparisonType": "GREATER_THAN_OR_EQUAL",
  "customWeightPercentage": 30.0,
  "customWeightIsFlexible": false,
  "effectiveDate": "2025-01-01",
  "endDate": "2025-12-31",
  "assignedBy": "manager",
  "status": "ACTIVE",
  "createdAt": "2025-12-17T08:30:00.000Z",
  "updatedAt": "2025-12-17T08:30:00.000Z"
}
```

#### cURL Example
```bash
curl -X POST "http://localhost:8080/api/v1/kpi-management/assignments" \
  -H "Authorization: Basic bWFuYWdlcjptYW5hZ2VyMTIz" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "emp-001",
    "kpiDefinitionId": "kpi-001",
    "supervisorId": "sup-001",
    "customTargetValue": 55000.00,
    "effectiveDate": "2025-01-01"
  }'
```

---

### 2. Get KPI Assignments with Filters

**GET** `/kpi-management/assignments`

Retrieves KPI assignments with optional filters.

**Required Permissions:** `VIEW_ALL` or `VIEW_TEAM`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employee_id` | string | No | Filter by employee ID |
| `supervisor_id` | string | No | Filter by supervisor ID |
| `kpi_id` | string | No | Filter by KPI ID |
| `effective_date` | date | No | Filter by effective date |

#### Response (200 OK)
```json
[
  {
    "employeeId": "emp-001",
    "kpiDefinitionId": "kpi-001",
    "assignmentId": "assign-001",
    "supervisorId": "sup-001",
    "customTargetValue": 55000.00,
    "customTargetUnit": "USD",
    "customTargetComparisonType": "GREATER_THAN_OR_EQUAL",
    "customWeightPercentage": 30.0,
    "customWeightIsFlexible": false,
    "effectiveDate": "2025-01-01",
    "endDate": "2025-12-31",
    "assignedBy": "manager",
    "status": "ACTIVE",
    "createdAt": "2025-12-17T08:30:00.000Z",
    "updatedAt": "2025-12-17T08:30:00.000Z"
  }
]
```

#### cURL Examples
```bash
# Get all assignments
curl -X GET "http://localhost:8080/api/v1/kpi-management/assignments" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="

# Get assignments for specific employee
curl -X GET "http://localhost:8080/api/v1/kpi-management/assignments?employee_id=emp-001" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="

# Get assignments by supervisor
curl -X GET "http://localhost:8080/api/v1/kpi-management/assignments?supervisor_id=sup-001" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

---

### 3. Get Employee KPI Assignments

**GET** `/kpi-management/assignments/employee/{employeeId}`

Retrieves all KPI assignments for a specific employee.

**Required Permissions:** `VIEW_ALL`, `VIEW_TEAM`, or `VIEW_OWN` (for own assignments)

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | Employee ID |

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `activeOnly` | boolean | No | Filter by active status (default: true) |

#### Response (200 OK)
Same as Get KPI Assignments response.

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/assignments/employee/emp-001" \
  -H "Authorization: Basic ZW1wbG95ZWU6ZW1wbG95ZWUxMjM="
```

---

### 4. Get KPI Assignments for Specific KPI

**GET** `/kpi-management/assignments/kpi/{kpiDefinitionId}`

Retrieves all assignments for a specific KPI definition.

**Required Permissions:** `VIEW_ALL` or `VIEW_TEAM`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `kpiDefinitionId` | string | Yes | KPI Definition ID |

#### Response (200 OK)
Same as Get KPI Assignments response.

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/assignments/kpi/kpi-001" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

---

### 5. Update KPI Assignment

**PUT** `/kpi-management/assignments/employee/{employeeId}/kpi/{kpiDefinitionId}`

Updates an existing KPI assignment.

**Required Permissions:** `ASSIGN_KPI`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | Employee ID |
| `kpiDefinitionId` | string | Yes | KPI Definition ID |

#### Request Body
Same as Assign KPI request body.

#### Response (200 OK)
Same as Assign KPI response.

#### cURL Example
```bash
curl -X PUT "http://localhost:8080/api/v1/kpi-management/assignments/employee/emp-001/kpi/kpi-001" \
  -H "Authorization: Basic bWFuYWdlcjptYW5hZ2VyMTIz" \
  -H "Content-Type: application/json" \
  -d '{
    "customTargetValue": 60000.00,
    "customWeightPercentage": 35.0
  }'
```

---

### 6. Get Bulk Employee Assignments

**GET** `/kpi-management/assignments/bulk`

Retrieves KPI assignments for multiple employees.

**Required Permissions:** `VIEW_ALL` or `VIEW_TEAM`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employee_ids` | string | Yes | Comma-separated employee IDs |

#### Response (200 OK)
```json
{
  "emp-001": [
    {
      "employeeId": "emp-001",
      "kpiDefinitionId": "kpi-001",
      "assignmentId": "assign-001",
      "status": "ACTIVE",
      "customTargetValue": 55000.00
    }
  ],
  "emp-002": [
    {
      "employeeId": "emp-002",
      "kpiDefinitionId": "kpi-002",
      "assignmentId": "assign-002",
      "status": "ACTIVE",
      "customTargetValue": 75.0
    }
  ]
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/assignments/bulk?employee_ids=emp-001,emp-002,emp-003" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

---

### 7. Remove KPI Assignment

**DELETE** `/kpi-management/assignments/employee/{employeeId}/kpi/{kpiDefinitionId}`

Removes (deactivates) a KPI assignment.

**Required Permissions:** `ASSIGN_KPI`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | Employee ID |
| `kpiDefinitionId` | string | Yes | KPI Definition ID |

#### Response (204 No Content)
No response body.

#### cURL Example
```bash
curl -X DELETE "http://localhost:8080/api/v1/kpi-management/assignments/employee/emp-001/kpi/kpi-001" \
  -H "Authorization: Basic bWFuYWdlcjptYW5hZ2VyMTIz"
```

## Enums

### AssignmentStatus
- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`
- `COMPLETED`