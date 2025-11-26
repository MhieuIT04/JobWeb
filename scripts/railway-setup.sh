#!/bin/bash

# ============================================
# Railway Setup Script
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================
# Check Prerequisites
# ============================================

print_header "Checking Prerequisites"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_success "Node.js is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm is installed"

# ============================================
# Install Railway CLI
# ============================================

print_header "Installing Railway CLI"

if ! command -v railway &> /dev/null; then
    print_info "Installing Railway CLI..."
    npm install -g @railway/cli
    print_success "Railway CLI installed"
else
    print_info "Railway CLI already installed"
fi

# ============================================
# Login to Railway
# ============================================

print_header "Railway Login"

print_info "Please login to Railway..."
railway login

if [ $? -eq 0 ]; then
    print_success "Logged in successfully"
else
    print_error "Login failed"
    exit 1
fi

# ============================================
# Create New Project or Link Existing
# ============================================

print_header "Project Setup"

echo ""
echo "Choose an option:"
echo "1. Create new Railway project"
echo "2. Link to existing project"
read -p "Enter choice (1 or 2): " CHOICE

if [ "$CHOICE" == "1" ]; then
    print_info "Creating new project..."
    railway init
    print_success "Project created"
elif [ "$CHOICE" == "2" ]; then
    print_info "Linking to existing project..."
    railway link
    print_success "Project linked"
else
    print_error "Invalid choice"
    exit 1
fi

# ============================================
# Add PostgreSQL
# ============================================

print_header "Database Setup"

read -p "Add PostgreSQL database? (y/n): " ADD_DB

if [[ $ADD_DB =~ ^[Yy]$ ]]; then
    print_info "Adding PostgreSQL..."
    railway add --database postgres
    print_success "PostgreSQL added"
    
    print_info "Waiting for database to be ready..."
    sleep 10
    
    # Enable pgvector
    print_info "Enabling pgvector extension..."
    railway run psql \$DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"
    print_success "pgvector enabled"
fi

# ============================================
# Set Environment Variables
# ============================================

print_header "Environment Variables"

print_info "Setting up environment variables..."

# Read from .env.example
if [ -f "BE/.env.example" ]; then
    print_info "Found .env.example, setting variables..."
    
    # Django settings
    railway variables set SECRET_KEY=$(openssl rand -base64 32)
    railway variables set DEBUG=False
    railway variables set ALLOWED_HOSTS=.railway.app
    railway variables set PYTHONUNBUFFERED=1
    
    print_success "Basic variables set"
    
    print_warning "Please set these variables manually in Railway dashboard:"
    echo "  - CLOUDINARY_CLOUD_NAME"
    echo "  - CLOUDINARY_API_KEY"
    echo "  - CLOUDINARY_API_SECRET"
    echo "  - CORS_ALLOWED_ORIGINS"
    echo "  - JWT_SECRET_KEY"
    echo "  - EMAIL_HOST_USER (optional)"
    echo "  - EMAIL_HOST_PASSWORD (optional)"
    echo "  - OPENAI_API_KEY (optional)"
else
    print_warning ".env.example not found"
fi

# ============================================
# Deploy
# ============================================

print_header "Deployment"

read -p "Deploy now? (y/n): " DEPLOY_NOW

if [[ $DEPLOY_NOW =~ ^[Yy]$ ]]; then
    print_info "Deploying to Railway..."
    railway up
    
    if [ $? -eq 0 ]; then
        print_success "Deployment successful"
        
        # Run migrations
        print_info "Running migrations..."
        railway run python manage.py migrate
        
        # Create superuser
        print_info "Create superuser..."
        railway run python manage.py createsuperuser
        
    else
        print_error "Deployment failed"
        exit 1
    fi
fi

# ============================================
# Get URLs
# ============================================

print_header "Deployment Information"

print_info "Getting deployment URLs..."
BACKEND_URL=$(railway domain)

echo ""
print_success "Setup completed!"
echo ""
print_info "Backend URL: https://$BACKEND_URL"
print_info "Admin Panel: https://$BACKEND_URL/admin/"
echo ""
print_info "Next steps:"
echo "  1. Set remaining environment variables in Railway dashboard"
echo "  2. Update CORS_ALLOWED_ORIGINS with your frontend URL"
echo "  3. Deploy frontend to Vercel with VITE_API_URL=https://$BACKEND_URL"
echo "  4. Test the application"
echo ""
print_info "Useful commands:"
echo "  railway logs          - View logs"
echo "  railway run <cmd>     - Run command in Railway environment"
echo "  railway open          - Open Railway dashboard"
echo "  railway status        - Check deployment status"
echo ""
