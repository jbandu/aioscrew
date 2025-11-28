/**
 * Fleet Data Management Card
 *
 * Main dashboard component for managing fleet data scraping, backups, and quality monitoring.
 * Displays airline status, active jobs, recent updates, and allows triggering new scraping jobs.
 */

import { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Circle,
  PlayCircle,
  Loader2,
  TrendingUp,
  Calendar,
  Activity,
  Info,
  X
} from 'lucide-react';
import { fleetScraperClient, AirlineStatus, ScrapeJob, configureFleetScraperClient } from '../lib/fleet-scraper-client';
import { io, Socket } from 'socket.io-client';

// Get main API URL from environment or use production backend
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

const WS_URL = import.meta.env.VITE_WS_URL ||
  (import.meta.env.DEV ? 'ws://localhost:3001' : window.location.origin.replace('http', 'ws'));

// Fleet/Aircraft API Configuration (separate service)
const AIRCRAFT_API_URL = import.meta.env.VITE_AIRCRAFT_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : 'https://aircraft-database-mcp-production.up.railway.app');

const AIRCRAFT_API_KEY = import.meta.env.VITE_AIRCRAFT_API_KEY || 'dev_key_12345';

// Configure the fleet scraper client with the aircraft API URL and key
configureFleetScraperClient(AIRCRAFT_API_URL, AIRCRAFT_API_KEY);

interface ProgressEvent {
  airlineCode: string;
  jobId?: string;
  phase: string;
  message: string;
  progress: number;
  timestamp: string;
}

export default function FleetDataManagementCard() {
  const [airlines, setAirlines] = useState<AirlineStatus[]>([]);
  const [activeJobs, setActiveJobs] = useState<ScrapeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [progressEvents, setProgressEvents] = useState<ProgressEvent[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Load airline statuses and active jobs
  const loadData = async () => {
    try {
      setRefreshing(true);
      console.log('[FleetDataManagement] Starting data load...');
      console.log('[FleetDataManagement] Fetching from:', API_URL + '/api/v1/airlines/status');

      const [airlineData, jobsData] = await Promise.all([
        fleetScraperClient.getAllAirlineStatuses(),
        fleetScraperClient.getActiveJobs()
      ]);

      console.log('[FleetDataManagement] Data loaded successfully:', {
        airlines: airlineData.length,
        jobs: jobsData.length
      });

      setAirlines(airlineData);
      setActiveJobs(jobsData);
      setError(null);
    } catch (err) {
      console.error('[FleetDataManagement] Error loading fleet data:', err);
      console.error('[FleetDataManagement] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        type: err?.constructor?.name
      });
      setError(`Failed to load fleet data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Set up WebSocket connection for real-time progress updates
  useEffect(() => {
    const socketInstance = io(API_URL, {
      transports: ['websocket'],
      reconnection: true
    });

    socketInstance.on('connect', () => {
      console.log('[WebSocket] Connected to server');
    });

    socketInstance.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from server');
    });

    socketInstance.on('scraping:progress', (event: ProgressEvent) => {
      console.log('[WebSocket] Progress event:', event);
      setProgressEvents(prev => {
        // Keep only last 10 events
        const newEvents = [...prev, event].slice(-10);
        return newEvents;
      });

      // Auto-remove event after 10 seconds if it's the final event
      if (event.progress >= 100) {
        setTimeout(() => {
          setProgressEvents(prev => prev.filter(e => e.timestamp !== event.timestamp));
        }, 10000);
      }
    });

    socketInstance.on('scraping:error', (error: any) => {
      console.error('[WebSocket] Scraping error:', error);
      setProgressEvents(prev => [
        ...prev,
        {
          airlineCode: error.airlineCode || 'UNKNOWN',
          phase: 'error',
          message: `Error: ${error.error}`,
          progress: 0,
          timestamp: new Date().toISOString()
        }
      ]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'good':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Good'
        };
      case 'stale':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          label: 'Stale'
        };
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          label: 'Critical'
        };
      case 'empty':
      default:
        return {
          icon: Circle,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          label: 'Empty'
        };
    }
  };

  // Trigger update for an airline
  const handleTriggerUpdate = async (airlineCode: string) => {
    try {
      await fleetScraperClient.createScrapingJob({
        airlineCode,
        jobType: 'quick_update',
        priority: 'normal',
        backupBeforeUpdate: true,
        notifyOnComplete: false
      });
      // Reload data to show new job
      loadData();
    } catch (err) {
      console.error('Error triggering update:', err);
      alert('Failed to start scraping job');
    }
  };

  // Cancel a specific job
  const handleCancelJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this job?')) {
      return;
    }

    try {
      await fleetScraperClient.cancelJob(jobId);
      // Reload data to update job status
      loadData();
    } catch (err) {
      console.error('Error cancelling job:', err);
      alert('Failed to cancel job');
    }
  };

  // Cancel all active jobs
  const handleCancelAllJobs = async () => {
    if (activeJobs.length === 0) return;

    if (!confirm(`Are you sure you want to cancel all ${activeJobs.length} active jobs?`)) {
      return;
    }

    try {
      // Cancel all jobs in parallel
      await Promise.all(
        activeJobs.map(job => fleetScraperClient.cancelJob(job.jobId))
      );
      // Reload data to update job statuses
      loadData();
    } catch (err) {
      console.error('Error cancelling jobs:', err);
      alert('Failed to cancel all jobs');
    }
  };

  // Format last updated time
  const formatLastUpdated = (timestamp: string | null, days: number | null) => {
    if (!timestamp) return 'Never';
    if (days === null) return 'Never';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md border-2 border-blue-500 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading fleet data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md border-2 border-red-500 p-6">
        <div className="flex items-center justify-center h-64">
          <XCircle className="w-8 h-8 text-red-600" />
          <span className="ml-3 text-red-600">{error}</span>
          <button
            onClick={loadData}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalAirlines = airlines.length;
  const airlinesNeedingUpdate = airlines.filter(a => a.needsUpdate).length;
  const totalFleetSize = airlines.reduce((sum, a) => sum + a.fleetSize, 0);
  const avgConfidence = airlines.length > 0
    ? (airlines.reduce((sum, a) => sum + (a.averageConfidence || 0), 0) / airlines.length)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-md border-2 border-blue-500 transition-all duration-300 hover:shadow-blue-500/20">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Fleet Data Management & Scraping
              </h3>
              <p className="text-sm text-gray-600">
                Monitor and update airline fleet data with AI-powered web scraping
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 font-medium mb-1">Total Airlines</div>
            <div className="text-2xl font-bold text-blue-900">{totalAirlines}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-xs text-orange-600 font-medium mb-1">Needs Update</div>
            <div className="text-2xl font-bold text-orange-900">{airlinesNeedingUpdate}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-green-600 font-medium mb-1">Total Aircraft</div>
            <div className="text-2xl font-bold text-green-900">{totalFleetSize}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-xs text-purple-600 font-medium mb-1">Avg Confidence</div>
            <div className="text-2xl font-bold text-purple-900">
              {avgConfidence > 0 ? `${(avgConfidence * 100).toFixed(0)}%` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Airline Status Table */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Airline Data Status
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Airline
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Fleet Size
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Last Updated
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Confidence
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {airlines.map((airline) => {
                const statusDisplay = getStatusDisplay(airline.dataStatus);
                const StatusIcon = statusDisplay.icon;

                return (
                  <tr key={airline.code} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900">{airline.code}</div>
                        <div className="text-sm text-gray-500">{airline.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusDisplay.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {airline.fleetSize > 0 ? airline.fleetSize : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {formatLastUpdated(airline.lastUpdated, airline.daysSinceUpdate)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm text-gray-600">
                        {airline.averageConfidence
                          ? `${(airline.averageConfidence * 100).toFixed(0)}%`
                          : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTriggerUpdate(airline.code)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PlayCircle className="w-3 h-3" />
                        Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Jobs Monitor */}
      {activeJobs.length > 0 && (
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              Active Scraping Jobs ({activeJobs.length})
            </h4>
            <button
              onClick={handleCancelAllJobs}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Cancel All
            </button>
          </div>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div
                key={job.jobId}
                className="bg-white rounded-lg p-4 border border-blue-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{job.airlineCode}</span>
                    <span className="text-sm text-gray-500">{job.airlineName}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{job.progress}%</span>
                    <button
                      onClick={() => handleCancelJob(job.jobId)}
                      className="p-1 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                      title="Cancel job"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Discovered:</span> {job.discoveredCount}
                  </div>
                  <div>
                    <span className="font-medium">Processed:</span> {job.processedCount}
                  </div>
                  <div>
                    <span className="font-medium">New:</span> {job.newCount}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {job.updatedCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer with Quick Actions */}
      <div className="p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Last refreshed: {new Date().toLocaleTimeString()}
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors">
              View History
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Data Quality Report
            </button>
          </div>
        </div>
      </div>

      {/* Progress Notifications - Fixed position at bottom right */}
      {progressEvents.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
          {progressEvents.map((event, index) => (
            <div
              key={`${event.timestamp}-${index}`}
              className="bg-white rounded-lg shadow-lg border-l-4 border-blue-500 p-4 animate-slide-in"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {event.phase === 'error' ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : event.progress >= 100 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {event.airlineCode}
                    </span>
                    <button
                      onClick={() => setProgressEvents(prev => prev.filter((_, i) => i !== index))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{event.message}</p>
                  {event.progress > 0 && event.progress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${event.progress}%` }}
                      />
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
