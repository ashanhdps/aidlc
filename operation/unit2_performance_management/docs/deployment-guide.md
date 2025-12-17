# Performance Management Service - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Performance Management Service to AWS using CloudFormation templates.

## Architecture Overview

The Performance Management Service is deployed using the following AWS services:

- **ECS Fargate**: Serverless container orchestration
- **DynamoDB**: NoSQL database for data persistence
- **Amazon MSK**: Managed Kafka for event streaming
- **ElastiCache Redis**: In-memory caching
- **Application Load Balancer**: Load balancing and SSL termination
- **CloudWatch**: Monitoring and logging
- **X-Ray**: Distributed tracing
- **Secrets Manager**: Secrets management
- **KMS**: Encryption key management

## Prerequisites

### Required Tools

1. **AWS CLI** (version 2.x or higher)
   ```bash
   aws --version
   ```

2. **AWS Account** with appropriate permissions
   - CloudFormation
   - EC2, VPC, ECS
   - DynamoDB, MSK, ElastiCache
   - IAM, KMS, Secrets Manager
   - CloudWatch, X-Ray

3. **AWS Credentials** configured
   ```bash
   aws configure
   ```

4. **Docker** (for building container images)
   ```bash
   docker --version
   ```

5. **Git** (for source control)
   ```bash
   git --version
   ```

### AWS Account Setup

1. **Enable Required Services** in your AWS region
   - Ensure MSK is available in your region
   - Verify ECS Fargate is supported

2. **Service Quotas** - Verify you have sufficient quotas for:
   - VPCs and subnets
   - NAT Gateways
   - Elastic IPs
   - ECS tasks
   - DynamoDB tables
   - MSK clusters

3. **IAM Permissions** - Ensure your IAM user/role has permissions to:
   - Create and manage CloudFormation stacks
   - Create and manage all required AWS resources
   - Pass IAM roles to services

## Deployment Steps

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd operation/unit2_performance_management
```

### Step 2: Configure Environment Parameters

Edit the parameter files in `config/` directory:

- `dev-parameters.json` - Development environment
- `staging-parameters.json` - Staging environment
- `prod-parameters.json` - Production environment

**Important Parameters to Update:**

```json
{
  "Parameters": {
    "Environment": "dev",
    "CertificateArn": "arn:aws:acm:REGION:ACCOUNT:certificate/ID",
    "TaskCPU": "1024",
    "TaskMemory": "2048",
    "DesiredCount": "2"
  }
}
```

### Step 3: Validate CloudFormation Templates

```bash
# Validate all templates
for template in templates/*.yaml; do
    echo "Validating $template..."
    aws cloudformation validate-template \
        --template-body file://$template \
        --region us-east-1
done
```

### Step 4: Deploy Infrastructure

#### Option A: Automated Deployment (Recommended)

```bash
# Deploy to dev environment
./scripts/deploy.sh dev

# Deploy to staging environment
./scripts/deploy.sh staging

# Deploy to production environment
./scripts/deploy.sh prod
```

#### Option B: Manual Deployment

Deploy stacks in the following order:

1. **Network Infrastructure**
   ```bash
   aws cloudformation create-stack \
       --stack-name dev-performance-mgmt-network \
       --template-body file://templates/network.yaml \
       --parameters file://config/dev-parameters.json \
       --capabilities CAPABILITY_NAMED_IAM \
       --region us-east-1
   ```

2. **DynamoDB Tables**
   ```bash
   aws cloudformation create-stack \
       --stack-name dev-performance-mgmt-dynamodb \
       --template-body file://templates/dynamodb.yaml \
       --parameters file://config/dev-parameters.json \
       --capabilities CAPABILITY_NAMED_IAM \
       --region us-east-1
   ```

3. **MSK Cluster**
   ```bash
   aws cloudformation create-stack \
       --stack-name dev-performance-mgmt-msk \
       --template-body file://templates/msk.yaml \
       --parameters file://config/dev-parameters.json \
       --capabilities CAPABILITY_NAMED_IAM \
       --region us-east-1
   ```

4. **ElastiCache Redis**
   ```bash
   aws cloudformation create-stack \
       --stack-name dev-performance-mgmt-elasticache \
       --template-body file://templates/elasticache.yaml \
       --parameters file://config/dev-parameters.json \
       --capabilities CAPABILITY_NAMED_IAM \
       --region us-east-1
   ```

5. **IAM Roles**
   ```bash
   aws cloudformation create-stack \
       --stack-name dev-performance-mgmt-iam \
       --template-body file://templates/iam.yaml \
       --parameters file://config/dev-parameters.json \
       --capabilities CAPABILITY_NAMED_IAM \
       --region us-east-1
   ```

6. **Application Load Balancer**
   ```bash
   aws cloudformation create-stack \
       --stack-name dev-performance-mgmt-alb \
       --template-body file://templates/alb.yaml \
       --parameters file://config/dev-parameters.json \
       --capabilities CAPABILITY_NAMED_IAM \
       --region us-east-1
   ```

7. **ECS Cluster**
   ```bash
   aws cloudformation create-stack \
       --stack-name dev-performance-mgmt-ecs-cluster \
       --template-body file://templates/ecs-cluster.yaml \
       --parameters file://config/dev-parameters.json \
       --capabilities CAPABILITY_NAMED_IAM \
       --region us-east-1
   ```

### Step 5: Build and Push Docker Image

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository \
       --repository-name dev-performance-management \
       --region us-east-1
   ```

2. **Build Docker Image**
   ```bash
   cd ../../construction/unit2_performance_management
   docker build -t performance-management:latest .
   ```

3. **Tag and Push Image**
   ```bash
   # Get ECR login
   aws ecr get-login-password --region us-east-1 | \
       docker login --username AWS --password-stdin \
       <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   # Tag image
   docker tag performance-management:latest \
       <account-id>.dkr.ecr.us-east-1.amazonaws.com/dev-performance-management:latest
   
   # Push image
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/dev-performance-management:latest
   ```

### Step 6: Deploy ECS Service

Create ECS task definition and service (templates to be created separately based on application requirements).

### Step 7: Verify Deployment

1. **Check Stack Status**
   ```bash
   aws cloudformation describe-stacks \
       --stack-name dev-performance-mgmt-network \
       --region us-east-1 \
       --query 'Stacks[0].StackStatus'
   ```

2. **Get ALB DNS Name**
   ```bash
   aws cloudformation describe-stacks \
       --stack-name dev-performance-mgmt-alb \
       --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNSName`].OutputValue' \
       --output text \
       --region us-east-1
   ```

3. **Test Health Endpoint**
   ```bash
   curl http://<alb-dns-name>/actuator/health
   ```

## Post-Deployment Configuration

### 1. Configure DNS

Point your domain to the ALB DNS name using a CNAME record:

```
api.yourdomain.com CNAME <alb-dns-name>
```

### 2. Configure SSL Certificate

If not done during deployment, request an ACM certificate:

```bash
aws acm request-certificate \
    --domain-name api.yourdomain.com \
    --validation-method DNS \
    --region us-east-1
```

### 3. Update Secrets

Store application secrets in Secrets Manager:

```bash
aws secretsmanager create-secret \
    --name dev/performance-mgmt/app-secrets \
    --secret-string '{"jwt-secret":"your-secret-here"}' \
    --region us-east-1
```

### 4. Configure Monitoring

1. Set up CloudWatch dashboards
2. Configure alarm notifications
3. Enable X-Ray tracing
4. Set up log insights queries

## Monitoring and Maintenance

### CloudWatch Dashboards

Access pre-configured dashboards:
- ECS Cluster Dashboard: `dev-PerformanceMgmt-ECS`
- Application Metrics: Custom metrics from application

### CloudWatch Alarms

Monitor the following alarms:
- DynamoDB throttling
- MSK CPU/Memory/Disk usage
- Redis CPU/Memory/Evictions
- ALB 5XX errors and response time
- ECS task health

### Logs

Access logs in CloudWatch Logs:
- ECS Task Logs: `/ecs/dev-performance-mgmt`
- VPC Flow Logs: `/aws/vpc/dev-performance-mgmt`
- MSK Logs: `/aws/msk/dev-performance-mgmt`
- ALB Access Logs: S3 bucket `dev-perf-mgmt-alb-logs-*`

## Troubleshooting

### Common Issues

1. **Stack Creation Fails**
   - Check CloudFormation events for error details
   - Verify IAM permissions
   - Check service quotas

2. **ECS Tasks Not Starting**
   - Check task execution role permissions
   - Verify ECR image exists and is accessible
   - Check CloudWatch logs for errors

3. **ALB Health Checks Failing**
   - Verify security group rules
   - Check application health endpoint
   - Review ECS task logs

4. **MSK Connection Issues**
   - Verify security group allows traffic on ports 9092, 9094
   - Check MSK cluster status
   - Verify bootstrap servers configuration

5. **DynamoDB Throttling**
   - Check read/write capacity
   - Review access patterns
   - Consider switching to on-demand mode

### Getting Help

1. Check CloudFormation stack events
2. Review CloudWatch logs
3. Check AWS Service Health Dashboard
4. Contact AWS Support if needed

## Rollback Procedures

### Rollback Stack Update

```bash
aws cloudformation cancel-update-stack \
    --stack-name dev-performance-mgmt-network \
    --region us-east-1
```

### Delete Stack

```bash
aws cloudformation delete-stack \
    --stack-name dev-performance-mgmt-network \
    --region us-east-1
```

**Note**: Delete stacks in reverse order of creation to avoid dependency issues.

## Cost Optimization

### Development Environment

- Use smaller instance types (t3.small, t3.micro)
- Reduce number of AZs to 2
- Use FARGATE_SPOT for non-critical workloads
- Set lower auto-scaling limits

### Production Environment

- Use reserved capacity for predictable workloads
- Enable DynamoDB auto-scaling
- Use Savings Plans for ECS Fargate
- Implement proper tagging for cost allocation

## Security Best Practices

1. **Enable Encryption**
   - All data at rest encrypted with KMS
   - All data in transit encrypted with TLS

2. **Network Security**
   - Private subnets for application tier
   - Security groups with least privilege
   - VPC endpoints for AWS services

3. **Access Control**
   - IAM roles with least privilege
   - Secrets stored in Secrets Manager
   - Regular credential rotation

4. **Monitoring**
   - Enable VPC Flow Logs
   - Enable CloudTrail
   - Configure GuardDuty
   - Set up Security Hub

## Disaster Recovery

### Backup Strategy

- DynamoDB: Point-in-time recovery enabled, daily backups
- MSK: Automatic snapshots
- Redis: Daily snapshots with 7-day retention

### Recovery Procedures

1. **Database Recovery**
   ```bash
   aws dynamodb restore-table-to-point-in-time \
       --source-table-name dev-ReviewCycles \
       --target-table-name dev-ReviewCycles-restored \
       --restore-date-time 2024-01-01T00:00:00Z
   ```

2. **Application Recovery**
   - Deploy to alternate region
   - Update DNS to point to new region
   - Restore data from backups

## Appendix

### A. Resource Naming Conventions

- Stack names: `{environment}-performance-mgmt-{component}`
- Resources: `{environment}-{service}-{resource-type}`
- Tags: Environment, Service, ManagedBy, CostCenter

### B. Port Reference

- Application: 8080
- Kafka: 9092 (plaintext), 9094 (TLS)
- Redis: 6379
- Zookeeper: 2181

### C. Useful Commands

```bash
# List all stacks
aws cloudformation list-stacks --region us-east-1

# Get stack outputs
aws cloudformation describe-stacks \
    --stack-name dev-performance-mgmt-network \
    --query 'Stacks[0].Outputs'

# Get ECS task logs
aws logs tail /ecs/dev-performance-mgmt --follow

# Describe ECS service
aws ecs describe-services \
    --cluster dev-performance-mgmt-cluster \
    --services dev-performance-mgmt-service
```

## Support

For issues or questions:
1. Check this documentation
2. Review CloudWatch logs and metrics
3. Consult AWS documentation
4. Contact DevOps team
5. Open AWS Support case if needed

---

**Document Version**: 1.0  
**Last Updated**: December 16, 2025  
**Maintained By**: DevOps Team
