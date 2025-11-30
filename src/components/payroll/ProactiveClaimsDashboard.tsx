/**
 * Proactive Claims Dashboard Component
 *
 * Displays auto-generated claims with AI validation details
 */

import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertCircle, Clock, Sparkles, TrendingUp } from 'lucide-react';

interface ProactiveClaim {
  id: string;
  crew_id: string;
  claim_type: string;
  trip_id: string;
  amount: number;
  status: string;
  ai_confidence: number;
  ai_recommendation: string;
  ai_reasoning: string;
  detection_method: string;
  created_at: string;
}

interface Stats {
  total_auto_generated: number;
  auto_approved: number;
  manual_review: number;
  rejected: number;
  auto_approval_rate: number;
  avg_confidence: number;
  total_amount: number;
}

const ProactiveClaimsDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentClaims, setRecentClaims] = useState<ProactiveClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchData = async () => {
    try {
      const [statsRes, claimsRes] = await Promise.all([
        fetch(`${API_URL}/api/proactive-claims/stats`),
        fetch(`${API_URL}/api/proactive-claims/recent?limit=10`)
      ]);

      const statsData = await statsRes.json();
      const claimsData = await claimsRes.json();

      setStats(statsData);
      setRecentClaims(claimsData.claims || []);
    } catch (error) {
      console.error('Error fetching proactive claims data:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerProcessing = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/api/proactive-claims/process`, {
        method: 'POST'
      });
      const result = await response.json();

      alert(`Processed ${result.result.trips_processed} trips!\n` +
            `Detected: ${result.result.claims_detected} claims\n` +
            `Auto-approved: ${result.result.claims_auto_approved}\n` +
            `Manual review: ${result.result.claims_manual_review}`);

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error triggering processing:', error);
      alert('Failed to trigger processing');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Clock className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2">Loading proactive claims data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Proactive Claims System
          </h2>
          <p className="text-gray-600 mt-1">AI-powered automatic claim detection and validation</p>
        </div>
        <button
          onClick={triggerProcessing}
          disabled={processing}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {processing ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              Process Now
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Auto-Generated</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total_auto_generated}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Auto-Approved</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{stats.auto_approved}</p>
                <p className="text-xs text-green-600 mt-1">{stats.auto_approval_rate.toFixed(1)}% approval rate</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">Manual Review</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.manual_review}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Avg Confidence</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{stats.avg_confidence.toFixed(0)}%</p>
                <p className="text-xs text-purple-600 mt-1">${stats.total_amount.toFixed(2)} approved</p>
              </div>
              <Sparkles className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Claims Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recently Auto-Generated Claims</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Reasoning
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentClaims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No auto-generated claims yet. Click "Process Now" to detect claims.
                  </td>
                </tr>
              ) : (
                recentClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {claim.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {claim.claim_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${claim.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full ${
                              claim.ai_confidence * 100 >= 95
                                ? 'bg-green-500'
                                : claim.ai_confidence * 100 >= 80
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${claim.ai_confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {(claim.ai_confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          claim.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : claim.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                      <div className="truncate" title={claim.ai_reasoning}>
                        {claim.ai_reasoning || 'No reasoning provided'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProactiveClaimsDashboard;
