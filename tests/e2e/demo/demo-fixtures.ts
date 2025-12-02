import { test as base, expect, Page } from '@playwright/test';

/**
 * Demo Fixtures for Aioscrew E2E Tests & Demo-Pilot Integration
 *
 * These fixtures provide:
 * 1. Step-by-step narration metadata for TTS (Eleven Labs)
 * 2. Synchronized actions with configurable delays
 * 3. Screenshot capture at key moments
 * 4. Event emission for demo-pilot coordination
 */

export interface DemoStep {
  id: string;
  action: string;
  narration: string;
  duration: number; // estimated duration in ms
  screenshotName?: string;
  highlightSelector?: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number; // total duration in seconds
  steps: DemoStep[];
}

export type Role =
  | 'crew-member'
  | 'payroll-admin'
  | 'scheduler'
  | 'crew-scheduler'
  | 'controller'
  | 'management'
  | 'union'
  | 'executive';

export interface DemoFixtures {
  /**
   * Navigate to a specific role dashboard
   */
  gotoRole: (role: Role) => Promise<void>;

  /**
   * Execute a demo step with narration sync
   */
  executeStep: (step: DemoStep) => Promise<void>;

  /**
   * Wait for AI validation to complete with progress updates
   */
  waitForAIValidation: (onProgress?: (status: string) => void) => Promise<void>;

  /**
   * Emit event for demo-pilot synchronization
   */
  emitDemoEvent: (eventName: string, data: Record<string, unknown>) => void;

  /**
   * Get current demo scenario metadata
   */
  getDemoMetadata: () => DemoScenario | null;

  /**
   * Set demo pace (for live demos vs automated testing)
   */
  setDemoPace: (pace: 'fast' | 'normal' | 'slow') => void;

  /**
   * Highlight an element for demo purposes
   */
  highlightElement: (selector: string, duration?: number) => Promise<void>;

  /**
   * Scroll element into view smoothly for demo
   */
  scrollToElement: (selector: string) => Promise<void>;

  /**
   * Wait with visual countdown (for demo pacing)
   */
  demoWait: (ms: number, reason?: string) => Promise<void>;

  /**
   * Take a demo screenshot with metadata
   */
  demoScreenshot: (name: string, description?: string) => Promise<void>;
}

// Demo pace multipliers
const PACE_MULTIPLIERS = {
  fast: 0.5,
  normal: 1.0,
  slow: 2.0,
};

// Global demo state
let currentScenario: DemoScenario | null = null;
let currentPace: 'fast' | 'normal' | 'slow' = 'normal';
let demoEvents: Array<{ event: string; data: Record<string, unknown>; timestamp: number }> = [];

export const test = base.extend<DemoFixtures>({
  gotoRole: async ({ page }, use) => {
    const navigate = async (role: Role) => {
      await page.goto('/');

      // Wait for landing page
      await expect(page.locator('h1')).toContainText(/Copa Airlines/i);

      const roleMap: Record<Role, string> = {
        'crew-member': 'Crew Member',
        'payroll-admin': 'Payroll Admin',
        'scheduler': 'Crew Scheduler',
        'crew-scheduler': 'Crew Scheduling',
        'controller': 'Operations Controller',
        'management': 'Management',
        'union': 'Union Representative',
        'executive': 'Executive Dashboard',
      };

      // Find and click the role button
      const roleButton = page.locator('button, [role="button"]').filter({
        hasText: new RegExp(roleMap[role], 'i'),
      });

      await roleButton.first().click();

      // Wait for navigation
      await page.waitForLoadState('networkidle');
    };

    await use(navigate);
  },

  executeStep: async ({ page }, use) => {
    const execute = async (step: DemoStep) => {
      const multiplier = PACE_MULTIPLIERS[currentPace];

      // Emit step start event
      demoEvents.push({
        event: 'step:start',
        data: { stepId: step.id, narration: step.narration },
        timestamp: Date.now(),
      });

      // Log for demo-pilot coordination
      console.log(`[DEMO-STEP] ${step.id}: ${step.narration}`);

      // Highlight element if specified
      if (step.highlightSelector) {
        await page.evaluate((selector) => {
          const el = document.querySelector(selector);
          if (el) {
            (el as HTMLElement).style.outline = '3px solid #3B82F6';
            (el as HTMLElement).style.outlineOffset = '2px';
            (el as HTMLElement).style.transition = 'outline 0.3s ease';
          }
        }, step.highlightSelector);
      }

      // Wait for the step duration (adjusted by pace)
      await page.waitForTimeout(step.duration * multiplier);

      // Take screenshot if specified
      if (step.screenshotName) {
        await page.screenshot({
          path: `demo-screenshots/${step.screenshotName}.png`,
          fullPage: false,
        });
      }

      // Remove highlight
      if (step.highlightSelector) {
        await page.evaluate((selector) => {
          const el = document.querySelector(selector);
          if (el) {
            (el as HTMLElement).style.outline = '';
            (el as HTMLElement).style.outlineOffset = '';
          }
        }, step.highlightSelector);
      }

      // Emit step complete event
      demoEvents.push({
        event: 'step:complete',
        data: { stepId: step.id },
        timestamp: Date.now(),
      });
    };

    await use(execute);
  },

  waitForAIValidation: async ({ page }, use) => {
    const waitForValidation = async (onProgress?: (status: string) => void) => {
      // Wait for validation to start
      const validationStart = page.locator('text=/validating|processing|analyzing/i');

      if (await validationStart.count() > 0) {
        onProgress?.('Validation started');

        // Monitor agent progress
        const agentPatterns = [
          { pattern: /flight.*time/i, name: 'Flight Time Calculator' },
          { pattern: /premium.*pay/i, name: 'Premium Pay Calculator' },
          { pattern: /compliance/i, name: 'Compliance Validator' },
        ];

        // Check for each agent completion
        for (const agent of agentPatterns) {
          const agentElement = page.locator(`text=${agent.pattern}`);
          if (await agentElement.count() > 0) {
            onProgress?.(`${agent.name} running...`);
          }
        }
      }

      // Wait for completion
      await expect(
        page.locator('text=/complete|approved|flagged|rejected|recommendation/i')
      ).toBeVisible({ timeout: 45000 });

      onProgress?.('Validation complete');
    };

    await use(waitForValidation);
  },

  emitDemoEvent: async ({}, use) => {
    const emit = (eventName: string, data: Record<string, unknown>) => {
      const event = {
        event: eventName,
        data,
        timestamp: Date.now(),
      };
      demoEvents.push(event);

      // Log for demo-pilot integration
      console.log(`[DEMO-EVENT] ${eventName}:`, JSON.stringify(data));

      // If running in demo-pilot context, emit to parent
      if (typeof process !== 'undefined' && process.send) {
        process.send(event);
      }
    };

    await use(emit);
  },

  getDemoMetadata: async ({}, use) => {
    await use(() => currentScenario);
  },

  setDemoPace: async ({}, use) => {
    await use((pace: 'fast' | 'normal' | 'slow') => {
      currentPace = pace;
      console.log(`[DEMO] Pace set to: ${pace} (${PACE_MULTIPLIERS[pace]}x)`);
    });
  },

  highlightElement: async ({ page }, use) => {
    const highlight = async (selector: string, duration = 2000) => {
      await page.evaluate(
        ({ selector, duration }) => {
          const el = document.querySelector(selector);
          if (el) {
            const htmlEl = el as HTMLElement;
            const originalOutline = htmlEl.style.outline;
            const originalOffset = htmlEl.style.outlineOffset;

            htmlEl.style.outline = '3px solid #3B82F6';
            htmlEl.style.outlineOffset = '4px';
            htmlEl.style.transition = 'all 0.3s ease';

            // Add pulse animation
            htmlEl.animate([
              { outlineColor: '#3B82F6' },
              { outlineColor: '#60A5FA' },
              { outlineColor: '#3B82F6' },
            ], {
              duration: 1000,
              iterations: Math.ceil(duration / 1000),
            });

            setTimeout(() => {
              htmlEl.style.outline = originalOutline;
              htmlEl.style.outlineOffset = originalOffset;
            }, duration);
          }
        },
        { selector, duration }
      );

      await page.waitForTimeout(duration);
    };

    await use(highlight);
  },

  scrollToElement: async ({ page }, use) => {
    const scrollTo = async (selector: string) => {
      await page.evaluate((selector) => {
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, selector);

      await page.waitForTimeout(500); // Allow scroll animation
    };

    await use(scrollTo);
  },

  demoWait: async ({ page }, use) => {
    const wait = async (ms: number, reason?: string) => {
      const adjustedMs = ms * PACE_MULTIPLIERS[currentPace];

      if (reason) {
        console.log(`[DEMO-WAIT] ${reason} (${adjustedMs}ms)`);
      }

      await page.waitForTimeout(adjustedMs);
    };

    await use(wait);
  },

  demoScreenshot: async ({ page }, use) => {
    const screenshot = async (name: string, description?: string) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `demo-screenshots/${name}-${timestamp}.png`;

      await page.screenshot({
        path: filename,
        fullPage: false,
      });

      demoEvents.push({
        event: 'screenshot',
        data: { name, description, filename },
        timestamp: Date.now(),
      });

      console.log(`[DEMO-SCREENSHOT] ${name}: ${description || ''}`);
    };

    await use(screenshot);
  },
});

export { expect };

// Export demo event stream for external consumption
export function getDemoEvents() {
  return [...demoEvents];
}

export function clearDemoEvents() {
  demoEvents = [];
}

export function setCurrentScenario(scenario: DemoScenario) {
  currentScenario = scenario;
}
