import { useState } from 'react';
import {
  ArrowLeft, Bell, AlertTriangle, Settings as SettingsIcon,
  User, Save, RotateCcw, Check, X, Clock, Mail,
  Phone, Shield, Database, Zap
} from 'lucide-react';

interface SettingsViewProps {
  onBack: () => void;
}

export default function SettingsView({ onBack }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState('alerts');

  const tabs = [
    { id: 'alerts', label: 'Alert Preferences' },
    { id: 'escalation', label: 'Escalation Rules' },
    { id: 'system', label: 'System Configuration' },
    { id: 'profile', label: 'My Profile' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Controller Settings</h2>
            <p className="text-gray-300">Configure alerts, rules, and system preferences</p>
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
                    ? 'border-b-2 border-gray-700 text-gray-700'
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
          {/* ALERT PREFERENCES TAB */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-700" />
                    ALERT & NOTIFICATION PREFERENCES
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  {/* Duty Time Alerts */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Duty Time Alerts:</h4>
                    <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            Alert when crew reaches
                          </span>
                          <input
                            type="number"
                            defaultValue={80}
                            className="mx-2 w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm text-gray-900">% of duty limit</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            Critical alert at
                          </span>
                          <input
                            type="number"
                            defaultValue={90}
                            className="mx-2 w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm text-gray-900">% of duty limit</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            Automatic watch list at
                          </span>
                          <input
                            type="number"
                            defaultValue={85}
                            className="mx-2 w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm text-gray-900">%</span>
                        </div>
                      </label>
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Delivery Method:</span>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm text-gray-700">Push</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm text-gray-700">SMS</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm text-gray-700">Email</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Disruption Alerts */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Disruption Alerts:</h4>
                    <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            Flight delays &gt;
                          </span>
                          <input
                            type="number"
                            defaultValue={60}
                            className="mx-2 w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm text-gray-900">minutes</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <span className="text-sm font-medium text-gray-900">
                          Flight cancellations (immediate)
                        </span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <span className="text-sm font-medium text-gray-900">
                          Weather warnings affecting operations
                        </span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <span className="text-sm font-medium text-gray-900">
                          Mechanical issues (aircraft out of service)
                        </span>
                      </label>
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Delivery Method:</span>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm text-gray-700">Push</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm text-gray-700">Email</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reserve Pool Alerts */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Reserve Pool Alerts:</h4>
                    <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            Reserve pool below
                          </span>
                          <input
                            type="number"
                            defaultValue={5}
                            className="mx-2 w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm text-gray-900">available crew</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            Reserve callout no response after
                          </span>
                          <input
                            type="number"
                            defaultValue={10}
                            className="mx-2 w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm text-gray-900">minutes</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            Reserve utilization above
                          </span>
                          <input
                            type="number"
                            defaultValue={75}
                            className="mx-2 w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm text-gray-900">%</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">AI Recommendations:</h4>
                    <div className="space-y-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <span className="text-sm font-medium text-gray-900">
                          Show AI suggestions for disruptions
                        </span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <span className="text-sm font-medium text-gray-900">
                          Auto-notify when high confidence (&gt;90%)
                        </span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded w-4 h-4" />
                        <span className="text-sm font-medium text-gray-900">
                          Auto-execute AI plans (requires manager approval)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Quiet Hours */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Quiet Hours:</h4>
                    <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded w-4 h-4" />
                        <span className="text-sm font-medium text-gray-900">
                          Enable quiet hours
                        </span>
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">From:</span>
                          <input
                            type="time"
                            defaultValue="22:00"
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">To:</span>
                          <input
                            type="time"
                            defaultValue="06:00"
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded w-4 h-4" />
                        <span className="text-sm font-medium text-gray-900">
                          Allow critical alerts only during quiet hours
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Save Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Reset to Defaults
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Test Alerts
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ESCALATION RULES TAB */}
          {activeTab === 'escalation' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ESCALATION RULES
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  {/* Rule Cards */}
                  {[
                    {
                      id: 1,
                      title: 'Duty Time Violation Risk',
                      trigger: 'Crew within 30 minutes of duty limit',
                      actions: [
                        'Immediate: Alert controller (YOU)',
                        'If not resolved in 15 min: Alert Senior Controller',
                        'If not resolved in 30 min: Alert Operations Manager'
                      ],
                      color: 'red'
                    },
                    {
                      id: 2,
                      title: 'Multiple Flight Disruptions',
                      trigger: '3+ flights delayed/cancelled in same hour',
                      actions: [
                        'Immediate: Activate emergency operations',
                        'Alert: Operations Manager + Crew Manager',
                        'Convene: Recovery team meeting'
                      ],
                      color: 'amber'
                    },
                    {
                      id: 3,
                      title: 'Reserve Pool Exhausted',
                      trigger: '<2 reserves available',
                      actions: [
                        'Immediate: Alert controller',
                        'Escalate to: Crew Operations Manager',
                        'Action: Emergency reserve callout protocol',
                        'Consider: Hiring on-demand crew'
                      ],
                      color: 'purple'
                    },
                    {
                      id: 4,
                      title: 'High-Cost Recovery (>$10K)',
                      trigger: 'Recovery plan exceeds $10,000',
                      actions: [
                        'Requires: Manager approval before execution',
                        'Notify: Finance department'
                      ],
                      color: 'blue'
                    },
                    {
                      id: 5,
                      title: 'Crew Safety Concern',
                      trigger: 'Crew reports safety issue',
                      actions: [
                        'Immediate: Ground crew',
                        'Alert: Chief Pilot + Safety Manager',
                        'Investigation: Begin within 1 hour'
                      ],
                      color: 'red'
                    }
                  ].map((rule) => (
                    <div key={rule.id} className={`border-l-4 border-${rule.color}-500 bg-${rule.color}-50 rounded-lg p-4`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Rule #{rule.id}: {rule.title}</h4>
                          <div className="text-sm text-gray-700">
                            <span className="font-semibold">Trigger:</span> {rule.trigger}
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Edit
                        </button>
                      </div>
                      <div className="bg-white rounded p-3">
                        <div className="text-sm font-semibold text-gray-900 mb-2">Action:</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {rule.actions.map((action, idx) => (
                            <li key={idx}>├─ {action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}

                  {/* Add New Rule */}
                  <button className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Add New Escalation Rule
                  </button>

                  {/* Test Escalation */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Rules
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Test Escalation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM CONFIGURATION TAB */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-gray-700" />
                    SYSTEM CONFIGURATION
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  {/* Data Refresh */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Data Refresh:</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Auto-refresh interval:</span>
                        <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                          <option>5 seconds</option>
                          <option selected>10 seconds</option>
                          <option>30 seconds</option>
                          <option>60 seconds</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Real-time updates:</span>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm text-gray-700">Enabled</span>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Data cache duration:</span>
                        <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                          <option>1 minute</option>
                          <option selected>5 minutes</option>
                          <option>15 minutes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Layout */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Dashboard Layout:</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Default tab on login:</span>
                        <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                          <option selected>Live Dashboard</option>
                          <option>Flight Status Board</option>
                          <option>Crew Status Board</option>
                          <option>Activity Timeline</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Show AI suggestions:</span>
                        <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                          <option selected>Always</option>
                          <option>On request</option>
                          <option>Never</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Compact mode:</span>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm text-gray-700">Enabled</span>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Charts & visualizations:</span>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm text-gray-700">Enabled</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Integrations */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Integrations:</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {[
                        { name: 'Flight tracking system', connected: true },
                        { name: 'Weather service', connected: true },
                        { name: 'Crew mobile app', connected: true },
                        { name: 'Payroll system', connected: true },
                        { name: 'Maintenance system', connected: false, comingSoon: true }
                      ].map((integration, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Database className={`w-4 h-4 ${integration.connected ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className="text-sm font-medium text-gray-900">{integration.name}</span>
                            {integration.comingSoon && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                Coming soon
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {integration.connected ? (
                              <>
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">Connected</span>
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">Not connected</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Performance:</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Load historical data:</span>
                        <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                          <option>Last 24 hours</option>
                          <option selected>Last 7 days</option>
                          <option>Last 30 days</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Max concurrent crew tracking:</span>
                        <input
                          type="number"
                          defaultValue={200}
                          className="w-24 px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Enable advanced analytics:</span>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm text-gray-700">Yes</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Save Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Configuration
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Test Connections
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MY PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-700" />
                    MY CONTROLLER PROFILE
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  {/* Profile Info */}
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-600" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                          <input
                            type="text"
                            defaultValue="Maria Rodriguez"
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID:</label>
                          <input
                            type="text"
                            defaultValue="CTRL-001"
                            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role:</label>
                          <input
                            type="text"
                            defaultValue="Crew Controller"
                            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Base Location:</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded">
                            <option selected>BUR Base</option>
                            <option>PTY Base</option>
                            <option>LAX Base</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Shift:</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded">
                            <option selected>Day (06:00 - 18:00)</option>
                            <option>Night (18:00 - 06:00)</option>
                            <option>Swing (14:00 - 22:00)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Contact Information:</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">Phone:</label>
                          <input
                            type="tel"
                            defaultValue="(555) 0100"
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">Email:</label>
                          <input
                            type="email"
                            defaultValue="m.rodriguez@copa.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <label className="block text-sm text-gray-600 mb-1">Emergency Contact:</label>
                          <input
                            type="tel"
                            defaultValue="(555) 0101"
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Certifications:</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {[
                        { name: 'Crew Scheduling Certified', status: true },
                        { name: 'FAA Part 117 Trained', status: true },
                        { name: 'Emergency Management Trained', status: true },
                        { name: 'AI Systems Administrator', status: false, optional: true }
                      ].map((cert, idx) => (
                        <label key={idx} className="flex items-center gap-3">
                          <input type="checkbox" checked={cert.status} readOnly className="rounded" />
                          <span className="text-sm text-gray-900">
                            {cert.name}
                            {cert.optional && (
                              <span className="ml-2 text-xs text-gray-500">(optional)</span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Performance This Month:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-900">47</div>
                        <div className="text-sm text-blue-700">Disruptions Handled</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-900">2.3 hrs</div>
                        <div className="text-sm text-green-700">Avg Resolution Time</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-900">81%</div>
                        <div className="text-sm text-purple-700">AI Recommendations Used</div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-amber-900">8.7/10</div>
                        <div className="text-sm text-amber-700">Crew Satisfaction</div>
                      </div>
                    </div>
                  </div>

                  {/* Save Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Profile
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Change Password
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      View My Statistics
                    </button>
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
