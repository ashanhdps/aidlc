#!/bin/bash

# Data Analytics Service - AWS Deployment Script
# This script deploys the complete infrastructure for the Data Analytics Service

set -e  # Exit on any error

# Configuration
PROJECT_NAME="data-analytics"
ENVIRONMENT="test"
REGION="ap-southeast-1"
STACK_PREFIX="${PROJECT_NAME}-${ENVIRONMENT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if AWS CLI is configured
check_aws_cli() {
    log_info "Checking AWS CLI configuration..."
    
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local current_region=$(aws configure get region)
    
    log_success "AWS CLI configured for account: $account_id in region: $current_region"
    
    if [ "$current_region" != "$REGION" ]; then
        log_warning "Current AWS region ($current_region) differs from target region ($REGION)"
        read -p "Continue with region $REGION? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Deployment cancelled"
            exit 1
        fi
    fi
}

# Function to validate CloudFormation template
validate_template() {
    local template_file=$1
    log_info "Validating template: $template_file"
    
    if aws cloudformation validate-template --template-body file://$template_file --region $REGION > /dev/null; then
        log_success "Template validation passed: $template_file"
    else
        log_error "Template validation failed: $template_file"
        exit 1
    fi
}

# Function to deploy CloudFormation stack
deploy_stack() {
    local stack_name=$1
    local template_file=$2
    local parameters_file=$3
    
    log_info "Deploying stack: $stack_name"
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name $stack_name --region $REGION &> /dev/null; then
        log_info "Stack exists, updating: $stack_name"
        local action="update-stack"
    else
        log_info "Stack does not exist, creating: $stack_name"
        local action="create-stack"
    fi
    
    # Prepare parameters
    local params_arg=""
    if [ -f "$parameters_file" ]; then
        params_arg="--parameters file://$parameters_file"
    fi
    
    # Deploy stack
    aws cloudformation $action \
        --stack-name $stack_name \
        --template-body file://$template_file \
        $params_arg \
        --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
        --region $REGION \
        --tags Key=Project,Value=$PROJECT_NAME Key=Environment,Value=$ENVIRONMENT
    
    # Wait for stack completion
    log_info "Waiting for stack operation to complete: $stack_name"
    
    if [ "$action" = "create-stack" ]; then
        aws cloudformation wait stack-create-complete --stack-name $stack_name --region $REGION
    else
        aws cloudformation wait stack-update-complete --stack-name $stack_name --region $REGION
    fi
    
    # Check stack status
    local stack_status=$(aws cloudformation describe-stacks --stack-name $stack_name --region $REGION --query 'Stacks[0].StackStatus' --output text)
    
    if [[ $stack_status == *"COMPLETE"* ]]; then
        log_success "Stack deployment completed: $stack_name ($stack_status)"
    else
        log_error "Stack deployment failed: $stack_name ($stack_status)"
        
        # Show stack events for debugging
        log_info "Recent stack events:"
        aws cloudformation describe-stack-events --stack-name $stack_name --region $REGION --max-items 10 --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED`].[Timestamp,ResourceType,LogicalResourceId,ResourceStatusReason]' --output table
        
        exit 1
    fi
}

# Function to get stack outputs
get_stack_output() {
    local stack_name=$1
    local output_key=$2
    
    aws cloudformation describe-stacks \
        --stack-name $stack_name \
        --region $REGION \
        --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
        --output text
}

# Main deployment function
main() {
    log_info "Starting Data Analytics Service deployment..."
    log_info "Project: $PROJECT_NAME"
    log_info "Environment: $ENVIRONMENT"
    log_info "Region: $REGION"
    echo
    
    # Check prerequisites
    check_aws_cli
    
    # Get script directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    CLOUDFORMATION_DIR="$PROJECT_ROOT/cloudformation"
    CONFIG_DIR="$PROJECT_ROOT/config"
    
    # Validate all templates first
    log_info "Validating all CloudFormation templates..."
    for template in "$CLOUDFORMATION_DIR"/*.yaml; do
        validate_template "$template"
    done
    log_success "All templates validated successfully"
    echo
    
    # Deploy stacks in order (respecting dependencies)
    local stacks=(
        "01-vpc-networking:$CLOUDFORMATION_DIR/01-vpc-networking.yaml"
        "08-iam-roles:$CLOUDFORMATION_DIR/08-iam-roles.yaml"
        "02-rds-postgresql:$CLOUDFORMATION_DIR/02-rds-postgresql.yaml"
        "03-elasticache-redis:$CLOUDFORMATION_DIR/03-elasticache-redis.yaml"
        "04-s3-sqs:$CLOUDFORMATION_DIR/04-s3-sqs.yaml"
        "05-ecs-cluster:$CLOUDFORMATION_DIR/05-ecs-cluster.yaml"
        "06-application-load-balancer:$CLOUDFORMATION_DIR/06-application-load-balancer.yaml"
        "09-cloudwatch-monitoring:$CLOUDFORMATION_DIR/09-cloudwatch-monitoring.yaml"
    )
    
    # Parameters file
    local parameters_file="$CONFIG_DIR/parameters-test.json"
    
    # Deploy each stack
    for stack_info in "${stacks[@]}"; do
        IFS=':' read -r stack_suffix template_file <<< "$stack_info"
        local stack_name="${STACK_PREFIX}-${stack_suffix}"
        
        deploy_stack "$stack_name" "$template_file" "$parameters_file"
        echo
    done
    
    # Display deployment summary
    log_success "=== DEPLOYMENT COMPLETED SUCCESSFULLY ==="
    echo
    log_info "Infrastructure Summary:"
    echo "  • VPC and Networking: ${STACK_PREFIX}-01-vpc-networking"
    echo "  • IAM Roles: ${STACK_PREFIX}-08-iam-roles"
    echo "  • RDS PostgreSQL: ${STACK_PREFIX}-02-rds-postgresql"
    echo "  • ElastiCache Redis: ${STACK_PREFIX}-03-elasticache-redis"
    echo "  • S3 and SQS: ${STACK_PREFIX}-04-s3-sqs"
    echo "  • ECS Cluster: ${STACK_PREFIX}-05-ecs-cluster"
    echo "  • Load Balancer: ${STACK_PREFIX}-06-application-load-balancer"
    echo "  • Monitoring: ${STACK_PREFIX}-09-cloudwatch-monitoring"
    echo
    
    # Get important outputs
    local alb_dns=$(get_stack_output "${STACK_PREFIX}-06-application-load-balancer" "ApplicationLoadBalancerDNS")
    local ecr_uri=$(get_stack_output "${STACK_PREFIX}-05-ecs-cluster" "ECRRepositoryUri")
    local db_endpoint=$(get_stack_output "${STACK_PREFIX}-02-rds-postgresql" "DatabaseEndpoint")
    
    log_info "Important Resources:"
    echo "  • Application URL: http://$alb_dns/api/v1/data-analytics/health"
    echo "  • ECR Repository: $ecr_uri"
    echo "  • Database Endpoint: $db_endpoint"
    echo
    
    log_info "Next Steps:"
    echo "  1. Build and push container image: ./scripts/build-and-push.sh"
    echo "  2. Deploy ECS service: aws cloudformation deploy --template-file cloudformation/07-ecs-service.yaml --stack-name ${STACK_PREFIX}-07-ecs-service --parameter-overrides file://config/parameters-test.json --capabilities CAPABILITY_IAM"
    echo "  3. Validate deployment: ./scripts/validate-infrastructure.sh"
    echo
    
    log_success "Infrastructure deployment completed successfully!"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"