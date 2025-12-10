#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Starting build process..."

# Install Python dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations
echo "🗄️  Running migrations..."
python manage.py migrate --no-input

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --no-input

# Create superuser automatically
echo "👤 Ensuring superuser exists..."
python manage.py ensure_superuser

# Seed initial data
echo "🌱 Seeding initial data..."
python manage.py seed_initial_data

# Import production data if available
echo "📦 Importing production data..."
if [ -f "production_data.zip" ]; then
    echo "🚀 Found production data, starting import..."
    python manage.py import_production_data
else
    echo "⚠️  Production data not found, creating sample users..."
    if [ -f "quick_import.py" ]; then
        python quick_import.py
    fi
fi

echo "✅ Build completed successfully!"
