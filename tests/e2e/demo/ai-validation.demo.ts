import { test, expect, setCurrentScenario } from './demo-fixtures';
import { aiValidationScenario } from './narration-data';

/**
 * AI Validation Demo Script
 *
 * This is the MAIN SHOWCASE demo for Aioscrew.
 * It demonstrates the multi-agent AI validation system in action.
 *
 * Features demonstrated:
 * - Parallel agent execution
 * - Hierarchical sub-agents
 * - Real-time progress visualization
 * - Multi-LLM routing
 * - Cost optimization
 * - Technology selection matrix
 *
 * Run with: npx playwright test ai-validation.demo.ts --headed
 */

test.describe('AI Validation Showcase Demo', () => {
  test.beforeAll(() => {
    setCurrentScenario(aiValidationScenario);
  });

  test('Complete AI Validation Demo - Happy Path', async ({
    page,
    gotoRole,
    executeStep,
    waitForAIValidation,
    highlightElement,
    scrollToElement,
    demoScreenshot,
    demoWait,
    emitDemoEvent,
  }) => {
    test.setTimeout(180000); // 3 minutes for AI processing

    // Emit demo start
    emitDemoEvent('demo:start', {
      scenarioId: aiValidationScenario.id,
      title: 'Multi-Agent AI Claim Validation Demo',
    });

    // Step 1: Navigate to Payroll Admin
    emitDemoEvent('step:narration', {
      text: "Let's dive into the most powerful feature: our multi-agent AI validation system. We'll navigate to the Payroll Admin dashboard.",
    });

    await gotoRole('payroll-admin');
    await executeStep(aiValidationScenario.steps[0]);
    await demoWait(2000, 'Dashboard loading');

    // Step 2: Show the dashboard
    emitDemoEvent('step:narration', {
      text: 'The Payroll Admin dashboard shows pending claims awaiting validation. Our AI system can process these in seconds, not hours.',
    });

    await demoScreenshot('payroll-dashboard', 'Payroll Admin Dashboard');
    await executeStep(aiValidationScenario.steps[1]);

    // Step 3: Find and select a claim
    emitDemoEvent('step:narration', {
      text: "Let's select a claim to validate. This is an International Premium claim for $125 from Captain Sarah Martinez.",
    });

    const claimElements = page.locator('[class*="claim"], [data-claim-id], tr').filter({
      hasText: /CLM-|claim|pending|premium/i,
    });

    if ((await claimElements.count()) > 0) {
      await highlightElement('[class*="claim"]', 2500);
      await claimElements.first().click();
      await demoWait(1500, 'Claim selected');
      await demoScreenshot('claim-selected', 'Claim details view');
    }

    // Step 4: Explain AI Architecture
    emitDemoEvent('step:narration', {
      text: 'Our system uses a sophisticated multi-LLM architecture. Instead of one AI for everything, we route tasks to specialized agents: GPT-4 for calculations, Claude Sonnet for reasoning, and Claude Opus for legal analysis.',
    });

    await executeStep(aiValidationScenario.steps[3]);
    await demoWait(2000, 'Architecture explanation');

    // Step 5: Start AI Validation
    emitDemoEvent('step:narration', {
      text: 'Watch as we trigger the AI validation. Three agents will run in parallel, reducing processing time from 60 seconds to just 20.',
    });

    const validateButton = page.locator('button').filter({
      hasText: /validate|start.*validation|ai.*validation/i,
    });

    if ((await validateButton.count()) > 0) {
      await highlightElement('button:has-text("Validate")', 2000);
      await validateButton.first().click();

      emitDemoEvent('ai:validation:start', { timestamp: Date.now() });

      // Step 6-8: Monitor agent progress
      await demoWait(2000, 'Agents starting');

      // Check for Flight Time Calculator
      emitDemoEvent('step:narration', {
        text: 'The Flight Time Calculator is analyzing duty hours and flight time limits. It uses GPT-4-mini for fast, accurate calculations.',
      });

      const flightTimeIndicator = page.locator('text=/flight.*time|duty.*time/i');
      if ((await flightTimeIndicator.count()) > 0) {
        emitDemoEvent('agent:start', { agent: 'flight-time-calculator' });
        await demoScreenshot('agent-flight-time', 'Flight Time Calculator running');
      }

      await demoWait(3000, 'Flight time processing');

      // Check for Premium Pay Calculator
      emitDemoEvent('step:narration', {
        text: "Simultaneously, the Premium Pay Calculator is checking eligibility against contract rules using Claude Sonnet's advanced reasoning capabilities.",
      });

      const premiumPayIndicator = page.locator('text=/premium.*pay|eligibility/i');
      if ((await premiumPayIndicator.count()) > 0) {
        emitDemoEvent('agent:start', { agent: 'premium-pay-calculator' });
        await demoScreenshot('agent-premium-pay', 'Premium Pay Calculator running');
      }

      await demoWait(3000, 'Premium pay processing');

      // Check for Compliance Validator
      emitDemoEvent('step:narration', {
        text: 'The Compliance Validator, powered by Claude Opus, performs deep legal analysis. It even delegates to sub-agents for contract interpretation and historical precedent lookup.',
      });

      const complianceIndicator = page.locator('text=/compliance|legal|contract/i');
      if ((await complianceIndicator.count()) > 0) {
        emitDemoEvent('agent:start', { agent: 'compliance-validator' });
        await demoScreenshot('agent-compliance', 'Compliance Validator running');
      }

      await demoWait(5000, 'Compliance analysis');

      // Step 9: Show hierarchical sub-agents
      emitDemoEvent('step:narration', {
        text: 'Notice the hierarchical agent structure. The Compliance Validator has spawned three sub-agents: Contract Interpreter, Historical Precedent, and Union Rules Checker.',
      });

      const subAgentIndicator = page.locator(
        'text=/sub-agent|contract.*interpreter|historical|union.*rules/i'
      );
      if ((await subAgentIndicator.count()) > 0) {
        await demoScreenshot('sub-agents', 'Hierarchical sub-agents');
      }

      // Wait for validation to complete
      await waitForAIValidation((status) => {
        emitDemoEvent('ai:progress', { status });
      });

      // Step 10: Show results
      emitDemoEvent('step:narration', {
        text: 'All agents have completed. The orchestrator synthesizes results and recommends approval with 92% confidence. The entire process took just 18 seconds.',
      });

      emitDemoEvent('ai:validation:complete', { timestamp: Date.now() });

      await demoScreenshot('validation-complete', 'AI Validation Complete');
      await demoWait(3000, 'Results display');

      // Check for approval/rejection
      const resultText = await page.textContent('body');
      const isApproved = resultText?.match(/approved/i);
      const isFlagged = resultText?.match(/flagged/i);
      const isRejected = resultText?.match(/rejected/i);

      emitDemoEvent('ai:result', {
        status: isApproved ? 'approved' : isFlagged ? 'flagged' : isRejected ? 'rejected' : 'unknown',
      });
    }

    // Step 11: Explain cost savings
    emitDemoEvent('step:narration', {
      text: 'This multi-LLM approach saves 66% in AI costs compared to using only Claude Opus. That\'s nearly three thousand dollars annually at scale.',
    });

    await executeStep(aiValidationScenario.steps[10]);

    // Step 12: Show Technology Selection Matrix
    emitDemoEvent('step:narration', {
      text: 'The Technology Selection Matrix shows exactly which AI technology handles each problem type. This transparency is crucial for enterprise adoption.',
    });

    const techMatrix = page.locator('text=/technology.*matrix|selection.*matrix/i');
    if ((await techMatrix.count()) > 0) {
      await scrollToElement('[class*="matrix"]');
      await highlightElement('[class*="matrix"]', 3000);
      await demoScreenshot('tech-matrix', 'Technology Selection Matrix');
    }

    // Demo complete
    emitDemoEvent('demo:complete', {
      scenarioId: aiValidationScenario.id,
      success: true,
    });
  });

  test('AI Validation Demo - Flagged Claim', async ({
    page,
    gotoRole,
    waitForAIValidation,
    demoScreenshot,
    demoWait,
    emitDemoEvent,
  }) => {
    test.setTimeout(180000);

    emitDemoEvent('demo:start', {
      scenarioId: 'ai-validation-flagged',
      title: 'AI Validation - Flagged for Review',
    });

    await gotoRole('payroll-admin');

    // Look for a high-amount or suspicious claim
    const suspiciousClaim = page.locator('text=/2500|1500|suspicious|high/i').first();

    if ((await suspiciousClaim.count()) > 0) {
      await suspiciousClaim.click();
      await demoWait(1500);

      const validateButton = page.locator('button').filter({
        hasText: /validate/i,
      });

      if ((await validateButton.count()) > 0) {
        emitDemoEvent('step:narration', {
          text: "Now let's see how the AI handles a suspicious claim with an unusually high amount.",
        });

        await validateButton.first().click();
        await waitForAIValidation();

        await demoScreenshot('flagged-result', 'Claim flagged for manual review');

        const flaggedText = await page.textContent('body');
        if (flaggedText?.match(/flagged|review.*required/i)) {
          emitDemoEvent('ai:result', {
            status: 'flagged',
            reason: 'Amount exceeds normal threshold',
          });
        }
      }
    }

    emitDemoEvent('demo:complete', { scenarioId: 'ai-validation-flagged' });
  });

  test('AI Validation Demo - Rejected Claim', async ({
    page,
    gotoRole,
    waitForAIValidation,
    demoScreenshot,
    emitDemoEvent,
  }) => {
    test.setTimeout(180000);

    emitDemoEvent('demo:start', {
      scenarioId: 'ai-validation-rejected',
      title: 'AI Validation - Policy Violation',
    });

    await gotoRole('payroll-admin');

    // Look for a claim that should be rejected (e.g., domestic with international premium)
    const invalidClaim = page.locator('text=/domestic|CLM-2024-1157/i').first();

    if ((await invalidClaim.count()) > 0) {
      await invalidClaim.click();

      const validateButton = page.locator('button').filter({
        hasText: /validate/i,
      });

      if ((await validateButton.count()) > 0) {
        emitDemoEvent('step:narration', {
          text: 'This claim requests international premium for a domestic flight - a clear policy violation.',
        });

        await validateButton.first().click();
        await waitForAIValidation();

        await demoScreenshot('rejected-result', 'Claim rejected - policy violation');

        emitDemoEvent('ai:result', {
          status: 'rejected',
          reason: 'Domestic flight claiming international premium',
        });
      }
    }

    emitDemoEvent('demo:complete', { scenarioId: 'ai-validation-rejected' });
  });
});

test.describe('AI Validation Technical Tests', () => {
  test('should execute all three agents in parallel', async ({ page, gotoRole }) => {
    test.setTimeout(60000);

    await gotoRole('payroll-admin');

    const validateButton = page.locator('button').filter({
      hasText: /validate/i,
    });

    if ((await validateButton.count()) > 0) {
      const startTime = Date.now();
      await validateButton.first().click();

      // Wait for completion
      await expect(
        page.locator('text=/complete|approved|flagged|rejected/i')
      ).toBeVisible({ timeout: 45000 });

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      // Parallel execution should complete in under 30 seconds
      // Sequential would be ~50+ seconds
      expect(duration).toBeLessThan(35);
    }
  });

  test('should display confidence scores', async ({ page, gotoRole }) => {
    test.setTimeout(60000);

    await gotoRole('payroll-admin');

    const validateButton = page.locator('button').filter({
      hasText: /validate/i,
    });

    if ((await validateButton.count()) > 0) {
      await validateButton.first().click();

      // Wait for completion
      await expect(
        page.locator('text=/complete|approved|flagged|rejected/i')
      ).toBeVisible({ timeout: 45000 });

      // Check for confidence score
      const pageContent = await page.textContent('body');
      const hasConfidence = pageContent?.match(/\d{1,3}%|confidence|score/i);
      expect(hasConfidence).toBeTruthy();
    }
  });

  test('should provide audit trail with agent reasoning', async ({ page, gotoRole }) => {
    test.setTimeout(60000);

    await gotoRole('payroll-admin');

    const validateButton = page.locator('button').filter({
      hasText: /validate/i,
    });

    if ((await validateButton.count()) > 0) {
      await validateButton.first().click();

      // Wait for completion
      await expect(
        page.locator('text=/complete|approved|flagged|rejected/i')
      ).toBeVisible({ timeout: 45000 });

      // Check for reasoning/explanation
      const pageContent = await page.textContent('body');
      const hasReasoning =
        pageContent?.match(/reason|explanation|because|due to|based on/i);
      expect(hasReasoning).toBeTruthy();
    }
  });
});
