/**
 * Trip Completion Monitor Service
 *
 * This service monitors for completed trips and automatically generates claims.
 * It orchestrates the entire proactive claim detection workflow:
 * 1. Detect completed trips
 * 2. Calculate potential claims
 * 3. Validate with AI
 * 4. Auto-create approved claims
 * 5. Notify crew members
 */

import { Pool } from 'pg';
import { detectAllClaims, getUnprocessedTrips, Trip } from './claim-calculators.js';
import { validateMultipleClaims, ValidationResult, DetectedClaim } from './claim-validator.js';
import logger from '../utils/logger.js';

export interface ProcessingResult {
  trips_processed: number;
  claims_detected: number;
  claims_auto_approved: number;
  claims_manual_review: number;
  claims_rejected: number;
  total_amount_approved: number;
  errors: string[];
}

/**
 * Process all unprocessed completed trips
 *
 * This is the main entry point for the proactive claim system.
 * Can be called on-demand or scheduled via cron.
 */
export async function processCompletedTrips(pool: Pool): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    trips_processed: 0,
    claims_detected: 0,
    claims_auto_approved: 0,
    claims_manual_review: 0,
    claims_rejected: 0,
    total_amount_approved: 0,
    errors: []
  };

  try {
    logger.info('Starting trip completion monitor...');

    // Step 1: Get unprocessed trips
    const trips = await getUnprocessedTrips(pool);
    logger.info(`Found ${trips.length} unprocessed completed trips`);

    if (trips.length === 0) {
      return result;
    }

    // Step 2: Process each trip
    for (const trip of trips) {
      try {
        await processSingleTrip(pool, trip, result);
        result.trips_processed++;
      } catch (error: any) {
        logger.error(`Error processing trip ${trip.id}:`, error);
        result.errors.push(`Trip ${trip.id}: ${error.message}`);
      }
    }

    logger.info('Trip completion monitor finished', result);
    return result;

  } catch (error: any) {
    logger.error('Fatal error in trip completion monitor:', error);
    result.errors.push(`Fatal error: ${error.message}`);
    return result;
  }
}

/**
 * Process a single trip through the complete workflow
 */
async function processSingleTrip(
  pool: Pool,
  trip: Trip,
  result: ProcessingResult
): Promise<void> {
  logger.info(`Processing trip ${trip.id}: ${trip.route}`);

  // Step 1: Detect all potential claims
  const detectedClaims = await detectAllClaims(trip);
  logger.info(`Detected ${detectedClaims.length} potential claims for trip ${trip.id}`);

  if (detectedClaims.length === 0) {
    return;
  }

  result.claims_detected += detectedClaims.length;

  // Step 2: Validate claims with AI
  const validations = await validateMultipleClaims(detectedClaims, trip);

  // Step 3: Process each claim based on validation result
  for (const [claim, validation] of validations) {
    try {
      await processValidatedClaim(pool, claim, validation, result);
    } catch (error: any) {
      logger.error(`Error creating claim ${claim.claim_type} for trip ${trip.id}:`, error);
      result.errors.push(`Claim ${claim.claim_type}: ${error.message}`);
    }
  }
}

/**
 * Create a claim in the database based on validation result
 */
async function processValidatedClaim(
  pool: Pool,
  claim: DetectedClaim,
  validation: ValidationResult,
  result: ProcessingResult
): Promise<void> {
  if (!validation.valid) {
    logger.info(`Rejecting invalid claim: ${claim.claim_type} for ${claim.trip_id}`);
    result.claims_rejected++;
    return;
  }

  // Determine status based on recommendation
  let status: string;
  let aiRecommendation: string;

  switch (validation.recommendation) {
    case 'auto-approve':
      status = 'approved';
      aiRecommendation = 'auto-approve';
      result.claims_auto_approved++;
      result.total_amount_approved += claim.amount;
      logger.info(`Auto-approving claim: ${claim.claim_type} - $${claim.amount}`);
      break;

    case 'manual-review':
      status = 'pending';
      aiRecommendation = 'manual-review';
      result.claims_manual_review++;
      logger.info(`Flagging for manual review: ${claim.claim_type} - $${claim.amount}`);
      break;

    case 'reject':
      status = 'rejected';
      aiRecommendation = 'reject';
      result.claims_rejected++;
      logger.info(`AI recommends rejection: ${claim.claim_type} - $${claim.amount}`);
      break;

    default:
      status = 'pending';
      aiRecommendation = 'manual-review';
      result.claims_manual_review++;
  }

  // Generate unique claim ID (max 20 chars)
  const timestamp = Date.now().toString().slice(-10); // Last 10 digits
  const random = Math.random().toString(36).substr(2, 6); // 6 char random
  const claimId = `C-${timestamp}${random}`; // C-{10 digits}{6 chars} = 18 chars total

  // Insert claim into database
  const query = `
    INSERT INTO pay_claims (
      id,
      crew_id,
      claim_type,
      trip_id,
      claim_date,
      amount,
      status,
      ai_validated,
      ai_confidence,
      ai_recommendation,
      ai_reasoning,
      contract_references,
      notes,
      auto_generated,
      detection_method,
      priority
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *
  `;

  const values = [
    claimId,
    claim.crew_id,
    claim.claim_type,
    claim.trip_id,
    new Date(),
    claim.amount,
    status,
    true, // ai_validated
    validation.confidence / 100, // Store as decimal (0-1)
    aiRecommendation,
    validation.reasoning,
    validation.contract_references,
    claim.description,
    true, // auto_generated
    claim.detection_method,
    validation.confidence > 95 ? 'normal' : 'high' // Higher priority for manual review
  ];

  const dbResult = await pool.query(query, values);
  const createdClaim = dbResult.rows[0];

  logger.info(`Created claim ${claimId}: ${claim.claim_type} - $${claim.amount} (${status})`);

  // Emit event for WebSocket notification
  if (global.io) {
    const notification = {
      type: 'claim_auto_generated',
      claim: createdClaim,
      crew_id: claim.crew_id,
      status,
      timestamp: new Date().toISOString()
    };

    // Send to specific crew member
    global.io.to(`crew:${claim.crew_id}`).emit('claim:created', notification);

    // Send to admin dashboard
    global.io.to('admin').emit('claim:created', notification);
  }
}

/**
 * Manual trigger endpoint for testing
 */
export async function triggerManualProcessing(pool: Pool): Promise<ProcessingResult> {
  logger.info('Manual processing triggered');
  return await processCompletedTrips(pool);
}

/**
 * Schedule automatic processing (can be called from cron or interval)
 */
export function startScheduledProcessing(pool: Pool, intervalMinutes: number = 60): NodeJS.Timeout {
  logger.info(`Starting scheduled processing every ${intervalMinutes} minutes`);

  const intervalMs = intervalMinutes * 60 * 1000;

  // Run immediately on start
  processCompletedTrips(pool).catch(error => {
    logger.error('Scheduled processing error:', error);
  });

  // Then run on interval
  return setInterval(async () => {
    try {
      await processCompletedTrips(pool);
    } catch (error) {
      logger.error('Scheduled processing error:', error);
    }
  }, intervalMs);
}

// Global reference for WebSocket integration
declare global {
  var io: any;
}
