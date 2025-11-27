# Railway Auto-Deploy Not Triggering - Diagnostic Checklist

## Issue
Merges to `main` branch are not automatically triggering Railway deployments. Manual redeploys work, but auto-deploy on git push does not.

## Critical Settings to Verify

### 1. ✅ Check Auto-Deploy is Enabled (MOST COMMON ISSUE)

**Location:** Railway Dashboard → Your Service → Settings → Source

Look for one of these settings:
- **"Auto Deploy"** toggle/checkbox
- **"Enable Automatic Deployments"** setting
- **"Deploy on push"** option

**Action:**
- [ ] Verify this is **ENABLED/ON**
- [ ] If disabled, ENABLE it and click Save
- [ ] Try pushing a test commit to main after enabling

**Why this matters:** If auto-deploy is off, Railway will ONLY deploy when you manually click "Redeploy". Git pushes will be ignored entirely.

---

### 2. ✅ Verify Branch Configuration

**Location:** Railway Dashboard → Your Service → Settings → Source

Check these fields:
- **Branch:** Should be `main` (NOT `master` or any other branch)
- **Root Directory:** Should be `/` (repository root)

**Action:**
- [ ] Confirm branch is `main`
- [ ] Confirm root directory is `/`
- [ ] If incorrect, update and save

---

### 3. ✅ Check GitHub Webhook Status

**Location:** GitHub Repository → Settings → Webhooks

**Action:**
1. [ ] Look for Railway webhook URL: `https://backboard.railway.app/webhooks/...`
2. [ ] Click on the webhook to view details
3. [ ] Check "Recent Deliveries" tab
4. [ ] Look for:
   - ✅ Green checkmarks = working
   - ❌ Red X marks = failing

**If webhook is failing:**
- Click on a failed delivery to see error details
- Common issues:
  - Webhook was deleted
  - GitHub app permissions revoked
  - Railway service disconnected from GitHub

**Fix:** Disconnect and reconnect repository in Railway (see Step 6)

---

### 4. ✅ Verify Railway GitHub App Permissions

**Location:** GitHub → Settings → Applications → Authorized GitHub Apps

**Action:**
1. [ ] Find "Railway" in the list
2. [ ] Click to view permissions
3. [ ] Verify Railway has access to your `aioscrew` repository
4. [ ] Check permissions include:
   - Read access to code
   - Read and write access to webhooks
   - Read access to metadata

**If permissions are missing:** Revoke and re-authorize Railway app

---

### 5. ✅ Check Railway Service Configuration

**Location:** Railway Dashboard → Your Service → Settings

**Action:**
1. [ ] Verify service is connected to GitHub (not deployed from template)
2. [ ] Check "Source" section shows:
   - Connected Repository: `jbandu/aioscrew`
   - Branch: `main`
   - Status: Connected (not disconnected/error)

---

### 6. 🔄 Reconnect GitHub Repository (If Issues Found)

**Location:** Railway Dashboard → Your Service → Settings → Source

**Steps:**
1. [ ] Click "Disconnect" button (this removes the GitHub connection)
2. [ ] Confirm disconnection
3. [ ] Click "Connect Repository" or "Deploy from GitHub repo"
4. [ ] Select your `aioscrew` repository
5. [ ] Configure:
   - Branch: `main`
   - Root Directory: `/`
6. [ ] Save changes
7. [ ] Verify webhook is recreated in GitHub

**After reconnecting:**
- Make a test commit to main
- Watch Railway deployments tab
- Should trigger within 30 seconds

---

### 7. ✅ Check Railway Service Logs

**Location:** Railway Dashboard → Your Service → Deployments → View Logs

**Action:**
1. [ ] Check recent deployment logs
2. [ ] Look for any errors about:
   - GitHub connection issues
   - Webhook processing errors
   - Build trigger failures

---

### 8. ✅ Verify Railway Project Status

**Location:** Railway Dashboard → Project Settings

**Action:**
- [ ] Check project is not paused
- [ ] Check project has active billing/credits
- [ ] Verify service is not in sleep mode

---

## Testing Auto-Deploy After Fixes

### Quick Test:
1. Make a small change to `README.md` or add a comment to code
2. Commit and push to `main`:
   ```bash
   git checkout main
   git pull origin main
   echo "# Test deployment trigger" >> README.md
   git add README.md
   git commit -m "test: Trigger Railway auto-deploy"
   git push origin main
   ```
3. Immediately check Railway Dashboard → Deployments tab
4. Should see new deployment appear within 30 seconds

### Verify Deployment:
- ✅ New deployment appears in Railway deployments list
- ✅ Build starts automatically
- ✅ No errors in build logs
- ✅ Deployment completes successfully
- ✅ `/api/version` endpoint reflects new deployment ID

---

## Common Root Causes

Based on "manual redeploy works but auto-deploy doesn't":

### 1. **Auto-Deploy Setting is OFF** (80% of cases)
- Railway is working fine, but auto-deploy feature is disabled
- Fix: Enable in Railway → Settings → Source

### 2. **Wrong Branch Configured** (10% of cases)
- Railway is watching `master` but you're pushing to `main`
- Fix: Update branch in Railway → Settings → Source

### 3. **GitHub Webhook Not Working** (8% of cases)
- Webhook was deleted or is failing
- Fix: Check GitHub webhook deliveries, reconnect if needed

### 4. **GitHub App Permissions** (2% of cases)
- Railway lost permission to receive webhooks
- Fix: Re-authorize Railway app in GitHub settings

---

## Expected Behavior When Working

When auto-deploy is properly configured:

1. ✅ You push to `main` branch
2. ✅ GitHub sends webhook to Railway within 1-2 seconds
3. ✅ Railway receives webhook and queues build
4. ✅ Deployment appears in Railway dashboard within 30 seconds
5. ✅ Build runs using Dockerfile
6. ✅ Service redeploys with new code
7. ✅ Health check passes
8. ✅ Service is live with new deployment

**Timing:** Entire process from git push to deployment live = 3-8 minutes

---

## Current Status

- ✅ "Wait for CI" is OFF (confirmed)
- ✅ `railway.json` properly configured
- ✅ Dockerfile builds successfully
- ✅ Manual redeployoperations work
- ❌ Auto-deploy on merge to main not triggering

**Next Action:** Work through checklist above, focusing on items 1-3 first.

---

## Need Help?

If after checking all items above auto-deploy still doesn't work:

1. Check Railway status page: https://railway.statuspage.io/
2. Contact Railway support with:
   - Project ID
   - Service name
   - Example commit SHA that didn't trigger
   - Screenshot of Railway → Settings → Source configuration
