import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// Connect to the aircraft database
// Use environment variable for Railway, fallback to localhost for development
const aircraftPool = new Pool({
  connectionString: process.env.AIRCRAFT_DATABASE_URL ||
    'postgresql://srihaanbandu@localhost:5432/aircraft_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * GET /api/fleet/overview
 * Get fleet overview with airline statistics
 */
router.get('/overview', async (req, res) => {
  try {
    const query = `
      SELECT
        a.iata_code,
        a.name,
        a.country,
        COUNT(ac.*) as fleet_size,
        COUNT(CASE WHEN ac.status = 'active' THEN 1 END) as active_aircraft,
        COUNT(CASE WHEN ac.status = 'maintenance' THEN 1 END) as in_maintenance,
        COUNT(CASE WHEN ac.status = 'stored' THEN 1 END) as stored
      FROM airlines a
      LEFT JOIN aircraft ac ON a.id = ac.current_airline_id
      WHERE a.is_active = true
      GROUP BY a.iata_code, a.name, a.country
      HAVING COUNT(ac.*) > 0
      ORDER BY fleet_size DESC
    `;

    const result = await aircraftPool.query(query);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching fleet overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fleet data'
    });
  }
});

/**
 * GET /api/fleet/airline/:code
 * Get detailed fleet information for a specific airline
 */
router.get('/airline/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const query = `
      SELECT
        ac.registration,
        CONCAT(at.manufacturer, ' ', at.model) as aircraft_type,
        at.manufacturer,
        at.model as model_name,
        ac.status,
        ac.age_years,
        ac.delivery_date
      FROM aircraft ac
      JOIN airlines a ON ac.current_airline_id = a.id
      JOIN aircraft_types at ON ac.aircraft_type_id = at.id
      WHERE a.iata_code = $1
      ORDER BY at.manufacturer, at.model, ac.registration
    `;

    const result = await aircraftPool.query(query, [code.toUpperCase()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Airline not found or has no aircraft'
      });
    }

    res.json({
      success: true,
      data: {
        airline_code: code.toUpperCase(),
        fleet: result.rows
      }
    });
  } catch (error) {
    console.error('Error fetching airline fleet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch airline fleet data'
    });
  }
});

/**
 * GET /api/fleet/statistics
 * Get global fleet statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(DISTINCT a.id) as total_airlines,
        COUNT(ac.*) as total_aircraft,
        COUNT(DISTINCT ac.aircraft_type_id) as aircraft_types,
        ROUND(AVG(ac.age_years), 1) as avg_age_years,
        COUNT(CASE WHEN ac.status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN ac.status = 'maintenance' THEN 1 END) as maintenance_count,
        COUNT(CASE WHEN ac.status = 'stored' THEN 1 END) as stored_count
      FROM airlines a
      LEFT JOIN aircraft ac ON a.id = ac.current_airline_id
      WHERE a.is_active = true
    `;

    const result = await aircraftPool.query(query);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching fleet statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fleet statistics'
    });
  }
});

/**
 * GET /api/fleet/types
 * Get aircraft type breakdown
 */
router.get('/types', async (req, res) => {
  try {
    const query = `
      SELECT
        CONCAT(at.manufacturer, ' ', at.model) as aircraft_type,
        at.manufacturer,
        COUNT(*) as count,
        ROUND(AVG(ac.age_years), 1) as avg_age,
        COUNT(CASE WHEN ac.status = 'active' THEN 1 END) as active_count
      FROM aircraft ac
      JOIN aircraft_types at ON ac.aircraft_type_id = at.id
      WHERE ac.current_airline_id IS NOT NULL
      GROUP BY at.manufacturer, at.model
      ORDER BY count DESC
      LIMIT 10
    `;

    const result = await aircraftPool.query(query);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching aircraft types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch aircraft types'
    });
  }
});

export default router;
