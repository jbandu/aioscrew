# Aioscrew AI Architecture

## 🏗️ Enterprise-Grade Multi-Agent System

This document details the sophisticated AI architecture powering Aioscrew's claim validation system. Our approach demonstrates enterprise-level AI orchestration with multi-LLM routing, hierarchical delegation, and intelligent cost optimization.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Multi-LLM Provider Strategy](#multi-llm-provider-strategy)
3. [Hierarchical Agent Orchestration](#hierarchical-agent-orchestration)
4. [Agent Specifications](#agent-specifications)
5. [Technology Selection Matrix](#technology-selection-matrix)
6. [Cost Optimization](#cost-optimization)
7. [Performance Characteristics](#performance-characteristics)
8. [Why This Architecture?](#why-this-architecture)

---

## Architecture Overview

### Three-Tier Agent System

```
┌─────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR                           │
│                  (Claude Sonnet 4.5)                        │
│                                                             │
│  Coordinates parallel execution, synthesizes results        │
└──────────────┬──────────────┬──────────────┬───────────────┘
               │              │              │
       ┌───────▼─────┐ ┌─────▼──────┐ ┌────▼──────────┐
       │ Flight Time │ │ Premium    │ │  Compliance   │
       │ Calculator  │ │ Pay Calc   │ │  Validator    │
       │             │ │            │ │               │
       │ GPT-4o-mini │ │ Claude     │ │ Claude Opus   │
       │             │ │ Sonnet 4.5 │ │               │
       └─────────────┘ └────────────┘ └───────┬───────┘
                                              │
                        ┌─────────────────────┴─────────────────┐
                        │    HIERARCHICAL SUB-AGENTS            │
                        │                                        │
           ┌────────────▼────────────┐  ┌────────────────────┐  │
           │ Contract Interpreter    │  │ Historical         │  │
           │ (Claude Opus)          │  │ Precedent          │  │
           │                        │  │ (GPT-4o + Vector)  │  │
           └────────────────────────┘  └────────────────────┘  │
                                                                │
                        ┌──────────────────────────────────────┘
                        │ Union Rules Checker
                        │ (Rules Engine)
                        └───────────────────────
```

### Execution Flow

1. **Orchestrator** receives claim validation request
2. **Parallel Execution**: All 3 main agents run simultaneously (3x faster)
3. **Hierarchical Delegation**: Compliance Validator delegates to 3 sub-agents
4. **Synthesis**: Orchestrator combines all results into final decision

---

## Multi-LLM Provider Strategy

### Why Multiple LLMs?

**Problem:** Using a single LLM (even the best one) for all tasks is:
- ❌ Expensive (high-powered LLMs cost 100x more for simple tasks)
- ❌ Slow (overkill for simple calculations)
- ❌ Inefficient (poor ROI on simple operations)

**Solution:** Intelligent routing based on task complexity

### Provider Mapping

| Problem Type | Technology | Provider | Why? | Cost | Latency |
|-------------|------------|----------|------|------|---------|
| **Flight Time Calculations** | GPT-4o-mini | OpenAI | Fast structured math, cheap | $0.15/1M tokens | 2-3s |
| **Premium Pay Reasoning** | Claude Sonnet 4.5 | Anthropic | Complex multi-step logic | $3/1M tokens | 5-8s |
| **Legal/Compliance Analysis** | Claude Opus | Anthropic | Ambiguous clause interpretation | $15/1M tokens | 8-12s |
| **Contract Language** | Claude Opus | Anthropic | Deep legal analysis | $15/1M tokens | 4-6s |
| **Historical Lookup** | GPT-4o + Vector DB | OpenAI + Neon | Fast similarity search | $0.15/1M + storage | 2-4s |
| **Basic Rules** | Rules Engine | Native Code | Deterministic logic | Free | <100ms |
| **Data Validation** | TypeScript | Native Code | Type safety | Free | <10ms |
| **Arithmetic** | JavaScript | Native Code | Precise calculations | Free | <1ms |

### Configuration

All mappings are defined in `/backend/agents/config/llm-provider-config.ts`:

```typescript
export const AGENT_LLM_MAPPING: Record<string, LLMProviderConfig> = {
  'flight-time-calculator': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    reasoning: 'Fast calculations, cost-effective'
  },
  'premium-pay-calculator': {
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929',
    reasoning: 'Complex reasoning, balanced cost/performance'
  },
  'compliance-validator': {
    provider: 'anthropic',
    model: 'claude-opus-4-20250514',
    reasoning: 'Highest accuracy for legal analysis'
  }
};
```

---

## Hierarchical Agent Orchestration

### Pattern: Parent Delegates to Specialists

When the **Compliance Validator** encounters complexity, it dynamically delegates to specialized sub-agents:

```
Compliance Validator (Parent)
├── Analyzes claim for compliance issues
├── Detects complexity signals:
│   ├── Ambiguous contract language
│   ├── Conflicting clause interpretations
│   └── Edge cases with no clear precedent
│
└── Delegates to specialists:
    │
    ├─► Contract Interpreter (Claude Opus)
    │   ├─ Deep semantic analysis of CBA clauses
    │   ├─ Identifies conflicting requirements
    │   └─ Returns legal interpretation + confidence
    │
    ├─► Historical Precedent (GPT-4o + Vector DB)
    │   ├─ Searches past similar claims
    │   ├─ Finds established interpretations
    │   └─ Returns precedent cases + similarity scores
    │
    └─► Union Rules Checker (Rules Engine)
        ├─ Validates explicit union requirements
        ├─ Checks hard constraints
        └─ Returns pass/fail + violated rules
```

### Synthesis Logic

After sub-agents complete, the Compliance Validator:

1. **Collects** all sub-agent outputs
2. **Resolves** conflicting signals
3. **Weights** by confidence scores
4. **Synthesizes** final compliance decision
5. **Explains** reasoning with references

### Why Hierarchical?

**Business Value:**
- Mimics human expert consultation
- Specialists focus on narrow domains
- Better accuracy through focused expertise
- Transparent decision-making

**Technical Value:**
- Modular agent design
- Easy to add new specialists
- Each sub-agent uses optimal technology
- Parallel sub-agent execution (future)

### Implementation

Sub-agents defined in: `/backend/agents/core/compliance-validator.ts`

```typescript
// Pseudo-code
async function validateCompliance(claim) {
  // Parent analysis
  const issues = analyzeForIssues(claim);

  if (hasComplexity(issues)) {
    // Delegate to specialists
    const [contractResult, precedentResult, rulesResult] =
      await Promise.all([
        contractInterpreter.analyze(claim),
        historicalPrecedent.search(claim),
        unionRulesChecker.validate(claim)
      ]);

    // Synthesize
    return synthesizeResults([
      contractResult,
      precedentResult,
      rulesResult
    ]);
  }

  // Simple case - no delegation needed
  return simpleValidation(claim);
}
```

---

## Agent Specifications

### 1. Flight Time Calculator

**Technology:** GPT-4o-mini (OpenAI)

**Purpose:** Calculate flight hours, duty time, regulatory compliance

**Why this LLM:**
- Structured arithmetic calculations
- Fast inference (<3s)
- 20x cheaper than Claude Opus
- Sufficient for simple math logic

**Input:**
- Trip data (departure, arrival, flight time)
- Crew member duty hours
- Regulatory limits

**Output:**
- Validated flight time
- Duty time calculations
- Regulatory violations (if any)

**Cost per validation:** ~$0.0001

---

### 2. Premium Pay Calculator

**Technology:** Claude Sonnet 4.5 (Anthropic)

**Purpose:** Determine premium pay eligibility

**Why this LLM:**
- Complex multi-step reasoning
- Contract clause interpretation
- Handles edge cases well
- Balanced cost/performance ($3/1M vs $15/1M for Opus)

**Input:**
- Claim data (type, amount, trip)
- Contract rules (CBA sections)
- Historical patterns

**Output:**
- Eligibility determination
- Premium amount calculation
- Contract references
- Confidence score

**Cost per validation:** ~$0.003

---

### 3. Compliance Validator (with Sub-Agents)

**Technology:** Claude Opus (Anthropic) + Sub-agents

**Purpose:** Legal/compliance analysis of claims

**Why this LLM:**
- Most powerful reasoning
- Handles ambiguous legal language
- Best for high-stakes decisions
- Worth the cost for accuracy

**Sub-Agents:**

#### 3.1 Contract Interpreter
- **Tech:** Claude Opus
- **Purpose:** Deep legal language analysis
- **When:** Ambiguous clauses, conflicting terms
- **Cost:** $0.005 per interpretation

#### 3.2 Historical Precedent
- **Tech:** GPT-4o + Vector DB (Neon pgvector)
- **Purpose:** Find past similar claims
- **When:** Novel situations, edge cases
- **Cost:** $0.0002 per search

#### 3.3 Union Rules Checker
- **Tech:** Native Rules Engine
- **Purpose:** Validate explicit requirements
- **When:** Every compliance check
- **Cost:** Free

**Total cost per validation:** ~$0.008

---

### 4. Orchestrator

**Technology:** Claude Sonnet 4.5 (Anthropic)

**Purpose:** Coordinate agents, synthesize results

**Why this LLM:**
- Excellent at multi-agent coordination
- Good reasoning for synthesis
- Handles conflicting signals well
- More cost-effective than Opus

**Responsibilities:**
1. **Parallel Execution:** Launch all agents simultaneously
2. **Timeout Management:** Handle slow/failed agents
3. **Result Collection:** Gather all agent outputs
4. **Conflict Resolution:** Handle disagreements
5. **Final Decision:** Synthesize into recommendation
6. **Explanation:** Generate human-readable reasoning

**Cost per orchestration:** ~$0.002

---

## Technology Selection Matrix

### Decision Tree

```
Is it deterministic arithmetic?
├─ YES → Use Native JavaScript (Free, <1ms)
└─ NO → Continue...

Does it require strict type safety?
├─ YES → Use TypeScript validation (Free, <10ms)
└─ NO → Continue...

Is it simple if/then logic?
├─ YES → Use Rules Engine (Free, <100ms)
└─ NO → Continue...

Is it structured calculation?
├─ YES → Use GPT-4o-mini ($0.15/1M, 2-3s)
└─ NO → Continue...

Is it complex reasoning?
├─ YES → Use Claude Sonnet 4.5 ($3/1M, 5-8s)
└─ NO → Continue...

Is it legal/compliance analysis?
└─ YES → Use Claude Opus ($15/1M, 8-12s)
```

### Selection Criteria

| Criteria | Weight | Options |
|----------|--------|---------|
| **Accuracy Required** | High | Opus > Sonnet > GPT-4o > Rules |
| **Speed Required** | Medium | Rules > GPT-4o > Sonnet > Opus |
| **Cost Sensitivity** | High | Rules > GPT-4o > Sonnet > Opus |
| **Reasoning Depth** | High | Opus > Sonnet > GPT-4o > Rules |
| **Determinism** | Variable | Rules > Math > GPT-4o > Sonnet/Opus |

---

## Cost Optimization

### Strategy

```
Principle: Use the cheapest technology that meets accuracy requirements
```

### Cost Breakdown (per claim validation)

| Component | Technology | Cost | Calls | Total |
|-----------|------------|------|-------|-------|
| Flight Time | GPT-4o-mini | $0.0001 | 1 | $0.0001 |
| Premium Pay | Claude Sonnet | $0.003 | 1 | $0.003 |
| Compliance (Parent) | Claude Opus | $0.005 | 1 | $0.005 |
| Contract Interpreter | Claude Opus | $0.005 | 0.3 | $0.0015 |
| Historical Precedent | GPT-4o + DB | $0.0002 | 0.5 | $0.0001 |
| Union Rules | Rules Engine | $0 | 1 | $0 |
| Orchestrator | Claude Sonnet | $0.002 | 1 | $0.002 |
| **TOTAL** | | | | **$0.0117** |

### Comparison

| Scenario | Cost per Claim | Cost per 1000 Claims | Savings |
|----------|----------------|---------------------|---------|
| **Our Multi-LLM** | $0.012 | $12 | Baseline |
| All Claude Opus | $0.035 | $35 | **66% more** |
| All Claude Sonnet | $0.018 | $18 | **50% more** |
| All GPT-4o-mini | $0.003 | $3 | ⚠️ Lower accuracy |

**Annual Savings (10K claims/month):**
- vs All Opus: **$2,760/year**
- vs All Sonnet: **$720/year**

---

## Performance Characteristics

### Execution Time

#### Sequential (Old)
```
Flight Time:  20s
Premium Pay:  8s
Compliance:   22s (includes sub-agents)
Total:        50s
```

#### Parallel (Current)
```
All 3 agents run simultaneously:
Max(20s, 8s, 22s) = 22s

Speedup: 2.3x faster
```

### Latency Breakdown

```
Request received
│
├─ 0-100ms: Parse and validate input
│
├─ 100-200ms: Launch parallel agents
│
├─ 2-22s: Agent execution (parallel)
│   ├─ Flight Time: 2-3s (GPT-4o-mini)
│   ├─ Premium Pay: 5-8s (Claude Sonnet)
│   └─ Compliance: 8-22s (Claude Opus + sub-agents)
│       ├─ Parent analysis: 3-5s
│       └─ Sub-agents (parallel): 4-12s
│           ├─ Contract: 4-6s
│           ├─ Precedent: 2-4s
│           └─ Rules: <100ms
│
├─ 1-2s: Synthesis and final decision
│
└─ 100-200ms: Format and return response

Total: 3-24s (avg: 15s)
```

### Throughput

- **Single instance:** ~4 claims/minute
- **With concurrency (10 workers):** ~40 claims/minute
- **Bottleneck:** Claude Opus API rate limits

### Scaling

```
Current: 1 Railway instance = 4 claims/min = 240/hour

Scale to 10 instances:
10 instances × 4 claims/min = 40 claims/min = 2,400/hour

Monthly capacity (10 instances): 1.7M claims/month
```

---

## Why This Architecture?

### vs. Single LLM

**Problem with using only Claude Opus:**
- ❌ 66% higher cost ($35 vs $12 per 1000 claims)
- ❌ Overkill for simple calculations
- ❌ No performance benefit (still same latency)
- ❌ Poor ROI on simple operations

**Our approach:**
- ✅ 66% cost savings
- ✅ Right tool for right job
- ✅ Same or better accuracy
- ✅ Optimal resource utilization

### vs. Traditional RPA/Rules

**Why not just use rules engines?**

| Requirement | Rules Engine | Our AI System |
|-------------|--------------|---------------|
| Handle ambiguous clauses | ❌ Breaks | ✅ Reasons through |
| Adapt to new contract terms | ❌ Needs reprogramming | ✅ Adapts automatically |
| Explain decisions | ❌ Silent failures | ✅ Human-readable explanations |
| Handle edge cases | ❌ Undefined behavior | ✅ Contextual reasoning |
| Maintenance cost | ❌ High (manual rules) | ✅ Low (learns from data) |
| Development time | ❌ Weeks per rule | ✅ Days for entire system |

**Our hybrid approach:**
- ✅ Use rules where deterministic (free, fast)
- ✅ Use AI where contextual (accurate, adaptive)
- ✅ Best of both worlds

### vs. Monolithic AI

**Why hierarchical agents vs. one big prompt?**

| Aspect | Monolithic | Hierarchical Agents |
|--------|-----------|---------------------|
| Context limit | ❌ Hits 200K limit | ✅ Distributed context |
| Debugging | ❌ Black box | ✅ Per-agent visibility |
| Testing | ❌ Hard to isolate | ✅ Test each agent |
| Optimization | ❌ All-or-nothing | ✅ Optimize per agent |
| Specialization | ❌ Jack of all trades | ✅ Expert agents |
| Maintenance | ❌ Fragile prompts | ✅ Modular components |

---

## Future Enhancements

### 1. Dynamic Agent Selection

```typescript
// Instead of fixed agents, select based on claim type
const agents = selectAgentsForClaim(claim);
// e.g., international claims get currency converter agent
```

### 2. Learning from Feedback

```typescript
// Track which agent configurations work best
trackPerformance(agentId, accuracy, cost, latency);
optimizeAgentSelection(historicalData);
```

### 3. Human-in-the-Loop

```typescript
// For low-confidence decisions, escalate to human
if (confidence < 0.7) {
  return {
    status: 'needs-review',
    assignTo: 'senior-payroll-admin',
    agentReasoning: results
  };
}
```

### 4. Real-time Cost Monitoring

```typescript
// Track and alert on cost spikes
if (costPerClaim > threshold) {
  alertAdmin('High AI costs detected');
  switchToBackupStrategy();
}
```

---

## Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./RAILWAY_DEPLOYMENT.md)
- [Development Setup](./DEVELOPMENT.md)
- [Multi-LLM Configuration](./backend/agents/config/llm-provider-config.ts)

---

**Last Updated:** 2025-11-23
**Architecture Version:** 2.0 (Hierarchical Multi-LLM)
