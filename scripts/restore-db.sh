#!/bin/bash

# ============================================
# Database Restore Script
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

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
# Configuration
# ============================================

# Load environment variables
if [ -f BE/.env ]; then
    export $(cat BE/.env | grep -v '^#' | xargs)
fi

# Check if backup file is provided
if [ -z "$1" ]; then
    print_error "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh backups/backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# ============================================
# Warning
# ============================================

print_warning "WARNING: This will REPLACE the current database!"
print_warning "All existing data will be lost!"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_info "Restore cancelled"
    exit 0
fi

# ============================================
# Restore Database
# ============================================

print_info "Starting database restore..."

# Extract database connection details
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL not found in environment"
    exit 1
fi

DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

print_info "Database: $DB_NAME"
print_info "Host: $DB_HOST"

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    print_info "Decompressing backup..."
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c $BACKUP_FILE > $TEMP_FILE
    RESTORE_FILE=$TEMP_FILE
else
    RESTORE_FILE=$BACKUP_FILE
fi

# Drop existing connections
print_info "Dropping existing connections..."
export PGPASSWORD=$DB_PASS
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" || true

# Drop and recreate database
print_info "Recreating database..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"

# Restore backup
print_info "Restoring backup..."
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $RESTORE_FILE; then
    print_success "Database restored successfully"
else
    print_error "Restore failed"
    exit 1
fi

# Clean up temp file
if [ "$RESTORE_FILE" != "$BACKUP_FILE" ]; then
    rm $RESTORE_FILE
fi

# Run migrations (in case schema changed)
print_info "Running migrations..."
cd BE
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null || true
python manage.py migrate
cd ..

print_success "Restore completed successfully!"
