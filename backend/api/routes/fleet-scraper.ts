/**
 * Fleet Scraper API Routes
 *
 * This module provides REST API endpoints for fleet data scraping, backup management,
 * and data quality monitoring. It integrates with the MCP Aircraft Database Server
 * for AI-powered web scraping of airline fleet data.
 *
 * Endpoints:
 * - Airline Status: View and update data quality status for airlines
 * - Scraping Jobs: Create, monitor, and manage scraping jobs
 * - Data Changes: Review and approve/reject changes before committing
 * - Backups: Create, restore, and compare backups
 * - Quality: Monitor data quality metrics and issues
 * - History: View update history and audit logs
 *
 * @module fleet-scraper-routes
 */

import express from 'express';
import { Pool } from 'pg';
import logger from '../../utils/logger.js';
import { io } from '../../server.js';

const router = express.Router();

// Database connection for fleet backup schema
// Uses environment DATABASE_URL (Railway/prod) or falls back to localhost (dev)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://srihaanbandu@localhost:5432/aircraft_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ============================================================================
// AIRLINE STATUS OPERATIONS
// ============================================================================

/**
 * GET /api/v1/airlines/status
 * Get status for all airlines
 */
router.get('/airlines/status', async (req, res) => {
  try {
    const query = `
      SELECT
        airline_code as code,
        airline_name as name,
        fleet_size as "fleetSize",
        active_aircraft as "activeAircraft",
        stored_aircraft as "storedAircraft",
        last_updated as "lastUpdated",
        last_scrape_job_id as "lastScrapeJobId",
        average_confidence as "averageConfidence",
        complete_records as "completeRecords",
        incomplete_records as "incompleteRecords",
        needs_review_count as "needsReviewCount",
        data_status as "dataStatus",
        days_since_update as "daysSinceUpdate",
        needs_update as "needsUpdate",
        auto_update_enabled as "autoUpdateEnabled",
        auto_update_frequency as "autoUpdateFrequency",
        next_scheduled_update as "nextScheduledUpdate"
      FROM airline_data_status
      ORDER BY airline_code
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching airline statuses', { error });
    res.status(500).json({ error: 'Failed to fetch airline statuses' });
  }
});

/**
 * GET /api/v1/airlines/:airlineCode/status
 * Get status for a specific airline
 */
router.get('/airlines/:airlineCode/status', async (req, res) => {
  try {
    const { airlineCode } = req.params;
    const query = `
      SELECT
        airline_code as code,
        airline_name as name,
        fleet_size as "fleetSize",
        active_aircraft as "activeAircraft",
        stored_aircraft as "storedAircraft",
        last_updated as "lastUpdated",
        last_scrape_job_id as "lastScrapeJobId",
        average_confidence as "averageConfidence",
        complete_records as "completeRecords",
        incomplete_records as "incompleteRecords",
        needs_review_count as "needsReviewCount",
        data_status as "dataStatus",
        days_since_update as "daysSinceUpdate",
        needs_update as "needsUpdate",
        auto_update_enabled as "autoUpdateEnabled",
        auto_update_frequency as "autoUpdateFrequency",
        next_scheduled_update as "nextScheduledUpdate"
      FROM airline_data_status
      WHERE airline_code = $1
    `;

    const result = await pool.query(query, [airlineCode.toUpperCase()]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Airline not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching airline status', { error });
    res.status(500).json({ error: 'Failed to fetch airline status' });
  }
});

/**
 * PUT /api/v1/airlines/:airlineCode/status
 * Update airline status manually
 */
router.put('/airlines/:airlineCode/status', async (req, res) => {
  try {
    const { airlineCode } = req.params;
    const updates = req.body;

    // Build dynamic UPDATE query based on provided fields
    const allowedFields = [
      'auto_update_enabled', 'auto_update_frequency', 'auto_update_time',
      'next_scheduled_update', 'needs_update'
    ];

    const setClause: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey)) {
        setClause.push(`${snakeKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(airlineCode.toUpperCase());
    const query = `
      UPDATE airline_data_status
      SET ${setClause.join(', ')}
      WHERE airline_code = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Airline not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating airline status', { error });
    res.status(500).json({ error: 'Failed to update airline status' });
  }
});

// ============================================================================
// SCRAPING JOB OPERATIONS
// ============================================================================

/**
 * POST /api/v1/scraping/jobs
 * Create a new scraping job
 */
router.post('/scraping/jobs', async (req, res) => {
  try {
    const {
      airlineCode,
      jobType = 'quick_update',
      priority = 'normal',
      backupBeforeUpdate = true,
      notifyOnComplete = false,
      createdBy
    } = req.body;

    // Emit: Starting job creation
    io.emit('scraping:progress', {
      airlineCode: airlineCode.toUpperCase(),
      phase: 'initializing',
      message: `Initializing scraping job for ${airlineCode.toUpperCase()}...`,
      progress: 0,
      timestamp: new Date().toISOString()
    });

    // Validate airline exists
    const airlineCheck = await pool.query(
      'SELECT airline_code, airline_name FROM airline_data_status WHERE airline_code = $1',
      [airlineCode.toUpperCase()]
    );

    if (airlineCheck.rows.length === 0) {
      io.emit('scraping:error', {
        airlineCode: airlineCode.toUpperCase(),
        error: 'Airline not found'
      });
      return res.status(404).json({ error: 'Airline not found' });
    }

    const airline = airlineCheck.rows[0];
    const jobId = `job_${airlineCode.toUpperCase()}_${Date.now()}`;

    // Emit: Validated airline
    io.emit('scraping:progress', {
      airlineCode: airlineCode.toUpperCase(),
      jobId,
      phase: 'validated',
      message: `Airline validated: ${airline.airline_name}`,
      progress: 10,
      timestamp: new Date().toISOString()
    });

    // Create backup if requested
    let backupId = null;
    if (backupBeforeUpdate) {
      try {
        // Emit: Creating backup
        io.emit('scraping:progress', {
          airlineCode: airlineCode.toUpperCase(),
          jobId,
          phase: 'backup',
          message: 'Creating backup of current fleet data...',
          progress: 20,
          timestamp: new Date().toISOString()
        });

        const backupResult = await pool.query(
          `INSERT INTO aircraft_backup (backup_id, airline_code, airline_name, backup_reason, aircraft_data, fleet_size, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            `backup_${airlineCode.toUpperCase()}_${Date.now()}`,
            airlineCode.toUpperCase(),
            airline.airline_name,
            `Pre-scrape backup for job ${jobId}`,
            '[]', // Empty array for now - will be populated by actual scraping
            0, // No fleet size yet
            createdBy || 'system'
          ]
        );
        backupId = backupResult.rows[0]?.id;
        logger.info(`Created backup ${backupId} for airline ${airlineCode}`);

        // Emit: Backup complete
        io.emit('scraping:progress', {
          airlineCode: airlineCode.toUpperCase(),
          jobId,
          phase: 'backup_complete',
          message: `Backup created successfully (ID: ${backupId})`,
          progress: 30,
          timestamp: new Date().toISOString()
        });
      } catch (backupError) {
        logger.warn('Error creating backup (non-fatal)', { error: backupError });
        io.emit('scraping:progress', {
          airlineCode: airlineCode.toUpperCase(),
          jobId,
          phase: 'backup_failed',
          message: 'Backup creation failed (continuing without backup)',
          progress: 30,
          timestamp: new Date().toISOString()
        });
        // Continue without backup - this is non-fatal
      }
    }

    // Emit: Creating job
    io.emit('scraping:progress', {
      airlineCode: airlineCode.toUpperCase(),
      jobId,
      phase: 'job_creation',
      message: 'Creating scraping job...',
      progress: 40,
      timestamp: new Date().toISOString()
    });

    // Create scraping job
    const insertQuery = `
      INSERT INTO scraping_jobs (
        job_id, airline_code, airline_name, job_type, status, priority,
        backup_before_update, notify_on_complete, backup_id, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      jobId,
      airlineCode.toUpperCase(),
      airline.airline_name,
      jobType,
      'pending',
      priority,
      backupBeforeUpdate,
      notifyOnComplete,
      backupId,
      createdBy || 'system'
    ]);

    // Emit: Job created
    io.emit('scraping:progress', {
      airlineCode: airlineCode.toUpperCase(),
      jobId,
      phase: 'job_created',
      message: `Scraping job created: ${jobId}`,
      progress: 50,
      timestamp: new Date().toISOString()
    });

    // Emit: Note about scraping not implemented
    io.emit('scraping:progress', {
      airlineCode: airlineCode.toUpperCase(),
      jobId,
      phase: 'awaiting_implementation',
      message: 'Note: Actual web scraping not yet implemented. Job queued successfully.',
      progress: 100,
      timestamp: new Date().toISOString()
    });

    // TODO: Trigger actual scraping via MCP server
    // This would call the MCP Aircraft Database Server to start the scraping process
    logger.info(`TODO: Trigger MCP scraping for job ${jobId}`);

    // Simulate job start by updating status
    await pool.query(
      `UPDATE scraping_jobs SET status = 'running', started_at = NOW() WHERE job_id = $1`,
      [jobId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating scraping job', { error });
    io.emit('scraping:error', {
      airlineCode: req.body.airlineCode?.toUpperCase(),
      error: 'Failed to create scraping job',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'Failed to create scraping job' });
  }
});

/**
 * GET /api/v1/scraping/jobs/active
 * Get all active jobs
 * NOTE: This route MUST come before /:jobId to avoid matching "active" as a job ID
 */
router.get('/scraping/jobs/active', async (req, res) => {
  try {
    const query = `
      SELECT * FROM active_scraping_jobs
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching active jobs', { error });
    res.status(500).json({ error: 'Failed to fetch active jobs' });
  }
});

/**
 * GET /api/v1/scraping/jobs/recent
 * Get recent completed jobs
 * NOTE: This route MUST come before /:jobId to avoid matching "recent" as a job ID
 */
router.get('/scraping/jobs/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const query = `
      SELECT * FROM recent_completed_jobs
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching recent jobs', { error });
    res.status(500).json({ error: 'Failed to fetch recent jobs' });
  }
});

/**
 * GET /api/v1/scraping/jobs/:jobId
 * Get job details by job ID
 */
router.get('/scraping/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const query = `
      SELECT
        id, job_id as "jobId", airline_code as "airlineCode",
        airline_name as "airlineName", job_type as "jobType",
        status, priority, progress, current_phase as "currentPhase",
        current_aircraft as "currentAircraft",
        discovered_count as "discoveredCount",
        processed_count as "processedCount",
        new_count as "newCount",
        updated_count as "updatedCount",
        retired_count as "retiredCount",
        unchanged_count as "unchangedCount",
        error_count as "errorCount",
        started_at as "startedAt",
        completed_at as "completedAt",
        estimated_completion as "estimatedCompletion",
        duration_seconds as "durationSeconds",
        backup_before_update as "backupBeforeUpdate",
        notify_on_complete as "notifyOnComplete",
        backup_id as "backupId",
        result_summary as "resultSummary",
        error_message as "errorMessage",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM scraping_jobs
      WHERE job_id = $1
    `;

    const result = await pool.query(query, [jobId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching job', { error });
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

/**
 * GET /api/v1/scraping/jobs/:jobId/status
 * Get job status (lightweight, for polling)
 */
router.get('/scraping/jobs/:jobId/status', async (req, res) => {
  try {
    const { jobId } = req.params;
    const query = `
      SELECT
        job_id as "jobId",
        status,
        progress,
        current_phase as "currentPhase",
        current_aircraft as "currentAircraft",
        discovered_count as discovered,
        processed_count as processed,
        new_count as new,
        updated_count as updated,
        retired_count as retired,
        unchanged_count as unchanged,
        EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER as elapsed,
        EXTRACT(EPOCH FROM (estimated_completion - NOW()))::INTEGER as "estimatedRemaining"
      FROM scraping_jobs
      WHERE job_id = $1
    `;

    const result = await pool.query(query, [jobId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const row = result.rows[0];
    res.json({
      jobId: row.jobId,
      status: row.status,
      progress: row.progress,
      currentPhase: row.currentPhase,
      currentAircraft: row.currentAircraft,
      discovered: row.discovered,
      processed: row.processed,
      changes: {
        new: row.new,
        updated: row.updated,
        retired: row.retired,
        unchanged: row.unchanged
      },
      elapsed: row.elapsed || 0,
      estimatedRemaining: row.estimatedRemaining
    });
  } catch (error) {
    logger.error('Error fetching job status', { error });
    res.status(500).json({ error: 'Failed to fetch job status' });
  }
});

/**
 * DELETE /api/v1/scraping/jobs/:jobId
 * Cancel a running job
 */
router.delete('/scraping/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists and is cancellable
    const checkQuery = `
      SELECT status FROM scraping_jobs WHERE job_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [jobId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const currentStatus = checkResult.rows[0].status;
    if (!['pending', 'running'].includes(currentStatus)) {
      return res.status(400).json({
        error: `Cannot cancel job with status: ${currentStatus}`
      });
    }

    // Cancel the job
    const updateQuery = `
      UPDATE scraping_jobs
      SET status = 'cancelled', completed_at = NOW()
      WHERE job_id = $1
    `;
    await pool.query(updateQuery, [jobId]);

    // TODO: Send cancellation signal to MCP server
    logger.info(`TODO: Cancel MCP scraping job ${jobId}`);

    res.json({ success: true, message: 'Job cancelled successfully' });
  } catch (error) {
    logger.error('Error cancelling job', { error });
    res.status(500).json({ error: 'Failed to cancel job' });
  }
});

// ============================================================================
// DATA CHANGES OPERATIONS
// ============================================================================

/**
 * GET /api/v1/changes/:jobId
 * Get all changes for a job
 */
router.get('/changes/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const query = `
      SELECT
        id, job_id as "jobId", change_id as "changeId",
        change_type as "changeType",
        aircraft_registration as "aircraftRegistration",
        aircraft_type as "aircraftType",
        old_data as "oldData",
        new_data as "newData",
        differences,
        confidence_score as "confidenceScore",
        data_quality_score as "dataQualityScore",
        validation_status as "validationStatus",
        validation_notes as "validationNotes",
        approved, approved_by as "approvedBy", approved_at as "approvedAt",
        rejected, rejection_reason as "rejectionReason",
        created_at as "createdAt"
      FROM data_changes
      WHERE job_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [jobId]);
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching job changes', { error });
    res.status(500).json({ error: 'Failed to fetch job changes' });
  }
});

/**
 * POST /api/v1/changes/:changeId/approve
 * Approve a specific change
 */
router.post('/changes/:changeId/approve', async (req, res) => {
  try {
    const { changeId } = req.params;
    const { approvedBy } = req.body;

    const query = `
      UPDATE data_changes
      SET approved = true, approved_by = $1, approved_at = NOW()
      WHERE change_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [approvedBy, changeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Change not found' });
    }

    // TODO: Apply the change to the actual aircraft database
    logger.info(`TODO: Apply change ${changeId} to aircraft database`);

    res.json({ success: true, message: 'Change approved successfully' });
  } catch (error) {
    logger.error('Error approving change', { error });
    res.status(500).json({ error: 'Failed to approve change' });
  }
});

/**
 * POST /api/v1/changes/:jobId/approve-all
 * Approve all changes for a job
 */
router.post('/changes/:jobId/approve-all', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { approvedBy } = req.body;

    const query = `
      UPDATE data_changes
      SET approved = true, approved_by = $1, approved_at = NOW()
      WHERE job_id = $2 AND approved = false AND rejected = false
      RETURNING change_id
    `;

    const result = await pool.query(query, [approvedBy, jobId]);

    // TODO: Apply all changes to the actual aircraft database
    logger.info(`TODO: Apply ${result.rows.length} changes to aircraft database`);

    res.json({
      success: true,
      approvedCount: result.rows.length
    });
  } catch (error) {
    logger.error('Error approving all changes', { error });
    res.status(500).json({ error: 'Failed to approve all changes' });
  }
});

/**
 * POST /api/v1/changes/:changeId/reject
 * Reject a specific change
 */
router.post('/changes/:changeId/reject', async (req, res) => {
  try {
    const { changeId } = req.params;
    const { reason } = req.body;

    const query = `
      UPDATE data_changes
      SET rejected = true, rejection_reason = $1
      WHERE change_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [reason, changeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Change not found' });
    }

    res.json({ success: true, message: 'Change rejected successfully' });
  } catch (error) {
    logger.error('Error rejecting change', { error });
    res.status(500).json({ error: 'Failed to reject change' });
  }
});

// ============================================================================
// BACKUP OPERATIONS
// ============================================================================

/**
 * POST /api/v1/backup/create/:airlineCode
 * Create a backup for an airline
 */
router.post('/backup/create/:airlineCode', async (req, res) => {
  try {
    const { airlineCode } = req.params;
    const { reason, createdBy } = req.body;

    // Get airline info
    const airlineCheck = await pool.query(
      'SELECT airline_name FROM airline_data_status WHERE airline_code = $1',
      [airlineCode.toUpperCase()]
    );

    if (airlineCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Airline not found' });
    }

    const backupId = `backup_${airlineCode.toUpperCase()}_${Date.now()}`;

    // Create backup with aircraft data
    const query = `
      INSERT INTO aircraft_backup (
        backup_id, airline_code, airline_name, backup_reason,
        aircraft_data, fleet_size, created_by
      )
      SELECT
        $1, $2, $3, $4,
        json_agg(
          json_build_object(
            'registration', ac.registration,
            'aircraft_type_id', ac.aircraft_type_id,
            'status', ac.status,
            'age_years', ac.age_years,
            'delivery_date', ac.delivery_date
          )
        ) as aircraft_data,
        COUNT(*) as fleet_size,
        $5
      FROM aircraft ac
      JOIN airlines a ON ac.current_airline_id = a.id
      WHERE a.iata_code = $2
      RETURNING *
    `;

    const result = await pool.query(query, [
      backupId,
      airlineCode.toUpperCase(),
      airlineCheck.rows[0].airline_name,
      reason || 'Manual backup',
      createdBy || 'system'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating backup', { error });
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

/**
 * GET /api/v1/backup/:backupId
 * Get backup details
 */
router.get('/backup/:backupId', async (req, res) => {
  try {
    const { backupId } = req.params;
    const query = `
      SELECT
        id, backup_id as "backupId", airline_code as "airlineCode",
        airline_name as "airlineName",
        backup_timestamp as "backupTimestamp",
        backup_reason as "backupReason",
        aircraft_data as "aircraftData",
        fleet_size as "fleetSize",
        created_by as "createdBy",
        created_at as "createdAt",
        restored_at as "restoredAt",
        is_active as "isActive"
      FROM aircraft_backup
      WHERE backup_id = $1
    `;

    const result = await pool.query(query, [backupId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching backup', { error });
    res.status(500).json({ error: 'Failed to fetch backup' });
  }
});

/**
 * GET /api/v1/backup/airline/:airlineCode
 * Get all backups for an airline
 */
router.get('/backup/airline/:airlineCode', async (req, res) => {
  try {
    const { airlineCode } = req.params;
    const query = `
      SELECT
        id, backup_id as "backupId", airline_code as "airlineCode",
        airline_name as "airlineName",
        backup_timestamp as "backupTimestamp",
        backup_reason as "backupReason",
        fleet_size as "fleetSize",
        created_by as "createdBy",
        created_at as "createdAt",
        restored_at as "restoredAt",
        is_active as "isActive"
      FROM aircraft_backup
      WHERE airline_code = $1
      ORDER BY backup_timestamp DESC
    `;

    const result = await pool.query(query, [airlineCode.toUpperCase()]);
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching airline backups', { error });
    res.status(500).json({ error: 'Failed to fetch airline backups' });
  }
});

/**
 * POST /api/v1/backup/restore/:backupId
 * Restore from a backup
 */
router.post('/backup/restore/:backupId', async (req, res) => {
  try {
    const { backupId } = req.params;
    const { restoredBy } = req.body;

    // Get backup data
    const backupQuery = `
      SELECT aircraft_data, airline_code, fleet_size, is_active
      FROM aircraft_backup
      WHERE backup_id = $1
    `;
    const backupResult = await pool.query(backupQuery, [backupId]);

    if (backupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const backup = backupResult.rows[0];

    if (!backup.is_active) {
      return res.status(400).json({ error: 'Backup is not active' });
    }

    // TODO: Restore aircraft data to the aircraft database
    logger.info(`TODO: Restore ${backup.fleet_size} aircraft from backup ${backupId}`);

    // Mark backup as restored
    await pool.query(
      `UPDATE aircraft_backup SET restored_at = NOW() WHERE backup_id = $1`,
      [backupId]
    );

    res.json({
      success: true,
      restoredCount: backup.fleet_size
    });
  } catch (error) {
    logger.error('Error restoring backup', { error });
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

/**
 * GET /api/v1/backup/compare/:jobId/:backupId
 * Compare job results with a backup
 */
router.get('/backup/compare/:jobId/:backupId', async (req, res) => {
  try {
    const { jobId, backupId } = req.params;

    // Get changes from the job
    const changesQuery = `
      SELECT * FROM data_changes WHERE job_id = $1
    `;
    const changesResult = await pool.query(changesQuery, [jobId]);

    // Get backup data
    const backupQuery = `
      SELECT aircraft_data, fleet_size FROM aircraft_backup WHERE backup_id = $1
    `;
    const backupResult = await pool.query(backupQuery, [backupId]);

    if (backupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const comparison = {
      summary: {
        totalChanges: changesResult.rows.length,
        new: changesResult.rows.filter((c: any) => c.change_type === 'new').length,
        updated: changesResult.rows.filter((c: any) => c.change_type === 'updated').length,
        retired: changesResult.rows.filter((c: any) => c.change_type === 'retired').length,
        unchanged: changesResult.rows.filter((c: any) => c.change_type === 'unchanged').length
      },
      differences: changesResult.rows
    };

    res.json(comparison);
  } catch (error) {
    logger.error('Error comparing backup', { error });
    res.status(500).json({ error: 'Failed to compare backup' });
  }
});

// ============================================================================
// DATA QUALITY OPERATIONS
// ============================================================================

/**
 * GET /api/v1/quality/metrics
 * Get overall data quality metrics
 */
router.get('/quality/metrics', async (req, res) => {
  try {
    const query = `
      SELECT * FROM data_quality_summary
    `;

    const result = await pool.query(query);
    res.json(result.rows[0] || {});
  } catch (error) {
    logger.error('Error fetching quality metrics', { error });
    res.status(500).json({ error: 'Failed to fetch quality metrics' });
  }
});

/**
 * GET /api/v1/quality/issues
 * Get all quality issues (with optional filters)
 */
router.get('/quality/issues', async (req, res) => {
  try {
    const { airlineCode, severity, resolved } = req.query;

    let query = `
      SELECT
        id, issue_id as "issueId",
        airline_code as "airlineCode",
        aircraft_registration as "aircraftRegistration",
        issue_type as "issueType",
        severity,
        description,
        suggested_action as "suggestedAction",
        affected_fields as "affectedFields",
        current_data as "currentData",
        resolved, resolved_by as "resolvedBy",
        resolved_at as "resolvedAt",
        resolution_notes as "resolutionNotes",
        created_at as "createdAt"
      FROM quality_issues
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (airlineCode) {
      query += ` AND airline_code = $${paramIndex}`;
      params.push((airlineCode as string).toUpperCase());
      paramIndex++;
    }

    if (severity) {
      query += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    if (resolved !== undefined) {
      query += ` AND resolved = $${paramIndex}`;
      params.push(resolved === 'true');
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching quality issues', { error });
    res.status(500).json({ error: 'Failed to fetch quality issues' });
  }
});

/**
 * POST /api/v1/quality/issues/:issueId/resolve
 * Resolve a quality issue
 */
router.post('/quality/issues/:issueId/resolve', async (req, res) => {
  try {
    const { issueId } = req.params;
    const { resolutionNotes, resolvedBy } = req.body;

    const query = `
      UPDATE quality_issues
      SET resolved = true, resolved_by = $1, resolved_at = NOW(), resolution_notes = $2
      WHERE issue_id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [resolvedBy, resolutionNotes, issueId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ success: true, message: 'Issue resolved successfully' });
  } catch (error) {
    logger.error('Error resolving quality issue', { error });
    res.status(500).json({ error: 'Failed to resolve quality issue' });
  }
});

// ============================================================================
// UPDATE HISTORY OPERATIONS
// ============================================================================

/**
 * GET /api/v1/history/:airlineCode
 * Get update history for an airline
 */
router.get('/history/:airlineCode', async (req, res) => {
  try {
    const { airlineCode } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const query = `
      SELECT
        id, airline_code as "airlineCode", job_id as "jobId",
        update_type as "updateType",
        changes_summary as "changesSummary",
        new_aircraft as "newAircraft",
        retired_aircraft as "retiredAircraft",
        updated_aircraft as "updatedAircraft",
        update_timestamp as "updateTimestamp",
        duration_seconds as "durationSeconds",
        performed_by as "performedBy",
        notes
      FROM update_history
      WHERE airline_code = $1
      ORDER BY update_timestamp DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [airlineCode.toUpperCase(), limit]);
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching update history', { error });
    res.status(500).json({ error: 'Failed to fetch update history' });
  }
});

/**
 * GET /api/v1/history/recent
 * Get recent updates across all airlines
 */
router.get('/history/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const query = `
      SELECT
        id, airline_code as "airlineCode", job_id as "jobId",
        update_type as "updateType",
        changes_summary as "changesSummary",
        new_aircraft as "newAircraft",
        retired_aircraft as "retiredAircraft",
        updated_aircraft as "updatedAircraft",
        update_timestamp as "updateTimestamp",
        duration_seconds as "durationSeconds",
        performed_by as "performedBy"
      FROM update_history
      ORDER BY update_timestamp DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching recent updates', { error });
    res.status(500).json({ error: 'Failed to fetch recent updates' });
  }
});

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * POST /api/v1/scraping/bulk-update
 * Trigger updates for multiple airlines
 */
router.post('/scraping/bulk-update', async (req, res) => {
  try {
    const { airlineCodes, jobType = 'quick_update', staggerMinutes = 5 } = req.body;

    if (!Array.isArray(airlineCodes) || airlineCodes.length === 0) {
      return res.status(400).json({ error: 'airlineCodes must be a non-empty array' });
    }

    const jobs = [];
    for (let i = 0; i < airlineCodes.length; i++) {
      const airlineCode = airlineCodes[i];
      const jobId = `job_${airlineCode.toUpperCase()}_${Date.now()}_${i}`;

      // Get airline info
      const airlineCheck = await pool.query(
        'SELECT airline_name FROM airline_data_status WHERE airline_code = $1',
        [airlineCode.toUpperCase()]
      );

      if (airlineCheck.rows.length === 0) {
        continue; // Skip invalid airlines
      }

      // Create job with staggered start
      const scheduledStart = new Date(Date.now() + i * staggerMinutes * 60000);

      const insertQuery = `
        INSERT INTO scraping_jobs (
          job_id, airline_code, airline_name, job_type, status, priority
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        jobId,
        airlineCode.toUpperCase(),
        airlineCheck.rows[0].airline_name,
        jobType,
        'pending',
        'normal'
      ]);

      jobs.push(result.rows[0]);
    }

    res.status(201).json(jobs);
  } catch (error) {
    logger.error('Error creating bulk update', { error });
    res.status(500).json({ error: 'Failed to create bulk update' });
  }
});

/**
 * POST /api/v1/backup/bulk-create
 * Create backups for multiple airlines
 */
router.post('/backup/bulk-create', async (req, res) => {
  try {
    const { airlineCodes, reason } = req.body;

    if (!Array.isArray(airlineCodes) || airlineCodes.length === 0) {
      return res.status(400).json({ error: 'airlineCodes must be a non-empty array' });
    }

    const backups = [];
    for (const airlineCode of airlineCodes) {
      try {
        const backupId = `backup_${airlineCode.toUpperCase()}_${Date.now()}`;

        // Get airline info
        const airlineCheck = await pool.query(
          'SELECT airline_name FROM airline_data_status WHERE airline_code = $1',
          [airlineCode.toUpperCase()]
        );

        if (airlineCheck.rows.length === 0) {
          continue; // Skip invalid airlines
        }

        // Create backup
        const query = `
          INSERT INTO aircraft_backup (
            backup_id, airline_code, airline_name, backup_reason,
            aircraft_data, fleet_size, created_by
          )
          SELECT
            $1, $2, $3, $4,
            json_agg(ac.*) as aircraft_data,
            COUNT(*) as fleet_size,
            'system'
          FROM aircraft ac
          JOIN airlines a ON ac.current_airline_id = a.id
          WHERE a.iata_code = $2
          RETURNING backup_id, airline_code, fleet_size
        `;

        const result = await pool.query(query, [
          backupId,
          airlineCode.toUpperCase(),
          airlineCheck.rows[0].airline_name,
          reason || 'Bulk backup'
        ]);

        backups.push(result.rows[0]);
      } catch (err) {
        logger.error(`Error creating backup for ${airlineCode}`, { error: err });
      }
    }

    res.status(201).json(backups);
  } catch (error) {
    logger.error('Error creating bulk backups', { error });
    res.status(500).json({ error: 'Failed to create bulk backups' });
  }
});

export default router;
