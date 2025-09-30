#!/bin/bash

# Fund Data Cache Deployment Script
echo "🚀 Deploying Fund Data Cache System..."

# Apply database migration
echo "📊 Applying database migration..."
supabase db push

# Deploy edge functions
echo "⚡ Deploying edge functions..."
supabase functions deploy update-fund-data-cache
supabase functions deploy get-cached-fund-data

# Test the cache update function
echo "🧪 Testing cache update function..."
echo "You can manually trigger a cache update with:"
echo "curl -X POST -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' -H 'Content-Type: application/json' -d '{}' YOUR_SUPABASE_URL/functions/v1/update-fund-data-cache"

echo "✅ Fund Data Cache System deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Verify GEMINI_API_KEY is set in Supabase environment variables"
echo "2. Test the watchlist page to ensure it's reading from cache"
echo "3. Manually trigger cache update to populate initial data"
echo "4. Set up external scheduling (cron, etc.) if needed for automatic updates"

