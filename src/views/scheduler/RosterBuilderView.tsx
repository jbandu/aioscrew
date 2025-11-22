import { useState } from 'react';
import { Plus, Sparkles, CheckCircle, AlertTriangle, User, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import StatCard from '../../components/scheduler/StatCard';
import GanttChart from '../../components/scheduler/GanttChart';
import TripCard from '../../components/scheduler/TripCard';
import CrewAssignmentCard from '../../components/scheduler/CrewAssignmentCard';
import OptimizationResults from '../../components/scheduler/OptimizationResults';
import BiddingTable from '../../components/scheduler/BiddingTable';
import { crewMembers } from '../../data/mockData';

interface RosterBuilderViewProps {
  onBack?: () => void;
}

export default function RosterBuilderView({ onBack }: RosterBuilderViewProps) {
  const [activeTab, setActiveTab] = useState('monthly-overview');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [selectedCrew, setSelectedCrew] = useState<any>(null);

  // Mock data for demonstration
  const mockGanttData = [
    {
      id: 'CM001',
      name: 'Sarah Martinez',
      assignments: [
        { startDay: 1, duration: 3, type: 'international' as const, tripNumber: 'P-450' },
        { startDay: 4, duration: 2, type: 'off' as const },
        { startDay: 6, duration: 4, type: 'domestic' as const, tripNumber: 'P-230' },
        { startDay: 10, duration: 1, type: 'training' as const },
        { startDay: 11, duration: 3, type: 'international' as const, tripNumber: 'P-447' },
        { startDay: 14, duration: 2, type: 'off' as const },
        { startDay: 16, duration: 3, type: 'reserve' as const },
        { startDay: 19, duration: 4, type: 'international' as const, tripNumber: 'P-505' },
        { startDay: 23, duration: 2, type: 'off' as const },
        { startDay: 25, duration: 7, type: 'off' as const }
      ]
    },
    {
      id: 'CM002',
      name: 'John Smith',
      assignments: [
        { startDay: 1, duration: 2, type: 'off' as const },
        { startDay: 3, duration: 4, type: 'international' as const, tripNumber: 'P-320' },
        { startDay: 7, duration: 1, type: 'off' as const },
        { startDay: 8, duration: 3, type: 'domestic' as const, tripNumber: 'P-110' },
        { startDay: 11, duration: 2, type: 'off' as const },
        { startDay: 13, duration: 4, type: 'international' as const, tripNumber: 'P-402' },
        { startDay: 17, duration: 2, type: 'off' as const },
        { startDay: 19, duration: 3, type: 'reserve' as const },
        { startDay: 22, duration: 4, type: 'domestic' as const, tripNumber: 'P-155' },
        { startDay: 26, duration: 6, type: 'off' as const }
      ]
    },
    {
      id: 'CM003',
      name: 'Michael Chen',
      assignments: [
        { startDay: 1, duration: 1, type: 'training' as const },
        { startDay: 2, duration: 3, type: 'domestic' as const, tripNumber: 'P-120' },
        { startDay: 5, duration: 2, type: 'off' as const },
        { startDay: 7, duration: 4, type: 'international' as const, tripNumber: 'P-380' },
        { startDay: 11, duration: 1, type: 'off' as const },
        { startDay: 12, duration: 3, type: 'reserve' as const },
        { startDay: 15, duration: 4, type: 'international' as const, tripNumber: 'P-462' },
        { startDay: 19, duration: 2, type: 'off' as const },
        { startDay: 21, duration: 3, type: 'domestic' as const, tripNumber: 'P-145' },
        { startDay: 24, duration: 8, type: 'off' as const }
      ]
    },
    {
      id: 'CM004',
      name: 'Emily Rodriguez',
      assignments: [
        { startDay: 1, duration: 4, type: 'international' as const, tripNumber: 'P-475' },
        { startDay: 5, duration: 2, type: 'off' as const },
        { startDay: 7, duration: 3, type: 'domestic' as const, tripNumber: 'P-205' },
        { startDay: 10, duration: 1, type: 'off' as const },
        { startDay: 11, duration: 4, type: 'international' as const, tripNumber: 'P-425' },
        { startDay: 15, duration: 2, type: 'off' as const },
        { startDay: 17, duration: 1, type: 'training' as const },
        { startDay: 18, duration: 3, type: 'reserve' as const },
        { startDay: 21, duration: 4, type: 'international' as const, tripNumber: 'P-490' },
        { startDay: 25, duration: 7, type: 'off' as const }
      ]
    },
    {
      id: 'FA012',
      name: 'Jessica Taylor',
      assignments: [
        { startDay: 1, duration: 3, type: 'international' as const, tripNumber: 'P-450' },
        { startDay: 4, duration: 1, type: 'off' as const },
        { startDay: 5, duration: 4, type: 'domestic' as const, tripNumber: 'P-175' },
        { startDay: 9, duration: 2, type: 'off' as const },
        { startDay: 11, duration: 3, type: 'international' as const, tripNumber: 'P-447' },
        { startDay: 14, duration: 1, type: 'off' as const },
        { startDay: 15, duration: 4, type: 'reserve' as const },
        { startDay: 19, duration: 3, type: 'domestic' as const, tripNumber: 'P-188' },
        { startDay: 22, duration: 10, type: 'off' as const }
      ]
    }
  ];

  const mockUnassignedTrips = [
    {
      id: 'T001',
      tripNumber: 'P-777',
      route: 'PTY → LAX → PTY',
      date: 'Dec 25',
      requiredRole: 'Captain',
      aircraft: '737-MAX',
      creditHours: 7.2,
      priority: 'high' as const
    },
    {
      id: 'T002',
      tripNumber: 'P-580',
      route: 'BUR → MIA → BUR',
      date: 'Dec 15',
      requiredRole: 'First Officer',
      aircraft: '737-800',
      creditHours: 8.5,
      priority: 'high' as const
    },
    {
      id: 'T003',
      tripNumber: 'P-320',
      route: 'PTY → SFO',
      date: 'Dec 18',
      requiredRole: 'Captain',
      aircraft: '737-800',
      creditHours: 6.8,
      priority: 'medium' as const
    },
    {
      id: 'T004',
      tripNumber: 'P-245',
      route: 'BUR → GUA → BUR',
      date: 'Dec 22',
      requiredRole: 'First Officer',
      aircraft: '737-MAX',
      creditHours: 9.1,
      priority: 'high' as const
    },
    {
      id: 'T005',
      tripNumber: 'P-190',
      route: 'PTY → MEX → PTY',
      date: 'Dec 12',
      requiredRole: 'Captain',
      aircraft: '737-800',
      creditHours: 7.5,
      priority: 'medium' as const
    }
  ];

  const mockBidResults = [
    {
      id: 'BID001',
      crewName: 'Sarah Martinez',
      role: 'Captain',
      seniority: 8,
      pref1: 'Max credit hours',
      pref2: 'International routes',
      pref3: 'Avoid weekends',
      status: 'granted' as const,
      satisfaction: 5,
      satisfactionPct: 95
    },
    {
      id: 'BID002',
      crewName: 'John Smith',
      role: 'First Officer',
      seniority: 12,
      pref1: 'Vacation Dec 20-31',
      pref2: 'Domestic only',
      pref3: 'Morning departures',
      status: 'granted' as const,
      satisfaction: 5,
      satisfactionPct: 100
    },
    {
      id: 'BID003',
      crewName: 'Michael Chen',
      role: 'First Officer',
      seniority: 15,
      pref1: 'LAX layovers',
      pref2: 'Min 3-day trips',
      pref3: 'Max credit hours',
      status: 'partial' as const,
      satisfaction: 3,
      satisfactionPct: 67
    },
    {
      id: 'BID004',
      crewName: 'Emily Rodriguez',
      role: 'Captain',
      seniority: 5,
      pref1: 'Christmas week off',
      pref2: 'PTY base trips',
      pref3: 'International',
      status: 'denied' as const,
      satisfaction: 2,
      satisfactionPct: 40
    },
    {
      id: 'BID005',
      crewName: 'David Park',
      role: 'First Officer',
      seniority: 18,
      pref1: 'Senior line',
      pref2: 'Max pay',
      pref3: 'No reserve',
      status: 'granted' as const,
      satisfaction: 5,
      satisfactionPct: 92
    }
  ];

  const runOptimization = async () => {
    setIsOptimizing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setOptimizationResults({
      current: {
        cost: 487500,
        violations: 23,
        satisfaction: 6.8,
        utilization: 76
      },
      optimized: {
        cost: 442300,
        violations: 0,
        satisfaction: 8.4,
        utilization: 84
      },
      processingTime: 47,
      iterations: 1247
    });
    setIsOptimizing(false);
  };

  const tabs = [
    { id: 'monthly-overview', label: 'Monthly Overview' },
    { id: 'build-roster', label: 'Build Roster' },
    { id: 'pairing-optimizer', label: 'Pairing Optimizer' },
    { id: 'bidding-awards', label: 'Bidding Awards' }
  ];

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
          <h2 className="text-3xl font-bold">Roster Builder</h2>
        </div>
        <p className="text-blue-100">
          December 2024 • BUR Base • Complete roster planning and optimization
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
          {/* TAB 1: MONTHLY OVERVIEW */}
          {activeTab === 'monthly-overview' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">December 2024 Roster - BUR Base</h2>
                <div className="flex gap-4">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>BUR Base</option>
                    <option>PTY Base</option>
                    <option>LAX Base</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>December 2024</option>
                    <option>January 2025</option>
                    <option>February 2025</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Crew Types</option>
                    <option>Captains</option>
                    <option>First Officers</option>
                    <option>Flight Attendants</option>
                  </select>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-4 gap-4">
                <StatCard
                  title="Total Credit Hours"
                  value="2,847.5"
                  target="Target: 2,800"
                  status="good"
                />
                <StatCard
                  title="Coverage"
                  value="98.3%"
                  subtitle="312 pairings assigned"
                  status="excellent"
                />
                <StatCard
                  title="Uncovered Trips"
                  value="5"
                  subtitle="High Priority"
                  status="warning"
                />
                <StatCard
                  title="Cost vs Budget"
                  value="$487K / $520K"
                  subtitle="Under by 6.3%"
                  status="good"
                />
              </div>

              {/* Gantt Chart */}
              <GanttChart crewMembers={mockGanttData} daysInMonth={31} />

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* Quick Actions */}
                  <div className="flex gap-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Plus className="w-4 h-4" /> Add Pairing
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Import from Excel
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Export Roster
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Publish Draft
                    </button>
                  </div>
                </div>

                {/* AI Insights Panel */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-blue-600 w-5 h-5" />
                    <h3 className="font-bold">AI found 7 optimization opportunities</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white rounded p-3 text-sm">
                      Swap P-447 and P-450 for Smith to save $1,200
                    </div>
                    <div className="bg-white rounded p-3 text-sm">
                      Use Rodriguez as reserve Dec 24-26 to avoid overtime
                    </div>
                    <div className="bg-white rounded p-3 text-sm">
                      3 crew approaching monthly limit - redistribute 4 trips
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Apply Suggestions
                  </button>
                  <button className="w-full mt-2 border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50">
                    Run Optimizer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUILD ROSTER */}
          {activeTab === 'build-roster' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                {/* Left Panel - Crew List */}
                <div className="w-1/3 bg-white rounded-lg shadow p-4">
                  <input
                    type="text"
                    placeholder="Search crew..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="space-y-2 overflow-y-auto max-h-[600px]">
                    {crewMembers.map((crew) => (
                      <CrewAssignmentCard
                        key={crew.id}
                        name={crew.name}
                        role={crew.role}
                        qualification={crew.qualification}
                        availableHours={85 - (crew.seniority * 2)}
                        onAssignTrip={() => setSelectedCrew(crew)}
                      />
                    ))}
                  </div>
                </div>

                {/* Center Panel - Calendar Grid */}
                <div className="flex-1 bg-white rounded-lg shadow p-4">
                  <h3 className="font-bold mb-4">
                    December 2024 - {selectedCrew ? selectedCrew.name : 'Select a crew member'}
                  </h3>

                  {selectedCrew ? (
                    <>
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {[...Array(31)].map((_, day) => (
                          <div
                            key={day}
                            className="border rounded p-2 min-h-[80px] hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="text-xs font-semibold mb-1">{day + 1}</div>
                            {/* Placeholder for assignments */}
                            {day % 5 === 0 && (
                              <div className="text-xs bg-blue-100 rounded p-1">
                                P-{450 + day}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="text-green-600 w-4 h-4" />
                        <span>All assignments legal ✓</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                      <div className="text-center">
                        <User className="w-16 h-16 mx-auto mb-2" />
                        <p>Select a crew member to view their calendar</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Panel - Unassigned Trips */}
                <div className="w-1/4 bg-white rounded-lg shadow p-4">
                  <h3 className="font-bold mb-4">Unassigned Trips ({mockUnassignedTrips.length})</h3>
                  <div className="space-y-2 overflow-y-auto max-h-[600px]">
                    {mockUnassignedTrips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        tripNumber={trip.tripNumber}
                        route={trip.route}
                        date={trip.date}
                        requiredRole={trip.requiredRole}
                        aircraft={trip.aircraft}
                        creditHours={trip.creditHours}
                        priority={trip.priority}
                        draggable={true}
                        onAssign={() => alert(`Assigning ${trip.tripNumber}`)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Toolbar */}
              <div className="flex gap-4 justify-between">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Validate All Assignments
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  AI Auto-Fill Gaps
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Save Draft
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Publish to Crew
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PAIRING OPTIMIZER */}
          {activeTab === 'pairing-optimizer' && (
            <div className="space-y-6">
              {/* Optimization Setup */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Optimization Parameters</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date Range</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Dec 1-31, 2024</option>
                      <option>Jan 1-31, 2025</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Base</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>BUR</option>
                      <option>PTY</option>
                      <option>LAX</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Optimization Goal</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Minimize Cost</option>
                      <option>Maximize Utilization</option>
                      <option>Balance Crew Preferences</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Constraints</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked readOnly className="rounded" />
                      <span className="text-sm">FAA Part 117 Compliance</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked readOnly className="rounded" />
                      <span className="text-sm">CBA Contract Minimums</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked readOnly className="rounded" />
                      <span className="text-sm">Crew Bid Preferences (Weight: 60%)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked readOnly className="rounded" />
                      <span className="text-sm">Max Duty Hours: 12 per day</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={runOptimization}
                  disabled={isOptimizing}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-gray-400"
                >
                  <Sparkles className="w-5 h-5" />
                  {isOptimizing ? 'Running Optimization...' : 'Run AI Optimization'}
                </button>
              </div>

              {/* Results Panel */}
              {optimizationResults && (
                <>
                  <OptimizationResults
                    current={optimizationResults.current}
                    optimized={optimizationResults.optimized}
                    processingTime={optimizationResults.processingTime}
                    iterations={optimizationResults.iterations}
                    onAccept={() => alert('Changes accepted!')}
                    onReject={() => setOptimizationResults(null)}
                    onAdjust={() => alert('Adjust parameters')}
                    onViewDetails={() => alert('View details')}
                  />

                  {/* AI Explanation Panel */}
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="text-blue-600 w-6 h-6" />
                      <h3 className="font-bold text-lg">Why These Changes Work</h3>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-semibold mb-1">1. COST REDUCTION ($12K)</h4>
                        <p className="text-gray-700">
                          Eliminated 7 deadhead flights by better crew positioning.
                          Example: Martinez now starts P-450 in BUR (home base) instead of deadheading from LAX.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-1">2. COMPLIANCE (23 violations fixed)</h4>
                        <p className="text-gray-700">
                          Adjusted 8 trips to meet rest requirements.
                          Redistributed 4 trips from crews near monthly limit.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-1">3. CREW SATISFACTION (+23%)</h4>
                        <p className="text-gray-700">
                          89% of crew preferences honored.
                          Reduced back-to-back overnight trips.
                          More weekend offs distributed fairly.
                        </p>
                      </div>
                    </div>

                    <button className="mt-4 text-blue-600 underline text-sm">
                      View Full Optimization Report
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: BIDDING AWARDS */}
          {activeTab === 'bidding-awards' && (
            <div className="space-y-6">
              {/* Bid Status Overview */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-2">December 2024 Bidding Cycle</h2>
                <div className="text-sm text-gray-600 mb-4">
                  Bid Window: Nov 1-7, 2024 (Closed) | Award Date: Nov 15, 2024
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-semibold">
                    127 crew members • 124 bids submitted (98%)
                  </div>
                  <div className="text-sm">
                    Status: Awards Generated ✓ | Published: Nov 15 at 9:00 AM
                  </div>
                </div>
              </div>

              {/* Bid Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="font-semibold mb-2">By Seniority</h4>
                  <div className="space-y-1 text-sm">
                    <div>Captains: 45</div>
                    <div>First Officers: 58</div>
                    <div>Flight Attendants: 24</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="font-semibold mb-2">By Preference Type</h4>
                  <div className="space-y-1 text-sm">
                    <div>Vacation: 78</div>
                    <div>Max Hours: 43</div>
                    <div>Specific Routes: 56</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="font-semibold mb-2">By Award Status</h4>
                  <div className="space-y-1 text-sm">
                    <div className="text-green-600">Granted: 89%</div>
                    <div className="text-yellow-600">Partial: 8%</div>
                    <div className="text-red-600">Denied: 3%</div>
                  </div>
                </div>
              </div>

              {/* Bidding Table */}
              <BiddingTable
                bidResults={mockBidResults}
                onViewDetails={(bidId) => alert(`Viewing bid ${bidId}`)}
              />

              {/* AI Conflict Resolution */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-yellow-600 w-5 h-5" />
                  <h3 className="font-bold">12 CONFLICTS DETECTED</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Conflict #1: Priority Trip Overlap</h4>
                    <div className="text-sm text-gray-700 mb-2">
                      • P-447 (Int'l to LAX, Dec 25)
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      • Bid by: Martinez (Senior #8), Wilson (#12), Chen (#15)
                    </div>
                    <div className="text-sm mb-2">
                      <span className="font-semibold">AI Recommendation:</span> Award to Martinez (seniority + preference match)
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Accept AI
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        Manual Resolve
                      </button>
                    </div>
                  </div>
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
