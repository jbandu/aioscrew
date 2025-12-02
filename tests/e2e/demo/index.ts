/**
 * Aioscrew Demo Module
 *
 * Export all demo fixtures, scenarios, and utilities
 * for use by demo-pilot and other integrations.
 */

// Demo fixtures
export {
  test,
  expect,
  getDemoEvents,
  clearDemoEvents,
  setCurrentScenario,
} from './demo-fixtures';

export type {
  DemoStep,
  DemoScenario,
  Role,
  DemoFixtures,
} from './demo-fixtures';

// Narration data
export {
  demoScenarios,
  getScenario,
  getScenarioIds,
  getTotalDemoTime,
  narrationSegments,
  landingPageScenario,
  aiValidationScenario,
  crewMemberScenario,
  controllerScenario,
  executiveScenario,
  fullPlatformTour,
} from './narration-data';

export type {
  VoiceStyle,
  NarrationSegment,
} from './narration-data';

/**
 * Quick reference for running demos:
 *
 * Full Platform Tour:
 *   npx playwright test full-platform-tour.demo.ts --headed
 *
 * AI Validation Showcase:
 *   npx playwright test ai-validation.demo.ts --headed
 *
 * Landing Page Demo:
 *   npx playwright test landing-page.demo.ts --headed
 *
 * Crew Member Demo:
 *   npx playwright test crew-member.demo.ts --headed
 *
 * Controller Demo:
 *   npx playwright test controller.demo.ts --headed
 *
 * Quick Overview (2 min):
 *   npx playwright test full-platform-tour.demo.ts --headed -g "Quick Platform Overview"
 *
 * All Demos:
 *   npx playwright test tests/e2e/demo/*.demo.ts --headed
 */
