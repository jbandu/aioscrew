import { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Clock,
  FileDown,
  FileSpreadsheet,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertCircle,
  Lightbulb,
  Target,
  Activity
} from 'lucide-react';
import TestLabComparison from './TestLabComparison';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface TestLabResultsProps {
  executionId: number;
  scenarioId: string;
  onRunAgain?: () => void;
}

interface ExecutionResults {
  summary: {
    totalClaims: number;
    approved: number;
    approvedPercentage: number;
    escalated: number;
    escalatedPercentage: number;
    rejected: number;
    rejectedPercentage: number;
    avgProcessingTime: number; // in milliseconds
  };
  expected: {
    approvalRate: number;
    escalationRate: number;
    rejectionRate: number;
    avgProcessingTime: string;
  };
  agentPerformance: {
    [agentName: string]: {
      accuracy: number;
      avgDecisionTime: number; // in milliseconds
      processed: number;
      escalationRate?: number;
      overrideRate?: number;
      errors?: number;
    };
  };
  notableCases: NotableCase[];
  completedAt: string;
  totalExecutionTime: number;
}

interface NotableCase {
  claimId: string;
  claimType: string;
  amount: number;
  decision: 'APPROVED' | 'ESCALATED' | 'REJECTED';
  reasoning: string[];
  highlightTag: string;
  highlightIcon: 'insight' | 'catch' | 'fast';
  agentName: string;
}

interface ComparisonRow {
  metric: string;
  expected: string;
  actual: string;
  status: 'within' | 'acceptable' | 'flag';
  icon: React.ReactNode;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TestLabResults({ executionId, scenarioId, onRunAgain }: TestLabResultsProps) {
  const [results, setResults] = useState<ExecutionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [executionId]);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/test-lab/execute/${executionId}/results`);
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error || 'Failed to load results');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load execution results');
    } finally {
      setLoading(false);
    }
  };

  const toggleCase = (claimId: string) => {
    const newExpanded = new Set(expandedCases);
    if (newExpanded.has(claimId)) {
      newExpanded.delete(claimId);
    } else {
      newExpanded.add(claimId);
    }
    setExpandedCases(newExpanded);
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  const getComparisonData = (): ComparisonRow[] => {
    if (!results) return [];

    const tolerance = 5; // ±5% tolerance for rates
    const timeTolerance = 20; // ±20% tolerance for time

    const approvalDiff = Math.abs(results.summary.approvedPercentage - results.expected.approvalRate);
    const escalationDiff = Math.abs(results.summary.escalatedPercentage - results.expected.escalationRate);
    const rejectionDiff = Math.abs(results.summary.rejectedPercentage - results.expected.rejectionRate);

    // Parse expected time (e.g., "2min" or "2m 15s")
    const parseExpectedTime = (timeStr: string): number => {
      const minMatch = timeStr.match(/(\d+)m/);
      const secMatch = timeStr.match(/(\d+)s/);
      const minutes = minMatch ? parseInt(minMatch[1]) : 0;
      const seconds = secMatch ? parseInt(secMatch[1]) : 0;
      return (minutes * 60 + seconds) * 1000;
    };

    const expectedTimeMs = parseExpectedTime(results.expected.avgProcessingTime);
    const timeDiffPercent = Math.abs((results.summary.avgProcessingTime - expectedTimeMs) / expectedTimeMs * 100);

    return [
      {
        metric: 'Approval Rate',
        expected: `${results.expected.approvalRate}%`,
        actual: `${results.summary.approvedPercentage.toFixed(1)}%`,
        status: approvalDiff <= tolerance ? 'within' : approvalDiff <= tolerance * 2 ? 'acceptable' : 'flag',
        icon: approvalDiff <= tolerance ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />
      },
      {
        metric: 'Escalation Rate',
        expected: `${results.expected.escalationRate}%`,
        actual: `${results.summary.escalatedPercentage.toFixed(1)}%`,
        status: escalationDiff <= tolerance ? 'within' : escalationDiff <= tolerance * 2 ? 'acceptable' : 'flag',
        icon: escalationDiff <= tolerance ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />
      },
      {
        metric: 'Rejection Rate',
        expected: `${results.expected.rejectionRate}%`,
        actual: `${results.summary.rejectedPercentage.toFixed(1)}%`,
        status: rejectionDiff <= tolerance ? 'within' : rejectionDiff <= tolerance * 2 ? 'acceptable' : 'flag',
        icon: rejectionDiff <= tolerance ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />
      },
      {
        metric: 'Avg Processing Time',
        expected: results.expected.avgProcessingTime,
        actual: formatTime(results.summary.avgProcessingTime),
        status: timeDiffPercent <= timeTolerance ? 'within' : timeDiffPercent <= timeTolerance * 2 ? 'acceptable' : 'flag',
        icon: timeDiffPercent <= timeTolerance ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />
      }
    ];
  };

  const getStatusColor = (status: 'within' | 'acceptable' | 'flag'): string => {
    switch (status) {
      case 'within': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'acceptable': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'flag': return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  const getStatusText = (status: 'within' | 'acceptable' | 'flag'): string => {
    switch (status) {
      case 'within': return 'Within Tolerance ✓';
      case 'acceptable': return 'Acceptable ✓';
      case 'flag': return 'Flag for Review ⚠';
    }
  };

  const getHighlightIcon = (type: 'insight' | 'catch' | 'fast') => {
    switch (type) {
      case 'insight': return <Lightbulb className="w-4 h-4" />;
      case 'catch': return <AlertCircle className="w-4 h-4" />;
      case 'fast': return <Zap className="w-4 h-4" />;
    }
  };

  const getDecisionBadge = (decision: string) => {
    const badges = {
      APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
      ESCALATED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return badges[decision as keyof typeof badges] || 'bg-gray-500/20 text-gray-400';
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const response = await fetch(`http://localhost:3001/api/test-lab/execute/${executionId}/export/pdf`);

      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-lab-results-${executionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportCSV = async () => {
    setExportingCSV(true);
    try {
      const response = await fetch(`http://localhost:3001/api/test-lab/execute/${executionId}/export/csv`);

      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-lab-results-${executionId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExportingCSV(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-200 font-semibold mb-2">Failed to Load Results</p>
        <p className="text-sm text-red-300">{error}</p>
        <button
          onClick={fetchResults}
          className="mt-4 px-4 py-2 bg-red-500/30 hover:bg-red-500/40 border border-red-500/50 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No results available</p>
      </div>
    );
  }

  const comparisonData = getComparisonData();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Claims */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-gray-300">Total Claims</p>
          </div>
          <p className="text-3xl font-bold text-white">{results.summary.totalClaims}</p>
          <p className="text-xs text-gray-400 mt-1">Processed</p>
        </div>

        {/* Auto-Approved */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-sm text-gray-300">Auto-Approved</p>
          </div>
          <p className="text-3xl font-bold text-green-400">{results.summary.approved}</p>
          <p className="text-xs text-gray-400 mt-1">{results.summary.approvedPercentage.toFixed(1)}% of total</p>
        </div>

        {/* Escalated */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-gray-300">Escalated</p>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{results.summary.escalated}</p>
          <p className="text-xs text-gray-400 mt-1">{results.summary.escalatedPercentage.toFixed(1)}% of total</p>
        </div>

        {/* Rejected */}
        <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-gray-300">Rejected</p>
          </div>
          <p className="text-3xl font-bold text-red-400">{results.summary.rejected}</p>
          <p className="text-xs text-gray-400 mt-1">{results.summary.rejectedPercentage.toFixed(1)}% of total</p>
        </div>
      </div>

      {/* Two-column layout for comparison and agent performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance vs Expected */}
        <div className="bg-white/5 border border-cyan-500/30 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-cyan-300">Performance vs Expected</h3>
          </div>
          <div className="space-y-3">
            {comparisonData.map((row, idx) => (
              <div key={idx} className="bg-black/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{row.metric}</span>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusColor(row.status)}`}>
                    {row.icon}
                    <span>{getStatusText(row.status)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Expected:</span>
                    <span className="text-gray-300 ml-2">{row.expected}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Actual:</span>
                    <span className="text-white ml-2 font-semibold">{row.actual}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Performance Metrics */}
        <div className="bg-white/5 border border-purple-500/30 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-300">Agent Performance</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(results.agentPerformance).map(([agentName, perf]) => (
              <div key={agentName} className="bg-black/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{agentName}</span>
                  <span className="text-xs text-gray-400">{perf.processed} processed</span>
                </div>

                {/* Accuracy Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Accuracy</span>
                    <span className="text-green-400 font-semibold">{perf.accuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${perf.accuracy}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Avg Time:</span>
                    <span className="text-cyan-400 ml-2">{formatTime(perf.avgDecisionTime)}</span>
                  </div>
                  {perf.escalationRate !== undefined && (
                    <div>
                      <span className="text-gray-500">Escalation:</span>
                      <span className="text-yellow-400 ml-2">{perf.escalationRate}%</span>
                    </div>
                  )}
                  {perf.overrideRate !== undefined && (
                    <div>
                      <span className="text-gray-500">Override:</span>
                      <span className="text-blue-400 ml-2">{perf.overrideRate}%</span>
                    </div>
                  )}
                  {perf.errors !== undefined && perf.errors > 0 && (
                    <div>
                      <span className="text-gray-500">Errors:</span>
                      <span className="text-red-400 ml-2">{perf.errors}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notable Cases */}
      {results.notableCases && results.notableCases.length > 0 && (
        <div className="bg-white/5 border border-blue-500/30 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-300">Notable Cases</h3>
            <span className="text-xs text-gray-400">({results.notableCases.length} highlights)</span>
          </div>
          <div className="space-y-3">
            {results.notableCases.map((notableCase) => (
              <div key={notableCase.claimId} className="bg-black/30 rounded-lg border border-white/10 overflow-hidden">
                <button
                  onClick={() => toggleCase(notableCase.claimId)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${
                      notableCase.highlightIcon === 'insight' ? 'bg-blue-500/20 text-blue-400' :
                      notableCase.highlightIcon === 'catch' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {getHighlightIcon(notableCase.highlightIcon)}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-cyan-400">{notableCase.claimId}</span>
                        <span className="text-xs text-gray-400">{notableCase.claimType}</span>
                        <span className={`px-2 py-0.5 rounded text-xs border ${getDecisionBadge(notableCase.decision)}`}>
                          {notableCase.decision}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>Amount: ${notableCase.amount.toFixed(2)}</span>
                        <span>•</span>
                        <span className="text-blue-300">{notableCase.highlightTag}</span>
                      </div>
                    </div>
                  </div>
                  {expandedCases.has(notableCase.claimId) ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedCases.has(notableCase.claimId) && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-2">Agent: {notableCase.agentName}</p>
                    <div className="bg-black/40 rounded p-3">
                      <p className="text-xs font-semibold text-gray-300 mb-2">Reasoning:</p>
                      <ul className="space-y-1">
                        {notableCase.reasoning.map((reason, idx) => (
                          <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
        <button
          onClick={handleExportPDF}
          disabled={exportingPDF || exportingCSV}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exportingPDF ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-300" />
              Exporting...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              Export to PDF
            </>
          )}
        </button>
        <button
          onClick={handleExportCSV}
          disabled={exportingPDF || exportingCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exportingCSV ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-300" />
              Exporting...
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4" />
              Export to CSV
            </>
          )}
        </button>
        <button
          onClick={() => setShowComparison(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          Compare with Previous Runs
        </button>
        {onRunAgain && (
          <button
            onClick={onRunAgain}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-colors ml-auto"
          >
            <RotateCw className="w-4 h-4" />
            Run Again
          </button>
        )}
      </div>

      {/* Execution Metadata */}
      <div className="text-center text-xs text-gray-500 pt-2">
        <div className="flex items-center justify-center gap-4">
          <span>Execution ID: {executionId}</span>
          <span>•</span>
          <span>Scenario: {scenarioId}</span>
          <span>•</span>
          <span>Completed: {new Date(results.completedAt).toLocaleString()}</span>
          <span>•</span>
          <span>Total Time: {formatTime(results.totalExecutionTime)}</span>
        </div>
      </div>

      {/* Comparison Modal */}
      {showComparison && (
        <TestLabComparison
          onClose={() => setShowComparison(false)}
          currentExecutionId={executionId}
        />
      )}
    </div>
  );
}
