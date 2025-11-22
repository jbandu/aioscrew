import { useState } from 'react';
import {
  ArrowLeft, Users, Phone, Clock, TrendingUp, Calendar,
  CheckCircle, AlertCircle, BarChart3, Download, Star,
  MessageSquare, UserCheck, Activity
} from 'lucide-react';
import { crewMembers } from '../../data/mockData';

interface ReservePoolViewProps {
  onBack: () => void;
}

export default function ReservePoolView({ onBack }: ReservePoolViewProps) {
  const [activeTab, setActiveTab] = useState('available');

  const tabs = [
    { id: 'available', label: 'Available Reserves' },
    { id: 'callout', label: 'Callout Management' },
    { id: 'analytics', label: 'Utilization Analytics' },
    { id: 'scheduling', label: 'Reserve Scheduling' }
  ];

  // Reserve crew data
  const reserveCrew = crewMembers.filter(c => c.base === 'PTY' || c.base === 'BUR').slice(0, 12);
  const availableNow = reserveCrew.slice(0, 3);
  const availableLater = reserveCrew.slice(3, 12);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Reserve Pool Management</h2>
            <div className="flex items-center gap-4 text-green-100">
              <span>Available Now: {availableNow.length} crew</span>
              <span>|</span>
              <span>Available Today: {reserveCrew.length} crew</span>
              <span>|</span>
              <span>Utilization: 58% this month</span>
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
                    ? 'border-b-2 border-green-600 text-green-600'
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
          {/* AVAILABLE RESERVES TAB */}
          {activeTab === 'available' && (
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-600 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4">RESERVE POOL STATUS - LIVE</h3>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-900">{availableNow.length}</div>
                    <div className="text-sm text-green-700">Available Now</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-900">{reserveCrew.length}</div>
                    <div className="text-sm text-blue-700">Available Today</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-900">3</div>
                    <div className="text-sm text-purple-700">Called Out</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-900">18 min</div>
                    <div className="text-sm text-amber-700">Avg Response</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="text-sm text-green-900">
                    <span className="font-bold">Utilization: 58%</span> this month (Target: 55-65%)
                    <span className="ml-4 text-green-700">✓ Within optimal range</span>
                  </div>
                </div>
              </div>

              {/* Ready Now Section */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-green-600 text-white px-6 py-3 rounded-t-lg flex items-center justify-between">
                  <h4 className="font-bold flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    🟢 READY NOW ({availableNow.length} crew)
                  </h4>
                  <button className="text-sm underline">View All</button>
                </div>
                <div className="p-6 space-y-4">
                  {availableNow.map((crew, idx) => (
                    <div key={crew.id} className="bg-white rounded-lg border-2 border-green-200 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-900">{idx + 1}. {crew.name.toUpperCase()}</div>
                            <div className="text-sm text-gray-600">{crew.role}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                Base: {crew.base}
                              </span>
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                Qual: {crew.qualification}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                          ✓ ON CALL
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600 text-xs mb-1">Seniority</div>
                            <div className="font-bold text-gray-900">#{crew.seniority} ({Math.floor(crew.seniority / 10)} years)</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs mb-1">Available Until</div>
                            <div className="font-bold text-gray-900">22:00 today</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs mb-1">Location</div>
                            <div className="font-bold text-gray-900">Home (15 min to airport)</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs mb-1">Duty Time</div>
                            <div className="font-bold text-green-600">0/12 hrs ✓</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="font-bold text-gray-900 mb-2">Recent Performance:</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Last callout: {idx === 0 ? '2 days ago' : idx === 1 ? '7 days ago' : '5 days ago'} (CM{230 + idx})</li>
                          <li>• Response time: {idx === 0 ? '15 minutes ⭐ Excellent' : idx === 1 ? '22 minutes (acceptable)' : '28 minutes (acceptable)'}</li>
                          <li>• Reliability: {idx === 0 ? '100%' : idx === 1 ? '88%' : '92%'} ({idx === 0 ? '12/12' : idx === 1 ? '7/8' : '11/12'} callouts accepted)</li>
                          <li>• Utilization: {idx === 0 ? '62%' : idx === 1 ? '45%' : '67%'} this month ({idx === 0 ? 6 : idx === 1 ? 4 : 8} callouts)</li>
                        </ul>
                      </div>

                      {idx === 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                          <div className="text-sm font-semibold text-purple-900 mb-1">🤖 AI Assessment:</div>
                          <div className="text-sm text-gray-700">
                            Top choice for urgent callouts - Fast response history, high reliability, well-rested (48 hrs since last duty)
                          </div>
                        </div>
                      )}
                      {idx === 1 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                          <div className="text-sm font-semibold text-amber-900 mb-1">🤖 AI Assessment:</div>
                          <div className="text-sm text-gray-700">
                            Good option, currently under-utilized - Available for remaining day, could use additional hours
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold flex items-center justify-center gap-2">
                          <Phone className="w-4 h-4" />
                          📞 Call Out
                        </button>
                        <button className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          💬 Send Message
                        </button>
                        <button className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                          <Calendar className="w-4 h-4" />
                          📅 View History
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Later Today */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-amber-600 text-white px-6 py-3 rounded-t-lg flex items-center justify-between">
                  <h4 className="font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    🟡 AVAILABLE LATER TODAY ({availableLater.length} crew)
                  </h4>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {availableLater.map((crew, idx) => (
                      <div key={crew.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-gray-900">{crew.name}</div>
                          <span className="text-xs px-2 py-1 bg-amber-200 text-amber-800 rounded">
                            {crew.role}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <div>Base: {crew.base}</div>
                          <div>Available: {14 + idx}:00 - 23:59</div>
                          <div>Utilization: {40 + idx}%</div>
                        </div>
                        <button className="w-full mt-3 px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm">
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">Quick Stats:</h4>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Ready Now:</div>
                    <div className="text-2xl font-bold text-green-700">{availableNow.length} crew</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Avg Response:</div>
                    <div className="text-2xl font-bold text-blue-700">18 min</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Utilization:</div>
                    <div className="text-2xl font-bold text-purple-700">58%</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Target:</div>
                    <div className="text-2xl font-bold text-gray-700">55-65%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CALLOUT MANAGEMENT TAB */}
          {activeTab === 'callout' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Reserve Callout Management</h3>
                  <p className="text-sm text-gray-600">Active and historical callout tracking</p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  New Callout
                </button>
              </div>

              {/* Active Callouts */}
              <div className="bg-white rounded-lg border border-red-200">
                <div className="bg-red-600 text-white px-6 py-3 rounded-t-lg">
                  <h4 className="font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    🔴 ACTIVE CALLOUTS (2 in progress)
                  </h4>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    {
                      id: 'C-2024-1156',
                      reserve: 'Wilson, Kevin',
                      role: 'Captain',
                      flight: 'CM230',
                      route: 'BUR → PDX',
                      called: '14:42',
                      response: '14:54 (12 min)',
                      status: 'accepted',
                      eta: '15:30'
                    },
                    {
                      id: 'C-2024-1157',
                      reserve: 'Park, Jennifer',
                      role: 'First Officer',
                      flight: 'CM460',
                      route: 'PTY → LAX',
                      called: '15:08',
                      response: 'Waiting...',
                      status: 'pending',
                      elapsed: '7 minutes'
                    }
                  ].map((callout) => (
                    <div key={callout.id} className={`border-l-4 rounded-lg p-4 ${
                      callout.status === 'accepted' ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${
                              callout.status === 'accepted' ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'
                            }`}>
                              {callout.status === 'accepted' ? 'IN PROGRESS' : 'PENDING RESPONSE'}
                            </span>
                            <span className="font-bold text-gray-900">Callout #{callout.id}</span>
                          </div>
                          <div className="text-sm text-gray-700 space-y-1 mt-2">
                            <div>Reserve: <span className="font-semibold">{callout.reserve}</span> ({callout.role})</div>
                            <div>Flight: <span className="font-semibold">{callout.flight}</span> ({callout.route}, Dept: 12:30)</div>
                            <div>Called: {callout.called} | Response: {callout.response}</div>
                            {callout.status === 'accepted' ? (
                              <div className="text-green-700 font-medium">Status: ✓ ACCEPTED - Positioning to airport</div>
                            ) : (
                              <div className="text-amber-700 font-medium">Status: ⏳ WAITING FOR RESPONSE (Target: &lt;15 min)</div>
                            )}
                            {callout.eta && <div>ETA at Gate: {callout.eta}</div>}
                          </div>
                        </div>
                      </div>
                      {callout.status === 'accepted' ? (
                        <div className="flex gap-2">
                          <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                            Track Progress
                          </button>
                          <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                            Contact Reserve
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button className="px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm">
                            Call Again
                          </button>
                          <button className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                            Try Backup
                          </button>
                          <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Callout History Today */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h4 className="font-bold text-gray-900">COMPLETED CALLOUTS - TODAY</h4>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { time: '10:30', reserve: 'Anderson, R', flight: 'CM100', response: '8 min', status: 'success' },
                    { time: '08:15', reserve: 'Miller, J', flight: 'CM105', response: '15 min', status: 'success' },
                    { time: '07:45', reserve: 'Davis, J', flight: 'CM90', response: '5 min (Declined)', status: 'declined' }
                  ].map((hist, idx) => (
                    <div key={idx} className={`border-l-4 rounded-lg p-3 ${
                      hist.status === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-900">
                          <span className="font-bold">{hist.time}</span>
                          <span className="mx-2">-</span>
                          <span>{hist.reserve}</span>
                          <span className="mx-2">|</span>
                          <span>{hist.flight}</span>
                          <span className="mx-2">|</span>
                          <span>Response: {hist.response}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          hist.status === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {hist.status === 'success' ? '✓ Accepted' : '✗ Declined'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Callout Performance Metrics */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">CALLOUT STATISTICS - THIS MONTH</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-purple-700">87</div>
                    <div className="text-sm text-gray-600">Total Callouts</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-700">94%</div>
                    <div className="text-sm text-gray-600">Accepted Rate</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-blue-700">18 min</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-amber-700">90%</div>
                    <div className="text-sm text-gray-600">First Try Success</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UTILIZATION ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Reserve Pool Utilization Analytics</h3>
                  <p className="text-sm text-gray-600">November 2024 performance metrics</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>

              {/* Utilization Dashboard */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-100 border-l-4 border-blue-600 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">RESERVE POOL UTILIZATION - NOVEMBER 2024</h3>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xs text-blue-700 mb-1">Pool Size</div>
                    <div className="text-3xl font-bold text-blue-900">12 crew</div>
                    <div className="text-xs text-blue-600 mt-1">9% of total crew</div>
                  </div>
                  <div>
                    <div className="text-xs text-green-700 mb-1">Avg Utilization</div>
                    <div className="text-3xl font-bold text-green-900">58%</div>
                    <div className="text-xs text-green-600 mt-1">Target: 55-65% ✓</div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-700 mb-1">Total Callouts</div>
                    <div className="text-3xl font-bold text-purple-900">87</div>
                    <div className="text-xs text-purple-600 mt-1">Fill rate: 100%</div>
                  </div>
                  <div>
                    <div className="text-xs text-amber-700 mb-1">Cost</div>
                    <div className="text-3xl font-bold text-amber-900">$47.5K</div>
                    <div className="text-xs text-amber-600 mt-1">Under budget</div>
                  </div>
                </div>
              </div>

              {/* Individual Utilization */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">INDIVIDUAL RESERVE UTILIZATION</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Wilson, K', util: 78, callouts: 12, status: 'over' },
                    { name: 'Anderson, R', util: 72, callouts: 11, status: 'optimal' },
                    { name: 'Taylor, M', util: 67, callouts: 10, status: 'optimal' },
                    { name: 'Moore, T', util: 65, callouts: 10, status: 'optimal' },
                    { name: 'Miller, J', util: 58, callouts: 9, status: 'optimal' },
                    { name: 'Park, J', util: 45, callouts: 7, status: 'under' },
                    { name: 'Davis, J', util: 38, callouts: 6, status: 'under' }
                  ].map((crew) => (
                    <div key={crew.name} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-700">{crew.name}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                        <div
                          className={`h-full rounded-full flex items-center justify-between px-3 ${
                            crew.status === 'over' ? 'bg-red-500' :
                            crew.status === 'under' ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${crew.util}%` }}
                        >
                          <span className="text-xs font-bold text-white">{crew.util}%</span>
                          <span className="text-xs text-white">{crew.callouts} callouts</span>
                        </div>
                      </div>
                      <div className="w-28 text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          crew.status === 'over' ? 'bg-red-100 text-red-700' :
                          crew.status === 'under' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {crew.status === 'over' ? 'Over target' :
                           crew.status === 'under' ? 'Under target' :
                           '✓ Optimal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span>Optimal Range (55-65%): 7 crew</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded" />
                    <span>Over-utilized (&gt;65%): 3 crew</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-500 rounded" />
                    <span>Under-utilized (&lt;55%): 2 crew</span>
                  </div>
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">RESERVE POOL COST BREAKDOWN</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-bold text-gray-800 mb-3">Fixed Costs (Monthly):</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reserve Guarantee Pay:</span>
                        <span className="font-semibold">$35,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Benefits & Insurance:</span>
                        <span className="font-semibold">$4,200</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="font-bold text-gray-900">Subtotal:</span>
                        <span className="font-bold text-gray-900">$39,200</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 mb-3">Variable Costs (Callouts):</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Callout Premium:</span>
                        <span className="font-semibold">$8,300</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Positioning/Deadheads:</span>
                        <span className="font-semibold">$2,450</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hotel/Per Diem:</span>
                        <span className="font-semibold">$1,550</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="font-bold text-gray-900">Subtotal:</span>
                        <span className="font-bold text-gray-900">$12,300</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total This Month:</span>
                    <span className="text-2xl font-bold text-blue-600">$51,500</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-600">Budget:</span>
                    <span className="text-gray-700">$55,000</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-green-700 font-medium">Variance:</span>
                    <span className="text-green-700 font-bold">-$3,500 (6% under budget) ✓</span>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🤖 RESERVE POOL OPTIMIZATION
                </h4>
                <div className="space-y-4">
                  {[
                    {
                      title: '1. Balance Utilization',
                      detail: 'Wilson over-utilized (78% vs 65% target), Park & Davis under-utilized',
                      recommendation: 'Rotate callouts more evenly',
                      benefit: 'Improve crew satisfaction by 12%'
                    },
                    {
                      title: '2. Pool Size Optimization',
                      detail: 'Current: 12 crew (9%). Callout frequency trending up 15%',
                      recommendation: 'Add 2 reserves for winter season',
                      benefit: 'Cost: +$5,834/mo | Maintain 100% fill rate'
                    },
                    {
                      title: '3. Reduce Response Time',
                      detail: '22% of callouts take >15 minutes',
                      recommendation: 'Mandate mobile app for reserves',
                      benefit: 'Reduce avg response by 4 minutes'
                    }
                  ].map((rec, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="font-bold text-gray-900 mb-1">{rec.title}</div>
                      <div className="text-sm text-gray-700 mb-2">{rec.detail}</div>
                      <div className="text-sm">
                        <span className="text-blue-900 font-medium">Recommendation:</span> {rec.recommendation}
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        <span className="font-medium">Potential:</span> {rec.benefit}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                    Apply Recommendations
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                    Run Simulation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RESERVE SCHEDULING TAB */}
          {activeTab === 'scheduling' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Reserve Duty Scheduling - December 2024</h3>
                  <p className="text-sm text-gray-600">Manage reserve crew schedules and assignments</p>
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                    <option>December 2024</option>
                    <option>January 2025</option>
                  </select>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                    🤖 Auto-generate
                  </button>
                </div>
              </div>

              {/* Calendar View Placeholder */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">RESERVE DUTY SCHEDULE</h4>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Interactive Monthly Calendar</p>
                  <p className="text-sm text-gray-500">
                    Drag-and-drop reserve scheduling for December 2024
                  </p>
                  <div className="mt-4 text-sm text-gray-600">
                    Legend: W = Wilson, P = Park, T = Taylor, A = Anderson...
                  </div>
                </div>
              </div>

              {/* Individual Reserve Schedule */}
              <div className="grid md:grid-cols-2 gap-6">
                {reserveCrew.slice(0, 4).map((crew) => (
                  <div key={crew.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-gray-900">{crew.name}</div>
                      <button className="text-sm text-blue-600 hover:text-blue-700">Edit</button>
                    </div>
                    <div className="text-sm text-gray-700 space-y-2">
                      <div className="flex justify-between">
                        <span>Reserve Days:</span>
                        <span className="font-semibold">18</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Days Off:</span>
                        <span className="font-semibold">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projected Callouts:</span>
                        <span className="font-semibold">8-10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Guaranteed Pay:</span>
                        <span className="font-semibold">$2,917</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="font-bold">Estimated Total:</span>
                        <span className="font-bold text-green-600">$3,700</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reserve Rules */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  ⚙️ RESERVE SCHEDULING RULES
                </h4>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="font-bold text-gray-800 mb-2">Duty Period:</div>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Standard duty: 08:00 - 22:00 (14 hours)</li>
                      <li>• Alternate shift: 14:00 - 23:59 (10 hours)</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 mb-2">Rest Requirements:</div>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Minimum between reserves: 10 hours</li>
                      <li>• Days off per month: 12 minimum</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 mb-2">Fair Distribution:</div>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Max days per reserve: 20</li>
                      <li>• Min days per reserve: 15</li>
                      <li>• Target variance: &lt;10%</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 mb-2">Holidays:</div>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Double pay for holiday reserves</li>
                      <li>• Seniority-based selection</li>
                      <li>• Rotate fairly</li>
                    </ul>
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
