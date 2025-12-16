#!/bin/bash

# KPI Management Service - AWS Deployment Script
# This script deploys the KPI Management Service to AWS using CloudFormation

set -e  # Exit on any error

# =====================================================
# Configuration
# =====================================================

# Default values
ENVIRONMENT="production"
PROJECT_NAME="kpi-management"
AWS_REGION="us-east-1"
STACK_PREFIX="${PROJECT_NAME}-${ENVIRONMENT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =====================================================
# Functions
# =====================================================

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

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy KPI Management Service to AWS

OPTIONS:
    -e, --environment    Environment name (default: production)
    -r, --region        AWS region (default: us-east-1)
    -p, --project       Project name (default: kpi-management)
    -b, --bucket        S3 bucket for CloudFormation templates
    -d, --db-password   Database password (required)
    -i, --image-uri     ECR image URI (required)
    -n, --notification  Notification email (optional)
    --dry-run          Validate templates without deploying
    --cleanup          Delete all stacks (use with caution)
    -h, --help         Show this help message

EXAMPLES:
    # Deploy with required parameters
    $0 -b my-cf-bucket -d MySecurePassword123 -i 123456789.dkr.ecr.us-east-1.amazonaws.com/kpi-management:latest

    # Deploy to staging environment
    $0 -e staging -b my-cf-bucket -d MySecurePassword123 -i 123456789.dkr.ecr.us-east-1.amazonaws.com/kpi-management:latest

    # Dry run to validate templates
    $0 --dry-run -b my-cf-bucket -d MySecurePassword123 -i 123456789.dkr.ecr.us-east-1.amazonaws.com/kpi-management:latest

    # Cleanup all resources
    $0 --cleanup -e production

EOF
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check jq for JSON processing
    if ! command -v jq &> /dev/null; then
        log_warning "jq is not installed. Some features may not work properly."
    fi
    
    log_success "Prerequisites check passed"
}

upload_templates() {
    local bucket=$1
    log_info "Uploading CloudFormation templates to S3 bucket: $bucket"
    
    # Create bucket if it doesn't exist
    if ! aws s3 ls "s3://$bucket" &> /dev/null; then
        log_info "Creating S3 bucket: $bucket"
        aws s3 mb "s3://$bucket" --region "$AWS_REGION"
        
        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket "$bucket" \
            --versioning-configuration Status=Enabled
    fi
    
    # Upload templates
    aws s3 sync ../cloudformation/ "s3://$bucket/cloudformation/" \
        --delete \
        --region "$AWS_REGION"
    
    # Store bucket name in Parameter Store for master template
    aws ssm put-parameter \
        --name "/kpi-management/deployment/s3-bucket" \
        --value "$bucket" \
        --type "String" \
        --overwrite \
        --region "$AWS_REGION" &> /dev/null || true
    
    log_success "Templates uploaded successfully"
}

validate_template() {
    local template_path=$1
    local template_name=$(basename "$template_path")
    
    log_info "Validating template: $template_name"
    
    if aws cloudformation validate-template \
        --template-body "file://$template_path" \
        --region "$AWS_REGION" &> /dev/null; then
        log_success "Template $template_name is valid"
        return 0
    else
        log_error "Template $template_name is invalid"
        return 1
    fi
}

validate_all_templates() {
    log_info "Validating all CloudFormation templates..."
    
    local templates_dir="../cloudformation"
    local valid=true
    
    for template in "$templates_dir"/*.yaml; do
        if [[ -f "$template" ]]; then
            if ! validate_template "$template"; then
                valid=false
            fi
        fi
    done
    
    if $valid; then
        log_success "All templates are valid"
        return 0
    else
        log_error "Some templates are invalid"
        return 1
    fi
}

deploy_stack() {
    local stack_name=$1
    local template_url=$2
    local parameters=$3
    
    log_info "Deploying stack: $stack_name"
    
    # Check if stack exists
    if aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" &> /dev/null; then
        
        log_info "Stack exists, updating..."
        local action="update-stack"
    else
        log_info "Stack doesn't exist, creating..."
        local action="create-stack"
    fi
    
    # Deploy stack
    local stack_id
    stack_id=$(aws cloudformation "$action" \
        --stack-name "$stack_name" \
        --template-url "$template_url" \
        --parameters "$parameters" \
        --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
        --region "$AWS_REGION" \
        --query 'StackId' \
        --output text)
    
    log_info "Stack operation initiated. Stack ID: $stack_id"
    
    # Wait for completion
    log_info "Waiting for stack operation to complete..."
    if aws cloudformation wait "stack-${action%-stack}-complete" \
        --stack-name "$stack_name" \
        --region "$AWS_REGION"; then
        log_success "Stack $stack_name deployed successfully"
        return 0
    else
        log_error "Stack $stack_name deployment failed"
        return 1
    fi
}

deploy_master_stack() {
    local bucket=$1
    local db_password=$2
    local image_uri=$3
    local notification_email=$4
    
    local stack_name="${STACK_PREFIX}-master"
    local template_url="https://s3.amazonaws.com/$bucket/cloudformation/00-master-template.yaml"
    
    # Build parameters
    local parameters="ParameterKey=Environment,ParameterValue=$ENVIRONMENT"
    parameters="$parameters ParameterKey=ProjectName,ParameterValue=$PROJECT_NAME"
    parameters="$parameters ParameterKey=DatabasePassword,ParameterValue=$db_password"
    parameters="$parameters ParameterKey=ImageUri,ParameterValue=$image_uri"
    
    if [[ -n "$notification_email" ]]; then
        parameters="$parameters ParameterKey=NotificationEmail,ParameterValue=$notification_email"
    fi
    
    deploy_stack "$stack_name" "$template_url" "$parameters"
}

get_stack_outputs() {
    local stack_name=$1
    
    log_info "Getting stack outputs for: $stack_name"
    
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs' \
        --output table
}

cleanup_stacks() {
    log_warning "This will delete ALL KPI Management Service stacks in environment: $ENVIRONMENT"
    read -p "Are you sure? (yes/no): " -r
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Cleanup cancelled"
        return 0
    fi
    
    local stack_name="${STACK_PREFIX}-master"
    
    log_info "Deleting master stack: $stack_name"
    
    if aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" &> /dev/null; then
        
        aws cloudformation delete-stack \
            --stack-name "$stack_name" \
            --region "$AWS_REGION"
        
        log_info "Waiting for stack deletion to complete..."
        aws cloudformation wait stack-delete-complete \
            --stack-name "$stack_name" \
            --region "$AWS_REGION"
        
        log_success "Stack deleted successfully"
    else
        log_warning "Stack $stack_name not found"
    fi
}

estimate_costs() {
    log_info "Estimated monthly costs for $ENVIRONMENT environment:"
    cat << EOF

Cost Breakdown (USD/month):
┌─────────────────────────────┬──────────────┐
│ Service                     │ Estimated    │
├─────────────────────────────┼──────────────┤
│ RDS PostgreSQL (t3.micro)   │ \$12-15      │
│ ECS Fargate (1 task)        │ \$8-12       │
│ Application Load Balancer   │ \$16-20      │
│ NAT Gateway                 │ \$32-45      │
│ CloudWatch Logs             │ \$2-5        │
│ SQS/SNS                     │ \$1-3        │
│ Secrets Manager             │ \$1-2        │
│ Data Transfer               │ \$2-5        │
├─────────────────────────────┼──────────────┤
│ TOTAL                       │ \$74-107     │
└─────────────────────────────┴──────────────┘

Note: This exceeds your \$2-3/month budget. Consider:
- Using Aurora Serverless v2 (\$0.50/ACU-hour, min 0.5 ACU)
- AWS Lambda instead of ECS Fargate
- Single AZ deployment
- Scheduled scaling to turn off resources when not needed

EOF
}

# =====================================================
# Main Script
# =====================================================

main() {
    local bucket=""
    local db_password=""
    local image_uri=""
    local notification_email=""
    local dry_run=false
    local cleanup=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                STACK_PREFIX="${PROJECT_NAME}-${ENVIRONMENT}"
                shift 2
                ;;
            -r|--region)
                AWS_REGION="$2"
                shift 2
                ;;
            -p|--project)
                PROJECT_NAME="$2"
                STACK_PREFIX="${PROJECT_NAME}-${ENVIRONMENT}"
                shift 2
                ;;
            -b|--bucket)
                bucket="$2"
                shift 2
                ;;
            -d|--db-password)
                db_password="$2"
                shift 2
                ;;
            -i|--image-uri)
                image_uri="$2"
                shift 2
                ;;
            -n|--notification)
                notification_email="$2"
                shift 2
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --cleanup)
                cleanup=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Handle cleanup
    if $cleanup; then
        cleanup_stacks
        exit 0
    fi
    
    # Validate required parameters
    if [[ -z "$bucket" ]] && [[ "$dry_run" == false ]]; then
        log_error "S3 bucket is required. Use -b or --bucket option."
        show_usage
        exit 1
    fi
    
    if [[ -z "$db_password" ]] && [[ "$dry_run" == false ]]; then
        log_error "Database password is required. Use -d or --db-password option."
        show_usage
        exit 1
    fi
    
    if [[ -z "$image_uri" ]] && [[ "$dry_run" == false ]]; then
        log_error "Container image URI is required. Use -i or --image-uri option."
        show_usage
        exit 1
    fi
    
    # Show configuration
    log_info "Deployment Configuration:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Project: $PROJECT_NAME"
    echo "  Region: $AWS_REGION"
    echo "  Stack Prefix: $STACK_PREFIX"
    if [[ -n "$bucket" ]]; then
        echo "  S3 Bucket: $bucket"
    fi
    if [[ -n "$notification_email" ]]; then
        echo "  Notification Email: $notification_email"
    fi
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Validate templates
    if ! validate_all_templates; then
        exit 1
    fi
    
    # Show cost estimate
    estimate_costs
    
    # Dry run mode
    if $dry_run; then
        log_success "Dry run completed successfully. Templates are valid."
        exit 0
    fi
    
    # Confirm deployment
    log_warning "This will deploy KPI Management Service to AWS."
    read -p "Continue? (yes/no): " -r
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
    
    # Upload templates
    upload_templates "$bucket"
    
    # Deploy master stack
    if deploy_master_stack "$bucket" "$db_password" "$image_uri" "$notification_email"; then
        log_success "Deployment completed successfully!"
        echo ""
        log_info "Stack outputs:"
        get_stack_outputs "${STACK_PREFIX}-master"
        echo ""
        log_info "Next steps:"
        echo "1. Test the application endpoints"
        echo "2. Configure monitoring and alerting"
        echo "3. Set up CI/CD pipeline"
        echo "4. Configure domain name and SSL certificate"
    else
        log_error "Deployment failed!"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"