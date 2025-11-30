/**
 * Admin API routes for Payroll Admin interface
 */

import { Router, Request, Response } from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ============================================================================
// CLAIMS REVIEW ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/claims/metrics
 * Get summary metrics for claims dashboard
 */
router.get('/claims/metrics', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    // Total pending
    let pendingQuery = `
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount
      FROM pay_claims
      WHERE COALESCE(status, 'pending') IN ('pending', 'needs-review', 'manual_review')
    `;
    const pendingParams: any[] = [];
    if (start_date && end_date) {
      pendingParams.push(start_date, end_date);
      pendingQuery += ` AND claim_date >= $1 AND claim_date <= $2`;
    }
    const pendingResult = await pool.query(pendingQuery, pendingParams);

    // Auto-approved today
    const today = new Date().toISOString().split('T')[0];
    const autoApprovedResult = await pool.query(
      `SELECT COUNT(*) as count
      FROM pay_claims
      WHERE (status = 'auto_approved' OR status = 'ai-validated')
      AND DATE(claim_date) = $1`,
      [today]
    );

    // Manual review count
    const manualReviewResult = await pool.query(
      `SELECT COUNT(*) as count
      FROM pay_claims
      WHERE status IN ('manual_review', 'needs-review')`
    );

    // Average resolution time
    let avgResolutionQuery = `
      SELECT AVG(resolution_time_hours) as avg_hours
      FROM pay_claims
      WHERE resolution_time_hours IS NOT NULL
    `;
    const avgResolutionParams: any[] = [];
    if (start_date && end_date) {
      avgResolutionParams.push(start_date, end_date);
      avgResolutionQuery += ` AND claim_date >= $1 AND claim_date <= $2`;
    }
    const avgResolutionResult = await pool.query(avgResolutionQuery, avgResolutionParams);

    // Auto-approval rate
    let approvalRateQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('auto_approved', 'ai-validated') THEN 1 END) as auto_approved
      FROM pay_claims
      WHERE status IS NOT NULL
    `;
    const approvalRateParams: any[] = [];
    if (start_date && end_date) {
      approvalRateParams.push(start_date, end_date);
      approvalRateQuery += ` AND claim_date >= $1 AND claim_date <= $2`;
    }
    const approvalRateResult = await pool.query(approvalRateQuery, approvalRateParams);

    const total = Number(approvalRateResult.rows[0]?.total || 0);
    const autoApproved = Number(approvalRateResult.rows[0]?.auto_approved || 0);
    const autoApprovalRate = total > 0 ? autoApproved / total : 0;

    res.json({
      total_pending: Number(pendingResult.rows[0]?.count || 0),
      total_amount_pending: Number(pendingResult.rows[0]?.total_amount || 0),
      auto_approved_today: Number(autoApprovedResult.rows[0]?.count || 0),
      manual_review_count: Number(manualReviewResult.rows[0]?.count || 0),
      avg_resolution_hours: Number(avgResolutionResult.rows[0]?.avg_hours || 0),
      auto_approval_rate: autoApprovalRate
    });
  } catch (error) {
    console.error('Error fetching claims metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

/**
 * GET /api/admin/claims/list
 * List claims with filters and pagination
 */
router.get('/claims/list', async (req: Request, res: Response) => {
  try {
    const {
      status,
      priority,
      claim_type,
      start_date,
      end_date,
      limit = '50',
      offset = '0'
    } = req.query;

    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    let queryText = `
      SELECT
        pc.id as claim_id,
        pc.crew_id as crew_member_id,
        cm.name as crew_name,
        pc.claim_type,
        pc.notes as description,
        pc.amount as amount_claimed,
        COALESCE(pc.amount_approved, pc.amount) as amount_approved,
        COALESCE(pc.status, 'pending') as status,
        COALESCE(pc.priority, 'normal') as priority,
        pc.claim_date as submitted_at,
        pc.resolution_time_hours,
        pc.ai_confidence,
        pc.ai_recommendation
      FROM pay_claims pc
      LEFT JOIN crew_members cm ON pc.crew_id = cm.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      params.push(status);
      queryText += ` AND COALESCE(pc.status, 'pending') = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      queryText += ` AND COALESCE(pc.priority, 'normal') = $${params.length}`;
    }
    if (claim_type) {
      params.push(claim_type);
      queryText += ` AND pc.claim_type = $${params.length}`;
    }
    if (start_date) {
      params.push(start_date);
      queryText += ` AND pc.claim_date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      queryText += ` AND pc.claim_date <= $${params.length}`;
    }

    queryText += ` ORDER BY pc.claim_date DESC`;
    params.push(limitNum, offsetNum);
    queryText += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const allClaims = await pool.query(queryText, params);

    res.json(allClaims.rows.map((row: any) => ({
      claim_id: row.claim_id,
      crew_member_id: row.crew_member_id,
      crew_name: row.crew_name || 'Unknown',
      claim_type: row.claim_type,
      description: row.description || '',
      amount_claimed: Number(row.amount_claimed || 0),
      amount_approved: Number(row.amount_approved || 0),
      status: row.status,
      priority: row.priority,
      submitted_at: row.submitted_at,
      resolution_time_hours: row.resolution_time_hours ? Number(row.resolution_time_hours) : null,
      ai_confidence: row.ai_confidence ? Number(row.ai_confidence) : null,
      ai_recommendation: row.ai_recommendation
    })));
  } catch (error) {
    console.error('Error listing claims:', error);
    res.status(500).json({ error: 'Failed to list claims' });
  }
});

/**
 * GET /api/admin/claims/:claimId
 * Get detailed information about a specific claim
 */
router.get('/claims/:claimId', async (req: Request, res: Response) => {
  try {
    const { claimId } = req.params;

    // Get claim details
    const claimResult = await pool.query(
      `SELECT
        pc.*,
        cm.name as crew_name
      FROM pay_claims pc
      LEFT JOIN crew_members cm ON pc.crew_id = cm.id
      WHERE pc.id = $1`,
      [claimId]
    );

    if (claimResult.rows.length === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const claim = claimResult.rows[0];

    // Get agent activities
    const activities = await pool.query(
      `SELECT *
      FROM agent_activity_log
      WHERE claim_id = $1
      ORDER BY created_at ASC`,
      [claimId]
    );

    // Get evidence
    const evidence = await pool.query(
      `SELECT *
      FROM claim_evidence
      WHERE claim_id = $1
      ORDER BY created_at ASC`,
      [claimId]
    );

    // Get admin actions
    const adminActions = await pool.query(
      `SELECT *
      FROM admin_actions
      WHERE claim_id = $1
      ORDER BY created_at ASC`,
      [claimId]
    );

    res.json({
      claim: {
        claim_id: claim.id,
        crew_member_id: claim.crew_id,
        crew_name: claim.crew_name || 'Unknown',
        claim_type: claim.claim_type,
        description: claim.notes || '',
        amount_claimed: Number(claim.amount || 0),
        amount_approved: Number(claim.amount_approved || claim.amount || 0),
        status: claim.status || 'pending',
        priority: claim.priority || 'normal',
        submitted_at: claim.claim_date,
        resolution_time_hours: claim.resolution_time_hours ? Number(claim.resolution_time_hours) : null,
        ai_confidence: claim.ai_confidence ? Number(claim.ai_confidence) : null,
        ai_recommendation: claim.ai_recommendation,
        ai_reasoning: claim.ai_reasoning,
        contract_references: claim.contract_references || []
      },
      agent_activities: activities.rows.map((a: any) => ({
        activity_id: a.activity_id,
        agent_name: a.agent_name,
        activity_type: a.activity_type,
        processing_time_ms: a.processing_time_ms,
        input_data: a.input_data,
        output_data: a.output_data,
        confidence_score: a.confidence_score ? Number(a.confidence_score) : null,
        error_message: a.error_message,
        created_at: a.created_at
      })),
      evidence: evidence.rows.map((e: any) => ({
        evidence_id: e.evidence_id,
        evidence_type: e.evidence_type,
        source: e.source,
        data: e.data,
        verified: e.verified,
        created_at: e.created_at
      })),
      admin_actions: adminActions.rows.map((a: any) => ({
        action_id: a.action_id,
        action_type: a.action_type,
        reason: a.reason,
        override_amount: a.override_amount ? Number(a.override_amount) : null,
        created_at: a.created_at
      })),
      contract_references: claim.contract_references || []
    });
  } catch (error) {
    console.error('Error fetching claim details:', error);
    res.status(500).json({ error: 'Failed to fetch claim details' });
  }
});

/**
 * POST /api/admin/claims/:claimId/action
 * Approve, reject, or take other action on a claim
 */
router.post('/claims/:claimId/action', async (req: Request, res: Response) => {
  try {
    const { claimId } = req.params;
    const { action_type, reason, override_amount, admin_id = 'ADMIN001' } = req.body;

    if (!action_type) {
      return res.status(400).json({ error: 'action_type is required' });
    }

    // Record admin action
    await pool.query(
      `INSERT INTO admin_actions (claim_id, admin_id, action_type, reason, override_amount)
      VALUES ($1, $2, $3, $4, $5)`,
      [claimId, admin_id, action_type, reason || null, override_amount || null]
    );

    // Update claim status
    let newStatus = 'pending';
    let amountApproved = null;

    if (action_type === 'approved') {
      newStatus = 'approved';
      amountApproved = override_amount || null;
    } else if (action_type === 'rejected') {
      newStatus = 'rejected';
    } else if (action_type === 'override') {
      newStatus = 'approved';
      amountApproved = override_amount;
    }

    if (amountApproved !== null) {
      await pool.query(
        `UPDATE pay_claims
        SET
          status = $1,
          amount_approved = $2,
          reviewed_at = NOW(),
          reviewed_by = $3
        WHERE id = $4`,
        [newStatus, amountApproved, admin_id, claimId]
      );
    } else {
      await pool.query(
        `UPDATE pay_claims
        SET
          status = $1,
          reviewed_at = NOW(),
          reviewed_by = $2
        WHERE id = $3`,
        [newStatus, admin_id, claimId]
      );
    }

    // Log to audit trail
    await pool.query(
      `INSERT INTO audit_log (entity_type, entity_id, action, performed_by, changes)
      VALUES ($1, $2, $3, $4, $5)`,
      ['claim', claimId, action_type, admin_id, JSON.stringify({ reason, override_amount })]
    );

    res.json({ success: true, message: `Claim ${action_type} successfully` });
  } catch (error) {
    console.error('Error performing claim action:', error);
    res.status(500).json({ error: 'Failed to perform action' });
  }
});

// ============================================================================
// PAYMENTS ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/payments/pending
 * Get all approved claims ready for payment
 */
router.get('/payments/pending', async (req: Request, res: Response) => {
  try {
    const pending = await pool.query(
      `SELECT
        pc.id as claim_id,
        pc.crew_id as crew_member_id,
        cm.name as crew_name,
        COALESCE(pc.amount_approved, pc.amount) as amount,
        pc.reviewed_at as approved_at,
        'ready' as status
      FROM pay_claims pc
      LEFT JOIN crew_members cm ON pc.crew_id = cm.id
      WHERE pc.status IN ('approved', 'auto_approved', 'ai-validated')
      AND NOT EXISTS (
        SELECT 1 FROM payment_items pi WHERE pi.claim_id = pc.id
      )
      ORDER BY pc.reviewed_at DESC`
    );

    res.json(pending.rows.map((p: any) => ({
      claim_id: p.claim_id,
      crew_member_id: p.crew_member_id,
      crew_name: p.crew_name || 'Unknown',
      amount: Number(p.amount || 0),
      approved_at: p.approved_at,
      status: p.status
    })));
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
});

/**
 * POST /api/admin/payments/batch
 * Create a payment batch from selected claims
 */
router.post('/payments/batch', async (req: Request, res: Response) => {
  try {
    const { claim_ids, admin_id = 'ADMIN001' } = req.body;

    if (!claim_ids || !Array.isArray(claim_ids) || claim_ids.length === 0) {
      return res.status(400).json({ error: 'claim_ids array is required' });
    }

    // Calculate total amount
    const claimsResult = await pool.query(
      `SELECT
        id,
        crew_id,
        COALESCE(amount_approved, amount) as amount
      FROM pay_claims
      WHERE id = ANY($1)
      AND status IN ('approved', 'auto_approved', 'ai-validated')`,
      [claim_ids]
    );

    if (claimsResult.rows.length === 0) {
      return res.status(400).json({ error: 'No valid claims found' });
    }

    const totalAmount = claimsResult.rows.reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

    // Generate batch ID
    const batchId = `BATCH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create batch
    await pool.query(
      `INSERT INTO payment_batches (batch_id, batch_date, total_amount, total_claims, status, processed_by)
      VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)`,
      [batchId, totalAmount, claimsResult.rows.length, 'pending', admin_id]
    );

    // Create payment items
    for (const claim of claimsResult.rows) {
      await pool.query(
        `INSERT INTO payment_items (batch_id, claim_id, crew_member_id, amount, status)
        VALUES ($1, $2, $3, $4, $5)`,
        [batchId, claim.id, claim.crew_id, claim.amount, 'pending']
      );
    }

    res.json({
      batch_id: batchId,
      total_amount: totalAmount,
      total_claims: claimsResult.rows.length,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error creating payment batch:', error);
    res.status(500).json({ error: 'Failed to create payment batch' });
  }
});

/**
 * GET /api/admin/payments/batches
 * List payment batches with filters
 */
router.get('/payments/batches', async (req: Request, res: Response) => {
  try {
    const { status, start_date, end_date } = req.query;

    let queryText = `
      SELECT *
      FROM payment_batches
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }
    if (start_date) {
      params.push(start_date);
      queryText += ` AND batch_date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      queryText += ` AND batch_date <= $${params.length}`;
    }

    queryText += ` ORDER BY batch_date DESC, created_at DESC`;

    const batches = await pool.query(queryText, params);

    res.json(batches.rows.map((b: any) => ({
      batch_id: b.batch_id,
      batch_date: b.batch_date,
      total_amount: Number(b.total_amount || 0),
      total_claims: Number(b.total_claims || 0),
      status: b.status,
      processed_by: b.processed_by,
      processed_at: b.processed_at,
      export_file_path: b.export_file_path,
      created_at: b.created_at
    })));
  } catch (error) {
    console.error('Error listing payment batches:', error);
    res.status(500).json({ error: 'Failed to list payment batches' });
  }
});

// ============================================================================
// REPORTS ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/reports/claims-analytics
 * Get claims analytics with time-series data
 */
router.get('/reports/claims-analytics', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const analytics = await pool.query(
      `SELECT *
      FROM claims_analytics
      WHERE claim_date >= $1 AND claim_date <= $2
      ORDER BY claim_date ASC`,
      [start_date, end_date]
    );

    res.json(analytics.rows.map((a: any) => ({
      claim_date: a.claim_date,
      claim_type: a.claim_type,
      status: a.status,
      claim_count: Number(a.claim_count || 0),
      avg_resolution_hours: a.avg_resolution_hours ? Number(a.avg_resolution_hours) : null,
      avg_confidence: a.avg_confidence ? Number(a.avg_confidence) : null,
      total_claimed: Number(a.total_claimed || 0),
      total_approved: Number(a.total_approved || 0),
      auto_approved_count: Number(a.auto_approved_count || 0),
      manual_review_count: Number(a.manual_review_count || 0)
    })));
  } catch (error) {
    console.error('Error fetching claims analytics:', error);
    res.status(500).json({ error: 'Failed to fetch claims analytics' });
  }
});

/**
 * GET /api/admin/reports/agent-performance
 * Get agent performance metrics
 */
router.get('/reports/agent-performance', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    let queryText = `
      SELECT *
      FROM agent_performance
      WHERE 1=1
    `;
    const params: any[] = [];

    if (start_date && end_date) {
      params.push(start_date, end_date);
      queryText += ` AND activity_date >= $1 AND activity_date <= $2`;
    }

    queryText += ` ORDER BY activity_date DESC, agent_name ASC`;

    const performance = await pool.query(queryText, params);

    res.json(performance.rows.map((p: any) => ({
      agent_name: p.agent_name,
      activity_date: p.activity_date,
      activities_count: Number(p.activities_count || 0),
      avg_processing_time_ms: p.avg_processing_time_ms ? Number(p.avg_processing_time_ms) : null,
      avg_confidence: p.avg_confidence ? Number(p.avg_confidence) : null,
      completed_count: Number(p.completed_count || 0),
      failed_count: Number(p.failed_count || 0)
    })));
  } catch (error) {
    console.error('Error fetching agent performance:', error);
    res.status(500).json({ error: 'Failed to fetch agent performance' });
  }
});

/**
 * GET /api/admin/reports/financial-impact
 * Get financial impact report
 */
router.get('/reports/financial-impact', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const impact = await pool.query(
      `SELECT *
      FROM financial_impact
      WHERE report_date >= $1 AND report_date <= $2
      ORDER BY report_date ASC`,
      [start_date, end_date]
    );

    res.json(impact.rows.map((i: any) => ({
      report_date: i.report_date,
      total_claimed: Number(i.total_claimed || 0),
      total_approved: Number(i.total_approved || 0),
      total_savings: Number(i.total_savings || 0),
      claims_processed: Number(i.claims_processed || 0),
      avg_resolution_hours: i.avg_resolution_hours ? Number(i.avg_resolution_hours) : null
    })));
  } catch (error) {
    console.error('Error fetching financial impact:', error);
    res.status(500).json({ error: 'Failed to fetch financial impact' });
  }
});

// ============================================================================
// EXCESS PAYMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/admin/excess-payments/scan
 * Scan a claim or payment batch for excess payments
 */
router.post('/excess-payments/scan', async (req: Request, res: Response) => {
  try {
    const { claim_id, payment_id, batch_id } = req.body;

    if (!claim_id && !payment_id && !batch_id) {
      return res.status(400).json({ error: 'claim_id, payment_id, or batch_id is required' });
    }

    // Import the agent dynamically
    const { runExcessPaymentDetector } = await import('../../agents/core/excess-payment-detector.js');
    const { getClaimById, getTripById, getCrewMemberById, getHistoricalData } = await import('../../services/database-service.js');

    let findings: any[] = [];

    if (claim_id) {
      // Scan single claim
      const claim = await getClaimById(claim_id);
      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      const trip = claim.tripId ? await getTripById(claim.tripId) : undefined;
      const crew = await getCrewMemberById(claim.crewMemberId);
      const historical = await getHistoricalData(claim.crewMemberId, claim.type);

      const result = await runExcessPaymentDetector({
        claim,
        trip: trip ?? undefined,
        crew: crew ?? undefined,
        historicalData: historical
      });

      // Save findings to database
      if (result.data?.findings) {
        for (const finding of result.data.findings) {
          const findingResult = await pool.query(
            `INSERT INTO excess_payment_findings (
              claim_id, finding_type, severity, title, description,
              excess_amount, expected_amount, paid_amount, evidence,
              contract_references, suggested_action, agent_confidence, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *`,
            [
              claim_id,
              finding.type,
              finding.severity,
              finding.title,
              finding.description,
              finding.excessAmount,
              finding.expectedAmount,
              finding.paidAmount,
              JSON.stringify(finding.evidence),
              finding.contractReferences || [],
              finding.suggestedAction,
              result.confidence || 0.5,
              'pending'
            ]
          );
          findings.push(findingResult.rows[0]);
        }
      }

      res.json({
        claim_id,
        agent_result: result,
        findings: findings.map(f => ({
          finding_id: f.finding_id,
          finding_type: f.finding_type,
          severity: f.severity,
          title: f.title,
          description: f.description,
          excess_amount: Number(f.excess_amount),
          expected_amount: Number(f.expected_amount),
          paid_amount: Number(f.paid_amount),
          evidence: f.evidence,
          contract_references: f.contract_references,
          suggested_action: f.suggested_action,
          agent_confidence: f.agent_confidence ? Number(f.agent_confidence) : null,
          status: f.status,
          created_at: f.created_at
        }))
      });
    } else if (batch_id) {
      // Scan entire batch
      const batchClaims = await pool.query(
        `SELECT DISTINCT pi.claim_id
        FROM payment_items pi
        WHERE pi.batch_id = $1`,
        [batch_id]
      );

      const allFindings: any[] = [];
      for (const row of batchClaims.rows) {
        const claim = await getClaimById(row.claim_id);
        if (!claim) continue;

        const trip = claim.tripId ? await getTripById(claim.tripId) : undefined;
        const crew = await getCrewMemberById(claim.crewMemberId);
        const historical = await getHistoricalData(claim.crewMemberId, claim.type);

        const result = await runExcessPaymentDetector({
          claim,
          trip: trip ?? undefined,
          crew: crew ?? undefined,
          historicalData: historical
        });

        if (result.data?.findings) {
          for (const finding of result.data.findings) {
            const paymentItem = await pool.query(
              `SELECT payment_id FROM payment_items
              WHERE claim_id = $1 AND batch_id = $2
              LIMIT 1`,
              [claim.id, batch_id]
            );

            const findingResult = await pool.query(
              `INSERT INTO excess_payment_findings (
                claim_id, payment_id, finding_type, severity, title, description,
                excess_amount, expected_amount, paid_amount, evidence,
                contract_references, suggested_action, agent_confidence, status
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
              RETURNING *`,
              [
                claim.id,
                paymentItem.rows.length > 0 ? paymentItem.rows[0].payment_id : null,
                finding.type,
                finding.severity,
                finding.title,
                finding.description,
                finding.excessAmount,
                finding.expectedAmount,
                finding.paidAmount,
                JSON.stringify(finding.evidence),
                finding.contractReferences || [],
                finding.suggestedAction,
                result.confidence || 0.5,
                'pending'
              ]
            );
            allFindings.push(findingResult.rows[0]);
          }
        }
      }

      res.json({
        batch_id,
        total_claims_scanned: batchClaims.rows.length,
        total_findings: allFindings.length,
        findings: allFindings.map(f => ({
          finding_id: f.finding_id,
          claim_id: f.claim_id,
          finding_type: f.finding_type,
          severity: f.severity,
          title: f.title,
          excess_amount: Number(f.excess_amount),
          status: f.status
        }))
      });
    }

  } catch (error) {
    console.error('Error scanning for excess payments:', error);
    res.status(500).json({ error: 'Failed to scan for excess payments', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/admin/excess-payments/findings
 * List excess payment findings with filters
 */
router.get('/excess-payments/findings', async (req: Request, res: Response) => {
  try {
    const {
      status,
      severity,
      finding_type,
      claim_id,
      start_date,
      end_date,
      limit = '50',
      offset = '0'
    } = req.query;

    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    let queryText = `
      SELECT
        epf.*,
        pc.claim_type,
        pc.amount as claim_amount,
        cm.name as crew_name,
        pi.batch_id,
        pb.batch_date
      FROM excess_payment_findings epf
      LEFT JOIN pay_claims pc ON epf.claim_id = pc.id
      LEFT JOIN crew_members cm ON pc.crew_id = cm.id
      LEFT JOIN payment_items pi ON epf.payment_id = pi.payment_id
      LEFT JOIN payment_batches pb ON pi.batch_id = pb.batch_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      params.push(status);
      queryText += ` AND epf.status = $${params.length}`;
    }
    if (severity) {
      params.push(severity);
      queryText += ` AND epf.severity = $${params.length}`;
    }
    if (finding_type) {
      params.push(finding_type);
      queryText += ` AND epf.finding_type = $${params.length}`;
    }
    if (claim_id) {
      params.push(claim_id);
      queryText += ` AND epf.claim_id = $${params.length}`;
    }
    if (start_date) {
      params.push(start_date);
      queryText += ` AND epf.created_at >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      queryText += ` AND epf.created_at <= $${params.length}`;
    }

    params.push(limitNum, offsetNum);
    queryText += ` ORDER BY epf.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const findings = await pool.query(queryText, params);

    res.json(findings.rows.map((f: any) => ({
      finding_id: f.finding_id,
      claim_id: f.claim_id,
      payment_id: f.payment_id,
      finding_type: f.finding_type,
      severity: f.severity,
      title: f.title,
      description: f.description,
      excess_amount: Number(f.excess_amount),
      expected_amount: Number(f.expected_amount),
      paid_amount: Number(f.paid_amount),
      evidence: f.evidence,
      contract_references: f.contract_references,
      suggested_action: f.suggested_action,
      agent_confidence: f.agent_confidence ? Number(f.agent_confidence) : null,
      status: f.status,
      reviewed_by: f.reviewed_by,
      reviewed_at: f.reviewed_at,
      resolution_notes: f.resolution_notes,
      created_at: f.created_at,
      claim_type: f.claim_type,
      claim_amount: f.claim_amount ? Number(f.claim_amount) : null,
      crew_name: f.crew_name,
      batch_id: f.batch_id,
      batch_date: f.batch_date
    })));
  } catch (error) {
    console.error('Error fetching excess payment findings:', error);
    res.status(500).json({ error: 'Failed to fetch findings' });
  }
});

/**
 * GET /api/admin/excess-payments/metrics
 * Get summary metrics for excess payments
 */
router.get('/excess-payments/metrics', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    // Total pending findings
    let pendingQuery = `
      SELECT
        COUNT(*) as count,
        COALESCE(SUM(excess_amount), 0) as total_excess
      FROM excess_payment_findings
      WHERE status = 'pending'
    `;
    const pendingParams: any[] = [];
    if (start_date && end_date) {
      pendingParams.push(start_date, end_date);
      pendingQuery += ` AND created_at >= $1 AND created_at <= $2`;
    }
    const pendingResult = await pool.query(pendingQuery, pendingParams);

    // Findings by severity
    let severityQuery = `
      SELECT
        severity,
        COUNT(*) as count,
        COALESCE(SUM(excess_amount), 0) as total_excess
      FROM excess_payment_findings
      WHERE status = 'pending'
    `;
    const severityParams: any[] = [];
    if (start_date && end_date) {
      severityParams.push(start_date, end_date);
      severityQuery += ` AND created_at >= $1 AND created_at <= $2`;
    }
    severityQuery += ` GROUP BY severity`;
    const severityResult = await pool.query(severityQuery, severityParams);

    // Findings by type
    let typeQuery = `
      SELECT
        finding_type,
        COUNT(*) as count,
        COALESCE(SUM(excess_amount), 0) as total_excess
      FROM excess_payment_findings
      WHERE status = 'pending'
    `;
    const typeParams: any[] = [];
    if (start_date && end_date) {
      typeParams.push(start_date, end_date);
      typeQuery += ` AND created_at >= $1 AND created_at <= $2`;
    }
    typeQuery += ` GROUP BY finding_type`;
    const typeResult = await pool.query(typeQuery, typeParams);

    // Total resolved this period
    let resolvedQuery = `
      SELECT
        COUNT(*) as count,
        COALESCE(SUM(excess_amount), 0) as total_recovered
      FROM excess_payment_findings
      WHERE status = 'resolved'
    `;
    const resolvedParams: any[] = [];
    if (start_date && end_date) {
      resolvedParams.push(start_date, end_date);
      resolvedQuery += ` AND reviewed_at >= $1 AND reviewed_at <= $2`;
    }
    const resolvedResult = await pool.query(resolvedQuery, resolvedParams);

    res.json({
      total_pending: Number(pendingResult.rows[0]?.count || 0),
      total_excess_amount: Number(pendingResult.rows[0]?.total_excess || 0),
      by_severity: severityResult.rows.map((r: any) => ({
        severity: r.severity,
        count: Number(r.count),
        total_excess: Number(r.total_excess)
      })),
      by_type: typeResult.rows.map((r: any) => ({
        finding_type: r.finding_type,
        count: Number(r.count),
        total_excess: Number(r.total_excess)
      })),
      resolved_count: Number(resolvedResult.rows[0]?.count || 0),
      total_recovered: Number(resolvedResult.rows[0]?.total_recovered || 0)
    });
  } catch (error) {
    console.error('Error fetching excess payment metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

/**
 * POST /api/admin/excess-payments/findings/:findingId/action
 * Update finding status (resolve, dismiss, etc.)
 */
router.post('/excess-payments/findings/:findingId/action', async (req: Request, res: Response) => {
  try {
    const { findingId } = req.params;
    const { action, resolution_notes, admin_id = 'ADMIN001' } = req.body;

    if (!action || !['resolved', 'dismissed', 'reviewed'].includes(action)) {
      return res.status(400).json({ error: 'Valid action is required (resolved, dismissed, reviewed)' });
    }

    await pool.query(
      `UPDATE excess_payment_findings
      SET
        status = $1,
        reviewed_by = $2,
        reviewed_at = NOW(),
        resolution_notes = $3
      WHERE finding_id = $4`,
      [action, admin_id, resolution_notes || null, findingId]
    );

    // Log to audit trail
    await pool.query(
      `INSERT INTO audit_log (entity_type, entity_id, action, performed_by, changes)
      VALUES ($1, $2, $3, $4, $5)`,
      ['excess_payment_finding', findingId, action, admin_id, JSON.stringify({ resolution_notes })]
    );

    res.json({ success: true, message: `Finding ${action} successfully` });
  } catch (error) {
    console.error('Error updating finding:', error);
    res.status(500).json({ error: 'Failed to update finding' });
  }
});

/**
 * POST /api/admin/excess-payments/batch-review
 * Create a batch review session for multiple findings
 */
router.post('/excess-payments/batch-review', async (req: Request, res: Response) => {
  try {
    const { finding_ids, review_notes, admin_id = 'ADMIN001' } = req.body;

    if (!finding_ids || !Array.isArray(finding_ids) || finding_ids.length === 0) {
      return res.status(400).json({ error: 'finding_ids array is required' });
    }

    // Get total excess amount
    const findings = await pool.query(
      `SELECT SUM(excess_amount) as total_excess
      FROM excess_payment_findings
      WHERE finding_id = ANY($1)`,
      [finding_ids]
    );

    const totalExcess = Number(findings.rows[0]?.total_excess || 0);

    // Create review session
    const reviewResult = await pool.query(
      `INSERT INTO excess_payment_reviews (
        review_date, reviewed_by, total_findings, total_excess_amount, review_notes
      )
      VALUES (CURRENT_DATE, $1, $2, $3, $4)
      RETURNING *`,
      [admin_id, finding_ids.length, totalExcess, review_notes || null]
    );

    const reviewId = reviewResult.rows[0].review_id;

    // Link findings to review
    await pool.query(
      `UPDATE excess_payment_findings
      SET review_id = $1
      WHERE finding_id = ANY($2)`,
      [reviewId, finding_ids]
    );

    res.json({
      review_id: reviewId,
      total_findings: finding_ids.length,
      total_excess_amount: totalExcess
    });
  } catch (error) {
    console.error('Error creating batch review:', error);
    res.status(500).json({ error: 'Failed to create batch review' });
  }
});

// ============================================================================
// SETTINGS ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/settings/config
 * Get system configuration
 */
router.get('/settings/config', async (req: Request, res: Response) => {
  try {
    const config = await pool.query(
      `SELECT *
      FROM system_config
      ORDER BY config_key ASC`
    );

    const configObj: Record<string, any> = {};
    config.rows.forEach((c: any) => {
      configObj[c.config_key] = {
        value: c.config_value,
        description: c.description,
        updated_by: c.updated_by,
        updated_at: c.updated_at
      };
    });

    res.json(configObj);
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({ error: 'Failed to fetch system config' });
  }
});

/**
 * GET /api/admin/settings/audit-log
 * Get audit log entries
 */
router.get('/settings/audit-log', async (req: Request, res: Response) => {
  try {
    const { entity_type, start_date, end_date, limit = '100' } = req.query;

    const limitNum = parseInt(limit as string, 10);

    let queryText = `
      SELECT *
      FROM audit_log
      WHERE 1=1
    `;
    const params: any[] = [];

    if (entity_type) {
      params.push(entity_type);
      queryText += ` AND entity_type = $${params.length}`;
    }
    if (start_date) {
      params.push(start_date);
      queryText += ` AND created_at >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      queryText += ` AND created_at <= $${params.length}`;
    }

    params.push(limitNum);
    queryText += ` ORDER BY created_at DESC LIMIT $${params.length}`;

    const logs = await pool.query(queryText, params);

    res.json(logs.rows.map((l: any) => ({
      log_id: l.log_id,
      entity_type: l.entity_type,
      entity_id: l.entity_id,
      action: l.action,
      performed_by: l.performed_by,
      ip_address: l.ip_address,
      changes: l.changes,
      created_at: l.created_at
    })));
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

/**
 * POST /api/admin/claims
 * Create a new pay claim
 */
router.post('/claims', async (req: Request, res: Response) => {
  try {
    const { crew_id, claim_type, trip_id, amount, description } = req.body;

    const claimId = `CLM-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO pay_claims (
        id, crew_id, claim_type, trip_id, amount,
        claim_date, status, notes
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'pending', $6)
      RETURNING *`,
      [claimId, crew_id, claim_type, trip_id, amount, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: 'Failed to create claim' });
  }
});

/**
 * GET /api/admin/claims/crew/:crewId
 * Get claims for a specific crew member
 */
router.get('/claims/crew/:crewId', async (req: Request, res: Response) => {
  try {
    const { crewId } = req.params;
    const result = await pool.query(
      `SELECT * FROM pay_claims
       WHERE crew_id = $1
       ORDER BY created_at DESC`,
      [crewId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching crew claims:', error);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

export default router;
