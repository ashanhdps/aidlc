# Performance Management Service - AWS Deployment

## Overview

This directory contains AWS CloudFormation templates and deployment scripts for the Performance Management Service (Unit 2). The service is deployed using a serverless, highly available architecture on AWS.

## Architecture

### Technology Stack

- **Compute**: AWS ECS Fargate (serverless containers)
- **Database**: Amazon DynamoDB (NoSQL)
- **Event Streaming**: Amazon MSK (Managed Kafka)
- **Caching**: Amazon ElastiCache (Redis)
- **Load Balancing**: Application Load Balancer
- **Monitoring**: CloudWatch + X-Ray
- **Security**: IAM, KMS, Secrets Manager

### Architecture Diagram

```
Internet
    |
    v
[Application Load Balancer]
    |
    v
[ECS Fargate Tasks] <---> [ElastiCache Redis]
    |                           |
    |---------------------------|
    |                           |
    v                           v
[DynamoDB Tables]         [Amazon MSK]
    |                           |
    v                           v
[Event Outbox]            [Kafka Topics]
```

## Directory Structure

```
operation/unit2_performance_management/
├── templates/              # CloudFormation templates
│   ├── network.yaml       # VPC, subnets, security groups
│   ├── dynamodb.yaml      # DynamoDB tables
│   ├── msk.yaml           # Amazon MSK cluster
│   ├── elasticache.yaml   # Redis cluster
│   ├── ecs-cluster.yaml   # ECS Fargate cluster
│   ├── iam.yaml           # IAM roles and policies
│   └── alb.yaml           # Application Load Balancer
├── config/                 # Environment configurations
│   ├── dev-parameters.json
│   ├── staging-parameters.json
│   └── prod-parameters.json
├── scripts/                # Deployment scripts
│   ├── deploy.sh          # Main deployment script
│   ├── rollback.sh        # Rollback script
│   └── validate.sh        # Template validation
├── docs/                   # Documentation
│   ├── deployment-guide.md
│   ├── architecture-diagram.md
│   ├── operations-runbook.md
│   └── troubleshooting.md
└── README.md              # This file
```

## Quick Start

### Prerequisites

1. AWS CLI v2.x or higher
2. AWS account with appropriate permissions
3. Docker (for building images)
4. Bash shell

### Deploy to Development

```bash
# 1. Configure AWS credentials
aws configure

# 2. Update parameters (optional)
vi config/dev-parameters.json

# 3. Deploy infrastructure
./scripts/deploy.sh dev

# 4. Build and push Docker image
# (See deployment guide for details)

# 5. Verify deployment
aws cloudformation describe-stacks \
    --stack-name dev-performance-mgmt-network \
    --query 'Stacks[0].StackStatus'
```

## CloudFormation Templates

### 1. Network Infrastructure (`network.yaml`)

Creates VPC, subnets, NAT gateways, security groups, and VPC endpoints.

**Resources Created:**
- VPC with public and private subnets across 2 AZs
- Internet Gateway and NAT Gateways
- Security groups for ALB, ECS, MSK, and Redis
- VPC endpoints for DynamoDB, S3, ECR, CloudWatch, Secrets Manager
- VPC Flow Logs

**Estimated Cost (dev):** ~$50-70/month

### 2. DynamoDB Tables (`dynamodb.yaml`)

Creates DynamoDB tables with encryption, backups, and monitoring.

**Resources Created:**
- ReviewCycles table with 3 GSIs
- FeedbackRecords table with 4 GSIs
- EventOutbox table with TTL and 1 GSI
- KMS keys for encryption
- CloudWatch alarms
- Backup vault and plan

**Estimated Cost (dev):** ~$10-20/month (on-demand)

### 3. MSK Cluster (`msk.yaml`)

Creates Amazon MSK cluster with encryption and monitoring.

**Resources Created:**
- MSK cluster with 3 brokers across AZs
- Kafka topics (domain-events, integration-events, dead-letter, audit)
- KMS key for encryption
- CloudWatch log group
- CloudWatch alarms
- Lambda function for topic creation

**Estimated Cost (dev):** ~$200-250/month (kafka.t3.small)

### 4. ElastiCache Redis (`elasticache.yaml`)

Creates Redis cluster with automatic failover.

**Resources Created:**
- Redis replication group with multi-AZ
- Subnet group and parameter group
- Auth token in Secrets Manager
- SNS topic for notifications
- CloudWatch alarms

**Estimated Cost (dev):** ~$30-40/month (cache.t3.small)

### 5. ECS Cluster (`ecs-cluster.yaml`)

Creates ECS Fargate cluster with Container Insights.

**Resources Created:**
- ECS cluster with Fargate capacity providers
- CloudWatch log group
- Service Discovery namespace
- CloudWatch dashboard

**Estimated Cost:** Included in ECS task costs

### 6. IAM Roles (`iam.yaml`)

Creates IAM roles for ECS tasks and CI/CD.

**Resources Created:**
- ECS task execution role
- ECS task role (with DynamoDB, MSK, Redis access)
- Auto-scaling role
- CodeBuild role
- CodePipeline role

**Estimated Cost:** Free

### 7. Application Load Balancer (`alb.yaml`)

Creates ALB with SSL termination and access logs.

**Resources Created:**
- Application Load Balancer
- Target group with health checks
- HTTP and HTTPS listeners
- S3 bucket for access logs
- CloudWatch alarms

**Estimated Cost (dev):** ~$20-25/month

## Total Estimated Costs

| Environment | Monthly Cost (USD) |
|-------------|-------------------|
| Development | $310 - $405       |
| Staging     | $600 - $800       |
| Production  | $1,200 - $1,800   |

*Costs vary based on usage, data transfer, and resource utilization*

## Configuration

### Environment Parameters

Each environment has its own parameter file in `config/`:

- **dev-parameters.json**: Minimal resources for development
- **staging-parameters.json**: Production-like for testing
- **prod-parameters.json**: Full production configuration

### Key Parameters

```json
{
  "Environment": "dev|staging|prod",
  "VpcCIDR": "10.0.0.0/16",
  "BrokerInstanceType": "kafka.t3.small|kafka.m5.large",
  "NodeType": "cache.t3.small|cache.r6g.large",
  "TaskCPU": "1024|2048",
  "TaskMemory": "2048|4096",
  "DesiredCount": "1|2|3",
  "CertificateArn": "arn:aws:acm:..."
}
```

## Deployment

### Automated Deployment

Use the provided deployment script:

```bash
./scripts/deploy.sh <environment>
```

The script will:
1. Validate templates
2. Deploy stacks in correct order
3. Wait for completion
4. Display outputs

### Manual Deployment

Deploy stacks individually:

```bash
aws cloudformation create-stack \
    --stack-name dev-performance-mgmt-network \
    --template-body file://templates/network.yaml \
    --parameters file://config/dev-parameters.json \
    --capabilities CAPABILITY_NAMED_IAM
```

### Deployment Order

1. Network Infrastructure
2. DynamoDB Tables
3. MSK Cluster
4. ElastiCache Redis
5. IAM Roles
6. Application Load Balancer
7. ECS Cluster

## Monitoring

### CloudWatch Dashboards

- **ECS Dashboard**: `{env}-PerformanceMgmt-ECS`
- Custom application metrics

### CloudWatch Alarms

- DynamoDB throttling
- MSK resource utilization
- Redis memory and evictions
- ALB errors and latency
- ECS task health

### Logs

- ECS Tasks: `/ecs/{env}-performance-mgmt`
- VPC Flow: `/aws/vpc/{env}-performance-mgmt`
- MSK: `/aws/msk/{env}-performance-mgmt`
- ALB Access: S3 bucket

## Security

### Encryption

- **At Rest**: All data encrypted with KMS
- **In Transit**: TLS 1.2+ for all connections

### Network Security

- Private subnets for application tier
- Security groups with least privilege
- VPC endpoints for AWS services
- VPC Flow Logs enabled

### Access Control

- IAM roles with least privilege
- Secrets in Secrets Manager
- No hardcoded credentials

## Backup and Recovery

### Automated Backups

- **DynamoDB**: Point-in-time recovery + daily backups (30-day retention)
- **MSK**: Automatic snapshots
- **Redis**: Daily snapshots (7-day retention)

### Recovery Procedures

See `docs/operations-runbook.md` for detailed recovery procedures.

## Troubleshooting

### Common Issues

1. **Stack creation fails**
   - Check CloudFormation events
   - Verify IAM permissions
   - Check service quotas

2. **ECS tasks not starting**
   - Check task execution role
   - Verify ECR image exists
   - Review CloudWatch logs

3. **Health checks failing**
   - Verify security groups
   - Check application endpoint
   - Review task logs

See `docs/troubleshooting.md` for detailed troubleshooting guide.

## Maintenance

### Updates

```bash
# Update stack
./scripts/deploy.sh <environment>

# Rollback if needed
./scripts/rollback.sh <environment>
```

### Scaling

Adjust parameters in config files:
- `DesiredCount`: Number of ECS tasks
- `MinCapacity` / `MaxCapacity`: Auto-scaling limits
- `TaskCPU` / `TaskMemory`: Task resources

## Documentation

- **[Deployment Guide](docs/deployment-guide.md)**: Comprehensive deployment instructions
- **[Architecture Diagram](docs/architecture-diagram.md)**: Detailed architecture documentation
- **[Operations Runbook](docs/operations-runbook.md)**: Day-to-day operations procedures
- **[Troubleshooting Guide](docs/troubleshooting.md)**: Common issues and solutions

## Support

For issues or questions:
1. Check documentation in `docs/`
2. Review CloudWatch logs and metrics
3. Contact DevOps team
4. Open AWS Support case

## Contributing

When making changes:
1. Update templates in `templates/`
2. Test in dev environment
3. Update documentation
4. Submit for review

## License

Internal use only - Company Confidential

---

**Version**: 1.0  
**Last Updated**: December 16, 2025  
**Maintained By**: DevOps Team
