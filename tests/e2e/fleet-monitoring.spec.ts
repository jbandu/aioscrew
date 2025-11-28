/**
 * Fleet Data Management Monitoring Test
 *
 * This test automatically:
 * 1. Navigates to the production site
 * 2. Captures all console logs (info, warnings, errors)
 * 3. Tests the Fleet Data Management card functionality
 * 4. Reports any failures or API errors
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://aioscrew-backend-production.up.railway.app';

test.describe('Fleet Data Management Monitoring', () => {
  // Store console logs for reporting
  const consoleLogs: Array<{type: string; text: string; timestamp: Date}> = [];
  const consoleErrors: Array<{text: string; timestamp: Date}> = [];

  test('should load Fleet Data Management and capture all logs', async ({ page }) => {
    // Capture ALL console messages
    page.on('console', msg => {
      const timestamp = new Date();
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        timestamp
      };

      consoleLogs.push(logEntry);

      // Print to test output in real-time
      console.log(`[${timestamp.toISOString()}] [${msg.type().toUpperCase()}] ${msg.text()}`);

      // Track errors separately
      if (msg.type() === 'error') {
        consoleErrors.push({ text: msg.text(), timestamp });
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      const timestamp = new Date();
      console.error(`[${timestamp.toISOString()}] [PAGE ERROR] ${error.message}`);
      consoleErrors.push({ text: `PAGE ERROR: ${error.message}`, timestamp });
    });

    // Capture network failures
    page.on('requestfailed', request => {
      const timestamp = new Date();
      const failure = request.failure();
      console.error(`[${timestamp.toISOString()}] [NETWORK FAIL] ${request.url()} - ${failure?.errorText || 'Unknown error'}`);
    });

    console.log('\n=== Starting Fleet Data Management Test ===\n');
    console.log(`Navigating to: ${PRODUCTION_URL}`);

    // Navigate to production site
    await page.goto(PRODUCTION_URL, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for app to load
    await page.waitForTimeout(3000);

    console.log('\n--- Page loaded, checking for Fleet Data Management ---\n');

    // Look for Fleet Data Management card or section
    const fleetSection = page.locator('text=/Fleet.*Data.*Management/i').first();

    // Check if Fleet Data Management is visible
    const isVisible = await fleetSection.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✓ Fleet Data Management section found');

      // Click to expand if needed
      await fleetSection.click().catch(() => {});
      await page.waitForTimeout(5000); // Wait for API calls

    } else {
      console.log('⚠ Fleet Data Management section not immediately visible');
      // Try scrolling to find it
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    // Wait for any async operations to complete
    await page.waitForTimeout(10000);

    console.log('\n=== Test Complete ===\n');

    // Summary
    console.log(`\n--- Console Log Summary ---`);
    console.log(`Total logs: ${consoleLogs.length}`);
    console.log(`Errors: ${consoleErrors.length}`);

    if (consoleErrors.length > 0) {
      console.log('\n--- ERRORS FOUND ---');
      consoleErrors.forEach((err, i) => {
        console.log(`${i + 1}. [${err.timestamp.toISOString()}] ${err.text}`);
      });
    }

    // Check for specific errors
    const fleetErrors = consoleLogs.filter(log =>
      log.text.includes('FleetDataManagement') && log.type === 'error'
    );

    if (fleetErrors.length > 0) {
      console.log('\n--- Fleet Data Management Errors ---');
      fleetErrors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.text}`);
      });
    }

    // Check for 404 errors
    const notFoundErrors = consoleLogs.filter(log =>
      log.text.includes('404') || log.text.includes('Not Found')
    );

    if (notFoundErrors.length > 0) {
      console.log('\n--- 404 Not Found Errors ---');
      notFoundErrors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.text}`);
      });

      // Fail the test if there are 404 errors
      expect(notFoundErrors.length, '404 errors found - API endpoints may be incorrect').toBe(0);
    }

    // Check for successful API calls
    const successfulFetches = consoleLogs.filter(log =>
      log.text.includes('Fetching from:') && log.text.includes('airlines/status')
    );

    if (successfulFetches.length > 0) {
      console.log('\n--- API Calls Made ---');
      successfulFetches.forEach(log => {
        console.log(`- ${log.text}`);
      });
    }

    // Assert: Should not have excessive errors
    expect(consoleErrors.length, 'Too many console errors').toBeLessThan(5);
  });
});
