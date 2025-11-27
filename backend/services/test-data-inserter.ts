/**
 * Test Data Inserter Service
 * Generates and inserts realistic test data into the database
 */

import { config } from 'dotenv';
config();

import pkg from 'pg';
const { Pool } = pkg;
import type { TestDataConfig } from '../agents/core/test-data-generator.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

interface InsertionResult {
  crewMembers: number;
  trips: number;
  claims: number;
  violations: number;
  disruptions: number;
  totalRecords: number;
}

// Helper: Generate random date between two dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper: Pick random item from array
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Generate realistic crew member names
const firstNames = ['James', 'Maria', 'Carlos', 'Sofia', 'Miguel', 'Ana', 'Diego', 'Isabel', 'Luis', 'Carmen', 'Roberto', 'Elena', 'Jose', 'Lucia', 'Pedro', 'Laura'];
const lastNames = ['Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Cruz', 'Morales'];

function generateCrewName(): string {
  return `${randomPick(firstNames)} ${randomPick(lastNames)}`;
}

/**
 * Insert crew members into database
 */
async function insertCrewMembers(config: TestDataConfig): Promise<string[]> {
  const { totalCrewMembers, captains, firstOfficers, seniorFA, juniorFA, bases } = config;
  const crewIds: string[] = [];

  const roles = [
    { role: 'Captain', count: Math.round((captains / 100) * totalCrewMembers) },
    { role: 'First Officer', count: Math.round((firstOfficers / 100) * totalCrewMembers) },
    { role: 'Senior FA', count: Math.round((seniorFA / 100) * totalCrewMembers) },
    { role: 'Junior FA', count: Math.round((juniorFA / 100) * totalCrewMembers) }
  ];

  const startDate = new Date(config.startDate);
  const yearsAgo = new Date(startDate);
  yearsAgo.setFullYear(yearsAgo.getFullYear() - config.yearsOfHistory - 5);

  let crewIndex = 1;

  for (const { role, count } of roles) {
    for (let i = 0; i < count; i++) {
      const id = `CM${String(crewIndex).padStart(5, '0')}`;
      const name = generateCrewName();
      const base = randomPick(bases);
      const hireDate = randomDate(yearsAgo, startDate);
      const seniority = Math.floor((Date.now() - hireDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      // Make email unique by including crew ID
      const email = `${name.toLowerCase().replace(' ', '.')}.${id.toLowerCase()}@copa.com`;

      await pool.query(
        `INSERT INTO crew_members (id, name, role, base, seniority, email, hire_date, ytd_earnings, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
         ON CONFLICT (id) DO NOTHING`,
        [id, name, role, base, seniority, email, hireDate.toISOString().split('T')[0], Math.floor(Math.random() * 50000) + 30000]
      );

      crewIds.push(id);
      crewIndex++;
    }
  }

  console.log(`✅ Inserted ${crewIds.length} crew members`);
  return crewIds;
}

/**
 * Insert trips into database
 */
async function insertTrips(config: TestDataConfig, crewIds: string[]): Promise<string[]> {
  const { routes, aircraftTypes, internationalRatio, averageTripsPerMonth, yearsOfHistory, startDate } = config;
  const tripIds: string[] = [];

  const start = new Date(startDate);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() - yearsOfHistory);

  const totalMonths = yearsOfHistory * 12;
  const totalTrips = averageTripsPerMonth * totalMonths;

  for (let i = 0; i < totalTrips; i++) {
    const id = `T${String(i + 1).padStart(6, '0')}`;
    const route = randomPick(routes);
    const tripDate = randomDate(end, start);
    const isInternational = Math.random() < (internationalRatio / 100);
    const aircraftType = randomPick(aircraftTypes);

    const flightTimeHours = isInternational ? (Math.random() * 4 + 2) : (Math.random() * 2 + 0.5);
    const creditHours = flightTimeHours * 1.1; // Credit hours usually slightly higher

    const [origin, dest] = route.split('-');
    const departureTime = `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${randomPick(['00', '15', '30', '45'])}`;

    // Assign crew (one of each role)
    const captains = crewIds.filter(id => id.startsWith('CM') && Math.random() > 0.7);
    const firstOfficers = crewIds.filter(id => id.startsWith('CM') && Math.random() > 0.7);
    const seniorFAs = crewIds.filter(id => id.startsWith('CM') && Math.random() > 0.7);
    const juniorFAs = crewIds.filter(id => id.startsWith('CM') && Math.random() > 0.7);

    await pool.query(
      `INSERT INTO trips (
        id, trip_date, route, flight_numbers, departure_time,
        flight_time_hours, credit_hours, layover_city, is_international,
        aircraft_type, status,
        captain_id, first_officer_id, senior_fa_id, junior_fa_id
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'completed', $11, $12, $13, $14
      )
      ON CONFLICT (id) DO NOTHING`,
      [id, tripDate.toISOString().split('T')[0], route, `CM${Math.floor(Math.random() * 900 + 100)}`,
       departureTime, flightTimeHours.toFixed(2), creditHours.toFixed(2),
       dest, isInternational, aircraftType,
       captains[0] || null, firstOfficers[0] || null,
       seniorFAs[0] || null, juniorFAs[0] || null]
    );

    tripIds.push(id);

    // Log progress every 1000 trips
    if ((i + 1) % 1000 === 0) {
      console.log(`   ... inserted ${i + 1}/${totalTrips} trips`);
    }
  }

  console.log(`✅ Inserted ${tripIds.length} trips`);
  return tripIds;
}

/**
 * Insert pay claims into database
 */
async function insertClaims(config: TestDataConfig, crewIds: string[], tripIds: string[]): Promise<number> {
  const { claimTypes, claimFrequency, startDate, yearsOfHistory } = config;

  const start = new Date(startDate);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() - yearsOfHistory);

  // Calculate total claims based on frequency
  const tripsPerCrew = tripIds.length / crewIds.length;
  const totalClaims = Math.floor(crewIds.length * claimFrequency);

  const claimTypesList = Object.keys(claimTypes);

  for (let i = 0; i < totalClaims; i++) {
    const id = `CL${String(i + 1).padStart(6, '0')}`;
    const crewId = randomPick(crewIds);
    const tripId = randomPick(tripIds);
    const claimType = randomPick(claimTypesList);
    const claimDate = randomDate(end, start);

    // Amount based on claim type
    const amountRanges: Record<string, [number, number]> = {
      'International Premium': [100, 300],
      'Per Diem': [50, 150],
      'Holiday Pay': [200, 500],
      'Overtime': [150, 400],
      'Layover Premium': [80, 200],
      'Training': [300, 600],
      'Lead Premium': [100, 250],
      'Deadhead': [75, 175],
      'Other': [50, 200]
    };

    const [min, max] = amountRanges[claimType] || [50, 200];
    const amount = Math.floor(Math.random() * (max - min) + min);

    const statuses = ['approved', 'pending', 'reviewed'];
    const status = randomPick(statuses);

    await pool.query(
      `INSERT INTO pay_claims (
        id, crew_id, claim_type, trip_id, claim_date, amount,
        status, ai_validated, submitted_by
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
      ON CONFLICT (id) DO NOTHING`,
      [id, crewId, claimType, tripId, claimDate.toISOString().split('T')[0],
       amount, status, Math.random() > 0.3, crewId]
    );

    // Log progress every 500 claims
    if ((i + 1) % 500 === 0) {
      console.log(`   ... inserted ${i + 1}/${totalClaims} claims`);
    }
  }

  console.log(`✅ Inserted ${totalClaims} pay claims`);
  return totalClaims;
}

/**
 * Insert compliance violations into database
 */
async function insertViolations(config: TestDataConfig, crewIds: string[], tripIds: string[]): Promise<number> {
  const { violationRate, startDate, yearsOfHistory } = config;

  const totalViolations = Math.floor(tripIds.length * (violationRate / 100));

  const violationTypes = [
    'Rest Period Violation',
    'Duty Time Exceeded',
    'Flight Time Limit',
    'Days Off Violation',
    'Maximum Duty Period'
  ];

  const severities = ['low', 'medium', 'high'];

  for (let i = 0; i < totalViolations; i++) {
    const violationType = randomPick(violationTypes);
    const crewId = randomPick(crewIds);
    const tripId = randomPick(tripIds);
    const severity = randomPick(severities);

    await pool.query(
      `INSERT INTO compliance_violations (
        violation_type, crew_id, trip_id, severity,
        description, status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6
      )`,
      [violationType, crewId, tripId, severity,
       `${violationType} detected on trip ${tripId}`,
       Math.random() > 0.5 ? 'open' : 'resolved']
    );
  }

  console.log(`✅ Inserted ${totalViolations} compliance violations`);
  return totalViolations;
}

/**
 * Insert disruptions into database
 */
async function insertDisruptions(config: TestDataConfig, tripIds: string[]): Promise<number> {
  const { disruptionRate } = config;

  const totalDisruptions = Math.floor(tripIds.length * (disruptionRate / 100));

  const disruptionTypes = [
    'Weather Delay',
    'Mechanical Issue',
    'Crew Shortage',
    'ATC Delay',
    'Airport Closure'
  ];

  const severities = ['low', 'medium', 'high'];

  for (let i = 0; i < totalDisruptions; i++) {
    const disruptionType = randomPick(disruptionTypes);
    const tripId = randomPick(tripIds);
    const severity = randomPick(severities);
    const crewAffected = Math.floor(Math.random() * 10 + 1);
    const costImpact = Math.floor(Math.random() * 10000 + 1000);

    await pool.query(
      `INSERT INTO disruptions (
        trip_id, disruption_type, description, severity,
        crew_affected, cost_impact, resolution_status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )`,
      [tripId, disruptionType,
       `${disruptionType} on trip ${tripId}`,
       severity, crewAffected, costImpact,
       Math.random() > 0.3 ? 'resolved' : 'open']
    );
  }

  console.log(`✅ Inserted ${totalDisruptions} disruptions`);
  return totalDisruptions;
}

/**
 * Main function to insert all test data
 */
export async function insertTestData(config: TestDataConfig): Promise<InsertionResult> {
  console.log('\n🚀 Starting test data insertion...\n');

  try {
    // Step 1: Insert crew members
    console.log('📋 Step 1: Inserting crew members...');
    const crewIds = await insertCrewMembers(config);

    // Step 2: Insert trips
    console.log('\n✈️  Step 2: Inserting trips...');
    const tripIds = await insertTrips(config, crewIds);

    // Step 3: Insert pay claims
    console.log('\n💰 Step 3: Inserting pay claims...');
    const claimsCount = await insertClaims(config, crewIds, tripIds);

    // Step 4: Insert compliance violations
    console.log('\n⚠️  Step 4: Inserting compliance violations...');
    const violationsCount = await insertViolations(config, crewIds, tripIds);

    // Step 5: Insert disruptions
    console.log('\n🔥 Step 5: Inserting disruptions...');
    const disruptionsCount = await insertDisruptions(config, tripIds);

    const result: InsertionResult = {
      crewMembers: crewIds.length,
      trips: tripIds.length,
      claims: claimsCount,
      violations: violationsCount,
      disruptions: disruptionsCount,
      totalRecords: crewIds.length + tripIds.length + claimsCount + violationsCount + disruptionsCount
    };

    console.log('\n✅ Test data insertion complete!');
    console.log(`📊 Summary: ${result.totalRecords} total records inserted`);
    console.log(`   - ${result.crewMembers} crew members`);
    console.log(`   - ${result.trips} trips`);
    console.log(`   - ${result.claims} claims`);
    console.log(`   - ${result.violations} violations`);
    console.log(`   - ${result.disruptions} disruptions\n`);

    return result;
  } catch (error) {
    console.error('❌ Test data insertion failed:', error);
    throw error;
  }
}
