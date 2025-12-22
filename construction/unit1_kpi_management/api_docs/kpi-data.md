# KPI Data Integration API

## Overview
Integrate with third-party systems to fetch KPI data for employees. This API provides endpoints to retrieve data from various external sources like Salesforce, survey systems, project management tools, and marketing analytics platforms.

## Base Path
```
/kpi-management/data
```

## Endpoints

### 1. Get Sales Data

**GET** `/kpi-management/data/sales/{employeeId}`

Retrieves sales data from Salesforce API for a specific employee.

**Required Permissions:** Authenticated user

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | Employee ID |

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | date | Yes | Start date (ISO format: YYYY-MM-DD) |
| `endDate` | date | Yes | End date (ISO format: YYYY-MM-DD) |

#### Response (200 OK)
```json
{
  "employeeId": "emp-001",
  "dataSource": "Salesforce API",
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "metrics": {
    "totalRevenue": 75000.00,
    "numberOfDeals": 15,
    "averageDealSize": 5000.00,
    "conversionRate": 0.25,
    "pipelineValue": 200000.00
  },
  "trends": {
    "revenueGrowth": 0.15,
    "dealVelocity": 12.5,
    "winRate": 0.30
  },
  "lastUpdated": "2025-12-17T08:30:00.000Z"
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/data/sales/emp-001?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

---

### 2. Get Customer Satisfaction Data

**GET** `/kpi-management/data/customer-satisfaction/{employeeId}`

Retrieves customer satisfaction data from survey API.

**Required Permissions:** Authenticated user

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | Employee ID |

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | date | Yes | Start date (ISO format: YYYY-MM-DD) |
| `endDate` | date | Yes | End date (ISO format: YYYY-MM-DD) |

#### Response (200 OK)
```json
{
  "employeeId": "emp-001",
  "dataSource": "Survey API",
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "metrics": {
    "averageRating": 4.2,
    "totalResponses": 45,
    "responseRate": 0.78,
    "npsScore": 35,
    "satisfactionScore": 85.5
  },
  "breakdown": {
    "excellent": 20,
    "good": 18,
    "average": 5,
    "poor": 2,
    "terrible": 0
  },
  "trends": {
    "ratingTrend": 0.05,
    "responseRateTrend": -0.02
  },
  "lastUpdated": "2025-12-17T08:30:00.000Z"
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/data/customer-satisfaction/emp-001?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

---

### 3. Get Productivity Data

**GET** `/kpi-management/data/productivity/{employeeId}`

Retrieves productivity data from project management API.

**Required Permissions:** Authenticated user

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | Employee ID |

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | date | Yes | Start date (ISO format: YYYY-MM-DD) |
| `endDate` | date | Yes | End date (ISO format: YYYY-MM-DD) |

#### Response (200 OK)
```json
{
  "employeeId": "emp-001",
  "dataSource": "Project Management API",
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "metrics": {
    "tasksCompleted": 28,
    "tasksAssigned": 32,
    "completionRate": 0.875,
    "averageTaskTime": 4.5,
    "onTimeDelivery": 0.92,
    "hoursLogged": 160
  },
  "projects": {
    "activeProjects": 3,
    "completedProjects": 1,
    "projectsOnTrack": 2,
    "projectsDelayed": 1
  },
  "trends": {
    "productivityTrend": 0.08,
    "efficiencyTrend": 0.12
  },
  "lastUpdated": "2025-12-17T08:30:00.000Z"
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/data/productivity/emp-001?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

---

### 4. Get Marketing ROI Data

**GET** `/kpi-management/data/marketing-roi/{employeeId}`

Retrieves marketing ROI data from marketing analytics API.

**Required Permissions:** Authenticated user

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | Employee ID |

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | date | Yes | Start date (ISO format: YYYY-MM-DD) |
| `endDate` | date | Yes | End date (ISO format: YYYY-MM-DD) |

#### Response (200 OK)
```json
{
  "employeeId": "emp-001",
  "dataSource": "Marketing Analytics API",
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "metrics": {
    "campaignROI": 3.2,
    "totalSpend": 15000.00,
    "totalRevenue": 48000.00,
    "costPerLead": 45.50,
    "conversionRate": 0.08,
    "leadsGenerated": 330
  },
  "channels": {
    "digitalAds": {
      "spend": 8000.00,
      "revenue": 28000.00,
      "roi": 3.5
    },
    "socialMedia": {
      "spend": 4000.00,
      "revenue": 12000.00,
      "roi": 3.0
    },
    "emailMarketing": {
      "spend": 3000.00,
      "revenue": 8000.00,
      "roi": 2.67
    }
  },
  "trends": {
    "roiTrend": 0.15,
    "costEfficiencyTrend": -0.05
  },
  "lastUpdated": "2025-12-17T08:30:00.000Z"
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/data/marketing-roi/emp-001?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

---

### 5. Get Quality Data

**GET** `/kpi-management/data/quality/{employeeId}`

Retrieves quality data from quality management system.

**Required Permissions:** Authenticated user

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employeeId` | string | Yes | Employee ID |

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | date | Yes | Start date (ISO format: YYYY-MM-DD) |
| `endDate` | date | Yes | End date (ISO format: YYYY-MM-DD) |

#### Response (200 OK)
```json
{
  "employeeId": "emp-001",
  "dataSource": "Quality Management System",
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "metrics": {
    "qualityScore": 92.5,
    "defectRate": 0.02,
    "reworkRate": 0.05,
    "firstPassYield": 0.95,
    "customerComplaints": 2,
    "auditScore": 88.0
  },
  "categories": {
    "processQuality": 94.0,
    "productQuality": 91.0,
    "serviceQuality": 93.0,
    "documentationQuality": 89.0
  },
  "improvements": {
    "qualityTrend": 0.03,
    "defectReduction": 0.15,
    "processImprovement": 0.08
  },
  "lastUpdated": "2025-12-17T08:30:00.000Z"
}
```

#### cURL Example
```bash
curl -X GET "http://localhost:8080/api/v1/kpi-management/data/quality/emp-001?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

## Data Integration Notes

### 1. Demo Mode
In the current implementation, all endpoints return simulated data for demonstration purposes. In a production environment, these would integrate with actual third-party APIs.

### 2. Authentication
Third-party API authentication is configured through application properties:
- Salesforce: `app.third-party.salesforce.token`
- Survey API: `app.third-party.survey.token`
- Project Management: `app.third-party.project-management.token`
- Marketing Analytics: `app.third-party.marketing-analytics.token`

### 3. Rate Limiting
Production implementations should include rate limiting and caching to avoid exceeding third-party API limits.

### 4. Error Handling
All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Invalid date range or parameters
- `404` - Employee not found
- `500` - Third-party API error or internal server error

### 5. Data Freshness
The `lastUpdated` field indicates when the data was last refreshed from the source system. Consider implementing caching strategies based on data update frequency requirements.