# KPI Management Service - AWS Deployment

## Overview
This directory contains Infrastructure as Code (IaC) scripts for deploying the KPI Management Service to AWS with cost optimization for $2-3/month budget and 50-60 concurrent users.

## Architecture
- **Compute**: ECS Fargate (minimal resources)
- **Database**: RDS PostgreSQL (t3.micro)
- **Messaging**: SQS/SNS (cost-optimized alternative to Kafka)
- **Load Balancer**: Application Load Balancer
- **Monitoring**: CloudWatch (basic)

## Directory Structure
```
operation/unit1_kpi_management/
├── cloudformation/          # CloudFormation templates
├── docker/                  # Container configuration
├── config/                  # Application configuration
├── deploy/                  # Deployment scripts
├── database/               # Database migration scripts
└── docs/                   # Documentation
```

## Deployment Guide
See `docs/deployment-guide.md` for step-by-step instructions.

## Cost Optimization
- Single environment deployment
- Minimal resource allocation
- SQS/SNS instead of MSK
- t3.micro instances where possible
- Basic monitoring only