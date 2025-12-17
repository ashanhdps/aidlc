# Data Analytics Service - AWS Deployment

## Overview
This directory contains Infrastructure as Code (IaC) scripts and configuration files for deploying the Data Analytics Service to AWS using CloudFormation and ECS Fargate.

## Architecture
- **Region**: ap-southeast-1 (Singapore)
- **Environment**: Test environment
- **Container Platform**: AWS ECS Fargate
- **Database**: RDS PostgreSQL (minimal instance)
- **Caching**: ElastiCache Redis (minimal instance)
- **Load Balancer**: Application Load Balancer
- **Storage**: S3 for report files
- **Messaging**: SQS for async processing

## Directory Structure
```
operations/data_analytics/
├── README.md                           # This file
├── cloudformation/                     # CloudFormation templates
│   ├── 01-vpc-networking.yaml         # VPC, subnets, security groups
│   ├── 02-rds-postgresql.yaml         # RDS PostgreSQL database
│   ├── 03-elasticache-redis.yaml      # ElastiCache Redis cluster
│   ├── 04-s3-sqs.yaml                 # S3 bucket and SQS queues
│   ├── 05-ecs-cluster.yaml            # ECS Fargate cluster
│   ├── 06-application-load-balancer.yaml # ALB and target groups
│   ├── 07-ecs-service.yaml            # ECS service and task definition
│   ├── 08-iam-roles.yaml              # IAM roles and policies
│   └── 09-cloudwatch-monitoring.yaml  # CloudWatch logs and metrics
├── config/                            # Configuration files
│   ├── application-test.yml           # Test environment config
│   └── parameters-test.json           # CloudFormation parameters
├── docker/                            # Docker configuration
│   ├── Dockerfile                     # Production Dockerfile
│   └── docker-compose.yml             # Local development setup
├── scripts/                           # Deployment scripts
│   ├── deploy.sh                      # Master deployment script
│   ├── build-and-push.sh              # Container build and push
│   ├── database-setup.sql             # Database initialization
│   └── validate-infrastructure.sh     # Infrastructure validation
└── docs/                              # Documentation
    ├── deployment-guide.md            # Step-by-step deployment
    └── architecture-overview.md       # Architecture documentation
```

## Quick Start

### Prerequisites
- AWS CLI configured with appropriate permissions
- Docker installed for container builds
- AWS account with ECS, RDS, and ElastiCache permissions

### Deployment Steps
1. **Deploy Infrastructure**:
   ```bash
   cd operations/data_analytics
   ./scripts/deploy.sh
   ```

2. **Build and Deploy Application**:
   ```bash
   ./scripts/build-and-push.sh
   ```

3. **Validate Deployment**:
   ```bash
   ./scripts/validate-infrastructure.sh
   ```

## Resource Sizing (Minimal/Test Environment)
- **ECS Tasks**: 256 CPU, 512 MB memory
- **RDS**: db.t3.micro (1 vCPU, 1 GB RAM)
- **ElastiCache**: cache.t3.micro (1 vCPU, 0.5 GB RAM)
- **ALB**: Basic load balancer
- **Auto Scaling**: 1-2 tasks maximum

## Estimated Monthly Cost
- **ECS Fargate**: ~$15-30/month
- **RDS PostgreSQL**: ~$15-20/month
- **ElastiCache Redis**: ~$10-15/month
- **ALB**: ~$20-25/month
- **S3/SQS**: ~$1-5/month
- **Total**: ~$60-95/month

## Security
- VPC with private subnets for database and cache
- Security groups with minimal required access
- IAM roles with least privilege principles
- No public database access
- HTTPS termination at load balancer

## Monitoring
- CloudWatch logs for application logs
- CloudWatch metrics for performance monitoring
- Basic health checks and alarms
- Application Load Balancer health checks

## Support
For deployment issues or questions, refer to:
- `docs/deployment-guide.md` for detailed instructions
- `docs/architecture-overview.md` for architecture details
- CloudFormation stack events for troubleshooting