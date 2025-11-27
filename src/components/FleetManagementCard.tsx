import { useState, useEffect } from 'react';
import { Plane, TrendingUp, AlertTriangle, CheckCircle, Loader, ChevronDown, ChevronUp, Wrench, Archive } from 'lucide-react';

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

export default function FleetManagementCard() {
  const [fleetOverview, setFleetOverview] = useState<AirlineFleetOverview[]>([]);
  const [statistics, setStatistics] = useState<FleetStatistics | null>(null);
  const [aircraftTypes, setAircraftTypes] = useState<AircraftTypeBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedView, setExpandedView] = useState<'overview' | 'types' | null>(null);

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">Loading fleet data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900">Error Loading Fleet Data</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <p className="text-xs text-red-600 mt-2">
              Make sure the aircraft database is running and accessible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fleet Management</h2>
            <p className="text-sm text-gray-600">Aircraft Database via MCP Server</p>
          </div>
        </div>
      </div>

      {/* Global Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Plane className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Total Aircraft</span>
            </div>
            <div className="text-3xl font-bold text-blue-900">{statistics.total_aircraft.toLocaleString()}</div>
            <div className="text-xs text-blue-700 mt-1">{statistics.aircraft_types} types</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-xs font-medium text-green-900">Active</span>
            </div>
            <div className="text-3xl font-bold text-green-900">{statistics.active_count.toLocaleString()}</div>
            <div className="text-xs text-green-700 mt-1">
              {((statistics.active_count / statistics.total_aircraft) * 100).toFixed(1)}% operational
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-5 h-5 text-orange-600" />
              <span className="text-xs font-medium text-orange-900">Maintenance</span>
            </div>
            <div className="text-3xl font-bold text-orange-900">{statistics.maintenance_count.toLocaleString()}</div>
            <div className="text-xs text-orange-700 mt-1">
              {((statistics.maintenance_count / statistics.total_aircraft) * 100).toFixed(1)}% in service
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Archive className="w-5 h-5 text-gray-600" />
              <span className="text-xs font-medium text-gray-900">Stored</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{statistics.stored_count.toLocaleString()}</div>
            <div className="text-xs text-gray-700 mt-1">Avg age: {statistics.avg_age_years} years</div>
          </div>
        </div>
      )}

      {/* Fleet Overview by Airline */}
      <div>
        <button
          onClick={() => setExpandedView(expandedView === 'overview' ? null : 'overview')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Fleet Overview by Airline</h3>
          {expandedView === 'overview' ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {expandedView === 'overview' && (
          <div className="mt-4 space-y-3">
            {fleetOverview.slice(0, 10).map((airline) => (
              <div
                key={airline.iata_code}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{airline.iata_code}</span>
                      <span className="text-sm text-gray-600">•</span>
                      <span className="text-sm font-medium text-gray-900">{airline.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{airline.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{airline.fleet_size}</div>
                    <div className="text-xs text-gray-500">aircraft</div>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-700">{airline.active_aircraft}</div>
                    <div className="text-xs text-green-600">Active</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="text-lg font-bold text-orange-700">{airline.in_maintenance}</div>
                    <div className="text-xs text-orange-600">Maintenance</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-700">{airline.stored}</div>
                    <div className="text-xs text-gray-600">Stored</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aircraft Types Breakdown */}
      <div>
        <button
          onClick={() => setExpandedView(expandedView === 'types' ? null : 'types')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Top Aircraft Types</h3>
          {expandedView === 'types' ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {expandedView === 'types' && (
          <div className="mt-4 space-y-3">
            {aircraftTypes.map((type, index) => (
              <div
                key={`${type.manufacturer}-${type.aircraft_type}`}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-full">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{type.aircraft_type}</div>
                      <div className="text-sm text-gray-600">{type.manufacturer}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{type.count}</div>
                    <div className="text-xs text-gray-500">aircraft</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-xs text-green-600">Active:</span>
                    <span className="text-sm font-bold text-green-700">{type.active_count}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Avg Age:</span>
                    <span className="text-sm font-bold text-gray-700">{type.avg_age} yrs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MCP Connection Status */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-600">
          Connected to Aircraft Database MCP Server (localhost:5432/aircraft_db)
        </span>
      </div>
    </div>
  );
}
