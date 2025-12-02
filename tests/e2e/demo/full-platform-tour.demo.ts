import { test, expect, setCurrentScenario } from './demo-fixtures';
import { fullPlatformTour, demoScenarios } from './narration-data';

/**
 * Full Platform Tour Demo Script
 *
 * Comprehensive demonstration of all Aioscrew features.
 * This is the MAIN DEMO SCRIPT for investor presentations,
 * sales demos, and marketing materials.
 *
 * Duration: ~5-6 minutes
 *
 * Run with: npx playwright test full-platform-tour.demo.ts --headed
 */

test.describe('Full Platform Tour Demo', () => {
  test.beforeAll(() => {
    setCurrentScenario(fullPlatformTour);
  });

  test('Complete Aioscrew Platform Tour', async ({
    page,
    gotoRole,
    executeStep,
    highlightElement,
    scrollToElement,
    demoScreenshot,
    demoWait,
    emitDemoEvent,
    setDemoPace,
  }) => {
    test.setTimeout(600000); // 10 minutes max

    // Set demo pace for presentation
    setDemoPace('normal');

    // ========================================
    // INTRODUCTION
    // ========================================
    emitDemoEvent('demo:start', {
      scenarioId: fullPlatformTour.id,
      title: 'Complete Aioscrew Platform Demonstration',
      estimatedDuration: fullPlatformTour.estimatedDuration,
    });

    emitDemoEvent('section:start', { section: 'introduction' });
    emitDemoEvent('step:narration', {
      text: "Welcome to the complete Aioscrew platform demonstration. Over the next few minutes, we'll explore how AI transforms airline crew management.",
      voiceStyle: 'professional',
    });

    await page.goto('/');
    await expect(page.locator('h1')).toContainText(/Copa Airlines/i);
    await demoScreenshot('intro-landing', 'Aioscrew Landing Page');
    await demoWait(4000, 'Introduction');

    // ========================================
    // SECTION 1: LANDING PAGE & ROLES
    // ========================================
    emitDemoEvent('section:start', { section: 'landing-page' });
    emitDemoEvent('step:narration', {
      text: "Aioscrew serves 8 distinct user roles, from flight crew to executives. Each role has a specialized dashboard tailored to their specific workflow.",
      voiceStyle: 'explanatory',
    });

    await demoWait(3000);
    await demoScreenshot('roles-overview', 'All User Roles');

    // Highlight each role briefly
    const roleHighlights = [
      { name: 'Crew Member', time: 1500 },
      { name: 'Payroll', time: 1500 },
      { name: 'Scheduler', time: 1500 },
      { name: 'Controller', time: 1500 },
      { name: 'Executive', time: 1500 },
    ];

    for (const role of roleHighlights) {
      const roleButton = page.locator('button').filter({ hasText: new RegExp(role.name, 'i') });
      if ((await roleButton.count()) > 0) {
        await highlightElement(`button:has-text("${role.name}")`, role.time);
      }
    }

    // ========================================
    // SECTION 2: CREW MEMBER EXPERIENCE
    // ========================================
    emitDemoEvent('section:start', { section: 'crew-member' });
    emitDemoEvent('step:narration', {
      text: "Let's start with the Crew Member experience. Flight attendants and pilots use this dashboard to view schedules, submit claims, and track earnings.",
      voiceStyle: 'explanatory',
    });

    await gotoRole('crew-member');
    await demoWait(2000);
    await demoScreenshot('crew-dashboard', 'Crew Member Dashboard');

    emitDemoEvent('step:narration', {
      text: 'The dashboard provides at-a-glance access to upcoming trips, year-to-date earnings, and claim status.',
    });

    await demoWait(3000);

    // Show schedule
    const scheduleSection = page.locator('[class*="schedule"], [class*="trip"], [class*="calendar"]');
    if ((await scheduleSection.count()) > 0) {
      await highlightElement('[class*="schedule"], [class*="trip"]', 2500);
    }

    await demoWait(2000);

    // ========================================
    // SECTION 3: AI VALIDATION (MAIN SHOWCASE)
    // ========================================
    emitDemoEvent('section:start', { section: 'ai-validation' });
    emitDemoEvent('step:narration', {
      text: "Now for the centerpiece: our multi-agent AI validation system. This is where Aioscrew truly differentiates from traditional crew management systems.",
      voiceStyle: 'excited',
    });

    await page.goto('/');
    await gotoRole('payroll-admin');
    await demoWait(2000);
    await demoScreenshot('payroll-dashboard', 'Payroll Admin Dashboard');

    emitDemoEvent('step:narration', {
      text: 'The Payroll Admin dashboard shows pending claims. Traditionally, validating these would take hours of manual review.',
    });

    await demoWait(3000);

    emitDemoEvent('step:narration', {
      text: 'Our system uses three specialized AI agents running in parallel: Flight Time Calculator with GPT-4, Premium Pay Calculator with Claude Sonnet, and Compliance Validator with Claude Opus.',
    });

    await demoWait(5000);

    // Try to trigger validation
    const validateButton = page.locator('button').filter({
      hasText: /validate|start.*validation/i,
    });

    if ((await validateButton.count()) > 0) {
      emitDemoEvent('step:narration', {
        text: "Watch as we validate a claim. All three agents process simultaneously, reducing time from 60 seconds to under 20.",
        voiceStyle: 'excited',
      });

      await highlightElement('button:has-text("Validate")', 2000);
      await validateButton.first().click();

      emitDemoEvent('ai:validation:start', { timestamp: Date.now() });

      // Monitor progress
      await demoWait(3000, 'Agents starting');

      emitDemoEvent('step:narration', {
        text: 'The Flight Time Calculator validates duty hours. The Premium Pay Calculator checks contract eligibility. The Compliance Validator performs legal analysis.',
      });

      // Wait for completion
      await expect(
        page.locator('text=/complete|approved|flagged|rejected/i')
      ).toBeVisible({ timeout: 45000 });

      emitDemoEvent('ai:validation:complete', { timestamp: Date.now() });

      await demoScreenshot('validation-complete', 'AI Validation Complete');

      emitDemoEvent('step:narration', {
        text: 'Validation complete! The system provides a recommendation with confidence score and full audit trail.',
        voiceStyle: 'excited',
      });

      await demoWait(4000);
    }

    // Show cost savings
    emitDemoEvent('step:narration', {
      text: 'This multi-LLM approach saves 66% in AI costs. Using the right model for each task optimizes both accuracy and expense.',
    });

    await demoWait(3000);

    // ========================================
    // SECTION 4: OPERATIONS CONTROLLER
    // ========================================
    emitDemoEvent('section:start', { section: 'controller' });
    emitDemoEvent('step:narration', {
      text: "Next, let's visit the Operations Control Center - the nerve center for real-time crew management.",
    });

    await page.goto('/');
    await gotoRole('controller');
    await demoWait(2000);
    await demoScreenshot('ops-center', 'Operations Control Center');

    emitDemoEvent('step:narration', {
      text: 'Controllers monitor active flights, manage disruptions, and coordinate reserve crew deployments in real-time.',
    });

    await demoWait(3000);

    // Show key features
    const opsFeatures = page.locator('[class*="flight"], [class*="status"], [class*="alert"]');
    if ((await opsFeatures.count()) > 0) {
      await highlightElement('[class*="flight"], [class*="status"]', 2500);
    }

    emitDemoEvent('step:narration', {
      text: 'AI recommendations help controllers make optimal decisions during disruptions, considering crew qualifications, proximity, and regulatory limits.',
    });

    await demoWait(4000);

    // ========================================
    // SECTION 5: EXECUTIVE DASHBOARD
    // ========================================
    emitDemoEvent('section:start', { section: 'executive' });
    emitDemoEvent('step:narration', {
      text: "Finally, let's see the Executive Dashboard - strategic intelligence for C-Suite leadership.",
    });

    await page.goto('/');
    await gotoRole('executive');
    await demoWait(2000);
    await demoScreenshot('executive-dashboard', 'Executive Dashboard');

    emitDemoEvent('step:narration', {
      text: 'Key performance indicators, cost analytics, and operational trends provide actionable business intelligence.',
    });

    await demoWait(3000);

    const kpiSection = page.locator('[class*="kpi"], [class*="metric"], [class*="stat"]');
    if ((await kpiSection.count()) > 0) {
      await highlightElement('[class*="kpi"], [class*="metric"]', 2500);
    }

    await demoWait(2000);

    // ========================================
    // CONCLUSION
    // ========================================
    emitDemoEvent('section:start', { section: 'conclusion' });
    emitDemoEvent('step:narration', {
      text: "That concludes our tour of Aioscrew. We've seen how multi-agent AI, intelligent routing, and enterprise architecture transform crew operations.",
      voiceStyle: 'professional',
    });

    await demoWait(4000);

    emitDemoEvent('step:narration', {
      text: 'Key takeaways: 3x faster validation, 66% cost reduction, full audit compliance, and an intuitive user experience across all roles.',
    });

    await demoWait(4000);

    emitDemoEvent('step:narration', {
      text: 'Thank you for watching. Aioscrew - AI-powered crew management from dCortex.',
      voiceStyle: 'professional',
    });

    await demoScreenshot('tour-complete', 'Demo Complete');

    // Demo complete
    emitDemoEvent('demo:complete', {
      scenarioId: fullPlatformTour.id,
      success: true,
      totalDuration: fullPlatformTour.estimatedDuration,
    });
  });
});

test.describe('Quick Platform Overview (2 minutes)', () => {
  test('Rapid Platform Demo', async ({
    page,
    gotoRole,
    demoScreenshot,
    demoWait,
    emitDemoEvent,
    setDemoPace,
  }) => {
    test.setTimeout(180000);
    setDemoPace('fast');

    emitDemoEvent('demo:start', { scenarioId: 'quick-overview' });

    // Landing
    await page.goto('/');
    await demoScreenshot('quick-landing', 'Landing');
    await demoWait(1500);

    // Crew Member
    await gotoRole('crew-member');
    await demoScreenshot('quick-crew', 'Crew Member');
    await demoWait(1500);

    // Payroll
    await page.goto('/');
    await gotoRole('payroll-admin');
    await demoScreenshot('quick-payroll', 'Payroll Admin');
    await demoWait(1500);

    // Controller
    await page.goto('/');
    await gotoRole('controller');
    await demoScreenshot('quick-controller', 'Controller');
    await demoWait(1500);

    // Executive
    await page.goto('/');
    await gotoRole('executive');
    await demoScreenshot('quick-executive', 'Executive');
    await demoWait(1500);

    emitDemoEvent('demo:complete', { scenarioId: 'quick-overview' });
  });
});

test.describe('AI Features Highlight (3 minutes)', () => {
  test('AI Capabilities Showcase', async ({
    page,
    gotoRole,
    waitForAIValidation,
    demoScreenshot,
    demoWait,
    emitDemoEvent,
  }) => {
    test.setTimeout(240000);

    emitDemoEvent('demo:start', { scenarioId: 'ai-highlight' });

    // Navigate to Payroll
    await gotoRole('payroll-admin');
    await demoWait(2000);

    emitDemoEvent('step:narration', {
      text: 'Aioscrew uses multiple AI models for different tasks. GPT-4 for fast calculations, Claude Sonnet for reasoning, Claude Opus for legal analysis.',
    });

    await demoWait(5000);

    // Try validation
    const validateButton = page.locator('button').filter({ hasText: /validate/i });

    if ((await validateButton.count()) > 0) {
      emitDemoEvent('step:narration', {
        text: 'Three agents run in parallel, completing in 20 seconds what would take 60 sequentially.',
      });

      await validateButton.first().click();
      await waitForAIValidation();
      await demoScreenshot('ai-result', 'AI Validation Result');

      emitDemoEvent('step:narration', {
        text: 'Cost optimization: 66% savings by using the right model for each task.',
      });

      await demoWait(4000);
    }

    // Show technology matrix if available
    const techMatrix = page.locator('text=/technology.*matrix|selection/i');
    if ((await techMatrix.count()) > 0) {
      await page.evaluate(() => {
        const el = document.querySelector('[class*="matrix"]');
        el?.scrollIntoView({ behavior: 'smooth' });
      });
      await demoScreenshot('tech-matrix', 'Technology Selection Matrix');
    }

    emitDemoEvent('demo:complete', { scenarioId: 'ai-highlight' });
  });
});

test.describe('All Roles Quick Access Test', () => {
  const roles = [
    'crew-member',
    'payroll-admin',
    'scheduler',
    'crew-scheduler',
    'controller',
    'management',
    'union',
    'executive',
  ] as const;

  for (const role of roles) {
    test(`should access ${role} dashboard`, async ({ page, gotoRole, demoScreenshot }) => {
      await gotoRole(role);
      await expect(page.locator('h1, h2, [class*="header"]')).toBeVisible({ timeout: 10000 });
      await demoScreenshot(`role-${role}`, `${role} dashboard`);
    });
  }
});
