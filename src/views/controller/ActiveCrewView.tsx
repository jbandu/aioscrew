import { useState, useCallback } from 'react';
import {
  ArrowLeft, Users, Plane, Clock, CheckCircle, AlertCircle,
  Phone, MessageSquare, Mail, TrendingUp, Activity, Filter,
  Download, Send, UserCheck, Wifi, WifiOff
} from 'lucide-react';
import { crewMembers, trips } from '../../data/mockData';
import { useRealTimeUpdates, useCrewStatusUpdates, useDutyTimeWarnings, formatTimeSince } from '../../hooks/useRealTimeUpdates';
import { controllerService } from '../../services/controller-service';
import { aiControllerAgent } from '../../services/ai-controller-agent';

interface ActiveCrewViewProps {
  onBack: () => void;
}

export default function ActiveCrewView({ onBack }: ActiveCrewViewProps) {
  const [activeTab, setActiveTab] = useState('on-duty');
  const [crewStatuses, setCrewStatuses] = useState<any[]>([]);
  const [dutyTimeWarnings, setDutyTimeWarnings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'on-duty', label: 'On Duty Overview' },
    { id: 'assignments', label: 'Flight Assignments' },
    { id: 'duty-time', label: 'Duty Time Monitoring' },
    { id: 'communications', label: 'Crew Communications' }
  ];

  // Real-time data refresh
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const crew = await controllerService.getCrewStatuses();
      setCrewStatuses(crew);

      // Identify crew with duty time warnings
      const warnings = crew.filter(c =>
        c.dutyTime / c.maxDutyTime >= 0.80
      );
      setDutyTimeWarnings(warnings);
    } catch (error) {
      console.error('Error fetching crew data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real-time updates
  const { isConnected, timeSinceUpdate, manualRefresh } = useRealTimeUpdates({
    refreshInterval: 10000,
    enableWebSocket: true,
    onRefresh: fetchData
  });

  // Subscribe to crew status updates
  useCrewStatusUpdates((update) => {
    setCrewStatuses(prev =>
      prev.map(c => c.id === update.crewId ? { ...c, ...update } : c)
    );
  });

  // Subscribe to duty time warnings
  useDutyTimeWarnings((warning) => {
    console.log('Duty time warning:', warning);
    // Add to warnings if not already present
    setDutyTimeWarnings(prev => {
      const exists = prev.find(w => w.crewId === warning.crewId);
      if (exists) return prev;
      return [...prev, warning];
    });
  });

  // Calculate statistics
  const activeCrew = crewStatuses;
  const inFlightCrew = crewStatuses.filter(c => c.status === 'in-flight').length;
  const preFlightCrew = crewStatuses.filter(c => c.status === 'pre-flight').length;
  const layoverCrew = crewStatuses.filter(c => c.status === 'layover').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Active Crew Management</h2>
            <div className="flex items-center gap-4 text-blue-100">
              <span>Total On Duty: {activeCrew.length} crew</span>
              <span>|</span>
              <span>In-Flight: {inFlightCrew}</span>
              <span>|</span>
              <span>Layover: {layoverCrew}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold text-sm ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* ON DUTY OVERVIEW TAB */}
          {activeTab === 'on-duty' && (
            <div className="space-y-6">
              {/* Status Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">ON DUTY CREW - LIVE STATUS</h3>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-900">{activeCrew.length}</div>
                    <div className="text-sm text-blue-700">Total On Duty</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-900">{inFlightCrew}</div>
                    <div className="text-sm text-green-700">In-Flight</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-900">{layoverCrew}</div>
                    <div className="text-sm text-purple-700">Layover</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-900">{preFlightCrew}</div>
                    <div className="text-sm text-amber-700">Pre-Flight</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-900">Duty Time Avg: 7.2 / 12.0 hours</span>
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full font-medium">
                      ✓ 100% Compliant
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">ON DUTY BREAKDOWN</h3>
                <div className="space-y-3">
                  {[
                    { label: 'In-Flight', count: inFlightCrew, percent: 25, color: 'blue' },
                    { label: 'Layover', count: layoverCrew, percent: 33, color: 'purple' },
                    { label: 'Pre-Flight', count: preFlightCrew, percent: 8, color: 'green' },
                    { label: 'Post-Flight', count: Math.floor(activeCrew.length * 0.06), percent: 6, color: 'amber' },
                    { label: 'Positioning', count: Math.floor(activeCrew.length * 0.05), percent: 5, color: 'red' }
                  ].map((status) => (
                    <div key={status.label} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-700">{status.label}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                          className={`bg-${status.color}-500 h-full rounded-full flex items-center justify-end px-2`}
                          style={{ width: `${status.percent}%` }}
                        >
                          <span className="text-xs font-bold text-white">{status.percent}%</span>
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm font-semibold text-gray-900">
                        {status.count} crew
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crew by Status */}
              <div className="space-y-4">
                {/* In-Flight Crew */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg flex items-center justify-between">
                    <h4 className="font-bold flex items-center gap-2">
                      <Plane className="w-5 h-5" />
                      🛫 IN-FLIGHT ({inFlightCrew} crew)
                    </h4>
                    <button className="text-sm underline">View All</button>
                  </div>
                  <div className="p-6 space-y-3">
                    {activeCrew.slice(0, 2).map((crew) => (
                      <div key={crew.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-bold text-gray-900">{crew.name} ({crew.role})</div>
                            <div className="text-sm text-gray-600">Flight CM{100 + parseInt(crew.id.slice(2))} • BUR → PTY</div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            ✓ On Time
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-gray-600 text-xs">ETA</div>
                            <div className="font-semibold">13:15</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">Duty Time</div>
                            <div className="font-semibold">6.5/12 hrs</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">Next Trip</div>
                            <div className="font-semibold">22hr rest</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">Legal</div>
                            <div className="font-semibold text-green-600">✓ Yes</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-xs">
                            Track Flight
                          </button>
                          <button className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-xs">
                            Contact
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layover Crew */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="bg-purple-600 text-white px-6 py-3 rounded-t-lg flex items-center justify-between">
                    <h4 className="font-bold flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      🏨 LAYOVER ({layoverCrew} crew)
                    </h4>
                    <button className="text-sm underline">View All</button>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {[
                        { location: 'PTY - Copa Marriott', count: 8, nextTrip: 'CM101 (Nov 24, 14:30)', restStatus: '✓ Adequate' },
                        { location: 'LAX - Hilton LAX', count: 6, nextTrip: 'CM200 (Nov 23, 08:00)', restStatus: '⚠️ Early wake-up' },
                        { location: 'BOG - Hilton Bogota', count: 4, nextTrip: 'CM106 (Nov 23, 10:30)', restStatus: '✓ Adequate' }
                      ].map((layover, idx) => (
                        <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-bold text-gray-900">{layover.location}</div>
                              <div className="text-sm text-gray-600">{layover.count} crew</div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              layover.restStatus.includes('⚠️')
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {layover.restStatus}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            Next Trip: {layover.nextTrip}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button className="flex-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs">
                              View Details
                            </button>
                            <button className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-xs">
                              Contact All
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FLIGHT ASSIGNMENTS TAB */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Flight Assignments - Today</h3>
                  <p className="text-sm text-gray-600">Detailed crew-to-flight assignments</p>
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                    <option>View: By Flight</option>
                    <option>View: By Crew</option>
                    <option>View: By Base</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Flight Assignment Cards */}
              <div className="space-y-4">
                {trips.slice(0, 5).map((trip, idx) => {
                  const captain = crewMembers.find(c => c.id === trip.captain_id);
                  const fo = crewMembers.find(c => c.id === trip.first_officer_id);
                  const sfa = crewMembers.find(c => c.id === trip.senior_fa_id);

                  return (
                    <div key={trip.id} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <Plane className={`w-6 h-6 ${
                              trip.status === 'cancelled' ? 'text-red-600' :
                              trip.status === 'delayed' ? 'text-amber-600' :
                              'text-green-600'
                            }`} />
                            <div>
                              <div className="text-xl font-bold text-gray-900">
                                ✈️ {trip.id || `CM${100 + idx}`} - {trip.route}
                              </div>
                              <div className="text-sm text-gray-600">
                                {trip.departure_time || '06:30'} - {trip.arrival_time || '13:15'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            trip.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            trip.status === 'delayed' ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {trip.status === 'cancelled' ? '🔴 Cancelled' :
                             trip.status === 'delayed' ? '⏱️ Delayed' :
                             '🛫 In-Flight'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-bold text-gray-900 mb-3">Crew Assignment:</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Captain */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              👨‍✈️
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-600">Captain</div>
                              <div className="font-bold text-gray-900">{captain?.name || 'UNASSIGNED'}</div>
                              {captain && (
                                <>
                                  <div className="text-xs text-gray-600">
                                    Seniority: #{captain.seniority} | Qual: {captain.qualification} ✓
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-green-600">Legal: ✓</span>
                                    <span className="text-xs text-gray-500">Duty: 6.5/12 hrs</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* First Officer */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              👨‍✈️
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-600">First Officer</div>
                              <div className="font-bold text-gray-900">{fo?.name || 'UNASSIGNED'}</div>
                              {fo && (
                                <>
                                  <div className="text-xs text-gray-600">
                                    Seniority: #{fo.seniority} | Qual: {fo.qualification} ✓
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-green-600">Legal: ✓</span>
                                    <span className="text-xs text-gray-500">Duty: 6.5/12 hrs</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Senior FA */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              👥
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-600">Senior FA</div>
                              <div className="font-bold text-gray-900">{sfa?.name || 'UNASSIGNED'}</div>
                              {sfa && (
                                <div className="text-xs text-gray-600 mt-1">
                                  Seniority: #{sfa.seniority} | Legal: ✓
                                </div>
                              )}
                            </div>
                          </div>

                          {/* FA */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              👥
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-600">FA</div>
                              <div className="font-bold text-gray-900">
                                {crewMembers[Math.floor(Math.random() * crewMembers.length)]?.name || 'UNASSIGNED'}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">Legal: ✓</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                          View Full Details
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                          Contact Crew
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                          Reassign
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DUTY TIME MONITORING TAB */}
          {activeTab === 'duty-time' && (
            <div className="space-y-6">
              {/* Compliance Dashboard */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-600 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4">DUTY TIME COMPLIANCE - LIVE MONITORING</h3>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-900">99.2%</div>
                    <div className="text-sm text-green-700">Compliance Rate</div>
                    <div className="text-xs text-green-600 mt-1">({activeCrew.length - 1}/{activeCrew.length} crew)</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-900">1</div>
                    <div className="text-sm text-amber-700">At Risk</div>
                    <div className="text-xs text-amber-600 mt-1">Requires attention</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-900">0</div>
                    <div className="text-sm text-green-700">Violations Today</div>
                    <div className="text-xs text-green-600 mt-1">Excellent!</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-900">7.2 hrs</div>
                    <div className="text-sm text-blue-700">Avg Duty Time</div>
                    <div className="text-xs text-blue-600 mt-1">60% utilized</div>
                  </div>
                </div>
              </div>

              {/* Duty Time Distribution */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">CREW DUTY TIME DISTRIBUTION</h3>
                <div className="space-y-3">
                  {[
                    { range: '0-2 hrs', count: 8, percent: 11, color: 'green', status: 'good' },
                    { range: '2-4 hrs', count: 14, percent: 19, color: 'green', status: 'good' },
                    { range: '4-6 hrs', count: 22, percent: 31, color: 'blue', status: 'good' },
                    { range: '6-8 hrs', count: 18, percent: 25, color: 'blue', status: 'good' },
                    { range: '8-10 hrs', count: 8, percent: 11, color: 'amber', status: 'monitor' },
                    { range: '10-12 hrs', count: 2, percent: 3, color: 'red', status: 'warning' }
                  ].map((dist) => (
                    <div key={dist.range} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium text-gray-700">{dist.range}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                        <div
                          className={`bg-${dist.color}-500 h-full rounded-full flex items-center px-3`}
                          style={{ width: `${dist.percent}%` }}
                        >
                          <span className="text-xs font-bold text-white">{dist.count} crew</span>
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          dist.status === 'warning' ? 'bg-red-100 text-red-700' :
                          dist.status === 'monitor' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {dist.status === 'warning' ? '⚠️ Risk' :
                           dist.status === 'monitor' ? '👁️ Watch' :
                           '✓ Good'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span>⚠️ Approaching Limit: 2 crew between 10-12 hours</span>
                    <span>•</span>
                    <span className="text-green-600 font-medium">🚨 Over Limit: 0 crew (Excellent!)</span>
                  </div>
                </div>
              </div>

              {/* Crew at Risk */}
              <div className="bg-white rounded-lg border border-red-200">
                <div className="bg-red-600 text-white px-6 py-3 rounded-t-lg">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    ⚠️ CREW APPROACHING DUTY LIMITS
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {activeCrew.slice(0, 2).map((crew, idx) => (
                    <div key={crew.id} className={`border-l-4 rounded-lg p-4 ${
                      idx === 0 ? 'border-red-500 bg-red-50' : 'border-amber-500 bg-amber-50'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${
                              idx === 0 ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                            }`}>
                              {idx === 0 ? '🟡 HIGH PRIORITY' : '🟢 LOW PRIORITY'}
                            </span>
                            <span className="font-bold text-gray-900">{crew.name} ({crew.id})</span>
                          </div>
                          <div className="text-sm text-gray-700 space-y-1 mt-2">
                            <div>Current Duty: {idx === 0 ? '10.5' : '9.8'} / 12.0 hours ({idx === 0 ? '87.5%' : '82%'})</div>
                            <div>Status: On CM{200 + idx} ({idx === 0 ? 'delayed' : 'on time'})</div>
                            <div>Time Remaining: {idx === 0 ? '1.5' : '2.2'} hours</div>
                            <div className={idx === 0 ? 'text-red-700 font-medium' : 'text-green-700'}>
                              Risk Level: {idx === 0 ? 'HIGH' : 'LOW'}
                            </div>
                          </div>
                        </div>
                      </div>
                      {idx === 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                          <div className="text-sm font-semibold text-blue-900 mb-1">🤖 AI RECOMMENDATION:</div>
                          <div className="text-sm text-gray-700 mb-2">
                            Replace crew member with Reserve. Cost: $450 vs $2,500 violation penalty
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                              Replace Now
                            </button>
                            <button className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                              Monitor
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* FAA Part 117 Reference */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  📋 FAA PART 117 QUICK REFERENCE
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-bold text-blue-900 mb-2">Maximum Duty Periods:</div>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Unaugmented (2 pilots): 9-14 hours</li>
                      <li>• Augmented (3+ pilots): 13-19 hours</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-bold text-blue-900 mb-2">Minimum Rest Periods:</div>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Between duty: 10 hours</li>
                      <li>• Extended: 12-18 hours</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-bold text-blue-900 mb-2">Flight Time Limits:</div>
                    <ul className="space-y-1 text-gray-700">
                      <li>• 28 days: 100 hours</li>
                      <li>• 365 days: 1,000 hours</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CREW COMMUNICATIONS TAB */}
          {activeTab === 'communications' && (
            <div className="space-y-6">
              {/* Quick Send Panel */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  SEND MESSAGE TO CREW
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipients:</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">All Crew ({crewMembers.length})</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Active Crew ({activeCrew.length})</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Custom: Selected 3 crew</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message Type:</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded">
                      <option>Alert</option>
                      <option>Info</option>
                      <option>Urgent</option>
                      <option>Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method:</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Mobile App Push</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">SMS/Text</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Email</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="Flight CM230 - Crew Change Required"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      rows={4}
                      placeholder="Enter your message here (max 500 characters)..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Now
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Use Template
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Schedule
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Messages */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-600" />
                    SENT MESSAGES - TODAY
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    {
                      time: '14:47',
                      to: '4 crew',
                      subject: 'Flight CM460 Assignment',
                      status: '✓ Delivered',
                      color: 'green',
                      responses: '1 acknowledged'
                    },
                    {
                      time: '14:42',
                      to: '1 crew',
                      subject: 'Reserve Callout - CM230',
                      status: '✓ Delivered',
                      color: 'green',
                      responses: 'Accepted (12 min)'
                    },
                    {
                      time: '14:30',
                      to: '127 crew',
                      subject: "Tomorrow's Schedule Published",
                      status: '✓ Delivered',
                      color: 'green',
                      responses: '89% opened'
                    }
                  ].map((msg, idx) => (
                    <div key={idx} className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500 font-medium">{msg.time}</span>
                            <span className="font-bold text-gray-900">{msg.subject}</span>
                          </div>
                          <div className="text-sm text-gray-700">To: {msg.to}</div>
                        </div>
                        <span className={`px-2 py-1 bg-${msg.color}-100 text-${msg.color}-700 text-xs font-medium rounded`}>
                          {msg.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">Response: {msg.responses}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">MESSAGE DELIVERY & RESPONSE STATS (Last 24 Hours)</h3>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-900">47</div>
                    <div className="text-sm text-blue-700">Messages Sent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-900">99.6%</div>
                    <div className="text-sm text-green-700">Delivery Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-900">87%</div>
                    <div className="text-sm text-purple-700">Open Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-900">18 min</div>
                    <div className="text-sm text-amber-700">Avg Response Time</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
