# Railway Deployment Setup - Fix Guide

## Current Issue

Your Railway deployment is showing JSON health info instead of the React frontend because:
1. The deployment is using old code (before the frontend serving was added)
2. You have redundant/misconfigured services

## Your Current Architecture

This project uses a **monolithic deployment** where:
- ✅ One Docker container serves BOTH frontend and backend
- ✅ Backend API is at `/api/agents/*`
- ✅ Frontend React app is at `/` (root) and all other routes
- ✅ Health check is at `/health`

## Railway Services You Have

Based on your screenshot, you have:
1. **"aioscrew frontend"** - ✅ Successful (35 mins ago)
2. **"crewaios backend"** - ❌ Failing repeatedly

## The Problem

The **"aioscrew frontend"** service is likely:
- Connected to the wrong branch (not the latest code)
- Or cached and needs redeployment

The **"crewaios backend"** service is:
- Redundant (you don't need it with the monolithic setup)
- Should be deleted or disabled

## Fix Steps

### Step 1: Update "aioscrew frontend" Service

1. Go to your Railway dashboard
2. Click on **"aioscrew frontend"** service
3. Go to **Settings** tab
4. Under **Source** section, check:
   - ✅ **Branch**: Should be connected to `main` or your main branch with latest code
   - ✅ **Root Directory**: Should be empty (uses repository root)

5. Under **Build** section, verify:
   - ✅ **Builder**: Dockerfile
   - ✅ **Dockerfile Path**: `backend/Dockerfile`
   - ✅ **Build Context**: `.` (root directory)

6. Under **Deploy** section:
   - ✅ **Healthcheck Path**: `/health`

### Step 2: Trigger Fresh Deployment

Two options:

**Option A: Merge this branch to main**
```bash
# Create a PR and merge this branch to main
# Railway will auto-deploy when main is updated
```

**Option B: Redeploy from Railway Dashboard**
1. Go to the "aioscrew frontend" service
2. Click on the latest deployment
3. Click **"Redeploy"** button
4. Or change the branch to this current branch: `claude/setup-aioscrew-backend-01WBGYC6rbQyG3UFXBcrJuEm`

### Step 3: Delete or Disable "crewaios backend" Service

Since the monolithic setup serves both frontend and backend, you don't need this separate service:

1. Go to **"crewaios backend"** service
2. Go to **Settings** tab
3. Scroll to bottom
4. Click **"Delete service"**

**OR** if you want to keep it for later:
- Just let it keep failing (it won't affect your app)
- You can fix it later if needed

## Verification

After deploying, check these URLs:

1. **Root URL** → Should show React app with landing page
   ```
   https://aioscrew-production.up.railway.app/
   ```

2. **Health Check** → Should return JSON health status
   ```
   https://aioscrew-production.up.railway.app/health
   ```

3. **API Endpoints** → Should work for POST requests
   ```
   https://aioscrew-production.up.railway.app/api/agents/health
   https://aioscrew-production.up.railway.app/api/agents/validate
   ```

## Expected Results

✅ Root URL (`/`) shows: **React app with "Airline Crew Operating System" landing page**
✅ Health endpoint (`/health`) shows: `{"status":"healthy","timestamp":"..."}`
✅ API endpoints (`/api/agents/*`) work correctly
✅ Single Railway service handles everything

## What We Fixed

1. ✅ **Improved error handling** - Added callback to catch errors when serving index.html
2. ✅ **Better logging** - Added console.log to show where static files are served from
3. ✅ **Enhanced comments** - Made routing logic clearer
4. ✅ **Removed old JSON endpoint** - (Was removed in previous commits, but ensured it's gone)

## Next Steps

1. **Option 1**: Create a PR to merge this branch to main, then Railway auto-deploys
2. **Option 2**: Configure Railway to deploy from this branch directly
3. Verify the deployment works
4. Delete the redundant "crewaios backend" service

## Need Help?

If you're still seeing issues after deployment:
1. Check Railway deployment logs for errors
2. Verify the build completed successfully
3. Check that the `/public` directory was created in the Docker container
4. Ensure environment variables are set (ANTHROPIC_API_KEY, DATABASE_URL, etc.)
