# DynamoDB Setup for Data Analytics Service

## Overview
The Data Analytics Service has been configured to use Amazon DynamoDB as its primary database for user management and other data storage needs. The service includes comprehensive security controls for user management operations.

## Security Configuration

### Role-Based Access Control
The service implements strict role-based access control:

- **ADMIN**: Full access to all user management operations
- **MANAGER**: Access to reports and performance data
- **ANALYST**: Access to analytics and reporting features
- **EMPLOYEE**: Basic access to personal data

### User Management Security
User management endpoints (`/admin/users/**`) are restricted to **ADMIN role only**:
- Create users: `POST /admin/users` - ADMIN only
- List users: `GET /admin/users` - ADMIN only  
- Update users: `PUT /admin/users/{id}` - ADMIN only
- Activate/Deactivate: `POST /admin/users/{id}/activate` - ADMIN only

### Authentication
The service uses HTTP Basic Authentication with the following demo credentials:
- **admin/admin123** (ADMIN role)
- **manager/manager123** (MANAGER role)
- **analyst/analyst123** (ANALYST role)
- **employee/employee123** (EMPLOYEE role)

**Note**: In production, replace with proper authentication system (JWT, OAuth2, etc.)

## Configuration

### Local Development with DynamoDB Local

1. **Install DynamoDB Local**
   ```bash
   # Download DynamoDB Local
   wget https://s3.us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.zip
   unzip dynamodb_local_latest.zip
   ```

2. **Start DynamoDB Local**
   ```bash
   java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
   ```

3. **Application Configuration**
   The application is configured to use local DynamoDB by default:
   ```yaml
   aws:
     region: us-east-1
     dynamodb:
       endpoint: http://localhost:8000
       table-prefix: data-analytics-
   
   app:
     demo:
       use-local-dynamodb: true
       initialize-data: true
   ```

### AWS DynamoDB (Production)

For production deployment, update the configuration:
```yaml
app:
  demo:
    use-local-dynamodb: false
```

And ensure proper AWS credentials are configured.

## Database Schema

### UserAccounts Table
- **Partition Key**: userId (String)
- **Attributes**:
  - email (String)
  - username (String)
  - roleName (String)
  - accountStatus (String)
  - createdDate (Instant)
  - lastModifiedDate (Instant)
  - createdBy (String)
  - lastModifiedBy (String)
  - lastLoginTime (Instant)

### Global Secondary Indexes
1. **email-index**: Partition key on email
2. **role-index**: Partition key on roleName

## Features Implemented

### UserController Endpoints
- `GET /admin/users` - List users with pagination and filtering
- `GET /admin/users/{userId}` - Get user by ID
- `GET /admin/users/by-email?email={email}` - Get user by email
- `POST /admin/users` - Create new user
- `PUT /admin/users/{userId}` - Update user
- `POST /admin/users/{userId}/activate` - Activate user
- `POST /admin/users/{userId}/deactivate` - Deactivate user
- `GET /admin/users/{userId}/permissions` - Check user permissions
- `GET /admin/users/{userId}/admin-access` - Check admin access

### Repository Implementation
- **DynamoDBUserAccountRepository**: Full DynamoDB implementation
- **InMemoryUserAccountRepository**: Fallback in-memory implementation
- The DynamoDB repository is marked as `@Primary` and will be used by default

### Data Seeding
The application automatically creates sample users on startup:
- admin@company.com (ADMIN role)
- analyst@company.com (ANALYST role)
- manager@company.com (MANAGER role)

## Running the Application

1. Start DynamoDB Local (port 8000)
2. Start the application:
   ```bash
   mvn spring-boot:run
   ```
3. The application will:
   - Create DynamoDB tables and indexes
   - Seed initial user data
   - Start on port 8080

## Troubleshooting

### HTTP Client Conflicts
If you encounter "Multiple HTTP implementations were found on the classpath" error:
- The application is configured to use UrlConnectionHttpClient explicitly
- Ensure no conflicting HTTP client dependencies are in the classpath

### DynamoDB Connection Issues
- Verify DynamoDB Local is running on port 8000
- Check the application logs for connection errors
- Ensure the endpoint configuration matches your DynamoDB Local setup

## API Testing

Test the UserController endpoints with proper authentication:

```bash
# Get all users (ADMIN only)
curl -u admin:admin123 http://localhost:8080/api/v1/data-analytics/admin/users

# Get user by email (ADMIN only)
curl -u admin:admin123 "http://localhost:8080/api/v1/data-analytics/admin/users/by-email?email=admin@company.com"

# Create new user (ADMIN only)
curl -u admin:admin123 -X POST http://localhost:8080/api/v1/data-analytics/admin/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@company.com","username":"testuser","role":"USER"}'

# Test access denied (non-admin user)
curl -u employee:employee123 http://localhost:8080/api/v1/data-analytics/admin/users
# Should return 403 Forbidden
```

## Security Testing

Verify role-based access control:

```bash
# Admin access - should work
curl -u admin:admin123 http://localhost:8080/api/v1/data-analytics/admin/users

# Manager access - should be denied (403)
curl -u manager:manager123 http://localhost:8080/api/v1/data-analytics/admin/users

# Employee access - should be denied (403)  
curl -u employee:employee123 http://localhost:8080/api/v1/data-analytics/admin/users
```

## Environment Variables

- `SPRING_PROFILES_ACTIVE`: Set to 'local' for development
- `USE_LOCAL_DYNAMODB`: true/false (default: true)
- `INITIALIZE_DEMO_DATA`: true/false (default: true)
- `AWS_REGION`: AWS region (default: us-east-1)