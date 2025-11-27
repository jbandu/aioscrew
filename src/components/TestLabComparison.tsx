import { useState, useEffect } from 'react';
import { X, TrendingUp, Lightbulb, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface TestLabComparisonProps {
  onClose: () => void;
  currentExecutionId?: number;
}

interface Execution {
  id: number;
  scenario_id: string;
  scenario_name: string;
  client_name: string | null;
  started_at: string;
  completed_at: string;
  results: any;
}

interface ComparisonData {
  executions: Execution[];
  comparison: {
    approvalRates: Array<{ scenario: string; rate: number; count: number }>;
    processingTimes: Array<{ scenario: string; avgTime: number; formatted: string }>;
    escalationRates: Array<{ scenario: string; rate: number; count: number }>;
    agentPerformance: Record<string, {
      agent: string;
      scenarios: Array<{ scenario: string; accuracy: number; avgTime: number; processed: number }>;
    }>;
  };
  insights: string[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TestLabComparison({ onClose, currentExecutionId }: TestLabComparisonProps) {
  const [recentExecutions, setRecentExecutions] = useState<Execution[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(currentExecutionId ? [currentExecutionId] : []);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentExecutions();
  }, []);

  const fetchRecentExecutions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/test-lab/executions?limit=20');
      const data = await response.json();

      if (data.success) {
        setRecentExecutions(data.executions);
      }
    } catch (err) {
      console.error('Error fetching executions:', err);
      setError('Failed to load executions');
    }
  };

  const handleToggleExecution = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else if (prev.length < 4) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      setError('Please select at least 2 executions to compare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/test-lab/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executionIds: selectedIds })
      });

      const data = await response.json();

      if (data.success) {
        setComparisonData(data);
      } else {
        setError(data.error || 'Failed to compare executions');
      }
    } catch (err) {
      console.error('Error comparing:', err);
      setError('Failed to compare executions');
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (value: number, metric: string): string => {
    // For approval rates and accuracy, higher is better (green)
    // For escalation rates and processing times, lower is better (green)
    if (metric === 'approval' || metric === 'accuracy') {
      if (value >= 90) return 'text-green-400';
      if (value >= 75) return 'text-yellow-400';
      return 'text-red-400';
    } else if (metric === 'escalation') {
      if (value <= 10) return 'text-green-400';
      if (value <= 20) return 'text-yellow-400';
      return 'text-red-400';
    }
    return 'text-gray-300';
  };

  const getBgColor = (value: number, allValues: number[], lowerIsBetter: boolean): string => {
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);

    if (lowerIsBetter) {
      if (value === min) return 'bg-green-500/20';
      if (value === max) return 'bg-red-500/20';
    } else {
      if (value === max) return 'bg-green-500/20';
      if (value === min) return 'bg-red-500/20';
    }
    return 'bg-transparent';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-xl shadow-2xl border border-cyan-500/30">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Scenario Comparison</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="m-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Selection Section */}
          {!comparisonData && (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Select Executions to Compare</h3>
                <p className="text-sm text-gray-400">Choose 2-4 completed executions ({selectedIds.length}/4 selected)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {recentExecutions.map((execution) => (
                  <button
                    key={execution.id}
                    onClick={() => handleToggleExecution(execution.id)}
                    disabled={!selectedIds.includes(execution.id) && selectedIds.length >= 4}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedIds.includes(execution.id)
                        ? 'bg-cyan-500/20 border-cyan-500'
                        : 'bg-white/5 border-white/10 hover:border-cyan-500/50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{execution.scenario_name}</h4>
                        <span className="text-xs text-cyan-300">{execution.client_name}</span>
                      </div>
                      {selectedIds.includes(execution.id) && (
                        <CheckCircle className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Execution #{execution.id} • {new Date(execution.started_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleCompare}
                disabled={selectedIds.length < 2 || loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Compare Selected Executions
                  </>
                )}
              </button>
            </div>
          )}

          {/* Comparison Results */}
          {comparisonData && (
            <div className="p-6 space-y-6">
              {/* Insights Panel */}
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Key Insights</h3>
                </div>
                <ul className="space-y-2">
                  {comparisonData.insights.map((insight, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grouped Bar Chart - Decision Rates */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-white mb-4">Decision Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={comparisonData.comparison.approvalRates.map((item, idx) => ({
                      scenario: item.scenario.substring(0, 20),
                      Approval: item.rate,
                      Escalation: comparisonData.comparison.escalationRates[idx]?.rate || 0,
                      Rejection: 100 - item.rate - (comparisonData.comparison.escalationRates[idx]?.rate || 0)
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="scenario" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                        labelStyle={{ color: '#f1f5f9' }}
                      />
                      <Legend />
                      <Bar dataKey="Approval" fill="#10b981" />
                      <Bar dataKey="Escalation" fill="#f59e0b" />
                      <Bar dataKey="Rejection" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Line Chart - Processing Times */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-white mb-4">Processing Time Comparison</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={comparisonData.comparison.processingTimes.map(item => ({
                      scenario: item.scenario.substring(0, 20),
                      time: item.avgTime
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="scenario" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                        labelStyle={{ color: '#f1f5f9' }}
                        formatter={(value: any) => [`${value}ms`, 'Avg Time']}
                      />
                      <Line type="monotone" dataKey="time" stroke="#06b6d4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-5 overflow-x-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Detailed Metrics Comparison</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 text-gray-300">Metric</th>
                      {comparisonData.executions.map((exec) => (
                        <th key={exec.id} className="text-center py-3 text-gray-300">
                          {exec.scenario_name.substring(0, 15)}...
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Approval Rate */}
                    <tr className="border-b border-white/10">
                      <td className="py-3 text-gray-400">Approval Rate</td>
                      {comparisonData.comparison.approvalRates.map((item, idx) => {
                        const allRates = comparisonData.comparison.approvalRates.map(r => r.rate);
                        return (
                          <td
                            key={idx}
                            className={`text-center py-3 ${getMetricColor(item.rate, 'approval')} ${getBgColor(item.rate, allRates, false)}`}
                          >
                            {item.rate.toFixed(1)}%
                          </td>
                        );
                      })}
                    </tr>

                    {/* Escalation Rate */}
                    <tr className="border-b border-white/10">
                      <td className="py-3 text-gray-400">Escalation Rate</td>
                      {comparisonData.comparison.escalationRates.map((item, idx) => {
                        const allRates = comparisonData.comparison.escalationRates.map(r => r.rate);
                        return (
                          <td
                            key={idx}
                            className={`text-center py-3 ${getMetricColor(item.rate, 'escalation')} ${getBgColor(item.rate, allRates, true)}`}
                          >
                            {item.rate.toFixed(1)}%
                          </td>
                        );
                      })}
                    </tr>

                    {/* Processing Time */}
                    <tr className="border-b border-white/10">
                      <td className="py-3 text-gray-400">Avg Processing Time</td>
                      {comparisonData.comparison.processingTimes.map((item, idx) => {
                        const allTimes = comparisonData.comparison.processingTimes.map(t => t.avgTime);
                        return (
                          <td
                            key={idx}
                            className={`text-center py-3 text-white ${getBgColor(item.avgTime, allTimes, true)}`}
                          >
                            {item.formatted}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Agent Performance Breakdown */}
              {Object.keys(comparisonData.comparison.agentPerformance).length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-white mb-4">Agent Performance Across Scenarios</h3>
                  {Object.values(comparisonData.comparison.agentPerformance).map((agentData) => (
                    <div key={agentData.agent} className="mb-6 last:mb-0">
                      <h4 className="text-md font-medium text-cyan-300 mb-3">{agentData.agent}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {agentData.scenarios.map((scenario, idx) => (
                          <div key={idx} className="bg-black/30 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">{scenario.scenario}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">Accuracy:</span>
                              <span className={getMetricColor(scenario.accuracy, 'accuracy')}>
                                {scenario.accuracy.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">Processed:</span>
                              <span className="text-white">{scenario.processed}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setComparisonData(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-lg transition-colors"
                >
                  New Comparison
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
