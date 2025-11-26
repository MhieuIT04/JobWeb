#!/bin/bash

# ============================================
# Database Backup Script
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

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
# Configuration
# ============================================

# Load environment variables
if [ -f BE/.env ]; then
    export $(cat BE/.env | grep -v '^#' | xargs)
fi

# Backup directory
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# ============================================
# Backup Database
# ============================================

print_info "Starting database backup..."

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL not found in environment"
    exit 1
fi

# Parse DATABASE_URL
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

print_info "Database: $DB_NAME"
print_info "Host: $DB_HOST"
print_info "Port: $DB_PORT"

# Perform backup
export PGPASSWORD=$DB_PASS
if pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE; then
    print_success "Backup created: $BACKUP_FILE"
    
    # Get file size
    FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    print_info "Backup size: $FILE_SIZE"
    
    # Compress backup
    print_info "Compressing backup..."
    gzip $BACKUP_FILE
    print_success "Backup compressed: $BACKUP_FILE.gz"
    
    # Remove old backups (keep last 7 days)
    print_info "Cleaning old backups..."
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
    print_success "Old backups cleaned"
    
else
    print_error "Backup failed"
    exit 1
fi

# ============================================
# Upload to Cloud (Optional)
# ============================================

# Uncomment to upload to AWS S3
# print_info "Uploading to S3..."
# aws s3 cp $BACKUP_FILE.gz s3://your-bucket/backups/
# print_success "Uploaded to S3"

# Uncomment to upload to Google Cloud Storage
# print_info "Uploading to GCS..."
# gsutil cp $BACKUP_FILE.gz gs://your-bucket/backups/
# print_success "Uploaded to GCS"

print_success "Backup completed successfully!"
