import { useState } from 'react';
import {
  Users, User, Plane, Calendar, CheckCircle, AlertTriangle, XCircle,
  Sparkles, Info, FileText, Printer, Download, ArrowLeft, Search
} from 'lucide-react';
import { crewMembers } from '../../data/mockData';

interface CrewManagementViewProps {
  onBack?: () => void;
}

// Extended crew data with additional fields for this view
const extendedCrewData = crewMembers.map((crew, index) => ({
  ...crew,
  status: index % 8 === 0 ? 'On Leave' : index % 8 === 1 ? 'Training' : 'Active',
  hireDate: new Date(2015 + (index * 2), (index * 3) % 12, 15).toISOString().split('T')[0],
  years: new Date().getFullYear() - (2015 + (index * 2)),
  qual738: index % 3 !== 0 ? 'qualified' : 'not_qualified',
  qualMax: index % 2 === 0 ? 'qualified' : 'not_qualified',
  qual777: index % 4 === 0 ? 'qualified' : 'not_qualified',
  trainingExpiring: index % 5 === 0,
  medicalExpiring: index % 7 === 0,
  nextTrip: index % 2 === 0 ? 'Tomorrow 06:30 (CM100)' : 'Nov 25 14:30 (CM105)',
  onTrip: index % 8 === 1,
  tripDetails: index % 8 === 1 ? 'CM450 PTY→LAX' : null,
  onLeave: index % 8 === 0,
  leaveType: index % 8 === 0 ? (index % 2 === 0 ? 'Vacation' : 'Sick Leave') : null,
  leaveDates: index % 8 === 0 ? 'Dec 20-27' : null,
  inTraining: index % 8 === 2,
  trainingType: index % 8 === 2 ? '737-800 Recurrent • Simulator' : null
}));

export default function CrewManagementView({ onBack }: CrewManagementViewProps) {
  const [activeTab, setActiveTab] = useState('directory');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBase, setSelectedBase] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const tabs = [
    { id: 'directory', label: 'Crew Directory' },
    { id: 'qualifications', label: 'Qualifications Matrix' },
    { id: 'availability', label: 'Availability & Status' },
    { id: 'seniority', label: 'Seniority List' }
  ];

  // Filter crew based on search and filters
  const filteredCrew = extendedCrewData.filter(crew => {
    const matchesSearch = crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crew.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBase = selectedBase === 'All' || crew.base === selectedBase;
    const matchesRole = selectedRole === 'All' || crew.role === selectedRole;
    const matchesStatus = selectedStatus === 'All' || crew.status === selectedStatus;

    return matchesSearch && matchesBase && matchesRole && matchesStatus;
  });

  // Status counts
  const activeCrew = extendedCrewData.filter(c => c.status === 'Active').length;
  const onTrip = extendedCrewData.filter(c => c.onTrip).length;
  const onLeave = extendedCrewData.filter(c => c.status === 'On Leave').length;
  const inTraining = extendedCrewData.filter(c => c.status === 'Training').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg p-6">
        <div className="flex items-center gap-4 mb-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <h2 className="text-3xl font-bold">Crew Management</h2>
        </div>
        <p className="text-blue-100">
          Copa Airlines • {extendedCrewData.length} Total Crew Members • All Bases
        </p>
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

        <div className="p-6">
          {/* TAB 1: CREW DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="space-y-6">
              {/* Search & Filters Bar */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search crew..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedBase}
                  onChange={(e) => setSelectedBase(e.target.value)}
                >
                  <option>All</option>
                  <option>BUR</option>
                  <option>PTY</option>
                  <option>LAX</option>
                  <option>MIA</option>
                </select>
                <select
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option>All</option>
                  <option>Captain</option>
                  <option>First Officer</option>
                  <option>Flight Attendant</option>
                </select>
                <select
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option>All</option>
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Training</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap">
                  + Add New Crew Member
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Table View
                </button>
              </div>

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-3 gap-4">
                  {filteredCrew.map(crew => (
                    <div key={crew.id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {crew.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{crew.name}</h3>
                            <div className="text-xs text-gray-600">
                              {crew.id} • Seniority: #{crew.seniority}
                            </div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          crew.status === 'Active' ? 'bg-green-100 text-green-700' :
                          crew.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {crew.status}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Role:</span>
                          <span className="font-semibold">{crew.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base:</span>
                          <span className="font-semibold">{crew.base}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hire Date:</span>
                          <span>{new Date(crew.hireDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Qualifications:</span>
                          <span className="font-semibold">{crew.qualification}</span>
                        </div>
                      </div>

                      <div className="border-t pt-4 mb-4">
                        <h4 className="font-semibold text-sm mb-2">This Month:</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Credit Hours:</span>
                            <span className="font-semibold">{crew.ytdEarnings > 70000 ? '87.5 / 85' : '72.3 / 75'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trips:</span>
                            <span>{crew.seniority + 6}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Days Off:</span>
                            <span>{15 - crew.seniority}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Training:</span>
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Current (exp: Dec 2025)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          View Details
                        </button>
                        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                          Assign Trip
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Table View */}
              {viewMode === 'table' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold">NAME</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">ROLE</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">BASE</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">QUALIFICATION</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">STATUS</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCrew.map((crew, idx) => (
                        <tr key={crew.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-semibold">{crew.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{crew.id}</td>
                          <td className="px-4 py-3 text-sm">{crew.role}</td>
                          <td className="px-4 py-3 text-sm">{crew.base}</td>
                          <td className="px-4 py-3 text-sm">{crew.qualification}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              crew.status === 'Active' ? 'bg-green-100 text-green-700' :
                              crew.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {crew.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button className="text-blue-600 text-sm hover:underline">View</button>
                              <button className="text-blue-600 text-sm hover:underline">Edit</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUALIFICATIONS MATRIX */}
          {activeTab === 'qualifications' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex gap-4">
                <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Base: All</option>
                  <option>BUR</option>
                  <option>PTY</option>
                </select>
                <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Role: All</option>
                  <option>Captains</option>
                  <option>First Officers</option>
                </select>
                <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Show: All Qualifications</option>
                  <option>Expiring Only</option>
                </select>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <h4 className="font-semibold mb-3">Aircraft Type Coverage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>737-800:</span>
                      <span className="font-semibold text-green-600">6/9 (67%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>737-MAX:</span>
                      <span className="font-semibold text-green-600">5/9 (56%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>777:</span>
                      <span className="font-semibold text-yellow-600">3/9 (33%)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <h4 className="font-semibold mb-3">Int'l Qualified</h4>
                  <div className="text-3xl font-bold text-blue-600">8/9</div>
                  <div className="text-sm text-gray-600">89% qualified</div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <h4 className="font-semibold mb-3">Training Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Current:</span>
                      <span className="font-semibold text-green-600">89%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expiring:</span>
                      <span className="font-semibold text-yellow-600">11%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expired:</span>
                      <span className="font-semibold text-red-600">0%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Qualifications Matrix Table */}
              <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold sticky left-0 bg-gray-50 z-10">CREW</th>
                      <th className="px-4 py-3 text-center font-semibold">737-800</th>
                      <th className="px-4 py-3 text-center font-semibold">737-MAX</th>
                      <th className="px-4 py-3 text-center font-semibold">777</th>
                      <th className="px-4 py-3 text-center font-semibold">Int'l</th>
                      <th className="px-4 py-3 text-center font-semibold">Training</th>
                      <th className="px-4 py-3 text-center font-semibold">Medical</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extendedCrewData.map((crew, idx) => (
                      <tr key={crew.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-semibold sticky left-0 bg-inherit">
                          <div>{crew.name}</div>
                          <div className="text-xs text-gray-600">{crew.role}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {crew.qual738 === 'qualified' ? (
                            <span className="text-green-600 font-bold text-lg">✓✓</span>
                          ) : (
                            <span className="text-gray-400">✗</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {crew.qualMax === 'qualified' ? (
                            <span className="text-green-600 font-bold text-lg">✓✓</span>
                          ) : (
                            <span className="text-gray-400">✗</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {crew.qual777 === 'qualified' ? (
                            <span className="text-green-600 font-bold text-lg">✓✓</span>
                          ) : (
                            <span className="text-gray-400">✗</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-green-600 font-bold text-lg">✓</span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs">
                          {crew.trainingExpiring ? (
                            <span className="text-yellow-600">⚠️ 02/25</span>
                          ) : (
                            <span className="text-green-600">✓ (12/25)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-xs">
                          {crew.medicalExpiring ? (
                            <span className="text-yellow-600">⚠️ 01/25</span>
                          ) : (
                            <span className="text-green-600">✓ (06/25)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="flex gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold text-lg">✓✓</span>
                  <span>= Current & Qualified</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-lg">✓</span>
                  <span>= Current (date shows expiration)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span>= Expiring within 90 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">🚨</span>
                  <span>= Expired</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">✗</span>
                  <span>= Not Qualified</span>
                </div>
              </div>

              {/* AI Recommendations Panel */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-blue-600" />
                  <h3 className="font-bold text-lg">AI RECOMMENDATIONS</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Coverage Gaps Detected:</h4>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="font-semibold">1. 777 qualified crew low (33%)</span>
                        <div className="ml-4 text-gray-700">
                          → Recommend: Train 2 more crew members<br />
                          → Cost: $18K • Time: 6 weeks
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold">2. {extendedCrewData.filter(c => c.trainingExpiring).length} crew training expiring in 60 days</span>
                        <div className="ml-4 text-gray-700">
                          → Crews: {extendedCrewData.filter(c => c.trainingExpiring).map(c => c.name.split(' ')[1]).join(', ')}<br />
                          → Action: Schedule recurrent training
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold">3. Medical certificates expiring</span>
                        <div className="ml-4 text-gray-700">
                          → {extendedCrewData.filter(c => c.medicalExpiring).length} crew need to schedule exams<br />
                          → Risk: Could lose coverage if expired
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Schedule Training
                  </button>
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                    Contact Crew
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    View Full Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AVAILABILITY & STATUS */}
          {activeTab === 'availability' && (
            <div className="space-y-6">
              {/* Status Dashboard */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="text-2xl font-bold text-green-600">{activeCrew}</h3>
                  <div className="text-sm text-gray-600">ACTIVE</div>
                  <div className="text-xs text-gray-500">{Math.round((activeCrew / extendedCrewData.length) * 100)}%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="text-2xl font-bold text-blue-600">{onTrip}</h3>
                  <div className="text-sm text-gray-600">ON TRIP</div>
                  <div className="text-xs text-gray-500">{Math.round((onTrip / extendedCrewData.length) * 100)}%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="text-2xl font-bold text-yellow-600">{onLeave}</h3>
                  <div className="text-sm text-gray-600">ON LEAVE</div>
                  <div className="text-xs text-gray-500">{Math.round((onLeave / extendedCrewData.length) * 100)}%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="text-2xl font-bold text-purple-600">{inTraining}</h3>
                  <div className="text-sm text-gray-600">TRAINING</div>
                  <div className="text-xs text-gray-500">{Math.round((inTraining / extendedCrewData.length) * 100)}%</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Users className="text-blue-600" />
                  <span className="font-semibold">Reserve Pool: {Math.floor(activeCrew * 0.15)} crew available for call-out</span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Status: All</option>
                  <option>Active</option>
                  <option>On Trip</option>
                  <option>On Leave</option>
                  <option>Training</option>
                </select>
                <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Base: All</option>
                  <option>BUR</option>
                  <option>PTY</option>
                </select>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Next 24hrs
                </button>
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Crew Status Lists */}
              <div className="space-y-6">
                {/* ACTIVE CREW */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-600"></span>
                    ACTIVE CREW ({extendedCrewData.filter(c => c.status === 'Active').length})
                  </h3>
                  <div className="space-y-3">
                    {extendedCrewData.filter(c => c.status === 'Active').slice(0, 3).map(crew => (
                      <div key={crew.id} className="border-b pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold">{crew.name} - {crew.base} base</div>
                            <div className="text-sm text-green-600">✓ Ready</div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Next trip: {crew.nextTrip}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ON TRIP */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    ON TRIP ({extendedCrewData.filter(c => c.onTrip).length})
                  </h3>
                  <div className="space-y-3">
                    {extendedCrewData.filter(c => c.onTrip).map(crew => (
                      <div key={crew.id} className="border-b pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold">{crew.name} - {crew.tripDetails}</div>
                            <div className="text-sm text-blue-600 flex items-center gap-1">
                              <Plane className="w-4 h-4" />
                              In-Flight
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Landing: 3:15 PM (2h 15m remaining)<br />
                            Status: On Time
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ON LEAVE */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-600"></span>
                    ON LEAVE ({extendedCrewData.filter(c => c.status === 'On Leave').length})
                  </h3>
                  <div className="space-y-3">
                    {extendedCrewData.filter(c => c.status === 'On Leave').map(crew => (
                      <div key={crew.id} className="border-b pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold">{crew.name}</div>
                            <div className="text-sm text-gray-600">{crew.leaveType}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">{crew.leaveDates}</div>
                            <div className="text-xs text-gray-500">
                              {crew.leaveType === 'Vacation' ? 'Approved • Cannot disturb' : 'Expected return: Nov 24'}
                            </div>
                            {crew.leaveType === 'Sick Leave' && (
                              <button className="mt-1 text-xs text-blue-600 border border-blue-600 px-2 py-1 rounded hover:bg-blue-50">
                                Contact Crew
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TRAINING */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                    TRAINING ({extendedCrewData.filter(c => c.status === 'Training').length})
                  </h3>
                  <div className="space-y-3">
                    {extendedCrewData.filter(c => c.status === 'Training').map(crew => (
                      <div key={crew.id} className="border-b pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold">{crew.name}</div>
                            <div className="text-sm text-gray-600">{crew.trainingType}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Location: Training Center</div>
                            <div className="text-xs text-gray-500">Expected completion: Nov 23 16:00</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4 flex-wrap">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Call Out Reserve
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Contact Crew
                </button>
                <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                  Override Leave
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Emergency Roster
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SENIORITY LIST */}
          {activeTab === 'seniority' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h2 className="text-2xl font-bold mb-2">COPA AIRLINES SENIORITY LIST</h2>
                <div className="text-sm text-gray-600 mb-4">
                  Last Updated: November 1, 2024
                </div>
                <div className="flex gap-4">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
                    <FileText className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                    Download Excel
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Base: All</option>
                  <option>BUR</option>
                  <option>PTY</option>
                  <option>LAX</option>
                </select>
                <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Role: All</option>
                  <option>Captains</option>
                  <option>First Officers</option>
                  <option>Flight Attendants</option>
                </select>
              </div>

              {/* Seniority Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">NAME</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">ROLE</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">BASE</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">HIRE DATE</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">YRS</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...extendedCrewData].sort((a, b) => b.seniority - a.seniority).map((crew, idx) => (
                      <tr key={crew.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-semibold">{idx + 1}</td>
                        <td className="px-4 py-3">{crew.name}</td>
                        <td className="px-4 py-3 text-sm">{crew.role}</td>
                        <td className="px-4 py-3 text-sm">{crew.base}</td>
                        <td className="px-4 py-3 text-sm">{new Date(crew.hireDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm">{crew.years}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            crew.status === 'Active' ? 'bg-green-100 text-green-700' :
                            crew.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {crew.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>Showing 1-{extendedCrewData.length} of {extendedCrewData.length}</div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Previous</button>
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Next</button>
                </div>
              </div>

              {/* Seniority Info Panel */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="text-blue-600" />
                  <h3 className="font-bold text-lg">SENIORITY SYSTEM</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">Seniority is used for:</h4>
                    <ul className="list-disc list-inside ml-4 text-gray-700">
                      <li>Bidding priority</li>
                      <li>Base transfers</li>
                      <li>Vacation scheduling</li>
                      <li>Layoff/recall order</li>
                      <li>Trip assignments (when requested)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold">Seniority Date:</h4>
                    <p className="text-gray-700">Based on hire date<br />Tie-breaker: Application date</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Recalculation Schedule:</h4>
                    <p className="text-gray-700">
                      Last Recalculation: Nov 1, 2024<br />
                      Next Recalculation: Dec 1, 2024
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Changes This Month:</h4>
                    <ul className="list-disc list-inside ml-4 text-gray-700">
                      <li>3 new hires (bottom of list)</li>
                      <li>1 retirement (removed)</li>
                      <li>2 leave of absence (marked)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">View Change History</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Report Error</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 py-4">
        Powered by AI from dCortex
      </div>
    </div>
  );
}
