import { test, expect, setCurrentScenario } from './demo-fixtures';
import { crewMemberScenario } from './narration-data';

/**
 * Crew Member Demo Script
 *
 * Demonstrates the crew member experience including:
 * - Dashboard overview
 * - Schedule/trip viewing
 * - Claim submission
 * - Earnings tracking
 * - Training requirements
 *
 * Run with: npx playwright test crew-member.demo.ts --headed
 */

test.describe('Crew Member Demo', () => {
  test.beforeAll(() => {
    setCurrentScenario(crewMemberScenario);
  });

  test('Complete Crew Member Experience Demo', async ({
    page,
    gotoRole,
    executeStep,
    highlightElement,
    scrollToElement,
    demoScreenshot,
    demoWait,
    emitDemoEvent,
  }) => {
    test.setTimeout(180000);

    // Emit demo start
    emitDemoEvent('demo:start', {
      scenarioId: crewMemberScenario.id,
      title: 'Crew Member Portal Experience',
    });

    // Step 1: Navigate to Crew Member
    emitDemoEvent('step:narration', {
      text: "Let's experience the platform from a crew member's perspective. Captain Sarah Martinez is logging in to check her schedule.",
    });

    await gotoRole('crew-member');
    await demoWait(2000, 'Dashboard loading');

    // Step 2: Show Dashboard Overview
    emitDemoEvent('step:narration', {
      text: 'The crew dashboard provides an at-a-glance view of upcoming trips, year-to-date earnings, and recent claims status.',
    });

    await demoScreenshot('crew-dashboard', 'Crew Member Dashboard');
    await executeStep(crewMemberScenario.steps[1]);

    // Look for dashboard elements
    const dashboardStats = page.locator('[class*="stat"], [class*="card"], [class*="metric"]');
    if ((await dashboardStats.count()) > 0) {
      await highlightElement('[class*="stat"], [class*="card"]', 2500);
    }

    // Step 3: Show Schedule View
    emitDemoEvent('step:narration', {
      text: 'The schedule view displays all assigned flights with details including route, aircraft type, and duty times.',
    });

    // Click on schedule/trips tab if available
    const scheduleTab = page.locator('button, [role="tab"]').filter({
      hasText: /schedule|trips|calendar/i,
    });

    if ((await scheduleTab.count()) > 0) {
      await scheduleTab.first().click();
      await demoWait(1500, 'Schedule loading');
    }

    await demoScreenshot('crew-schedule', 'Flight Schedule View');

    // Look for trip/schedule elements
    const tripElements = page.locator('[class*="trip"], [class*="flight"], [class*="schedule"]');
    if ((await tripElements.count()) > 0) {
      await highlightElement('[class*="trip"], [class*="flight"]', 2500);
    }

    // Step 4: Show Trip Details
    emitDemoEvent('step:narration', {
      text: 'Clicking on a trip reveals full details: flight numbers, departure times, layover information, and applicable pay premiums.',
    });

    const tripCard = page.locator('[class*="trip"], tr, [class*="flight"]').filter({
      hasText: /CM|PTY|flight|trip/i,
    });

    if ((await tripCard.count()) > 0) {
      await tripCard.first().click();
      await demoWait(1500, 'Trip details loading');
      await demoScreenshot('trip-details', 'Trip Details Modal');
    }

    // Close modal if open
    const closeButton = page.locator('button').filter({ hasText: /close|×|cancel/i });
    if ((await closeButton.count()) > 0) {
      await closeButton.first().click();
      await demoWait(500);
    }

    // Step 5: Show Claims History
    emitDemoEvent('step:narration', {
      text: 'The claims section shows all submitted pay claims with their current status. Green indicates approved, yellow is pending, and red marks rejected claims.',
    });

    const claimsTab = page.locator('button, [role="tab"]').filter({
      hasText: /claims|history|pay/i,
    });

    if ((await claimsTab.count()) > 0) {
      await claimsTab.first().click();
      await demoWait(1500, 'Claims loading');
    }

    await demoScreenshot('claims-history', 'Claims History View');

    const claimsList = page.locator('[class*="claim"]');
    if ((await claimsList.count()) > 0) {
      await highlightElement('[class*="claim"]', 2500);
    }

    // Step 6: Start Claim Submission
    emitDemoEvent('step:narration', {
      text: "Let's submit a new premium pay claim for an international flight. The form auto-populates trip data to reduce errors.",
    });

    const submitClaimButton = page.locator('button').filter({
      hasText: /submit.*claim|new.*claim|add.*claim/i,
    });

    if ((await submitClaimButton.count()) > 0) {
      await highlightElement('button:has-text("Claim")', 2000);
      await submitClaimButton.first().click();
      await demoWait(1500, 'Claim form loading');
      await demoScreenshot('claim-form', 'Claim Submission Form');
    }

    // Step 7: Fill Claim Form (if form is visible)
    emitDemoEvent('step:narration', {
      text: 'Sarah selects the trip, claim type, and verifies the amount. The system automatically calculates based on CBA rules.',
    });

    const claimForm = page.locator('form, [class*="form"]');
    if ((await claimForm.count()) > 0) {
      // Fill form fields if present
      const tripSelect = page.locator('select, [role="combobox"]').first();
      if ((await tripSelect.count()) > 0) {
        await tripSelect.click();
        await demoWait(500);
        // Select first option if available
        const firstOption = page.locator('option, [role="option"]').first();
        if ((await firstOption.count()) > 0) {
          await firstOption.click();
        }
      }

      const amountInput = page.locator('input[type="number"], input[name*="amount"]');
      if ((await amountInput.count()) > 0) {
        await amountInput.first().fill('125');
      }

      await demoScreenshot('claim-filled', 'Claim Form Filled');
    }

    // Step 8: Submit Claim
    emitDemoEvent('step:narration', {
      text: 'Upon submission, the claim enters the validation queue. Sarah will receive real-time updates as AI agents process her request.',
    });

    const submitButton = page.locator('button[type="submit"], button').filter({
      hasText: /submit|save|send/i,
    });

    if ((await submitButton.count()) > 0) {
      // Don't actually submit to avoid side effects in demos
      await highlightElement('button:has-text("Submit")', 2000);
      await demoScreenshot('claim-submit', 'Ready to Submit');
    }

    // Step 9: Show YTD Earnings
    emitDemoEvent('step:narration', {
      text: 'Year-to-date earnings are tracked in real-time, broken down by category: base pay, flight time, premiums, and overtime.',
    });

    const earningsSection = page.locator('text=/ytd|year.*to.*date|earnings|total.*pay/i');
    if ((await earningsSection.count()) > 0) {
      await scrollToElement('[class*="earning"], [class*="ytd"]');
      await highlightElement('[class*="earning"], [class*="ytd"]', 2500);
      await demoScreenshot('ytd-earnings', 'Year-to-Date Earnings');
    }

    // Step 10: Show Training
    emitDemoEvent('step:narration', {
      text: 'The training section tracks certifications, upcoming requirements, and expiration dates to ensure compliance.',
    });

    const trainingTab = page.locator('button, [role="tab"]').filter({
      hasText: /training|certification|requirements/i,
    });

    if ((await trainingTab.count()) > 0) {
      await trainingTab.first().click();
      await demoWait(1500);
      await demoScreenshot('training', 'Training Requirements');
    }

    // Demo complete
    emitDemoEvent('demo:complete', {
      scenarioId: crewMemberScenario.id,
      success: true,
    });
  });
});

test.describe('Crew Member Functional Tests', () => {
  test('should display crew member dashboard', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');

    // Check for dashboard elements
    await expect(
      page.locator('text=/schedule|trips|claims|dashboard|welcome/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display upcoming trips', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');

    // Look for trip information
    const tripContent = await page.textContent('body');
    const hasTrips = tripContent?.match(/trip|flight|schedule|CM-|PTY|route/i);
    expect(hasTrips).toBeTruthy();
  });

  test('should display earnings information', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');

    // Look for earnings
    const pageContent = await page.textContent('body');
    const hasEarnings = pageContent?.match(/\$[\d,]+|earnings|pay|amount/i);
    expect(hasEarnings).toBeTruthy();
  });

  test('should have navigation sidebar', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');

    // Check for navigation elements
    const navItems = page.locator('nav, [role="navigation"], [class*="sidebar"]');
    const hasNav = (await navItems.count()) > 0;
    expect(hasNav).toBeTruthy();
  });

  test('should display claim status indicators', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');

    // Navigate to claims if needed
    const claimsTab = page.locator('button, [role="tab"]').filter({
      hasText: /claims|history/i,
    });

    if ((await claimsTab.count()) > 0) {
      await claimsTab.first().click();
    }

    // Look for status indicators
    const pageContent = await page.textContent('body');
    const hasStatus = pageContent?.match(/pending|approved|rejected|status/i);
    expect(hasStatus).toBeTruthy();
  });

  test('should allow claim submission form access', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');

    // Look for claim submission button
    const submitButton = page.locator('button').filter({
      hasText: /submit|new.*claim|add/i,
    });

    if ((await submitButton.count()) > 0) {
      await submitButton.first().click();

      // Verify form or modal appears
      await expect(
        page.locator('form, [class*="modal"], [class*="form"]')
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Crew Member Schedule Tests', () => {
  test('should display calendar or list view', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');

    // Look for schedule view
    const scheduleElements = page.locator('[class*="calendar"], [class*="schedule"], [class*="list"]');
    expect(await scheduleElements.count()).toBeGreaterThan(0);
  });

  test('should show trip details on click', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');

    // Click on a trip
    const tripElement = page.locator('[class*="trip"], tr').filter({
      hasText: /CM|flight|trip/i,
    });

    if ((await tripElement.count()) > 0) {
      await tripElement.first().click();

      // Verify details appear
      await expect(
        page.locator('text=/flight.*number|route|departure|arrival|details/i')
      ).toBeVisible({ timeout: 5000 });
    }
  });
});
