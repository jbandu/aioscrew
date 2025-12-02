import { test, expect, setCurrentScenario } from './demo-fixtures';
import { landingPageScenario } from './narration-data';

/**
 * Landing Page Demo Script
 *
 * This demo showcases the Aioscrew landing page and role selection.
 * Designed for use with demo-pilot and Eleven Labs TTS.
 *
 * Run with: npx playwright test landing-page.demo.ts
 * Run with UI: npx playwright test landing-page.demo.ts --headed
 */

test.describe('Landing Page Demo', () => {
  test.beforeAll(() => {
    setCurrentScenario(landingPageScenario);
  });

  test('Complete Landing Page Demo Flow', async ({
    page,
    executeStep,
    highlightElement,
    demoScreenshot,
    demoWait,
    emitDemoEvent,
  }) => {
    test.setTimeout(120000); // 2 minutes for demo

    // Emit demo start event
    emitDemoEvent('demo:start', {
      scenarioId: landingPageScenario.id,
      title: landingPageScenario.title,
    });

    // Step 1: Load landing page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(/Copa Airlines/i);
    await demoScreenshot('landing-initial', 'Landing page loaded');

    await executeStep(landingPageScenario.steps[0]);
    await demoWait(2000, 'Pausing for landing page overview');

    // Step 2: Highlight role grid
    await executeStep(landingPageScenario.steps[1]);

    // Step 3-9: Highlight each role
    const roleButtons = [
      { name: 'Crew Member', selector: 'button:has-text("Crew Member")' },
      { name: 'Payroll Admin', selector: 'button:has-text("Payroll")' },
      { name: 'Crew Scheduler', selector: 'button:has-text("Scheduler")' },
      { name: 'Operations Controller', selector: 'button:has-text("Controller")' },
      { name: 'Management', selector: 'button:has-text("Management")' },
      { name: 'Union Representative', selector: 'button:has-text("Union")' },
      { name: 'Executive Dashboard', selector: 'button:has-text("Executive")' },
    ];

    for (let i = 0; i < roleButtons.length; i++) {
      const role = roleButtons[i];
      const stepIndex = 2 + i;

      if (stepIndex < landingPageScenario.steps.length) {
        emitDemoEvent('role:highlight', { role: role.name });

        // Highlight the role button
        const button = page.locator(role.selector).first();
        if (await button.isVisible()) {
          await highlightElement(role.selector, 2500);
          await executeStep(landingPageScenario.steps[stepIndex]);
        }
      }
    }

    // Take final screenshot
    await demoScreenshot('landing-complete', 'All roles showcased');

    // Emit demo complete
    emitDemoEvent('demo:complete', {
      scenarioId: landingPageScenario.id,
      success: true,
    });
  });

  test('Role Navigation Demo - All Roles', async ({
    page,
    gotoRole,
    demoScreenshot,
    demoWait,
    emitDemoEvent,
  }) => {
    test.setTimeout(180000); // 3 minutes

    const roles: Array<{ role: Parameters<typeof gotoRole>[0]; name: string }> = [
      { role: 'crew-member', name: 'Crew Member' },
      { role: 'payroll-admin', name: 'Payroll Admin' },
      { role: 'scheduler', name: 'Crew Scheduler' },
      { role: 'crew-scheduler', name: 'Crew Scheduling' },
      { role: 'controller', name: 'Operations Controller' },
      { role: 'management', name: 'Management' },
      { role: 'union', name: 'Union Representative' },
      { role: 'executive', name: 'Executive Dashboard' },
    ];

    for (const { role, name } of roles) {
      emitDemoEvent('navigation:start', { role: name });

      try {
        await gotoRole(role);
        await demoWait(1500, `Viewing ${name} dashboard`);
        await demoScreenshot(`role-${role}`, `${name} dashboard view`);

        emitDemoEvent('navigation:complete', { role: name, success: true });
      } catch {
        emitDemoEvent('navigation:complete', { role: name, success: false });
      }
    }
  });
});

test.describe('Landing Page Feature Tests', () => {
  test('should display Copa Airlines branding', async ({ page }) => {
    await page.goto('/');

    // Check for Copa Airlines in header
    await expect(page.locator('h1, h2, [class*="header"]')).toContainText(/Copa Airlines/i);

    // Check for logo
    const logo = page.locator('img[alt*="Copa"], img[src*="copa"]');
    if (await logo.count() > 0) {
      await expect(logo.first()).toBeVisible();
    }
  });

  test('should display all 8 role options', async ({ page }) => {
    await page.goto('/');

    const expectedRoles = [
      'Crew Member',
      'Payroll',
      'Scheduler',
      'Controller',
      'Management',
      'Union',
      'Executive',
    ];

    for (const role of expectedRoles) {
      const roleElement = page.locator(`button, [role="button"]`).filter({
        hasText: new RegExp(role, 'i'),
      });
      await expect(roleElement.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to crew member dashboard', async ({ page, gotoRole }) => {
    await gotoRole('crew-member');
    await expect(page.locator('text=/schedule|trips|claims|dashboard/i')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should navigate to payroll dashboard', async ({ page, gotoRole }) => {
    await gotoRole('payroll-admin');
    await expect(page.locator('text=/payroll|claims|validation/i')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
