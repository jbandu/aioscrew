# Crew Controller 2.0 - Database Integration Mapping

## Overview
This document maps Crew Controller 2.0 mock data to existing PostgreSQL database tables and outlines the integration strategy.

## Database Schema Analysis

### ✅ Existing Tables We Can Use

1. **crew_members** - Base crew information
2. **trips** - Flight information
3. **disruptions** - Disruption tracking
4. **crew_duty_history** - Duty time tracking
5. **crew_qualifications** - Aircraft certifications
6. **crew_availability** - Reserve crew status
7. **roster_assignments** - Current crew assignments
8. **disruption_analysis** - Historical disruption data

## Scenario Mapping

### 1. ✅ Weather Exposure Analysis (HIGH FEASIBILITY)

**Mock Data → Database Tables:**
```
weatherExposureData.hub → Static (PTY)
weatherExposureData.affectedFlights → trips table
  - flight number
  - route
  - status
  - aircraft_type

weatherExposureData.crewAtRisk → crew_duty_history + roster_assignments
  - crew_id
  - duty_start_time
  - duty_end_time
  - flight_time_hours
  - current assignment

weatherExposureData.financialExposure → disruptions table
  - cost_impact
  - affected_crew count
```

**SQL Query Example:**
```sql
-- Get flights at risk due to weather
SELECT
  t.id as flight,
  t.route,
  t.aircraft_type,
  COUNT(DISTINCT ra.crew_id) as crew_affected,
  SUM(d.cost_impact) as potential_exposure
FROM trips t
LEFT JOIN roster_assignments ra ON t.id = ra.trip_id
LEFT JOIN disruptions d ON t.id = d.affected_flight_id
WHERE t.status IN ('scheduled', 'delayed')
  AND t.trip_date = CURRENT_DATE
  AND d.disruption_type = 'weather'
GROUP BY t.id, t.route, t.aircraft_type;
```

---

### 2. ✅ Crew Fatigue Risk Heatmap (HIGH FEASIBILITY)

**Mock Data → Database Tables:**
```
fatigueRiskData.crewMembers → crew_duty_history + crew_members
  - crew_id
  - name
  - role
  - duty_start_time
  - duty_end_time
  - current_flight
  - hours_remaining (calculated)
```

**SQL Query Example:**
```sql
-- Calculate crew fatigue risk
SELECT
  cm.id,
  cm.name,
  cm.role,
  cdh.duty_start_time,
  cdh.duty_end_time,
  EXTRACT(EPOCH FROM (cdh.duty_end_time - NOW())) / 3600 as hours_remaining,
  ra.trip_id as current_flight,
  CASE
    WHEN EXTRACT(EPOCH FROM (cdh.duty_end_time - NOW())) / 3600 < 1 THEN 'critical'
    WHEN EXTRACT(EPOCH FROM (cdh.duty_end_time - NOW())) / 3600 < 2 THEN 'warning'
    ELSE 'normal'
  END as risk_level
FROM crew_members cm
JOIN crew_duty_history cdh ON cm.id = cdh.crew_id
JOIN roster_assignments ra ON cm.id = ra.crew_id
WHERE cdh.duty_date = CURRENT_DATE
  AND cdh.status = 'scheduled'
  AND ra.status = 'scheduled'
ORDER BY hours_remaining ASC;
```

---

### 3. ✅ Cancellation Passenger Impact (MEDIUM FEASIBILITY)

**Mock Data → Database Tables:**
```
cancellationImpactData → trips + disruptions
  - flight number
  - route
  - passengers (NEW FIELD NEEDED)
  - connections (NEW TABLE NEEDED)
  - cost breakdown
```

**Missing Data:**
- Passenger counts (need to add to trips table)
- Connection information (new table needed)

**Workaround:**
- Use average passenger counts by aircraft type
- Estimate connections based on route patterns

---

### 4. ✅ Reserve Coverage (HIGH FEASIBILITY)

**Mock Data → Database Tables:**
```
reserveCoverageData.reserves → crew_members + crew_availability + crew_qualifications
  - crew_id
  - name
  - role
  - location (NEW FIELD NEEDED)
  - availability_type = 'reserve'
  - certifications
  - response_time (calculated/estimated)
```

**SQL Query Example:**
```sql
-- Get available reserve crew
SELECT
  cm.id,
  cm.name,
  cm.role,
  cm.base,
  ca.availability_type,
  array_agg(DISTINCT cq.qualification_code) as certifications,
  -- Assume airport-based reserves have faster response
  CASE
    WHEN cm.base = 'PTY' THEN 15
    ELSE 45
  END as estimated_response_time
FROM crew_members cm
JOIN crew_availability ca ON cm.id = ca.crew_id
LEFT JOIN crew_qualifications cq ON cm.id = cq.crew_id
WHERE ca.availability_type IN ('reserve', 'standby')
  AND CURRENT_DATE BETWEEN ca.start_date AND ca.end_date
  AND cm.status = 'active'
  AND cq.status = 'active'
  AND cq.qualification_type = 'aircraft_type'
GROUP BY cm.id, cm.name, cm.role, cm.base, ca.availability_type
ORDER BY estimated_response_time ASC;
```

---

### 5. ✅ Day Comparison Analytics (HIGH FEASIBILITY)

**Mock Data → Database Tables:**
```
dayComparisonData → disruption_analysis + disruptions
  - analysis_period_start/end
  - total_disruptions
  - disruptions_by_type
  - disruptions_by_severity
  - total_cost_impact
```

**SQL Query Example:**
```sql
-- Compare today vs last week same day
WITH today_stats AS (
  SELECT
    COUNT(*) as total_disruptions,
    SUM(cost_impact) as total_cost,
    COUNT(*) FILTER (WHERE disruption_type = 'delay' AND severity = 'major') as major_delays
  FROM disruptions
  WHERE DATE(disruption_start) = CURRENT_DATE
),
comparison_stats AS (
  SELECT
    COUNT(*) as total_disruptions,
    SUM(cost_impact) as total_cost,
    COUNT(*) FILTER (WHERE disruption_type = 'delay' AND severity = 'major') as major_delays
  FROM disruptions
  WHERE DATE(disruption_start) = CURRENT_DATE - INTERVAL '7 days'
)
SELECT
  t.total_disruptions as today_disruptions,
  c.total_disruptions as comparison_disruptions,
  t.total_cost as today_cost,
  c.total_cost as comparison_cost,
  ROUND(((t.total_disruptions::numeric - c.total_disruptions) / c.total_disruptions * 100), 2) as percent_change
FROM today_stats t, comparison_stats c;
```

---

### 6. ✅ Root Cause Analysis (HIGH FEASIBILITY)

**Mock Data → Database Tables:**
```
rootCauseData → disruptions + disruption_analysis
  - station (filter by location)
  - period
  - root_cause
  - disruption_type
  - cost_impact
  - cascade tracking
```

**SQL Query Example:**
```sql
-- Root cause analysis for specific station
SELECT
  root_cause,
  disruption_type,
  COUNT(*) as occurrence_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage,
  AVG(cost_impact) as avg_cost,
  SUM(cost_impact) as total_cost
FROM disruptions
WHERE affected_flight_id LIKE '%MIA%'  -- Filter by station
  AND disruption_start >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY root_cause, disruption_type
ORDER BY occurrence_count DESC;
```

---

## Required Database Enhancements

### Minimal (Quick Wins)
1. ✅ No changes needed - use existing data with calculations
2. ✅ Add location tracking for crew (optional enhancement)

### Optional (Future Enhancements)
1. **Add to trips table:**
   ```sql
   ALTER TABLE trips ADD COLUMN passenger_count INTEGER;
   ALTER TABLE trips ADD COLUMN connection_count INTEGER;
   ```

2. **Create connections table:**
   ```sql
   CREATE TABLE trip_connections (
     connection_id SERIAL PRIMARY KEY,
     origin_trip_id VARCHAR(20) REFERENCES trips(id),
     connection_trip_id VARCHAR(20) REFERENCES trips(id),
     min_connection_time INTEGER,
     passenger_count INTEGER
   );
   ```

3. **Add to crew_members:**
   ```sql
   ALTER TABLE crew_members ADD COLUMN current_location VARCHAR(100);
   ALTER TABLE crew_members ADD COLUMN location_coords POINT;
   ```

---

## Test Data Seeding Strategy

### Phase 1: Minimal Seed (Use Existing Data)
- Query existing crew_members, trips, disruptions
- Use current date data
- Calculate derived fields on-the-fly

### Phase 2: Enhanced Seed (Recommended)
Create realistic test data for:
1. **20-30 crew members** with various duty states
2. **15-20 trips** for today with different statuses
3. **5-8 disruptions** with realistic scenarios
4. **10-15 roster assignments** linking crew to trips
5. **8-12 crew_duty_history** records for fatigue tracking
6. **5-8 reserve crew** in crew_availability

---

## Implementation Approach

### Option A: Start with Existing Data (Recommended)
**Pros:**
- Zero database changes needed
- Works immediately
- Uses real data patterns

**Cons:**
- May have sparse data
- Need to handle nulls gracefully

### Option B: Seed Rich Test Data
**Pros:**
- Comprehensive scenarios
- Predictable demo data
- Better visualization

**Cons:**
- Requires seed script
- Need to maintain test data

### Recommended: Hybrid Approach
1. Create database service functions that query existing tables
2. Fallback to enhanced mock data if queries return insufficient results
3. Add optional seed script for demo environments

---

## Next Steps

1. **Create database service module** (`crewController2Service.ts`)
2. **Implement 6 query functions** (one per scenario)
3. **Add API endpoints** in backend
4. **Update CrewController2.tsx** to fetch from API
5. **Create optional seed script** for demo data

---

## Estimated Complexity

| Scenario | Feasibility | Database Changes | Dev Time |
|----------|-------------|------------------|----------|
| Weather Exposure | ✅ High | None | 2-3 hours |
| Fatigue Heatmap | ✅ High | None | 2-3 hours |
| Passenger Impact | ⚠️ Medium | Optional | 3-4 hours |
| Reserve Coverage | ✅ High | Optional | 2-3 hours |
| Day Comparison | ✅ High | None | 2-3 hours |
| Root Cause | ✅ High | None | 2-3 hours |

**Total Estimated Time:** 14-21 hours

**Quick Win (3-4 hours):** Implement scenarios 1, 2, 4, 5, 6 with existing data
