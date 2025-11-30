-- Sample trip data for testing proactive claim detection
-- These are completed trips that should trigger automatic claims

-- Trip 1: 3-day international trip (should generate per diem + international premium)
INSERT INTO trips (id, trip_date, route, flight_numbers, departure_time, arrival_time, flight_time_hours, credit_hours, layover_city, is_international, aircraft_type, status, captain_id, first_officer_id, senior_fa_id, junior_fa_id, created_at, updated_at)
VALUES
('TRIP-001', CURRENT_DATE - INTERVAL '2 days', 'MIA-BOG-MIA', 'CM401, CM402', '08:00', '18:30', 8.5, 10.5, 'Bogotá', true, '737-800', 'completed', 'P001', 'P002', 'CM001', 'FA002', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP);

-- Trip 2: 2-day domestic trip (should generate per diem only)
INSERT INTO trips (id, trip_date, route, flight_numbers, departure_time, arrival_time, flight_time_hours, credit_hours, layover_city, is_international, aircraft_type, status, captain_id, first_officer_id, senior_fa_id, junior_fa_id, created_at, updated_at)
VALUES
('TRIP-002', CURRENT_DATE - INTERVAL '1 day', 'BOS-ATL-BOS', 'CM101, CM102', '06:00', '14:00', 6.0, 7.5, 'Atlanta', false, 'A320', 'completed', 'P003', 'P004', 'CM001', 'FA003', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP);

-- Trip 3: Single day international (should generate international premium + per diem)
INSERT INTO trips (id, trip_date, route, flight_numbers, departure_time, arrival_time, flight_time_hours, credit_hours, layover_city, is_international, aircraft_type, status, captain_id, first_officer_id, senior_fa_id, junior_fa_id, created_at, updated_at)
VALUES
('TRIP-003', CURRENT_DATE, 'LAX-MEX-LAX', 'CM201, CM202', '10:00', '20:00', 7.0, 8.5, 'Mexico City', true, '737-MAX', 'completed', 'P005', 'P006', 'CM001', 'FA004', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Trip 4: Multi-day domestic with long duty hours (should trigger IROP/overtime)
INSERT INTO trips (id, trip_date, route, flight_numbers, departure_time, arrival_time, flight_time_hours, credit_hours, layover_city, is_international, aircraft_type, status, captain_id, first_officer_id, senior_fa_id, junior_fa_id, created_at, updated_at)
VALUES
('TRIP-004', CURRENT_DATE - INTERVAL '3 days', 'ORD-DFW-LAX-SEA', 'CM301, CM302, CM303', '05:00', '23:30', 12.5, 15.0, 'Seattle', false, 'A321', 'completed', 'P007', 'P008', 'CM001', 'FA005', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP);

-- Pairing 1: 4-day international pairing (comprehensive test)
INSERT INTO pairings (pairing_id, pairing_name, start_date, end_date, start_base, end_base, total_flight_hours, total_credit_hours, total_duty_hours, layover_cities, aircraft_type, status, created_at, updated_at)
VALUES
('PAR-001', '4-Day International', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '1 day', 'MIA', 'MIA', 32.5, 40.0, 48.0, ARRAY['São Paulo', 'Buenos Aires', 'Lima'], '787-9', 'completed', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP);

-- Roster assignment for CM001 (our test crew member)
INSERT INTO roster_assignments (roster_id, crew_id, pairing_id, trip_id, duty_date, duty_type, status, assigned_at)
VALUES
('RST-001', 'CM001', 'PAR-001', 'TRIP-001', CURRENT_DATE - INTERVAL '2 days', 'flight', 'completed', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('RST-002', 'CM001', NULL, 'TRIP-002', CURRENT_DATE - INTERVAL '1 day', 'flight', 'completed', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('RST-003', 'CM001', NULL, 'TRIP-003', CURRENT_DATE, 'flight', 'completed', CURRENT_TIMESTAMP),
('RST-004', 'CM001', NULL, 'TRIP-004', CURRENT_DATE - INTERVAL '3 days', 'flight', 'completed', CURRENT_TIMESTAMP - INTERVAL '3 days');

-- Ensure crew member CM001 exists
INSERT INTO crew_members (crew_id, first_name, last_name, base, position, hire_date, seniority_number, status, created_at, updated_at)
VALUES ('CM001', 'Sarah', 'Martinez', 'MIA', 'Senior Flight Attendant', '2015-03-15', 2847, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (crew_id) DO NOTHING;
