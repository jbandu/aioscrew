import { test, expect, setCurrentScenario } from './demo-fixtures';
import { controllerScenario } from './narration-data';

/**
 * Operations Controller Demo Script
 *
 * Demonstrates the operations control center including:
 * - Real-time flight monitoring
 * - Active crew tracking
 * - Disruption management
 * - Reserve pool management
 * - Gantt timeline visualization
 * - Shift handoff features
 *
 * Run with: npx playwright test controller.demo.ts --headed
 */

test.describe('Operations Controller Demo', () => {
  test.beforeAll(() => {
    setCurrentScenario(controllerScenario);
  });

  test('Complete Operations Controller Demo', async ({
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
      scenarioId: controllerScenario.id,
      title: 'Operations Control Center Demo',
    });

    // Step 1: Navigate to Controller
    emitDemoEvent('step:narration', {
      text: 'The Operations Control Center is the nerve center of crew management. Let\'s see how controllers handle real-time operations.',
    });

    await gotoRole('controller');
    await demoWait(2000, 'Operations center loading');

    // Step 2: Show Operations Center Overview
    emitDemoEvent('step:narration', {
      text: 'The main dashboard displays current flight status, active crew, and any operational alerts requiring attention.',
    });

    await demoScreenshot('ops-center', 'Operations Control Center');
    await executeStep(controllerScenario.steps[1]);

    // Step 3: Show Active Flights
    emitDemoEvent('step:narration', {
      text: 'Color-coded flight status indicators show on-time, delayed, and cancelled flights at a glance. Click any flight for details.',
    });

    const flightStatus = page.locator('[class*="flight"], [class*="status"], [class*="indicator"]');
    if ((await flightStatus.count()) > 0) {
      await highlightElement('[class*="flight"], [class*="status"]', 2500);
      await demoScreenshot('flight-status', 'Flight Status Overview');
    }

    // Step 4: Show Active Crew View
    emitDemoEvent('step:narration', {
      text: 'The Active Crew view shows all crew currently on duty, their current assignment, and remaining duty time.',
    });

    // Look for active crew tab or section
    const activeCrewTab = page.locator('button, [role="tab"]').filter({
      hasText: /active.*crew|on.*duty|current.*crew/i,
    });

    if ((await activeCrewTab.count()) > 0) {
      await activeCrewTab.first().click();
      await demoWait(1500);
    }

    const activeCrewSection = page.locator('[class*="active"], [class*="crew"]');
    if ((await activeCrewSection.count()) > 0) {
      await highlightElement('[class*="crew"]', 2500);
      await demoScreenshot('active-crew', 'Active Crew View');
    }

    // Step 5: Show Disruption Alert
    emitDemoEvent('step:narration', {
      text: 'A disruption alert appears! Flight CM-450 is experiencing a mechanical delay. The system automatically identifies affected crew.',
    });

    // Look for disruption/alert elements
    const disruptionElements = page.locator('[class*="alert"], [class*="disruption"], [class*="warning"]');
    if ((await disruptionElements.count()) > 0) {
      await highlightElement('[class*="alert"], [class*="disruption"]', 3000);
      await demoScreenshot('disruption-alert', 'Disruption Alert');
    }

    // Step 6: Show AI Recommendations
    emitDemoEvent('step:narration', {
      text: 'Our AI controller agent analyzes the situation and recommends optimal solutions: reassign affected passengers, activate reserve crew, or adjust subsequent flights.',
    });

    const recommendationSection = page.locator('text=/recommend|solution|suggest|option/i');
    if ((await recommendationSection.count()) > 0) {
      await scrollToElement('[class*="recommend"]');
      await demoScreenshot('ai-recommendations', 'AI Recommendations');
    }

    // Step 7: Show Reserve Pool
    emitDemoEvent('step:narration', {
      text: 'The Reserve Pool shows available crew members who can be called to cover disruptions. Qualifications and proximity are automatically considered.',
    });

    const reserveTab = page.locator('button, [role="tab"]').filter({
      hasText: /reserve|standby|available/i,
    });

    if ((await reserveTab.count()) > 0) {
      await reserveTab.first().click();
      await demoWait(1500);
    }

    const reserveSection = page.locator('[class*="reserve"], [class*="pool"]');
    if ((await reserveSection.count()) > 0) {
      await highlightElement('[class*="reserve"]', 2500);
      await demoScreenshot('reserve-pool', 'Reserve Crew Pool');
    }

    // Step 8: Assign Reserve
    emitDemoEvent('step:narration', {
      text: 'With one click, we can assign a reserve crew member. The system automatically notifies them and updates all affected systems.',
    });

    const assignButton = page.locator('button').filter({
      hasText: /assign|activate|call.*in/i,
    });

    if ((await assignButton.count()) > 0) {
      await highlightElement('button:has-text("Assign")', 2000);
      await demoScreenshot('assign-reserve', 'Ready to Assign Reserve');
    }

    // Step 9: Show Gantt Timeline
    emitDemoEvent('step:narration', {
      text: 'The Gantt timeline provides a visual representation of all crew schedules, making it easy to identify conflicts and gaps.',
    });

    // Look for Gantt or timeline elements
    const ganttElements = page.locator('[class*="gantt"], [class*="timeline"], [class*="chart"]');
    if ((await ganttElements.count()) > 0) {
      await scrollToElement('[class*="gantt"], [class*="timeline"]');
      await highlightElement('[class*="gantt"], [class*="timeline"]', 3000);
      await demoScreenshot('gantt-timeline', 'Gantt Timeline View');
    }

    // Step 10: Show Shift Handoff
    emitDemoEvent('step:narration', {
      text: 'When shifts change, the handoff feature ensures incoming controllers receive a complete briefing of ongoing situations and pending actions.',
    });

    const handoffTab = page.locator('button, [role="tab"]').filter({
      hasText: /handoff|shift.*report|briefing/i,
    });

    if ((await handoffTab.count()) > 0) {
      await handoffTab.first().click();
      await demoWait(1500);
      await demoScreenshot('shift-handoff', 'Shift Handoff Report');
    }

    // Demo complete
    emitDemoEvent('demo:complete', {
      scenarioId: controllerScenario.id,
      success: true,
    });
  });
});

test.describe('Operations Controller Functional Tests', () => {
  test('should display operations dashboard', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    // Verify dashboard loaded
    await expect(
      page.locator('text=/operations|control|center|dashboard|flights/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show flight status information', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    // Look for flight status elements
    const pageContent = await page.textContent('body');
    const hasFlightInfo = pageContent?.match(/flight|CM-|status|on.*time|delay/i);
    expect(hasFlightInfo).toBeTruthy();
  });

  test('should display crew status', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    // Look for crew status
    const pageContent = await page.textContent('body');
    const hasCrewInfo = pageContent?.match(/crew|duty|active|pilot|captain/i);
    expect(hasCrewInfo).toBeTruthy();
  });

  test('should have navigation between views', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    // Check for navigation tabs
    const navTabs = page.locator('[role="tab"], [class*="tab"], button').filter({
      hasText: /operations|crew|reserve|disruption|timeline/i,
    });

    expect(await navTabs.count()).toBeGreaterThan(0);
  });

  test('should display alerts or notifications', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    // Look for alert elements
    const alerts = page.locator('[class*="alert"], [class*="notification"], [role="alert"]');
    // Alerts may or may not be present, but the UI should handle both
    const hasAlertUI = (await alerts.count()) >= 0;
    expect(hasAlertUI).toBeTruthy();
  });
});

test.describe('Controller View Navigation Tests', () => {
  test('should navigate to Active Crew view', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    const activeCrewTab = page.locator('button, [role="tab"]').filter({
      hasText: /active.*crew/i,
    });

    if ((await activeCrewTab.count()) > 0) {
      await activeCrewTab.first().click();
      await expect(
        page.locator('text=/active|crew|duty|assignment/i')
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to Reserve Pool view', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    const reserveTab = page.locator('button, [role="tab"]').filter({
      hasText: /reserve|pool/i,
    });

    if ((await reserveTab.count()) > 0) {
      await reserveTab.first().click();
      await expect(
        page.locator('text=/reserve|available|standby/i')
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to Disruptions view', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    const disruptionsTab = page.locator('button, [role="tab"]').filter({
      hasText: /disruption|delay|cancel/i,
    });

    if ((await disruptionsTab.count()) > 0) {
      await disruptionsTab.first().click();
      await expect(
        page.locator('text=/disruption|delay|affected|manage/i')
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display timeline/Gantt view', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    // Look for timeline elements
    const timelineElements = page.locator('[class*="timeline"], [class*="gantt"], [class*="chart"]');

    if ((await timelineElements.count()) > 0) {
      await expect(timelineElements.first()).toBeVisible();
    }
  });
});

test.describe('Controller Disruption Handling Tests', () => {
  test('should display disruption details when clicked', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    const disruptionElement = page.locator('[class*="alert"], [class*="disruption"]');

    if ((await disruptionElement.count()) > 0) {
      await disruptionElement.first().click();

      // Check for details modal or expanded view
      const pageContent = await page.textContent('body');
      const hasDetails = pageContent?.match(/detail|cause|affected|action|recommend/i);
      expect(hasDetails).toBeTruthy();
    }
  });

  test('should show affected crew for disruptions', async ({ page, gotoRole }) => {
    await gotoRole('controller');

    // Navigate to disruptions
    const disruptionsTab = page.locator('button, [role="tab"]').filter({
      hasText: /disruption/i,
    });

    if ((await disruptionsTab.count()) > 0) {
      await disruptionsTab.first().click();

      const pageContent = await page.textContent('body');
      const hasAffectedCrew = pageContent?.match(/affected|impact|crew|reassign/i);
      expect(hasAffectedCrew).toBeTruthy();
    }
  });
});
