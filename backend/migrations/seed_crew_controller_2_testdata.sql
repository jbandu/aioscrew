-- Seed Test Data for Crew Controller 2.0 Demo
-- This creates realistic operational data for all 6 scenarios

-- Clean up existing test data (optional - comment out if you want to preserve existing data)
-- DELETE FROM disruptions WHERE disruption_id > 1000;
-- DELETE FROM roster_assignments WHERE assignment_id > 1000;
-- DELETE FROM crew_duty_history WHERE duty_id > 1000;
-- DELETE FROM crew_availability WHERE availability_id > 1000;

-- ============================================================================
-- SCENARIO 1 & 2: Weather Exposure + Crew Fatigue
-- ============================================================================

-- Seed trips for today with various statuses
INSERT INTO trips (id, trip_date, route, flight_numbers, departure_time, arrival_time, flight_time_hours, credit_hours, aircraft_type, status, captain_id, first_officer_id)
VALUES
  ('CM417', CURRENT_DATE, 'PTY-BOG', 'CM 417', '12:45', '14:30', 1.75, 2.0, 'B737-800', 'delayed', 'CREW001', 'CREW002'),
  ('CM234', CURRENT_DATE, 'PTY-MIA', 'CM 234', '13:15', '16:30', 2.25, 2.5, 'B737-800', 'scheduled', 'CREW003', 'CREW004'),
  ('CM891', CURRENT_DATE, 'PTY-GRU', 'CM 891', '14:00', '19:45', 5.75, 6.0, 'B787-9', 'scheduled', 'CREW005', 'CREW006'),
  ('CM156', CURRENT_DATE, 'PTY-CUN', 'CM 156', '15:30', '18:00', 2.5, 2.75, 'B737-800', 'scheduled', 'CREW007', 'CREW008'),
  ('CM523', CURRENT_DATE, 'PTY-LIM', 'CM 523', '10:00', '13:15', 3.25, 3.5, 'B737-MAX', 'scheduled', 'CREW009', 'CREW010')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  trip_date = EXCLUDED.trip_date;

-- Seed crew members if they don't exist
INSERT INTO crew_members (id, name, role, base, seniority, qualification, email, phone, hire_date, status)
VALUES
  ('CREW001', 'Capt. Rodriguez', 'Captain', 'PTY', 1500, 'B737-800', 'rodriguez@copa.com', '+507-1234-5601', '2010-01-15', 'active'),
  ('CREW002', 'F/O Mendez', 'First Officer', 'PTY', 800, 'B737-800', 'mendez@copa.com', '+507-1234-5602', '2015-03-20', 'active'),
  ('CREW003', 'Capt. Silva', 'Captain', 'PTY', 1800, 'B737-800', 'silva@copa.com', '+507-1234-5603', '2008-06-10', 'active'),
  ('CREW004', 'F/O Torres', 'First Officer', 'PTY', 600, 'B737-800', 'torres@copa.com', '+507-1234-5604', '2017-02-14', 'active'),
  ('CREW005', 'Capt. Williams', 'Captain', 'PTY', 2200, 'B787-9', 'williams@copa.com', '+507-1234-5605', '2005-09-01', 'active'),
  ('CREW006', 'F/O Chen', 'First Officer', 'PTY', 700, 'B787-9', 'chen@copa.com', '+507-1234-5606', '2016-11-08', 'active'),
  ('CREW007', 'Capt. Martinez', 'Captain', 'PTY', 1200, 'B737-800', 'martinez@copa.com', '+507-1234-5607', '2012-04-22', 'active'),
  ('CREW008', 'F/O Garcia', 'First Officer', 'PTY', 500, 'B737-800', 'garcia@copa.com', '+507-1234-5608', '2018-07-30', 'active'),
  ('CREW009', 'Capt. Lopez', 'Captain', 'PTY', 1600, 'B737-MAX', 'lopez@copa.com', '+507-1234-5609', '2009-12-15', 'active'),
  ('CREW010', 'F/O Castillo', 'First Officer', 'PTY', 650, 'B737-MAX', 'castillo@copa.com', '+507-1234-5610', '2016-08-19', 'active'),

  -- Reserve crew for Scenario 4
  ('CREW011', 'F/O Rivera', 'First Officer', 'PTY', 450, 'B737-800', 'rivera@copa.com', '+507-1234-5611', '2019-03-10', 'active'),
  ('CREW012', 'Capt. Santos', 'Captain', 'PTY', 1400, 'B737-800,B787-9', 'santos@copa.com', '+507-1234-5612', '2011-05-20', 'active'),
  ('CREW013', 'F/O Morales', 'First Officer', 'PTY', 400, 'B737-800', 'morales@copa.com', '+507-1234-5613', '2019-10-05', 'active'),
  ('CREW014', 'Capt. Lopez', 'Captain', 'PTY', 1900, 'B737-800,B737-MAX,B787-9', 'lopez2@copa.com', '+507-1234-5614', '2007-02-28', 'active'),
  ('CREW015', 'F/O Castillo', 'First Officer', 'PTY', 550, 'B737-MAX', 'castillo2@copa.com', '+507-1234-5615', '2017-09-12', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status;

-- Seed crew duty history for fatigue tracking
INSERT INTO crew_duty_history (crew_id, duty_date, duty_start_time, duty_end_time, flight_time_hours, duty_time_hours, status, trip_id)
VALUES
  ('CREW002', CURRENT_DATE, CURRENT_DATE + TIME '06:00', CURRENT_DATE + TIME '14:30', 4.5, 8.5, 'scheduled', 'CM417'),
  ('CREW004', CURRENT_DATE, CURRENT_DATE + TIME '07:30', CURRENT_DATE + TIME '16:00', 5.0, 8.5, 'scheduled', 'CM234'),
  ('CREW006', CURRENT_DATE, CURRENT_DATE + TIME '08:00', CURRENT_DATE + TIME '16:30', 5.75, 8.5, 'scheduled', 'CM891'),
  ('CREW008', CURRENT_DATE, CURRENT_DATE + TIME '09:00', CURRENT_DATE + TIME '17:30', 4.5, 8.5, 'scheduled', 'CM156'),
  ('CREW010', CURRENT_DATE, CURRENT_DATE + TIME '06:30', CURRENT_DATE + TIME '15:00', 3.5, 8.5, 'scheduled', 'CM523')
ON CONFLICT DO NOTHING;

-- Seed roster assignments
INSERT INTO roster_assignments (roster_period_start, roster_period_end, crew_id, trip_id, assignment_type, start_date, end_date, status)
VALUES
  (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 'CREW001', 'CM417', 'pairing', CURRENT_DATE, CURRENT_DATE, 'scheduled'),
  (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 'CREW002', 'CM417', 'pairing', CURRENT_DATE, CURRENT_DATE, 'scheduled'),
  (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 'CREW003', 'CM234', 'pairing', CURRENT_DATE, CURRENT_DATE, 'scheduled'),
  (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 'CREW004', 'CM234', 'pairing', CURRENT_DATE, CURRENT_DATE, 'scheduled'),
  (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 'CREW005', 'CM891', 'pairing', CURRENT_DATE, CURRENT_DATE, 'scheduled'),
  (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 'CREW006', 'CM891', 'pairing', CURRENT_DATE, CURRENT_DATE, 'scheduled'),
  (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 'CREW007', 'CM156', 'pairing', CURRENT_DATE, CURRENT_DATE, 'scheduled'),
  (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 'CREW008', 'CM156', 'pairing', CURRENT_DATE, CURRENT_DATE, 'scheduled')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCENARIO 1: Weather Exposure - Disruption Data
-- ============================================================================

INSERT INTO disruptions (disruption_type, severity, affected_flight_id, affected_crew_ids, disruption_start, root_cause, description, impact_assessment, status)
VALUES
  ('weather', 'major', 'CM417', ARRAY['CREW001', 'CREW002'], NOW(), 'Thunderstorm activity at PTY',
   'Ground stops due to severe thunderstorms. 90-minute delay expected. F/O Mendez approaching duty time limit.',
   '{"affected_flights": ["CM417", "CM305", "CM412"], "affected_crew": 4, "cost_impact": 47000, "passenger_impact": 143}'::jsonb,
   'open'),
  ('weather', 'moderate', 'CM234', ARRAY['CREW003', 'CREW004'], NOW(), 'Weather delays cascading from PTY',
   'Secondary impact from PTY weather system',
   '{"affected_flights": ["CM234"], "affected_crew": 2, "cost_impact": 12000}'::jsonb,
   'open'),
  ('weather', 'moderate', 'CM891', ARRAY['CREW005', 'CREW006'], NOW(), 'Weather watch',
   'Monitoring weather patterns for potential impact',
   '{"affected_flights": ["CM891"], "affected_crew": 2, "cost_impact": 8000}'::jsonb,
   'open')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCENARIO 4: Reserve Coverage
-- ============================================================================

INSERT INTO crew_availability (crew_id, availability_type, start_date, end_date, notes)
VALUES
  ('CREW011', 'reserve', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'Airport-based reserve - Gate Area'),
  ('CREW012', 'reserve', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'Hotel-based reserve - Marriott PTY'),
  ('CREW013', 'standby', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'Home-based reserve - Costa del Este'),
  ('CREW014', 'reserve', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'Airport-based reserve - Crew Lounge'),
  ('CREW015', 'reserve', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'Hotel-based reserve - Hilton PTY Airport')
ON CONFLICT DO NOTHING;

-- Seed crew qualifications for reserve crew
INSERT INTO crew_qualifications (crew_id, qualification_type, qualification_code, issued_date, expiry_date, status)
VALUES
  ('CREW011', 'aircraft_type', 'B737', '2019-03-15', '2026-03-15', 'active'),
  ('CREW011', 'aircraft_type', 'B737 MAX', '2020-06-01', '2026-06-01', 'active'),
  ('CREW012', 'aircraft_type', 'B737', '2011-05-25', '2026-05-25', 'active'),
  ('CREW012', 'aircraft_type', 'B787', '2015-09-10', '2026-09-10', 'active'),
  ('CREW013', 'aircraft_type', 'B737', '2019-10-10', '2026-10-10', 'active'),
  ('CREW014', 'aircraft_type', 'B737', '2007-03-01', '2027-03-01', 'active'),
  ('CREW014', 'aircraft_type', 'B737 MAX', '2020-08-15', '2026-08-15', 'active'),
  ('CREW014', 'aircraft_type', 'B787', '2012-11-20', '2026-11-20', 'active'),
  ('CREW015', 'aircraft_type', 'B737 MAX', '2020-07-01', '2026-07-01', 'active')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCENARIO 5: Day Comparison - Historical Disruption Data
-- ============================================================================

-- Last Tuesday (7 days ago) disruptions
INSERT INTO disruptions (disruption_type, severity, affected_flight_id, disruption_start, disruption_end, root_cause, description, impact_assessment, status, resolved_at)
VALUES
  ('delay', 'major', 'CM201', NOW() - INTERVAL '7 days' + TIME '08:00', NOW() - INTERVAL '7 days' + TIME '10:30', 'Weather', 'Ground stop', '{"cost_impact": 15000}'::jsonb, 'resolved', NOW() - INTERVAL '7 days' + TIME '10:30'),
  ('delay', 'major', 'CM305', NOW() - INTERVAL '7 days' + TIME '09:30', NOW() - INTERVAL '7 days' + TIME '11:00', 'Crew cascade', 'Crew unavailable from CM201', '{"cost_impact": 12000}'::jsonb, 'resolved', NOW() - INTERVAL '7 days' + TIME '11:00'),
  ('delay', 'major', 'CM412', NOW() - INTERVAL '7 days' + TIME '11:00', NOW() - INTERVAL '7 days' + TIME '13:00', 'Crew cascade', 'Crew from CM305 delayed', '{"cost_impact": 18000}'::jsonb, 'resolved', NOW() - INTERVAL '7 days' + TIME '13:00'),
  ('cancellation', 'critical', 'CM567', NOW() - INTERVAL '7 days' + TIME '14:00', NOW() - INTERVAL '7 days' + TIME '14:00', 'Maintenance', 'Aircraft grounded', '{"cost_impact": 52000}'::jsonb, 'resolved', NOW() - INTERVAL '7 days' + TIME '18:00'),
  ('cancellation', 'critical', 'CM789', NOW() - INTERVAL '7 days' + TIME '16:00', NOW() - INTERVAL '7 days' + TIME '16:00', 'Crew shortage', 'No available crew', '{"cost_impact": 48000}'::jsonb, 'resolved', NOW() - INTERVAL '7 days' + TIME '20:00')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCENARIO 6: Root Cause Analysis - MIA Delays
-- ============================================================================

-- MIA delays from last week
INSERT INTO disruptions (disruption_type, severity, affected_flight_id, disruption_start, root_cause, description, impact_assessment, status, resolved_at)
VALUES
  ('delay', 'major', 'CM101-MIA', NOW() - INTERVAL '6 days', 'Weather', 'Ground stops at MIA', '{"cost_impact": 8000}'::jsonb, 'resolved', NOW() - INTERVAL '6 days' + INTERVAL '2 hours'),
  ('delay', 'moderate', 'CM102-MIA', NOW() - INTERVAL '6 days', 'Weather', 'De-icing delays', '{"cost_impact": 3500}'::jsonb, 'resolved', NOW() - INTERVAL '6 days' + INTERVAL '1 hour'),
  ('delay', 'major', 'CM103-MIA', NOW() - INTERVAL '5 days', 'Crew cascade', 'PTY originating delay', '{"cost_impact": 12000}'::jsonb, 'resolved', NOW() - INTERVAL '5 days' + INTERVAL '3 hours'),
  ('delay', 'moderate', 'CM104-MIA', NOW() - INTERVAL '5 days', 'Crew cascade', 'Legality timeout', '{"cost_impact": 7000}'::jsonb, 'resolved', NOW() - INTERVAL '5 days' + INTERVAL '2 hours'),
  ('delay', 'moderate', 'CM105-MIA', NOW() - INTERVAL '4 days', 'Maintenance', 'AOG parts wait', '{"cost_impact": 9500}'::jsonb, 'resolved', NOW() - INTERVAL '4 days' + INTERVAL '4 hours'),
  ('delay', 'minor', 'CM106-MIA', NOW() - INTERVAL '4 days', 'Maintenance', 'Unscheduled check', '{"cost_impact": 4200}'::jsonb, 'resolved', NOW() - INTERVAL '4 days' + INTERVAL '1 hour'),
  ('delay', 'major', 'CM107-MIA', NOW() - INTERVAL '3 days', 'Weather', 'Ground stops', '{"cost_impact': 8500}'::jsonb, 'resolved', NOW() - INTERVAL '3 days' + INTERVAL '2 hours'),
  ('delay', 'moderate', 'CM108-MIA', NOW() - INTERVAL '2 days', 'Crew cascade', 'PTY delay impact', '{"cost_impact": 6800}'::jsonb, 'resolved', NOW() - INTERVAL '2 days' + INTERVAL '2 hours'),
  ('delay', 'major', 'CM109-MIA', NOW() - INTERVAL '2 days', 'Weather', 'Thunderstorms', '{"cost_impact": 11000}'::jsonb, 'resolved', NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),
  ('delay', 'moderate', 'CM110-MIA', NOW() - INTERVAL '1 day', 'Maintenance', 'AOG parts', '{"cost_impact": 7200}'::jsonb, 'resolved', NOW() - INTERVAL '1 day' + INTERVAL '3 hours'),
  ('delay', 'major', 'CM111-MIA', NOW() - INTERVAL '1 day', 'Crew cascade', 'Crew unavailable', '{"cost_impact": 13000}'::jsonb, 'resolved', NOW() - INTERVAL '1 day' + INTERVAL '4 hours'),
  ('delay', 'minor', 'CM112-MIA', NOW() - INTERVAL '12 hours', 'Weather', 'De-icing', '{"cost_impact": 3200}'::jsonb, 'resolved', NOW() - INTERVAL '10 hours'),
  ('delay', 'moderate', 'CM113-MIA', NOW() - INTERVAL '8 hours', 'Crew cascade', 'Legality', '{"cost_impact": 8900}'::jsonb, 'resolved', NOW() - INTERVAL '6 hours'),
  ('delay', 'minor', 'CM114-MIA', NOW() - INTERVAL '4 hours', 'Maintenance', 'Inspection', '{"cost_impact": 2800}'::jsonb, 'resolved', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Uncomment these to verify data was inserted correctly

/*
-- Check crew members
SELECT COUNT(*) as crew_count FROM crew_members WHERE id LIKE 'CREW%';

-- Check trips for today
SELECT * FROM trips WHERE trip_date = CURRENT_DATE;

-- Check active disruptions
SELECT * FROM disruptions WHERE status = 'open';

-- Check reserve crew
SELECT cm.name, ca.availability_type, ca.notes
FROM crew_members cm
JOIN crew_availability ca ON cm.id = ca.crew_id
WHERE ca.availability_type IN ('reserve', 'standby')
  AND CURRENT_DATE BETWEEN ca.start_date AND ca.end_date;

-- Check duty hours remaining
SELECT
  cm.name,
  cdh.duty_start_time,
  cdh.duty_end_time,
  EXTRACT(EPOCH FROM (cdh.duty_end_time - NOW())) / 3600 as hours_remaining
FROM crew_members cm
JOIN crew_duty_history cdh ON cm.id = cdh.crew_id
WHERE cdh.duty_date = CURRENT_DATE
ORDER BY hours_remaining ASC;

-- Check MIA delays
SELECT COUNT(*), root_cause, AVG(cost_impact)
FROM disruptions
WHERE affected_flight_id LIKE '%MIA%'
GROUP BY root_cause;
*/

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Crew Controller 2.0 test data seeded successfully!';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 15 crew members';
  RAISE NOTICE '  - 5 trips for today';
  RAISE NOTICE '  - 3 weather disruptions';
  RAISE NOTICE '  - 5 reserve crew members';
  RAISE NOTICE '  - 5 historical disruptions (last Tuesday)';
  RAISE NOTICE '  - 14 MIA delays (last 7 days)';
END $$;
