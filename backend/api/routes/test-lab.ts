/**
 * Test Lab API Routes
 * Handles scenario-based test data generation and agent execution
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import pkg from 'pg';
const { Pool } = pkg;
import type { TestDataConfig } from '../../agents/core/test-data-generator.js';
import { insertTestData } from '../../services/test-data-inserter.js';
import { executeTestScenario } from '../../agents/core/test-lab-executor.js';
import { exportResultsToPDF, exportResultsToCSV } from '../../services/test-lab-export.js';

const router = Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

const GenerateRequestSchema = z.object({
  scenarioId: z.string().min(1),
  overrides: z.object({
    totalCrewMembers: z.number().optional(),
    yearsOfHistory: z.number().optional(),
    averageTripsPerMonth: z.number().optional(),
    claimFrequency: z.number().optional(),
    internationalRatio: z.number().optional(),
    violationRate: z.number().optional(),
    disruptionRate: z.number().optional()
  }).optional()
});

const ExecuteRequestSchema = z.object({
  scenarioId: z.string().min(1),
  role: z.string().min(1),
  showLogs: z.boolean().default(true)
});

const CompareRequestSchema = z.object({
  executionIds: z.array(z.number()).min(2).max(4)
});

const CleanupRequestSchema = z.object({
  preserveCrew: z.boolean().optional().default(false)
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert scenario data_profile to TestDataConfig
 */
function scenarioToTestDataConfig(dataProfile: any, overrides?: Partial<TestDataConfig>): TestDataConfig {
  const { crewBreakdown, totalClaims, duration, claimDistribution } = dataProfile;

  // Parse duration to years (e.g., "1 month" -> 0.0833, "2 weeks" -> 0.0385)
  let yearsOfHistory = 1;
  if (duration) {
    const durationLower = duration.toLowerCase();
    if (durationLower.includes('week')) {
      const weeks = parseInt(durationLower);
      yearsOfHistory = weeks / 52;
    } else if (durationLower.includes('month')) {
      const months = parseInt(durationLower);
      yearsOfHistory = months / 12;
    }
  }

  // Calculate average trips per month based on total claims and crew
  const totalCrew = dataProfile.totalCrew || 20;
  const averageTripsPerMonth = Math.ceil((totalClaims || 40) / (yearsOfHistory * 12) * 2); // Claims come from trips

  // Convert claim distribution percentages to claim types
  const claimTypes: Record<string, number> = {};
  if (claimDistribution) {
    Object.entries(claimDistribution).forEach(([key, value]) => {
      claimTypes[key] = value as number;
    });
  } else {
    // Default distribution
    claimTypes['per_diem'] = 30;
    claimTypes['international_premium'] = 25;
    claimTypes['layover_premium'] = 20;
    claimTypes['overtime'] = 15;
    claimTypes['other'] = 10;
  }

  // Calculate claim frequency (claims per crew member)
  const claimFrequency = Math.ceil((totalClaims || 40) / totalCrew);

  const config: TestDataConfig = {
    totalCrewMembers: totalCrew,
    captains: ((crewBreakdown?.captains || 25) / 100) * 100,
    firstOfficers: ((crewBreakdown?.firstOfficers || 25) / 100) * 100,
    seniorFA: ((crewBreakdown?.seniorFA || 30) / 100) * 100,
    juniorFA: ((crewBreakdown?.juniorFA || 20) / 100) * 100,
    yearsOfHistory,
    startDate: new Date().toISOString().split('T')[0],
    averageTripsPerMonth,
    internationalRatio: 30,
    claimFrequency,
    claimTypes,
    violationRate: dataProfile.expectedViolations || 2,
    disruptionRate: dataProfile.expectedDisruptions || 1,
    bases: ['PTY', 'BOG', 'LIM', 'SCL'],
    routes: ['PTY-BOG', 'PTY-LIM', 'PTY-SCL', 'PTY-MEX', 'BOG-LIM'],
    aircraftTypes: ['737-800', '737-MAX9', 'E190'],
    useRealisticDistributions: true,
    useSeasonalPatterns: false,
    generateEdgeCases: !!dataProfile.edgeCases
  };

  // Apply overrides
  if (overrides) {
    return { ...config, ...overrides };
  }

  return config;
}

// ============================================================================
// 1. GET /api/test-lab/workflows
// ============================================================================

router.get('/workflows', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, agents, enabled
      FROM test_workflows
      ORDER BY name
    `);

    res.json({
      success: true,
      workflows: result.rows
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      error: 'Failed to fetch workflows',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// 2. GET /api/test-lab/scenarios
// ============================================================================

router.get('/scenarios', async (req: Request, res: Response) => {
  try {
    const { workflow, client } = req.query;

    let query = `
      SELECT id, name, description, client_name, workflow_id,
             data_profile, expected_outcomes, timeline
      FROM test_scenarios
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (workflow) {
      query += ` AND workflow_id = $${paramIndex}`;
      params.push(workflow);
      paramIndex++;
    }

    if (client) {
      query += ` AND client_name ILIKE $${paramIndex}`;
      params.push(`%${client}%`);
      paramIndex++;
    }

    query += ' ORDER BY client_name, name';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      scenarios: result.rows
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({
      error: 'Failed to fetch scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// 3. GET /api/test-lab/scenarios/:id
// ============================================================================

router.get('/scenarios/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT s.*, w.name as workflow_name, w.agents as workflow_agents
      FROM test_scenarios s
      LEFT JOIN test_workflows w ON s.workflow_id = w.id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Scenario not found'
      });
    }

    res.json({
      success: true,
      scenario: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching scenario:', error);
    res.status(500).json({
      error: 'Failed to fetch scenario',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// 4. POST /api/test-lab/generate
// ============================================================================

router.post('/generate', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = GenerateRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validation.error.errors
      });
    }

    const { scenarioId, overrides } = validation.data;

    // Fetch scenario
    const scenarioResult = await pool.query(
      'SELECT * FROM test_scenarios WHERE id = $1',
      [scenarioId]
    );

    if (scenarioResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Scenario not found'
      });
    }

    const scenario = scenarioResult.rows[0];
    console.log(`\n🧪 Generating test data for scenario: ${scenario.name}`);

    // Convert scenario data_profile to TestDataConfig
    const config = scenarioToTestDataConfig(scenario.data_profile, overrides);

    console.log('📊 Test Data Config:', {
      crew: config.totalCrewMembers,
      claims: scenario.data_profile.totalClaims,
      duration: scenario.data_profile.duration
    });

    // Generate and insert test data
    const insertionResult = await insertTestData(config);

    res.json({
      success: true,
      scenario: {
        id: scenario.id,
        name: scenario.name
      },
      generated: {
        crew: insertionResult.crewMembers,
        trips: insertionResult.trips,
        claims: insertionResult.claims,
        violations: insertionResult.violations,
        disruptions: insertionResult.disruptions,
        total: insertionResult.totalRecords
      },
      config: {
        yearsOfHistory: config.yearsOfHistory,
        averageTripsPerMonth: config.averageTripsPerMonth,
        claimFrequency: config.claimFrequency
      }
    });
  } catch (error) {
    console.error('Error generating test data:', error);
    res.status(500).json({
      error: 'Failed to generate test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// 5. POST /api/test-lab/execute
// ============================================================================

router.post('/execute', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = ExecuteRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validation.error.errors
      });
    }

    const { scenarioId, role, showLogs } = validation.data;

    // Verify scenario exists
    const scenarioResult = await pool.query(
      'SELECT * FROM test_scenarios WHERE id = $1',
      [scenarioId]
    );

    if (scenarioResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Scenario not found'
      });
    }

    const scenario = scenarioResult.rows[0];

    // Create test execution record
    const executionResult = await pool.query(`
      INSERT INTO test_executions (scenario_id, workflow_id, role_used, status)
      VALUES ($1, $2, $3, 'running')
      RETURNING id, scenario_id, workflow_id, role_used, status, started_at
    `, [scenarioId, scenario.workflow_id, role]);

    const execution = executionResult.rows[0];

    console.log(`\n✅ Started execution ${execution.id} for scenario: ${scenario.name}`);

    // Trigger agent execution asynchronously (don't await)
    executeTestScenario(execution.id, scenarioId, showLogs)
      .then((result) => {
        console.log(`✅ Execution ${execution.id} completed successfully:`, result);
      })
      .catch((error) => {
        console.error(`❌ Execution ${execution.id} failed:`, error);
      });

    res.status(201).json({
      success: true,
      executionId: execution.id,
      status: 'started',
      execution: {
        id: execution.id,
        scenarioId: execution.scenario_id,
        workflowId: execution.workflow_id,
        role: execution.role_used,
        startedAt: execution.started_at
      },
      message: `Execution started. Use GET /api/test-lab/execute/${execution.id}/stream to monitor progress.`
    });
  } catch (error) {
    console.error('Error starting execution:', error);
    res.status(500).json({
      error: 'Failed to start execution',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// 6. GET /api/test-lab/execute/:id/stream
// ============================================================================

router.get('/execute/:id/stream', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const executionId = parseInt(id);

    // Verify execution exists
    const executionResult = await pool.query(
      'SELECT * FROM test_executions WHERE id = $1',
      [executionId]
    );

    if (executionResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Execution not found'
      });
    }

    const execution = executionResult.rows[0];

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    console.log(`📡 SSE stream started for execution ${executionId}`);

    // Send initial connection event
    res.write(`data: ${JSON.stringify({
      type: 'connected',
      executionId,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Poll for logs and decisions
    let lastLogId = 0;
    let lastDecisionId = 0;
    let isComplete = false;

    const pollInterval = setInterval(async () => {
      try {
        // Check execution status
        const statusResult = await pool.query(
          'SELECT status, completed_at, results FROM test_executions WHERE id = $1',
          [executionId]
        );

        if (statusResult.rows.length > 0) {
          const currentStatus = statusResult.rows[0];

          if (currentStatus.status !== 'running' && !isComplete) {
            isComplete = true;

            // Send completion event
            res.write(`data: ${JSON.stringify({
              type: 'complete',
              status: currentStatus.status,
              completedAt: currentStatus.completed_at,
              results: currentStatus.results,
              timestamp: new Date().toISOString()
            })}\n\n`);

            clearInterval(pollInterval);
            res.end();
            return;
          }
        }

        // Fetch new logs
        const logsResult = await pool.query(
          'SELECT * FROM execution_logs WHERE execution_id = $1 AND id > $2 ORDER BY id ASC',
          [executionId, lastLogId]
        );

        for (const log of logsResult.rows) {
          res.write(`data: ${JSON.stringify({
            type: 'log',
            logLevel: log.log_level,
            agentName: log.agent_name,
            message: log.message,
            metadata: log.metadata,
            timestamp: log.logged_at
          })}\n\n`);
          lastLogId = log.id;
        }

        // Fetch new decisions
        const decisionsResult = await pool.query(
          'SELECT * FROM agent_decisions WHERE execution_id = $1 AND id > $2 ORDER BY id ASC',
          [executionId, lastDecisionId]
        );

        for (const decision of decisionsResult.rows) {
          res.write(`data: ${JSON.stringify({
            type: 'decision',
            agentName: decision.agent_name,
            claimId: decision.claim_id,
            decision: decision.decision,
            reasoning: decision.reasoning,
            confidence: decision.confidence,
            processingTimeMs: decision.processing_time_ms,
            timestamp: decision.decided_at
          })}\n\n`);
          lastDecisionId = decision.id;
        }

        // Send heartbeat every 10 seconds
        if (Math.random() < 0.1) {
          res.write(`data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          })}\n\n`);
        }

      } catch (pollError) {
        console.error('Error polling for updates:', pollError);
      }
    }, 1000); // Poll every second

    // Clean up on client disconnect
    req.on('close', () => {
      console.log(`📡 SSE stream closed for execution ${executionId}`);
      clearInterval(pollInterval);
    });

  } catch (error) {
    console.error('Error setting up SSE stream:', error);
    res.status(500).json({
      error: 'Failed to set up stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// 7. GET /api/test-lab/execute/:id/results
// ============================================================================

router.get('/execute/:id/results', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const executionId = parseInt(id);

    // Fetch execution with scenario details
    const executionResult = await pool.query(`
      SELECT
        e.*,
        s.name as scenario_name,
        s.expected_outcomes,
        s.data_profile,
        w.name as workflow_name,
        w.agents as workflow_agents
      FROM test_executions e
      JOIN test_scenarios s ON e.scenario_id = s.id
      JOIN test_workflows w ON e.workflow_id = w.id
      WHERE e.id = $1
    `, [executionId]);

    if (executionResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Execution not found'
      });
    }

    const execution = executionResult.rows[0];

    // Fetch all decisions
    const decisionsResult = await pool.query(`
      SELECT *
      FROM agent_decisions
      WHERE execution_id = $1
      ORDER BY decided_at ASC
    `, [executionId]);

    // Fetch decision summary
    const summaryResult = await pool.query(`
      SELECT
        decision,
        COUNT(*) as count,
        AVG(confidence) as avg_confidence,
        AVG(processing_time_ms) as avg_processing_time
      FROM agent_decisions
      WHERE execution_id = $1
      GROUP BY decision
    `, [executionId]);

    // Calculate metrics
    const totalDecisions = decisionsResult.rows.length;
    const approved = decisionsResult.rows.filter(d => d.decision === 'APPROVED').length;
    const escalated = decisionsResult.rows.filter(d => d.decision === 'ESCALATED').length;
    const rejected = decisionsResult.rows.filter(d => d.decision === 'REJECTED').length;

    const actualOutcomes = {
      autoApproved: approved,
      escalated,
      rejected
    };

    const expectedOutcomes = execution.expected_outcomes || {};

    // Calculate variance from expected
    const vsExpected = {
      approvedDelta: approved - (expectedOutcomes.autoApproved || 0),
      escalatedDelta: escalated - (expectedOutcomes.escalated || 0),
      rejectedDelta: rejected - (expectedOutcomes.rejected || 0),
      accuracyScore: totalDecisions > 0
        ? Math.round((1 - (
            Math.abs(approved - (expectedOutcomes.autoApproved || 0)) +
            Math.abs(escalated - (expectedOutcomes.escalated || 0)) +
            Math.abs(rejected - (expectedOutcomes.rejected || 0))
          ) / totalDecisions) * 100)
        : 0
    };

    // Agent-specific metrics
    const agentMetrics = decisionsResult.rows.reduce((acc: any, decision) => {
      const agent = decision.agent_name;
      if (!acc[agent]) {
        acc[agent] = {
          totalDecisions: 0,
          approved: 0,
          escalated: 0,
          rejected: 0,
          avgConfidence: 0,
          avgProcessingTime: 0,
          confidenceSum: 0,
          processingTimeSum: 0
        };
      }

      acc[agent].totalDecisions++;
      if (decision.decision === 'APPROVED') acc[agent].approved++;
      if (decision.decision === 'ESCALATED') acc[agent].escalated++;
      if (decision.decision === 'REJECTED') acc[agent].rejected++;
      acc[agent].confidenceSum += decision.confidence || 0;
      acc[agent].processingTimeSum += decision.processing_time_ms || 0;

      return acc;
    }, {});

    // Calculate averages
    Object.keys(agentMetrics).forEach(agent => {
      const metrics = agentMetrics[agent];
      metrics.avgConfidence = Math.round(metrics.confidenceSum / metrics.totalDecisions);
      metrics.avgProcessingTime = Math.round(metrics.processingTimeSum / metrics.totalDecisions);
      delete metrics.confidenceSum;
      delete metrics.processingTimeSum;
    });

    // Notable cases (low confidence, high processing time, edge cases)
    const notableCases = decisionsResult.rows
      .filter(d =>
        (d.confidence && d.confidence < 70) ||
        (d.processing_time_ms && d.processing_time_ms > 5000) ||
        d.decision === 'ESCALATED'
      )
      .slice(0, 10)
      .map(d => ({
        claimId: d.claim_id,
        agentName: d.agent_name,
        decision: d.decision,
        confidence: d.confidence,
        processingTimeMs: d.processing_time_ms,
        reasoning: d.reasoning,
        decidedAt: d.decided_at
      }));

    res.json({
      success: true,
      execution: {
        id: execution.id,
        scenarioId: execution.scenario_id,
        scenarioName: execution.scenario_name,
        workflowId: execution.workflow_id,
        workflowName: execution.workflow_name,
        role: execution.role_used,
        status: execution.status,
        startedAt: execution.started_at,
        completedAt: execution.completed_at,
        duration: execution.completed_at
          ? Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000)
          : null
      },
      decisions: decisionsResult.rows,
      summary: {
        total: totalDecisions,
        approved,
        escalated,
        rejected,
        byDecision: summaryResult.rows
      },
      actual: actualOutcomes,
      expected: expectedOutcomes,
      vsExpected,
      agentMetrics,
      notableCases,
      results: execution.results
    });
  } catch (error) {
    console.error('Error fetching execution results:', error);
    res.status(500).json({
      error: 'Failed to fetch execution results',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// 8. DELETE /api/test-lab/cleanup
// ============================================================================

router.delete('/cleanup', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = CleanupRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validation.error.errors
      });
    }

    const { preserveCrew } = validation.data;

    console.log(`\n🧹 Cleaning up test data (preserveCrew: ${preserveCrew})`);

    // Delete in reverse dependency order
    await pool.query('DELETE FROM compliance_violations');
    await pool.query('DELETE FROM disruptions');
    await pool.query('DELETE FROM pay_claims');
    await pool.query('DELETE FROM trips');

    if (!preserveCrew) {
      await pool.query('DELETE FROM crew_members');
    }

    console.log('✅ Test data cleanup complete');

    res.json({
      success: true,
      message: preserveCrew
        ? 'Test data cleaned (crew members preserved)'
        : 'All test data cleaned',
      preservedCrew: preserveCrew
    });
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    res.status(500).json({
      error: 'Failed to cleanup test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// 9. GET /api/test-lab/executions
// ============================================================================

router.get('/executions', async (req: Request, res: Response) => {
  try {
    const { scenario, limit = '10' } = req.query;

    let query = `
      SELECT
        e.id,
        e.scenario_id,
        s.name as scenario_name,
        s.client_name,
        e.workflow_id,
        w.name as workflow_name,
        e.role_used,
        e.status,
        e.started_at,
        e.completed_at,
        e.results,
        (SELECT COUNT(*) FROM agent_decisions WHERE execution_id = e.id) as decision_count
      FROM test_executions e
      JOIN test_scenarios s ON e.scenario_id = s.id
      JOIN test_workflows w ON e.workflow_id = w.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (scenario) {
      query += ` AND e.scenario_id = $${paramIndex}`;
      params.push(scenario);
      paramIndex++;
    }

    query += ` ORDER BY e.started_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit as string));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      executions: result.rows
    });
  } catch (error) {
    console.error('Error fetching executions:', error);
    res.status(500).json({
      error: 'Failed to fetch executions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// 10. GET /api/test-lab/execute/:executionId/results
// Get comprehensive results and analysis for a completed execution
// ============================================================================

router.get('/execute/:executionId/results', async (req: Request, res: Response) => {
  try {
    const executionId = parseInt(req.params.executionId);

    if (isNaN(executionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid execution ID'
      });
    }

    // 1. Get execution details
    const executionQuery = `
      SELECT
        e.id,
        e.scenario_id,
        e.workflow_id,
        e.status,
        e.started_at,
        e.completed_at,
        e.results,
        s.name as scenario_name,
        s.expected_outcomes,
        s.data_profile
      FROM test_lab_executions e
      LEFT JOIN test_lab_scenarios s ON e.scenario_id = s.id
      WHERE e.id = $1
    `;
    const executionResult = await pool.query(executionQuery, [executionId]);

    if (executionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }

    const execution = executionResult.rows[0];

    if (execution.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Execution not yet completed',
        status: execution.status
      });
    }

    // 2. Get agent decisions for this execution
    const decisionsQuery = `
      SELECT
        agent_name,
        claim_id,
        decision,
        reasoning,
        confidence,
        processing_time_ms
      FROM agent_decisions
      WHERE execution_id = $1
      ORDER BY created_at ASC
    `;
    const decisionsResult = await pool.query(decisionsQuery, [executionId]);

    // 3. Calculate summary statistics from results
    const results = execution.results || {};
    const totalClaims = results.totalClaims || 0;
    const approved = results.approved || 0;
    const escalated = results.escalated || 0;
    const rejected = results.rejected || 0;

    const summary = {
      totalClaims,
      approved,
      approvedPercentage: totalClaims > 0 ? (approved / totalClaims) * 100 : 0,
      escalated,
      escalatedPercentage: totalClaims > 0 ? (escalated / totalClaims) * 100 : 0,
      rejected,
      rejectedPercentage: totalClaims > 0 ? (rejected / totalClaims) * 100 : 0,
      avgProcessingTime: results.avgDecisionTime || 0
    };

    // 4. Extract expected outcomes from scenario
    const expectedOutcomes = execution.expected_outcomes || {};
    const dataProfile = execution.data_profile || {};

    const expected = {
      approvalRate: dataProfile.expectedApprovalRate || 90,
      escalationRate: ((expectedOutcomes.escalated || 0) / totalClaims) * 100 || 10,
      rejectionRate: ((expectedOutcomes.rejected || 0) / totalClaims) * 100 || 0,
      avgProcessingTime: expectedOutcomes.avgProcessingTime || '2min'
    };

    // 5. Calculate agent performance from decisions
    const agentPerformance: any = {};

    decisionsResult.rows.forEach((decision) => {
      const agent = decision.agent_name;
      if (!agentPerformance[agent]) {
        agentPerformance[agent] = {
          processed: 0,
          totalTime: 0,
          totalConfidence: 0,
          escalations: 0,
          errors: 0,
          decisions: []
        };
      }

      agentPerformance[agent].processed++;
      agentPerformance[agent].totalTime += decision.processing_time_ms || 0;
      agentPerformance[agent].totalConfidence += decision.confidence || 0;

      if (decision.decision === 'ESCALATED') {
        agentPerformance[agent].escalations++;
      }
      if (decision.decision === 'ERROR') {
        agentPerformance[agent].errors++;
      }

      agentPerformance[agent].decisions.push(decision);
    });

    // Calculate averages and format
    Object.keys(agentPerformance).forEach((agent) => {
      const perf = agentPerformance[agent];
      const processed = perf.processed;

      agentPerformance[agent] = {
        accuracy: processed > 0 ? Math.round(((processed - perf.errors) / processed) * 100) : 100,
        avgDecisionTime: processed > 0 ? Math.round(perf.totalTime / processed) : 0,
        processed: processed,
        escalationRate: processed > 0 ? Math.round((perf.escalations / processed) * 100) : 0,
        overrideRate: 0, // Calculate if needed
        errors: perf.errors
      };
    });

    // 6. Extract notable cases (interesting decisions)
    const notableCases: any[] = [];

    // Find high-confidence catches
    const highConfidenceCatches = decisionsResult.rows
      .filter(d => d.decision === 'REJECTED' && d.confidence >= 90)
      .slice(0, 2);

    highConfidenceCatches.forEach((decision) => {
      notableCases.push({
        claimId: decision.claim_id,
        claimType: 'Pay Claim', // Would need to fetch from claims table
        amount: 0, // Would need to fetch from claims table
        decision: decision.decision,
        reasoning: decision.reasoning || [],
        highlightTag: 'Good catch by AI',
        highlightIcon: 'catch',
        agentName: decision.agent_name
      });
    });

    // Find escalated cases
    const escalatedCases = decisionsResult.rows
      .filter(d => d.decision === 'ESCALATED')
      .slice(0, 2);

    escalatedCases.forEach((decision) => {
      notableCases.push({
        claimId: decision.claim_id,
        claimType: 'Pay Claim',
        amount: 0,
        decision: decision.decision,
        reasoning: decision.reasoning || [],
        highlightTag: 'Edge case handled',
        highlightIcon: 'insight',
        agentName: decision.agent_name
      });
    });

    // Find fast decisions
    const fastDecisions = decisionsResult.rows
      .filter(d => d.decision === 'APPROVED' && d.processing_time_ms < 1000)
      .slice(0, 1);

    fastDecisions.forEach((decision) => {
      notableCases.push({
        claimId: decision.claim_id,
        claimType: 'Pay Claim',
        amount: 0,
        decision: decision.decision,
        reasoning: decision.reasoning || [],
        highlightTag: 'Fast decision',
        highlightIcon: 'fast',
        agentName: decision.agent_name
      });
    });

    // 7. Calculate execution time
    const startedAt = new Date(execution.started_at);
    const completedAt = new Date(execution.completed_at);
    const totalExecutionTime = completedAt.getTime() - startedAt.getTime();

    // 8. Return comprehensive results
    res.json({
      success: true,
      results: {
        summary,
        expected,
        agentPerformance,
        notableCases,
        completedAt: execution.completed_at,
        totalExecutionTime
      }
    });

  } catch (error) {
    console.error('Error fetching execution results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch execution results',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// 11. GET /api/test-lab/execute/:id/export/pdf
// Export execution results to PDF
// ============================================================================

router.get('/execute/:id/export/pdf', async (req: Request, res: Response) => {
  try {
    const executionId = parseInt(req.params.id);

    if (isNaN(executionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid execution ID'
      });
    }

    console.log(`📄 Exporting execution ${executionId} to PDF...`);

    const pdfBuffer = await exportResultsToPDF(executionId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="test-lab-results-${executionId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

    console.log(`✅ PDF export completed for execution ${executionId}`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export to PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// 12. GET /api/test-lab/execute/:id/export/csv
// Export execution results to CSV
// ============================================================================

router.get('/execute/:id/export/csv', async (req: Request, res: Response) => {
  try {
    const executionId = parseInt(req.params.id);

    if (isNaN(executionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid execution ID'
      });
    }

    console.log(`📊 Exporting execution ${executionId} to CSV...`);

    const csvContent = await exportResultsToCSV(executionId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="test-lab-results-${executionId}.csv"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));

    res.send(csvContent);

    console.log(`✅ CSV export completed for execution ${executionId}`);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export to CSV',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// 13. POST /api/test-lab/compare
// Compare multiple execution results side-by-side
// ============================================================================

router.post('/compare', async (req: Request, res: Response) => {
  try {
    const validation = CompareRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: validation.error.errors
      });
    }

    const { executionIds } = validation.data;

    // Fetch execution details
    const executionsQuery = `
      SELECT
        e.id,
        e.scenario_id,
        e.workflow_id,
        e.started_at,
        e.completed_at,
        e.results,
        s.name as scenario_name,
        s.client_name
      FROM test_lab_executions e
      LEFT JOIN test_lab_scenarios s ON e.scenario_id = s.id
      WHERE e.id = ANY($1) AND e.status = 'completed'
      ORDER BY e.started_at DESC
    `;
    const executionsResult = await pool.query(executionsQuery, [executionIds]);

    if (executionsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No completed executions found'
      });
    }

    const executions = executionsResult.rows;

    // Calculate comparison metrics
    const comparison = {
      approvalRates: [] as any[],
      processingTimes: [] as any[],
      escalationRates: [] as any[],
      agentPerformance: {} as any
    };

    executions.forEach((execution) => {
      const results = execution.results || {};
      const totalClaims = results.totalClaims || 0;
      const approved = results.approved || 0;
      const escalated = results.escalated || 0;
      const rejected = results.rejected || 0;

      // Approval rates
      comparison.approvalRates.push({
        scenario: execution.scenario_name,
        rate: totalClaims > 0 ? (approved / totalClaims) * 100 : 0,
        count: approved
      });

      // Processing times
      comparison.processingTimes.push({
        scenario: execution.scenario_name,
        avgTime: results.avgDecisionTime || 0,
        formatted: formatTime(results.avgDecisionTime || 0)
      });

      // Escalation rates
      comparison.escalationRates.push({
        scenario: execution.scenario_name,
        rate: totalClaims > 0 ? (escalated / totalClaims) * 100 : 0,
        count: escalated
      });

      // Agent performance
      if (results.agentPerformance) {
        Object.entries(results.agentPerformance).forEach(([agentName, perf]: [string, any]) => {
          if (!comparison.agentPerformance[agentName]) {
            comparison.agentPerformance[agentName] = {
              agent: agentName,
              scenarios: []
            };
          }

          comparison.agentPerformance[agentName].scenarios.push({
            scenario: execution.scenario_name,
            accuracy: perf.avgConfidence || 0,
            avgTime: perf.avgDecisionTime || 0,
            processed: perf.processed || 0
          });
        });
      }
    });

    // Generate insights
    const insights = generateInsights(executions, comparison);

    // Helper function for time formatting
    function formatTime(ms: number): string {
      if (ms < 1000) return `${ms}ms`;
      if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
      return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
    }

    res.json({
      success: true,
      executions: executions.map(e => ({
        id: e.id,
        scenario_name: e.scenario_name,
        client_name: e.client_name,
        started_at: e.started_at,
        completed_at: e.completed_at,
        results: e.results
      })),
      comparison,
      insights
    });

  } catch (error) {
    console.error('Error comparing executions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare executions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS FOR COMPARISON
// ============================================================================

function generateInsights(executions: any[], comparison: any): string[] {
  const insights: string[] = [];

  // Insight 1: Approval rate comparison
  if (comparison.approvalRates.length >= 2) {
    const sorted = [...comparison.approvalRates].sort((a, b) => b.rate - a.rate);
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];
    const diff = (highest.rate - lowest.rate).toFixed(1);

    if (parseFloat(diff) > 5) {
      insights.push(
        `${highest.scenario} achieved ${diff}% higher approval rate than ${lowest.scenario} (${highest.rate.toFixed(1)}% vs ${lowest.rate.toFixed(1)}%)`
      );
    }
  }

  // Insight 2: Processing time comparison
  if (comparison.processingTimes.length >= 2) {
    const sorted = [...comparison.processingTimes].sort((a, b) => a.avgTime - b.avgTime);
    const fastest = sorted[0];
    const slowest = sorted[sorted.length - 1];
    const ratio = (slowest.avgTime / fastest.avgTime).toFixed(1);

    if (parseFloat(ratio) > 1.5) {
      insights.push(
        `Agent processing time for ${slowest.scenario} was ${ratio}x slower than ${fastest.scenario} (${slowest.formatted} vs ${fastest.formatted})`
      );
    }
  }

  // Insight 3: Escalation rate pattern
  if (comparison.escalationRates.length >= 2) {
    const avgEscalation = comparison.escalationRates.reduce((sum: number, e: any) => sum + e.rate, 0) / comparison.escalationRates.length;
    const consistent = comparison.escalationRates.every((e: any) => Math.abs(e.rate - avgEscalation) < 5);

    if (consistent) {
      insights.push(
        `Consistent escalation rates across scenarios (avg ${avgEscalation.toFixed(1)}%), indicating stable agent performance`
      );
    } else {
      const highest = comparison.escalationRates.reduce((max: any, e: any) => e.rate > max.rate ? e : max);
      insights.push(
        `${highest.scenario} showed elevated escalation rate (${highest.rate.toFixed(1)}%), suggesting more edge cases or complex claims`
      );
    }
  }

  // Insight 4: Client-specific patterns
  const clientGroups = executions.reduce((groups: any, exec: any) => {
    const client = exec.client_name || 'Unknown';
    if (!groups[client]) groups[client] = [];
    groups[client].push(exec);
    return groups;
  }, {});

  Object.entries(clientGroups).forEach(([client, execs]: [string, any]) => {
    if (execs.length >= 2) {
      const avgApproval = execs.reduce((sum: number, e: any) => {
        const results = e.results || {};
        const total = results.totalClaims || 0;
        const approved = results.approved || 0;
        return sum + (total > 0 ? (approved / total) * 100 : 0);
      }, 0) / execs.length;

      insights.push(
        `${client} scenarios maintain ${avgApproval.toFixed(1)}% average approval rate across ${execs.length} tests`
      );
    }
  });

  return insights.slice(0, 4); // Return top 4 insights
}

export default router;
