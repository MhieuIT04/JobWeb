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
echo "👤 Creating superuser..."
python create_superuser.py

# Seed initial data
echo "🌱 Seeding initial data..."
python seed_data.py

echo "✅ Build completed successfully!"
