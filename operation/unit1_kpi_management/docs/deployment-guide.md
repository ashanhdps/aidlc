# KPI Management Service - AWS Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the KPI Management Service to AWS using Infrastructure as Code (CloudFormation). The deployment is optimized for cost efficiency while maintaining production readiness.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Internet      │    │  Application     │    │  ECS Fargate    │
│   Gateway       │────│  Load Balancer   │────│  (1-3 tasks)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                       ┌──────────────────┐             │
                       │  RDS PostgreSQL  │─────────────┘
                       │  (t3.micro)      │
                       └──────────────────┘
                                │
                       ┌──────────────────┐
                       │  SQS/SNS         │
                       │  (Event Messaging)│
                       └──────────────────┘
```

## Prerequisites

### 1. AWS Account Setup
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- IAM user with CloudFormation, ECS, RDS, and related service permissions

### 2. Required Tools
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install jq for JSON processing
sudo apt-get install jq  # Ubuntu/Debian
brew install jq          # macOS

# Configure AWS credentials
aws configure
```

### 3. Container Image
- Build and push the Docker image to Amazon ECR
- Note the ECR image URI for deployment

## Cost Optimization Notice

⚠️ **Important**: The current architecture will cost approximately **$74-107/month**, which exceeds your $2-3/month budget. 

### Cost Reduction Options:
1. **Use AWS Lambda** instead of ECS Fargate (~$5-10/month)
2. **Aurora Serverless v2** instead of RDS (~$15-25/month)
3. **Single AZ deployment** (reduces costs by ~30%)
4. **Scheduled scaling** to turn off resources during off-hours

## Deployment Steps

### Step 1: Prepare Container Image

```bash
# Navigate to the application directory
cd construction/unit1_kpi_management

# Build the application
mvn clean package -DskipTests

# Build Docker image
docker build -f ../../operation/unit1_kpi_management/docker/Dockerfile -t kpi-management:latest .

# Create ECR repository
aws ecr create-repository --repository-name kpi-management --region us-east-1

# Get ECR login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag and push image
docker tag kpi-management:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/kpi-management:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/kpi-management:latest
```

### Step 2: Create S3 Bucket for CloudFormation Templates

```bash
# Create a unique bucket name
BUCKET_NAME="kpi-management-cf-templates-$(date +%s)"

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning --bucket $BUCKET_NAME --versioning-configuration Status=Enabled
```

### Step 3: Deploy Using Deployment Script

```bash
# Navigate to deployment directory
cd operation/unit1_kpi_management/deploy

# Make script executable (Linux/macOS)
chmod +x deploy.sh

# Deploy with required parameters
./deploy.sh \
  -b $BUCKET_NAME \
  -d "YourSecurePassword123!" \
  -i "123456789.dkr.ecr.us-east-1.amazonaws.com/kpi-management:latest" \
  -n "your-email@company.com"
```

### Step 4: Manual CloudFormation Deployment (Alternative)

If you prefer manual deployment:

```bash
# Upload templates to S3
aws s3 sync ../cloudformation/ s3://$BUCKET_NAME/cloudformation/

# Deploy master stack
aws cloudformation create-stack \
  --stack-name kpi-management-production-master \
  --template-url https://s3.amazonaws.com/$BUCKET_NAME/cloudformation/00-master-template.yaml \
  --parameters file://parameters-production.json \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --region us-east-1

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name kpi-management-production-master \
  --region us-east-1
```

## Post-Deployment Configuration

### 1. Database Setup

```bash
# Get database endpoint from stack outputs
DB_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name kpi-management-production-master \
  --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
  --output text)

# Connect to database and run schema creation
psql -h $DB_ENDPOINT -U kpi_admin -d kpi_management -f ../database/01-create-schema.sql
psql -h $DB_ENDPOINT -U kpi_admin -d kpi_management -f ../database/02-seed-data.sql
```

### 2. Application Testing

```bash
# Get application URL
APP_URL=$(aws cloudformation describe-stacks \
  --stack-name kpi-management-production-master \
  --query 'Stacks[0].Outputs[?OutputKey==`ApplicationUrl`].OutputValue' \
  --output text)

# Test health endpoint
curl $APP_URL/api/v1/actuator/health

# Test API endpoints
curl -X GET $APP_URL/api/v1/kpi-management/kpis \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

### 3. Monitoring Setup

```bash
# View CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/ecs/kpi-management"

# Create CloudWatch dashboard (optional)
aws cloudwatch put-dashboard \
  --dashboard-name "KPI-Management-Dashboard" \
  --dashboard-body file://monitoring/dashboard.json
```

## Environment Variables

The application uses the following environment variables in production:

```yaml
# Database Configuration
DATABASE_URL: "jdbc:postgresql://[RDS_ENDPOINT]:5432/kpi_management"
DATABASE_USERNAME: "kpi_admin"
DATABASE_PASSWORD: "[FROM_SECRETS_MANAGER]"

# AWS Configuration
AWS_REGION: "us-east-1"
SQS_QUEUE_URL: "[SQS_QUEUE_URL]"
SNS_TOPIC_ARN: "[SNS_TOPIC_ARN]"

# Application Configuration
SPRING_PROFILES_ACTIVE: "production"
SERVER_PORT: "8088"
APP_DATABASE_TYPE: "postgresql"
```

## Troubleshooting

### Common Issues

1. **Stack Creation Failed**
   ```bash
   # Check stack events
   aws cloudformation describe-stack-events --stack-name kpi-management-production-master
   
   # Check specific resource failures
   aws cloudformation describe-stack-resources --stack-name kpi-management-production-master
   ```

2. **Application Not Starting**
   ```bash
   # Check ECS service logs
   aws logs filter-log-events \
     --log-group-name "/aws/ecs/kpi-management-production" \
     --start-time $(date -d '1 hour ago' +%s)000
   ```

3. **Database Connection Issues**
   ```bash
   # Test database connectivity from ECS task
   aws ecs execute-command \
     --cluster kpi-management-production-cluster \
     --task [TASK_ARN] \
     --container kpi-management-app \
     --interactive \
     --command "/bin/bash"
   ```

### Health Checks

```bash
# Application health
curl $APP_URL/api/v1/actuator/health

# Database health
curl $APP_URL/api/v1/actuator/health/db

# Detailed health information
curl $APP_URL/api/v1/actuator/info
```

## Scaling Configuration

### Auto Scaling Settings
- **Minimum Capacity**: 1 task
- **Maximum Capacity**: 3 tasks
- **Target CPU Utilization**: 70%
- **Scale Out Cooldown**: 300 seconds
- **Scale In Cooldown**: 300 seconds

### Manual Scaling
```bash
# Scale service to 2 tasks
aws ecs update-service \
  --cluster kpi-management-production-cluster \
  --service kpi-management-production-service \
  --desired-count 2
```

## Security Considerations

### Network Security
- Application runs in private subnets
- Database accessible only from application security group
- ALB handles SSL termination (when certificates are configured)

### Data Security
- Database credentials stored in AWS Secrets Manager
- All data encrypted at rest and in transit
- IAM roles follow least privilege principle

### Access Control
- Application uses basic authentication (upgrade to OAuth2/JWT recommended)
- API endpoints protected by Spring Security
- Database access restricted to application user

## Monitoring and Alerting

### CloudWatch Metrics
- ECS service CPU and memory utilization
- RDS database performance metrics
- Application Load Balancer request metrics
- Custom application metrics

### Alarms
- High CPU utilization (>80%)
- High memory utilization (>80%)
- Database connection failures
- Application error rate (>5%)

## Backup and Recovery

### Database Backups
- Automated daily backups (7-day retention)
- Point-in-time recovery available
- Manual snapshots before major changes

### Application Recovery
- ECS service automatically replaces failed tasks
- Multi-AZ deployment for high availability
- Blue-green deployment capability

## Cost Monitoring

### Cost Breakdown
```bash
# Get cost and usage report
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

### Cost Optimization Recommendations
1. Use Spot instances for ECS Fargate (up to 70% savings)
2. Schedule scaling to reduce capacity during off-hours
3. Use Reserved Instances for RDS (up to 60% savings)
4. Monitor and optimize data transfer costs

## Cleanup

To remove all resources:

```bash
# Delete the master stack (this will delete all nested stacks)
./deploy.sh --cleanup -e production

# Or manually delete
aws cloudformation delete-stack --stack-name kpi-management-production-master

# Clean up S3 bucket
aws s3 rm s3://$BUCKET_NAME --recursive
aws s3 rb s3://$BUCKET_NAME
```

## Support and Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Review CloudWatch logs and metrics
2. **Monthly**: Update container images with security patches
3. **Quarterly**: Review and optimize costs
4. **Annually**: Review and update security configurations

### Getting Help
- Check CloudWatch logs for application errors
- Review CloudFormation stack events for infrastructure issues
- Use AWS Support for service-specific problems
- Refer to application logs for business logic issues

## Next Steps

After successful deployment:

1. **Configure Domain and SSL**: Set up Route 53 and ACM certificates
2. **Set up CI/CD**: Implement automated deployment pipeline
3. **Enhanced Monitoring**: Add custom metrics and dashboards
4. **Security Hardening**: Implement OAuth2/JWT authentication
5. **Performance Optimization**: Fine-tune database and application settings
6. **Disaster Recovery**: Set up cross-region backup and recovery procedures

---

**Note**: This deployment guide assumes a production environment. For development or testing, consider using smaller instance sizes and simplified configurations to reduce costs.