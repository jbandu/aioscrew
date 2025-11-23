/**
 * Controller service for crew operations API
 * Handles real-time crew tracking, disruption management, and reserve operations
 */

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

export interface CrewStatus {
  id: string;
  name: string;
  role: string;
  status: 'in-flight' | 'pre-flight' | 'post-flight' | 'layover' | 'reserve' | 'off-duty';
  currentFlight?: string;
  dutyTime: number;
  maxDutyTime: number;
  location?: string;
  nextTrip?: string;
  legalStatus: 'legal' | 'warning' | 'violation';
}

export interface FlightStatus {
  id: string;
  flightNumber: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  status: 'scheduled' | 'boarding' | 'departed' | 'in-flight' | 'arrived' | 'delayed' | 'cancelled';
  delayMinutes?: number;
  crew: {
    captain?: string;
    firstOfficer?: string;
    seniorFA?: string;
    flightAttendants?: string[];
  };
  aircraft?: string;
  gate?: string;
}

export interface DisruptionIncident {
  id: string;
  type: 'cancellation' | 'delay' | 'mechanical' | 'weather' | 'crew';
  severity: 'critical' | 'high' | 'medium' | 'low';
  flightId: string;
  flightNumber: string;
  route: string;
  description: string;
  crewAffected: string[];
  startTime: Date;
  estimatedResolution?: Date;
  status: 'active' | 'resolving' | 'resolved';
  aiRecommendations?: RecoveryOption[];
}

export interface RecoveryOption {
  id: string;
  title: string;
  description: string;
  actions: string[];
  cost: number;
  confidence: number;
  pros: string[];
  cons: string[];
  crewImpact: {
    crewId: string;
    action: string;
    dutyTime?: number;
  }[];
}

export interface ReserveStatus {
  id: string;
  name: string;
  role: string;
  base: string;
  availableNow: boolean;
  availableUntil: string;
  lastCallout?: Date;
  responseTimeAvg: number;
  utilizationRate: number;
  reliability: number;
  qualifications: string[];
}

export interface CalloutRequest {
  reserveId: string;
  flightId: string;
  reason: string;
  reportTime: string;
  reportLocation: string;
}

export interface CalloutResponse {
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'no-response';
  calledAt: Date;
  respondedAt?: Date;
  responseTime?: number;
}

class ControllerService {
  /**
   * Get current crew statuses
   */
  async getCrewStatuses(filters?: {
    status?: string;
    base?: string;
    dutyTimeWarning?: boolean;
  }): Promise<CrewStatus[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.base) params.append('base', filters.base);
      if (filters?.dutyTimeWarning) params.append('dutyTimeWarning', 'true');

      const response = await fetch(`${API_URL}/api/controller/crew-status?${params}`);
      if (!response.ok) throw new Error('Failed to fetch crew statuses');

      return await response.json();
    } catch (error) {
      console.error('Error fetching crew statuses:', error);
      return this.getMockCrewStatuses();
    }
  }

  /**
   * Get flight statuses
   */
  async getFlightStatuses(filters?: {
    status?: string;
    timeRange?: string;
    base?: string;
  }): Promise<FlightStatus[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.base) params.append('base', filters.base);

      const response = await fetch(`${API_URL}/api/controller/flights?${params}`);
      if (!response.ok) throw new Error('Failed to fetch flight statuses');

      return await response.json();
    } catch (error) {
      console.error('Error fetching flight statuses:', error);
      return this.getMockFlightStatuses();
    }
  }

  /**
   * Get active disruptions
   */
  async getDisruptions(includeResolved = false): Promise<DisruptionIncident[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/controller/disruptions?includeResolved=${includeResolved}`
      );
      if (!response.ok) throw new Error('Failed to fetch disruptions');

      return await response.json();
    } catch (error) {
      console.error('Error fetching disruptions:', error);
      return this.getMockDisruptions();
    }
  }

  /**
   * Get AI recovery recommendations for a disruption
   */
  async getRecoveryRecommendations(disruptionId: string): Promise<RecoveryOption[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/controller/disruptions/${disruptionId}/recovery-options`
      );
      if (!response.ok) throw new Error('Failed to fetch recovery recommendations');

      return await response.json();
    } catch (error) {
      console.error('Error fetching recovery recommendations:', error);
      return this.getMockRecoveryOptions();
    }
  }

  /**
   * Execute a recovery plan
   */
  async executeRecoveryPlan(disruptionId: string, optionId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_URL}/api/controller/disruptions/${disruptionId}/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optionId })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error executing recovery plan:', error);
      return false;
    }
  }

  /**
   * Get available reserves
   */
  async getReservePool(availableNow = false): Promise<ReserveStatus[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/controller/reserves?availableNow=${availableNow}`
      );
      if (!response.ok) throw new Error('Failed to fetch reserve pool');

      return await response.json();
    } catch (error) {
      console.error('Error fetching reserve pool:', error);
      return this.getMockReserves();
    }
  }

  /**
   * Initiate reserve callout
   */
  async calloutReserve(request: CalloutRequest): Promise<CalloutResponse> {
    try {
      const response = await fetch(`${API_URL}/api/controller/callouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) throw new Error('Failed to initiate callout');

      return await response.json();
    } catch (error) {
      console.error('Error calling out reserve:', error);
      // Return mock response
      return {
        id: `callout-${Date.now()}`,
        status: 'pending',
        calledAt: new Date()
      };
    }
  }

  /**
   * Get crew duty time details
   */
  async getDutyTimeDetails(crewId: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/api/controller/crew/${crewId}/duty-time`);
      if (!response.ok) throw new Error('Failed to fetch duty time details');

      return await response.json();
    } catch (error) {
      console.error('Error fetching duty time details:', error);
      return null;
    }
  }

  /**
   * Send message to crew
   */
  async sendCrewMessage(crewIds: string[], message: {
    subject: string;
    body: string;
    priority: 'normal' | 'high' | 'urgent';
    methods: ('push' | 'sms' | 'email')[];
  }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/controller/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crewIds, message })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending crew message:', error);
      return false;
    }
  }

  // Mock data methods (fallback when API is unavailable)

  private getMockCrewStatuses(): CrewStatus[] {
    return [
      {
        id: 'CM001',
        name: 'Sarah Martinez',
        role: 'Captain',
        status: 'in-flight',
        currentFlight: 'CM100',
        dutyTime: 6.5,
        maxDutyTime: 12,
        location: 'En route to PTY',
        legalStatus: 'legal'
      },
      {
        id: 'CM003',
        name: 'Kevin Wilson',
        role: 'Captain',
        status: 'pre-flight',
        currentFlight: 'CM230',
        dutyTime: 10.5,
        maxDutyTime: 12,
        location: 'BUR',
        legalStatus: 'warning'
      }
    ];
  }

  private getMockFlightStatuses(): FlightStatus[] {
    return [
      {
        id: 'CM100',
        flightNumber: 'CM100',
        route: 'BUR → PTY',
        departureTime: '06:30',
        arrivalTime: '13:15',
        status: 'in-flight',
        crew: {
          captain: 'Sarah Martinez',
          firstOfficer: 'John Smith',
          seniorFA: 'Patricia Lee'
        }
      },
      {
        id: 'CM230',
        flightNumber: 'CM230',
        route: 'BUR → PDX',
        departureTime: '12:30',
        arrivalTime: '15:00',
        status: 'delayed',
        delayMinutes: 120,
        crew: {
          captain: 'Kevin Wilson',
          firstOfficer: 'John Smith'
        }
      }
    ];
  }

  private getMockDisruptions(): DisruptionIncident[] {
    return [
      {
        id: 'D-2024-089',
        type: 'cancellation',
        severity: 'critical',
        flightId: 'CM450',
        flightNumber: 'CM450',
        route: 'PTY → LAX',
        description: 'Flight cancelled due to hydraulic system failure',
        crewAffected: ['CM001', 'CM002', 'CM015', 'CM024'],
        startTime: new Date('2024-11-22T14:30:00'),
        status: 'active'
      }
    ];
  }

  private getMockRecoveryOptions(): RecoveryOption[] {
    return [
      {
        id: 'option-1',
        title: 'Assign to CM460',
        description: 'Reassign crew to next available flight on same route',
        actions: [
          'Assign crew to CM460 (PTY → LAX, 16:30)',
          'Notify crew of new assignment',
          'Update crew briefing'
        ],
        cost: 1260,
        confidence: 0.95,
        pros: ['Same route', 'Crew legal', 'Minimal disruption'],
        cons: ['2.5hr wait at airport'],
        crewImpact: []
      }
    ];
  }

  private getMockReserves(): ReserveStatus[] {
    return [
      {
        id: 'CM012',
        name: 'Kevin Wilson',
        role: 'Captain',
        base: 'BUR',
        availableNow: true,
        availableUntil: '22:00',
        responseTimeAvg: 15,
        utilizationRate: 0.62,
        reliability: 1.0,
        qualifications: ['737-800', '777']
      }
    ];
  }
}

// Singleton instance
export const controllerService = new ControllerService();
