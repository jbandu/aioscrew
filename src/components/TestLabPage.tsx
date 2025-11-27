import { useState, useEffect } from 'react';
import { FlaskConical, Play, RotateCcw, Zap, Users, FileText, Clock, CheckCircle } from 'lucide-react';
import TestLabAgentConsole from './TestLabAgentConsole';
import TestLabResults from './TestLabResults';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  agents: string[];
  enabled: boolean;
}

interface Scenario {
  id: string;
  workflow_id: string;
  name: string;
  description: string | null;
  client_name: string | null;
  data_profile: {
    totalCrew: number;
    crewBreakdown: {
      captains: number;
      firstOfficers: number;
      seniorFA: number;
      juniorFA: number;
    };
    totalClaims: number;
    duration: string;
    claimDistribution: Record<string, number>;
    expectedApprovalRate: number;
    expectedViolations: number;
    expectedDisruptions: number;
    edgeCases?: {
      missingDocumentation?: number;
      conflictingData?: number;
      duplicates?: number;
      retroactive?: number;
    };
  };
  expected_outcomes: {
    autoApproved: number;
    escalated: number;
    rejected: number;
    avgProcessingTime: string;
  };
  timeline: string | null;
  workflow_name?: string;
  workflow_agents?: string[];
}

interface GenerateResponse {
  success: boolean;
  scenario: {
    id: string;
    name: string;
  };
  generated: {
    crew: number;
    trips: number;
    claims: number;
    violations: number;
    disruptions: number;
    total: number;
  };
}

interface ExecuteResponse {
  success: boolean;
  executionId: number;
  status: string;
  execution: {
    id: number;
    scenarioId: string;
    workflowId: string;
    role: string;
    startedAt: string;
  };
  message: string;
}

type ExecutionStatus = 'idle' | 'generating' | 'ready' | 'running' | 'complete';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TestLabPage({ onBack }: { onBack?: () => void }) {
  // State management
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('Payroll Admin');
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('idle');
  const [executionId, setExecutionId] = useState<number | null>(null);
  const [showFullLogs, setShowFullLogs] = useState<boolean>(true);
  const [generatedData, setGeneratedData] = useState<GenerateResponse['generated'] | null>(null);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch workflows on mount
  useEffect(() => {
    fetchWorkflows();
  }, []);

  // Fetch scenarios when workflow changes
  useEffect(() => {
    if (selectedWorkflow) {
      fetchScenarios(selectedWorkflow);
    } else {
      setScenarios([]);
      setSelectedScenario(null);
    }
  }, [selectedWorkflow]);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/test-lab/workflows');
      const data = await response.json();
      if (data.success) {
        setWorkflows(data.workflows);
        // Auto-select first workflow
        if (data.workflows.length > 0) {
          setSelectedWorkflow(data.workflows[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching workflows:', err);
      setError('Failed to load workflows');
    }
  };

  const fetchScenarios = async (workflowId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/test-lab/scenarios?workflow=${workflowId}`);
      const data = await response.json();
      if (data.success) {
        setScenarios(data.scenarios);
      }
    } catch (err) {
      console.error('Error fetching scenarios:', err);
      setError('Failed to load scenarios');
    }
  };

  const handleGenerateData = async () => {
    if (!selectedScenario) return;

    setLoading(true);
    setExecutionStatus('generating');
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/test-lab/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: selectedScenario.id })
      });

      const data: GenerateResponse = await response.json();

      if (data.success) {
        setGeneratedData(data.generated);
        setExecutionStatus('ready');
      } else {
        setError('Failed to generate test data');
        setExecutionStatus('idle');
      }
    } catch (err) {
      console.error('Error generating data:', err);
      setError('Failed to generate test data');
      setExecutionStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExecution = async () => {
    if (!selectedScenario) return;

    setLoading(true);
    setExecutionStatus('running');
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/test-lab/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          role: selectedRole,
          showLogs: showFullLogs
        })
      });

      const data: ExecuteResponse = await response.json();

      if (data.success) {
        setExecutionId(data.executionId);
        // Status will update via SSE stream (to be implemented)
      } else {
        setError('Failed to start execution');
        setExecutionStatus('ready');
      }
    } catch (err) {
      console.error('Error starting execution:', err);
      setError('Failed to start execution');
      setExecutionStatus('ready');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAndReset = () => {
    setSelectedScenario(null);
    setExecutionStatus('idle');
    setExecutionId(null);
    setGeneratedData(null);
    setExecutionResults(null);
    setError(null);
  };

  const handleExecutionComplete = (results: any) => {
    setExecutionStatus('complete');
    setExecutionResults(results);
  };

  const getScenarioEmoji = (scenarioId: string) => {
    if (scenarioId.includes('baseline')) return '🎯';
    if (scenarioId.includes('holiday')) return '🎄';
    if (scenarioId.includes('edge')) return '⚠️';
    if (scenarioId.includes('growth')) return '📈';
    return '🧪';
  };

  const getStatusColor = (status: ExecutionStatus) => {
    switch (status) {
      case 'idle': return 'text-gray-400';
      case 'generating': return 'text-yellow-400 animate-pulse';
      case 'ready': return 'text-green-400';
      case 'running': return 'text-cyan-400 animate-pulse';
      case 'complete': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: ExecutionStatus) => {
    switch (status) {
      case 'idle': return 'Idle - Select a scenario to begin';
      case 'generating': return 'Generating test data...';
      case 'ready': return 'Ready - Click Start to run agents';
      case 'running': return 'Running - Agents processing claims';
      case 'complete': return 'Complete - Review results below';
      default: return 'Unknown status';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900 text-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Landing Page
          </button>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FlaskConical className="w-10 h-10 text-cyan-400" />
              <h1 className="text-4xl font-bold">Test Lab</h1>
            </div>
            <p className="text-gray-300">Workflow-specific testing with live agent execution</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
            <p className="font-semibold">⚠️ Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Two-Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT PANEL - Scenario Studio */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-cyan-300 mb-1">Scenario Studio</h2>
              <p className="text-sm text-gray-400">Select and configure test scenarios</p>
            </div>

            {/* Workflow Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Workflow
              </label>
              <select
                value={selectedWorkflow || ''}
                onChange={(e) => setSelectedWorkflow(e.target.value)}
                className="w-full bg-white/10 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="" disabled>Select a workflow...</option>
                {workflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scenario Grid */}
            {!selectedScenario && scenarios.length > 0 && (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario)}
                    className="w-full bg-white/10 hover:bg-white/15 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg p-4 text-left transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getScenarioEmoji(scenario.id)}</span>
                        <h3 className="font-semibold text-white">{scenario.name}</h3>
                      </div>
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                        {scenario.client_name}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {scenario.data_profile.totalCrew} crew
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {scenario.data_profile.totalClaims} claims
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {scenario.timeline}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">{scenario.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Scenario Expanded View */}
            {selectedScenario && (
              <div className="space-y-4">
                <div className="bg-white/10 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{getScenarioEmoji(selectedScenario.id)}</span>
                      <div>
                        <h3 className="font-bold text-white text-lg">{selectedScenario.name}</h3>
                        <span className="text-xs text-cyan-300">{selectedScenario.client_name}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">{selectedScenario.description}</p>

                  {/* Data Profile */}
                  <div className="bg-black/30 rounded p-3 mb-3">
                    <p className="text-xs font-semibold text-cyan-300 mb-2">Data Profile</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Total Crew:</span>
                        <span className="text-white ml-2">{selectedScenario.data_profile.totalCrew}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Claims:</span>
                        <span className="text-white ml-2">{selectedScenario.data_profile.totalClaims}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white ml-2">{selectedScenario.data_profile.duration}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Approval Rate:</span>
                        <span className="text-white ml-2">{selectedScenario.data_profile.expectedApprovalRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Expected Outcomes */}
                  <div className="bg-black/30 rounded p-3">
                    <p className="text-xs font-semibold text-cyan-300 mb-2">Expected Outcomes</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Auto-Approved:</span>
                        <span className="text-green-400 ml-2">{selectedScenario.expected_outcomes.autoApproved}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Escalated:</span>
                        <span className="text-yellow-400 ml-2">{selectedScenario.expected_outcomes.escalated}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Rejected:</span>
                        <span className="text-red-400 ml-2">{selectedScenario.expected_outcomes.rejected}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Avg Time:</span>
                        <span className="text-white ml-2">{selectedScenario.expected_outcomes.avgProcessingTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated Data Stats */}
                {generatedData && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-300 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Test Data Generated
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Crew:</span>
                        <span className="text-white ml-2">{generatedData.crew}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Trips:</span>
                        <span className="text-white ml-2">{generatedData.trips}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Claims:</span>
                        <span className="text-white ml-2">{generatedData.claims}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {executionStatus === 'idle' && (
                    <button
                      onClick={handleGenerateData}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Generate Test Data
                    </button>
                  )}
                  <button
                    onClick={handleClearAndReset}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear & Reset
                  </button>
                </div>
              </div>
            )}

            {scenarios.length === 0 && selectedWorkflow && (
              <div className="text-center py-12 text-gray-400">
                <p>No scenarios available for this workflow</p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL - Execution Theater */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-blue-300 mb-1">Execution Theater</h2>
              <p className="text-sm text-gray-400">Monitor live agent processing</p>
            </div>

            {/* Role Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Demo Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={executionStatus === 'running'}
                className="w-full bg-white/10 border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="Payroll Admin">Payroll Admin</option>
                <option value="Operations Manager">Operations Manager</option>
                <option value="AI Observer">AI Observer</option>
              </select>
            </div>

            {/* Status Indicator */}
            <div className="mb-6 bg-white/5 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${executionStatus === 'running' || executionStatus === 'generating' ? 'bg-cyan-400 animate-pulse' : executionStatus === 'ready' ? 'bg-green-400' : executionStatus === 'complete' ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className={`font-semibold ${getStatusColor(executionStatus)}`}>
                    {getStatusText(executionStatus)}
                  </p>
                </div>
              </div>
            </div>

            {/* Show Full Logs Toggle */}
            {executionStatus === 'ready' && (
              <div className="mb-4 flex items-center gap-3 bg-white/5 border border-blue-500/20 rounded-lg p-3">
                <input
                  type="checkbox"
                  id="showFullLogs"
                  checked={showFullLogs}
                  onChange={(e) => setShowFullLogs(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-400 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="showFullLogs" className="text-sm text-gray-300 cursor-pointer">
                  Show full agent logs and reasoning
                </label>
              </div>
            )}

            {/* Start Button */}
            {executionStatus === 'ready' && (
              <button
                onClick={handleStartExecution}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 mb-6"
              >
                <Play className="w-5 h-5" />
                Start Agent Processing
              </button>
            )}

            {/* Execution Content Area */}
            <div className="bg-black/60 border border-blue-500/20 rounded-lg p-6 min-h-[400px]">
              {executionStatus === 'idle' && (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                  <FlaskConical className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-center">Select a scenario and generate test data<br />to begin execution</p>
                </div>
              )}

              {executionStatus === 'generating' && (
                <div className="flex flex-col items-center justify-center h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
                  <p className="text-cyan-400">Generating test data...</p>
                </div>
              )}

              {executionStatus === 'ready' && (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                  <CheckCircle className="w-16 h-16 mb-4 text-green-400" />
                  <p className="text-center">Test data ready<br />Click "Start Agent Processing" to begin</p>
                </div>
              )}

              {executionStatus === 'running' && executionId && (
                <TestLabAgentConsole
                  executionId={executionId}
                  showFullLogs={showFullLogs}
                  onComplete={handleExecutionComplete}
                />
              )}

              {executionStatus === 'complete' && executionId && selectedScenario && (
                <TestLabResults
                  executionId={executionId}
                  scenarioId={selectedScenario.id}
                  onRunAgain={handleClearAndReset}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
