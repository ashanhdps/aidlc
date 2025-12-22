# Approval Workflows API

## Overview
Manage approval workflows for the maker-checker process. Makers submit change requests that require approval from checkers.

## Base Path
```
/kpi-management/approval-workflows
```

## Endpoints

### 1. Get Pending Approvals (Checker)

**GET** `/kpi-management/approval-workflows/pending`

Retrieves pending approval requests for the current user (checker).

**Required Permissions:** `APPROVE_CHANGES`

#### Response (200 OK)
```json
[
  {
    "workflowId": "workflow-001",
    "requestType": "ASSIGNMENT_CREATE",
    "entityId": "assign-001",
    "originalData": null,
    "proposedData": "{\"employeeId\":\"emp-001\",\"kpiDefinitionId\":\"kpi-001\"}",
    "justification": "New employee onboarding - assigning sales KPIs",
    "makerId": "supervisor",
    "checkerId": "hr",
    "status": "PENDING",
    "priority": "MEDIUM",
    "decisionReason": null,
    "createdAt": "2025-12-17T08:30:00.000Z",
    "decidedAt": null,
    "dueDate": "2025-12-19T08:30:00.000Z"
  }
]
```

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/approval-workflows/pending" \
  -H "Authorization: Basic aHI6aHIxMjM="
```

---

### 2. Get My Requests (Maker)

**GET** `/kpi-management/approval-workflows/my-requests`

Retrieves approval requests submitted by the current user (maker).

**Required Permissions:** `ROLE_MAKER` or `ROLE_SUPERVISOR`

#### Response (200 OK)
Same structure as pending approvals response.

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/approval-workflows/my-requests" \
  -H "Authorization: Basic c3VwZXJ2aXNvcjpzdXBlcnZpc29yMTIz"
```

---

### 3. Get All Approval Workflows (Admin)

**GET** `/kpi-management/approval-workflows/all`

Retrieves all approval workflows (admin only).

**Required Permissions:** `VIEW_ALL`

#### Response (200 OK)
Array of approval workflow objects.

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/approval-workflows/all" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

---

### 4. Approve Request

**POST** `/kpi-management/approval-workflows/{workflowId}/approve`

Approves a change request.

**Required Permissions:** `APPROVE_CHANGES`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workflowId` | string | Yes | Workflow ID |

#### Request Body
```json
{
  "reason": "Approved - employee meets requirements for KPI assignment"
}
```

#### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | Yes | Approval reason/comments |

#### Response (200 OK)
```json
{
  "workflowId": "workflow-001",
  "requestType": "ASSIGNMENT_CREATE",
  "entityId": "assign-001",
  "originalData": null,
  "proposedData": "{\"employeeId\":\"emp-001\",\"kpiDefinitionId\":\"kpi-001\"}",
  "justification": "New employee onboarding - assigning sales KPIs",
  "makerId": "supervisor",
  "checkerId": "hr",
  "status": "APPROVED",
  "priority": "MEDIUM",
  "decisionReason": "Approved - employee meets requirements for KPI assignment",
  "createdAt": "2025-12-17T08:30:00.000Z",
  "decidedAt": "2025-12-17T09:15:00.000Z",
  "dueDate": "2025-12-19T08:30:00.000Z"
}
```

#### cURL Example
```bash
curl -X POST "http://localhost:8080/api/v1/kpi-management/approval-workflows/workflow-001/approve" \
  -H "Authorization: Basic aHI6aHIxMjM=" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Approved - employee meets requirements for KPI assignment"
  }'
```

---

### 5. Reject Request

**POST** `/kpi-management/approval-workflows/{workflowId}/reject`

Rejects a change request.

**Required Permissions:** `APPROVE_CHANGES`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workflowId` | string | Yes | Workflow ID |

#### Request Body
```json
{
  "reason": "Rejected - employee does not meet minimum experience requirements"
}
```

#### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | Yes | Rejection reason/comments |

#### Response (200 OK)
```json
{
  "workflowId": "workflow-001",
  "requestType": "ASSIGNMENT_CREATE",
  "entityId": "assign-001",
  "originalData": null,
  "proposedData": "{\"employeeId\":\"emp-001\",\"kpiDefinitionId\":\"kpi-001\"}",
  "justification": "New employee onboarding - assigning sales KPIs",
  "makerId": "supervisor",
  "checkerId": "hr",
  "status": "REJECTED",
  "priority": "MEDIUM",
  "decisionReason": "Rejected - employee does not meet minimum experience requirements",
  "createdAt": "2025-12-17T08:30:00.000Z",
  "decidedAt": "2025-12-17T09:15:00.000Z",
  "dueDate": "2025-12-19T08:30:00.000Z"
}
```

#### cURL Example
```bash
curl -X POST "http://localhost:8080/api/v1/kpi-management/approval-workflows/workflow-001/reject" \
  -H "Authorization: Basic aHI6aHIxMjM=" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Rejected - employee does not meet minimum experience requirements"
  }'
```

---

### 6. Get Workflow by ID

**GET** `/kpi-management/approval-workflows/{workflowId}`

Retrieves a specific approval workflow by ID.

**Required Permissions:** Varies based on user role and workflow ownership

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workflowId` | string | Yes | Workflow ID |

#### Response (200 OK)
Single approval workflow object.

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/approval-workflows/workflow-001" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

## Workflow Process

### 1. Maker Submits Request
When a maker (supervisor) creates/modifies KPIs or assignments, a workflow is automatically created if approval is required.

### 2. Checker Reviews
Checkers (HR/approvers) can view pending requests and make approval decisions.

### 3. Decision Processing
- **Approved**: The original change is applied to the system
- **Rejected**: The change is discarded and the maker is notified

### 4. Notifications
In a production system, notifications would be sent to relevant parties about workflow status changes.

## Enums

### ChangeRequestType
- `KPI_CREATE` - Create new KPI Definition
- `KPI_UPDATE` - Update existing KPI Definition  
- `KPI_DELETE` - Delete KPI Definition
- `ASSIGNMENT_CREATE` - Create new KPI Assignment
- `ASSIGNMENT_MODIFY` - Modify existing KPI Assignment
- `ASSIGNMENT_REMOVE` - Remove KPI Assignment
- `HIERARCHY_CHANGE` - Change KPI Hierarchy
- `BULK_ASSIGNMENT` - Bulk KPI Assignment changes

### ApprovalStatus
- `PENDING` - Awaiting approval decision
- `APPROVED` - Request approved
- `REJECTED` - Request rejected
- `EXPIRED` - Request expired (past due date)
- `CANCELLED` - Request cancelled by maker

### Priority
- `LOW` - Low priority request
- `MEDIUM` - Medium priority request
- `HIGH` - High priority request
- `URGENT` - Urgent request