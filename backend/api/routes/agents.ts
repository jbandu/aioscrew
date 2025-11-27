/**
 * Agent API routes
 */

import { Router, Request, Response } from 'express';
import { neon } from '@neondatabase/serverless';
import { orchestrateClaimValidation } from '../../agents/core/orchestrator.js';
import {
  getClaimById,
  getTripById,
  getCrewMemberById,
  getHistoricalData,
  updateClaimWithValidation
} from '../../services/database-service.js';
import type { AgentInput } from '../../agents/shared/types.js';
import { runTestDataGenerator, normalizeConfig, calculateStats } from '../../agents/core/test-data-generator.js';
import type { TestDataConfig } from '../../agents/core/test-data-generator.js';

const router = Router();
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

/**
 * POST /api/agents/validate
 * Validate a claim using AI agents
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    // Validate request body exists and is valid JSON
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Invalid request body. Expected JSON object.',
        details: 'Request body must be a valid JSON object'
      });
    }

    const { claimId } = req.body;

    if (!claimId) {
      return res.status(400).json({
        error: 'Missing claimId in request body',
        details: 'The request body must include a "claimId" field'
      });
    }

    console.log(`\n📥 Received validation request for claim: ${claimId}`);

    // Fetch claim data from database
    const claim = await getClaimById(claimId);
    if (!claim) {
      return res.status(404).json({
        error: `Claim ${claimId} not found`
      });
    }

    // Fetch related data
    const trip = await getTripById(claim.tripId);
    const crew = await getCrewMemberById(claim.crewMemberId);
    const historicalData = await getHistoricalData(claim.crewMemberId, claim.type);

    // Build agent input
    const input: AgentInput = {
      claim,
      trip: trip || undefined,
      crew: crew || undefined,
      historicalData
    };

    // Run orchestration
    const result = await orchestrateClaimValidation(input);

    // Update claim in database
    const contractRef = result.contractReferences && result.contractReferences.length > 0
      ? result.contractReferences[0].section
      : '';

    await updateClaimWithValidation(
      claimId,
      result.overallStatus === 'approved',
      result.recommendation,
      contractRef
    );

    console.log(`✅ Returning validation result: ${result.overallStatus}\n`);

    // Return result
    res.json(result);
  } catch (error: any) {
    console.error('❌ Validation error:', error);
    
    // Check if this is a provider error
    const isProviderError = error?.allProvidersFailed === true;
    const statusCode = isProviderError ? 503 : 500; // Service Unavailable for provider errors
    
    res.status(statusCode).json({
      error: isProviderError 
        ? 'LLM providers unavailable' 
        : 'Internal server error during claim validation',
      message: error instanceof Error ? error.message : 'Unknown error',
      ...(isProviderError && {
        attemptedProviders: error?.attemptedProviders,
        suggestions: [
          'Add credits to your Anthropic account at https://console.anthropic.com/',
          'Set up Ollama locally for free local inference (see OLLAMA_SETUP.md)',
          'Check your ANTHROPIC_API_KEY environment variable'
        ]
      })
    });
  }
});

/**
 * POST /api/agents/validate-claim
 * Alternative endpoint that accepts full claim data (for frontend compatibility)
 */
router.post('/validate-claim', async (req: Request, res: Response) => {
  try {
    // Validate request body exists and is valid JSON
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Invalid request body. Expected JSON object.',
        details: 'Request body must be a valid JSON object'
      });
    }

    const { claim, trip, crew } = req.body;

    if (!claim) {
      return res.status(400).json({
        error: 'Missing claim data in request body',
        details: 'The request body must include a "claim" field'
      });
    }

    console.log(`\n📥 Received validation request for claim: ${claim.id}`);

    // Get historical data
    const historicalData = claim.crewMemberId
      ? await getHistoricalData(claim.crewMemberId, claim.type)
      : undefined;

    // Build agent input
    const input: AgentInput = {
      claim,
      trip,
      crew,
      historicalData
    };

    // Run orchestration
    const result = await orchestrateClaimValidation(input);

    console.log(`✅ Returning validation result: ${result.overallStatus}\n`);

    // Return result
    res.json(result);
  } catch (error: any) {
    console.error('❌ Validation error:', error);
    
    // Check if this is a provider error
    const isProviderError = error?.allProvidersFailed === true;
    const statusCode = isProviderError ? 503 : 500; // Service Unavailable for provider errors
    
    res.status(statusCode).json({
      error: isProviderError 
        ? 'LLM providers unavailable' 
        : 'Internal server error during claim validation',
      message: error instanceof Error ? error.message : 'Unknown error',
      ...(isProviderError && {
        attemptedProviders: error?.attemptedProviders,
        suggestions: [
          'Add credits to your Anthropic account at https://console.anthropic.com/',
          'Set up Ollama locally for free local inference (see OLLAMA_SETUP.md)',
          'Check your ANTHROPIC_API_KEY environment variable'
        ]
      })
    });
  }
});

/**
 * GET /api/agents/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    agents: [
      'orchestrator',
      'flight-time-calculator',
      'premium-pay-calculator',
      'compliance-validator'
    ]
  });
});

/**
 * POST /api/agents/test-data/preview
 * Returns formatted input preview before LLM call.
 */
router.post('/test-data/preview', async (req: Request, res: Response) => {
  console.log('🔍 [TEST-DATA-PREVIEW] Endpoint called');
  console.log('🔍 [TEST-DATA-PREVIEW] Request body keys:', Object.keys(req.body || {}));
  try {
    const { config, scenarioId } = req.body || {};

    if (!config || typeof config !== 'object') {
      console.log('❌ [TEST-DATA-PREVIEW] Missing or invalid config');
      return res.status(400).json({
        error: 'Missing config in request body'
      });
    }

    console.log('✅ [TEST-DATA-PREVIEW] Config received, scenario:', scenarioId || 'custom');
    const normalizedConfig = normalizeConfig(config);
    const stats = calculateStats(normalizedConfig);
    console.log('✅ [TEST-DATA-PREVIEW] Stats calculated, dataPoints:', stats.dataPoints);
    
    const endDate = new Date(normalizedConfig.startDate);
    endDate.setFullYear(endDate.getFullYear() + normalizedConfig.yearsOfHistory);
    
    const preview = {
      scenario: {
        id: scenarioId || null,
        name: scenarioId || 'Custom Configuration'
      },
      crew: {
        total: normalizedConfig.totalCrewMembers,
        distribution: {
          captains: normalizedConfig.captains,
          firstOfficers: normalizedConfig.firstOfficers,
          seniorFA: normalizedConfig.seniorFA,
          juniorFA: normalizedConfig.juniorFA
        }
      },
      timeRange: {
        years: normalizedConfig.yearsOfHistory,
        startDate: normalizedConfig.startDate,
        endDate: endDate.toISOString().split('T')[0]
      },
      operations: {
        averageTripsPerMonth: normalizedConfig.averageTripsPerMonth,
        internationalRatio: normalizedConfig.internationalRatio,
        bases: normalizedConfig.bases,
        routes: normalizedConfig.routes,
        aircraftTypes: normalizedConfig.aircraftTypes
      },
      claims: {
        frequency: normalizedConfig.claimFrequency,
        distribution: normalizedConfig.claimTypes
      },
      operationalPatterns: {
        violationRate: normalizedConfig.violationRate,
        disruptionRate: normalizedConfig.disruptionRate
      },
      realism: {
        useRealisticDistributions: normalizedConfig.useRealisticDistributions,
        useSeasonalPatterns: normalizedConfig.useSeasonalPatterns,
        generateEdgeCases: normalizedConfig.generateEdgeCases
      },
      projectedStats: stats
    };

    console.log('✅ [TEST-DATA-PREVIEW] Sending preview response');
    res.json(preview);
  } catch (error) {
    console.error('❌ [TEST-DATA-PREVIEW] Error:', error);
    res.status(500).json({
      error: 'Failed to generate input preview',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/agents/test-data/generate
 * Returns AI-assisted blueprint for generating synthetic datasets.
 */
router.post('/test-data/generate', async (req: Request, res: Response) => {
  try {
    const { config, scenarioId, llmPreference } = req.body || {};

    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        error: 'Missing config in request body'
      });
    }

    const result = await runTestDataGenerator(config, scenarioId, llmPreference);
    res.json(result);
  } catch (error) {
    console.error('❌ Test data generation error:', error);
    res.status(500).json({
      error: 'Failed to generate test data blueprint',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/agents/test-data/cleanup
 * Removes generated test data from primary tables so teams can start fresh.
 */
router.post('/test-data/cleanup', async (req: Request, res: Response) => {
  try {
    if (!sql) {
      return res.status(500).json({
        error: 'Database not configured'
      });
    }

    const { preserveCrew = true } = req.body || {};
    await sql`
      TRUNCATE TABLE pay_claims, trips, disruptions, compliance_violations
      RESTART IDENTITY CASCADE
    `;

    if (!preserveCrew) {
      await sql`
        TRUNCATE TABLE crew_members
        RESTART IDENTITY CASCADE
      `;
    }

    res.json({
      success: true,
      message: 'Test data tables cleared. You can generate a fresh dataset.',
      clearedScenarios: true,
      crewPreserved: preserveCrew
    });
  } catch (error) {
    console.error('❌ Test data cleanup error:', error);
    res.status(500).json({
      error: 'Failed to clean up test data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
