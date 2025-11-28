/**
 * Crew Scheduling Service
 * Handles roster generation, rule engine, and disruption management
 */

import pkg from 'pg';
const { Pool } = pkg;
import type { CrewMember, Trip } from '../types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export interface RegulatoryRule {
  ruleId: number;
  ruleName: string;
  ruleType: 'flight_time' | 'duty_time' | 'rest' | 'annual' | 'monthly' | 'weekly';
  jurisdiction: string;
  limitValue: number;
  limitUnit: string;
  conditions?: Record<string, any>;
}

export interface Pairing {
  pairingId: string;
  pairingName: string;
  startDate: Date;
  endDate: Date;
  startBase: string;
  endBase: string;
  totalFlightHours: number;
  totalCreditHours: number;
  status: string;
  flights: Array<{
    tripId: string;
    sequenceNumber: number;
    flightNumber: string;
    departureAirport: string;
    arrivalAirport: string;
    departureTime: Date;
    arrivalTime: Date;
  }>;
}

export interface RosterAssignment {
  assignmentId: number;
  crewId: string;
  pairingId?: string;
  tripId?: string;
  assignmentType: 'pairing' | 'reserve' | 'standby' | 'training' | 'leave';
  startDate: Date;
  endDate: Date;
  status: string;
}

export interface Disruption {
  disruptionId: number;
  disruptionType: string;
  severity: string;
  affectedFlightId?: string;
  affectedPairingId?: string;
  affectedCrewIds: string[];
  disruptionStart: Date;
  rootCause?: string;
  description: string;
  status: string;
}

export interface RuleEvaluation {
  evaluationId: number;
  crewId: string;
  ruleId: number;
  evaluationDate: Date;
  currentValue: number;
  limitValue: number;
  isCompliant: boolean;
  violationSeverity?: string;
  violationDetails?: Record<string, any>;
}

/**
 * Get regulatory rules for a jurisdiction
 */
export async function getRegulatoryRules(jurisdiction: string = 'FAA_DOMESTIC'): Promise<RegulatoryRule[]> {
  try {
    const results = await pool.query(
      `SELECT *
      FROM regulatory_rules
      WHERE jurisdiction = $1
      AND is_active = true
      ORDER BY rule_type, rule_category`,
      [jurisdiction]
    );

    return results.rows.map((r: any) => ({
      ruleId: r.rule_id,
      ruleName: r.rule_name,
      ruleType: r.rule_type,
      jurisdiction: r.jurisdiction,
      limitValue: Number(r.limit_value),
      limitUnit: r.limit_unit,
      conditions: r.conditions || {}
    }));
  } catch (error) {
    console.error('Error fetching regulatory rules:', error);
    return [];
  }
}

/**
 * Evaluate crew compliance with regulatory rules
 */
export async function evaluateCrewCompliance(
  crewId: string,
  evaluationDate: Date,
  rules?: RegulatoryRule[]
): Promise<RuleEvaluation[]> {
  try {
    if (!rules || rules.length === 0) {
      rules = await getRegulatoryRules();
    }

    const evaluations: RuleEvaluation[] = [];

    // Get crew duty history for relevant periods
    const dutyHistory = await pool.query(
      `SELECT *
      FROM crew_duty_history
      WHERE crew_id = $1
      AND duty_date <= $2
      ORDER BY duty_date DESC
      LIMIT 100`,
      [crewId, evaluationDate.toISOString().split('T')[0]]
    );

    // Evaluate each rule
    for (const rule of rules) {
      let currentValue = 0;
      let violationSeverity: string | undefined;

      if (rule.ruleType === 'annual') {
        // Calculate annual flight time (last 365 days)
        const oneYearAgo = new Date(evaluationDate);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const annualDuties = dutyHistory.rows.filter((d: any) =>
          new Date(d.duty_date) >= oneYearAgo
        );

        currentValue = annualDuties.reduce((sum: number, d: any) =>
          sum + Number(d.flight_time_hours || 0), 0
        );

        if (currentValue > rule.limitValue) {
          violationSeverity = currentValue > rule.limitValue * 1.1 ? 'critical' : 'major';
        }
      } else if (rule.ruleType === 'monthly') {
        // Calculate monthly flight time (last 30 days)
        const oneMonthAgo = new Date(evaluationDate);
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

        const monthlyDuties = dutyHistory.rows.filter((d: any) =>
          new Date(d.duty_date) >= oneMonthAgo
        );

        currentValue = monthlyDuties.reduce((sum: number, d: any) =>
          sum + Number(d.flight_time_hours || 0), 0
        );

        if (currentValue > rule.limitValue) {
          violationSeverity = currentValue > rule.limitValue * 1.1 ? 'critical' : 'major';
        }
      } else if (rule.ruleType === 'weekly') {
        // Calculate 7-day flight time
        const sevenDaysAgo = new Date(evaluationDate);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyDuties = dutyHistory.rows.filter((d: any) =>
          new Date(d.duty_date) >= sevenDaysAgo
        );

        currentValue = weeklyDuties.reduce((sum: number, d: any) =>
          sum + Number(d.flight_time_hours || 0), 0
        );

        if (currentValue > rule.limitValue) {
          violationSeverity = 'major';
        }
      } else if (rule.ruleType === 'rest') {
        // Check minimum rest periods
        // This is simplified - real implementation would check rest between duties
        const recentDuties = dutyHistory.rows.slice(0, 10);
        for (let i = 0; i < recentDuties.length - 1; i++) {
          const current = recentDuties[i];
          const next = recentDuties[i + 1];

          if (current.duty_end_time && next.duty_start_time) {
            const restHours = (new Date(next.duty_start_time).getTime() -
                              new Date(current.duty_end_time).getTime()) / (1000 * 60 * 60);

            if (restHours < rule.limitValue) {
              violationSeverity = restHours < rule.limitValue * 0.8 ? 'critical' : 'major';
              currentValue = restHours;
              break;
            }
          }
        }
      }

      const isCompliant = !violationSeverity;

      // Save evaluation
      const evalResult = await pool.query(
        `INSERT INTO rule_evaluations (
          crew_id, rule_id, evaluation_date, evaluation_type,
          current_value, limit_value, is_compliant, violation_severity
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          crewId, rule.ruleId, evaluationDate.toISOString().split('T')[0],
          'scheduling', currentValue, rule.limitValue, isCompliant,
          violationSeverity || null
        ]
      );

      evaluations.push({
        evaluationId: evalResult.rows[0].evaluation_id,
        crewId,
        ruleId: rule.ruleId,
        evaluationDate,
        currentValue,
        limitValue: rule.limitValue,
        isCompliant,
        violationSeverity
      });
    }

    return evaluations;
  } catch (error) {
    console.error('Error evaluating crew compliance:', error);
    return [];
  }
}

/**
 * Get available crew for a date range
 */
export async function getAvailableCrew(
  startDate: Date,
  endDate: Date,
  base?: string,
  qualifications?: string[]
): Promise<CrewMember[]> {
  try {
    let queryText = `
      SELECT DISTINCT cm.*
      FROM crew_members cm
      WHERE 1=1
    `;
    const params: any[] = [];

    if (base) {
      params.push(base);
      queryText += ` AND cm.base = $${params.length}`;
    }

    // Exclude crew on leave
    params.push(endDate.toISOString().split('T')[0]);
    params.push(startDate.toISOString().split('T')[0]);
    queryText += `
      AND NOT EXISTS (
        SELECT 1 FROM crew_availability ca
        WHERE ca.crew_id = cm.id
        AND ca.availability_type IN ('leave', 'medical', 'training')
        AND ca.start_date <= $${params.length - 1}
        AND ca.end_date >= $${params.length}
      )
    `;

    const crew = await pool.query(queryText, params);

    // Filter by qualifications if specified
    if (qualifications && qualifications.length > 0) {
      const qualifiedCrew = [];
      for (const member of crew.rows) {
        const quals = await pool.query(
          `SELECT qualification_code
          FROM crew_qualifications
          WHERE crew_id = $1
          AND status = 'active'
          AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)`,
          [member.id]
        );

        const qualCodes = quals.rows.map((q: any) => q.qualification_code);
        if (qualifications.every(q => qualCodes.includes(q))) {
          qualifiedCrew.push(member);
        }
      }
      return qualifiedCrew as CrewMember[];
    }

    return crew.rows as CrewMember[];
  } catch (error) {
    console.error('Error fetching available crew:', error);
    return [];
  }
}

/**
 * Generate draft roster for a period
 */
export async function generateDraftRoster(
  periodStart: Date,
  periodEnd: Date,
  optimizationObjectives: Record<string, string> = {}
): Promise<{
  versionId: number;
  assignments: RosterAssignment[];
  violations: number;
  totalCost: number;
}> {
  try {
    // Get all pairings for the period
    const pairings = await pool.query(
      `SELECT *
      FROM pairings
      WHERE start_date >= $1
      AND end_date <= $2
      AND status = 'draft'
      ORDER BY start_date`,
      [periodStart.toISOString().split('T')[0], periodEnd.toISOString().split('T')[0]]
    );

    // Get available crew
    const availableCrew = await getAvailableCrew(periodStart, periodEnd);

    const assignments: RosterAssignment[] = [];
    let violations = 0;
    let totalCost = 0;

    // Simple assignment algorithm (can be enhanced with optimization)
    for (const pairing of pairings.rows) {
      // Find qualified crew for this pairing
      const qualifiedCrew = availableCrew.filter(crew => {
        // Check qualifications (simplified)
        return crew.base === pairing.start_base;
      });

      if (qualifiedCrew.length > 0) {
        // Assign crew (simplified - just assign first available)
        const assignedCrew = qualifiedCrew[0];

        // Check compliance
        const compliance = await evaluateCrewCompliance(
          assignedCrew.id,
          new Date(pairing.start_date)
        );

        const hasViolations = compliance.some(e => !e.isCompliant);
        if (hasViolations) violations++;

        // Create assignment
        const assignmentResult = await pool.query(
          `INSERT INTO roster_assignments (
            roster_period_start, roster_period_end, crew_id, pairing_id,
            assignment_type, start_date, end_date, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [
            periodStart.toISOString().split('T')[0],
            periodEnd.toISOString().split('T')[0],
            assignedCrew.id,
            pairing.pairing_id,
            'pairing',
            pairing.start_date,
            pairing.end_date,
            'scheduled'
          ]
        );

        assignments.push({
          assignmentId: assignmentResult.rows[0].assignment_id,
          crewId: assignedCrew.id,
          pairingId: pairing.pairing_id,
          assignmentType: 'pairing',
          startDate: new Date(pairing.start_date),
          endDate: new Date(pairing.end_date),
          status: 'scheduled'
        });
      }
    }

    // Create roster version
    const versionResult = await pool.query(
      `INSERT INTO roster_versions (
        roster_period_start, roster_period_end, version_type,
        optimization_objectives, total_violations, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        periodStart.toISOString().split('T')[0],
        periodEnd.toISOString().split('T')[0],
        'draft',
        JSON.stringify(optimizationObjectives),
        violations,
        true
      ]
    );

    return {
      versionId: versionResult.rows[0].version_id,
      assignments,
      violations,
      totalCost
    };
  } catch (error) {
    console.error('Error generating roster:', error);
    throw error;
  }
}

/**
 * Get disruptions
 */
export async function getDisruptions(
  startDate?: Date,
  endDate?: Date,
  status?: string
): Promise<Disruption[]> {
  try {
    let queryText = `
      SELECT *
      FROM disruptions
      WHERE 1=1
    `;
    const params: any[] = [];

    if (startDate) {
      params.push(startDate.toISOString());
      queryText += ` AND disruption_start >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate.toISOString());
      queryText += ` AND disruption_start <= $${params.length}`;
    }
    if (status) {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }

    queryText += ` ORDER BY disruption_start DESC`;

    const disruptions = await pool.query(queryText, params);

    return disruptions.rows.map((d: any) => ({
      disruptionId: d.disruption_id,
      disruptionType: d.disruption_type,
      severity: d.severity,
      affectedFlightId: d.affected_flight_id,
      affectedPairingId: d.affected_pairing_id,
      affectedCrewIds: d.affected_crew_ids || [],
      disruptionStart: new Date(d.disruption_start),
      rootCause: d.root_cause,
      description: d.description,
      status: d.status
    }));
  } catch (error) {
    console.error('Error fetching disruptions:', error);
    return [];
  }
}

/**
 * Create disruption
 */
export async function createDisruption(
  disruption: Omit<Disruption, 'disruptionId'>
): Promise<Disruption> {
  try {
    const result = await pool.query(
      `INSERT INTO disruptions (
        disruption_type, severity, affected_flight_id, affected_pairing_id,
        affected_crew_ids, disruption_start, root_cause, description, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        disruption.disruptionType,
        disruption.severity,
        disruption.affectedFlightId || null,
        disruption.affectedPairingId || null,
        disruption.affectedCrewIds,
        disruption.disruptionStart.toISOString(),
        disruption.rootCause || null,
        disruption.description,
        disruption.status
      ]
    );

    return {
      disruptionId: result.rows[0].disruption_id,
      ...disruption
    };
  } catch (error) {
    console.error('Error creating disruption:', error);
    throw error;
  }
}

/**
 * Get roster assignments for a period
 */
export async function getRosterAssignments(
  periodStart: Date,
  periodEnd: Date,
  crewId?: string
): Promise<RosterAssignment[]> {
  try {
    let queryText = `
      SELECT *
      FROM roster_assignments
      WHERE roster_period_start >= $1
      AND roster_period_end <= $2
    `;
    const params: any[] = [
      periodStart.toISOString().split('T')[0],
      periodEnd.toISOString().split('T')[0]
    ];

    if (crewId) {
      params.push(crewId);
      queryText += ` AND crew_id = $${params.length}`;
    }

    queryText += ` ORDER BY start_date`;

    const assignments = await pool.query(queryText, params);

    return assignments.rows.map((a: any) => ({
      assignmentId: a.assignment_id,
      crewId: a.crew_id,
      pairingId: a.pairing_id,
      tripId: a.trip_id,
      assignmentType: a.assignment_type,
      startDate: new Date(a.start_date),
      endDate: new Date(a.end_date),
      status: a.status
    }));
  } catch (error) {
    console.error('Error fetching roster assignments:', error);
    return [];
  }
}
