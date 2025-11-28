/**
 * Database service for fetching claim, trip, and crew data
 */

import { config } from 'dotenv';
config();

import pkg from 'pg';
const { Pool } = pkg;
import type { ClaimInput, TripData, CrewData, HistoricalData } from '../agents/shared/types.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function getClaimById(claimId: string): Promise<ClaimInput | null> {
  try {
    const results = await pool.query(`
      SELECT
        pc.id,
        pc.id as claim_number,
        pc.crew_id as crew_member_id,
        cm.name as crew_member_name,
        pc.claim_type as type,
        pc.trip_id,
        t.flight_numbers as flight_number,
        pc.amount,
        pc.claim_date as submitted_date,
        pc.notes as description
      FROM pay_claims pc
      LEFT JOIN crew_members cm ON pc.crew_id = cm.id
      LEFT JOIN trips t ON pc.trip_id = t.id
      WHERE pc.id = $1
      LIMIT 1
    `, [claimId]);

    if (results.rows.length === 0) return null;

    const row = results.rows[0];
    return {
      id: row.id as string,
      claimNumber: row.claim_number as string,
      crewMemberId: row.crew_member_id as string,
      crewMemberName: row.crew_member_name as string,
      type: row.type as string,
      tripId: row.trip_id as string,
      flightNumber: row.flight_number as string,
      amount: Number(row.amount),
      submittedDate: new Date(row.submitted_date as string),
      description: row.description as string | undefined
    };
  } catch (error) {
    console.error('Error fetching claim:', error);
    return null;
  }
}

export async function getTripById(tripId: string): Promise<TripData | null> {
  try {
    const results = await pool.query(`
      SELECT *
      FROM trips
      WHERE id = $1
      LIMIT 1
    `, [tripId]);

    if (results.rows.length === 0) return null;

    const row = results.rows[0];
    return {
      id: row.id as string,
      date: new Date(row.trip_date as string),
      route: row.route as string,
      flightNumbers: row.flight_numbers as string,
      departureTime: row.departure_time as string | undefined,
      arrivalTime: row.arrival_time as string | undefined,
      flightTimeHours: Number(row.flight_time_hours),
      creditHours: Number(row.credit_hours),
      layoverCity: row.layover_city as string | undefined,
      isInternational: Boolean(row.is_international),
      aircraftType: row.aircraft_type as string,
      status: row.status as string
    };
  } catch (error) {
    console.error('Error fetching trip:', error);
    return null;
  }
}

export async function getCrewMemberById(crewId: string): Promise<CrewData | null> {
  try {
    const results = await pool.query(`
      SELECT *
      FROM crew_members
      WHERE id = $1
      LIMIT 1
    `, [crewId]);

    if (results.rows.length === 0) return null;

    const row = results.rows[0];
    return {
      id: row.id as string,
      name: row.name as string,
      role: row.role as string,
      base: row.base as string,
      seniority: Number(row.seniority),
      qualification: row.qualification as string,
      hireDate: new Date(row.hire_date as string),
      ytdEarnings: Number(row.ytd_earnings)
    };
  } catch (error) {
    console.error('Error fetching crew member:', error);
    return null;
  }
}

export async function getHistoricalData(
  crewId: string,
  claimType: string
): Promise<HistoricalData> {
  try {
    // Get similar claims (same type)
    const similarClaims = await pool.query(`
      SELECT COUNT(*) as count, AVG(amount) as avg_amount
      FROM pay_claims
      WHERE claim_type = $1
      AND status IN ('approved', 'ai-validated')
    `, [claimType]);

    // Get approval rate for this claim type
    const approvalStats = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('approved', 'ai-validated') THEN 1 ELSE 0 END) as approved
      FROM pay_claims
      WHERE claim_type = $1
    `, [claimType]);

    // Get recent claims by this crew member (last 7 days)
    const recentClaims = await pool.query(`
      SELECT
        id,
        id as claim_number,
        $1 as crew_member_id,
        '' as crew_member_name,
        claim_type as type,
        trip_id,
        '' as flight_number,
        amount,
        claim_date as submitted_date
      FROM pay_claims
      WHERE crew_id = $1
      AND claim_date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY claim_date DESC
      LIMIT 10
    `, [crewId]);

    const similarCount = Number(similarClaims.rows[0]?.count || 0);
    const avgAmount = Number(similarClaims.rows[0]?.avg_amount || 0);
    const total = Number(approvalStats.rows[0]?.total || 1);
    const approved = Number(approvalStats.rows[0]?.approved || 0);

    return {
      similarClaims: similarCount,
      approvalRate: total > 0 ? approved / total : 0,
      averageAmount: avgAmount,
      recentClaimsByUser: recentClaims.rows.map((row: any) => ({
        id: row.id as string,
        claimNumber: row.claim_number as string,
        crewMemberId: row.crew_member_id as string,
        crewMemberName: row.crew_member_name as string,
        type: row.type as string,
        tripId: row.trip_id as string,
        flightNumber: row.flight_number as string,
        amount: Number(row.amount),
        submittedDate: new Date(row.submitted_date as string)
      }))
    };
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return {
      similarClaims: 0,
      approvalRate: 0,
      averageAmount: 0,
      recentClaimsByUser: []
    };
  }
}

export async function updateClaimWithValidation(
  claimId: string,
  validated: boolean,
  explanation: string,
  contractReference: string
): Promise<boolean> {
  try {
    await pool.query(`
      UPDATE pay_claims
      SET
        ai_validated = $1,
        ai_explanation = $2,
        contract_reference = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [validated, explanation, contractReference, claimId]);
    return true;
  } catch (error) {
    console.error('Error updating claim:', error);
    return false;
  }
}
