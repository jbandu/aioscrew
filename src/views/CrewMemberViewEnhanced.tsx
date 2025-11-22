import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Calendar, DollarSign, Clock, Plane, Plus, X } from 'lucide-react';
import ConversationalAI from '../components/ConversationalAI';
import { crewService } from '../services/crewService';
import type { CrewMember, Trip, Claim } from '../types';

export default function CrewMemberViewEnhanced() {
  const [currentUser, setCurrentUser] = useState<CrewMember | null>(null);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [userClaims, setUserClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [newClaim, setNewClaim] = useState({
    type: 'International Premium',
    tripId: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await crewService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        const trips = await crewService.getUserTrips(user.id);
        const claims = await crewService.getUserClaims(user.id);
        setUserTrips(trips);
        setUserClaims(claims);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!currentUser || !newClaim.tripId || !newClaim.amount) return;

    const claim: Omit<Claim, 'id'> = {
      crew_id: currentUser.id,
      claim_type: newClaim.type,
      trip_id: newClaim.tripId,
      claim_date: new Date().toISOString().split('T')[0],
      amount: parseFloat(newClaim.amount),
      status: 'pending',
      ai_validated: true,
      ai_explanation: `AI validated: ${newClaim.type} claim for trip ${newClaim.tripId}. ${newClaim.description}`,
      contract_reference: 'CBA Section 12.4'
    };

    const result = await crewService.submitClaim(claim);
    if (result) {
      await loadData();
      setShowClaimForm(false);
      setNewClaim({ type: 'International Premium', tripId: '', amount: '', description: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load user data</p>
      </div>
    );
  }

  const nextTrip = userTrips.find(t => new Date(t.trip_date) > new Date() && t.status === 'scheduled');
  const upcomingTraining = currentUser.upcomingTraining;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-copa-blue to-copa-blue-light text-white rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">Good morning, {currentUser.role} {currentUser.name}</h2>
        <p className="text-copa-gold">
          Based on {currentUser.seniority} years seniority, Copa {currentUser.base} base, {currentUser.qualification} qualified
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-copa-gold">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">VERIFIED</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${currentUser.currentPay?.amount.toLocaleString() || '0'}</div>
          <div className="text-sm text-gray-600">Pay verified</div>
          <div className="text-xs text-gray-500 mt-1">{currentUser.currentPay?.period || 'Current period'}</div>
        </div>

        {upcomingTraining && (
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs text-amber-600 font-medium">DUE SOON</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{upcomingTraining.daysUntil} days</div>
            <div className="text-sm text-gray-600">Training due</div>
            <div className="text-xs text-gray-500 mt-1">{upcomingTraining.type}</div>
          </div>
        )}

        {nextTrip && (
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-blue-600 font-medium">UPCOMING</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {new Date(nextTrip.trip_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-sm text-gray-600">Next trip</div>
            <div className="text-xs text-gray-500 mt-1">{nextTrip.id} - {nextTrip.route}</div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-teal-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-xs text-teal-600 font-medium">YTD</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${currentUser.ytdEarnings?.toLocaleString() || '0'}</div>
          <div className="text-sm text-gray-600">Year-to-date earnings</div>
          <div className="text-xs text-gray-500 mt-1">+8% vs last year</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Schedule
            </h3>
            <span className="text-sm text-gray-600">{userTrips.length} trips</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {userTrips.slice(0, 5).map((trip) => (
              <div key={trip.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`p-2 rounded-lg ${
                  trip.status === 'scheduled' ? 'bg-blue-100' :
                  trip.status === 'cancelled' ? 'bg-red-100' :
                  'bg-green-100'
                }`}>
                  <Plane className={`w-4 h-4 ${
                    trip.status === 'scheduled' ? 'text-blue-600' :
                    trip.status === 'cancelled' ? 'text-red-600' :
                    'text-green-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{trip.id}</div>
                  <div className="text-sm text-gray-600">{trip.route}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(trip.trip_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {trip.credit_hours}h
                  </div>
                </div>
                {trip.is_international && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    INTL
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                My Claims
              </h3>
              <button
                onClick={() => setShowClaimForm(true)}
                className="flex items-center gap-1 px-3 py-1 bg-copa-blue text-white rounded text-sm hover:bg-copa-blue-light transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Claim
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userClaims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{claim.claim_type}</div>
                    <div className="text-xs text-gray-600">{claim.trip_id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">${claim.amount}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      claim.status === 'approved' ? 'bg-green-100 text-green-700' :
                      claim.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {claim.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {userClaims.length === 0 && (
                <p className="text-center text-gray-500 py-4">No claims submitted yet</p>
              )}
            </div>
          </div>

          <ConversationalAI
            role="crew-member"
            context={`${currentUser.role} ${currentUser.name} - ${currentUser.base} base`}
          />
        </div>
      </div>

      {showClaimForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Submit New Claim</h3>
              <button
                onClick={() => setShowClaimForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type</label>
                <select
                  value={newClaim.type}
                  onChange={(e) => setNewClaim({ ...newClaim, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>International Premium</option>
                  <option>Per Diem</option>
                  <option>Holiday Pay</option>
                  <option>Overtime</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip ID</label>
                <select
                  value={newClaim.tripId}
                  onChange={(e) => setNewClaim({ ...newClaim, tripId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a trip</option>
                  {userTrips.map(trip => (
                    <option key={trip.id} value={trip.id}>
                      {trip.id} - {trip.route} ({new Date(trip.trip_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={newClaim.amount}
                  onChange={(e) => setNewClaim({ ...newClaim, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="125.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={newClaim.description}
                  onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional details about this claim..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmitClaim}
                  disabled={!newClaim.tripId || !newClaim.amount}
                  className="flex-1 px-4 py-2 bg-copa-blue text-white rounded-lg hover:bg-copa-blue-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Claim
                </button>
                <button
                  onClick={() => setShowClaimForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
