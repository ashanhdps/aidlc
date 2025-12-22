# Swagger UI Guide

## Overview
The KPI Management Service provides interactive API documentation through Swagger UI, making it easy to explore and test the APIs directly from your browser.

## Accessing Swagger UI

### URL
```
http://localhost:8080/api/v1/swagger-ui.html
```

### Alternative URLs
```
http://localhost:8080/api/v1/swagger-ui/index.html
http://localhost:8080/api/v1/api-docs (JSON format)
```

## Using Swagger UI

### 1. Authentication Setup

Since the API uses HTTP Basic Authentication, you need to authenticate before testing endpoints:

1. **Click the "Authorize" button** (lock icon) at the top right of the Swagger UI page
2. **Select "basicAuth"** from the available security schemes
3. **Enter credentials:**
   - Username: `admin`
   - Password: `admin123`
4. **Click "Authorize"**
5. **Click "Close"**

You're now authenticated and can test all endpoints.

### 2. Exploring API Groups

The Swagger UI organizes endpoints into logical groups:

#### 🏷️ **KPI Definitions**
- Create, read, update, delete KPI definitions
- Filter by category and active status
- Manage KPI metadata and configuration

#### 👥 **KPI Assignments** 
- Assign KPIs to employees
- Manage assignment lifecycle
- Bulk operations for multiple employees

#### ✅ **Approval Workflows**
- Maker-checker approval process
- Pending approvals for checkers
- Request history for makers

#### 📊 **KPI Data Integration**
- Third-party data retrieval
- Sales, productivity, quality metrics
- Marketing ROI and customer satisfaction

### 3. Testing Endpoints

#### Step-by-Step Process:

1. **Select an endpoint** by clicking on it
2. **Click "Try it out"** button
3. **Fill in required parameters:**
   - Path parameters (e.g., employee ID)
   - Query parameters (e.g., date ranges)
   - Request body (for POST/PUT requests)
4. **Click "Execute"**
5. **View the response:**
   - Response code
   - Response body
   - Response headers

#### Example: Testing "Get All KPIs"

1. Navigate to **KPI Definitions** section
2. Click on **GET /kpi-management/kpis**
3. Click **"Try it out"**
4. Optionally set query parameters:
   - `category`: Select from dropdown (SALES, PRODUCTIVITY, etc.)
   - `activeOnly`: true/false
5. Click **"Execute"**
6. View the response with demo KPI data

### 4. Request/Response Examples

Swagger UI automatically generates:
- **Request examples** in multiple formats (cURL, JavaScript, Python)
- **Response schemas** showing expected data structure
- **Model definitions** for complex objects

### 5. Model Schemas

Click on any model name (e.g., "KPIResponse", "CreateKPIRequest") to see:
- Field descriptions
- Data types
- Required vs optional fields
- Validation constraints

## Common Use Cases

### 1. Create a New KPI
```
POST /kpi-management/kpis
```
1. Authenticate as `supervisor:supervisor123`
2. Use the example request body
3. Modify fields as needed
4. Execute and verify 201 Created response

### 2. Assign KPI to Employee
```
POST /kpi-management/assignments
```
1. Authenticate as `manager:manager123`
2. Use existing KPI ID from previous step
3. Set employee ID and custom targets
4. Execute and verify assignment creation

### 3. Approve a Request
```
POST /kpi-management/approval-workflows/{workflowId}/approve
```
1. Authenticate as `hr:hr123`
2. First get pending approvals
3. Use workflow ID from pending list
4. Provide approval reason
5. Execute approval

### 4. Get Employee Data
```
GET /kpi-management/data/sales/{employeeId}
```
1. Authenticate with any valid user
2. Set employee ID (e.g., "emp-001")
3. Set date range parameters
4. Execute to see demo sales data

## Tips for Testing

### 1. Authentication
- Always authenticate before testing protected endpoints
- Use different user roles to test permission restrictions
- Re-authenticate if you get 401 errors

### 2. Data Dependencies
- Create KPIs before assigning them
- Use valid employee IDs in assignments
- Check existing data with GET requests first

### 3. Error Testing
- Try invalid IDs to see 404 responses
- Test with missing required fields for 400 responses
- Use wrong credentials to see 401 responses

### 4. Date Formats
- Use ISO date format: `YYYY-MM-DD`
- Ensure end date is after start date
- Use reasonable date ranges for testing

## Swagger Configuration

The Swagger UI is configured in `application.yml`:

```yaml
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    operationsSorter: method
```

## Production Considerations

### 1. Security
- In production, consider restricting Swagger UI access
- Use environment-specific configurations
- Implement proper API key management

### 2. Documentation
- Keep API descriptions up to date
- Add comprehensive examples
- Document error scenarios

### 3. Performance
- Consider disabling Swagger in production if not needed
- Use caching for API documentation
- Monitor API usage through Swagger UI

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Solution: Click "Authorize" and enter valid credentials

2. **404 Not Found**
   - Solution: Check the base URL and endpoint paths
   - Ensure application is running on correct port

3. **CORS Issues**
   - Solution: Access Swagger UI from the same domain as the API

4. **Slow Loading**
   - Solution: Check network connectivity and server performance

5. **Missing Endpoints**
   - Solution: Restart application and refresh browser