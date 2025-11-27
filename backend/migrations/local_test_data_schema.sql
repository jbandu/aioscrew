-- Local PostgreSQL Schema for Test Data Generation
-- Run this on local PostgreSQL database

-- ===========================================================================
-- CORE TABLES FOR TEST DATA GENERATION
-- ===========================================================================

-- Crew Members Table
CREATE TABLE IF NOT EXISTS crew_members (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    base VARCHAR(10) NOT NULL,
    seniority INTEGER NOT NULL,
    qualification VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hire_date DATE NOT NULL,
    ytd_earnings DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id VARCHAR(20) PRIMARY KEY,
    trip_date DATE NOT NULL,
    route VARCHAR(100) NOT NULL,
    flight_numbers VARCHAR(100),
    departure_time TIME,
    arrival_time TIME,
    flight_time_hours DECIMAL(5,2),
    credit_hours DECIMAL(5,2),
    layover_city VARCHAR(50),
    is_international BOOLEAN DEFAULT false,
    aircraft_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'scheduled',
    captain_id VARCHAR(20),
    first_officer_id VARCHAR(20),
    senior_fa_id VARCHAR(20),
    junior_fa_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pay Claims Table
CREATE TABLE IF NOT EXISTS pay_claims (
    id VARCHAR(20) PRIMARY KEY,
    crew_id VARCHAR(20),
    claim_type VARCHAR(50) NOT NULL,
    trip_id VARCHAR(20),
    claim_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    ai_validated BOOLEAN DEFAULT false,
    ai_explanation TEXT,
    contract_reference VARCHAR(100),
    submitted_by VARCHAR(100),
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    priority VARCHAR(10) DEFAULT 'normal',
    resolution_time_hours DECIMAL(5,2),
    ai_confidence DECIMAL(3,2),
    ai_recommendation VARCHAR(20),
    ai_reasoning TEXT,
    contract_references TEXT[],
    amount_approved DECIMAL(10,2)
);

-- Compliance Violations Table
CREATE TABLE IF NOT EXISTS compliance_violations (
    id SERIAL PRIMARY KEY,
    violation_type VARCHAR(100) NOT NULL,
    crew_id VARCHAR(20),
    trip_id VARCHAR(20),
    severity VARCHAR(20),
    description TEXT,
    contract_section VARCHAR(50),
    status VARCHAR(20) DEFAULT 'open',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Disruptions Table
CREATE TABLE IF NOT EXISTS disruptions (
    id SERIAL PRIMARY KEY,
    trip_id VARCHAR(20),
    disruption_type VARCHAR(50) NOT NULL,
    description TEXT,
    severity VARCHAR(20),
    crew_affected INTEGER DEFAULT 0,
    resolution_status VARCHAR(20) DEFAULT 'open',
    recovery_plan TEXT,
    cost_impact DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(trip_date);
CREATE INDEX IF NOT EXISTS idx_trips_route ON trips(route);
CREATE INDEX IF NOT EXISTS idx_pay_claims_date ON pay_claims(claim_date);
CREATE INDEX IF NOT EXISTS idx_pay_claims_status ON pay_claims(status);
CREATE INDEX IF NOT EXISTS idx_pay_claims_crew ON pay_claims(crew_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_crew ON compliance_violations(crew_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_trip ON compliance_violations(trip_id);
CREATE INDEX IF NOT EXISTS idx_disruptions_trip ON disruptions(trip_id);
CREATE INDEX IF NOT EXISTS idx_disruptions_type ON disruptions(disruption_type);

-- Add some sample system config for local testing
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_config (config_key, config_value, description)
VALUES
    ('auto_approval_threshold', '0.85'::jsonb, 'Minimum AI confidence for auto-approval'),
    ('max_auto_approval_amount', '1000'::jsonb, 'Maximum amount for auto-approval')
ON CONFLICT (config_key) DO NOTHING;
