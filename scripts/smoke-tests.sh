#!/bin/bash

# Smoke Tests for Production Deployment
# These tests verify basic functionality is working

set -e

# Configuration
DEPLOYMENT_URL=${1:-"https://juliangilliatt.com"}
TIMEOUT=30
MAX_RETRIES=3

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

# Test homepage
test_homepage() {
    log_info "Testing homepage..."
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$DEPLOYMENT_URL")
    
    if [[ "$status_code" == "200" ]]; then
        log_success "Homepage is accessible (HTTP $status_code)"
    else
        log_error "Homepage failed (HTTP $status_code)"
        return 1
    fi
    
    # Check if page contains expected content
    local content
    content=$(curl -s --max-time $TIMEOUT "$DEPLOYMENT_URL")
    
    if echo "$content" | grep -q "Julian Gilliatt"; then
        log_success "Homepage contains expected content"
    else
        log_error "Homepage missing expected content"
        return 1
    fi
}

# Test recipes page
test_recipes_page() {
    log_info "Testing recipes page..."
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$DEPLOYMENT_URL/recipes")
    
    if [[ "$status_code" == "200" ]]; then
        log_success "Recipes page is accessible (HTTP $status_code)"
    else
        log_error "Recipes page failed (HTTP $status_code)"
        return 1
    fi
}

# Test blog page
test_blog_page() {
    log_info "Testing blog page..."
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$DEPLOYMENT_URL/blog")
    
    if [[ "$status_code" == "200" ]]; then
        log_success "Blog page is accessible (HTTP $status_code)"
    else
        log_error "Blog page failed (HTTP $status_code)"
        return 1
    fi
}

# Test API endpoints
test_api_endpoints() {
    log_info "Testing API endpoints..."
    
    local endpoints=(
        "/api/recipes"
        "/api/blog"
        "/api/github/last-commit"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local status_code
        status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$DEPLOYMENT_URL$endpoint")
        
        if [[ "$status_code" =~ ^[23] ]]; then
            log_success "API endpoint $endpoint is working (HTTP $status_code)"
        else
            log_warning "API endpoint $endpoint returned HTTP $status_code"
        fi
    done
}

# Test static files
test_static_files() {
    log_info "Testing static files..."
    
    local static_files=(
        "/robots.txt"
        "/sitemap.xml"
        "/manifest.json"
    )
    
    for file in "${static_files[@]}"; do
        local status_code
        status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$DEPLOYMENT_URL$file")
        
        if [[ "$status_code" == "200" ]]; then
            log_success "Static file $file is accessible (HTTP $status_code)"
        else
            log_warning "Static file $file returned HTTP $status_code"
        fi
    done
}

# Test SSL certificate
test_ssl_certificate() {
    log_info "Testing SSL certificate..."
    
    local domain
    domain=$(echo "$DEPLOYMENT_URL" | sed 's/https\?:\/\///' | sed 's/\/.*//')
    
    if openssl s_client -connect "$domain:443" -servername "$domain" </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
        log_success "SSL certificate is valid"
    else
        log_error "SSL certificate validation failed"
        return 1
    fi
}

# Test response time
test_response_time() {
    log_info "Testing response time..."
    
    local start_time
    local end_time
    local response_time
    
    start_time=$(date +%s%3N)
    curl -s -o /dev/null --max-time $TIMEOUT "$DEPLOYMENT_URL"
    end_time=$(date +%s%3N)
    
    response_time=$((end_time - start_time))
    
    if [[ $response_time -lt 3000 ]]; then
        log_success "Response time is acceptable (${response_time}ms)"
    else
        log_warning "Response time is slow (${response_time}ms)"
    fi
}

# Test mobile responsiveness
test_mobile_responsiveness() {
    log_info "Testing mobile responsiveness..."
    
    local mobile_user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT -H "User-Agent: $mobile_user_agent" "$DEPLOYMENT_URL")
    
    if [[ "$status_code" == "200" ]]; then
        log_success "Mobile responsiveness test passed (HTTP $status_code)"
    else
        log_error "Mobile responsiveness test failed (HTTP $status_code)"
        return 1
    fi
}

# Test search functionality
test_search_functionality() {
    log_info "Testing search functionality..."
    
    local search_url="$DEPLOYMENT_URL/recipes?search=pasta"
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$search_url")
    
    if [[ "$status_code" == "200" ]]; then
        log_success "Search functionality is working (HTTP $status_code)"
    else
        log_error "Search functionality failed (HTTP $status_code)"
        return 1
    fi
}

# Test 404 handling
test_404_handling() {
    log_info "Testing 404 handling..."
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$DEPLOYMENT_URL/nonexistent-page")
    
    if [[ "$status_code" == "404" ]]; then
        log_success "404 handling is working correctly"
    else
        log_warning "404 handling returned HTTP $status_code instead of 404"
    fi
}

# Test security headers
test_security_headers() {
    log_info "Testing security headers..."
    
    local headers
    headers=$(curl -s -I --max-time $TIMEOUT "$DEPLOYMENT_URL")
    
    local security_headers=(
        "X-Frame-Options"
        "X-Content-Type-Options"
        "X-XSS-Protection"
        "Strict-Transport-Security"
    )
    
    for header in "${security_headers[@]}"; do
        if echo "$headers" | grep -qi "$header"; then
            log_success "Security header $header is present"
        else
            log_warning "Security header $header is missing"
        fi
    done
}

# Run all tests with retry logic
run_test_with_retry() {
    local test_function=$1
    local test_name=$2
    local attempts=0
    
    while [[ $attempts -lt $MAX_RETRIES ]]; do
        if $test_function; then
            return 0
        else
            attempts=$((attempts + 1))
            if [[ $attempts -lt $MAX_RETRIES ]]; then
                log_warning "Test $test_name failed, retrying... ($attempts/$MAX_RETRIES)"
                sleep 5
            fi
        fi
    done
    
    log_error "Test $test_name failed after $MAX_RETRIES attempts"
    return 1
}

# Main function
main() {
    log_info "Starting smoke tests for: $DEPLOYMENT_URL"
    echo
    
    local failed_tests=0
    local total_tests=0
    
    # List of tests to run
    local tests=(
        "test_homepage:Homepage"
        "test_recipes_page:Recipes Page"
        "test_blog_page:Blog Page"
        "test_api_endpoints:API Endpoints"
        "test_static_files:Static Files"
        "test_ssl_certificate:SSL Certificate"
        "test_response_time:Response Time"
        "test_mobile_responsiveness:Mobile Responsiveness"
        "test_search_functionality:Search Functionality"
        "test_404_handling:404 Handling"
        "test_security_headers:Security Headers"
    )
    
    # Run each test
    for test_entry in "${tests[@]}"; do
        IFS=':' read -r test_function test_name <<< "$test_entry"
        total_tests=$((total_tests + 1))
        
        if ! run_test_with_retry "$test_function" "$test_name"; then
            failed_tests=$((failed_tests + 1))
        fi
        
        echo
    done
    
    # Summary
    echo "============================================"
    log_info "Smoke Test Summary"
    echo "============================================"
    log_info "Total tests: $total_tests"
    
    if [[ $failed_tests -eq 0 ]]; then
        log_success "All tests passed! ✅"
        echo
        log_success "🎉 Deployment appears to be working correctly!"
        exit 0
    else
        log_error "Failed tests: $failed_tests"
        echo
        log_error "❌ Some tests failed. Please investigate."
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [deployment-url]"
        echo "Example: $0 https://juliangilliatt.com"
        exit 0
        ;;
    *)
        main
        ;;
esac