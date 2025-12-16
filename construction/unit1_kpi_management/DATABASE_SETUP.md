# Multi-Database Support Setup Guide

## Overview
The KPI Management Service supports multiple database backends:
- **SQLite** - Local development and small deployments
- **H2** - Testing and CI/CD pipelines  
- **DynamoDB** - Production AWS deployments

## Configuration

### 1. Local Development (SQLite)
```bash
# Set environment variables
export SPRING_PROFILES_ACTIVE=local
export DATABASE_TYPE=sqlite

# Or use application-local.yml (default)
java -jar kpi-management-service.jar
```

**Features:**
- File-based SQLite database (`kpi-management.db`)
- Demo data initialization
- Full SQL query support
- No external dependencies

### 2. Testing (H2)
```bash
# Set environment variables
export SPRING_PROFILES_ACTIVE=test
export DATABASE_TYPE=h2

# Or run tests
mvn test
```

**Features:**
- In-memory database (fast)
- Automatic cleanup after tests
- SQL compatibility
- Perfect for CI/CD

### 3. Production (DynamoDB)
```bash
# Set environment variables
export SPRING_PROFILES_ACTIVE=production
export DATABASE_TYPE=dynamodb
export AWS_REGION=us-east-1
export DYNAMODB_TABLE_PREFIX=kpi-management-prod-
export ADMIN_PASSWORD=secure-password

# Run application
java -jar kpi-management-service.jar
```

**Features:**
- Fully managed AWS service
- Auto-scaling
- High availability
- Global tables support

## Environment Variables

### Common Variables
- `SPRING_PROFILES_ACTIVE` - Profile to activate (local/test/production)
- `DATABASE_TYPE` - Database type (sqlite/h2/dynamodb)
- `INITIALIZE_DEMO_DATA` - Whether to create demo data (true/false)

### SQLite Specific
- No additional configuration needed
- Database file: `kpi-management.db` in working directory

### DynamoDB Specific
- `AWS_REGION` - AWS region (default: us-east-1)
- `DYNAMODB_ENDPOINT` - Custom endpoint for local DynamoDB
- `DYNAMODB_TABLE_PREFIX` - Table name prefix
- `AWS_ACCESS_KEY_ID` - AWS credentials (or use IAM roles)
- `AWS_SECRET_ACCESS_KEY` - AWS credentials (or use IAM roles)

### Security
- `ADMIN_USERNAME` - Admin username (default: admin)
- `ADMIN_PASSWORD` - Admin password (required in production)

## Database Schema

### SQLite/H2 Tables
```sql
CREATE TABLE kpi_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    measurement_type TEXT NOT NULL,
    default_target_value DECIMAL,
    default_target_unit TEXT,
    default_target_comparison_type TEXT,
    default_weight_percentage DECIMAL,
    default_weight_is_flexible BOOLEAN,
    measurement_frequency_type TEXT,
    measurement_frequency_value INTEGER,
    data_source TEXT,
    created_by TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Additional tables for assignments, hierarchy, etc.
```

### DynamoDB Tables
- `{prefix}kpi-definitions` - KPI definition data
- `{prefix}kpi-assignments` - Assignment relationships
- `{prefix}kpi-hierarchy` - Hierarchy relationships
- `{prefix}ai-suggestions` - AI suggestions
- `{prefix}approval-workflows` - Approval workflows

## Migration Between Databases

### SQLite to DynamoDB
```bash
# 1. Export data from SQLite
export SPRING_PROFILES_ACTIVE=local
java -jar kpi-management-service.jar --export-data=data.json

# 2. Import to DynamoDB
export SPRING_PROFILES_ACTIVE=production
java -jar kpi-management-service.jar --import-data=data.json
```

### Development Workflow
1. **Local Development**: Use SQLite profile
2. **Testing**: Use H2 profile for unit/integration tests
3. **Staging**: Use DynamoDB with staging tables
4. **Production**: Use DynamoDB with production tables

## Performance Considerations

### SQLite
- **Pros**: Simple, no setup, good for development
- **Cons**: Single writer, limited concurrency
- **Best for**: Development, small deployments

### H2
- **Pros**: Fast, in-memory, SQL compatible
- **Cons**: Data lost on restart
- **Best for**: Testing, CI/CD

### DynamoDB
- **Pros**: Scalable, managed, high availability
- **Cons**: NoSQL limitations, AWS dependency
- **Best for**: Production, high-scale deployments

## Troubleshooting

### SQLite Issues
```bash
# Check database file
ls -la kpi-management.db

# SQLite CLI access
sqlite3 kpi-management.db
.tables
.schema kpi_definitions
```

### DynamoDB Issues
```bash
# Check AWS credentials
aws sts get-caller-identity

# List DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Check table status
aws dynamodb describe-table --table-name kpi-management-prod-kpi-definitions
```

### Connection Issues
- Verify environment variables
- Check network connectivity
- Validate AWS credentials/permissions
- Review application logs

## Docker Support

### SQLite Container
```dockerfile
FROM openjdk:17-jre-slim
COPY kpi-management-service.jar app.jar
ENV SPRING_PROFILES_ACTIVE=local
ENV DATABASE_TYPE=sqlite
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

### DynamoDB Container
```dockerfile
FROM openjdk:17-jre-slim
COPY kpi-management-service.jar app.jar
ENV SPRING_PROFILES_ACTIVE=production
ENV DATABASE_TYPE=dynamodb
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

## Monitoring

### Database Health Checks
- SQLite: File existence and write permissions
- H2: Connection pool status
- DynamoDB: Table status and throttling metrics

### Metrics
- Connection pool utilization
- Query response times
- Error rates by database operation
- Table scan vs query ratios (DynamoDB)