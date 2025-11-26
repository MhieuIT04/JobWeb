#!/bin/bash

# ============================================
# Local Development Setup Script
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================
# Check Prerequisites
# ============================================

print_header "Checking Prerequisites"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed"
    exit 1
fi
print_success "Python 3 is installed ($(python3 --version))"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_success "Node.js is installed ($(node --version))"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm is installed ($(npm --version))"

# Check PostgreSQL (optional)
if command -v psql &> /dev/null; then
    print_success "PostgreSQL is installed ($(psql --version))"
else
    print_info "PostgreSQL not found (will use SQLite for development)"
fi

# ============================================
# Backend Setup
# ============================================

print_header "Setting up Backend"

cd BE

# Create virtual environment
if [ ! -d "venv" ]; then
    print_info "Creating virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_info "Virtual environment already exists"
fi

# Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate || source venv/Scripts/activate

# Upgrade pip
print_info "Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies
print_info "Installing Python dependencies..."
pip install -r requirements.txt --quiet
print_success "Dependencies installed"

# Create .env file if not exists
if [ ! -f .env ]; then
    print_info "Creating .env file from .env.example..."
    cp .env.example .env
    print_success ".env file created"
    print_info "Please update .env file with your configuration"
else
    print_info ".env file already exists"
fi

# Run migrations
print_info "Running database migrations..."
python manage.py migrate
print_success "Migrations completed"

# Create superuser
print_info "Creating superuser..."
echo "Please enter superuser credentials:"
python manage.py createsuperuser || print_info "Superuser already exists or skipped"

# Collect static files
print_info "Collecting static files..."
python manage.py collectstatic --no-input
print_success "Static files collected"

cd ..

# ============================================
# Frontend Setup
# ============================================

print_header "Setting up Frontend"

cd FE

# Create .env file if not exists
if [ ! -f .env ]; then
    print_info "Creating .env file from .env.example..."
    cp .env.example .env
    print_success ".env file created"
else
    print_info ".env file already exists"
fi

# Install dependencies
print_info "Installing Node.js dependencies..."
npm install
print_success "Dependencies installed"

cd ..

# ============================================
# Setup Complete
# ============================================

print_header "Setup Complete!"

echo ""
print_success "Local development environment is ready!"
echo ""
print_info "To start the development servers:"
echo ""
echo "  Backend:"
echo "    cd BE"
echo "    source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "    python manage.py runserver"
echo ""
echo "  Frontend:"
echo "    cd FE"
echo "    npm run dev"
echo ""
print_info "Backend will run on: http://127.0.0.1:8000"
print_info "Frontend will run on: http://localhost:5173"
print_info "Admin panel: http://127.0.0.1:8000/admin/"
echo ""
