/**
 * Backend types
 * Shared types for backend services
 */

export interface CrewMember {
  id: string;
  name: string;
  role: 'Captain' | 'First Officer' | 'Flight Attendant';
  base: string;
  seniority: number;
  qualification: string;
  email: string;
  ytdEarnings?: number;
  upcomingTraining?: {
    type: string;
    daysUntil: number;
  };
  currentPay?: {
    period: string;
    amount: number;
    verified: boolean;
  };
}

export interface Trip {
  id: string;
  trip_date: string;
  route: string;
  flight_numbers?: string;
  flight_time_hours?: number;
  credit_hours?: number;
  layover_city?: string;
  is_international?: boolean;
  aircraft_type?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';
  captain_id?: string | null;
  first_officer_id?: string | null;
  senior_fa_id?: string | null;
  junior_fa_id?: string | null;
}
