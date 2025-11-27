# Test Generator 2.0 - Complete Documentation

## Overview
Test Generator 2.0 is a comprehensive test data generation system for the Aioscrew airline crew management platform. It generates realistic crew, trip, claim, violation, and disruption data, writing directly to a local or cloud PostgreSQL database.

---

## Table of Contents
- [Architecture](#architecture)
- [Features](#features)
- [Database Setup](#database-setup)
- [Components](#components)
- [Backend Services](#backend-services)
- [API Endpoints](#api-endpoints)
- [Scenario Presets](#scenario-presets)
- [Configuration Options](#configuration-options)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Architecture

### System Diagram
```
┌─────────────────┐
│  Landing Page   │
│  (React/Vite)   │
└────────┬────────┘
         │
         v
┌─────────────────────────────────────┐
│   Test Generator 2.0 Page           │
│   - Pink/Purple Branding            │
│   - Scenario Selection              │
│   - Advanced Configuration          │
│   - Input Preview                   │
│   - Review & Submit                 │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│   DataGenerationCard Component      │
│   - 8 Scenario Presets              │
│   - Real-time Stats Calculation     │
│   - Token/Cost Estimation           │
│   - Multi-step Workflow             │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│   Backend API (Express)             │
│   POST /api/agents/test-data/       │
│   - preview                         │
│   - generate                        │
│   - cleanup                         │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│   Test Data Generator Agent         │
│   - Ollama (llama3.2) Integration   │
│   - Claude Fallback                 │
│   - Blueprint Generation            │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│   Test Data Inserter Service        │
│   - PostgreSQL (pg library)         │
│   - Batch Insertions                │
│   - Progress Logging                │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│   PostgreSQL Database               │
│   - crew_members                    │
│   - trips                           │
│   - pay_claims                      │
│   - compliance_violations           │
│   - disruptions                     │
└─────────────────────────────────────┘
```

---

## Features

### Core Features
- **8 Scenario Presets**: Pre-configured scenarios for different testing needs
- **Advanced Configuration**: Fine-tune all parameters
- **Input Preview**: See projected statistics before generation
- **AI-Assisted Blueprint**: Get intelligent recommendations via Ollama/Claude
- **Direct Database Insertion**: Writes realistic data to PostgreSQL
- **Progress Tracking**: Real-time console logs during generation
- **Cost Awareness**: Displays token usage and estimated costs

### Data Generation Capabilities
- **Crew Members**: Realistic names, roles, bases, seniority, hire dates
- **Trips**: Routes, flight times, aircraft types, crew assignments
- **Pay Claims**: Multiple claim types with realistic amounts
- **Compliance Violations**: Rule violations with severity levels
- **Disruptions**: Operational disruptions with cost impact

---

## Database Setup

### Local PostgreSQL Setup

#### 1. Install PostgreSQL 18
```bash
brew install postgresql@18
brew services start postgresql@18
```

#### 2. Create Database
```bash
createdb aioscrew_dev
```

#### 3. Apply Schema
```bash
psql aioscrew_dev -f backend/migrations/local_test_data_schema.sql
```

#### 4. Configure Environment
Edit `backend/.env`:
```bash
# LOCAL (for development/testing)
DATABASE_URL=postgresql://yourusername@localhost/aioscrew_dev
```

### Cloud Database (Neon)
For production/Railway deployment:
```bash
DATABASE_URL=postgresql://neondb_owner:password@ep-pool.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Database Schema

#### crew_members
- `id` (VARCHAR): Unique crew ID (e.g., CM00001)
- `name` (VARCHAR): Full name
- `role` (VARCHAR): Captain, First Officer, Senior FA, Junior FA
- `base` (VARCHAR): Home base (PTY, GUA, MIA, MEX)
- `seniority` (INTEGER): Years of service
- `email` (VARCHAR UNIQUE): Auto-generated unique email
- `hire_date` (DATE): Date hired
- `ytd_earnings` (DECIMAL): Year-to-date earnings
- `status` (VARCHAR): active/inactive

#### trips
- `id` (VARCHAR): Trip ID (e.g., T000001)
- `trip_date` (DATE): Date of trip
- `route` (VARCHAR): Origin-Destination (e.g., PTY-MIA)
- `flight_numbers` (VARCHAR): Flight identifier
- `departure_time` (TIME): Departure time
- `flight_time_hours` (DECIMAL): Duration
- `credit_hours` (DECIMAL): Credit hours (typically > flight time)
- `is_international` (BOOLEAN): International flag
- `aircraft_type` (VARCHAR): 737-800, 737-MAX8, E190
- `captain_id`, `first_officer_id`, `senior_fa_id`, `junior_fa_id` (VARCHAR): Crew assignments

#### pay_claims
- `id` (VARCHAR): Claim ID (e.g., CL000001)
- `crew_id` (VARCHAR): Foreign key to crew_members
- `claim_type` (VARCHAR): Type of claim
- `trip_id` (VARCHAR): Related trip
- `claim_date` (DATE): Date claimed
- `amount` (DECIMAL): Claim amount
- `status` (VARCHAR): pending/approved/reviewed
- `ai_validated` (BOOLEAN): AI validation flag

#### compliance_violations
- `id` (SERIAL): Auto-increment ID
- `violation_type` (VARCHAR): Type of violation
- `crew_id` (VARCHAR): Crew involved
- `trip_id` (VARCHAR): Trip where violation occurred
- `severity` (VARCHAR): low/medium/high
- `description` (TEXT): Details
- `status` (VARCHAR): open/resolved

#### disruptions
- `id` (SERIAL): Auto-increment ID
- `trip_id` (VARCHAR): Affected trip
- `disruption_type` (VARCHAR): Type of disruption
- `severity` (VARCHAR): low/medium/high
- `crew_affected` (INTEGER): Number of crew affected
- `cost_impact` (DECIMAL): Financial impact
- `resolution_status` (VARCHAR): open/resolved

---

## Components

### Frontend Components

#### 1. TestGenerator2Page.tsx
**Location**: `src/components/TestGenerator2Page.tsx`

**Purpose**: Wrapper component for Test Generator 2.0 with pink/purple branding

**Features**:
- Pink/purple gradient background
- Back button to return to landing page
- Imports and renders DataGenerationCard

**Code**:
```typescript
export default function TestGenerator2Page({ onBack }: TestGenerator2PageProps = {}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-slate-900 text-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {onBack && (
          <button onClick={onBack} className="...">
            ← Back to Landing Page
          </button>
        )}
        <DataGenerationCard />
      </div>
    </div>
  );
}
```

#### 2. DataGenerationCard.tsx
**Location**: `src/components/DataGenerationCard.tsx`

**Purpose**: Main test data generation UI with scenario selection, configuration, and submission

**Key Sections**:

##### Scenario Presets (8 total)
```typescript
const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'normal',
    name: 'Normal Operations',
    config: {
      totalCrewMembers: 25,
      averageTripsPerMonth: 1,
      claimFrequency: 1,
      violationRate: 0.1,
      disruptionRate: 0.25,
      // ...
    }
  },
  // ... 7 more scenarios
];
```

##### Default Configuration
```typescript
const DEFAULT_CONFIG: DataGenerationConfig = {
  totalCrewMembers: 25,
  captains: 25,
  firstOfficers: 25,
  seniorFA: 25,
  juniorFA: 25,
  yearsOfHistory: 1,
  startDate: '2024-01-01',
  averageTripsPerMonth: 1,
  internationalRatio: 0.3,
  claimFrequency: 1,
  claimTypes: {
    internationalPremium: 25,
    perDiem: 25,
    holidayPay: 10,
    overtime: 15,
    layoverPremium: 8,
    training: 5,
    leadPremium: 5,
    deadhead: 4,
    other: 3
  },
  violationRate: 0.1,
  disruptionRate: 0.25,
  bases: ['PTY', 'GUA', 'MIA', 'MEX'],
  routes: ['PTY-GUA', 'PTY-MIA', 'PTY-MEX', 'GUA-MIA', 'MIA-MEX'],
  aircraftTypes: ['737-800', '737-MAX8', 'E190'],
  useRealisticDistributions: true,
  useSeasonalPatterns: true,
  generateEdgeCases: false
};
```

##### State Management
```typescript
const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
const [config, setConfig] = useState<DataGenerationConfig>(DEFAULT_CONFIG);
const [currentStep, setCurrentStep] = useState<'select' | 'configure' | 'review'>('select');
const [inputPreview, setInputPreview] = useState<any>(null);
const [isLoadingPreview, setIsLoadingPreview] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
```

##### API Integration
```typescript
// Preview endpoint
const response = await fetch('http://localhost:3001/api/agents/test-data/preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ config, scenarioId: selectedScenario })
});

// Generate endpoint
const response = await fetch('http://localhost:3001/api/agents/test-data/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ config, scenarioId: selectedScenario, llmPreference: 'ollama' })
});
```

#### 3. LandingPage.tsx
**Location**: `src/components/LandingPage.tsx`

**Changes Made**:
- Removed Automation Labs card and all related code
- Removed `AutomationLabsPage` import
- Removed `showAutomationLab` state
- Removed `Cpu` icon from imports
- Kept Test Generator 2.0 card with Sparkles icon

---

## Backend Services

### 1. Test Data Generator Agent
**Location**: `backend/agents/core/test-data-generator.ts`

**Purpose**: AI-powered blueprint generation using Ollama or Claude

**Key Functions**:

```typescript
export async function runTestDataGenerator(
  config: TestDataConfig,
  scenarioId?: string,
  llmPreference?: string
): Promise<TestDataBlueprint>
```

**Features**:
- Generates AI-assisted recommendations
- Calculates projected statistics
- Returns structured blueprint
- FREE when using local Ollama

### 2. Test Data Inserter Service
**Location**: `backend/services/test-data-inserter.ts`

**Purpose**: Inserts realistic test data directly into PostgreSQL database

**Key Functions**:

##### insertCrewMembers
```typescript
async function insertCrewMembers(config: TestDataConfig): Promise<string[]> {
  const roles = [
    { role: 'Captain', count: Math.round((captains / 100) * totalCrewMembers) },
    { role: 'First Officer', count: Math.round((firstOfficers / 100) * totalCrewMembers) },
    { role: 'Senior FA', count: Math.round((seniorFA / 100) * totalCrewMembers) },
    { role: 'Junior FA', count: Math.round((juniorFA / 100) * totalCrewMembers) }
  ];

  for (const { role, count } of roles) {
    for (let i = 0; i < count; i++) {
      const id = `CM${String(crewIndex).padStart(5, '0')}`;
      const name = generateCrewName();
      const base = randomPick(bases);
      const hireDate = randomDate(yearsAgo, startDate);
      const email = `${name.toLowerCase().replace(' ', '.')}.${id.toLowerCase()}@copa.com`;

      await pool.query(
        `INSERT INTO crew_members (id, name, role, base, seniority, email, hire_date, ytd_earnings, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
         ON CONFLICT (id) DO NOTHING`,
        [id, name, role, base, seniority, email, hireDate.toISOString().split('T')[0], ytdEarnings]
      );

      crewIds.push(id);
      crewIndex++;
    }
  }

  return crewIds;
}
```

##### insertTrips
```typescript
async function insertTrips(config: TestDataConfig, crewIds: string[]): Promise<string[]> {
  const totalTrips = averageTripsPerMonth * totalMonths;

  for (let i = 0; i < totalTrips; i++) {
    const id = `T${String(i + 1).padStart(6, '0')}`;
    const route = randomPick(routes);
    const tripDate = randomDate(end, start);
    const isInternational = Math.random() < (internationalRatio / 100);

    // Calculate flight times
    const flightTimeHours = isInternational ? (Math.random() * 4 + 2) : (Math.random() * 2 + 0.5);
    const creditHours = flightTimeHours * 1.1;

    // Assign crew
    const captains = crewIds.filter(id => id.startsWith('CM') && Math.random() > 0.7);

    await pool.query(
      `INSERT INTO trips (...) VALUES (...) ON CONFLICT (id) DO NOTHING`,
      [id, tripDate, route, flightNumbers, departureTime, flightTimeHours, creditHours, ...]
    );

    tripIds.push(id);
  }

  return tripIds;
}
```

##### insertClaims
```typescript
async function insertClaims(config: TestDataConfig, crewIds: string[], tripIds: string[]): Promise<number> {
  const totalClaims = Math.floor(crewIds.length * claimFrequency);

  for (let i = 0; i < totalClaims; i++) {
    const claimType = randomPick(claimTypesList);
    const amount = Math.floor(Math.random() * (max - min) + min);
    const status = randomPick(['approved', 'pending', 'reviewed']);

    await pool.query(
      `INSERT INTO pay_claims (...) VALUES (...) ON CONFLICT (id) DO NOTHING`,
      [id, crewId, claimType, tripId, claimDate, amount, status, aiValidated, submittedBy]
    );
  }

  return totalClaims;
}
```

##### insertViolations & insertDisruptions
Similar patterns for violations and disruptions with appropriate types and severity levels.

**Key Features**:
- Uses standard `pg` library (not Neon serverless)
- Parameterized queries ($1, $2, etc.) for SQL injection prevention
- `ON CONFLICT DO NOTHING` for idempotent insertions
- Progress logging every 500-1000 records
- Unique email generation with crew ID suffix
- Realistic data generation with random helpers

### 3. Database Service
**Location**: `backend/services/database-service.ts`

**Important Fix**: Added early dotenv loading to ensure DATABASE_URL is available:
```typescript
import { config } from 'dotenv';
config();

import { neon } from '@neondatabase/serverless';
// ... rest of imports
```

---

## API Endpoints

### Base URL
- Local: `http://localhost:3001/api/agents`
- Railway: `https://your-app.railway.app/api/agents`

### 1. POST /test-data/preview
**Purpose**: Returns formatted input preview before generation

**Request**:
```json
{
  "config": {
    "totalCrewMembers": 25,
    "averageTripsPerMonth": 1,
    "yearsOfHistory": 1,
    "claimFrequency": 1,
    "violationRate": 0.1,
    "disruptionRate": 0.25,
    // ... full config
  },
  "scenarioId": "normal"
}
```

**Response**:
```json
{
  "scenario": {
    "id": "normal",
    "name": "Normal Operations"
  },
  "crew": {
    "total": 25,
    "distribution": {
      "captains": 25,
      "firstOfficers": 25,
      "seniorFA": 25,
      "juniorFA": 25
    }
  },
  "timeRange": {
    "years": 1,
    "startDate": "2024-01-01",
    "endDate": "2025-01-01"
  },
  "projectedStats": {
    "dataPoints": 150,
    "estimatedTokens": 5000,
    "estimatedCost": "$0.015"
  }
}
```

### 2. POST /test-data/generate
**Purpose**: Generates and inserts test data into database

**Request**:
```json
{
  "config": { /* same as preview */ },
  "scenarioId": "normal",
  "llmPreference": "ollama"
}
```

**Response**:
```json
{
  "blueprint": {
    "scenario": "normal",
    "recommendations": "...",
    "aiInsights": "..."
  },
  "insertion": {
    "crewMembers": 25,
    "trips": 12,
    "claims": 25,
    "violations": 1,
    "disruptions": 3,
    "totalRecords": 66
  },
  "success": true
}
```

### 3. POST /test-data/cleanup
**Purpose**: Removes generated test data to start fresh

**Request**:
```json
{
  "preserveCrew": true  // optional, default true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Test data tables cleared",
  "clearedScenarios": true,
  "crewPreserved": true
}
```

**Database Operations**:
```sql
TRUNCATE TABLE pay_claims, trips, disruptions, compliance_violations
RESTART IDENTITY CASCADE;

-- If preserveCrew = false:
TRUNCATE TABLE crew_members RESTART IDENTITY CASCADE;
```

---

## Scenario Presets

### 1. Normal Operations
**ID**: `normal`
**Description**: Balanced, realistic airline operations with typical patterns

**Config**:
- Crew: 25
- Trips/Month: 1
- International Ratio: 30%
- Claim Frequency: 1
- Violation Rate: 0.1%
- Disruption Rate: 0.25%

**Use Cases**:
- Basic functionality testing
- Demo scenarios
- Integration testing

**Projected Output**:
- ~25 crew members
- ~12 trips
- ~25 claims
- ~1 violation
- ~3 disruptions

### 2. Stress Test - High Volume
**ID**: `stress_test`
**Description**: Maximum crew, high trip volume for system testing

**Config**:
- Crew: 50
- Trips/Month: 1
- International Ratio: 50%
- Claim Frequency: 1
- Violation Rate: 0.25%
- Disruption Rate: 0.6%

**Use Cases**:
- Performance testing
- Load testing
- Edge case discovery

**Projected Output**:
- ~50 crew members
- ~12 trips
- ~50 claims
- ~3 violations
- ~7 disruptions

### 3. International Expansion
**ID**: `international_expansion`
**Description**: Heavy international operations with premium claims

**Config**:
- Crew: 38
- Trips/Month: 1
- International Ratio: 80%
- Claim Frequency: 1
- Claim Type Focus: International Premium (40%), Per Diem (30%)

**Use Cases**:
- International route testing
- Premium pay testing
- Extended layover scenarios

### 4. Holiday Season Rush
**ID**: `holiday_season`
**Description**: Peak holiday travel with overtime and holiday pay

**Config**:
- Crew: 30
- Trips/Month: 1
- Claim Frequency: 1
- Claim Type Focus: Holiday Pay (20%), Overtime (20%)
- Seasonal Patterns: Enabled

**Use Cases**:
- Peak period testing
- Overtime calculation testing
- Holiday pay rules

### 5. Compliance Audit Period
**ID**: `compliance_audit`
**Description**: Increased violations and edge cases

**Config**:
- Crew: 20
- Trips/Month: 1
- Violation Rate: 0.75%
- Disruption Rate: 1%
- Edge Cases: Enabled

**Use Cases**:
- Compliance testing
- Violation detection
- Edge case handling

### 6. Training & Development
**ID**: `training_overhaul`
**Description**: Heavy training period with training pay claims

**Config**:
- Crew: 25
- Trips/Month: 1
- Claim Type Focus: Training (30%), Lead Premium (10%)

**Use Cases**:
- Training pay testing
- Instructor premium testing
- Qualification tracking

### 7. Crew Shortage Crisis
**ID**: `crew_shortage`
**Description**: Understaffed period with excessive overtime

**Config**:
- Crew: 15
- Trips/Month: 1
- Claim Frequency: 1
- Claim Type Focus: Overtime (30%), Deadhead (10%)

**Use Cases**:
- Understaffing scenarios
- Overtime limit testing
- Crew fatigue patterns

### 8. Contract Negotiation
**ID**: `contract_negotiation`
**Description**: Mix of boundary-testing claims and grievances

**Config**:
- Crew: 28
- Claim Frequency: 1
- Violation Rate: 0.4%
- Edge Cases: Enabled
- Claim Type Focus: Other (10%)

**Use Cases**:
- Contract boundary testing
- Dispute scenarios
- Edge case claims

---

## Configuration Options

### Crew Configuration
```typescript
{
  totalCrewMembers: number,      // Total crew to generate (reduced from 500 to 25)
  captains: number,              // Percentage (0-100)
  firstOfficers: number,         // Percentage (0-100)
  seniorFA: number,              // Percentage (0-100)
  juniorFA: number,              // Percentage (0-100)
}
```

### Time Configuration
```typescript
{
  yearsOfHistory: number,        // Years to generate (reduced from 10 to 1)
  startDate: string,             // YYYY-MM-DD format (updated to 2024-01-01)
}
```

### Operations Configuration
```typescript
{
  averageTripsPerMonth: number,  // Average trips per crew/month (reduced from 15 to 1)
  internationalRatio: number,    // Percentage (0-1, e.g., 0.3 = 30%)
  bases: string[],               // ['PTY', 'GUA', 'MIA', 'MEX']
  routes: string[],              // ['PTY-GUA', 'PTY-MIA', ...]
  aircraftTypes: string[],       // ['737-800', '737-MAX8', 'E190']
}
```

### Claims Configuration
```typescript
{
  claimFrequency: number,        // Claims per crew member (reduced from 4 to 1)
  claimTypes: {
    internationalPremium: number,  // Percentage
    perDiem: number,              // Percentage
    holidayPay: number,           // Percentage
    overtime: number,             // Percentage
    layoverPremium: number,       // Percentage
    training: number,             // Percentage
    leadPremium: number,          // Percentage
    deadhead: number,             // Percentage
    other: number                 // Percentage
  }
}
```

### Patterns Configuration
```typescript
{
  violationRate: number,           // Percentage of trips (reduced from 2 to 0.1)
  disruptionRate: number,          // Percentage of trips (reduced from 5 to 0.25)
  useRealisticDistributions: boolean,  // Enable realistic patterns
  useSeasonalPatterns: boolean,        // Enable seasonal variations
  generateEdgeCases: boolean           // Generate edge cases
}
```

---

## Development Workflow

### Initial Setup

1. **Clone Repository**
```bash
git clone git@github.com:jbandu/aioscrew.git
cd aioscrew
```

2. **Install Dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. **Setup Local Database**
```bash
brew install postgresql@18
brew services start postgresql@18
createdb aioscrew_dev
psql aioscrew_dev -f backend/migrations/local_test_data_schema.sql
```

4. **Configure Environment**
```bash
# backend/.env
DATABASE_URL=postgresql://yourusername@localhost/aioscrew_dev
ANTHROPIC_API_KEY=sk-ant-api03-...
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
```

5. **Install Ollama (Optional but Recommended)**
```bash
# Download from https://ollama.ai
ollama pull llama3.2:latest
```

### Running Development Servers

**Terminal 1 - Frontend**:
```bash
npm run dev
# Runs on http://localhost:5173 or 5174
```

**Terminal 2 - Backend**:
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

### Testing Locally

1. **Open Frontend**
```bash
open http://localhost:5173
```

2. **Click "Test Generator 2.0"** card from landing page

3. **Select a Scenario**
- Choose from 8 presets
- Click "Next: Configure"

4. **Configure (Optional)**
- Adjust advanced parameters
- Click "Next: Review"

5. **Review & Submit**
- Review projected stats
- Click "Generate Test Data"
- Monitor console logs in backend terminal

6. **Verify Data**
```bash
psql aioscrew_dev -c "SELECT COUNT(*) FROM crew_members;"
psql aioscrew_dev -c "SELECT COUNT(*) FROM trips;"
psql aioscrew_dev -c "SELECT COUNT(*) FROM pay_claims;"
```

### Making Changes

1. **Edit React Components**
```bash
# Changes hot reload automatically
vim src/components/DataGenerationCard.tsx
```

2. **Edit Backend Services**
```bash
# Backend restarts automatically with tsx watch
vim backend/services/test-data-inserter.ts
```

3. **Test Changes**
- Verify in browser
- Check backend console logs
- Query database to verify data

4. **Commit Changes**
```bash
git add .
git commit -m "feat: description of changes"
git push origin main
```

---

## Deployment

### Railway Deployment

#### Environment Variables
Configure in Railway dashboard:

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:password@ep-pool.neon.tech/neondb?sslmode=require

# API Keys
ANTHROPIC_API_KEY=sk-ant-api03-...

# Ollama (if using hosted)
OLLAMA_BASE_URL=https://your-ollama-instance.com
OLLAMA_MODEL=llama3.2:latest

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.railway.app
```

#### Build Configuration

**Backend** (`backend/package.json`):
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx watch server.ts"
  }
}
```

**Frontend** (`package.json`):
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### Deployment Steps

1. **Connect GitHub Repository** to Railway

2. **Configure Build Command**:
```bash
npm run build
```

3. **Configure Start Command**:
```bash
npm start
```

4. **Set Environment Variables** in Railway dashboard

5. **Deploy**:
- Push to `main` branch
- Railway auto-deploys

6. **Verify Deployment**:
```bash
curl https://your-app.railway.app/api/agents/health
```

### Database Migration on Railway

Railway uses Neon PostgreSQL. Schema is automatically created if using the Neon connection string.

To manually apply schema:
```bash
# Connect to Neon database
psql $DATABASE_URL -f backend/migrations/local_test_data_schema.sql
```

---

## Troubleshooting

### Common Issues

#### 1. "Load failed" Error on Review & Submit
**Symptom**: Backend not responding to API calls

**Solution**:
```bash
# Check backend is running
lsof -i :3001

# Restart backend
cd backend && npm run dev

# Check DATABASE_URL is loaded
# Add to backend/services/database-service.ts:
import { config } from 'dotenv';
config(); // MUST be before other imports
```

#### 2. Duplicate Email Constraint Violation
**Symptom**: `duplicate key value violates unique constraint "crew_members_email_key"`

**Solution**: Emails are now unique with crew ID suffix:
```typescript
const email = `${name.toLowerCase().replace(' ', '.')}.${id.toLowerCase()}@copa.com`;
// Example: jose.ramirez.cm00123@copa.com
```

#### 3. Neon Client Not Working with Local PostgreSQL
**Symptom**: `Error connecting to database: TypeError: fetch failed`

**Solution**: Use standard `pg` library:
```typescript
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Use parameterized queries
await pool.query(
  `INSERT INTO crew_members (...) VALUES ($1, $2, $3)`,
  [value1, value2, value3]
);
```

#### 4. Numbers Not Displaying in Advanced Configuration
**Symptom**: Input fields don't show typed numbers

**Solution**: Fixed input handlers:
```typescript
onChange={(e) => {
  const val = e.target.value === '' ? 0 : parseInt(e.target.value);
  if (!isNaN(val)) setConfig({ ...config, totalCrewMembers: val });
}}
```

#### 5. Ollama Not Found
**Symptom**: AI blueprint generation fails

**Solution**:
```bash
# Install Ollama
# Download from https://ollama.ai

# Pull model
ollama pull llama3.2:latest

# Verify running
curl http://localhost:11434/api/tags
```

#### 6. High Database Load on Railway
**Symptom**: Slow generation, timeout errors

**Solution**: Values already reduced 20x from original:
- Normal Operations: 500 → 25 crew
- Stress Test: 1000 → 50 crew
- All trips/month: reduced to 1
- Years of history: 10 → 1

To further reduce, edit scenario presets in `DataGenerationCard.tsx`.

### Debugging

#### Enable Verbose Logging

**Backend** (`backend/api/routes/agents.ts`):
```typescript
console.log('🔍 [TEST-DATA-PREVIEW] Endpoint called');
console.log('🔍 [TEST-DATA-PREVIEW] Request body:', req.body);
```

**Frontend** (`src/components/DataGenerationCard.tsx`):
```typescript
console.log('🎨 [TEST-GEN-UI] DataGenerationCard loaded');
console.log('📊 [CONFIG] Current config:', config);
```

#### Check Database Connections

**PostgreSQL**:
```bash
# Check server is running
brew services list | grep postgresql

# Test connection
psql aioscrew_dev -c "SELECT 1;"
```

**Neon**:
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### Monitor Backend Logs

**Development**:
```bash
cd backend
npm run dev
# Watch logs in terminal
```

**Production (Railway)**:
```bash
# View logs in Railway dashboard
# Or use Railway CLI:
railway logs
```

---

## Performance Considerations

### Local vs Cloud

**Local PostgreSQL**:
- ✅ Fast insertions (100+ records/sec)
- ✅ No network latency
- ✅ Free
- ❌ Not accessible externally
- ❌ Requires local setup

**Neon Cloud**:
- ✅ Accessible from anywhere
- ✅ Auto-scaling
- ✅ Backups included
- ❌ Network latency (~50-200ms per query)
- ❌ Connection limits on free tier

### Optimization Tips

1. **Batch Insertions** (already implemented):
```typescript
// Progress logging only every 500-1000 records
if ((i + 1) % 1000 === 0) {
  console.log(`   ... inserted ${i + 1}/${totalTrips} trips`);
}
```

2. **Use Transactions** (future optimization):
```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // ... multiple insertions
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
} finally {
  client.release();
}
```

3. **Parallel Insertions** (future optimization):
```typescript
await Promise.all([
  insertCrewMembers(config),
  insertTrips(config, crewIds),
  insertClaims(config, crewIds, tripIds)
]);
```

---

## Future Enhancements

### Planned Features
- [ ] Bulk import/export via CSV
- [ ] Custom scenario saving
- [ ] Data templates library
- [ ] Real-time progress bar in UI
- [ ] Rollback/undo generation
- [ ] Data validation before insertion
- [ ] Duplicate detection
- [ ] Incremental generation (add to existing)
- [ ] Multi-tenant support
- [ ] Historical data comparison
- [ ] Performance benchmarking

### Architecture Improvements
- [ ] Database transactions
- [ ] Connection pooling optimization
- [ ] Parallel insertion workers
- [ ] Streaming responses for large datasets
- [ ] WebSocket real-time updates
- [ ] Redis caching layer
- [ ] Background job queue (Bull/BullMQ)

---

## Version History

### v2.0.0 (Current - 2025-01-27)
- ✅ Test Generator 2.0 with pink/purple branding
- ✅ Complete rewrite with direct database insertion
- ✅ 8 scenario presets
- ✅ Advanced configuration panel
- ✅ Input preview with statistics
- ✅ Review & submit workflow
- ✅ Ollama integration (FREE local LLM)
- ✅ PostgreSQL support (pg library)
- ✅ Reduced default values by 20x for Railway
- ✅ Removed Automation Labs (deprecated)
- ✅ Unique email generation with crew ID
- ✅ Progress logging during generation
- ✅ Cleanup endpoint for fresh starts

### v1.0.0 (Deprecated)
- ❌ Automation Labs with basic test generation
- ❌ Blueprint-only generation (no database writes)
- ❌ Limited scenario options

---

## Credits & License

**Developed by**: jbandu team
**AI Assistance**: Claude (Anthropic)
**Infrastructure**: Railway, Neon Database
**Local LLM**: Ollama (llama3.2:latest)

**License**: Proprietary

---

## Support & Contact

For issues, questions, or contributions:

1. **GitHub Issues**: https://github.com/jbandu/aioscrew/issues
2. **Documentation**: This file
3. **Email**: support@jbandu.com (if applicable)

---

## Appendix

### Full File Structure
```
aioscrew/
├── src/
│   └── components/
│       ├── LandingPage.tsx          # Landing page with Test Gen 2.0 card
│       ├── TestGenerator2Page.tsx   # Wrapper with pink/purple branding
│       ├── DataGenerationCard.tsx   # Main UI component
│       └── (other components)
├── backend/
│   ├── api/
│   │   └── routes/
│   │       └── agents.ts            # API endpoints
│   ├── agents/
│   │   └── core/
│   │       └── test-data-generator.ts  # AI blueprint generator
│   ├── services/
│   │   ├── database-service.ts      # Database queries
│   │   └── test-data-inserter.ts    # Data insertion logic
│   ├── migrations/
│   │   └── local_test_data_schema.sql  # PostgreSQL schema
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── server.ts                    # Express server
├── TEST_GENERATOR_DOCUMENTATION.md  # This file
├── package.json
└── README.md
```

### Environment Variables Reference
```bash
# Database
DATABASE_URL=postgresql://user@host/database

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...

# Ollama (Local LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest

# OpenAI (Optional)
OPENAI_API_KEY=sk-proj-...

# Google AI (Optional)
GOOGLE_API_KEY=AIzaSy-...

# xAI (Optional)
XAI_API_KEY=xai-...

# Neo4j (Optional)
NEO4J_URI=neo4j+s://...
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=...

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Database Queries Quick Reference

**Count Records**:
```sql
SELECT
  (SELECT COUNT(*) FROM crew_members) as crew,
  (SELECT COUNT(*) FROM trips) as trips,
  (SELECT COUNT(*) FROM pay_claims) as claims,
  (SELECT COUNT(*) FROM compliance_violations) as violations,
  (SELECT COUNT(*) FROM disruptions) as disruptions;
```

**View Sample Data**:
```sql
-- Crew members
SELECT id, name, role, base FROM crew_members LIMIT 10;

-- Recent trips
SELECT id, trip_date, route, aircraft_type FROM trips ORDER BY trip_date DESC LIMIT 10;

-- Claims by type
SELECT claim_type, COUNT(*), AVG(amount)
FROM pay_claims
GROUP BY claim_type;

-- Violations by severity
SELECT severity, COUNT(*)
FROM compliance_violations
GROUP BY severity;
```

**Clear All Data**:
```sql
TRUNCATE TABLE pay_claims, trips, disruptions, compliance_violations, crew_members
RESTART IDENTITY CASCADE;
```

---

*Last Updated: January 27, 2025*
*Version: 2.0.0*
