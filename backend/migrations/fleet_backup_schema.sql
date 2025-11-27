-- Fleet Data Backup and Change Tracking Schema
-- This schema supports the Fleet Data Management & Scraping Card
-- Created: 2024-11-27

-- ============================================================================
-- SCRAPING JOBS TABLE
-- Tracks all fleet data scraping jobs
-- ============================================================================
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(255) UNIQUE NOT NULL,
  airline_code VARCHAR(10) NOT NULL,
  airline_name VARCHAR(255),
  job_type VARCHAR(50) NOT NULL, -- 'quick_update', 'full_rescrape', 'verify_only'
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled'
  priority VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high'

  -- Progress tracking
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_phase VARCHAR(50), -- 'discovering', 'processing', 'validating', 'saving'
  current_aircraft VARCHAR(50),

  -- Statistics
  discovered_count INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  new_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0,
  retired_count INTEGER DEFAULT 0,
  unchanged_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_completion TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Configuration
  backup_before_update BOOLEAN DEFAULT true,
  notify_on_complete BOOLEAN DEFAULT false,
  backup_id INTEGER,

  -- Results
  result_summary JSONB,
  error_message TEXT,

  -- Metadata
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scraping_jobs_airline ON scraping_jobs(airline_code);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX idx_scraping_jobs_created ON scraping_jobs(created_at DESC);
CREATE INDEX idx_scraping_jobs_job_id ON scraping_jobs(job_id);

-- ============================================================================
-- AIRCRAFT BACKUP TABLE
-- Stores backups of aircraft data before updates
-- ============================================================================
CREATE TABLE IF NOT EXISTS aircraft_backup (
  id SERIAL PRIMARY KEY,
  backup_id VARCHAR(255) UNIQUE NOT NULL,
  airline_code VARCHAR(10) NOT NULL,
  airline_name VARCHAR(255),
  backup_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  backup_reason VARCHAR(255),

  -- Backup data
  aircraft_data JSONB NOT NULL,
  fleet_size INTEGER,

  -- Metadata
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  restored_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_aircraft_backup_airline ON aircraft_backup(airline_code);
CREATE INDEX idx_aircraft_backup_timestamp ON aircraft_backup(backup_timestamp DESC);
CREATE INDEX idx_aircraft_backup_id ON aircraft_backup(backup_id);

-- ============================================================================
-- DATA CHANGES TABLE
-- Tracks individual changes detected during scraping jobs
-- ============================================================================
CREATE TABLE IF NOT EXISTS data_changes (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(255) REFERENCES scraping_jobs(job_id) ON DELETE CASCADE,
  change_id VARCHAR(255) UNIQUE NOT NULL,

  -- Change details
  change_type VARCHAR(50) NOT NULL, -- 'new', 'updated', 'retired', 'unchanged'
  aircraft_registration VARCHAR(20),
  aircraft_type VARCHAR(100),

  -- Data comparison
  old_data JSONB,
  new_data JSONB,
  differences JSONB, -- Specific fields that changed

  -- Confidence and quality
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  data_quality_score DECIMAL(3,2),
  validation_status VARCHAR(50), -- 'valid', 'needs_review', 'invalid'
  validation_notes TEXT,

  -- Approval workflow
  approved BOOLEAN DEFAULT false,
  approved_by VARCHAR(100),
  approved_at TIMESTAMPTZ,
  rejected BOOLEAN DEFAULT false,
  rejection_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_data_changes_job ON data_changes(job_id);
CREATE INDEX idx_data_changes_type ON data_changes(change_type);
CREATE INDEX idx_data_changes_aircraft ON data_changes(aircraft_registration);
CREATE INDEX idx_data_changes_approved ON data_changes(approved);

-- ============================================================================
-- AIRLINE DATA STATUS TABLE
-- Tracks current data quality and update status for each airline
-- ============================================================================
CREATE TABLE IF NOT EXISTS airline_data_status (
  id SERIAL PRIMARY KEY,
  airline_code VARCHAR(10) UNIQUE NOT NULL,
  airline_name VARCHAR(255),

  -- Fleet statistics
  fleet_size INTEGER DEFAULT 0,
  active_aircraft INTEGER DEFAULT 0,
  stored_aircraft INTEGER DEFAULT 0,

  -- Data quality metrics
  last_updated TIMESTAMPTZ,
  last_scrape_job_id VARCHAR(255),
  average_confidence DECIMAL(3,2),
  complete_records INTEGER DEFAULT 0,
  incomplete_records INTEGER DEFAULT 0,
  needs_review_count INTEGER DEFAULT 0,

  -- Status assessment
  data_status VARCHAR(50), -- 'good', 'stale', 'critical', 'empty'
  days_since_update INTEGER,
  needs_update BOOLEAN DEFAULT false,

  -- Update schedule
  auto_update_enabled BOOLEAN DEFAULT false,
  auto_update_frequency VARCHAR(20), -- 'daily', 'weekly', 'biweekly', 'monthly'
  auto_update_time TIME, -- Preferred time for updates
  next_scheduled_update TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_airline_status_code ON airline_data_status(airline_code);
CREATE INDEX idx_airline_status_needs_update ON airline_data_status(needs_update);
CREATE INDEX idx_airline_status_updated ON airline_data_status(last_updated);

-- ============================================================================
-- QUALITY ISSUES TABLE
-- Tracks data quality issues that need manual review
-- ============================================================================
CREATE TABLE IF NOT EXISTS quality_issues (
  id SERIAL PRIMARY KEY,
  issue_id VARCHAR(255) UNIQUE NOT NULL,
  airline_code VARCHAR(10),
  aircraft_registration VARCHAR(20),

  -- Issue details
  issue_type VARCHAR(50) NOT NULL, -- 'missing_field', 'low_confidence', 'conflicting_data', 'outdated'
  severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  description TEXT NOT NULL,
  suggested_action TEXT,

  -- Related data
  affected_fields JSONB,
  current_data JSONB,

  -- Resolution tracking
  resolved BOOLEAN DEFAULT false,
  resolved_by VARCHAR(100),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quality_issues_airline ON quality_issues(airline_code);
CREATE INDEX idx_quality_issues_type ON quality_issues(issue_type);
CREATE INDEX idx_quality_issues_severity ON quality_issues(severity);
CREATE INDEX idx_quality_issues_resolved ON quality_issues(resolved);

-- ============================================================================
-- UPDATE HISTORY TABLE
-- Audit log of all fleet data updates
-- ============================================================================
CREATE TABLE IF NOT EXISTS update_history (
  id SERIAL PRIMARY KEY,
  airline_code VARCHAR(10) NOT NULL,
  job_id VARCHAR(255) REFERENCES scraping_jobs(job_id),

  -- Update summary
  update_type VARCHAR(50), -- 'scrape', 'manual', 'rollback'
  changes_summary TEXT,
  new_aircraft INTEGER DEFAULT 0,
  retired_aircraft INTEGER DEFAULT 0,
  updated_aircraft INTEGER DEFAULT 0,

  -- Timing
  update_timestamp TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,

  -- User tracking
  performed_by VARCHAR(100),

  -- Metadata
  notes TEXT
);

CREATE INDEX idx_update_history_airline ON update_history(airline_code);
CREATE INDEX idx_update_history_timestamp ON update_history(update_timestamp DESC);
CREATE INDEX idx_update_history_job ON update_history(job_id);

-- ============================================================================
-- NOTIFICATION SETTINGS TABLE
-- User preferences for scraping job notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_settings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,

  -- Notification channels
  email_enabled BOOLEAN DEFAULT false,
  email_address VARCHAR(255),
  slack_enabled BOOLEAN DEFAULT false,
  slack_webhook_url VARCHAR(500),
  webhook_enabled BOOLEAN DEFAULT false,
  webhook_url VARCHAR(500),

  -- Trigger settings
  notify_on_job_complete BOOLEAN DEFAULT true,
  notify_on_significant_changes BOOLEAN DEFAULT true,
  notify_on_errors BOOLEAN DEFAULT true,
  notify_on_quality_issues BOOLEAN DEFAULT false,

  -- Thresholds
  significant_changes_threshold INTEGER DEFAULT 10, -- Number of changes to trigger notification

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_settings_user ON notification_settings(user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for scraping_jobs
CREATE TRIGGER update_scraping_jobs_updated_at
  BEFORE UPDATE ON scraping_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for data_changes
CREATE TRIGGER update_data_changes_updated_at
  BEFORE UPDATE ON data_changes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for airline_data_status
CREATE TRIGGER update_airline_data_status_updated_at
  BEFORE UPDATE ON airline_data_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for quality_issues
CREATE TRIGGER update_quality_issues_updated_at
  BEFORE UPDATE ON quality_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate days since update
CREATE OR REPLACE FUNCTION calculate_days_since_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_updated IS NOT NULL THEN
    NEW.days_since_update = EXTRACT(DAY FROM (NOW() - NEW.last_updated))::INTEGER;

    -- Update data status based on age
    IF NEW.days_since_update IS NULL OR NEW.fleet_size = 0 THEN
      NEW.data_status = 'empty';
      NEW.needs_update = true;
    ELSIF NEW.days_since_update > 14 OR (NEW.average_confidence IS NOT NULL AND NEW.average_confidence < 0.75) THEN
      NEW.data_status = 'critical';
      NEW.needs_update = true;
    ELSIF NEW.days_since_update > 7 OR (NEW.average_confidence IS NOT NULL AND NEW.average_confidence < 0.85) THEN
      NEW.data_status = 'stale';
      NEW.needs_update = true;
    ELSE
      NEW.data_status = 'good';
      NEW.needs_update = false;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic status calculation
CREATE TRIGGER calculate_airline_status
  BEFORE INSERT OR UPDATE OF last_updated, average_confidence, fleet_size
  ON airline_data_status
  FOR EACH ROW
  EXECUTE FUNCTION calculate_days_since_update();

-- ============================================================================
-- SEED DATA
-- Insert initial airline status records for supported airlines
-- ============================================================================
INSERT INTO airline_data_status (airline_code, airline_name, fleet_size, data_status)
VALUES
  ('UA', 'United Airlines', 0, 'empty'),
  ('DL', 'Delta Air Lines', 0, 'empty'),
  ('AA', 'American Airlines', 0, 'empty'),
  ('AS', 'Alaska Airlines', 0, 'empty'),
  ('CM', 'Copa Airlines', 0, 'empty'),
  ('XP', 'Avelo Airlines', 0, 'empty')
ON CONFLICT (airline_code) DO NOTHING;

-- ============================================================================
-- VIEWS
-- Convenient views for common queries
-- ============================================================================

-- View: Active scraping jobs
CREATE OR REPLACE VIEW active_scraping_jobs AS
SELECT
  id, job_id, airline_code, airline_name, job_type, status, priority,
  progress, current_phase, current_aircraft,
  discovered_count, processed_count, new_count, updated_count, retired_count,
  started_at, estimated_completion,
  EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER as elapsed_seconds
FROM scraping_jobs
WHERE status IN ('pending', 'running')
ORDER BY priority DESC, created_at ASC;

-- View: Recent completed jobs
CREATE OR REPLACE VIEW recent_completed_jobs AS
SELECT
  j.job_id, j.airline_code, j.airline_name, j.job_type, j.status,
  j.new_count, j.updated_count, j.retired_count, j.unchanged_count,
  j.completed_at, j.duration_seconds,
  CONCAT(j.new_count, ' new, ', j.updated_count, ' updated, ', j.retired_count, ' retired') as summary
FROM scraping_jobs j
WHERE status = 'completed'
ORDER BY completed_at DESC
LIMIT 10;

-- View: Data quality summary
CREATE OR REPLACE VIEW data_quality_summary AS
SELECT
  COUNT(DISTINCT airline_code) as total_airlines,
  SUM(fleet_size) as total_aircraft,
  AVG(average_confidence) as avg_confidence,
  SUM(complete_records) as complete_records,
  SUM(incomplete_records) as incomplete_records,
  SUM(needs_review_count) as needs_review,
  COUNT(CASE WHEN data_status = 'good' THEN 1 END) as good_count,
  COUNT(CASE WHEN data_status = 'stale' THEN 1 END) as stale_count,
  COUNT(CASE WHEN data_status = 'critical' THEN 1 END) as critical_count,
  COUNT(CASE WHEN data_status = 'empty' THEN 1 END) as empty_count
FROM airline_data_status;

-- ============================================================================
-- COMMENTS
-- Add helpful comments to tables
-- ============================================================================
COMMENT ON TABLE scraping_jobs IS 'Tracks all fleet data scraping jobs with progress and results';
COMMENT ON TABLE aircraft_backup IS 'Stores backups of aircraft data before updates for rollback capability';
COMMENT ON TABLE data_changes IS 'Individual changes detected during scraping jobs requiring approval';
COMMENT ON TABLE airline_data_status IS 'Current data quality and update status for each airline';
COMMENT ON TABLE quality_issues IS 'Data quality issues requiring manual review';
COMMENT ON TABLE update_history IS 'Audit log of all fleet data updates';
COMMENT ON TABLE notification_settings IS 'User preferences for scraping job notifications';

-- ============================================================================
-- GRANT PERMISSIONS (adjust based on your user roles)
-- ============================================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
SELECT 'Fleet backup schema migration completed successfully' as status;
