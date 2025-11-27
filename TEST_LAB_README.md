# Test Lab - AI Agent Testing Framework

## Overview

Test Lab is a comprehensive testing and validation framework for AI agents that process airline crew pay claims. It allows you to:

- **Generate** realistic test data with configurable parameters
- **Execute** AI agents against test scenarios with real-time monitoring
- **Analyze** results with detailed performance metrics and comparisons
- **Export** findings to PDF and CSV for stakeholder review
- **Compare** multiple test runs to demonstrate consistency and improvement

## Architecture

### Components

1. **Frontend** (`src/components/TestLabPage.tsx`)
   - Test configuration UI
   - Real-time execution monitoring with SSE
   - Results visualization and export

2. **Backend** (`backend/agents/core/test-lab-executor.ts`)
   - Agent orchestration engine
   - LLM-powered or rule-based decision making
   - Real-time event streaming

3. **Database** (PostgreSQL)
   - Test scenarios and workflows
   - Execution history and results
   - Agent decisions and logs

### Agent Flow

```
Pay Claim → ClaimValidatorAgent → [APPROVE/ESCALATE/REJECT]
                                 ↓
                           (if escalated)
                                 ↓
                        ComplianceCheckerAgent → [APPROVE/ESCALATE/REJECT]
                                 ↓
                        PayrollProcessorAgent → Update Database
```

## Configuration

### Environment Variables

**Backend (`.env`):**

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/aioscrew_dev

# LLM Configuration (optional)
USE_LLM_AGENTS=false  # Set to 'true' for LLM-powered agents
ANTHROPIC_API_KEY=sk-ant-xxx  # Required if USE_LLM_AGENTS=true

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Agent Modes

#### Rule-Based Mode (Default)
- **Cost**: Free
- **Speed**: Fast (~100-500ms per claim)
- **Use Case**: Demos, development, high-volume testing
- **Enable**: `USE_LLM_AGENTS=false`

#### LLM-Powered Mode
- **Cost**: ~$0.001-0.002 per claim
- **Speed**: Moderate (~1-3s per claim)
- **Use Case**: Production, complex reasoning, edge cases
- **Enable**: `USE_LLM_AGENTS=true`
- **Model**: Claude Sonnet 4.5 (claude-sonnet-4-20250514)

## Usage Guide

### 1. Seed Scenarios

First time setup requires seeding test scenarios:

```bash
cd backend
npm run seed:test-lab
```

This creates:
- 2 workflows (COPA Airlines, Avelo Airlines)
- 6 test scenarios with different characteristics

### 2. Generate Test Data

1. Navigate to **Test Lab** page
2. Select a **Workflow** (e.g., "COPA Claims Processing")
3. Select a **Scenario** (e.g., "Baseline Demo")
4. Click **"Generate Test Data"**
5. Wait for data generation to complete (~30-60 seconds)

**Generated Data:**
- Crew members with varied roles and seniority
- Flight trips (domestic/international)
- Pay claims (per_diem, international_premium, etc.)
- Compliance violations (for testing)
- Disruptions (delays, cancellations)

### 3. Execute Agents

1. Click **"Start Execution"** after data generation
2. Watch real-time progress:
   - **Agent Actions**: See which agent is processing which claim
   - **Decisions**: View approval/escalation/rejection decisions
   - **Logs**: Monitor execution flow with detailed logging
   - **Progress**: Track completion percentage

### 4. View Results

After execution completes:

**Summary Cards:**
- Total claims processed
- Auto-approved count & percentage
- Escalated count & percentage
- Rejected count & percentage

**Performance vs Expected:**
- Compare actual results to scenario expectations
- Color-coded status (green=within tolerance, yellow=acceptable, red=flag)
- Tolerance: ±5% for rates, ±20% for processing time

**Agent Performance:**
- Accuracy percentage
- Average decision time
- Claims processed
- Escalation rates

**Notable Cases:**
- High-confidence catches (fraud detection)
- Escalated claims (policy questions)
- Fast approvals (clear-cut cases)

### 5. Export Results

**PDF Export:**
- Professional report format
- Execution summary
- Agent performance breakdown
- Notable cases with reasoning
- Suitable for executive review

**CSV Export:**
- Two sections: Summary + Detailed decisions
- Full reasoning chains
- Suitable for data analysis

### 6. Compare Scenarios

1. Click **"Compare with Previous Runs"**
2. Select 2-4 completed executions
3. Click **"Compare"**
4. View comparative analysis:
   - **Grouped bar chart**: Decision distribution
   - **Line chart**: Processing times
   - **Comparison table**: Color-coded metrics
   - **Auto-generated insights**: Key findings

## Testing Checklist

Use this checklist before demos or production deployment:

- [ ] ✅ Can select workflow and scenario
- [ ] ✅ Generate test data completes successfully
- [ ] ✅ Execution starts and streams logs in real-time
- [ ] ✅ SSE connection maintains stable connection
- [ ] ✅ Results display correctly after completion
- [ ] ✅ Export to PDF downloads valid file
- [ ] ✅ Export to CSV downloads valid file
- [ ] ✅ Comparison feature loads and displays charts
- [ ] ✅ Mobile/tablet responsive layout works
- [ ] ✅ No console errors during full workflow
- [ ] ✅ Database connections handle gracefully

## API Endpoints

### Test Lab Routes (`/api/test-lab`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workflows` | List all available workflows |
| GET | `/scenarios` | List all test scenarios |
| GET | `/scenarios/:id` | Get scenario details |
| POST | `/generate` | Generate test data for scenario |
| POST | `/execute` | Start agent execution |
| GET | `/execute/:id/stream` | SSE stream for execution events |
| GET | `/execute/:id/results` | Fetch detailed execution results |
| GET | `/execute/:id/export/pdf` | Download PDF report |
| GET | `/execute/:id/export/csv` | Download CSV data |
| POST | `/compare` | Compare multiple executions |
| GET | `/executions` | List execution history |

## Database Schema

### Key Tables

**`test_lab_scenarios`**
- Predefined test scenarios
- Expected outcome benchmarks
- Data generation profiles

**`test_lab_executions`**
- Execution runs and status
- Results and metrics
- Timestamps and duration

**`agent_decisions`**
- Individual claim decisions
- Agent reasoning chains
- Confidence scores
- Processing times

**`execution_logs`**
- Detailed execution logs
- Agent actions
- Milestones and errors

## Troubleshooting

### SSE Connection Issues

**Problem**: Logs not streaming in real-time

**Solution:**
```bash
# Check backend is running
curl http://localhost:3001/health

# Test SSE endpoint directly
curl http://localhost:3001/api/test-lab/execute/1/stream
```

### Data Generation Fails

**Problem**: Test data generation times out

**Solution:**
- Check database connection: `psql $DATABASE_URL`
- Reduce data volume in scenario configuration
- Use local database instead of Neon for large datasets

### LLM Agents Not Working

**Problem**: Agents falling back to rules despite `USE_LLM_AGENTS=true`

**Solution:**
```bash
# Verify API key is set
echo $ANTHROPIC_API_KEY

# Check backend logs for LLM initialization
# Should see: "✓ LLM-powered agents enabled with Claude Sonnet 4.5"
npm run dev
```

### Export Fails

**Problem**: PDF/CSV export returns 500 error

**Solution:**
- Verify execution completed successfully
- Check `execution.status = 'completed'` in database
- Ensure `execution.results` is not null

## Performance Optimization

### Large Datasets

For scenarios with >1000 claims:

1. **Use Rule-Based Agents**: 10x faster than LLM mode
2. **Batch Processing**: Process in chunks of 500 claims
3. **Local Database**: Avoid network latency with local PostgreSQL
4. **Limit Logs**: Set `showLogs: false` to reduce database writes

### Production Deployment

**Recommended Configuration:**

```bash
# Use LLM agents for production
USE_LLM_AGENTS=true

# Use Neon for production database
DATABASE_URL=postgresql://xxx@neon.tech/aioscrew

# Enable production mode
NODE_ENV=production
```

## Cost Estimation

### LLM Mode Costs

**Assumptions:**
- Claude Sonnet 4.5: $3 per 1M input tokens, $15 per 1M output tokens
- Average prompt: ~800 tokens (input)
- Average response: ~200 tokens (output)

**Cost per Claim:**
- Input: 800 tokens × $3/1M = $0.0024
- Output: 200 tokens × $15/1M = $0.003
- **Total: ~$0.0054 per claim**

**Example Costs:**
- 100 claims: ~$0.54
- 1,000 claims: ~$5.40
- 10,000 claims: ~$54.00

**Optimization:**
- Use rule-based mode for routine testing (free)
- Use LLM mode for production validation
- Cache common claim patterns to reduce API calls

## Future Enhancements

Planned features for future releases:

1. **A/B Testing**: Compare LLM vs rule-based performance
2. **Custom Scenarios**: UI for creating new test scenarios
3. **Replay Mode**: Re-execute historical claims with updated logic
4. **Performance Profiling**: Identify bottlenecks in agent pipeline
5. **Multi-Workflow Testing**: Run same scenario across multiple workflows
6. **Regression Detection**: Alert when performance degrades
7. **Integration Tests**: Automated CI/CD test suite

## Support

For issues or questions:

- **GitHub Issues**: [github.com/yourusername/aioscrew/issues](https://github.com/yourusername/aioscrew/issues)
- **Documentation**: See inline code comments in:
  - `backend/agents/core/test-lab-executor.ts`
  - `src/components/TestLabPage.tsx`
  - `backend/api/routes/test-lab.ts`

## License

Copyright © 2025 AIOSCREW. All rights reserved.
