import { crewMembers, trips } from '../data/mockData';
import type { CrewMember, Trip, Claim } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const crewService = {
  async getCurrentUser(): Promise<CrewMember | null> {
    try {
      // Use mock data instead of database
      return crewMembers[0] || null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  async getUserTrips(crewId: string): Promise<Trip[]> {
    try {
      // Use mock data and filter by crew member
      return trips.filter(t =>
        t.crewAssigned && t.crewAssigned.includes(crewId)
      );
    } catch (error) {
      console.error('Error fetching user trips:', error);
      return [];
    }
  },

  async getUserClaims(crewId: string): Promise<Claim[]> {
    try {
      // Fetch from backend API
      const response = await fetch(`${API_URL}/api/admin/claims/crew/${crewId}`);
      if (!response.ok) throw new Error('Failed to fetch claims');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user claims:', error);
      return [];
    }
  },

  async submitClaim(claim: Omit<Claim, 'id'>): Promise<Claim | null> {
    try {
      console.log('crewService.submitClaim called with:', claim);
      console.log('API_URL:', API_URL);

      const payload = {
        crew_id: claim.crew_id,
        claim_type: claim.claim_type,
        trip_id: claim.trip_id,
        amount: claim.amount,
        description: claim.description || ''
      };
      console.log('Sending payload to backend:', payload);

      // Call backend API to save to database
      const response = await fetch(`${API_URL}/api/admin/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Failed to submit claim: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Backend returned:', result);
      return result;
    } catch (error) {
      console.error('Error submitting claim:', error);
      return null;
    }
  },

  async getAllCrew(): Promise<CrewMember[]> {
    try {
      // Use mock data
      return crewMembers.filter(c => c.status === 'active')
        .sort((a, b) => b.seniority - a.seniority);
    } catch (error) {
      console.error('Error fetching all crew:', error);
      return [];
    }
  },

  async getAllTrips(): Promise<Trip[]> {
    try {
      // Use mock data
      return trips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching all trips:', error);
      return [];
    }
  },

  async getAllClaims(): Promise<Claim[]> {
    try {
      // Use mock data - return empty for now
      return [];
    } catch (error) {
      console.error('Error fetching all claims:', error);
      return [];
    }
  },

  async updateClaimStatus(claimId: string, status: string, reviewedBy?: string): Promise<boolean> {
    try {
      // Mock implementation - just return success
      return true;
    } catch (error) {
      console.error('Error updating claim status:', error);
      return false;
    }
  },

  async getDisruptions(): Promise<any[]> {
    try {
      // Mock data - return empty for now
      return [];
    } catch (error) {
      console.error('Error fetching disruptions:', error);
      return [];
    }
  },

  async getViolations(): Promise<any[]> {
    try {
      // Mock data - return empty for now
      return [];
    } catch (error) {
      console.error('Error fetching violations:', error);
      return [];
    }
  }
};
