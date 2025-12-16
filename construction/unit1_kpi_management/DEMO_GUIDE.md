# KPI Management Service - Complete Demo Guide

## 🚀 Quick Start

### Automated Demo (Recommended)
```bash
# Linux/Mac
./run-demo.sh

# Windows
run-demo.bat
```

### Manual Demo
```bash
# 1. Set environment
export SPRING_PROFILES_ACTIVE=demo
export DATABASE_TYPE=dynamodb

# 2. Start DynamoDB Local
./src/demo/setup-local-dynamodb.sh

# 3. Start application
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

## 🔧 Prerequisites

- ✅ Java 17 or higher
- ✅ Maven 3.6 or higher  
- ✅ curl or wget (for downloads)
- ✅ Internet connection (first run only)

## 📊 Demo Features

### ✅ Implemented & Working
1. **KPI Definition Management**
   - Create, read, update, delete KPI definitions
   - Multiple categories: Sales, Customer Service, Productivity, Marketing, Quality
   - Various measurement types: Currency, Rating, Count, Percentage

2. **KPI Assignment System**
   - Assign KPIs to employees
   - Custom targets and weights
   - Bulk assignment operations
   - Employee portfolio management

3. **AI-Powered Suggestions**
   - Generate KPI suggestions by job title
   - Confidence scoring and rationale
   - Approval/rejection workflow
   - Historical tracking

4. **KPI Hierarchy Management**
   - Company → Department → Individual cascading
   - Parent-child relationships
   - Weight distribution

5. **Third-Party Data Integration**
   - Salesforce API simulation
   - Customer satisfaction data
   - Productivity metrics
   - Marketing ROI data
   - Quality management integration

6. **Approval Workflows**
   - Maker-Checker pattern
   - Role-based approvals
   - Audit trail

7. **Multi-Database Support**
   - SQLite (development)
   - H2 (testing)
   - DynamoDB (production/demo)

## 🌐 API Endpoints

### Base URL: `http://localhost:8088/api/v1`

### Authentication
- **Username**: `admin`
- **Password**: `admin123`
- **Method**: Basic Authentication

### Key Endpoints

#### KPI Definitions
- `GET /kpi-management/kpis` - List all KPIs
- `POST /kpi-management/kpis` - Create new KPI
- `GET /kpi-management/kpis/{id}` - Get KPI by ID
- `PUT /kpi-management/kpis/{id}` - Update KPI
- `DELETE /kpi-management/kpis/{id}` - Delete KPI

#### KPI Assignments
- `GET /kpi-management/assignments` - List assignments
- `POST /kpi-management/assignments` - Create assignment
- `GET /kpi-management/assignments/employee/{id}` - Employee assignments
- `GET /kpi-management/assignments/bulk?employee_ids=emp1,emp2` - Bulk assignments

#### AI Suggestions
- `GET /kpi-management/ai-suggestions` - List suggestions
- `POST /kpi-management/ai-suggestions/generate` - Generate suggestions
- `PUT /kpi-management/ai-suggestions/{id}/approve` - Approve/reject
- `GET /kpi-management/ai-suggestions/history/{user}` - User history

#### KPI Hierarchy
- `GET /kpi-management/hierarchy` - Get hierarchy
- `GET /kpi-management/hierarchy/cascade/{parent_id}` - Get children

#### Third-Party Data
- `GET /kpi-management/data/sales/{employee_id}` - Sales data
- `GET /kpi-management/data/customer-satisfaction/{employee_id}` - CSAT data
- `GET /kpi-management/data/productivity/{employee_id}` - Productivity data

#### Approval Workflows
- `GET /kpi-management/approval-workflows/pending` - Pending approvals
- `POST /kpi-management/approval-workflows/{id}/approve` - Approve
- `POST /kpi-management/approval-workflows/{id}/reject` - Reject

## 🧪 Testing the Demo

### Automated API Tests
```bash
# Linux/Mac
./test-demo-apis.sh

# Windows
test-demo-apis.bat
```

### Manual Testing via Swagger UI
1. Open: `http://localhost:8088/api/v1/swagger-ui.html`
2. Click "Authorize" button
3. Enter credentials: `admin` / `admin123`
4. Explore and test all endpoints

### Sample API Calls

#### Create a KPI Definition
```bash
curl -u admin:admin123 -X POST http://localhost:8088/api/v1/kpi-management/kpis \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Sales Target",
    "description": "Monthly sales revenue target",
    "category": "SALES",
    "measurementType": "CURRENCY",
    "defaultTargetValue": 50000,
    "defaultTargetUnit": "USD",
    "defaultTargetComparisonType": "GREATER_THAN_OR_EQUAL",
    "defaultWeightPercentage": 30.0,
    "defaultWeightIsFlexible": true,
    "measurementFrequencyType": "MONTHLY",
    "measurementFrequencyValue": 1,
    "dataSource": "salesforce-api"
  }'
```

#### Generate AI Suggestions
```bash
curl -u admin:admin123 -X POST http://localhost:8088/api/v1/kpi-management/ai-suggestions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "job_title": "Sales Manager",
    "department": "Sales",
    "context": "Focus on revenue growth and customer retention"
  }'
```

## 📈 Demo Data

### Pre-loaded KPI Definitions (5)
1. **Monthly Sales Revenue** (SALES, CURRENCY)
2. **Customer Satisfaction Score** (CUSTOMER_SERVICE, RATING)
3. **Employee Productivity** (PRODUCTIVITY, COUNT)
4. **Marketing ROI** (MARKETING, PERCENTAGE)
5. **Quality Score** (QUALITY, PERCENTAGE)

### Sample Employees (5)
- emp-001 through emp-005
- Each with 2-3 KPI assignments
- Various target values and weights

### AI Suggestions
- Job-title based templates
- Sales Manager, Marketing Manager examples
- Confidence scores 70-95%

### KPI Hierarchy
- Company level: Revenue
- Department level: Sales Revenue, Marketing ROI
- Individual level: Personal targets

## 🔍 Monitoring & Health

### Health Checks
- `GET /actuator/health` - Application health
- `GET /actuator/info` - Application info
- `GET /actuator/metrics` - Application metrics

### Database Verification
- SQLite: Check `kpi-management.db` file
- DynamoDB: Tables auto-created with `kpi-management-` prefix

## 🛠 Troubleshooting

### Common Issues

#### Port 8000 Already in Use
```bash
# Kill existing DynamoDB process
kill $(lsof -t -i:8000)
```

#### Application Won't Start
1. Check Java version: `java -version`
2. Check Maven: `mvn -version`
3. Verify DynamoDB Local is running: `curl http://localhost:8000`

#### API Returns 401 Unauthorized
- Verify credentials: `admin` / `admin123`
- Check Basic Auth header is included

#### No Demo Data
- Ensure `SPRING_PROFILES_ACTIVE=demo`
- Check `app.demo.initialize-data=true` in config

### Log Files
- Application logs: Console output
- DynamoDB logs: `dynamodb.log`

## 🎯 Demo Scenarios

### Scenario 1: KPI Management Workflow
1. View existing KPIs
2. Create new KPI definition
3. Assign KPI to employee
4. View employee's KPI portfolio

### Scenario 2: AI-Powered Suggestions
1. Generate suggestions for "Sales Manager"
2. Review suggestions with confidence scores
3. Approve/reject suggestions
4. View suggestion history

### Scenario 3: Hierarchy Management
1. View organizational KPI hierarchy
2. Explore parent-child relationships
3. Check cascade configurations

### Scenario 4: Data Integration
1. Fetch sales data for employee
2. Get customer satisfaction metrics
3. View productivity data
4. Check marketing ROI

## 🔄 Stopping the Demo

### Automated Scripts
- Scripts handle cleanup automatically on Ctrl+C

### Manual Cleanup
```bash
# Stop DynamoDB Local
kill $(cat dynamodb.pid)

# Stop Spring Boot application
Ctrl+C in terminal
```

## 📚 Next Steps

After exploring the demo:

1. **Review Architecture**: Check `logical_design.md` and `domain_model.md`
2. **Integration Contract**: See `INTEGRATION_CONTRACT_COMPLIANCE.md`
3. **Database Options**: Review `DATABASE_SETUP.md`
4. **Production Deployment**: Configure for AWS DynamoDB
5. **Unit 2 Development**: Performance Management Service
6. **Frontend Integration**: Unit 4 Frontend Application

## 🎉 Success Criteria

✅ **Demo is successful when:**
- Application starts without errors
- All API endpoints respond correctly
- Demo data is loaded
- Swagger UI is accessible
- Database tables are created
- API tests pass

The demo showcases a production-ready KPI Management Service with comprehensive features, proper architecture, and integration capabilities!