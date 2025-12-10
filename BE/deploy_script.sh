#!/bin/bash
# Render deployment script for importing data

echo "🚀 Starting data import on Render..."

# Extract data package
unzip -o production_data.zip -d exported_data/

# Run import script
python import_data.py

echo "✅ Data import completed!"
