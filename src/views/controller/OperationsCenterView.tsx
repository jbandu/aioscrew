import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, AlertCircle, CheckCircle, Clock, MapPin, Plane,
  Users, Phone, MessageSquare, RefreshCw, Settings, Bell,
  TrendingUp, Activity, Radio, Wifi, WifiOff
} from 'lucide-react';
import { trips, crewMembers, alerts } from '../../data/mockData';
import { useRealTimeUpdates, useDisruptionAlerts, formatTimeSince } from '../../hooks/useRealTimeUpdates';
import { controllerService } from '../../services/controller-service';
import { aiControllerAgent } from '../../services/ai-controller-agent';

interface OperationsCenterViewProps {
  onBack: () => void;
}

export default function OperationsCenterView({ onBack }: OperationsCenterViewProps) {
  const [activeTab, setActiveTab] = useState('live-dashboard');
  const [flightStatuses, setFlightStatuses] = useState<any[]>([]);
  const [crewStatuses, setCrewStatuses] = useState<any[]>([]);
  const [disruptions, setDisruptions] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'live-dashboard', label: 'Live Dashboard' },
    { id: 'flight-status', label: 'Flight Status Board' },
    { id: 'crew-status', label: 'Crew Status Board' },
    { id: 'activity-timeline', label: 'Activity Timeline' }
  ];

  // Real-time data refresh
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [flights, crew, disruptionsData] = await Promise.all([
        controllerService.getFlightStatuses({ timeRange: 'next-12-hours' }),
        controllerService.getCrewStatuses({ dutyTimeWarning: true }),
        controllerService.getDisruptions(false)
      ]);

      setFlightStatuses(flights);
      setCrewStatuses(crew);
      setDisruptions(disruptionsData);

      // Get AI recommendations for active disruptions
      if (disruptionsData.length > 0) {
        const recommendations = await Promise.all(
          disruptionsData.slice(0, 3).map(d =>
            aiControllerAgent.analyzeDisruption(d.id, d)
          )
        );
        setAiRecommendations(recommendations);
      }
    } catch (error) {
      console.error('Error fetching operations data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use real-time updates hook
  const { isConnected, timeSinceUpdate, manualRefresh } = useRealTimeUpdates({
    refreshInterval: 10000, // 10 seconds
    enableWebSocket: true,
    onRefresh: fetchData
  });

  // Subscribe to disruption alerts
  useDisruptionAlerts((alert) => {
    console.log('New disruption alert:', alert);
    // Trigger data refresh when new alert arrives
    fetchData();
  });

  // Calculate real-time statistics from fetched data
  const operatingFlights = flightStatuses.filter(f =>
    f.status === 'scheduled' || f.status === 'boarding' || f.status === 'in-flight'
  ).length;
  const delayedFlights = flightStatuses.filter(f => f.status === 'delayed').length;
  const cancelledFlights = flightStatuses.filter(f => f.status === 'cancelled').length;
  const activeAlerts = disruptions.filter(d => d.status === 'active');
  const activeCrew = crewStatuses.length;
  const inFlightCrew = crewStatuses.filter(c => c.status === 'in-flight').length;
  const onReserve = crewStatuses.filter(c => c.status === 'reserve').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-red-100 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Operations Control Center</h2>
            <div className="flex items-center gap-4 text-red-100">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-400" />
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>LIVE • Updated {formatTimeSince(timeSinceUpdate)}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-amber-400" />
                    <span>Polling Mode • Updated {formatTimeSince(timeSinceUpdate)}</span>
                  </>
                )}
              </div>
              <span>|</span>
              <span>{new Date().toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => manualRefresh()}
              disabled={isLoading}
              className="px-4 py-2 bg-red-800 hover:bg-red-900 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="px-4 py-2 bg-red-800 hover:bg-red-900 rounded-lg flex items-center gap-2 transition-colors">
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold">
                  {activeAlerts.length}
                </span>
              )}
              Alerts
            </button>
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
                    ? 'border-b-2 border-red-600 text-red-600'
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
          {/* LIVE DASHBOARD TAB */}
          {activeTab === 'live-dashboard' && (
            <div className="space-y-6">
              {/* Live Status Bar */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-red-600 animate-pulse' : 'bg-amber-600'}`} />
                    <span className="text-lg font-bold text-red-900">
                      {isConnected ? 'LIVE' : 'POLLING'} • Updated {formatTimeSince(timeSinceUpdate)}
                    </span>
                  </div>
                  <div className="text-sm text-red-800">
                    <span className="font-bold">{operatingFlights} FLIGHTS OPERATING</span>
                    <span className="mx-2">•</span>
                    <span className="font-bold">{delayedFlights} DELAYS</span>
                    <span className="mx-2">•</span>
                    <span className="font-bold">{cancelledFlights} CANCELLATION</span>
                    <span className="mx-2">•</span>
                    <span className="font-bold">{activeAlerts.length} ALERTS</span>
                  </div>
                </div>
              </div>

              {/* Critical Alerts Panel */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-red-600 text-white px-6 py-3 rounded-t-lg">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    CRITICAL ALERTS ({activeAlerts.filter(a => a.type === 'critical').length})
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {activeAlerts.filter(a => a.type === 'critical').map((alert) => (
                    <div key={alert.id} className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">URGENT</span>
                            <span className="font-bold text-gray-900">{alert.message}</span>
                          </div>
                          <div className="text-sm text-gray-700 mt-2 space-y-1">
                            <div>├─ Status: {alert.type.toUpperCase()}</div>
                            <div>├─ Time: {alert.timestamp.toLocaleTimeString()}</div>
                            <div>└─ Action Required: Immediate response needed</div>
                          </div>
                        </div>
                        <div className="text-xs text-red-600 font-medium">
                          ⏱️ {Math.floor(Math.random() * 30)} min remaining
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="text-sm font-semibold text-blue-900 mb-1">🤖 AI RECOMMENDATION</div>
                        <div className="text-sm text-gray-700">
                          Reassign affected crew to next available flight. Estimated cost: $1,200 vs $5,500 for cancellation.
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium">
                          Accept AI Plan
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm">
                          Manual Override
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm">
                          Monitor
                        </button>
                      </div>
                    </div>
                  ))}
                  {activeAlerts.filter(a => a.type === 'warning').slice(0, 2).map((alert) => (
                    <div key={alert.id} className="border-l-4 border-amber-500 bg-amber-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded">HIGH</span>
                            <span className="font-bold text-gray-900">{alert.message}</span>
                          </div>
                          <div className="text-sm text-gray-700 mt-2">
                            └─ Monitoring required
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-sm">
                          View Options
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow border-l-4 border-blue-500 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">ACTIVE CREW</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{activeCrew}</div>
                  <div className="text-sm text-gray-600 mt-1">✓ Normal</div>
                </div>

                <div className="bg-white rounded-lg shadow border-l-4 border-green-500 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Plane className="w-8 h-8 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">IN FLIGHT</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{inFlightCrew}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {Math.floor(inFlightCrew / 2)} Departing
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border-l-4 border-purple-500 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">ON RESERVE</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{onReserve}</div>
                  <div className="text-sm text-gray-600 mt-1">✓ Available</div>
                </div>

                <div className="bg-white rounded-lg shadow border-l-4 border-red-500 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                    <span className="text-xs text-red-600 font-medium">DISRUPTIONS</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{delayedFlights + cancelledFlights}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    🚨 {cancelledFlights} Critical
                  </div>
                </div>
              </div>

              {/* Live Map Placeholder */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  🗺️ LIVE CREW TRACKING
                </h3>
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Radio className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600 font-medium">Real-time crew position tracking</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Interactive map showing {activeCrew} active crew members
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        In-Flight ({inFlightCrew})
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        Layover (24)
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        Positioning (4)
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        Disrupted ({cancelledFlights})
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      📊 ACTIVITY FEED (Last 30 minutes)
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {[
                      { time: '14:47', icon: CheckCircle, color: 'green', text: 'CM450 crew reassigned to CM460', detail: 'AI plan accepted by Rodriguez (Controller)' },
                      { time: '14:42', icon: Phone, color: 'blue', text: 'Reserve callout: Wilson, K for CM230', detail: 'Response time: 12 minutes (excellent)' },
                      { time: '14:38', icon: AlertCircle, color: 'amber', text: 'CM230 delay increased to 2 hours', detail: 'Auto-alert sent to controller' },
                      { time: '14:35', icon: Plane, color: 'green', text: 'CM105 landed on time at LAX', detail: '4 crew released to hotel' },
                      { time: '14:30', icon: AlertCircle, color: 'red', text: 'CM450 cancelled - mechanical issue', detail: 'Crew impact assessment started' }
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                        <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                          <activity.icon className={`w-4 h-4 text-${activity.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium">{activity.time}</span>
                            <span className="text-sm font-semibold text-gray-900">{activity.text}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{activity.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View Full History →
                    </button>
                  </div>
                </div>

                {/* AI Assistant Panel */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow border border-blue-200">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      🤖 AI Assistant
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Current Analysis:</div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Monitoring {delayedFlights + cancelledFlights} active situations</li>
                        <li>• 3 recommendations pending review</li>
                        <li>• 0 critical decisions needed</li>
                      </ul>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm font-semibold text-gray-900 mb-2">Recent Recommendations:</div>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>Accepted: CM450 crew reassignment (saves $1,200)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-amber-600 mt-0.5" />
                          <span>Pending: Replace CM230 crew with reserves</span>
                        </li>
                      </ul>
                    </div>

                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      Ask AI a Question
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions Toolbar */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Call Reserve
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Create Alert
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      View Reports
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Refresh Now
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FLIGHT STATUS BOARD TAB */}
          {activeTab === 'flight-status' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Flight Status Board</h3>
                  <p className="text-sm text-gray-600">Real-time flight operations tracking</p>
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                    <option>Next 12 Hours</option>
                    <option>Next 4 Hours</option>
                    <option>Today</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                    <option>All Bases</option>
                    <option>BUR</option>
                    <option>PTY</option>
                    <option>LAX</option>
                  </select>
                </div>
              </div>

              {/* Status Overview */}
              <div className="grid md:grid-cols-5 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{operatingFlights}</div>
                  <div className="text-sm text-green-600">On Time</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-700">{delayedFlights}</div>
                  <div className="text-sm text-amber-600">Delayed</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-700">{cancelledFlights}</div>
                  <div className="text-sm text-red-600">Cancelled</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">{inFlightCrew / 4}</div>
                  <div className="text-sm text-blue-600">Boarding</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-700">{activeAlerts.length}</div>
                  <div className="text-sm text-purple-600">Watch List</div>
                </div>
              </div>

              {/* Flight List */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Flight</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Route</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Departure</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Arrival</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Crew</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {trips.slice(0, 10).map((trip, idx) => (
                      <tr key={trip.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Plane className={`w-4 h-4 ${
                              trip.status === 'cancelled' ? 'text-red-600' :
                              trip.status === 'delayed' ? 'text-amber-600' :
                              'text-green-600'
                            }`} />
                            <span className="font-semibold text-gray-900">{trip.id || `CM${100 + idx}`}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{trip.route}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {trip.departure_time || '08:30'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {trip.arrival_time || '13:15'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            trip.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            trip.status === 'delayed' ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {trip.status === 'cancelled' ? '🔴 Cancelled' :
                             trip.status === 'delayed' ? '🟡 Delayed' :
                             '🟢 On Time'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {trip.captain_id ? crewMembers.find(c => c.id === trip.captain_id)?.name.split(' ')[0] + ' +3' : 'Unassigned'}
                        </td>
                        <td className="px-4 py-3">
                          <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CREW STATUS BOARD TAB */}
          {activeTab === 'crew-status' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Crew Status Board</h3>
                  <p className="text-sm text-gray-600">Real-time crew availability and location</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <div className="text-sm text-blue-900">
                    <span className="font-bold">Total Crew: {crewMembers.length}</span>
                    <span className="mx-2">|</span>
                    <span>Active: {activeCrew}</span>
                    <span className="mx-2">|</span>
                    <span>Reserve: {onReserve}</span>
                    <span className="mx-2">|</span>
                    <span>Off Duty: {crewMembers.length - activeCrew}</span>
                  </div>
                </div>
              </div>

              {/* Status Category Tabs */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: `All (${crewMembers.length})`, color: 'gray' },
                  { label: `🛫 In-Flight (${inFlightCrew})`, color: 'blue' },
                  { label: `🟢 Available (${onReserve})`, color: 'green' },
                  { label: `🏨 Layover (24)`, color: 'purple' },
                  { label: `🏠 Home (${crewMembers.length - activeCrew})`, color: 'gray' },
                  { label: `⚠️ Watch (${activeAlerts.length})`, color: 'amber' }
                ].map((tab, idx) => (
                  <button
                    key={idx}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                      idx === 0
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Crew List */}
              <div className="space-y-3">
                <div className="bg-gray-50 px-4 py-2 rounded-lg">
                  <h4 className="font-bold text-gray-900">🛫 IN-FLIGHT CREW ({inFlightCrew})</h4>
                </div>
                {crewMembers.slice(0, 4).map((crew) => (
                  <div key={crew.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{crew.name}</div>
                          <div className="text-sm text-gray-600">{crew.role}</div>
                          <div className="text-xs text-gray-500">ID: {crew.id}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          ✓ Active
                        </span>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-600 text-xs">Flight</div>
                          <div className="font-semibold text-gray-900">CM{100 + parseInt(crew.id.slice(2))}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-xs">Route</div>
                          <div className="font-semibold text-gray-900">BUR → PTY</div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-xs">ETA</div>
                          <div className="font-semibold text-gray-900">13:15 (45 min)</div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-xs">Duty Time</div>
                          <div className="font-semibold text-gray-900">6.5 / 12.0 hrs</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm">
                        Track Flight
                      </button>
                      <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm">
                        Contact Crew
                      </button>
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVITY TIMELINE TAB */}
          {activeTab === 'activity-timeline' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Crew Operations Activity Log</h3>
                  <p className="text-sm text-gray-600">Chronological log of all operations events</p>
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                    Export Log
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-6">
                  <div>
                    <div className="bg-gray-900 text-white px-4 py-2 rounded-t-lg font-bold text-sm">
                      TODAY - {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="border-l-2 border-gray-300 ml-4 mt-4 space-y-6">
                      {[
                        {
                          time: '14:47',
                          type: 'success',
                          title: 'CREW REASSIGNMENT COMPLETED',
                          details: [
                            'Flight: CM450 (Cancelled)',
                            'Action: 4 crew reassigned to CM460',
                            'Crew: Martinez, Smith, Lee, Chen',
                            'Method: AI Recommendation (accepted by Rodriguez)',
                            'Impact: Saved $1,200 vs hotel + repositioning',
                            'Status: ✓ Confirmed, crew notified'
                          ]
                        },
                        {
                          time: '14:42',
                          type: 'info',
                          title: 'RESERVE CALLOUT SUCCESSFUL',
                          details: [
                            'Flight: CM230 (Delayed flight needs crew replacement)',
                            'Reserve: Wilson, Kevin (Captain)',
                            'Called by: Rodriguez (Controller)',
                            'Response Time: 12 minutes (Target: <20 min)',
                            'Status: ✓ Accepted, positioning to airport'
                          ]
                        },
                        {
                          time: '14:38',
                          type: 'warning',
                          title: 'DELAY EXTENSION ALERT',
                          details: [
                            'Flight: CM230 (BUR → PDX)',
                            'Original Delay: 1 hour → New Delay: 2 hours',
                            'Reason: Weather deteriorating at PDX',
                            'Crew Impact: Wilson approaching duty limit',
                            'AI Alert: Generated automatically',
                            'Action Taken: Reserve callout initiated'
                          ]
                        },
                        {
                          time: '14:35',
                          type: 'success',
                          title: 'FLIGHT ARRIVAL',
                          details: [
                            'Flight: CM105 (PTY → BOG)',
                            'Status: ✓ Landed on time',
                            'Crew: Rodriguez, Smith, Taylor, Lee (4 crew)',
                            'Hotel: Confirmed (Hilton Bogota)',
                            'Notes: No issues, crew released to hotel'
                          ]
                        },
                        {
                          time: '14:30',
                          type: 'critical',
                          title: 'FLIGHT CANCELLATION',
                          details: [
                            'Flight: CM450 (PTY → LAX)',
                            'Reason: 🔧 Mechanical - Hydraulic system issue',
                            'Crew Affected: 4 crew (2 pilots, 2 FAs)',
                            'Passenger Count: 142 (being rebooked)',
                            'AI Analysis: Started immediately',
                            'Status: Recovery plan in progress'
                          ]
                        }
                      ].map((event, idx) => (
                        <div key={idx} className="relative pl-8 pb-6">
                          <div className={`absolute left-0 -ml-3 w-6 h-6 rounded-full border-4 border-white ${
                            event.type === 'critical' ? 'bg-red-600' :
                            event.type === 'warning' ? 'bg-amber-500' :
                            event.type === 'success' ? 'bg-green-600' :
                            'bg-blue-600'
                          }`} />
                          <div className={`border-l-4 rounded-lg p-4 ${
                            event.type === 'critical' ? 'border-red-500 bg-red-50' :
                            event.type === 'warning' ? 'border-amber-500 bg-amber-50' :
                            event.type === 'success' ? 'border-green-500 bg-green-50' :
                            'border-blue-500 bg-blue-50'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-600 font-medium">⏰ {event.time}</span>
                              <span className={`px-2 py-1 text-xs font-bold rounded ${
                                event.type === 'critical' ? 'bg-red-600 text-white' :
                                event.type === 'warning' ? 'bg-amber-600 text-white' :
                                event.type === 'success' ? 'bg-green-600 text-white' :
                                'bg-blue-600 text-white'
                              }`}>
                                {event.title}
                              </span>
                            </div>
                            <div className="text-sm text-gray-800 space-y-1">
                              {event.details.map((detail, detailIdx) => (
                                <div key={detailIdx} className="flex items-start gap-2">
                                  <span className="text-gray-600">
                                    {detailIdx === event.details.length - 1 ? '└─' : '├─'}
                                  </span>
                                  <span>{detail}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
