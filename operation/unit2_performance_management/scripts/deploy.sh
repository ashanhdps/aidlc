#!/bin/bash

# Performance Management Service - Deployment Script
# This script deploys all CloudFormation stacks for the Performance Management Service

set -e

# Colors for output
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEMPLATES_DIR="$PROJECT_ROOT/templates"
CONFIG_DIR="$PROJECT_ROOT/config"

# Default values
ENVIRONMENT="${1:-dev}"
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-default}"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Must be dev, staging, or prod${NC}"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Performance Management Service Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Region: ${YELLOW}$AWS_REGION${NC}"
echo -e "Profile: ${YELLOW}$AWS_PROFILE${NC}"
echo ""

# Function to deploy a stack
deploy_stack() {
    local stack_name=$1
    local template_file=$2
    local parameters_file=$3
    local capabilities=$4
    
    echo -e "${YELLOW}Deploying stack: $stack_name${NC}"
    
    # Check if stack exists
    if aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        >/dev/null 2>&1; then
        
        echo "Stack exists. Updating..."
        aws cloudformation update-stack \
            --stack-name "$stack_name" \
            --template-body "file://$template_file" \
            --parameters "file://$parameters_file" \
            --capabilities $capabilities \
            --region "$AWS_REGION" \
            --profile "$AWS_PROFILE" \
            --tags "Key=Environment,Value=$ENVIRONMENT" "Key=Service,Value=performance-management" \
            || echo "No updates to be performed"
    else
        echo "Stack does not exist. Creating..."
        aws cloudformation create-stack \
            --stack-name "$stack_name" \
            --template-body "file://$template_file" \
            --parameters "file://$parameters_file" \
            --capabilities $capabilities \
            --region "$AWS_REGION" \
            --profile "$AWS_PROFILE" \
            --tags "Key=Environment,Value=$ENVIRONMENT" "Key=Service,Value=performance-management"
    fi
    
    echo "Waiting for stack operation to complete..."
    aws cloudformation wait stack-create-complete \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" 2>/dev/null || \
    aws cloudformation wait stack-update-complete \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" 2>/dev/null || true
    
    echo -e "${GREEN}✓ Stack $stack_name deployed successfully${NC}"
    echo ""
}

# Load parameters
PARAMS_FILE="$CONFIG_DIR/${ENVIRONMENT}-parameters.json"
if [[ ! -f "$PARAMS_FILE" ]]; then
    echo -e "${RED}Error: Parameters file not found: $PARAMS_FILE${NC}"
    exit 1
fi

# Deploy stacks in order
echo -e "${GREEN}Step 1: Deploying Network Infrastructure${NC}"
deploy_stack \
    "${ENVIRONMENT}-performance-mgmt-network" \
    "$TEMPLATES_DIR/network.yaml" \
    "$PARAMS_FILE" \
    "CAPABILITY_NAMED_IAM"

echo -e "${GREEN}Step 2: Deploying DynamoDB Tables${NC}"
deploy_stack \
    "${ENVIRONMENT}-performance-mgmt-dynamodb" \
    "$TEMPLATES_DIR/dynamodb.yaml" \
    "$PARAMS_FILE" \
    "CAPABILITY_NAMED_IAM"

echo -e "${GREEN}Step 3: Deploying MSK Cluster${NC}"
deploy_stack \
    "${ENVIRONMENT}-performance-mgmt-msk" \
    "$TEMPLATES_DIR/msk.yaml" \
    "$PARAMS_FILE" \
    "CAPABILITY_NAMED_IAM"

echo -e "${GREEN}Step 4: Deploying ElastiCache Redis${NC}"
deploy_stack \
    "${ENVIRONMENT}-performance-mgmt-elasticache" \
    "$TEMPLATES_DIR/elasticache.yaml" \
    "$PARAMS_FILE" \
    "CAPABILITY_NAMED_IAM"

echo -e "${GREEN}Step 5: Deploying IAM Roles${NC}"
deploy_stack \
    "${ENVIRONMENT}-performance-mgmt-iam" \
    "$TEMPLATES_DIR/iam.yaml" \
    "$PARAMS_FILE" \
    "CAPABILITY_NAMED_IAM"

echo -e "${GREEN}Step 6: Deploying Application Load Balancer${NC}"
deploy_stack \
    "${ENVIRONMENT}-performance-mgmt-alb" \
    "$TEMPLATES_DIR/alb.yaml" \
    "$PARAMS_FILE" \
    "CAPABILITY_NAMED_IAM"

echo -e "${GREEN}Step 7: Deploying ECS Cluster${NC}"
deploy_stack \
    "${ENVIRONMENT}-performance-mgmt-ecs-cluster" \
    "$TEMPLATES_DIR/ecs-cluster.yaml" \
    "$PARAMS_FILE" \
    "CAPABILITY_NAMED_IAM"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Build and push Docker image to ECR"
echo "2. Deploy ECS task definition and service"
echo "3. Run smoke tests"
echo ""
echo "To get the ALB DNS name:"
echo "aws cloudformation describe-stacks --stack-name ${ENVIRONMENT}-performance-mgmt-alb --query 'Stacks[0].Outputs[?OutputKey==\`LoadBalancerDNSName\`].OutputValue' --output text --region $AWS_REGION --profile $AWS_PROFILE"
