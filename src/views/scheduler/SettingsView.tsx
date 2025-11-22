import React, { useState } from 'react';
import {
  Settings,
  Clock,
  Bell,
  Users,
  Save,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Shield,
  Mail,
  Smartphone,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  Sliders,
  Lock,
  User,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

type TabType = 'planning' | 'preferences' | 'notifications' | 'users';

interface PlanningRule {
  id: string;
  name: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  description: string;
  category: 'limits' | 'scheduling' | 'optimization' | 'compliance';
}

interface NotificationSetting {
  id: string;
  name: string;
  email: boolean;
  sms: boolean;
  inApp: boolean;
  category: 'critical' | 'alerts' | 'updates' | 'reports';
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'scheduler' | 'manager' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  permissions: string[];
}

// Mock data
const planningRules: PlanningRule[] = [
  // Limits
  { id: 'max-duty-hours', name: 'Maximum Duty Hours (Monthly)', value: 95, type: 'number', description: 'FAR Part 121 monthly duty hour limit', category: 'limits' },
  { id: 'max-flight-hours', name: 'Maximum Flight Hours (Monthly)', value: 100, type: 'number', description: 'FAR Part 121 monthly flight hour limit', category: 'limits' },
  { id: 'min-rest-period', name: 'Minimum Rest Period (Hours)', value: 10, type: 'number', description: 'Required rest between duty periods', category: 'limits' },
  { id: 'max-consecutive-days', name: 'Maximum Consecutive Days', value: 6, type: 'number', description: 'Maximum days crew can work without day off', category: 'limits' },

  // Scheduling
  { id: 'trip-bidding-window', name: 'Trip Bidding Window (Days)', value: 14, type: 'number', description: 'Days before month starts for trip bidding', category: 'scheduling' },
  { id: 'auto-assign-reserve', name: 'Auto-Assign Reserve Crew', value: true, type: 'boolean', description: 'Automatically assign reserve crew to uncovered trips', category: 'scheduling' },
  { id: 'seniority-preference', name: 'Seniority Preference Weight', value: 'high', type: 'select', options: ['low', 'medium', 'high'], description: 'How much to prioritize seniority in assignments', category: 'scheduling' },

  // Optimization
  { id: 'cost-optimization', name: 'Cost Optimization Priority', value: 'balanced', type: 'select', options: ['low', 'balanced', 'high'], description: 'Balance between cost savings and crew satisfaction', category: 'optimization' },
  { id: 'minimize-deadheads', name: 'Minimize Deadhead Flights', value: true, type: 'boolean', description: 'Reduce positioning flights when possible', category: 'optimization' },
  { id: 'optimize-commutes', name: 'Optimize Crew Commutes', value: true, type: 'boolean', description: 'Consider crew base proximity in assignments', category: 'optimization' },

  // Compliance
  { id: 'cba-validation', name: 'CBA Validation Level', value: 'strict', type: 'select', options: ['lenient', 'standard', 'strict'], description: 'How strictly to enforce CBA rules', category: 'compliance' },
  { id: 'pre-assignment-check', name: 'Pre-Assignment Compliance Check', value: true, type: 'boolean', description: 'Validate compliance before confirming assignments', category: 'compliance' },
];

const notificationSettings: NotificationSetting[] = [
  // Critical
  { id: 'compliance-violations', name: 'Compliance Violations', email: true, sms: true, inApp: true, category: 'critical' },
  { id: 'duty-limit-exceeded', name: 'Duty Limit Exceeded', email: true, sms: true, inApp: true, category: 'critical' },
  { id: 'uncovered-trips', name: 'Uncovered Trips (24hrs)', email: true, sms: false, inApp: true, category: 'critical' },

  // Alerts
  { id: 'medical-expiring', name: 'Medical Certificates Expiring', email: true, sms: false, inApp: true, category: 'alerts' },
  { id: 'training-due', name: 'Training Due Soon', email: true, sms: false, inApp: true, category: 'alerts' },
  { id: 'rest-violations', name: 'Rest Period Violations', email: true, sms: false, inApp: true, category: 'alerts' },
  { id: 'crew-near-limits', name: 'Crew Near Duty Limits', email: true, sms: false, inApp: true, category: 'alerts' },

  // Updates
  { id: 'roster-published', name: 'Roster Published', email: true, sms: false, inApp: true, category: 'updates' },
  { id: 'trip-changes', name: 'Trip Changes/Updates', email: false, sms: false, inApp: true, category: 'updates' },
  { id: 'bid-awards', name: 'Bid Awards Processed', email: true, sms: false, inApp: true, category: 'updates' },

  // Reports
  { id: 'daily-summary', name: 'Daily Summary Report', email: true, sms: false, inApp: false, category: 'reports' },
  { id: 'weekly-analytics', name: 'Weekly Analytics Report', email: true, sms: false, inApp: false, category: 'reports' },
  { id: 'monthly-compliance', name: 'Monthly Compliance Report', email: true, sms: false, inApp: false, category: 'reports' },
];

const userAccounts: UserAccount[] = [
  { id: 'U001', name: 'John Smith', email: 'john.smith@copaair.com', role: 'admin', status: 'active', lastLogin: '2024-11-22 09:15', permissions: ['all'] },
  { id: 'U002', name: 'Maria Rodriguez', email: 'maria.rodriguez@copaair.com', role: 'scheduler', status: 'active', lastLogin: '2024-11-22 08:45', permissions: ['view', 'edit', 'assign'] },
  { id: 'U003', name: 'David Chen', email: 'david.chen@copaair.com', role: 'scheduler', status: 'active', lastLogin: '2024-11-21 16:30', permissions: ['view', 'edit', 'assign'] },
  { id: 'U004', name: 'Sarah Johnson', email: 'sarah.johnson@copaair.com', role: 'manager', status: 'active', lastLogin: '2024-11-22 07:20', permissions: ['view', 'edit', 'reports'] },
  { id: 'U005', name: 'Michael Lee', email: 'michael.lee@copaair.com', role: 'viewer', status: 'active', lastLogin: '2024-11-20 14:10', permissions: ['view'] },
  { id: 'U006', name: 'Ana Martinez', email: 'ana.martinez@copaair.com', role: 'scheduler', status: 'inactive', lastLogin: '2024-10-15 11:25', permissions: ['view', 'edit'] },
];

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('planning');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const tabs = [
    { id: 'planning' as TabType, label: 'Planning Rules', icon: Sliders },
    { id: 'preferences' as TabType, label: 'System Preferences', icon: Settings },
    { id: 'notifications' as TabType, label: 'Notification Settings', icon: Bell },
    { id: 'users' as TabType, label: 'User Management', icon: Users },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600">Configure scheduler rules, preferences, notifications, and user access</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#003087] border-b-2 border-[#003087]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
            <span className="text-sm text-yellow-800">You have unsaved changes</span>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
              <RotateCcw className="w-4 h-4" />
              <span>Discard</span>
            </button>
            <button className="px-3 py-1.5 text-sm bg-[#003087] text-white rounded hover:bg-[#002565] flex items-center space-x-1">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'planning' && <PlanningRulesTab data={planningRules} />}
        {activeTab === 'preferences' && <SystemPreferencesTab />}
        {activeTab === 'notifications' && <NotificationSettingsTab data={notificationSettings} />}
        {activeTab === 'users' && <UserManagementTab data={userAccounts} />}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        Powered by AI from dCortex
      </div>
    </div>
  );
};

// Tab 1: Planning Rules
const PlanningRulesTab: React.FC<{ data: PlanningRule[] }> = ({ data }) => {
  const [rules, setRules] = useState(data);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Rules', icon: Sliders },
    { id: 'limits', label: 'Duty & Flight Limits', icon: Clock },
    { id: 'scheduling', label: 'Scheduling Rules', icon: Calendar },
    { id: 'optimization', label: 'Optimization', icon: Sparkles },
    { id: 'compliance', label: 'Compliance', icon: Shield },
  ];

  const filteredRules = selectedCategory === 'all'
    ? rules
    : rules.filter(r => r.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* AI Recommendation Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-[#003087] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">AI Configuration Recommendations</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Consider reducing <strong>Trip Bidding Window to 10 days</strong> to improve planning flexibility.</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Enable <strong>Auto-Assign Reserve Crew</strong> to reduce last-minute uncovered trip scrambles.</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Your current settings optimize for compliance over cost. Consider adjusting to "balanced" for 12% cost savings.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#003087] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Rules Configuration */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Configure Planning Rules</h3>
          <p className="text-sm text-gray-600 mt-1">Adjust scheduler behavior and constraints</p>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredRules.map((rule) => (
            <div key={rule.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-900">{rule.name}</label>
                  <p className="text-xs text-gray-500 mt-1">{rule.description}</p>
                </div>
                <div className="ml-4 min-w-[200px]">
                  {rule.type === 'boolean' && (
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={rule.value as boolean}
                          onChange={(e) => {
                            const newRules = rules.map(r =>
                              r.id === rule.id ? { ...r, value: e.target.checked } : r
                            );
                            setRules(newRules);
                          }}
                          className="sr-only"
                        />
                        <div className={`block w-14 h-8 rounded-full transition-colors ${
                          rule.value ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          rule.value ? 'transform translate-x-6' : ''
                        }`}></div>
                      </div>
                      <span className="ml-3 text-sm text-gray-700">
                        {rule.value ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  )}
                  {rule.type === 'number' && (
                    <input
                      type="number"
                      value={rule.value as number}
                      onChange={(e) => {
                        const newRules = rules.map(r =>
                          r.id === rule.id ? { ...r, value: parseInt(e.target.value) } : r
                        );
                        setRules(newRules);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003087]"
                    />
                  )}
                  {rule.type === 'select' && (
                    <select
                      value={rule.value as string}
                      onChange={(e) => {
                        const newRules = rules.map(r =>
                          r.id === rule.id ? { ...r, value: e.target.value } : r
                        );
                        setRules(newRules);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003087] capitalize"
                    >
                      {rule.options?.map((opt) => (
                        <option key={opt} value={opt} className="capitalize">
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-2">
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Defaults</span>
        </button>
        <button className="px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#002565] flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

// Tab 2: System Preferences
const SystemPreferencesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 text-[#003087] mr-2" />
            General Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003087]">
                <option>Pacific Time (PT)</option>
                <option>Eastern Time (ET)</option>
                <option>Central Time (CT)</option>
                <option>UTC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003087]">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003087]">
                <option>English</option>
                <option>Spanish</option>
                <option>Portuguese</option>
              </select>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 text-[#003087] mr-2" />
            Display Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003087]">
                <option>Light Mode</option>
                <option>Dark Mode</option>
                <option>Auto (System)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default View</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003087]">
                <option>Dashboard</option>
                <option>Roster Builder</option>
                <option>Crew Management</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">Show AI Insights by Default</span>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" defaultChecked className="sr-only" />
                  <div className="block w-14 h-8 bg-green-500 rounded-full"></div>
                  <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transform translate-x-6"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Data & Export */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-5 h-5 text-[#003087] mr-2" />
            Data & Export
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Export Format</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003087]">
                <option>Excel (.xlsx)</option>
                <option>CSV (.csv)</option>
                <option>PDF (.pdf)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention Period</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003087]">
                <option>6 months</option>
                <option>1 year</option>
                <option>2 years</option>
                <option>5 years</option>
              </select>
            </div>
            <button className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
              Download All Data (GDPR Export)
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 text-[#003087] mr-2" />
            Security Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" defaultChecked className="sr-only" />
                  <div className="block w-14 h-8 bg-green-500 rounded-full"></div>
                  <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transform translate-x-6"></div>
                </div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003087]">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
              </select>
            </div>
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-2">
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Defaults</span>
        </button>
        <button className="px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#002565] flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  );
};

// Tab 3: Notification Settings
const NotificationSettingsTab: React.FC<{ data: NotificationSetting[] }> = ({ data }) => {
  const [settings, setSettings] = useState(data);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Notifications' },
    { id: 'critical', label: 'Critical', color: 'red' },
    { id: 'alerts', label: 'Alerts', color: 'orange' },
    { id: 'updates', label: 'Updates', color: 'blue' },
    { id: 'reports', label: 'Reports', color: 'purple' },
  ];

  const filteredSettings = selectedCategory === 'all'
    ? settings
    : settings.filter(s => s.category === selectedCategory);

  const toggleNotification = (id: string, channel: 'email' | 'sms' | 'inApp') => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, [channel]: !s[channel] } : s
    ));
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#003087] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
            Enable All
          </button>
          <button className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
            Disable All
          </button>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          <p className="text-sm text-gray-600 mt-1">Choose how you want to be notified for different events</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Mail className="w-4 h-4 mx-auto" />
                  <span className="sr-only">Email</span>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Smartphone className="w-4 h-4 mx-auto" />
                  <span className="sr-only">SMS</span>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Bell className="w-4 h-4 mx-auto" />
                  <span className="sr-only">In-App</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSettings.map((setting) => (
                <tr key={setting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{setting.name}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                            setting.category === 'critical' ? 'bg-red-500' :
                            setting.category === 'alerts' ? 'bg-orange-500' :
                            setting.category === 'updates' ? 'bg-blue-500' :
                            'bg-purple-500'
                          }`}></span>
                          {setting.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={setting.email}
                      onChange={() => toggleNotification(setting.id, 'email')}
                      className="w-5 h-5 text-[#003087] border-gray-300 rounded focus:ring-[#003087]"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={setting.sms}
                      onChange={() => toggleNotification(setting.id, 'sms')}
                      className="w-5 h-5 text-[#003087] border-gray-300 rounded focus:ring-[#003087]"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={setting.inApp}
                      onChange={() => toggleNotification(setting.id, 'inApp')}
                      className="w-5 h-5 text-[#003087] border-gray-300 rounded focus:ring-[#003087]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Schedule */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiet Hours</h3>
        <p className="text-sm text-gray-600 mb-4">Set times when you don't want to receive non-critical notifications</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <input
              type="time"
              defaultValue="22:00"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003087]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <input
              type="time"
              defaultValue="07:00"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#003087]"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <input type="checkbox" defaultChecked className="w-4 h-4 text-[#003087] border-gray-300 rounded focus:ring-[#003087]" />
          <label className="ml-2 text-sm text-gray-700">Apply quiet hours to weekends</label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-2">
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Defaults</span>
        </button>
        <button className="px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#002565] flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Notification Settings</span>
        </button>
      </div>
    </div>
  );
};

// Tab 4: User Management
const UserManagementTab: React.FC<{ data: UserAccount[] }> = ({ data }) => {
  const [users, setUsers] = useState(data);
  const [filterRole, setFilterRole] = useState<string>('all');

  const filteredUsers = filterRole === 'all'
    ? users
    : users.filter(u => u.role === filterRole);

  const roles = ['all', 'admin', 'scheduler', 'manager', 'viewer'];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'scheduler': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filterRole === role
                  ? 'bg-[#003087] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {role} {role !== 'all' && `(${users.filter(u => u.role === role).length})`}
            </button>
          ))}
        </div>
        <button className="px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#002565] flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Accounts</h3>
          <p className="text-sm text-gray-600 mt-1">Manage user access and permissions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#003087] rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === 'active' && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Active</span>
                    )}
                    {user.status === 'inactive' && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Inactive</span>
                    )}
                    {user.status === 'pending' && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.slice(0, 3).map((perm) => (
                        <span key={perm} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded capitalize">
                          {perm}
                        </span>
                      ))}
                      {user.permissions.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{user.permissions.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1 text-gray-600 hover:text-[#003087]">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Permission</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Scheduler</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Manager</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: 'View Roster', admin: true, scheduler: true, manager: true, viewer: true },
                { name: 'Edit Roster', admin: true, scheduler: true, manager: false, viewer: false },
                { name: 'Assign Trips', admin: true, scheduler: true, manager: false, viewer: false },
                { name: 'Manage Crew', admin: true, scheduler: true, manager: true, viewer: false },
                { name: 'View Reports', admin: true, scheduler: true, manager: true, viewer: true },
                { name: 'Export Data', admin: true, scheduler: true, manager: true, viewer: false },
                { name: 'Configure Settings', admin: true, scheduler: false, manager: false, viewer: false },
                { name: 'Manage Users', admin: true, scheduler: false, manager: false, viewer: false },
              ].map((perm, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-900">{perm.name}</td>
                  <td className="px-4 py-2 text-center">
                    {perm.admin ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {perm.scheduler ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {perm.manager ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {perm.viewer ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
