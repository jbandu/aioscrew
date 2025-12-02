# E2E Test Suite for Aioscrew

Comprehensive end-to-end testing suite for the Aioscrew AI-powered crew management platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Demo Scripts](#demo-scripts)
- [Test Scenarios](#test-scenarios)
- [CI/CD Integration](#cicd-integration)
- [Writing New Tests](#writing-new-tests)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This test suite uses **Playwright** to provide comprehensive end-to-end testing for:

- ✅ All 7 role-based dashboards
- ✅ AI validation pipeline (3 parallel agents)
- ✅ Claim submission and approval workflows
- ✅ API integration tests
- ✅ Real-time updates via WebSocket
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Error handling and edge cases

### Test Coverage

| Test Suite | Files | Tests | Focus Area |
|------------|-------|-------|------------|
| Smoke Tests | `smoke.spec.ts` | ~10 | Basic functionality, critical paths |
| Payroll Admin | `payroll-admin.spec.ts` | ~25 | AI validation, claim approval/rejection |
| Crew Member | `crew-member.spec.ts` | ~20 | Claim submission, trip schedule, history |
| Role Access | `role-access.spec.ts` | ~20 | All 7 roles, navigation, RBAC |
| API Tests | `api.spec.ts` | ~25 | Backend endpoints, validation logic |

**Total: ~100 E2E tests**

## 📁 Test Structure

```
tests/
├── e2e/
│   ├── fixtures/
│   │   └── base.ts              # Custom Playwright fixtures
│   ├── helpers/
│   │   └── test-data.ts         # Test data and selectors
│   ├── demo/                    # Demo scripts for presentations
│   │   ├── demo-fixtures.ts     # Demo-specific fixtures
│   │   ├── narration-data.ts    # TTS scripts and metadata
│   │   ├── landing-page.demo.ts # Landing page demo
│   │   ├── ai-validation.demo.ts # AI validation demo ⭐
│   │   ├── crew-member.demo.ts  # Crew member demo
│   │   ├── controller.demo.ts   # Controller demo
│   │   ├── full-platform-tour.demo.ts # Complete tour
│   │   └── index.ts             # Module exports
│   ├── smoke.spec.ts            # Quick smoke tests
│   ├── payroll-admin.spec.ts    # Payroll admin dashboard tests
│   ├── crew-member.spec.ts      # Crew member dashboard tests
│   ├── role-access.spec.ts      # Role-based access tests
│   ├── api.spec.ts              # API integration tests
│   ├── integration.spec.ts      # Full integration tests
│   ├── claim-submission-full.spec.ts # Claim workflow tests
│   └── fleet-monitoring.spec.ts # Fleet monitoring tests
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Backend server running on `http://localhost:3001`
- Frontend dev server on `http://localhost:5173`

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Install Playwright browsers:**

```bash
npx playwright install
```

3. **Set up environment variables:**

Create `backend/.env`:

```env
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_neon_database_url
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🧪 Running Tests

### Quick Start

```bash
# Run all tests (headless)
npm test

# Run with UI mode (recommended for development)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug
```

### Specific Test Suites

```bash
# Smoke tests only (fast)
npx playwright test smoke.spec.ts

# Payroll admin tests
npm run test:payroll

# Crew member tests
npm run test:crew

# Role access tests
npm run test:roles

# API tests only
npm run test:api
```

### Browser-Specific Tests

```bash
# Chromium only
npm run test:chromium

# Firefox only
npm run test:firefox

# WebKit/Safari only
npm run test:webkit
```

### View Test Report

```bash
npm run test:report
```

## 🎬 Demo Scripts

The `tests/e2e/demo/` directory contains specialized Playwright scripts designed for:
- **Live demonstrations** with AI-narrated audio
- **Demo-pilot integration** with Eleven Labs TTS
- **Video capture** for marketing materials
- **Investor presentations** and sales demos

### Demo Structure

```
tests/e2e/demo/
├── demo-fixtures.ts          # Custom fixtures with narration support
├── narration-data.ts         # TTS scripts and scenario metadata
├── landing-page.demo.ts      # Landing page showcase (60s)
├── ai-validation.demo.ts     # AI validation showcase (120s) ⭐
├── crew-member.demo.ts       # Crew member experience (90s)
├── controller.demo.ts        # Operations controller (90s)
├── full-platform-tour.demo.ts # Complete tour (300s)
└── index.ts                  # Module exports
```

### Running Demo Scripts

```bash
# Full platform tour (5-6 minutes)
npx playwright test full-platform-tour.demo.ts --headed

# AI Validation showcase (MAIN DEMO)
npx playwright test ai-validation.demo.ts --headed

# Quick overview (2 minutes)
npx playwright test full-platform-tour.demo.ts --headed -g "Quick Platform Overview"

# All demos in sequence
npx playwright test tests/e2e/demo/*.demo.ts --headed
```

### Demo-Pilot Integration

Demo scripts emit events for synchronization with TTS:

```typescript
// Events emitted by demos
'demo:start'           // Demo started
'step:narration'       // Text ready for TTS
'ai:validation:start'  // AI validation triggered
'screenshot'           // Screenshot captured
'demo:complete'        // Demo finished
```

See [DEMO_PILOT_INTEGRATION.md](../DEMO_PILOT_INTEGRATION.md) for full integration guide.

### Demo Scenarios

| Scenario | Duration | Description |
|----------|----------|-------------|
| `landing-page` | 60s | Landing page and role overview |
| `ai-validation` | 120s | Multi-agent AI validation ⭐ |
| `crew-member` | 90s | Crew member portal |
| `controller` | 90s | Operations control center |
| `executive` | 60s | Executive dashboard |
| `full-tour` | 300s | Complete platform tour |

## 📊 Test Scenarios

### 1. Smoke Tests (`smoke.spec.ts`)

Quick sanity checks:
- Application loads
- Backend API responds
- CSS/JS is working
- No console errors
- Responsive viewports work

**Run time:** ~30 seconds

### 2. Payroll Admin Tests (`payroll-admin.spec.ts`)

#### AI Validation Workflow
- ✅ Display pending claims
- ✅ Trigger AI validation
- ✅ Show all 3 agents executing
- ✅ Display real-time progress
- ✅ Handle different outcomes (Approved/Flagged/Rejected)
- ✅ Approve/reject claims
- ✅ Update statistics

#### Test Cases:
```typescript
// Happy path - Valid international premium claim
CLM-2024-1156 → International flight → $125 → APPROVED (92% confidence)

// Rejection - Domestic claiming international premium
CLM-2024-1157 → Domestic flight → $125 → REJECTED (policy violation)

// Flagged - Suspiciously high amount
CLM-2024-1158 → High amount → $2500 → FLAGGED (manual review required)
```

**Run time:** ~5-10 minutes (includes AI validation)

### 3. Crew Member Tests (`crew-member.spec.ts`)

- ✅ View dashboard with trips and claims
- ✅ Display YTD earnings
- ✅ Submit new claims
- ✅ View claim history
- ✅ Filter claims by status
- ✅ Display training requirements
- ✅ Real-time updates

**Run time:** ~2-3 minutes

### 4. Role Access Tests (`role-access.spec.ts`)

Tests all 7 role dashboards:

1. **Crew Member** - Schedule, claims, earnings
2. **Payroll Admin** - AI validation, claim approval
3. **Crew Scheduler** - Roster, assignments, optimization
4. **Operations Controller** - Real-time ops, disruptions
5. **Management** - KPIs, analytics, performance
6. **Union Representative** - Compliance, violations
7. **Executive Dashboard** - Strategic overview

**Run time:** ~3-4 minutes

### 5. API Tests (`api.spec.ts`)

Direct backend testing:

#### Endpoints Tested:
```bash
GET  /health                      # Server health
GET  /api/agents/health          # Agent status
POST /api/agents/validate        # Validate by claim ID
POST /api/agents/validate-claim  # Validate with full data
```

#### Test Cases:
- ✅ Valid claim validation
- ✅ Parallel agent execution (< 25 seconds)
- ✅ Invalid claim rejection
- ✅ Error handling
- ✅ Response structure validation
- ✅ CORS headers
- ✅ Concurrent requests

**Run time:** ~3-5 minutes

## 🔄 CI/CD Integration

### GitHub Actions

The test suite runs automatically on:
- Push to `main`, `develop`, or `claude/**` branches
- Pull requests to `main` or `develop`

**Workflow:** `.github/workflows/e2e-tests.yml`

#### Jobs:

1. **Full E2E Tests**
   - Runs all tests across all browsers
   - Uploads test reports as artifacts

2. **API Tests Only**
   - Fast API-only tests
   - Useful for backend changes

### Required Secrets

Set these in GitHub Settings → Secrets:

```
ANTHROPIC_API_KEY - Claude API key
OPENAI_API_KEY - OpenAI API key
DATABASE_URL - Neon PostgreSQL connection string
```

### Viewing CI Results

1. Go to Actions tab in GitHub
2. Click on the workflow run
3. Download `playwright-report` artifact
4. Unzip and open `index.html`

## ✍️ Writing New Tests

### Using Custom Fixtures

```typescript
import { test, expect } from './fixtures/base';

test('my test', async ({ page, gotoRole }) => {
  // Navigate to a specific role
  await gotoRole('payroll-admin');

  // Verify dashboard loaded
  await expect(page.locator('h1')).toContainText(/Payroll/i);
});
```

### Available Fixtures

| Fixture | Description |
|---------|-------------|
| `authenticatedPage` | Pre-authenticated page |
| `gotoRole(role)` | Navigate to role dashboard |
| `waitForAIValidation()` | Wait for AI validation to complete |

### Test Data Helpers

```typescript
import { testData, selectors } from './helpers/test-data';

// Use predefined test data
const claim = testData.claims.validInternational;

// Use common selectors
await page.locator(selectors.validateButton).click();
```

### Best Practices

1. **Use descriptive test names:**
   ```typescript
   test('should recommend rejection for invalid claims', async ({ page }) => {
     // ...
   });
   ```

2. **Wait for elements properly:**
   ```typescript
   // Good
   await expect(page.locator('text=/approved/i')).toBeVisible();

   // Avoid
   await page.waitForTimeout(5000); // Only use when necessary
   ```

3. **Clean up test data:**
   ```typescript
   test.afterEach(async ({ page }) => {
     // Clean up if needed
   });
   ```

4. **Handle flaky tests:**
   ```typescript
   test('potentially flaky test', async ({ page }) => {
     test.setTimeout(60000); // Increase timeout
     await expect(page.locator('text=/result/i')).toBeVisible({
       timeout: 30000
     });
   });
   ```

## 🐛 Troubleshooting

### Common Issues

#### 1. Tests Fail with "Target page closed"

**Solution:** Ensure both frontend and backend servers are running:
```bash
# Terminal 1
npm run dev

# Terminal 2
cd backend && npm run dev

# Terminal 3
npm test
```

#### 2. AI Validation Tests Timeout

**Solution:** Increase timeout for AI tests:
```typescript
test('validate claim', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

**Cause:** AI agents can take 15-20 seconds to complete.

#### 3. "Cannot find module '@playwright/test'"

**Solution:**
```bash
npm install
npx playwright install
```

#### 4. Database Connection Errors

**Solution:** Verify `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL=postgresql://user:pass@host/database?sslmode=require
```

#### 5. CORS Errors in API Tests

**Solution:** Ensure backend CORS is configured for `http://localhost:5173`.

Check `backend/server.ts`:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
```

### Debug Mode

Run single test in debug mode:
```bash
npx playwright test --debug payroll-admin.spec.ts -g "should validate"
```

This opens:
- Browser with Playwright Inspector
- Step-by-step execution
- DOM explorer
- Network logs

### Viewing Trace

If test fails:
```bash
npx playwright show-trace test-results/.../trace.zip
```

This shows:
- Screenshots at each step
- Network activity
- Console logs
- Timeline

## 📈 Performance Benchmarks

| Test Suite | Tests | Duration | Notes |
|------------|-------|----------|-------|
| Smoke | 10 | 30s | Fast sanity checks |
| API | 25 | 3-5min | Includes AI validation |
| Payroll | 25 | 5-10min | AI validation takes time |
| Crew Member | 20 | 2-3min | Standard CRUD operations |
| Role Access | 20 | 3-4min | 7 role navigations |
| **Total** | **~100** | **15-25min** | Full suite |

### Optimization Tips

1. **Run smoke tests first:**
   ```bash
   npx playwright test smoke.spec.ts
   ```

2. **Run API tests separately:**
   ```bash
   npm run test:api
   ```

3. **Use headed mode sparingly:**
   ```bash
   npm run test:headed  # Slower but useful for debugging
   ```

4. **Parallel execution:**
   ```bash
   npx playwright test --workers=4  # Use 4 parallel workers
   ```

## 🎯 Coverage Goals

- **Critical paths:** 100% (landing, role access, AI validation)
- **User flows:** 90% (claim submission, approval, history)
- **Edge cases:** 80% (errors, timeouts, invalid data)
- **UI components:** 70% (responsive, mobile, accessibility)

## 📞 Support

- **Documentation:** [Playwright Docs](https://playwright.dev)
- **Issues:** Report in GitHub Issues
- **Slack:** #aioscrew-testing (if applicable)

## 📝 License

Same as Aioscrew project license.

---

**Happy Testing! 🚀**
