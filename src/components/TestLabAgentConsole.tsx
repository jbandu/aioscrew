import { useState, useEffect, useRef } from 'react';
import { Bot, CheckCircle, AlertCircle, Clock, TrendingUp, Zap } from 'lucide-react';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface AgentStatus {
  name: string;
  status: 'idle' | 'active' | 'complete';
  currentTask: string;
  processed: number;
  total: number;
  approved: number;
  escalated: number;
  rejected: number;
}

interface ReasoningEntry {
  timestamp: Date;
  agentName: string;
  reasoning: string[];
  confidence: number;
  claimId: string | null;
}

interface DecisionEntry {
  timestamp: Date;
  claimId: string | null;
  decision: 'APPROVED' | 'ESCALATED' | 'REJECTED' | 'ERROR';
  agentName: string;
  confidence: number;
}

interface ExecutionResult {
  status: string;
  results: any;
  completedAt: string;
}

interface TestLabAgentConsoleProps {
  executionId: number;
  showFullLogs: boolean;
  onComplete: (results: ExecutionResult) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TestLabAgentConsole({
  executionId,
  showFullLogs,
  onComplete
}: TestLabAgentConsoleProps) {
  // Agent pipeline state
  const [agents, setAgents] = useState<Record<string, AgentStatus>>({
    ClaimValidator: {
      name: 'ClaimValidator',
      status: 'idle',
      currentTask: 'Waiting...',
      processed: 0,
      total: 0,
      approved: 0,
      escalated: 0,
      rejected: 0
    },
    ComplianceChecker: {
      name: 'ComplianceChecker',
      status: 'idle',
      currentTask: 'Waiting...',
      processed: 0,
      total: 0,
      approved: 0,
      escalated: 0,
      rejected: 0
    },
    PayrollProcessor: {
      name: 'PayrollProcessor',
      status: 'idle',
      currentTask: 'Waiting...',
      processed: 0,
      total: 0,
      approved: 0,
      escalated: 0,
      rejected: 0
    }
  });

  // Live data state
  const [reasoning, setReasoning] = useState<ReasoningEntry[]>([]);
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);
  const [totalClaims, setTotalClaims] = useState(0);
  const [claimsPerMinute, setClaimsPerMinute] = useState(0);
  const [avgDecisionTime, setAvgDecisionTime] = useState(0);
  const [accuracyRate, setAccuracyRate] = useState(0);
  const [escalationRate, setEscalationRate] = useState(0);

  // Refs for auto-scroll
  const reasoningRef = useRef<HTMLDivElement>(null);
  const decisionsRef = useRef<HTMLDivElement>(null);

  // SSE connection
  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:3001/api/test-lab/execute/${executionId}/stream`);

    eventSource.onopen = () => {
      console.log('SSE connection established');
    };

    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        handleSSEEvent(data);
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    });

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return () => {
      console.log('Closing SSE connection');
      eventSource.close();
    };
  }, [executionId]);

  // Handle different SSE event types
  const handleSSEEvent = (data: any) => {
    const { type } = data;

    switch (type) {
      case 'connected':
        console.log('Connected to execution stream');
        break;

      case 'log':
        handleLogEvent(data);
        break;

      case 'decision':
        handleDecisionEvent(data);
        break;

      case 'progress':
        handleProgressEvent(data);
        break;

      case 'complete':
        handleCompleteEvent(data);
        break;

      default:
        console.log('Unknown event type:', type);
    }
  };

  const handleLogEvent = (data: any) => {
    const { logLevel, agentName, message, metadata, timestamp } = data;

    // Update agent status
    if (agentName && message) {
      setAgents(prev => ({
        ...prev,
        [agentName]: {
          ...prev[agentName],
          status: 'active',
          currentTask: message
        }
      }));
    }

    // Add to reasoning feed if it's an agent action
    if (logLevel === 'AGENT_ACTION' && agentName && metadata?.reasoning) {
      const entry: ReasoningEntry = {
        timestamp: new Date(timestamp),
        agentName,
        reasoning: metadata.reasoning,
        confidence: metadata.confidence || 0,
        claimId: metadata.claimId || null
      };
      setReasoning(prev => [...prev, entry].slice(-50)); // Keep last 50
    }
  };

  const handleDecisionEvent = (data: any) => {
    const { agentName, claimId, decision, reasoning, confidence, timestamp } = data;

    // Add to decision log
    const entry: DecisionEntry = {
      timestamp: new Date(timestamp),
      claimId: claimId || null,
      decision,
      agentName: agentName || 'System',
      confidence: confidence || 0
    };
    setDecisions(prev => [...prev, entry].slice(-20)); // Keep last 20

    // Update agent stats
    setAgents(prev => {
      const agent = prev[agentName] || prev.ClaimValidator;
      return {
        ...prev,
        [agentName]: {
          ...agent,
          processed: agent.processed + 1,
          approved: decision === 'APPROVED' ? agent.approved + 1 : agent.approved,
          escalated: decision === 'ESCALATED' ? agent.escalated + 1 : agent.escalated,
          rejected: decision === 'REJECTED' ? agent.rejected + 1 : agent.rejected
        }
      };
    });

    // Add to reasoning if available
    if (reasoning && reasoning.length > 0) {
      const entry: ReasoningEntry = {
        timestamp: new Date(timestamp),
        agentName: agentName || 'System',
        reasoning,
        confidence: confidence || 0,
        claimId
      };
      setReasoning(prev => [...prev, entry].slice(-50));
    }
  };

  const handleProgressEvent = (data: any) => {
    const { processed, total, approved, escalated, rejected } = data;

    setTotalClaims(total);

    // Update metrics
    if (processed > 0 && total > 0) {
      const accuracyPercent = Math.round((approved / processed) * 100);
      const escalationPercent = Math.round((escalated / processed) * 100);
      setAccuracyRate(accuracyPercent);
      setEscalationRate(escalationPercent);
    }
  };

  const handleCompleteEvent = (data: any) => {
    console.log('Execution complete:', data);

    // Mark all agents as complete
    setAgents(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        updated[key].status = 'complete';
        updated[key].currentTask = 'Complete';
      });
      return updated;
    });

    // Call onComplete callback
    onComplete({
      status: data.status,
      results: data.results,
      completedAt: data.completedAt
    });
  };

  // Auto-scroll effects
  useEffect(() => {
    if (reasoningRef.current) {
      reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
    }
  }, [reasoning]);

  useEffect(() => {
    if (decisionsRef.current) {
      decisionsRef.current.scrollTop = decisionsRef.current.scrollHeight;
    }
  }, [decisions]);

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'APPROVED': return 'text-green-400';
      case 'ESCALATED': return 'text-yellow-400';
      case 'REJECTED': return 'text-red-400';
      case 'ERROR': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getDecisionBg = (decision: string) => {
    switch (decision) {
      case 'APPROVED': return 'bg-green-500/20';
      case 'ESCALATED': return 'bg-yellow-500/20';
      case 'REJECTED': return 'bg-red-500/20';
      case 'ERROR': return 'bg-red-500/30';
      default: return 'bg-gray-500/20';
    }
  };

  const getAgentColor = (agentName: string) => {
    if (agentName.includes('Validator')) return 'text-cyan-400';
    if (agentName.includes('Compliance')) return 'text-purple-400';
    if (agentName.includes('Payroll')) return 'text-blue-400';
    return 'text-gray-400';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {/* Live Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-cyan-400" />
            <p className="text-xs text-gray-400">Claims/Min</p>
          </div>
          <p className="text-2xl font-bold text-cyan-400">{claimsPerMinute}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">Accuracy</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{accuracyRate}%</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-gray-400">Escalation</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{escalationRate}%</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400">Avg Time</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">{avgDecisionTime}ms</p>
        </div>
      </div>

      {/* Agent Pipeline Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(agents).map((agent) => (
          <div
            key={agent.name}
            className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className={`w-5 h-5 ${getAgentColor(agent.name)}`} />
                <h3 className="font-semibold text-white">{agent.name}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                agent.status === 'active' ? 'bg-green-500/20 text-green-400 animate-pulse' :
                agent.status === 'complete' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {agent.status}
              </span>
            </div>

            <p className="text-sm text-gray-400 mb-3 truncate">{agent.currentTask}</p>

            {/* Progress Bar */}
            {agent.total > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{agent.processed}/{agent.total}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(agent.processed / agent.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <p className="text-gray-500">Approved</p>
                <p className="text-green-400 font-bold">{agent.approved}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Escalated</p>
                <p className="text-yellow-400 font-bold">{agent.escalated}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Rejected</p>
                <p className="text-red-400 font-bold">{agent.rejected}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Reasoning Panel */}
      {showFullLogs && reasoning.length > 0 && (
        <div className="bg-gray-900/60 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Live Agent Reasoning
          </h3>
          <div
            ref={reasoningRef}
            className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
          >
            {reasoning.map((entry, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded p-3 animate-fade-in"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getAgentColor(entry.agentName)}`}>
                      {entry.agentName}
                    </span>
                    {entry.claimId && (
                      <span className="text-xs font-mono text-gray-500">
                        {entry.claimId}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{formatTime(entry.timestamp)}</span>
                    {entry.confidence > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                        {entry.confidence}%
                      </span>
                    )}
                  </div>
                </div>
                <ul className="space-y-1 text-sm text-gray-300">
                  {entry.reasoning.slice(0, 3).map((reason, ridx) => (
                    <li key={ridx} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">
                        {reason.startsWith('✓') ? '✓' : reason.startsWith('⚠') ? '⚠' : '→'}
                      </span>
                      <span className="flex-1">{reason.replace(/^[✓⚠→]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Log */}
      {decisions.length > 0 && (
        <div className="bg-gray-900/60 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-3">Recent Decisions</h3>
          <div
            ref={decisionsRef}
            className="max-h-[300px] overflow-y-auto custom-scrollbar"
          >
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 border-b border-white/10 sticky top-0 bg-gray-900">
                <tr>
                  <th className="text-left py-2 px-2">Time</th>
                  <th className="text-left py-2 px-2">Claim ID</th>
                  <th className="text-left py-2 px-2">Decision</th>
                  <th className="text-left py-2 px-2">Agent</th>
                  <th className="text-right py-2 px-2">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {decisions.slice().reverse().map((decision, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors animate-fade-in"
                  >
                    <td className="py-2 px-2 text-gray-400">
                      {formatTime(decision.timestamp)}
                    </td>
                    <td className="py-2 px-2 font-mono text-gray-300">
                      {decision.claimId || 'N/A'}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDecisionBg(decision.decision)} ${getDecisionColor(decision.decision)}`}>
                        {decision.decision}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={getAgentColor(decision.agentName)}>
                        {decision.agentName}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right text-gray-400">
                      {decision.confidence}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading State */}
      {decisions.length === 0 && reasoning.length === 0 && (
        <div className="bg-gray-900/60 border border-white/10 rounded-lg p-8 backdrop-blur-sm text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Waiting for agent activity...</p>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(96, 165, 250, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(96, 165, 250, 0.7);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
