#!/bin/bash

# Domain Setup Script for juliangilliatt.com
# Configures custom domain with Squarespace DNS and Vercel

set -e

# Configuration
DOMAIN="juliangilliatt.com"
SUBDOMAIN=""
FULL_DOMAIN="$DOMAIN"
SQUARESPACE_DNS="true"
VERCEL_PROJECT_NAME="recipe-website"

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

# Display domain setup instructions
show_setup_instructions() {
    log_info "Setting up domain: $FULL_DOMAIN"
    echo
    echo "📋 Domain Configuration Instructions:"
    echo "=================================="
    echo
    echo "Since your domain is managed through Squarespace, you'll need to:"
    echo
    echo "1. 🌐 Configure DNS Records in Squarespace:"
    echo "   - Go to squarespace.com → Settings → Domains"
    echo "   - Select juliangilliatt.com"
    echo "   - Click 'DNS Settings'"
    echo "   - Add the following records:"
    echo
    echo "   A Record:"
    echo "   - Host: @ (root domain)"
    echo "   - Points to: 76.76.19.19"
    echo "   - TTL: 300"
    echo
    echo "   CNAME Record:"
    echo "   - Host: @ (root domain)"
    echo "   - Points to: cname.vercel-dns.com"
    echo "   - TTL: 300"
    echo
    echo "   (Use either A record OR CNAME record, not both)"
    echo
    echo "2. 🔧 Configure Vercel Domain:"
    echo "   - This script will handle the Vercel configuration"
    echo
    echo "3. 📜 SSL Certificate:"
    echo "   - Vercel will automatically provision SSL"
    echo "   - Certificate will be ready within 24 hours"
    echo
    echo "4. 🧪 Testing:"
    echo "   - DNS propagation can take 24-48 hours"
    echo "   - You can test with: dig $FULL_DOMAIN"
    echo
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI is not installed. Please install it with: npm i -g vercel"
        echo "Installation: https://vercel.com/cli"
        exit 1
    fi
    
    # Check if user is logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        log_error "You are not logged in to Vercel. Please run: vercel login"
        exit 1
    fi
    
    # Check if dig is available for DNS testing
    if ! command -v dig &> /dev/null; then
        log_warning "dig is not installed. DNS testing will be limited."
    fi
    
    log_success "Prerequisites check passed"
}

# Add domain to Vercel
add_domain_to_vercel() {
    log_info "Adding domain to Vercel project..."
    
    # Add the domain
    if vercel domains add "$FULL_DOMAIN"; then
        log_success "Domain $FULL_DOMAIN added to Vercel"
    else
        log_error "Failed to add domain to Vercel"
        echo "This might be because:"
        echo "1. Domain is already added"
        echo "2. DNS records are not configured yet"
        echo "3. Domain verification is pending"
        return 1
    fi
    
    # Assign domain to project
    if vercel domains assign "$FULL_DOMAIN" "$VERCEL_PROJECT_NAME"; then
        log_success "Domain assigned to project: $VERCEL_PROJECT_NAME"
    else
        log_warning "Failed to assign domain to project (it might already be assigned)"
    fi
}

# Configure domain aliases
configure_domain_aliases() {
    log_info "Configuring domain aliases..."
    
    # Set up www subdomain if desired
    local www_domain="www.$FULL_DOMAIN"
    
    echo "Do you want to also configure www.$FULL_DOMAIN? (y/n)"
    read -r setup_www
    
    if [[ "$setup_www" =~ ^[Yy]$ ]]; then
        log_info "Adding www subdomain configuration..."
        
        echo "Add this CNAME record to your Squarespace DNS:"
        echo "Host: www"
        echo "Points to: cname.vercel-dns.com"
        echo "TTL: 300"
        echo
        
        # Add www domain to Vercel
        if vercel domains add "$www_domain"; then
            log_success "www subdomain added to Vercel"
        else
            log_warning "Failed to add www subdomain (it might already exist)"
        fi
        
        # Create redirect from www to non-www
        echo "Setting up redirect from www to non-www..."
        
        # This will be handled in vercel.json configuration
        log_info "Redirect configuration will be added to vercel.json"
    fi
}

# Update Vercel configuration
update_vercel_config() {
    log_info "Updating Vercel configuration..."
    
    # Backup existing vercel.json
    if [[ -f "vercel.json" ]]; then
        cp vercel.json vercel.json.backup
        log_info "Backed up existing vercel.json"
    fi
    
    # Update vercel.json with new domain
    if [[ -f "vercel.json" ]]; then
        # Update the existing vercel.json
        local temp_file=$(mktemp)
        
        # Use jq to update the domain configuration
        if command -v jq &> /dev/null; then
            jq --arg domain "$FULL_DOMAIN" '.alias = [$domain]' vercel.json > "$temp_file"
            mv "$temp_file" vercel.json
            log_success "Updated vercel.json with domain configuration"
        else
            log_warning "jq not found. Please manually update vercel.json"
            echo "Add this to your vercel.json:"
            echo "\"alias\": [\"$FULL_DOMAIN\"]"
        fi
    else
        log_warning "vercel.json not found. Creating basic configuration..."
        
        cat > vercel.json << EOF
{
  "version": 2,
  "name": "recipe-website",
  "alias": ["$FULL_DOMAIN"],
  "github": {
    "enabled": true,
    "autoAlias": true
  }
}
EOF
        log_success "Created basic vercel.json configuration"
    fi
}

# Update environment variables
update_environment_variables() {
    log_info "Updating environment variables..."
    
    # Update .env.example
    if [[ -f ".env.example" ]]; then
        # Update the site URL
        sed -i.bak "s|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://juliangilliatt.com|g" .env.example
        log_success "Updated .env.example with new domain"
    fi
    
    # Update next.config.js if needed
    if [[ -f "next.config.js" ]]; then
        log_info "Don't forget to update your next.config.js with the new domain"
        echo "Add '$FULL_DOMAIN' to the images.domains array if needed"
    fi
    
    # Set Vercel environment variables
    log_info "Setting Vercel environment variables..."
    
    vercel env add NEXT_PUBLIC_SITE_URL production <<< "https://$FULL_DOMAIN"
    vercel env add NEXT_PUBLIC_SITE_URL preview <<< "https://$FULL_DOMAIN"
    
    log_success "Environment variables updated"
}

# Test DNS configuration
test_dns_configuration() {
    log_info "Testing DNS configuration..."
    
    if command -v dig &> /dev/null; then
        log_info "Checking DNS records for $FULL_DOMAIN..."
        
        # Test A record
        local a_record
        a_record=$(dig +short A "$FULL_DOMAIN")
        
        if [[ -n "$a_record" ]]; then
            log_success "A record found: $a_record"
        else
            log_warning "No A record found for $FULL_DOMAIN"
        fi
        
        # Test CNAME record
        local cname_record
        cname_record=$(dig +short CNAME "$FULL_DOMAIN")
        
        if [[ -n "$cname_record" ]]; then
            log_success "CNAME record found: $cname_record"
        else
            log_warning "No CNAME record found for $FULL_DOMAIN"
        fi
        
        # Check if domain resolves
        if [[ -n "$a_record" || -n "$cname_record" ]]; then
            log_success "Domain DNS is configured"
        else
            log_warning "Domain DNS is not configured yet"
            echo "Please configure DNS records in Squarespace as shown above"
        fi
    else
        log_warning "Cannot test DNS - dig command not available"
    fi
}

# Test domain connectivity
test_domain_connectivity() {
    log_info "Testing domain connectivity..."
    
    local max_retries=3
    local retry_count=0
    
    while [[ $retry_count -lt $max_retries ]]; do
        if curl -f -s "https://$FULL_DOMAIN" > /dev/null 2>&1; then
            log_success "Domain is accessible via HTTPS"
            return 0
        else
            log_info "Domain not accessible yet, retrying... ($((retry_count + 1))/$max_retries)"
            sleep 5
            ((retry_count++))
        fi
    done
    
    log_warning "Domain is not accessible yet"
    echo "This is normal if DNS records were just configured"
    echo "DNS propagation can take 24-48 hours"
    return 1
}

# Generate SSL certificate info
check_ssl_certificate() {
    log_info "Checking SSL certificate status..."
    
    # Check if SSL certificate is provisioned
    if openssl s_client -connect "$FULL_DOMAIN:443" -servername "$FULL_DOMAIN" </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
        log_success "SSL certificate is valid and properly configured"
        
        # Get certificate details
        local cert_details
        cert_details=$(openssl s_client -connect "$FULL_DOMAIN:443" -servername "$FULL_DOMAIN" </dev/null 2>/dev/null | openssl x509 -noout -dates)
        
        if [[ -n "$cert_details" ]]; then
            echo "Certificate details:"
            echo "$cert_details"
        fi
    else
        log_warning "SSL certificate is not yet available"
        echo "Vercel will automatically provision SSL certificate"
        echo "This can take up to 24 hours after DNS configuration"
    fi
}

# Create deployment with custom domain
deploy_with_custom_domain() {
    log_info "Deploying with custom domain..."
    
    # Deploy to production with custom domain
    if vercel --prod --yes; then
        log_success "Deployed to production"
        
        # Check if domain is accessible
        if test_domain_connectivity; then
            log_success "Deployment successful! Your site is available at:"
            echo "🌐 https://$FULL_DOMAIN"
        else
            log_info "Deployment successful, but domain is not accessible yet"
            echo "Please wait for DNS propagation (24-48 hours)"
        fi
    else
        log_error "Deployment failed"
        return 1
    fi
}

# Generate domain configuration summary
generate_domain_summary() {
    log_info "Generating domain configuration summary..."
    
    local timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
    
    cat > domain-setup-summary.md << EOF
# Domain Setup Summary

**Domain:** $FULL_DOMAIN  
**Configured:** $timestamp  
**DNS Provider:** Squarespace  
**Hosting:** Vercel  

## DNS Configuration Required

Add these records to your Squarespace DNS settings:

### Option 1: CNAME Record (Recommended)
\`\`\`
Type: CNAME
Host: @ (root domain)
Points to: cname.vercel-dns.com
TTL: 300
\`\`\`

### Option 2: A Record (Alternative)
\`\`\`
Type: A
Host: @ (root domain)
Points to: 76.76.19.19
TTL: 300
\`\`\`

## Vercel Configuration

- ✅ Domain added to Vercel
- ✅ Domain assigned to project
- ✅ Environment variables updated
- ✅ SSL certificate will be auto-provisioned

## Next Steps

1. **Configure DNS in Squarespace:**
   - Go to squarespace.com → Settings → Domains
   - Select juliangilliatt.com
   - Click 'DNS Settings'
   - Add the CNAME record shown above

2. **Wait for DNS Propagation:**
   - DNS changes can take 24-48 hours
   - Test with: \`dig $FULL_DOMAIN\`

3. **Verify SSL Certificate:**
   - Vercel will auto-provision SSL
   - Check after DNS propagation

4. **Test Your Site:**
   - Visit: https://$FULL_DOMAIN
   - Verify all functionality works

## Support

- **Squarespace DNS Help:** https://support.squarespace.com/hc/en-us/articles/360002101888
- **Vercel Domain Help:** https://vercel.com/docs/projects/domains
- **DNS Testing:** https://www.whatsmydns.net/

## Configuration Files Updated

- vercel.json
- .env.example
- Environment variables in Vercel

---
*Generated by setup-domain.sh*
EOF

    log_success "Domain setup summary saved to: domain-setup-summary.md"
}

# Main function
main() {
    echo "🚀 Domain Setup for Recipe Website"
    echo "=================================="
    echo
    
    show_setup_instructions
    
    echo
    echo "Do you want to continue with the Vercel configuration? (y/n)"
    read -r continue_setup
    
    if [[ ! "$continue_setup" =~ ^[Yy]$ ]]; then
        log_info "Setup cancelled. Please configure DNS records manually."
        exit 0
    fi
    
    check_prerequisites
    add_domain_to_vercel
    configure_domain_aliases
    update_vercel_config
    update_environment_variables
    test_dns_configuration
    check_ssl_certificate
    generate_domain_summary
    
    echo
    echo "🎉 Domain setup process completed!"
    echo
    echo "📋 Next Steps:"
    echo "1. Configure DNS records in Squarespace (see domain-setup-summary.md)"
    echo "2. Wait for DNS propagation (24-48 hours)"
    echo "3. Deploy your site: npm run deploy"
    echo "4. Test your site: https://$FULL_DOMAIN"
    echo
    echo "📄 For detailed instructions, see: domain-setup-summary.md"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo "Options:"
        echo "  --test-dns    Test DNS configuration only"
        echo "  --test-ssl    Test SSL certificate only"
        echo "  --deploy      Deploy after domain setup"
        echo "  --help        Show this help message"
        exit 0
        ;;
    --test-dns)
        test_dns_configuration
        exit 0
        ;;
    --test-ssl)
        check_ssl_certificate
        exit 0
        ;;
    --deploy)
        deploy_with_custom_domain
        exit 0
        ;;
    *)
        main
        ;;
esac