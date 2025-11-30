/**
 * Proactive Claims API Routes
 *
 * Endpoints for managing the automatic claim detection and processing system.
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import {
  processCompletedTrips,
  triggerManualProcessing
} from '../../services/trip-completion-monitor.js';
import logger from '../../utils/logger.js';

const router = Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * POST /api/proactive-claims/process
 *
 * Manually trigger proactive claim processing for all unprocessed completed trips.
 * This scans recent trips, detects eligible claims, validates with AI, and auto-creates them.
 *
 * Response:
 * {
 *   "success": true,
 *   "result": {
 *     "trips_processed": 4,
 *     "claims_detected": 7,
 *     "claims_auto_approved": 5,
 *     "claims_manual_review": 2,
 *     "claims_rejected": 0,
 *     "total_amount_approved": 1245.50,
 *     "errors": []
 *   }
 * }
 */
router.post('/process', async (req: Request, res: Response) => {
  try {
    logger.info('Manual proactive claim processing triggered via API');

    const result = await triggerManualProcessing(pool);

    res.status(200).json({
      success: true,
      result,
      message: `Processed ${result.trips_processed} trips, created ${result.claims_detected} claims`
    });

  } catch (error: any) {
    logger.error('Error in proactive claims processing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process proactive claims',
      message: error.message
    });
  }
});

/**
 * GET /api/proactive-claims/stats
 *
 * Get statistics about proactive claim processing.
 *
 * Response:
 * {
 *   "total_auto_generated": 234,
 *   "auto_approved": 189,
 *   "manual_review": 42,
 *   "rejected": 3,
 *   "auto_approval_rate": 80.8,
 *   "avg_confidence": 94.2,
 *   "total_amount": 45678.90
 * }
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_auto_generated,
        SUM(CASE WHEN status = 'approved' AND auto_generated = true THEN 1 ELSE 0 END) as auto_approved,
        SUM(CASE WHEN status = 'pending' AND auto_generated = true THEN 1 ELSE 0 END) as manual_review,
        SUM(CASE WHEN status = 'rejected' AND auto_generated = true THEN 1 ELSE 0 END) as rejected,
        AVG(CASE WHEN ai_confidence IS NOT NULL THEN ai_confidence * 100 ELSE NULL END) as avg_confidence,
        SUM(CASE WHEN status = 'approved' AND auto_generated = true THEN amount ELSE 0 END) as total_amount
      FROM pay_claims
      WHERE auto_generated = true
    `;

    const result = await pool.query(query);
    const stats = result.rows[0];

    const autoApprovalRate = stats.total_auto_generated > 0
      ? (stats.auto_approved / stats.total_auto_generated) * 100
      : 0;

    res.status(200).json({
      total_auto_generated: parseInt(stats.total_auto_generated),
      auto_approved: parseInt(stats.auto_approved),
      manual_review: parseInt(stats.manual_review),
      rejected: parseInt(stats.rejected),
      auto_approval_rate: parseFloat(autoApprovalRate.toFixed(1)),
      avg_confidence: parseFloat(parseFloat(stats.avg_confidence || 0).toFixed(1)),
      total_amount: parseFloat(stats.total_amount || 0)
    });

  } catch (error: any) {
    logger.error('Error fetching proactive claim stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/proactive-claims/recent
 *
 * Get recently auto-generated claims.
 *
 * Query params:
 * - limit: number of claims to return (default 20)
 * - crew_id: filter by specific crew member
 */
router.get('/recent', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const crewId = req.query.crew_id as string;

    let query = `
      SELECT
        id,
        crew_id,
        claim_type,
        trip_id,
        amount,
        status,
        ai_confidence,
        ai_recommendation,
        ai_reasoning,
        detection_method,
        created_at
      FROM pay_claims
      WHERE auto_generated = true
    `;

    const values: any[] = [];

    if (crewId) {
      query += ` AND crew_id = $1`;
      values.push(crewId);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1}`;
    values.push(limit);

    const result = await pool.query(query, values);

    res.status(200).json({
      claims: result.rows,
      count: result.rows.length
    });

  } catch (error: any) {
    logger.error('Error fetching recent proactive claims:', error);
    res.status(500).json({
      error: 'Failed to fetch recent claims',
      message: error.message
    });
  }
});

/**
 * GET /api/proactive-claims/health
 *
 * Check if the proactive claims system is operational.
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    await pool.query('SELECT 1');

    // Check if there are unprocessed trips
    const unprocessedQuery = `
      SELECT COUNT(*) as count
      FROM trips t
      WHERE t.status = 'completed'
      AND t.trip_date >= CURRENT_DATE - INTERVAL '7 days'
      AND NOT EXISTS (
        SELECT 1 FROM pay_claims pc
        WHERE pc.trip_id = t.id
        AND pc.auto_generated = true
      )
    `;

    const unprocessedResult = await pool.query(unprocessedQuery);
    const unprocessedCount = parseInt(unprocessedResult.rows[0].count);

    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      unprocessed_trips: unprocessedCount,
      ai_enabled: !!process.env.ANTHROPIC_API_KEY,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Proactive claims health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
