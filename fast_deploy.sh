#!/bin/bash

echo "🚀 FAST DEPLOY TO RENDER"
echo "========================"

# Check if there are changes
if git diff --quiet && git diff --staged --quiet; then
    echo "⚠️  No changes detected. Skipping deploy."
    exit 0
fi

# Quick commit
echo "📝 Quick commit..."
git add -A
git commit -m "Fast deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to trigger deploy
echo "🚀 Pushing to trigger Render deploy..."
git push origin main

echo "✅ Deploy triggered!"
echo "🔗 Check status: https://dashboard.render.com"
echo "⏱️  Expected build time: ~2-3 minutes"