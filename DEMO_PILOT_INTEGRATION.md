# Demo-Pilot Integration Guide

## Overview

This guide explains how to integrate Aioscrew's Playwright demo scripts with the **demo-pilot** application for creating dynamic, AI-narrated demonstrations using Claude/Eleven Labs for synchronized audio.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       DEMO-PILOT APP                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐ │
│  │   Claude AI  │◄───│ Demo Events  │◄───│ Playwright Tests │ │
│  │  (Script Gen)│    │    Stream    │    │  (demo/*.ts)     │ │
│  └──────┬───────┘    └──────────────┘    └────────┬─────────┘ │
│         │                                          │           │
│         ▼                                          ▼           │
│  ┌──────────────┐                         ┌──────────────────┐ │
│  │  Eleven Labs │                         │    Browser       │ │
│  │    (TTS)     │                         │  (Chromium/etc)  │ │
│  └──────┬───────┘                         └────────┬─────────┘ │
│         │                                          │           │
│         ▼                                          ▼           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              SYNCHRONIZED DEMO OUTPUT                    │  │
│  │  - Video capture of browser actions                      │  │
│  │  - AI-generated audio narration                          │  │
│  │  - Timestamped transcript                                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
# In Aioscrew project
npm install
npx playwright install

# Create demo screenshots directory
mkdir -p demo-screenshots
```

### 2. Run Demo Scripts

```bash
# Full platform tour (5-6 minutes)
npx playwright test full-platform-tour.demo.ts --headed

# AI Validation showcase (2-3 minutes)
npx playwright test ai-validation.demo.ts --headed

# Quick overview (2 minutes)
npx playwright test full-platform-tour.demo.ts --headed -g "Quick Platform Overview"

# All roles rapid demo
npx playwright test full-platform-tour.demo.ts --headed -g "All Roles Quick Access"
```

### 3. Capture Demo Events

The demo scripts emit events via console and process.send() that demo-pilot can capture:

```typescript
// Event types emitted by demo scripts:
'demo:start'           // Demo started
'demo:complete'        // Demo finished
'section:start'        // New section beginning
'step:narration'       // Narration text ready for TTS
'ai:validation:start'  // AI validation triggered
'ai:validation:complete' // AI validation finished
'agent:start'          // Individual agent starting
'role:highlight'       // Role being demonstrated
'screenshot'           // Screenshot captured
```

## Demo Scripts Structure

```
tests/e2e/demo/
├── demo-fixtures.ts          # Custom Playwright fixtures with narration support
├── narration-data.ts         # All narration scripts and scenario metadata
├── landing-page.demo.ts      # Landing page showcase
├── ai-validation.demo.ts     # AI validation main demo (STAR FEATURE)
├── crew-member.demo.ts       # Crew member experience
├── controller.demo.ts        # Operations controller demo
└── full-platform-tour.demo.ts # Complete platform tour (5-6 min)
```

## Narration Data Format

Each demo step includes narration metadata for TTS:

```typescript
interface DemoStep {
  id: string;              // Unique step identifier
  action: string;          // What happens in UI
  narration: string;       // Text for TTS narration
  duration: number;        // Step duration in ms
  screenshotName?: string; // Optional screenshot
  highlightSelector?: string; // Element to highlight
}

interface NarrationSegment {
  id: string;
  text: string;
  voiceStyle: 'professional' | 'excited' | 'explanatory' | 'conversational';
  pauseAfter: number;      // Pause after TTS in ms
  emphasize?: string[];    // Words to emphasize
}
```

## Integration with Demo-Pilot

### Option 1: Event Stream via Child Process

```typescript
// demo-pilot/src/runners/playwright-runner.ts
import { spawn } from 'child_process';

class PlaywrightDemoRunner {
  async runDemo(scenarioId: string) {
    const playwright = spawn('npx', [
      'playwright', 'test',
      `${scenarioId}.demo.ts`,
      '--headed',
      '--reporter=json'
    ], {
      cwd: '/path/to/aioscrew',
      stdio: ['inherit', 'pipe', 'pipe', 'ipc']
    });

    // Listen for demo events
    playwright.on('message', (event: DemoEvent) => {
      switch (event.event) {
        case 'step:narration':
          await this.elevenLabs.speak(event.data.text, event.data.voiceStyle);
          break;
        case 'screenshot':
          await this.captureFrame(event.data.filename);
          break;
        // ... handle other events
      }
    });

    // Parse stdout for console.log events
    playwright.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('[DEMO-EVENT]')) {
          const event = this.parseEvent(line);
          this.handleEvent(event);
        }
      }
    });
  }
}
```

### Option 2: WebSocket Communication

```typescript
// In demo fixture (demo-fixtures.ts), add WebSocket client:
import WebSocket from 'ws';

let ws: WebSocket | null = null;

export function connectToDemoPilot(url = 'ws://localhost:8765') {
  ws = new WebSocket(url);
  ws.on('open', () => console.log('Connected to demo-pilot'));
}

// In emitDemoEvent:
const emit = (eventName: string, data: Record<string, unknown>) => {
  const event = { event: eventName, data, timestamp: Date.now() };

  // Send to WebSocket if connected
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }

  // Also log for file-based capture
  console.log(`[DEMO-EVENT] ${eventName}:`, JSON.stringify(data));
};
```

### Option 3: File-Based Sync

```typescript
// Demo script writes events to file
import fs from 'fs';

const eventLog: DemoEvent[] = [];

function emitDemoEvent(event: string, data: any) {
  eventLog.push({ event, data, timestamp: Date.now() });
  fs.writeFileSync('demo-events.json', JSON.stringify(eventLog, null, 2));
}

// Demo-pilot reads file and syncs
class DemoPilotSync {
  private lastIndex = 0;

  pollEvents() {
    const events = JSON.parse(fs.readFileSync('demo-events.json', 'utf-8'));
    const newEvents = events.slice(this.lastIndex);
    this.lastIndex = events.length;

    for (const event of newEvents) {
      this.processEvent(event);
    }
  }
}
```

## Eleven Labs Integration

### Voice Styles Mapping

```typescript
// Map voiceStyle to Eleven Labs voice settings
const voiceSettings = {
  professional: {
    voice_id: 'pNInz6obpgDQGcFmaJgB', // Adam
    stability: 0.75,
    similarity_boost: 0.85,
  },
  excited: {
    voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella
    stability: 0.65,
    similarity_boost: 0.90,
  },
  explanatory: {
    voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel
    stability: 0.80,
    similarity_boost: 0.80,
  },
  conversational: {
    voice_id: 'AZnzlk1XvdvUeBnXmlld', // Domi
    stability: 0.70,
    similarity_boost: 0.85,
  },
};
```

### TTS Generation

```typescript
import ElevenLabs from 'elevenlabs-node';

const voice = new ElevenLabs({
  apiKey: process.env.ELEVEN_LABS_API_KEY,
});

async function generateNarration(text: string, voiceStyle: string) {
  const settings = voiceSettings[voiceStyle];

  const audio = await voice.textToSpeech({
    voiceId: settings.voice_id,
    text: text,
    modelId: 'eleven_turbo_v2',
    voiceSettings: {
      stability: settings.stability,
      similarity_boost: settings.similarity_boost,
    },
  });

  return audio;
}
```

## Available Demo Scenarios

| Scenario ID | Duration | Description |
|-------------|----------|-------------|
| `landing-page` | 60s | Landing page and role overview |
| `ai-validation` | 120s | Multi-agent AI validation showcase |
| `crew-member` | 90s | Crew member portal experience |
| `controller` | 90s | Operations control center |
| `executive` | 60s | Executive dashboard |
| `full-tour` | 300s | Complete platform demonstration |

## Narration Scripts

### Full Narration for AI Validation Demo

```text
00:00 - "Let's dive into the most powerful feature: our multi-agent AI
         validation system. We'll navigate to the Payroll Admin dashboard."

00:06 - "The Payroll Admin dashboard shows pending claims awaiting
         validation. Our AI system can process these in seconds, not hours."

00:12 - "Let's select a claim to validate. This is an International
         Premium claim for $125 from Captain Sarah Martinez."

00:18 - "Our system uses a sophisticated multi-LLM architecture. Instead
         of one AI for everything, we route tasks to specialized agents."

00:28 - "Watch as we trigger the AI validation. Three agents will run
         in parallel, reducing time from 60 seconds to just 20."

00:35 - "The Flight Time Calculator is analyzing duty hours using
         GPT-4-mini for fast, accurate calculations."

00:42 - "Simultaneously, the Premium Pay Calculator checks eligibility
         using Claude Sonnet's advanced reasoning capabilities."

00:50 - "The Compliance Validator, powered by Claude Opus, performs
         deep legal analysis with hierarchical sub-agents."

01:00 - "Notice the hierarchical structure. The Compliance Validator
         spawned three sub-agents for specialized analysis."

01:10 - "All agents complete. The orchestrator synthesizes results
         with 92% confidence. Just 18 seconds total."

01:20 - "This multi-LLM approach saves 66% in AI costs compared to
         using only Claude Opus."

01:28 - "The Technology Selection Matrix shows which AI handles each
         problem type - crucial for enterprise adoption."
```

## Demo Recording Tips

### For Video Capture

```bash
# Record with OBS or similar while running:
npx playwright test ai-validation.demo.ts --headed

# Or use Playwright's built-in video:
# Set in playwright.config.ts:
use: {
  video: 'on',
  viewport: { width: 1920, height: 1080 },
}
```

### For Audio Sync

1. Run demo first to generate event log
2. Generate TTS audio for each narration segment
3. Merge video and audio with timestamps
4. Or run live with WebSocket sync

### Recommended Settings

```typescript
// For demo recordings
{
  viewport: { width: 1920, height: 1080 },
  video: 'on',
  screenshot: 'on',
  trace: 'on',
}

// Demo pace settings
setDemoPace('normal');  // 1.0x - for presentations
setDemoPace('slow');    // 2.0x - for detailed walkthroughs
setDemoPace('fast');    // 0.5x - for quick overviews
```

## Event Reference

### Demo Lifecycle Events

```typescript
// Start of demo
{
  event: 'demo:start',
  data: {
    scenarioId: 'ai-validation',
    title: 'Multi-Agent AI Validation Demo',
    estimatedDuration: 120
  }
}

// Section change
{
  event: 'section:start',
  data: { section: 'ai-validation' }
}

// Narration cue
{
  event: 'step:narration',
  data: {
    text: 'Let\'s dive into the most powerful feature...',
    voiceStyle: 'excited'
  }
}

// Demo complete
{
  event: 'demo:complete',
  data: {
    scenarioId: 'ai-validation',
    success: true,
    totalDuration: 118
  }
}
```

### AI Validation Events

```typescript
// Validation started
{ event: 'ai:validation:start', data: { timestamp: 1234567890 } }

// Agent progress
{ event: 'agent:start', data: { agent: 'flight-time-calculator' } }
{ event: 'agent:start', data: { agent: 'premium-pay-calculator' } }
{ event: 'agent:start', data: { agent: 'compliance-validator' } }

// Progress update
{ event: 'ai:progress', data: { status: 'Compliance analysis...' } }

// Validation complete
{
  event: 'ai:validation:complete',
  data: { timestamp: 1234567908 }
}

// Final result
{
  event: 'ai:result',
  data: { status: 'approved', confidence: 0.92 }
}
```

### UI Events

```typescript
// Element highlight
{ event: 'highlight', data: { selector: 'button:has-text("Validate")' } }

// Screenshot captured
{
  event: 'screenshot',
  data: {
    name: 'validation-complete',
    description: 'AI Validation Complete',
    filename: 'demo-screenshots/validation-complete-2024-01-15.png'
  }
}

// Navigation
{ event: 'navigation:start', data: { role: 'Payroll Admin' } }
{ event: 'navigation:complete', data: { role: 'Payroll Admin', success: true } }
```

## Troubleshooting

### Demo Won't Start

```bash
# Ensure servers are running
npm run dev                    # Frontend (port 5173)
cd backend && npm run dev      # Backend (port 3001)

# Verify Playwright browsers
npx playwright install
```

### Events Not Emitting

```bash
# Run with debug output
DEBUG=pw:api npx playwright test ai-validation.demo.ts --headed
```

### Audio Sync Issues

- Ensure `demoWait()` durations match TTS audio length
- Use `setDemoPace('slow')` for longer narrations
- Pre-generate TTS to calculate exact timings

### Screenshot Directory

```bash
# Create if missing
mkdir -p demo-screenshots
chmod 755 demo-screenshots
```

## API Reference

See `tests/e2e/demo/demo-fixtures.ts` for full fixture API:

- `gotoRole(role)` - Navigate to dashboard
- `executeStep(step)` - Run demo step with narration
- `highlightElement(selector, duration)` - Highlight UI element
- `scrollToElement(selector)` - Scroll element into view
- `demoWait(ms, reason)` - Wait with pace adjustment
- `demoScreenshot(name, description)` - Capture screenshot
- `emitDemoEvent(event, data)` - Emit event for demo-pilot
- `setDemoPace(pace)` - Adjust demo speed
- `waitForAIValidation(onProgress)` - Wait for AI to complete

## Support

- **Documentation:** This file and `tests/README.md`
- **Demo Scripts:** `tests/e2e/demo/*.demo.ts`
- **Narration Data:** `tests/e2e/demo/narration-data.ts`
- **Issues:** [GitHub Issues](https://github.com/jbandu/aioscrew/issues)

---

**Built for Copa Airlines | Powered by AI from dCortex**
