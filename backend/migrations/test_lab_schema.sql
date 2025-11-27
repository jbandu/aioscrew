-- ============================================================================
-- Test Lab Schema for AIOSCREW
-- ============================================================================
-- This schema supports the Test Lab feature which allows testing workflows,
-- running scenarios, and tracking AI agent decisions in real-time.
--
-- Usage:
--   psql your_database -f backend/migrations/test_lab_schema.sql
-- ============================================================================

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS execution_logs CASCADE;
DROP TABLE IF EXISTS agent_decisions CASCADE;
DROP TABLE IF EXISTS test_executions CASCADE;
DROP TABLE IF EXISTS test_scenarios CASCADE;
DROP TABLE IF EXISTS test_workflows CASCADE;

-- ============================================================================
-- 1. TEST_WORKFLOWS
-- ============================================================================
-- Defines available workflows that can be tested (e.g., crew pay, baggage ops)
CREATE TABLE test_workflows (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    agents JSONB NOT NULL DEFAULT '[]'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT test_workflows_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Index for listing enabled workflows
CREATE INDEX idx_test_workflows_enabled ON test_workflows(enabled);
CREATE INDEX idx_test_workflows_created_at ON test_workflows(created_at DESC);

COMMENT ON TABLE test_workflows IS 'Available workflows that can be tested in Test Lab';
COMMENT ON COLUMN test_workflows.id IS 'Workflow identifier (e.g., crew-pay, baggage-ops)';
COMMENT ON COLUMN test_workflows.agents IS 'Array of agent names involved in this workflow';

-- ============================================================================
-- 2. TEST_SCENARIOS
-- ============================================================================
-- Predefined test scenarios for each workflow (e.g., COPA baseline, Avelo stress test)
CREATE TABLE test_scenarios (
    id VARCHAR(100) PRIMARY KEY,
    workflow_id VARCHAR(100) NOT NULL REFERENCES test_workflows(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    client_name VARCHAR(100),
    data_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    expected_outcomes JSONB NOT NULL DEFAULT '{}'::jsonb,
    timeline VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT test_scenarios_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Indexes for querying scenarios
CREATE INDEX idx_test_scenarios_workflow_id ON test_scenarios(workflow_id);
CREATE INDEX idx_test_scenarios_client_name ON test_scenarios(client_name);
CREATE INDEX idx_test_scenarios_created_at ON test_scenarios(created_at DESC);

COMMENT ON TABLE test_scenarios IS 'Predefined test scenarios for workflows';
COMMENT ON COLUMN test_scenarios.data_profile IS 'JSON defining crew counts, claim distribution, etc.';
COMMENT ON COLUMN test_scenarios.expected_outcomes IS 'JSON defining expected approval rates, processing times, etc.';
COMMENT ON COLUMN test_scenarios.timeline IS 'Expected duration (e.g., "1 month", "2 weeks")';

-- ============================================================================
-- 3. TEST_EXECUTIONS
-- ============================================================================
-- Records of scenario executions (runs)
CREATE TABLE test_executions (
    id SERIAL PRIMARY KEY,
    scenario_id VARCHAR(100) NOT NULL REFERENCES test_scenarios(id) ON DELETE CASCADE,
    workflow_id VARCHAR(100) NOT NULL REFERENCES test_workflows(id) ON DELETE CASCADE,
    role_used VARCHAR(100),
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'running',
    results JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT test_executions_status_valid CHECK (
        status IN ('running', 'completed', 'failed', 'cancelled')
    ),
    CONSTRAINT test_executions_completed_after_started CHECK (
        completed_at IS NULL OR completed_at >= started_at
    )
);

-- Indexes for performance
CREATE INDEX idx_test_executions_scenario_id ON test_executions(scenario_id);
CREATE INDEX idx_test_executions_workflow_id ON test_executions(workflow_id);
CREATE INDEX idx_test_executions_status ON test_executions(status);
CREATE INDEX idx_test_executions_started_at ON test_executions(started_at DESC);
CREATE INDEX idx_test_executions_role_used ON test_executions(role_used);

COMMENT ON TABLE test_executions IS 'Individual execution records of test scenarios';
COMMENT ON COLUMN test_executions.role_used IS 'User role during test (e.g., payroll-admin, ai-observer)';
COMMENT ON COLUMN test_executions.results IS 'Final metrics: approval rates, avg processing time, etc.';

-- ============================================================================
-- 4. AGENT_DECISIONS
-- ============================================================================
-- Individual agent decisions during test execution
CREATE TABLE agent_decisions (
    id SERIAL PRIMARY KEY,
    execution_id INTEGER NOT NULL REFERENCES test_executions(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    claim_id VARCHAR(100),
    decision VARCHAR(50) NOT NULL,
    reasoning JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence INTEGER,
    processing_time_ms INTEGER,
    decided_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT agent_decisions_decision_valid CHECK (
        decision IN ('APPROVED', 'ESCALATED', 'REJECTED', 'PENDING', 'ERROR')
    ),
    CONSTRAINT agent_decisions_confidence_range CHECK (
        confidence IS NULL OR (confidence >= 0 AND confidence <= 100)
    ),
    CONSTRAINT agent_decisions_processing_time_positive CHECK (
        processing_time_ms IS NULL OR processing_time_ms >= 0
    )
);

-- Indexes for querying decisions
CREATE INDEX idx_agent_decisions_execution_id ON agent_decisions(execution_id);
CREATE INDEX idx_agent_decisions_agent_name ON agent_decisions(agent_name);
CREATE INDEX idx_agent_decisions_claim_id ON agent_decisions(claim_id);
CREATE INDEX idx_agent_decisions_decision ON agent_decisions(decision);
CREATE INDEX idx_agent_decisions_decided_at ON agent_decisions(decided_at DESC);

COMMENT ON TABLE agent_decisions IS 'Individual agent decisions during test executions';
COMMENT ON COLUMN agent_decisions.reasoning IS 'Array of reasoning steps from the agent';
COMMENT ON COLUMN agent_decisions.confidence IS 'Agent confidence level (0-100)';
COMMENT ON COLUMN agent_decisions.processing_time_ms IS 'Time taken to make decision in milliseconds';

-- ============================================================================
-- 5. EXECUTION_LOGS
-- ============================================================================
-- Detailed logs during test execution
CREATE TABLE execution_logs (
    id SERIAL PRIMARY KEY,
    execution_id INTEGER NOT NULL REFERENCES test_executions(id) ON DELETE CASCADE,
    log_level VARCHAR(20) NOT NULL,
    agent_name VARCHAR(100),
    message TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT execution_logs_level_valid CHECK (
        log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'AGENT_ACTION', 'MILESTONE')
    ),
    CONSTRAINT execution_logs_message_not_empty CHECK (LENGTH(TRIM(message)) > 0)
);

-- Indexes for log querying and filtering
CREATE INDEX idx_execution_logs_execution_id ON execution_logs(execution_id);
CREATE INDEX idx_execution_logs_level ON execution_logs(log_level);
CREATE INDEX idx_execution_logs_agent_name ON execution_logs(agent_name);
CREATE INDEX idx_execution_logs_logged_at ON execution_logs(logged_at DESC);
CREATE INDEX idx_execution_logs_execution_logged_at ON execution_logs(execution_id, logged_at DESC);

COMMENT ON TABLE execution_logs IS 'Detailed execution logs for debugging and monitoring';
COMMENT ON COLUMN execution_logs.log_level IS 'Log severity: DEBUG, INFO, WARN, ERROR, AGENT_ACTION, MILESTONE';
COMMENT ON COLUMN execution_logs.metadata IS 'Additional context data in JSON format';

-- ============================================================================
-- SEED DATA - Initial Workflows
-- ============================================================================

INSERT INTO test_workflows (id, name, description, agents, enabled) VALUES
(
    'crew-pay',
    'Crew Pay Intelligence',
    'End-to-end testing of crew pay claim processing, validation, and approval workflows. Tests ClaimValidator for accuracy, ComplianceChecker for regulatory adherence, and PayrollProcessor for payment execution.',
    '["ClaimValidator", "ComplianceChecker", "PayrollProcessor"]'::jsonb,
    true
),
(
    'baggage-ops',
    'Baggage Operations',
    'Test baggage tracking, mishandling scenarios, and route optimization. Currently in development - includes BaggageTracker for real-time tracking, RouteOptimizer for efficient routing, and AlertManager for proactive notifications.',
    '["BaggageTracker", "RouteOptimizer", "AlertManager"]'::jsonb,
    false
),
(
    'schedule-mgmt',
    'Schedule Management',
    'Test crew scheduling, conflict resolution, and regulatory compliance checks. Currently in development - includes CrewScheduler for optimal rostering, ConflictResolver for handling overlaps, and RegChecker for FAA/EASA compliance.',
    '["CrewScheduler", "ConflictResolver", "RegChecker"]'::jsonb,
    false
);

-- ============================================================================
-- UTILITY VIEWS
-- ============================================================================

-- View: Active executions with scenario details
CREATE OR REPLACE VIEW v_active_executions AS
SELECT
    te.id AS execution_id,
    te.scenario_id,
    ts.name AS scenario_name,
    ts.client_name,
    te.workflow_id,
    tw.name AS workflow_name,
    te.role_used,
    te.status,
    te.started_at,
    te.completed_at,
    EXTRACT(EPOCH FROM (COALESCE(te.completed_at, CURRENT_TIMESTAMP) - te.started_at)) AS duration_seconds,
    (SELECT COUNT(*) FROM agent_decisions ad WHERE ad.execution_id = te.id) AS decision_count,
    (SELECT COUNT(*) FROM execution_logs el WHERE el.execution_id = te.id) AS log_count
FROM test_executions te
JOIN test_scenarios ts ON te.scenario_id = ts.id
JOIN test_workflows tw ON te.workflow_id = tw.id
ORDER BY te.started_at DESC;

COMMENT ON VIEW v_active_executions IS 'Active and recent test executions with scenario and workflow details';

-- View: Agent decision summary by execution
CREATE OR REPLACE VIEW v_execution_decision_summary AS
SELECT
    execution_id,
    agent_name,
    decision,
    COUNT(*) AS decision_count,
    AVG(confidence) AS avg_confidence,
    AVG(processing_time_ms) AS avg_processing_time_ms,
    MIN(decided_at) AS first_decision_at,
    MAX(decided_at) AS last_decision_at
FROM agent_decisions
GROUP BY execution_id, agent_name, decision
ORDER BY execution_id DESC, agent_name, decision;

COMMENT ON VIEW v_execution_decision_summary IS 'Aggregated decision metrics by execution and agent';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Mark execution as completed
CREATE OR REPLACE FUNCTION complete_execution(
    p_execution_id INTEGER,
    p_results JSONB DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
    UPDATE test_executions
    SET
        status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        results = p_results
    WHERE id = p_execution_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION complete_execution IS 'Mark a test execution as completed with final results';

-- Function: Mark execution as failed
CREATE OR REPLACE FUNCTION fail_execution(
    p_execution_id INTEGER,
    p_error_message TEXT
) RETURNS void AS $$
BEGIN
    UPDATE test_executions
    SET
        status = 'failed',
        completed_at = CURRENT_TIMESTAMP,
        results = jsonb_build_object('error', p_error_message)
    WHERE id = p_execution_id;

    INSERT INTO execution_logs (execution_id, log_level, message, logged_at)
    VALUES (p_execution_id, 'ERROR', p_error_message, CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fail_execution IS 'Mark a test execution as failed with error message';

-- ============================================================================
-- GRANTS (Optional - adjust based on your user roles)
-- ============================================================================
-- Example: GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;

-- ============================================================================
-- SCHEMA VERIFICATION
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
    workflow_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'test_workflows', 'test_scenarios', 'test_executions',
        'agent_decisions', 'execution_logs'
    );

    -- Count workflows
    SELECT COUNT(*) INTO workflow_count FROM test_workflows;

    RAISE NOTICE '============================================';
    RAISE NOTICE 'Test Lab Schema Installation Complete';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Workflows seeded: %', workflow_count;
    RAISE NOTICE 'Views created: 2';
    RAISE NOTICE 'Functions created: 2';
    RAISE NOTICE '============================================';

    IF table_count < 5 THEN
        RAISE WARNING 'Expected 5 tables but found %. Check for errors.', table_count;
    END IF;
END $$;
