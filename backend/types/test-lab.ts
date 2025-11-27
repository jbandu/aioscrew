/**
 * TypeScript types for Test Lab feature
 */

export interface TestWorkflow {
  id: string;
  name: string;
  description: string | null;
  agents: string[];
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TestScenario {
  id: string;
  workflow_id: string;
  name: string;
  description: string | null;
  client_name: string | null;
  data_profile: Record<string, any>;
  expected_outcomes: Record<string, any>;
  timeline: string | null;
  created_at: Date;
  updated_at: Date;
}

export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export interface TestExecution {
  id: number;
  scenario_id: string;
  workflow_id: string;
  role_used: string | null;
  started_at: Date;
  completed_at: Date | null;
  status: ExecutionStatus;
  results: Record<string, any>;
  created_at: Date;
}

export type AgentDecisionType = 'APPROVED' | 'ESCALATED' | 'REJECTED' | 'PENDING' | 'ERROR';

export interface AgentDecision {
  id: number;
  execution_id: number;
  agent_name: string;
  claim_id: string | null;
  decision: AgentDecisionType;
  reasoning: string[];
  confidence: number | null;
  processing_time_ms: number | null;
  decided_at: Date;
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'AGENT_ACTION' | 'MILESTONE';

export interface ExecutionLog {
  id: number;
  execution_id: number;
  log_level: LogLevel;
  agent_name: string | null;
  message: string;
  metadata: Record<string, any>;
  logged_at: Date;
}

// Request types
export interface CreateExecutionRequest {
  scenario_id: string;
  workflow_id: string;
  role_used?: string;
}

export interface CreateScenarioRequest {
  id: string;
  workflow_id: string;
  name: string;
  description?: string;
  client_name?: string;
  data_profile: Record<string, any>;
  expected_outcomes: Record<string, any>;
  timeline?: string;
}

export interface LogExecutionRequest {
  log_level: LogLevel;
  agent_name?: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface RecordDecisionRequest {
  agent_name: string;
  claim_id?: string;
  decision: AgentDecisionType;
  reasoning: string[];
  confidence?: number;
  processing_time_ms?: number;
}

// Response types with joined data
export interface ExecutionWithDetails extends TestExecution {
  scenario_name: string;
  workflow_name: string;
  decision_count: number;
  log_count: number;
  duration_seconds: number | null;
}
