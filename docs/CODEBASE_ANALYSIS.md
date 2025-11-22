# Aioscrew Codebase Analysis

**Generated:** November 22, 2024
**Project:** Copa Airlines Crew Management & AI-Powered Pay Validation System

## Executive Summary

This is a React + TypeScript application built with Vite that provides crew management and AI-powered pay claim validation for Copa Airlines. The frontend is **fully functional** with complete UI components, but the AI agents are currently **mock implementations**. The backend infrastructure needs to be built to connect real LangGraph orchestration with Claude Sonnet 4.5.

---

## Technology Stack

### Frontend
- **Framework:** React 18.3.1 + TypeScript 5.5.3
- **Build Tool:** Vite 5.4.2
- **Styling:** TailwindCSS 3.4.1
- **Icons:** Lucide React
- **UI State:** React hooks (useState, useEffect)

### Database
- **Provider:** Neon PostgreSQL (serverless)
- **Client:** @neondatabase/serverless 1.0.2
- **Connection:** Via `VITE_DATABASE_URL` environment variable
- **Schema:** 6 tables (crew_members, trips, pay_claims, training_records, disruptions, compliance_violations)

### Missing Infrastructure
- ❌ Backend API server (Express/Fastify)
- ❌ LangGraph orchestration
- ❌ Claude API integration
- ❌ WebSocket for real-time updates
- ❌ Neo4j for CBA contract knowledge graph

---

## Current Implementation Status

### ✅ Fully Implemented

#### 1. **Database Schema** (`/src/lib/db.ts`)
Complete PostgreSQL schema with:
- `crew_members` - 9 sample crew across roles (Captains, FOs, FAs)
- `trips` - 6 sample trips with route, times, international flags
- `pay_claims` - 5 sample claims with AI validation fields
- `training_records` - Training expiry tracking
- `disruptions` - Cancellations, delays, recovery plans
- `compliance_violations` - Duty time, rest period violations

Seed data includes realistic Copa Airlines scenarios (PTY hub, 737-800/MAX fleet).

#### 2. **TypeScript Type System** (`/src/types/agents.ts`)
Complete type definitions for 20 agent types:

**Core Pay Agents (8):**
- Orchestrator
- Flight Time Calculator
- Duty Time Monitor
- Per Diem Calculator
- Premium Pay Calculator
- Guarantee Calculator
- Compliance Validator
- Dispute Resolution

**Extended Agents (12):**
- Pairing Optimizer, Roster Builder, Bidding Processor
- Real-Time Tracker, Fatigue Risk Manager
- Disruption Recovery, Reserve Optimizer
- Training Scheduler, Legality Validator
- Analytics Engine, Communications, Workforce Planner

**Data Structures:**
```typescript
AgentActivity         // Real-time feed events
AgentProcessingStep   // Timeline steps with confidence
AgentValidationResult // Final decision with references
ClaimData            // Pay claim with validation
ContractReference    // CBA section citations
HistoricalAnalysis   // Pattern detection
```

#### 3. **UI Components** (`/src/components/agents/`)

**AgentActivityFeed.tsx**
- Live feed of agent processing events
- Color-coded status (processing/completed/flagged/error)
- Shows agent name, message, timestamp
- Ready for WebSocket integration

**ClaimCard.tsx**
- Expandable claim cards with full timeline
- Confidence meter visualization
- Contract references display
- Approve/reject actions
- Issue severity badges (high/medium/low)

**AgentProcessingTimeline.tsx**
- Step-by-step agent execution visualization
- Duration and confidence per agent
- Detailed reasoning display

#### 4. **Views** (`/src/views/`)

**PayrollViewWithAgents.tsx**
- Main payroll dashboard
- Processes claims through agent validation
- Stats: AI approved, needs review, approval rate
- Integrates AgentActivityFeed + ClaimCard components
- Currently uses mock data from `agentService.ts`

Other views: CrewMemberView, SchedulerView, ManagementView, UnionView, etc.

### ⚠️ Mock Implementations

#### 1. **Agent Service** (`/src/services/agentService.ts`)

**Current Behavior:**
- Returns hardcoded validation results based on claim type
- Two detailed mock scenarios:
  - **International Premium:** Approved (99.8% confidence, 1.2s processing)
  - **Per Diem:** Flagged (45% confidence, 3 issues detected)
- Simulates multi-agent processing with realistic details

**Mock Agent Steps Example:**
```typescript
Orchestrator → Routes claim to specialized agents (0.1s)
Flight Time Calculator → Verifies trip data (0.3s, 99% confidence)
Premium Pay Calculator → Validates CBA Section 12.4 (0.4s, 100% confidence)
Compliance Validator → Checks duplicates, deadlines (0.4s, 99.5% confidence)
```

**What's Missing:**
- No actual Claude API calls
- No LangGraph orchestration
- No database queries for historical analysis
- No Neo4j lookups for contract references
- No real-time streaming

#### 2. **Mock Claims Data**
5 hardcoded claims in `mockClaims` array:
- CLM-2024-1156: International Premium ($125)
- CLM-2024-1157: International Premium ($125)
- CLM-2024-1158: Per Diem ($150) - flagged
- CLM-2024-1159: Overnight Allowance ($75)
- CLM-2024-1160: Holiday Premium ($200)

---

## Architecture Analysis

### Current Frontend Flow
```
User Views Payroll Page
  ↓
PayrollViewWithAgents.tsx loads mockClaims
  ↓
Calls validateClaimWithAgents(claim) for each
  ↓
agentService.ts returns mock AgentValidationResult
  ↓
UI displays timeline + confidence + contract refs
```

### Required Backend Flow
```
Frontend submits claim via POST /api/agents/validate
  ↓
Backend API receives claim + trip + crew data
  ↓
LangGraph Orchestrator analyzes claim type
  ↓
Runs 3-5 specialized agents in parallel/sequence
  ↓
Each agent:
  - Calls Claude Sonnet 4.5 with system prompt
  - Queries PostgreSQL for historical data
  - Queries Neo4j for CBA contract rules
  - Returns structured AgentResult
  ↓
Orchestrator aggregates results
  ↓
Returns AgentValidationResult to frontend
  ↓
WebSocket emits progress events during processing
```

---

## Database Schema Details

### Crew Members Table
- **Fields:** id, name, role, base, seniority, qualification, email, phone, hire_date, ytd_earnings, status
- **Sample Data:** 9 crew members (3 Captains, 3 First Officers, 3 Flight Attendants)
- **Bases:** BUR (Burbank), PTY (Panama City Hub)
- **Qualifications:** 737-800, 737-MAX, International

### Trips Table
- **Fields:** id, trip_date, route, flight_numbers, flight_time_hours, credit_hours, layover_city, is_international, aircraft_type, status, captain_id, first_officer_id, senior_fa_id, junior_fa_id
- **Sample Data:** 6 trips including BUR→PTY, PTY→LAX, PTY→MIA
- **Statuses:** scheduled, cancelled, delayed

### Pay Claims Table
- **Fields:** id, crew_id, claim_type, trip_id, claim_date, amount, status, ai_validated, ai_explanation, contract_reference
- **AI Fields:** `ai_validated` (boolean), `ai_explanation` (text), `contract_reference` (varchar)
- **Ready for agent integration!**

### Other Tables
- **training_records:** Tracks expiring qualifications (e.g., 737-800 recurrent due 2025-11-08)
- **disruptions:** Mechanical, weather, with recovery plans and cost impact
- **compliance_violations:** Duty time exceeded, rest period violations

---

## File Structure

```
aioscrew/
├── src/
│   ├── types/
│   │   └── agents.ts              ✅ Complete agent type definitions
│   ├── services/
│   │   ├── agentService.ts        ⚠️  Mock agent validation (needs replacement)
│   │   └── crewService.ts         ✅ Crew data service
│   ├── lib/
│   │   └── db.ts                  ✅ Database schema + seed data
│   ├── components/
│   │   ├── agents/
│   │   │   ├── AgentActivityFeed.tsx      ✅ Ready for WebSocket
│   │   │   ├── ClaimCard.tsx              ✅ Complete UI
│   │   │   └── AgentProcessingTimeline.tsx ✅ Complete UI
│   │   ├── schedule/              ✅ Calendar, trips, time-off
│   │   └── [other components]
│   ├── views/
│   │   ├── PayrollViewWithAgents.tsx  ✅ Main agent integration point
│   │   └── [other views]
│   └── data/
│       └── mockData.ts            ✅ Sample crew schedules
├── public/                        ✅ Assets
├── docs/                          📄 This file
├── package.json                   ✅ Dependencies listed
└── README.md                      📝 Basic info

🔴 MISSING DIRECTORIES (need to create):
├── backend/
│   ├── agents/
│   │   ├── core/
│   │   │   ├── flight-time-calculator.ts
│   │   │   ├── premium-pay-calculator.ts
│   │   │   ├── compliance-validator.ts
│   │   │   └── orchestrator.ts
│   │   ├── extended/
│   │   └── shared/
│   │       ├── types.ts
│   │       ├── claude-client.ts
│   │       └── langgraph-utils.ts
│   ├── api/
│   │   └── routes/
│   │       ├── agents.ts
│   │       ├── crew.ts
│   │       └── payroll.ts
│   ├── services/
│   │   ├── agent-service.ts
│   │   ├── database-service.ts
│   │   └── neo4j-service.ts
│   ├── websocket.ts
│   └── server.ts
```

---

## Gap Analysis

### Priority 1: Backend Agent Infrastructure (CRITICAL)
- [ ] Create `/backend` directory structure
- [ ] Install dependencies: `@langchain/langgraph`, `@anthropic-ai/sdk`, `express`, `socket.io`
- [ ] Implement Claude API client wrapper
- [ ] Build 2-3 core agents as examples:
  - FlightTimeCalculator (validates trip data)
  - PremiumPayCalculator (checks CBA rules)
  - ComplianceValidator (fraud detection)
- [ ] Create LangGraph StateGraph orchestrator
- [ ] Set up backend server (Express on port 3001)

### Priority 2: API Integration Layer
- [ ] Create `/src/services/api-client.ts` for frontend HTTP calls
- [ ] Add API routes:
  - `POST /api/agents/validate` - Main claim validation endpoint
  - `GET /api/agents/activity` - Recent agent activity log
  - `GET /api/claims/:id/timeline` - Claim processing timeline
- [ ] Update `agentService.ts` to call real backend with fallback to mocks
- [ ] Add environment variables: `VITE_API_URL`, `ANTHROPIC_API_KEY`

### Priority 3: Real-Time Communication
- [ ] Set up Socket.io server in backend
- [ ] Create `/src/hooks/useAgentStream.ts` React hook
- [ ] Emit events: `agent:started`, `agent:progress`, `agent:completed`, `agent:error`
- [ ] Update `AgentActivityFeed` component to consume WebSocket events

### Priority 4: Knowledge Graph
- [ ] Set up Neo4j AuraDB instance (free tier)
- [ ] Create CBA contract node schema
- [ ] Seed with Copa Airlines contract sections
- [ ] Build query service for agents to lookup rules
- [ ] Add `contract_references` with actual Neo4j data

### Priority 5: Database Enhancements
- [ ] Migrate to Drizzle ORM for type safety
- [ ] Create proper migration system
- [ ] Expand seed data:
  - 50+ crew members
  - 100+ trips over 3 months
  - 200+ claims with realistic patterns
- [ ] Add indexes for agent query performance

---

## Agent Implementation Roadmap

### Phase 1: Core Pay Validation (Week 1)
**Agents to Build:**
1. **Orchestrator** - Routes claims to appropriate agents
2. **FlightTimeCalculator** - Validates trip data exists, times are correct
3. **PremiumPayCalculator** - Looks up CBA rules for international, holiday, etc.
4. **ComplianceValidator** - Checks for duplicates, fraud patterns

**LangGraph Flow:**
```
START → Orchestrator → [FT, PP] (parallel) → CV → END
```

**Claude Prompts:**
- Orchestrator: "Analyze this claim and determine which specialized agents are needed"
- FlightTimeCalculator: "You are an expert in validating flight time calculations per FAA and CBA rules..."
- PremiumPayCalculator: "You are an expert in Copa Airlines CBA premium pay sections..."
- ComplianceValidator: "You are a fraud detection specialist for payroll claims..."

### Phase 2: Extended Agents (Week 2)
- PerDiemCalculator
- GuaranteeCalculator
- DisputeResolution
- FatigueRiskManager

### Phase 3: Operational Agents (Week 3)
- PairingOptimizer
- RosterBuilder
- DisruptionRecovery
- TrainingScheduler

---

## Environment Setup Requirements

### Environment Variables Needed

```bash
# .env file
VITE_DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/aioscrew

# Backend .env
ANTHROPIC_API_KEY=sk-ant-xxx
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/aioscrew
NEO4J_URI=neo4j+s://xxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=xxx
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Dependencies to Install

**Backend:**
```bash
npm install express @anthropic-ai/sdk @langchain/langgraph @langchain/core socket.io neo4j-driver dotenv cors
npm install -D @types/express @types/node @types/cors tsx nodemon
```

**Frontend additions:**
```bash
npm install socket.io-client axios
```

---

## Success Metrics

### Development Milestones
1. ✅ **Prototype Complete:** Frontend UI + mock agents (CURRENT STATE)
2. 🎯 **Backend MVP:** 3 real agents processing claims (TARGET: Week 1)
3. 🎯 **Full Integration:** All 8 core agents + WebSocket (TARGET: Week 2)
4. 🎯 **Production Ready:** Neo4j + 200+ claims + deployment (TARGET: Week 3)

### Demo Readiness (Copa Dec 15)
- [ ] Real Claude agents validating 5 claim types
- [ ] Live WebSocket updates showing agent processing
- [ ] Contract references pulling from Neo4j
- [ ] Historical analysis from 200+ claims database
- [ ] 95%+ confidence scores on straightforward claims
- [ ] Fraud detection flagging anomalies

---

## Recommendations

### Immediate Next Steps (This Session)
1. Create `/backend` directory structure
2. Implement Claude API client + 2 example agents
3. Build LangGraph orchestrator for basic flow
4. Set up Express server with `/api/agents/validate` endpoint
5. Update frontend `agentService.ts` to call real API

### Technical Decisions
- **Backend Framework:** Express (simple, well-known) vs Fastify (faster)
- **Agent Runtime:** Node.js (same stack) vs Python (LangChain native)
- **Deployment:** Vercel (frontend) + Railway (backend) + Neon (DB) + Neo4j Aura

### Risk Mitigation
- Keep mock agents as fallback during development
- Build one agent fully before replicating pattern
- Test each agent independently before orchestration
- Use structured outputs from Claude for reliability
- Add timeout handling (5s per agent max)

---

## Conclusion

**Current State:** Excellent frontend prototype with complete UI, types, and database schema. Ready for backend integration.

**Blockers:** No backend infrastructure. All agent logic is mocked.

**Path Forward:** Build backend with LangGraph orchestration, integrate Claude API, connect to frontend via REST + WebSocket.

**Timeline:** 2-3 weeks to production-ready system with all 8 core agents.

**Next Action:** Execute backend setup prompts in order (3, 5, 4, 6, 7, 8).
