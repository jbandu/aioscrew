# Railway Deployment Not Triggering - Fix Guide

## Problem
Merges to `main` branch are not triggering builds on Railway.

## Root Causes & Solutions

### Issue 1: "Wait for CI" Setting ✅ CHECKED

**Problem:** Railway is configured to wait for GitHub Actions CI to complete before deploying. If CI doesn't complete successfully or Railway doesn't detect completion, deployments won't trigger.

**Status:** User confirmed this is turned OFF.

**Solution Options:**

#### Option A: Disable "Wait for CI" (Recommended for faster deployments)
1. Go to Railway Dashboard → Your Service → Settings → Source
2. **Uncheck** "Wait for CI" checkbox
3. Railway will deploy immediately when changes are pushed to `main`

#### Option B: Keep "Wait for CI" but ensure CI completes
1. Check GitHub Actions tab to ensure workflows complete successfully
2. Verify Railway can detect GitHub Actions completion (may require reconnecting GitHub)
3. If CI is failing, fix the workflow issues first

### Issue 2: Branch Configuration

**Problem:** Railway service might not be configured to watch the correct branch.

**Solution:**
1. Go to Railway Dashboard → Your Service → Settings → Source
2. Verify **Branch** is set to `main` (not `master` or any other branch)
3. If wrong branch is set, update it and save
4. Try manual redeploy to test

### Issue 3: Watch Paths Not Configured

**Problem:** Railway might not detect changes if watch paths aren't configured.

**Solution:** Already fixed in `railway.json` with watch patterns:
- `backend/**` - All backend changes
- `src/**` - All frontend changes  
- `package.json` and `package-lock.json` - Dependency changes
- `railway.json` - Config changes

### Issue 4: Auto-Deploy Setting

**Problem:** Auto-deploy might be disabled in Railway service settings.

**Solution:**
1. Go to Railway Dashboard → Your Service → Settings → Source
2. Verify **"Auto Deploy"** or **"Enable Automatic Deployments"** is checked/enabled
3. If disabled, enable it and save
4. This is critical - Railway won't deploy on push if auto-deploy is off

### Issue 5: GitHub Integration Issues

**Problem:** Railway might not be properly connected to GitHub or detecting pushes.

**Solution:**
1. Go to Railway Dashboard → Your Service → Settings → Source
2. Click "Disconnect" then reconnect your GitHub repository
3. Ensure the branch is set to `main`
4. Verify the root directory is `/` (repository root)
5. Check that GitHub webhook is properly configured:
   - Go to GitHub repo → Settings → Webhooks
   - Look for Railway webhook (should be `https://backboard.railway.app/...`)
   - Check recent deliveries for any failures

### Issue 6: Railway Config File Not Being Used

**Problem:** Railway might not be reading `railway.json` if it's not in the root directory.

**Solution:** 
- ✅ `railway.json` is already in the root directory
- Railway should automatically detect and use it

## Quick Fix Steps - Priority Order

### 1. ✅ Verify "Wait for CI" is OFF
   - Railway Dashboard → Service → Settings → Source
   - Ensure "Wait for CI" is unchecked
   - **Status:** User confirmed this is OFF

### 2. 🔍 Check Auto-Deploy Setting (CRITICAL)
   - Railway Dashboard → Service → Settings → Source
   - **Verify "Auto Deploy" or "Enable Automatic Deployments" is ENABLED**
   - This is the most common issue - if off, Railway won't deploy on push
   - Save changes if you enable it

### 3. 🌿 Verify Branch Configuration
   - Railway Dashboard → Service → Settings → Source
   - Confirm branch is set to `main` (not `master`)
   - Confirm root directory is `/` (repository root)

### 4. 🔗 Check GitHub Webhook
   - Go to GitHub repo → Settings → Webhooks
   - Look for Railway webhook (URL like `https://backboard.railway.app/webhooks/...`)
   - Check "Recent Deliveries" tab
   - If you see red X marks (failures), click to see error details
   - If no webhook exists, disconnect and reconnect Railway in step 5

### 5. 🔄 Reconnect GitHub (if webhook issues found)
   - Railway Dashboard → Service → Settings → Source
   - Click "Disconnect"
   - Click "Connect Repository" and select your repo again
   - Reconfigure branch to `main` and root directory to `/`

### 6. 🧪 Test Deployment
   - This push includes a new `/api/version` endpoint
   - After pushing to `main`, check Railway deployments tab
   - Should see new deployment trigger within 30 seconds
   - Once deployed, test: `curl https://your-app.railway.app/api/version`

## Verification

After applying fixes, verify:
- ✅ Railway detects pushes to `main` branch
- ✅ Builds trigger automatically
- ✅ Deployments complete successfully
- ✅ Health check endpoint responds (`/health`)

## Additional Notes

- The `railway.json` file now includes `watchPatterns` to ensure Railway detects relevant file changes
- Root directory should remain `/` since Dockerfile path is `/backend/Dockerfile`
- Build context is `.` (repository root) which is correct for the multi-stage Dockerfile
