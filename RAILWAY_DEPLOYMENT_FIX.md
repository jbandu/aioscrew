# Railway Deployment Not Triggering - Fix Guide

## Problem
Merges to `main` branch are not triggering builds on Railway.

## Root Causes & Solutions

### Issue 1: "Wait for CI" Setting

**Problem:** Railway is configured to wait for GitHub Actions CI to complete before deploying. If CI doesn't complete successfully or Railway doesn't detect completion, deployments won't trigger.

**Solution Options:**

#### Option A: Disable "Wait for CI" (Recommended for faster deployments)
1. Go to Railway Dashboard → Your Service → Settings → Source
2. **Uncheck** "Wait for CI" checkbox
3. Railway will deploy immediately when changes are pushed to `main`

#### Option B: Keep "Wait for CI" but ensure CI completes
1. Check GitHub Actions tab to ensure workflows complete successfully
2. Verify Railway can detect GitHub Actions completion (may require reconnecting GitHub)
3. If CI is failing, fix the workflow issues first

### Issue 2: Watch Paths Not Configured

**Problem:** Railway might not detect changes if watch paths aren't configured.

**Solution:** Already fixed in `railway.json` with watch patterns:
- `backend/**` - All backend changes
- `src/**` - All frontend changes  
- `package.json` and `package-lock.json` - Dependency changes
- `railway.json` - Config changes

### Issue 3: GitHub Integration Issues

**Problem:** Railway might not be properly connected to GitHub or detecting pushes.

**Solution:**
1. Go to Railway Dashboard → Your Service → Settings → Source
2. Click "Disconnect" then reconnect your GitHub repository
3. Ensure the branch is set to `main`
4. Verify the root directory is `/` (repository root)

### Issue 4: Railway Config File Not Being Used

**Problem:** Railway might not be reading `railway.json` if it's not in the root directory.

**Solution:** 
- ✅ `railway.json` is already in the root directory
- Railway should automatically detect and use it

## Quick Fix Steps

1. **Disable "Wait for CI"** (fastest solution):
   - Railway Dashboard → Service → Settings → Source
   - Uncheck "Wait for CI"
   - Save changes

2. **Verify watch paths** (already configured):
   - Check that Railway is using the `railway.json` config
   - Watch paths are now configured in the config file

3. **Test deployment**:
   - Make a small change to `main` branch
   - Push to GitHub
   - Check Railway deployments tab - should trigger automatically

4. **If still not working**:
   - Reconnect GitHub repository in Railway settings
   - Check Railway logs for any errors
   - Verify GitHub Actions are completing successfully

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
