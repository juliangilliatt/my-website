#!/bin/bash

# Deployment Monitoring and Health Check Script
# Monitors deployment health and performance metrics

set -e

# Configuration
DEPLOYMENT_URL=${1:-"https://juliangilliatt.com"}
ENVIRONMENT=${2:-"production"}
CHECK_INTERVAL=${3:-60}  # seconds
MAX_RETRIES=${4:-3}

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

# Health check endpoints
HEALTH_ENDPOINTS=(
    "/api/health"
    "/api/status"
    "/sitemap.xml"
    "/robots.txt"
)

# Performance thresholds
PERFORMANCE_THRESHOLDS=(
    "response_time:2000"     # 2 seconds
    "ttfb:800"              # 800ms
    "page_load:3000"        # 3 seconds
    "lighthouse_score:90"    # 90/100
)

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    local missing_tools=()
    
    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_tools+=("jq")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install them and try again"
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Basic health check
basic_health_check() {
    log_info "Running basic health check..."
    
    local start_time=$(date +%s%3N)
    local response_code
    local response_time
    
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")
    local end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    if [[ "$response_code" == "200" ]]; then
        log_success "Homepage is accessible (${response_time}ms)"
        return 0
    else
        log_error "Homepage returned status code: $response_code"
        return 1
    fi
}

# Check API endpoints
check_api_endpoints() {
    log_info "Checking API endpoints..."
    
    local failed_endpoints=()
    
    for endpoint in "${HEALTH_ENDPOINTS[@]}"; do
        local full_url="${DEPLOYMENT_URL}${endpoint}"
        local response_code
        
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "$full_url")
        
        if [[ "$response_code" =~ ^[23] ]]; then
            log_success "✅ $endpoint ($response_code)"
        else
            log_error "❌ $endpoint ($response_code)"
            failed_endpoints+=("$endpoint")
        fi
    done
    
    if [[ ${#failed_endpoints[@]} -gt 0 ]]; then
        log_error "Failed endpoints: ${failed_endpoints[*]}"
        return 1
    fi
    
    log_success "All API endpoints are healthy"
    return 0
}

# Performance monitoring
check_performance() {
    log_info "Checking performance metrics..."
    
    local temp_file=$(mktemp)
    local warnings=()
    
    # Test response time
    local start_time=$(date +%s%3N)
    curl -s -o "$temp_file" -w "%{time_total}" "$DEPLOYMENT_URL" > /dev/null
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    # Check response time threshold
    if [[ $response_time -gt 2000 ]]; then
        warnings+=("Response time: ${response_time}ms (threshold: 2000ms)")
    else
        log_success "Response time: ${response_time}ms"
    fi
    
    # Test Time to First Byte (TTFB)
    local ttfb
    ttfb=$(curl -s -o /dev/null -w "%{time_starttransfer}" "$DEPLOYMENT_URL" | awk '{print int($1*1000)}')
    
    if [[ $ttfb -gt 800 ]]; then
        warnings+=("TTFB: ${ttfb}ms (threshold: 800ms)")
    else
        log_success "TTFB: ${ttfb}ms"
    fi
    
    # Check content size
    local content_size
    content_size=$(curl -s -o /dev/null -w "%{size_download}" "$DEPLOYMENT_URL")
    log_info "Content size: ${content_size} bytes"
    
    # Report warnings
    if [[ ${#warnings[@]} -gt 0 ]]; then
        log_warning "Performance warnings:"
        for warning in "${warnings[@]}"; do
            log_warning "  - $warning"
        done
        return 1
    fi
    
    log_success "Performance metrics are within acceptable ranges"
    rm -f "$temp_file"
    return 0
}

# Run Lighthouse audit
run_lighthouse_audit() {
    log_info "Running Lighthouse audit..."
    
    if ! command -v lighthouse &> /dev/null; then
        log_warning "Lighthouse is not installed. Skipping audit."
        return 0
    fi
    
    local output_file="lighthouse-report-$(date +%Y%m%d-%H%M%S).json"
    
    lighthouse "$DEPLOYMENT_URL" \
        --only-categories=performance,accessibility,best-practices,seo \
        --output=json \
        --output-path="$output_file" \
        --chrome-flags="--headless --no-sandbox" \
        --quiet
    
    if [[ $? -eq 0 ]]; then
        # Parse scores
        local performance_score=$(jq -r '.categories.performance.score * 100' "$output_file")
        local accessibility_score=$(jq -r '.categories.accessibility.score * 100' "$output_file")
        local best_practices_score=$(jq -r '.categories["best-practices"].score * 100' "$output_file")
        local seo_score=$(jq -r '.categories.seo.score * 100' "$output_file")
        
        log_success "Lighthouse Scores:"
        log_success "  Performance: ${performance_score}/100"
        log_success "  Accessibility: ${accessibility_score}/100"
        log_success "  Best Practices: ${best_practices_score}/100"
        log_success "  SEO: ${seo_score}/100"
        
        # Check if scores meet thresholds
        if [[ $(echo "$performance_score < 90" | bc -l) -eq 1 ]]; then
            log_warning "Performance score is below threshold (90)"
        fi
        
        # Clean up
        rm -f "$output_file"
        return 0
    else
        log_error "Lighthouse audit failed"
        return 1
    fi
}

# Check SSL certificate
check_ssl_certificate() {
    log_info "Checking SSL certificate..."
    
    local domain
    domain=$(echo "$DEPLOYMENT_URL" | sed 's/https\?:\/\///' | sed 's/\/.*//')
    
    local cert_info
    cert_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
    
    if [[ -n "$cert_info" ]]; then
        local expiry_date
        expiry_date=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
        
        local expiry_timestamp
        expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$expiry_date" +%s 2>/dev/null)
        
        local current_timestamp
        current_timestamp=$(date +%s)
        
        local days_until_expiry
        days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        if [[ $days_until_expiry -gt 30 ]]; then
            log_success "SSL certificate is valid (expires in $days_until_expiry days)"
        elif [[ $days_until_expiry -gt 7 ]]; then
            log_warning "SSL certificate expires in $days_until_expiry days"
        else
            log_error "SSL certificate expires in $days_until_expiry days - immediate attention required"
        fi
    else
        log_error "Could not retrieve SSL certificate information"
        return 1
    fi
}

# Check CDN status
check_cdn_status() {
    log_info "Checking CDN status..."
    
    local cdn_headers
    cdn_headers=$(curl -s -I "$DEPLOYMENT_URL" | grep -i -E "(cf-|x-cache|x-served-by|x-edge|server)")
    
    if [[ -n "$cdn_headers" ]]; then
        log_success "CDN is active"
        echo "$cdn_headers" | while read -r header; do
            log_info "  $header"
        done
    else
        log_warning "CDN status could not be determined"
    fi
}

# Check database connectivity
check_database_connectivity() {
    log_info "Checking database connectivity..."
    
    local db_health_url="${DEPLOYMENT_URL}/api/health/database"
    local response_code
    
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$db_health_url")
    
    if [[ "$response_code" == "200" ]]; then
        log_success "Database is connected and healthy"
    else
        log_error "Database connectivity check failed (status: $response_code)"
        return 1
    fi
}

# Check cache status
check_cache_status() {
    log_info "Checking cache status..."
    
    local cache_health_url="${DEPLOYMENT_URL}/api/health/cache"
    local response_code
    
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$cache_health_url")
    
    if [[ "$response_code" == "200" ]]; then
        log_success "Cache is operational"
    else
        log_warning "Cache status check failed (status: $response_code)"
    fi
}

# Generate monitoring report
generate_monitoring_report() {
    log_info "Generating monitoring report..."
    
    local timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
    local report_file="monitoring-report-$(date +%Y%m%d-%H%M%S).json"
    
    local report="{
        \"timestamp\": \"$timestamp\",
        \"deployment_url\": \"$DEPLOYMENT_URL\",
        \"environment\": \"$ENVIRONMENT\",
        \"checks\": {
            \"basic_health\": $(basic_health_check && echo "true" || echo "false"),
            \"api_endpoints\": $(check_api_endpoints && echo "true" || echo "false"),
            \"performance\": $(check_performance && echo "true" || echo "false"),
            \"ssl_certificate\": $(check_ssl_certificate && echo "true" || echo "false"),
            \"database\": $(check_database_connectivity && echo "true" || echo "false"),
            \"cache\": $(check_cache_status && echo "true" || echo "false")
        }
    }"
    
    echo "$report" | jq '.' > "$report_file"
    
    log_success "Monitoring report saved: $report_file"
}

# Send alerts
send_alerts() {
    local status=$1
    local message=$2
    
    # Send Slack notification
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        local color="good"
        local emoji="✅"
        
        if [[ "$status" == "error" ]]; then
            color="danger"
            emoji="❌"
        elif [[ "$status" == "warning" ]]; then
            color="warning"
            emoji="⚠️"
        fi
        
        local payload="{
            \"attachments\": [{
                \"color\": \"$color\",
                \"title\": \"$emoji Deployment Monitor - $ENVIRONMENT\",
                \"text\": \"$message\",
                \"fields\": [{
                    \"title\": \"Environment\",
                    \"value\": \"$ENVIRONMENT\",
                    \"short\": true
                }, {
                    \"title\": \"URL\",
                    \"value\": \"$DEPLOYMENT_URL\",
                    \"short\": true
                }, {
                    \"title\": \"Timestamp\",
                    \"value\": \"$(date -u)\",
                    \"short\": true
                }]
            }]
        }"
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    # Send email notification (if configured)
    if [[ -n "$EMAIL_ALERT_RECIPIENT" ]]; then
        local subject="$emoji Deployment Monitor Alert - $ENVIRONMENT"
        echo "$message" | mail -s "$subject" "$EMAIL_ALERT_RECIPIENT"
    fi
}

# Continuous monitoring
continuous_monitoring() {
    log_info "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)..."
    
    local consecutive_failures=0
    local max_consecutive_failures=3
    
    while true; do
        log_info "Running health checks..."
        
        local overall_status="success"
        local status_messages=()
        
        # Run all checks
        if ! basic_health_check; then
            overall_status="error"
            status_messages+=("Basic health check failed")
        fi
        
        if ! check_api_endpoints; then
            overall_status="error"
            status_messages+=("API endpoints check failed")
        fi
        
        if ! check_performance; then
            overall_status="warning"
            status_messages+=("Performance check failed")
        fi
        
        if ! check_database_connectivity; then
            overall_status="error"
            status_messages+=("Database connectivity check failed")
        fi
        
        # Handle status
        if [[ "$overall_status" == "error" ]]; then
            consecutive_failures=$((consecutive_failures + 1))
            
            if [[ $consecutive_failures -ge $max_consecutive_failures ]]; then
                local message="Critical: $consecutive_failures consecutive failures detected. ${status_messages[*]}"
                send_alerts "error" "$message"
                log_error "$message"
            fi
        else
            if [[ $consecutive_failures -gt 0 ]]; then
                local message="Recovery: Service is healthy again after $consecutive_failures failures"
                send_alerts "success" "$message"
                log_success "$message"
            fi
            consecutive_failures=0
        fi
        
        # Generate periodic report
        generate_monitoring_report
        
        # Wait for next check
        sleep "$CHECK_INTERVAL"
    done
}

# Main function
main() {
    log_info "Starting deployment monitoring..."
    log_info "URL: $DEPLOYMENT_URL"
    log_info "Environment: $ENVIRONMENT"
    
    check_dependencies
    
    # Run one-time comprehensive check
    log_info "Running comprehensive health check..."
    
    basic_health_check
    check_api_endpoints
    check_performance
    run_lighthouse_audit
    check_ssl_certificate
    check_cdn_status
    check_database_connectivity
    check_cache_status
    
    generate_monitoring_report
    
    log_success "Comprehensive health check completed"
    
    # Start continuous monitoring if requested
    if [[ "${5:-}" == "--continuous" ]]; then
        continuous_monitoring
    fi
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [url] [environment] [interval] [retries] [--continuous]"
        echo "Examples:"
        echo "  $0 https://my-site.com production"
        echo "  $0 https://my-site.com production 60 3 --continuous"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac