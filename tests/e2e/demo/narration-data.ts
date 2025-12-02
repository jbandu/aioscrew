/**
 * Demo Narration Data for Aioscrew
 *
 * This file contains all narration scripts for demo scenarios.
 * These are designed to sync with Eleven Labs TTS for the demo-pilot app.
 *
 * Each narration includes:
 * - Text for TTS
 * - Timing information
 * - Associated UI actions
 * - Voice style hints
 */

import { DemoScenario, DemoStep } from './demo-fixtures';

// Voice style hints for Eleven Labs
export type VoiceStyle = 'professional' | 'excited' | 'explanatory' | 'conversational';

export interface NarrationSegment {
  id: string;
  text: string;
  voiceStyle: VoiceStyle;
  pauseAfter: number; // ms
  emphasize?: string[]; // words to emphasize
}

// ============================================
// LANDING PAGE DEMO
// ============================================

export const landingPageScenario: DemoScenario = {
  id: 'landing-page-overview',
  title: 'Aioscrew Platform Overview',
  description: 'Introduction to the Copa Airlines Crew Operating System',
  estimatedDuration: 60,
  steps: [
    {
      id: 'landing-1',
      action: 'load-landing',
      narration: "Welcome to Aioscrew, Copa Airlines' AI-powered Crew Operating System. This platform demonstrates enterprise-grade multi-agent AI architecture for automated claim validation and crew management.",
      duration: 6000,
      screenshotName: 'landing-overview',
    },
    {
      id: 'landing-2',
      action: 'highlight-roles',
      narration: "The platform serves 8 distinct user roles, each with specialized dashboards tailored to their workflow. Let's explore each one.",
      duration: 4000,
      highlightSelector: '[class*="grid"]',
    },
    {
      id: 'landing-3',
      action: 'show-crew-member',
      narration: "Crew Members can view their schedules, submit pay claims, and track their earnings in real-time.",
      duration: 3500,
      highlightSelector: 'button:has-text("Crew Member")',
    },
    {
      id: 'landing-4',
      action: 'show-payroll',
      narration: "Payroll Administrators use our multi-agent AI system to automatically validate claims, detecting fraud and ensuring compliance with union contracts.",
      duration: 4500,
      highlightSelector: 'button:has-text("Payroll")',
    },
    {
      id: 'landing-5',
      action: 'show-scheduler',
      narration: "Crew Schedulers can manage bidding, create rosters, and optimize crew assignments with AI assistance.",
      duration: 3500,
      highlightSelector: 'button:has-text("Scheduler")',
    },
    {
      id: 'landing-6',
      action: 'show-controller',
      narration: "Operations Controllers monitor real-time flight operations, manage disruptions, and coordinate reserve crew deployment.",
      duration: 4000,
      highlightSelector: 'button:has-text("Controller")',
    },
    {
      id: 'landing-7',
      action: 'show-management',
      narration: "Management has access to KPI dashboards, operational analytics, and performance metrics.",
      duration: 3500,
      highlightSelector: 'button:has-text("Management")',
    },
    {
      id: 'landing-8',
      action: 'show-union',
      narration: "Union Representatives can monitor compliance, track violations, and access advocacy analytics.",
      duration: 3500,
      highlightSelector: 'button:has-text("Union")',
    },
    {
      id: 'landing-9',
      action: 'show-executive',
      narration: "Executives get a strategic overview with real-time operational metrics and business intelligence.",
      duration: 3500,
      highlightSelector: 'button:has-text("Executive")',
    },
  ],
};

// ============================================
// AI VALIDATION SHOWCASE
// ============================================

export const aiValidationScenario: DemoScenario = {
  id: 'ai-validation-showcase',
  title: 'Multi-Agent AI Claim Validation',
  description: 'Demonstrates the parallel multi-agent AI system validating crew pay claims',
  estimatedDuration: 120,
  steps: [
    {
      id: 'ai-1',
      action: 'navigate-payroll',
      narration: "Let's dive into the most powerful feature: our multi-agent AI validation system. We'll navigate to the Payroll Admin dashboard.",
      duration: 4000,
    },
    {
      id: 'ai-2',
      action: 'show-dashboard',
      narration: "The Payroll Admin dashboard shows pending claims awaiting validation. Our AI system can process these in seconds, not hours.",
      duration: 4500,
      screenshotName: 'payroll-dashboard',
    },
    {
      id: 'ai-3',
      action: 'select-claim',
      narration: "Let's select a claim to validate. This is an International Premium claim for one hundred twenty-five dollars from Captain Sarah Martinez.",
      duration: 4000,
      highlightSelector: '[class*="claim"]',
    },
    {
      id: 'ai-4',
      action: 'explain-ai-architecture',
      narration: "Our system uses a sophisticated multi-LLM architecture. Instead of one AI for everything, we route tasks to specialized agents: GPT-4 for calculations, Claude Sonnet for reasoning, and Claude Opus for legal analysis.",
      duration: 7000,
    },
    {
      id: 'ai-5',
      action: 'start-validation',
      narration: "Watch as we trigger the AI validation. Three agents will run in parallel, reducing processing time from 60 seconds to just 20.",
      duration: 4000,
      highlightSelector: 'button:has-text("Validate")',
    },
    {
      id: 'ai-6',
      action: 'show-flight-time',
      narration: "The Flight Time Calculator is analyzing duty hours and flight time limits. It uses GPT-4-mini for fast, accurate calculations.",
      duration: 4500,
      highlightSelector: '[class*="flight"]',
    },
    {
      id: 'ai-7',
      action: 'show-premium-pay',
      narration: "Simultaneously, the Premium Pay Calculator is checking eligibility against contract rules using Claude Sonnet's advanced reasoning capabilities.",
      duration: 4500,
      highlightSelector: '[class*="premium"]',
    },
    {
      id: 'ai-8',
      action: 'show-compliance',
      narration: "The Compliance Validator, powered by Claude Opus, performs deep legal analysis. It even delegates to sub-agents for contract interpretation and historical precedent lookup.",
      duration: 5500,
      highlightSelector: '[class*="compliance"]',
    },
    {
      id: 'ai-9',
      action: 'show-hierarchy',
      narration: "Notice the hierarchical agent structure. The Compliance Validator has spawned three sub-agents: Contract Interpreter, Historical Precedent, and Union Rules Checker.",
      duration: 5000,
    },
    {
      id: 'ai-10',
      action: 'show-result',
      narration: "All agents have completed. The orchestrator synthesizes results and recommends approval with 92% confidence. The entire process took just 18 seconds.",
      duration: 5000,
      screenshotName: 'validation-complete',
    },
    {
      id: 'ai-11',
      action: 'explain-cost-savings',
      narration: "This multi-LLM approach saves 66% in AI costs compared to using only Claude Opus. That's nearly three thousand dollars annually at scale.",
      duration: 4500,
    },
    {
      id: 'ai-12',
      action: 'show-tech-matrix',
      narration: "The Technology Selection Matrix shows exactly which AI technology handles each problem type. This transparency is crucial for enterprise adoption.",
      duration: 4500,
      screenshotName: 'tech-matrix',
    },
  ],
};

// ============================================
// CREW MEMBER WORKFLOW
// ============================================

export const crewMemberScenario: DemoScenario = {
  id: 'crew-member-workflow',
  title: 'Crew Member Experience',
  description: 'Shows the crew member dashboard, schedule, and claim submission',
  estimatedDuration: 90,
  steps: [
    {
      id: 'crew-1',
      action: 'navigate-crew',
      narration: "Let's experience the platform from a crew member's perspective. Captain Sarah Martinez is logging in to check her schedule.",
      duration: 4000,
    },
    {
      id: 'crew-2',
      action: 'show-dashboard',
      narration: "The crew dashboard provides an at-a-glance view of upcoming trips, year-to-date earnings, and recent claims status.",
      duration: 4500,
      screenshotName: 'crew-dashboard',
    },
    {
      id: 'crew-3',
      action: 'show-schedule',
      narration: "The schedule view displays all assigned flights with details including route, aircraft type, and duty times.",
      duration: 4000,
      highlightSelector: '[class*="schedule"], [class*="calendar"]',
    },
    {
      id: 'crew-4',
      action: 'show-trip-details',
      narration: "Clicking on a trip reveals full details: flight numbers, departure times, layover information, and applicable pay premiums.",
      duration: 4500,
    },
    {
      id: 'crew-5',
      action: 'show-claims-history',
      narration: "The claims section shows all submitted pay claims with their current status. Green indicates approved, yellow is pending, and red marks rejected claims.",
      duration: 4500,
      highlightSelector: '[class*="claim"]',
    },
    {
      id: 'crew-6',
      action: 'start-claim-submission',
      narration: "Let's submit a new premium pay claim for an international flight. The form auto-populates trip data to reduce errors.",
      duration: 4500,
    },
    {
      id: 'crew-7',
      action: 'fill-claim-form',
      narration: "Sarah selects the trip, claim type, and verifies the amount. The system automatically calculates based on CBA rules.",
      duration: 4000,
    },
    {
      id: 'crew-8',
      action: 'submit-claim',
      narration: "Upon submission, the claim enters the validation queue. Sarah will receive real-time updates as AI agents process her request.",
      duration: 4000,
      screenshotName: 'claim-submitted',
    },
    {
      id: 'crew-9',
      action: 'show-ytd-earnings',
      narration: "Year-to-date earnings are tracked in real-time, broken down by category: base pay, flight time, premiums, and overtime.",
      duration: 4000,
      highlightSelector: '[class*="earnings"], [class*="ytd"]',
    },
    {
      id: 'crew-10',
      action: 'show-training',
      narration: "The training section tracks certifications, upcoming requirements, and expiration dates to ensure compliance.",
      duration: 3500,
    },
  ],
};

// ============================================
// OPERATIONS CONTROLLER DEMO
// ============================================

export const controllerScenario: DemoScenario = {
  id: 'operations-controller',
  title: 'Operations Control Center',
  description: 'Real-time operations monitoring and disruption management',
  estimatedDuration: 90,
  steps: [
    {
      id: 'ctrl-1',
      action: 'navigate-controller',
      narration: "The Operations Control Center is the nerve center of crew management. Let's see how controllers handle real-time operations.",
      duration: 4500,
    },
    {
      id: 'ctrl-2',
      action: 'show-ops-center',
      narration: "The main dashboard displays current flight status, active crew, and any operational alerts requiring attention.",
      duration: 4500,
      screenshotName: 'ops-center',
    },
    {
      id: 'ctrl-3',
      action: 'show-active-flights',
      narration: "Color-coded flight status indicators show on-time, delayed, and cancelled flights at a glance. Click any flight for details.",
      duration: 4500,
      highlightSelector: '[class*="flight"], [class*="status"]',
    },
    {
      id: 'ctrl-4',
      action: 'show-active-crew',
      narration: "The Active Crew view shows all crew currently on duty, their current assignment, and remaining duty time.",
      duration: 4000,
    },
    {
      id: 'ctrl-5',
      action: 'simulate-disruption',
      narration: "A disruption alert appears! Flight CM-450 is experiencing a mechanical delay. The system automatically identifies affected crew.",
      duration: 5000,
      highlightSelector: '[class*="alert"], [class*="disruption"]',
    },
    {
      id: 'ctrl-6',
      action: 'show-ai-recommendations',
      narration: "Our AI controller agent analyzes the situation and recommends optimal solutions: reassign affected passengers, activate reserve crew, or adjust subsequent flights.",
      duration: 5500,
    },
    {
      id: 'ctrl-7',
      action: 'show-reserve-pool',
      narration: "The Reserve Pool shows available crew members who can be called to cover disruptions. Qualifications and proximity are automatically considered.",
      duration: 4500,
      highlightSelector: '[class*="reserve"]',
    },
    {
      id: 'ctrl-8',
      action: 'assign-reserve',
      narration: "With one click, we can assign a reserve crew member. The system automatically notifies them and updates all affected systems.",
      duration: 4000,
    },
    {
      id: 'ctrl-9',
      action: 'show-gantt-timeline',
      narration: "The Gantt timeline provides a visual representation of all crew schedules, making it easy to identify conflicts and gaps.",
      duration: 4000,
      screenshotName: 'gantt-timeline',
    },
    {
      id: 'ctrl-10',
      action: 'show-shift-handoff',
      narration: "When shifts change, the handoff feature ensures incoming controllers receive a complete briefing of ongoing situations and pending actions.",
      duration: 4500,
    },
  ],
};

// ============================================
// EXECUTIVE DASHBOARD
// ============================================

export const executiveScenario: DemoScenario = {
  id: 'executive-dashboard',
  title: 'Executive Strategic Overview',
  description: 'C-Suite dashboard with KPIs and business intelligence',
  estimatedDuration: 60,
  steps: [
    {
      id: 'exec-1',
      action: 'navigate-executive',
      narration: "The Executive Dashboard provides C-Suite leadership with strategic operational metrics and business intelligence.",
      duration: 4000,
    },
    {
      id: 'exec-2',
      action: 'show-kpis',
      narration: "Key Performance Indicators are displayed prominently: on-time performance, crew utilization, cost efficiency, and customer satisfaction.",
      duration: 4500,
      screenshotName: 'executive-kpis',
      highlightSelector: '[class*="kpi"], [class*="metric"]',
    },
    {
      id: 'exec-3',
      action: 'show-cost-analysis',
      narration: "Cost analysis shows AI validation savings, reduced manual processing time, and improved fraud detection compared to traditional methods.",
      duration: 4500,
    },
    {
      id: 'exec-4',
      action: 'show-trends',
      narration: "Interactive charts display historical trends, enabling executives to identify patterns and make data-driven decisions.",
      duration: 4000,
      highlightSelector: '[class*="chart"], [class*="graph"]',
    },
    {
      id: 'exec-5',
      action: 'show-staffing',
      narration: "Staffing analytics reveal crew utilization rates, overtime trends, and predictions for future staffing needs based on scheduled operations.",
      duration: 4500,
    },
    {
      id: 'exec-6',
      action: 'show-compliance-summary',
      narration: "The compliance summary provides peace of mind: AI validation ensures all claims meet CBA requirements, reducing legal risk and union disputes.",
      duration: 4500,
    },
  ],
};

// ============================================
// FULL PLATFORM TOUR
// ============================================

export const fullPlatformTour: DemoScenario = {
  id: 'full-platform-tour',
  title: 'Complete Aioscrew Platform Tour',
  description: 'Comprehensive demonstration of all features and capabilities',
  estimatedDuration: 300,
  steps: [
    // Introduction
    {
      id: 'tour-intro',
      action: 'introduction',
      narration: "Welcome to the complete Aioscrew platform demonstration. Over the next few minutes, we'll explore how AI transforms airline crew management.",
      duration: 5000,
    },
    // Include all other scenarios' steps
    ...landingPageScenario.steps,
    ...aiValidationScenario.steps,
    ...crewMemberScenario.steps,
    ...controllerScenario.steps,
    ...executiveScenario.steps,
    // Conclusion
    {
      id: 'tour-conclusion',
      action: 'conclusion',
      narration: "That concludes our tour of Aioscrew. We've seen how multi-agent AI, intelligent routing, and enterprise architecture come together to transform crew operations. Thank you for watching.",
      duration: 6000,
      screenshotName: 'tour-complete',
    },
  ],
};

// ============================================
// NARRATION SEGMENTS FOR TTS
// ============================================

export const narrationSegments: Record<string, NarrationSegment> = {
  'welcome': {
    id: 'welcome',
    text: "Welcome to Aioscrew, Copa Airlines' AI-powered Crew Operating System.",
    voiceStyle: 'professional',
    pauseAfter: 1000,
    emphasize: ['Aioscrew', 'AI-powered'],
  },
  'multi-agent-intro': {
    id: 'multi-agent-intro',
    text: "Our multi-agent AI system uses specialized models for different tasks, running them in parallel for maximum efficiency.",
    voiceStyle: 'explanatory',
    pauseAfter: 800,
    emphasize: ['multi-agent', 'parallel'],
  },
  'cost-savings': {
    id: 'cost-savings',
    text: "This approach saves 66% in AI costs while maintaining the highest accuracy standards.",
    voiceStyle: 'excited',
    pauseAfter: 600,
    emphasize: ['66%', 'highest accuracy'],
  },
  'validation-complete': {
    id: 'validation-complete',
    text: "Validation complete! The claim has been approved with 92% confidence in just 18 seconds.",
    voiceStyle: 'excited',
    pauseAfter: 1000,
    emphasize: ['approved', '92%', '18 seconds'],
  },
};

// ============================================
// DEMO SCENARIO REGISTRY
// ============================================

export const demoScenarios: Record<string, DemoScenario> = {
  'landing-page': landingPageScenario,
  'ai-validation': aiValidationScenario,
  'crew-member': crewMemberScenario,
  'controller': controllerScenario,
  'executive': executiveScenario,
  'full-tour': fullPlatformTour,
};

// Helper to get scenario by ID
export function getScenario(id: string): DemoScenario | undefined {
  return demoScenarios[id];
}

// Helper to get all scenario IDs
export function getScenarioIds(): string[] {
  return Object.keys(demoScenarios);
}

// Export total estimated demo time
export function getTotalDemoTime(): number {
  return Object.values(demoScenarios).reduce((sum, s) => sum + s.estimatedDuration, 0);
}
