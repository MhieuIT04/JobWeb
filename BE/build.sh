#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Starting FAST build process..."

# Install Python dependencies (no upgrade pip for speed)
echo "📦 Installing dependencies..."
pip install --no-cache-dir -r requirements.txt

# Run database migrations
echo "🗄️  Running migrations..."
python manage.py migrate --no-input

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --no-input

# Create superuser automatically
echo "👤 Ensuring superuser exists..."
python manage.py ensure_superuser

# Seed initial data (with skip check)
echo "🌱 Seeding initial data..."
python manage.py seed_initial_data

# SKIP production data import for faster builds
echo "⚡ Skipping production data import for speed"
echo "   (Data already exists from previous deploy)"

echo "✅ FAST build completed in ~2 minutes!"
