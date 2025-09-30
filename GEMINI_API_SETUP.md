# Gemini API Setup Guide

## Issue
Your watchlist page is showing a 404 error from the Gemini API. This is likely due to:
1. Missing or invalid `GEMINI_API_KEY` environment variable
2. Using deprecated model `gemini-1.5-pro` (now updated to `gemini-1.5-flash`)

## Solution

### Step 1: Get a Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" in the left sidebar
4. Create a new API key
5. Copy the API key

### Step 2: Set Environment Variable in Supabase
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Add the environment variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your API key from Step 1
4. Click **Save**

### Step 3: Deploy Updated Functions
The functions have been updated to use `gemini-1.5-flash` instead of the deprecated `gemini-1.5-pro`. Deploy them:

```bash
# Deploy the updated functions
supabase functions deploy fetch-fund-data
supabase functions deploy populate-fund-schemes
```

### Step 4: Test the Watchlist
1. Go to your watchlist page
2. The page should now load with either:
   - Real fund data from Gemini API (if API key is working)
   - Mock data fallback (if API key is still not configured)

## Fallback System
The watchlist page now includes a fallback system that will show mock fund data if the Gemini API is unavailable. This ensures your users can still use the watchlist feature even if there are API issues.

## Troubleshooting
- **403 Error**: API key doesn't have proper permissions
- **404 Error**: Model not found (should be fixed with the update)
- **429 Error**: Rate limit exceeded
- **Mock Data Showing**: API key not configured or API is down

## Alternative: Use Local Fund Data
If you prefer not to use the Gemini API, you can modify the watchlist to use your local fund database instead of the AI-generated data.
