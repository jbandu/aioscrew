import { useState } from 'react';
import {
  ArrowLeft, AlertCircle, Plane, TrendingUp, Clock,
  CheckCircle, FileText, Lightbulb, Download, Filter,
  Phone, Users, DollarSign, Activity, BookOpen
} from 'lucide-react';
import { trips, crewMembers, alerts } from '../../data/mockData';

interface DisruptionsViewProps {
  onBack: () => void;
}

export default function DisruptionsView({ onBack }: DisruptionsViewProps) {
  const [activeTab, setActiveTab] = useState('active-incidents');

  const tabs = [
    { id: 'active-incidents', label: 'Active Incidents' },
    { id: 'recovery', label: 'Recovery Planning' },
    { id: 'history', label: 'Disruption History' },
    { id: 'contingency', label: 'Contingency Plans' }
  ];

  const activeDisruptions = trips.filter(t => t.status === 'cancelled' || t.status === 'delayed');
  const criticalAlerts = alerts.filter(a => !a.resolved && a.type === 'critical');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-amber-100 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Disruption Management</h2>
            <div className="flex items-center gap-4 text-amber-100">
              <span>Critical: {criticalAlerts.length}</span>
              <span>|</span>
              <span>Active: {activeDisruptions.length} disruptions</span>
              <span>|</span>
              <span>Crew Affected: {activeDisruptions.length * 4}</span>
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
                    ? 'border-b-2 border-amber-600 text-amber-600'
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
          {/* ACTIVE INCIDENTS TAB */}
          {activeTab === 'active-incidents' && (
            <div className="space-y-6">
              {/* Incident Overview */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-600 rounded-lg p-6">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  🚨 ACTIVE DISRUPTIONS - COMMAND CENTER
                </h3>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-red-900">{criticalAlerts.length}</div>
                    <div className="text-sm text-red-700">Critical</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-900">{activeDisruptions.length}</div>
                    <div className="text-sm text-amber-700">High Priority</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-900">{activeDisruptions.length * 4}</div>
                    <div className="text-sm text-blue-700">Crew Affected</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-900">$27.5K</div>
                    <div className="text-sm text-purple-700">Est. Impact</div>
                  </div>
                </div>
              </div>

              {/* Incident Cards */}
              <div className="space-y-4">
                {activeDisruptions.slice(0, 3).map((disruption, idx) => (
                  <div key={disruption.id} className={`bg-white rounded-lg border-2 ${
                    idx === 0 ? 'border-red-500' : 'border-amber-500'
                  } overflow-hidden`}>
                    <div className={`${
                      idx === 0 ? 'bg-red-600' : 'bg-amber-600'
                    } text-white px-6 py-3`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          {idx === 0 ? '🚨 CRITICAL INCIDENT' : '⚠️ HIGH PRIORITY'} #D-2024-{89 + idx}
                        </h4>
                        <span className="text-sm">Duration: {45 + idx * 15} minutes</span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <div className="text-xl font-bold text-gray-900 mb-2">
                          FLIGHT {disruption.id || `CM${450 + idx}`} - {
                            idx === 0 ? 'CANCELLED - MECHANICAL ISSUE' :
                            idx === 1 ? '2 HOUR DELAY - WEATHER' :
                            'TRAINING CONFLICT'
                          }
                        </div>
                        <div className="text-sm text-gray-600">
                          Status: <span className={`font-semibold ${
                            idx === 0 ? 'text-red-600' : 'text-amber-600'
                          }`}>🔴 Active</span>
                          <span className="mx-2">|</span>
                          Opened: {14 - idx}:30
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-bold text-gray-900 mb-2">FLIGHT DETAILS:</h5>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Route:</span>
                            <span className="ml-2 font-semibold">{disruption.route || 'PTY → LAX'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Aircraft:</span>
                            <span className="ml-2 font-semibold">737-800 (N825CP)</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Original Departure:</span>
                            <span className="ml-2 font-semibold">14:00</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Passengers:</span>
                            <span className="ml-2 font-semibold">142</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-bold text-blue-900 mb-2">CREW IMPACT:</h5>
                        <div className="text-sm text-gray-700 mb-2">
                          <span className="font-semibold">{4} crew affected:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {crewMembers.slice(0, 4).map((crew) => (
                            <div key={crew.id} className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                                {crew.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-semibold">{crew.name}</div>
                                <div className="text-xs text-gray-600">{crew.role}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200 text-sm">
                          <div className="text-gray-700">
                            Current Status: <span className="font-semibold">At {disruption.route?.split(' → ')[0] || 'PTY'} airport, waiting for assignment</span>
                          </div>
                          <div className="text-gray-700">
                            Duty Time: <span className="font-semibold text-green-600">2.5 hours used (plenty remaining) ✓</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h5 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          🤖 AI RECOVERY RECOMMENDATIONS (3 options)
                        </h5>

                        {/* Option 1 */}
                        <div className="bg-white rounded-lg p-4 mb-3 border-2 border-green-400">
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-bold text-green-900">
                              ✅ OPTION 1: {idx === 0 ? 'ASSIGN TO CM460' : 'REPLACE CAPTAIN'} (Recommended)
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                              95% Confidence
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 space-y-1 mb-2">
                            <div>├─ {idx === 0 ? 'Flight: PTY → LAX, Departure: 16:30 (2hr 30min wait)' : 'Replace with Reserve Park, J (available in 45 min)'}</div>
                            <div>├─ Impact: {idx === 0 ? 'All 4 crew can operate together' : 'Prevents duty time violation'}</div>
                            <div>├─ Cost: ${idx === 0 ? '1,260' : '450'}</div>
                            <div>└─ Status: {idx === 0 ? 'Crew remains at airport' : 'Low risk, high success rate'}</div>
                          </div>
                          <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold">
                            ✓ Accept This Plan
                          </button>
                        </div>

                        {/* Option 2 & 3 collapsed */}
                        <div className="space-y-2">
                          <button className="w-full px-4 py-2 border border-gray-300 text-left rounded hover:bg-gray-50 text-sm flex items-center justify-between">
                            <span>⚠️ OPTION 2: Alternative routing (72% confidence)</span>
                            <span className="text-xs text-gray-500">Cost: ${idx === 0 ? '3,400' : '2,100'}</span>
                          </button>
                          <button className="w-full px-4 py-2 border border-gray-300 text-left rounded hover:bg-gray-50 text-sm flex items-center justify-between">
                            <span>⚠️ OPTION 3: Hotel + next day (45% confidence)</span>
                            <span className="text-xs text-gray-500">Cost: ${idx === 0 ? '8,500' : '5,200'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-amber-900 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            DECISION REQUIRED BY: 15:15
                          </div>
                          <span className="text-sm text-amber-700 font-medium">
                            ⏱️ {30 - idx * 5} minutes remaining
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium">
                          Accept AI Plan
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                          Custom Plan
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Call Crew
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                          Monitor
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECOVERY PLANNING TAB */}
          {activeTab === 'recovery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Disruption Recovery Planner</h3>
                  <p className="text-sm text-gray-600">AI-powered recovery plan builder</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  New Recovery Plan
                </button>
              </div>

              {/* Recovery Plan Builder */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-purple-600 text-white px-6 py-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    🔧 DISRUPTION RECOVERY PLANNER
                  </h4>
                </div>

                <div className="p-6 space-y-6">
                  {/* Step 1: Define Disruption */}
                  <div>
                    <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      STEP 1: DEFINE DISRUPTION
                    </h5>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Disruption Type:
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded">
                            <option>Cancellation</option>
                            <option>Delay &gt;2 hours</option>
                            <option>Mechanical Issue</option>
                            <option>Weather Event</option>
                            <option>Crew Issue</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Flight:
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            placeholder="CM450 - PTY → LAX"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason:
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            placeholder="Mechanical - Hydraulic system"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration Estimate:
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded">
                            <option>1-2 hours</option>
                            <option>2-4 hours</option>
                            <option>4+ hours</option>
                            <option>Indefinite</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Crew Impact */}
                  <div>
                    <h5 className="font-bold text-gray-900 mb-3">STEP 2: CREW IMPACT ANALYSIS</h5>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-700 mb-2">
                        Affected Crew: <span className="font-semibold">4 crew selected</span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-700">
                        <div>├─ Martinez, Sarah (Capt) - PTY, 2.5/12 hrs duty ✓</div>
                        <div>├─ Smith, John (FO) - PTY, 2.5/12 hrs duty ✓</div>
                        <div>├─ Lee, Patricia (SFA) - PTY, 2.5/12 hrs duty ✓</div>
                        <div>└─ Chen, Lisa (FA) - PTY, 2.5/12 hrs duty ✓</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200 text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-green-700 font-medium">Crew Status: ✓ All legal for reassignment</span>
                          <span className="text-gray-600">Downstream Impact: 0 additional flights affected</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: AI Options */}
                  <div>
                    <h5 className="font-bold text-gray-900 mb-3">STEP 3: AI RECOVERY OPTIONS</h5>
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-bold flex items-center justify-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      🤖 Generate AI Recommendations
                    </button>
                    <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      AI will analyze:
                      <ul className="mt-2 space-y-1 ml-4">
                        <li>• 127 crew members</li>
                        <li>• 45 flights today</li>
                        <li>• 12 reserve crew</li>
                        <li>• Duty time regulations</li>
                        <li>• Cost optimization</li>
                        <li>• Historical patterns</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                      Generate Recovery Plan
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Save as Draft
                    </button>
                  </div>
                </div>
              </div>

              {/* Scenario Simulator */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🎮 DISRUPTION SCENARIO SIMULATOR
                </h4>
                <p className="text-sm text-gray-700 mb-4">
                  Test recovery plans before executing to validate feasibility and identify risks.
                </p>
                <div className="bg-white rounded-lg p-4 text-sm">
                  <div className="font-bold text-gray-900 mb-2">Simulation Results:</div>
                  <ul className="space-y-1 text-gray-700">
                    <li>✓ Crew legal: Yes</li>
                    <li>✓ Aircraft available: Yes (different aircraft, same type)</li>
                    <li>✓ Gate available: Yes (B15 at PTY)</li>
                    <li>✓ No downstream conflicts</li>
                    <li>⚠️ Crew must wait 2.5 hours at airport</li>
                    <li>✓ Cost within acceptable range</li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Risk Assessment: <span className="text-green-600">LOW</span></span>
                      <span className="font-bold">Success Probability: <span className="text-green-600">95%</span></span>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Run Simulation
                </button>
              </div>
            </div>
          )}

          {/* DISRUPTION HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Disruption History</h3>
                  <p className="text-sm text-gray-600">Last 30 days - Analysis and trends</p>
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-sm">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-4">DISRUPTION SUMMARY (Last 30 Days)</h4>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">47</div>
                    <div className="text-sm text-gray-600">Total Disruptions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-900">2.3 hrs</div>
                    <div className="text-sm text-gray-600">Avg Resolution Time</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-900">127</div>
                    <div className="text-sm text-gray-600">Crew Affected (total)</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-900">$142.5K</div>
                    <div className="text-sm text-gray-600">Total Cost Impact</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-300 grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Cancellations:</span>
                    <span className="ml-2 font-bold">8 (17%)</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Delays &gt;1hr:</span>
                    <span className="ml-2 font-bold">23 (49%)</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mechanical:</span>
                    <span className="ml-2 font-bold">12 (26%)</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Weather:</span>
                    <span className="ml-2 font-bold">18 (38%)</span>
                  </div>
                </div>
              </div>

              {/* Disruption Log */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h4 className="font-bold text-gray-900">DISRUPTION LOG</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {[
                    { date: 'Nov 22', flight: 'CM450', type: 'Cancelled', cause: 'Mechanical', crew: 4, cost: '$8,500', resolved: '3 hours', aiUsed: true, severity: 'critical' },
                    { date: 'Nov 22', flight: 'CM230', type: 'Delayed 2hrs', cause: 'Weather', crew: 4, cost: '$2,100', resolved: '2 hours', aiUsed: true, severity: 'high' },
                    { date: 'Nov 21', flight: 'CM105', type: 'Delayed 1hr', cause: 'ATC', crew: 4, cost: '$450', resolved: '1 hour', aiUsed: false, severity: 'medium' }
                  ].map((disruption, idx) => (
                    <div key={idx} className={`p-4 hover:bg-gray-50 border-l-4 ${
                      disruption.severity === 'critical' ? 'border-red-500' :
                      disruption.severity === 'high' ? 'border-amber-500' :
                      'border-blue-500'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${
                              disruption.severity === 'critical' ? 'bg-red-600 text-white' :
                              disruption.severity === 'high' ? 'bg-amber-600 text-white' :
                              'bg-blue-600 text-white'
                            }`}>
                              {disruption.type}
                            </span>
                            <span className="font-bold text-gray-900">{disruption.date} - {disruption.flight}</span>
                            {disruption.aiUsed && (
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                🤖 AI Used
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 mt-2 grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div>
                              <span className="text-gray-600">Cause:</span>
                              <span className="ml-1 font-semibold">{disruption.cause}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Crew:</span>
                              <span className="ml-1 font-semibold">{disruption.crew} affected</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Cost:</span>
                              <span className="ml-1 font-semibold">{disruption.cost}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Resolved:</span>
                              <span className="ml-1 font-semibold">{disruption.resolved}</span>
                            </div>
                            <div>
                              <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                                View Details →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analytics */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-4">By Cause (Last 90 Days)</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Weather', percent: 38, count: 34, color: 'blue' },
                      { label: 'Mechanical', percent: 26, count: 23, color: 'red' },
                      { label: 'ATC/Airport', percent: 21, count: 19, color: 'amber' },
                      { label: 'Crew Issues', percent: 11, count: 10, color: 'purple' },
                      { label: 'Other', percent: 4, count: 4, color: 'gray' }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="w-24 text-sm font-medium">{item.label}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className={`bg-${item.color}-500 h-full flex items-center px-2`}
                            style={{ width: `${item.percent}%` }}
                          >
                            <span className="text-xs font-bold text-white">{item.percent}%</span>
                          </div>
                        </div>
                        <div className="w-16 text-sm text-gray-600">{item.count} events</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-4">AI Recovery Success Rate</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-3xl font-bold text-purple-700 mb-1">95%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                      <div className="text-xs text-gray-500 mt-1">36/38 recommendations successful</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-3xl font-bold text-green-700 mb-1">$1,200</div>
                      <div className="text-sm text-gray-600">Avg Savings per Incident</div>
                      <div className="text-xs text-gray-500 mt-1">vs manual recovery</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-3xl font-bold text-blue-700 mb-1">81%</div>
                      <div className="text-sm text-gray-600">Adoption Rate</div>
                      <div className="text-xs text-gray-500 mt-1">38/47 disruptions used AI</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTINGENCY PLANS TAB */}
          {activeTab === 'contingency' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Contingency Plan Library</h3>
                  <p className="text-sm text-gray-600">Pre-built recovery plans for common scenarios</p>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Create New Plan
                </button>
              </div>

              {/* Plan Cards */}
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    title: 'AIRCRAFT MECHANICAL CANCELLATION',
                    trigger: 'Any flight cancelled due to mechanical issue',
                    lastUsed: 'Today (CM450)',
                    steps: 6,
                    avgTime: '30-45 minutes',
                    avgCost: '$3,500',
                    successRate: '92%',
                    color: 'red'
                  },
                  {
                    id: 2,
                    title: 'MAJOR WEATHER EVENT',
                    trigger: 'Airport closure or multiple delays >2 hours',
                    lastUsed: 'Nov 18, 2024 (Hurricane warning)',
                    steps: 7,
                    avgTime: '12-48 hours',
                    avgCost: '$45,000',
                    successRate: '88%',
                    color: 'blue'
                  },
                  {
                    id: 3,
                    title: 'CREW SICK CALL - LAST MINUTE',
                    trigger: 'Crew calls in sick <2 hours before departure',
                    lastUsed: 'Nov 20, 2024',
                    steps: 6,
                    avgTime: '15 minutes',
                    avgCost: '$800',
                    successRate: '97%',
                    color: 'amber'
                  }
                ].map((plan) => (
                  <div key={plan.id} className="bg-white rounded-lg border-2 border-gray-200 hover:shadow-lg transition-shadow">
                    <div className={`bg-${plan.color}-600 text-white px-6 py-3 rounded-t-lg`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          PLAN #{plan.id}: {plan.title}
                        </h4>
                        <span className="text-sm">Last Used: {plan.lastUsed}</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-gray-900 mb-1">Trigger:</div>
                        <div className="text-sm text-gray-700">{plan.trigger}</div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Steps</div>
                          <div className="text-lg font-bold text-gray-900">{plan.steps}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Avg Time</div>
                          <div className="text-lg font-bold text-gray-900">{plan.avgTime}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Avg Cost</div>
                          <div className="text-lg font-bold text-gray-900">{plan.avgCost}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-600 mb-1">Success Rate</div>
                          <div className="text-lg font-bold text-green-700">{plan.successRate}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className={`flex-1 px-4 py-2 bg-${plan.color}-600 text-white rounded hover:bg-${plan.color}-700`}>
                          View Full Plan
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                          Execute Now
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                          Edit Plan
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency Contacts */}
              <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
                <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  🚨 EMERGENCY ESCALATION
                </h4>
                <div className="space-y-3 text-sm">
                  {[
                    { level: 'Level 1', role: 'Crew Controller (You)', availability: 'Handle routine disruptions', phone: '' },
                    { level: 'Level 2', role: 'Senior Controller / Supervisor', availability: 'Available: 24/7', phone: '(555) 0200' },
                    { level: 'Level 3', role: 'Crew Operations Manager', availability: 'Available: 06:00-22:00', phone: '(555) 0201' },
                    { level: 'Level 4', role: 'Director of Operations', availability: 'Available: On-call', phone: '(555) 0202' }
                  ].map((contact, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-red-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-gray-900">{contact.level}: {contact.role}</div>
                          <div className="text-gray-600">{contact.availability}</div>
                        </div>
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                          >
                            {contact.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
