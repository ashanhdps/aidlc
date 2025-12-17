#!/bin/bash

# Data Analytics Service - Infrastructure Validation Script
# This script validates the deployed infrastructure and application

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

# Function to check if stack exists and is in good state
check_stack_status() {
    local stack_name=$1
    
    log_info "Checking stack status: $stack_name"
    
    local stack_status=$(aws cloudformation describe-stacks \
        --stack-name $stack_name \
        --region $REGION \
        --query 'Stacks[0].StackStatus' \
        --output text 2>/dev/null || echo "NOT_FOUND")
    
    if [ "$stack_status" = "NOT_FOUND" ]; then
        log_error "Stack not found: $stack_name"
        return 1
    elif [[ $stack_status == *"COMPLETE"* ]]; then
        log_success "Stack status OK: $stack_name ($stack_status)"
        return 0
    else
        log_error "Stack status not healthy: $stack_name ($stack_status)"
        return 1
    fi
}

# Function to get stack output
get_stack_output() {
    local stack_name=$1
    local output_key=$2
    
    aws cloudformation describe-stacks \
        --stack-name $stack_name \
        --region $REGION \
        --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
        --output text 2>/dev/null || echo ""
}

# Function to test HTTP endpoint
test_http_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local timeout=${3:-30}
    
    log_info "Testing HTTP endpoint: $url"
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $timeout "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        log_success "HTTP endpoint OK: $url (Status: $response)"
        return 0
    else
        log_error "HTTP endpoint failed: $url (Status: $response, Expected: $expected_status)"
        return 1
    fi
}

# Function to test database connectivity
test_database_connectivity() {
    local db_endpoint=$1
    local db_port=$2
    
    log_info "Testing database connectivity: $db_endpoint:$db_port"
    
    # Use nc (netcat) to test port connectivity
    if command -v nc &> /dev/null; then
        if nc -z -w5 "$db_endpoint" "$db_port" 2>/dev/null; then
            log_success "Database port accessible: $db_endpoint:$db_port"
            return 0
        else
            log_error "Database port not accessible: $db_endpoint:$db_port"
            return 1
        fi
    else
        log_warning "netcat not available, skipping database connectivity test"
        return 0
    fi
}

# Function to test Redis connectivity
test_redis_connectivity() {
    local redis_endpoint=$1
    local redis_port=$2
    
    log_info "Testing Redis connectivity: $redis_endpoint:$redis_port"
    
    # Use nc (netcat) to test port connectivity
    if command -v nc &> /dev/null; then
        if nc -z -w5 "$redis_endpoint" "$redis_port" 2>/dev/null; then
            log_success "Redis port accessible: $redis_endpoint:$redis_port"
            return 0
        else
            log_error "Redis port not accessible: $redis_endpoint:$redis_port"
            return 1
        fi
    else
        log_warning "netcat not available, skipping Redis connectivity test"
        return 0
    fi
}

# Function to check ECS service health
check_ecs_service_health() {
    local cluster_name=$1
    local service_name=$2
    
    log_info "Checking ECS service health: $service_name"
    
    local service_info=$(aws ecs describe-services \
        --cluster "$cluster_name" \
        --services "$service_name" \
        --region $REGION \
        --query 'services[0]' 2>/dev/null)
    
    if [ "$service_info" = "null" ] || [ -z "$service_info" ]; then
        log_error "ECS service not found: $service_name"
        return 1
    fi
    
    local running_count=$(echo "$service_info" | jq -r '.runningCount // 0')
    local desired_count=$(echo "$service_info" | jq -r '.desiredCount // 0')
    local service_status=$(echo "$service_info" | jq -r '.status // "UNKNOWN"')
    
    log_info "ECS Service Status: $service_status"
    log_info "Tasks - Running: $running_count, Desired: $desired_count"
    
    if [ "$service_status" = "ACTIVE" ] && [ "$running_count" -eq "$desired_count" ] && [ "$running_count" -gt 0 ]; then
        log_success "ECS service healthy: $service_name"
        return 0
    else
        log_error "ECS service not healthy: $service_name"
        
        # Show recent service events
        log_info "Recent service events:"
        aws ecs describe-services \
            --cluster "$cluster_name" \
            --services "$service_name" \
            --region $REGION \
            --query 'services[0].events[:5].[createdAt,message]' \
            --output table
        
        return 1
    fi
}

# Function to check ALB target health
check_alb_target_health() {
    local target_group_arn=$1
    
    log_info "Checking ALB target group health"
    
    local healthy_targets=$(aws elbv2 describe-target-health \
        --target-group-arn "$target_group_arn" \
        --region $REGION \
        --query 'TargetHealthDescriptions[?TargetHealth.State==`healthy`]' \
        --output json | jq length)
    
    local total_targets=$(aws elbv2 describe-target-health \
        --target-group-arn "$target_group_arn" \
        --region $REGION \
        --query 'TargetHealthDescriptions' \
        --output json | jq length)
    
    log_info "Target Health - Healthy: $healthy_targets, Total: $total_targets"
    
    if [ "$healthy_targets" -gt 0 ]; then
        log_success "ALB targets healthy: $healthy_targets/$total_targets"
        return 0
    else
        log_error "No healthy ALB targets: $healthy_targets/$total_targets"
        
        # Show target health details
        log_info "Target health details:"
        aws elbv2 describe-target-health \
            --target-group-arn "$target_group_arn" \
            --region $REGION \
            --query 'TargetHealthDescriptions[*].[Target.Id,TargetHealth.State,TargetHealth.Description]' \
            --output table
        
        return 1
    fi
}

# Function to run application-specific tests
test_application_endpoints() {
    local base_url=$1
    
    log_info "Testing application endpoints..."
    
    # Test health endpoint
    test_http_endpoint "$base_url/actuator/health" 200 || return 1
    
    # Test API endpoints (basic smoke tests)
    test_http_endpoint "$base_url/admin/users" 200 || log_warning "Users endpoint may require authentication"
    test_http_endpoint "$base_url/reports/templates" 200 || log_warning "Reports endpoint may require authentication"
    
    # Test metrics endpoint
    test_http_endpoint "$base_url/actuator/metrics" 200 || log_warning "Metrics endpoint may be disabled"
    
    return 0
}

# Function to check CloudWatch logs
check_cloudwatch_logs() {
    local log_group_name=$1
    
    log_info "Checking CloudWatch logs: $log_group_name"
    
    # Check if log group exists
    if aws logs describe-log-groups \
        --log-group-name-prefix "$log_group_name" \
        --region $REGION \
        --query 'logGroups[0].logGroupName' \
        --output text | grep -q "$log_group_name"; then
        
        log_success "CloudWatch log group exists: $log_group_name"
        
        # Check for recent log streams
        local recent_streams=$(aws logs describe-log-streams \
            --log-group-name "$log_group_name" \
            --region $REGION \
            --order-by LastEventTime \
            --descending \
            --max-items 5 \
            --query 'logStreams[*].logStreamName' \
            --output text)
        
        if [ -n "$recent_streams" ]; then
            log_success "Recent log streams found"
            log_info "Recent streams: $(echo $recent_streams | tr '\t' ' ')"
        else
            log_warning "No recent log streams found"
        fi
        
        return 0
    else
        log_error "CloudWatch log group not found: $log_group_name"
        return 1
    fi
}

# Main validation function
main() {
    log_info "Starting infrastructure validation..."
    log_info "Project: $PROJECT_NAME"
    log_info "Environment: $ENVIRONMENT"
    log_info "Region: $REGION"
    echo
    
    local validation_errors=0
    
    # Check all CloudFormation stacks
    log_info "=== CLOUDFORMATION STACK VALIDATION ==="
    local stacks=(
        "01-vpc-networking"
        "08-iam-roles"
        "02-rds-postgresql"
        "03-elasticache-redis"
        "04-s3-sqs"
        "05-ecs-cluster"
        "06-application-load-balancer"
        "09-cloudwatch-monitoring"
    )
    
    for stack_suffix in "${stacks[@]}"; do
        local stack_name="${STACK_PREFIX}-${stack_suffix}"
        if ! check_stack_status "$stack_name"; then
            ((validation_errors++))
        fi
    done
    echo
    
    # Get important resource information
    log_info "=== RESOURCE INFORMATION ==="
    local alb_dns=$(get_stack_output "${STACK_PREFIX}-06-application-load-balancer" "ApplicationLoadBalancerDNS")
    local target_group_arn=$(get_stack_output "${STACK_PREFIX}-06-application-load-balancer" "ALBTargetGroupArn")
    local db_endpoint=$(get_stack_output "${STACK_PREFIX}-02-rds-postgresql" "DatabaseEndpoint")
    local db_port=$(get_stack_output "${STACK_PREFIX}-02-rds-postgresql" "DatabasePort")
    local redis_endpoint=$(get_stack_output "${STACK_PREFIX}-03-elasticache-redis" "RedisEndpoint")
    local redis_port=$(get_stack_output "${STACK_PREFIX}-03-elasticache-redis" "RedisPort")
    local cluster_name=$(get_stack_output "${STACK_PREFIX}-05-ecs-cluster" "ECSClusterName")
    local log_group_name=$(get_stack_output "${STACK_PREFIX}-05-ecs-cluster" "ECSLogGroupName")
    
    log_info "Application Load Balancer: $alb_dns"
    log_info "Database: $db_endpoint:$db_port"
    log_info "Redis: $redis_endpoint:$redis_port"
    log_info "ECS Cluster: $cluster_name"
    echo
    
    # Test network connectivity
    log_info "=== NETWORK CONNECTIVITY TESTS ==="
    if [ -n "$db_endpoint" ] && [ -n "$db_port" ]; then
        if ! test_database_connectivity "$db_endpoint" "$db_port"; then
            ((validation_errors++))
        fi
    fi
    
    if [ -n "$redis_endpoint" ] && [ -n "$redis_port" ]; then
        if ! test_redis_connectivity "$redis_endpoint" "$redis_port"; then
            ((validation_errors++))
        fi
    fi
    echo
    
    # Check ECS service (if deployed)
    log_info "=== ECS SERVICE VALIDATION ==="
    local service_name="${PROJECT_NAME}-${ENVIRONMENT}-service"
    if aws ecs describe-services --cluster "$cluster_name" --services "$service_name" --region $REGION &>/dev/null; then
        if ! check_ecs_service_health "$cluster_name" "$service_name"; then
            ((validation_errors++))
        fi
        
        # Check ALB target health
        if [ -n "$target_group_arn" ]; then
            if ! check_alb_target_health "$target_group_arn"; then
                ((validation_errors++))
            fi
        fi
    else
        log_warning "ECS service not deployed yet: $service_name"
    fi
    echo
    
    # Test application endpoints
    if [ -n "$alb_dns" ]; then
        log_info "=== APPLICATION ENDPOINT TESTS ==="
        local app_url="http://$alb_dns/api/v1/data-analytics"
        if ! test_application_endpoints "$app_url"; then
            ((validation_errors++))
        fi
        echo
    fi
    
    # Check CloudWatch logs
    log_info "=== CLOUDWATCH LOGS VALIDATION ==="
    if [ -n "$log_group_name" ]; then
        if ! check_cloudwatch_logs "$log_group_name"; then
            ((validation_errors++))
        fi
    fi
    echo
    
    # Summary
    if [ $validation_errors -eq 0 ]; then
        log_success "=== VALIDATION COMPLETED SUCCESSFULLY ==="
        echo
        log_info "All infrastructure components are healthy!"
        
        if [ -n "$alb_dns" ]; then
            echo
            log_info "Application URLs:"
            echo "  • Health Check: http://$alb_dns/api/v1/data-analytics/actuator/health"
            echo "  • API Base: http://$alb_dns/api/v1/data-analytics"
            echo "  • Metrics: http://$alb_dns/api/v1/data-analytics/actuator/metrics"
        fi
        
        echo
        log_info "AWS Console Links:"
        echo "  • ECS Cluster: https://${REGION}.console.aws.amazon.com/ecs/home?region=${REGION}#/clusters/${cluster_name}"
        echo "  • Load Balancer: https://${REGION}.console.aws.amazon.com/ec2/v2/home?region=${REGION}#LoadBalancers:"
        echo "  • CloudWatch Logs: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#logsV2:log-groups"
        
        return 0
    else
        log_error "=== VALIDATION FAILED ==="
        log_error "Found $validation_errors validation errors"
        echo
        log_info "Troubleshooting steps:"
        echo "  1. Check CloudFormation stack events for deployment issues"
        echo "  2. Review ECS service events and task logs"
        echo "  3. Verify security group rules and network connectivity"
        echo "  4. Check application logs in CloudWatch"
        
        return 1
    fi
}

# Handle script interruption
trap 'log_error "Validation interrupted"; exit 1' INT TERM

# Run main function
main "$@"