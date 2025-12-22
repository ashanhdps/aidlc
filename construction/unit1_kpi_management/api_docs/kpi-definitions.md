# KPI Definitions API

## Overview
Manage KPI definitions including creation, retrieval, updates, and deletion.

## Base Path
```
/kpi-management/kpis
```

## Endpoints

### 1. Create KPI Definition

**POST** `/kpi-management/kpis`

Creates a new KPI definition.

**Required Permissions:** `CREATE_KPI`

#### Request Body
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

#### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | KPI name (unique) |
| `description` | string | No | KPI description |
| `category` | enum | Yes | KPI category (SALES, PRODUCTIVITY, QUALITY, CUSTOMER_SATISFACTION, MARKETING) |
| `measurementType` | enum | Yes | Measurement type (CURRENCY, PERCENTAGE, COUNT, RATIO, TIME) |
| `defaultTargetValue` | number | No | Default target value |
| `defaultTargetUnit` | string | No | Unit of measurement |
| `defaultTargetComparisonType` | enum | No | Comparison type (GREATER_THAN, LESS_THAN, EQUAL, etc.) |
| `defaultWeightPercentage` | number | No | Default weight percentage |
| `defaultWeightIsFlexible` | boolean | No | Whether weight is flexible |
| `measurementFrequencyType` | string | No | Frequency type (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY) |
| `measurementFrequencyValue` | integer | No | Frequency value |
| `dataSource` | string | No | Data source description |

#### Response (201 Created)
```json
{
  "id": "kpi-001",
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
  "dataSource": "Salesforce API",
  "createdBy": "supervisor",
  "createdAt": "2025-12-17T08:30:00.000Z",
  "updatedAt": "2025-12-17T08:30:00.000Z",
  "active": true
}
```

#### cURL Example
```bash
curl -X POST "http://localhost:8080/api/v1/kpi-management/kpis" \
  -H "Authorization: Basic c3VwZXJ2aXNvcjpzdXBlcnZpc29yMTIz" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Sales Revenue",
    "description": "Total sales revenue generated per month",
    "category": "SALES",
    "measurementType": "CURRENCY",
    "defaultTargetValue": 50000.00,
    "defaultTargetUnit": "USD",
    "defaultTargetComparisonType": "GREATER_THAN_OR_EQUAL",
    "defaultWeightPercentage": 25.0
  }'
```

---

### 2. Get All KPI Definitions

**GET** `/kpi-management/kpis`

Retrieves all KPI definitions with optional filters.

**Required Permissions:** `VIEW_ALL`, `VIEW_TEAM`, or `VIEW_OWN`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | enum | No | Filter by category |
| `activeOnly` | boolean | No | Filter by active status (default: true) |

#### Response (200 OK)
```json
[
  {
    "id": "kpi-001",
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
    "dataSource": "Salesforce API",
    "createdBy": "supervisor",
    "createdAt": "2025-12-17T08:30:00.000Z",
    "updatedAt": "2025-12-17T08:30:00.000Z",
    "active": true
  }
]
```

#### cURL Examples
```bash
# Get all active KPIs
curl -X GET "http://localhost:8080/api/v1/kpi-management/kpis" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="

# Get KPIs by category
curl -X GET "http://localhost:8080/api/v1/kpi-management/kpis?category=SALES" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="

# Get all KPIs (including inactive)
curl -X GET "http://localhost:8080/api/v1/kpi-management/kpis?activeOnly=false" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

---

### 3. Get KPI Definition by ID

**GET** `/kpi-management/kpis/{id}`

Retrieves a specific KPI definition by ID.

**Required Permissions:** `VIEW_ALL`, `VIEW_TEAM`, or `VIEW_OWN`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | KPI Definition ID |

#### Response (200 OK)
```json
{
  "id": "kpi-001",
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
  "dataSource": "Salesforce API",
  "createdBy": "supervisor",
  "createdAt": "2025-12-17T08:30:00.000Z",
  "updatedAt": "2025-12-17T08:30:00.000Z",
  "active": true
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/kpis/kpi-001" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

---

### 4. Update KPI Definition

**PUT** `/kpi-management/kpis/{id}`

Updates an existing KPI definition.

**Required Permissions:** `MODIFY_KPI`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | KPI Definition ID |

#### Request Body
Same as Create KPI Definition request body.

#### Response (200 OK)
Same as Create KPI Definition response.

#### cURL Example
```bash
curl -X PUT "http://localhost:8080/api/v1/kpi-management/kpis/kpi-001" \
  -H "Authorization: Basic c3VwZXJ2aXNvcjpzdXBlcnZpc29yMTIz" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Sales Revenue - Updated",
    "description": "Updated description",
    "category": "SALES",
    "measurementType": "CURRENCY",
    "defaultTargetValue": 60000.00
  }'
```

---

### 5. Delete KPI Definition

**DELETE** `/kpi-management/kpis/{id}`

Soft deletes a KPI definition (marks as inactive).

**Required Permissions:** `MODIFY_KPI`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | KPI Definition ID |

#### Response (204 No Content)
No response body.

#### cURL Example
```bash
curl -X DELETE "http://localhost:8080/api/v1/kpi-management/kpis/kpi-001" \
  -H "Authorization: Basic c3VwZXJ2aXNvcjpzdXBlcnZpc29yMTIz"
```

## Enums

### KPICategory
- `SALES`
- `PRODUCTIVITY` 
- `QUALITY`
- `CUSTOMER_SATISFACTION`
- `MARKETING`

### MeasurementType
- `CURRENCY`
- `PERCENTAGE`
- `COUNT`
- `RATIO`
- `TIME`

### ComparisonType
- `GREATER_THAN`
- `GREATER_THAN_OR_EQUAL`
- `LESS_THAN`
- `LESS_THAN_OR_EQUAL`
- `EQUAL`
- `NOT_EQUAL`