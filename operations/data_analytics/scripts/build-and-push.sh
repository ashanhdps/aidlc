#!/bin/bash

# Data Analytics Service - Container Build and Push Script
# This script builds the Docker image and pushes it to ECR

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

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    log_success "All prerequisites met"
}

# Function to get ECR repository URI
get_ecr_uri() {
    local stack_name="${STACK_PREFIX}-05-ecs-cluster"
    
    log_info "Getting ECR repository URI from CloudFormation stack: $stack_name"
    
    local ecr_uri=$(aws cloudformation describe-stacks \
        --stack-name $stack_name \
        --region $REGION \
        --query "Stacks[0].Outputs[?OutputKey=='ECRRepositoryUri'].OutputValue" \
        --output text 2>/dev/null)
    
    if [ -z "$ecr_uri" ]; then
        log_error "Could not get ECR repository URI. Make sure the ECS cluster stack is deployed."
        exit 1
    fi
    
    echo $ecr_uri
}

# Function to authenticate with ECR
ecr_login() {
    log_info "Authenticating with ECR..."
    
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local ecr_endpoint="${account_id}.dkr.ecr.${REGION}.amazonaws.com"
    
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ecr_endpoint
    
    if [ $? -eq 0 ]; then
        log_success "ECR authentication successful"
    else
        log_error "ECR authentication failed"
        exit 1
    fi
}

# Function to build Docker image
build_image() {
    local image_tag=$1
    local dockerfile_path=$2
    local build_context=$3
    
    log_info "Building Docker image: $image_tag"
    log_info "Dockerfile: $dockerfile_path"
    log_info "Build context: $build_context"
    
    # Build the image
    docker build \
        -f "$dockerfile_path" \
        -t "$image_tag" \
        "$build_context"
    
    if [ $? -eq 0 ]; then
        log_success "Docker image built successfully: $image_tag"
    else
        log_error "Docker image build failed"
        exit 1
    fi
}

# Function to push image to ECR
push_image() {
    local local_tag=$1
    local remote_tag=$2
    
    log_info "Tagging image for ECR: $remote_tag"
    docker tag "$local_tag" "$remote_tag"
    
    log_info "Pushing image to ECR: $remote_tag"
    docker push "$remote_tag"
    
    if [ $? -eq 0 ]; then
        log_success "Image pushed successfully: $remote_tag"
    else
        log_error "Image push failed"
        exit 1
    fi
}

# Function to build application JAR
build_application() {
    local app_dir=$1
    
    log_info "Building Spring Boot application..."
    
    cd "$app_dir"
    
    # Check if Maven wrapper exists
    if [ -f "./mvnw" ]; then
        local mvn_cmd="./mvnw"
    elif command -v mvn &> /dev/null; then
        local mvn_cmd="mvn"
    else
        log_error "Maven not found. Please install Maven or use Maven wrapper."
        exit 1
    fi
    
    # Clean and build
    $mvn_cmd clean package -DskipTests -B
    
    if [ $? -eq 0 ]; then
        log_success "Application built successfully"
    else
        log_error "Application build failed"
        exit 1
    fi
    
    cd - > /dev/null
}

# Function to run security scan (optional)
security_scan() {
    local image_tag=$1
    
    log_info "Running security scan on image: $image_tag"
    
    # Use Docker Scout if available (optional)
    if command -v docker &> /dev/null && docker scout version &> /dev/null; then
        log_info "Running Docker Scout security scan..."
        docker scout cves "$image_tag" || log_warning "Security scan completed with warnings"
    else
        log_warning "Docker Scout not available, skipping security scan"
    fi
}

# Main function
main() {
    local image_version=${1:-latest}
    
    log_info "Starting container build and push process..."
    log_info "Project: $PROJECT_NAME"
    log_info "Environment: $ENVIRONMENT"
    log_info "Region: $REGION"
    log_info "Image version: $image_version"
    echo
    
    # Check prerequisites
    check_prerequisites
    
    # Get script directory and project paths
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
    OPERATIONS_DIR="$(dirname "$SCRIPT_DIR")"
    PROJECT_ROOT="$(dirname "$(dirname "$OPERATIONS_DIR")")"
    APP_DIR="$PROJECT_ROOT/construction/data_analytics"
    DOCKERFILE_PATH="$OPERATIONS_DIR/docker/Dockerfile"
    
    log_info "Project paths:"
    echo "  • Operations directory: $OPERATIONS_DIR"
    echo "  • Application directory: $APP_DIR"
    echo "  • Dockerfile: $DOCKERFILE_PATH"
    echo
    
    # Verify paths exist
    if [ ! -d "$APP_DIR" ]; then
        log_error "Application directory not found: $APP_DIR"
        exit 1
    fi
    
    if [ ! -f "$DOCKERFILE_PATH" ]; then
        log_error "Dockerfile not found: $DOCKERFILE_PATH"
        exit 1
    fi
    
    # Build Spring Boot application
    build_application "$APP_DIR"
    
    # Get ECR repository URI
    ECR_URI=$(get_ecr_uri)
    log_info "ECR Repository: $ECR_URI"
    
    # Authenticate with ECR
    ecr_login
    
    # Build Docker image
    local local_image_tag="${PROJECT_NAME}-${ENVIRONMENT}:${image_version}"
    local remote_image_tag="${ECR_URI}:${image_version}"
    
    build_image "$local_image_tag" "$DOCKERFILE_PATH" "$PROJECT_ROOT"
    
    # Optional security scan
    security_scan "$local_image_tag"
    
    # Push to ECR
    push_image "$local_image_tag" "$remote_image_tag"
    
    # Tag as latest if this is a specific version
    if [ "$image_version" != "latest" ]; then
        local latest_tag="${ECR_URI}:latest"
        log_info "Tagging as latest: $latest_tag"
        docker tag "$local_image_tag" "$latest_tag"
        docker push "$latest_tag"
        log_success "Latest tag pushed: $latest_tag"
    fi
    
    # Clean up local images (optional)
    read -p "Clean up local Docker images? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleaning up local images..."
        docker rmi "$local_image_tag" "$remote_image_tag" 2>/dev/null || true
        log_success "Local images cleaned up"
    fi
    
    # Display summary
    log_success "=== BUILD AND PUSH COMPLETED SUCCESSFULLY ==="
    echo
    log_info "Image Details:"
    echo "  • Repository: $ECR_URI"
    echo "  • Tag: $image_version"
    echo "  • Full URI: $remote_image_tag"
    echo
    
    log_info "Next Steps:"
    echo "  1. Deploy ECS service with new image:"
    echo "     aws cloudformation deploy \\"
    echo "       --template-file cloudformation/07-ecs-service.yaml \\"
    echo "       --stack-name ${STACK_PREFIX}-07-ecs-service \\"
    echo "       --parameter-overrides file://config/parameters-test.json ContainerImage=$image_version \\"
    echo "       --capabilities CAPABILITY_IAM"
    echo
    echo "  2. Validate deployment:"
    echo "     ./scripts/validate-infrastructure.sh"
    echo
    
    log_success "Container build and push completed successfully!"
}

# Handle script interruption
trap 'log_error "Build process interrupted"; exit 1' INT TERM

# Run main function
main "$@"