/**
 * Proactive Claim Detection Calculators
 *
 * This module contains the business logic for detecting and calculating
 * various types of crew pay claims automatically when trips are completed.
 */

import { Pool } from 'pg';

// Constants based on CBA research
const PER_DIEM_RATES = {
  DOMESTIC: 2.65, // $2.65/hour for domestic
  INTERNATIONAL: 3.50 // $3.50/hour for international
};

const INTERNATIONAL_PREMIUM = {
  PER_HOUR: 3.25, // $3.25/hour additional for international flights
  MINIMUM: 125.00 // Minimum $125 for any international trip
};

const IROP_MULTIPLIERS = {
  EXTENDED_DUTY_12HR: 2.0, // 2x rate for duty over 12:30 hours
  EXTENDED_DUTY_16HR: 3.0  // 3x rate for duty over 16:00 hours
};

const HOLIDAYS = [
  '2025-01-01', // New Year's Day
  '2025-07-04', // Independence Day
  '2025-11-27', // Thanksgiving
  '2025-12-25', // Christmas
  // Add more as needed
];

export interface Trip {
  id: string;
  trip_date: Date;
  route: string;
  departure_time: string;
  arrival_time: string;
  flight_time_hours: number;
  credit_hours: number;
  is_international: boolean;
  status: string;
  senior_fa_id: string;
}

export interface DetectedClaim {
  crew_id: string;
  claim_type: string;
  trip_id: string;
  amount: number;
  description: string;
  detection_method: string;
  confidence: number; // 0-100
  supporting_data: any;
}

/**
 * Calculate per diem based on Time Away From Base (TAFB)
 *
 * Per diem is calculated from check-in to check-in, not just flight time.
 * For multi-day trips, TAFB = (end_time - start_time) in hours
 */
export function calculatePerDiem(trip: Trip): DetectedClaim | null {
  // Parse departure and arrival times
  const [depHour, depMin] = trip.departure_time.split(':').map(Number);
  const [arrHour, arrMin] = trip.arrival_time.split(':').map(Number);

  // Calculate TAFB (simplified - in reality would span multiple days)
  // Assuming check-in 1.5 hours before departure, check-out 0.5 hours after arrival
  const checkInTime = depHour + depMin / 60 - 1.5;
  const checkOutTime = arrHour + arrMin / 60 + 0.5;

  let tafbHours = checkOutTime - checkInTime;

  // If negative, trip crossed midnight
  if (tafbHours < 0) {
    tafbHours += 24;
  }

  // For multi-day international trips, add 24 hours per additional day (estimated)
  if (trip.is_international && tafbHours < 12) {
    tafbHours += 24; // Likely a 2-day trip
  }

  const rate = trip.is_international ? PER_DIEM_RATES.INTERNATIONAL : PER_DIEM_RATES.DOMESTIC;
  const amount = parseFloat((tafbHours * rate).toFixed(2));

  // Only create claim if amount is significant
  if (amount < 10) {
    return null;
  }

  return {
    crew_id: trip.senior_fa_id,
    claim_type: 'Per Diem',
    trip_id: trip.id,
    amount,
    description: `Per diem for ${trip.route} - ${tafbHours.toFixed(1)} hours TAFB @ $${rate}/hr`,
    detection_method: 'auto:per_diem_calculator',
    confidence: 95,
    supporting_data: {
      tafb_hours: tafbHours,
      rate,
      trip_type: trip.is_international ? 'international' : 'domestic'
    }
  };
}

/**
 * Detect international premium pay
 *
 * International flights earn additional override pay based on block time.
 * This is separate from per diem and is taxable/pensionable.
 */
export function calculateInternationalPremium(trip: Trip): DetectedClaim | null {
  if (!trip.is_international) {
    return null;
  }

  const blockTime = parseFloat(String(trip.flight_time_hours));
  let amount = blockTime * INTERNATIONAL_PREMIUM.PER_HOUR;

  // Apply minimum
  if (amount < INTERNATIONAL_PREMIUM.MINIMUM) {
    amount = INTERNATIONAL_PREMIUM.MINIMUM;
  }

  return {
    crew_id: trip.senior_fa_id,
    claim_type: 'International Premium',
    trip_id: trip.id,
    amount: parseFloat(amount.toFixed(2)),
    description: `International premium for ${trip.route} - ${blockTime.toFixed(1)} block hours @ $${INTERNATIONAL_PREMIUM.PER_HOUR}/hr (min $${INTERNATIONAL_PREMIUM.MINIMUM})`,
    detection_method: 'auto:international_premium_detector',
    confidence: 98,
    supporting_data: {
      block_time: blockTime,
      rate: INTERNATIONAL_PREMIUM.PER_HOUR,
      minimum: INTERNATIONAL_PREMIUM.MINIMUM
    }
  };
}

/**
 * Detect IROP (irregular operations) and extended duty pay
 *
 * When duty periods exceed certain thresholds, crew earn premium pay multipliers.
 */
export function detectIROPPay(trip: Trip): DetectedClaim | null {
  // Parse times to calculate duty period
  const [depHour, depMin] = trip.departure_time.split(':').map(Number);
  const [arrHour, arrMin] = trip.arrival_time.split(':').map(Number);

  const checkInTime = depHour + depMin / 60 - 1.5;
  const checkOutTime = arrHour + arrMin / 60 + 0.5;

  let dutyHours = checkOutTime - checkInTime;
  if (dutyHours < 0) {
    dutyHours += 24;
  }

  // Check if duty exceeds thresholds
  if (dutyHours <= 12.5) {
    return null; // No IROP pay
  }

  let multiplier = IROP_MULTIPLIERS.EXTENDED_DUTY_12HR;
  let threshold = '12:30';

  if (dutyHours > 16.0) {
    multiplier = IROP_MULTIPLIERS.EXTENDED_DUTY_16HR;
    threshold = '16:00';
  }

  // Calculate IROP pay (simplified - base rate assumed $50/hr)
  const baseRate = 50;
  const iropHours = dutyHours - (multiplier === 2.0 ? 12.5 : 16.0);
  const amount = parseFloat((iropHours * baseRate * (multiplier - 1)).toFixed(2));

  return {
    crew_id: trip.senior_fa_id,
    claim_type: 'IROP Extended Duty',
    trip_id: trip.id,
    amount,
    description: `Extended duty pay for ${trip.route} - duty period ${dutyHours.toFixed(1)} hours (${multiplier}x rate beyond ${threshold})`,
    detection_method: 'auto:irop_detector',
    confidence: 90,
    supporting_data: {
      duty_hours: dutyHours,
      threshold,
      multiplier,
      irop_hours: iropHours
    }
  };
}

/**
 * Detect holiday premium pay
 *
 * Flights operated on designated holidays earn 100% premium (double rate).
 * Crew must actually fly - not just be on duty.
 */
export function detectHolidayPay(trip: Trip): DetectedClaim | null {
  const tripDateStr = trip.trip_date.toISOString().split('T')[0];

  if (!HOLIDAYS.includes(tripDateStr)) {
    return null;
  }

  // Holiday pay is 100% of base pay for hours flown
  const blockTime = parseFloat(String(trip.flight_time_hours));
  const baseRate = 50; // Simplified base rate
  const amount = parseFloat((blockTime * baseRate).toFixed(2));

  const holidayName = getHolidayName(tripDateStr);

  return {
    crew_id: trip.senior_fa_id,
    claim_type: 'Holiday Premium',
    trip_id: trip.id,
    amount,
    description: `Holiday premium for ${holidayName} - ${blockTime.toFixed(1)} block hours @ 100% premium`,
    detection_method: 'auto:holiday_pay_detector',
    confidence: 99,
    supporting_data: {
      holiday: holidayName,
      holiday_date: tripDateStr,
      block_time: blockTime,
      premium_rate: 1.0
    }
  };
}

function getHolidayName(dateStr: string): string {
  const holidayMap: {[key: string]: string} = {
    '2025-01-01': 'New Year\'s Day',
    '2025-07-04': 'Independence Day',
    '2025-11-27': 'Thanksgiving',
    '2025-12-25': 'Christmas'
  };
  return holidayMap[dateStr] || 'Holiday';
}

/**
 * Run all detectors on a completed trip
 *
 * This is the main entry point that checks all claim types for a given trip.
 */
export async function detectAllClaims(trip: Trip): Promise<DetectedClaim[]> {
  const claims: DetectedClaim[] = [];

  // Run all detectors
  const perDiem = calculatePerDiem(trip);
  if (perDiem) claims.push(perDiem);

  const intlPremium = calculateInternationalPremium(trip);
  if (intlPremium) claims.push(intlPremium);

  const iropPay = detectIROPPay(trip);
  if (iropPay) claims.push(iropPay);

  const holidayPay = detectHolidayPay(trip);
  if (holidayPay) claims.push(holidayPay);

  return claims;
}

/**
 * Get all recently completed trips that haven't been processed
 *
 * This queries the database for trips that are complete but haven't
 * had automatic claims generated yet.
 */
export async function getUnprocessedTrips(pool: Pool): Promise<Trip[]> {
  const query = `
    SELECT DISTINCT t.*
    FROM trips t
    WHERE t.status = 'completed'
    AND t.trip_date >= CURRENT_DATE - INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM pay_claims pc
      WHERE pc.trip_id = t.id
      AND pc.auto_generated = true
    )
    ORDER BY t.trip_date DESC
  `;

  const result = await pool.query(query);
  return result.rows;
}
