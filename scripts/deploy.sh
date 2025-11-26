#!/bin/bash

# ============================================
# Deployment Automation Script
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================
# Pre-deployment Checks
# ============================================

print_header "Pre-deployment Checks"

# Check Git
if ! command_exists git; then
    print_error "Git is not installed"
    exit 1
fi
print_success "Git is installed"

# Check if on correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    print_warning "You are not on main/master branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes"
    git status -s
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check Node.js
if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
fi
print_success "Node.js is installed ($(node --version))"

# Check Python
if ! command_exists python3; then
    print_error "Python 3 is not installed"
    exit 1
fi
print_success "Python 3 is installed ($(python3 --version))"

# ============================================
# Backend Deployment
# ============================================

print_header "Backend Deployment"

cd BE

# Check if .env exists
if [ ! -f .env ]; then
    print_error ".env file not found in BE directory"
    exit 1
fi
print_success ".env file found"

# Install dependencies
print_info "Installing Python dependencies..."
pip install -r requirements.txt --quiet
print_success "Dependencies installed"

# Run tests
print_info "Running backend tests..."
if python manage.py test --no-input; then
    print_success "All tests passed"
else
    print_error "Tests failed"
    read -p "Continue deployment anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check migrations
print_info "Checking for pending migrations..."
if python manage.py makemigrations --dry-run --check; then
    print_success "No pending migrations"
else
    print_warning "Pending migrations detected"
    python manage.py makemigrations
fi

# Collect static files
print_info "Collecting static files..."
python manage.py collectstatic --no-input --clear
print_success "Static files collected"

cd ..

# ============================================
# Frontend Deployment
# ============================================

print_header "Frontend Deployment"

cd FE

# Check if .env exists
if [ ! -f .env ]; then
    print_warning ".env file not found, using .env.example"
    if [ -f .env.example ]; then
        cp .env.example .env
    fi
fi

# Install dependencies
print_info "Installing Node.js dependencies..."
npm install --silent
print_success "Dependencies installed"

# Run linter
print_info "Running ESLint..."
if npm run lint; then
    print_success "No linting errors"
else
    print_warning "Linting errors found"
fi

# Build frontend
print_info "Building frontend..."
if npm run build; then
    print_success "Frontend built successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

# Check build size
BUILD_SIZE=$(du -sh dist | cut -f1)
print_info "Build size: $BUILD_SIZE"

cd ..

# ============================================
# Git Operations
# ============================================

print_header "Git Operations"

# Add all changes
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    print_info "No changes to commit"
else
    # Commit changes
    print_info "Committing changes..."
    read -p "Enter commit message: " COMMIT_MSG
    git commit -m "$COMMIT_MSG"
    print_success "Changes committed"
fi

# Push to remote
print_info "Pushing to remote..."
if git push origin $CURRENT_BRANCH; then
    print_success "Pushed to remote"
else
    print_error "Failed to push to remote"
    exit 1
fi

# ============================================
# Deployment Status
# ============================================

print_header "Deployment Status"

echo ""
print_success "Deployment process completed!"
echo ""
print_info "Next steps:"
echo "  1. Check Render dashboard for backend deployment status"
echo "  2. Check Vercel dashboard for frontend deployment status"
echo "  3. Monitor logs for any errors"
echo "  4. Test the production URLs"
echo ""
print_info "Backend URL: https://recruitment-api.onrender.com"
print_info "Frontend URL: https://recruitment.vercel.app"
echo ""

# ============================================
# Post-deployment Checks
# ============================================

print_header "Post-deployment Checks"

# Wait for deployment
print_info "Waiting 30 seconds for deployment to complete..."
sleep 30

# Check backend health
print_info "Checking backend health..."
BACKEND_URL="https://recruitment-api.onrender.com/api/health/"
if curl -f -s -o /dev/null "$BACKEND_URL"; then
    print_success "Backend is healthy"
else
    print_warning "Backend health check failed (might still be deploying)"
fi

# Check frontend
print_info "Checking frontend..."
FRONTEND_URL="https://recruitment.vercel.app"
if curl -f -s -o /dev/null "$FRONTEND_URL"; then
    print_success "Frontend is accessible"
else
    print_warning "Frontend check failed (might still be deploying)"
fi

echo ""
print_success "Deployment script completed!"
echo ""
