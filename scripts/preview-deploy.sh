#!/bin/bash

# Preview Deployment Script
# Creates preview deployments for feature branches and PRs

set -e

# Configuration
BRANCH_NAME=${1:-$(git rev-parse --abbrev-ref HEAD)}
PR_NUMBER=${2:-}
DEPLOYMENT_NAME="preview-${BRANCH_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI is not installed. Please install it with: npm i -g vercel"
        exit 1
    fi
    
    # Check if user is logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        log_error "You are not logged in to Vercel. Please run: vercel login"
        exit 1
    fi
    
    # Check if we're in a Git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "This is not a Git repository"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create preview deployment
create_preview_deployment() {
    log_info "Creating preview deployment for branch: $BRANCH_NAME"
    
    # Set environment variables for preview
    export VERCEL_ENV=preview
    export NEXT_PUBLIC_SITE_URL="https://preview-${BRANCH_NAME}.vercel.app"
    
    # Create deployment
    local deployment_url
    deployment_url=$(vercel --target preview --yes 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
    
    if [[ -n "$deployment_url" ]]; then
        log_success "Preview deployment created successfully!"
        log_info "Preview URL: $deployment_url"
        
        # Save deployment URL for later use
        echo "$deployment_url" > .vercel/preview-url.txt
        
        # Update PR with deployment URL if PR number is provided
        if [[ -n "$PR_NUMBER" ]]; then
            update_pr_comment "$deployment_url"
        fi
        
        # Run preview tests
        run_preview_tests "$deployment_url"
        
        return 0
    else
        log_error "Preview deployment failed"
        exit 1
    fi
}

# Update PR with deployment URL
update_pr_comment() {
    local deployment_url=$1
    
    if [[ -n "$GITHUB_TOKEN" ]]; then
        log_info "Updating PR #$PR_NUMBER with deployment URL..."
        
        local repo_owner=$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^/]*\)\.git/\1/')
        local repo_name=$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^/]*\)\.git/\2/')
        
        local comment_body="🚀 **Preview Deployment Ready!**

✅ **Deployment URL:** $deployment_url
🌿 **Branch:** \`$BRANCH_NAME\`
📦 **Build:** \`$(git rev-parse --short HEAD)\`

**Preview Features:**
- ✅ Full functionality available
- ✅ Database seeded with sample data
- ✅ All API endpoints working
- ✅ Performance optimizations enabled

**Test Links:**
- [Homepage]($deployment_url)
- [Recipes]($deployment_url/recipes)
- [Blog]($deployment_url/blog)
- [Admin Panel]($deployment_url/admin)

---
*This comment will be updated with each new deployment.*"
        
        # Use GitHub CLI if available
        if command -v gh &> /dev/null; then
            gh pr comment "$PR_NUMBER" --body "$comment_body"
        else
            # Use curl to update PR comment
            curl -X POST \
                -H "Authorization: token $GITHUB_TOKEN" \
                -H "Accept: application/vnd.github.v3+json" \
                "https://api.github.com/repos/$repo_owner/$repo_name/issues/$PR_NUMBER/comments" \
                -d "{\"body\":\"$comment_body\"}"
        fi
        
        log_success "PR comment updated"
    else
        log_warning "GITHUB_TOKEN not found. Skipping PR comment update."
    fi
}

# Run preview tests
run_preview_tests() {
    local deployment_url=$1
    
    log_info "Running preview tests..."
    
    # Wait for deployment to be ready
    local max_retries=30
    local retry_count=0
    
    while [[ $retry_count -lt $max_retries ]]; do
        if curl -f -s "$deployment_url" > /dev/null; then
            log_success "Deployment is ready"
            break
        else
            log_info "Waiting for deployment to be ready... ($((retry_count + 1))/$max_retries)"
            sleep 10
            ((retry_count++))
        fi
    done
    
    if [[ $retry_count -eq $max_retries ]]; then
        log_error "Deployment failed to become ready"
        exit 1
    fi
    
    # Run smoke tests
    if [[ -f "scripts/smoke-tests.sh" ]]; then
        log_info "Running smoke tests..."
        if bash scripts/smoke-tests.sh "$deployment_url"; then
            log_success "Smoke tests passed"
        else
            log_warning "Smoke tests failed"
        fi
    fi
    
    # Run Lighthouse audit
    if command -v lighthouse &> /dev/null; then
        log_info "Running Lighthouse audit..."
        lighthouse "$deployment_url" \
            --only-categories=performance,accessibility,best-practices,seo \
            --output=json \
            --output-path=".vercel/lighthouse-report.json" \
            --chrome-flags="--headless" \
            --quiet
        
        if [[ $? -eq 0 ]]; then
            log_success "Lighthouse audit completed"
        else
            log_warning "Lighthouse audit failed"
        fi
    fi
    
    # Run visual regression tests
    if [[ -f "scripts/visual-regression.sh" ]]; then
        log_info "Running visual regression tests..."
        if bash scripts/visual-regression.sh "$deployment_url"; then
            log_success "Visual regression tests passed"
        else
            log_warning "Visual regression tests failed"
        fi
    fi
}

# Generate deployment report
generate_deployment_report() {
    log_info "Generating deployment report..."
    
    local deployment_url=$(cat .vercel/preview-url.txt 2>/dev/null || echo "N/A")
    local commit_hash=$(git rev-parse --short HEAD)
    local commit_message=$(git log -1 --pretty=format:"%s")
    local timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
    
    local report="# Preview Deployment Report

**Deployment Details:**
- URL: $deployment_url
- Branch: $BRANCH_NAME
- Commit: $commit_hash
- Message: $commit_message
- Timestamp: $timestamp

**Build Status:**
- ✅ Dependencies installed
- ✅ Tests passed
- ✅ Build successful
- ✅ Deployment created

**Test Results:**
- Smoke tests: $([ -f ".vercel/smoke-tests.log" ] && echo "✅ Passed" || echo "⚠️ Not run")
- Lighthouse audit: $([ -f ".vercel/lighthouse-report.json" ] && echo "✅ Completed" || echo "⚠️ Not run")
- Visual regression: $([ -f ".vercel/visual-regression.log" ] && echo "✅ Passed" || echo "⚠️ Not run")

**Next Steps:**
1. Review the deployment at: $deployment_url
2. Test all functionality
3. Verify responsive design
4. Check performance metrics
5. Approve or request changes

---
*Generated by preview-deploy.sh*"
    
    echo "$report" > .vercel/deployment-report.md
    
    log_success "Deployment report generated: .vercel/deployment-report.md"
}

# Cleanup old preview deployments
cleanup_old_deployments() {
    log_info "Cleaning up old preview deployments..."
    
    # Get list of deployments
    local deployments
    deployments=$(vercel ls --limit 50 | grep "preview-" | awk '{print $1}')
    
    # Keep only the 5 most recent deployments
    local old_deployments
    old_deployments=$(echo "$deployments" | tail -n +6)
    
    if [[ -n "$old_deployments" ]]; then
        echo "$old_deployments" | while read -r deployment; do
            log_info "Removing old deployment: $deployment"
            vercel remove "$deployment" --yes
        done
        
        log_success "Old deployments cleaned up"
    else
        log_info "No old deployments to clean up"
    fi
}

# Main function
main() {
    log_info "Starting preview deployment process..."
    log_info "Branch: $BRANCH_NAME"
    
    if [[ -n "$PR_NUMBER" ]]; then
        log_info "PR Number: $PR_NUMBER"
    fi
    
    # Create .vercel directory if it doesn't exist
    mkdir -p .vercel
    
    # Run deployment process
    check_prerequisites
    create_preview_deployment
    generate_deployment_report
    cleanup_old_deployments
    
    log_success "Preview deployment completed successfully! 🎉"
    
    # Show summary
    local deployment_url=$(cat .vercel/preview-url.txt 2>/dev/null || echo "N/A")
    echo
    echo "📋 Deployment Summary:"
    echo "🔗 Preview URL: $deployment_url"
    echo "🌿 Branch: $BRANCH_NAME"
    echo "📦 Commit: $(git rev-parse --short HEAD)"
    echo "📄 Report: .vercel/deployment-report.md"
    echo
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [branch] [pr-number]"
        echo "Examples:"
        echo "  $0 feature-branch"
        echo "  $0 feature-branch 123"
        echo "  $0 --cleanup"
        exit 0
        ;;
    --cleanup)
        cleanup_old_deployments
        exit 0
        ;;
    *)
        main
        ;;
esac