#!/bin/bash

# Recipe Website Deployment Script
# This script handles deployment to different environments

set -e

# Configuration
PROJECT_NAME="recipe-website"
VERCEL_ORG="my-team"
DEPLOYMENT_ENV=${1:-production}
BRANCH=${2:-main}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI is not installed. Please install it with: npm i -g vercel"
        exit 1
    fi
}

# Check if user is logged in to Vercel
check_vercel_auth() {
    if ! vercel whoami &> /dev/null; then
        log_error "You are not logged in to Vercel. Please run: vercel login"
        exit 1
    fi
}

# Validate environment
validate_environment() {
    case $DEPLOYMENT_ENV in
        production|staging|preview)
            log_info "Deploying to $DEPLOYMENT_ENV environment"
            ;;
        *)
            log_error "Invalid environment: $DEPLOYMENT_ENV. Use: production, staging, or preview"
            exit 1
            ;;
    esac
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if we're in a Git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "This is not a Git repository"
        exit 1
    fi
    
    # Check if there are uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "There are uncommitted changes. Consider committing them first."
        read -p "Do you want to continue? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Check if required files exist
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found"
        exit 1
    fi
    
    if [[ ! -f "next.config.js" ]]; then
        log_error "next.config.js not found"
        exit 1
    fi
    
    if [[ ! -f "vercel.json" ]]; then
        log_error "vercel.json not found"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    if [[ -f "package-lock.json" ]]; then
        npm ci
    elif [[ -f "yarn.lock" ]]; then
        yarn install --frozen-lockfile
    else
        npm install
    fi
    
    log_success "Dependencies installed"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Run linting
    if npm run lint:check > /dev/null 2>&1; then
        log_success "Linting passed"
    else
        log_error "Linting failed"
        exit 1
    fi
    
    # Run type checking
    if npm run type-check > /dev/null 2>&1; then
        log_success "Type checking passed"
    else
        log_error "Type checking failed"
        exit 1
    fi
    
    # Run unit tests
    if npm run test:unit > /dev/null 2>&1; then
        log_success "Unit tests passed"
    else
        log_error "Unit tests failed"
        exit 1
    fi
    
    log_success "All tests passed"
}

# Build the project
build_project() {
    log_info "Building the project..."
    
    if npm run build; then
        log_success "Build completed successfully"
    else
        log_error "Build failed"
        exit 1
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    log_info "Deploying to Vercel..."
    
    local deployment_args=""
    
    case $DEPLOYMENT_ENV in
        production)
            deployment_args="--prod"
            ;;
        staging)
            deployment_args="--target staging"
            ;;
        preview)
            deployment_args="--target preview"
            ;;
    esac
    
    # Set environment variables based on deployment environment
    local env_file=".env.${DEPLOYMENT_ENV}"
    if [[ -f "$env_file" ]]; then
        log_info "Using environment file: $env_file"
        deployment_args="$deployment_args --env-file $env_file"
    fi
    
    # Deploy
    local deployment_url
    deployment_url=$(vercel $deployment_args --yes 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
    
    if [[ -n "$deployment_url" ]]; then
        log_success "Deployment successful!"
        log_info "Deployment URL: $deployment_url"
        
        # Open in browser if on macOS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open "$deployment_url"
        fi
        
        return 0
    else
        log_error "Deployment failed"
        exit 1
    fi
}

# Post-deployment tasks
post_deployment_tasks() {
    log_info "Running post-deployment tasks..."
    
    # Run smoke tests
    if [[ -f "scripts/smoke-tests.sh" ]]; then
        log_info "Running smoke tests..."
        if bash scripts/smoke-tests.sh "$deployment_url"; then
            log_success "Smoke tests passed"
        else
            log_warning "Smoke tests failed"
        fi
    fi
    
    # Warm up cache
    if [[ -f "scripts/warm-cache.sh" ]]; then
        log_info "Warming up cache..."
        bash scripts/warm-cache.sh "$deployment_url"
    fi
    
    # Send deployment notification
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        log_info "Sending deployment notification..."
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ $PROJECT_NAME deployed to $DEPLOYMENT_ENV: $deployment_url\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    log_success "Post-deployment tasks completed"
}

# Rollback function
rollback_deployment() {
    log_info "Rolling back deployment..."
    
    # Get previous deployment
    local previous_deployment
    previous_deployment=$(vercel ls --limit 2 | grep -v "$(date +%Y)" | head -1 | awk '{print $1}')
    
    if [[ -n "$previous_deployment" ]]; then
        vercel promote "$previous_deployment" --yes
        log_success "Rolled back to previous deployment: $previous_deployment"
    else
        log_error "No previous deployment found for rollback"
        exit 1
    fi
}

# Main deployment function
main() {
    log_info "Starting deployment process..."
    log_info "Environment: $DEPLOYMENT_ENV"
    log_info "Branch: $BRANCH"
    
    # Run all deployment steps
    check_vercel_cli
    check_vercel_auth
    validate_environment
    pre_deployment_checks
    install_dependencies
    run_tests
    build_project
    deploy_to_vercel
    post_deployment_tasks
    
    log_success "Deployment completed successfully! 🎉"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [environment] [branch]"
        echo "Environments: production, staging, preview"
        echo "Examples:"
        echo "  $0 production main"
        echo "  $0 staging develop"
        echo "  $0 preview feature-branch"
        exit 0
        ;;
    --rollback)
        rollback_deployment
        exit 0
        ;;
    *)
        main
        ;;
esac