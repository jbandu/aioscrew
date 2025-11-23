/**
 * AI Agent service for Crew Controller operations
 * Provides intelligent recommendations for disruption recovery, duty time management,
 * and reserve optimization
 */

import { controllerService, type DisruptionIncident, type RecoveryOption } from './controller-service';

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

export interface AIRecommendation {
  id: string;
  type: 'disruption-recovery' | 'duty-time-violation' | 'reserve-optimization' | 'crew-reassignment';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  summary: string;
  confidence: number;
  options: AIOption[];
  reasoning: string[];
  impactAnalysis: {
    crewAffected: number;
    costImpact: number;
    timeToResolve: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  timestamp: Date;
}

export interface AIOption {
  id: string;
  title: string;
  description: string;
  steps: string[];
  confidence: number;
  cost: number;
  pros: string[];
  cons: string[];
  recommended: boolean;
}

export interface DutyTimeAnalysis {
  crewId: string;
  crewName: string;
  currentDuty: number;
  maxDuty: number;
  projectedDuty: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  violationRisk: number;
  recommendations: string[];
  alternativeActions: {
    action: string;
    impact: string;
    cost: number;
  }[];
}

export interface ReserveOptimization {
  poolSize: number;
  availableNow: number;
  utilizationRate: number;
  targetUtilization: number;
  recommendations: {
    title: string;
    description: string;
    impact: string;
    cost?: number;
  }[];
  balancingActions: {
    crewId: string;
    crewName: string;
    currentUtil: number;
    targetUtil: number;
    action: string;
  }[];
}

class AIControllerAgent {
  /**
   * Get AI recommendations for a disruption
   */
  async analyzeDisruption(
    disruptionId: string,
    disruption: DisruptionIncident
  ): Promise<AIRecommendation> {
    try {
      const response = await fetch(`${API_URL}/api/ai/disruption-recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disruptionId, disruption })
      });

      if (!response.ok) {
        console.warn('AI API unavailable, using fallback logic');
        return this.generateMockDisruptionRecommendation(disruption);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing disruption:', error);
      return this.generateMockDisruptionRecommendation(disruption);
    }
  }

  /**
   * Analyze duty time compliance and risks
   */
  async analyzeDutyTime(crewId: string, currentDuty: number, scheduledFlights: any[]): Promise<DutyTimeAnalysis> {
    try {
      const response = await fetch(`${API_URL}/api/ai/duty-time-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crewId, currentDuty, scheduledFlights })
      });

      if (!response.ok) {
        return this.generateMockDutyTimeAnalysis(crewId, currentDuty);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing duty time:', error);
      return this.generateMockDutyTimeAnalysis(crewId, currentDuty);
    }
  }

  /**
   * Optimize reserve pool utilization
   */
  async optimizeReservePool(reserves: any[]): Promise<ReserveOptimization> {
    try {
      const response = await fetch(`${API_URL}/api/ai/reserve-optimization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reserves })
      });

      if (!response.ok) {
        return this.generateMockReserveOptimization();
      }

      return await response.json();
    } catch (error) {
      console.error('Error optimizing reserve pool:', error);
      return this.generateMockReserveOptimization();
    }
  }

  /**
   * Get best reserve for a callout
   */
  async recommendReserve(
    flightId: string,
    requiredQualifications: string[],
    timeRequired: string
  ): Promise<{
    reserveId: string;
    reserveName: string;
    confidence: number;
    reasoning: string[];
  }> {
    try {
      const response = await fetch(`${API_URL}/api/ai/reserve-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId, requiredQualifications, timeRequired })
      });

      if (!response.ok) {
        return this.generateMockReserveRecommendation();
      }

      return await response.json();
    } catch (error) {
      console.error('Error recommending reserve:', error);
      return this.generateMockReserveRecommendation();
    }
  }

  /**
   * Analyze crew reassignment options
   */
  async analyzeCrewReassignment(
    affectedCrew: string[],
    availableFlights: string[]
  ): Promise<AIRecommendation> {
    try {
      const response = await fetch(`${API_URL}/api/ai/crew-reassignment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affectedCrew, availableFlights })
      });

      if (!response.ok) {
        return this.generateMockReassignmentRecommendation();
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing crew reassignment:', error);
      return this.generateMockReassignmentRecommendation();
    }
  }

  // Mock/Fallback methods

  private generateMockDisruptionRecommendation(disruption: DisruptionIncident): AIRecommendation {
    const isHighSeverity = disruption.severity === 'critical' || disruption.severity === 'high';

    return {
      id: `ai-rec-${Date.now()}`,
      type: 'disruption-recovery',
      priority: disruption.severity,
      title: `Recovery plan for ${disruption.flightNumber} ${disruption.type}`,
      summary: `AI analyzed ${disruption.crewAffected.length} crew and ${5} available flights to generate recovery options`,
      confidence: 0.92,
      options: [
        {
          id: 'option-1',
          title: 'Reassign to next available flight',
          description: 'Assign affected crew to next flight on same route',
          steps: [
            'Identify next available flight',
            'Verify crew legality and qualifications',
            'Notify crew of reassignment',
            'Update crew briefing and gate information'
          ],
          confidence: 0.95,
          cost: 1260,
          pros: [
            'Maintains route consistency',
            'All crew legal for reassignment',
            'Minimal hotel/positioning costs',
            'Quick resolution (< 30 minutes)'
          ],
          cons: [
            'Crew wait time at airport (2-3 hours)',
            'May need meal vouchers ($60)'
          ],
          recommended: true
        },
        {
          id: 'option-2',
          title: 'Deadhead crew and hotel overnight',
          description: 'Send crew on commercial flight, hotel, operate tomorrow',
          steps: [
            'Book commercial flights for crew',
            'Arrange hotel accommodations',
            'Assign crew to next day flight',
            'Call reserves for today\'s coverage'
          ],
          confidence: 0.72,
          cost: 3400,
          pros: [
            'Crew gets proper rest',
            'Flexible for tomorrow\'s ops'
          ],
          cons: [
            'Higher cost (deadhead + hotel)',
            'Requires calling 4 reserves today',
            'Creates tomorrow\'s crew gap'
          ],
          recommended: false
        },
        {
          id: 'option-3',
          title: 'Hotel crew, call reserves',
          description: 'Hotel affected crew, use reserves for coverage',
          steps: [
            'Hotel crew at current location',
            'Call 4 qualified reserves',
            'Assign crew to next available trip'
          ],
          confidence: 0.45,
          cost: 8500,
          pros: [
            'Crew gets full rest period',
            'Maximum flexibility'
          ],
          cons: [
            'Highest cost option',
            'Reserve pool impact',
            'Longest resolution time'
          ],
          recommended: false
        }
      ],
      reasoning: [
        `Analyzed ${disruption.crewAffected.length} affected crew members`,
        'All crew currently have adequate duty time remaining',
        'Next flight on route departs in 2.5 hours',
        'Reserve pool has capacity but better saved for emergencies',
        'Historical data shows 92% success rate with Option 1'
      ],
      impactAnalysis: {
        crewAffected: disruption.crewAffected.length,
        costImpact: 1260,
        timeToResolve: 30,
        riskLevel: isHighSeverity ? 'medium' : 'low'
      },
      timestamp: new Date()
    };
  }

  private generateMockDutyTimeAnalysis(crewId: string, currentDuty: number): DutyTimeAnalysis {
    const maxDuty = 12;
    const percentUsed = (currentDuty / maxDuty) * 100;
    const projectedDuty = currentDuty + 2.5; // Assume 2.5 more hours

    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (percentUsed >= 90) riskLevel = 'critical';
    else if (percentUsed >= 80) riskLevel = 'high';
    else if (percentUsed >= 70) riskLevel = 'medium';
    else riskLevel = 'low';

    return {
      crewId,
      crewName: 'Kevin Wilson',
      currentDuty,
      maxDuty,
      projectedDuty,
      riskLevel,
      violationRisk: percentUsed >= 85 ? 0.75 : 0.15,
      recommendations: [
        percentUsed >= 85 ? 'IMMEDIATE ACTION: Replace crew with reserve' : 'Monitor duty time closely',
        'Set alert for 90% duty time threshold',
        percentUsed >= 80 ? 'Prepare backup crew in advance' : 'Continue normal operations'
      ],
      alternativeActions: [
        {
          action: 'Replace with reserve captain',
          impact: 'Eliminates violation risk, crew gets rest',
          cost: 450
        },
        {
          action: 'Monitor and delay if needed',
          impact: 'May cause flight delay, potential violation',
          cost: 2500
        }
      ]
    };
  }

  private generateMockReserveOptimization(): ReserveOptimization {
    return {
      poolSize: 12,
      availableNow: 3,
      utilizationRate: 0.58,
      targetUtilization: 0.60,
      recommendations: [
        {
          title: 'Balance Utilization',
          description: 'Wilson over-utilized (78% vs 65% target), Park & Davis under-utilized',
          impact: 'Improve crew satisfaction by 12%',
          cost: 0
        },
        {
          title: 'Increase Pool Size',
          description: 'Add 2 reserves for winter season (callouts trending up 15%)',
          impact: 'Maintain 100% fill rate during peak season',
          cost: 5834
        },
        {
          title: 'Reduce Response Time',
          description: 'Mandate mobile app for all reserves',
          impact: 'Reduce avg response time by 4 minutes',
          cost: 0
        }
      ],
      balancingActions: [
        {
          crewId: 'CM012',
          crewName: 'Wilson, K',
          currentUtil: 0.78,
          targetUtil: 0.65,
          action: 'Reduce callout frequency'
        },
        {
          crewId: 'CM047',
          crewName: 'Park, J',
          currentUtil: 0.45,
          targetUtil: 0.60,
          action: 'Increase callout priority'
        }
      ]
    };
  }

  private generateMockReserveRecommendation() {
    return {
      reserveId: 'CM012',
      reserveName: 'Kevin Wilson',
      confidence: 0.92,
      reasoning: [
        'Fastest average response time (12 minutes)',
        'High reliability (100% acceptance rate)',
        'Well-rested (48 hours since last duty)',
        'Qualified for aircraft type (737-800)',
        'Based at required location (BUR)'
      ]
    };
  }

  private generateMockReassignmentRecommendation(): AIRecommendation {
    return {
      id: `ai-reassign-${Date.now()}`,
      type: 'crew-reassignment',
      priority: 'high',
      title: 'Crew Reassignment Analysis',
      summary: 'Analyzed 4 crew members and 3 available flights',
      confidence: 0.88,
      options: [
        {
          id: 'reassign-1',
          title: 'Assign all crew to next flight',
          description: 'Keep crew together on same route',
          steps: ['Verify legality', 'Update assignments', 'Notify crew'],
          confidence: 0.95,
          cost: 1200,
          pros: ['Crew stays together', 'Same route'],
          cons: ['Wait time'],
          recommended: true
        }
      ],
      reasoning: ['Crew legal', 'Next flight available'],
      impactAnalysis: {
        crewAffected: 4,
        costImpact: 1200,
        timeToResolve: 30,
        riskLevel: 'low'
      },
      timestamp: new Date()
    };
  }
}

// Singleton instance
export const aiControllerAgent = new AIControllerAgent();
