import { useState, useEffect } from 'react';
import { Plane, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, Loader, Wrench, Archive, BarChart3, PieChart, Globe, Building2 } from 'lucide-react';

interface AirlineFleetOverview {
  iata_code: string;
  name: string;
  country: string;
  fleet_size: number;
  active_aircraft: number;
  in_maintenance: number;
  stored: number;
}

interface FleetStatistics {
  total_airlines: number;
  total_aircraft: number;
  aircraft_types: number;
  avg_age_years: number;
  active_count: number;
  maintenance_count: number;
  stored_count: number;
}

interface AircraftTypeBreakdown {
  aircraft_type: string;
  manufacturer: string;
  count: number;
  avg_age: number;
  active_count: number;
}

interface AircraftDetail {
  registration: string;
  aircraft_type: string;
  manufacturer: string;
  model_name: string;
  status: string;
  age_years: number;
  delivery_date: string;
}

interface FleetManagementPageProps {
  onBack?: () => void;
}

export default function FleetManagementPage({ onBack }: FleetManagementPageProps) {
  const [fleetOverview, setFleetOverview] = useState<AirlineFleetOverview[]>([]);
  const [statistics, setStatistics] = useState<FleetStatistics | null>(null);
  const [aircraftTypes, setAircraftTypes] = useState<AircraftTypeBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'types' | 'stats' | 'airline'>('overview');
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);
  const [airlineFleet, setAirlineFleet] = useState<AircraftDetail[]>([]);
  const [airlineLoading, setAirlineLoading] = useState(false);

  useEffect(() => {
    const fetchFleetData = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        // Fetch all fleet data in parallel
        const [overviewRes, statsRes, typesRes] = await Promise.all([
          fetch(`${API_BASE}/api/fleet/overview`),
          fetch(`${API_BASE}/api/fleet/statistics`),
          fetch(`${API_BASE}/api/fleet/types`)
        ]);

        if (!overviewRes.ok || !statsRes.ok || !typesRes.ok) {
          throw new Error('Failed to fetch fleet data');
        }

        const [overviewData, statsData, typesData] = await Promise.all([
          overviewRes.json(),
          statsRes.json(),
          typesRes.json()
        ]);

        if (overviewData.success) setFleetOverview(overviewData.data);
        if (statsData.success) setStatistics(statsData.data);
        if (typesData.success) setAircraftTypes(typesData.data);
      } catch (err) {
        console.error('Error fetching fleet data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load fleet data');
      } finally {
        setLoading(false);
      }
    };

    fetchFleetData();
  }, []);

  // Fetch airline fleet details when airline is selected
  useEffect(() => {
    const fetchAirlineFleet = async () => {
      if (!selectedAirline) {
        setAirlineFleet([]);
        return;
      }

      try {
        setAirlineLoading(true);
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_BASE}/api/fleet/airline/${selectedAirline}`);

        if (!response.ok) {
          throw new Error('Failed to fetch airline fleet');
        }

        const data = await response.json();
        if (data.success) {
          setAirlineFleet(data.data.fleet);
        }
      } catch (err) {
        console.error('Error fetching airline fleet:', err);
        setAirlineFleet([]);
      } finally {
        setAirlineLoading(false);
      }
    };

    fetchAirlineFleet();
  }, [selectedAirline]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-32">
            <Loader className="w-12 h-12 text-blue-400 animate-spin" />
            <span className="ml-4 text-xl text-slate-200">Loading fleet data from MCP Server...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
            )}
          </div>

          <div className="flex items-start gap-4 p-6 bg-red-900/30 border border-red-500/30 rounded-xl backdrop-blur">
            <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-xl font-semibold text-red-200 mb-2">Error Loading Fleet Data</h4>
              <p className="text-red-300 mb-3">{error}</p>
              <p className="text-sm text-red-400">
                Make sure the aircraft database is running and accessible at localhost:5432/aircraft_db
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Fleet Management</h1>
              <p className="text-sm text-blue-300">Powered by Aircraft Database MCP Server</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-300">Connected</span>
          </div>
        </div>

        {/* Global Statistics Hero Section */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 border border-blue-400/30 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <Plane className="w-8 h-8 text-blue-100" />
                <span className="text-sm font-medium text-blue-100 uppercase tracking-wide">Total Aircraft</span>
              </div>
              <div className="text-5xl font-bold text-white mb-2">{statistics.total_aircraft.toLocaleString()}</div>
              <div className="text-sm text-blue-200">
                Across {statistics.total_airlines} airlines • {statistics.aircraft_types} types
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 border border-green-400/30 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-8 h-8 text-green-100" />
                <span className="text-sm font-medium text-green-100 uppercase tracking-wide">Active</span>
              </div>
              <div className="text-5xl font-bold text-white mb-2">{statistics.active_count.toLocaleString()}</div>
              <div className="text-sm text-green-200">
                {((statistics.active_count / statistics.total_aircraft) * 100).toFixed(1)}% operational readiness
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6 border border-orange-400/30 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <Wrench className="w-8 h-8 text-orange-100" />
                <span className="text-sm font-medium text-orange-100 uppercase tracking-wide">Maintenance</span>
              </div>
              <div className="text-5xl font-bold text-white mb-2">{statistics.maintenance_count.toLocaleString()}</div>
              <div className="text-sm text-orange-200">
                {((statistics.maintenance_count / statistics.total_aircraft) * 100).toFixed(1)}% under service
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl p-6 border border-gray-400/30 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <Archive className="w-8 h-8 text-gray-100" />
                <span className="text-sm font-medium text-gray-100 uppercase tracking-wide">Stored</span>
              </div>
              <div className="text-5xl font-bold text-white mb-2">{statistics.stored_count.toLocaleString()}</div>
              <div className="text-sm text-gray-200">
                {((statistics.stored_count / statistics.total_aircraft) * 100).toFixed(1)}% in storage
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white/10 p-2 rounded-xl backdrop-blur border border-white/20">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Globe className="w-5 h-5" />
            Airline Fleet Overview
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'types'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <PieChart className="w-5 h-5" />
            Aircraft Types
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Detailed Statistics
          </button>
          <button
            onClick={() => setActiveTab('airline')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'airline'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Building2 className="w-5 h-5" />
            Airline Details
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Globe className="w-7 h-7 text-blue-400" />
              Fleet Overview by Airline
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {fleetOverview.map((airline) => (
                <div
                  key={airline.iata_code}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all hover:border-blue-400/50 backdrop-blur"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-lg">
                          {airline.iata_code}
                        </span>
                        <span className="text-lg font-semibold text-white">{airline.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Globe className="w-4 h-4" />
                        {airline.country}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-white mb-1">{airline.fleet_size}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">Aircraft</div>
                    </div>
                  </div>

                  {/* Visual Status Bar */}
                  <div className="mb-4">
                    <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
                      {airline.active_aircraft > 0 && (
                        <div
                          className="bg-green-500"
                          style={{ width: `${(airline.active_aircraft / airline.fleet_size) * 100}%` }}
                          title={`${airline.active_aircraft} active`}
                        />
                      )}
                      {airline.in_maintenance > 0 && (
                        <div
                          className="bg-orange-500"
                          style={{ width: `${(airline.in_maintenance / airline.fleet_size) * 100}%` }}
                          title={`${airline.in_maintenance} in maintenance`}
                        />
                      )}
                      {airline.stored > 0 && (
                        <div
                          className="bg-gray-500"
                          style={{ width: `${(airline.stored / airline.fleet_size) * 100}%` }}
                          title={`${airline.stored} stored`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">{airline.active_aircraft}</div>
                      <div className="text-xs text-green-300 uppercase tracking-wide">Active</div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-400">{airline.in_maintenance}</div>
                      <div className="text-xs text-orange-300 uppercase tracking-wide">Maintenance</div>
                    </div>
                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-400">{airline.stored}</div>
                      <div className="text-xs text-gray-300 uppercase tracking-wide">Stored</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'types' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <PieChart className="w-7 h-7 text-blue-400" />
              Top Aircraft Types
            </h2>
            <div className="space-y-4">
              {aircraftTypes.map((type, index) => (
                <div
                  key={`${type.manufacturer}-${type.aircraft_type}`}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all hover:border-blue-400/50 backdrop-blur"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white font-bold text-2xl rounded-full border-4 border-blue-400/30">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white mb-1">{type.aircraft_type}</div>
                        <div className="text-sm text-slate-400">{type.manufacturer}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-bold text-blue-400 mb-1">{type.count}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">In Fleet</div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mb-4">
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{
                          width: `${(type.count / (aircraftTypes[0]?.count || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <span className="text-sm text-green-300 uppercase tracking-wide">Active:</span>
                      <span className="text-xl font-bold text-green-400">{type.active_count}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <span className="text-sm text-blue-300 uppercase tracking-wide">Avg Age:</span>
                      <span className="text-xl font-bold text-blue-400">
                        {type.avg_age ? `${type.avg_age} yrs` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && statistics && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-blue-400" />
              Detailed Fleet Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fleet Composition */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Plane className="w-6 h-6 text-blue-400" />
                  Fleet Composition
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-300">Total Airlines</span>
                    <span className="text-2xl font-bold text-white">{statistics.total_airlines}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-300">Total Aircraft</span>
                    <span className="text-2xl font-bold text-white">{statistics.total_aircraft}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-300">Aircraft Types</span>
                    <span className="text-2xl font-bold text-white">{statistics.aircraft_types}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-300">Average Fleet Age</span>
                    <span className="text-2xl font-bold text-white">
                      {statistics.avg_age_years ? `${statistics.avg_age_years} yrs` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operational Status */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  Operational Status
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-300 font-medium">Active Aircraft</span>
                      <span className="text-3xl font-bold text-green-400">{statistics.active_count}</span>
                    </div>
                    <div className="h-2 bg-green-900/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(statistics.active_count / statistics.total_aircraft) * 100}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-green-300 mt-1">
                      {((statistics.active_count / statistics.total_aircraft) * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-orange-300 font-medium">Under Maintenance</span>
                      <span className="text-3xl font-bold text-orange-400">{statistics.maintenance_count}</span>
                    </div>
                    <div className="h-2 bg-orange-900/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${(statistics.maintenance_count / statistics.total_aircraft) * 100}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-orange-300 mt-1">
                      {((statistics.maintenance_count / statistics.total_aircraft) * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 font-medium">In Storage</span>
                      <span className="text-3xl font-bold text-gray-400">{statistics.stored_count}</span>
                    </div>
                    <div className="h-2 bg-gray-900/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-500"
                        style={{ width: `${(statistics.stored_count / statistics.total_aircraft) * 100}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-gray-300 mt-1">
                      {((statistics.stored_count / statistics.total_aircraft) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MCP Server Info */}
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6 backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600/30 rounded-lg">
                  <Plane className="w-8 h-8 text-blue-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Data Source: Aircraft Database MCP Server</h3>
                  <p className="text-slate-300 mb-3">
                    Connected to PostgreSQL database at <code className="px-2 py-1 bg-slate-800 rounded text-blue-300">localhost:5432/aircraft_db</code>
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Real-time data synchronization active
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'airline' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Building2 className="w-7 h-7 text-blue-400" />
              Airline Fleet Details
            </h2>

            {/* Airline Selector */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Select an Airline to View Fleet Details
              </label>
              <select
                value={selectedAirline || ''}
                onChange={(e) => setSelectedAirline(e.target.value || null)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Choose an Airline --</option>
                {fleetOverview.map((airline) => (
                  <option key={airline.iata_code} value={airline.iata_code}>
                    {airline.iata_code} - {airline.name} ({airline.fleet_size} aircraft)
                  </option>
                ))}
              </select>
            </div>

            {/* Loading State */}
            {airlineLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-400 animate-spin" />
                <span className="ml-3 text-slate-300">Loading aircraft details...</span>
              </div>
            )}

            {/* No Airline Selected */}
            {!selectedAirline && !airlineLoading && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-8 text-center">
                <Building2 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select an Airline</h3>
                <p className="text-slate-400">
                  Choose an airline from the dropdown above to view detailed fleet information
                </p>
              </div>
            )}

            {/* Aircraft List */}
            {selectedAirline && !airlineLoading && airlineFleet.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {airlineFleet.length} Aircraft in Fleet
                  </h3>
                  <div className="text-sm text-slate-400">
                    Airline: {fleetOverview.find(a => a.iata_code === selectedAirline)?.name}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {airlineFleet.map((aircraft, index) => (
                    <div
                      key={`${aircraft.registration}-${index}`}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all hover:border-blue-400/50 backdrop-blur"
                    >
                      {/* Aircraft Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-lg font-bold text-blue-400 mb-1">
                            {aircraft.registration}
                          </div>
                          <div className="text-sm text-slate-400">
                            {aircraft.manufacturer} {aircraft.model_name}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          aircraft.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : aircraft.status === 'maintenance'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {aircraft.status.toUpperCase()}
                        </div>
                      </div>

                      {/* Aircraft Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2 border-t border-white/5">
                          <span className="text-xs text-slate-500 uppercase">Type</span>
                          <span className="text-sm text-slate-300 font-medium">{aircraft.aircraft_type}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-white/5">
                          <span className="text-xs text-slate-500 uppercase">Age</span>
                          <span className="text-sm text-slate-300 font-medium">
                            {aircraft.age_years ? `${aircraft.age_years} years` : 'N/A'}
                          </span>
                        </div>
                        {aircraft.delivery_date && (
                          <div className="flex items-center justify-between py-2 border-t border-white/5">
                            <span className="text-xs text-slate-500 uppercase">Delivered</span>
                            <span className="text-sm text-slate-300 font-medium">
                              {new Date(aircraft.delivery_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Aircraft Found */}
            {selectedAirline && !airlineLoading && airlineFleet.length === 0 && (
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Aircraft Found</h3>
                <p className="text-slate-400">
                  No aircraft data available for this airline
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
