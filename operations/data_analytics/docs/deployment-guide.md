# Data Analytics Service - Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Data Analytics Service to AWS using CloudFormation and ECS Fargate.

## Prerequisites

### Required Tools
- **AWS CLI** (v2.0+) - configured with appropriate permissions
- **Docker** - for building container images
- **Git** - for source code management
- **curl** - for testing endpoints
- **jq** - for JSON processing (optional but recommended)

### AWS Permissions Required
Your AWS user/role needs the following permissions:
- CloudFormation: Full access
- ECS: Full access
- EC2: VPC, Security Groups, Load Balancer management
- RDS: Database instance management
- ElastiCache: Redis cluster management
- S3: Bucket management
- SQS: Queue management
- IAM: Role and policy management
- CloudWatch: Logs and metrics management
- ECR: Repository management

### AWS Account Requirements
- AWS Account with billing enabled
- Service limits sufficient for:
  - 1 VPC with 4 subnets
  - 1 RDS instance (db.t3.micro)
  - 1 ElastiCache node (cache.t3.micro)
  - 1 Application Load Balancer
  - 2 ECS Fargate tasks (256 CPU, 512 MB memory)

## Architecture Overview

The deployment creates the following AWS resources:

```
Internet Gateway
       │
   ┌───▼───┐
   │  ALB  │ (Public Subnets)
   └───┬───┘
       │
   ┌───▼───┐
   │  ECS  │ (Private Subnets)
   │ Tasks │
   └───┬───┘
       │
   ┌───▼───┐ ┌─────────┐ ┌─────┐
   │  RDS  │ │ Redis   │ │ S3  │
   │ (DB)  │ │ Cache   │ │     │
   └───────┘ └─────────┘ └─────┘
```

## Step-by-Step Deployment

### Step 1: Prepare the Environment

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Navigate to operations directory**:
   ```bash
   cd operations/data_analytics
   ```

3. **Verify AWS CLI configuration**:
   ```bash
   aws sts get-caller-identity
   aws configure get region
   ```

4. **Set environment variables** (optional):
   ```bash
   export AWS_REGION=ap-southeast-1
   export PROJECT_NAME=data-analytics
   export ENVIRONMENT=test
   ```

### Step 2: Review Configuration

1. **Review parameters file**:
   ```bash
   cat config/parameters-test.json
   ```

2. **Update parameters if needed**:
   - Database password (change from default)
   - S3 bucket name (must be globally unique)
   - Resource sizing (if different requirements)

3. **Validate CloudFormation templates**:
   ```bash
   # Validate all templates
   for template in cloudformation/*.yaml; do
     echo "Validating $template"
     aws cloudformation validate-template --template-body file://$template
   done
   ```

### Step 3: Deploy Infrastructure

1. **Run the deployment script**:
   ```bash
   ./scripts/deploy.sh
   ```

   This script will:
   - Validate all CloudFormation templates
   - Deploy stacks in the correct order
   - Wait for each stack to complete
   - Display deployment progress and results

2. **Monitor deployment progress**:
   - The script shows real-time progress
   - Check AWS CloudFormation console for detailed events
   - Deployment takes approximately 15-20 minutes

3. **Verify infrastructure deployment**:
   ```bash
   ./scripts/validate-infrastructure.sh
   ```

### Step 4: Build and Deploy Application

1. **Build the Spring Boot application**:
   ```bash
   cd ../../construction/data_analytics
   mvn clean package -DskipTests
   cd ../../operations/data_analytics
   ```

2. **Build and push Docker image**:
   ```bash
   ./scripts/build-and-push.sh
   ```

   This script will:
   - Build the Spring Boot JAR
   - Create Docker image
   - Push to ECR repository
   - Tag as latest

3. **Deploy ECS service**:
   ```bash
   aws cloudformation deploy \
     --template-file cloudformation/07-ecs-service.yaml \
     --stack-name data-analytics-test-07-ecs-service \
     --parameter-overrides file://config/parameters-test.json \
     --capabilities CAPABILITY_IAM \
     --region ap-southeast-1
   ```

### Step 5: Initialize Database

1. **Get database connection details**:
   ```bash
   DB_ENDPOINT=$(aws cloudformation describe-stacks \
     --stack-name data-analytics-test-02-rds-postgresql \
     --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
     --output text)
   
   echo "Database endpoint: $DB_ENDPOINT"
   ```

2. **Connect to database and run setup script**:
   ```bash
   # If you have psql installed locally
   psql -h $DB_ENDPOINT -U dbadmin -d dataanalytics -f scripts/database-setup.sql
   
   # Or use a bastion host/jump server if database is not publicly accessible
   ```

### Step 6: Validate Deployment

1. **Run comprehensive validation**:
   ```bash
   ./scripts/validate-infrastructure.sh
   ```

2. **Test application endpoints**:
   ```bash
   # Get ALB DNS name
   ALB_DNS=$(aws cloudformation describe-stacks \
     --stack-name data-analytics-test-06-application-load-balancer \
     --query 'Stacks[0].Outputs[?OutputKey==`ApplicationLoadBalancerDNS`].OutputValue' \
     --output text)
   
   # Test health endpoint
   curl http://$ALB_DNS/api/v1/data-analytics/actuator/health
   
   # Test API endpoints
   curl http://$ALB_DNS/api/v1/data-analytics/admin/users
   ```

3. **Check application logs**:
   ```bash
   # View recent logs
   aws logs tail /ecs/data-analytics-test --follow
   ```

## Post-Deployment Configuration

### 1. Application Configuration

Update environment-specific settings:

1. **Database connection** - Already configured via environment variables
2. **Redis connection** - Already configured via environment variables
3. **S3 bucket access** - Already configured via IAM roles
4. **SQS queues** - Already configured via environment variables

### 2. Security Configuration

1. **Change default passwords**:
   - Database password (update in CloudFormation parameters)
   - JWT secret (update in application configuration)

2. **Review security groups**:
   - Ensure minimal required access
   - Remove any unnecessary rules

3. **Enable additional security features**:
   - WAF for ALB (optional)
   - VPC Flow Logs (optional)
   - GuardDuty (optional)

### 3. Monitoring Setup

1. **CloudWatch Dashboards**:
   - Access the created dashboard in CloudWatch console
   - Customize metrics and widgets as needed

2. **Alerts and Notifications**:
   - Subscribe to SNS topic for alerts
   - Configure email/SMS notifications

3. **Log Analysis**:
   - Set up log insights queries
   - Create custom metrics from logs

## Troubleshooting

### Common Issues

1. **Stack deployment fails**:
   ```bash
   # Check stack events
   aws cloudformation describe-stack-events --stack-name <stack-name>
   
   # Check resource limits
   aws service-quotas list-service-quotas --service-code ec2
   ```

2. **ECS tasks fail to start**:
   ```bash
   # Check ECS service events
   aws ecs describe-services --cluster data-analytics-test-cluster --services data-analytics-test-service
   
   # Check task definition
   aws ecs describe-task-definition --task-definition data-analytics-test
   
   # Check CloudWatch logs
   aws logs tail /ecs/data-analytics-test --follow
   ```

3. **Application health checks fail**:
   ```bash
   # Check target group health
   aws elbv2 describe-target-health --target-group-arn <target-group-arn>
   
   # Check security group rules
   aws ec2 describe-security-groups --group-ids <security-group-id>
   ```

4. **Database connection issues**:
   ```bash
   # Test database connectivity
   nc -zv <db-endpoint> 5432
   
   # Check database logs
   aws rds describe-db-log-files --db-instance-identifier data-analytics-test-db
   ```

### Debugging Commands

```bash
# View all stacks
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# Get stack outputs
aws cloudformation describe-stacks --stack-name <stack-name> --query 'Stacks[0].Outputs'

# Check ECS cluster status
aws ecs describe-clusters --clusters data-analytics-test-cluster

# View application logs
aws logs tail /ecs/data-analytics-test --since 1h

# Check ALB access logs (if enabled)
aws s3 ls s3://<alb-logs-bucket>/
```

## Cleanup

To remove all resources:

1. **Delete ECS service stack**:
   ```bash
   aws cloudformation delete-stack --stack-name data-analytics-test-07-ecs-service
   ```

2. **Delete all infrastructure stacks** (in reverse order):
   ```bash
   ./scripts/cleanup.sh  # If available
   
   # Or manually delete stacks:
   aws cloudformation delete-stack --stack-name data-analytics-test-09-cloudwatch-monitoring
   aws cloudformation delete-stack --stack-name data-analytics-test-06-application-load-balancer
   aws cloudformation delete-stack --stack-name data-analytics-test-05-ecs-cluster
   aws cloudformation delete-stack --stack-name data-analytics-test-04-s3-sqs
   aws cloudformation delete-stack --stack-name data-analytics-test-03-elasticache-redis
   aws cloudformation delete-stack --stack-name data-analytics-test-02-rds-postgresql
   aws cloudformation delete-stack --stack-name data-analytics-test-08-iam-roles
   aws cloudformation delete-stack --stack-name data-analytics-test-01-vpc-networking
   ```

3. **Clean up ECR images**:
   ```bash
   aws ecr delete-repository --repository-name data-analytics-test --force
   ```

## Cost Optimization

### Estimated Monthly Costs (ap-southeast-1)
- **ECS Fargate**: ~$15-30 (1-2 tasks)
- **RDS PostgreSQL**: ~$15-20 (db.t3.micro)
- **ElastiCache Redis**: ~$10-15 (cache.t3.micro)
- **Application Load Balancer**: ~$20-25
- **Data Transfer**: ~$5-10
- **CloudWatch**: ~$5-10
- **Total**: ~$70-110/month

### Cost Reduction Tips
1. **Use Spot instances** for non-critical workloads
2. **Schedule resources** to run only during business hours
3. **Right-size instances** based on actual usage
4. **Enable S3 lifecycle policies** for old reports
5. **Use Reserved Instances** for predictable workloads

## Support and Maintenance

### Regular Maintenance Tasks
1. **Update container images** with security patches
2. **Monitor resource utilization** and adjust sizing
3. **Review CloudWatch logs** for errors and performance issues
4. **Update CloudFormation templates** for new features
5. **Backup database** regularly (automated with RDS)

### Monitoring Checklist
- [ ] Application health checks passing
- [ ] ECS tasks running and healthy
- [ ] Database connections within limits
- [ ] Redis cache hit ratio acceptable
- [ ] ALB response times under 500ms
- [ ] No critical CloudWatch alarms
- [ ] Log errors within acceptable thresholds

For additional support, refer to:
- AWS Documentation
- CloudFormation User Guide
- ECS Developer Guide
- Application logs and metrics