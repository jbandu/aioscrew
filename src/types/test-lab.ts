/**
 * Test Lab TypeScript Type Definitions
 * Shared types for Test Lab components and API responses
 */

// ============================================================================
// WORKFLOW & SCENARIO TYPES
// ============================================================================

export interface Workflow {
  id: string;
  name: string;
  description: string;
  client: string;
  agent_count: number;
  created_at: string;
}

export interface Scenario {
  id: string;
  workflow_id: string;
  name: string;
  description: string;
  client_name: string;
  expected_outcomes: ExpectedOutcomes;
  data_profile: DataProfile;
  created_at: string;
}

export interface ExpectedOutcomes {
  approvalRate: number;
  escalationRate: number;
  rejectionRate: number;
  avgProcessingTime: string;
}

export interface DataProfile {
  totalClaims: number;
  claimTypes: Record<string, number>;
  timeRange: string;
  crewSize: number;
}

// ============================================================================
// EXECUTION TYPES
// ============================================================================

export interface Execution {
  id: number;
  scenario_id: string;
  workflow_id: string;
  status: ExecutionStatus;
  started_at: string;
  completed_at: string | null;
  results: ExecutionResults | null;
  scenario_name?: string;
  workflow_name?: string;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionResults {
  success: boolean;
  totalProcessed: number;
  approved: number;
  escalated: number;
  rejected: number;
  errors: number;
  avgProcessingTimeMs: number;
  executionTimeMs: number;
  agentPerformance?: Record<string, AgentPerformance>;
}

export interface AgentPerformance {
  totalDecisions: number;
  approved: number;
  escalated: number;
  rejected: number;
  avgConfidence: number;
  avgProcessingTime: number;
}

// ============================================================================
// AGENT DECISION TYPES
// ============================================================================

export interface AgentDecision {
  id: number;
  execution_id: number;
  agent_name: string;
  claim_id: string;
  decision: DecisionType;
  reasoning: string[];
  confidence: number;
  processing_time_ms: number;
  created_at: string;
}

export type DecisionType = 'APPROVED' | 'ESCALATED' | 'REJECTED' | 'ERROR';

// ============================================================================
// EXECUTION LOG TYPES
// ============================================================================

export interface ExecutionLog {
  id: number;
  execution_id: number;
  log_level: LogLevel;
  agent_name: string | null;
  message: string;
  metadata: Record<string, any>;
  created_at: string;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'MILESTONE' | 'AGENT_ACTION';

// ============================================================================
// SSE EVENT TYPES
// ============================================================================

export interface SSELogEvent {
  executionId: number;
  logLevel: LogLevel;
  agentName: string | null;
  message: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface SSEDecisionEvent {
  executionId: number;
  agentName: string;
  claimId: string;
  decision: DecisionType;
  reasoning: string[];
  confidence: number;
  processingTimeMs: number;
  timestamp: string;
}

export interface SSEProgressEvent {
  executionId: number;
  processed: number;
  total: number;
  approved: number;
  escalated: number;
  rejected: number;
}

export interface SSECompleteEvent {
  executionId: number;
  status: ExecutionStatus;
  results: ExecutionResults;
  timestamp: string;
}

// ============================================================================
// RESULTS & COMPARISON TYPES
// ============================================================================

export interface DetailedResults {
  summary: {
    totalClaims: number;
    approved: number;
    approvedPercentage: number;
    escalated: number;
    escalatedPercentage: number;
    rejected: number;
    rejectedPercentage: number;
    avgProcessingTime: number;
  };
  expected: ExpectedOutcomes;
  agentPerformance: Record<string, AgentPerformanceDetail>;
  notableCases: NotableCase[];
  completedAt: string;
  totalExecutionTime: number;
}

export interface AgentPerformanceDetail {
  accuracy: number;
  avgDecisionTime: number;
  processed: number;
  escalationRate?: number;
  overrideRate?: number;
  errors?: number;
}

export interface NotableCase {
  claimId: string;
  claimType: string;
  amount: number;
  decision: DecisionType;
  reasoning: string[];
  highlightTag: string;
  highlightIcon: 'insight' | 'catch' | 'fast';
  agentName: string;
}

export interface ComparisonData {
  executions: ComparisonExecution[];
  comparison: {
    approvalRates: MetricComparison[];
    processingTimes: MetricComparison[];
    escalationRates: MetricComparison[];
    agentPerformance: Record<string, AgentComparisonMetric[]>;
  };
  insights: string[];
}

export interface ComparisonExecution {
  id: number;
  scenario: string;
  workflow: string;
  completedAt: string;
  totalClaims: number;
}

export interface MetricComparison {
  scenario: string;
  rate?: number;
  count?: number;
  avgTime?: number;
  formatted?: string;
}

export interface AgentComparisonMetric {
  scenario: string;
  processed: number;
  accuracy: number;
  avgTime: number;
}

// ============================================================================
// TEST DATA GENERATION TYPES
// ============================================================================

export interface TestDataConfig {
  crew: number;
  claims: number;
  duration: string;
}

export interface TestDataStats {
  totalRecords: number;
  crewMembers: number;
  trips: number;
  claims: number;
  violations: number;
  disruptions: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface TestLabState {
  selectedWorkflow: Workflow | null;
  selectedScenario: Scenario | null;
  executionStatus: 'idle' | 'generating' | 'executing' | 'complete';
  executionId: number | null;
  logs: ExecutionLog[];
  decisions: AgentDecision[];
  results: DetailedResults | null;
}
