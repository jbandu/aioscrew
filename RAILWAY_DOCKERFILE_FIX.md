# Railway Dockerfile Builder Fix

## Issue
Railway is using Railpack (automatic Node.js detection) instead of the Dockerfile builder specified in `railway.json`.

## Solution: Force Dockerfile Usage in Railway UI

Since Railway may ignore `railway.json` in some cases, you need to configure it explicitly in the Railway dashboard:

### Steps to Fix:

1. **Go to Railway Dashboard**
   - Navigate to your project
   - Click on the service that's deploying

2. **Open Settings Tab**
   - Click on **Settings** in the service

3. **Configure Build Settings**
   - Scroll to **Build** section
   - Set **Builder** to: `Dockerfile`
   - Set **Dockerfile Path** to: `backend/Dockerfile`
   - Set **Build Context** to: `.` (root directory)

4. **Configure Build Arguments** (if needed)
   - Add build args:
     - `VITE_DATABASE_URL` = `${{DATABASE_URL}}`
     - `VITE_API_URL` = `https://${{RAILWAY_PUBLIC_DOMAIN}}`

5. **Save and Redeploy**
   - Click **Save**
   - Trigger a new deployment

## Alternative: Use Railpack (If Dockerfile Doesn't Work)

If you prefer to use Railpack, ensure your root `package.json` has the correct scripts (which it does):

- ✅ `build`: `npm run build:backend && vite build`
- ✅ `start`: `node backend/dist/server.js`

Railpack should work with this configuration, but Dockerfile is recommended for more control.

## Verify Configuration

After updating, check the deployment logs. You should see:
- Docker build steps instead of Railpack steps
- References to `backend/Dockerfile`
- Multi-stage build process (backend-builder, frontend-builder, production)

## Current railway.json

Your `railway.json` is correctly configured:
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile",
    "buildContext": "."
  }
}
```

Railway should respect this, but UI settings may override it.
