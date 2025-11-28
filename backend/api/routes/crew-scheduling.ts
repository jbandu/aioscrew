/**
 * Crew Scheduling API Routes
 * Handles roster generation, rule engine, disruption management
 */

import { Router, Request, Response } from 'express';
import {
  getRegulatoryRules,
  evaluateCrewCompliance,
  getAvailableCrew,
  generateDraftRoster,
  getDisruptions,
  createDisruption,
  getRosterAssignments
} from '../../services/crew-scheduling-service.js';
import pkg from 'pg';
const { Pool } = pkg;

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ============================================================================
// REGULATORY RULES ENDPOINTS
// ============================================================================

/**
 * GET /api/crew-scheduling/rules
 * Get regulatory rules
 */
router.get('/rules', async (req: Request, res: Response) => {
  try {
    const { jurisdiction = 'FAA_DOMESTIC' } = req.query;
    const rules = await getRegulatoryRules(jurisdiction as string);
    res.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ error: 'Failed to fetch regulatory rules' });
  }
});

/**
 * POST /api/crew-scheduling/rules
 * Create or update a regulatory rule
 */
router.post('/rules', async (req: Request, res: Response) => {
  try {
    const {
      rule_name,
      rule_type,
      jurisdiction,
      rule_category,
      limit_value,
      limit_unit,
      period_type,
      conditions,
      effective_date,
      description
    } = req.body;

    const result = await pool.query(
      `INSERT INTO regulatory_rules (
        rule_name, rule_type, jurisdiction, rule_category,
        limit_value, limit_unit, period_type, conditions,
        effective_date, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        rule_name, rule_type, jurisdiction, rule_category,
        limit_value, limit_unit, period_type, JSON.stringify(conditions || {}),
        effective_date || null, description || null
      ]
    );

    res.json({
      ruleId: result.rows[0].rule_id,
      ruleName: result.rows[0].rule_name,
      ruleType: result.rows[0].rule_type,
      jurisdiction: result.rows[0].jurisdiction,
      limitValue: Number(result.rows[0].limit_value),
      limitUnit: result.rows[0].limit_unit
    });
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ error: 'Failed to create regulatory rule' });
  }
});

/**
 * GET /api/crew-scheduling/compliance/:crewId
 * Evaluate crew compliance
 */
router.get('/compliance/:crewId', async (req: Request, res: Response) => {
  try {
    const { crewId } = req.params;
    const { evaluationDate = new Date().toISOString().split('T')[0] } = req.query;

    const evaluations = await evaluateCrewCompliance(
      crewId,
      new Date(evaluationDate as string)
    );

    res.json({
      crewId,
      evaluationDate,
      evaluations,
      overallCompliant: evaluations.every(e => e.isCompliant),
      violations: evaluations.filter(e => !e.isCompliant)
    });
  } catch (error) {
    console.error('Error evaluating compliance:', error);
    res.status(500).json({ error: 'Failed to evaluate compliance' });
  }
});

// ============================================================================
// ROSTER GENERATION ENDPOINTS
// ============================================================================

/**
 * POST /api/crew-scheduling/roster/generate
 * Generate draft roster
 */
router.post('/roster/generate', async (req: Request, res: Response) => {
  try {
    const {
      periodStart,
      periodEnd,
      optimizationObjectives = {}
    } = req.body;

    if (!periodStart || !periodEnd) {
      return res.status(400).json({ error: 'periodStart and periodEnd are required' });
    }

    const result = await generateDraftRoster(
      new Date(periodStart),
      new Date(periodEnd),
      optimizationObjectives
    );

    res.json(result);
  } catch (error) {
    console.error('Error generating roster:', error);
    res.status(500).json({ error: 'Failed to generate roster' });
  }
});

/**
 * GET /api/crew-scheduling/roster/assignments
 * Get roster assignments
 */
router.get('/roster/assignments', async (req: Request, res: Response) => {
  try {
    const {
      periodStart,
      periodEnd,
      crewId
    } = req.query;

    if (!periodStart || !periodEnd) {
      return res.status(400).json({ error: 'periodStart and periodEnd are required' });
    }

    const assignments = await getRosterAssignments(
      new Date(periodStart as string),
      new Date(periodEnd as string),
      crewId as string | undefined
    );

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch roster assignments' });
  }
});

/**
 * GET /api/crew-scheduling/roster/versions
 * Get roster versions
 */
router.get('/roster/versions', async (req: Request, res: Response) => {
  try {
    const { periodStart, periodEnd } = req.query;

    let queryText = `
      SELECT *
      FROM roster_versions
      WHERE 1=1
    `;
    const params: any[] = [];

    if (periodStart) {
      params.push(periodStart);
      queryText += ` AND roster_period_start >= $${params.length}`;
    }
    if (periodEnd) {
      params.push(periodEnd);
      queryText += ` AND roster_period_end <= $${params.length}`;
    }

    queryText += ` ORDER BY created_at DESC`;

    const versions = await pool.query(queryText, params);

    res.json(versions.rows.map((v: any) => ({
      versionId: v.version_id,
      rosterPeriodStart: v.roster_period_start,
      rosterPeriodEnd: v.roster_period_end,
      versionName: v.version_name,
      versionType: v.version_type,
      optimizationObjectives: v.optimization_objectives,
      totalCost: Number(v.total_cost || 0),
      totalViolations: Number(v.total_violations || 0),
      isActive: v.is_active,
      createdAt: v.created_at
    })));
  } catch (error) {
    console.error('Error fetching roster versions:', error);
    res.status(500).json({ error: 'Failed to fetch roster versions' });
  }
});

/**
 * POST /api/crew-scheduling/roster/publish
 * Publish a roster version
 */
router.post('/roster/publish', async (req: Request, res: Response) => {
  try {
    const { versionId } = req.body;

    if (!versionId) {
      return res.status(400).json({ error: 'versionId is required' });
    }

    // Deactivate all other versions for the same period
    const version = await pool.query(
      `SELECT roster_period_start, roster_period_end
      FROM roster_versions
      WHERE version_id = $1`,
      [versionId]
    );

    if (version.rows.length === 0) {
      return res.status(404).json({ error: 'Roster version not found' });
    }

    await pool.query(
      `UPDATE roster_versions
      SET is_active = false
      WHERE roster_period_start = $1
      AND roster_period_end = $2
      AND version_id != $3`,
      [version.rows[0].roster_period_start, version.rows[0].roster_period_end, versionId]
    );

    // Activate this version
    await pool.query(
      `UPDATE roster_versions
      SET version_type = 'published', is_active = true
      WHERE version_id = $1`,
      [versionId]
    );

    // Update assignment statuses
    await pool.query(
      `UPDATE roster_assignments
      SET status = 'confirmed'
      WHERE roster_period_start = $1
      AND roster_period_end = $2`,
      [version.rows[0].roster_period_start, version.rows[0].roster_period_end]
    );

    res.json({ success: true, message: 'Roster published successfully' });
  } catch (error) {
    console.error('Error publishing roster:', error);
    res.status(500).json({ error: 'Failed to publish roster' });
  }
});

// ============================================================================
// DISRUPTION MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/crew-scheduling/disruptions
 * Get disruptions
 */
router.get('/disruptions', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, status } = req.query;

    const disruptions = await getDisruptions(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      status as string | undefined
    );

    res.json(disruptions);
  } catch (error) {
    console.error('Error fetching disruptions:', error);
    res.status(500).json({ error: 'Failed to fetch disruptions' });
  }
});

/**
 * POST /api/crew-scheduling/disruptions
 * Create disruption
 */
router.post('/disruptions', async (req: Request, res: Response) => {
  try {
    const {
      disruptionType,
      severity,
      affectedFlightId,
      affectedPairingId,
      affectedCrewIds,
      disruptionStart,
      rootCause,
      description
    } = req.body;

    if (!disruptionType || !severity || !disruptionStart || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const disruption = await createDisruption({
      disruptionType,
      severity,
      affectedFlightId,
      affectedPairingId,
      affectedCrewIds: affectedCrewIds || [],
      disruptionStart: new Date(disruptionStart),
      rootCause,
      description,
      status: 'open'
    });

    res.json(disruption);
  } catch (error) {
    console.error('Error creating disruption:', error);
    res.status(500).json({ error: 'Failed to create disruption' });
  }
});

/**
 * POST /api/crew-scheduling/disruptions/:disruptionId/resolve
 * Resolve disruption with reassignment
 */
router.post('/disruptions/:disruptionId/resolve', async (req: Request, res: Response) => {
  try {
    const { disruptionId } = req.params;
    const {
      originalAssignmentId,
      replacementCrewId,
      reassignmentReason,
      approvedBy
    } = req.body;

    // Get disruption
    const disruption = await pool.query(
      `SELECT *
      FROM disruptions
      WHERE disruption_id = $1`,
      [disruptionId]
    );

    if (disruption.rows.length === 0) {
      return res.status(404).json({ error: 'Disruption not found' });
    }

    // Create reassignment
    if (originalAssignmentId && replacementCrewId) {
      // Get original assignment
      const originalAssignment = await pool.query(
        `SELECT *
        FROM roster_assignments
        WHERE assignment_id = $1`,
        [originalAssignmentId]
      );

      if (originalAssignment.rows.length > 0) {
        // Create new assignment for replacement crew
        const newAssignment = await pool.query(
          `INSERT INTO roster_assignments (
            roster_period_start, roster_period_end, crew_id, pairing_id, trip_id,
            assignment_type, start_date, end_date, status
          )
          SELECT
            roster_period_start, roster_period_end, $1, pairing_id, trip_id,
            assignment_type, start_date, end_date, 'confirmed'
          FROM roster_assignments
          WHERE assignment_id = $2
          RETURNING *`,
          [replacementCrewId, originalAssignmentId]
        );

        // Cancel original assignment
        await pool.query(
          `UPDATE roster_assignments
          SET status = 'cancelled'
          WHERE assignment_id = $1`,
          [originalAssignmentId]
        );

        // Create reassignment record
        await pool.query(
          `INSERT INTO disruption_reassignments (
            disruption_id, original_assignment_id, new_assignment_id,
            original_crew_id, replacement_crew_id, reassignment_reason,
            compliance_status, approved_by, approved_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [
            disruptionId, originalAssignmentId, newAssignment.rows[0].assignment_id,
            originalAssignment.rows[0].crew_id, replacementCrewId, reassignmentReason,
            'compliant', approvedBy || 'SYSTEM'
          ]
        );
      }
    }

    // Update disruption status
    await pool.query(
      `UPDATE disruptions
      SET status = 'resolved', resolved_at = NOW(), resolved_by = $1
      WHERE disruption_id = $2`,
      [approvedBy || 'SYSTEM', disruptionId]
    );

    res.json({ success: true, message: 'Disruption resolved successfully' });
  } catch (error) {
    console.error('Error resolving disruption:', error);
    res.status(500).json({ error: 'Failed to resolve disruption' });
  }
});

// ============================================================================
// CREW AVAILABILITY ENDPOINTS
// ============================================================================

/**
 * GET /api/crew-scheduling/crew/available
 * Get available crew
 */
router.get('/crew/available', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, base, qualifications } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const crew = await getAvailableCrew(
      new Date(startDate as string),
      new Date(endDate as string),
      base as string | undefined,
      qualifications ? (qualifications as string).split(',') : undefined
    );

    res.json(crew);
  } catch (error) {
    console.error('Error fetching available crew:', error);
    res.status(500).json({ error: 'Failed to fetch available crew' });
  }
});

/**
 * GET /api/crew-scheduling/crew/:crewId/qualifications
 * Get crew qualifications
 */
router.get('/crew/:crewId/qualifications', async (req: Request, res: Response) => {
  try {
    const { crewId } = req.params;

    const qualifications = await pool.query(
      `SELECT *
      FROM crew_qualifications
      WHERE crew_id = $1
      ORDER BY qualification_type, qualification_code`,
      [crewId]
    );

    res.json(qualifications.rows.map((q: any) => ({
      qualificationId: q.qualification_id,
      crewId: q.crew_id,
      qualificationType: q.qualification_type,
      qualificationCode: q.qualification_code,
      issuedDate: q.issued_date,
      expiryDate: q.expiry_date,
      status: q.status
    })));
  } catch (error) {
    console.error('Error fetching qualifications:', error);
    res.status(500).json({ error: 'Failed to fetch qualifications' });
  }
});

// ============================================================================
// REPORTING ENDPOINTS
// ============================================================================

/**
 * GET /api/crew-scheduling/reports/compliance
 * Get compliance report
 */
router.get('/reports/compliance', async (req: Request, res: Response) => {
  try {
    const { periodStart, periodEnd, crewId, base } = req.query;

    if (!periodStart || !periodEnd) {
      return res.status(400).json({ error: 'periodStart and periodEnd are required' });
    }

    let queryText = `
      SELECT
        re.*,
        cm.name as crew_name,
        cm.base,
        rr.rule_name,
        rr.rule_type
      FROM rule_evaluations re
      JOIN crew_members cm ON re.crew_id = cm.id
      JOIN regulatory_rules rr ON re.rule_id = rr.rule_id
      WHERE re.evaluation_date >= $1
      AND re.evaluation_date <= $2
    `;
    const params: any[] = [periodStart, periodEnd];

    if (crewId) {
      params.push(crewId);
      queryText += ` AND re.crew_id = $${params.length}`;
    }
    if (base) {
      params.push(base);
      queryText += ` AND cm.base = $${params.length}`;
    }

    queryText += ` ORDER BY re.evaluation_date DESC, re.is_compliant ASC`;

    const evaluations = await pool.query(queryText, params);

    const violations = evaluations.rows.filter((e: any) => !e.is_compliant);
    const totalEvaluations = evaluations.rows.length;

    res.json({
      periodStart,
      periodEnd,
      totalEvaluations,
      totalViolations: violations.length,
      violationRate: totalEvaluations > 0 ? violations.length / totalEvaluations : 0,
      violations: violations.map((v: any) => ({
        evaluationId: v.evaluation_id,
        crewId: v.crew_id,
        crewName: v.crew_name,
        base: v.base,
        ruleName: v.rule_name,
        ruleType: v.rule_type,
        currentValue: Number(v.current_value),
        limitValue: Number(v.limit_value),
        violationSeverity: v.violation_severity,
        evaluationDate: v.evaluation_date
      }))
    });
  } catch (error) {
    console.error('Error generating compliance report:', error);
    res.status(500).json({ error: 'Failed to generate compliance report' });
  }
});

export default router;
